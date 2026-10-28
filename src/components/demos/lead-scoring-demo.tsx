import type * as React from "react";
import { useState } from "react";
import { Check, Send, Sparkles, Trash2 } from "lucide-react";
import { ActionLog, ApprovedStamp, Chip, DemoFrame, ErrorNote, Kpi, Spinner, useActionLog, useBusy, type Loc } from "./shared";

interface Form { name: string; email: string; sector: string; size: string; channel: string; budget: string; urgency: string; message: string }
interface Part { label: string; points: number }
type Tier = "hot" | "warm" | "cold" | "spam";
interface Lead { id: number; form: Form; score: number; tier: Tier; parts: Part[]; reply: string; status: "pending" | "sent" | "discarded"; pain: string | null }

const EMPTY: Form = { name: "", email: "", sector: "retail", size: "6-20", channel: "web", budget: "unknown", urgency: "browsing", message: "" };

const PRESETS: Record<string, { es: string; en: string; form: Form }> = {
  hot: { es: "Ferretería urgente", en: "Urgent hardware store", form: { name: "Gabriela Ortiz", email: "gabriela@ferreteriaortiz.com.ar", sector: "retail", size: "21-100", channel: "referral", budget: "2000-8000", urgency: "month", message: "Tenemos 3 sucursales y las cobranzas y el stock los llevamos en planillas y WhatsApp. Perdemos facturas y el proveedor nos manda listas por mail. Necesitamos automatizar esto este mes." } },
  warm: { es: "Estudio curioso", en: "Curious firm", form: { name: "Tomás Villar", email: "tomas.villar@gmail.com", sector: "services", size: "1-5", channel: "web", budget: "500-2000", urgency: "quarter", message: "Somos un estudio chico y queremos ver si se puede automatizar el envío de presupuestos y recordatorios de turnos." } },
  cold: { es: "Consulta vaga", en: "Vague inquiry", form: { name: "Pablo", email: "pablo1984@hotmail.com", sector: "other", size: "1-5", channel: "instagram", budget: "unknown", urgency: "browsing", message: "Hola, quería saber más" } },
  spam: { es: "Spam", en: "Spam", form: { name: "Marketing Pro", email: "ventas@seo-barato.biz", sector: "other", size: "1-5", channel: "web", budget: "unknown", urgency: "browsing", message: "GANÁ DINERO FÁCIL con bitcoin! Visitá http://a.biz http://b.biz http://c.biz posicionamiento SEO barato y promoción gratis" } },
};

const OPTIONS = {
  es: {
    sector: [["retail", "Comercio / retail"], ["food", "Gastronomía"], ["wholesale", "Distribución mayorista"], ["services", "Servicios profesionales"], ["industry", "Industria / producción"], ["other", "Otro"]],
    size: [["1-5", "1 a 5 personas"], ["6-20", "6 a 20 personas"], ["21-100", "21 a 100 personas"], ["100+", "Más de 100"]],
    channel: [["web", "Formulario web"], ["whatsapp", "WhatsApp"], ["instagram", "Instagram"], ["referral", "Referido"]],
    budget: [["unknown", "No sé todavía"], ["<500", "Menos de USD 500"], ["500-2000", "USD 500 a 2.000"], ["2000-8000", "USD 2.000 a 8.000"], [">8000", "Más de USD 8.000"]],
    urgency: [["browsing", "Solo estoy mirando"], ["quarter", "Este trimestre"], ["month", "Este mes"], ["now", "Ya, es urgente"]],
  },
  en: {
    sector: [["retail", "Retail"], ["food", "Food service"], ["wholesale", "Wholesale distribution"], ["services", "Professional services"], ["industry", "Manufacturing"], ["other", "Other"]],
    size: [["1-5", "1 to 5 people"], ["6-20", "6 to 20 people"], ["21-100", "21 to 100 people"], ["100+", "Over 100"]],
    channel: [["web", "Web form"], ["whatsapp", "WhatsApp"], ["instagram", "Instagram"], ["referral", "Referral"]],
    budget: [["unknown", "Not sure yet"], ["<500", "Under USD 500"], ["500-2000", "USD 500 to 2,000"], ["2000-8000", "USD 2,000 to 8,000"], [">8000", "Over USD 8,000"]],
    urgency: [["browsing", "Just looking"], ["quarter", "This quarter"], ["month", "This month"], ["now", "Now, it's urgent"]],
  },
} as const;

const PAIN: Array<{ re: RegExp; es: string; en: string }> = [
  { re: /cobranz|cobrar|factura|deuda|vencid/i, es: "las cobranzas", en: "collections" },
  { re: /stock|inventario|proveedor|lista de precios/i, es: "el stock y los proveedores", en: "stock and suppliers" },
  { re: /sueldo|horas|liquidaci|personal|empleados/i, es: "las horas y los sueldos", en: "hours and payroll" },
  { re: /turno|reserva|agenda|recordatorio/i, es: "los turnos y recordatorios", en: "bookings and reminders" },
  { re: /presupuesto|cotiza|pedido|mayorista/i, es: "las cotizaciones y pedidos", en: "quotes and orders" },
  { re: /excel|planilla|whatsapp|manual/i, es: "las planillas y el WhatsApp", en: "spreadsheets and WhatsApp" },
];
const SPAM = /bitcoin|casino|ganá dinero|gana dinero|seo barato|viagra|crédito fácil|credito facil|promoción gratis|promocion gratis|win money|cheap seo/i;
const FREE_MAIL = /@(gmail|hotmail|yahoo|outlook|live|icloud)\./i;

const T = {
  es: {
    label: "Captación y calificación de leads con IA",
    form: "Entró un lead nuevo", presets: "Cargar ejemplo", name: "Nombre", email: "Email", sector: "Rubro", size: "Tamaño del equipo", channel: "Por dónde llegó", budget: "Presupuesto estimado", urgency: "Urgencia", message: "Mensaje",
    submit: "Que la IA lo califique", reading: "La IA está leyendo el mensaje…", clear: "Vaciar",
    errName: "Poné el nombre.", errEmail: "Revisá el email: parece incompleto.", errMsg: "Contanos un poco más (mínimo 10 caracteres).",
    result: "Calificación", score: "Puntaje", breakdown: "Por qué este puntaje (reglas visibles)", routing: "Ruteo sugerido", reply: "Respuesta sugerida", replyHelp: "La edita el agente según el caso. Vos la ajustás y aprobás.",
    tiers: { hot: "Caliente", warm: "Tibio", cold: "Frío", spam: "Spam" },
    route: { hot: "Avisar ahora por WhatsApp a Martín y ofrecer una llamada de 15 minutos. Respuesta en menos de 15 minutos hábiles.", warm: "Mandar mini caso parecido y un diagnóstico corto. Seguimiento automático en 2 días.", cold: "Sumar al newsletter y ofrecer la plantilla gratis. Sin seguimiento manual.", spam: "Descartar sin responder y bloquear el dominio." },
    approve: "Aprobar y enviar respuesta", discard: "Confirmar descarte", sent: "Respuesta aprobada (envío simulado)", discarded: "Descartado por vos",
    inbox: "Bandeja", empty: "Todavía no entró ningún lead. Cargá un ejemplo y mirá cómo lo califica.", pending: "Esperando tu OK",
    kpiLeads: "Leads procesados", kpiHot: "Calientes", kpiWarm: "Tibios", kpiSpam: "Spam descartado",
    note: "IA simulada: son reglas que podés leer, sin llamadas a ningún servicio externo. En la versión real se puede sumar un modelo de lenguaje, pero responder sigue siendo decisión tuya.",
    pts: "pts", noParts: "Sin señales",
    logScored: (n: string, s: number, t: string) => `Califiqué a ${n}: ${s} puntos, ${t}.`, logSent: (n: string) => `Aprobaste la respuesta a ${n} (envío simulado).`, logDiscard: (n: string) => `Confirmaste el descarte de ${n} como spam.`,
    p: { budget: "Presupuesto", urgency: "Urgencia", size: "Tamaño del equipo", sector: "Rubro dentro de lo que automatizamos", pain: "Dolor concreto en el mensaje", detail: "Mensaje con detalle", short: "Mensaje muy corto", corp: "Email de empresa", referral: "Llegó por referido", wa: "Escribió por WhatsApp", links: "Muchos links", spam: "Frases típicas de spam", caps: "Todo en mayúsculas" },
  },
  en: {
    label: "AI lead capture and qualification",
    form: "A new lead came in", presets: "Load an example", name: "Name", email: "Email", sector: "Industry", size: "Team size", channel: "How they arrived", budget: "Estimated budget", urgency: "Urgency", message: "Message",
    submit: "Let the AI score it", reading: "The AI is reading the message…", clear: "Clear",
    errName: "Enter a name.", errEmail: "Check the email: it looks incomplete.", errMsg: "Tell us a bit more (at least 10 characters).",
    result: "Qualification", score: "Score", breakdown: "Why this score (visible rules)", routing: "Suggested routing", reply: "Suggested reply", replyHelp: "The agent drafts it for the case. You tweak it and approve.",
    tiers: { hot: "Hot", warm: "Warm", cold: "Cold", spam: "Spam" },
    route: { hot: "Alert Martin on WhatsApp now and offer a 15-minute call. Reply within 15 business minutes.", warm: "Send a similar mini case and a short diagnostic. Automatic follow-up in 2 days.", cold: "Add to the newsletter and offer the free template. No manual follow-up.", spam: "Discard without replying and block the domain." },
    approve: "Approve and send reply", discard: "Confirm discard", sent: "Reply approved (simulated send)", discarded: "Discarded by you",
    inbox: "Inbox", empty: "No leads yet. Load an example and see how it scores.", pending: "Waiting for your OK",
    kpiLeads: "Leads processed", kpiHot: "Hot", kpiWarm: "Warm", kpiSpam: "Spam discarded",
    note: "Simulated AI: these are rules you can read, with no calls to any outside service. The real version can add a language model, but replying is still your decision.",
    pts: "pts", noParts: "No signals",
    logScored: (n: string, s: number, t: string) => `I scored ${n}: ${s} points, ${t}.`, logSent: (n: string) => `You approved the reply to ${n} (simulated send).`, logDiscard: (n: string) => `You confirmed discarding ${n} as spam.`,
    p: { budget: "Budget", urgency: "Urgency", size: "Team size", sector: "Industry we typically automate", pain: "Concrete pain in the message", detail: "Detailed message", short: "Very short message", corp: "Company email", referral: "Came by referral", wa: "Wrote on WhatsApp", links: "Too many links", spam: "Typical spam phrases", caps: "All caps" },
  },
};

function score(form: Form, loc: Loc): { score: number; tier: Tier; parts: Part[]; pain: string | null } {
  const t = T[loc].p;
  const parts: Part[] = [];
  const add = (label: string, points: number) => { if (points !== 0) parts.push({ label, points }); };
  const budget: Record<string, number> = { unknown: 0, "<500": 5, "500-2000": 15, "2000-8000": 25, ">8000": 30 };
  const urgency: Record<string, number> = { browsing: 0, quarter: 8, month: 15, now: 20 };
  const size: Record<string, number> = { "1-5": 4, "6-20": 10, "21-100": 15, "100+": 12 };
  const sector: Record<string, number> = { retail: 10, food: 10, wholesale: 10, services: 10, industry: 8, other: 3 };
  add(`${t.budget}`, budget[form.budget] ?? 0);
  add(`${t.urgency}`, urgency[form.urgency] ?? 0);
  add(`${t.size}`, size[form.size] ?? 0);
  add(`${t.sector}`, sector[form.sector] ?? 0);
  const msg = form.message.trim();
  const painHits = PAIN.filter((p) => p.re.test(msg));
  add(t.pain, Math.min(15, painHits.length * 5));
  if (msg.length >= 80) add(t.detail, 5);
  if (msg.length < 15) add(t.short, -5);
  if (form.email && !FREE_MAIL.test(form.email) && /@/.test(form.email)) add(t.corp, 5);
  if (form.channel === "referral") add(t.referral, 5);
  if (form.channel === "whatsapp") add(t.wa, 2);
  const links = (msg.match(/https?:\/\//gi) ?? []).length;
  let flagged = false;
  if (links > 2) { add(t.links, -40); flagged = true; }
  if (SPAM.test(msg) || SPAM.test(form.name)) { add(t.spam, -40); flagged = true; }
  const letters = msg.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  if (letters.length > 20 && letters === letters.toUpperCase()) add(t.caps, -10);
  const total = Math.max(0, Math.min(100, parts.reduce((s, p) => s + p.points, 0)));
  const tier: Tier = flagged ? "spam" : total >= 65 ? "hot" : total >= 40 ? "warm" : "cold";
  return { score: total, tier, parts, pain: painHits[0] ? painHits[0][loc] : null };
}

function replyFor(form: Form, tier: Tier, pain: string | null, loc: Loc) {
  const first = form.name.trim().split(" ")[0] || (loc === "es" ? "" : "there");
  const topic = pain ?? (loc === "es" ? "ese proceso" : "that process");
  if (tier === "spam") return "";
  const wa = form.channel === "whatsapp" || form.channel === "instagram";
  if (loc === "es") {
    if (tier === "hot") return `Hola ${first}, soy Martín de Puna Tech. Leí tu mensaje y ${topic} es justo lo que automatizamos: el agente prepara y vos aprobás cada paso. ¿Te va una llamada de 15 minutos hoy o mañana? Así te contamos cómo lo armaríamos con lo que ya usan. Te dejo mi agenda: cal.com/puna-tech-r7xi5x/15min`;
    if (tier === "warm") return `Hola ${first}, gracias por escribirnos. Sobre ${topic}: te mando un caso parecido y un diagnóstico corto para ver si conviene automatizarlo ya o mejor ordenar primero la planilla. ${wa ? "" : "Respondeme por acá con 2 o 3 datos y seguimos. "}Un abrazo, Martín.`;
    return `Hola ${first}, gracias por escribir. Para poder ayudarte mejor, ¿qué proceso te gustaría sacarte de encima? Mientras tanto, te dejo una plantilla gratis de cobranzas para ordenarte. Martín.`;
  }
  if (tier === "hot") return `Hi ${first}, Martin from Puna Tech here. I read your message and ${topic} is exactly what we automate: the agent prepares, you approve each step. Can we do a 15-minute call today or tomorrow? We'll show how we'd build it on what you already use. My calendar: cal.com/puna-tech-r7xi5x/15min`;
  if (tier === "warm") return `Hi ${first}, thanks for reaching out. About ${topic}: I'll send a similar case and a short diagnostic to see whether to automate now or tidy the spreadsheet first. ${wa ? "" : "Reply here with 2 or 3 details and we'll continue. "}Best, Martin.`;
  return `Hi ${first}, thanks for writing. To help you better, which process would you like to get rid of? Meanwhile, here is a free collections template to get organized. Martin.`;
}

export default function LeadScoringDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const opts = OPTIONS[loc];
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [nextId, setNextId] = useState(1);
  const { entries, push, clear } = useActionLog("lead-scoring");
  const { busy, run } = useBusy();

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = t.errName;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) next.email = t.errEmail;
    if (form.message.trim().length < 10) next.message = t.errMsg;
    setErrors(next);
    if (Object.keys(next).length) return;
    const snapshot = { ...form };
    run(() => {
      const r = score(snapshot, loc);
      const lead: Lead = { id: nextId, form: snapshot, score: r.score, tier: r.tier, parts: r.parts, pain: r.pain, reply: replyFor(snapshot, r.tier, r.pain, loc), status: "pending" };
      setNextId((n) => n + 1);
      setLeads((l) => [lead, ...l]);
      setSelected(lead.id);
      push(t.logScored(snapshot.name, r.score, t.tiers[r.tier]), "agent");
    }, 800);
  }

  const current = leads.find((l) => l.id === selected) ?? null;
  const update = (id: number, patch: Partial<Lead>) => setLeads((l) => l.map((x) => x.id === id ? { ...x, ...patch } : x));

  function reset() { setForm(EMPTY); setErrors({}); setLeads([]); setSelected(null); setNextId(1); clear(); }

  const count = (tier: Tier) => leads.filter((l) => l.tier === tier).length;

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiLeads} value={String(leads.length)} />
        <Kpi label={t.kpiHot} value={String(count("hot"))} tone="bad" />
        <Kpi label={t.kpiWarm} value={String(count("warm"))} tone="warn" />
        <Kpi label={t.kpiSpam} value={String(leads.filter((l) => l.tier === "spam" && l.status === "discarded").length)} tone="good" />
      </div>

      <div className="dm-grid-2">
        <form className="dm-panel" onSubmit={submit} noValidate aria-label={t.form}>
          <h3 className="dm-panel-title">{t.form}</h3>
          <div className="dm-chips" role="group" aria-label={t.presets}>
            <span className="dm-hint">{t.presets}:</span>
            {Object.entries(PRESETS).map(([k, p]) => (
              <button key={k} type="button" className="dm-pill" onClick={() => { setForm(p.form); setErrors({}); }}>{p[loc]}</button>
            ))}
          </div>
          <div className="dm-form-grid">
            <label className="dm-field"><span>{t.name}</span><input className="dm-input" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} autoComplete="off" />{errors.name ? <ErrorNote>{errors.name}</ErrorNote> : null}</label>
            <label className="dm-field"><span>{t.email}</span><input className="dm-input" type="email" value={form.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} autoComplete="off" />{errors.email ? <ErrorNote>{errors.email}</ErrorNote> : null}</label>
            {(["sector", "size", "channel", "budget", "urgency"] as const).map((k) => (
              <label key={k} className="dm-field"><span>{t[k]}</span>
                <select className="dm-input" value={form[k]} onChange={set(k)}>{opts[k].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </label>
            ))}
          </div>
          <label className="dm-field"><span>{t.message}</span><textarea className="dm-input dm-textarea" rows={5} value={form.message} onChange={set("message")} aria-invalid={Boolean(errors.message)} />{errors.message ? <ErrorNote>{errors.message}</ErrorNote> : null}</label>
          <div className="dm-row">
            <button type="submit" className="dm-btn dm-btn-primary" disabled={busy}>{busy ? <Spinner label={t.reading} /> : (<><Sparkles aria-hidden="true" size={16} />{t.submit}</>)}</button>
            <button type="button" className="dm-btn dm-btn-ghost" onClick={() => { setForm(EMPTY); setErrors({}); }}><Trash2 aria-hidden="true" size={16} />{t.clear}</button>
          </div>
          <p className="dm-hint">{t.note}</p>
        </form>

        <section className="dm-panel" aria-label={t.result} aria-live="polite">
          <h3 className="dm-panel-title">{t.result}</h3>
          {busy ? <p className="dm-empty"><Spinner label={t.reading} /></p> : !current ? <p className="dm-empty">{t.empty}</p> : (
            <>
              <div className="dm-score">
                <div className="dm-meter" role="img" aria-label={`${t.score}: ${current.score} / 100`}>
                  <div className={`dm-meter-bar is-${current.tier}`} style={{ width: `${current.score}%` }} />
                </div>
                <strong className="dm-score-num">{current.score}<small>/100</small></strong>
                <Chip tone={current.tier === "hot" ? "bad" : current.tier === "warm" ? "warn" : current.tier === "spam" ? "ink" : "mute"}>{t.tiers[current.tier]}</Chip>
              </div>
              <h4 className="dm-sub">{t.breakdown}</h4>
              {current.parts.length === 0 ? <p className="dm-empty">{t.noParts}</p> : (
                <ul className="dm-parts">{current.parts.map((p) => <li key={p.label}><span>{p.label}</span><strong className={p.points < 0 ? "dm-bad" : "dm-good"}>{p.points > 0 ? "+" : ""}{p.points} {t.pts}</strong></li>)}</ul>
              )}
              <h4 className="dm-sub">{t.routing}</h4>
              <p className="dm-route">{t.route[current.tier]}</p>
              {current.tier !== "spam" ? (
                <>
                  <h4 className="dm-sub">{t.reply}</h4>
                  <label className="dm-field"><span className="dm-sr">{t.reply}</span>
                    <textarea className="dm-input dm-textarea" rows={6} value={current.reply} disabled={current.status !== "pending"} onChange={(e) => update(current.id, { reply: e.target.value })} />
                  </label>
                  <small className="dm-hint">{t.replyHelp}</small>
                </>
              ) : null}
              <div className="dm-row">
                {current.status === "pending" ? (
                  current.tier === "spam" ? (
                    <button type="button" className="dm-btn dm-btn-primary" onClick={() => { update(current.id, { status: "discarded" }); push(t.logDiscard(current.form.name), "approved"); }}><Trash2 aria-hidden="true" size={16} />{t.discard}</button>
                  ) : (
                    <button type="button" className="dm-btn dm-btn-primary" disabled={!current.reply.trim()} onClick={() => { update(current.id, { status: "sent" }); push(t.logSent(current.form.name), "approved"); }}><Send aria-hidden="true" size={16} />{t.approve}</button>
                  )
                ) : <ApprovedStamp>{current.status === "sent" ? t.sent : t.discarded}</ApprovedStamp>}
              </div>
            </>
          )}
        </section>
      </div>

      <section className="dm-panel" aria-label={t.inbox}>
        <h3 className="dm-panel-title">{t.inbox}</h3>
        {leads.length === 0 ? <p className="dm-empty">{t.empty}</p> : (
          <ul className="dm-list">
            {leads.map((l) => (
              <li key={l.id}>
                <button type="button" className={`dm-row-btn${selected === l.id ? " is-selected" : ""}`} aria-pressed={selected === l.id} onClick={() => setSelected(l.id)}>
                  <span className="dm-row-main"><strong>{l.form.name}</strong><small>{l.form.email}</small></span>
                  <span className="dm-row-side"><strong>{l.score}</strong><Chip tone={l.tier === "hot" ? "bad" : l.tier === "warm" ? "warn" : "mute"}>{t.tiers[l.tier]}</Chip>
                    {l.status === "pending" ? <Chip tone="orange">{t.pending}</Chip> : <Chip tone="good"><Check aria-hidden="true" size={12} />{l.status === "sent" ? t.sent : t.discarded}</Chip>}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
