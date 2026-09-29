import { randomUUID } from "node:crypto";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { ArrowRight, Palette, Plus } from "lucide-react";
import { EmptyState, Field, Notice, OpsPageHeader, StatusBadge, SubmitButton, TextAreaField, formatDate } from "../components/ops";
import { ART_PIECE_ROLES } from "../lib/art-studio";
import { audit, assertTrustedMutation, operationsHeaders, opsData, requireAdmin, stringField } from "../lib/admin.server";
import { artStudioEnabled } from "../lib/content-worker.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!artStudioEnabled()) throw redirect("/ops/social", { headers: operationsHeaders(context.headers) });
  const result = await context.service
    .from("art_campaigns")
    .select("id,status,current_version,updated_at,social_campaign_id,social_campaigns(title,objective,audience)")
    .order("updated_at", { ascending: false });
  if (result.error) throw new Response("No se pudo cargar Art Studio.", { status: 500 });
  return opsData({ campaigns: result.data || [], created: new URL(request.url).searchParams.get("created") === "1" }, context.headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  if (!artStudioEnabled()) return opsData({ error: "Art Studio está deshabilitado." }, context.headers, 503);
  const form = await request.formData();
  if (stringField(form, "intent", 40) !== "create") return opsData({ error: "Acción inválida." }, context.headers, 400);
  const title = stringField(form, "title", 180);
  const audience = stringField(form, "audience", 500);
  const problem = stringField(form, "problem_statement", 1200);
  const thesis = stringField(form, "thesis", 800);
  const perspective = stringField(form, "perspective", 800);
  const objective = stringField(form, "objective", 500);
  const offerCta = stringField(form, "offer_cta", 500);
  if (!title || !audience || !problem || !thesis || !perspective || !objective || !offerCta)
    return opsData({ error: "Completá el brief concreto antes de iniciar el piloto." }, context.headers, 422);

  const artId = randomUUID();
  const socialId = randomUUID();
  const social = await context.service.from("social_campaigns").insert({
    id: socialId,
    title,
    source_type: "manual",
    source_id: `art:${artId}`,
    status: "idea",
    objective: "demonstrate",
    audience,
    problem_statement: problem,
    generation_context: { art_studio: { campaign_id: artId, status: "brief" } },
    created_by: context.userId,
  });
  if (social.error) return opsData({ error: "No se pudo iniciar la campaña vinculada." }, context.headers, 400);
  const art = await context.service.from("art_campaigns").insert({
    id: artId,
    social_campaign_id: socialId,
    audience,
    problem_statement: problem,
    thesis,
    perspective,
    objective,
    offer_cta: offerCta,
    art_director: stringField(form, "art_director", 160) || null,
    facts_approver: stringField(form, "facts_approver", 160) || null,
    created_by: context.userId,
  }).select("*").single();
  if (art.error) {
    await context.service.from("social_campaigns").delete().eq("id", socialId);
    return opsData({ error: "No se pudo crear el piloto de Art Studio." }, context.headers, 400);
  }
  const pieces = await context.service.from("art_campaign_pieces").insert(
    ART_PIECE_ROLES.map((role) => ({ campaign_id: artId, role })),
  ).select("*");
  if (pieces.error) {
    await context.service.from("social_campaigns").delete().eq("id", socialId);
    return opsData({ error: "No se pudo preparar el mapa de tres piezas." }, context.headers, 400);
  }
  const initialVersion = await context.service.from("art_campaign_versions").insert({
    campaign_id: artId,
    version_number: 1,
    change_type: "brief",
    snapshot: { campaign: art.data, pieces: pieces.data || [] },
    created_by: context.userId,
  });
  if (initialVersion.error) {
    await context.service.from("social_campaigns").delete().eq("id", socialId);
    return opsData({ error: "No se pudo registrar la versión inicial del piloto." }, context.headers, 400);
  }
  await audit(context, { action: "create", entityType: "art_campaign", entityId: artId, after: { social_campaign_id: socialId, piece_roles: ART_PIECE_ROLES } });
  throw redirect(`/ops/art/${artId}?created=1`, { headers: operationsHeaders(context.headers) });
}

export default function OpsArt({ loaderData, actionData }: { loaderData: any; actionData?: { error?: string } }) {
  return <>
    <OpsPageHeader eyebrow="Editorial · Piloto" title="Art Studio" description="Construí una dirección visual y tres piezas conectadas antes de entregar el copy y la salida a Social Studio." action={<div className="ops-art-header-actions"><Link className="ops-button ops-button-secondary" to="/ops/art/brandsheet#aplicaciones">Ver guía visual y ejemplos<ArrowRight size={16} aria-hidden="true"/></Link><details className="ops-create"><summary className="ops-button"><Plus size={17}/>Nuevo piloto</summary><Form method="post" className="ops-popover-form ops-form"><h2>Brief de campaña</h2><Field label="Título interno" name="title" required/><Field label="Audiencia" name="audience" required/><TextAreaField label="Problema" name="problem_statement" required rows={3}/><TextAreaField label="Tesis única" name="thesis" required rows={3}/><TextAreaField label="Perspectiva propia de Puna" name="perspective" required rows={3}/><Field label="Objetivo" name="objective" required/><Field label="Oferta / CTA" name="offer_cta" required/><div className="ops-field-grid"><Field label="Dirección de arte" name="art_director"/><Field label="Aprobación de hechos" name="facts_approver"/></div><SubmitButton intent="create">Crear piloto</SubmitButton></Form></details></div>}/>
    {loaderData.created ? <Notice tone="success">Piloto creado.</Notice> : null}
    {actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    {loaderData.campaigns.length ? <div className="ops-art-list">{loaderData.campaigns.map((campaign: any) => {
      const social = Array.isArray(campaign.social_campaigns) ? campaign.social_campaigns[0] : campaign.social_campaigns;
      return <article className="ops-art-row" key={campaign.id}><span className="ops-art-row-icon"><Palette aria-hidden="true"/></span><div><small>Piloto · versión {campaign.current_version}</small><h2>{social?.title || "Campaña sin título"}</h2><p>{social?.audience}</p></div><div className="ops-art-row-status"><StatusBadge value={campaign.status}/><time dateTime={campaign.updated_at}>Actualizada {formatDate(campaign.updated_at, true)}</time></div><Link className="ops-button ops-button-secondary" to={`/ops/art/${campaign.id}`}>Abrir<ArrowRight size={16}/></Link></article>;
    })}</div> : <EmptyState title="Todavía no hay pilotos" body="Iniciá una campaña real de Puna. El alcance queda limitado a dos rutas y tres piezas."/>}
  </>;
}
