-- Phase 3: real editorial scheduling on social variants.
-- Additive and idempotent. Scheduling never publishes or calls an external service.

alter table public.content_distribution_drafts
  add column if not exists scheduled_for timestamptz;

alter table public.content_distribution_drafts
  drop constraint if exists content_distribution_drafts_status_check,
  drop constraint if exists content_distribution_drafts_schedule_check;

alter table public.content_distribution_drafts
  add constraint content_distribution_drafts_status_check
    check (status in ('draft', 'approved', 'rejected', 'scheduled', 'published', 'archived')),
  add constraint content_distribution_drafts_schedule_check
    check (
      (status = 'scheduled' and scheduled_for is not null)
      or status = 'published'
      or (status not in ('scheduled', 'published') and scheduled_for is null)
    );

alter table public.social_campaigns
  drop constraint if exists social_campaigns_status_check;

alter table public.social_campaigns
  add constraint social_campaigns_status_check
    check (status in ('idea', 'generating', 'generation_failed', 'draft', 'approved', 'rejected', 'scheduled', 'published', 'archived'));

create index if not exists content_distribution_drafts_calendar_idx
  on public.content_distribution_drafts (scheduled_for, channel, status)
  where scheduled_for is not null;

create or replace function public.normalize_social_draft_state()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  editorial_changed boolean;
begin
  editorial_changed := tg_op = 'UPDATE' and (
    new.content is distinct from old.content or new.hook is distinct from old.hook or
    new.body is distinct from old.body or new.cta is distinct from old.cta or
    new.hashtags is distinct from old.hashtags or new.image_headline is distinct from old.image_headline or
    new.image_alt is distinct from old.image_alt
  );

  if editorial_changed then
    if old.status = 'published' then
      raise exception 'Published social drafts must be moved back to approved before editing.';
    end if;
    if old.status in ('approved', 'rejected', 'scheduled') then
      new.status = 'draft';
      new.scheduled_for = null;
    end if;
  end if;

  if new.status <> 'rejected' then new.rejection_reason = null; end if;
  if new.status not in ('scheduled', 'published') then new.scheduled_for = null; end if;
  if new.status = 'scheduled' and new.scheduled_for is null then
    raise exception using errcode = '23514', message = 'scheduled_social_draft_requires_date';
  end if;

  if new.status = 'published' and new.published_at is null then new.published_at = now();
  elsif new.status <> 'published' then new.published_at = null; end if;
  return new;
end;
$$;

create or replace function public.refresh_social_campaign_status(target_campaign_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  next_status text;
begin
  select case
    when count(*) filter (where status <> 'archived') = 0 then 'archived'
    when bool_and(status in ('published', 'archived')) then 'published'
    when bool_and(status in ('scheduled', 'published', 'archived'))
      and bool_or(status = 'scheduled') then 'scheduled'
    when bool_and(status in ('approved', 'scheduled', 'published', 'archived')) then 'approved'
    when bool_or(status = 'rejected') then 'rejected'
    else 'draft'
  end
  into next_status
  from public.content_distribution_drafts
  where campaign_id = target_campaign_id;

  update public.social_campaigns
  set status = coalesce(next_status, 'archived')
  where id = target_campaign_id;
end;
$$;

create or replace function public.schedule_social_variant(
  target_variant_id uuid,
  expected_updated_at timestamptz,
  target_local_scheduled_for text,
  allow_conflict boolean default false
)
returns table (
  draft_id uuid,
  draft_status text,
  scheduled_at timestamptz,
  next_updated_at timestamptz,
  conflict_count integer,
  applied boolean
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_draft public.content_distribution_drafts;
  local_time timestamp without time zone;
  resolved_time timestamptz;
  conflicts integer;
begin
  if target_local_scheduled_for !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$' then
    raise exception using errcode = '22007', message = 'invalid_social_schedule_time';
  end if;

  begin
    local_time := target_local_scheduled_for::timestamp without time zone;
  exception when others then
    raise exception using errcode = '22007', message = 'invalid_social_schedule_time';
  end;

  if extract(second from local_time) <> 0 or mod(extract(minute from local_time)::integer, 15) <> 0 then
    raise exception using errcode = '22007', message = 'social_schedule_requires_15_minute_interval';
  end if;

  resolved_time := local_time at time zone 'America/Argentina/Buenos_Aires';
  if resolved_time <= now() then
    raise exception using errcode = '22007', message = 'social_schedule_must_be_future';
  end if;

  select * into current_draft
  from public.content_distribution_drafts
  where id = target_variant_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'social_variant_not_found';
  end if;
  if current_draft.updated_at is distinct from expected_updated_at then
    raise exception using errcode = '40001', message = 'social_variant_conflict';
  end if;
  if current_draft.status not in ('approved', 'scheduled') then
    raise exception using errcode = 'P0001', message = 'social_variant_not_schedulable';
  end if;

  perform pg_advisory_xact_lock(hashtext('social_schedule:' || current_draft.channel));
  select count(*)::integer into conflicts
  from public.content_distribution_drafts other
  where other.id <> current_draft.id
    and other.channel = current_draft.channel
    and other.status = 'scheduled'
    and other.scheduled_for is not null
    and abs(extract(epoch from (other.scheduled_for - resolved_time))) < 7200;

  if conflicts > 0 and not allow_conflict then
    return query select current_draft.id, current_draft.status, resolved_time,
      current_draft.updated_at, conflicts, false;
    return;
  end if;

  update public.content_distribution_drafts
  set status = 'scheduled', scheduled_for = resolved_time
  where id = current_draft.id
  returning * into current_draft;

  return query select current_draft.id, current_draft.status, current_draft.scheduled_for,
    current_draft.updated_at, conflicts, true;
end;
$$;

create or replace function public.unschedule_social_variant(
  target_variant_id uuid,
  expected_updated_at timestamptz
)
returns public.content_distribution_drafts
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_draft public.content_distribution_drafts;
begin
  select * into current_draft
  from public.content_distribution_drafts
  where id = target_variant_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'social_variant_not_found';
  end if;
  if current_draft.updated_at is distinct from expected_updated_at then
    raise exception using errcode = '40001', message = 'social_variant_conflict';
  end if;
  if current_draft.status <> 'scheduled' then
    raise exception using errcode = 'P0001', message = 'social_variant_not_scheduled';
  end if;

  update public.content_distribution_drafts
  set status = 'approved', scheduled_for = null
  where id = current_draft.id
  returning * into current_draft;
  return current_draft;
end;
$$;

revoke all on function public.schedule_social_variant(uuid, timestamptz, text, boolean) from public, anon, authenticated;
grant execute on function public.schedule_social_variant(uuid, timestamptz, text, boolean) to service_role;
revoke all on function public.unschedule_social_variant(uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.unschedule_social_variant(uuid, timestamptz) to service_role;

comment on column public.content_distribution_drafts.scheduled_for is
  'Manual editorial plan stored in UTC and displayed in America/Argentina/Buenos_Aires. It never triggers publication.';
