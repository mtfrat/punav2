import type { LoaderFunctionArgs } from "react-router";
import { Link } from "react-router";
import { ArrowRight, BookOpenText, CircleAlert, FileCheck2, Inbox, UsersRound } from "lucide-react";
import { formatDate, OpsPageHeader, StatusBadge } from "../components/ops";
import { opsData, requireAdmin } from "../lib/admin.server";

async function count(query: PromiseLike<{ count: number | null }>) {
  const result = await query;
  return result.count || 0;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  const [draftPosts, approvedBriefs, qualifiedProspects, newLeads, editorialFailed, prospectFailed, activity] = await Promise.all([
    count(context.service.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft")),
    count(context.service.from("content_briefs").select("id", { count: "exact", head: true }).eq("status", "approved")),
    count(context.service.from("prospect_accounts").select("id", { count: "exact", head: true }).eq("status", "qualified")),
    count(context.service.from("website_leads").select("id", { count: "exact", head: true }).eq("status", "new")),
    count(context.service.from("editorial_runs").select("id", { count: "exact", head: true }).eq("status", "failed")),
    count(context.service.from("prospect_runs").select("id", { count: "exact", head: true }).eq("status", "failed")),
    context.service.from("admin_audit_log").select("id,action,entity_type,entity_id,created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  return opsData({ draftPosts, approvedBriefs, qualifiedProspects, newLeads, failedRuns: editorialFailed + prospectFailed, activity: activity.data || [] }, context.headers);
}

const cards = [
  { key: "draftPosts", label: "Artículos por revisar", href: "/ops/content?status=draft", icon: BookOpenText },
  { key: "approvedBriefs", label: "Briefs listos para n8n", href: "/ops/briefs?status=approved", icon: FileCheck2 },
  { key: "qualifiedProspects", label: "Prospectos calificados", href: "/ops/prospects?status=qualified", icon: UsersRound },
  { key: "newLeads", label: "Consultas nuevas", href: "/ops/leads?status=new", icon: Inbox },
  { key: "failedRuns", label: "Ejecuciones fallidas", href: "/ops/runs?status=failed", icon: CircleAlert },
] as const;

export default function OpsIndex({ loaderData }: { loaderData: Record<(typeof cards)[number]["key"], number> & { activity: Array<Record<string, string>> } }) {
  return <><OpsPageHeader eyebrow="Centro operativo" title="Lo que requiere tu atención" description="Una vista breve de las colas privadas. Ninguna acción de este panel envía emails ni ejecuta workflows."/>
    <section className="ops-metric-grid" aria-label="Colas de revisión">{cards.map(({ key, label, href, icon: Icon }) => <Link className="ops-metric" to={href} key={key}><div><Icon aria-hidden="true"/><span>{label}</span></div><strong>{loaderData[key]}</strong><span>Revisar <ArrowRight aria-hidden="true" size={16}/></span></Link>)}</section>
    <section className="ops-section"><div className="ops-section-heading"><div><p className="ops-eyebrow">Auditoría</p><h2>Actividad reciente</h2></div></div>{loaderData.activity.length ? <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Acción</th><th>Entidad</th><th>Referencia</th><th>Fecha</th></tr></thead><tbody>{loaderData.activity.map((item) => <tr key={item.id}><td data-label="Acción"><StatusBadge value={item.action}/></td><td data-label="Entidad">{item.entity_type}</td><td data-label="Referencia"><code>{item.entity_id}</code></td><td data-label="Fecha">{formatDate(item.created_at, true)}</td></tr>)}</tbody></table></div> : <p className="ops-muted">Todavía no hay cambios realizados desde el dashboard.</p>}</section>
  </>;
}
