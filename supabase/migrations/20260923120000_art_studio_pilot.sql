-- Art Studio pilot: one integrated campaign, two directions and exactly three composed pieces.
-- Additive and idempotent. It reuses Social Studio campaigns, brand assets, templates and media storage.

create extension if not exists pgcrypto;

alter table public.brand_media_assets
  add column if not exists rights_status text not null default 'unverified',
  add column if not exists source_url text,
  add column if not exists rights_notes text,
  add column if not exists rights_expires_at date,
  add column if not exists people_consent boolean not null default false;

alter table public.brand_media_assets
  drop constraint if exists brand_media_assets_rights_status_check,
  drop constraint if exists brand_media_assets_source_url_check,
  drop constraint if exists brand_media_assets_rights_notes_check;

alter table public.brand_media_assets
  add constraint brand_media_assets_rights_status_check
    check (rights_status in ('unverified', 'owned', 'licensed', 'permission', 'expired')),
  add constraint brand_media_assets_source_url_check
    check (source_url is null or source_url ~ '^https://'),
  add constraint brand_media_assets_rights_notes_check
    check (rights_notes is null or char_length(rights_notes) <= 1000);

create table if not exists public.art_campaigns (
  id uuid primary key default gen_random_uuid(),
  social_campaign_id uuid not null unique references public.social_campaigns(id) on delete cascade,
  status text not null default 'brief' check (status in ('brief', 'direction', 'production', 'review', 'ready', 'handed_off')),
  audience text not null check (char_length(audience) between 1 and 500),
  problem_statement text not null check (char_length(problem_statement) between 1 and 1200),
  thesis text not null check (char_length(thesis) between 1 and 800),
  perspective text not null check (char_length(perspective) between 1 and 800),
  objective text not null check (char_length(objective) between 1 and 500),
  offer_cta text not null check (char_length(offer_cta) between 1 and 500),
  facts jsonb not null default '[]'::jsonb check (jsonb_typeof(facts) = 'array'),
  restrictions text,
  art_director text,
  facts_approver text,
  direction_routes jsonb not null default '[]'::jsonb check (jsonb_typeof(direction_routes) = 'array'),
  selected_route_key text check (selected_route_key is null or selected_route_key in ('a', 'b')),
  selection_reason text,
  review jsonb not null default '{}'::jsonb check (jsonb_typeof(review) = 'object'),
  pilot_metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(pilot_metrics) = 'object'),
  current_version integer not null default 1 check (current_version > 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.art_campaign_pieces (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.art_campaigns(id) on delete cascade,
  role text not null check (role in ('cover', 'evidence', 'carousel')),
  narrative_function text,
  headline text check (headline is null or char_length(headline) <= 120),
  support_copy text check (support_copy is null or char_length(support_copy) <= 1200),
  asset_id uuid references public.brand_media_assets(id) on delete restrict,
  template_id uuid references public.brand_media_templates(id) on delete restrict,
  output_format text not null default 'instagram_portrait' check (output_format in ('instagram_portrait', 'linkedin_square', 'linkedin_horizontal', 'x_horizontal')),
  crop_focus text not null default 'center' check (crop_focus in ('top', 'center', 'bottom')),
  hierarchy text not null default 'headline_led' check (hierarchy in ('headline_led', 'image_led', 'evidence_led')),
  alt_text text check (alt_text is null or char_length(alt_text) <= 500),
  media_urls jsonb not null default '{}'::jsonb check (jsonb_typeof(media_urls) = 'object'),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, role)
);

create table if not exists public.art_campaign_versions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.art_campaigns(id) on delete cascade,
  version_number integer not null,
  change_type text not null check (change_type in ('brief', 'direction', 'piece', 'review', 'handoff')),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (campaign_id, version_number)
);

create index if not exists art_campaigns_status_idx on public.art_campaigns (status, updated_at desc);
create index if not exists art_campaign_pieces_campaign_idx on public.art_campaign_pieces (campaign_id, role);
create index if not exists art_campaign_versions_campaign_idx on public.art_campaign_versions (campaign_id, version_number desc);

drop trigger if exists art_campaigns_set_updated_at on public.art_campaigns;
create trigger art_campaigns_set_updated_at before update on public.art_campaigns
for each row execute function public.set_acquisition_updated_at();
drop trigger if exists art_campaign_pieces_set_updated_at on public.art_campaign_pieces;
create trigger art_campaign_pieces_set_updated_at before update on public.art_campaign_pieces
for each row execute function public.set_acquisition_updated_at();

alter table public.art_campaigns enable row level security;
alter table public.art_campaign_pieces enable row level security;
alter table public.art_campaign_versions enable row level security;

comment on table public.art_campaigns is 'Private Art Studio pilot campaigns linked one-to-one with Social Studio.';
comment on table public.art_campaign_pieces is 'Three deliberate, composed campaign pieces; never an independent media library.';
comment on table public.art_campaign_versions is 'Immutable Art Studio handoff and review snapshots.';
