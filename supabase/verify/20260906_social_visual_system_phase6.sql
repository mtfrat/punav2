-- Read-only verification for Phase 6. Run in Puna Supabase only after the migration.
select
  (select count(*) from public.brand_media_assets) as asset_count,
  (select count(*) from public.brand_media_assets where is_active) as active_asset_count,
  (select count(*) from public.content_distribution_drafts) as variant_count,
  (select count(*) from public.content_distribution_drafts where visual_kind = 'carousel') as carousel_count,
  (select count(*) from public.content_distribution_drafts where visual_kind = 'carousel' and not public.valid_social_carousel(carousel_slides)) as invalid_carousel_count;

select preset_key, output_format, layout, is_active, is_system, count(*)
from public.brand_media_templates
where output_format <> 'x_horizontal'
group by preset_key, output_format, layout, is_active, is_system
order by preset_key, output_format;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'brand_media_assets' and column_name in ('focal_x','focal_y'))
    or (table_name = 'brand_media_templates' and column_name in ('preset_key','template_version','visual_config','is_system'))
    or (table_name = 'content_distribution_drafts' and column_name in ('visual_kind','carousel_slides','rendered_visual_hash'))
  )
order by table_name, ordinal_position;

select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('brand-assets','generated-media')
order by id;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('brand_media_assets','brand_media_templates','content_distribution_drafts','social_variant_versions')
  and grantee in ('anon','authenticated')
order by grantee, table_name, privilege_type;

