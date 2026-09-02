-- Phase 2: resumable social composer, structured drafts, brand media and generation runs.
-- Additive and idempotent. Browser roles receive no policies on the new tables.

create extension if not exists pgcrypto;

alter table public.social_campaigns
  add column if not exists objective text,
  add column if not exists audience text,
  add column if not exists service_cluster text,
  add column if not exists problem_statement text,
  add column if not exists source_urls jsonb not null default '[]'::jsonb,
  add column if not exists locale_strategy jsonb not null default '{"locales":["es"],"channels":["linkedin","instagram"]}'::jsonb,
  add column if not exists generation_context jsonb not null default '{}'::jsonb,
  add column if not exists opening_options jsonb not null default '[]'::jsonb,
  add column if not exists selected_opening jsonb,
  add column if not exists cta_type text;

alter table public.social_campaigns
  drop constraint if exists social_campaigns_source_type_check,
  drop constraint if exists social_campaigns_status_check,
  drop constraint if exists social_campaigns_objective_check,
  drop constraint if exists social_campaigns_service_cluster_check,
  drop constraint if exists social_campaigns_cta_type_check,
  drop constraint if exists social_campaigns_source_urls_check,
  drop constraint if exists social_campaigns_locale_strategy_check,
  drop constraint if exists social_campaigns_generation_context_check,
  drop constraint if exists social_campaigns_opening_options_check,
  drop constraint if exists social_campaigns_selected_opening_check;

alter table public.social_campaigns
  add constraint social_campaigns_source_type_check
    check (source_type in ('article', 'brief', 'manual', 'brand_asset', 'internal_learning')),
  add constraint social_campaigns_status_check
    check (status in ('idea', 'generating', 'generation_failed', 'draft', 'approved', 'rejected', 'published', 'archived')),
  add constraint social_campaigns_objective_check
    check (objective is null or objective in ('educate', 'demonstrate', 'conversation', 'convert')),
  add constraint social_campaigns_service_cluster_check
    check (service_cluster is null or service_cluster in ('ai-automation', 'custom-software', 'data-integrations')),
  add constraint social_campaigns_cta_type_check
    check (cta_type is null or cta_type in ('audit', 'service', 'article', 'conversation', 'none')),
  add constraint social_campaigns_source_urls_check check (jsonb_typeof(source_urls) = 'array'),
  add constraint social_campaigns_locale_strategy_check check (jsonb_typeof(locale_strategy) = 'object'),
  add constraint social_campaigns_generation_context_check check (jsonb_typeof(generation_context) = 'object'),
  add constraint social_campaigns_opening_options_check check (jsonb_typeof(opening_options) = 'array'),
  add constraint social_campaigns_selected_opening_check check (selected_opening is null or jsonb_typeof(selected_opening) = 'object');

alter table public.content_distribution_drafts
  add column if not exists hook text,
  add column if not exists body text,
  add column if not exists cta text,
  add column if not exists hashtags text[] not null default '{}',
  add column if not exists image_headline text,
  add column if not exists image_alt text,
  add column if not exists evidence_refs jsonb not null default '[]'::jsonb,
  add column if not exists content_type text not null default 'legacy',
  add column if not exists media_strategy text not null default 'text_only',
  add column if not exists media_urls jsonb not null default '{}'::jsonb,
  add column if not exists brand_template_id uuid,
  add column if not exists quality_flags jsonb not null default '[]'::jsonb,
  add column if not exists generation_metadata jsonb not null default '{}'::jsonb,
  add column if not exists original_sections jsonb;

update public.content_distribution_drafts
set body = content
where body is null;

alter table public.content_distribution_drafts
  drop constraint if exists content_distribution_drafts_content_type_check,
  drop constraint if exists content_distribution_drafts_media_strategy_check,
  drop constraint if exists content_distribution_drafts_evidence_refs_check,
  drop constraint if exists content_distribution_drafts_media_urls_check,
  drop constraint if exists content_distribution_drafts_quality_flags_check,
  drop constraint if exists content_distribution_drafts_generation_metadata_check,
  drop constraint if exists content_distribution_drafts_original_sections_check,
  drop constraint if exists content_distribution_drafts_image_headline_check,
  drop constraint if exists content_distribution_drafts_image_alt_check;

alter table public.content_distribution_drafts
  add constraint content_distribution_drafts_content_type_check check (content_type in ('legacy', 'structured')),
  add constraint content_distribution_drafts_media_strategy_check check (media_strategy in ('text_only', 'puna_editorial', 'approved_image')),
  add constraint content_distribution_drafts_evidence_refs_check check (jsonb_typeof(evidence_refs) = 'array'),
  add constraint content_distribution_drafts_media_urls_check check (jsonb_typeof(media_urls) = 'object'),
  add constraint content_distribution_drafts_quality_flags_check check (jsonb_typeof(quality_flags) = 'array'),
  add constraint content_distribution_drafts_generation_metadata_check check (jsonb_typeof(generation_metadata) = 'object'),
  add constraint content_distribution_drafts_original_sections_check check (original_sections is null or jsonb_typeof(original_sections) = 'object'),
  add constraint content_distribution_drafts_image_headline_check check (image_headline is null or char_length(image_headline) between 1 and 120),
  add constraint content_distribution_drafts_image_alt_check check (image_alt is null or char_length(image_alt) between 1 and 500);

create table if not exists public.brand_media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  category text not null default 'general' check (category in ('general', 'systems', 'automation', 'software', 'data', 'people', 'workspace')),
  storage_path text not null unique check (char_length(storage_path) between 1 and 500),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  width integer not null check (width between 320 and 8000),
  height integer not null check (height between 320 and 8000),
  alt_text text not null check (char_length(alt_text) between 1 and 500),
  source text not null default 'upload' check (source in ('upload', 'legacy_import', 'builtin')),
  is_active boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_media_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  layout text not null check (layout in ('editorial', 'image_overlay')),
  output_format text not null check (output_format in ('instagram_portrait', 'linkedin_square', 'linkedin_horizontal', 'x_horizontal')),
  width integer not null,
  height integer not null,
  channels text[] not null check (cardinality(channels) between 1 and 3),
  base_asset_id uuid references public.brand_media_assets(id) on delete set null,
  safe_zone jsonb not null,
  text_align text not null default 'left' check (text_align in ('left', 'center')),
  vertical_align text not null default 'center' check (vertical_align in ('top', 'center', 'bottom')),
  overlay_color text not null default '#3B2A1E' check (overlay_color ~ '^#[0-9A-Fa-f]{6}$'),
  overlay_opacity numeric(4,3) not null default 0.58 check (overlay_opacity between 0 and 1),
  text_color text not null default '#FBF7F0' check (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  min_font_size integer not null default 42 check (min_font_size between 24 and 160),
  max_font_size integer not null default 88 check (max_font_size between min_font_size and 220),
  logo_enabled boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, output_format)
);

alter table public.content_distribution_drafts
  drop constraint if exists content_distribution_drafts_brand_template_id_fkey,
  add constraint content_distribution_drafts_brand_template_id_fkey
    foreign key (brand_template_id) references public.brand_media_templates(id) on delete set null;

create table if not exists public.social_generation_runs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.social_campaigns(id) on delete cascade,
  draft_id uuid references public.content_distribution_drafts(id) on delete cascade,
  operation text not null check (operation in ('openings', 'campaign', 'regenerate_section', 'render_media')),
  stage text not null check (stage in ('queued', 'drafting', 'critic', 'persisting', 'rendering', 'complete')),
  section text check (section is null or section in ('hook', 'body', 'cta')),
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed')),
  idempotency_key text not null unique check (char_length(idempotency_key) between 16 and 200),
  request_hash text not null check (request_hash ~ '^[0-9a-f]{64}$'),
  provider text not null default 'openai',
  model text,
  request_id text,
  usage jsonb not null default '{}'::jsonb,
  checkpoint_payload jsonb,
  result_summary jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_generation_runs_campaign_idx
  on public.social_generation_runs (campaign_id, created_at desc);
create unique index if not exists social_generation_runs_request_unique
  on public.social_generation_runs (campaign_id, operation, coalesce(draft_id, '00000000-0000-0000-0000-000000000000'::uuid), coalesce(section, ''), request_hash);
create index if not exists brand_media_assets_active_idx
  on public.brand_media_assets (is_active, category, updated_at desc);
create index if not exists brand_media_templates_active_idx
  on public.brand_media_templates (is_active, output_format, updated_at desc);

drop trigger if exists brand_media_assets_set_updated_at on public.brand_media_assets;
create trigger brand_media_assets_set_updated_at before update on public.brand_media_assets
for each row execute function public.set_acquisition_updated_at();
drop trigger if exists brand_media_templates_set_updated_at on public.brand_media_templates;
create trigger brand_media_templates_set_updated_at before update on public.brand_media_templates
for each row execute function public.set_acquisition_updated_at();
drop trigger if exists social_generation_runs_set_updated_at on public.social_generation_runs;
create trigger social_generation_runs_set_updated_at before update on public.social_generation_runs
for each row execute function public.set_acquisition_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('brand-assets', 'brand-assets', false, 3670016, array['image/jpeg', 'image/png', 'image/webp']),
  ('generated-media', 'generated-media', false, 10485760, array['image/png'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.brand_media_templates
  (name, layout, output_format, width, height, channels, safe_zone, text_align, vertical_align, overlay_color, overlay_opacity, text_color, min_font_size, max_font_size, logo_enabled)
values
  ('Puna Editorial', 'editorial', 'instagram_portrait', 1080, 1350, array['instagram'], '{"x":80,"y":250,"width":920,"height":720}'::jsonb, 'left', 'center', '#3B2A1E', 0.00, '#181410', 48, 104, true),
  ('Puna Editorial', 'editorial', 'linkedin_square', 1080, 1080, array['linkedin'], '{"x":80,"y":210,"width":920,"height":560}'::jsonb, 'left', 'center', '#3B2A1E', 0.00, '#181410', 44, 88, true),
  ('Puna Editorial', 'editorial', 'linkedin_horizontal', 1200, 627, array['linkedin'], '{"x":88,"y":180,"width":820,"height":300}'::jsonb, 'left', 'center', '#3B2A1E', 0.00, '#181410', 38, 70, true),
  ('Puna Editorial', 'editorial', 'x_horizontal', 1600, 900, array['x'], '{"x":112,"y":260,"width":1080,"height":410}'::jsonb, 'left', 'center', '#3B2A1E', 0.00, '#181410', 48, 92, true)
on conflict (name, output_format) do nothing;

insert into public.brand_media_templates
  (name, layout, output_format, width, height, channels, safe_zone, text_align, vertical_align, overlay_color, overlay_opacity, text_color, min_font_size, max_font_size, logo_enabled)
values
  ('Puna Imagen', 'image_overlay', 'instagram_portrait', 1080, 1350, array['instagram'], '{"x":80,"y":250,"width":920,"height":720}'::jsonb, 'left', 'center', '#3B2A1E', 0.58, '#FBF7F0', 48, 104, true),
  ('Puna Imagen', 'image_overlay', 'linkedin_square', 1080, 1080, array['linkedin'], '{"x":80,"y":210,"width":920,"height":560}'::jsonb, 'left', 'center', '#3B2A1E', 0.58, '#FBF7F0', 44, 88, true),
  ('Puna Imagen', 'image_overlay', 'linkedin_horizontal', 1200, 627, array['linkedin'], '{"x":88,"y":160,"width":900,"height":330}'::jsonb, 'left', 'center', '#3B2A1E', 0.58, '#FBF7F0', 38, 70, true),
  ('Puna Imagen', 'image_overlay', 'x_horizontal', 1600, 900, array['x'], '{"x":112,"y":230,"width":1160,"height":460}'::jsonb, 'left', 'center', '#3B2A1E', 0.58, '#FBF7F0', 48, 92, true)
on conflict (name, output_format) do nothing;

create or replace function public.compose_structured_social_content()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  tags text;
begin
  if new.content_type = 'structured' then
    select string_agg('#' || regexp_replace(tag, '^#', ''), ' ')
      into tags from unnest(coalesce(new.hashtags, '{}')) tag where trim(tag) <> '';
    new.content = concat_ws(E'\n\n', nullif(trim(coalesce(new.hook, '')), ''), nullif(trim(coalesce(new.body, '')), ''), nullif(trim(coalesce(new.cta, '')), ''), nullif(tags, ''));
  elsif new.body is null then
    new.body = new.content;
  end if;
  return new;
end;
$$;

drop trigger if exists content_distribution_drafts_compose_structured on public.content_distribution_drafts;
create trigger content_distribution_drafts_compose_structured
before insert or update of hook, body, cta, hashtags, content_type on public.content_distribution_drafts
for each row execute function public.compose_structured_social_content();

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
    if old.status in ('approved', 'rejected') then new.status = 'draft'; end if;
  end if;
  if new.status <> 'rejected' then new.rejection_reason = null; end if;
  if new.status = 'published' and new.published_at is null then new.published_at = now();
  elsif new.status <> 'published' then new.published_at = null; end if;
  return new;
end;
$$;

create or replace function public.begin_social_generation(
  target_campaign_id uuid,
  target_draft_id uuid,
  target_operation text,
  target_stage text,
  target_section text,
  target_idempotency_key text,
  target_request_hash text,
  target_model text,
  target_created_by uuid
)
returns public.social_generation_runs
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.social_generation_runs;
begin
  insert into public.social_generation_runs
    (campaign_id, draft_id, operation, stage, section, idempotency_key, request_hash, model, created_by)
  values
    (target_campaign_id, target_draft_id, target_operation, target_stage, target_section, target_idempotency_key, target_request_hash, target_model, target_created_by)
  on conflict do nothing;

  select * into result
    from public.social_generation_runs
    where idempotency_key = target_idempotency_key
       or (campaign_id = target_campaign_id and operation = target_operation
           and draft_id is not distinct from target_draft_id and section is not distinct from target_section
           and request_hash = target_request_hash)
    order by (idempotency_key = target_idempotency_key) desc
    limit 1 for update;
  if result.request_hash <> target_request_hash then
    raise exception using errcode = '40001', message = 'idempotency_key_reused_with_different_request';
  end if;
  return result;
end;
$$;

revoke all on function public.begin_social_generation(uuid, uuid, text, text, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.begin_social_generation(uuid, uuid, text, text, text, text, text, text, uuid) to service_role;

create or replace function public.persist_social_generation_variants(
  target_run_id uuid,
  target_variants jsonb
)
returns table (draft_ids uuid[])
language plpgsql
security invoker
set search_path = public
as $$
declare
  run_record public.social_generation_runs;
  campaign_record public.social_campaigns;
  item jsonb;
  draft_id uuid;
  collected uuid[] := '{}';
begin
  select * into run_record from public.social_generation_runs where id = target_run_id for update;
  if not found or run_record.operation <> 'campaign' then
    raise exception using errcode = 'P0002', message = 'generation_run_not_found';
  end if;
  select * into campaign_record from public.social_campaigns where id = run_record.campaign_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'social_campaign_not_found'; end if;
  if jsonb_typeof(target_variants) <> 'array' or jsonb_array_length(target_variants) = 0 then
    raise exception using errcode = '22023', message = 'variants_required';
  end if;

  for item in select value from jsonb_array_elements(target_variants)
  loop
    insert into public.content_distribution_drafts
      (campaign_id, translation_group_id, locale, channel, content, status, hook, body, cta, hashtags,
       image_headline, image_alt, evidence_refs, content_type, media_strategy, brand_template_id,
       quality_flags, generation_metadata, original_sections)
    values
      (campaign_record.id, campaign_record.source_id, item->>'locale', item->>'channel', 'pending', 'draft',
       item->>'hook', item->>'body', item->>'cta', coalesce(array(select jsonb_array_elements_text(item->'hashtags')), '{}'),
       item->>'image_headline', item->>'image_alt', coalesce(item->'evidence_refs', '[]'::jsonb), 'structured',
       coalesce(item->>'media_strategy', 'text_only'), nullif(item->>'brand_template_id', '')::uuid,
       coalesce(item->'quality_flags', '[]'::jsonb), jsonb_build_object('run_id', target_run_id),
       jsonb_build_object('hook', item->>'hook', 'body', item->>'body', 'cta', item->>'cta', 'hashtags', coalesce(item->'hashtags', '[]'::jsonb)))
    on conflict (translation_group_id, locale, channel) do update
      set hook = excluded.hook, body = excluded.body, cta = excluded.cta, hashtags = excluded.hashtags,
          image_headline = excluded.image_headline, image_alt = excluded.image_alt,
          evidence_refs = excluded.evidence_refs, content_type = 'structured', media_strategy = excluded.media_strategy,
          brand_template_id = excluded.brand_template_id, quality_flags = excluded.quality_flags,
          generation_metadata = excluded.generation_metadata, original_sections = excluded.original_sections
      where public.content_distribution_drafts.campaign_id = campaign_record.id
        and public.content_distribution_drafts.status in ('draft', 'rejected')
    returning id into draft_id;
    if draft_id is null then raise exception using errcode = '55000', message = 'existing_variant_is_locked'; end if;
    collected := array_append(collected, draft_id);
  end loop;

  update public.social_generation_runs
    set stage = 'rendering', status = 'pending', result_summary = jsonb_build_object('draft_ids', collected), error_code = null, error_message = null
    where id = target_run_id;
  return query select collected;
end;
$$;

revoke all on function public.persist_social_generation_variants(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.persist_social_generation_variants(uuid, jsonb) to service_role;

alter table public.brand_media_assets enable row level security;
alter table public.brand_media_templates enable row level security;
alter table public.social_generation_runs enable row level security;

comment on table public.brand_media_assets is 'Private approved media catalog for Social Studio.';
comment on table public.brand_media_templates is 'Deterministic render layouts; model/provider choices are never user-facing.';
comment on table public.social_generation_runs is 'Private resumable generation and idempotency records.';
comment on column public.social_generation_runs.checkpoint_payload is 'Temporary structured checkpoint; cleared after successful persistence.';
