-- Phase 1: group social drafts into reviewable campaigns without changing n8n.
-- This migration is additive and idempotent. Browser roles receive no table policies.

create extension if not exists pgcrypto;

create table if not exists public.social_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  source_type text not null default 'article' check (source_type in ('article')),
  source_id text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id)
);

alter table public.content_distribution_drafts
  add column if not exists campaign_id uuid references public.social_campaigns(id) on delete restrict,
  add column if not exists rejection_reason text,
  add column if not exists published_at timestamptz;

alter table public.content_distribution_drafts
  drop constraint if exists content_distribution_drafts_channel_check,
  drop constraint if exists content_distribution_drafts_status_check,
  drop constraint if exists content_distribution_drafts_rejection_reason_check,
  drop constraint if exists content_distribution_drafts_content_length_check;

alter table public.content_distribution_drafts
  add constraint content_distribution_drafts_channel_check
    check (channel in ('linkedin', 'x', 'instagram')),
  add constraint content_distribution_drafts_status_check
    check (status in ('draft', 'approved', 'rejected', 'published', 'archived')),
  add constraint content_distribution_drafts_rejection_reason_check
    check (
      (status = 'rejected' and rejection_reason is not null and char_length(trim(rejection_reason)) between 10 and 1000)
      or (status <> 'rejected' and rejection_reason is null)
    ),
  add constraint content_distribution_drafts_content_length_check
    check (
      (channel = 'linkedin' and char_length(content) between 1 and 3000)
      or (channel = 'x' and char_length(content) between 1 and 280)
      or (channel = 'instagram' and char_length(content) between 1 and 2200)
    );

insert into public.social_campaigns
  (title, source_type, source_id, status, created_at, updated_at)
select
  coalesce(
    (
      select p.title
      from public.posts p
      where p.translation_group_id = drafts.translation_group_id and p.locale = 'es'
      order by p.updated_at desc nulls last, p.created_at desc
      limit 1
    ),
    (
      select p.title
      from public.posts p
      where p.translation_group_id = drafts.translation_group_id and p.locale = 'en'
      order by p.updated_at desc nulls last, p.created_at desc
      limit 1
    ),
    'Campaña social ' || left(drafts.translation_group_id, 8)
  ),
  'article',
  drafts.translation_group_id,
  case
    when count(*) filter (where drafts.status <> 'archived') = 0 then 'archived'
    when bool_and(drafts.status in ('published', 'archived')) then 'published'
    when bool_and(drafts.status in ('approved', 'published', 'archived')) then 'approved'
    when bool_or(drafts.status = 'rejected') then 'rejected'
    else 'draft'
  end,
  min(drafts.created_at),
  max(drafts.updated_at)
from public.content_distribution_drafts drafts
group by drafts.translation_group_id
on conflict (source_type, source_id) do update
set title = excluded.title,
    updated_at = greatest(public.social_campaigns.updated_at, excluded.updated_at);

update public.content_distribution_drafts drafts
set campaign_id = campaigns.id
from public.social_campaigns campaigns
where drafts.campaign_id is null
  and campaigns.source_type = 'article'
  and campaigns.source_id = drafts.translation_group_id;

do $$
begin
  if exists (select 1 from public.content_distribution_drafts where campaign_id is null) then
    raise exception 'Social Studio backfill left drafts without a campaign.';
  end if;
end $$;

alter table public.content_distribution_drafts
  alter column campaign_id set not null;

create index if not exists social_campaigns_review_queue_idx
  on public.social_campaigns (status, updated_at desc);
create index if not exists content_distribution_drafts_campaign_idx
  on public.content_distribution_drafts (campaign_id, status, updated_at desc);
create index if not exists content_distribution_drafts_channel_locale_idx
  on public.content_distribution_drafts (channel, locale, campaign_id);

create or replace function public.set_social_campaign_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists social_campaigns_set_updated_at on public.social_campaigns;
create trigger social_campaigns_set_updated_at
before update on public.social_campaigns
for each row execute function public.set_social_campaign_updated_at();

create or replace function public.ensure_social_campaign_for_draft()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  campaign_title text;
begin
  if new.campaign_id is not null then
    return new;
  end if;

  select p.title into campaign_title
  from public.posts p
  where p.translation_group_id = new.translation_group_id
  order by case when p.locale = 'es' then 0 else 1 end,
           p.updated_at desc nulls last,
           p.created_at desc
  limit 1;

  insert into public.social_campaigns (title, source_type, source_id)
  values (coalesce(campaign_title, 'Campaña social ' || left(new.translation_group_id, 8)), 'article', new.translation_group_id)
  on conflict (source_type, source_id) do update
    set title = case
      when public.social_campaigns.title like 'Campaña social %' and campaign_title is not null then campaign_title
      else public.social_campaigns.title
    end
  returning id into new.campaign_id;

  return new;
end;
$$;

drop trigger if exists content_distribution_drafts_ensure_campaign on public.content_distribution_drafts;
create trigger content_distribution_drafts_ensure_campaign
before insert on public.content_distribution_drafts
for each row execute function public.ensure_social_campaign_for_draft();

create or replace function public.normalize_social_draft_state()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.content is distinct from old.content then
    if old.status = 'published' then
      raise exception 'Published social drafts must be moved back to approved before editing.';
    end if;
    if old.status in ('approved', 'rejected') then
      new.status = 'draft';
    end if;
  end if;

  if new.status <> 'rejected' then
    new.rejection_reason = null;
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status <> 'published' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists content_distribution_drafts_normalize_state on public.content_distribution_drafts;
create trigger content_distribution_drafts_normalize_state
before insert or update on public.content_distribution_drafts
for each row execute function public.normalize_social_draft_state();

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
    when bool_and(status in ('approved', 'published', 'archived')) then 'approved'
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

create or replace function public.refresh_social_campaign_after_draft()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_social_campaign_status(old.campaign_id);
    return old;
  end if;

  perform public.refresh_social_campaign_status(new.campaign_id);
  if tg_op = 'UPDATE' and old.campaign_id is distinct from new.campaign_id then
    perform public.refresh_social_campaign_status(old.campaign_id);
  end if;
  return new;
end;
$$;

drop trigger if exists content_distribution_drafts_refresh_campaign on public.content_distribution_drafts;
create trigger content_distribution_drafts_refresh_campaign
after insert or update or delete on public.content_distribution_drafts
for each row execute function public.refresh_social_campaign_after_draft();

create or replace function public.approve_social_campaign(
  target_campaign_id uuid,
  expected_updated_at timestamptz
)
returns table (updated_count integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_updated_at timestamptz;
  affected integer;
begin
  select campaigns.updated_at
  into current_updated_at
  from public.social_campaigns campaigns
  where campaigns.id = target_campaign_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'social_campaign_not_found';
  end if;

  if current_updated_at is distinct from expected_updated_at then
    raise exception using errcode = '40001', message = 'social_campaign_conflict';
  end if;

  update public.content_distribution_drafts
  set status = 'approved', rejection_reason = null
  where campaign_id = target_campaign_id
    and status in ('draft', 'rejected');

  get diagnostics affected = row_count;
  if affected = 0 then
    raise exception using errcode = 'P0001', message = 'social_campaign_has_no_pending_variants';
  end if;

  return query select affected;
end;
$$;

revoke all on function public.approve_social_campaign(uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.approve_social_campaign(uuid, timestamptz) to service_role;

alter table public.social_campaigns enable row level security;

comment on table public.social_campaigns is 'Private grouping for human-reviewed social variants. Service-role access only.';
comment on column public.social_campaigns.status is 'Derived from active distribution draft states; applications must not set it directly.';
comment on column public.content_distribution_drafts.published_at is 'Manual publication timestamp; approval never sets this field.';
