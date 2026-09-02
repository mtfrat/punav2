import { useEffect, useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { Archive, ArrowLeft, Check, ExternalLink, RotateCcw, Save, Send, X } from "lucide-react";
import { Notice, OpsPageHeader, StatusBadge, formatDate } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, requireAdmin, stringField } from "../lib/admin.server";
import { contentStudioEnabled } from "../lib/content-worker.server";
import {
  SOCIAL_CHANNEL_LIMITS,
  canTransitionSocialDraft,
  countSocialCharacters,
  isSocialChannel,
  isUuid,
  socialChannelLabel,
  socialLocaleLabel,
  validateRejectionReason,
  validateSocialContent,
} from "../lib/social-studio";

type Campaign = {
  id: string;
  title: string;
  source_type: string;
  source_id: string;
  status: string;
  updated_at: string;
};

type SocialVariant = {
  id: string;
  campaign_id: string;
  translation_group_id: string;
  locale: string;
  channel: string;
  content: string;
  status: string;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type ActionData = {
  error?: string;
  draftId?: string;
  fieldErrors?: { content?: string; rejection_reason?: string };
};

function detailUrl(campaignId: string, variantId?: string, saved?: string) {
  const query = new URLSearchParams();
  if (variantId) query.set("variant", variantId);
  if (saved) query.set("saved", saved);
  return `/ops/social/${campaignId}${query.size ? `?${query}` : ""}`;
}

function actionError(context: Awaited<ReturnType<typeof requireAdmin>>, error: string, status: number, draftId?: string, fieldErrors?: ActionData["fieldErrors"]) {
  return opsData({ error, draftId, fieldErrors } satisfies ActionData, context.headers, status);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentStudioEnabled()) throw redirect("/ops/distribution", { headers: operationsHeaders(context.headers) });
  const campaignId = params.campaignId || "";
  if (!isUuid(campaignId)) throw new Response("Campaña inválida.", { status: 404 });

  const [campaignResult, variantsResult] = await Promise.all([
    context.service.from("social_campaigns").select("id,title,source_type,source_id,status,updated_at").eq("id", campaignId).maybeSingle(),
    context.service.from("content_distribution_drafts").select("id,campaign_id,translation_group_id,locale,channel,content,status,rejection_reason,published_at,created_at,updated_at").eq("campaign_id", campaignId).order("locale").order("channel"),
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

  return opsData({ campaign, variants, selectedId: selected?.id || null, saved: new URL(request.url).searchParams.get("saved") || "" }, context.headers);
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  if (!contentStudioEnabled()) return actionError(context, "Social Studio está deshabilitado.", 503);
  const campaignId = params.campaignId || "";
  if (!isUuid(campaignId)) return actionError(context, "Campaña inválida.", 404);
  const form = await request.formData();
  const intent = stringField(form, "intent", 40);

  const campaignResult = await context.service.from("social_campaigns").select("id,title,status,updated_at").eq("id", campaignId).maybeSingle();
  if (campaignResult.error || !campaignResult.data) return actionError(context, "Campaña no encontrada.", 404);
  const campaign = campaignResult.data as Campaign;

  if (intent === "approve_campaign") {
    const expectedUpdatedAt = stringField(form, "campaign_updated_at", 80);
    if (!expectedUpdatedAt || expectedUpdatedAt !== campaign.updated_at) return actionError(context, "La campaña cambió en otra pestaña. Recargá antes de aprobarla.", 409);
    const variantsResult = await context.service.from("content_distribution_drafts").select("id,channel,content,status,updated_at").eq("campaign_id", campaignId);
    if (variantsResult.error) return actionError(context, "No se pudieron validar las variantes.", 500);
    const variants = (variantsResult.data || []) as SocialVariant[];
    const invalid = variants.flatMap((variant) => {
      if (variant.status === "published" || variant.status === "archived") return [];
      if (!isSocialChannel(variant.channel)) return [{ id: variant.id, message: "Canal inválido." }];
      const message = validateSocialContent(variant.channel, variant.content);
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
    throw redirect(detailUrl(campaignId, undefined, "campaign-approved"), { headers: operationsHeaders(context.headers) });
  }

  const variantId = stringField(form, "variant_id", 80);
  const expectedUpdatedAt = stringField(form, "updated_at", 80);
  if (!isUuid(variantId)) return actionError(context, "Variante inválida.", 404);
  const beforeResult = await context.service.from("content_distribution_drafts").select("*").eq("id", variantId).eq("campaign_id", campaignId).maybeSingle();
  if (beforeResult.error || !beforeResult.data) return actionError(context, "Variante no encontrada.", 404, variantId);
  const before = beforeResult.data as SocialVariant;
  if (!expectedUpdatedAt || expectedUpdatedAt !== before.updated_at) return actionError(context, "Esta variante cambió en otra pestaña. Recargá para evitar sobrescribirla.", 409, variantId);
  if (!isSocialChannel(before.channel)) return actionError(context, "La variante tiene un canal inválido.", 422, variantId);

  let changes: Record<string, unknown>;
  let auditAction: string;
  if (intent === "save_variant") {
    if (before.status === "published") return actionError(context, "Deshacé el estado publicado antes de editar el contenido.", 409, variantId);
    if (before.status === "archived") return actionError(context, "Una variante archivada no se puede editar.", 409, variantId);
    const content = stringField(form, "content", 10_000);
    const contentError = validateSocialContent(before.channel, content);
    if (contentError) return actionError(context, "Corregí el contenido antes de guardar.", 422, variantId, { content: contentError });
    changes = { content, ...(before.status === "approved" || before.status === "rejected" ? { status: "draft", rejection_reason: null } : {}) };
    auditAction = "save";
  } else if (intent === "approve_variant") {
    if (!['draft', 'rejected'].includes(before.status) || !canTransitionSocialDraft(before.status, "approved")) return actionError(context, "Sólo se pueden aprobar borradores o variantes rechazadas.", 409, variantId);
    const contentError = validateSocialContent(before.channel, before.content);
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
    if (!canTransitionSocialDraft(before.status, "published")) return actionError(context, "Sólo una variante aprobada puede marcarse como publicada.", 409, variantId);
    changes = { status: "published", published_at: new Date().toISOString(), rejection_reason: null };
    auditAction = "mark_published";
  } else if (intent === "undo_published") {
    if (before.status !== "published" || !canTransitionSocialDraft(before.status, "approved")) return actionError(context, "La variante no está marcada como publicada.", 409, variantId);
    changes = { status: "approved", published_at: null, rejection_reason: null };
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
  await audit(context, { action: auditAction, entityType: "distribution_draft", entityId: variantId, before: compactSnapshot(before), after: compactSnapshot(updateResult.data) });
  throw redirect(detailUrl(campaignId, variantId, auditAction), { headers: operationsHeaders(context.headers) });
}

const savedMessages: Record<string, string> = {
  save: "Cambios guardados. Si la variante estaba aprobada o rechazada, volvió a borrador.",
  approve: "Variante aprobada. Todavía no fue publicada.",
  reject: "Variante rechazada con un motivo registrado.",
  mark_published: "Publicación manual registrada.",
  undo_published: "La marca de publicación se deshizo; la variante volvió a aprobada.",
  archive: "Variante archivada.",
  "campaign-approved": "Campaña aprobada. Ninguna variante fue publicada ni programada.",
};

export default function OpsSocialDetail({ loaderData, actionData }: { loaderData: { campaign: Campaign; variants: SocialVariant[]; selectedId: string | null; saved: string }; actionData?: ActionData }) {
  const selected = loaderData.variants.find((variant) => variant.id === loaderData.selectedId) || null;
  const [content, setContent] = useState(selected?.content || "");
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => setContent(selected?.content || ""), [selected?.id, selected?.updated_at]);
  useEffect(() => { if (actionData?.error) errorRef.current?.focus(); }, [actionData?.error]);
  const dirty = Boolean(selected && content !== selected.content);
  const characterCount = countSocialCharacters(content);
  const limit = selected && isSocialChannel(selected.channel) ? SOCIAL_CHANNEL_LIMITS[selected.channel] : 0;
  const contentError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.content : undefined;
  const reasonError = selected && actionData?.draftId === selected.id ? actionData.fieldErrors?.rejection_reason : undefined;
  const canApproveCampaign = loaderData.variants.some((variant) => variant.status === "draft" || variant.status === "rejected");

  return <>
    <Link className="ops-back" to="/ops/social"><ArrowLeft aria-hidden="true" size={16}/>Volver a Social Studio</Link>
    <OpsPageHeader eyebrow="Campaña social" title={loaderData.campaign.title} description="Revisá el copy por separado. Las decisiones quedan registradas y aprobar nunca publica." action={<Form method="post"><input type="hidden" name="intent" value="approve_campaign"/><input type="hidden" name="campaign_updated_at" value={loaderData.campaign.updated_at}/><button className="ops-button" type="submit" disabled={!canApproveCampaign || dirty} onClick={(event) => { if (!window.confirm("¿Aprobar todas las variantes pendientes de esta campaña? Esto no publica nada.")) event.preventDefault(); }}><Check aria-hidden="true" size={17}/>Aprobar campaña</button></Form>}/>
    {loaderData.saved && savedMessages[loaderData.saved] ? <Notice tone="success">{savedMessages[loaderData.saved]}</Notice> : null}
    {actionData?.error ? <div ref={errorRef} className="ops-notice ops-notice-error" role="alert" tabIndex={-1}>{actionData.error}</div> : null}

    <div className="ops-social-review">
      <aside className="ops-variant-panel" aria-label="Variantes de la campaña">
        <div className="ops-variant-panel-header"><div><span>Estado general</span><StatusBadge value={loaderData.campaign.status}/></div><small>{loaderData.variants.length} variantes · actualizada {formatDate(loaderData.campaign.updated_at, true)}</small></div>
        <nav className="ops-variant-list" aria-label="Elegir variante">
          {loaderData.variants.map((variant) => <Link key={variant.id} to={detailUrl(loaderData.campaign.id, variant.id)} className={variant.id === selected?.id ? "active" : undefined} aria-current={variant.id === selected?.id ? "page" : undefined}><span><Send aria-hidden="true" size={17}/><strong>{socialChannelLabel(variant.channel)}</strong><small>{socialLocaleLabel(variant.locale)}</small></span><StatusBadge value={variant.status}/></Link>)}
        </nav>
        {loaderData.campaign.source_type === "article" ? <Link className="ops-source-link" to={`/ops/content/${loaderData.campaign.source_id}`}><ExternalLink aria-hidden="true" size={16}/>Abrir artículo fuente</Link> : null}
      </aside>

      {selected ? <section className="ops-variant-editor" aria-labelledby="variant-editor-title">
        <header><div><p className="ops-eyebrow">{socialChannelLabel(selected.channel)} · {socialLocaleLabel(selected.locale)}</p><h2 id="variant-editor-title">Copy de la variante</h2></div><StatusBadge value={selected.status}/></header>
        {selected.rejection_reason ? <div className="ops-rejection-note"><strong>Motivo del rechazo</strong><p>{selected.rejection_reason}</p></div> : null}
        {selected.status === "published" ? <Notice>Esta variante es de sólo lectura. Deshacé la marca de publicación para corregirla.</Notice> : null}
        {selected.status === "archived" ? <Notice>Esta variante está archivada y permanece disponible como registro.</Notice> : null}
        <Form method="post" className="ops-form ops-social-copy-form">
          <input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/>
          <label className="ops-field" htmlFor="social-content"><span>Contenido <b aria-hidden="true">*</b></span><textarea id="social-content" name="content" rows={selected.channel === "x" ? 8 : 15} value={content} onChange={(event) => setContent(event.target.value)} readOnly={selected.status === "published" || selected.status === "archived"} aria-describedby={contentError ? "social-counter social-content-error" : "social-counter"} aria-invalid={Boolean(contentError)}/><small id="social-counter" className={characterCount > limit ? "ops-counter is-over" : "ops-counter"} aria-live="polite">{characterCount} / {limit} caracteres{selected.channel === "x" ? " · conteo conservador" : ""}</small>{contentError ? <small id="social-content-error" className="ops-field-error" role="alert">{contentError}</small> : null}</label>
          <div className="ops-editor-primary"><span>{selected.status === "approved" || selected.status === "rejected" ? "Editar devuelve esta variante a borrador." : "Los cambios se guardan antes de actualizar la pantalla."}</span><button className="ops-button" type="submit" name="intent" value="save_variant" disabled={!dirty || characterCount === 0 || characterCount > limit || selected.status === "published" || selected.status === "archived"}><Save aria-hidden="true" size={17}/>Guardar cambios</button></div>
        </Form>

        <div className="ops-review-actions">
          <div><h3>Decisión editorial</h3><p>Aprobá esta versión, rechazala con instrucciones o registrá una publicación ya realizada manualmente.</p></div>
          <div className="ops-review-buttons">
            {(selected.status === "draft" || selected.status === "rejected") ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="approve_variant" disabled={dirty}><Check aria-hidden="true" size={17}/>Aprobar variante</button></Form> : null}
            {selected.status === "approved" ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="mark_published" disabled={dirty} onClick={(event) => { if (!window.confirm("Confirmá únicamente si ya publicaste esta variante manualmente en la red.")) event.preventDefault(); }}><Send aria-hidden="true" size={17}/>Marcar publicada</button></Form> : null}
            {selected.status === "published" ? <Form method="post"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><button className="ops-button ops-button-secondary" type="submit" name="intent" value="undo_published" onClick={(event) => { if (!window.confirm("¿Deshacer el registro de publicación y volver a aprobado?")) event.preventDefault(); }}><RotateCcw aria-hidden="true" size={17}/>Deshacer publicación</button></Form> : null}
          </div>
          {(selected.status === "draft" || selected.status === "approved") ? <details className="ops-reject-form" open={Boolean(reasonError)}><summary><X aria-hidden="true" size={16}/>Rechazar con motivo</summary><Form method="post" className="ops-form"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><label className="ops-field" htmlFor="rejection-reason"><span>Qué debe corregirse <b aria-hidden="true">*</b></span><textarea id="rejection-reason" name="rejection_reason" minLength={10} maxLength={1000} required rows={4} aria-invalid={Boolean(reasonError)} aria-describedby={reasonError ? "rejection-reason-error" : "rejection-reason-hint"}/>{reasonError ? <small id="rejection-reason-error" className="ops-field-error" role="alert">{reasonError}</small> : <small id="rejection-reason-hint">Entre 10 y 1000 caracteres. El motivo queda en la auditoría.</small>}</label><button className="ops-button ops-button-danger" type="submit" name="intent" value="reject_variant"><X aria-hidden="true" size={17}/>Confirmar rechazo</button></Form></details> : null}
          {selected.status !== "archived" ? <Form method="post" className="ops-archive-form"><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><button className="ops-button ops-button-danger" type="submit" name="intent" value="archive_variant" onClick={(event) => { if (!window.confirm("¿Archivar esta variante? Permanecerá disponible en el historial.")) event.preventDefault(); }}><Archive aria-hidden="true" size={17}/>Archivar variante</button></Form> : null}
        </div>
      </section> : <section className="ops-empty"><h2>La campaña no tiene variantes</h2><p>Los próximos borradores de n8n se asociarán automáticamente.</p></section>}
    </div>
  </>;
}
