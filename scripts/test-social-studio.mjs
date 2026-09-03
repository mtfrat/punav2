import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SOCIAL_CHANNEL_LIMITS,
  canTransitionSocialDraft,
  countSocialCharacters,
  deriveSocialCampaignStatus,
  validateRejectionReason,
  validateSocialContent,
} from "../src/lib/social-studio.ts";
import { blockingQualityMessage, deterministicQualityFlags } from "../src/lib/social-quality.ts";
import {
  addCalendarDays,
  calendarDateTimeInput,
  calendarLocalToUtc,
  calendarWeekDays,
  calendarWeekRange,
  calendarWeekStart,
  isSafeCalendarReturnTo,
} from "../src/lib/social-calendar.ts";

assert.equal(deriveSocialCampaignStatus(["draft", "approved"]), "draft");
assert.equal(deriveSocialCampaignStatus(["rejected", "draft"]), "rejected");
assert.equal(deriveSocialCampaignStatus(["approved", "published"]), "approved");
assert.equal(deriveSocialCampaignStatus(["scheduled", "published"]), "scheduled");
assert.equal(deriveSocialCampaignStatus(["approved", "scheduled"]), "approved");
assert.equal(deriveSocialCampaignStatus(["published", "published"]), "published");
assert.equal(deriveSocialCampaignStatus(["archived", "archived"]), "archived");

assert.equal(canTransitionSocialDraft("draft", "approved"), true);
assert.equal(canTransitionSocialDraft("approved", "published"), true);
assert.equal(canTransitionSocialDraft("approved", "scheduled"), true);
assert.equal(canTransitionSocialDraft("scheduled", "approved"), true);
assert.equal(canTransitionSocialDraft("scheduled", "rejected"), true);
assert.equal(canTransitionSocialDraft("published", "draft"), false);
assert.equal(canTransitionSocialDraft("archived", "approved"), false);

assert.equal(countSocialCharacters("cafe\u0301"), 4);
assert.equal(validateSocialContent("x", "x".repeat(SOCIAL_CHANNEL_LIMITS.x)), null);
assert.match(validateSocialContent("x", "x".repeat(SOCIAL_CHANNEL_LIMITS.x + 1)) || "", /280/);
assert.match(validateSocialContent("linkedin", "   ") || "", /vacío/);
assert.equal(validateRejectionReason("Motivo suficientemente claro"), null);
assert.match(validateRejectionReason("corto") || "", /10/);

assert.equal(calendarWeekStart("2027-01-01"), "2026-12-28");
assert.deepEqual(calendarWeekDays("2026-12-28"), ["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03"]);
assert.equal(addCalendarDays("2026-12-31", 1), "2027-01-01");
assert.equal(calendarLocalToUtc("2026-09-07T09:00").toISOString(), "2026-09-07T12:00:00.000Z");
assert.equal(calendarDateTimeInput("2026-09-07T12:00:00.000Z"), "2026-09-07T09:00");
assert.deepEqual(calendarWeekRange("2026-09-07"), { from: "2026-09-07T03:00:00.000Z", to: "2026-09-14T03:00:00.000Z" });
assert.throws(() => calendarLocalToUtc("2026-09-07T09:07"), /invalid_calendar_datetime/);
assert.equal(isSafeCalendarReturnTo("/ops/calendar?view=week&variant=abc"), true);
assert.equal(isSafeCalendarReturnTo("//evil.test/ops/calendar"), false);

const quantitativeVariant = { channel: "linkedin", locale: "es", hook: "Reducimos 30% del trabajo manual", body: "Un proceso verificable.", cta: "Hablemos.", hashtags: [], image_headline: "30% menos trabajo manual", image_alt: "Gráfico editorial", evidence_refs: [], quality_flags: [], generation_notes: [] };
assert.match(blockingQualityMessage(deterministicQualityFlags(quantitativeVariant, [], "puna_editorial")) || "", /30%/);
quantitativeVariant.evidence_refs = [{ claim: "Reducimos 30% del trabajo manual", source_key: "source-1" }];
assert.equal(blockingQualityMessage(deterministicQualityFlags(quantitativeVariant, [{ key: "source-1", title: "Caso", excerpt: "Se redujo 30% del trabajo manual." }], "puna_editorial")), null);

const migration = await readFile(new URL("../supabase/migrations/20260901190000_social_studio_phase1.sql", import.meta.url), "utf8");
for (const contract of [
  "create table if not exists public.social_campaigns",
  "content_distribution_drafts_ensure_campaign",
  "content_distribution_drafts_refresh_campaign",
  "create or replace function public.approve_social_campaign",
  "for update",
  "errcode = '40001'",
  "grant execute on function public.approve_social_campaign(uuid, timestamptz) to service_role",
  "alter column campaign_id set not null",
  "alter table public.social_campaigns enable row level security",
]) assert.ok(migration.includes(contract), `Missing migration contract: ${contract}`);
assert.equal(/create policy[\s\S]+social_campaigns/i.test(migration), false, "Social campaigns must not receive browser policies");

const phase2 = await readFile(new URL("../supabase/migrations/20260902120000_social_studio_phase2.sql", import.meta.url), "utf8");
for (const contract of [
  "create table if not exists public.brand_media_assets",
  "create table if not exists public.brand_media_templates",
  "create table if not exists public.social_generation_runs",
  "create or replace function public.begin_social_generation",
  "create or replace function public.persist_social_generation_variants",
  "('brand-assets', 'brand-assets', false",
  "('generated-media', 'generated-media', false",
  "alter table public.social_generation_runs enable row level security",
]) assert.ok(phase2.includes(contract), `Missing Phase 2 migration contract: ${contract}`);

const phase3 = await readFile(new URL("../supabase/migrations/20260903120000_social_calendar_phase3.sql", import.meta.url), "utf8");
for (const contract of [
  "add column if not exists scheduled_for timestamptz",
  "'scheduled'",
  "content_distribution_drafts_calendar_idx",
  "create or replace function public.schedule_social_variant",
  "create or replace function public.unschedule_social_variant",
  "at time zone 'America/Argentina/Buenos_Aires'",
  "< 7200",
  "for update",
  "grant execute on function public.schedule_social_variant(uuid, timestamptz, text, boolean) to service_role",
]) assert.ok(phase3.includes(contract), `Missing Phase 3 migration contract: ${contract}`);
assert.equal(/create table/i.test(phase3), false, "Phase 3 must not create a calendar table");

console.log("Social Studio contracts passed.");
