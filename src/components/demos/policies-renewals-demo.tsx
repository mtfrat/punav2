import { useMemo, useState } from "react";
import { Check, FileText, Send, Sparkles } from "lucide-react";
import { ActionLog, ApprovedStamp, Chip, DemoFrame, ErrorNote, Kpi, Spinner, money, useActionLog, useBusy, type Loc } from "./shared";

type Ramo = "auto" | "home" | "business" | "life" | "liability" | "moto";
interface Policy { id: string; holder: string; contact: string; ramo: Ramo; insurer: string; number: string; file: string; days: number | null; premium: number }

/** Sample portfolio. "days" = days until the policy ends; null when the scan could not be read. Relative on purpose: no calendar to go stale. */
const POLICIES: Policy[] = [
  { id: "p1", holder: "Ana Beltrán", contact: "Ana", ramo: "auto", insurer: "Aseguradora Faro del Sur", number: "AU-100231", file: "poliza-auto-100231.pdf", days: 9, premium: 184000 },
  { id: "p2", holder: "Óptica Mirador S.R.L.", contact: "equipo de Óptica Mirador", ramo: "business", insurer: "Aseguradora Monte Verde", number: "IN-200458", file: "poliza-integral-200458.pdf", days: 21, premium: 420000 },
  { id: "p3", holder: "Marcos Ledesma", contact: "Marcos", ramo: "home", insurer: "Aseguradora Faro del Sur", number: "HO-300117", file: "poliza-hogar-300117.pdf", days: 27, premium: 96000 },
  { id: "p4", holder: "Lucía Ferreyra", contact: "Lucía", ramo: "life", insurer: "Aseguradora Monte Verde", number: "VI-400982", file: "poliza-vida-400982.pdf", days: 64, premium: 150000 },
  { id: "p5", holder: "Transporte Pampa Alta S.A.", contact: "equipo de Transporte Pampa Alta", ramo: "auto", insurer: "Aseguradora Monte Verde", number: "AU-100877", file: "poliza-flota-100877.pdf", days: 15, premium: 1260000 },
  { id: "p6", holder: "Taller Los Pinos S.R.L.", contact: "equipo de Taller Los Pinos", ramo: "liability", insurer: "Aseguradora Faro del Sur", number: "RC-500310", file: "poliza-rc-500310.pdf", days: 112, premium: 310000 },
  { id: "p7", holder: "Julián Moyano", contact: "Julián", ramo: "moto", insurer: "Aseguradora Faro del Sur", number: "MO-600044", file: "poliza-moto-600044.pdf", days: 41, premium: 72000 },
  { id: "p8", holder: "Paula Quiroga", contact: "Paula", ramo: "home", insurer: "Aseguradora Monte Verde", number: "HO-300642", file: "poliza-escaneada.jpg", days: null, premium: 88000 },
];
const MONTH_WINDOW = 30;

const T = {
  es: {
    label: "Pólizas desde PDF y renovaciones",
    ramos: { auto: "Automotor", home: "Hogar", business: "Integral comercio", life: "Vida", liability: "Resp. civil", moto: "Moto" } as Record<Ramo, string>,
    kpiPolicies: "Pólizas en cartera", kpiPremium: "Prima anual", kpiRenew: "Vencen en 30 días", kpiNotices: "Avisos aprobados",
    kpiPoliciesSub: "leídas de PDF", kpiPremiumSub: "suma de la cartera", kpiRenewSub: "para renovar", kpiNoticesSub: "aprobados por vos",
    uploaded: (n: number) => `Hay ${n} pólizas en PDF y fotos para cargar.`,
    idle: "Tocá el botón: el agente las lee y arma la cartera sin que tipees nada.", read: "Que el agente las lea", reading: "Leyendo pólizas…",
    done: (n: number, r: number) => `Leyó ${n} pólizas${r ? ` y ${r} quedó para revisar` : ""}.`,
    portfolio: "Cartera", filterAll: "Todas", cols: ["Asegurado", "Ramo", "Compañía", "Póliza", "Vence", "Prima anual"],
    empty: "Todavía no hay pólizas cargadas.", emptyFilter: "No hay pólizas de este ramo.",
    ends: (d: number) => (d === 0 ? "vence hoy" : d === 1 ? "vence mañana" : `vence en ${d} días`),
    review: "Para revisar", reviewHelp: "No se pudo leer la vigencia de esta póliza (escaneo borroso). Escribí cuántos días faltan y entra a las renovaciones.",
    reviewLabel: "Días hasta el vencimiento", reviewApply: "Confirmar vigencia", reviewErr: "Escribí un número de días entre 0 y 365.",
    renewals: "Renovaciones del mes", renewalsHelp: "Pólizas que vencen en los próximos 30 días, de la más urgente a la menos urgente. El agente deja el aviso listo; no sale hasta que lo aprobás.",
    noRenewals: "Cuando cargues la cartera, acá aparecen los vencimientos del mes.",
    draftTitle: "Aviso de renovación", edit: "Podés editarlo antes de aprobar", approve: "Aprobar y enviar", approveAll: (n: number) => `Aprobar los ${n}`, sentTag: "Enviado",
    urgent: "Urgente", emptyErr: "El aviso no puede quedar vacío.",
    msg: (p: Policy, ramo: string) => `Hola ${p.contact}, te escribimos porque tu póliza de ${ramo.toLowerCase()} (${p.number}) ${p.days === 0 ? "vence hoy" : p.days === 1 ? "vence mañana" : `vence en ${p.days} días`}. ¿La renovamos con las mismas condiciones? Si querés, te preparamos antes una comparación con otras coberturas. Respondenos por acá y lo resolvemos.`,
    logRead: (n: number, r: number) => `Leí ${n} pólizas y armé la cartera. ${r ? `${r} quedó para revisar por la imagen borrosa.` : "Todas se leyeron bien."}`,
    logFix: (h: string, d: number) => `Confirmaste que la póliza de ${h} vence en ${d} días. Actualicé la cartera y las renovaciones.`,
    logSent: (h: string) => `Aprobaste el aviso de renovación para ${h} (envío simulado).`,
    note: "La cartera es ficticia. En el proyecto se leen tus pólizas reales y los avisos salen por tu WhatsApp o tu mail, siempre con tu aprobación.",
  },
  en: {
    label: "Policies from PDF and renewals",
    ramos: { auto: "Motor", home: "Home", business: "Business package", life: "Life", liability: "Liability", moto: "Motorbike" } as Record<Ramo, string>,
    kpiPolicies: "Policies in portfolio", kpiPremium: "Annual premium", kpiRenew: "Due in 30 days", kpiNotices: "Notices approved",
    kpiPoliciesSub: "read from PDF", kpiPremiumSub: "portfolio total", kpiRenewSub: "to renew", kpiNoticesSub: "approved by you",
    uploaded: (n: number) => `There are ${n} policies as PDFs and photos to load.`,
    idle: "Press the button: the agent reads them and builds the portfolio without you typing anything.", read: "Let the agent read them", reading: "Reading policies…",
    done: (n: number, r: number) => `It read ${n} policies${r ? ` and ${r} was left for review` : ""}.`,
    portfolio: "Portfolio", filterAll: "All", cols: ["Policyholder", "Line", "Insurer", "Policy", "Ends", "Annual premium"],
    empty: "No policies loaded yet.", emptyFilter: "No policies for this line.",
    ends: (d: number) => (d === 0 ? "ends today" : d === 1 ? "ends tomorrow" : `ends in ${d} days`),
    review: "To review", reviewHelp: "The end date of this policy could not be read (blurry scan). Type how many days are left and it joins the renewals.",
    reviewLabel: "Days until it ends", reviewApply: "Confirm end date", reviewErr: "Type a number of days between 0 and 365.",
    renewals: "This month's renewals", renewalsHelp: "Policies ending in the next 30 days, most urgent first. The agent leaves the notice ready; it doesn't go out until you approve it.",
    noRenewals: "Once the portfolio is loaded, this month's renewals show up here.",
    draftTitle: "Renewal notice", edit: "You can edit it before approving", approve: "Approve and send", approveAll: (n: number) => `Approve all ${n}`, sentTag: "Sent",
    urgent: "Urgent", emptyErr: "The notice can't be empty.",
    msg: (p: Policy, ramo: string) => `Hi ${p.contact}, your ${ramo.toLowerCase()} policy (${p.number}) ${p.days === 0 ? "ends today" : p.days === 1 ? "ends tomorrow" : `ends in ${p.days} days`}. Shall we renew it on the same terms? If you like, we can first prepare a comparison with other coverages. Reply here and we'll sort it out.`,
    logRead: (n: number, r: number) => `I read ${n} policies and built the portfolio. ${r ? `${r} was left for review because of a blurry image.` : "All of them read fine."}`,
    logFix: (h: string, d: number) => `You confirmed ${h}'s policy ends in ${d} days. I updated the portfolio and the renewals.`,
    logSent: (h: string) => `You approved the renewal notice for ${h} (simulated send).`,
    note: "The portfolio is fictional. In a project your real policies are read and notices go out through your WhatsApp or email, always with your approval.",
  },
};

export default function PoliciesRenewalsDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [loaded, setLoaded] = useState(false);
  const [fixed, setFixed] = useState<Record<string, number>>({});
  const [fixInput, setFixInput] = useState("");
  const [fixError, setFixError] = useState("");
  const [filter, setFilter] = useState<"all" | Ramo>("all");
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { entries, push, clear } = useActionLog("policies-renewals");
  const { busy, run } = useBusy();

  const policies = useMemo(() => POLICIES.map((p) => ({ ...p, days: p.days ?? fixed[p.id] ?? null })), [fixed]);
  const unreadable = loaded ? policies.filter((p) => p.days === null) : [];
  const renewals = loaded ? policies.filter((p) => p.days !== null && p.days <= MONTH_WINDOW).sort((a, b) => (a.days ?? 0) - (b.days ?? 0)) : [];
  const pending = renewals.filter((p) => !sent.includes(p.id));
  const visible = loaded ? policies.filter((p) => filter === "all" || p.ramo === filter) : [];
  const premium = loaded ? policies.reduce((s, p) => s + p.premium, 0) : 0;
  const ramoList = Array.from(new Set(POLICIES.map((p) => p.ramo)));
  const textOf = (p: Policy) => edited[p.id] ?? t.msg(p, t.ramos[p.ramo]);

  function reset() {
    setLoaded(false); setFixed({}); setFixInput(""); setFixError(""); setFilter("all"); setEdited({}); setSent([]); setError(""); clear();
  }
  function readAll() {
    run(() => {
      setLoaded(true);
      push(t.logRead(POLICIES.length, POLICIES.filter((p) => p.days === null).length), "agent");
    }, 900);
  }
  function applyFix(p: Policy) {
    const days = Number(fixInput);
    if (!fixInput.trim() || !Number.isInteger(days) || days < 0 || days > 365) { setFixError(t.reviewErr); return; }
    setFixError(""); setFixInput("");
    setFixed((c) => ({ ...c, [p.id]: days }));
    push(t.logFix(p.holder, days), "info");
  }
  function approve(p: Policy) {
    if (!textOf(p).trim()) { setError(t.emptyErr); return false; }
    setError("");
    setEdited((c) => ({ ...c, [p.id]: textOf(p) }));
    setSent((c) => (c.includes(p.id) ? c : [...c, p.id]));
    push(t.logSent(p.holder), "approved");
    return true;
  }

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiPolicies} value={loaded ? String(POLICIES.length) : "0"} sub={t.kpiPoliciesSub} />
        <Kpi label={t.kpiPremium} value={money(premium, loc)} sub={t.kpiPremiumSub} />
        <Kpi label={t.kpiRenew} value={String(renewals.length)} tone={renewals.length ? "warn" : "ink"} sub={t.kpiRenewSub} />
        <Kpi label={t.kpiNotices} value={String(sent.length)} tone="good" sub={t.kpiNoticesSub} />
      </div>

      <div className="dm-agentbar">
        <div><strong>{t.uploaded(POLICIES.length)}</strong><br /><small>{loaded ? t.done(POLICIES.length, POLICIES.filter((p) => p.days === null).length) : t.idle}</small></div>
        {!loaded ? (busy ? <Spinner label={t.reading} /> : <button type="button" className="dm-btn dm-btn-primary" onClick={readAll}><Sparkles aria-hidden="true" size={16} />{t.read}</button>) : null}
      </div>
      <p className="dm-hint">{t.note}</p>

      <section className="dm-panel" aria-label={t.portfolio}>
        <h3 className="dm-panel-title">{t.portfolio}</h3>
        {loaded ? (
          <div className="dm-chips" role="group" aria-label={t.portfolio}>
            <button type="button" className={`dm-pill${filter === "all" ? " is-on" : ""}`} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{t.filterAll}</button>
            {ramoList.map((r) => <button key={r} type="button" className={`dm-pill${filter === r ? " is-on" : ""}`} aria-pressed={filter === r} onClick={() => setFilter(r)}>{t.ramos[r]}</button>)}
          </div>
        ) : null}
        {!loaded ? <p className="dm-empty">{t.empty}</p> : visible.length === 0 ? <p className="dm-empty">{t.emptyFilter}</p> : (
          <div className="dm-table-wrap">
            <table className="dm-table dm-table-tight">
              <caption className="dm-sr">{t.portfolio}</caption>
              <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className={p.days === null ? "is-review" : ""}>
                    <td>{p.holder}<small><FileText aria-hidden="true" size={11} /> {p.file}</small></td>
                    <td>{t.ramos[p.ramo]}</td>
                    <td>{p.insurer}</td>
                    <td className="dm-mono">{p.number}</td>
                    <td>{p.days === null ? <Chip tone="bad">{t.review}</Chip> : <Chip tone={p.days <= MONTH_WINDOW ? "warn" : "mute"}>{t.ends(p.days)}</Chip>}</td>
                    <td>{money(p.premium, loc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {unreadable.map((p) => (
          <div key={p.id} className="dm-draft">
            <strong>{t.review}: {p.holder}</strong>
            <p className="dm-error">{t.reviewHelp}</p>
            <div className="dm-row">
              <label className="dm-field"><span>{t.reviewLabel}</span>
                <input className="dm-input dm-input-sm" type="number" inputMode="numeric" min={0} max={365} value={fixInput} onChange={(e) => { setFixInput(e.target.value); setFixError(""); }} />
              </label>
              <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={() => applyFix(p)}><Check aria-hidden="true" size={14} />{t.reviewApply}</button>
            </div>
            {fixError ? <ErrorNote>{fixError}</ErrorNote> : null}
          </div>
        ))}
      </section>

      <section className="dm-panel" aria-label={t.renewals}>
        <div className="dm-row dm-row-between">
          <h3 className="dm-panel-title">{t.renewals}</h3>
          {pending.length > 1 ? <button type="button" className="dm-btn dm-btn-primary dm-btn-sm" onClick={() => { for (const p of pending) { if (!approve(p)) break; } }}><Check aria-hidden="true" size={14} />{t.approveAll(pending.length)}</button> : null}
        </div>
        <p className="dm-hint">{t.renewalsHelp}</p>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        {renewals.length === 0 ? <p className="dm-empty">{t.noRenewals}</p> : (
          <div className="dm-drafts">
            {renewals.map((p) => {
              const isSent = sent.includes(p.id);
              return (
                <article key={p.id} className={`dm-draft-card${isSent ? " is-sent" : ""}`}>
                  <div className="dm-row dm-row-between">
                    <strong>{t.draftTitle}: {p.holder}</strong>
                    <span className="dm-row">{(p.days ?? 99) <= 10 ? <Chip tone="bad">{t.urgent}</Chip> : null}<Chip tone="warn">{t.ends(p.days ?? 0)}</Chip></span>
                  </div>
                  <label className="dm-field">
                    <span className="dm-sr">{t.edit}</span>
                    <textarea className="dm-textarea" rows={4} value={textOf(p)} disabled={isSent} onChange={(e) => { setEdited((c) => ({ ...c, [p.id]: e.target.value })); setError(""); }} />
                  </label>
                  {isSent ? <ApprovedStamp>{t.sentTag}</ApprovedStamp> : (
                    <div className="dm-row">
                      <button type="button" className="dm-btn dm-btn-primary dm-btn-sm" onClick={() => approve(p)}><Send aria-hidden="true" size={14} />{t.approve}</button>
                      <small className="dm-hint">{t.edit}</small>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
