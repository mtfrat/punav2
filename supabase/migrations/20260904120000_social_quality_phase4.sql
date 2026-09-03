-- Phase 4: editorial quality, generation observability and immutable variant history.
-- Additive and idempotent. Browser roles receive no policies or function grants.

alter table public.social_campaigns
  add column if not exists cta_url text;

alter table public.social_campaigns
  drop constraint if exists social_campaigns_cta_url_check;

alter table public.social_campaigns
  add constraint social_campaigns_cta_url_check
    check (cta_url is null or cta_url ~ '^https://[^[:space:]]+$');

alter table public.content_distribution_drafts
  add column if not exists quality_scorecard jsonb not null default '{}'::jsonb,
  add column if not exists quality_review_hash text,
  add column if not exists quality_reviewed_at timestamptz,
  add column if not exists quality_review_run_id uuid;

alter table public.content_distribution_drafts
  drop constraint if exists content_distribution_drafts_quality_scorecard_check,
  drop constraint if exists content_distribution_drafts_quality_review_hash_check,
  drop constraint if exists content_distribution_drafts_quality_review_run_id_fkey;

alter table public.content_distribution_drafts
  add constraint content_distribution_drafts_quality_scorecard_check
    check (jsonb_typeof(quality_scorecard) = 'object'),
  add constraint content_distribution_drafts_quality_review_hash_check
    check (quality_review_hash is null or quality_review_hash ~ '^[0-9a-f]{64}$'),
  add constraint content_distribution_drafts_quality_review_run_id_fkey
    foreign key (quality_review_run_id) references public.social_generation_runs(id) on delete set null;

alter table public.social_generation_runs
  drop constraint if exists social_generation_runs_operation_check;

alter table public.social_generation_runs
  add constraint social_generation_runs_operation_check
    check (operation in ('openings', 'campaign', 'regenerate_section', 'render_media', 'quality_review')),
  add column if not exists input_tokens bigint not null default 0,
  add column if not exists cached_input_tokens bigint not null default 0,
  add column if not exists output_tokens bigint not null default 0,
  add column if not exists stage_timings jsonb not null default '{}'::jsonb,
  add column if not exists request_trace jsonb not null default '{}'::jsonb,
  add column if not exists duration_ms bigint,
  add column if not exists estimated_cost_usd numeric(14, 8),
  add column if not exists pricing_snapshot jsonb,
  add column if not exists retryable boolean;

alter table public.social_generation_runs
  drop constraint if exists social_generation_runs_token_counts_check,
  drop constraint if exists social_generation_runs_stage_timings_check,
  drop constraint if exists social_generation_runs_request_trace_check,
  drop constraint if exists social_generation_runs_duration_check,
  drop constraint if exists social_generation_runs_cost_check,
  drop constraint if exists social_generation_runs_pricing_snapshot_check;

alter table public.social_generation_runs
  add constraint social_generation_runs_token_counts_check
    check (input_tokens >= 0 and cached_input_tokens >= 0 and output_tokens >= 0),
  add constraint social_generation_runs_stage_timings_check check (jsonb_typeof(stage_timings) = 'object'),
  add constraint social_generation_runs_request_trace_check check (jsonb_typeof(request_trace) = 'object'),
  add constraint social_generation_runs_duration_check check (duration_ms is null or duration_ms >= 0),
  add constraint social_generation_runs_cost_check check (estimated_cost_usd is null or estimated_cost_usd >= 0),
  add constraint social_generation_runs_pricing_snapshot_check
    check (pricing_snapshot is null or jsonb_typeof(pricing_snapshot) = 'object');

update public.social_generation_runs
set duration_ms = greatest(0, floor(extract(epoch from (completed_at - started_at)) * 1000)::bigint)
where duration_ms is null and started_at is not null and completed_at is not null;

create table if not exists public.social_variant_versions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.content_distribution_drafts(id) on delete cascade,
  campaign_id uuid not null references public.social_campaigns(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  change_type text not null check (change_type in (
    'imported', 'generated', 'edited', 'regenerated', 'quality_reviewed', 'approved',
    'rejected', 'scheduled', 'unscheduled', 'published', 'unpublished', 'archived',
    'media_updated', 'restored'
  )),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  source_version_id uuid references public.social_variant_versions(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (draft_id, version_number)
);

create index if not exists social_variant_versions_draft_idx
  on public.social_variant_versions (draft_id, version_number desc);
create index if not exists social_variant_versions_campaign_idx
  on public.social_variant_versions (campaign_id, created_at desc);
create index if not exists social_generation_runs_observability_idx
  on public.social_generation_runs (created_at desc, status, operation);

alter table public.social_variant_versions enable row level security;

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
    new.image_alt is distinct from old.image_alt or new.evidence_refs is distinct from old.evidence_refs
  );

  if editorial_changed then
    if old.status = 'published' then
      raise exception 'Published social drafts must be moved back to approved before editing.';
    end if;
    if old.status in ('approved', 'rejected', 'scheduled') then
      new.status = 'draft';
      new.scheduled_for = null;
    end if;
    new.quality_scorecard = '{}'::jsonb;
    new.quality_review_hash = null;
    new.quality_reviewed_at = null;
    new.quality_review_run_id = null;
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

create or replace function public.social_variant_snapshot(draft public.content_distribution_drafts)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'content', draft.content,
    'hook', draft.hook,
    'body', draft.body,
    'cta', draft.cta,
    'hashtags', to_jsonb(draft.hashtags),
    'image_headline', draft.image_headline,
    'image_alt', draft.image_alt,
    'evidence_refs', draft.evidence_refs,
    'media_strategy', draft.media_strategy,
    'media_urls', draft.media_urls,
    'brand_template_id', draft.brand_template_id,
    'quality_flags', draft.quality_flags,
    'quality_scorecard', draft.quality_scorecard,
    'quality_review_hash', draft.quality_review_hash,
    'quality_reviewed_at', draft.quality_reviewed_at,
    'status', draft.status,
    'rejection_reason', draft.rejection_reason,
    'scheduled_for', draft.scheduled_for,
    'published_at', draft.published_at
  );
$$;

create or replace function public.social_variant_content_hash(draft public.content_distribution_drafts)
returns text
language sql
stable
set search_path = public
as $$
  select encode(digest(
    concat_ws(E'\n--puna-quality--\n', coalesce(draft.content, ''), coalesce(draft.image_headline, ''),
      coalesce(draft.image_alt, ''), coalesce(draft.media_strategy, 'text_only'),
      coalesce((select campaign.cta_url from public.social_campaigns campaign where campaign.id = draft.campaign_id), '')),
    'sha256'
  ), 'hex');
$$;

create or replace function public.capture_social_variant_version()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  next_version integer;
  kind text;
  restored_id uuid;
  actor_id uuid;
begin
  if tg_op = 'UPDATE' and not (
    new.content is distinct from old.content or new.hook is distinct from old.hook or
    new.body is distinct from old.body or new.cta is distinct from old.cta or
    new.hashtags is distinct from old.hashtags or new.image_headline is distinct from old.image_headline or
    new.image_alt is distinct from old.image_alt or new.evidence_refs is distinct from old.evidence_refs or
    new.media_strategy is distinct from old.media_strategy or new.media_urls is distinct from old.media_urls or
    new.brand_template_id is distinct from old.brand_template_id or new.quality_flags is distinct from old.quality_flags or
    new.quality_scorecard is distinct from old.quality_scorecard or new.quality_review_hash is distinct from old.quality_review_hash or
    new.status is distinct from old.status or new.rejection_reason is distinct from old.rejection_reason or
    new.scheduled_for is distinct from old.scheduled_for or new.published_at is distinct from old.published_at or
    (new.generation_metadata->>'restored_from_version_id') is distinct from (old.generation_metadata->>'restored_from_version_id') or
    (new.generation_metadata->>'last_regeneration_run_id') is distinct from (old.generation_metadata->>'last_regeneration_run_id')
  ) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    kind := case when new.content_type = 'structured' then 'generated' else 'imported' end;
  elsif (new.generation_metadata->>'restored_from_version_id') is distinct from (old.generation_metadata->>'restored_from_version_id') then
    kind := 'restored';
    begin restored_id := (new.generation_metadata->>'restored_from_version_id')::uuid; exception when others then restored_id := null; end;
    begin actor_id := (new.generation_metadata->>'restored_by')::uuid; exception when others then actor_id := null; end;
  elsif (new.generation_metadata->>'last_regeneration_run_id') is distinct from (old.generation_metadata->>'last_regeneration_run_id') then kind := 'regenerated';
  elsif new.content is distinct from old.content or new.hook is distinct from old.hook or new.body is distinct from old.body or
        new.cta is distinct from old.cta or new.hashtags is distinct from old.hashtags or
        new.image_headline is distinct from old.image_headline or new.image_alt is distinct from old.image_alt then kind := 'edited';
  elsif new.status is distinct from old.status then
    kind := case
      when new.status = 'approved' and old.status = 'published' then 'unpublished'
      when new.status = 'approved' and old.status = 'scheduled' then 'unscheduled'
      when new.status = 'approved' then 'approved'
      when new.status = 'rejected' then 'rejected'
      when new.status = 'scheduled' then 'scheduled'
      when new.status = 'published' then 'published'
      when new.status = 'archived' then 'archived'
      else 'edited'
    end;
  elsif new.scheduled_for is distinct from old.scheduled_for then kind := case when new.scheduled_for is null then 'unscheduled' else 'scheduled' end;
  elsif new.media_urls is distinct from old.media_urls or new.brand_template_id is distinct from old.brand_template_id then kind := 'media_updated';
  else kind := 'quality_reviewed';
  end if;

  if actor_id is null then
    begin actor_id := (new.generation_metadata->>'version_actor_id')::uuid; exception when others then actor_id := null; end;
  end if;

  perform pg_advisory_xact_lock(hashtext('social-version:' || new.id::text));
  select coalesce(max(version_number), 0) + 1 into next_version
  from public.social_variant_versions where draft_id = new.id;

  insert into public.social_variant_versions
    (draft_id, campaign_id, version_number, change_type, snapshot, content_hash, source_version_id, created_by)
  values
    (new.id, new.campaign_id, next_version, kind, public.social_variant_snapshot(new),
     public.social_variant_content_hash(new), restored_id, actor_id);
  return new;
end;
$$;

drop trigger if exists content_distribution_drafts_capture_version on public.content_distribution_drafts;
create trigger content_distribution_drafts_capture_version
after insert or update on public.content_distribution_drafts
for each row execute function public.capture_social_variant_version();

insert into public.social_variant_versions
  (draft_id, campaign_id, version_number, change_type, snapshot, content_hash)
select draft.id, draft.campaign_id, 1,
  case when draft.content_type = 'structured' then 'generated' else 'imported' end,
  public.social_variant_snapshot(draft), public.social_variant_content_hash(draft)
from public.content_distribution_drafts draft
where not exists (select 1 from public.social_variant_versions version where version.draft_id = draft.id);

create or replace function public.restore_social_variant_version(
  target_variant_id uuid,
  target_version_id uuid,
  expected_updated_at timestamptz,
  target_created_by uuid
)
returns public.content_distribution_drafts
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_draft public.content_distribution_drafts;
  version_record public.social_variant_versions;
  snap jsonb;
  headline_changed boolean;
begin
  select * into current_draft from public.content_distribution_drafts where id = target_variant_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'social_variant_not_found'; end if;
  if current_draft.updated_at is distinct from expected_updated_at then
    raise exception using errcode = '40001', message = 'social_variant_conflict';
  end if;
  if current_draft.status in ('published', 'archived') then
    raise exception using errcode = 'P0001', message = 'social_variant_not_restorable';
  end if;
  select * into version_record from public.social_variant_versions
    where id = target_version_id and draft_id = target_variant_id;
  if not found then raise exception using errcode = 'P0002', message = 'social_variant_version_not_found'; end if;

  snap := version_record.snapshot;
  headline_changed := coalesce(current_draft.image_headline, '') is distinct from coalesce(snap->>'image_headline', '');
  update public.content_distribution_drafts
  set content = coalesce(snap->>'content', ''), hook = snap->>'hook', body = snap->>'body', cta = snap->>'cta',
      hashtags = coalesce(array(select jsonb_array_elements_text(coalesce(snap->'hashtags', '[]'::jsonb))), '{}'),
      image_headline = nullif(snap->>'image_headline', ''), image_alt = nullif(snap->>'image_alt', ''),
      evidence_refs = coalesce(snap->'evidence_refs', '[]'::jsonb), content_type = 'structured',
      quality_flags = '[]'::jsonb, quality_scorecard = '{}'::jsonb,
      quality_review_hash = null, quality_reviewed_at = null, quality_review_run_id = null,
      status = 'draft', rejection_reason = null, scheduled_for = null, published_at = null,
      generation_metadata = coalesce(current_draft.generation_metadata, '{}'::jsonb)
        || jsonb_build_object('restored_from_version_id', target_version_id, 'restored_by', target_created_by,
             'media_stale', headline_changed and current_draft.media_strategy <> 'text_only')
  where id = target_variant_id
  returning * into current_draft;
  return current_draft;
end;
$$;

revoke all on function public.restore_social_variant_version(uuid, uuid, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.restore_social_variant_version(uuid, uuid, timestamptz, uuid) to service_role;

create or replace function public.approve_social_campaign_with_quality(
  target_campaign_id uuid,
  expected_updated_at timestamptz,
  target_reviews jsonb,
  target_created_by uuid
)
returns table (updated_count integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  campaign_updated_at timestamptz;
  draft public.content_distribution_drafts;
  review jsonb;
  affected integer := 0;
  eligible integer;
begin
  select updated_at into campaign_updated_at from public.social_campaigns
  where id = target_campaign_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'social_campaign_not_found'; end if;
  if campaign_updated_at is distinct from expected_updated_at then
    raise exception using errcode = '40001', message = 'social_campaign_conflict';
  end if;
  if jsonb_typeof(target_reviews) <> 'array' then
    raise exception using errcode = '22023', message = 'quality_reviews_required';
  end if;
  select count(*) into eligible from public.content_distribution_drafts
    where campaign_id = target_campaign_id and status in ('draft', 'rejected');
  if eligible = 0 or jsonb_array_length(target_reviews) <> eligible then
    raise exception using errcode = 'P0001', message = 'quality_review_count_mismatch';
  end if;

  for review in select value from jsonb_array_elements(target_reviews)
  loop
    select * into draft from public.content_distribution_drafts
      where id = (review->>'draft_id')::uuid and campaign_id = target_campaign_id and status in ('draft', 'rejected') for update;
    if not found or public.social_variant_content_hash(draft) <> review->>'content_hash' then
      raise exception using errcode = '40001', message = 'social_variant_conflict';
    end if;
    if exists (select 1 from jsonb_array_elements(coalesce(review->'flags', '[]'::jsonb)) flag where flag->>'severity' = 'blocking') then
      raise exception using errcode = '23514', message = 'quality_review_has_blockers';
    end if;
    update public.content_distribution_drafts
    set quality_flags = coalesce(review->'flags', '[]'::jsonb), quality_scorecard = coalesce(review->'scores', '{}'::jsonb),
        quality_review_hash = review->>'content_hash', quality_reviewed_at = (review->>'reviewed_at')::timestamptz,
        quality_review_run_id = nullif(review->>'run_id', '')::uuid, status = 'approved', rejection_reason = null,
        generation_metadata = coalesce(draft.generation_metadata, '{}'::jsonb) || jsonb_build_object('version_actor_id', target_created_by)
    where id = draft.id;
    affected := affected + 1;
  end loop;
  return query select affected;
end;
$$;

revoke all on function public.approve_social_campaign_with_quality(uuid, timestamptz, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.approve_social_campaign_with_quality(uuid, timestamptz, jsonb, uuid) to service_role;

revoke all on function public.social_variant_snapshot(public.content_distribution_drafts) from public, anon, authenticated;
grant execute on function public.social_variant_snapshot(public.content_distribution_drafts) to service_role;
revoke all on function public.social_variant_content_hash(public.content_distribution_drafts) from public, anon, authenticated;
grant execute on function public.social_variant_content_hash(public.content_distribution_drafts) to service_role;
revoke all on function public.capture_social_variant_version() from public, anon, authenticated;
grant execute on function public.capture_social_variant_version() to service_role;

comment on table public.social_variant_versions is 'Private immutable editorial snapshots. Service-role access only.';
comment on column public.social_generation_runs.estimated_cost_usd is 'Point-in-time estimate using pricing_snapshot; null means unavailable.';
