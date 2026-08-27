-- Align private acquisition data with Puna Tech's agency-focused positioning.
-- This migration preserves historical rows and never sends or publishes anything.

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'content_briefs_vertical_check') then
    alter table public.content_briefs drop constraint content_briefs_vertical_check;
  end if;
  if exists (select 1 from pg_constraint where conname = 'prospect_accounts_vertical_check') then
    alter table public.prospect_accounts drop constraint prospect_accounts_vertical_check;
  end if;
  if exists (select 1 from pg_constraint where conname = 'prospect_accounts_country_code_check') then
    alter table public.prospect_accounts drop constraint prospect_accounts_country_code_check;
  end if;
end $$;

-- Preserve the former value for auditability, then normalize every legacy
-- vertical before the new constraint is added. Archiving alone is not enough:
-- a row with an old vertical would still violate the constraint.
update public.content_briefs
set
  notes = concat_ws(
    E'\n',
    nullif(notes, ''),
    'Legacy vertical before agency positioning: ' || vertical
  ),
  vertical = 'general_b2b',
  status = 'archived',
  updated_at = now()
where vertical not in (
  'general_b2b',
  'general_agency',
  'marketing_agency',
  'growth_agency',
  'creative_agency'
);

update public.prospect_accounts
set
  signals = coalesce(signals, '{}'::jsonb) || jsonb_build_object('legacy_vertical', vertical, 'positioning_migrated_at', now()),
  vertical = 'general_agency',
  status = 'disqualified',
  updated_at = now()
where vertical not in ('general_agency', 'marketing_agency', 'growth_agency', 'creative_agency');

alter table public.content_briefs
  add constraint content_briefs_vertical_check
  check (vertical in ('general_b2b', 'general_agency', 'marketing_agency', 'growth_agency', 'creative_agency'));

alter table public.prospect_accounts
  add constraint prospect_accounts_vertical_check
  check (vertical in ('general_agency', 'marketing_agency', 'growth_agency', 'creative_agency')),
  add constraint prospect_accounts_country_code_check
  check (country_code in ('AR', 'MX', 'CL', 'CO', 'PE', 'UY', 'CR'));

insert into public.content_briefs
  (title, vertical, service_cluster, audience, target_query_en, target_query_es, angle, status, planned_for)
values
  ('How agencies productize a repeatable client workflow', 'general_agency', 'custom-software', 'Agency founders and operations leaders', 'custom software for marketing agencies', 'software a medida para agencias', 'A practical guide to turning a repeated client-delivery process into an owned product without overbuilding.', 'backlog', date '2026-09-01'),
  ('Where AI belongs in agency delivery operations', 'marketing_agency', 'ai-automation', 'Marketing and creative agency operations', 'AI workflow automation for agencies', 'automatización con IA para agencias', 'Separate useful AI assistance from deterministic approvals, client promises and systems of record.', 'backlog', date '2026-09-15'),
  ('A reliable data layer for multi-client reporting', 'growth_agency', 'data-integrations', 'Growth and performance agency leaders', 'agency client reporting integrations', 'integración de reportes para agencias', 'Map the minimum data contracts between campaign platforms, CRMs, databases and client reporting.', 'backlog', date '2026-10-01'),
  ('When an agency should build a white-label client portal', 'creative_agency', 'custom-software', 'Digital and creative agency founders', 'white label client portal development', 'portal white label para agencias', 'A decision guide for ownership, permissions, reusable modules and handoff before building a client-facing product.', 'backlog', date '2026-10-15')
on conflict (title) do nothing;
