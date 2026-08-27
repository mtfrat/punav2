import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect } from "react-router";
import { CalendarDays, Plus, Save } from "lucide-react";
import { EmptyState, Field, formatDate, Notice, OpsPageHeader, Pager, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, pageFrom, paginationRange, requireAdmin, sourcesFromText, sourcesToText, stringField } from "../lib/admin.server";

const statuses = ["backlog", "approved", "drafting", "drafted", "used", "archived"];
const verticals = ["general_b2b", "automotive_dealers", "agricultural_equipment"];
const services = ["ai-automation", "custom-software", "data-integrations"];

function briefPayload(form: FormData) {
  return {
    title: stringField(form, "title", 240), vertical: stringField(form, "vertical", 60), service_cluster: stringField(form, "service_cluster", 60),
    audience: stringField(form, "audience", 500), target_query_en: stringField(form, "target_query_en", 300), target_query_es: stringField(form, "target_query_es", 300),
    angle: stringField(form, "angle", 1200), notes: stringField(form, "notes", 3000) || null, planned_for: stringField(form, "planned_for", 20) || null,
    source_urls: sourcesFromText(stringField(form, "source_urls", 10_000)),
  };
}

function validBrief(value: ReturnType<typeof briefPayload>) {
  return value.title && verticals.includes(value.vertical) && services.includes(value.service_cluster) && value.audience && value.target_query_en && value.target_query_es && value.angle;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request); const url = new URL(request.url); const page = pageFrom(request); const status = url.searchParams.get("status") || ""; const { from, to } = paginationRange(page);
  let query = context.service.from("content_briefs").select("*", { count: "exact" }).order("planned_for", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }).range(from, to);
  if (status) query = query.eq("status", status);
  const result = await query; if (result.error) throw new Response("No se pudieron cargar los briefs.", { status: 500 });
  return opsData({ briefs: (result.data || []).map((item) => ({ ...item, sources_text: sourcesToText(item.source_urls) })), count: result.count, page, status, saved: url.searchParams.get("saved") === "1" }, context.headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request); const context = await requireAdmin(request); const form = await request.formData(); const intent = stringField(form, "intent", 30); const id = stringField(form, "id", 80);
  if (intent === "create") {
    const payload = briefPayload(form); if (!validBrief(payload)) return opsData({ error: "Completá todos los campos obligatorios." }, context.headers, 400);
    const result = await context.service.from("content_briefs").insert({ ...payload, status: "backlog" }).select("*").single();
    if (result.error) return opsData({ error: "No se pudo crear el brief. El título puede estar duplicado." }, context.headers, 400);
    await audit(context, { action: "create", entityType: "content_brief", entityId: String(result.data.id), after: compactSnapshot(result.data) });
  } else {
    const beforeResult = await context.service.from("content_briefs").select("*").eq("id", id).maybeSingle(); if (!beforeResult.data) return opsData({ error: "Brief no encontrado." }, context.headers, 404); const before = beforeResult.data;
    if (intent === "save") {
      const payload = briefPayload(form); if (!validBrief(payload)) return opsData({ error: "Completá todos los campos obligatorios." }, context.headers, 400);
      const result = await context.service.from("content_briefs").update(payload).eq("id", id).select("*").single(); if (result.error) return opsData({ error: "No se pudo guardar el brief." }, context.headers, 400);
      await audit(context, { action: "save", entityType: "content_brief", entityId: id, before: compactSnapshot(before), after: compactSnapshot(result.data) });
    } else if (intent === "status") {
      const status = stringField(form, "status", 30); if (!statuses.includes(status)) return opsData({ error: "Estado inválido." }, context.headers, 400);
      if (status === "approved") { const payload = { ...before, source_urls: Array.isArray(before.source_urls) ? before.source_urls : [] }; if (!validBrief(payload as ReturnType<typeof briefPayload>) || payload.source_urls.length < 2) return opsData({ error: "Para aprobar se requieren todos los campos y al menos dos fuentes HTTPS." }, context.headers, 400); }
      const result = await context.service.from("content_briefs").update({ status }).eq("id", id).select("*").single(); if (result.error) return opsData({ error: "No se pudo cambiar el estado." }, context.headers, 400);
      await audit(context, { action: `status_${status}`, entityType: "content_brief", entityId: id, before: compactSnapshot(before), after: compactSnapshot(result.data) });
    } else return opsData({ error: "Acción inválida." }, context.headers, 400);
  }
  throw redirect("/ops/briefs?saved=1", { headers: operationsHeaders(context.headers) });
}

function BriefFields({ brief }: { brief?: Record<string, any> }) {
  return <><div className="ops-field-grid"><Field label="Título" name="title" value={brief?.title} required/><Field label="Audiencia" name="audience" value={brief?.audience} required/></div><div className="ops-field-grid"><Field label="Vertical" name="vertical" required><select name="vertical" defaultValue={brief?.vertical || "general_b2b"}>{verticals.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Servicio" name="service_cluster" required><select name="service_cluster" defaultValue={brief?.service_cluster || "ai-automation"}>{services.map((item) => <option key={item}>{item}</option>)}</select></Field></div><div className="ops-field-grid"><Field label="Target query EN" name="target_query_en" value={brief?.target_query_en} required/><Field label="Target query ES" name="target_query_es" value={brief?.target_query_es} required/></div><TextAreaField label="Ángulo" name="angle" value={brief?.angle} required rows={4}/><TextAreaField label="Fuentes" name="source_urls" value={brief?.sources_text} rows={4} hint="Al menos dos para aprobar. Una por línea: Título | https://…"/><div className="ops-field-grid"><Field label="Fecha planificada" name="planned_for" type="date" value={brief?.planned_for}/><Field label="Notas" name="notes" value={brief?.notes}/></div></>;
}

export default function OpsBriefs({ loaderData, actionData }: { loaderData: { briefs: Array<Record<string, any>>; count: number | null; page: number; status: string; saved: boolean }; actionData?: { error?: string } }) {
  const params = new URLSearchParams(); if (loaderData.status) params.set("status", loaderData.status);
  return <><OpsPageHeader eyebrow="Plan editorial" title="Briefs para n8n" description="n8n toma únicamente el brief aprobado más antiguo. Crear o editar nunca ejecuta el workflow." action={<details className="ops-create"><summary><Plus aria-hidden="true"/>Nuevo brief</summary><Form method="post" className="ops-form ops-popover-form"><BriefFields/><SubmitButton intent="create"><Plus aria-hidden="true" size={17}/>Crear en backlog</SubmitButton></Form></details>}/>{loaderData.saved ? <Notice tone="success">Brief actualizado.</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    <Form method="get" className="ops-filters ops-filters-compact"><label><span>Estado</span><select name="status" defaultValue={loaderData.status}><option value="">Todos</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><button className="ops-button ops-button-secondary" type="submit">Filtrar</button></Form>
    {loaderData.briefs.length ? <div className="ops-stack">{loaderData.briefs.map((brief) => <details className="ops-record" key={brief.id}><summary><div><span className="ops-record-icon"><CalendarDays aria-hidden="true"/></span><span><strong>{brief.title}</strong><small>{brief.audience} · {formatDate(brief.planned_for)}</small></span></div><StatusBadge value={brief.status}/></summary><div className="ops-record-body"><Form method="post" className="ops-form"><input type="hidden" name="id" value={brief.id}/><BriefFields brief={brief}/><div className="ops-form-actions"><SubmitButton intent="save"><Save aria-hidden="true" size={17}/>Guardar</SubmitButton></div></Form><Form method="post" className="ops-action-row"><input type="hidden" name="id" value={brief.id}/><input type="hidden" name="intent" value="status"/><button className="ops-button ops-button-secondary" name="status" value="approved">Aprobar para n8n</button><button className="ops-button ops-button-secondary" name="status" value="backlog">Volver a backlog</button><button className="ops-button ops-button-danger" name="status" value="archived" onClick={(event) => { if (!window.confirm("¿Archivar este brief?")) event.preventDefault(); }}>Archivar</button></Form></div></details>)}</div> : <EmptyState title="No hay briefs" body="Creá un brief basado en una intención de compra real y fuentes verificables."/>}<Pager page={loaderData.page} count={loaderData.count} path="/ops/briefs" params={params}/>
  </>;
}
