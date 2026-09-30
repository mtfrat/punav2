import { useState, useId, useMemo } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useSearchParams } from "react-router";
import { CheckCircle2, TrendingDown, DollarSign, Clock, Users, ArrowRight, Share2, Check } from "lucide-react";
import { CalButton, PageShell } from "../components/marketing";
import { createMeta, breadcrumbSchema } from "../lib/seo";
import type { Locale } from "../content/site";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const locale: Locale = url.pathname.startsWith("/es/") ? "es" : "en";
  const empresa = url.searchParams.get("empresa") || (locale === "es" ? "tu empresa" : "your company");
  const operarios = Math.max(1, Math.min(100, parseInt(url.searchParams.get("operarios") || "6", 10) || 6));
  const horas = Math.max(1, Math.min(40, parseInt(url.searchParams.get("horas") || "12", 10) || 12));
  const tarifa = Math.max(5, Math.min(250, parseInt(url.searchParams.get("tarifa") || "25", 10) || 25));

  return { locale, initial: { empresa, operarios, horas, tarifa } };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { locale, initial } = data;
  const isEs = locale === "es";
  const title = isEs
    ? `Simulador de ROI & Ahorro Operativo para ${initial.empresa} | Puna Tech`
    : `Operational ROI & Savings Simulator for ${initial.empresa} | Puna Tech`;
  const description = isEs
    ? `Calcula cuántas horas y dinero pierde tu equipo en planillas manuales, remitos y WhatsApp, y el retorno de inversión al sistematizar con software a medida.`
    : `Calculate the hours and money your team wastes on manual spreadsheets, paper slips, and WhatsApp, and the ROI of automating with custom software.`;
  const path = isEs ? "/es/demos/roi" : "/demos/roi";
  const alternatePath = isEs ? "/demos/roi" : "/es/demos/roi";

  return createMeta({
    locale,
    title,
    description,
    path,
    alternatePath,
    schema: [
      breadcrumbSchema([
        { name: "Puna Tech", path: isEs ? "/es" : "/" },
        { name: isEs ? "Simulador de ROI" : "ROI Simulator", path },
      ]),
    ],
  });
};

export default function DemoRoiPage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, initial } = loaderData;
  const isEs = locale === "es";
  const [searchParams, setSearchParams] = useSearchParams();

  const [companyName, setCompanyName] = useState(initial.empresa);
  const [operarios, setOperarios] = useState(initial.operarios);
  const [horas, setHoras] = useState(initial.horas);
  const [tarifa, setTarifa] = useState(initial.tarifa);
  const [copied, setCopied] = useState(false);

  const operariosId = useId();
  const horasId = useId();
  const tarifaId = useId();

  // Financial calculations
  const stats = useMemo(() => {
    const monthlyHours = operarios * horas * 4.33;
    const monthlyCost = monthlyHours * tarifa;
    const savingsRatio = 0.65; // standard conservative 65% reduction via custom software
    const monthlySavings = Math.round(monthlyCost * savingsRatio);
    const annualSavings = monthlySavings * 12;
    const annualHoursSaved = Math.round(monthlyHours * savingsRatio * 12);

    return {
      monthlyHours: Math.round(monthlyHours),
      monthlyCost: Math.round(monthlyCost),
      monthlySavings,
      annualSavings,
      annualHoursSaved,
    };
  }, [operarios, horas, tarifa]);

  const handleCopyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("empresa", companyName);
    url.searchParams.set("operarios", String(operarios));
    url.searchParams.set("horas", String(horas));
    url.searchParams.set("tarifa", String(tarifa));
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        {/* Header Hero */}
        <section className="detail-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">
              {isEs ? "Simulador Interactivo de Ahorro" : "Interactive Savings Simulator"} · Puna Tech
            </p>
            <h1 style={{ maxWidth: "850px" }}>
              {isEs
                ? `¿Cuánto dinero pierde ${companyName} en procesos operativos manuales?`
                : `How much is ${companyName} losing on manual operational bottlenecks?`}
            </h1>
            <p style={{ maxWidth: "720px", color: "rgba(255,255,255,0.75)", fontSize: "1.1rem" }}>
              {isEs
                ? "Las planillas de cálculo gigantes, el desorden de WhatsApp y los remitos en papel consumen decenas de horas semanales que deberían destinarse a ventas y crecimiento. Ajusta los parámetros de tu operación para calcular tu ahorro real."
                : "Messy spreadsheets, chaotic WhatsApp threads, and paper logs waste dozens of hours every week that should go into sales and strategic growth. Adjust your operating numbers to see your real ROI."}
            </p>
          </div>
        </section>

        {/* Interactive Calculator Section */}
        <section className="section light-section" style={{ padding: "3.5rem 0" }}>
          <div className="shell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
            
            {/* Input Controls */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--ink)", padding: "2rem", borderRadius: "2px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                  {isEs ? "Parámetros de Operación" : "Operating Parameters"}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.75rem",
                    border: "1px solid var(--line)",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {copied ? <Check size={14} style={{ color: "green" }} /> : <Share2 size={14} />}
                  {copied ? (isEs ? "Enlace copiado" : "Link copied") : (isEs ? "Compartir simulación" : "Share simulation")}
                </button>
              </div>

              {/* Slider 1: Operarios */}
              <div style={{ marginBottom: "1.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <label htmlFor={operariosId} style={{ fontSize: "0.85rem", fontWeight: 650 }}>
                    <Users size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.4rem" }} />
                    {isEs ? "Personas en tareas manuales / operativas" : "Staff performing manual tasks"}
                  </label>
                  <strong style={{ fontSize: "1.1rem", color: "var(--terracotta)" }}>{operarios}</strong>
                </div>
                <input
                  id={operariosId}
                  type="range"
                  min={1}
                  max={60}
                  value={operarios}
                  onChange={(e) => setOperarios(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "var(--terracotta)", cursor: "pointer" }}
                />
                <small style={{ color: "var(--ink-soft)", fontSize: "0.72rem" }}>
                  {isEs ? "Choferes, asistentes de depósito, administración de ventas, secretaría" : "Drivers, warehouse clerks, sales admins, back-office staff"}
                </small>
              </div>

              {/* Slider 2: Horas */}
              <div style={{ marginBottom: "1.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <label htmlFor={horasId} style={{ fontSize: "0.85rem", fontWeight: 650 }}>
                    <Clock size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.4rem" }} />
                    {isEs ? "Horas manuales por persona / semana" : "Manual hours wasted per person / week"}
                  </label>
                  <strong style={{ fontSize: "1.1rem", color: "var(--terracotta)" }}>{horas}h</strong>
                </div>
                <input
                  id={horasId}
                  type="range"
                  min={2}
                  max={35}
                  value={horas}
                  onChange={(e) => setHoras(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "var(--terracotta)", cursor: "pointer" }}
                />
                <small style={{ color: "var(--ink-soft)", fontSize: "0.72rem" }}>
                  {isEs ? "Copiar datos de WhatsApp a Excel, conciliar remitos, llamadas de seguimiento" : "Copying data between sheets, manual dispatching, customer tracking calls"}
                </small>
              </div>

              {/* Slider 3: Tarifa */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <label htmlFor={tarifaId} style={{ fontSize: "0.85rem", fontWeight: 650 }}>
                    <DollarSign size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.4rem" }} />
                    {isEs ? "Costo hora promedio (USD estimado)" : "Average hourly labor cost (USD)"}
                  </label>
                  <strong style={{ fontSize: "1.1rem", color: "var(--terracotta)" }}>${tarifa} USD/h</strong>
                </div>
                <input
                  id={tarifaId}
                  type="range"
                  min={8}
                  max={120}
                  step={1}
                  value={tarifa}
                  onChange={(e) => setTarifa(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "var(--terracotta)", cursor: "pointer" }}
                />
                <small style={{ color: "var(--ink-soft)", fontSize: "0.72rem" }}>
                  {isEs ? "Incluye sueldo bruto proporcional y cargas operativas" : "Fully loaded compensation rate"}
                </small>
              </div>
            </div>

            {/* Live Results Panel */}
            <div style={{ background: "#18181b", color: "#f4f4f5", padding: "2.2rem", borderRadius: "2px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p className="eyebrow" style={{ color: "var(--terracotta)", margin: "0 0 0.5rem" }}>
                  {isEs ? "Impacto Financiero Proyectado" : "Projected Financial Impact"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", margin: "1.5rem 0" }}>
                  <div style={{ padding: "1rem", background: "rgba(255,255,255,0.05)", borderLeft: "3px solid #ef4444" }}>
                    <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", display: "block" }}>
                      {isEs ? "Costo del caos manual hoy" : "Current manual drain"}
                    </small>
                    <strong style={{ fontSize: "1.6rem", display: "block", marginTop: "0.2rem" }}>
                      ${stats.monthlyCost.toLocaleString()} <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>USD/mes</span>
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                      {stats.monthlyHours}h {isEs ? "al mes" : "/ mo"}
                    </span>
                  </div>

                  <div style={{ padding: "1rem", background: "rgba(255,255,255,0.05)", borderLeft: "3px solid #22c55e" }}>
                    <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", display: "block" }}>
                      {isEs ? "Ahorro neto con Puna Tech" : "Net savings with Puna Tech"}
                    </small>
                    <strong style={{ fontSize: "1.6rem", color: "#4ade80", display: "block", marginTop: "0.2rem" }}>
                      +${stats.monthlySavings.toLocaleString()} <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>USD/mes</span>
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "#86efac" }}>
                      ~65% {isEs ? "de reducción de fricción" : "friction reduction"}
                    </span>
                  </div>
                </div>

                <div style={{ margin: "1.5rem 0", padding: "1.2rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>
                    {isEs ? "Retorno Anual Estimado para " : "Annual Estimated Return for "}
                    <strong>{companyName}</strong>:
                  </span>
                  <div style={{ fontSize: "2.3rem", fontWeight: 700, color: "#fff", margin: "0.4rem 0" }}>
                    ${stats.annualSavings.toLocaleString()} USD
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#a1a1aa" }}>
                    {isEs
                      ? `Recuperas ${stats.annualHoursSaved.toLocaleString()} horas de tu equipo al año para atender clientes y escalar el negocio.`
                      : `You free up ${stats.annualHoursSaved.toLocaleString()} team hours per year to focus on revenue and scale.`}
                  </p>
                </div>
              </div>

              <div>
                <CalButton
                  locale={locale}
                  placement="demo_roi_calculator"
                  label={isEs ? "Agendar diagnóstico operativo sin costo (15 min)" : "Book 15-min free operations audit"}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Breakdown of typical bottlenecks */}
        <section className="section soft-section" style={{ padding: "3rem 0" }}>
          <div className="shell">
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
              {isEs ? "¿De dónde proviene este ahorro con software a medida?" : "Where do these savings actually come from?"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
              <div style={{ padding: "1.5rem", background: "#fff", border: "1px solid var(--line)" }}>
                <strong style={{ display: "block", fontSize: "1rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
                  {isEs ? "1. Portales Ligeros vs WhatsApp" : "1. Lightweight Web Portals vs WhatsApp"}
                </strong>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                  {isEs
                    ? "Tus choferes, depósitos o proveedores actualizan estados y fotos desde su celular en 3 segundos sin instalar apps pesadas. Cero preguntas de '¿dónde está mi pedido?'."
                    : "Drivers and warehouse crews update status in 3 seconds from their phones with photo proof. Zero customer calls asking 'where is my cargo?'."}
                </p>
              </div>

              <div style={{ padding: "1.5rem", background: "#fff", border: "1px solid var(--line)" }}>
                <strong style={{ display: "block", fontSize: "1rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
                  {isEs ? "2. Autogestión para Clientes / Propietarios" : "2. Client & Investor Self-Service"}
                </strong>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                  {isEs
                    ? "Acceso privado para consultar cuotas, extractos y avance de obra o envíos. Tu equipo administrativo no pierde 2 semanas al mes enviando comprobantes uno a uno."
                    : "Private portal for invoices, balances, and progress certificates. Stop wasting two administrative weeks every month sending manual receipts."}
                </p>
              </div>

              <div style={{ padding: "1.5rem", background: "#fff", border: "1px solid var(--line)" }}>
                <strong style={{ display: "block", fontSize: "1rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
                  {isEs ? "3. Cero Suscripciones SaaS Infladas" : "3. Zero Bloated SaaS Subscriptions"}
                </strong>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                  {isEs
                    ? "Construimos software propio con tu marca sobre Supabase y arquitectura serverless. Sin pagar cientos de dólares por usuario al mes a plataformas rígidas."
                    : "We build custom software under your brand on Supabase and serverless architecture. No paying thousands in per-user monthly SaaS fees."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
