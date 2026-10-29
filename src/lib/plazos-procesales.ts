/**
 * Plazos procesales en días hábiles judiciales: Justicia Nacional y Federal con asiento en la CABA
 * (Código Procesal Civil y Comercial de la Nación y Reglamento para la Justicia Nacional).
 *
 * Reglas (fuentes en src/content/tools.ts):
 *  - Art. 156 CPCCN: el plazo corre desde la notificación; no se cuenta el día de la notificación ni los inhábiles.
 *  - Art. 152 CPCCN y art. 2 del Reglamento para la Justicia Nacional: no son hábiles enero, la feria de julio,
 *    los domingos, los días no laborables dispuestos por el Congreso o el Poder Ejecutivo y los feriados judiciales.
 *  - Art. 124 CPCCN: plazo de gracia, dos primeras horas del día hábil siguiente.
 *
 * Todas las fechas son strings ISO "AAAA-MM-DD" y la aritmética es UTC, para no depender de la zona horaria.
 * Calendario cargado: 2026 y 2027.
 */

export type Iso = string;

export const CALENDARIO_DESDE: Iso = "2026-01-01";
export const CALENDARIO_HASTA: Iso = "2027-12-31";

export type TipoDia = "fin-de-semana" | "feriado" | "no-laborable" | "feria" | "inhabil-judicial" | "extra" | "a-confirmar";

export interface DiaInhabil {
  fecha: Iso;
  tipo: TipoDia;
  /** Texto corto que se muestra al usuario. */
  motivo: string;
  /** Clave del grupo para unir días consecutivos (ferias, fines de semana). */
  grupo: string;
}

/** Día que la norma deja dudoso para los tribunales nacionales: por defecto cuenta como hábil. El usuario lo puede marcar inhábil. */
export interface DiaAConfirmar {
  fecha: Iso;
  motivo: string;
  detalle: string;
}

export interface AvisoPendiente {
  id: string;
  desde: Iso;
  hasta: Iso;
  texto: string;
}

// ---------------------------------------------------------------- fechas

export function isoValida(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function toDate(iso: Iso): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIso(date: Date): Iso {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: Iso, days: number): Iso {
  const date = toDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

/** 0 = domingo … 6 = sábado */
export function diaSemana(iso: Iso): number {
  return toDate(iso).getUTCDay();
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function nombreDia(iso: Iso): string {
  return DIAS[diaSemana(iso)];
}

/** "lunes 9 de marzo de 2026" */
export function fechaLarga(iso: Iso): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${nombreDia(iso)} ${d} de ${MESES[m - 1]} de ${y}`;
}

/** "9 de marzo" */
export function fechaCorta(iso: Iso): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]}`;
}

/** Domingo de Pascua (algoritmo gregoriano anónimo de Meeus/Jones/Butcher). */
export function pascua(year: number): Iso {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ---------------------------------------------------------------- calendario

interface Entrada {
  fecha: Iso;
  tipo: "feriado" | "no-laborable";
  motivo: string;
}

/**
 * Feriados y días no laborables de la Ley 27.399 (arts. 1 y 6) para un año.
 * Trasladables: martes o miércoles pasan al lunes anterior; jueves o viernes, al lunes siguiente (art. 6).
 * Los trasladables que caen sábado o domingo no se mueven acá: el Decreto 614/2025 deja la decisión a la Jefatura de Gabinete.
 */
export function feriadosLey27399(year: number): Entrada[] {
  const y = String(year);
  const easter = pascua(year);
  const fijos: Entrada[] = [
    { fecha: `${y}-01-01`, tipo: "feriado", motivo: "Año Nuevo" },
    { fecha: addDays(easter, -48), tipo: "feriado", motivo: "Carnaval (lunes)" },
    { fecha: addDays(easter, -47), tipo: "feriado", motivo: "Carnaval (martes)" },
    { fecha: `${y}-03-24`, tipo: "feriado", motivo: "Día Nacional de la Memoria por la Verdad y la Justicia" },
    { fecha: addDays(easter, -3), tipo: "no-laborable", motivo: "Jueves Santo (día no laborable)" },
    { fecha: addDays(easter, -2), tipo: "feriado", motivo: "Viernes Santo" },
    { fecha: `${y}-04-02`, tipo: "feriado", motivo: "Día del Veterano y de los Caídos en la Guerra de Malvinas" },
    { fecha: `${y}-05-01`, tipo: "feriado", motivo: "Día del Trabajador" },
    { fecha: `${y}-05-25`, tipo: "feriado", motivo: "Día de la Revolución de Mayo" },
    { fecha: `${y}-06-20`, tipo: "feriado", motivo: "Paso a la Inmortalidad del General Manuel Belgrano" },
    { fecha: `${y}-07-09`, tipo: "feriado", motivo: "Día de la Independencia" },
    { fecha: `${y}-12-08`, tipo: "feriado", motivo: "Inmaculada Concepción de María" },
    { fecha: `${y}-12-25`, tipo: "feriado", motivo: "Navidad" },
  ];
  const trasladables: Array<[string, string]> = [
    [`${y}-06-17`, "Paso a la Inmortalidad del General Martín Miguel de Güemes"],
    [`${y}-08-17`, "Paso a la Inmortalidad del General José de San Martín"],
    [`${y}-10-12`, "Día del Respeto a la Diversidad Cultural"],
    [`${y}-11-20`, "Día de la Soberanía Nacional"],
  ];
  const movidos = trasladables.map(([fecha, motivo]): Entrada => {
    const dow = diaSemana(fecha);
    let destino = fecha;
    if (dow === 2 || dow === 3) destino = addDays(fecha, -(dow - 1)); // martes/miércoles -> lunes anterior
    else if (dow === 4 || dow === 5) destino = addDays(fecha, 8 - dow); // jueves/viernes -> lunes siguiente
    return { fecha: destino, tipo: "feriado", motivo: destino === fecha ? motivo : `${motivo} (trasladado del ${fechaCorta(fecha)})` };
  });
  return [...fijos, ...movidos];
}

/** Normas particulares de cada año que se suman a la Ley 27.399. */
const NORMAS_2026: Entrada[] = [
  { fecha: "2026-03-23", tipo: "no-laborable", motivo: "Día no laborable con fines turísticos (Res. JGM 164/2025)" },
  { fecha: "2026-07-10", tipo: "no-laborable", motivo: "Día no laborable con fines turísticos (Res. JGM 164/2025)" },
  { fecha: "2026-12-07", tipo: "no-laborable", motivo: "Día no laborable con fines turísticos (Res. JGM 164/2025)" },
  { fecha: "2026-11-09", tipo: "feriado", motivo: "Feriado nacional por la visita del Papa León XIV (DNU 1103/2026)" },
  { fecha: "2026-11-10", tipo: "feriado", motivo: "Feriado en la CABA y en Córdoba por la visita del Papa León XIV (DNU 1103/2026)" },
];

/** Feriados judiciales dispuestos por la CSJN para los tribunales nacionales y federales de la Capital Federal. */
const INHABILES_JUDICIALES: Array<{ fecha: Iso; motivo: string }> = [
  { fecha: "2026-10-20", motivo: "Inhábil por elecciones de abogados al Consejo de la Magistratura (Acordada CSJN 26/2026)" },
];

/** Feria de enero: el mes completo (art. 2 del Reglamento para la Justicia Nacional). */
const FERIAS: Array<{ desde: Iso; hasta: Iso; motivo: string }> = [
  { desde: "2026-01-01", hasta: "2026-01-31", motivo: "Feria judicial de enero (art. 2 Reglamento para la Justicia Nacional)" },
  { desde: "2026-07-20", hasta: "2026-07-31", motivo: "Feria judicial de invierno 2026 (Acordada CSJN 11/2026)" },
  { desde: "2027-01-01", hasta: "2027-01-31", motivo: "Feria judicial de enero (art. 2 Reglamento para la Justicia Nacional)" },
  // Feria de invierno 2027: la CSJN todavía no la fijó. Ver AVISOS_PENDIENTES.
];

export const DIAS_A_CONFIRMAR: DiaAConfirmar[] = [
  {
    fecha: "2026-11-16",
    motivo: "Día del Trabajador Judicial (Ley 26.674)",
    detalle: "La ley lo equipara a feriado para los trabajadores judiciales, pero no encontramos una acordada de la CSJN que lo declare inhábil para los plazos. Por defecto se cuenta como hábil (criterio prudente: el plazo vence antes).",
  },
  {
    fecha: "2027-11-16",
    motivo: "Día del Trabajador Judicial (Ley 26.674)",
    detalle: "La ley lo equipara a feriado para los trabajadores judiciales, pero no encontramos una acordada de la CSJN que lo declare inhábil para los plazos. Por defecto se cuenta como hábil (criterio prudente: el plazo vence antes).",
  },
];

export const AVISOS_PENDIENTES: AvisoPendiente[] = [
  {
    id: "turisticos-2027",
    desde: "2027-01-01",
    hasta: "2027-12-31",
    texto: "Los días no laborables con fines turísticos de 2027 todavía no fueron fijados por el Poder Ejecutivo (la Ley 27.399 prevé hasta tres, lunes o viernes). Si se publican, agregalos como días inhábiles.",
  },
  {
    id: "invierno-2027",
    desde: "2027-07-01",
    hasta: "2027-08-15",
    texto: "La feria judicial de invierno 2027 todavía no fue fijada por la CSJN (se fija por acordada, en 2026 fue el 2 de junio). Cuando se publique, cargala como rango de días inhábiles.",
  },
  {
    id: "soberania-2027",
    desde: "2027-11-15",
    hasta: "2027-11-24",
    texto: "El 20 de noviembre de 2027 es sábado: el Decreto 614/2025 permite trasladarlo al viernes 19 o al lunes 22 según decida la Jefatura de Gabinete, y todavía no lo hizo.",
  },
];

function rango(desde: Iso, hasta: Iso): Iso[] {
  const out: Iso[] = [];
  for (let d = desde; d <= hasta; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Mapa fecha -> motivo del calendario oficial cargado (sin fines de semana). */
export function construirCalendario(): Map<Iso, DiaInhabil> {
  const mapa = new Map<Iso, DiaInhabil>();
  const poner = (dia: DiaInhabil) => {
    const previo = mapa.get(dia.fecha);
    // La feria se muestra como rango continuo (gana sobre un feriado dentro del rango, p. ej. 1 de enero).
    // Un feriado gana sobre un día no laborable que cae el mismo día (Jueves Santo y 2 de abril en 2026).
    if (!previo || (previo.tipo === "no-laborable" && dia.tipo !== "no-laborable" && dia.tipo !== "feria")) mapa.set(dia.fecha, dia);
  };
  for (const feria of FERIAS) {
    for (const fecha of rango(feria.desde, feria.hasta)) poner({ fecha, tipo: "feria", motivo: feria.motivo, grupo: `feria:${feria.desde}` });
  }
  for (const year of [2026, 2027]) {
    for (const e of feriadosLey27399(year)) poner({ fecha: e.fecha, tipo: e.tipo, motivo: e.motivo, grupo: `dia:${e.fecha}` });
  }
  for (const e of NORMAS_2026) poner({ fecha: e.fecha, tipo: e.tipo, motivo: e.motivo, grupo: `dia:${e.fecha}` });
  for (const e of INHABILES_JUDICIALES) poner({ fecha: e.fecha, tipo: "inhabil-judicial", motivo: e.motivo, grupo: `dia:${e.fecha}` });
  return mapa;
}

const CALENDARIO = construirCalendario();

/** Lista ordenada del calendario oficial cargado para un año (sin fines de semana ni ferias), para mostrar en la página. */
export function listaFeriados(year: number): DiaInhabil[] {
  return [...CALENDARIO.values()].filter((d) => d.fecha.startsWith(`${year}-`) && d.tipo !== "feria").sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function listaFerias(): Array<{ desde: Iso; hasta: Iso; motivo: string }> {
  return FERIAS.map((f) => ({ ...f }));
}

// ---------------------------------------------------------------- cálculo

export interface ExtraInhabil {
  fecha: Iso;
  motivo?: string;
}

export interface EntradaPlazo {
  /** Fecha de notificación (el día en que se perfecciona; no se cuenta). */
  notificacion: Iso;
  /** Cantidad de días hábiles del plazo. */
  dias: number;
  /** Días inhábiles que agrega el usuario. */
  extras?: ExtraInhabil[];
  /** Días del calendario oficial que el usuario decide contar como hábiles. */
  habilitados?: Iso[];
  /** Días a confirmar que el usuario decide contar como inhábiles. */
  confirmadosInhabiles?: Iso[];
}

export interface DiaSalteado extends DiaInhabil {
  /** El usuario puede pedir que cuente como hábil (todo menos fines de semana). */
  quitable: boolean;
}

export interface GrupoSalteado {
  grupo: string;
  tipo: TipoDia;
  motivo: string;
  desde: Iso;
  hasta: Iso;
  fechas: Iso[];
  quitable: boolean;
}

export interface ResultadoPlazo {
  ok: boolean;
  error?: string;
  vencimiento?: Iso;
  /** Primer día hábil posterior al vencimiento: ahí rigen las dos primeras horas del art. 124. */
  graciaHasta?: Iso;
  /** Cada día hábil contado: n-ésimo y su fecha. */
  contados: Array<{ n: number; fecha: Iso }>;
  salteados: DiaSalteado[];
  grupos: GrupoSalteado[];
  avisos: string[];
}

export const MAX_DIAS = 365;

export function esInhabil(fecha: Iso, opts: Pick<EntradaPlazo, "extras" | "habilitados" | "confirmadosInhabiles"> = {}): DiaInhabil | null {
  const dow = diaSemana(fecha);
  if (dow === 0) return { fecha, tipo: "fin-de-semana", motivo: "Domingo", grupo: "finde" };
  if (dow === 6) return { fecha, tipo: "fin-de-semana", motivo: "Sábado", grupo: "finde" };
  if (opts.habilitados?.includes(fecha)) return null;
  const extra = opts.extras?.find((e) => e.fecha === fecha);
  if (extra) return { fecha, tipo: "extra", motivo: extra.motivo?.trim() || "Día inhábil agregado por vos", grupo: `extra:${fecha}` };
  const oficial = CALENDARIO.get(fecha);
  if (oficial) return oficial;
  if (opts.confirmadosInhabiles?.includes(fecha)) {
    const dudoso = DIAS_A_CONFIRMAR.find((d) => d.fecha === fecha);
    return { fecha, tipo: "a-confirmar", motivo: dudoso?.motivo ?? "Día a confirmar", grupo: `dia:${fecha}` };
  }
  return null;
}

export function calcularVencimiento(entrada: EntradaPlazo): ResultadoPlazo {
  const base: ResultadoPlazo = { ok: false, contados: [], salteados: [], grupos: [], avisos: [] };
  if (!isoValida(entrada.notificacion)) return { ...base, error: "Ingresá una fecha de notificación válida." };
  if (!Number.isInteger(entrada.dias) || entrada.dias < 1) return { ...base, error: "La cantidad de días hábiles tiene que ser un número entero de 1 o más." };
  if (entrada.dias > MAX_DIAS) return { ...base, error: `Por ahora calculamos plazos de hasta ${MAX_DIAS} días hábiles.` };
  if (entrada.notificacion < CALENDARIO_DESDE || entrada.notificacion > CALENDARIO_HASTA) {
    return { ...base, error: `El calendario cargado va del ${fechaCorta(CALENDARIO_DESDE)} de 2026 al ${fechaCorta(CALENDARIO_HASTA)} de 2027. Elegí una notificación dentro de ese rango.` };
  }

  const opts = { extras: entrada.extras, habilitados: entrada.habilitados, confirmadosInhabiles: entrada.confirmadosInhabiles };
  const contados: ResultadoPlazo["contados"] = [];
  const salteados: DiaSalteado[] = [];
  let cursor = entrada.notificacion;
  while (contados.length < entrada.dias) {
    cursor = addDays(cursor, 1);
    if (cursor > CALENDARIO_HASTA) {
      return { ...base, error: `El plazo llega más allá del ${fechaCorta(CALENDARIO_HASTA)} de 2027, que es donde termina el calendario cargado. Acortá el plazo o elegí una fecha anterior.` };
    }
    const inhabil = esInhabil(cursor, opts);
    if (inhabil) salteados.push({ ...inhabil, quitable: inhabil.tipo !== "fin-de-semana" });
    else contados.push({ n: contados.length + 1, fecha: cursor });
  }
  const vencimiento = cursor;
  let gracia = addDays(vencimiento, 1);
  while (esInhabil(gracia, opts)) {
    gracia = addDays(gracia, 1);
    if (gracia > CALENDARIO_HASTA) break;
  }

  const avisos: string[] = [];
  const notifInhabil = esInhabil(entrada.notificacion, opts);
  if (notifInhabil) avisos.push(`La fecha de notificación cae en un día inhábil (${notifInhabil.motivo.toLowerCase()}). Verificá la fecha en que la notificación quedó perfeccionada: el plazo se cuenta desde esa fecha.`);
  for (const aviso of AVISOS_PENDIENTES) {
    if (entrada.notificacion <= aviso.hasta && vencimiento >= aviso.desde) avisos.push(aviso.texto);
  }
  for (const dudoso of DIAS_A_CONFIRMAR) {
    if (dudoso.fecha > entrada.notificacion && dudoso.fecha <= vencimiento) {
      const cuenta = entrada.confirmadosInhabiles?.includes(dudoso.fecha) ? "lo salteamos como inhábil porque así lo marcaste" : "lo contamos como hábil";
      avisos.push(`${fechaCorta(dudoso.fecha)}: ${dudoso.motivo}. ${cuenta}; confirmalo en tu tribunal.`);
    }
  }

  return { ok: true, vencimiento, graciaHasta: gracia <= CALENDARIO_HASTA ? gracia : undefined, contados, salteados, grupos: agruparSalteados(salteados), avisos };
}

/** Une días consecutivos con el mismo motivo (ferias) y junta todos los fines de semana en un solo grupo. */
export function agruparSalteados(salteados: readonly DiaSalteado[]): GrupoSalteado[] {
  const grupos: GrupoSalteado[] = [];
  const finde = salteados.filter((d) => d.tipo === "fin-de-semana");
  const otros = salteados.filter((d) => d.tipo !== "fin-de-semana");
  for (const dia of otros) {
    const ultimo = grupos[grupos.length - 1];
    const esFeria = dia.tipo === "feria";
    if (ultimo && ultimo.grupo === dia.grupo && ultimo.tipo === dia.tipo && (esFeria || (ultimo.motivo === dia.motivo && addDays(ultimo.hasta, 1) === dia.fecha))) {
      ultimo.hasta = dia.fecha;
      ultimo.fechas.push(dia.fecha);
    } else {
      grupos.push({ grupo: dia.grupo, tipo: dia.tipo, motivo: dia.motivo, desde: dia.fecha, hasta: dia.fecha, fechas: [dia.fecha], quitable: dia.quitable });
    }
  }
  // Una feria se muestra con su rango oficial completo; "fechas" son los días hábiles que saltea.
  for (const grupo of grupos) {
    if (grupo.tipo !== "feria") continue;
    const oficial = FERIAS.find((f) => `feria:${f.desde}` === grupo.grupo);
    if (oficial) {
      grupo.desde = oficial.desde;
      grupo.hasta = oficial.hasta;
    }
  }
  if (finde.length) {
    grupos.push({ grupo: "finde", tipo: "fin-de-semana", motivo: `Sábados y domingos (${finde.length} ${finde.length === 1 ? "día" : "días"})`, desde: finde[0].fecha, hasta: finde[finde.length - 1].fecha, fechas: finde.map((d) => d.fecha), quitable: false });
  }
  return grupos.sort((a, b) => (a.tipo === "fin-de-semana" ? 1 : 0) - (b.tipo === "fin-de-semana" ? 1 : 0) || a.desde.localeCompare(b.desde));
}

/** Expande un rango agregado por el usuario a días sueltos (máx. 60 días para evitar cargas absurdas). */
export function expandirRango(desde: Iso, hasta: Iso, maxDias = 60): Iso[] | null {
  if (!isoValida(desde) || !isoValida(hasta) || hasta < desde) return null;
  const dias = rango(desde, hasta);
  return dias.length > maxDias ? null : dias;
}
