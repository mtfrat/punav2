import { createClient } from "@supabase/supabase-js";
import { deriveSocialCampaignStatus } from "../src/lib/social-studio.ts";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const [campaignResult, draftResult] = await Promise.all([
  db.from("social_campaigns").select("id,source_type,source_id,status"),
  db.from("content_distribution_drafts").select("id,campaign_id,status,channel,locale,scheduled_for,published_at"),
]);
if (campaignResult.error) throw new Error(`Campaign verification failed: ${campaignResult.error.code}`);
if (draftResult.error) throw new Error(`Draft verification failed: ${draftResult.error.code}`);

const campaigns = campaignResult.data || [];
const drafts = draftResult.data || [];
if (!campaigns.length) throw new Error("No social campaigns were backfilled.");
if (drafts.some((draft) => !draft.campaign_id)) throw new Error("At least one social draft has no campaign.");
if (drafts.some((draft) => draft.status === "scheduled" && !draft.scheduled_for)) throw new Error("At least one scheduled draft has no date.");
if (drafts.some((draft) => !["scheduled", "published"].includes(draft.status) && draft.scheduled_for)) throw new Error("At least one inactive schedule was not cleared.");
if (new Set(campaigns.map((campaign) => `${campaign.source_type}:${campaign.source_id}`)).size !== campaigns.length) throw new Error("Duplicate campaign sources found.");
for (const campaign of campaigns) {
  const statuses = drafts.filter((draft) => draft.campaign_id === campaign.id).map((draft) => draft.status);
  const expected = deriveSocialCampaignStatus(statuses);
  if (campaign.status !== expected) throw new Error(`Campaign status mismatch for ${campaign.id}.`);
}

console.log(JSON.stringify({
  campaigns: campaigns.length,
  drafts: drafts.length,
  orphan_drafts: 0,
  scheduled_drafts: drafts.filter((draft) => draft.status === "scheduled").length,
  channels: Object.fromEntries(["linkedin", "x", "instagram"].map((channel) => [channel, drafts.filter((draft) => draft.channel === channel).length])),
}, null, 2));
