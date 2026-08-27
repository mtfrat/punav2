-- Bilingual, review-first editorial model for Puna Tech.
-- Apply through the normal Supabase migration workflow after taking a database backup.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

alter table public.posts
  add column if not exists translation_group_id text,
  add column if not exists locale text,
  add column if not exists slug text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists excerpt text,
  add column if not exists hero_image_url text,
  add column if not exists hero_image_alt text,
  add column if not exists category text,
  add column if not exists primary_keyword text,
  add column if not exists author_name text,
  add column if not exists reviewer_name text,
  add column if not exists source_urls jsonb not null default '[]'::jsonb,
  add column if not exists related_service_slug text,
  add column if not exists status text not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- The production schema was verified before this migration. Legacy posts have:
-- id, created_at, title, content, image_url and status. There is no author
-- column, so editorial attribution starts with the verified Puna Tech default.
update public.posts as p
set
  locale = coalesce(locale, 'es'),
  translation_group_id = coalesce(translation_group_id, id::text),
  hero_image_url = coalesce(hero_image_url, nullif(p.image_url, '')),
  author_name = coalesce(author_name, 'Puna Tech Engineering'),
  published_at = coalesce(published_at, p.created_at),
  updated_at = coalesce(updated_at, p.created_at, now()),
  status = coalesce(status, 'draft'),
  slug = coalesce(
    nullif(slug, ''),
    nullif(trim(both '-' from regexp_replace(lower(unaccent(title)), '[^a-z0-9]+', '-', 'g')), ''),
    'post-' || left(id::text, 8)
  );

-- Resolve any duplicate legacy slugs before enforcing locale uniqueness.
with duplicates as (
  select id, locale, slug,
         row_number() over (partition by locale, slug order by created_at, id) as position
  from public.posts
)
update public.posts p
set slug = p.slug || '-' || left(p.id::text, 8)
from duplicates d
where p.id = d.id and d.position > 1;

alter table public.posts
  alter column translation_group_id set not null,
  alter column locale set not null,
  alter column slug set not null,
  alter column status set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'posts_locale_check') then
    alter table public.posts add constraint posts_locale_check check (locale in ('en', 'es'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'posts_status_check') then
    alter table public.posts add constraint posts_status_check check (status in ('draft', 'approved', 'published', 'archived'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'posts_source_urls_array_check') then
    alter table public.posts add constraint posts_source_urls_array_check check (jsonb_typeof(source_urls) = 'array');
  end if;
end $$;

create unique index if not exists posts_locale_slug_unique on public.posts (locale, slug);
create unique index if not exists posts_translation_locale_unique on public.posts (translation_group_id, locale);
create index if not exists posts_public_listing_idx on public.posts (locale, published_at desc) where status = 'published';

create table if not exists public.post_legacy_redirects (
  legacy_path text primary key,
  locale text not null check (locale in ('en', 'es')),
  post_id uuid not null references public.posts(id) on delete cascade,
  target_slug text not null,
  created_at timestamptz not null default now()
);

insert into public.post_legacy_redirects (legacy_path, locale, post_id, target_slug)
select id::text, locale, id, slug from public.posts
on conflict (legacy_path) do update set locale = excluded.locale, post_id = excluded.post_id, target_slug = excluded.target_slug;

alter table public.post_legacy_redirects enable row level security;
drop policy if exists "Legacy redirects are publicly readable" on public.post_legacy_redirects;
create policy "Legacy redirects are publicly readable"
on public.post_legacy_redirects for select
to anon, authenticated
using (true);

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_posts_updated_at();

alter table public.posts enable row level security;

-- The database dashboard and service role bypass RLS. Remove legacy browser policies
-- so anon/authenticated clients can never read drafts or mutate editorial records.
do $$
declare policy_record record;
begin
  for policy_record in select policyname from pg_policies where schemaname = 'public' and tablename = 'posts'
  loop
    execute format('drop policy if exists %I on public.posts', policy_record.policyname);
  end loop;
end $$;

create policy "Published posts are publicly readable"
on public.posts for select
to anon, authenticated
using (status = 'published');

create table if not exists public.website_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  work_email text not null check (char_length(work_email) <= 160),
  company text not null check (char_length(company) between 1 and 120),
  problem text not null check (char_length(problem) between 20 and 1600),
  budget_range text,
  locale text not null check (locale in ('en', 'es')),
  source text not null default 'website_project_brief',
  consented_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.website_leads
  add column if not exists budget_range text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'website_leads_budget_range_check') then
    alter table public.website_leads
      add constraint website_leads_budget_range_check
      check (budget_range is null or budget_range in ('usd_3_10', 'usd_10_25', 'usd_25_50', 'usd_50_plus', 'not_sure'));
  end if;
end $$;

alter table public.website_leads enable row level security;
-- No public policies: only the server-side service role may store or read lead PII.

create table if not exists public.editorial_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_execution_id text,
  status text not null check (status in ('started', 'rejected', 'drafted', 'failed')),
  selected_source_url text,
  reason text,
  translation_group_id text,
  created_at timestamptz not null default now()
);

alter table public.editorial_runs enable row level security;
-- No public policies: workflow writes must use the server-side service-role key.

comment on column public.posts.status is 'n8n creates draft rows; only a human changes status to published.';
comment on column public.posts.source_urls is 'Array of objects such as [{"title":"Primary source","url":"https://..."}].';
comment on table public.post_legacy_redirects is 'Permanent mappings from old blog identifiers or slugs to localized canonical slugs.';
