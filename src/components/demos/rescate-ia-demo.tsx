import { useMemo, useState } from "react";
import { Check, RotateCcw, ScanSearch, ShieldCheck, Wrench } from "lucide-react";
import { Chip, Kpi, Spinner, useBusy } from "./shared";

type Area = "seguridad" | "datos" | "deploy" | "crecimiento";
type Severity = "critico" | "alto" | "medio" | "bajo";

interface Finding {
  id: string;
  area: Area;
  severity: Severity;
  title: string;
  before: string;
  after: string;
}

const AREAS: { id: Area; label: string }[] = [
  { id: "seguridad", label: "Seguridad" },
  { id: "datos", label: "Datos" },
  { id: "deploy", label: "Deploy" },
  { id: "crecimiento", label: "Crecimiento" },
];

const SEVERITY: Record<Severity, { label: string; weight: number; tone: "bad" | "warn" | "orange" | "mute" }> = {
  critico: { label: "Crítico", weight: 10, tone: "bad" },
  alto: { label: "Alto", weight: 7, tone: "warn" },
  medio: { label: "Medio", weight: 4, tone: "orange" },
  bajo: { label: "Bajo", weight: 2, tone: "mute" },
};

/** Fictional audit of a fictional app. Order inside each area: most severe first. */
const FINDINGS: Finding[] = [
  { id: "s1", area: "seguridad", severity: "critico", title: "Clave de pagos a la vista", before: "La clave secreta del cobro online está escrita en el código que baja al navegador. Cualquiera la ve con dos clics.", after: "La clave pasó al servidor, se rotó la anterior y los cobros se piden desde un endpoint propio. Nada sensible viaja al navegador." },
  { id: "s2", area: "seguridad", severity: "critico", title: "Cada usuario ve los turnos de los demás", before: "La base no tiene reglas de acceso por usuario: con la sesión de una clínica se pueden leer los turnos y teléfonos de todas.", after: "Reglas de acceso por fila y pruebas con dos cuentas distintas que confirman que cada una ve solo lo suyo." },
  { id: "s3", area: "seguridad", severity: "medio", title: "Formulario sin límites", before: "El formulario de contacto acepta cualquier cosa y cualquier cantidad de envíos. Ya entraron 400 mensajes basura en una noche.", after: "Validación en el servidor, límite de intentos por dirección y filtro de spam. Los mensajes reales siguen entrando." },
  { id: "d1", area: "datos", severity: "alto", title: "Sin copias de respaldo ni historial de cambios", before: "La base se modifica a mano en producción. Si alguien borra una tabla, no hay forma de volver atrás.", after: "Copias diarias, cambios de estructura versionados y una restauración probada en un entorno aparte, con fecha y responsable." },
  { id: "d2", area: "datos", severity: "medio", title: "Clientes duplicados", before: "La misma clienta figura tres veces con teléfonos distintos. Los avisos le llegan repetidos o no le llegan.", after: "Restricciones de unicidad y una limpieza revisada por una persona antes de fusionar registros. Quedó el rastro de cada fusión." },
  { id: "d3", area: "datos", severity: "medio", title: "Horarios corridos entre usuarios", before: "Las fechas se guardan en la hora de cada navegador. Un turno de las 10:00 aparece a las 13:00 para quien viaja.", after: "Todo se guarda en una sola referencia horaria y se muestra en la zona de cada sucursal, con pruebas de los cambios de horario." },
  { id: "p1", area: "deploy", severity: "alto", title: "Se publica a mano desde una sola compu", before: "Una persona sube los archivos cuando puede. No hay entorno de prueba y volver a la versión anterior lleva horas.", after: "Publicación automática con vista previa de cada cambio, pruebas antes de salir y vuelta atrás en un clic." },
  { id: "p2", area: "deploy", severity: "medio", title: "Pruebas y producción mezcladas", before: "El entorno de prueba usa las mismas claves que el real. Una prueba mandó mails a clientes de verdad.", after: "Entornos separados con credenciales propias y datos de prueba que no pueden enviar nada afuera." },
  { id: "p3", area: "deploy", severity: "medio", title: "Nadie se entera cuando se cae", before: "El sitio estuvo caído un fin de semana. Se supo porque un cliente escribió por WhatsApp.", after: "Chequeo de disponibilidad y alertas de errores que llegan al equipo antes que a los clientes." },
  { id: "c1", area: "crecimiento", severity: "alto", title: "Cada arreglo rompe otra pantalla", before: "El mismo código está copiado en 14 pantallas y no hay pruebas. Tocar el precio rompió la agenda.", after: "Piezas compartidas, pruebas de los recorridos clave (reservar, cobrar, cancelar) y cambios chicos que se pueden revisar." },
  { id: "c2", area: "crecimiento", severity: "medio", title: "Se pone lenta con más datos", before: "La agenda trae todos los turnos de la historia cada vez que abre. Con 1.000 turnos tarda 9 segundos.", after: "Consultas con índices y paginación. La agenda abre con lo que se necesita y el resto carga a demanda." },
  { id: "c3", area: "crecimiento", severity: "bajo", title: "Nadie sabe cómo se levanta", before: "No hay documentación. Si se va quien lo armó, nadie sabe cómo instalarlo ni de dónde sale cada dato.", after: "Guía de instalación, mapa del sistema y un traspaso grabado para que cualquier persona del equipo pueda seguir." },
];

const TOTAL_WEIGHT = FINDINGS.reduce((sum, f) => sum + SEVERITY[f.severity].weight, 0);

function scoreTone(score: number): "bad" | "warn" | "good" {
  return score < 50 ? "bad" : score < 85 ? "warn" : "good";
}

export default function RescateIaDemo() {
  const [scanned, setScanned] = useState(false);
  const [fixed, setFixed] = useState<string[]>([]);
  const [area, setArea] = useState<Area>("seguridad");
  const { busy, run } = useBusy();

  const score = useMemo(() => {
    const pending = FINDINGS.filter((f) => !fixed.includes(f.id)).reduce((sum, f) => sum + SEVERITY[f.severity].weight, 0);
    return Math.round(100 - (pending / TOTAL_WEIGHT) * 67);
  }, [fixed]);
  const criticalOpen = FINDINGS.filter((f) => f.severity === "critico" && !fixed.includes(f.id)).length;
  const allDone = fixed.length === FINDINGS.length;
  const areaFindings = FINDINGS.filter((f) => f.area === area);

  const reset = () => { setScanned(false); setFixed([]); setArea("seguridad"); };
  const fix = (id: string) => setFixed((cur) => (cur.includes(id) ? cur : [...cur, id]));
  const fixArea = () => setFixed((cur) => [...new Set([...cur, ...areaFindings.map((f) => f.id)])]);

  return (
    <section className="dm-stage ro-stage" aria-label="Diagnóstico y estabilización de una app hecha con IA">
      <div className="dm-stage-head">
        <div className="dm-stage-title">
          <span className="dm-dot" aria-hidden="true" />
          <strong>Turnero Costa Azul · app hecha con IA</strong>
        </div>
        <ol className="dm-pattern" aria-label="Cómo funciona">
          <li><span>1</span>Revisamos</li>
          <li><span>2</span>Priorizamos</li>
          <li><span>3</span>Estabilizamos</li>
        </ol>
        <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={reset}><RotateCcw aria-hidden="true" size={14} />Reiniciar demo</button>
      </div>
      <p className="dm-stage-note">Datos ficticios con fines de demostración. Es una app inventada y un diagnóstico de ejemplo. Todo corre en tu navegador, sin enviar nada a nadie.</p>

      <div className="dm-stage-body">
        {!scanned ? (
          <div className="ro-start">
            <p><strong>Turnero Costa Azul</strong> es una app de reservas armada en un fin de semana con un asistente de IA. Hoy la usan 3 clínicas y empezaron los problemas.</p>
            <button type="button" className="dm-btn dm-btn-primary" disabled={busy} onClick={() => run(() => setScanned(true), 900)}>
              <ScanSearch aria-hidden="true" size={16} />Revisar la app
            </button>
            {busy ? <Spinner label="Leyendo código, base de datos y publicación…" /> : <p className="dm-hint">La revisión es de solo lectura: no se cambia nada hasta que lo decidas.</p>}
          </div>
        ) : (
          <>
            <div className="dm-kpis dm-kpis-3" aria-live="polite">
              <Kpi label="Salud del proyecto" value={`${score}/100`} sub={allDone ? "Estable" : "puntaje ilustrativo"} tone={scoreTone(score)} />
              <Kpi label="Críticos abiertos" value={String(criticalOpen)} sub="se arreglan primero" tone={criticalOpen ? "bad" : "good"} />
              <Kpi label="Arreglados" value={`${fixed.length}/${FINDINGS.length}`} sub="con prueba y respaldo" tone={allDone ? "good" : "ink"} />
            </div>

            <div className="ro-tabs" role="tablist" aria-label="Áreas de la revisión">
              {AREAS.map((a) => {
                const items = FINDINGS.filter((f) => f.area === a.id);
                const open = items.filter((f) => !fixed.includes(f.id)).length;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="tab"
                    id={`ro-tab-${a.id}`}
                    aria-selected={area === a.id}
                    aria-controls={`ro-panel-${a.id}`}
                    className={`ro-tab${area === a.id ? " is-active" : ""}`}
                    onClick={() => setArea(a.id)}
                  >
                    {a.label}
                    <span className={`ro-tab-count${open === 0 ? " is-done" : ""}`}>{open === 0 ? "OK" : `${open} por arreglar`}</span>
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" id={`ro-panel-${area}`} aria-labelledby={`ro-tab-${area}`} className="ro-panel">
              <div className="dm-row dm-row-between">
                <h3 className="dm-panel-title"><ShieldCheck aria-hidden="true" size={18} />{AREAS.find((a) => a.id === area)!.label}</h3>
                <button type="button" className="dm-btn dm-btn-sm" disabled={areaFindings.every((f) => fixed.includes(f.id))} onClick={fixArea}>
                  <Wrench aria-hidden="true" size={14} />Estabilizar toda el área
                </button>
              </div>
              <ul className="ro-list">
                {areaFindings.map((f) => {
                  const done = fixed.includes(f.id);
                  const sev = SEVERITY[f.severity];
                  return (
                    <li key={f.id} className={`ro-item${done ? " is-fixed" : ""}`}>
                      <div className="dm-row dm-row-between">
                        <h4 className="ro-item-title">{f.title}</h4>
                        <span className="dm-row">
                          <Chip tone={sev.tone}>{sev.label}</Chip>
                          {done ? <Chip tone="good"><Check aria-hidden="true" size={12} />Arreglado</Chip> : null}
                        </span>
                      </div>
                      <div className="ro-ba">
                        <div className="ro-before">
                          <span className="ro-ba-label">Antes</span>
                          <p>{f.before}</p>
                        </div>
                        <div className={`ro-after${done ? "" : " is-locked"}`}>
                          <span className="ro-ba-label">Después</span>
                          {done ? <p>{f.after}</p> : (
                            <button type="button" className="dm-btn dm-btn-primary dm-btn-sm" onClick={() => fix(f.id)}>
                              <Wrench aria-hidden="true" size={14} />Ver cómo lo estabilizamos
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {allDone ? (
              <p className="dm-note-ok" role="status"><Check aria-hidden="true" size={18} />Proyecto estable: informe de revisión, pruebas de los recorridos clave, copias verificadas y guía de traspaso entregados.</p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
