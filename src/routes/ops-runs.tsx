import type { LoaderFunctionArgs } from "react-router";
import { Form } from "react-router";
import { Activity, Bot, SearchX } from "lucide-react";
import { EmptyState, formatDate, jsonSummary, OpsPageHeader, StatusBadge } from "../components/ops";
import { opsData, requireAdmin } from "../lib/admin.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request); const url = new URL(request.url); const status = url.searchParams.get("status") || ""; const kind = url.searchParams.get("kind") || "";
  let editorialQuery = context.service.from("editorial_runs").select("*").order("created_at", { ascending: false }).limit(50); let prospectQuery = context.service.from("prospect_runs").select("*").order("created_at", { ascending: false }).limit(50);
  if (status) { editorialQuery = editorialQuery.eq("status", status); prospectQuery = prospectQuery.eq("status", status); }
  const [editorial, prospect] = await Promise.all([kind === "prospecting" ? Promise.resolve({ data: [] }) : editorialQuery, kind === "editorial" ? Promise.resolve({ data: [] }) : prospectQuery]);
  const runs = [...(editorial.data || []).map((item: any) => ({ ...item, kind: "editorial", occurred_at: item.created_at, error_text: item.reason })), ...(prospect.data || []).map((item: any) => ({ ...item, kind: "prospecting", occurred_at: item.started_at, error_text: item.error }))].sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at)));
  return opsData({ runs, filters: { status, kind } }, context.headers);
}

export default function OpsRuns({ loaderData }: { loaderData: { runs: Array<Record<string, any>>; filters: { status: string; kind: string } } }) {
  return <><OpsPageHeader eyebrow="Observabilidad" title="Ejecuciones de n8n" description="Vista read-only. El dashboard no puede ejecutar, pausar, reintentar ni modificar workflows."/><Form method="get" className="ops-filters ops-filters-compact"><label><span>Workflow</span><select name="kind" defaultValue={loaderData.filters.kind}><option value="">Todos</option><option value="editorial">Editorial</option><option value="prospecting">Prospecting</option></select></label><label><span>Estado exacto</span><input name="status" defaultValue={loaderData.filters.status} placeholder="failed, drafted…"/></label><button className="ops-button ops-button-secondary">Filtrar</button></Form>
    {loaderData.runs.length ? <div className="ops-stack">{loaderData.runs.map((run) => <details className="ops-run" key={`${run.kind}-${run.id}`}><summary><div><span className="ops-record-icon">{run.kind === "editorial" ? <Bot aria-hidden="true"/> : <SearchX aria-hidden="true"/>}</span><span><strong>{run.kind === "editorial" ? "Editorial" : "Prospecting"}</strong><small>{formatDate(run.occurred_at, true)} · ejecución {run.workflow_execution_id || "sin ID"}</small></span></div><StatusBadge value={run.status}/></summary><div className="ops-run-detail"><dl className="ops-definition"><div><dt>Resultados</dt><dd>{run.kind === "editorial" ? run.translation_group_id || "—" : `${run.stored_count || 0} guardados / ${run.result_count || 0} encontrados`}</dd></div><div><dt>Duplicados/descartados</dt><dd>{run.kind === "prospecting" ? `${run.duplicate_count || 0} / ${run.discarded_count || 0}` : "—"}</dd></div><div><dt>Costo estimado</dt><dd>{run.kind === "prospecting" ? `US$ ${Number(run.estimated_cost_usd || 0).toFixed(4)}` : "—"}</dd></div><div><dt>Queries</dt><dd>{jsonSummary(run.queries)}</dd></div></dl>{run.error_text ? <div className="ops-run-error" role="alert"><Activity aria-hidden="true"/><pre>{String(run.error_text).slice(0, 4000)}</pre></div> : <p className="ops-muted">Sin error registrado.</p>}</div></details>)}</div> : <EmptyState title="No hay ejecuciones" body="Los registros aparecerán cuando n8n ejecute los workflows configurados."/>}
  </>;
}
