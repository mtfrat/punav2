import { useMemo, useState } from "react";
import { Check, FileCheck2, FileX2, Minus, Send, Sparkles } from "lucide-react";
import { ActionLog, ApprovedStamp, Chip, DemoFrame, ErrorNote, Kpi, Spinner, useActionLog, useBusy, type Loc } from "./shared";

type DocId = "invoices" | "bank" | "payroll" | "f931";
type Channel = "wa" | "mail";
interface ClientRow { id: string; name: string; contact: string; channel: Channel; needs: DocId[]; received: DocId[] }

const DOC_ORDER: DocId[] = ["invoices", "bank", "payroll", "f931"];

/** Invented clients. The needs list differs per client: someone without employees is never asked for payroll novelties. */
const CLIENTS: ClientRow[] = [
  { id: "c1", name: "Almacén Ejemplo S.R.L.", contact: "Laura", channel: "mail", needs: ["invoices", "bank", "payroll", "f931"], received: ["invoices", "bank", "payroll", "f931"] },
  { id: "c2", name: "Ferretería Ejemplo S.A.", contact: "Diego", channel: "wa", needs: ["invoices", "bank", "payroll", "f931"], received: ["invoices", "bank"] },
  { id: "c3", name: "Consultorio Ejemplo", contact: "Marta", channel: "mail", needs: ["invoices", "bank"], received: [] },
  { id: "c4", name: "Taller Ejemplo S.R.L.", contact: "Sergio", channel: "wa", needs: ["invoices", "bank", "payroll", "f931"], received: ["invoices"] },
  { id: "c5", name: "Panadería Ejemplo", contact: "Julia", channel: "mail", needs: ["invoices", "bank", "payroll", "f931"], received: ["invoices", "bank", "f931"] },
  { id: "c6", name: "Constructora Ejemplo S.A.", contact: "Pablo", channel: "wa", needs: ["invoices", "bank", "payroll", "f931"], received: [] },
];

const T = {
  es: {
    label: "Documentación del mes",
    docs: { invoices: "Facturas del mes", bank: "Extracto bancario", payroll: "Novedades de personal", f931: "F.931 anterior" } as Record<DocId, string>,
    files: { invoices: "facturas-del-mes.zip", bank: "extracto-banco.pdf", payroll: "novedades-personal.xlsx", f931: "f931-mes-anterior.pdf" } as Record<DocId, string>,
    kpiClients: "Clientes", kpiComplete: "Completos", kpiMissing: "Les falta algo", kpiReminded: "Recordatorios enviados",
    kpiClientsSub: "con cierre este mes", kpiCompleteSub: "listos para liquidar", kpiMissingSub: "documentos pendientes", kpiRemindedSub: "aprobados por vos",
    checklist: "Checklist por cliente", client: "Cliente", status: "Estado",
    got: "Recibido", miss: "Falta", na: "No aplica", arrived: "Marcar como llegado",
    st: { complete: "Completo", missing: "Faltan documentos", nothing: "No subió nada", reminded: "Recordatorio enviado" },
    missingN: (n: number) => (n === 1 ? "falta 1 documento" : `faltan ${n} documentos`),
    hintCell: "Tocá un “Falta” para simular que el cliente lo subió: el agente lo clasifica y actualiza todo.",
    prepare: "Que el agente prepare los recordatorios", preparing: "Revisando qué falta…",
    agentIdle: "El agente compara lo que llegó con lo que cada cliente debe entregar y arma un pedido a medida. Nada sale sin tu OK.",
    agentDone: (n: number) => `Preparó ${n} recordatorios con lo que le falta a cada cliente.`,
    drafts: "Recordatorios para aprobar", noDrafts: "Todavía no hay recordatorios. Tocá el botón de arriba.", allSent: "No quedan recordatorios por aprobar.",
    draftOf: "Mensaje a", via: "por", wa: "WhatsApp", mail: "mail", edit: "Podés editarlo antes de aprobar", approve: "Aprobar y enviar", approveAll: (n: number) => `Aprobar los ${n}`, sentTag: "Enviado",
    emptyErr: "El mensaje no puede quedar vacío.",
    board: "Quién falta", boardCols: { nothing: "No subió nada", missing: "Faltan documentos", reminded: "Recordatorio enviado", complete: "Completos" },
    boardEmpty: "Nadie por acá", boardMissing: "Falta:", boardOk: "Todo recibido",
    msg: (name: string, missing: string[]) => `Hola ${name}, para cerrar el mes nos falta:\n${missing.map((m) => `• ${m}`).join("\n")}\n¿Nos lo podés mandar antes del día 5? Con eso liquidamos todo. ¡Gracias!`,
    logArrive: (c: string, file: string, doc: string) => `${c} subió "${file}". Lo clasifiqué como ${doc} y actualicé el checklist.`,
    logPrepared: (n: number) => `Revisé el checklist de ${CLIENTS.length} clientes y preparé ${n} recordatorios a medida.`,
    logSent: (c: string, ch: string) => `Aprobaste el recordatorio para ${c} por ${ch} (envío simulado).`,
    logDone: (c: string) => `${c} tiene toda la documentación. Ya no necesita recordatorio.`,
    note: "Cada cliente tiene su propia lista: a quien no tiene empleados no se le pide novedades de personal.",
  },
  en: {
    label: "Monthly documents",
    docs: { invoices: "Month's invoices", bank: "Bank statement", payroll: "Staff changes", f931: "Previous payroll filing" } as Record<DocId, string>,
    files: { invoices: "month-invoices.zip", bank: "bank-statement.pdf", payroll: "staff-changes.xlsx", f931: "previous-payroll-filing.pdf" } as Record<DocId, string>,
    kpiClients: "Clients", kpiComplete: "Complete", kpiMissing: "Missing something", kpiReminded: "Reminders sent",
    kpiClientsSub: "closing this month", kpiCompleteSub: "ready to process", kpiMissingSub: "documents pending", kpiRemindedSub: "approved by you",
    checklist: "Checklist per client", client: "Client", status: "Status",
    got: "Received", miss: "Missing", na: "Not required", arrived: "Mark as arrived",
    st: { complete: "Complete", missing: "Missing documents", nothing: "Nothing uploaded", reminded: "Reminder sent" },
    missingN: (n: number) => (n === 1 ? "1 document missing" : `${n} documents missing`),
    hintCell: "Press a “Missing” to simulate the client uploading it: the agent classifies it and updates everything.",
    prepare: "Let the agent prepare reminders", preparing: "Checking what is missing…",
    agentIdle: "The agent compares what arrived with what each client owes and writes a tailored request. Nothing goes out without your OK.",
    agentDone: (n: number) => `It prepared ${n} reminders with what each client is missing.`,
    drafts: "Reminders to approve", noDrafts: "No reminders yet. Press the button above.", allSent: "No reminders left to approve.",
    draftOf: "Message to", via: "via", wa: "WhatsApp", mail: "email", edit: "You can edit it before approving", approve: "Approve and send", approveAll: (n: number) => `Approve all ${n}`, sentTag: "Sent",
    emptyErr: "The message can't be empty.",
    board: "Who is missing", boardCols: { nothing: "Nothing uploaded", missing: "Missing documents", reminded: "Reminder sent", complete: "Complete" },
    boardEmpty: "Nobody here", boardMissing: "Missing:", boardOk: "Everything received",
    msg: (name: string, missing: string[]) => `Hi ${name}, to close the month we are still missing:\n${missing.map((m) => `• ${m}`).join("\n")}\nCould you send it before the 5th? That is all we need to process everything. Thanks!`,
    logArrive: (c: string, file: string, doc: string) => `${c} uploaded "${file}". I classified it as ${doc} and updated the checklist.`,
    logPrepared: (n: number) => `I checked the checklist of ${CLIENTS.length} clients and prepared ${n} tailored reminders.`,
    logSent: (c: string, ch: string) => `You approved the reminder for ${c} via ${ch} (simulated send).`,
    logDone: (c: string) => `${c} has all the documents. No reminder needed.`,
    note: "Each client has their own list: someone with no employees is never asked for staff changes.",
  },
};

export default function MonthlyDocsDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [received, setReceived] = useState<Record<string, DocId[]>>(() => Object.fromEntries(CLIENTS.map((c) => [c.id, c.received])));
  const [prepared, setPrepared] = useState(false);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { entries, push, clear } = useActionLog("monthly-docs");
  const { busy, run } = useBusy();

  const missingOf = (c: ClientRow) => c.needs.filter((d) => !received[c.id]?.includes(d));
  const statusOf = (c: ClientRow): "complete" | "missing" | "nothing" | "reminded" => {
    const miss = missingOf(c);
    if (miss.length === 0) return "complete";
    if (sent.includes(c.id)) return "reminded";
    if (miss.length === c.needs.length) return "nothing";
    return "missing";
  };
  const textOf = (c: ClientRow) => edited[c.id] ?? t.msg(c.contact, missingOf(c).map((d) => t.docs[d]));
  const pendingDrafts = useMemo(
    () => (prepared ? CLIENTS.filter((c) => missingOf(c).length > 0 && !sent.includes(c.id)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prepared, received, sent],
  );
  const counts = { complete: 0, missing: 0, nothing: 0, reminded: 0 };
  for (const c of CLIENTS) counts[statusOf(c)] += 1;
  const missingDocs = CLIENTS.reduce((n, c) => n + missingOf(c).length, 0);
  const channelName = (c: ClientRow) => (c.channel === "wa" ? t.wa : t.mail);

  function reset() {
    setReceived(Object.fromEntries(CLIENTS.map((c) => [c.id, c.received])));
    setPrepared(false); setEdited({}); setSent([]); setError(""); clear();
  }
  function arrive(c: ClientRow, doc: DocId) {
    setReceived((cur) => ({ ...cur, [c.id]: [...(cur[c.id] ?? []), doc] }));
    if (!sent.includes(c.id)) setEdited((cur) => { const next = { ...cur }; delete next[c.id]; return next; });
    push(t.logArrive(c.name, t.files[doc], t.docs[doc]), "agent");
    if (missingOf(c).length === 1) push(t.logDone(c.name), "info");
  }
  function prepare() {
    run(() => {
      setPrepared(true);
      push(t.logPrepared(CLIENTS.filter((c) => missingOf(c).length > 0 && !sent.includes(c.id)).length), "agent");
    }, 800);
  }
  function approve(c: ClientRow) {
    if (!textOf(c).trim()) { setError(t.emptyErr); return false; }
    setError("");
    setEdited((cur) => ({ ...cur, [c.id]: textOf(c) }));
    setSent((cur) => (cur.includes(c.id) ? cur : [...cur, c.id]));
    push(t.logSent(c.name, channelName(c)), "approved");
    return true;
  }
  function approveAll() {
    for (const c of pendingDrafts) { if (!approve(c)) break; }
  }

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiClients} value={String(CLIENTS.length)} sub={t.kpiClientsSub} />
        <Kpi label={t.kpiComplete} value={String(counts.complete)} tone="good" sub={t.kpiCompleteSub} />
        <Kpi label={t.kpiMissing} value={String(counts.missing + counts.nothing + counts.reminded)} tone="warn" sub={`${missingDocs} · ${t.kpiMissingSub}`} />
        <Kpi label={t.kpiReminded} value={String(sent.length)} sub={t.kpiRemindedSub} />
      </div>

      <section className="dm-panel" aria-label={t.checklist}>
        <h3 className="dm-panel-title">{t.checklist}</h3>
        <p className="dm-hint">{t.note} {t.hintCell}</p>
        <div className="dm-table-wrap">
          <table className="dm-table dm-table-tight">
            <caption className="dm-sr">{t.checklist}</caption>
            <thead>
              <tr><th scope="col">{t.client}</th>{DOC_ORDER.map((d) => <th key={d} scope="col">{t.docs[d]}</th>)}<th scope="col">{t.status}</th></tr>
            </thead>
            <tbody>
              {CLIENTS.map((c) => {
                const st = statusOf(c);
                return (
                  <tr key={c.id}>
                    <th scope="row" className="dm-rowhead">{c.name}</th>
                    {DOC_ORDER.map((d) => {
                      if (!c.needs.includes(d)) return <td key={d}><span className="dm-na"><Minus aria-hidden="true" size={14} /><span className="dm-sr">{t.na}</span></span></td>;
                      if (received[c.id]?.includes(d)) return <td key={d}><span className="dm-got"><FileCheck2 aria-hidden="true" size={15} />{t.got}</span></td>;
                      return (
                        <td key={d}>
                          <button type="button" className="dm-miss-btn" onClick={() => arrive(c, d)} aria-label={`${t.arrived}: ${c.name}, ${t.docs[d]}`}>
                            <FileX2 aria-hidden="true" size={15} />{t.miss}
                          </button>
                        </td>
                      );
                    })}
                    <td><Chip tone={st === "complete" ? "good" : st === "nothing" ? "bad" : st === "reminded" ? "orange" : "warn"}>{t.st[st]}</Chip></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="dm-agentbar">
        <div><strong>{prepared ? t.agentDone(CLIENTS.filter((c) => missingOf(c).length > 0 || sent.includes(c.id)).length) : t.prepare}</strong><br /><small>{t.agentIdle}</small></div>
        {busy ? <Spinner label={t.preparing} /> : !prepared ? (
          <button type="button" className="dm-btn dm-btn-primary" onClick={prepare}><Sparkles aria-hidden="true" size={16} />{t.prepare}</button>
        ) : null}
      </div>

      <section className="dm-panel" aria-label={t.drafts}>
        <div className="dm-row dm-row-between">
          <h3 className="dm-panel-title">{t.drafts}</h3>
          {pendingDrafts.length > 1 ? <button type="button" className="dm-btn dm-btn-primary dm-btn-sm" onClick={approveAll}><Check aria-hidden="true" size={14} />{t.approveAll(pendingDrafts.length)}</button> : null}
        </div>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        {!prepared ? <p className="dm-empty">{t.noDrafts}</p> : null}
        {prepared && pendingDrafts.length === 0 && sent.length === 0 ? <p className="dm-empty">{t.allSent}</p> : null}
        <div className="dm-drafts">
          {CLIENTS.filter((c) => prepared && (pendingDrafts.includes(c) || sent.includes(c.id))).map((c) => {
            const isSent = sent.includes(c.id);
            return (
              <article key={c.id} className={`dm-draft-card${isSent ? " is-sent" : ""}`}>
                <div className="dm-row dm-row-between">
                  <strong>{t.draftOf} {c.name}</strong>
                  <span className="dm-muted">{t.via} {channelName(c)}</span>
                </div>
                <label className="dm-field">
                  <span className="dm-sr">{t.edit}</span>
                  <textarea className="dm-textarea" rows={5} value={textOf(c)} disabled={isSent} onChange={(e) => { setEdited((cur) => ({ ...cur, [c.id]: e.target.value })); setError(""); }} />
                </label>
                {isSent ? <ApprovedStamp>{t.sentTag}</ApprovedStamp> : (
                  <div className="dm-row">
                    <button type="button" className="dm-btn dm-btn-primary dm-btn-sm" onClick={() => approve(c)}><Send aria-hidden="true" size={14} />{t.approve}</button>
                    <small className="dm-hint">{t.edit}</small>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="dm-panel" aria-label={t.board}>
        <h3 className="dm-panel-title">{t.board}</h3>
        <div className="dm-board">
          {(["nothing", "missing", "reminded", "complete"] as const).map((col) => {
            const items = CLIENTS.filter((c) => statusOf(c) === col);
            return (
              <div key={col} className={`dm-board-col is-${col}`}>
                <h4>{t.boardCols[col]} <span>{items.length}</span></h4>
                {items.length === 0 ? <p className="dm-empty">{t.boardEmpty}</p> : items.map((c) => (
                  <div key={c.id} className="dm-board-card">
                    <strong>{c.name}</strong>
                    <small>{col === "complete" ? t.boardOk : `${t.boardMissing} ${missingOf(c).map((d) => t.docs[d]).join(", ")}`}</small>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
