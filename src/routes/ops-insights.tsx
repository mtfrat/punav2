import type { LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { Activity, AlertTriangle, BarChart3, Clock3, Coins, FileClock, Gauge, ShieldCheck } from "lucide-react";
import { EmptyState, OpsPageHeader, Pager, StatusBadge, formatDate } from "../components/ops";
import { operationsHeaders, opsData, requireAdmin } from "../lib/admin.server";
import { contentQualityEnabled } from "../lib/content-worker.server";
import { contentQualityConfigurationValid } from "../lib/social-observability.server";
import { isSocialChannel, isSocialLocale } from "../lib/social-studio";

const PAGE_SIZE = 25;
const periods = new Set(["7", "30", "90", "all"]);
const runStatuses = new Set(["pending", "running", "succeeded", "failed"]);

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function percentile(values: number[], fraction: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}
function duration(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "Sin datos";
  if (value < 60_000) return `${Math.round(value / 1000)} s`;
  const hours = Math.floor(value / 3_600_000); const minutes = Math.round((value % 3_600_000) / 60_000);
  return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
}
function percentage(numerator: number, denominator: number) { return denominator ? `${Math.round((numerator / denominator) * 100)}%` : "Sin datos"; }
function safeSnapshot(value: unknown) { return value && typeof value === "object" ? value as Record<string, any> : {}; }

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentQualityEnabled()) throw redirect("/ops", { headers: operationsHeaders(context.headers) });
  if (!contentQualityConfigurationValid()) throw new Response("Configurá las tarifas server-side antes de habilitar Calidad y métricas.", { status: 503 });
  const url = new URL(request.url); const period = periods.has(url.searchParams.get("period") || "") ? url.searchParams.get("period")! : "30";
  const channel = isSocialChannel(url.searchParams.get("channel") || "") ? url.searchParams.get("channel")! : "";
  const locale = isSocialLocale(url.searchParams.get("locale") || "") ? url.searchParams.get("locale")! : "";
  const status = runStatuses.has(url.searchParams.get("status") || "") ? url.searchParams.get("status")! : "";
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const since = period === "all" ? null : new Date(Date.now() - Number(period) * 86_400_000).toISOString();

  let draftsQuery = context.service.from("content_distribution_drafts").select("id,campaign_id,channel,locale,status,created_at,published_at,scheduled_for,brand_template_id").limit(5000);
  if (channel) draftsQuery = draftsQuery.eq("channel", channel); if (locale) draftsQuery = draftsQuery.eq("locale", locale);
  const [draftsResult, campaignsResult] = await Promise.all([
    draftsQuery,
    context.service.from("social_campaigns").select("id,title,created_at").limit(5000),
  ]);
  if (draftsResult.error || campaignsResult.error) throw new Response("No se pudieron calcular las métricas editoriales.", { status: 500 });
  const drafts = draftsResult.data || []; const draftIds = drafts.map((draft) => draft.id); const campaignById = new Map((campaignsResult.data || []).map((item) => [item.id, item]));

  let versionsQuery = context.service.from("social_variant_versions").select("id,draft_id,campaign_id,change_type,content_hash,snapshot,created_at").order("created_at").limit(5000);
  if (channel || locale) versionsQuery = draftIds.length ? versionsQuery.in("draft_id", draftIds) : versionsQuery.eq("draft_id", "00000000-0000-0000-0000-000000000000");
  let runsMetricsQuery = context.service.from("social_generation_runs").select("id,draft_id,operation,status,duration_ms,input_tokens,cached_input_tokens,output_tokens,estimated_cost_usd,error_code,created_at").limit(5000);
  if (since) runsMetricsQuery = runsMetricsQuery.gte("created_at", since); if (status) runsMetricsQuery = runsMetricsQuery.eq("status", status); if (channel || locale) runsMetricsQuery = draftIds.length ? runsMetricsQuery.in("draft_id", draftIds) : runsMetricsQuery.eq("draft_id", "00000000-0000-0000-0000-000000000000");
  let runsPageQuery = context.service.from("social_generation_runs").select("id,campaign_id,draft_id,operation,stage,status,model,request_id,request_trace,duration_ms,input_tokens,cached_input_tokens,output_tokens,estimated_cost_usd,error_code,error_message,retryable,created_at", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (since) runsPageQuery = runsPageQuery.gte("created_at", since); if (status) runsPageQuery = runsPageQuery.eq("status", status); if (channel || locale) runsPageQuery = draftIds.length ? runsPageQuery.in("draft_id", draftIds) : runsPageQuery.eq("draft_id", "00000000-0000-0000-0000-000000000000");
  const [versionsResult, runsResult, runsPageResult] = await Promise.all([versionsQuery, runsMetricsQuery, runsPageQuery]);
  if (versionsResult.error || runsResult.error || runsPageResult.error) throw new Response("No se pudieron cargar calidad y ejecuciones.", { status: 500 });
  const versions = versionsResult.data || []; const runs = runsResult.data || [];
  const versionsByDraft = new Map<string, any[]>();
  for (const version of versions) versionsByDraft.set(version.draft_id, [...(versionsByDraft.get(version.draft_id) || []), version]);

  const inPeriod = (date: string | null | undefined) => Boolean(date) && (!since || Date.parse(date!) >= Date.parse(since));
  const ideaToDraft = drafts.flatMap((draft) => { const campaign = campaignById.get(draft.campaign_id); return campaign && inPeriod(draft.created_at) ? [Date.parse(draft.created_at) - Date.parse(campaign.created_at)] : []; }).filter((value) => value >= 0);
  const decisionTimes: number[] = []; let generatedApprovals = 0; let unchangedApprovals = 0; let revisionTotal = 0;
  for (const draft of drafts) {
    const history = versionsByDraft.get(draft.id) || []; const first = history[0]; const decision = history.find((item) => (item.change_type === "approved" || item.change_type === "rejected") && inPeriod(item.created_at));
    if (first && decision) decisionTimes.push(Date.parse(decision.created_at) - Date.parse(first.created_at));
    const approval = history.find((item) => item.change_type === "approved" && inPeriod(item.created_at));
    if (first?.change_type === "generated" && approval) { generatedApprovals += 1; if (first.content_hash === approval.content_hash) unchangedApprovals += 1; }
    if (approval) revisionTotal += history.filter((item) => Date.parse(item.created_at) <= Date.parse(approval.created_at) && ["edited", "regenerated", "restored"].includes(item.change_type)).length;
  }
  const published = drafts.filter((draft) => draft.status === "published" && inPeriod(draft.published_at)); const scheduled = drafts.filter((draft) => draft.status === "scheduled" && inPeriod(draft.scheduled_for));
  const completedDurations = runs.flatMap((run) => run.duration_ms == null ? [] : [Number(run.duration_ms)]); const failedRuns = runs.filter((run) => run.status === "failed");
  const flags = versions.filter((version) => inPeriod(version.created_at) && (version.change_type === "quality_reviewed" || version.change_type === "approved")).flatMap((version) => safeSnapshot(version.snapshot).quality_flags || []);
  const flagCounts = new Map<string, { code: string; severity: string; count: number }>();
  for (const flag of flags) { const key = `${flag.severity}:${flag.code}`; const current = flagCounts.get(key); flagCounts.set(key, { code: flag.code, severity: flag.severity, count: (current?.count || 0) + 1 }); }
  const issues = versions.filter((version) => inPeriod(version.created_at)).flatMap((version) => (safeSnapshot(version.snapshot).quality_flags || []).filter((flag: any) => ["duplicate_exact", "duplicate_similar", "unsupported_number"].includes(flag.code)).map((flag: any) => ({ ...flag, draftId: version.draft_id, campaignId: version.campaign_id, createdAt: version.created_at }))).slice(-10).reverse();
  const totalCost = runs.reduce((sum, run) => sum + Number(run.estimated_cost_usd || 0), 0); const pricedRuns = runs.filter((run) => run.estimated_cost_usd != null).length;
  const unpricedCompletedRuns = runs.filter((run) => run.status === "succeeded" && run.estimated_cost_usd == null).length;
  const params = new URLSearchParams(url.searchParams); params.delete("page");
  return opsData({ filters: { period, channel, locale, status }, page, params: params.toString(), runs: runsPageResult.data || [], runCount: runsPageResult.count,
    metrics: { ideaToDraft: median(ideaToDraft), decision: median(decisionTimes), approvalWithoutEdits: percentage(unchangedApprovals, generatedApprovals), revisions: generatedApprovals ? revisionTotal / generatedApprovals : null,
      templateShare: percentage(published.filter((draft) => draft.brand_template_id).length, published.length), scheduled: scheduled.length, published: published.length,
      runCount: runs.length, failedRuns: failedRuns.length, cost: pricedRuns ? totalCost : null, unpricedCompletedRuns, inputTokens: runs.reduce((sum, run) => sum + Number(run.input_tokens || 0), 0), cachedInputTokens: runs.reduce((sum, run) => sum + Number(run.cached_input_tokens || 0), 0), outputTokens: runs.reduce((sum, run) => sum + Number(run.output_tokens || 0), 0), durationMedian: median(completedDurations), durationP95: percentile(completedDurations, .95) },
    flagCounts: [...flagCounts.values()].sort((a, b) => b.count - a.count), issues }, context.headers);
}

export default function OpsInsights({ loaderData }: { loaderData: any }) {
  const m = loaderData.metrics; const params = new URLSearchParams(loaderData.params);
  return <>
    <OpsPageHeader eyebrow="Editorial · Aprendizaje" title="Calidad y métricas" description="Datos reales del proceso editorial y de las ejecuciones. Hora de Buenos Aires."/>
    <Form method="get" className="ops-filters ops-filters-compact"><label><span>Período</span><select name="period" defaultValue={loaderData.filters.period}><option value="7">7 días</option><option value="30">30 días</option><option value="90">90 días</option><option value="all">Todo</option></select></label><label><span>Canal</span><select name="channel" defaultValue={loaderData.filters.channel}><option value="">Todos</option><option value="linkedin">LinkedIn</option><option value="instagram">Instagram</option><option value="x">X</option></select></label><label><span>Idioma</span><select name="locale" defaultValue={loaderData.filters.locale}><option value="">Todos</option><option value="es">Español</option><option value="en">English</option></select></label><label><span>Run</span><select name="status" defaultValue={loaderData.filters.status}><option value="">Todos</option><option value="succeeded">Exitoso</option><option value="failed">Fallido</option><option value="running">En curso</option><option value="pending">Pendiente</option></select></label><button className="ops-button ops-button-secondary">Aplicar</button></Form>
    <section className="ops-insight-grid" aria-label="Indicadores editoriales">
      <Metric icon={Clock3} label="Idea → borrador" value={duration(m.ideaToDraft)}/><Metric icon={FileClock} label="Borrador → decisión" value={duration(m.decision)}/><Metric icon={ShieldCheck} label="Aprobación sin ediciones" value={m.approvalWithoutEdits}/><Metric icon={Activity} label="Revisiones promedio" value={m.revisions == null ? "Sin datos" : m.revisions.toFixed(1)}/><Metric icon={BarChart3} label="Uso de template publicado" value={m.templateShare}/><Metric icon={Coins} label="Costo estimado" value={m.cost == null ? "No disponible" : `US$ ${m.cost.toFixed(4)}${m.unpricedCompletedRuns ? ` + ${m.unpricedCompletedRuns} sin tarifa` : ""}`}/><Metric icon={Gauge} label="Duración mediana / p95" value={`${duration(m.durationMedian)} / ${duration(m.durationP95)}`}/><Metric icon={AlertTriangle} label="Errores de generación" value={m.runCount ? `${m.failedRuns} · ${Math.round(m.failedRuns / m.runCount * 100)}%` : "Sin datos"}/>
    </section>
    <div className="ops-insight-columns"><section className="ops-panel"><h2>Flujo editorial</h2><dl className="ops-definition"><div><dt>Programadas</dt><dd>{m.scheduled}</dd></div><div><dt>Publicadas</dt><dd>{m.published}</dd></div><div><dt>Tokens de entrada</dt><dd>{m.inputTokens.toLocaleString("es-AR")}</dd></div><div><dt>Entrada cacheada</dt><dd>{m.cachedInputTokens.toLocaleString("es-AR")}</dd></div><div><dt>Tokens de salida</dt><dd>{m.outputTokens.toLocaleString("es-AR")}</dd></div></dl></section><section className="ops-panel"><h2>Controles detectados</h2>{loaderData.flagCounts.length ? <ul className="ops-metric-list">{loaderData.flagCounts.map((item: any) => <li key={`${item.severity}-${item.code}`}><StatusBadge value={item.severity}/><span>{item.code.replace(/_/g, " ")}</span><strong>{item.count}</strong></li>)}</ul> : <p className="ops-muted">Sin revisiones de calidad en este período.</p>}</section></div>
    <section className="ops-panel"><h2>Incidencias recientes</h2>{loaderData.issues.length ? <div className="ops-stack">{loaderData.issues.map((issue: any, index: number) => <article className="ops-insight-issue" key={`${issue.draftId}-${issue.createdAt}-${index}`}><StatusBadge value={issue.severity}/><div><strong>{issue.message}</strong><small>{formatDate(issue.createdAt, true)}</small></div><Link to={`/ops/social/${issue.campaignId}?variant=${issue.draftId}`}>Abrir variante</Link></article>)}</div> : <p className="ops-muted">No hay duplicados ni claims rechazados registrados.</p>}</section>
    <section className="ops-panel"><h2>Ejecuciones</h2>{loaderData.runs.length ? <div className="ops-run-table">{loaderData.runs.map((run: any) => <details className="ops-run" key={run.id}><summary><div><Activity/><span><strong>{run.operation.replace(/_/g, " ")}</strong><small>{formatDate(run.created_at, true)} · {run.model || "sin modelo"}</small></span></div><StatusBadge value={run.status}/></summary><dl className="ops-definition"><div><dt>Duración</dt><dd>{duration(run.duration_ms == null ? null : Number(run.duration_ms))}</dd></div><div><dt>Tokens</dt><dd>{Number(run.input_tokens || 0).toLocaleString("es-AR")} entrada ({Number(run.cached_input_tokens || 0).toLocaleString("es-AR")} cacheada) / {Number(run.output_tokens || 0).toLocaleString("es-AR")} salida</dd></div><div><dt>Costo</dt><dd>{run.estimated_cost_usd == null ? "No disponible" : `US$ ${Number(run.estimated_cost_usd).toFixed(6)}`}</dd></div><div><dt>Etapa</dt><dd>{run.stage}</dd></div><div><dt>Request IDs</dt><dd><code>{Object.values(run.request_trace || {}).join(", ") || run.request_id || "—"}</code></dd></div>{run.error_code ? <div><dt>Error sanitizado</dt><dd>{run.error_code} · {run.error_message || "Sin detalle"}{run.retryable ? " · reintentable" : ""}</dd></div> : null}</dl></details>)}</div> : <EmptyState title="Sin ejecuciones" body="Las generaciones aparecerán cuando se use el compositor."/>}<Pager page={loaderData.page} count={loaderData.runCount} path="/ops/insights" params={params}/></section>
  </>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <article className="ops-insight-card"><Icon aria-hidden="true"/><span>{label}</span><strong>{value}</strong></article>;
}
