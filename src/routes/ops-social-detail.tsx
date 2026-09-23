import { useEffect, useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { Archive, ArrowDown, ArrowLeft, ArrowUp, CalendarClock, Check, Clock3, Copy, Download, ExternalLink, FileClock, Image as ImageIcon, Plus, RefreshCw, RotateCcw, Save, Send, ShieldCheck, Sparkles, Trash2, Video, X } from "lucide-react";
import { Notice, OpsPageHeader, StatusBadge, formatDate } from "../components/ops";
import { SITE_URL } from "../content/site";
import { audit, assertTrustedMutation, operationsHeaders, opsData, requireAdmin, stringField } from "../lib/admin.server";
import { contentCalendarEnabled, contentComposerEnabled, contentQualityEnabled, contentReelsEnabled, contentStudioEnabled, contentVisualStudioEnabled } from "../lib/content-worker.server";
import { calendarCollisionMessage, calendarDateTimeInput, formatCalendarDateTime, isSafeCalendarReturnTo, todayCalendarKey } from "../lib/social-calendar";
import { regenerateSocialCarouselSlide, regenerateSocialSection, stableHash } from "../lib/social-generation.server";
import { SocialScheduleError, scheduleSocialVariant, unscheduleSocialVariant, type ScheduleConflict } from "../lib/social-scheduling.server";
import { blockingQualityMessage, deterministicQualityFlags, type DuplicateMatch, type EvidenceSource, type GeneratedSocialVariant, type QualityFlag } from "../lib/social-quality";
import type { QualityScorecard } from "../lib/social-quality";
import { buildRunTelemetry, contentQualityConfigurationValid, isRetryableGenerationError } from "../lib/social-observability.server";
import { prepareQualityReview } from "../lib/social-quality.server";
import { carouselQualityFlags, parseCarouselSlides, type SocialCarouselSlide, type VisualPreset } from "../lib/social-visual";
import { renderSocialVisual, socialVisualHash } from "../lib/social-visual-render.server";
import { renderReelCover } from "../lib/social-visual-render.server";
import { parseReelCandidates, parseReelScenes, reelDuration, reelMaterial, reelQualityFlags, type ReelClipCandidate, type ReelImportedClip, type SocialReelScene } from "../lib/social-reels";
import { importReelClip, reelNamedTransformation, reelResource, searchReelClips, startReelRender } from "../lib/social-reels.server";
import {
  SOCIAL_CHANNEL_LIMITS,
  canTransitionSocialDraft,
  countSocialCharacters,
  isSocialChannel,
  isUuid,
  socialChannelLabel,
  socialLocaleLabel,
  validateRejectionReason,
  composeSocialContent,
  parseHashtags,
  visibleOpening,
  isAllowedManualPublicationUrl,
  shouldInvalidateSocialMedia,
  validateSocialContent,
} from "../lib/social-studio";

type Campaign = {
  id: string;
  title: string;
  source_type: string;
  source_id: string;
  status: string;
  cta_type?: string | null;
  cta_url?: string | null;
  updated_at: string;
  generation_context?: { sources?: EvidenceSource[]; visual?: { asset_id?: string; preset_key?: VisualPreset } };
};

type SocialVariant = {
  id: string;
  campaign_id: string;
  translation_group_id: string;
  locale: string;
  channel: string;
  content: string;
  hook: string | null;
  body: string | null;
  cta: string | null;
  hashtags: string[];
  image_headline: string | null;
  image_alt: string | null;
  evidence_refs: GeneratedSocialVariant["evidence_refs"];
  media_strategy: "text_only" | "puna_editorial" | "approved_image";
  media_urls: { primary?: { output_path?: string; sha256?: string }; slides?: Array<{ output_path?: string; sha256?: string }>; document?: { output_path?: string; sha256?: string }; cover?: { output_path?: string; sha256?: string }; video?: { public_id?: string; format?: string; width?: number; height?: number; duration?: number; bytes?: number; hash?: string } };
  visual_kind?: "text" | "single" | "carousel" | "reel";
  carousel_slides?: SocialCarouselSlide[];
  reel_scenes?: SocialReelScene[];
  reel_duration_seconds?: number | null;
  reel_provider_metadata?: { candidates?: Record<string, ReelClipCandidate[]>; source_urls?: Record<string, string>; imported_clips?: Record<string, ReelImportedClip>; render?: Record<string, unknown> };
  rendered_visual_hash?: string | null;
  brand_template_id: string | null;
  quality_flags: QualityFlag[];
  quality_scorecard: QualityScorecard | Record<string, never>;
  quality_review_hash: string | null;
  quality_reviewed_at: string | null;
  quality_review_run_id: string | null;
  generation_metadata: Record<string, unknown>;
  original_sections: Record<string, unknown> | null;
  status: string;
  rejection_reason: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
};

type ActionData = {
  error?: string;
  draftId?: string;
  fieldErrors?: { content?: string; rejection_reason?: string; image_alt?: string; publication_url?: string; metrics?: string };
  pendingSchedule?: { variantId: string; updatedAt: string; localScheduledFor: string; returnTo: string };
  conflicts?: ScheduleConflict[];
  pendingQuality?: { scope: "variant" | "campaign"; variantId?: string; updatedAt?: string; campaignUpdatedAt?: string; warnings: QualityFlag[] };
  qualityMatches?: DuplicateMatch[];
};

type VariantVersion = { id: string; draft_id: string; version_number: number; change_type: string; snapshot: Record<string, any>; content_hash: string; source_version_id: string | null; created_at: string };

function structuredVariant(row: SocialVariant): GeneratedSocialVariant {
  return { channel: row.channel as GeneratedSocialVariant["channel"], locale: row.locale as GeneratedSocialVariant["locale"], hook: row.hook || "", body: row.body ?? row.content, cta: row.cta || "", hashtags: row.hashtags || [], image_headline: row.image_headline || "", image_alt: row.image_alt || "", evidence_refs: row.evidence_refs || [], quality_flags: [], generation_notes: [] };
}

const manualMetricFields = ["impressions", "reach", "reactions", "comments", "shares", "saves", "clicks"] as const;
function manualMetricSnapshot(form: FormData) {
  const snapshot: Record<string, string | number | null> = { recorded_at: new Date().toISOString() };
  for (const field of manualMetricFields) {
    const raw = String(form.get(field) || "").trim();
    if (!raw) snapshot[field] = null;
    else {
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 0) throw new Error("invalid_manual_metric");
      snapshot[field] = value;
    }
  }
  return snapshot;
}

function qualityFor(row: SocialVariant, campaign: Campaign, enforceCampaign = false) {
  return deterministicQualityFlags(structuredVariant(row), campaign.generation_context?.sources || [], row.media_strategy, enforceCampaign ? { ctaType: campaign.cta_type, ctaUrl: campaign.cta_url } : undefined);
}

async function visualApprovalError(service: any, campaign: Campaign, row: SocialVariant) {
  if (!contentVisualStudioEnabled() || row.visual_kind === "text" || row.media_strategy === "text_only") return null;
  if (row.generation_metadata?.media_stale) return "Recomponé la pieza visual antes de aprobar esta versión.";
  if (row.visual_kind === "reel") {
    try {
      const scenes = parseReelScenes(row.reel_scenes);
      const metadata = row.reel_provider_metadata || {};
      const candidates = Object.fromEntries(scenes.map((scene) => [scene.id, parseReelCandidates(metadata.candidates?.[scene.id], scene.id)]));
      const blocking = reelQualityFlags(scenes, campaign.generation_context?.sources || [], candidates, metadata.imported_clips || {}).find((flag) => flag.severity === "blocking");
      if (blocking) return blocking.message;
      const current = await service.rpc("social_variant_quality_hash", { target_variant_id: row.id });
      if (current.error || row.rendered_visual_hash !== current.data || !row.media_urls?.video || !row.media_urls?.cover) return "Renderizá el MP4 y la portada de esta versión antes de aprobar.";
      return null;
    } catch { return "El reel no cumple su estructura de cinco escenas."; }
  }
  if (!row.brand_template_id) return "Elegí un preset visual antes de aprobar.";
  const template = await service.from("brand_media_templates").select("*").eq("id", row.brand_template_id).maybeSingle();
  if (!template.data) return "El preset visual ya no está disponible.";
  try {
    const preset = template.data.preset_key as VisualPreset;
    if (row.visual_kind === "carousel") {
      const blocking = carouselQualityFlags(parseCarouselSlides(row.carousel_slides), campaign.generation_context?.sources || [], preset).find((flag) => flag.severity === "blocking");
      if (blocking) return blocking.message;
    }
    return row.rendered_visual_hash === await socialVisualHash(service, campaign, row, template.data, true) ? null : "Recomponé la pieza visual antes de aprobar esta versión.";
  } catch { return "El carrusel no cumple su estructura de 3 a 7 placas."; }
}

function detailUrl(campaignId: string, variantId?: string, saved?: string, returnTo?: string) {
  const query = new URLSearchParams();
  if (variantId) query.set("variant", variantId);
  if (saved) query.set("saved", saved);
  if (returnTo && isSafeCalendarReturnTo(returnTo)) query.set("return_to", returnTo);
  return `/ops/social/${campaignId}${query.size ? `?${query}` : ""}`;
}

function actionError(context: Awaited<ReturnType<typeof requireAdmin>>, error: string, status: number, draftId?: string, fieldErrors?: ActionData["fieldErrors"], extra: Partial<Pick<ActionData, "pendingSchedule" | "conflicts" | "pendingQuality" | "qualityMatches">> = {}) {
  return opsData({ error, draftId, fieldErrors, ...extra } satisfies ActionData, context.headers, status);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentStudioEnabled()) throw redirect("/ops/distribution", { headers: operationsHeaders(context.headers) });
  const campaignId = params.campaignId || "";
  if (!isUuid(campaignId)) throw new Response("Campaña inválida.", { status: 404 });
  const qualityEnabled = contentQualityEnabled();
  const campaignColumns = `id,title,source_type,source_id,status,updated_at,generation_context${qualityEnabled ? ",cta_type,cta_url" : ""}`;
  const visualEnabled = contentVisualStudioEnabled();
  const reelsEnabled = contentReelsEnabled();
  const variantColumns = `id,campaign_id,translation_group_id,locale,channel,content,hook,body,cta,hashtags,image_headline,image_alt,evidence_refs,media_strategy,media_urls,brand_template_id,quality_flags,generation_metadata,original_sections,status,rejection_reason,published_at,scheduled_for,created_at,updated_at${qualityEnabled ? ",quality_scorecard,quality_review_hash,quality_reviewed_at,quality_review_run_id" : ""}${visualEnabled ? ",visual_kind,carousel_slides,rendered_visual_hash" : ""}${reelsEnabled ? ",reel_scenes,reel_duration_seconds,reel_provider_metadata" : ""}`;

  const [campaignResult, variantsResult, versionsResult, assetsResult] = await Promise.all([
    context.service.from("social_campaigns").select(campaignColumns).eq("id", campaignId).maybeSingle(),
    context.service.from("content_distribution_drafts").select(variantColumns).eq("campaign_id", campaignId).order("locale").order("channel"),
    qualityEnabled ? context.service.from("social_variant_versions").select("id,draft_id,version_number,change_type,snapshot,content_hash,source_version_id,created_at").eq("campaign_id", campaignId).order("version_number", { ascending: false }).limit(500) : Promise.resolve({ data: [], error: null }),
    visualEnabled ? context.service.from("brand_media_assets").select("id,title").eq("is_active", true).order("title") : Promise.resolve({ data: [], error: null }),
  ]);
  if (campaignResult.error || !campaignResult.data) throw new Response("Campaña no encontrada.", { status: 404 });
  if (variantsResult.error || versionsResult.error || assetsResult.error) throw new Response("No se pudieron cargar las variantes.", { status: 500 });

  const campaign = campaignResult.data as unknown as Campaign;
  const rawVariants = (variantsResult.data || []) as unknown as SocialVariant[];
  const variants = rawVariants.map((variant) => variant.visual_kind === "reel" ? { ...variant, reel_provider_metadata: { candidates: variant.reel_provider_metadata?.candidates || {}, imported_clips: variant.reel_provider_metadata?.imported_clips || {}, render: variant.reel_provider_metadata?.render || {} } } : variant);
  const requestedVariant = new URL(request.url).searchParams.get("variant");
  const selected = variants.find((variant) => variant.id === requestedVariant)
    || variants.find((variant) => variant.status === "draft" || variant.status === "rejected")
    || variants[0]
    || null;

  let mediaUrl: string | null = null; let mediaDownloadUrl: string | null = null; let slideUrls: string[] = []; let documentUrl: string | null = null; let reelVideoUrl: string | null = null; let reelCoverUrl: string | null = null;
  const mediaPath = selected?.media_urls?.primary?.output_path;
  if (mediaPath) {
    mediaUrl = (await context.service.storage.from("generated-media").createSignedUrl(mediaPath, 3600)).data?.signedUrl || null;
    const extension = selected?.channel === "instagram" ? "jpg" : "png";
    mediaDownloadUrl = (await context.service.storage.from("generated-media").createSignedUrl(mediaPath, 3600, { download: `${campaign.title}-${selected?.channel}.${extension}` })).data?.signedUrl || null;
  }
  if (visualEnabled && selected?.visual_kind === "carousel") {
    const slidePaths = (selected.media_urls?.slides || []).map((item) => item.output_path).filter(Boolean) as string[];
    if (slidePaths.length) slideUrls = (await Promise.all(slidePaths.map(async (path, index) => (await context.service.storage.from("generated-media").createSignedUrl(path, 3600, { download: `${campaign.title}-${selected.channel}-${index + 1}.${selected.channel === "instagram" ? "jpg" : "png"}` })).data?.signedUrl || ""))).filter(Boolean);
    const documentPath = selected.media_urls?.document?.output_path;
    if (documentPath) documentUrl = (await context.service.storage.from("generated-media").createSignedUrl(documentPath, 3600, { download: `${campaign.title}-linkedin.pdf` })).data?.signedUrl || null;
  }
  if (reelsEnabled && selected?.visual_kind === "reel") {
    const coverPath = selected.media_urls?.cover?.output_path;
    if (coverPath) reelCoverUrl = (await context.service.storage.from("generated-media").createSignedUrl(coverPath, 600, { download: `${campaign.title}-reel-cover.jpg` })).data?.signedUrl || null;
    if (selected.media_urls?.video?.public_id) reelVideoUrl = `/ops/reel-media/${selected.id}`;
  }
  const returnToParam = new URL(request.url).searchParams.get("return_to");
  return opsData({ campaign, variants, versions: (versionsResult.data || []) as VariantVersion[], selectedId: selected?.id || null, mediaUrl, mediaDownloadUrl, slideUrls, documentUrl, reelVideoUrl, reelCoverUrl, assets: assetsResult.data || [], composerEnabled: contentComposerEnabled(), visualEnabled, reelsEnabled, calendarEnabled: contentCalendarEnabled(), qualityEnabled, returnTo: isSafeCalendarReturnTo(returnToParam) ? returnToParam : "", today: todayCalendarKey(), saved: new URL(request.url).searchParams.get("saved") || "", versionA: new URL(request.url).searchParams.get("version_a") || "", versionB: new URL(request.url).searchParams.get("version_b") || "" }, context.headers);
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  if (!contentStudioEnabled()) return actionError(context, "Social Studio está deshabilitado.", 503);
  const campaignId = params.campaignId || "";
  if (!isUuid(campaignId)) return actionError(context, "Campaña inválida.", 404);
  const form = await request.formData();
  const intent = stringField(form, "intent", 40);
  const requestedReturnTo = stringField(form, "return_to", 2000);
  const returnTo = isSafeCalendarReturnTo(requestedReturnTo) ? requestedReturnTo : "";

  const qualityEnabled = contentQualityEnabled();
  const campaignResult = await context.service.from("social_campaigns").select(`id,title,source_type,source_id,status,updated_at,generation_context${qualityEnabled ? ",cta_type,cta_url" : ""}`).eq("id", campaignId).maybeSingle();
  if (campaignResult.error || !campaignResult.data) return actionError(context, "Campaña no encontrada.", 404);
  const campaign = campaignResult.data as unknown as Campaign;

  if (intent === "save_campaign_cta") {
    if (!qualityEnabled) return actionError(context, "La calidad editorial está deshabilitada.", 503);
    const expectedUpdatedAt = stringField(form, "campaign_updated_at", 80);
    if (!expectedUpdatedAt || expectedUpdatedAt !== campaign.updated_at) return actionError(context, "La campaña cambió en otra pestaña. Recargá antes de guardar.", 409);
    const ctaUrl = stringField(form, "cta_url", 1000);
    if (ctaUrl) { try { if (new URL(ctaUrl).protocol !== "https:") throw new Error("invalid"); } catch { return actionError(context, "Ingresá un destino HTTPS válido.", 422); } }
    const updated = await context.service.from("social_campaigns").update({ cta_url: ctaUrl || null }).eq("id", campaignId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (!updated.data) return actionError(context, "La campaña cambió mientras guardabas el CTA.", 409);
    await audit(context, { action: "save_cta_url", entityType: "social_campaign", entityId: campaignId, before: { configured: Boolean(campaign.cta_url) }, after: { configured: Boolean(ctaUrl) } });
    throw redirect(detailUrl(campaignId, undefined, "cta", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "approve_campaign") {
    const expectedUpdatedAt = stringField(form, "campaign_updated_at", 80);
    if (!expectedUpdatedAt || expectedUpdatedAt !== campaign.updated_at) return actionError(context, "La campaña cambió en otra pestaña. Recargá antes de aprobarla.", 409);
    const variantsResult = await context.service.from("content_distribution_drafts").select("*").eq("campaign_id", campaignId);
    if (variantsResult.error) return actionError(context, "No se pudieron validar las variantes.", 500);
    const variants = (variantsResult.data || []) as SocialVariant[];
    const eligible = variants.filter((variant) => variant.status === "draft" || variant.status === "rejected");
    if (!eligible.length) return actionError(context, "La campaña no tiene variantes pendientes para aprobar.", 409);
    for (const variant of eligible) { const visualError = await visualApprovalError(context.service, campaign, variant); if (visualError) return actionError(context, `No se aprobó la campaña: ${visualError}`, 422, variant.id, { content: visualError }); }
    let updateResult;
    if (contentQualityEnabled()) {
      if (!contentQualityConfigurationValid()) return actionError(context, "Configurá las tarifas del modelo antes de usar la revisión de calidad.", 503);
      let reviews;
      try { reviews = await Promise.all(eligible.map((variant) => prepareQualityReview(context.service, context.userId, campaign, variant))); }
      catch { return actionError(context, "No se pudo completar la revisión editorial. Ninguna variante fue aprobada.", 502); }
      const blocking = reviews.flatMap((review, index) => review.flags.filter((flag) => flag.severity === "blocking").map((flag) => ({ ...flag, id: eligible[index].id })));
      const qualityMatches = reviews.flatMap((review) => review.duplicateMatches);
      if (blocking.length) return actionError(context, `No se aprobó la campaña: ${blocking[0].message}`, 422, blocking[0].id, { content: blocking[0].message }, { qualityMatches });
      const warnings = reviews.flatMap((review) => review.flags.filter((flag) => flag.severity === "warning"));
      if (warnings.length && form.get("confirm_warnings") !== "yes") return actionError(context, "La campaña tiene advertencias que requieren confirmación.", 409, undefined, undefined, { pendingQuality: { scope: "campaign", campaignUpdatedAt: expectedUpdatedAt, warnings }, qualityMatches });
      updateResult = await context.service.rpc("approve_social_campaign_with_quality", { target_campaign_id: campaignId, expected_updated_at: expectedUpdatedAt, target_reviews: reviews.map((review, index) => ({ draft_id: eligible[index].id, content_hash: review.content_hash, scores: review.scores, flags: review.flags, reviewed_at: review.reviewedAt, run_id: review.runId })), target_created_by: context.userId });
    } else {
      const invalid = eligible.flatMap((variant) => {
        if (!isSocialChannel(variant.channel)) return [{ id: variant.id, message: "Canal inválido." }];
        const message = validateSocialContent(variant.channel, variant.content) || blockingQualityMessage(qualityFor(variant, campaign));
        return message ? [{ id: variant.id, message }] : [];
      });
      if (invalid.length) return actionError(context, `No se aprobó la campaña: ${invalid[0].message}`, 422, invalid[0].id, { content: invalid[0].message });
      updateResult = await context.service.rpc("approve_social_campaign", { target_campaign_id: campaignId, expected_updated_at: expectedUpdatedAt });
    }
    if (updateResult.error?.code === "40001") return actionError(context, "La campaña cambió mientras la aprobabas. Recargá antes de continuar.", 409);
    if (updateResult.error) return actionError(context, "No se pudo aprobar la campaña completa. Ningún estado fue actualizado.", 400);
    const updatedCount = Number((updateResult.data as Array<{ updated_count?: number }> | null)?.[0]?.updated_count || 0);
    if (updatedCount !== eligible.length) return actionError(context, "La campaña cambió mientras la aprobabas. Recargá antes de continuar.", 409);
    await audit(context, {
      action: "approve_all",
      entityType: "social_campaign",
      entityId: campaignId,
      before: { status: campaign.status, variants: eligible.map((variant) => ({ id: variant.id, status: variant.status })) },
      after: { approved_variant_ids: eligible.map((variant) => variant.id) },
    });
    throw redirect(detailUrl(campaignId, undefined, "campaign-approved", returnTo), { headers: operationsHeaders(context.headers) });
  }

  const variantId = stringField(form, "variant_id", 80);
  const expectedUpdatedAt = stringField(form, "updated_at", 80);
  if (!isUuid(variantId)) return actionError(context, "Variante inválida.", 404);
  const beforeResult = await context.service.from("content_distribution_drafts").select("*").eq("id", variantId).eq("campaign_id", campaignId).maybeSingle();
  if (beforeResult.error || !beforeResult.data) return actionError(context, "Variante no encontrada.", 404, variantId);
  const before = beforeResult.data as SocialVariant;
  if (!expectedUpdatedAt || expectedUpdatedAt !== before.updated_at) return actionError(context, "Esta variante cambió en otra pestaña. Recargá para evitar sobrescribirla.", 409, variantId);
  if (!isSocialChannel(before.channel)) return actionError(context, "La variante tiene un canal inválido.", 422, variantId);

  if (intent === "save_manual_metrics") {
    if (before.status !== "published") return actionError(context, "Sólo podés registrar resultados de una publicación manual.", 409, variantId);
    const period = stringField(form, "metric_period", 3);
    if (!(["d7", "d30"] as const).includes(period as "d7" | "d30")) return actionError(context, "Elegí D7 o D30.", 422, variantId);
    let snapshot;
    try { snapshot = manualMetricSnapshot(form); }
    catch { return actionError(context, "Las métricas deben ser números enteros desde cero o quedar vacías.", 422, variantId, { metrics: "Usá enteros desde cero; dejá vacío lo que no conozcas." }); }
    const performance = (before.generation_metadata?.manual_performance || {}) as Record<string, any>;
    const generationMetadata = { ...before.generation_metadata, manual_performance: { publication_url: performance.publication_url, snapshots: { ...(performance.snapshots || {}), [period]: snapshot } }, version_actor_id: context.userId };
    const result = await context.service.from("content_distribution_drafts").update({ generation_metadata: generationMetadata }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (!result.data) return actionError(context, "La variante cambió mientras cargabas las métricas. Recargá e intentá otra vez.", 409, variantId);
    await audit(context, { action: "save_manual_metrics", entityType: "distribution_draft", entityId: variantId, after: { period, snapshot } });
    throw redirect(detailUrl(campaignId, variantId, `metrics-${period}`, returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "restore_variant_version") {
    if (!contentQualityEnabled()) return actionError(context, "El historial de versiones está deshabilitado.", 503, variantId);
    const versionId = stringField(form, "version_id", 80);
    if (!isUuid(versionId)) return actionError(context, "Versión inválida.", 422, variantId);
    const restored = await context.service.rpc("restore_social_variant_version", { target_variant_id: variantId, target_version_id: versionId, expected_updated_at: expectedUpdatedAt, target_created_by: context.userId });
    if (restored.error?.code === "40001") return actionError(context, "La variante cambió antes de restaurarse. Recargá la página.", 409, variantId);
    if (restored.error) return actionError(context, before.status === "published" || before.status === "archived" ? "Deshacé la publicación o el archivado antes de restaurar una versión." : "No se pudo restaurar la versión.", 409, variantId);
    await audit(context, { action: "restore_version", entityType: "distribution_draft", entityId: variantId, before: { status: before.status }, after: { status: "draft", source_version_id: versionId } });
    throw redirect(detailUrl(campaignId, variantId, "restore", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "schedule_variant" || intent === "reschedule_variant") {
    if (!contentCalendarEnabled()) return actionError(context, "El calendario está deshabilitado.", 503, variantId);
    const localScheduledFor = stringField(form, "scheduled_for", 30);
    try {
      const result = await scheduleSocialVariant(context, {
        variantId,
        expectedUpdatedAt,
        localScheduledFor,
        allowConflict: form.get("confirm_conflict") === "yes",
      });
      if (!result.applied) {
        return actionError(
          context,
          calendarCollisionMessage(result.conflicts.length || 1, before.channel),
          409,
          variantId,
          undefined,
          {
            pendingSchedule: { variantId, updatedAt: expectedUpdatedAt, localScheduledFor, returnTo },
            conflicts: result.conflicts,
          },
        );
      }
      throw redirect(detailUrl(campaignId, variantId, intent === "reschedule_variant" ? "reschedule" : "schedule", returnTo), { headers: operationsHeaders(context.headers) });
    } catch (error) {
      if (error instanceof Response) throw error;
      if (error instanceof SocialScheduleError) return actionError(context, error.message, error.status, variantId);
      return actionError(context, "No se pudo actualizar la programación.", 500, variantId);
    }
  }

  if (intent === "unschedule_variant") {
    if (!contentCalendarEnabled()) return actionError(context, "El calendario está deshabilitado.", 503, variantId);
    try {
      await unscheduleSocialVariant(context, { variantId, expectedUpdatedAt });
      throw redirect(detailUrl(campaignId, variantId, "unschedule", returnTo), { headers: operationsHeaders(context.headers) });
    } catch (error) {
      if (error instanceof Response) throw error;
      if (error instanceof SocialScheduleError) return actionError(context, error.message, error.status, variantId);
      return actionError(context, "No se pudo quitar la programación.", 500, variantId);
    }
  }

  if (intent === "save_carousel") {
    if (!contentVisualStudioEnabled() || before.visual_kind !== "carousel") return actionError(context, "El editor de carrusel está deshabilitado.", 503, variantId);
    if (before.status === "published" || before.status === "archived") return actionError(context, "Esta variante no puede editarse en su estado actual.", 409, variantId);
    let slides: SocialCarouselSlide[];
    try { slides = parseCarouselSlides(JSON.parse(stringField(form, "carousel_slides", 60_000))); }
    catch { return actionError(context, "Revisá la estructura, longitudes y alt text de las placas.", 422, variantId); }
    const preset = campaign.generation_context?.visual?.preset_key || "editorial";
    const flags = carouselQualityFlags(slides, campaign.generation_context?.sources || [], preset);
    const blocking = flags.find((flag) => flag.severity === "blocking");
    if (blocking) return actionError(context, blocking.message, 422, variantId, { content: blocking.message });
    const updated = await context.service.from("content_distribution_drafts").update({ carousel_slides: slides, rendered_visual_hash: null, quality_flags: [...qualityFor(before, campaign), ...flags], generation_metadata: { ...before.generation_metadata, media_stale: true, version_actor_id: context.userId } }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (!updated.data) return actionError(context, "La variante cambió mientras editabas el carrusel. Recargá antes de continuar.", 409, variantId);
    await audit(context, { action: "save_carousel", entityType: "distribution_draft", entityId: variantId, before: { slide_count: before.carousel_slides?.length || 0 }, after: { slide_count: slides.length } });
    throw redirect(detailUrl(campaignId, variantId, "carousel", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "regenerate_carousel_slide") {
    if (!contentVisualStudioEnabled() || before.visual_kind !== "carousel") return actionError(context, "La regeneración visual está deshabilitada.", 503, variantId);
    const slideIndex = Number(form.get("slide_index")); const slides = parseCarouselSlides(before.carousel_slides);
    if (!Number.isInteger(slideIndex) || !slides[slideIndex]) return actionError(context, "Placa inválida.", 422, variantId);
    const key = stringField(form, "idempotency_key", 200); const preset = campaign.generation_context?.visual?.preset_key || "editorial";
    const modelContext = { campaign: { title: campaign.title }, sources: campaign.generation_context?.sources || [], current_variant: structuredVariant(before) };
    const hash = stableHash({ operation: "carousel", draft_id: variantId, slide_index: slideIndex, slides, preset });
    const begun = await context.service.rpc("begin_social_generation", { target_campaign_id: campaignId, target_draft_id: variantId, target_operation: "carousel", target_stage: "drafting", target_section: null, target_idempotency_key: key, target_request_hash: hash, target_model: process.env.CONTENT_TEXT_MODEL || "gpt-5.6-terra", target_created_by: context.userId });
    if (begun.error) return actionError(context, "No se pudo iniciar la regeneración de la placa.", 409, variantId);
    const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
    if (run.status !== "succeeded") try {
      await context.service.from("social_generation_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", run.id);
      const generated = await regenerateSocialCarouselSlide(modelContext, slides, slideIndex, preset);
      const next = slides.map((slide, index) => index === slideIndex ? generated.slide : slide);
      const updated = await context.service.from("content_distribution_drafts").update({ carousel_slides: next, rendered_visual_hash: null, status: "draft", generation_metadata: { ...before.generation_metadata, media_stale: true, last_regeneration_run_id: run.id, version_actor_id: context.userId } }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
      if (!updated.data) throw new Error("generation_conflict");
      await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", request_id: generated.requestId, usage: generated.usage, result_summary: { slide_index: slideIndex }, completed_at: new Date().toISOString() }).eq("id", run.id);
      await audit(context, { action: "regenerate_carousel_slide", entityType: "distribution_draft", entityId: variantId, after: { slide_index: slideIndex, run_id: run.id } });
    } catch (error) {
      await context.service.from("social_generation_runs").update({ status: "failed", error_code: "generation_failed", error_message: "No se pudo regenerar la placa.", completed_at: new Date().toISOString() }).eq("id", run.id);
      return actionError(context, "No se pudo regenerar la placa. El carrusel anterior sigue intacto.", 502, variantId);
    }
    throw redirect(detailUrl(campaignId, variantId, "carousel", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "save_reel_storyboard") {
    if (!contentReelsEnabled() || before.visual_kind !== "reel") return actionError(context, "El estudio de reels está deshabilitado.", 503, variantId);
    if (before.status === "published" || before.status === "archived") return actionError(context, "Este reel no puede editarse en su estado actual.", 409, variantId);
    let scenes: SocialReelScene[];
    try { scenes = parseReelScenes(JSON.parse(stringField(form, "reel_scenes", 100_000))); }
    catch { return actionError(context, "Revisá la estructura, duración, textos y alt text de las cinco escenas.", 422, variantId); }
    const previousById = new Map((before.reel_scenes || []).map((scene) => [scene.id, scene]));
    const selectionChanged = scenes.some((scene) => previousById.get(scene.id)?.selected_candidate_key !== scene.selected_candidate_key);
    const metadata = before.reel_provider_metadata || {};
    const imported = selectionChanged ? Object.fromEntries(Object.entries(metadata.imported_clips || {}).filter(([sceneId, clip]) => scenes.some((scene) => scene.id === sceneId && scene.selected_candidate_key === clip.candidate_key))) : metadata.imported_clips || {};
    const flags = reelQualityFlags(scenes, campaign.generation_context?.sources || [], metadata.candidates || {}, imported);
    const updated = await context.service.from("content_distribution_drafts").update({ reel_scenes: scenes, reel_duration_seconds: reelDuration(scenes), reel_provider_metadata: { ...metadata, imported_clips: imported }, rendered_visual_hash: null, quality_flags: [...qualityFor(before, campaign), ...flags], generation_metadata: { ...before.generation_metadata, media_stale: true, version_actor_id: context.userId } }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (!updated.data) return actionError(context, "El reel cambió mientras lo editabas. Recargá antes de continuar.", 409, variantId);
    await audit(context, { action: "save_reel_storyboard", entityType: "distribution_draft", entityId: variantId, before: { duration_seconds: before.reel_duration_seconds }, after: { duration_seconds: reelDuration(scenes), selections_changed: selectionChanged } });
    throw redirect(detailUrl(campaignId, variantId, "reel", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "refresh_reel_sources") {
    if (!contentReelsEnabled() || before.visual_kind !== "reel") return actionError(context, "El estudio de reels está deshabilitado.", 503, variantId);
    const sceneId = stringField(form, "scene_id", 80); const scenes = parseReelScenes(before.reel_scenes); const scene = scenes.find((item) => item.id === sceneId);
    if (!scene) return actionError(context, "Escena inválida.", 422, variantId);
    const hash = stableHash({ operation: "reel_sources", draft_id: variantId, scene_id: sceneId, query: scene.search_query, version: before.updated_at });
    const begun = await context.service.rpc("begin_social_generation", { target_campaign_id: campaignId, target_draft_id: variantId, target_operation: "reel_sources", target_stage: "visual_drafting", target_section: null, target_idempotency_key: `reel-sources:${variantId}:${sceneId}:${before.updated_at}`, target_request_hash: hash, target_model: null, target_created_by: context.userId });
    if (begun.error) return actionError(context, "No se pudo iniciar la búsqueda visual.", 409, variantId);
    const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
    if (run.status === "succeeded" && before.reel_provider_metadata?.candidates?.[sceneId]?.length === 3) throw redirect(detailUrl(campaignId, variantId, "reel-sources", returnTo), { headers: operationsHeaders(context.headers) });
    try {
      const claimed = await context.service.from("social_generation_runs").update({ status: "running", provider: "pexels", started_at: run.started_at || new Date().toISOString() }).eq("id", run.id).in("status", ["pending", "failed"]).select("id").maybeSingle();
      if (!claimed.data) return actionError(context, "La búsqueda de clips ya está en curso.", 409, variantId);
      const found = await searchReelClips(scene.id, scene.search_query);
      const metadata = before.reel_provider_metadata || {};
      const nextScenes = scenes.map((item) => item.id === scene.id ? { ...item, selected_candidate_key: null } : item);
      const imported = { ...(metadata.imported_clips || {}) }; delete imported[scene.id];
      const updated = await context.service.from("content_distribution_drafts").update({ reel_scenes: nextScenes, reel_provider_metadata: { ...metadata, candidates: { ...(metadata.candidates || {}), [scene.id]: found.candidates }, source_urls: { ...(metadata.source_urls || {}), ...found.sources }, imported_clips: imported }, rendered_visual_hash: null, generation_metadata: { ...before.generation_metadata, media_stale: true, version_actor_id: context.userId } }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
      if (!updated.data) throw new Error("reel_conflict");
      await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", result_summary: { scene_id: scene.id, candidate_count: found.candidates.length }, completed_at: new Date().toISOString(), retryable: false }).eq("id", run.id);
      await audit(context, { action: "refresh_reel_sources", entityType: "distribution_draft", entityId: variantId, after: { scene_id: scene.id, candidate_count: found.candidates.length, run_id: run.id } });
    } catch (error) {
      const code = error instanceof Error ? error.message : "reel_sources_failed";
      await context.service.from("social_generation_runs").update({ status: "failed", error_code: code, error_message: "No se pudieron obtener clips para esta escena.", retryable: true, completed_at: new Date().toISOString() }).eq("id", run.id);
      return actionError(context, code === "pexels_rate_limited" ? "Pexels alcanzó su límite temporal. Reintentá más tarde." : "No se pudieron obtener tres clips verticales para esta escena.", 502, variantId);
    }
    throw redirect(detailUrl(campaignId, variantId, "reel-sources", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "select_reel_candidate") {
    if (!contentReelsEnabled() || before.visual_kind !== "reel") return actionError(context, "El estudio de reels está deshabilitado.", 503, variantId);
    const sceneId = stringField(form, "scene_id", 80); const candidateKey = stringField(form, "candidate_key", 100);
    const scenes = parseReelScenes(before.reel_scenes); const scene = scenes.find((item) => item.id === sceneId); const metadata = before.reel_provider_metadata || {};
    if (!scene) return actionError(context, "Escena inválida.", 422, variantId);
    let candidates: ReelClipCandidate[];
    try { candidates = parseReelCandidates(metadata.candidates?.[sceneId], sceneId); } catch { return actionError(context, "Renová las opciones de esta escena.", 422, variantId); }
    const candidate = candidates.find((item) => item.key === candidateKey); const sourceUrl = metadata.source_urls?.[candidateKey];
    if (!candidate || !sourceUrl) return actionError(context, "El clip elegido no pertenece a las opciones vigentes.", 422, variantId);
    const existing = metadata.imported_clips?.[sceneId];
    const importHash = stableHash({ operation: "reel_sources", action: "import", draft_id: variantId, scene_id: sceneId, candidate_key: candidate.key });
    const begun = await context.service.rpc("begin_social_generation", { target_campaign_id: campaignId, target_draft_id: variantId, target_operation: "reel_sources", target_stage: "importing", target_section: `import:${sceneId}`, target_idempotency_key: `reel-import:${variantId}:${sceneId}:${candidate.key}`, target_request_hash: importHash, target_model: null, target_created_by: context.userId });
    if (begun.error) return actionError(context, "No se pudo iniciar la importación del clip.", 409, variantId);
    const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
    try {
      let imported = existing?.candidate_key === candidate.key ? existing : run.provider_metadata?.imported_clip as ReelImportedClip | undefined;
      if (!imported) {
        const claimed = await context.service.from("social_generation_runs").update({ status: "running", provider: "cloudinary", provider_status: "importing", started_at: run.started_at || new Date().toISOString() }).eq("id", run.id).in("status", ["pending", "failed"]).select("id").maybeSingle();
        if (!claimed.data) return actionError(context, "La importación de este clip ya está en curso.", 409, variantId);
        imported = await importReelClip({ campaignId, draftId: variantId, scene, candidate, sourceUrl });
        await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", provider_status: "ready", provider_metadata: { imported_clip: imported }, result_summary: { scene_id: sceneId, candidate_key: candidate.key }, completed_at: new Date().toISOString(), retryable: false }).eq("id", run.id);
      }
      const nextScenes = scenes.map((item) => item.id === sceneId ? { ...item, selected_candidate_key: candidate.key } : item);
      const updated = await context.service.from("content_distribution_drafts").update({ reel_scenes: nextScenes, reel_provider_metadata: { ...metadata, imported_clips: { ...(metadata.imported_clips || {}), [sceneId]: imported } }, rendered_visual_hash: null, generation_metadata: { ...before.generation_metadata, media_stale: true, version_actor_id: context.userId } }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
      if (!updated.data) return actionError(context, "El reel cambió durante la importación. Recargá antes de continuar.", 409, variantId);
      await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", provider_status: "ready", provider_metadata: { imported_clip: imported }, result_summary: { scene_id: sceneId, candidate_key: candidate.key }, completed_at: new Date().toISOString(), retryable: false }).eq("id", run.id);
      await audit(context, { action: "select_reel_candidate", entityType: "distribution_draft", entityId: variantId, after: { scene_id: sceneId, candidate_key: candidate.key, pexels_video_id: candidate.pexels_video_id, run_id: run.id } });
    } catch {
      await context.service.from("social_generation_runs").update({ status: "failed", provider_status: "failed", error_code: "cloudinary_import_failed", error_message: "No se pudo importar el clip elegido.", retryable: true, completed_at: new Date().toISOString() }).eq("id", run.id).neq("status", "succeeded");
      return actionError(context, "Cloudinary no pudo importar el clip elegido. La selección anterior sigue intacta.", 502, variantId);
    }
    throw redirect(detailUrl(campaignId, variantId, "reel-clip", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "render_reel") {
    if (!contentReelsEnabled() || before.visual_kind !== "reel") return actionError(context, "El estudio de reels está deshabilitado.", 503, variantId);
    const scenes = parseReelScenes(before.reel_scenes); const metadata = before.reel_provider_metadata || {};
    const flags = reelQualityFlags(scenes, campaign.generation_context?.sources || [], metadata.candidates || {}, metadata.imported_clips || {});
    const blocking = flags.find((flag) => flag.severity === "blocking"); if (blocking) return actionError(context, blocking.message, 422, variantId);
    const hashResult = await context.service.rpc("social_variant_quality_hash", { target_variant_id: variantId });
    if (hashResult.error || typeof hashResult.data !== "string") return actionError(context, "No se pudo calcular la versión visual.", 500, variantId);
    const visualHash = hashResult.data; const key = `reel-render:${variantId}:${visualHash}`;
    const begun = await context.service.rpc("begin_social_generation", { target_campaign_id: campaignId, target_draft_id: variantId, target_operation: "reel_render", target_stage: "rendering", target_section: null, target_idempotency_key: key, target_request_hash: visualHash, target_model: null, target_created_by: context.userId });
    if (begun.error) return actionError(context, "No se pudo iniciar el render del reel.", 409, variantId);
    const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
    let provisionalCoverPath: string | null = null;
    if (run.status !== "succeeded" && run.status !== "running") try {
      await context.service.from("social_generation_runs").update({ status: "running", provider: "cloudinary", provider_status: "importing", started_at: new Date().toISOString() }).eq("id", run.id);
      const cover = await renderReelCover(context.service, campaign, before, visualHash, run.id);
      provisionalCoverPath = String(cover.output_path || "") || null;
      const notificationUrl = `${SITE_URL}/api/webhooks/cloudinary/reel-render?run_id=${encodeURIComponent(run.id)}`;
      const started = await startReelRender({ campaignId, draftId: variantId, runId: run.id, visualHash, scenes, imported: metadata.imported_clips || {}, notificationUrl });
      const stored = await context.service.from("content_distribution_drafts").update({ media_urls: { ...(before.media_urls || {}), cover }, reel_provider_metadata: { ...metadata, render: { run_id: run.id, output_public_id: started.publicId, transformation: started.transformation, status: started.providerStatus } }, generation_metadata: { ...before.generation_metadata, media_stale: true, version_actor_id: context.userId } }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
      if (!stored.data) throw new Error("render_conflict");
      const oldCoverPath = before.media_urls?.cover?.output_path;
      if (oldCoverPath && oldCoverPath !== cover.output_path) await context.service.storage.from("generated-media").remove([oldCoverPath]);
      await context.service.from("social_generation_runs").update({ external_job_id: started.externalJobId, provider_status: started.providerStatus, provider_metadata: { output_public_id: started.publicId, transformation: started.transformation }, result_summary: { stage: "assembling" } }).eq("id", run.id);
      await audit(context, { action: "render_reel", entityType: "distribution_draft", entityId: variantId, after: { run_id: run.id, visual_hash: visualHash, scene_count: 5 } });
    } catch (error) {
      if (provisionalCoverPath) await context.service.storage.from("generated-media").remove([provisionalCoverPath]);
      const code = error instanceof Error ? error.message : "reel_render_failed";
      await context.service.from("social_generation_runs").update({ status: "failed", provider_status: "failed", error_code: code, error_message: "No se pudo iniciar el render del reel.", retryable: true, completed_at: new Date().toISOString() }).eq("id", run.id);
      return actionError(context, "No se pudo iniciar el render. El storyboard y los clips elegidos siguen guardados.", 502, variantId);
    }
    throw redirect(detailUrl(campaignId, variantId, "reel-render", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "check_reel_render") {
    if (!contentReelsEnabled() || before.visual_kind !== "reel") return actionError(context, "El estudio de reels está deshabilitado.", 503, variantId);
    const runId = String(before.reel_provider_metadata?.render?.run_id || ""); const publicId = String(before.reel_provider_metadata?.render?.output_public_id || "");
    const transformation = String(before.reel_provider_metadata?.render?.transformation || "");
    if (!isUuid(runId) || !publicId || !transformation) return actionError(context, "No hay un render pendiente para comprobar.", 409, variantId);
    try {
      const expectedTransformation = reelNamedTransformation(parseReelScenes(before.reel_scenes), before.reel_provider_metadata?.imported_clips || {}).eager;
      if (transformation !== expectedTransformation) {
        const failed = await context.service.from("social_generation_runs").update({ status: "failed", provider_status: "failed", error_code: "cloudinary_transform_outdated", error_message: "La transformación del reel fue corregida después de iniciar este render.", retryable: true, completed_at: new Date().toISOString() }).eq("id", runId).eq("status", "running").select("id").maybeSingle();
        if (failed.data) {
          await context.service.from("content_distribution_drafts").update({ reel_provider_metadata: { ...before.reel_provider_metadata, render: { ...before.reel_provider_metadata?.render, status: "failed" } } }).eq("id", variantId);
          return actionError(context, "El render anterior usa una transformación obsoleta. Podés volver a renderizar sin perder el storyboard ni los clips.", 409, variantId);
        }
      }
      if (transformation.length > 1024) {
        const failed = await context.service.from("social_generation_runs").update({ status: "failed", provider_status: "failed", error_code: "cloudinary_transform_too_long", error_message: "La transformación del reel supera el límite de Cloudinary.", retryable: true, completed_at: new Date().toISOString() }).eq("id", runId).eq("status", "running").select("id").maybeSingle();
        if (failed.data) {
          await context.service.from("content_distribution_drafts").update({ reel_provider_metadata: { ...before.reel_provider_metadata, render: { ...before.reel_provider_metadata?.render, status: "failed" } } }).eq("id", variantId);
          return actionError(context, "El render anterior usó una transformación demasiado larga. Podés volver a renderizar sin perder el storyboard ni los clips.", 409, variantId);
        }
      }
      const resource = await reelResource(publicId, transformation);
      if (!resource?.public_id) {
        const currentRun = await context.service.from("social_generation_runs").select("status,started_at").eq("id", runId).single();
        if (currentRun.error) return actionError(context, "No se pudo comprobar el estado del render.", 502, variantId);
        if (currentRun.data.status === "failed") return actionError(context, "El último render falló. Podés volver a renderizar sin perder el storyboard ni los clips.", 409, variantId);
        if (currentRun.data?.status === "running" && currentRun.data.started_at && Date.now() - new Date(currentRun.data.started_at).valueOf() > 30 * 60_000) {
          await context.service.from("social_generation_runs").update({ status: "failed", provider_status: "timeout", error_code: "cloudinary_render_timeout", error_message: "Cloudinary no entregó el MP4 dentro de 30 minutos.", retryable: true, completed_at: new Date().toISOString() }).eq("id", runId).eq("status", "running");
          await context.service.from("content_distribution_drafts").update({ reel_provider_metadata: { ...before.reel_provider_metadata, render: { ...before.reel_provider_metadata?.render, status: "failed" } } }).eq("id", variantId);
          return actionError(context, "El render tardó demasiado. Podés volver a renderizar sin perder el storyboard ni los clips.", 409, variantId);
        }
        return actionError(context, "Cloudinary todavía está ensamblando el reel.", 409, variantId);
      }
      const video = { public_id: String(resource.public_id), version: Number(resource.version || 0) || null, format: String(resource.format || "mp4"), width: Number(resource.width || 1080), height: Number(resource.height || 1920), duration: Number(resource.duration || 0), bytes: Number(resource.bytes || 0), hash: String((await context.service.from("social_generation_runs").select("request_hash").eq("id", runId).single()).data?.request_hash || "") };
      await context.service.from("content_distribution_drafts").update({ media_urls: { ...(before.media_urls || {}), video }, rendered_visual_hash: video.hash, generation_metadata: { ...before.generation_metadata, media_stale: false, version_actor_id: context.userId } }).eq("id", variantId);
      await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", provider_status: "ready", result_summary: { public_id: video.public_id, width: video.width, height: video.height, duration: video.duration, bytes: video.bytes }, completed_at: new Date().toISOString(), retryable: false }).eq("id", runId);
    } catch { return actionError(context, "No se pudo comprobar el estado del render.", 502, variantId); }
    throw redirect(detailUrl(campaignId, variantId, "reel-ready", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "render_media") {
    if (!contentComposerEnabled()) return actionError(context, "La composición visual está deshabilitada.", 503, variantId);
    if (before.media_strategy === "text_only" || !before.brand_template_id || (before.visual_kind !== "carousel" && (!before.image_headline || !before.image_alt))) return actionError(context, "Completá el contenido visual, alt text y preset antes de componer.", 422, variantId);
    const template = await context.service.from("brand_media_templates").select("*").eq("id", before.brand_template_id).eq("is_active", true).maybeSingle();
    if (!template.data) return actionError(context, "La plantilla ya no está disponible.", 422, variantId);
    const desiredVisualHash = await socialVisualHash(context.service, campaign, before, template.data, contentVisualStudioEnabled());
    const key = `render:${variantId}:${desiredVisualHash}`; const hash = stableHash({ operation: "render_media", draft_id: variantId, visual_hash: desiredVisualHash });
    const begun = await context.service.rpc("begin_social_generation", { target_campaign_id: campaignId, target_draft_id: variantId, target_operation: "render_media", target_stage: "rendering", target_section: null, target_idempotency_key: key, target_request_hash: hash, target_model: null, target_created_by: context.userId });
    if (begun.error) return actionError(context, "No se pudo iniciar la composición.", 409, variantId);
    const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
    if (run.status !== "succeeded") {
      const renderingStarted = Date.now();
      try {
        await context.service.from("social_generation_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", run.id);
        const rendered = await renderSocialVisual(context.service, campaign, before, template.data, run.id, contentVisualStudioEnabled());
        const completedAt = new Date().toISOString();
        await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", result_summary: { visual_hash: rendered.visualHash }, completed_at: completedAt, ...(contentQualityEnabled() ? buildRunTelemetry({ rendering: { requestId: run.id, durationMs: Date.now() - renderingStarted } }, run.started_at || completedAt, completedAt) : {}) }).eq("id", run.id);
        await audit(context, { action: "render_media", entityType: "distribution_draft", entityId: variantId, after: { run_id: run.id, visual_hash: rendered.visualHash, slide_count: before.carousel_slides?.length || 1 } });
      } catch (error) {
        const completedAt = new Date().toISOString();
        const rawCode = typeof (error as { code?: unknown })?.code === "string" ? String((error as { code: string }).code) : "render_failed";
        const code = ["worker_timeout", "worker_unavailable", "worker_request_failed", "invalid_worker_response"].includes(rawCode) ? rawCode : "render_failed";
        const requestId = typeof (error as { requestId?: unknown })?.requestId === "string" ? String((error as { requestId: string }).requestId) : run.id;
        const retryable = typeof (error as { retryable?: unknown })?.retryable === "boolean" ? Boolean((error as { retryable: boolean }).retryable) : isRetryableGenerationError(code);
        await context.service.from("social_generation_runs").update({ status: "failed", error_code: code, error_message: "No se pudo componer la pieza.", completed_at: completedAt, ...(contentQualityEnabled() ? { retryable, request_id: requestId, request_trace: { rendering: requestId }, duration_ms: run.started_at ? Math.max(0, Date.parse(completedAt) - Date.parse(run.started_at)) : Date.now() - renderingStarted } : {}) }).eq("id", run.id);
        return actionError(context, "No se pudo recomponer la imagen. El copy y el medio anterior siguen intactos.", 502, variantId);
      }
    }
    throw redirect(detailUrl(campaignId, variantId, "render", returnTo), { headers: operationsHeaders(context.headers) });
  }

  if (intent === "regenerate_section") {
    if (!contentComposerEnabled()) return actionError(context, "La regeneración está deshabilitada.", 503, variantId);
    if (before.status === "published" || before.status === "archived") return actionError(context, "Esta variante no puede regenerarse en su estado actual.", 409, variantId);
    const section = stringField(form, "section", 20);
    if (!(["hook", "body", "cta"] as const).includes(section as "hook" | "body" | "cta")) return actionError(context, "Sección inválida.", 422, variantId);
    const validSection = section as "hook" | "body" | "cta";
    const key = stringField(form, "idempotency_key", 200);
    const modelContext = { campaign: { title: campaign.title }, sources: campaign.generation_context?.sources || [], current_variant: structuredVariant(before) };
    const hash = stableHash({ operation: "regenerate_section", draft_id: variantId, section: validSection, modelContext });
    const begun = await context.service.rpc("begin_social_generation", { target_campaign_id: campaignId, target_draft_id: variantId, target_operation: "regenerate_section", target_stage: "drafting", target_section: validSection, target_idempotency_key: key, target_request_hash: hash, target_model: process.env.CONTENT_TEXT_MODEL || "gpt-5.6-terra", target_created_by: context.userId });
    if (begun.error) return actionError(context, "No se pudo iniciar la regeneración.", 409, variantId);
    const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
    if (run.status !== "succeeded") {
      try {
        await context.service.from("social_generation_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", run.id);
        const generated = await regenerateSocialSection(modelContext, structuredVariant(before), validSection);
        const next = { ...structuredVariant(before), [validSection]: generated.value.text, evidence_refs: generated.value.evidence_refs || before.evidence_refs, quality_flags: generated.value.quality_flags || [] };
        const qualityFlags = deterministicQualityFlags(next, campaign.generation_context?.sources || [], before.media_strategy);
        const changes = { [validSection]: generated.value.text, content: composeSocialContent(next), evidence_refs: next.evidence_refs, quality_flags: qualityFlags, status: "draft", rejection_reason: null, generation_metadata: { ...before.generation_metadata, media_stale: Boolean(before.generation_metadata?.media_stale) || shouldInvalidateSocialMedia(before, next), last_regeneration_run_id: run.id, last_regenerated_section: validSection, version_actor_id: context.userId } };
        const update = await context.service.from("content_distribution_drafts").update(changes).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("*").maybeSingle();
        if (!update.data) throw new Error("generation_conflict");
        const completedAt = new Date().toISOString();
        await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", usage: { drafting: generated.draftingUsage, critic: generated.usage }, request_id: generated.requestId, result_summary: { section: validSection }, completed_at: completedAt, ...(contentQualityEnabled() ? buildRunTelemetry({ drafting: { usage: generated.draftingUsage, requestId: generated.draftingRequestId, durationMs: generated.draftingDurationMs }, critic: { usage: generated.usage, requestId: generated.requestId, durationMs: generated.durationMs } }, run.started_at || completedAt, completedAt) : {}) }).eq("id", run.id);
        await audit(context, { action: "regenerate_section", entityType: "distribution_draft", entityId: variantId, before: { section: validSection }, after: { section: validSection, run_id: run.id } });
      } catch (error) {
        const completedAt = new Date().toISOString();
        const raw = error instanceof Error ? error.message : "generation_failed";
        const code = ["model_timeout", "model_rate_limited", "model_unavailable", "invalid_model_response", "invalid_generated_variant"].includes(raw) ? raw : "generation_failed";
        const requestId = typeof (error as { requestId?: unknown })?.requestId === "string" ? String((error as { requestId: string }).requestId) : "";
        await context.service.from("social_generation_runs").update({ status: "failed", error_code: code, error_message: "No se pudo regenerar la sección.", completed_at: completedAt, ...(contentQualityEnabled() ? { retryable: isRetryableGenerationError(code), request_id: requestId || null, request_trace: requestId ? { [run.stage || "drafting"]: requestId } : {}, duration_ms: run.started_at ? Math.max(0, Date.parse(completedAt) - Date.parse(run.started_at)) : null } : {}) }).eq("id", run.id);
        return actionError(context, "No se pudo regenerar la sección. El contenido anterior sigue intacto.", 502, variantId);
      }
    }
    throw redirect(detailUrl(campaignId, variantId, "regenerate", returnTo), { headers: operationsHeaders(context.headers) });
  }

  let changes: Record<string, unknown>;
  let auditAction: string;
  if (intent === "save_variant") {
    if (before.status === "published") return actionError(context, "Deshacé el estado publicado antes de editar el contenido.", 409, variantId);
    if (before.status === "archived") return actionError(context, "Una variante archivada no se puede editar.", 409, variantId);
    const hook = stringField(form, "hook", 4000); const body = stringField(form, "body", 10_000); const cta = stringField(form, "cta", 4000); const hashtags = parseHashtags(stringField(form, "hashtags", 1000), before.channel); const imageHeadline = stringField(form, "image_headline", 120); const imageAlt = stringField(form, "image_alt", 500);
    const generated = { ...structuredVariant(before), hook, body, cta, hashtags, image_headline: imageHeadline, image_alt: imageAlt };
    const content = composeSocialContent(generated);
    const contentError = validateSocialContent(before.channel, content);
    if (contentError) return actionError(context, "Corregí el contenido antes de guardar.", 422, variantId, { content: contentError });
    if (before.media_strategy !== "text_only" && !imageAlt) return actionError(context, "Agregá texto alternativo para la pieza visual.", 422, variantId, { image_alt: "El texto alternativo es obligatorio cuando existe una imagen." });
    const qualityFlags = deterministicQualityFlags(generated, campaign.generation_context?.sources || [], before.media_strategy);
    changes = { hook, body, cta, hashtags, image_headline: imageHeadline || null, image_alt: imageAlt || null, content, quality_flags: qualityFlags, content_type: "structured", generation_metadata: { ...before.generation_metadata, media_stale: Boolean(before.generation_metadata?.media_stale) || shouldInvalidateSocialMedia(before, generated) }, ...(before.status === "approved" || before.status === "rejected" ? { status: "draft", rejection_reason: null } : {}) };
    auditAction = "save";
  } else if (intent === "approve_variant") {
    if (!['draft', 'rejected'].includes(before.status) || !canTransitionSocialDraft(before.status, "approved")) return actionError(context, "Sólo se pueden aprobar borradores o variantes rechazadas.", 409, variantId);
    const visualError = await visualApprovalError(context.service, campaign, before); if (visualError) return actionError(context, visualError, 422, variantId, { content: visualError });
    if (contentQualityEnabled()) {
      if (!contentQualityConfigurationValid()) return actionError(context, "Configurá las tarifas del modelo antes de usar la revisión de calidad.", 503, variantId);
      let review;
      try { review = await prepareQualityReview(context.service, context.userId, campaign, before); }
      catch { return actionError(context, "No se pudo completar la revisión editorial. Intentá nuevamente.", 502, variantId); }
      const blocking = review.flags.find((flag) => flag.severity === "blocking");
      if (blocking) return actionError(context, "Corregí el contenido antes de aprobar.", 422, variantId, { content: blocking.message }, { qualityMatches: review.duplicateMatches });
      const warnings = review.flags.filter((flag) => flag.severity === "warning");
      if (warnings.length && form.get("confirm_warnings") !== "yes") return actionError(context, "La variante tiene advertencias que requieren confirmación.", 409, variantId, undefined, { pendingQuality: { scope: "variant", variantId, updatedAt: expectedUpdatedAt, warnings }, qualityMatches: review.duplicateMatches });
      changes = { status: "approved", rejection_reason: null, quality_flags: review.flags, quality_scorecard: review.scores, quality_review_hash: review.content_hash, quality_reviewed_at: review.reviewedAt, quality_review_run_id: review.runId };
    } else {
      const contentError = validateSocialContent(before.channel, before.content) || blockingQualityMessage(qualityFor(before, campaign));
      if (contentError) return actionError(context, "Corregí el contenido antes de aprobar.", 422, variantId, { content: contentError });
      changes = { status: "approved", rejection_reason: null };
    }
    auditAction = "approve";
  } else if (intent === "reject_variant") {
    if (!canTransitionSocialDraft(before.status, "rejected")) return actionError(context, "Esta variante no se puede rechazar desde su estado actual.", 409, variantId);
    const rejectionReason = stringField(form, "rejection_reason", 1100);
    const reasonError = validateRejectionReason(rejectionReason);
    if (reasonError) return actionError(context, "Explicá cómo corregir la variante.", 422, variantId, { rejection_reason: reasonError });
    changes = { status: "rejected", rejection_reason: rejectionReason };
    auditAction = "reject";
  } else if (intent === "mark_published") {
    if (!canTransitionSocialDraft(before.status, "published")) return actionError(context, "Sólo una variante aprobada o programada puede marcarse como publicada.", 409, variantId);
    const publicationUrl = stringField(form, "publication_url", 1000);
    if (!isAllowedManualPublicationUrl(publicationUrl)) return actionError(context, "Ingresá la URL HTTPS de la publicación en LinkedIn, Instagram, X o Twitter.", 422, variantId, { publication_url: "La URL debe pertenecer a una plataforma admitida." });
    changes = { status: "published", published_at: new Date().toISOString(), rejection_reason: null, generation_metadata: { ...before.generation_metadata, manual_performance: { publication_url: publicationUrl, snapshots: {} } } };
    auditAction = "mark_published";
  } else if (intent === "undo_published") {
    if (before.status !== "published" || !canTransitionSocialDraft(before.status, "approved")) return actionError(context, "La variante no está marcada como publicada.", 409, variantId);
    changes = { status: "approved", published_at: null, scheduled_for: null, rejection_reason: null };
    auditAction = "undo_published";
  } else if (intent === "archive_variant") {
    if (!canTransitionSocialDraft(before.status, "archived")) return actionError(context, "La variante ya está archivada.", 409, variantId);
    changes = { status: "archived", rejection_reason: null };
    auditAction = "archive";
  } else {
    return actionError(context, "Acción inválida.", 400, variantId);
  }

  changes.generation_metadata = { ...before.generation_metadata, ...((changes.generation_metadata && typeof changes.generation_metadata === "object") ? changes.generation_metadata as Record<string, unknown> : {}), version_actor_id: context.userId };
  const updateResult = await context.service.from("content_distribution_drafts").update(changes).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("*").maybeSingle();
  if (updateResult.error) return actionError(context, "No se pudo guardar la variante. Revisá los campos e intentá otra vez.", 400, variantId);
  if (!updateResult.data) return actionError(context, "Esta variante cambió mientras la editabas. Recargá antes de continuar.", 409, variantId);
  await audit(context, { action: auditAction, entityType: "distribution_draft", entityId: variantId, before: { status: before.status, channel: before.channel, locale: before.locale, content_length: before.content.length }, after: { status: updateResult.data.status, content_length: String(updateResult.data.content || "").length } });
  throw redirect(detailUrl(campaignId, variantId, auditAction, returnTo), { headers: operationsHeaders(context.headers) });
}

const savedMessages: Record<string, string> = {
  save: "Cambios guardados. Si la variante estaba aprobada o rechazada, volvió a borrador.",
  approve: "Variante aprobada. Todavía no fue publicada.",
  reject: "Variante rechazada con un motivo registrado.",
  mark_published: "Publicación manual registrada.",
  undo_published: "La marca de publicación se deshizo; la variante volvió a aprobada.",
  archive: "Variante archivada.",
  regenerate: "Sección regenerada y revisada. La variante volvió a borrador.",
  render: "Pieza visual recompuesta con el título guardado.",
  carousel: "Carrusel guardado. Recomponé sus medios antes de aprobar.",
  reel: "Storyboard guardado. El MP4 y la portada deben recomponerse.",
  "reel-sources": "Hay tres clips nuevos para elegir en esta escena.",
  "reel-clip": "Clip seleccionado e importado. Nada fue publicado.",
  "reel-render": "El render está en proceso. Comprobá el estado en unos momentos.",
  "reel-ready": "MP4 y portada listos para descargar y revisar.",
  schedule: "Variante programada. Esto no publica automáticamente.",
  reschedule: "Horario actualizado en hora de Buenos Aires.",
  unschedule: "Programación eliminada; la variante volvió a aprobada.",
  restore: "La versión se restauró como un nuevo borrador.",
  cta: "Destino del CTA actualizado.",
  "campaign-approved": "Campaña aprobada. Ninguna variante fue publicada ni programada.",
};

function evidenceText(slide: SocialCarouselSlide) { return slide.evidence_refs.map((ref) => `${ref.claim} | ${ref.source_key}`).join("\n"); }
function CarouselEditor({ variant, campaign, assets, urls, documentUrl, readOnly }: { key?: string; variant: SocialVariant; campaign: Campaign; assets: Array<{ id: string; title: string }>; urls: string[]; documentUrl: string | null; readOnly: boolean }) {
  const initial = parseCarouselSlides(variant.carousel_slides || []);
  const [slides, setSlides] = useState(initial); const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = slides[selectedIndex]; const preset = campaign.generation_context?.visual?.preset_key || "editorial";
  const update = (changes: Partial<SocialCarouselSlide>) => setSlides((current) => current.map((slide, index) => index === selectedIndex ? { ...slide, ...changes } : slide));
  const parseEvidence = (value: string) => value.split(/\r?\n/).flatMap((line) => { const split = line.lastIndexOf("|"); return split > 0 ? [{ claim: line.slice(0, split).trim(), source_key: line.slice(split + 1).trim() }].filter((ref) => ref.claim && ref.source_key) : []; });
  const addSlide = () => { if (slides.length >= 7) return; const index = slides.length - 1; const slide: SocialCarouselSlide = { id: crypto.randomUUID(), role: "content", eyebrow: "", headline: "Nueva idea", body: "", bullets: [], emphasis: null, evidence_refs: [], asset_id: null, alt_text: "Placa de contenido de Puna Tech." }; setSlides((current) => [...current.slice(0, index), slide, ...current.slice(index)]); setSelectedIndex(index); };
  const duplicate = () => { if (slides.length >= 7) return; const index = Math.min(Math.max(1, selectedIndex + 1), slides.length - 1); const slide = { ...selected, id: crypto.randomUUID(), role: "content" as const }; setSlides((current) => [...current.slice(0, index), slide, ...current.slice(index)]); setSelectedIndex(index); };
  const remove = () => { if (slides.length <= 3 || selected.role !== "content") return; setSlides((current) => current.filter((_, index) => index !== selectedIndex)); setSelectedIndex(Math.max(0, selectedIndex - 1)); };
  const move = (direction: -1 | 1) => { const target = selectedIndex + direction; if (selected.role !== "content" || target < 1 || target > slides.length - 2) return; setSlides((current) => { const next = [...current]; [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]]; return next; }); setSelectedIndex(target); };
  const dirty = JSON.stringify(slides) !== JSON.stringify(initial);
  return <section className="ops-carousel-editor" aria-labelledby="carousel-editor-title"><header><div><p className="ops-eyebrow">Pieza multipágina</p><h3 id="carousel-editor-title">Carrusel · {slides.length} placas</h3></div>{variant.rendered_visual_hash ? <StatusBadge value="active"/> : <StatusBadge value="warning"/>}</header>
    <nav className="ops-slide-tabs" aria-label="Elegir placa">{slides.map((slide, index) => <button type="button" className={index === selectedIndex ? "active" : ""} aria-current={index === selectedIndex ? "step" : undefined} onClick={() => setSelectedIndex(index)} key={slide.id}><span>{index + 1}</span>{slide.role === "cover" ? "Portada" : slide.role === "cta" ? "Cierre" : "Contenido"}</button>)}</nav>
    <div className="ops-carousel-workspace"><div className="ops-carousel-preview">{urls[selectedIndex] ? <img src={urls[selectedIndex]} alt={selected.alt_text}/> : <div className={`ops-preset-preview is-${preset}`}><span>{selected.eyebrow || `${selectedIndex + 1} / ${slides.length}`}</span>{selected.emphasis ? <b>{selected.emphasis}</b> : null}<strong>{selected.headline}</strong><p>{selected.body}</p></div>}<small>{urls[selectedIndex] ? "Render actual" : "Vista previa editorial; falta componer"}</small></div>
      <div className="ops-carousel-fields"><label className="ops-field"><span>Antetítulo</span><input value={selected.eyebrow} maxLength={40} onChange={(event) => update({ eyebrow: event.target.value })} readOnly={readOnly}/><small>{selected.eyebrow.length}/40</small></label><label className="ops-field"><span>Título</span><textarea value={selected.headline} maxLength={100} rows={3} onChange={(event) => update({ headline: event.target.value })} readOnly={readOnly}/><small>{selected.headline.length}/100</small></label>{preset === "evidence" ? <label className="ops-field"><span>Dato destacado</span><input value={selected.emphasis || ""} maxLength={40} onChange={(event) => update({ emphasis: event.target.value || null })} readOnly={readOnly}/></label> : null}<label className="ops-field"><span>Desarrollo</span><textarea value={selected.body} maxLength={260} rows={4} onChange={(event) => update({ body: event.target.value })} readOnly={readOnly}/><small>{selected.body.length}/260</small></label><label className="ops-field"><span>Bullets, uno por línea</span><textarea value={selected.bullets.join("\n")} rows={4} onChange={(event) => update({ bullets: event.target.value.split(/\r?\n/).slice(0, 4) })} readOnly={readOnly}/></label><label className="ops-field"><span>Evidencia: afirmación | clave</span><textarea value={evidenceText(selected)} rows={3} onChange={(event) => update({ evidence_refs: parseEvidence(event.target.value) })} readOnly={readOnly}/></label><label className="ops-field"><span>Imagen aprobada</span><select value={selected.asset_id || ""} onChange={(event) => update({ asset_id: event.target.value || null })} disabled={readOnly}><option value="">Usar la imagen general</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.title}</option>)}</select></label><label className="ops-field"><span>Texto alternativo</span><textarea value={selected.alt_text} maxLength={500} rows={3} onChange={(event) => update({ alt_text: event.target.value })} readOnly={readOnly}/></label></div></div>
    {!readOnly ? <div className="ops-carousel-toolbar"><button type="button" className="ops-inline-action" onClick={() => move(-1)} disabled={selected.role !== "content" || selectedIndex <= 1}><ArrowUp size={15}/>Mover antes</button><button type="button" className="ops-inline-action" onClick={() => move(1)} disabled={selected.role !== "content" || selectedIndex >= slides.length - 2}><ArrowDown size={15}/>Mover después</button><button type="button" className="ops-inline-action" onClick={duplicate} disabled={slides.length >= 7}><Copy size={15}/>Duplicar</button><button type="button" className="ops-inline-action" onClick={addSlide} disabled={slides.length >= 7}><Plus size={15}/>Agregar</button><button type="button" className="ops-inline-action is-danger" onClick={remove} disabled={slides.length <= 3 || selected.role !== "content"}><Trash2 size={15}/>Quitar</button></div> : null}
    {!readOnly ? <div className="ops-carousel-actions"><Form method="post"><input type="hidden" name="intent" value="save_carousel"/><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><input type="hidden" name="carousel_slides" value={JSON.stringify(slides)}/><button className="ops-button" disabled={!dirty}><Save size={16}/>Guardar carrusel</button></Form><Form method="post"><input type="hidden" name="intent" value="regenerate_carousel_slide"/><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><input type="hidden" name="slide_index" value={selectedIndex}/><input type="hidden" name="idempotency_key" value={`carousel:${variant.id}:${variant.updated_at}:${selectedIndex}`}/><button className="ops-button ops-button-secondary" disabled={dirty}><Sparkles size={16}/>Regenerar esta placa</button></Form></div> : null}
    <div className="ops-carousel-downloads">{urls.map((url, index) => <a href={url} target="_blank" rel="noreferrer" key={url}><Download size={15}/>Placa {index + 1}</a>)}{documentUrl ? <a href={documentUrl}><Download size={15}/>PDF para LinkedIn</a> : null}</div>
  </section>;
}

function reelEvidenceText(scene: SocialReelScene) { return scene.evidence_refs.map((ref) => `${ref.claim} | ${ref.source_key}`).join("\n"); }
function ManualMetricsPanel({ variant, error }: { variant: SocialVariant; error?: string }) {
  const performance = (variant.generation_metadata?.manual_performance || {}) as { publication_url?: string; snapshots?: Record<string, Record<string, number | string | null>> };
  return <section className="ops-manual-metrics" aria-labelledby="manual-metrics-title"><header><div><p className="ops-eyebrow">Resultados declarados</p><h3 id="manual-metrics-title">Performance manual</h3></div>{performance.publication_url ? <a href={performance.publication_url} target="_blank" rel="noreferrer"><ExternalLink size={15}/>Abrir publicación</a> : null}</header><p>Registrá sólo datos observados en la plataforma. Los valores desconocidos quedan vacíos y no se atribuye causalidad.</p>{error ? <small className="ops-field-error" role="alert">{error}</small> : null}<div className="ops-manual-metrics-grid">{(["d7", "d30"] as const).map((period) => { const snapshot = performance.snapshots?.[period] || {}; return <Form method="post" className="ops-form" key={period}><input type="hidden" name="intent" value="save_manual_metrics"/><input type="hidden" name="metric_period" value={period}/><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><h4>{period.toUpperCase()}</h4><div className="ops-metric-fields">{manualMetricFields.map((field) => <label className="ops-field" key={field}><span>{field === "reach" ? "Alcance" : field === "impressions" ? "Impresiones" : field === "reactions" ? "Reacciones" : field === "comments" ? "Comentarios" : field === "shares" ? "Compartidos" : field === "saves" ? "Guardados" : "Clics"}</span><input type="number" name={field} min="0" step="1" defaultValue={snapshot[field] == null ? "" : String(snapshot[field])}/></label>)}</div><button className="ops-button ops-button-secondary">Guardar {period.toUpperCase()}</button></Form>; })}</div></section>;
}

function ReelEditor({ variant, videoUrl, coverUrl, readOnly }: { key?: string; variant: SocialVariant; videoUrl: string | null; coverUrl: string | null; readOnly: boolean }) {
  const initial = parseReelScenes(variant.reel_scenes || []); const [scenes, setScenes] = useState(initial); const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = scenes[selectedIndex]; const candidates = variant.reel_provider_metadata?.candidates?.[selected.id] || []; const imported = variant.reel_provider_metadata?.imported_clips?.[selected.id];
  const update = (changes: Partial<SocialReelScene>) => setScenes((current) => current.map((scene, index) => index === selectedIndex ? { ...scene, ...changes } : scene));
  const parseEvidence = (value: string) => value.split(/\r?\n/).flatMap((line) => { const split = line.lastIndexOf("|"); return split > 0 ? [{ claim: line.slice(0, split).trim(), source_key: line.slice(split + 1).trim() }].filter((ref) => ref.claim && ref.source_key) : []; });
  const dirty = JSON.stringify(scenes) !== JSON.stringify(initial); const allReady = scenes.every((scene) => scene.selected_candidate_key && variant.reel_provider_metadata?.imported_clips?.[scene.id]?.candidate_key === scene.selected_candidate_key);
  const importedCount = scenes.filter((scene) => variant.reel_provider_metadata?.imported_clips?.[scene.id]?.candidate_key === scene.selected_candidate_key).length;
  const renderStarted = Boolean(variant.reel_provider_metadata?.render?.run_id);
  const renderReady = Boolean(videoUrl && coverUrl && variant.rendered_visual_hash);
  const progress = [
    { label: `Importando clips · ${importedCount}/5`, done: allReady, active: !allReady },
    { label: "Componiendo escenas", done: renderStarted, active: allReady && !renderStarted },
    { label: "Ensamblando", done: renderReady, active: renderStarted && !renderReady },
    { label: "Creando portada", done: Boolean(coverUrl), active: renderStarted && !coverUrl },
    { label: "Listo", done: renderReady, active: false },
  ];
  const roleLabel = { hook: "Gancho", problem: "Problema", insight: "Idea", cta: "Cierre" } as const;
  return <section className="ops-reel-editor" aria-labelledby="reel-editor-title"><header><div><p className="ops-eyebrow">Video vertical · publicación manual</p><h3 id="reel-editor-title"><Video size={19}/>Reel · 5 escenas · {reelDuration(scenes)} segundos</h3></div>{videoUrl && coverUrl && variant.rendered_visual_hash ? <StatusBadge value="active"/> : <StatusBadge value="warning"/>}</header>
    <nav className="ops-slide-tabs" aria-label="Elegir escena">{scenes.map((scene, index) => <button type="button" className={index === selectedIndex ? "active" : ""} aria-current={index === selectedIndex ? "step" : undefined} onClick={() => setSelectedIndex(index)} key={scene.id}><span>{index + 1}</span>{roleLabel[scene.role]}<small>{scene.duration_seconds}s</small></button>)}</nav>
    <div className="ops-reel-workspace"><div className="ops-reel-scene-preview"><span>{selected.eyebrow}</span><strong>{selected.headline}</strong><p>{selected.supporting_text}</p><small>Escena {selectedIndex + 1} de 5 · sin audio</small></div><div className="ops-reel-fields"><label className="ops-field"><span>Antetítulo</span><input value={selected.eyebrow} maxLength={40} onChange={(event) => update({ eyebrow: event.target.value })} readOnly={readOnly}/></label><label className="ops-field"><span>Título cinético</span><textarea value={selected.headline} maxLength={72} rows={2} onChange={(event) => update({ headline: event.target.value })} readOnly={readOnly}/><small>{selected.headline.length}/72</small></label><label className="ops-field"><span>Texto auxiliar</span><textarea value={selected.supporting_text} maxLength={140} rows={3} onChange={(event) => update({ supporting_text: event.target.value })} readOnly={readOnly}/><small>{selected.supporting_text.length}/140</small></label><label className="ops-field"><span>Duración</span><select value={selected.duration_seconds} onChange={(event) => update({ duration_seconds: Number(event.target.value) })} disabled={readOnly}>{[3,4,5,6].map((seconds) => <option value={seconds} key={seconds}>{seconds} segundos</option>)}</select></label><label className="ops-field"><span>Búsqueda visual</span><input value={selected.search_query} maxLength={100} onChange={(event) => update({ search_query: event.target.value })} readOnly={readOnly}/></label><label className="ops-field"><span>Evidencia: afirmación | clave</span><textarea value={reelEvidenceText(selected)} rows={3} onChange={(event) => update({ evidence_refs: parseEvidence(event.target.value) })} readOnly={readOnly}/></label><label className="ops-field"><span>Texto alternativo</span><textarea value={selected.alt_text} maxLength={500} rows={3} onChange={(event) => update({ alt_text: event.target.value })} readOnly={readOnly}/></label></div></div>
    {!readOnly ? <div className="ops-reel-actions"><Form method="post"><input type="hidden" name="intent" value="save_reel_storyboard"/><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><input type="hidden" name="reel_scenes" value={JSON.stringify(scenes)}/><button className="ops-button" disabled={!dirty}><Save size={16}/>Guardar storyboard</button></Form><Form method="post"><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><input type="hidden" name="scene_id" value={selected.id}/><button className="ops-button ops-button-secondary" name="intent" value="refresh_reel_sources" disabled={dirty}><RefreshCw size={16}/>{candidates.length ? "Renovar tres clips" : "Buscar tres clips"}</button></Form></div> : null}
    <div className="ops-reel-candidates" aria-label={`Clips para escena ${selectedIndex + 1}`}>{candidates.length ? candidates.map((candidate) => <article className={selected.selected_candidate_key === candidate.key ? "is-selected" : ""} key={candidate.key}><video src={candidate.preview_url} muted playsInline controls preload="metadata" aria-label={`Clip de ${candidate.creator_name}`}/><div><a href={candidate.page_url} target="_blank" rel="noreferrer"><ExternalLink size={14}/>{candidate.creator_name} en Pexels</a><small>{candidate.width}×{candidate.height} · {candidate.duration_seconds}s</small>{!readOnly ? <Form method="post"><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><input type="hidden" name="scene_id" value={selected.id}/><input type="hidden" name="candidate_key" value={candidate.key}/><button className="ops-inline-action" name="intent" value="select_reel_candidate" disabled={dirty || imported?.candidate_key === candidate.key}>{imported?.candidate_key === candidate.key ? <><Check size={15}/>Elegido</> : "Elegir e importar"}</button></Form> : null}</div></article>) : <Notice>Buscá tres clips para esta escena. La consulta se realiza desde el servidor y nunca acepta una URL enviada por el navegador.</Notice>}</div>
    <section className="ops-reel-output"><div><h4>Salida manual</h4><p>{allReady ? "Los cinco clips están importados. Ya podés ensamblar el MP4 y crear la portada." : "Elegí e importá un clip por escena antes de renderizar."}</p><ol aria-label="Progreso del reel">{progress.map((step) => <li className={step.done ? "is-done" : step.active ? "is-active" : ""} aria-current={step.active ? "step" : undefined} key={step.label}>{step.done ? <Check size={13}/> : null}{step.label}</li>)}</ol></div>{!readOnly ? <div><Form method="post"><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><button className="ops-button" name="intent" value="render_reel" disabled={dirty || !allReady}><Video size={16}/>Renderizar reel</button></Form>{variant.reel_provider_metadata?.render?.run_id && !videoUrl ? <Form method="post"><input type="hidden" name="variant_id" value={variant.id}/><input type="hidden" name="updated_at" value={variant.updated_at}/><button className="ops-button ops-button-secondary" name="intent" value="check_reel_render"><RefreshCw size={16}/>Comprobar estado</button></Form> : null}</div> : null}</section>
    {videoUrl || coverUrl ? <div className="ops-reel-downloads">{videoUrl ? <><video src={videoUrl} poster={coverUrl || undefined} muted playsInline controls preload="none" aria-label="Vista previa del reel renderizado"/><a className="ops-inline-action" href={`${videoUrl}?download=1`}><Download size={15}/>Descargar MP4 1080×1920</a><small>Si no reproduce en este navegador, descargá el MP4 y abrilo en un reproductor de video.</small></> : null}{coverUrl ? <><img src={coverUrl} alt={variant.image_alt || "Portada del reel"}/><a className="ops-inline-action" href={coverUrl}><Download size={15}/>Descargar portada JPEG</a></> : null}<button type="button" className="ops-inline-action" onClick={() => navigator.clipboard.writeText(variant.content)}><Copy size={15}/>Copiar caption</button></div> : null}
    <details className="ops-reel-attribution"><summary>Atribuciones de clips</summary><ul>{scenes.flatMap((scene) => (variant.reel_provider_metadata?.candidates?.[scene.id] || []).filter((candidate) => candidate.key === scene.selected_candidate_key)).map((candidate) => <li key={candidate.key}><a href={candidate.page_url} target="_blank" rel="noreferrer">Video de {candidate.creator_name} en Pexels</a></li>)}</ul></details>
  </section>;
}

export default function OpsSocialDetail({ loaderData, actionData }: { loaderData: { campaign: Campaign; variants: SocialVariant[]; versions: VariantVersion[]; selectedId: string | null; mediaUrl: string | null; mediaDownloadUrl: string | null; slideUrls: string[]; documentUrl: string | null; reelVideoUrl: string | null; reelCoverUrl: string | null; assets: Array<{ id: string; title: string }>; composerEnabled: boolean; visualEnabled: boolean; reelsEnabled: boolean; calendarEnabled: boolean; qualityEnabled: boolean; returnTo: string; today: string; saved: string; versionA: string; versionB: string }; actionData?: ActionData }) {
  const selected = loaderData.variants.find((variant) => variant.id === loaderData.selectedId) || null;
  const [sections, setSections] = useState(() => ({ hook: selected?.hook || "", body: selected?.body ?? selected?.content ?? "", cta: selected?.cta || "", hashtags: (selected?.hashtags || []).join(" "), image_headline: selected?.image_headline || "", image_alt: selected?.image_alt || "" }));
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => setSections({ hook: selected?.hook || "", body: selected?.body ?? selected?.content ?? "", cta: selected?.cta || "", hashtags: (selected?.hashtags || []).join(" "), image_headline: selected?.image_headline || "", image_alt: selected?.image_alt || "" }), [selected?.id, selected?.updated_at]);
  useEffect(() => { if (actionData?.error) errorRef.current?.focus(); }, [actionData?.error]);
  const currentContent = selected ? composeSocialContent({ ...structuredVariant(selected), ...sections, hashtags: parseHashtags(sections.hashtags, selected.channel as GeneratedSocialVariant["channel"]) }) : "";
  const dirty = Boolean(selected && (sections.hook !== (selected.hook || "") || sections.body !== (selected.body ?? selected.content) || sections.cta !== (selected.cta || "") || sections.hashtags !== (selected.hashtags || []).join(" ") || sections.image_headline !== (selected.image_headline || "") || sections.image_alt !== (selected.image_alt || "")));
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const characterCount = countSocialCharacters(currentContent);
  const limit = selected && isSocialChannel(selected.channel) ? SOCIAL_CHANNEL_LIMITS[selected.channel] : 0;
  const contentError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.content : undefined;
  const reasonError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.rejection_reason : undefined;
  const altError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.image_alt : undefined;
  const canApproveCampaign = loaderData.variants.some((variant) => variant.status === "draft" || variant.status === "rejected");
  const readOnly = selected?.status === "published" || selected?.status === "archived";
  const liveQualityFlags = selected ? qualityFor({ ...selected, hook: sections.hook, body: sections.body, cta: sections.cta, hashtags: parseHashtags(sections.hashtags, selected.channel as GeneratedSocialVariant["channel"]), image_headline: sections.image_headline, image_alt: sections.image_alt, content: currentContent }, loaderData.campaign, loaderData.qualityEnabled) : [];
  const qualityFlags = [...(!dirty && selected?.quality_review_hash ? selected.quality_flags : []), ...liveQualityFlags].filter((flag, index, all) => all.findIndex((item) => item.code === flag.code && item.message === flag.message) === index);
  const updateSection = (field: keyof typeof sections, value: string) => setSections((current) => ({ ...current, [field]: value }));

  return <>
    <Link className="ops-back" to={loaderData.returnTo || "/ops/social"}><ArrowLeft aria-hidden="true" size={16}/>{loaderData.returnTo ? "Volver al calendario" : "Volver a Social Studio"}</Link>
    <OpsPageHeader eyebrow="Campaña social" title={loaderData.campaign.title} description="Revisá el copy por separado. Las decisiones quedan registradas y aprobar nunca publica." action={<Form method="post"><input type="hidden" name="intent" value="approve_campaign"/><input type="hidden" name="campaign_updated_at" value={loaderData.campaign.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-button" type="submit" disabled={!canApproveCampaign || dirty} onClick={(event) => { if (!window.confirm("¿Aprobar todas las variantes pendientes de esta campaña? Esto no publica nada.")) event.preventDefault(); }}><Check aria-hidden="true" size={17}/>Aprobar campaña</button></Form>}/>
    {loaderData.saved && savedMessages[loaderData.saved] ? <Notice tone="success">{savedMessages[loaderData.saved]}</Notice> : null}
    {actionData?.error ? <div ref={errorRef} className="ops-notice ops-notice-error" role="alert" tabIndex={-1}>{actionData.error}</div> : null}
    {actionData?.qualityMatches?.length ? <section className="ops-quality-matches" aria-labelledby="quality-matches-title"><h2 id="quality-matches-title">Contenido coincidente</h2>{actionData.qualityMatches.map((match) => <article key={match.id}><div><strong>{match.campaignTitle}</strong><small>{socialChannelLabel(match.channel)} · {formatDate(match.occurredAt, true)} · {Math.round(match.similarity * 100)}% de coincidencia</small></div><Link to={`/ops/social/${match.campaignId}?variant=${match.id}`}>Abrir contenido</Link></article>)}</section> : null}
    {actionData?.pendingQuality ? <section className="ops-quality-confirm" aria-labelledby="quality-confirm-title"><ShieldCheck aria-hidden="true"/><div><h2 id="quality-confirm-title">Confirmar advertencias editoriales</h2><ul>{actionData.pendingQuality.warnings.map((warning, index) => <li key={`${warning.code}-${index}`}>{warning.message}</li>)}</ul><Form method="post"><input type="hidden" name="intent" value={actionData.pendingQuality.scope === "campaign" ? "approve_campaign" : "approve_variant"}/><input type="hidden" name="return_to" value={loaderData.returnTo}/>{actionData.pendingQuality.scope === "campaign" ? <input type="hidden" name="campaign_updated_at" value={actionData.pendingQuality.campaignUpdatedAt}/> : <><input type="hidden" name="variant_id" value={actionData.pendingQuality.variantId}/><input type="hidden" name="updated_at" value={actionData.pendingQuality.updatedAt}/></>}<input type="hidden" name="confirm_warnings" value="yes"/><button className="ops-button" type="submit">Aprobar con advertencias</button></Form></div></section> : null}
    {actionData?.pendingSchedule ? <section className="ops-calendar-conflict" aria-labelledby="social-schedule-conflict-title"><Clock3 aria-hidden="true"/><div><h2 id="social-schedule-conflict-title">Confirmar horario con colisión</h2>{actionData.conflicts?.map((item) => <p key={item.id}><strong>{item.campaign_title}</strong> · {formatCalendarDateTime(item.scheduled_for)}</p>)}<Form method="post"><input type="hidden" name="intent" value={selected?.status === "scheduled" ? "reschedule_variant" : "schedule_variant"}/><input type="hidden" name="variant_id" value={actionData.pendingSchedule.variantId}/><input type="hidden" name="updated_at" value={actionData.pendingSchedule.updatedAt}/><input type="hidden" name="scheduled_for" value={actionData.pendingSchedule.localScheduledFor}/><input type="hidden" name="return_to" value={actionData.pendingSchedule.returnTo}/><input type="hidden" name="confirm_conflict" value="yes"/><button className="ops-button" type="submit">Programar igualmente</button></Form></div></section> : null}

    {loaderData.qualityEnabled ? <section className="ops-cta-config"><div><p className="ops-eyebrow">Destino verificable</p><h2>CTA de la campaña</h2><p>{["audit", "service", "article"].includes(loaderData.campaign.cta_type || "") ? "Esta campaña requiere una URL HTTPS antes de aprobar." : "Para conversación o sin CTA, el enlace puede quedar vacío."}</p></div><Form method="post" className="ops-form"><input type="hidden" name="intent" value="save_campaign_cta"/><input type="hidden" name="campaign_updated_at" value={loaderData.campaign.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><label className="ops-field"><span>Destino HTTPS</span><input name="cta_url" type="url" defaultValue={loaderData.campaign.cta_url || ""} placeholder="https://www.puna-tech.com/…"/></label><button className="ops-button ops-button-secondary" type="submit">Guardar destino</button></Form></section> : null}
    <div className="ops-social-review">
      <aside className="ops-variant-panel" aria-label="Variantes de la campaña">
        <div className="ops-variant-panel-header"><div><span>Estado general</span><StatusBadge value={loaderData.campaign.status}/></div><small>{loaderData.variants.length} variantes · actualizada {formatDate(loaderData.campaign.updated_at, true)}</small></div>
        <nav className="ops-variant-list" aria-label="Elegir variante">
          {loaderData.variants.map((variant) => <Link key={variant.id} to={detailUrl(loaderData.campaign.id, variant.id, undefined, loaderData.returnTo)} className={variant.id === selected?.id ? "active" : undefined} aria-current={variant.id === selected?.id ? "page" : undefined}><span><Send aria-hidden="true" size={17}/><strong>{socialChannelLabel(variant.channel)}</strong><small>{socialLocaleLabel(variant.locale)}</small></span><StatusBadge value={variant.status}/></Link>)}
        </nav>
        {loaderData.campaign.source_type === "article" ? <Link className="ops-source-link" to={`/ops/content/${loaderData.campaign.source_id}`}><ExternalLink aria-hidden="true" size={16}/>Abrir artículo fuente</Link> : null}
      </aside>

      {selected ? <section className="ops-variant-editor" aria-labelledby="variant-editor-title">
        <header><div><p className="ops-eyebrow">{socialChannelLabel(selected.channel)} · {socialLocaleLabel(selected.locale)}</p><h2 id="variant-editor-title">Copy de la variante</h2></div><StatusBadge value={selected.status}/></header>
        {selected.rejection_reason ? <div className="ops-rejection-note"><strong>Motivo del rechazo</strong><p>{selected.rejection_reason}</p></div> : null}
        {selected.status === "published" ? <Notice>Esta variante es de sólo lectura. Deshacé la marca de publicación para corregirla.</Notice> : null}
        {selected.status === "archived" ? <Notice>Esta variante está archivada y permanece disponible como registro.</Notice> : null}
        {selected.status === "scheduled" ? <Notice>Editar el copy la devuelve a borrador y elimina su programación.</Notice> : null}
        {selected.generation_metadata?.media_stale ? <Notice>El contenido visual cambió. Recomponé el medio antes de aprobar.</Notice> : null}
        <Form method="post" className="ops-form ops-social-copy-form">
          <input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/>
          {([['hook','Gancho',3],['body','Cuerpo',selected.channel === 'x' ? 5 : 10],['cta','CTA',3]] as const).map(([field,label,rows]) => <div className="ops-section-field" key={field}><label className="ops-field"><span>{label}</span><textarea name={field} rows={rows} value={sections[field]} onChange={(event) => updateSection(field, event.target.value)} readOnly={readOnly}/></label></div>)}
          <label className="ops-field"><span>Hashtags</span><input name="hashtags" value={sections.hashtags} onChange={(event) => updateSection("hashtags", event.target.value)} readOnly={readOnly} placeholder="#automatizacion #operaciones"/></label>
          {selected.visual_kind !== "carousel" ? <div className="ops-field-grid"><label className="ops-field"><span>Título visual</span><input name="image_headline" maxLength={120} value={sections.image_headline} onChange={(event) => updateSection("image_headline", event.target.value)} readOnly={readOnly}/><small>{sections.image_headline.length} / 120</small></label><label className="ops-field"><span>Texto alternativo</span><textarea name="image_alt" maxLength={500} rows={3} value={sections.image_alt} onChange={(event) => updateSection("image_alt", event.target.value)} readOnly={readOnly} aria-invalid={Boolean(altError)}/>{altError ? <small className="ops-field-error" role="alert">{altError}</small> : null}</label></div> : <><input type="hidden" name="image_headline" value={sections.image_headline}/><input type="hidden" name="image_alt" value={sections.image_alt}/></>}
          {loaderData.mediaUrl && selected.visual_kind !== "carousel" ? <figure className="ops-generated-media"><img src={loaderData.mediaUrl} alt={selected.image_alt || "Vista previa de la pieza"}/><figcaption><ImageIcon size={15}/>Render final{sections.image_headline !== (selected.image_headline || "") ? " · el título cambió; la imagen todavía no fue recompuesta" : ""}</figcaption>{loaderData.mediaDownloadUrl ? <a className="ops-inline-action" href={loaderData.mediaDownloadUrl}><Download size={15}/>Descargar {selected.channel === "instagram" ? "JPEG" : "PNG"}</a> : null}</figure> : null}
          <div className="ops-visible-opening"><strong>Apertura visible · ~210 caracteres</strong><p>{visibleOpening(currentContent)}</p></div>
          <div className="ops-copy-preview"><strong>Vista previa del copy final</strong><pre>{currentContent}</pre><small id="social-counter" className={characterCount > limit ? "ops-counter is-over" : "ops-counter"} aria-live="polite">{characterCount} / {limit} caracteres{selected.channel === "x" ? " · conteo conservador" : ""}</small>{contentError ? <small id="social-content-error" className="ops-field-error" role="alert">{contentError}</small> : null}</div>
          {qualityFlags.length ? <div className="ops-quality-flags" aria-label="Controles de calidad"><strong>Controles de calidad</strong><ul>{qualityFlags.map((flag, index) => <li className={`is-${flag.severity}`} key={`${flag.code}-${index}`}><StatusBadge value={flag.severity}/>{flag.message}</li>)}</ul></div> : <Notice tone="success">Sin bloqueos automáticos de calidad.</Notice>}
          {loaderData.qualityEnabled && selected.quality_scorecard && "clarity" in selected.quality_scorecard ? <QualityScorecardView scorecard={selected.quality_scorecard as QualityScorecard} reviewedAt={selected.quality_reviewed_at}/> : loaderData.qualityEnabled ? <p className="ops-muted">La puntuación editorial se calculará al aprobar esta versión.</p> : null}
          {selected.original_sections ? <details className="ops-original-copy"><summary>Comparar con la versión generada</summary><pre>{composeSocialContent({ ...structuredVariant(selected), ...(selected.original_sections as Partial<GeneratedSocialVariant>) })}</pre></details> : null}
          <div className="ops-editor-primary"><span>{selected.status === "approved" || selected.status === "rejected" ? "Editar devuelve esta variante a borrador." : "Los cambios se guardan antes de actualizar la pantalla."}</span><button className="ops-button" type="submit" name="intent" value="save_variant" disabled={!dirty || characterCount === 0 || characterCount > limit || selected.status === "published" || selected.status === "archived"}><Save aria-hidden="true" size={17}/>Guardar cambios</button></div>
        </Form>
        {loaderData.visualEnabled && selected.visual_kind === "carousel" ? <CarouselEditor key={`${selected.id}:${selected.updated_at}`} variant={selected} campaign={loaderData.campaign} assets={loaderData.assets} urls={loaderData.slideUrls} documentUrl={loaderData.documentUrl} readOnly={readOnly}/> : null}
        {loaderData.reelsEnabled && selected.visual_kind === "reel" ? <ReelEditor key={`${selected.id}:${selected.updated_at}`} variant={selected} videoUrl={loaderData.reelVideoUrl} coverUrl={loaderData.reelCoverUrl} readOnly={readOnly}/> : null}
        {loaderData.composerEnabled && !readOnly ? <div className="ops-regenerate-row" aria-label="Acciones asistidas">{([['hook','gancho'],['body','cuerpo'],['cta','CTA']] as const).map(([field,label]) => <Form method="post" key={field}><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="section" value={field}/><input type="hidden" name="idempotency_key" value={`regen:${selected.id}:${selected.updated_at}:${field}`}/><button className="ops-inline-action" name="intent" value="regenerate_section" type="submit" disabled={dirty}><Sparkles size={15}/>Regenerar {label}</button></Form>)}{selected.media_strategy !== "text_only" && selected.visual_kind !== "reel" ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="idempotency_key" value={`render:${selected.id}:${selected.updated_at}:${selected.image_headline}:${selected.rendered_visual_hash || "pending"}`}/><button className="ops-inline-action" name="intent" value="render_media" type="submit" disabled={dirty}><ImageIcon size={15}/>{selected.visual_kind === "carousel" ? "Recomponer carrusel" : "Recomponer imagen"}</button></Form> : null}</div> : null}

        {loaderData.calendarEnabled && (selected.status === "approved" || selected.status === "scheduled") ? <section className="ops-schedule-block" aria-labelledby="social-schedule-title">
          <div><p className="ops-eyebrow">Planificación manual</p><h3 id="social-schedule-title">{selected.status === "scheduled" ? "Reprogramar variante" : "Programar variante"}</h3><p><Clock3 size={15}/>Hora de Buenos Aires · programar no publica.</p>{selected.scheduled_for ? <strong>Fecha actual: {formatCalendarDateTime(selected.scheduled_for)}</strong> : null}</div>
          <Form method="post" className="ops-form ops-calendar-schedule-form">
            <input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/>
            <label className="ops-field"><span>Fecha y hora</span><input type="datetime-local" name="scheduled_for" step="900" min={`${loaderData.today}T00:00`} defaultValue={calendarDateTimeInput(selected.scheduled_for)} required/></label>
            <button className="ops-button" type="submit" name="intent" value={selected.status === "scheduled" ? "reschedule_variant" : "schedule_variant"} disabled={dirty}><CalendarClock size={17}/>{selected.status === "scheduled" ? "Reprogramar" : "Programar"}</button>
          </Form>
          {selected.status === "scheduled" ? <div className="ops-schedule-links"><Link to={`/ops/calendar?variant=${selected.id}`}><CalendarClock size={16}/>Ver en calendario</Link><Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-inline-action" type="submit" name="intent" value="unschedule_variant"><RotateCcw size={16}/>Desprogramar</button></Form></div> : null}
        </section> : null}

        {selected.status === "published" ? <ManualMetricsPanel variant={selected} error={actionData?.fieldErrors?.metrics}/> : null}

        <div className="ops-review-actions">
          <div><h3>Decisión editorial</h3><p>Aprobá esta versión, rechazala con instrucciones o registrá una publicación ya realizada manualmente.</p></div>
          <div className="ops-review-buttons">
            {(selected.status === "draft" || selected.status === "rejected") ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="approve_variant" disabled={dirty || Boolean(selected.generation_metadata?.media_stale)}><Check aria-hidden="true" size={17}/>Aprobar variante</button></Form> : null}
            {(selected.status === "approved" || selected.status === "scheduled") ? <Form method="post" className="ops-manual-publish"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><label className="ops-field"><span>URL de la publicación manual</span><input type="url" name="publication_url" required placeholder={`https://${selected.channel === "x" ? "x.com" : `${selected.channel}.com`}/…`} aria-invalid={Boolean(actionData?.fieldErrors?.publication_url)}/>{actionData?.fieldErrors?.publication_url ? <small className="ops-field-error" role="alert">{actionData.fieldErrors.publication_url}</small> : null}</label><button className="ops-button ops-button-secondary" type="submit" name="intent" value="mark_published" disabled={dirty} onClick={(event) => { if (!window.confirm("Confirmá únicamente si ya publicaste esta variante manualmente en la red.")) event.preventDefault(); }}><Send aria-hidden="true" size={17}/>Marcar publicada</button></Form> : null}
            {selected.status === "published" ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="undo_published" onClick={(event) => { if (!window.confirm("¿Deshacer el registro de publicación y volver a aprobado?")) event.preventDefault(); }}><RotateCcw aria-hidden="true" size={17}/>Deshacer publicación</button></Form> : null}
          </div>
          {(selected.status === "draft" || selected.status === "approved" || selected.status === "scheduled") ? <details className="ops-reject-form" open={Boolean(reasonError)}><summary><X aria-hidden="true" size={16}/>Rechazar con motivo</summary><Form method="post" className="ops-form"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><label className="ops-field" htmlFor="rejection-reason"><span>Qué debe corregirse <b aria-hidden="true">*</b></span><textarea id="rejection-reason" name="rejection_reason" minLength={10} maxLength={1000} required rows={4} aria-invalid={Boolean(reasonError)} aria-describedby={reasonError ? "rejection-reason-error" : "rejection-reason-hint"}/>{reasonError ? <small id="rejection-reason-error" className="ops-field-error" role="alert">{reasonError}</small> : <small id="rejection-reason-hint">Entre 10 y 1000 caracteres. El motivo queda en la auditoría.</small>}</label><button className="ops-button ops-button-danger" type="submit" name="intent" value="reject_variant"><X aria-hidden="true" size={17}/>Confirmar rechazo</button></Form></details> : null}
          {selected.status !== "archived" ? <Form method="post" className="ops-archive-form"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><button className="ops-button ops-button-danger" type="submit" name="intent" value="archive_variant" onClick={(event) => { if (!window.confirm("¿Archivar esta variante? Permanecerá disponible en el historial.")) event.preventDefault(); }}><Archive aria-hidden="true" size={17}/>Archivar variante</button></Form> : null}
        </div>
        {loaderData.qualityEnabled ? <VersionHistory versions={loaderData.versions.filter((version) => version.draft_id === selected.id)} selected={selected} campaignId={loaderData.campaign.id} versionA={loaderData.versionA} versionB={loaderData.versionB} returnTo={loaderData.returnTo}/> : null}
      </section> : <section className="ops-empty"><h2>La campaña no tiene variantes</h2><p>Los próximos borradores de n8n se asociarán automáticamente.</p></section>}
    </div>
  </>;
}

const scoreLabels: Record<keyof QualityScorecard, string> = { clarity: "Claridad", specificity: "Especificidad", credibility: "Credibilidad", channel_fit: "Ajuste al canal" };
function QualityScorecardView({ scorecard, reviewedAt }: { scorecard: QualityScorecard; reviewedAt: string | null }) {
  return <section className="ops-quality-scorecard" aria-labelledby="quality-scorecard-title"><div><h3 id="quality-scorecard-title">Puntuación editorial</h3><small>{reviewedAt ? `Revisada ${formatDate(reviewedAt, true)}` : "Revisión pendiente"}</small></div><div>{(Object.entries(scorecard) as Array<[keyof QualityScorecard, QualityScorecard[keyof QualityScorecard]]>).map(([key, value]) => <article key={key}><span>{scoreLabels[key]}</span><strong>{value.score}</strong><meter min="0" max="100" low="60" optimum="90" value={value.score}>{value.score}/100</meter><p>{value.rationale}</p></article>)}</div></section>;
}

const snapshotFields = [["hook", "Gancho"], ["body", "Cuerpo"], ["cta", "CTA"], ["hashtags", "Hashtags"], ["image_headline", "Título visual"], ["image_alt", "Alt text"], ["evidence_refs", "Evidencia"], ["visual_kind", "Tipo visual"], ["carousel_slides", "Placas del carrusel"], ["reel_scenes", "Escenas del reel"], ["reel_selected_clips", "Clips seleccionados"], ["rendered_visual_hash", "Versión del medio"], ["status", "Estado"]] as const;
function snapshotText(value: unknown) { return Array.isArray(value) ? value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(" · ") : value == null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value); }
function VersionHistory({ versions, selected, campaignId, versionA, versionB, returnTo }: { versions: VariantVersion[]; selected: SocialVariant; campaignId: string; versionA: string; versionB: string; returnTo: string }) {
  const left = versions.find((version) => version.id === versionA) || versions[1] || versions[0]; const right = versions.find((version) => version.id === versionB) || versions[0];
  return <section className="ops-version-history" aria-labelledby="version-history-title"><header><div><p className="ops-eyebrow">Trazabilidad</p><h3 id="version-history-title"><FileClock aria-hidden="true"/>Historial de versiones</h3></div><span>{versions.length} versiones</span></header>{versions.length ? <><Form method="get" className="ops-version-selectors"><input type="hidden" name="variant" value={selected.id}/>{returnTo ? <input type="hidden" name="return_to" value={returnTo}/> : null}<label><span>Comparar desde</span><select name="version_a" defaultValue={left?.id}>{versions.map((version) => <option key={version.id} value={version.id}>v{version.version_number} · {version.change_type}</option>)}</select></label><label><span>Contra</span><select name="version_b" defaultValue={right?.id}>{versions.map((version) => <option key={version.id} value={version.id}>v{version.version_number} · {version.change_type}</option>)}</select></label><button className="ops-button ops-button-secondary">Comparar</button></Form>{left && right ? <div className="ops-version-compare">{snapshotFields.map(([key, label]) => { const before = snapshotText(left.snapshot[key]); const after = snapshotText(right.snapshot[key]); return <article className={before !== after ? "is-changed" : ""} key={key}><h4>{label}{before !== after ? <span>Cambió</span> : null}</h4><div><pre>{before}</pre><pre>{after}</pre></div></article>; })}</div> : null}<div className="ops-version-list">{versions.map((version) => <article key={version.id}><div><strong>v{version.version_number} · {version.change_type.replace(/_/g, " ")}</strong><small>{formatDate(version.created_at, true)}</small></div><Form method="post"><input type="hidden" name="intent" value="restore_variant_version"/><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="version_id" value={version.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={returnTo}/><button className="ops-inline-action" type="submit" disabled={selected.status === "published" || selected.status === "archived"} onClick={(event) => { if (!window.confirm(`¿Restaurar la versión ${version.version_number} como nuevo borrador?`)) event.preventDefault(); }}><RotateCcw size={15}/>Restaurar</button></Form></article>)}</div></> : <p className="ops-muted">Todavía no hay snapshots para esta variante.</p>}</section>;
}
