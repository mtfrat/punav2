import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect } from "react-router";
import { Save, Send } from "lucide-react";
import { EmptyState, Notice, OpsPageHeader, Pager, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, pageFrom, paginationRange, requireAdmin, stringField } from "../lib/admin.server";

const statuses = ["draft", "approved", "published", "archived"];

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request); const url = new URL(request.url); const page = pageFrom(request); const status = url.searchParams.get("status") || ""; const channel = url.searchParams.get("channel") || ""; const { from, to } = paginationRange(page);
  let query = context.service.from("content_distribution_drafts").select("*", { count: "exact" }).order("updated_at", { ascending: false }).range(from, to); if (status) query = query.eq("status", status); if (channel) query = query.eq("channel", channel);
  const result = await query; if (result.error) throw new Response("No se pudieron cargar los borradores.", { status: 500 });
  return opsData({ drafts: result.data || [], count: result.count, page, filters: { status, channel }, saved: url.searchParams.get("saved") === "1" }, context.headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request); const context = await requireAdmin(request); const form = await request.formData(); const id = stringField(form, "id", 80); const intent = stringField(form, "intent", 30);
  const beforeResult = await context.service.from("content_distribution_drafts").select("*").eq("id", id).maybeSingle(); if (!beforeResult.data) return opsData({ error: "Borrador no encontrado." }, context.headers, 404); const before = beforeResult.data;
  if (intent === "save") {
    const content = stringField(form, "content", 10_000); if (!content) return opsData({ error: "El contenido no puede quedar vacío." }, context.headers, 400);
    const result = await context.service.from("content_distribution_drafts").update({ content }).eq("id", id).select("*").single(); if (result.error) return opsData({ error: "No se pudo guardar." }, context.headers, 400);
    await audit(context, { action: "save", entityType: "distribution_draft", entityId: id, before: compactSnapshot(before), after: compactSnapshot(result.data) });
  } else if (intent === "status") {
    const status = stringField(form, "status", 30); if (!statuses.includes(status)) return opsData({ error: "Estado inválido." }, context.headers, 400);
    const result = await context.service.from("content_distribution_drafts").update({ status }).eq("id", id).select("*").single(); if (result.error) return opsData({ error: "No se pudo actualizar el estado." }, context.headers, 400);
    await audit(context, { action: `status_${status}`, entityType: "distribution_draft", entityId: id, before: compactSnapshot(before), after: compactSnapshot(result.data) });
  } else return opsData({ error: "Acción inválida." }, context.headers, 400);
  throw redirect("/ops/distribution?saved=1", { headers: operationsHeaders(context.headers) });
}

export default function OpsDistribution({ loaderData, actionData }: { loaderData: { drafts: Array<Record<string, any>>; count: number | null; page: number; filters: { status: string; channel: string }; saved: boolean }; actionData?: { error?: string } }) {
  const params = new URLSearchParams(); if (loaderData.filters.status) params.set("status", loaderData.filters.status); if (loaderData.filters.channel) params.set("channel", loaderData.filters.channel);
  return <><OpsPageHeader eyebrow="Distribución manual" title="Borradores sociales" description="Editar y aprobar no publica nada. Marcá published únicamente después de publicarlo manualmente en la red."/>{loaderData.saved ? <Notice tone="success">Borrador actualizado.</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}<Form method="get" className="ops-filters"><label><span>Canal</span><select name="channel" defaultValue={loaderData.filters.channel}><option value="">Todos</option><option value="linkedin">LinkedIn</option><option value="x">X</option></select></label><label><span>Estado</span><select name="status" defaultValue={loaderData.filters.status}><option value="">Todos</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><button className="ops-button ops-button-secondary">Filtrar</button></Form>
    {loaderData.drafts.length ? <div className="ops-stack">{loaderData.drafts.map((draft) => <article className="ops-social-card" key={draft.id}><header><div><Send aria-hidden="true"/><strong>{draft.channel === "linkedin" ? "LinkedIn" : "X"} · {draft.locale.toUpperCase()}</strong></div><StatusBadge value={draft.status}/></header><Form method="post" className="ops-form"><input type="hidden" name="id" value={draft.id}/><TextAreaField label="Contenido" name="content" value={draft.content} required rows={draft.channel === "linkedin" ? 10 : 6}/><small className="ops-counter">{String(draft.content).length} caracteres · grupo {draft.translation_group_id}</small><div className="ops-form-actions"><SubmitButton intent="save"><Save aria-hidden="true" size={17}/>Guardar</SubmitButton></div></Form><Form method="post" className="ops-action-row"><input type="hidden" name="id" value={draft.id}/><input type="hidden" name="intent" value="status"/><button className="ops-button ops-button-secondary" name="status" value="approved">Aprobar</button><button className="ops-button ops-button-secondary" name="status" value="published" onClick={(event) => { if (!window.confirm("Esto solo registra que ya lo publicaste manualmente. ¿Continuar?")) event.preventDefault(); }}>Marcar publicado</button><button className="ops-button ops-button-danger" name="status" value="archived">Archivar</button></Form></article>)}</div> : <EmptyState title="No hay borradores sociales" body="Aparecerán cuando el workflow editorial cree un nuevo par de artículos."/>}<Pager page={loaderData.page} count={loaderData.count} path="/ops/distribution" params={params}/>
  </>;
}
