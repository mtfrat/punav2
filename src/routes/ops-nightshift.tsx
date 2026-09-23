import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, useNavigation } from "react-router";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  UsersRound,
  Sparkles,
  Code2,
  ShieldCheck,
  Moon,
  ChevronRight,
  TrendingUp,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { EmptyState, formatDate, OpsPageHeader, StatusBadge } from "../components/ops";
import { assertTrustedMutation, opsData, requireAdmin } from "../lib/admin.server";

interface DecisionItem {
  id: string;
  num: number;
  text: string;
  action: string;
  category: "social" | "prospects" | "monetization" | "demo" | "audit" | "other";
  status: "pending" | "approved" | "rejected";
}

interface ParsedReport {
  date: string;
  duration: string;
  spentUsd: string;
  decisions: DecisionItem[];
  socialPosts: Array<{ channel: string; hook: string; time: string }>;
  prospects: Array<{ name: string; market: string; vertical: string; role: string; friction: string; strategy: string; subject: string }>;
  nicheOpportunity?: { concept: string; model: string; nextStep: string };
  demo?: { title: string; branch: string; path: string; purpose: string };
  audit?: { verdict: string; passed: number; observations: number; findings: string[] };
}

async function loadDecisionsState(): Promise<Record<string, { status: "pending" | "approved" | "rejected"; updated_at: string; notes?: string }>> {
  try {
    const raw = await readFile(resolve(process.cwd(), "reports", "decisions-state.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveDecisionsState(state: Record<string, any>) {
  const dir = resolve(process.cwd(), "reports");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "decisions-state.json"), JSON.stringify(state, null, 2), "utf-8");
}

function parseMarkdownReport(content: string, reportDate: string, savedStates: Record<string, any>): ParsedReport {
  const lines = content.split("\n");
  
  // Extract duration and spend
  let duration = "56.4s";
  let spentUsd = "0.0051";
  for (const l of lines) {
    const durMatch = l.match(/Duración del ciclo:\*\* ([\d.]+s)/);
    if (durMatch) duration = durMatch[1];
    const spendMatch = l.match(/Gasto total de la corrida nocturna:\*\* \*\*?\$([\d.]+)/);
    if (spendMatch) spentUsd = spendMatch[1];
  }

  // Parse Decisions
  const decisions: DecisionItem[] = [];
  let currentDecision: Partial<DecisionItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const decMatch = line.match(/- \[[ x]?\] \*\*Decisión #(\d+):\*\* (.+)/);
    if (decMatch) {
      if (currentDecision?.num) {
        const id = `${reportDate}-dec-${currentDecision.num}`;
        decisions.push({
          id,
          num: currentDecision.num,
          text: currentDecision.text || "",
          action: currentDecision.action || "",
          category: currentDecision.category || "other",
          status: savedStates[id]?.status || "pending",
        });
      }

      const num = parseInt(decMatch[1], 10);
      const text = decMatch[2];
      let category: DecisionItem["category"] = "other";
      if (text.toLowerCase().includes("post") || text.toLowerCase().includes("autopost")) category = "social";
      else if (text.toLowerCase().includes("outreach") || text.toLowerCase().includes("cuentas b2b")) category = "prospects";
      else if (text.toLowerCase().includes("monetización") || text.toLowerCase().includes("nicho")) category = "monetization";
      else if (text.toLowerCase().includes("demo") || text.toLowerCase().includes("preview")) category = "demo";
      else if (text.toLowerCase().includes("refactor") || text.toLowerCase().includes("técnico") || text.toLowerCase().includes("seo")) category = "audit";

      currentDecision = { num, text, category };
    } else if (currentDecision && line.startsWith("- *Acción recomendada:*")) {
      currentDecision.action = line.replace("- *Acción recomendada:*", "").trim();
    }
  }

  if (currentDecision?.num) {
    const id = `${reportDate}-dec-${currentDecision.num}`;
    decisions.push({
      id,
      num: currentDecision.num,
      text: currentDecision.text || "",
      action: currentDecision.action || "",
      category: currentDecision.category || "other",
      status: savedStates[id]?.status || "pending",
    });
  }

  // Parse Social Posts
  const socialPosts: ParsedReport["socialPosts"] = [];
  let inSocial = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("### 📱 Redes Sociales")) inSocial = true;
    else if (line.startsWith("### ")) inSocial = false;
    else if (inSocial && line.startsWith("- **[")) {
      const match = line.match(/- \*\*\[([A-Z]+)\]\*\* \*?"?([^"*]+)"?\*?/);
      if (match) {
        const channel = match[1];
        const hook = match[2];
        const nextLine = lines[i + 1]?.trim() || "";
        const timeMatch = nextLine.match(/Horario sugerido:\*\* ([^ ]+ [AP]M( [A-Z]+)?)/);
        socialPosts.push({ channel, hook, time: timeMatch ? timeMatch[1] : "Horario óptimo" });
      }
    }
  }

  // Parse Prospects
  const prospects: ParsedReport["prospects"] = [];
  let inProspects = false;
  let currentProspect: Partial<ParsedReport["prospects"][0]> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("### 🎯 Prospección B2B")) inProspects = true;
    else if (line.startsWith("### ")) inProspects = false;
    else if (inProspects && line.startsWith("- **") && line.includes("Target:")) {
      if (currentProspect?.name) {
        prospects.push({ ...currentProspect } as any);
      }
      const nameMatch = line.match(/- \*\*([^*]+)\*\*/);
      const name = nameMatch ? nameMatch[1].trim() : "Empresa B2B";
      const roleMatch = line.match(/Target:\*?\s*(.+)$/);
      const role = roleMatch ? roleMatch[1].replace(/^[\*\s]+|[\*\s]+$/g, "") : "Contacto B2B";
      const vertMatch = line.match(/\[([^\]]+)\]/);
      const vertical = vertMatch ? vertMatch[1].trim() : "B2B";

      const beforeTarget = line.split("—")[0] || line;
      const afterName = beforeTarget.replace(/- \*\*[^*]+\*\*\s*/, "").trim();
      const beforeBrackets = afterName.split("[")[0].trim();
      const market = beforeBrackets.replace(/^\(|\)$/g, "").trim() || "LatAm";

      currentProspect = {
        name,
        market,
        vertical,
        role,
        friction: "",
        strategy: "",
        subject: "",
      };
    } else if (currentProspect && line.includes("*Cuello de botella:*")) {
      currentProspect.friction = line.replace(/.*\*Cuello de botella:\*/, "").trim();
    } else if (currentProspect && line.includes("*Estrategia:*")) {
      currentProspect.strategy = line.replace(/.*\*Estrategia:\*/, "").trim();
    } else if (currentProspect && line.includes("*Asunto sugerido:*")) {
      currentProspect.subject = line.replace(/.*\*Asunto sugerido:\*/, "").replace(/["']/g, "").trim();
    }
  }
  if (currentProspect?.name) prospects.push({ ...currentProspect } as any);

  // Parse Niche & Demo
  let nicheOpportunity: ParsedReport["nicheOpportunity"];
  let demo: ParsedReport["demo"];
  let audit: ParsedReport["audit"];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("- **Concepto:**")) {
      nicheOpportunity = {
        concept: line.replace("- **Concepto:**", "").trim(),
        model: lines[i + 1]?.replace("- **Modelo:**", "").trim() || "",
        nextStep: lines[i + 2]?.replace("- **Siguiente paso:**", "").trim() || "",
      };
    }
    if (line.includes("- **Título:**")) {
      demo = {
        title: line.replace("- **Título:**", "").trim(),
        branch: lines[i + 1]?.replace(/.*`([^`]+)`.*/, "$1") || "demo/preview",
        path: lines[i + 2]?.replace(/.*`([^`]+)`.*/, "$1") || "src/pages/demos",
        purpose: lines[i + 3]?.replace("- **Propósito:**", "").trim() || "",
      };
    }
    if (line.includes("- **Veredicto general:**")) {
      const vMatch = line.match(/`([A-Z_]+)`/);
      audit = {
        verdict: vMatch ? vMatch[1] : "OK",
        passed: 3,
        observations: 0,
        findings: [],
      };
    }
  }

  return {
    date: reportDate,
    duration,
    spentUsd,
    decisions,
    socialPosts,
    prospects,
    nicheOpportunity,
    demo,
    audit,
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  const url = new URL(request.url);

  // Embedded reports from Vite bundle (guaranteed to be present in Vercel serverless)
  const embeddedReports = import.meta.glob("../../reports/morning-brief-*-puna-tech.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  // Extract dates from embedded bundle
  let availableDates = Object.keys(embeddedReports)
    .map((k) => {
      const match = k.match(/morning-brief-([\d-]+)-puna-tech\.md/);
      return match ? match[1] : "";
    })
    .filter(Boolean)
    .sort()
    .reverse();

  // If filesystem reports exist, merge them
  const reportsDir = resolve(process.cwd(), "reports");
  try {
    const files = await readdir(reportsDir);
    const fsDates = files
      .filter((f) => f.startsWith("morning-brief-") && f.endsWith("-puna-tech.md"))
      .map((f) => f.replace("morning-brief-", "").replace("-puna-tech.md", ""));
    availableDates = Array.from(new Set([...availableDates, ...fsDates])).sort().reverse();
  } catch {}

  const selectedDate = url.searchParams.get("date") || availableDates[0] || new Date().toISOString().split("T")[0];
  const savedStates = await loadDecisionsState();

  let parsedReport: ParsedReport | null = null;
  if (selectedDate) {
    // 1. Try from embedded bundle first
    const embeddedKey = `../../reports/morning-brief-${selectedDate}-puna-tech.md`;
    let content = embeddedReports[embeddedKey];

    // 2. Fallback to filesystem
    if (!content) {
      try {
        const filePath = join(reportsDir, `morning-brief-${selectedDate}-puna-tech.md`);
        content = await readFile(filePath, "utf-8");
      } catch {}
    }

    if (content) {
      parsedReport = parseMarkdownReport(content, selectedDate, savedStates);
    }
  }

  // Load config
  let companyConfig: any = {};
  try {
    const rawConfig = await readFile(resolve(process.cwd(), "nightshift", "config", "puna-tech.json"), "utf-8");
    companyConfig = JSON.parse(rawConfig);
  } catch {}

  return opsData(
    {
      availableDates,
      selectedDate,
      report: parsedReport,
      config: companyConfig,
    },
    context.headers
  );
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "set_decision_status") {
    const decisionId = String(formData.get("decision_id"));
    const status = String(formData.get("status")) as "approved" | "rejected" | "pending";
    const notes = String(formData.get("notes") || "");

    const states = await loadDecisionsState();
    states[decisionId] = {
      status,
      updated_at: new Date().toISOString(),
      notes,
    };
    await saveDecisionsState(states);

    // Record in admin audit log
    await context.service.from("admin_audit_log").insert({
      actor_user_id: context.userId || "00000000-0000-0000-0000-000000000000",
      actor_email: context.email,
      action: `nightshift_decision_${status}`,
      entity_type: "nightshift_decision",
      entity_id: decisionId,
      after_state: { decisionId, status, notes },
    });

    return opsData({ ok: true, decisionId, status }, context.headers);
  }

  return opsData({ ok: false }, context.headers, 400);
}

export default function OpsNightshift({ loaderData }: { loaderData: any }) {
  const { availableDates, selectedDate, report, config } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  const totalDecisions = report?.decisions?.length || 0;
  const approvedCount = report?.decisions?.filter((d: any) => d.status === "approved").length || 0;
  const rejectedCount = report?.decisions?.filter((d: any) => d.status === "rejected").length || 0;
  const pendingCount = totalDecisions - approvedCount - rejectedCount;

  return (
    <>
      <OpsPageHeader
        eyebrow="Flota Autónoma Nocturna"
        title="Agentes Nocturnos (Nightshift AI)"
        description="Supervisa lo que los agentes generaron durante la noche, aprueba propuestas con 1 clic y dirige las prioridades de tu empresa."
        action={
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)", fontWeight: 600 }}>Fecha:</span>
            <select
              defaultValue={selectedDate}
              onChange={(e) => (window.location.href = `/ops/nightshift?date=${e.target.value}`)}
              style={{
                padding: "0.4rem 0.7rem",
                fontSize: "0.8rem",
                border: "1px solid var(--ink)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontWeight: 600,
              }}
            >
              {availableDates.map((d: string) => (
                <option key={d} value={d}>
                  {d} {d === availableDates[0] ? "(Última)" : ""}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Metric Cards */}
      <section className="ops-metric-grid" aria-label="Métricas del turno nocturno">
        <div className="ops-metric">
          <div>
            <Clock aria-hidden="true" />
            <span>Última Corrida</span>
          </div>
          <strong style={{ fontSize: "2rem" }}>{report ? report.date : "—"}</strong>
          <span>Duración: {report?.duration || "56s"}</span>
        </div>

        <div className="ops-metric">
          <div>
            <TrendingUp aria-hidden="true" />
            <span>Gasto de la Noche</span>
          </div>
          <strong style={{ fontSize: "2rem" }}>${report ? report.spentUsd : "0.00"}</strong>
          <span>Límite: $1.50 USD</span>
        </div>

        <div className="ops-metric">
          <div>
            <Sparkles aria-hidden="true" />
            <span>Decisiones Pendientes</span>
          </div>
          <strong style={{ fontSize: "2rem", color: pendingCount > 0 ? "var(--terracotta)" : "var(--success)" }}>
            {pendingCount}
          </strong>
          <span>de {totalDecisions} propuestas</span>
        </div>

        <div className="ops-metric">
          <div>
            <CheckCircle2 aria-hidden="true" />
            <span>Aprobadas Hoy</span>
          </div>
          <strong style={{ fontSize: "2rem", color: "var(--success)" }}>{approvedCount}</strong>
          <span>{rejectedCount} descartadas</span>
        </div>

        <div className="ops-metric">
          <div>
            <ShieldCheck aria-hidden="true" />
            <span>Estado de Flota</span>
          </div>
          <strong style={{ fontSize: "1.8rem" }}>{report?.audit?.verdict || "OK"}</strong>
          <span>Telegram Conectado</span>
        </div>
      </section>

      {/* Decision Board (Checklist de Aprobación) */}
      <section className="ops-section">
        <div className="ops-section-heading">
          <div>
            <p className="ops-eyebrow">Acción Inmediata</p>
            <h2>Decisiones a Tomar Hoy</h2>
            <p className="ops-muted">
              Aprueba o descarta las propuestas con 1 clic. Cada decisión aprobada activa el siguiente paso de los agentes.
            </p>
          </div>
        </div>

        {report?.decisions?.length ? (
          <div className="ops-stack" style={{ display: "grid", gap: "1rem" }}>
            {report.decisions.map((d: DecisionItem) => {
              const isApproved = d.status === "approved";
              const isRejected = d.status === "rejected";

              return (
                <div
                  key={d.id}
                  style={{
                    padding: "1.25rem 1.5rem",
                    border: "1px solid var(--ink)",
                    background: isApproved ? "#f0fdf4" : isRejected ? "#fef2f2" : "var(--surface)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1.5rem",
                    flexWrap: "wrap",
                    transition: "all 180ms ease",
                  }}
                >
                  <div style={{ flex: "1 1 500px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          padding: "0.15rem 0.45rem",
                          border: "1px solid var(--line)",
                          background: "#fff",
                          textTransform: "uppercase",
                        }}
                      >
                        {d.category.toUpperCase()}
                      </span>
                      <StatusBadge value={d.status} />
                    </div>

                    <h3 style={{ margin: "0.2rem 0", fontSize: "1.05rem", fontWeight: 650, color: "var(--ink)" }}>
                      {d.num}. {d.text.replace(/\*\*/g, "")}
                    </h3>
                    <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                      <strong>Acción recomendada:</strong> {d.action}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Form method="post" style={{ display: "flex", gap: "0.5rem" }}>
                      <input type="hidden" name="intent" value="set_decision_status" />
                      <input type="hidden" name="decision_id" value={d.id} />

                      {isApproved ? (
                        <button
                          type="submit"
                          name="status"
                          value="pending"
                          disabled={isSubmitting}
                          className="ops-button ops-button-secondary"
                          style={{ minHeight: "38px", fontSize: "0.75rem" }}
                        >
                          Deshacer aprobación
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="status"
                          value="approved"
                          disabled={isSubmitting}
                          className="ops-button"
                          style={{ minHeight: "38px", fontSize: "0.75rem" }}
                        >
                          <CheckCircle2 size={16} /> Aprobar
                        </button>
                      )}

                      {isRejected ? (
                        <button
                          type="submit"
                          name="status"
                          value="pending"
                          disabled={isSubmitting}
                          className="ops-button ops-button-secondary"
                          style={{ minHeight: "38px", fontSize: "0.75rem" }}
                        >
                          Deshacer
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="status"
                          value="rejected"
                          disabled={isSubmitting}
                          className="ops-button ops-button-danger"
                          style={{ minHeight: "38px", fontSize: "0.75rem" }}
                        >
                          <XCircle size={16} /> Descartar
                        </button>
                      )}
                    </Form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Sin reporte para esta fecha"
            body="Los agentes todavía no han generado un resumen para la fecha seleccionada."
          />
        )}
      </section>

      {/* Detalle por Vertical / Agente */}
      {report && (
        <section className="ops-section">
          <div className="ops-section-heading">
            <div>
              <p className="ops-eyebrow">Entregables Detallados</p>
              <h2>Contenido y Prospectos Generados</h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {/* Redes Sociales */}
            <div style={{ padding: "1.5rem", border: "1px solid var(--ink)", background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Send size={18} style={{ color: "var(--terracotta)" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>📱 Redes Sociales & Autopost</h3>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: "1rem" }}>
                Borradores con ganchos directos listos para publicar:
              </p>
              <div style={{ display: "grid", gap: "0.8rem" }}>
                {report.socialPosts.map((p: any, idx: number) => (
                  <div key={idx} style={{ padding: "0.8rem", border: "1px solid var(--line)", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: 700, color: "var(--terracotta)" }}>
                      <span>[{p.channel}]</span>
                      <span>Sugerido: {p.time}</span>
                    </div>
                    <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", fontStyle: "italic", color: "var(--ink)" }}>
                      "{p.hook}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prospectos B2B */}
            <div style={{ padding: "1.5rem", border: "1px solid var(--ink)", background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <UsersRound size={18} style={{ color: "var(--terracotta)" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>🎯 Prospectos B2B Calificados</h3>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: "1rem" }}>
                Empresas no-tech con cuellos de botella manuales reales:
              </p>
              <div style={{ display: "grid", gap: "0.8rem" }}>
                {report.prospects.map((pr: any, idx: number) => (
                  <div key={idx} style={{ padding: "0.8rem", border: "1px solid var(--line)", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{pr.name}</strong>
                      <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", background: "var(--paper-deep)", border: "1px solid var(--line)" }}>
                        {pr.vertical}
                      </span>
                    </div>
                    <small style={{ color: "var(--ink-soft)", display: "block", marginTop: "0.1rem" }}>
                      {pr.market} · Target: {pr.role}
                    </small>
                    <p style={{ margin: "0.4rem 0 0.2rem", fontSize: "0.78rem", color: "var(--ink)" }}>
                      <strong>Dolor:</strong> {pr.friction}
                    </p>
                    {pr.subject && (
                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--terracotta)", fontWeight: 600 }}>
                        Asunto: "{pr.subject}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nicho & Showcase */}
            <div style={{ padding: "1.5rem", border: "1px solid var(--ink)", background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Sparkles size={18} style={{ color: "var(--terracotta)" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>💡 Monetización & Showcase</h3>
              </div>

              {report.nicheOpportunity && (
                <div style={{ marginBottom: "1.2rem", padding: "0.8rem", border: "1px solid var(--line)", background: "#fff" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--terracotta)", textTransform: "uppercase" }}>
                    Oportunidad de Nicho Evaluada
                  </span>
                  <strong style={{ display: "block", fontSize: "0.95rem", margin: "0.2rem 0" }}>
                    {report.nicheOpportunity.concept}
                  </strong>
                  <p style={{ margin: "0.2rem 0", fontSize: "0.78rem", color: "var(--ink-soft)" }}>
                    <strong>Modelo:</strong> {report.nicheOpportunity.model}
                  </p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "var(--ink)" }}>
                    <strong>Siguiente paso:</strong> {report.nicheOpportunity.nextStep}
                  </p>
                </div>
              )}

              {report.demo && (
                <div style={{ padding: "0.8rem", border: "1px solid var(--line)", background: "#fff" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--terracotta)", textTransform: "uppercase" }}>
                    Demo de Portfolio Diseñado
                  </span>
                  <strong style={{ display: "block", fontSize: "0.95rem", margin: "0.2rem 0" }}>
                    {report.demo.title}
                  </strong>
                  <p style={{ margin: "0.2rem 0", fontSize: "0.78rem", color: "var(--ink-soft)" }}>
                    <strong>Branch:</strong> <code>{report.demo.branch}</code>
                  </p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "var(--ink)" }}>
                    <strong>Propósito:</strong> {report.demo.purpose}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
