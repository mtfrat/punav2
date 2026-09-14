-- Read-only verification for Phase 7. Run only in Puna Supabase
-- project zaerzzgqxvaumhhchijb after applying the Phase 7 migration.
select
  (select count(*) from public.content_distribution_drafts) as variant_count,
  (select count(*) from public.content_distribution_drafts where visual_kind = 'reel') as reel_count,
  (select count(*) from public.content_distribution_drafts where visual_kind = 'reel' and channel <> 'instagram') as invalid_reel_channel_count,
  (select count(*) from public.content_distribution_drafts where visual_kind = 'reel' and not public.valid_social_reel(reel_scenes)) as invalid_storyboard_count,
  (select count(*) from public.content_distribution_drafts where visual_kind = 'reel' and reel_duration_seconds <> public.social_reel_duration(reel_scenes)) as invalid_duration_count;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'content_distribution_drafts' and column_name in ('reel_scenes','reel_duration_seconds','reel_provider_metadata'))
    or (table_name = 'social_generation_runs' and column_name in ('external_job_id','provider_status','provider_metadata'))
  )
order by table_name, ordinal_position;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('valid_social_reel','social_reel_duration')
order by routine_name;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('content_distribution_drafts','social_generation_runs','social_variant_versions')
  and grantee in ('anon','authenticated')
order by grantee, table_name, privilege_type;

-- Expected after migration and before creating a reel:
-- reel_count = 0; all invalid_* counts = 0; final query returns 0 rows.
