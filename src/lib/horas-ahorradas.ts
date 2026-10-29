/**
 * Calculadora de horas y dinero ahorrados al automatizar una tarea repetitiva.
 *
 * Supuestos (visibles en la página):
 *  - 1 semana = 52/12 semanas por mes (4,3333) y 1 mes de 21 días hábiles.
 *  - Horas ahorradas = tiempo actual × % automatizable.
 *  - Recupero (payback) = costo de implementación ÷ (ahorro mensual − costo mensual de mantenimiento).
 */

export type Frecuencia = "dia" | "semana" | "mes";

export const VECES_POR_MES: Record<Frecuencia, number> = {
  dia: 21,
  semana: 52 / 12,
  mes: 1,
};

export interface EntradaHoras {
  minutosPorTarea: number;
  /** Veces que cada persona hace la tarea por unidad de frecuencia. */
  veces: number;
  frecuencia: Frecuencia;
  personas: number;
  /** Costo por hora en pesos (sueldo + cargas, por hora trabajada). */
  costoHora: number;
  /** Porcentaje 1-100. */
  porcentajeAutomatizable: number;
  /** Costo único de implementación, opcional. */
  implementacion?: number;
  /** Costo mensual de mantenimiento o licencias, opcional. */
  mantenimientoMensual?: number;
}

export interface ResultadoHoras {
  ok: boolean;
  errores: string[];
  horasActualesMes: number;
  horasAhorradasMes: number;
  horasAhorradasAnio: number;
  ahorroMes: number;
  ahorroAnio: number;
  ahorroNetoMes: number;
  ahorroNetoAnio: number;
  /** Meses para recuperar la implementación; null si no se cargó implementación; Infinity si nunca se recupera. */
  paybackMeses: number | null;
  /** Días de trabajo (8 h) liberados por mes. */
  diasLiberadosMes: number;
}

const VACIO: ResultadoHoras = {
  ok: false,
  errores: [],
  horasActualesMes: 0,
  horasAhorradasMes: 0,
  horasAhorradasAnio: 0,
  ahorroMes: 0,
  ahorroAnio: 0,
  ahorroNetoMes: 0,
  ahorroNetoAnio: 0,
  paybackMeses: null,
  diasLiberadosMes: 0,
};

export function calcularAhorro(e: EntradaHoras): ResultadoHoras {
  const errores: string[] = [];
  const positivo = (valor: number, nombre: string) => {
    if (!Number.isFinite(valor) || valor <= 0) errores.push(`${nombre}: ingresá un número mayor que 0.`);
  };
  positivo(e.minutosPorTarea, "Minutos por tarea");
  positivo(e.veces, "Veces que se hace");
  positivo(e.personas, "Personas que la hacen");
  positivo(e.costoHora, "Costo por hora");
  if (!Number.isFinite(e.porcentajeAutomatizable) || e.porcentajeAutomatizable <= 0 || e.porcentajeAutomatizable > 100) errores.push("% automatizable: ingresá un número entre 1 y 100.");
  if (e.implementacion !== undefined && (!Number.isFinite(e.implementacion) || e.implementacion < 0)) errores.push("Costo de implementación: no puede ser negativo.");
  if (e.mantenimientoMensual !== undefined && (!Number.isFinite(e.mantenimientoMensual) || e.mantenimientoMensual < 0)) errores.push("Mantenimiento mensual: no puede ser negativo.");
  if (errores.length) return { ...VACIO, errores };

  const horasActualesMes = (e.minutosPorTarea / 60) * e.veces * VECES_POR_MES[e.frecuencia] * e.personas;
  const horasAhorradasMes = horasActualesMes * (e.porcentajeAutomatizable / 100);
  const ahorroMes = horasAhorradasMes * e.costoHora;
  const mantenimiento = e.mantenimientoMensual ?? 0;
  const ahorroNetoMes = ahorroMes - mantenimiento;
  let paybackMeses: number | null = null;
  if (e.implementacion !== undefined && e.implementacion > 0) paybackMeses = ahorroNetoMes > 0 ? e.implementacion / ahorroNetoMes : Infinity;
  return {
    ok: true,
    errores: [],
    horasActualesMes,
    horasAhorradasMes,
    horasAhorradasAnio: horasAhorradasMes * 12,
    ahorroMes,
    ahorroAnio: ahorroMes * 12,
    ahorroNetoMes,
    ahorroNetoAnio: ahorroNetoMes * 12,
    paybackMeses,
    diasLiberadosMes: horasAhorradasMes / 8,
  };
}

/** Número (positivo) escrito en formato argentino o inglés. NaN si vacío o inválido. */
export function parseNumero(raw: string): number {
  const text = raw.trim().replace(/\s+/g, "").replace(/^\$/, "");
  if (!text || !/^[0-9.,]+$/.test(text)) return NaN;
  const lastDot = text.lastIndexOf(".");
  const lastComma = text.lastIndexOf(",");
  let normalized: string;
  if (lastDot !== -1 && lastComma !== -1) {
    normalized = lastDot > lastComma ? text.replace(/,/g, "") : text.replace(/\./g, "").replace(",", ".");
  } else if (lastComma !== -1) {
    normalized = text.split(",").length > 2 ? text.replace(/,/g, "") : text.replace(",", ".");
  } else if (lastDot !== -1) {
    const parts = text.split(".");
    normalized = parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3 && parts[0] !== "0") ? text.replace(/\./g, "") : text;
  } else {
    normalized = text;
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}
