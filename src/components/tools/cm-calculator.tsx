import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Eraser, FileSpreadsheet } from "lucide-react";
import {
  JURISDICCIONES,
  calcularCoeficientes,
  coeficientesACsv,
  formatearCentavos,
  formatearCoeficiente,
  type FilaEntrada,
} from "../../lib/convenio-multilateral";
import { useToolTracking } from "./use-tool-tracking";

/** Valores de muestra: una distribuidora con actividad en cinco jurisdicciones. Reemplazalos con los de tu balance. */
const MUESTRA: Record<string, [string, string]> = {
  caba: ["182.400.000", "61.200.000"],
  bsas: ["96.300.000", "48.700.000"],
  cordoba: ["71.800.000", "29.500.000"],
  "santa-fe": ["54.900.000", "18.400.000"],
  mendoza: ["24.600.000", "9.800.000"],
};

function filasIniciales(muestra: boolean): FilaEntrada[] {
  return JURISDICCIONES.map((j) => ({ id: j.id, ingresos: muestra ? MUESTRA[j.id]?.[0] ?? "" : "", gastos: muestra ? MUESTRA[j.id]?.[1] ?? "" : "" }));
}

function pct(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

export default function CmCalculator({ slug }: { slug: string }) {
  const [filas, setFilas] = useState<FilaEntrada[]>(() => filasIniciales(true));
  const [ajustar, setAjustar] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const { markUsed, markExport } = useToolTracking(slug);
  const resultado = useMemo(() => calcularCoeficientes(filas), [filas]);
  const porId = useMemo(() => new Map(resultado.filas.map((f) => [f.id, f])), [resultado]);
  const erroresPorCampo = useMemo(() => new Set(resultado.errores.map((e) => `${e.id}:${e.campo}`)), [resultado]);

  function cambiar(id: string, campo: "ingresos" | "gastos", valor: string) {
    markUsed({ action: "edit" });
    setMensaje("");
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
  }

  function limpiar() {
    markUsed({ action: "clear" });
    setFilas(filasIniciales(false));
    setMensaje("Se vaciaron todas las filas.");
  }

  function cargarMuestra() {
    markUsed({ action: "sample" });
    setFilas(filasIniciales(true));
    setMensaje("Se cargaron valores de muestra. Reemplazalos con los de tu balance.");
  }

  function exportar() {
    if (resultado.estado !== "ok") return;
    const csv = coeficientesACsv(resultado, { ajustado: ajustar && !resultado.cierraEnUno });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "coeficientes-convenio-multilateral.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    markExport("csv", { rows: resultado.filas.length });
    setMensaje("Descargaste el CSV con los coeficientes.");
  }

  const mostrarAjuste = ajustar && !resultado.cierraEnUno && resultado.estado === "ok";
  const coef = (id: string, base: number) => (mostrarAjuste ? resultado.ajustados[id] : base);
  const suma = mostrarAjuste ? 10000 : resultado.sumaUnidades;
  const difMagnitud = formatearCoeficiente(Math.abs(resultado.diferenciaUnidades));
  const difTexto = resultado.diferenciaUnidades > 0 ? `faltan ${difMagnitud}` : `sobran ${difMagnitud}`;

  return (
    <div className="dm-stage tl-stage">
      <div className="dm-stage-head">
        <div className="dm-stage-title">
          <span className="dm-dot" aria-hidden="true" />
          <strong>Coeficiente unificado, régimen general (art. 2)</strong>
        </div>
        <div className="dm-row">
          <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={cargarMuestra}>Cargar valores de muestra</button>
          <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={limpiar}><Eraser aria-hidden="true" size={15} />Limpiar</button>
        </div>
      </div>
      <p className="dm-stage-note">Valores de muestra de una distribuidora con actividad en cinco jurisdicciones: reemplazalos con los de tu último balance cerrado. Importes en pesos; podés escribir 1.250.000,50 o 1250000.5.</p>
      <div className="dm-stage-body">
        <p className="tl-help" id="cm-help">Ingresos: brutos atribuibles a cada jurisdicción (art. 2, inc. b). Gastos: solo los computables según el art. 3, asignados a donde se soportan (art. 4). Dejá en blanco las jurisdicciones sin actividad.</p>

        <div className="dm-table-wrap tl-table-wrap">
          <table className="dm-table tl-table" aria-describedby="cm-help">
            <caption className="dm-sr">Ingresos y gastos computables por jurisdicción, y coeficiente resultante</caption>
            <thead>
              <tr>
                <th scope="col">Jurisdicción</th>
                <th scope="col">Ingresos brutos (ARS)</th>
                <th scope="col">Gastos computables (ARS)</th>
                <th scope="col" className="tl-num">Coeficiente</th>
              </tr>
            </thead>
            <tbody>
              {JURISDICCIONES.map((j) => {
                const fila = filas.find((f) => f.id === j.id)!;
                const calculada = porId.get(j.id);
                const errIng = erroresPorCampo.has(`${j.id}:ingresos`);
                const errGas = erroresPorCampo.has(`${j.id}:gastos`);
                return (
                  <tr key={j.id} className={calculada ? "is-active" : undefined}>
                    <th scope="row" className="tl-juris">{j.nombre}</th>
                    <td data-label="Ingresos brutos">
                      <input
                        className="dm-input tl-input"
                        inputMode="decimal"
                        autoComplete="off"
                        aria-label={`Ingresos brutos de ${j.nombre}, en pesos`}
                        aria-invalid={errIng || undefined}
                        value={fila.ingresos}
                        onChange={(e) => cambiar(j.id, "ingresos", e.target.value)}
                        placeholder="0,00"
                      />
                    </td>
                    <td data-label="Gastos computables">
                      <input
                        className="dm-input tl-input"
                        inputMode="decimal"
                        autoComplete="off"
                        aria-label={`Gastos computables de ${j.nombre}, en pesos`}
                        aria-invalid={errGas || undefined}
                        value={fila.gastos}
                        onChange={(e) => cambiar(j.id, "gastos", e.target.value)}
                        placeholder="0,00"
                      />
                    </td>
                    <td className="tl-num tl-coef" data-label="Coeficiente">
                      {calculada ? (
                        <>
                          <strong>{formatearCoeficiente(coef(j.id, calculada.unidades))}</strong>
                          <small>{pct(calculada.porcentajeIngresos)} ingresos · {pct(calculada.porcentajeGastos)} gastos</small>
                        </>
                      ) : (
                        <span className="dm-muted" aria-label="sin datos">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td data-label="Ingresos brutos">{resultado.estado === "ok" ? formatearCentavos(resultado.totalIngresosCents) : "—"}</td>
                <td data-label="Gastos computables">{resultado.estado === "ok" ? formatearCentavos(resultado.totalGastosCents) : "—"}</td>
                <td className="tl-num" data-label="Suma de coeficientes">{resultado.estado === "ok" ? <strong>{formatearCoeficiente(suma)}</strong> : "—"}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="tl-status" aria-live="polite">
          {resultado.errores.length > 0 ? (
            <ul className="dm-errlist" role="alert">
              {resultado.errores.map((e) => <li key={`${e.id}${e.campo}`} className="dm-error">{e.mensaje}</li>)}
            </ul>
          ) : null}
          {resultado.estado === "vacio" ? <p className="dm-empty">Cargá ingresos y gastos computables en al menos una jurisdicción para ver los coeficientes.</p> : null}
          {resultado.estado === "error" && resultado.errores.length === 0 ? resultado.avisos.map((a) => <p key={a} className="dm-error" role="alert">{a}</p>) : null}
          {resultado.estado === "ok" && resultado.cierraEnUno ? (
            <p className="dm-note-ok"><CheckCircle2 aria-hidden="true" size={18} />Los coeficientes suman 1,0000 (100%).</p>
          ) : null}
          {resultado.estado === "ok" && !resultado.cierraEnUno && !mostrarAjuste ? (
            <p className="tl-warn" role="status">
              <AlertTriangle aria-hidden="true" size={18} />
              <span>Por el redondeo a 4 decimales los coeficientes suman {formatearCoeficiente(resultado.sumaUnidades)}, no 1,0000: {difTexto}. Revisá cómo lo resuelve el aplicativo que uses.</span>
            </p>
          ) : null}
          {mostrarAjuste ? (
            <p className="dm-note-ok"><CheckCircle2 aria-hidden="true" size={18} />Con el ajuste, los coeficientes suman 1,0000: se {resultado.diferenciaUnidades > 0 ? "sumaron" : "restaron"} {difMagnitud} a {JURISDICCIONES.find((j) => j.id === resultado.jurisdiccionAjustada)?.nombre}.</p>
          ) : null}
          <p className="dm-sr" role="status">{mensaje}</p>
        </div>

        <div className="dm-row tl-actions">
          {resultado.estado === "ok" && !resultado.cierraEnUno ? (
            <label className="dm-check">
              <input type="checkbox" checked={ajustar} onChange={(e) => { markUsed({ action: "adjust" }); setAjustar(e.target.checked); }} />
              Sumar la diferencia a la jurisdicción de mayor coeficiente (práctica habitual, no es una regla del Convenio)
            </label>
          ) : null}
          <button type="button" className="dm-btn dm-btn-primary" onClick={exportar} disabled={resultado.estado !== "ok"}>
            <Download aria-hidden="true" size={17} />Descargar CSV
          </button>
        </div>
        <p className="dm-hint tl-hint"><FileSpreadsheet aria-hidden="true" size={14} /> El CSV usa punto y coma y coma decimal, para abrirlo directo en Excel en español.</p>
      </div>
    </div>
  );
}
