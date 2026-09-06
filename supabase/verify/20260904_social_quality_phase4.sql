-- Read-only verification for Phase 4 after running
-- supabase/migrations/20260904120000_social_quality_phase4.sql.

select
  (select count(*) from public.social_campaigns) as campaigns,
  (select count(*) from public.content_distribution_drafts) as variants,
  (select count(*) from public.social_variant_versions) as versions,
  (select count(*)
   from public.content_distribution_drafts draft
   where not exists (
     select 1 from public.social_variant_versions version where version.draft_id = draft.id
   )) as variants_without_version;

select
  draft.id as variant_id,
  draft.channel,
  draft.locale,
  draft.status,
  count(version.id) as version_count,
  min(version.version_number) as first_version,
  max(version.version_number) as latest_version
from public.content_distribution_drafts draft
left join public.social_variant_versions version on version.draft_id = draft.id
group by draft.id, draft.channel, draft.locale, draft.status
order by draft.channel, draft.locale;

select
  table_name,
  row_security_active
from (
  select
    class.relname as table_name,
    class.relrowsecurity as row_security_active
  from pg_class class
  join pg_namespace namespace on namespace.oid = class.relnamespace
  where namespace.nspname = 'public'
    and class.relname in ('social_variant_versions', 'social_generation_runs')
) checked
order by table_name;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('social_variant_versions', 'social_generation_runs');

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'approve_social_campaign_with_quality',
    'capture_social_variant_version',
    'restore_social_variant_version',
    'social_variant_content_hash',
    'social_variant_snapshot'
  )
order by routine_name;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'social_campaigns' and column_name = 'cta_url')
    or (table_name = 'content_distribution_drafts' and column_name in (
      'quality_scorecard', 'quality_review_hash', 'quality_reviewed_at', 'quality_review_run_id'
    ))
    or (table_name = 'social_generation_runs' and column_name in (
      'input_tokens', 'cached_input_tokens', 'output_tokens', 'stage_timings',
      'request_trace', 'duration_ms', 'estimated_cost_usd', 'pricing_snapshot', 'retryable'
    ))
  )
order by table_name, column_name;
