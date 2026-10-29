import { useMemo, useState } from "react";
import { Clock, Eraser, PiggyBank, Wallet } from "lucide-react";
import { calcularAhorro, parseNumero, VECES_POR_MES, type Frecuencia } from "../../lib/horas-ahorradas";
import { useToolTracking } from "./use-tool-tracking";

function pesos(value: number) {
  const rounded = Math.round(Math.abs(value));
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${value < 0 && rounded > 0 ? "−" : ""}$ ${grouped}`;
}

function horas(value: number) {
  const fixed = (Math.round(value * 100) / 100).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  const [int, dec] = fixed.split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${dec ? `,${dec}` : ""}`;
}

function mesesTexto(value: number) {
  if (value < 1) return "menos de 1 mes";
  const text = (Math.round(value * 10) / 10).toFixed(1).replace(".", ",").replace(/,0$/, "");
  return `${text} ${text === "1" ? "mes" : "meses"}`;
}

interface Campos {
  minutos: string;
  veces: string;
  frecuencia: Frecuencia;
  personas: string;
  costoHora: string;
  porcentaje: string;
  implementacion: string;
  mantenimiento: string;
}

const MUESTRA: Campos = { minutos: "15", veces: "5", frecuencia: "dia", personas: "3", costoHora: "8000", porcentaje: "60", implementacion: "2400000", mantenimiento: "" };
const VACIO: Campos = { minutos: "", veces: "", frecuencia: "dia", personas: "", costoHora: "", porcentaje: "", implementacion: "", mantenimiento: "" };

export default function HorasCalculator({ slug }: { slug: string }) {
  const [c, setC] = useState<Campos>(MUESTRA);
  const [tocado, setTocado] = useState(false);
  const { markUsed } = useToolTracking(slug);
  const set = <K extends keyof Campos>(key: K, value: Campos[K]) => {
    markUsed({ action: String(key) });
    setTocado(true);
    setC((prev) => ({ ...prev, [key]: value }));
  };

  const resultado = useMemo(() => {
    const opcional = (raw: string) => (raw.trim() === "" ? undefined : parseNumero(raw));
    return calcularAhorro({
      minutosPorTarea: parseNumero(c.minutos),
      veces: parseNumero(c.veces),
      frecuencia: c.frecuencia,
      personas: parseNumero(c.personas),
      costoHora: parseNumero(c.costoHora),
      porcentajeAutomatizable: parseNumero(c.porcentaje),
      implementacion: opcional(c.implementacion),
      mantenimientoMensual: opcional(c.mantenimiento),
    });
  }, [c]);

  const todoVacio = Object.entries(c).every(([k, v]) => k === "frecuencia" || String(v).trim() === "");
  const frecuenciaTexto = c.frecuencia === "dia" ? "por día (21 días hábiles al mes)" : c.frecuencia === "semana" ? "por semana (52/12 semanas al mes)" : "por mes";

  return (
    <div className="dm-stage tl-stage">
      <div className="dm-stage-head">
        <div className="dm-stage-title"><span className="dm-dot" aria-hidden="true" /><strong>Horas y dinero que te devuelve automatizar</strong></div>
        <div className="dm-row">
          <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={() => { markUsed({ action: "sample" }); setC(MUESTRA); setTocado(false); }}>Cargar valores de muestra</button>
          <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={() => { markUsed({ action: "clear" }); setC(VACIO); setTocado(true); }}><Eraser aria-hidden="true" size={15} />Limpiar</button>
        </div>
      </div>
      <p className="dm-stage-note">{tocado ? "Cambiá los números hasta que reflejen tu operación." : "Valores de muestra: una tarea administrativa de 15 minutos que 3 personas hacen 5 veces al día. Reemplazalos con los de tu equipo."}</p>
      <div className="dm-stage-body tl-horas">
        <form className="tl-form" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="tl-form-grid tl-form-grid-3">
            <label className="dm-field">Minutos por tarea<input className="dm-input" inputMode="decimal" autoComplete="off" value={c.minutos} onChange={(e) => set("minutos", e.target.value)} /></label>
            <label className="dm-field">Veces que se hace<input className="dm-input" inputMode="decimal" autoComplete="off" value={c.veces} onChange={(e) => set("veces", e.target.value)} /></label>
            <label className="dm-field">Frecuencia
              <select className="dm-input" value={c.frecuencia} onChange={(e) => set("frecuencia", e.target.value as Frecuencia)}>
                <option value="dia">Por día</option>
                <option value="semana">Por semana</option>
                <option value="mes">Por mes</option>
              </select>
            </label>
            <label className="dm-field">Personas que la hacen<input className="dm-input" inputMode="numeric" autoComplete="off" value={c.personas} onChange={(e) => set("personas", e.target.value)} /></label>
            <label className="dm-field">Costo por hora (ARS)<input className="dm-input" inputMode="decimal" autoComplete="off" value={c.costoHora} onChange={(e) => set("costoHora", e.target.value)} aria-describedby="horas-costo" /><span id="horas-costo" className="dm-hint">Sueldo más cargas, dividido por horas trabajadas.</span></label>
            <label className="dm-field">% automatizable<input className="dm-input" inputMode="decimal" autoComplete="off" value={c.porcentaje} onChange={(e) => set("porcentaje", e.target.value)} aria-describedby="horas-pct" /><span id="horas-pct" className="dm-hint">De 1 a 100. Sé conservador.</span></label>
            <label className="dm-field">Costo de implementación (ARS, opcional)<input className="dm-input" inputMode="decimal" autoComplete="off" value={c.implementacion} onChange={(e) => set("implementacion", e.target.value)} placeholder="Para calcular el recupero" /></label>
            <label className="dm-field">Mantenimiento mensual (ARS, opcional)<input className="dm-input" inputMode="decimal" autoComplete="off" value={c.mantenimiento} onChange={(e) => set("mantenimiento", e.target.value)} placeholder="Licencias, soporte" /></label>
          </div>
        </form>

        <div className="tl-result" aria-live="polite">
          {todoVacio ? <p className="dm-empty">Completá los datos de la tarea para ver cuánto tiempo y dinero se puede recuperar.</p> : null}
          {!todoVacio && !resultado.ok ? (
            <ul className="dm-errlist" role="alert">{resultado.errores.map((e) => <li key={e} className="dm-error">{e}</li>)}</ul>
          ) : null}
          {resultado.ok ? (
            <>
              <div className="dm-kpis tl-kpis">
                <div className="dm-kpi is-good"><span className="dm-kpi-label"><Clock aria-hidden="true" size={15} /> Horas liberadas por mes</span><strong className="dm-kpi-value">{horas(resultado.horasAhorradasMes)} h</strong><small>{horas(resultado.horasAhorradasAnio)} h por año · {horas(resultado.diasLiberadosMes)} jornadas de 8 h al mes</small></div>
                <div className="dm-kpi is-good"><span className="dm-kpi-label"><Wallet aria-hidden="true" size={15} /> Ahorro por mes</span><strong className="dm-kpi-value">{pesos(resultado.ahorroNetoMes)}</strong><small>{pesos(resultado.ahorroNetoAnio)} por año{c.mantenimiento.trim() ? " (ya descontado el mantenimiento)" : ""}</small></div>
                <div className={`dm-kpi ${resultado.paybackMeses === null ? "" : Number.isFinite(resultado.paybackMeses) ? "is-warn" : "is-bad"}`}>
                  <span className="dm-kpi-label"><PiggyBank aria-hidden="true" size={15} /> Recupero de la inversión</span>
                  <strong>{resultado.paybackMeses === null ? "—" : Number.isFinite(resultado.paybackMeses) ? mesesTexto(resultado.paybackMeses) : "No se recupera"}</strong>
                  <small>{resultado.paybackMeses === null ? "Cargá un costo de implementación para calcularlo." : Number.isFinite(resultado.paybackMeses) ? `${pesos(Number(parseNumero(c.implementacion)))} ÷ ${pesos(resultado.ahorroNetoMes)} por mes` : "El mantenimiento mensual iguala o supera el ahorro."}</small>
                </div>
              </div>
              <p className="dm-hint">Hoy la tarea consume {horas(resultado.horasActualesMes)} h por mes ({c.veces} {frecuenciaTexto}, {c.personas} {c.personas === "1" ? "persona" : "personas"}, {VECES_POR_MES[c.frecuencia] === 1 ? "sin multiplicador" : `×${horas(VECES_POR_MES[c.frecuencia])} al mes`}). Se automatiza el {c.porcentaje}%.</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
