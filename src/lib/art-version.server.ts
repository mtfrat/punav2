import type { AdminContext } from "./admin.server";

export async function recordArtVersion(context: AdminContext, campaignId: string, changeType: string) {
  const [campaignResult, piecesResult] = await Promise.all([
    context.service.from("art_campaigns").select("*").eq("id", campaignId).single(),
    context.service.from("art_campaign_pieces").select("*").eq("campaign_id", campaignId).order("role"),
  ]);
  if (campaignResult.error || piecesResult.error) throw new Error("art_snapshot_failed");
  const nextVersion = Number(campaignResult.data.current_version || 1) + 1;
  const inserted = await context.service.from("art_campaign_versions").insert({
    campaign_id: campaignId,
    version_number: nextVersion,
    change_type: changeType,
    snapshot: { campaign: campaignResult.data, pieces: piecesResult.data || [] },
    created_by: context.userId,
  });
  if (inserted.error) throw new Error("art_snapshot_failed");
  const updated = await context.service.from("art_campaigns").update({ current_version: nextVersion }).eq("id", campaignId).eq("current_version", campaignResult.data.current_version).select("id").maybeSingle();
  if (updated.error || !updated.data) throw new Error("art_snapshot_failed");
  return nextVersion;
}
