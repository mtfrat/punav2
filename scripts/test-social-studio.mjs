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

assert.equal(deriveSocialCampaignStatus(["draft", "approved"]), "draft");
assert.equal(deriveSocialCampaignStatus(["rejected", "draft"]), "rejected");
assert.equal(deriveSocialCampaignStatus(["approved", "published"]), "approved");
assert.equal(deriveSocialCampaignStatus(["published", "published"]), "published");
assert.equal(deriveSocialCampaignStatus(["archived", "archived"]), "archived");

assert.equal(canTransitionSocialDraft("draft", "approved"), true);
assert.equal(canTransitionSocialDraft("approved", "published"), true);
assert.equal(canTransitionSocialDraft("published", "draft"), false);
assert.equal(canTransitionSocialDraft("archived", "approved"), false);

assert.equal(countSocialCharacters("cafe\u0301"), 4);
assert.equal(validateSocialContent("x", "x".repeat(SOCIAL_CHANNEL_LIMITS.x)), null);
assert.match(validateSocialContent("x", "x".repeat(SOCIAL_CHANNEL_LIMITS.x + 1)) || "", /280/);
assert.match(validateSocialContent("linkedin", "   ") || "", /vacío/);
assert.equal(validateRejectionReason("Motivo suficientemente claro"), null);
assert.match(validateRejectionReason("corto") || "", /10/);

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

console.log("Social Studio contracts passed.");
