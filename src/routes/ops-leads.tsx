import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect } from "react-router";
import { Mail, Save } from "lucide-react";
import { EmptyState, formatDate, Notice, OpsPageHeader, Pager, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, pageFrom, paginationRange, requireAdmin, stringField } from "../lib/admin.server";

const statuses = ["new", "reviewing", "qualified", "closed", "spam"];

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request); const url = new URL(request.url); const page = pageFrom(request); const status = url.searchParams.get("status") || ""; const { from, to } = paginationRange(page);
  let query = context.service.from("website_leads").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to); if (status) query = query.eq("status", status);
  const result = await query; if (result.error) throw new Response("No se pudieron cargar los leads.", { status: 500 });
  return opsData({ leads: result.data || [], count: result.count, page, status, saved: url.searchParams.get("saved") === "1" }, context.headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request); const context = await requireAdmin(request); const form = await request.formData(); const id = stringField(form, "id", 80); const status = stringField(form, "status", 30); const internalNotes = stringField(form, "internal_notes", 5000);
  if (!statuses.includes(status)) return opsData({ error: "Estado inválido." }, context.headers, 400);
  const before = await context.service.from("website_leads").select("*").eq("id", id).maybeSingle(); if (!before.data) return opsData({ error: "Lead no encontrado." }, context.headers, 404);
  const result = await context.service.from("website_leads").update({ status, internal_notes: internalNotes || null }).eq("id", id).select("*").single(); if (result.error) return opsData({ error: "No se pudo guardar el lead." }, context.headers, 400);
  await audit(context, { action: `status_${status}`, entityType: "website_lead", entityId: id, before: compactSnapshot(before.data), after: compactSnapshot(result.data) });
  throw redirect("/ops/leads?saved=1", { headers: operationsHeaders(context.headers) });
}

export default function OpsLeads({ loaderData, actionData }: { loaderData: { leads: Array<Record<string, any>>; count: number | null; page: number; status: string; saved: boolean }; actionData?: { error?: string } }) {
  const params = new URLSearchParams(); if (loaderData.status) params.set("status", loaderData.status);
  return <><OpsPageHeader eyebrow="Inbound" title="Consultas del sitio" description="Datos privados del project brief. No se envían a analytics ni se exponen en rutas públicas."/>{loaderData.saved ? <Notice tone="success">Lead actualizado.</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}<Form method="get" className="ops-filters ops-filters-compact"><label><span>Estado</span><select name="status" defaultValue={loaderData.status}><option value="">Todos</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><button className="ops-button ops-button-secondary">Filtrar</button></Form>
    {loaderData.leads.length ? <div className="ops-stack">{loaderData.leads.map((lead) => <article className="ops-lead-card" key={lead.id}><header><div><strong>{lead.name} · {lead.company}</strong><a href={`mailto:${lead.work_email}`}><Mail aria-hidden="true" size={15}/>{lead.work_email}</a></div><StatusBadge value={lead.status}/></header><div className="ops-lead-meta"><span>{lead.locale.toUpperCase()}</span><span>{lead.budget_range?.replace(/_/g, " ") || "Sin presupuesto"}</span><span>{lead.source}</span><time>{formatDate(lead.created_at, true)}</time></div><blockquote>{lead.problem}</blockquote><Form method="post" className="ops-form"><input type="hidden" name="id" value={lead.id}/><TextAreaField label="Notas internas" name="internal_notes" value={lead.internal_notes} rows={4} maxLength={5000}/><label className="ops-field"><span>Estado</span><select name="status" defaultValue={lead.status}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><SubmitButton intent="save"><Save aria-hidden="true" size={17}/>Guardar seguimiento</SubmitButton></Form></article>)}</div> : <EmptyState title="No hay consultas en esta vista" body="Las nuevas solicitudes del project brief aparecerán acá."/>}<Pager page={loaderData.page} count={loaderData.count} path="/ops/leads" params={params}/>
  </>;
}
