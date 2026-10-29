import { Fragment, useMemo, useRef, useState } from "react";
import { Check, Download, FileText, Sparkles, X } from "lucide-react";
import { SAMPLE_BATCH as BATCH, checkBatch, digitsOnly, formatCuit, isValidCae, toCsv, type AlertCode, type InvoiceAlert, type PurchaseInvoice } from "../../lib/demo-invoices";
import { ActionLog, Chip, DemoFrame, ErrorNote, Kpi, Spinner, money, useActionLog, useBusy, type Loc } from "./shared";

type Decision = "load" | "drop";
type Edit = Partial<Pick<PurchaseInvoice, "cuit" | "cae" | "perc" | "total">>;

const T = {
  es: {
    label: "Facturas de compra de tus clientes",
    client: "Ferretería San Martín S.A. · Responsable Inscripto",
    uploaded: (n: number) => `El cliente subió ${n} comprobantes del mes (PDF y fotos).`,
    idle: "El agente todavía no los leyó. Tocá el botón y los pasa a la planilla del estudio con los controles hechos.",
    read: "Que el agente los lea", reading: "Leyendo comprobantes…", doneRead: (n: number) => `Leyó ${n} comprobantes y los controló uno por uno.`,
    kpiRead: "Leídos", kpiReady: "Listos para cargar", kpiReview: "Para revisar", kpiLoaded: "Cargados en la planilla",
    kpiReadySub: "sin alertas", kpiReviewSub: "los mira una persona", kpiLoadedSub: "aprobados por vos",
    sheet: "Lo que leyó", cols: ["Emisor", "CUIT", "Comprobante", "Neto", "Total", "Estado"],
    states: { ready: "Lista", review: "Para revisar", forced: "Cargar igual", dropped: "Afuera", loaded: "Cargada" },
    pending: "Sin leer",
    pick: "Elegí un comprobante para ver los controles.",
    checks: "Controles", ok: "Sin alertas: se carga sola cuando aprobás.",
    fix: "Corregir la lectura", fixHelp: "Si el error es de lectura, corregilo acá y los controles se recalculan.",
    cuit: "CUIT del emisor", cae: "CAE (14 dígitos)", perc: "Percepción IIBB", total: "Total",
    keep: "Cargar igual", drop: "Dejar afuera", undo: "Volver a revisar",
    approve: (n: number) => `Aprobar y cargar ${n} a la planilla`, nothing: "No hay comprobantes listos para cargar.",
    leftOut: (n: number) => `${n} quedan afuera hasta que alguien los revise.`,
    sent: "Planilla del estudio", sentHelp: "Formato de prueba: una fila por comprobante, lista para importar al sistema de carga.",
    sentCols: ["Emisor", "CUIT", "Comprobante", "Neto", "IVA 21%", "Perc. IIBB", "Total"],
    totals: "Totales cargados", csv: "Descargar CSV", emptySheet: "Todavía no cargaste nada. Aprobá los comprobantes listos y aparecen acá.",
    blurry: "Foto borrosa: el sistema no adivina, lo manda a revisar.",
    alertChip: { "cuit-missing": "CUIT ilegible", "cuit-invalid": "CUIT inválido", "cae-invalid": "CAE inválido", duplicate: "Duplicada", iva: "IVA", perc: "Percepción", total: "Total no cierra" } as Record<AlertCode, string>,
    msg: (a: InvoiceAlert, row: PurchaseInvoice) => ({
      "cuit-missing": "No se pudo leer el CUIT (foto borrosa). Escribilo para validarlo.",
      "cuit-invalid": "El CUIT no pasa la validación del dígito verificador. Puede ser un error de lectura o del proveedor.",
      "cae-invalid": `El CAE tiene que tener 14 dígitos y acá tiene ${row.cae.replace(/\D/g, "").length}.`,
      duplicate: `Ya está cargado el mismo comprobante de este CUIT (archivo ${BATCH.find((b) => b.id === a.value)?.file ?? ""}).`,
      iva: `El IVA no es el 21% del neto: debería ser ${money(Number(a.value), "es")}.`,
      perc: `La percepción de IIBB no coincide con la alícuota del proveedor (${row.percRate}%): debería ser ${money(Number(a.value), "es")}.`,
      total: `Neto + IVA + percepciones da ${money(Number(a.value), "es")} y el comprobante dice ${money(row.total, "es")}.`,
    } as Record<AlertCode, string>)[a.code],
    logRead: (n: number, r: number) => `Leí ${n} comprobantes: ${n - r} sin alertas y ${r} para revisar.`,
    logLoad: (n: number) => `Aprobaste cargar ${n} comprobantes en la planilla del estudio (carga simulada).`,
    logKeep: (e: string) => `Marcaste "${e}" para cargar igual, con la alerta a la vista.`,
    logDrop: (e: string) => `Dejaste afuera "${e}".`,
    logFix: (e: string) => `Corregiste la lectura de "${e}" y recalculé los controles.`,
    logCsv: "Descargaste el CSV de la planilla.",
    noCsvErr: "Primero cargá al menos un comprobante.",
    note: "Los datos ya vienen leídos para que pruebes los controles. En el proyecto se leen de tus PDF y fotos reales; con una foto mala no se carga solo, se marca para revisar.",
  },
  en: {
    label: "Your clients' purchase invoices",
    client: "Ferretería San Martín S.A. · VAT registered",
    uploaded: (n: number) => `The client uploaded ${n} documents for the month (PDFs and photos).`,
    idle: "The agent hasn't read them yet. Press the button and they land in the firm's spreadsheet with every check done.",
    read: "Let the agent read them", reading: "Reading documents…", doneRead: (n: number) => `It read ${n} documents and checked each one.`,
    kpiRead: "Read", kpiReady: "Ready to load", kpiReview: "To review", kpiLoaded: "Loaded in the sheet",
    kpiReadySub: "no alerts", kpiReviewSub: "a person looks at them", kpiLoadedSub: "approved by you",
    sheet: "What it read", cols: ["Supplier", "Tax ID", "Document", "Net", "Total", "Status"],
    states: { ready: "Ready", review: "To review", forced: "Load anyway", dropped: "Left out", loaded: "Loaded" },
    pending: "Not read",
    pick: "Pick a document to see its checks.",
    checks: "Checks", ok: "No alerts: it loads on its own when you approve.",
    fix: "Fix the reading", fixHelp: "If the mistake is a reading error, fix it here and the checks are recalculated.",
    cuit: "Supplier tax ID (CUIT)", cae: "CAE (14 digits)", perc: "Provincial tax withholding", total: "Total",
    keep: "Load anyway", drop: "Leave out", undo: "Back to review",
    approve: (n: number) => `Approve and load ${n} into the sheet`, nothing: "No documents are ready to load.",
    leftOut: (n: number) => `${n} stay out until someone reviews them.`,
    sent: "The firm's spreadsheet", sentHelp: "Sample format: one row per document, ready to import into the bookkeeping system.",
    sentCols: ["Supplier", "Tax ID", "Document", "Net", "VAT 21%", "Withholding", "Total"],
    totals: "Totals loaded", csv: "Download CSV", emptySheet: "Nothing loaded yet. Approve the ready documents and they show up here.",
    blurry: "Blurry photo: the system doesn't guess, it sends it to review.",
    alertChip: { "cuit-missing": "Tax ID unreadable", "cuit-invalid": "Invalid tax ID", "cae-invalid": "Invalid CAE", duplicate: "Duplicate", iva: "VAT", perc: "Withholding", total: "Total off" } as Record<AlertCode, string>,
    msg: (a: InvoiceAlert, row: PurchaseInvoice) => ({
      "cuit-missing": "The tax ID could not be read (blurry photo). Type it in to validate it.",
      "cuit-invalid": "The tax ID fails the check-digit validation. It may be a reading error or the supplier's.",
      "cae-invalid": `A CAE must have 14 digits and this one has ${row.cae.replace(/\D/g, "").length}.`,
      duplicate: `The same document from this tax ID is already in the batch (file ${BATCH.find((b) => b.id === a.value)?.file ?? ""}).`,
      iva: `VAT is not 21% of the net amount: it should be ${money(Number(a.value), "en")}.`,
      perc: `The withholding does not match the supplier's rate (${row.percRate}%): it should be ${money(Number(a.value), "en")}.`,
      total: `Net + VAT + withholdings add up to ${money(Number(a.value), "en")} and the document says ${money(row.total, "en")}.`,
    } as Record<AlertCode, string>)[a.code],
    logRead: (n: number, r: number) => `I read ${n} documents: ${n - r} with no alerts and ${r} to review.`,
    logLoad: (n: number) => `You approved loading ${n} documents into the firm's spreadsheet (simulated load).`,
    logKeep: (e: string) => `You marked "${e}" to load anyway, with the alert visible.`,
    logDrop: (e: string) => `You left "${e}" out.`,
    logFix: (e: string) => `You fixed the reading of "${e}" and I recalculated the checks.`,
    logCsv: "You downloaded the spreadsheet CSV.",
    noCsvErr: "Load at least one document first.",
    note: "The data comes pre-read so you can try the checks. In a project it is read from your real PDFs and photos; with a bad photo it does not load on its own, it flags it for review.",
  },
};

export default function ClientInvoicesDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [phase, setPhase] = useState<"idle" | "read">("idle");
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [loaded, setLoaded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { entries, push, clear } = useActionLog("client-invoices");
  const { busy, run } = useBusy();
  const logged = useRef(new Set<string>());

  const rows = useMemo(() => BATCH.map((row) => ({ ...row, ...edits[row.id] })), [edits]);
  const alerts = useMemo(() => checkBatch(rows), [rows]);

  const statusOf = (id: string): keyof typeof t.states => {
    if (loaded.includes(id)) return "loaded";
    if (decisions[id] === "drop") return "dropped";
    if ((alerts[id] ?? []).length === 0) return "ready";
    return decisions[id] === "load" ? "forced" : "review";
  };
  const eligible = rows.filter((r) => ["ready", "forced"].includes(statusOf(r.id)));
  const toReview = rows.filter((r) => statusOf(r.id) === "review");
  const loadedRows = rows.filter((r) => loaded.includes(r.id));
  const current = rows.find((r) => r.id === selected) ?? null;

  function reset() {
    logged.current.clear(); setPhase("idle"); setEdits({}); setDecisions({}); setLoaded([]); setSelected(null); setError(""); clear();
  }
  function readAll() {
    run(() => {
      setPhase("read");
      const review = BATCH.length - Object.values(checkBatch(BATCH)).filter((a) => a.length === 0).length;
      setSelected(BATCH.find((r) => checkBatch(BATCH)[r.id].length > 0)?.id ?? BATCH[0].id);
      push(t.logRead(BATCH.length, review), "agent");
    }, 900);
  }
  function edit(id: string, patch: Edit) {
    if (!logged.current.has(id)) {
      logged.current.add(id);
      push(t.logFix(BATCH.find((b) => b.id === id)?.emisor ?? ""), "info");
    }
    setEdits((c) => ({ ...c, [id]: { ...c[id], ...patch } }));
    setError("");
  }
  function decide(row: PurchaseInvoice, decision: Decision | null) {
    setDecisions((c) => { const next = { ...c }; if (decision) next[row.id] = decision; else delete next[row.id]; return next; });
    if (decision === "load") push(t.logKeep(row.emisor), "info");
    if (decision === "drop") push(t.logDrop(row.emisor), "info");
  }
  function approve() {
    if (eligible.length === 0) { setError(t.nothing); return; }
    setError("");
    setLoaded((c) => [...c, ...eligible.map((r) => r.id)]);
    push(t.logLoad(eligible.length), "approved");
  }
  function download() {
    if (loadedRows.length === 0) { setError(t.noCsvErr); return; }
    const blob = new Blob(["\uFEFF" + toCsv(loadedRows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "planilla-del-estudio.csv"; a.click();
    URL.revokeObjectURL(url);
    push(t.logCsv, "info");
  }

  const sum = (key: "neto" | "iva" | "perc" | "total") => loadedRows.reduce((s, r) => s + r[key], 0);

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiRead} value={phase === "read" ? String(BATCH.length) : "0"} sub={t.client} />
        <Kpi label={t.kpiReady} value={phase === "read" ? String(rows.filter((r) => statusOf(r.id) === "ready").length + loadedRows.filter((r) => (alerts[r.id] ?? []).length === 0).length) : "0"} tone="good" sub={t.kpiReadySub} />
        <Kpi label={t.kpiReview} value={phase === "read" ? String(toReview.length) : "0"} tone={toReview.length ? "warn" : "ink"} sub={t.kpiReviewSub} />
        <Kpi label={t.kpiLoaded} value={String(loaded.length)} sub={t.kpiLoadedSub} />
      </div>

      <div className="dm-agentbar">
        <div><strong>{t.uploaded(BATCH.length)}</strong><br /><small>{phase === "read" ? t.doneRead(BATCH.length) : t.idle}</small></div>
        {phase === "idle" ? (
          busy ? <Spinner label={t.reading} /> : <button type="button" className="dm-btn dm-btn-primary" onClick={readAll}><Sparkles aria-hidden="true" size={16} />{t.read}</button>
        ) : null}
      </div>
      <p className="dm-hint">{t.note}</p>

      <div className="dm-grid-2 dm-grid-2-wide">
        <section className="dm-panel" aria-label={t.sheet}>
          <h3 className="dm-panel-title">{t.sheet}</h3>
          <div className="dm-table-wrap">
            <table className="dm-table dm-table-tight">
              <caption className="dm-sr">{t.sheet}</caption>
              <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
              <tbody>
                {rows.map((row) => {
                  const list = alerts[row.id] ?? [];
                  const state = statusOf(row.id);
                  const tone = state === "ready" || state === "loaded" ? "good" : state === "dropped" ? "mute" : state === "forced" ? "warn" : "bad";
                  return (
                    <tr key={row.id} className={`${phase === "read" && list.length && state === "review" ? "is-review" : ""}${selected === row.id ? " is-active" : ""}`}>
                      <td>
                        <button type="button" className="dm-link-btn" aria-pressed={selected === row.id} onClick={() => { if (phase === "read") { setSelected(row.id); setError(""); } }} disabled={phase !== "read"}>{row.emisor}</button>
                        <small><FileText aria-hidden="true" size={11} /> {row.file}</small>
                      </td>
                      <td className="dm-mono">{phase === "read" ? (row.cuit ? formatCuit(row.cuit) : "—") : "…"}</td>
                      <td className="dm-mono">{phase === "read" ? row.numero : "…"}</td>
                      <td>{phase === "read" ? money(row.neto, loc) : "…"}</td>
                      <td>{phase === "read" ? money(row.total, loc) : "…"}</td>
                      <td>
                        <div className="dm-chips">
                        {phase !== "read" ? <Chip tone="mute">{t.pending}</Chip> : (
                          <>
                            <Chip tone={tone}>{t.states[state]}</Chip>
                            {state === "review" || state === "forced" ? list.map((a) => <Fragment key={a.code}><Chip tone="bad">{t.alertChip[a.code]}</Chip></Fragment>) : null}
                          </>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dm-panel" aria-label={t.checks}>
          <h3 className="dm-panel-title">{t.checks}{current && phase === "read" ? ` · ${current.emisor}` : ""}</h3>
          {phase !== "read" || !current ? <p className="dm-empty">{t.pick}</p> : (
            <>
              {(alerts[current.id] ?? []).length === 0 ? (
                <p className="dm-note-ok"><Check aria-hidden="true" size={16} />{t.ok}</p>
              ) : (
                <ul className="dm-errlist">
                  {(alerts[current.id] ?? []).map((a) => <li key={a.code}><p className="dm-error">{t.msg(a, current)}</p></li>)}
                </ul>
              )}
              {current.id === "d8" ? <p className="dm-hint">{t.blurry}</p> : null}
              <div className="dm-draft">
                <strong>{t.fix}</strong>
                <small className="dm-hint">{t.fixHelp}</small>
                <div className="dm-form-grid">
                  <label className="dm-field"><span>{t.cuit}</span><input className="dm-input dm-mono" inputMode="numeric" value={current.cuit} maxLength={13} placeholder="30-00000000-0" onChange={(e) => edit(current.id, { cuit: e.target.value })} onBlur={() => { if (digitsOnly(current.cuit).length === 11) setEdits((c) => ({ ...c, [current.id]: { ...c[current.id], cuit: formatCuit(current.cuit) } })); }} /></label>
                  <label className="dm-field"><span>{t.cae}</span><input className="dm-input dm-mono" inputMode="numeric" value={current.cae} maxLength={16} aria-invalid={!isValidCae(current.cae)} onChange={(e) => edit(current.id, { cae: e.target.value.replace(/\D/g, "") })} /></label>
                  <label className="dm-field"><span>{t.perc}</span><input className="dm-input" type="number" inputMode="decimal" min={0} value={current.perc} onChange={(e) => edit(current.id, { perc: Math.max(0, Number(e.target.value) || 0) })} /></label>
                  <label className="dm-field"><span>{t.total}</span><input className="dm-input" type="number" inputMode="decimal" min={0} value={current.total} onChange={(e) => edit(current.id, { total: Math.max(0, Number(e.target.value) || 0) })} /></label>
                </div>
              </div>
              {!loaded.includes(current.id) ? (
                <div className="dm-row">
                  {(alerts[current.id] ?? []).length > 0 && decisions[current.id] !== "load" ? <button type="button" className="dm-btn dm-btn-ghost" onClick={() => decide(current, "load")}><Check aria-hidden="true" size={16} />{t.keep}</button> : null}
                  {decisions[current.id] !== "drop" ? <button type="button" className="dm-btn dm-btn-ghost" onClick={() => decide(current, "drop")}><X aria-hidden="true" size={16} />{t.drop}</button> : null}
                  {decisions[current.id] ? <button type="button" className="dm-link-btn" onClick={() => decide(current, null)}>{t.undo}</button> : null}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      {phase === "read" ? (
        <div className="dm-agentbar">
          <div>
            <strong>{eligible.length > 0 ? t.approve(eligible.length) : t.nothing}</strong>
            {toReview.length > 0 ? <><br /><small>{t.leftOut(toReview.length)}</small></> : null}
            {error ? <ErrorNote>{error}</ErrorNote> : null}
          </div>
          <button type="button" className="dm-btn dm-btn-primary" disabled={eligible.length === 0} onClick={approve}><Check aria-hidden="true" size={16} />{t.approve(eligible.length)}</button>
        </div>
      ) : null}

      <section className="dm-panel" aria-label={t.sent}>
        <div className="dm-row dm-row-between">
          <h3 className="dm-panel-title">{t.sent}</h3>
          <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={download}><Download aria-hidden="true" size={14} />{t.csv}</button>
        </div>
        <p className="dm-hint">{t.sentHelp}</p>
        {loadedRows.length === 0 ? <p className="dm-empty">{t.emptySheet}</p> : (
          <div className="dm-table-wrap">
            <table className="dm-table dm-table-tight">
              <caption className="dm-sr">{t.sent}</caption>
              <thead><tr>{t.sentCols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
              <tbody>
                {loadedRows.map((r) => (
                  <tr key={r.id}><td>{r.emisor}</td><td className="dm-mono">{formatCuit(r.cuit)}</td><td className="dm-mono">{r.numero}</td><td>{money(r.neto, loc)}</td><td>{money(r.iva, loc)}</td><td>{money(r.perc, loc)}</td><td>{money(r.total, loc)}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><th scope="row" colSpan={3}>{t.totals}</th><td>{money(sum("neto"), loc)}</td><td>{money(sum("iva"), loc)}</td><td>{money(sum("perc"), loc)}</td><td>{money(sum("total"), loc)}</td></tr></tfoot>
            </table>
          </div>
        )}
      </section>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
