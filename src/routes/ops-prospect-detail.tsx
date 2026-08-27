import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { ArrowLeft, ExternalLink, Mail, MapPin, Save } from "lucide-react";
import { formatDate, jsonSummary, Notice, OpsPageHeader, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, requireAdmin, stringField } from "../lib/admin.server";

const accountStatuses = ["new", "qualified", "disqualified", "reviewed", "contacted", "do_not_contact"];
const draftStatuses = ["draft", "approved", "rejected", "contacted"];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const context = await requireAdmin(request); const id = params.id || "";
  const [account, draft] = await Promise.all([context.service.from("prospect_accounts").select("*").eq("id", id).maybeSingle(), context.service.from("prospect_drafts").select("*").eq("prospect_id", id).maybeSingle()]);
  if (!account.data) throw new Response("Not found", { status: 404 });
  return opsData({ account: account.data, draft: draft.data, saved: new URL(request.url).searchParams.get("saved") === "1" }, context.headers);
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertTrustedMutation(request); const context = await requireAdmin(request); const id = params.id || ""; const form = await request.formData(); const intent = stringField(form, "intent", 30);
  if (intent === "account_status") {
    const status = stringField(form, "status", 30); if (!accountStatuses.includes(status)) return opsData({ error: "Estado inválido." }, context.headers, 400);
    const before = await context.service.from("prospect_accounts").select("*").eq("id", id).maybeSingle(); if (!before.data) return opsData({ error: "Prospecto no encontrado." }, context.headers, 404);
    const result = await context.service.from("prospect_accounts").update({ status }).eq("id", id).select("*").single(); if (result.error) return opsData({ error: "No se pudo actualizar el prospecto." }, context.headers, 400);
    await audit(context, { action: `status_${status}`, entityType: "prospect_account", entityId: id, before: compactSnapshot(before.data), after: compactSnapshot(result.data) });
  } else if (intent === "draft_save" || intent === "draft_status") {
    const before = await context.service.from("prospect_drafts").select("*").eq("prospect_id", id).maybeSingle(); if (!before.data) return opsData({ error: "Este prospecto no tiene borrador." }, context.headers, 404);
    if (intent === "draft_save") {
      const subject = stringField(form, "subject", 180); const message = stringField(form, "message", 3000); if (!subject || message.length < 20) return opsData({ error: "Completá asunto y mensaje." }, context.headers, 400);
      const result = await context.service.from("prospect_drafts").update({ subject, message }).eq("id", before.data.id).select("*").single(); if (result.error) return opsData({ error: "No se pudo guardar el borrador." }, context.headers, 400);
      await audit(context, { action: "save", entityType: "prospect_draft", entityId: String(before.data.id), before: compactSnapshot(before.data), after: compactSnapshot(result.data) });
    } else {
      const status = stringField(form, "status", 30); if (!draftStatuses.includes(status)) return opsData({ error: "Estado inválido." }, context.headers, 400);
      const result = await context.service.from("prospect_drafts").update({ status }).eq("id", before.data.id).select("*").single(); if (result.error) return opsData({ error: "No se pudo cambiar el estado." }, context.headers, 400);
      await audit(context, { action: `status_${status}`, entityType: "prospect_draft", entityId: String(before.data.id), before: compactSnapshot(before.data), after: compactSnapshot(result.data) });
    }
  } else return opsData({ error: "Acción inválida." }, context.headers, 400);
  throw redirect(`/ops/prospects/${id}?saved=1`, { headers: operationsHeaders(context.headers) });
}

export default function OpsProspectDetail({ loaderData, actionData }: { loaderData: { account: Record<string, any>; draft: Record<string, any> | null; saved: boolean }; actionData?: { error?: string } }) {
  const { account, draft } = loaderData;
  return <><Link className="ops-back" to="/ops/prospects"><ArrowLeft aria-hidden="true" size={18}/>Volver a prospectos</Link><OpsPageHeader eyebrow={account.vertical.replace(/_/g, " ")} title={account.business_name} description={`${[account.city, account.province].filter(Boolean).join(", ")} · score ${account.score}/100`} action={<StatusBadge value={account.status}/>}/>{loaderData.saved ? <Notice tone="success">Prospecto actualizado. No se envió ningún mensaje.</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    <div className="ops-detail-grid"><section className="ops-panel"><p className="ops-eyebrow">Cuenta</p><h2>Evidencia pública</h2><dl className="ops-definition"><div><dt>Categoría</dt><dd>{account.category || "—"}</dd></div><div><dt>Dirección</dt><dd>{account.address || "—"}</dd></div><div><dt>Teléfono</dt><dd>{account.phone || "—"}</dd></div><div><dt>Email público</dt><dd>{account.public_email ? <a href={`mailto:${account.public_email}`}><Mail aria-hidden="true" size={15}/>{account.public_email}</a> : "—"}</dd></div><div><dt>Rating</dt><dd>{account.rating ? `${account.rating} (${account.review_count || 0} reseñas)` : "—"}</dd></div><div><dt>Sucursales</dt><dd>{account.branch_count}</dd></div><div><dt>Recolectado</dt><dd>{formatDate(account.collected_at, true)}</dd></div></dl><div className="ops-external-links">{account.website ? <a href={account.website} target="_blank" rel="noreferrer">Sitio web <ExternalLink aria-hidden="true" size={15}/></a> : null}{account.maps_url ? <a href={account.maps_url} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" size={15}/>Google Maps</a> : null}</div><h3>Señales</h3><p className="ops-evidence">{jsonSummary(account.signals)}</p><h3>Evidencia</h3><p className="ops-evidence">{jsonSummary(account.evidence)}</p><Form method="post" className="ops-action-row"><input type="hidden" name="intent" value="account_status"/>{accountStatuses.map((status) => <button key={status} className={status === "do_not_contact" ? "ops-button ops-button-danger" : "ops-button ops-button-secondary"} name="status" value={status} onClick={status === "contacted" || status === "do_not_contact" ? (event) => { if (!window.confirm(`¿Marcar la cuenta como ${status}?`)) event.preventDefault(); } : undefined}>{status.replace(/_/g, " ")}</button>)}</Form></section>
      <section className="ops-panel"><p className="ops-eyebrow">Contacto manual</p><h2>Borrador de email</h2>{draft ? <><Form method="post" className="ops-form"><input type="hidden" name="intent" value="draft_save"/><label className="ops-field"><span>Asunto</span><input name="subject" defaultValue={draft.subject} required maxLength={180}/></label><TextAreaField label="Mensaje" name="message" value={draft.message} required rows={16} maxLength={3000}/><SubmitButton intent="draft_save"><Save aria-hidden="true" size={17}/>Guardar borrador</SubmitButton></Form><div className="ops-draft-state"><StatusBadge value={draft.status}/><p>Aprobar solo registra tu revisión. Copiá y enviá el mensaje fuera del dashboard.</p></div><Form method="post" className="ops-action-row"><input type="hidden" name="intent" value="draft_status"/><button className="ops-button ops-button-secondary" name="status" value="approved">Aprobar</button><button className="ops-button ops-button-secondary" name="status" value="rejected">Rechazar</button><button className="ops-button" name="status" value="contacted" onClick={(event) => { if (!window.confirm("Confirmá solo después de contactar manualmente al negocio.")) event.preventDefault(); }}>Marcar contactado</button></Form></> : <div className="ops-empty-inline"><p>No hay un borrador para esta cuenta. El dashboard no lo genera ni inicia n8n.</p></div>}</section></div>
  </>;
}
