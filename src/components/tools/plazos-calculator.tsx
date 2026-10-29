import { useMemo, useState, type FormEvent } from "react";
import { CalendarCheck, CalendarPlus, Info, RotateCcw, Trash2 } from "lucide-react";
import {
  CALENDARIO_DESDE,
  CALENDARIO_HASTA,
  DIAS_A_CONFIRMAR,
  MAX_DIAS,
  calcularVencimiento,
  expandirRango,
  fechaCorta,
  fechaLarga,
  isoValida,
  type ExtraInhabil,
  type GrupoSalteado,
} from "../../lib/plazos-procesales";
import { useToolTracking } from "./use-tool-tracking";

const NOTIFICACION_MUESTRA = "2026-12-03";
const DIAS_MUESTRA = "10";
const NOV_10 = "2026-11-10";
const NOV_16_2026 = "2026-11-16";
const NOV_16_2027 = "2027-11-16";

function hoyIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function rangoTexto(g: GrupoSalteado) {
  if (g.desde === g.hasta) return fechaLarga(g.desde);
  if (g.desde.slice(0, 4) !== g.hasta.slice(0, 4)) return `del ${fechaLarga(g.desde)} al ${fechaLarga(g.hasta)}`;
  return `del ${fechaCorta(g.desde)} al ${fechaCorta(g.hasta)} de ${g.hasta.slice(0, 4)}`;
}

const TIPO_ETIQUETA: Record<string, string> = {
  "fin-de-semana": "Fin de semana",
  feriado: "Feriado",
  "no-laborable": "No laborable",
  feria: "Feria judicial",
  "inhabil-judicial": "Inhábil judicial",
  extra: "Agregado por vos",
  "a-confirmar": "A confirmar",
};

export default function PlazosCalculator({ slug }: { slug: string }) {
  const [notificacion, setNotificacion] = useState(NOTIFICACION_MUESTRA);
  const [dias, setDias] = useState(DIAS_MUESTRA);
  const [nov10Inhabil, setNov10Inhabil] = useState(true);
  const [nov16Inhabil, setNov16Inhabil] = useState(false);
  const [extras, setExtras] = useState<ExtraInhabil[]>([]);
  const [habilitados, setHabilitados] = useState<string[]>([]);
  const [extraDesde, setExtraDesde] = useState("");
  const [extraHasta, setExtraHasta] = useState("");
  const [extraMotivo, setExtraMotivo] = useState("");
  const [extraError, setExtraError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const { markUsed } = useToolTracking(slug);

  const habilitadosTotal = useMemo(() => (nov10Inhabil ? habilitados : [...new Set([...habilitados, NOV_10])]), [habilitados, nov10Inhabil]);
  const confirmadosInhabiles = useMemo(() => (nov16Inhabil ? [NOV_16_2026, NOV_16_2027] : []), [nov16Inhabil]);
  const diasNumero = /^\d+$/.test(dias.trim()) ? Number(dias.trim()) : NaN;
  const resultado = useMemo(
    () => calcularVencimiento({ notificacion, dias: diasNumero, extras, habilitados: habilitadosTotal, confirmadosInhabiles }),
    [notificacion, diasNumero, extras, habilitadosTotal, confirmadosInhabiles],
  );
  const fechaInvalida = notificacion !== "" && !isoValida(notificacion);

  function agregarExtra(e: FormEvent) {
    e.preventDefault();
    markUsed({ action: "extra_day" });
    if (!isoValida(extraDesde)) return setExtraError("Elegí la fecha del día inhábil.");
    const hasta = extraHasta && isoValida(extraHasta) ? extraHasta : extraDesde;
    const lista = expandirRango(extraDesde, hasta);
    if (!lista) return setExtraError("El rango tiene que ir de menor a mayor fecha y no superar los 60 días.");
    const motivo = extraMotivo.trim().slice(0, 80);
    setExtraError("");
    setExtras((prev) => {
      const existentes = new Set(prev.map((x) => x.fecha));
      return [...prev, ...lista.filter((f) => !existentes.has(f)).map((fecha) => ({ fecha, motivo }))].sort((a, b) => a.fecha.localeCompare(b.fecha));
    });
    setMensaje(`Se agregó ${lista.length === 1 ? "1 día inhábil" : `${lista.length} días inhábiles`}.`);
    setExtraDesde("");
    setExtraHasta("");
    setExtraMotivo("");
  }

  function quitarExtra(fecha: string) {
    markUsed({ action: "remove_extra" });
    setExtras((prev) => prev.filter((x) => x.fecha !== fecha));
    setMensaje(`Se quitó el día inhábil ${fechaCorta(fecha)}.`);
  }

  function contarComoHabil(grupo: GrupoSalteado) {
    markUsed({ action: "force_business_day" });
    if (grupo.tipo === "extra") {
      setExtras((prev) => prev.filter((x) => !grupo.fechas.includes(x.fecha)));
    } else if (grupo.fechas.includes(NOV_10) && grupo.tipo !== "feria") {
      setNov10Inhabil(false);
    } else if (grupo.tipo === "a-confirmar") {
      setNov16Inhabil(false);
    } else {
      setHabilitados((prev) => [...new Set([...prev, ...grupo.fechas])]);
    }
    setMensaje(`${fechaCorta(grupo.desde)} ahora se cuenta como día hábil.`);
  }

  function restablecer() {
    markUsed({ action: "reset" });
    setExtras([]);
    setHabilitados([]);
    setNov10Inhabil(true);
    setNov16Inhabil(false);
    setMensaje("Se restablecieron los días inhábiles al calendario oficial.");
  }

  const hayCambios = extras.length > 0 || habilitados.length > 0 || !nov10Inhabil || nov16Inhabil;

  return (
    <div className="dm-stage tl-stage">
      <div className="dm-stage-head">
        <div className="dm-stage-title">
          <span className="dm-dot" aria-hidden="true" />
          <strong>Vencimiento en días hábiles judiciales</strong>
        </div>
        <span className="dm-chip is-orange">Justicia Nacional y Federal (CABA)</span>
      </div>
      <p className="dm-stage-note">Calendario 2026 y 2027 de los tribunales nacionales y federales con asiento en la Ciudad de Buenos Aires. Los tribunales provinciales tienen otras ferias: no están incluidos.</p>
      <div className="dm-stage-body">
        <form className="tl-form" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="tl-form-grid">
            <label className="dm-field">
              Fecha de notificación
              <input
                className="dm-input"
                type="date"
                min={CALENDARIO_DESDE}
                max={CALENDARIO_HASTA}
                value={notificacion}
                aria-invalid={fechaInvalida || undefined}
                onChange={(e) => { markUsed({ action: "date" }); setNotificacion(e.target.value); }}
              />
              <button type="button" className="dm-link-btn" onClick={() => { markUsed({ action: "today" }); setNotificacion(hoyIso()); }}>Usar la fecha de hoy</button>
            </label>
            <label className="dm-field">
              Plazo en días hábiles
              <input
                className="dm-input"
                inputMode="numeric"
                autoComplete="off"
                value={dias}
                aria-invalid={Number.isNaN(diasNumero) || undefined}
                aria-describedby="plazos-dias-ayuda"
                onChange={(e) => { markUsed({ action: "days" }); setDias(e.target.value); }}
              />
              <span id="plazos-dias-ayuda" className="dm-hint">De 1 a {MAX_DIAS}. Por ejemplo: 5 (traslado), 10, 15 (contestar demanda).</span>
            </label>
          </div>

          <fieldset className="tl-fieldset">
            <legend>Días dudosos</legend>
            <label className="dm-check">
              <input type="checkbox" checked={nov10Inhabil} onChange={(e) => { markUsed({ action: "nov10" }); setNov10Inhabil(e.target.checked); }} />
              <span>Contar el 10/11/2026 como inhábil: feriado en la Ciudad de Buenos Aires (DNU 1103/2026). Destildalo si tu tribunal no tiene asiento en CABA.</span>
            </label>
            <label className="dm-check">
              <input type="checkbox" checked={nov16Inhabil} onChange={(e) => { markUsed({ action: "nov16" }); setNov16Inhabil(e.target.checked); }} />
              <span>Contar el 16 de noviembre (Día del Trabajador Judicial) como inhábil. Por defecto es hábil: no encontramos una acordada que lo declare inhábil para los plazos.</span>
            </label>
          </fieldset>
        </form>

        <div className="tl-result" aria-live="polite">
          {fechaInvalida || notificacion === "" ? (
            <p className="dm-error" role="alert">Ingresá una fecha de notificación válida.</p>
          ) : null}
          {!(fechaInvalida || notificacion === "") && !resultado.ok ? <p className="dm-error" role="alert">{resultado.error}</p> : null}

          {resultado.ok && resultado.vencimiento ? (
            <>
              <div className="tl-big">
                <span className="tl-big-label"><CalendarCheck aria-hidden="true" size={16} /> Vence</span>
                <strong className="tl-big-date">{fechaLarga(resultado.vencimiento)}</strong>
                <span className="tl-big-sub">Día hábil número {resultado.contados.length} desde la notificación del {fechaLarga(notificacion)}.</span>
              </div>
              {resultado.graciaHasta ? (
                <p className="tl-gracia"><Info aria-hidden="true" size={18} /><span><strong>Plazo de gracia (art. 124 CPCCN):</strong> un escrito fuera del horario judicial del último día puede presentarse en las dos primeras horas del despacho del {fechaLarga(resultado.graciaHasta)}. Es informativo: presentá siempre dentro del plazo.</span></p>
              ) : null}
              {resultado.avisos.length ? (
                <ul className="tl-avisos" aria-label="Avisos sobre este cálculo">
                  {resultado.avisos.map((a) => <li key={a}>{a}</li>)}
                </ul>
              ) : null}

              <section aria-labelledby="plazos-salteados">
                <h3 id="plazos-salteados" className="dm-panel-title">Días inhábiles que se salteó ({resultado.salteados.length})</h3>
                {resultado.grupos.length ? (
                  <ul className="tl-skips">
                    {resultado.grupos.map((g) => (
                      <li key={`${g.grupo}-${g.desde}-${g.tipo}`}>
                        <span className={`dm-chip ${g.tipo === "feria" ? "is-warn" : g.tipo === "fin-de-semana" ? "is-mute" : g.tipo === "extra" ? "is-orange" : "is-ink"}`}>{TIPO_ETIQUETA[g.tipo]}</span>
                        <span className="tl-skip-main"><strong>{g.motivo}</strong><small>{g.tipo === "fin-de-semana" ? "Sábados y domingos entre la notificación y el vencimiento." : rangoTexto(g)}</small></span>
                        {g.quitable && g.tipo !== "feria" ? (
                          <button type="button" className="dm-link-btn" onClick={() => contarComoHabil(g)}>Contar como hábil</button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : <p className="dm-empty">Este plazo no atraviesa ningún día inhábil.</p>}
              </section>

              <details className="tl-counted">
                <summary>Ver los {resultado.contados.length} días hábiles contados</summary>
                <ol className="tl-counted-list">
                  {resultado.contados.map((c) => <li key={c.fecha}><b>{c.n}</b> {fechaLarga(c.fecha)}</li>)}
                </ol>
              </details>
            </>
          ) : null}
        </div>

        <section className="tl-extras" aria-labelledby="plazos-extras">
          <h3 id="plazos-extras" className="dm-panel-title"><CalendarPlus aria-hidden="true" size={18} /> Agregar días inhábiles</h3>
          <p className="dm-hint">Para suspensiones de plazos, asuetos, la feria de invierno 2027 cuando se publique o los días no laborables de otra jurisdicción.</p>
          <form className="tl-extra-form" onSubmit={agregarExtra} noValidate>
            <label className="dm-field">Desde<input className="dm-input" type="date" min={CALENDARIO_DESDE} max={CALENDARIO_HASTA} value={extraDesde} onChange={(e) => setExtraDesde(e.target.value)} /></label>
            <label className="dm-field">Hasta (opcional)<input className="dm-input" type="date" min={extraDesde || CALENDARIO_DESDE} max={CALENDARIO_HASTA} value={extraHasta} onChange={(e) => setExtraHasta(e.target.value)} /></label>
            <label className="dm-field">Motivo (opcional)<input className="dm-input" maxLength={80} autoComplete="off" value={extraMotivo} onChange={(e) => setExtraMotivo(e.target.value)} placeholder="Ej.: suspensión de plazos" /></label>
            <button type="submit" className="dm-btn dm-btn-ink">Agregar</button>
          </form>
          {extraError ? <p className="dm-error" role="alert">{extraError}</p> : null}
          {extras.length ? (
            <ul className="tl-extra-list">
              {extras.map((x) => (
                <li key={x.fecha}>
                  <span>{fechaLarga(x.fecha)}{x.motivo ? ` · ${x.motivo}` : ""}</span>
                  <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={() => quitarExtra(x.fecha)} aria-label={`Quitar el día inhábil ${fechaLarga(x.fecha)}`}><Trash2 aria-hidden="true" size={14} />Quitar</button>
                </li>
              ))}
            </ul>
          ) : null}
          {hayCambios ? <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm tl-reset" onClick={restablecer}><RotateCcw aria-hidden="true" size={14} />Volver al calendario oficial</button> : null}
        </section>
        <p className="dm-sr" role="status">{mensaje}</p>
        <p className="dm-hint">Días dudosos cargados: {DIAS_A_CONFIRMAR.map((d) => fechaCorta(d.fecha) + " de " + d.fecha.slice(0, 4)).join(" y ")} (Día del Trabajador Judicial).</p>
      </div>
    </div>
  );
}
