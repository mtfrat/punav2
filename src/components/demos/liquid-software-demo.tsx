import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Loader2, MessageSquare, RotateCcw, Send, Undo2 } from "lucide-react";
import { Chip, ErrorNote, Kpi, Spinner, useBusy } from "./shared";

type ChangeId = "atrasados" | "telefono" | "zona";
type Phase = "pedido" | "propuesta" | "aprobacion" | "deploy";
type Estado = "En preparación" | "En reparto" | "Entregado";
type Zona = "Norte" | "Centro" | "Sur";

interface Pedido { id: number; cliente: string; detalle: string; zona: Zona; estado: Estado; atraso: number; telefono: string }

/** Fictional distributor and orders. "atraso" = days past the promised date. */
const PEDIDOS: Pedido[] = [
  { id: 1042, cliente: "Panadería La Espiga", detalle: "12 bolsas de harina 000", zona: "Norte", estado: "En reparto", atraso: 0, telefono: "11 5550-0142" },
  { id: 1043, cliente: "Kiosco Belgrano 24", detalle: "8 cajas de alfajores", zona: "Centro", estado: "En preparación", atraso: 3, telefono: "11 5550-0187" },
  { id: 1044, cliente: "Ferretería Del Plata", detalle: "30 kg de clavos surtidos", zona: "Sur", estado: "En preparación", atraso: 1, telefono: "11 5550-0233" },
  { id: 1045, cliente: "Almacén Los Tilos", detalle: "5 cajones de aceite 900 ml", zona: "Norte", estado: "Entregado", atraso: 0, telefono: "11 5550-0311" },
  { id: 1046, cliente: "Despensa Santa Rita", detalle: "20 packs de gaseosa", zona: "Sur", estado: "En reparto", atraso: 4, telefono: "11 5550-0356" },
  { id: 1047, cliente: "Autoservicio Rivera", detalle: "15 cajas de yerba 1 kg", zona: "Centro", estado: "En preparación", atraso: 0, telefono: "11 5550-0402" },
  { id: 1048, cliente: "Vinoteca Ladera", detalle: "6 cajas de vino malbec", zona: "Norte", estado: "En preparación", atraso: 2, telefono: "11 5550-0478" },
  { id: 1049, cliente: "Mini Mercado Pehuén", detalle: "10 bolsas de arroz 1 kg", zona: "Sur", estado: "Entregado", atraso: 0, telefono: "11 5550-0519" },
];

interface ChangeDef {
  id: ChangeId;
  label: string;
  example: string;
  summary: string;
  files: string[];
  scope: string;
  risk: string;
  tests: string[];
  keywords: RegExp;
}

const CHANGES: ChangeDef[] = [
  {
    id: "atrasados",
    label: "Resaltar atrasados",
    example: "Quiero ver en rojo los pedidos atrasados y un contador arriba",
    summary: "Los pedidos con más de 2 días de atraso se marcan en rojo con la etiqueta «Atrasado» y arriba aparece un contador nuevo.",
    files: ["TablaPedidos.tsx", "Indicadores.tsx"],
    scope: "Solo cambia cómo se ven los pedidos. No toca los datos ni los estados.",
    risk: "Bajo",
    tests: ["Un pedido con 3 días de atraso se marca", "Uno con 2 días no se marca", "El contador coincide con la tabla"],
    keywords: /atras|demor|tard|rojo|urgent/i,
  },
  {
    id: "telefono",
    label: "Teléfono con WhatsApp",
    example: "Agregá el teléfono del cliente en la tabla para escribirle rápido por WhatsApp",
    summary: "Se suma una columna «Contacto» con el teléfono de cada cliente y una etiqueta de WhatsApp para llamarlo sin salir del panel.",
    files: ["TablaPedidos.tsx", "ClienteContacto.tsx"],
    scope: "Agrega una columna. Los teléfonos ya estaban cargados; no se pide ningún dato nuevo.",
    risk: "Bajo",
    tests: ["La columna aparece en pantallas anchas", "En el celular se apila debajo del cliente", "Los teléfonos vacíos no rompen la fila"],
    keywords: /tel|whats|contact|llamar|celu|wsp/i,
  },
  {
    id: "zona",
    label: "Filtro por zona",
    example: "Necesito filtrar los pedidos por zona de reparto",
    summary: "Se agrega un selector «Zona» arriba de la tabla (Todas, Norte, Centro, Sur) para ver solo los pedidos de un reparto.",
    files: ["TablaPedidos.tsx", "FiltroZona.tsx"],
    scope: "Agrega un filtro de pantalla. No cambia ningún pedido.",
    risk: "Bajo",
    tests: ["«Todas» muestra los 8 pedidos", "Cada zona muestra solo los suyos", "El filtro se mantiene al cambiar de estado"],
    keywords: /zona|reparto|filtr|barrio|ruta/i,
  },
];

const DEPLOY_STEPS = ["Armando la versión", "Corriendo las pruebas", "Publicando en el panel", "Verificando que todo siga andando"];
const PHASES: { id: Phase; label: string }[] = [
  { id: "pedido", label: "Pedido" },
  { id: "propuesta", label: "Propuesta" },
  { id: "aprobacion", label: "Aprobación" },
  { id: "deploy", label: "Deploy" },
];

interface HistoryEntry { id: ChangeId; label: string; time: string }

function clock() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function LiquidSoftwareDemo() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("pedido");
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState<ChangeDef | null>(null);
  const [adjust, setAdjust] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [applied, setApplied] = useState<ChangeId[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [deployStep, setDeployStep] = useState(0);
  const [zona, setZona] = useState<"Todas" | Zona>("Todas");
  const { busy, run } = useBusy();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const has = (id: ChangeId) => applied.includes(id);
  const rows = PEDIDOS.filter((p) => !has("zona") || zona === "Todas" || p.zona === zona);
  const atrasados = PEDIDOS.filter((p) => p.atraso > 2 && p.estado !== "Entregado").length;
  const pendientes = PEDIDOS.filter((p) => p.estado !== "Entregado").length;
  const phaseIndex = PHASES.findIndex((p) => p.id === phase);

  const stats = { total: PEDIDOS.length, enReparto: PEDIDOS.filter((p) => p.estado === "En reparto").length };

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  function reset() {
    clearTimers();
    setText(""); setPhase("pedido"); setError(""); setProposal(null); setAdjust(""); setAdjustNote("");
    setApplied([]); setHistory([]); setDeployStep(0); setZona("Todas");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (value.length < 8) { setError("Contale al agente qué querés cambiar, con unas pocas palabras."); return; }
    const match = CHANGES.find((c) => c.keywords.test(value));
    if (!match) { setError("En esta demo el agente sabe resolver tres pedidos. Probá con uno de los ejemplos de arriba."); return; }
    if (has(match.id)) { setError("Esa mejora ya está publicada en el panel. Podés deshacerla desde el historial y volver a pedirla."); return; }
    setError("");
    run(() => { setProposal(match); setAdjustNote(""); setPhase("propuesta"); }, 1100);
  }

  function approve() {
    if (!proposal) return;
    setPhase("deploy");
    setDeployStep(0);
    clearTimers();
    DEPLOY_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setDeployStep(i + 1), 650 * (i + 1)));
    });
    timers.current.push(setTimeout(() => {
      setApplied((cur) => [...cur, proposal.id]);
      setHistory((cur) => [{ id: proposal.id, label: proposal.label, time: clock() }, ...cur]);
    }, 650 * DEPLOY_STEPS.length));
  }

  function discard() { clearTimers(); setProposal(null); setPhase("pedido"); setText(""); setAdjust(""); setAdjustNote(""); }

  function askAdjust(event: FormEvent) {
    event.preventDefault();
    if (adjust.trim().length < 4) { setError("Escribí qué ajuste querés, aunque sea corto."); return; }
    setError("");
    const note = adjust.trim();
    setAdjust("");
    run(() => setAdjustNote(`Ajuste registrado: «${note}». El agente actualizó la propuesta y la volvió a probar. Sigue esperando tu aprobación.`), 800);
  }

  function undo(id: ChangeId) {
    setApplied((cur) => cur.filter((c) => c !== id));
    setHistory((cur) => cur.filter((h) => h.id !== id));
    if (id === "zona") setZona("Todas");
  }

  const deployDone = phase === "deploy" && deployStep >= DEPLOY_STEPS.length;
  const showPhone = has("telefono");
  const showLate = has("atrasados");

  return (
    <section className="dm-stage lq-stage" aria-label="Panel de operación con pedido de mejoras">
      <div className="dm-stage-head">
        <div className="dm-stage-title">
          <span className="dm-dot" aria-hidden="true" />
          <strong>Panel de Distribuidora Alto Valle</strong>
        </div>
        <ol className="dm-pattern" aria-label="Cómo funciona">
          <li><span>1</span>Pedís</li>
          <li><span>2</span>Revisás</li>
          <li><span>3</span>Aprobás</li>
        </ol>
        <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={reset}><RotateCcw aria-hidden="true" size={14} />Reiniciar demo</button>
      </div>
      <p className="dm-stage-note">Datos ficticios con fines de demostración. El agente es una simulación en tu navegador: no hay IA real ni se publica nada. En un proyecto, cada cambio se prepara sobre tu código y nunca sale sin tu aprobación.</p>

      <div className="dm-stage-body">
        <div className="lq-grid">
          {/* ---------- the operations panel ---------- */}
          <div className="dm-panel lq-board">
            <h3 className="dm-panel-title">Pedidos de hoy</h3>
            <div className="dm-kpis dm-kpis-3">
              <Kpi label="Pedidos" value={String(stats.total)} sub={`${pendientes} sin entregar`} />
              <Kpi label="En reparto" value={String(stats.enReparto)} sub="en camino" />
              {showLate ? <Kpi label="Atrasados" value={String(atrasados)} sub="más de 2 días" tone={atrasados ? "bad" : "good"} /> : <Kpi label="Entregados" value={String(PEDIDOS.length - pendientes)} sub="hoy" tone="good" />}
            </div>
            {has("zona") ? (
              <label className="lq-filter">
                <span>Zona</span>
                <select value={zona} onChange={(e) => setZona(e.target.value as "Todas" | Zona)}>
                  {["Todas", "Norte", "Centro", "Sur"].map((z) => <option key={z}>{z}</option>)}
                </select>
              </label>
            ) : null}
            <div className="lq-table-wrap">
              <table className="lq-table">
                <caption className="dm-sr">Pedidos de la distribuidora</caption>
                <thead>
                  <tr>
                    <th scope="col">N°</th><th scope="col">Cliente</th><th scope="col">Zona</th><th scope="col">Estado</th>
                    {showPhone ? <th scope="col">Contacto</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const late = showLate && p.atraso > 2 && p.estado !== "Entregado";
                    return (
                      <tr key={p.id} className={late ? "is-late" : ""}>
                        <td>#{p.id}</td>
                        <td><strong>{p.cliente}</strong><small>{p.detalle}</small></td>
                        <td>{p.zona}</td>
                        <td>
                          <Chip tone={p.estado === "Entregado" ? "good" : p.estado === "En reparto" ? "orange" : "ink"}>{p.estado}</Chip>
                          {late ? <Chip tone="bad">Atrasado {p.atraso} días</Chip> : null}
                        </td>
                        {showPhone ? <td className="lq-phone">{p.telefono} <Chip tone="good"><MessageSquare aria-hidden="true" size={11} />WhatsApp</Chip></td> : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {history.length ? (
              <div className="lq-history">
                <h4 className="dm-sub">Historial de cambios</h4>
                <ul>
                  {history.map((h) => (
                    <li key={h.id}>
                      <span><Check aria-hidden="true" size={14} /> {h.label} <small>publicado {h.time}, aprobado por vos</small></span>
                      <button type="button" className="dm-link-btn" onClick={() => undo(h.id)}><Undo2 aria-hidden="true" size={12} /> Deshacer</button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* ---------- the "pedí una mejora" box ---------- */}
          <div className="dm-panel lq-ask">
            <h3 className="dm-panel-title">Pedí una mejora</h3>
            <ol className="lq-phases" aria-label="Etapas del cambio">
              {PHASES.map((p, i) => (
                <li key={p.id} className={i < phaseIndex || deployDone ? "is-done" : i === phaseIndex ? "is-current" : ""} aria-current={i === phaseIndex && !deployDone ? "step" : undefined}>
                  <span>{i < phaseIndex || deployDone ? <Check aria-hidden="true" size={12} /> : i + 1}</span>{p.label}
                </li>
              ))}
            </ol>

            {phase === "pedido" ? (
              <form onSubmit={submit} className="lq-form" noValidate>
                <label htmlFor="lq-request" className="dm-hint">Escribilo como se lo dirías a una persona del equipo.</label>
                <textarea id="lq-request" rows={3} value={text} maxLength={200} placeholder="Ej.: quiero ver en rojo los pedidos atrasados" onChange={(e) => { setText(e.target.value); setError(""); }} aria-describedby={error ? "lq-error" : undefined} />
                <div className="lq-chips" role="group" aria-label="Pedidos de ejemplo">
                  {CHANGES.map((c) => (
                    <button key={c.id} type="button" className="dm-chip is-mute lq-chip" onClick={() => { setText(c.example); setError(""); }}>{c.label}</button>
                  ))}
                </div>
                {error ? <div id="lq-error"><ErrorNote>{error}</ErrorNote></div> : null}
                <button type="submit" className="dm-btn dm-btn-primary" disabled={busy}>
                  {busy ? <Loader2 className="lq-spin" aria-hidden="true" size={16} /> : <Send aria-hidden="true" size={16} />}Pedir la mejora
                </button>
                {busy ? <Spinner label="El agente está leyendo tu pedido y armando la propuesta…" /> : null}
              </form>
            ) : null}

            {phase === "propuesta" && proposal ? (
              <div className="lq-proposal">
                <Chip tone="orange">Propuesta del agente</Chip>
                <p className="lq-summary">{proposal.summary}</p>
                <dl className="lq-meta">
                  <div><dt>Archivos que toca</dt><dd>{proposal.files.join(", ")}</dd></div>
                  <div><dt>Alcance</dt><dd>{proposal.scope}</dd></div>
                  <div><dt>Riesgo</dt><dd>{proposal.risk}, con vuelta atrás en un clic</dd></div>
                </dl>
                <ul className="lq-tests" aria-label="Pruebas">
                  {proposal.tests.map((t) => <li key={t}><Check aria-hidden="true" size={14} />{t}</li>)}
                </ul>
                <p className="lq-gate">El agente no publica nada hasta que lo apruebes.</p>
                {adjustNote ? <p className="dm-note-ok" role="status">{adjustNote}</p> : null}
                <div className="dm-row">
                  <button type="button" className="dm-btn dm-btn-primary" onClick={() => setPhase("aprobacion")}>Seguir a la aprobación</button>
                  <button type="button" className="dm-btn dm-btn-ghost" onClick={discard}>Descartar</button>
                </div>
                <form onSubmit={askAdjust} className="lq-adjust" noValidate>
                  <label htmlFor="lq-adjust" className="dm-hint">¿Querés un ajuste antes de decidir?</label>
                  <div className="dm-row">
                    <input id="lq-adjust" type="text" value={adjust} maxLength={120} placeholder="Ej.: que el contador también cuente los de hoy" onChange={(e) => { setAdjust(e.target.value); setError(""); }} />
                    <button type="submit" className="dm-btn dm-btn-sm" disabled={busy}>Pedir ajuste</button>
                  </div>
                  {busy ? <Spinner label="Actualizando la propuesta…" /> : null}
                  {error ? <ErrorNote>{error}</ErrorNote> : null}
                </form>
              </div>
            ) : null}

            {phase === "aprobacion" && proposal ? (
              <div className="lq-proposal">
                <Chip tone="warn">Esperando tu decisión</Chip>
                <p className="lq-summary">Vas a publicar: <strong>{proposal.label}</strong>. {proposal.summary}</p>
                <p className="lq-gate">Podés deshacerlo después desde el historial. Si no estás seguro, volvé a la propuesta o descartala.</p>
                <div className="dm-row">
                  <button type="button" className="dm-btn dm-btn-primary" onClick={approve}><Check aria-hidden="true" size={16} />Aprobar y publicar</button>
                  <button type="button" className="dm-btn dm-btn-ghost" onClick={() => setPhase("propuesta")}>Volver a la propuesta</button>
                  <button type="button" className="dm-btn dm-btn-ghost" onClick={discard}>Descartar</button>
                </div>
              </div>
            ) : null}

            {phase === "deploy" && proposal ? (
              <div className="lq-proposal">
                <Chip tone={deployDone ? "good" : "orange"}>{deployDone ? "Publicado" : "Publicando"}</Chip>
                <ol className="lq-deploy" aria-live="polite">
                  {DEPLOY_STEPS.map((s, i) => (
                    <li key={s} className={i < deployStep ? "is-done" : i === deployStep ? "is-current" : ""}>
                      {i < deployStep ? <Check aria-hidden="true" size={14} /> : i === deployStep ? <Loader2 className="lq-spin" aria-hidden="true" size={14} /> : <span className="lq-dot" aria-hidden="true" />}{s}
                    </li>
                  ))}
                </ol>
                {deployDone ? (
                  <>
                    <p className="dm-note-ok" role="status"><Check aria-hidden="true" size={18} />Listo: «{proposal.label}» ya está en el panel de la izquierda.</p>
                    <button type="button" className="dm-btn dm-btn-primary" onClick={() => { setProposal(null); setText(""); setPhase("pedido"); }}>Pedir otra mejora</button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
