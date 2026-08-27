-- Review-first content planning and private prospecting data for Puna Tech.
-- Apply only after backing up the linked database. Service-role workflows bypass RLS;
-- no anon/authenticated policies are created for any table in this migration.

create extension if not exists pgcrypto;

create or replace function public.set_acquisition_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.content_briefs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  vertical text not null check (vertical in ('general_b2b', 'general_agency', 'marketing_agency', 'growth_agency', 'creative_agency')),
  service_cluster text not null check (service_cluster in ('ai-automation', 'custom-software', 'data-integrations')),
  audience text not null,
  target_query_en text not null,
  target_query_es text not null,
  angle text not null,
  source_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(source_urls) = 'array'),
  notes text,
  status text not null default 'backlog' check (status in ('backlog', 'approved', 'drafting', 'drafted', 'used', 'archived')),
  planned_for date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title)
);

create table if not exists public.content_distribution_drafts (
  id uuid primary key default gen_random_uuid(),
  translation_group_id text not null,
  locale text not null check (locale in ('en', 'es')),
  channel text not null check (channel in ('linkedin', 'x')),
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (translation_group_id, locale, channel)
);

create table if not exists public.prospect_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_execution_id text,
  status text not null default 'started' check (status in ('started', 'completed', 'failed')),
  verticals jsonb not null default '[]'::jsonb check (jsonb_typeof(verticals) = 'array'),
  queries jsonb not null default '[]'::jsonb check (jsonb_typeof(queries) = 'array'),
  requested_limit integer not null default 200 check (requested_limit between 1 and 1000),
  result_count integer not null default 0 check (result_count >= 0),
  stored_count integer not null default 0 check (stored_count >= 0),
  discarded_count integer not null default 0 check (discarded_count >= 0),
  duplicate_count integer not null default 0 check (duplicate_count >= 0),
  estimated_cost_usd numeric(10,4) not null default 0 check (estimated_cost_usd >= 0),
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.prospect_accounts (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'apify_google_places',
  source_record_id text not null,
  place_id text,
  vertical text not null check (vertical in ('general_agency', 'marketing_agency', 'growth_agency', 'creative_agency')),
  business_name text not null,
  category text,
  country_code text not null default 'AR' check (country_code in ('AR', 'MX', 'CL', 'CO', 'PE', 'UY', 'CR')),
  province text,
  city text,
  address text,
  phone text,
  website text,
  normalized_domain text,
  public_email text,
  maps_url text,
  rating numeric(3,2) check (rating is null or rating between 0 and 5),
  review_count integer check (review_count is null or review_count >= 0),
  branch_count integer not null default 1 check (branch_count >= 1),
  signals jsonb not null default '{}'::jsonb check (jsonb_typeof(signals) = 'object'),
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  score integer not null default 0 check (score between 0 and 100),
  status text not null default 'new' check (status in ('new', 'qualified', 'disqualified', 'reviewed', 'contacted', 'do_not_contact')),
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_record_id)
);

create unique index if not exists prospect_accounts_place_id_unique
  on public.prospect_accounts (place_id)
  where place_id is not null and place_id <> '';
create unique index if not exists prospect_accounts_domain_unique
  on public.prospect_accounts (normalized_domain)
  where normalized_domain is not null and normalized_domain <> '';
create index if not exists prospect_accounts_review_queue_idx
  on public.prospect_accounts (status, score desc, collected_at desc);

create table if not exists public.prospect_drafts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospect_accounts(id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 180),
  message text not null check (char_length(message) between 20 and 3000),
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'contacted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prospect_id)
);

drop trigger if exists content_briefs_set_updated_at on public.content_briefs;
create trigger content_briefs_set_updated_at before update on public.content_briefs
for each row execute function public.set_acquisition_updated_at();

drop trigger if exists content_distribution_drafts_set_updated_at on public.content_distribution_drafts;
create trigger content_distribution_drafts_set_updated_at before update on public.content_distribution_drafts
for each row execute function public.set_acquisition_updated_at();

drop trigger if exists prospect_accounts_set_updated_at on public.prospect_accounts;
create trigger prospect_accounts_set_updated_at before update on public.prospect_accounts
for each row execute function public.set_acquisition_updated_at();

drop trigger if exists prospect_drafts_set_updated_at on public.prospect_drafts;
create trigger prospect_drafts_set_updated_at before update on public.prospect_drafts
for each row execute function public.set_acquisition_updated_at();

alter table public.content_briefs enable row level security;
alter table public.content_distribution_drafts enable row level security;
alter table public.prospect_runs enable row level security;
alter table public.prospect_accounts enable row level security;
alter table public.prospect_drafts enable row level security;

comment on table public.content_briefs is 'Human-approved briefs are the only input allowed to start the editorial workflow.';
comment on table public.content_distribution_drafts is 'LinkedIn and X drafts for manual review and publication.';
comment on table public.prospect_accounts is 'Private account-level business data collected from public sources; never expose through anon policies.';
comment on table public.prospect_drafts is 'Cold-email drafts remain manual until a founder explicitly approves and sends them.';
comment on column public.prospect_accounts.public_email is 'A business email visibly published on the company website; personal enrichment is prohibited.';

insert into public.content_briefs
  (title, vertical, service_cluster, audience, target_query_en, target_query_es, angle, status, planned_for)
values
  ('How agencies productize a repeatable client workflow', 'general_agency', 'custom-software', 'Agency founders and operations leaders', 'custom software for marketing agencies', 'software a medida para agencias', 'A practical guide to turning a repeated client-delivery process into an owned product without overbuilding.', 'backlog', date '2026-09-01'),
  ('Where AI belongs in agency delivery operations', 'marketing_agency', 'ai-automation', 'Marketing and creative agency operations', 'AI workflow automation for agencies', 'automatización con IA para agencias', 'Separate useful AI assistance from deterministic approvals, client promises and systems of record.', 'backlog', date '2026-09-15'),
  ('A reliable data layer for multi-client reporting', 'growth_agency', 'data-integrations', 'Growth and performance agency leaders', 'agency client reporting integrations', 'integración de reportes para agencias', 'Map the minimum data contracts between campaign platforms, CRMs, databases and client reporting.', 'backlog', date '2026-10-01'),
  ('When an agency should build a white-label client portal', 'creative_agency', 'custom-software', 'Digital and creative agency founders', 'white label client portal development', 'portal white label para agencias', 'A decision guide for ownership, permissions, reusable modules and handoff before building a client-facing product.', 'backlog', date '2026-10-15'),
  ('Automation or custom software: a B2B operations decision guide', 'general_b2b', 'custom-software', 'B2B operations leaders', 'workflow automation vs custom software', 'automatización vs software a medida', 'A risk-and-maintainability framework grounded in process variability, permissions and data ownership.', 'backlog', date '2026-11-01'),
  ('How to audit a manual handoff before automating it', 'general_b2b', 'ai-automation', 'B2B operations leaders', 'workflow automation audit checklist', 'auditoría de procesos para automatización', 'An implementation playbook for evidence, exceptions, ownership and success criteria before selecting tools.', 'backlog', date '2026-11-15')
on conflict (title) do nothing;
