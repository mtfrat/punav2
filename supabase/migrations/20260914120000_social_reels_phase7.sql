-- Phase 7: professional Instagram reels with manual publishing.
-- Apply only to Puna Supabase project zaerzzgqxvaumhhchijb.
-- Additive and idempotent. No cron, OAuth or automatic publication is created.

alter table public.content_distribution_drafts
  add column if not exists reel_scenes jsonb not null default '[]'::jsonb,
  add column if not exists reel_duration_seconds smallint,
  add column if not exists reel_provider_metadata jsonb not null default '{}'::jsonb;

alter table public.social_generation_runs
  add column if not exists external_job_id text,
  add column if not exists provider_status text,
  add column if not exists provider_metadata jsonb not null default '{}'::jsonb;

create or replace function public.valid_social_reel(value jsonb)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  item jsonb;
  evidence_item jsonb;
  position integer := 0;
  total_duration integer := 0;
  expected_role text;
begin
  if jsonb_typeof(value) <> 'array' or jsonb_array_length(value) <> 5 then return false; end if;
  for item in select scene from jsonb_array_elements(value) scene loop
    position := position + 1;
    expected_role := case position when 1 then 'hook' when 2 then 'problem' when 5 then 'cta' else 'insight' end;
    if jsonb_typeof(item) <> 'object'
      or item - array['id','role','duration_seconds','eyebrow','headline','supporting_text','emphasis','search_query','selected_candidate_key','evidence_refs','alt_text'] <> '{}'::jsonb
      or not (item ?& array['id','role','duration_seconds','eyebrow','headline','supporting_text','emphasis','search_query','selected_candidate_key','evidence_refs','alt_text'])
      or item->>'role' <> expected_role
      or coalesce(item->>'id','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
      or char_length(coalesce(item->>'eyebrow','')) > 40
      or char_length(btrim(coalesce(item->>'headline',''))) not between 1 and 72
      or char_length(coalesce(item->>'supporting_text','')) > 140
      or char_length(coalesce(item->>'emphasis','')) > 40
      or char_length(btrim(coalesce(item->>'search_query',''))) not between 2 and 100
      or char_length(btrim(coalesce(item->>'alt_text',''))) not between 1 and 500
      or jsonb_typeof(item->'duration_seconds') <> 'number'
      or (item->>'duration_seconds')::numeric <> trunc((item->>'duration_seconds')::numeric)
      or (item->>'duration_seconds')::integer not between 3 and 6
      or jsonb_typeof(item->'evidence_refs') <> 'array'
    then return false; end if;
    total_duration := total_duration + (item->>'duration_seconds')::integer;
    for evidence_item in select ref from jsonb_array_elements(item->'evidence_refs') ref loop
      if jsonb_typeof(evidence_item) <> 'object'
        or evidence_item - array['claim','source_key'] <> '{}'::jsonb
        or not (evidence_item ?& array['claim','source_key'])
        or char_length(btrim(coalesce(evidence_item->>'claim',''))) not between 1 and 500
        or char_length(btrim(coalesce(evidence_item->>'source_key',''))) not between 1 and 200
      then return false; end if;
    end loop;
    if item->>'selected_candidate_key' is not null and coalesce(item->>'selected_candidate_key','') !~ '^[0-9a-f]{32,64}$' then return false; end if;
  end loop;
  return total_duration between 15 and 30
    and (select count(distinct scene->>'id') from jsonb_array_elements(value) scene) = 5;
exception when others then return false;
end;
$$;

create or replace function public.social_reel_duration(value jsonb)
returns integer language sql immutable set search_path = public as $$
  select coalesce(sum((scene->>'duration_seconds')::integer), 0)::integer
  from jsonb_array_elements(value) scene;
$$;

alter table public.content_distribution_drafts
  drop constraint if exists content_distribution_drafts_visual_kind_check,
  drop constraint if exists content_distribution_drafts_carousel_slides_check,
  drop constraint if exists content_distribution_drafts_reel_scenes_check,
  drop constraint if exists content_distribution_drafts_reel_duration_check,
  drop constraint if exists content_distribution_drafts_reel_provider_metadata_check;
alter table public.content_distribution_drafts
  add constraint content_distribution_drafts_visual_kind_check check (visual_kind in ('text','single','carousel','reel')),
  add constraint content_distribution_drafts_carousel_slides_check check (
    (visual_kind = 'carousel' and public.valid_social_carousel(carousel_slides))
    or (visual_kind <> 'carousel' and carousel_slides = '[]'::jsonb)
  ),
  add constraint content_distribution_drafts_reel_scenes_check check (
    (visual_kind = 'reel' and channel = 'instagram' and public.valid_social_reel(reel_scenes))
    or (visual_kind <> 'reel' and reel_scenes = '[]'::jsonb)
  ),
  add constraint content_distribution_drafts_reel_duration_check check (
    (visual_kind = 'reel' and reel_duration_seconds between 15 and 30 and reel_duration_seconds = public.social_reel_duration(reel_scenes))
    or (visual_kind <> 'reel' and reel_duration_seconds is null)
  ),
  add constraint content_distribution_drafts_reel_provider_metadata_check check (jsonb_typeof(reel_provider_metadata) = 'object');

alter table public.social_generation_runs
  drop constraint if exists social_generation_runs_operation_check,
  drop constraint if exists social_generation_runs_provider_metadata_check;
alter table public.social_generation_runs
  add constraint social_generation_runs_operation_check check (operation in ('openings','campaign','regenerate_section','render_media','quality_review','carousel','reel_storyboard','reel_sources','reel_render')),
  add constraint social_generation_runs_provider_metadata_check check (jsonb_typeof(provider_metadata) = 'object');

create index if not exists social_generation_runs_external_job_idx
  on public.social_generation_runs (external_job_id)
  where external_job_id is not null;

create or replace function public.normalize_social_draft_state()
returns trigger language plpgsql set search_path = public as $$
declare editorial_changed boolean; visual_changed boolean;
begin
  editorial_changed := tg_op = 'UPDATE' and (
    new.content is distinct from old.content or new.hook is distinct from old.hook or new.body is distinct from old.body or
    new.cta is distinct from old.cta or new.hashtags is distinct from old.hashtags or new.image_headline is distinct from old.image_headline or
    new.image_alt is distinct from old.image_alt or new.evidence_refs is distinct from old.evidence_refs or
    new.visual_kind is distinct from old.visual_kind or new.carousel_slides is distinct from old.carousel_slides or
    new.reel_scenes is distinct from old.reel_scenes or new.brand_template_id is distinct from old.brand_template_id
  );
  visual_changed := tg_op = 'UPDATE' and (
    new.image_headline is distinct from old.image_headline or new.image_alt is distinct from old.image_alt or
    new.visual_kind is distinct from old.visual_kind or new.carousel_slides is distinct from old.carousel_slides or
    new.reel_scenes is distinct from old.reel_scenes or new.brand_template_id is distinct from old.brand_template_id
  );
  if editorial_changed then
    if old.status = 'published' then raise exception 'Published social drafts must be moved back to approved before editing.'; end if;
    if old.status in ('approved','rejected','scheduled') then new.status = 'draft'; new.scheduled_for = null; end if;
    new.quality_scorecard = '{}'::jsonb; new.quality_review_hash = null; new.quality_reviewed_at = null; new.quality_review_run_id = null;
    if visual_changed and new.visual_kind <> 'text' then
      new.rendered_visual_hash = null;
      new.generation_metadata = coalesce(new.generation_metadata,'{}'::jsonb) || '{"media_stale":true}'::jsonb;
    end if;
  end if;
  if new.visual_kind = 'reel' then new.reel_duration_seconds = public.social_reel_duration(new.reel_scenes); end if;
  if new.status <> 'rejected' then new.rejection_reason = null; end if;
  if new.status not in ('scheduled','published') then new.scheduled_for = null; end if;
  if new.status = 'scheduled' and new.scheduled_for is null then raise exception using errcode = '23514', message = 'scheduled_social_draft_requires_date'; end if;
  if new.status = 'published' and new.published_at is null then new.published_at = now(); elsif new.status <> 'published' then new.published_at = null; end if;
  return new;
end;
$$;

create or replace function public.social_variant_snapshot(draft public.content_distribution_drafts)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'content',draft.content,'hook',draft.hook,'body',draft.body,'cta',draft.cta,'hashtags',to_jsonb(draft.hashtags),
    'image_headline',draft.image_headline,'image_alt',draft.image_alt,'evidence_refs',draft.evidence_refs,
    'media_strategy',draft.media_strategy,'visual_kind',draft.visual_kind,'carousel_slides',draft.carousel_slides,
    'reel_scenes',draft.reel_scenes,'reel_duration_seconds',draft.reel_duration_seconds,
    'reel_candidates',coalesce(draft.reel_provider_metadata->'candidates','{}'::jsonb),
    'reel_selected_clips',coalesce(draft.reel_provider_metadata->'imported_clips','{}'::jsonb),
    'rendered_visual_hash',draft.rendered_visual_hash,'media_urls',draft.media_urls,'brand_template_id',draft.brand_template_id,
    'quality_flags',draft.quality_flags,'quality_scorecard',draft.quality_scorecard,'quality_review_hash',draft.quality_review_hash,
    'quality_reviewed_at',draft.quality_reviewed_at,'status',draft.status,'rejection_reason',draft.rejection_reason,
    'scheduled_for',draft.scheduled_for,'published_at',draft.published_at
  );
$$;

create or replace function public.social_variant_content_hash(draft public.content_distribution_drafts)
returns text language sql stable set search_path = public, extensions as $$
  select encode(digest(concat_ws(E'\n--puna-quality--\n',coalesce(draft.content,''),coalesce(draft.image_headline,''),
    coalesce(draft.image_alt,''),coalesce(draft.media_strategy,'text_only'),
    case when draft.visual_kind='carousel' then draft.carousel_slides::text when draft.visual_kind='reel' then draft.reel_scenes::text else null end,
    case when draft.visual_kind='reel' then coalesce(draft.reel_provider_metadata->'imported_clips','{}'::jsonb)::text else null end,
    coalesce((select c.cta_url from public.social_campaigns c where c.id=draft.campaign_id),'')),'sha256'),'hex');
$$;

create or replace function public.capture_social_variant_version()
returns trigger language plpgsql set search_path = public as $$
declare next_version integer; kind text; restored_id uuid; actor_id uuid;
begin
  if tg_op = 'UPDATE' and not (
    new.content is distinct from old.content or new.hook is distinct from old.hook or new.body is distinct from old.body or new.cta is distinct from old.cta or
    new.hashtags is distinct from old.hashtags or new.image_headline is distinct from old.image_headline or new.image_alt is distinct from old.image_alt or
    new.evidence_refs is distinct from old.evidence_refs or new.media_strategy is distinct from old.media_strategy or new.media_urls is distinct from old.media_urls or
    new.brand_template_id is distinct from old.brand_template_id or new.visual_kind is distinct from old.visual_kind or new.carousel_slides is distinct from old.carousel_slides or
    new.reel_scenes is distinct from old.reel_scenes or new.reel_provider_metadata is distinct from old.reel_provider_metadata or
    new.rendered_visual_hash is distinct from old.rendered_visual_hash or new.quality_flags is distinct from old.quality_flags or
    new.quality_scorecard is distinct from old.quality_scorecard or new.quality_review_hash is distinct from old.quality_review_hash or
    new.status is distinct from old.status or new.rejection_reason is distinct from old.rejection_reason or new.scheduled_for is distinct from old.scheduled_for or
    new.published_at is distinct from old.published_at or (new.generation_metadata->>'restored_from_version_id') is distinct from (old.generation_metadata->>'restored_from_version_id') or
    (new.generation_metadata->>'last_regeneration_run_id') is distinct from (old.generation_metadata->>'last_regeneration_run_id')
  ) then return new; end if;
  if tg_op='INSERT' then kind := case when new.content_type='structured' then 'generated' else 'imported' end;
  elsif (new.generation_metadata->>'restored_from_version_id') is distinct from (old.generation_metadata->>'restored_from_version_id') then
    kind:='restored'; begin restored_id := (new.generation_metadata->>'restored_from_version_id')::uuid; exception when others then restored_id:=null; end;
    begin actor_id := (new.generation_metadata->>'restored_by')::uuid; exception when others then actor_id:=null; end;
  elsif (new.generation_metadata->>'last_regeneration_run_id') is distinct from (old.generation_metadata->>'last_regeneration_run_id') then kind:='regenerated';
  elsif new.content is distinct from old.content or new.hook is distinct from old.hook or new.body is distinct from old.body or new.cta is distinct from old.cta or
        new.hashtags is distinct from old.hashtags or new.image_headline is distinct from old.image_headline or new.image_alt is distinct from old.image_alt or
        new.carousel_slides is distinct from old.carousel_slides or new.reel_scenes is distinct from old.reel_scenes or new.visual_kind is distinct from old.visual_kind then kind:='edited';
  elsif new.status is distinct from old.status then kind := case when new.status='approved' and old.status='published' then 'unpublished' when new.status='approved' and old.status='scheduled' then 'unscheduled' when new.status='approved' then 'approved' when new.status='rejected' then 'rejected' when new.status='scheduled' then 'scheduled' when new.status='published' then 'published' when new.status='archived' then 'archived' else 'edited' end;
  elsif new.scheduled_for is distinct from old.scheduled_for then kind := case when new.scheduled_for is null then 'unscheduled' else 'scheduled' end;
  elsif new.media_urls is distinct from old.media_urls or new.reel_provider_metadata is distinct from old.reel_provider_metadata or new.brand_template_id is distinct from old.brand_template_id or new.rendered_visual_hash is distinct from old.rendered_visual_hash then kind:='media_updated';
  else kind:='quality_reviewed'; end if;
  if actor_id is null then begin actor_id := (new.generation_metadata->>'version_actor_id')::uuid; exception when others then actor_id:=null; end; end if;
  perform pg_advisory_xact_lock(hashtext('social-version:'||new.id::text));
  select coalesce(max(version_number),0)+1 into next_version from public.social_variant_versions where draft_id=new.id;
  insert into public.social_variant_versions(draft_id,campaign_id,version_number,change_type,snapshot,content_hash,source_version_id,created_by)
  values(new.id,new.campaign_id,next_version,kind,public.social_variant_snapshot(new),public.social_variant_content_hash(new),restored_id,actor_id);
  return new;
end;
$$;

create or replace function public.persist_social_generation_variants(target_run_id uuid,target_variants jsonb)
returns table(draft_ids uuid[]) language plpgsql security invoker set search_path=public as $$
declare run_record public.social_generation_runs; campaign_record public.social_campaigns; item jsonb; draft_id uuid; collected uuid[]:='{}'; visual text;
begin
  select * into run_record from public.social_generation_runs where id=target_run_id for update;
  if not found or run_record.operation<>'campaign' then raise exception using errcode='P0002',message='generation_run_not_found'; end if;
  select * into campaign_record from public.social_campaigns where id=run_record.campaign_id for update;
  if not found then raise exception using errcode='P0002',message='social_campaign_not_found'; end if;
  if jsonb_typeof(target_variants)<>'array' or jsonb_array_length(target_variants)=0 then raise exception using errcode='22023',message='variants_required'; end if;
  for item in select value from jsonb_array_elements(target_variants) loop
    visual := coalesce(item->>'visual_kind','single');
    if visual='reel' and item->>'channel'<>'instagram' then raise exception using errcode='23514',message='reel_requires_instagram'; end if;
    insert into public.content_distribution_drafts(campaign_id,translation_group_id,locale,channel,content,status,hook,body,cta,hashtags,image_headline,image_alt,evidence_refs,content_type,media_strategy,brand_template_id,quality_flags,generation_metadata,original_sections,visual_kind,carousel_slides,reel_scenes,reel_duration_seconds)
    values(campaign_record.id,campaign_record.source_id,item->>'locale',item->>'channel','pending','draft',item->>'hook',item->>'body',item->>'cta',coalesce(array(select jsonb_array_elements_text(item->'hashtags')),'{}'),item->>'image_headline',item->>'image_alt',coalesce(item->'evidence_refs','[]'::jsonb),'structured',coalesce(item->>'media_strategy','text_only'),nullif(item->>'brand_template_id','')::uuid,coalesce(item->'quality_flags','[]'::jsonb),jsonb_build_object('run_id',target_run_id),jsonb_build_object('hook',item->>'hook','body',item->>'body','cta',item->>'cta','hashtags',coalesce(item->'hashtags','[]'::jsonb)),visual,coalesce(item->'carousel_slides','[]'::jsonb),coalesce(item->'reel_scenes','[]'::jsonb),case when visual='reel' then public.social_reel_duration(item->'reel_scenes') else null end)
    on conflict(translation_group_id,locale,channel) do update set hook=excluded.hook,body=excluded.body,cta=excluded.cta,hashtags=excluded.hashtags,image_headline=excluded.image_headline,image_alt=excluded.image_alt,evidence_refs=excluded.evidence_refs,content_type='structured',media_strategy=excluded.media_strategy,brand_template_id=excluded.brand_template_id,quality_flags=excluded.quality_flags,generation_metadata=excluded.generation_metadata,original_sections=excluded.original_sections,visual_kind=excluded.visual_kind,carousel_slides=excluded.carousel_slides,reel_scenes=excluded.reel_scenes,reel_duration_seconds=excluded.reel_duration_seconds,reel_provider_metadata='{}'::jsonb,rendered_visual_hash=null
    where public.content_distribution_drafts.campaign_id=campaign_record.id and public.content_distribution_drafts.status in('draft','rejected') returning id into draft_id;
    if draft_id is null then raise exception using errcode='55000',message='existing_variant_is_locked'; end if;
    collected:=array_append(collected,draft_id);
  end loop;
  update public.social_generation_runs set stage=case when exists(select 1 from jsonb_array_elements(target_variants) v where v->>'visual_kind'='reel') then 'complete' else 'rendering' end,status=case when exists(select 1 from jsonb_array_elements(target_variants) v where v->>'visual_kind'='reel') then 'succeeded' else 'pending' end,result_summary=jsonb_build_object('draft_ids',collected),error_code=null,error_message=null where id=target_run_id;
  return query select collected;
end;
$$;

create or replace function public.restore_social_variant_version(target_variant_id uuid,target_version_id uuid,expected_updated_at timestamptz,target_created_by uuid)
returns public.content_distribution_drafts language plpgsql security invoker set search_path=public as $$
declare current_draft public.content_distribution_drafts; version_record public.social_variant_versions; snap jsonb; visual_changed boolean;
begin
  select * into current_draft from public.content_distribution_drafts where id=target_variant_id for update;
  if not found then raise exception using errcode='P0002',message='social_variant_not_found'; end if;
  if current_draft.updated_at is distinct from expected_updated_at then raise exception using errcode='40001',message='social_variant_conflict'; end if;
  if current_draft.status in('published','archived') then raise exception using errcode='P0001',message='social_variant_not_restorable'; end if;
  select * into version_record from public.social_variant_versions where id=target_version_id and draft_id=target_variant_id;
  if not found then raise exception using errcode='P0002',message='social_variant_version_not_found'; end if;
  snap:=version_record.snapshot;
  visual_changed := coalesce(current_draft.image_headline,'') is distinct from coalesce(snap->>'image_headline','') or current_draft.visual_kind is distinct from coalesce(snap->>'visual_kind','single') or current_draft.carousel_slides is distinct from coalesce(snap->'carousel_slides','[]'::jsonb) or current_draft.reel_scenes is distinct from coalesce(snap->'reel_scenes','[]'::jsonb) or current_draft.brand_template_id is distinct from nullif(snap->>'brand_template_id','')::uuid;
  update public.content_distribution_drafts set
    content=coalesce(snap->>'content',''),hook=snap->>'hook',body=snap->>'body',cta=snap->>'cta',hashtags=coalesce(array(select jsonb_array_elements_text(coalesce(snap->'hashtags','[]'::jsonb))),'{}'),
    image_headline=nullif(snap->>'image_headline',''),image_alt=nullif(snap->>'image_alt',''),evidence_refs=coalesce(snap->'evidence_refs','[]'::jsonb),content_type='structured',
    media_strategy=coalesce(snap->>'media_strategy',current_draft.media_strategy),visual_kind=coalesce(snap->>'visual_kind','single'),carousel_slides=coalesce(snap->'carousel_slides','[]'::jsonb),
    reel_scenes=coalesce(snap->'reel_scenes','[]'::jsonb),reel_duration_seconds=case when snap->>'visual_kind'='reel' then public.social_reel_duration(coalesce(snap->'reel_scenes','[]'::jsonb)) else null end,
    reel_provider_metadata=case when snap->>'visual_kind'='reel' then jsonb_build_object('candidates',coalesce(snap->'reel_candidates','{}'::jsonb),'imported_clips',coalesce(snap->'reel_selected_clips','{}'::jsonb)) else '{}'::jsonb end,
    brand_template_id=nullif(snap->>'brand_template_id','')::uuid,rendered_visual_hash=case when visual_changed then null else current_draft.rendered_visual_hash end,
    quality_flags='[]'::jsonb,quality_scorecard='{}'::jsonb,quality_review_hash=null,quality_reviewed_at=null,quality_review_run_id=null,status='draft',rejection_reason=null,scheduled_for=null,published_at=null,
    generation_metadata=coalesce(current_draft.generation_metadata,'{}'::jsonb)||jsonb_build_object('restored_from_version_id',target_version_id,'restored_by',target_created_by,'media_stale',visual_changed and coalesce(snap->>'visual_kind','single')<>'text')
  where id=target_variant_id returning * into current_draft;
  return current_draft;
end;
$$;

revoke all on function public.valid_social_reel(jsonb) from public,anon,authenticated;
grant execute on function public.valid_social_reel(jsonb) to service_role;
revoke all on function public.social_reel_duration(jsonb) from public,anon,authenticated;
grant execute on function public.social_reel_duration(jsonb) to service_role;
revoke all on function public.persist_social_generation_variants(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.persist_social_generation_variants(uuid,jsonb) to service_role;
revoke all on function public.restore_social_variant_version(uuid,uuid,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.restore_social_variant_version(uuid,uuid,timestamptz,uuid) to service_role;

alter table public.content_distribution_drafts enable row level security;
alter table public.social_generation_runs enable row level security;
alter table public.social_variant_versions enable row level security;
revoke all privileges on table public.content_distribution_drafts from anon, authenticated;
revoke all privileges on table public.social_generation_runs from anon, authenticated;
revoke all privileges on table public.social_variant_versions from anon, authenticated;
grant all privileges on table public.content_distribution_drafts to service_role;
grant all privileges on table public.social_generation_runs to service_role;
grant all privileges on table public.social_variant_versions to service_role;

comment on column public.content_distribution_drafts.reel_scenes is 'Strict private five-scene Instagram reel storyboard.';
comment on column public.content_distribution_drafts.reel_provider_metadata is 'Private provider candidates and imported clip identifiers; never exposed outside Operations.';
comment on column public.social_generation_runs.external_job_id is 'Opaque external render job identifier; never a signed URL.';
