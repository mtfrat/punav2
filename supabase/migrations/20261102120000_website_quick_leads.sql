-- Quick lead capture ("dejanos tu mail"): one required field (email) plus an optional one-line note.
-- Written by the /api/lead-rapido server route with the service-role key, same pattern as public.website_leads.
-- Review before applying; NOT applied automatically by the PR.

create table if not exists public.website_quick_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 5 and 160),
  note text check (note is null or char_length(note) <= 280),
  locale text not null default 'es' check (locale in ('en', 'es')),
  page text check (page is null or char_length(page) <= 300),
  placement text check (placement is null or char_length(placement) <= 60),
  source text not null default 'website_quick_lead',
  status text not null default 'new' check (status in ('new', 'contacted', 'closed', 'spam')),
  consented_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists website_quick_leads_created_at_idx
  on public.website_quick_leads (created_at desc);
create index if not exists website_quick_leads_email_idx
  on public.website_quick_leads (lower(email));

alter table public.website_quick_leads enable row level security;

-- Insert-only, and only through the server route: the route uses the service role, which bypasses RLS.
-- There are deliberately NO policies for anon or authenticated. An anon INSERT policy would let anyone
-- with the public anon key write rows directly and skip the route's validation, honeypot and rate limit.
-- There is no select policy either, so nothing is readable from the browser. Lead PII stays server-side.
revoke all on table public.website_quick_leads from anon, authenticated;

comment on table public.website_quick_leads is 'Email-only leads from the "dejanos tu mail" box next to the Cal.com embed. Service-role only. Contains PII: never expose to public loaders or analytics.';
