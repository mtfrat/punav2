import { ART_COMPOSITIONS, type ArtCompositionId, type ArtCopy } from "./art-compositions.ts";

export type CampaignArtDraft = ArtCopy & { composition: ArtCompositionId; saved_at: string };
export function validateCampaignArtDraft(value: unknown): CampaignArtDraft | null {
  if (!value || typeof value !== "object") return null;
  const draft = value as Record<string, unknown>;
  if (!ART_COMPOSITIONS.some(c => c.id === draft.composition)) return null;
  for (const [key, max] of [["headline", 100], ["support", 240], ["closing", 75]] as const) {
    if (typeof draft[key] !== "string" || !draft[key].trim() || draft[key].length > max) return null;
  }
  const lines = (draft.support as string).split("\n").filter(s => s.trim()).length;
  if (["contrast", "myth"].includes(String(draft.composition)) && lines !== 2) return null;
  if (["steps", "checklist"].includes(String(draft.composition)) && lines !== 3) return null;
  return { composition: draft.composition as ArtCompositionId, headline: (draft.headline as string).trim(), support: (draft.support as string).trim(), closing: (draft.closing as string).trim(), saved_at: typeof draft.saved_at === "string" ? draft.saved_at : "" };
}

export function campaignArtDrafts(context: unknown): CampaignArtDraft[] {
  const raw = (context as { editorial_drafts?: unknown } | null)?.editorial_drafts;
  if (!Array.isArray(raw)) return [];
  const byComposition = new Map<ArtCompositionId, CampaignArtDraft>();
  for (const item of raw.slice(0, 12)) {
    const draft = validateCampaignArtDraft(item);
    if (draft) byComposition.set(draft.composition, draft);
  }
  return [...byComposition.values()];
}
