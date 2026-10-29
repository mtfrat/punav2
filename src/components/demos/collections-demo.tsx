import { useMemo, useState } from "react";
import { Check, Mail, MessageCircle, SkipForward, Sparkles, Wallet } from "lucide-react";
import { ActionLog, Chip, DemoFrame, ErrorNote, Kpi, Spinner, exampleDate, money, useActionLog, useBusy, type Loc } from "./shared";

interface Invoice { id: string; client: string; amount: number; dueOffset: number; paid?: boolean }
type Channel = "wa" | "mail";

const INVOICES: Invoice[] = [
  { id: "A-0001-1284", client: "Ferretería El Tornillo", amount: 184500, dueOffset: -18 },
  { id: "A-0001-1291", client: "Distribuidora Norte SRL", amount: 642300, dueOffset: -9 },
  { id: "A-0001-1302", client: "Kiosco 24hs Palermo", amount: 38900, dueOffset: -2 },
  { id: "A-0001-1310", client: "Estudio Contable Pérez", amount: 95000, dueOffset: 3 },
  { id: "A-0001-1316", client: "Panadería La Espiga", amount: 127800, dueOffset: 5 },
  { id: "A-0001-1263", client: "Corralón San Martín", amount: 1218000, dueOffset: -24 },
  { id: "A-0001-1322", client: "Librería Aguas Claras", amount: 56400, dueOffset: 12 },
  { id: "A-0001-1275", client: "Gimnasio Costa Norte", amount: 210000, dueOffset: -6, paid: true },
  { id: "A-0001-1280", client: "Transportes del Sur", amount: 330000, dueOffset: -4, paid: true },
];

const T = {
  es: {
    label: "Cobranzas automáticas",
    kpiPaid: "Cobrado", kpiSoon: "Por vencer", kpiLate: "Vencido", kpiSent: "Recordatorios enviados",
    kpiPaidSub: (p: number) => `${p}% de lo facturado`, kpiSoonSub: (n: number) => `${n} facturas`, kpiLateSub: (n: number) => `${n} facturas`, kpiSentSub: "aprobados por vos",
    invoices: "Facturas", filters: { all: "Todas", late: "Vencidas", soon: "Por vencer", paid: "Cobradas" },
    due: "vence", late: (d: number) => `${d} días vencida`, lateOne: "1 día vencida", todayDue: "vence hoy", inDays: (d: number) => `vence en ${d} días`, paidTag: "Cobrada",
    next: "Próximo paso", none: "Sin pendientes", waitIn: (d: number) => `Próximo aviso en ${d} días`, pending: "Para aprobar",
    rules: "Reglas de escalonamiento", rulesHelp: "Días respecto del vencimiento (negativo = antes). Cambialos y mirá cómo se reordena todo.",
    steps: ["Recordatorio amable", "Aviso de vencida", "Segundo aviso firme", "Último aviso + llamada"],
    chanLabel: "Canal", wa: "WhatsApp", mail: "Mail",
    prepare: "Que el agente prepare los de hoy", preparing: "Revisando facturas…", prepared: (n: number) => `El agente preparó ${n} recordatorios para hoy`, unprepared: "El agente todavía no revisó las facturas de hoy. Tocá el botón y te deja los borradores listos para aprobar.",
    approveAll: (n: number) => `Aprobar y enviar los ${n}`,
    timeline: "Línea de tiempo", draft: "Borrador", edit: "Podés editarlo antes de aprobar", approve: "Aprobar y enviar", skip: "Saltear este paso", markPaid: "Simular cobro por Mercado Pago",
    sentTag: "Enviado", skippedTag: "Salteado", supersededTag: "Superado", futureTag: "Programado", pendingTag: "Esperando tu OK",
    pick: "Elegí una factura de la lista para ver su línea de tiempo.", emptyList: "No hay facturas con este filtro.",
    noPending: "Esta factura no tiene pasos pendientes hoy.", paidDone: "Cobrada: el agente frenó todos los recordatorios.",
    emptyDraftErr: "El mensaje no puede quedar vacío. Escribí algo o saltéalo.",
    logPrepared: (n: number) => `Revisé ${n} facturas abiertas y dejé borradores listos para tu aprobación.`,
    logSent: (c: string, ch: string, step: string) => `Aprobaste "${step}" para ${c} por ${ch} (envío simulado).`,
    logSkip: (c: string, step: string) => `Salteaste "${step}" para ${c}.`,
    logPaid: (c: string, a: string) => `Mercado Pago avisó un pago de ${a} de ${c}. Marqué la factura como cobrada y frené los avisos.`,
    logRules: "Actualicé las reglas de escalonamiento y recalculé los pendientes.",
    resetNote: "Demo reiniciada.",
    wasteTitle: "Resultado en pantalla",
  },
  en: {
    label: "Automatic collections",
    kpiPaid: "Collected", kpiSoon: "Not yet due", kpiLate: "Overdue", kpiSent: "Reminders sent",
    kpiPaidSub: (p: number) => `${p}% of invoiced`, kpiSoonSub: (n: number) => `${n} invoices`, kpiLateSub: (n: number) => `${n} invoices`, kpiSentSub: "approved by you",
    invoices: "Invoices", filters: { all: "All", late: "Overdue", soon: "Not yet due", paid: "Paid" },
    due: "due", late: (d: number) => `${d} days overdue`, lateOne: "1 day overdue", todayDue: "due today", inDays: (d: number) => `due in ${d} days`, paidTag: "Paid",
    next: "Next step", none: "Nothing pending", waitIn: (d: number) => `Next notice in ${d} days`, pending: "Needs approval",
    rules: "Escalation rules", rulesHelp: "Days relative to the due date (negative = before). Change them and watch everything reorder.",
    steps: ["Friendly reminder", "Overdue notice", "Firm second notice", "Final notice + call"],
    chanLabel: "Channel", wa: "WhatsApp", mail: "Email",
    prepare: "Let the agent prepare today's", preparing: "Reviewing invoices…", prepared: (n: number) => `The agent prepared ${n} reminders for today`, unprepared: "The agent hasn't reviewed today's invoices yet. Press the button and drafts will be ready for your approval.",
    approveAll: (n: number) => `Approve and send all ${n}`,
    timeline: "Timeline", draft: "Draft", edit: "You can edit it before approving", approve: "Approve and send", skip: "Skip this step", markPaid: "Simulate Mercado Pago payment",
    sentTag: "Sent", skippedTag: "Skipped", supersededTag: "Superseded", futureTag: "Scheduled", pendingTag: "Waiting for your OK",
    pick: "Pick an invoice from the list to see its timeline.", emptyList: "No invoices match this filter.",
    noPending: "This invoice has nothing pending today.", paidDone: "Paid: the agent stopped all reminders.",
    emptyDraftErr: "The message can't be empty. Write something or skip it.",
    logPrepared: (n: number) => `I reviewed ${n} open invoices and left drafts ready for your approval.`,
    logSent: (c: string, ch: string, step: string) => `You approved "${step}" for ${c} via ${ch} (simulated send).`,
    logSkip: (c: string, step: string) => `You skipped "${step}" for ${c}.`,
    logPaid: (c: string, a: string) => `Mercado Pago reported a ${a} payment from ${c}. I marked the invoice as paid and stopped the reminders.`,
    logRules: "I updated the escalation rules and recalculated what is pending.",
    resetNote: "Demo reset.",
    wasteTitle: "Result on screen",
  },
};

function draftText(loc: Loc, stepIndex: number, channel: Channel, inv: Invoice) {
  const amount = money(inv.amount, loc);
  const date = exampleDate(inv.dueOffset, loc);
  const link = "mpago.la/k7Qp2x";
  if (loc === "es") {
    const body = [
      `Hola ${inv.client.split(" ")[0]}, ¿cómo andan? Te recordamos que la factura ${inv.id} por ${amount} vence el ${date}. Podés pagarla acá: ${link}. ¡Gracias!`,
      `Hola, vimos que la factura ${inv.id} por ${amount} venció el ${date}. Si ya la pagaste, avisanos y la conciliamos. Si no, te dejamos el link: ${link}.`,
      `Buenas. La factura ${inv.id} por ${amount} sigue pendiente desde el ${date}. ¿Pudieron revisarla? Necesitamos regularizarla esta semana. Link de pago: ${link}.`,
      `Hola. La factura ${inv.id} por ${amount} lleva más de 15 días vencida (${date}). Martín los va a llamar hoy para coordinar. Para evitar la suspensión de entregas, pagala acá: ${link}.`,
    ][stepIndex];
    return channel === "mail" ? `Asunto: Factura ${inv.id} · ${amount}\n\n${body}\n\nSaludos,\nAdministración` : body;
  }
  const body = [
    `Hi ${inv.client.split(" ")[0]}, hope all is well. Just a reminder that invoice ${inv.id} for ${amount} is due on ${date}. You can pay here: ${link}. Thanks!`,
    `Hi, we noticed invoice ${inv.id} for ${amount} was due on ${date}. If you already paid, let us know and we'll reconcile it. If not, here's the link: ${link}.`,
    `Hello. Invoice ${inv.id} for ${amount} has been pending since ${date}. Could you review it? We need to settle it this week. Payment link: ${link}.`,
    `Hello. Invoice ${inv.id} for ${amount} is more than 15 days overdue (${date}). The owner will call you today to arrange payment. To avoid pausing deliveries, please pay here: ${link}.`,
  ][stepIndex];
  return channel === "mail" ? `Subject: Invoice ${inv.id} · ${amount}\n\n${body}\n\nBest,\nAccounts` : body;
}

type Handled = Record<string, "sent" | "skipped">;

export default function CollectionsDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [days, setDays] = useState<number[]>([-3, 1, 7, 15]);
  const [paid, setPaid] = useState<Record<string, boolean>>({});
  const [handled, setHandled] = useState<Handled>({});
  const [prepared, setPrepared] = useState(false);
  const [filter, setFilter] = useState<"all" | "late" | "soon" | "paid">("all");
  const [selected, setSelected] = useState<string | null>("A-0001-1284");
  const [channel, setChannel] = useState<Channel>("wa");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const { entries, push, clear } = useActionLog("collections");
  const { busy, run } = useBusy();

  const isPaid = (inv: Invoice) => Boolean(inv.paid || paid[inv.id]);
  const age = (inv: Invoice) => -inv.dueOffset;

  /** Latest eligible, unhandled step is the one waiting for approval; earlier unhandled eligible steps are superseded. */
  function pendingStep(inv: Invoice): number | null {
    if (isPaid(inv)) return null;
    let found: number | null = null;
    days.forEach((d, i) => { if (age(inv) >= d && !handled[`${inv.id}:${i}`]) found = i; });
    return found;
  }
  function nextWait(inv: Invoice): number | null {
    if (isPaid(inv)) return null;
    const upcoming = days.map((d) => d - age(inv)).filter((x) => x > 0);
    return upcoming.length ? Math.min(...upcoming) : null;
  }

  const stats = useMemo(() => {
    const total = INVOICES.reduce((s, i) => s + i.amount, 0);
    const cobrado = INVOICES.filter((i) => isPaid(i)).reduce((s, i) => s + i.amount, 0);
    const open = INVOICES.filter((i) => !isPaid(i));
    const vencido = open.filter((i) => age(i) > 0);
    const soon = open.filter((i) => age(i) <= 0);
    return { total, cobrado, vencido, soon, sent: Object.values(handled).filter((v) => v === "sent").length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid, handled]);

  const queue = INVOICES.filter((i) => pendingStep(i) !== null);
  const visible = INVOICES.filter((inv) => {
    if (filter === "paid") return isPaid(inv);
    if (filter === "late") return !isPaid(inv) && age(inv) > 0;
    if (filter === "soon") return !isPaid(inv) && age(inv) <= 0;
    return true;
  });
  const current = INVOICES.find((i) => i.id === selected) ?? null;

  function reset() {
    setDays([-3, 1, 7, 15]); setPaid({}); setHandled({}); setPrepared(false); setFilter("all"); setSelected("A-0001-1284"); setChannel("wa"); setEdits({}); setError(""); clear();
    push(t.resetNote, "info");
  }

  function prepare() {
    run(() => { setPrepared(true); push(t.logPrepared(INVOICES.filter((i) => !isPaid(i)).length), "agent"); });
  }

  function textFor(inv: Invoice, step: number) {
    return edits[`${inv.id}:${step}:${channel}`] ?? draftText(loc, step, channel, inv);
  }

  function approve(inv: Invoice, step: number, ch: Channel = channel, text?: string) {
    const body = text ?? textFor(inv, step);
    if (!body.trim()) { setError(t.emptyDraftErr); return; }
    setError("");
    setHandled((h) => {
      const next = { ...h };
      days.forEach((_, i) => { if (i <= step && !next[`${inv.id}:${i}`]) next[`${inv.id}:${i}`] = i === step ? "sent" : "skipped"; });
      return next;
    });
    push(t.logSent(inv.client, ch === "wa" ? t.wa : t.mail, t.steps[step]), "approved");
  }

  function approveAll() {
    queue.forEach((inv) => {
      const step = pendingStep(inv);
      if (step === null) return;
      const ch: Channel = step === 0 || step === 2 ? "wa" : "mail";
      approve(inv, step, ch, draftText(loc, step, ch, inv));
    });
  }

  function skip(inv: Invoice, step: number) {
    setError("");
    setHandled((h) => ({ ...h, [`${inv.id}:${step}`]: "skipped" }));
    push(t.logSkip(inv.client, t.steps[step]), "info");
  }

  function markPaid(inv: Invoice) {
    setPaid((p) => ({ ...p, [inv.id]: true }));
    push(t.logPaid(inv.client, money(inv.amount, loc)), "agent");
  }

  function setDay(i: number, value: number) {
    const next = [...days];
    next[i] = value;
    setDays(next);
    push(t.logRules, "info");
  }

  function dueLabel(inv: Invoice) {
    if (isPaid(inv)) return t.paidTag;
    const a = age(inv);
    if (a > 1) return t.late(a);
    if (a === 1) return t.lateOne;
    if (a === 0) return t.todayDue;
    return t.inDays(-a);
  }

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiPaid} value={money(stats.cobrado, loc)} sub={t.kpiPaidSub(Math.round((stats.cobrado / stats.total) * 100))} tone="good" />
        <Kpi label={t.kpiSoon} value={money(stats.soon.reduce((s, i) => s + i.amount, 0), loc)} sub={t.kpiSoonSub(stats.soon.length)} />
        <Kpi label={t.kpiLate} value={money(stats.vencido.reduce((s, i) => s + i.amount, 0), loc)} sub={t.kpiLateSub(stats.vencido.length)} tone="bad" />
        <Kpi label={t.kpiSent} value={String(stats.sent)} sub={t.kpiSentSub} tone="warn" />
      </div>

      <div className="dm-agentbar">
        <div>
          <strong>{prepared ? t.prepared(queue.length) : t.unprepared}</strong>
        </div>
        <div className="dm-row">
          {!prepared ? (
            <button type="button" className="dm-btn dm-btn-primary" onClick={prepare} disabled={busy}>
              {busy ? <Spinner label={t.preparing} /> : (<><Sparkles aria-hidden="true" size={16} />{t.prepare}</>)}
            </button>
          ) : (
            <button type="button" className="dm-btn dm-btn-primary" onClick={approveAll} disabled={queue.length === 0}>
              <Check aria-hidden="true" size={16} />{t.approveAll(queue.length)}
            </button>
          )}
        </div>
      </div>

      <div className="dm-grid-2">
        <section className="dm-panel" aria-label={t.invoices}>
          <h3 className="dm-panel-title">{t.invoices}</h3>
          <div className="dm-chips" role="group" aria-label={t.invoices}>
            {(Object.keys(t.filters) as Array<keyof typeof t.filters>).map((key) => (
              <button key={key} type="button" className={`dm-pill${filter === key ? " is-on" : ""}`} aria-pressed={filter === key} onClick={() => setFilter(key)}>{t.filters[key]}</button>
            ))}
          </div>
          {visible.length === 0 ? <p className="dm-empty">{t.emptyList}</p> : (
            <ul className="dm-list">
              {visible.map((inv) => {
                const step = prepared ? pendingStep(inv) : null;
                const wait = nextWait(inv);
                return (
                  <li key={inv.id}>
                    <button type="button" className={`dm-row-btn${selected === inv.id ? " is-selected" : ""}`} aria-pressed={selected === inv.id} onClick={() => { setSelected(inv.id); setError(""); }}>
                      <span className="dm-row-main"><strong>{inv.client}</strong><small>{inv.id} · {t.due} {exampleDate(inv.dueOffset, loc)}</small></span>
                      <span className="dm-row-side">
                        <strong>{money(inv.amount, loc)}</strong>
                        <Chip tone={isPaid(inv) ? "good" : age(inv) > 0 ? "bad" : "mute"}>{dueLabel(inv)}</Chip>
                        {step !== null ? <Chip tone="orange">{t.pending}</Chip> : !isPaid(inv) && wait ? <small>{t.waitIn(wait)}</small> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="dm-panel" aria-label={t.timeline}>
          <h3 className="dm-panel-title">{t.timeline}{current ? ` · ${current.client}` : ""}</h3>
          {!current ? <p className="dm-empty">{t.pick}</p> : (
            <>
              <ol className="dm-timeline">
                {days.map((d, i) => {
                  const state = handled[`${current.id}:${i}`];
                  const eligible = age(current) >= d;
                  const isPend = prepared && pendingStep(current) === i;
                  const tag = state === "sent" ? t.sentTag : state === "skipped" ? t.skippedTag : isPend ? t.pendingTag : eligible ? (isPaid(current) ? t.futureTag : t.supersededTag) : t.futureTag;
                  const tone = state === "sent" ? "good" : isPend ? "orange" : "mute";
                  return (
                    <li key={i} className={`dm-tl-item${state === "sent" ? " is-done" : ""}${isPend ? " is-now" : ""}`}>
                      <span className="dm-tl-dot" aria-hidden="true" />
                      <div>
                        <strong>{t.steps[i]}</strong>
                        <small>{d < 0 ? `${-d}d ${loc === "es" ? "antes" : "before"}` : `+${d}d`} · {exampleDate(current.dueOffset + d, loc)} · {i === 0 || i === 2 ? t.wa : t.mail}</small>
                      </div>
                      <Chip tone={tone}>{tag}</Chip>
                    </li>
                  );
                })}
              </ol>

              {isPaid(current) ? <p className="dm-note-ok"><Check aria-hidden="true" size={16} />{t.paidDone}</p> : (() => {
                const step = pendingStep(current);
                if (!prepared) return (
                  <div className="dm-row"><button type="button" className="dm-btn dm-btn-ghost" onClick={() => markPaid(current)}><Wallet aria-hidden="true" size={16} />{t.markPaid}</button></div>
                );
                if (step === null) return (
                  <>
                    <p className="dm-empty">{t.noPending}</p>
                    <div className="dm-row"><button type="button" className="dm-btn dm-btn-ghost" onClick={() => markPaid(current)}><Wallet aria-hidden="true" size={16} />{t.markPaid}</button></div>
                  </>
                );
                const key = `${current.id}:${step}:${channel}`;
                return (
                  <div className="dm-draft">
                    <div className="dm-row dm-row-between">
                      <strong>{t.draft} · {t.steps[step]}</strong>
                      <div className="dm-chips" role="group" aria-label={t.chanLabel}>
                        <button type="button" className={`dm-pill${channel === "wa" ? " is-on" : ""}`} aria-pressed={channel === "wa"} onClick={() => setChannel("wa")}><MessageCircle aria-hidden="true" size={14} />{t.wa}</button>
                        <button type="button" className={`dm-pill${channel === "mail" ? " is-on" : ""}`} aria-pressed={channel === "mail"} onClick={() => setChannel("mail")}><Mail aria-hidden="true" size={14} />{t.mail}</button>
                      </div>
                    </div>
                    <label className="dm-field">
                      <span className="dm-sr">{t.edit}</span>
                      <textarea className="dm-input dm-textarea" rows={channel === "mail" ? 7 : 5} value={textFor(current, step)} onChange={(e) => { setEdits((x) => ({ ...x, [key]: e.target.value })); setError(""); }} />
                    </label>
                    <small className="dm-hint">{t.edit}</small>
                    {error ? <ErrorNote>{error}</ErrorNote> : null}
                    <div className="dm-row">
                      <button type="button" className="dm-btn dm-btn-primary" onClick={() => approve(current, step)}><Check aria-hidden="true" size={16} />{t.approve}</button>
                      <button type="button" className="dm-btn dm-btn-ghost" onClick={() => skip(current, step)}><SkipForward aria-hidden="true" size={16} />{t.skip}</button>
                      <button type="button" className="dm-btn dm-btn-ghost" onClick={() => markPaid(current)}><Wallet aria-hidden="true" size={16} />{t.markPaid}</button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </section>
      </div>

      <section className="dm-panel" aria-label={t.rules}>
        <h3 className="dm-panel-title">{t.rules}</h3>
        <p className="dm-hint">{t.rulesHelp}</p>
        <div className="dm-rules">
          {days.map((d, i) => (
            <label key={i} className="dm-field">
              <span>{t.steps[i]}</span>
              <input className="dm-input" type="number" inputMode="numeric" min={-10} max={60} value={d} onChange={(e) => setDay(i, Math.max(-10, Math.min(60, Number(e.target.value) || 0)))} />
            </label>
          ))}
        </div>
      </section>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
