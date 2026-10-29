import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, FileText, Sparkles } from "lucide-react";
import { ActionLog, ApprovedStamp, Chip, DemoFrame, Kpi, Spinner, exampleDate, money, num, useActionLog, useBusy, type Loc } from "./shared";

interface Entry { in: string; out: string }
interface Employee { id: string; name: string; role: string; rate: number; week: Entry[] }

const e = (i: string, o: string): Entry => ({ in: i, out: o });
const EMPLOYEES: Employee[] = [
  { id: "lucia", name: "Lucía Fernández", role: "Caja", rate: 4200, week: [e("09:00", "17:00"), e("09:00", "17:05"), e("09:00", "17:00"), e("09:00", "19:30"), e("09:00", "17:00"), e("09:00", "13:00"), e("", "")] },
  { id: "marcos", name: "Marcos Giménez", role: "Reposición", rate: 3900, week: [e("08:00", "16:00"), e("08:00", "16:00"), e("08:00", ""), e("08:00", "16:00"), e("08:00", "16:00"), e("08:00", "14:00"), e("", "")] },
  { id: "camila", name: "Camila Rojas", role: "Encargada", rate: 5600, week: [e("08:30", "18:30"), e("08:30", "19:45"), e("08:30", "17:30"), e("08:30", "17:30"), e("08:30", "17:30"), e("09:00", "15:00"), e("", "")] },
  { id: "julian", name: "Julián Acosta", role: "Delivery", rate: 3700, week: [e("", ""), e("12:00", "20:00"), e("12:00", "20:00"), e("12:00", "20:00"), e("12:00", "23:00"), e("12:00", "22:00"), e("12:00", "18:00")] },
  { id: "rocio", name: "Rocío Benítez", role: "Cocina", rate: 4000, week: [e("07:00", "15:00"), e("07:00", "15:00"), e("07:00", "15:00"), e("", "15:00"), e("07:00", "15:00"), e("", ""), e("", "")] },
];

const DAYS = {
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

const T = {
  es: {
    label: "Control de horas y pagos de personal", week: "Semana", weekOf: "Semana del 19 al 25 de octubre",
    kpiHours: "Horas de la semana", kpiOt: "Horas extra", kpiAlerts: "Alertas sin resolver", kpiNet: "Neto a pagar",
    staff: "Personal", timecard: "Tarjeta de horas", in: "Entrada", out: "Salida", hours: "Horas", status: "Estado",
    ok: "Todo bien", missOut: "Falta la salida", missIn: "Falta la entrada", invalid: "La salida es anterior a la entrada", long: "Jornada de más de 10 h", off: "Franco",
    ot: (h: string) => `Extra: ${h} h`, week48: "Pasa las 48 h semanales",
    suggest: (v: string) => `Sugerencia: ${v}`, accept: "Aceptar", confirm: "Está bien, confirmar", confirmed: "Confirmada por vos",
    agentFix: "Que el agente aplique sus sugerencias", fixing: "Corrigiendo tarjetas…", nothingToFix: "No hay sugerencias pendientes",
    rules: "Reglas de prueba", rulesBody: "Jornada normal de", rulesBody2: "h. Extras al 50% de lunes a sábado; al 100% los sábados desde las 13 h y los domingos. Descuentos de ley estimados en 17%.",
    legal: "Reglas simplificadas de prueba, no reemplazan una liquidación de sueldos ni convenio colectivo.",
    payroll: "Vista previa de liquidación", cols: { emp: "Persona", reg: "Normales", o50: "Extra 50%", o100: "Extra 100%", gross: "Bruto", ded: "Descuentos", net: "Neto" },
    total: "Total", approve: "Aprobar liquidación", blocked: (n: number) => `Resolvé ${n} alerta${n === 1 ? "" : "s"} para poder aprobar`, approvedMsg: "Liquidación aprobada por vos", receipts: "Generar recibos (simulado)", receiptsDone: "Recibos listos para enviar por mail (simulado)",
    logFix: (n: number) => `Apliqué mis sugerencias en ${n} tarjetas. Quedan las que necesitan tu criterio.`, logConfirm: (n: string, d: string) => `Confirmaste la jornada larga de ${n} (${d}).`, logAccept: (n: string, d: string, v: string) => `Aceptaste la sugerencia para ${n} (${d}): ${v}.`,
    logEdit: (n: string, d: string) => `Editaste la tarjeta de ${n} (${d}). Recalculé la liquidación.`, logApprove: (t: string) => `Aprobaste la liquidación semanal: neto total ${t}.`, logReceipts: "Generé 5 recibos de sueldo en PDF y dejé los mails listos (simulado, no se envió nada).",
    noEntries: "Sin horas esta semana",
  },
  en: {
    label: "Staff hours and payroll control", week: "Week", weekOf: "Week of 19 to 25 October",
    kpiHours: "Hours this week", kpiOt: "Overtime hours", kpiAlerts: "Unresolved alerts", kpiNet: "Net to pay",
    staff: "Staff", timecard: "Timecard", in: "Clock in", out: "Clock out", hours: "Hours", status: "Status",
    ok: "All good", missOut: "Missing clock-out", missIn: "Missing clock-in", invalid: "Clock-out is before clock-in", long: "Shift longer than 10 h", off: "Day off",
    ot: (h: string) => `Overtime: ${h} h`, week48: "Over 48 h this week",
    suggest: (v: string) => `Suggestion: ${v}`, accept: "Accept", confirm: "It's fine, confirm", confirmed: "Confirmed by you",
    agentFix: "Let the agent apply its suggestions", fixing: "Fixing timecards…", nothingToFix: "No pending suggestions",
    rules: "Test rules", rulesBody: "Standard shift of", rulesBody2: "h. Overtime at 50% Monday to Saturday; at 100% on Saturdays after 1 pm and on Sundays. Statutory deductions estimated at 17%.",
    legal: "Simplified test rules. They do not replace a real payroll run or collective agreement.",
    payroll: "Payroll preview", cols: { emp: "Person", reg: "Regular", o50: "OT 50%", o100: "OT 100%", gross: "Gross", ded: "Deductions", net: "Net" },
    total: "Total", approve: "Approve payroll", blocked: (n: number) => `Resolve ${n} alert${n === 1 ? "" : "s"} to approve`, approvedMsg: "Payroll approved by you", receipts: "Generate payslips (simulated)", receiptsDone: "Payslips ready to email (simulated)",
    logFix: (n: number) => `I applied my suggestions on ${n} timecards. The ones that need your judgment are left.`, logConfirm: (n: string, d: string) => `You confirmed the long shift for ${n} (${d}).`, logAccept: (n: string, d: string, v: string) => `You accepted the suggestion for ${n} (${d}): ${v}.`,
    logEdit: (n: string, d: string) => `You edited ${n}'s timecard (${d}). I recalculated payroll.`, logApprove: (t: string) => `You approved the weekly payroll: total net ${t}.`, logReceipts: "I generated 5 PDF payslips and left the emails ready (simulated, nothing was sent).",
    noEntries: "No hours this week",
  },
};

const toMin = (v: string) => { const [h, m] = v.split(":").map(Number); return h * 60 + m; };
const toTime = (m: number) => { const x = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };

type Issue = "missOut" | "missIn" | "invalid" | "long" | null;

function analyzeDay(en: Entry, limitH: number): { minutes: number; issue: Issue; suggestion?: Entry } {
  const hasIn = Boolean(en.in), hasOut = Boolean(en.out);
  if (!hasIn && !hasOut) return { minutes: 0, issue: null };
  if (hasIn && !hasOut) return { minutes: 0, issue: "missOut", suggestion: { in: en.in, out: toTime(toMin(en.in) + limitH * 60) } };
  if (!hasIn && hasOut) return { minutes: 0, issue: "missIn", suggestion: { in: toTime(toMin(en.out) - limitH * 60), out: en.out } };
  const mins = toMin(en.out) - toMin(en.in);
  if (mins <= 0) return { minutes: 0, issue: "invalid" };
  return { minutes: mins, issue: mins > 600 ? "long" : null };
}

function splitHours(day: number, en: Entry, minutes: number, limitH: number) {
  const h = minutes / 60;
  if (minutes <= 0) return { reg: 0, o50: 0, o100: 0 };
  if (day === 6) return { reg: 0, o50: 0, o100: h };
  if (day === 5) {
    const before = Math.max(0, Math.min(toMin(en.out), 780) - Math.min(toMin(en.in), 780)) / 60;
    const after = h - before;
    return { reg: Math.min(before, limitH), o50: Math.max(before - limitH, 0), o100: after };
  }
  return { reg: Math.min(h, limitH), o50: Math.max(h - limitH, 0), o100: 0 };
}

export default function PayrollDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [data, setData] = useState<Employee[]>(EMPLOYEES);
  const [selected, setSelected] = useState("marcos");
  const [limit, setLimit] = useState(8);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [approved, setApproved] = useState(false);
  const [receipts, setReceipts] = useState(false);
  const { entries, push, clear } = useActionLog("payroll");
  const { busy, run } = useBusy();

  const calc = useMemo(() => data.map((emp) => {
    let reg = 0, o50 = 0, o100 = 0, alerts = 0;
    const days = emp.week.map((en, d) => {
      const a = analyzeDay(en, limit);
      const s = splitHours(d, en, a.minutes, limit);
      reg += s.reg; o50 += s.o50; o100 += s.o100;
      const isConfirmed = confirmed[`${emp.id}:${d}`];
      const blocking = a.issue !== null && !(a.issue === "long" && isConfirmed);
      if (blocking) alerts++;
      return { ...a, ...s, blocking, isConfirmed };
    });
    const total = reg + o50 + o100;
    const gross = emp.rate * (reg + 1.5 * o50 + 2 * o100);
    const ded = gross * 0.17;
    return { emp, days, reg, o50, o100, total, gross, ded, net: gross - ded, alerts, over48: total > 48 };
  }), [data, limit, confirmed]);

  const totals = calc.reduce((acc, c) => ({ hours: acc.hours + c.total, ot: acc.ot + c.o50 + c.o100, alerts: acc.alerts + c.alerts, net: acc.net + c.net, gross: acc.gross + c.gross, ded: acc.ded + c.ded }), { hours: 0, ot: 0, alerts: 0, net: 0, gross: 0, ded: 0 });
  const current = calc.find((c) => c.emp.id === selected) ?? calc[0];
  const suggestions = calc.reduce((n, c) => n + c.days.filter((d) => d.suggestion).length, 0);

  function invalidate() { setApproved(false); setReceipts(false); }

  function editEntry(empId: string, day: number, field: "in" | "out", value: string) {
    dirty.current = `${empId}:${day}`;
    setData((d) => d.map((emp) => emp.id === empId ? { ...emp, week: emp.week.map((en, i) => i === day ? { ...en, [field]: value } : en) } : emp));
    invalidate();
  }
  const dirty = useRef<string | null>(null);
  function logEdit(emp: Employee, day: number) {
    if (dirty.current !== `${emp.id}:${day}`) return;
    dirty.current = null;
    push(t.logEdit(emp.name, DAYS[loc][day]), "info");
  }

  function accept(emp: Employee, day: number, s: Entry) {
    setData((d) => d.map((x) => x.id === emp.id ? { ...x, week: x.week.map((en, i) => i === day ? s : en) } : x));
    push(t.logAccept(emp.name, DAYS[loc][day], `${s.in} - ${s.out}`), "approved");
    invalidate();
  }
  function confirmLong(emp: Employee, day: number) {
    setConfirmed((c) => ({ ...c, [`${emp.id}:${day}`]: true }));
    push(t.logConfirm(emp.name, DAYS[loc][day]), "approved");
    invalidate();
  }
  function agentFix() {
    run(() => {
      let n = 0;
      setData((d) => d.map((emp) => ({ ...emp, week: emp.week.map((en, i) => { const a = analyzeDay(en, limit); if (a.suggestion) { n++; return a.suggestion; } return en; }) })));
      push(t.logFix(suggestions), "agent");
      invalidate();
    });
  }
  function approve() {
    setApproved(true);
    push(t.logApprove(money(totals.net, loc)), "approved");
  }
  function genReceipts() { setReceipts(true); push(t.logReceipts, "agent"); }
  function reset() { setData(EMPLOYEES); setConfirmed({}); setApproved(false); setReceipts(false); setLimit(8); setSelected("marcos"); clear(); }

  const issueLabel = (i: Issue) => i === "missOut" ? t.missOut : i === "missIn" ? t.missIn : i === "invalid" ? t.invalid : i === "long" ? t.long : t.ok;
  const fmtH = (h: number) => num(Math.round(h * 100) / 100, loc, h % 1 ? 1 : 0);

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiHours} value={`${fmtH(totals.hours)} h`} sub={t.weekOf} />
        <Kpi label={t.kpiOt} value={`${fmtH(totals.ot)} h`} tone="warn" />
        <Kpi label={t.kpiAlerts} value={String(totals.alerts)} tone={totals.alerts ? "bad" : "good"} />
        <Kpi label={t.kpiNet} value={money(totals.net, loc)} tone="good" />
      </div>

      <div className="dm-agentbar">
        <div><strong>{suggestions > 0 ? `${suggestions} ${loc === "es" ? "tarjetas con sugerencia del agente" : "timecards with an agent suggestion"}` : t.nothingToFix}</strong></div>
        <button type="button" className="dm-btn dm-btn-primary" onClick={agentFix} disabled={busy || suggestions === 0}>
          {busy ? <Spinner label={t.fixing} /> : (<><Sparkles aria-hidden="true" size={16} />{t.agentFix}</>)}
        </button>
      </div>

      <div className="dm-grid-2 dm-grid-2-wide">
        <section className="dm-panel" aria-label={t.staff}>
          <h3 className="dm-panel-title">{t.staff}</h3>
          <ul className="dm-list">
            {calc.map((c) => (
              <li key={c.emp.id}>
                <button type="button" className={`dm-row-btn${selected === c.emp.id ? " is-selected" : ""}`} aria-pressed={selected === c.emp.id} onClick={() => setSelected(c.emp.id)}>
                  <span className="dm-row-main"><strong>{c.emp.name}</strong><small>{c.emp.role} · {money(c.emp.rate, loc)}/h</small></span>
                  <span className="dm-row-side">
                    <strong>{fmtH(c.total)} h</strong>
                    {c.alerts > 0 ? <Chip tone="bad"><AlertTriangle aria-hidden="true" size={12} />{c.alerts}</Chip> : <Chip tone="good">OK</Chip>}
                    {c.over48 ? <Chip tone="warn">{t.week48}</Chip> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="dm-panel" aria-label={t.timecard}>
          <h3 className="dm-panel-title">{t.timecard} · {current.emp.name}</h3>
          <div className="dm-table-wrap">
            <table className="dm-table dm-table-tight">
              <thead><tr><th>{t.week}</th><th>{t.in}</th><th>{t.out}</th><th>{t.hours}</th><th>{t.status}</th></tr></thead>
              <tbody>
                {current.days.map((d, i) => {
                  const en = current.emp.week[i];
                  const empty = !en.in && !en.out;
                  const otH = d.o50 + d.o100;
                  return (
                    <tr key={i} className={d.blocking ? "is-review" : ""}>
                      <td><strong>{DAYS[loc][i]}</strong><small>{exampleDate(-8 + i, loc)}</small></td>
                      <td><input className="dm-input dm-input-sm" type="time" aria-label={`${t.in} ${DAYS[loc][i]}`} value={en.in} onChange={(ev) => editEntry(current.emp.id, i, "in", ev.target.value)} onBlur={() => logEdit(current.emp, i)} /></td>
                      <td><input className="dm-input dm-input-sm" type="time" aria-label={`${t.out} ${DAYS[loc][i]}`} value={en.out} onChange={(ev) => editEntry(current.emp.id, i, "out", ev.target.value)} onBlur={() => logEdit(current.emp, i)} /></td>
                      <td>{d.minutes ? `${fmtH(d.minutes / 60)} h` : "—"}</td>
                      <td className="dm-chips-cell">
                        {empty ? <Chip tone="mute">{t.off}</Chip> : d.issue ? (
                          <>
                            <Chip tone={d.isConfirmed ? "good" : "bad"}>{d.isConfirmed ? t.confirmed : issueLabel(d.issue)}</Chip>
                            {d.suggestion ? <button type="button" className="dm-link-btn" onClick={() => accept(current.emp, i, d.suggestion!)}>{t.suggest(`${d.suggestion.in} - ${d.suggestion.out}`)} · {t.accept}</button> : null}
                            {d.issue === "long" && !d.isConfirmed ? <button type="button" className="dm-link-btn" onClick={() => confirmLong(current.emp, i)}>{t.confirm}</button> : null}
                          </>
                        ) : <Chip tone="good">{t.ok}</Chip>}
                        {otH > 0 && !d.issue ? <Chip tone="warn">{t.ot(fmtH(otH))}</Chip> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <label className="dm-field dm-inline">
            <span>{t.rulesBody}</span>
            <input className="dm-input dm-input-sm" type="number" min={4} max={9} value={limit} onChange={(ev) => { setLimit(Math.max(4, Math.min(9, Number(ev.target.value) || 8))); invalidate(); }} />
            <span>h</span>
          </label>
          <p className="dm-hint">{t.rulesBody2} {t.legal}</p>
        </section>
      </div>

      <section className="dm-panel" aria-label={t.payroll}>
        <h3 className="dm-panel-title"><FileText aria-hidden="true" size={18} />{t.payroll}</h3>
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead><tr><th>{t.cols.emp}</th><th>{t.cols.reg}</th><th>{t.cols.o50}</th><th>{t.cols.o100}</th><th>{t.cols.gross}</th><th>{t.cols.ded}</th><th>{t.cols.net}</th></tr></thead>
            <tbody>
              {calc.map((c) => (
                <tr key={c.emp.id} className={c.alerts ? "is-review" : ""}>
                  <td><strong>{c.emp.name}</strong>{c.alerts ? <small className="dm-bad">{c.alerts} {loc === "es" ? "alerta(s)" : "alert(s)"}</small> : null}</td>
                  <td>{fmtH(c.reg)} h</td><td>{fmtH(c.o50)} h</td><td>{fmtH(c.o100)} h</td>
                  <td>{money(c.gross, loc)}</td><td>-{money(c.ded, loc)}</td><td><strong>{money(c.net, loc)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><th>{t.total}</th><td>{fmtH(calc.reduce((s, c) => s + c.reg, 0))} h</td><td>{fmtH(calc.reduce((s, c) => s + c.o50, 0))} h</td><td>{fmtH(calc.reduce((s, c) => s + c.o100, 0))} h</td><td>{money(totals.gross, loc)}</td><td>-{money(totals.ded, loc)}</td><td><strong>{money(totals.net, loc)}</strong></td></tr></tfoot>
          </table>
        </div>
        <div className="dm-row">
          {approved ? (
            <>
              <ApprovedStamp>{t.approvedMsg}</ApprovedStamp>
              {receipts ? <ApprovedStamp>{t.receiptsDone}</ApprovedStamp> : <button type="button" className="dm-btn dm-btn-ink" onClick={genReceipts}><FileText aria-hidden="true" size={16} />{t.receipts}</button>}
            </>
          ) : (
            <>
              <button type="button" className="dm-btn dm-btn-primary" onClick={approve} disabled={totals.alerts > 0}><Check aria-hidden="true" size={16} />{t.approve}</button>
              {totals.alerts > 0 ? <span className="dm-bad" role="status">{t.blocked(totals.alerts)}</span> : null}
            </>
          )}
        </div>
      </section>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
