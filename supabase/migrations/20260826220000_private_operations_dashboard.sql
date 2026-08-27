-- Private operations dashboard support. Apply after a database backup.
-- Access remains service-role only; the authenticated browser never queries these tables directly.

create extension if not exists pgcrypto;

alter table public.website_leads
  add column if not exists status text not null default 'new',
  add column if not exists internal_notes text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'website_leads_status_check') then
    alter table public.website_leads
      add constraint website_leads_status_check
      check (status in ('new', 'reviewing', 'qualified', 'closed', 'spam'));
  end if;
end $$;

drop trigger if exists website_leads_set_updated_at on public.website_leads;
create trigger website_leads_set_updated_at before update on public.website_leads
for each row execute function public.set_acquisition_updated_at();

create index if not exists website_leads_review_queue_idx
  on public.website_leads (status, created_at desc);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_recent_idx
  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_entity_idx
  on public.admin_audit_log (entity_type, entity_id, created_at desc);

alter table public.admin_audit_log enable row level security;
-- Deliberately no anon/authenticated policies. The verified server gateway uses service role.

comment on table public.admin_audit_log is 'Private immutable record of dashboard mutations. Service-role access only.';
comment on column public.website_leads.internal_notes is 'Private founder notes. Never expose to public loaders or analytics.';
