import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { reviewSocialVariant } from "./social-generation.server";
import { buildRunTelemetry, isRetryableGenerationError } from "./social-observability.server";
import {
  deterministicQualityFlags,
  duplicateMatches,
  duplicateQualityFlags,
  qualityContentMaterial,
  type DuplicateMatch,
  type EvidenceSource,
  type GeneratedSocialVariant,
  type QualityFlag,
  type QualityReview,
  type QualityScorecard,
} from "./social-quality";

type Campaign = { id: string; title: string; objective?: string; audience?: string; service_cluster?: string; problem_statement?: string; cta_type?: string | null; cta_url?: string | null; generation_context?: { sources?: EvidenceSource[] } };
type Draft = { id: string; campaign_id: string; channel: string; locale: string; content: string; hook?: string | null; body?: string | null; cta?: string | null; hashtags?: string[]; image_headline?: string | null; image_alt?: string | null; evidence_refs?: GeneratedSocialVariant["evidence_refs"]; media_strategy?: string; quality_flags?: QualityFlag[]; quality_scorecard?: QualityScorecard | Record<string, never>; quality_review_hash?: string | null; quality_review_run_id?: string | null; generation_metadata?: Record<string, unknown> };

export type PreparedQualityReview = QualityReview & { runId: string | null; reviewedAt: string; duplicateMatches: DuplicateMatch[] };

export function socialQualityHash(draft: Draft, campaign?: Pick<Campaign, "cta_url">) {
  const variant = toVariant(draft);
  return createHash("sha256").update(`${qualityContentMaterial(variant, draft.media_strategy || "text_only")}\n--puna-quality--\n${campaign?.cta_url || ""}`).digest("hex");
}

function toVariant(draft: Draft): GeneratedSocialVariant {
  return {
    channel: draft.channel as GeneratedSocialVariant["channel"], locale: draft.locale as GeneratedSocialVariant["locale"],
    hook: draft.hook || "", body: draft.body ?? draft.content, cta: draft.cta || "", hashtags: draft.hashtags || [],
    image_headline: draft.image_headline || "", image_alt: draft.image_alt || "", evidence_refs: draft.evidence_refs || [],
    quality_flags: [], generation_notes: [],
  };
}

function mergeFlags(...groups: QualityFlag[][]) {
  const combined = groups.flat().filter((flag) => flag?.code && flag?.message);
  return combined.filter((flag, index) => combined.findIndex((item) => item.code === flag.code && item.message === flag.message) === index);
}

function lowScoreFlags(scores: QualityScorecard): QualityFlag[] {
  const labels: Record<keyof QualityScorecard, string> = { clarity: "claridad", specificity: "especificidad", credibility: "credibilidad", channel_fit: "ajuste al canal" };
  return (Object.entries(scores) as Array<[keyof QualityScorecard, { score: number }]>).flatMap(([key, value]) => value.score < 60 ? [{ code: `low_score_${key}`, severity: "warning" as const, message: `La puntuación de ${labels[key]} es ${value.score}/100.` }] : []);
}

async function recentDuplicates(service: SupabaseClient, draft: Draft) {
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const result = await service.from("content_distribution_drafts")
    .select("id,campaign_id,channel,content,created_at,published_at,social_campaigns(title)")
    .eq("locale", draft.locale).in("status", ["draft", "approved", "scheduled", "published"])
    .neq("id", draft.id).or(`created_at.gte.${since},published_at.gte.${since}`).limit(500);
  if (result.error) throw new Error("duplicate_lookup_failed");
  return duplicateMatches(draft.content, (result.data || []).map((item: any) => ({
    id: item.id, campaignId: item.campaign_id,
    campaignTitle: (Array.isArray(item.social_campaigns) ? item.social_campaigns[0]?.title : item.social_campaigns?.title) || "Campaña sin título",
    channel: item.channel, content: item.content, occurredAt: item.published_at || item.created_at,
  })));
}

function cachedReview(draft: Draft, hash: string): PreparedQualityReview | null {
  const scores = draft.quality_scorecard as QualityScorecard;
  if (draft.quality_review_hash !== hash || !scores?.clarity || !scores?.specificity || !scores?.credibility || !scores?.channel_fit) return null;
  return { content_hash: hash, scores, flags: draft.quality_flags || [], evidence_checks: [], runId: draft.quality_review_run_id || null, reviewedAt: new Date().toISOString(), duplicateMatches: [] };
}

export async function prepareQualityReview(service: SupabaseClient, userId: string, campaign: Campaign, draft: Draft): Promise<PreparedQualityReview> {
  const hash = socialQualityHash(draft, campaign);
  const duplicates = await recentDuplicates(service, draft);
  const cached = cachedReview(draft, hash);
  if (cached) return { ...cached, duplicateMatches: duplicates };
  const idempotencyKey = `quality:${draft.id}:${hash}`;
  const begun = await service.rpc("begin_social_generation", {
    target_campaign_id: campaign.id, target_draft_id: draft.id, target_operation: "quality_review", target_stage: "critic",
    target_section: null, target_idempotency_key: idempotencyKey, target_request_hash: hash,
    target_model: process.env.CONTENT_TEXT_MODEL || "gpt-5.6-terra", target_created_by: userId,
  });
  if (begun.error) throw new Error("quality_review_conflict");
  const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
  if (run.status === "succeeded" && run.result_summary?.scores) return {
    content_hash: hash, scores: run.result_summary.scores, flags: run.result_summary.flags || [],
    evidence_checks: run.result_summary.evidence_checks || [], runId: run.id,
    reviewedAt: run.completed_at || new Date().toISOString(), duplicateMatches: duplicates,
  };

  const startedAt = run.started_at || new Date().toISOString();
  await service.from("social_generation_runs").update({ status: "running", started_at: startedAt, error_code: null, error_message: null }).eq("id", run.id);
  try {
    const variant = toVariant(draft);
    const generated = await reviewSocialVariant({ campaign: { title: campaign.title, objective: campaign.objective, audience: campaign.audience, service_cluster: campaign.service_cluster, problem_statement: campaign.problem_statement, cta_type: campaign.cta_type, cta_url: campaign.cta_url }, sources: campaign.generation_context?.sources || [] }, variant);
    const deterministic = deterministicQualityFlags(variant, campaign.generation_context?.sources || [], draft.media_strategy || "text_only", { ctaType: campaign.cta_type, ctaUrl: campaign.cta_url });
    const mediaFlags: QualityFlag[] = draft.generation_metadata?.media_stale ? [{ code: "media_stale", severity: "blocking", message: "La imagen debe recomponerse después de cambiar el título visual." }] : [];
    const flags = mergeFlags(generated.value.flags || [], deterministic, duplicateQualityFlags(duplicates), mediaFlags, lowScoreFlags(generated.value.scores));
    const completedAt = new Date().toISOString();
    const telemetry = buildRunTelemetry({ critic: { usage: generated.usage, requestId: generated.requestId, durationMs: generated.durationMs } }, startedAt, completedAt);
    await service.from("social_generation_runs").update({
      status: "succeeded", stage: "complete", request_id: generated.requestId, usage: { critic: generated.usage },
      result_summary: {
        content_hash: hash,
        scores: generated.value.scores,
        flags,
        evidence_checks: generated.value.evidence_checks || [],
        duplicate_matches: duplicates.map(({ id, campaignId, campaignTitle, channel, occurredAt, similarity, exact }) => ({ id, campaign_id: campaignId, campaign_title: campaignTitle, channel, occurred_at: occurredAt, similarity, exact })),
      },
      completed_at: completedAt, retryable: false, ...telemetry,
    }).eq("id", run.id);
    return { content_hash: hash, scores: generated.value.scores, flags, evidence_checks: generated.value.evidence_checks || [], runId: run.id, reviewedAt: completedAt, duplicateMatches: duplicates };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "quality_review_failed";
    const code = ["model_timeout", "model_rate_limited", "model_unavailable", "invalid_model_response", "invalid_quality_review"].includes(raw) ? raw : "quality_review_failed";
    const completedAt = new Date().toISOString();
    const requestId = typeof (error as any)?.requestId === "string" ? (error as any).requestId : "";
    await service.from("social_generation_runs").update({ status: "failed", error_code: code, error_message: "No se pudo completar la revisión editorial.", retryable: isRetryableGenerationError(code), request_id: requestId || null, request_trace: requestId ? { critic: requestId } : {}, completed_at: completedAt, duration_ms: Math.max(0, Date.parse(completedAt) - Date.parse(startedAt)) }).eq("id", run.id);
    throw new Error(code);
  }
}
