import { useEffect, useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { Archive, ArrowLeft, CalendarClock, Check, Clock3, ExternalLink, Image as ImageIcon, RotateCcw, Save, Send, Sparkles, X } from "lucide-react";
import { Notice, OpsPageHeader, StatusBadge, formatDate } from "../components/ops";
import { audit, assertTrustedMutation, operationsHeaders, opsData, requireAdmin, stringField } from "../lib/admin.server";
import { contentCalendarEnabled, contentComposerEnabled, contentStudioEnabled, renderContentOverlay } from "../lib/content-worker.server";
import { calendarCollisionMessage, calendarDateTimeInput, formatCalendarDateTime, isSafeCalendarReturnTo, todayCalendarKey } from "../lib/social-calendar";
import { regenerateSocialSection, stableHash } from "../lib/social-generation.server";
import { SocialScheduleError, scheduleSocialVariant, unscheduleSocialVariant, type ScheduleConflict } from "../lib/social-scheduling.server";
import { blockingQualityMessage, deterministicQualityFlags, type EvidenceSource, type GeneratedSocialVariant, type QualityFlag } from "../lib/social-quality";
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
  validateSocialContent,
} from "../lib/social-studio";

type Campaign = {
  id: string;
  title: string;
  source_type: string;
  source_id: string;
  status: string;
  updated_at: string;
  generation_context?: { sources?: EvidenceSource[]; visual?: { asset_id?: string } };
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
  media_urls: { primary?: { output_path?: string; sha256?: string } };
  brand_template_id: string | null;
  quality_flags: QualityFlag[];
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
  fieldErrors?: { content?: string; rejection_reason?: string; image_alt?: string };
  pendingSchedule?: { variantId: string; updatedAt: string; localScheduledFor: string; returnTo: string };
  conflicts?: ScheduleConflict[];
};

function structuredVariant(row: SocialVariant): GeneratedSocialVariant {
  return { channel: row.channel as GeneratedSocialVariant["channel"], locale: row.locale as GeneratedSocialVariant["locale"], hook: row.hook || "", body: row.body ?? row.content, cta: row.cta || "", hashtags: row.hashtags || [], image_headline: row.image_headline || "", image_alt: row.image_alt || "", evidence_refs: row.evidence_refs || [], quality_flags: [], generation_notes: [] };
}

function qualityFor(row: SocialVariant, campaign: Campaign) {
  return deterministicQualityFlags(structuredVariant(row), campaign.generation_context?.sources || [], row.media_strategy);
}

function detailUrl(campaignId: string, variantId?: string, saved?: string, returnTo?: string) {
  const query = new URLSearchParams();
  if (variantId) query.set("variant", variantId);
  if (saved) query.set("saved", saved);
  if (returnTo && isSafeCalendarReturnTo(returnTo)) query.set("return_to", returnTo);
  return `/ops/social/${campaignId}${query.size ? `?${query}` : ""}`;
}

function actionError(context: Awaited<ReturnType<typeof requireAdmin>>, error: string, status: number, draftId?: string, fieldErrors?: ActionData["fieldErrors"], extra: Pick<ActionData, "pendingSchedule" | "conflicts"> = {}) {
  return opsData({ error, draftId, fieldErrors, ...extra } satisfies ActionData, context.headers, status);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentStudioEnabled()) throw redirect("/ops/distribution", { headers: operationsHeaders(context.headers) });
  const campaignId = params.campaignId || "";
  if (!isUuid(campaignId)) throw new Response("Campaña inválida.", { status: 404 });

  const [campaignResult, variantsResult] = await Promise.all([
    context.service.from("social_campaigns").select("id,title,source_type,source_id,status,updated_at,generation_context").eq("id", campaignId).maybeSingle(),
    context.service.from("content_distribution_drafts").select("id,campaign_id,translation_group_id,locale,channel,content,hook,body,cta,hashtags,image_headline,image_alt,evidence_refs,media_strategy,media_urls,brand_template_id,quality_flags,generation_metadata,original_sections,status,rejection_reason,published_at,scheduled_for,created_at,updated_at").eq("campaign_id", campaignId).order("locale").order("channel"),
  ]);
  if (campaignResult.error || !campaignResult.data) throw new Response("Campaña no encontrada.", { status: 404 });
  if (variantsResult.error) throw new Response("No se pudieron cargar las variantes.", { status: 500 });

  const campaign = campaignResult.data as Campaign;
  const variants = (variantsResult.data || []) as SocialVariant[];
  const requestedVariant = new URL(request.url).searchParams.get("variant");
  const selected = variants.find((variant) => variant.id === requestedVariant)
    || variants.find((variant) => variant.status === "draft" || variant.status === "rejected")
    || variants[0]
    || null;

  let mediaUrl: string | null = null;
  const mediaPath = selected?.media_urls?.primary?.output_path;
  if (mediaPath) mediaUrl = (await context.service.storage.from("generated-media").createSignedUrl(mediaPath, 3600)).data?.signedUrl || null;
  const returnToParam = new URL(request.url).searchParams.get("return_to");
  return opsData({ campaign, variants, selectedId: selected?.id || null, mediaUrl, composerEnabled: contentComposerEnabled(), calendarEnabled: contentCalendarEnabled(), returnTo: isSafeCalendarReturnTo(returnToParam) ? returnToParam : "", today: todayCalendarKey(), saved: new URL(request.url).searchParams.get("saved") || "" }, context.headers);
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

  const campaignResult = await context.service.from("social_campaigns").select("id,title,source_type,source_id,status,updated_at,generation_context").eq("id", campaignId).maybeSingle();
  if (campaignResult.error || !campaignResult.data) return actionError(context, "Campaña no encontrada.", 404);
  const campaign = campaignResult.data as Campaign;

  if (intent === "approve_campaign") {
    const expectedUpdatedAt = stringField(form, "campaign_updated_at", 80);
    if (!expectedUpdatedAt || expectedUpdatedAt !== campaign.updated_at) return actionError(context, "La campaña cambió en otra pestaña. Recargá antes de aprobarla.", 409);
    const variantsResult = await context.service.from("content_distribution_drafts").select("*").eq("campaign_id", campaignId);
    if (variantsResult.error) return actionError(context, "No se pudieron validar las variantes.", 500);
    const variants = (variantsResult.data || []) as SocialVariant[];
    const invalid = variants.flatMap((variant) => {
      if (variant.status === "published" || variant.status === "archived") return [];
      if (!isSocialChannel(variant.channel)) return [{ id: variant.id, message: "Canal inválido." }];
      const message = validateSocialContent(variant.channel, variant.content) || blockingQualityMessage(qualityFor(variant, campaign));
      return message ? [{ id: variant.id, message }] : [];
    });
    if (invalid.length) return actionError(context, `No se aprobó la campaña: ${invalid[0].message}`, 422, invalid[0].id, { content: invalid[0].message });
    const eligible = variants.filter((variant) => variant.status === "draft" || variant.status === "rejected");
    if (!eligible.length) return actionError(context, "La campaña no tiene variantes pendientes para aprobar.", 409);
    const updateResult = await context.service.rpc("approve_social_campaign", {
      target_campaign_id: campaignId,
      expected_updated_at: expectedUpdatedAt,
    });
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

  if (intent === "render_media") {
    if (!contentComposerEnabled()) return actionError(context, "La composición visual está deshabilitada.", 503, variantId);
    if (before.media_strategy === "text_only" || !before.brand_template_id || !before.image_headline || !before.image_alt) return actionError(context, "Completá título visual, alt text y plantilla antes de componer.", 422, variantId);
    const template = await context.service.from("brand_media_templates").select("*").eq("id", before.brand_template_id).eq("is_active", true).maybeSingle();
    if (!template.data) return actionError(context, "La plantilla ya no está disponible.", 422, variantId);
    const key = stringField(form, "idempotency_key", 200); const hash = stableHash({ operation: "render_media", draft_id: variantId, headline: before.image_headline, template_id: before.brand_template_id, media_strategy: before.media_strategy });
    const begun = await context.service.rpc("begin_social_generation", { target_campaign_id: campaignId, target_draft_id: variantId, target_operation: "render_media", target_stage: "rendering", target_section: null, target_idempotency_key: key, target_request_hash: hash, target_model: null, target_created_by: context.userId });
    if (begun.error) return actionError(context, "No se pudo iniciar la composición.", 409, variantId);
    const run = (Array.isArray(begun.data) ? begun.data[0] : begun.data) as Record<string, any>;
    if (run.status !== "succeeded") {
      try {
        await context.service.from("social_generation_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", run.id);
        let sourceUrl: string | undefined;
        if (template.data.layout === "image_overlay") {
          const assetId = campaign.generation_context?.visual?.asset_id; const asset = await context.service.from("brand_media_assets").select("storage_path").eq("id", assetId).eq("is_active", true).maybeSingle();
          if (!asset.data) throw new Error("brand_asset_unavailable"); const signed = await context.service.storage.from("brand-assets").createSignedUrl(asset.data.storage_path, 600); if (!signed.data?.signedUrl) throw new Error("brand_asset_unavailable"); sourceUrl = signed.data.signedUrl;
        }
        const outputPath = `${campaignId}/${variantId}.png`; const upload = await context.service.storage.from("generated-media").createSignedUploadUrl(outputPath, { upsert: true }); if (!upload.data?.signedUrl) throw new Error("media_upload_unavailable");
        const rendered = await renderContentOverlay({ layout: template.data.layout, output_format: template.data.output_format, ...(sourceUrl ? { source_url: sourceUrl } : {}), destination_upload_url: upload.data.signedUrl, output_path: outputPath, headline: before.image_headline, safe_zone: template.data.safe_zone, text_align: template.data.text_align, vertical_align: template.data.vertical_align, overlay_color: template.data.overlay_color, overlay_opacity: Number(template.data.overlay_opacity), text_color: template.data.text_color, min_font_size: template.data.min_font_size, max_font_size: template.data.max_font_size, logo_enabled: template.data.logo_enabled }, `render:${run.id}:${variantId}`);
        const update = await context.service.from("content_distribution_drafts").update({ media_urls: { primary: rendered } }).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle(); if (!update.data) throw new Error("render_conflict");
        await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", result_summary: { output_path: rendered.output_path, sha256: rendered.sha256 }, completed_at: new Date().toISOString() }).eq("id", run.id);
        await audit(context, { action: "render_media", entityType: "distribution_draft", entityId: variantId, after: { run_id: run.id, output_path: rendered.output_path, sha256: rendered.sha256 } });
      } catch {
        await context.service.from("social_generation_runs").update({ status: "failed", error_code: "render_failed", error_message: "No se pudo componer la pieza.", completed_at: new Date().toISOString() }).eq("id", run.id);
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
        const changes = { [validSection]: generated.value.text, content: composeSocialContent(next), evidence_refs: next.evidence_refs, quality_flags: qualityFlags, status: "draft", rejection_reason: null, generation_metadata: { ...before.generation_metadata, last_regeneration_run_id: run.id, last_regenerated_section: validSection } };
        const update = await context.service.from("content_distribution_drafts").update(changes).eq("id", variantId).eq("updated_at", expectedUpdatedAt).select("*").maybeSingle();
        if (!update.data) throw new Error("generation_conflict");
        await context.service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", usage: { drafting: generated.draftingUsage, critic: generated.usage }, request_id: generated.requestId, result_summary: { section: validSection }, completed_at: new Date().toISOString() }).eq("id", run.id);
        await audit(context, { action: "regenerate_section", entityType: "distribution_draft", entityId: variantId, before: { section: validSection }, after: { section: validSection, run_id: run.id } });
      } catch {
        await context.service.from("social_generation_runs").update({ status: "failed", error_code: "generation_failed", error_message: "No se pudo regenerar la sección.", completed_at: new Date().toISOString() }).eq("id", run.id);
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
    const hook = stringField(form, "hook", 4000); const body = stringField(form, "body", 10_000); const cta = stringField(form, "cta", 4000); const hashtags = parseHashtags(stringField(form, "hashtags", 1000)); const imageHeadline = stringField(form, "image_headline", 120); const imageAlt = stringField(form, "image_alt", 500);
    const generated = { ...structuredVariant(before), hook, body, cta, hashtags, image_headline: imageHeadline, image_alt: imageAlt };
    const content = composeSocialContent(generated);
    const contentError = validateSocialContent(before.channel, content);
    if (contentError) return actionError(context, "Corregí el contenido antes de guardar.", 422, variantId, { content: contentError });
    if (before.media_strategy !== "text_only" && !imageAlt) return actionError(context, "Agregá texto alternativo para la pieza visual.", 422, variantId, { image_alt: "El texto alternativo es obligatorio cuando existe una imagen." });
    const qualityFlags = deterministicQualityFlags(generated, campaign.generation_context?.sources || [], before.media_strategy);
    changes = { hook, body, cta, hashtags, image_headline: imageHeadline || null, image_alt: imageAlt || null, content, quality_flags: qualityFlags, content_type: "structured", ...(before.status === "approved" || before.status === "rejected" ? { status: "draft", rejection_reason: null } : {}) };
    auditAction = "save";
  } else if (intent === "approve_variant") {
    if (!['draft', 'rejected'].includes(before.status) || !canTransitionSocialDraft(before.status, "approved")) return actionError(context, "Sólo se pueden aprobar borradores o variantes rechazadas.", 409, variantId);
    const contentError = validateSocialContent(before.channel, before.content) || blockingQualityMessage(qualityFor(before, campaign));
    if (contentError) return actionError(context, "Corregí el contenido antes de aprobar.", 422, variantId, { content: contentError });
    changes = { status: "approved", rejection_reason: null };
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
    changes = { status: "published", published_at: new Date().toISOString(), rejection_reason: null };
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
  schedule: "Variante programada. Esto no publica automáticamente.",
  reschedule: "Horario actualizado en hora de Buenos Aires.",
  unschedule: "Programación eliminada; la variante volvió a aprobada.",
  "campaign-approved": "Campaña aprobada. Ninguna variante fue publicada ni programada.",
};

export default function OpsSocialDetail({ loaderData, actionData }: { loaderData: { campaign: Campaign; variants: SocialVariant[]; selectedId: string | null; mediaUrl: string | null; composerEnabled: boolean; calendarEnabled: boolean; returnTo: string; today: string; saved: string }; actionData?: ActionData }) {
  const selected = loaderData.variants.find((variant) => variant.id === loaderData.selectedId) || null;
  const [sections, setSections] = useState(() => ({ hook: selected?.hook || "", body: selected?.body ?? selected?.content ?? "", cta: selected?.cta || "", hashtags: (selected?.hashtags || []).join(" "), image_headline: selected?.image_headline || "", image_alt: selected?.image_alt || "" }));
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => setSections({ hook: selected?.hook || "", body: selected?.body ?? selected?.content ?? "", cta: selected?.cta || "", hashtags: (selected?.hashtags || []).join(" "), image_headline: selected?.image_headline || "", image_alt: selected?.image_alt || "" }), [selected?.id, selected?.updated_at]);
  useEffect(() => { if (actionData?.error) errorRef.current?.focus(); }, [actionData?.error]);
  const currentContent = selected ? composeSocialContent({ ...structuredVariant(selected), ...sections, hashtags: parseHashtags(sections.hashtags) }) : "";
  const dirty = Boolean(selected && (sections.hook !== (selected.hook || "") || sections.body !== (selected.body ?? selected.content) || sections.cta !== (selected.cta || "") || sections.hashtags !== (selected.hashtags || []).join(" ") || sections.image_headline !== (selected.image_headline || "") || sections.image_alt !== (selected.image_alt || "")));
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const characterCount = countSocialCharacters(currentContent);
  const limit = selected && isSocialChannel(selected.channel) ? SOCIAL_CHANNEL_LIMITS[selected.channel] : 0;
  const contentError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.content : undefined;
  const reasonError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.rejection_reason : undefined;
  const altError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.image_alt : undefined;
  const canApproveCampaign = loaderData.variants.some((variant) => variant.status === "draft" || variant.status === "rejected");
  const readOnly = selected?.status === "published" || selected?.status === "archived";
  const qualityFlags = selected ? qualityFor({ ...selected, hook: sections.hook, body: sections.body, cta: sections.cta, hashtags: parseHashtags(sections.hashtags), image_headline: sections.image_headline, image_alt: sections.image_alt, content: currentContent }, loaderData.campaign) : [];
  const updateSection = (field: keyof typeof sections, value: string) => setSections((current) => ({ ...current, [field]: value }));

  return <>
    <Link className="ops-back" to={loaderData.returnTo || "/ops/social"}><ArrowLeft aria-hidden="true" size={16}/>{loaderData.returnTo ? "Volver al calendario" : "Volver a Social Studio"}</Link>
    <OpsPageHeader eyebrow="Campaña social" title={loaderData.campaign.title} description="Revisá el copy por separado. Las decisiones quedan registradas y aprobar nunca publica." action={<Form method="post"><input type="hidden" name="intent" value="approve_campaign"/><input type="hidden" name="campaign_updated_at" value={loaderData.campaign.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-button" type="submit" disabled={!canApproveCampaign || dirty} onClick={(event) => { if (!window.confirm("¿Aprobar todas las variantes pendientes de esta campaña? Esto no publica nada.")) event.preventDefault(); }}><Check aria-hidden="true" size={17}/>Aprobar campaña</button></Form>}/>
    {loaderData.saved && savedMessages[loaderData.saved] ? <Notice tone="success">{savedMessages[loaderData.saved]}</Notice> : null}
    {actionData?.error ? <div ref={errorRef} className="ops-notice ops-notice-error" role="alert" tabIndex={-1}>{actionData.error}</div> : null}
    {actionData?.pendingSchedule ? <section className="ops-calendar-conflict" aria-labelledby="social-schedule-conflict-title"><Clock3 aria-hidden="true"/><div><h2 id="social-schedule-conflict-title">Confirmar horario con colisión</h2>{actionData.conflicts?.map((item) => <p key={item.id}><strong>{item.campaign_title}</strong> · {formatCalendarDateTime(item.scheduled_for)}</p>)}<Form method="post"><input type="hidden" name="intent" value={selected?.status === "scheduled" ? "reschedule_variant" : "schedule_variant"}/><input type="hidden" name="variant_id" value={actionData.pendingSchedule.variantId}/><input type="hidden" name="updated_at" value={actionData.pendingSchedule.updatedAt}/><input type="hidden" name="scheduled_for" value={actionData.pendingSchedule.localScheduledFor}/><input type="hidden" name="return_to" value={actionData.pendingSchedule.returnTo}/><input type="hidden" name="confirm_conflict" value="yes"/><button className="ops-button" type="submit">Programar igualmente</button></Form></div></section> : null}

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
        <Form method="post" className="ops-form ops-social-copy-form">
          <input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/>
          {([['hook','Gancho',3],['body','Cuerpo',selected.channel === 'x' ? 5 : 10],['cta','CTA',3]] as const).map(([field,label,rows]) => <div className="ops-section-field" key={field}><label className="ops-field"><span>{label}</span><textarea name={field} rows={rows} value={sections[field]} onChange={(event) => updateSection(field, event.target.value)} readOnly={readOnly}/></label></div>)}
          <label className="ops-field"><span>Hashtags</span><input name="hashtags" value={sections.hashtags} onChange={(event) => updateSection("hashtags", event.target.value)} readOnly={readOnly} placeholder="#automatizacion #operaciones"/></label>
          <div className="ops-field-grid"><label className="ops-field"><span>Título visual</span><input name="image_headline" maxLength={120} value={sections.image_headline} onChange={(event) => updateSection("image_headline", event.target.value)} readOnly={readOnly}/><small>{sections.image_headline.length} / 120</small></label><label className="ops-field"><span>Texto alternativo</span><textarea name="image_alt" maxLength={500} rows={3} value={sections.image_alt} onChange={(event) => updateSection("image_alt", event.target.value)} readOnly={readOnly} aria-invalid={Boolean(altError)}/>{altError ? <small className="ops-field-error" role="alert">{altError}</small> : null}</label></div>
          {loaderData.mediaUrl ? <figure className="ops-generated-media"><img src={loaderData.mediaUrl} alt={selected.image_alt || "Vista previa de la pieza"}/><figcaption><ImageIcon size={15}/>Pieza generada{sections.image_headline !== (selected.image_headline || "") ? " · el título cambió; la imagen todavía no fue recompuesta" : ""}</figcaption></figure> : null}
          <div className="ops-copy-preview"><strong>Vista previa del copy final</strong><pre>{currentContent}</pre><small id="social-counter" className={characterCount > limit ? "ops-counter is-over" : "ops-counter"} aria-live="polite">{characterCount} / {limit} caracteres{selected.channel === "x" ? " · conteo conservador" : ""}</small>{contentError ? <small id="social-content-error" className="ops-field-error" role="alert">{contentError}</small> : null}</div>
          {qualityFlags.length ? <div className="ops-quality-flags" aria-label="Controles de calidad"><strong>Controles de calidad</strong><ul>{qualityFlags.map((flag, index) => <li className={`is-${flag.severity}`} key={`${flag.code}-${index}`}><StatusBadge value={flag.severity}/>{flag.message}</li>)}</ul></div> : <Notice tone="success">Sin bloqueos automáticos de calidad.</Notice>}
          {selected.original_sections ? <details className="ops-original-copy"><summary>Comparar con la versión generada</summary><pre>{composeSocialContent({ ...structuredVariant(selected), ...(selected.original_sections as Partial<GeneratedSocialVariant>) })}</pre></details> : null}
          <div className="ops-editor-primary"><span>{selected.status === "approved" || selected.status === "rejected" ? "Editar devuelve esta variante a borrador." : "Los cambios se guardan antes de actualizar la pantalla."}</span><button className="ops-button" type="submit" name="intent" value="save_variant" disabled={!dirty || characterCount === 0 || characterCount > limit || selected.status === "published" || selected.status === "archived"}><Save aria-hidden="true" size={17}/>Guardar cambios</button></div>
        </Form>
        {loaderData.composerEnabled && !readOnly ? <div className="ops-regenerate-row" aria-label="Acciones asistidas">{([['hook','gancho'],['body','cuerpo'],['cta','CTA']] as const).map(([field,label]) => <Form method="post" key={field}><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="section" value={field}/><input type="hidden" name="idempotency_key" value={`regen:${selected.id}:${selected.updated_at}:${field}`}/><button className="ops-inline-action" name="intent" value="regenerate_section" type="submit" disabled={dirty}><Sparkles size={15}/>Regenerar {label}</button></Form>)}{selected.media_strategy !== "text_only" ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="idempotency_key" value={`render:${selected.id}:${selected.updated_at}:${selected.image_headline}`}/><button className="ops-inline-action" name="intent" value="render_media" type="submit" disabled={dirty}><ImageIcon size={15}/>Recomponer imagen</button></Form> : null}</div> : null}

        {loaderData.calendarEnabled && (selected.status === "approved" || selected.status === "scheduled") ? <section className="ops-schedule-block" aria-labelledby="social-schedule-title">
          <div><p className="ops-eyebrow">Planificación manual</p><h3 id="social-schedule-title">{selected.status === "scheduled" ? "Reprogramar variante" : "Programar variante"}</h3><p><Clock3 size={15}/>Hora de Buenos Aires · programar no publica.</p>{selected.scheduled_for ? <strong>Fecha actual: {formatCalendarDateTime(selected.scheduled_for)}</strong> : null}</div>
          <Form method="post" className="ops-form ops-calendar-schedule-form">
            <input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/>
            <label className="ops-field"><span>Fecha y hora</span><input type="datetime-local" name="scheduled_for" step="900" min={`${loaderData.today}T00:00`} defaultValue={calendarDateTimeInput(selected.scheduled_for)} required/></label>
            <button className="ops-button" type="submit" name="intent" value={selected.status === "scheduled" ? "reschedule_variant" : "schedule_variant"} disabled={dirty}><CalendarClock size={17}/>{selected.status === "scheduled" ? "Reprogramar" : "Programar"}</button>
          </Form>
          {selected.status === "scheduled" ? <div className="ops-schedule-links"><Link to={`/ops/calendar?variant=${selected.id}`}><CalendarClock size={16}/>Ver en calendario</Link><Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-inline-action" type="submit" name="intent" value="unschedule_variant"><RotateCcw size={16}/>Desprogramar</button></Form></div> : null}
        </section> : null}

        <div className="ops-review-actions">
          <div><h3>Decisión editorial</h3><p>Aprobá esta versión, rechazala con instrucciones o registrá una publicación ya realizada manualmente.</p></div>
          <div className="ops-review-buttons">
            {(selected.status === "draft" || selected.status === "rejected") ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="approve_variant" disabled={dirty}><Check aria-hidden="true" size={17}/>Aprobar variante</button></Form> : null}
            {(selected.status === "approved" || selected.status === "scheduled") ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="mark_published" disabled={dirty} onClick={(event) => { if (!window.confirm("Confirmá únicamente si ya publicaste esta variante manualmente en la red.")) event.preventDefault(); }}><Send aria-hidden="true" size={17}/>Marcar publicada</button></Form> : null}
            {selected.status === "published" ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="undo_published" onClick={(event) => { if (!window.confirm("¿Deshacer el registro de publicación y volver a aprobado?")) event.preventDefault(); }}><RotateCcw aria-hidden="true" size={17}/>Deshacer publicación</button></Form> : null}
          </div>
          {(selected.status === "draft" || selected.status === "approved" || selected.status === "scheduled") ? <details className="ops-reject-form" open={Boolean(reasonError)}><summary><X aria-hidden="true" size={16}/>Rechazar con motivo</summary><Form method="post" className="ops-form"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={loaderData.returnTo}/><label className="ops-field" htmlFor="rejection-reason"><span>Qué debe corregirse <b aria-hidden="true">*</b></span><textarea id="rejection-reason" name="rejection_reason" minLength={10} maxLength={1000} required rows={4} aria-invalid={Boolean(reasonError)} aria-describedby={reasonError ? "rejection-reason-error" : "rejection-reason-hint"}/>{reasonError ? <small id="rejection-reason-error" className="ops-field-error" role="alert">{reasonError}</small> : <small id="rejection-reason-hint">Entre 10 y 1000 caracteres. El motivo queda en la auditoría.</small>}</label><button className="ops-button ops-button-danger" type="submit" name="intent" value="reject_variant"><X aria-hidden="true" size={17}/>Confirmar rechazo</button></Form></details> : null}
          {selected.status !== "archived" ? <Form method="post" className="ops-archive-form"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><button className="ops-button ops-button-danger" type="submit" name="intent" value="archive_variant" onClick={(event) => { if (!window.confirm("¿Archivar esta variante? Permanecerá disponible en el historial.")) event.preventDefault(); }}><Archive aria-hidden="true" size={17}/>Archivar variante</button></Form> : null}
        </div>
      </section> : <section className="ops-empty"><h2>La campaña no tiene variantes</h2><p>Los próximos borradores de n8n se asociarán automáticamente.</p></section>}
    </div>
  </>;
}
