/**
 * Coeficiente unificado del Convenio Multilateral, régimen general (art. 2 CM).
 *
 *   coeficiente(j) = 50% × gastos(j) / Σ gastos  +  50% × ingresos(j) / Σ ingresos
 *
 * Toda la aritmética es exacta (BigInt, centavos) y el redondeo a 4 decimales es
 * "en exceso o en defecto" (mitad hacia arriba), como fija la RG CA 46/1993.
 * Fuentes en src/content/tools.ts.
 */

export interface Jurisdiccion {
  id: string;
  nombre: string;
}

/** Las 24 jurisdicciones adheridas: 23 provincias y la Ciudad Autónoma de Buenos Aires. */
export const JURISDICCIONES: readonly Jurisdiccion[] = [
  { id: "caba", nombre: "Ciudad Autónoma de Buenos Aires" },
  { id: "bsas", nombre: "Buenos Aires" },
  { id: "catamarca", nombre: "Catamarca" },
  { id: "chaco", nombre: "Chaco" },
  { id: "chubut", nombre: "Chubut" },
  { id: "cordoba", nombre: "Córdoba" },
  { id: "corrientes", nombre: "Corrientes" },
  { id: "entre-rios", nombre: "Entre Ríos" },
  { id: "formosa", nombre: "Formosa" },
  { id: "jujuy", nombre: "Jujuy" },
  { id: "la-pampa", nombre: "La Pampa" },
  { id: "la-rioja", nombre: "La Rioja" },
  { id: "mendoza", nombre: "Mendoza" },
  { id: "misiones", nombre: "Misiones" },
  { id: "neuquen", nombre: "Neuquén" },
  { id: "rio-negro", nombre: "Río Negro" },
  { id: "salta", nombre: "Salta" },
  { id: "san-juan", nombre: "San Juan" },
  { id: "san-luis", nombre: "San Luis" },
  { id: "santa-cruz", nombre: "Santa Cruz" },
  { id: "santa-fe", nombre: "Santa Fe" },
  { id: "santiago-del-estero", nombre: "Santiago del Estero" },
  { id: "tierra-del-fuego", nombre: "Tierra del Fuego" },
  { id: "tucuman", nombre: "Tucumán" },
];

/** Entrada cruda de una fila: lo que el usuario tipeó. */
export interface FilaEntrada {
  id: string;
  ingresos: string;
  gastos: string;
}

export type CampoFila = "ingresos" | "gastos";

export interface ErrorFila {
  id: string;
  campo: CampoFila;
  mensaje: string;
}

export interface FilaResultado {
  id: string;
  nombre: string;
  /** Centavos, o null si la fila está vacía. */
  ingresosCents: bigint | null;
  gastosCents: bigint | null;
  /** Proporciones exactas en diezmilésimos (para mostrar los dos componentes). */
  porcentajeIngresos: number;
  porcentajeGastos: number;
  /** Coeficiente redondeado, en unidades de 0,0001 (1234 = 0,1234). */
  unidades: number;
}

export interface ResultadoCoeficientes {
  estado: "vacio" | "error" | "ok";
  errores: ErrorFila[];
  /** Mensajes generales (p. ej. "falta cargar gastos"). */
  avisos: string[];
  filas: FilaResultado[];
  totalIngresosCents: bigint;
  totalGastosCents: bigint;
  /** Suma de los coeficientes redondeados, en unidades de 0,0001. */
  sumaUnidades: number;
  /** 10000 - sumaUnidades. Distinto de cero cuando el redondeo no cierra en 1,0000. */
  diferenciaUnidades: number;
  cierraEnUno: boolean;
  /** Mismos coeficientes con la diferencia sumada a la jurisdicción de mayor coeficiente (práctica habitual, no norma). */
  ajustados: Record<string, number>;
  jurisdiccionAjustada: string | null;
}

/** Convierte "1.234.567,89" / "1234567.89" / "1,234.56" / "$ 50000" a centavos. null = vacío; NaN-like = inválido. */
export function parseMonto(raw: string): bigint | null | "invalido" {
  let text = raw.trim().replace(/\s+/g, "").replace(/^\$/, "").replace(/^ARS/i, "");
  if (text === "") return null;
  if (text.startsWith("-") || text.startsWith("+")) return "invalido";
  if (!/^[0-9.,]+$/.test(text)) return "invalido";
  const lastDot = text.lastIndexOf(".");
  const lastComma = text.lastIndexOf(",");
  let decimal = "";
  if (lastDot !== -1 && lastComma !== -1) {
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandsSep = decimalSep === "." ? "," : ".";
    if (text.split(decimalSep).length > 2) return "invalido";
    const [intPart, decPart] = text.split(decimalSep);
    if (!isGrouped(intPart, thousandsSep)) return "invalido";
    text = intPart.split(thousandsSep).join("");
    decimal = decPart;
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? "," : ".";
    const parts = text.split(sep);
    const looksGrouped = parts.length > 1 && parts[0].length >= 1 && parts[0].length <= 3 && parts.slice(1).every((p) => p.length === 3);
    if (sep === "." && looksGrouped) {
      text = parts.join("");
    } else if (parts.length === 2) {
      text = parts[0];
      decimal = parts[1];
    } else if (looksGrouped) {
      text = parts.join("");
    } else {
      return "invalido";
    }
  }
  if (!/^[0-9]*$/.test(text) || !/^[0-9]*$/.test(decimal)) return "invalido";
  if (text === "" && decimal === "") return "invalido";
  if (decimal.length > 2) {
    // Más de 2 decimales: redondeo a centavos (mitad hacia arriba).
    const head = BigInt((text || "0") + decimal.slice(0, 2));
    return decimal[2] >= "5" ? head + 1n : head;
  }
  return BigInt((text || "0") + decimal.padEnd(2, "0"));
}

function isGrouped(intPart: string, sep: string) {
  const parts = intPart.split(sep);
  if (parts.length === 1) return /^[0-9]+$/.test(intPart);
  return /^[0-9]{1,3}$/.test(parts[0]) && parts.slice(1).every((p) => /^[0-9]{3}$/.test(p));
}

/** Redondeo mitad hacia arriba de num/den a entero (num, den ≥ 0, den > 0). */
function roundDiv(num: bigint, den: bigint): bigint {
  return (2n * num + den) / (2n * den);
}

export function calcularCoeficientes(entradas: readonly FilaEntrada[]): ResultadoCoeficientes {
  const errores: ErrorFila[] = [];
  const avisos: string[] = [];
  const parsed = entradas.map((fila) => {
    const nombre = JURISDICCIONES.find((j) => j.id === fila.id)?.nombre ?? fila.id;
    const ingresos = parseMonto(fila.ingresos);
    const gastos = parseMonto(fila.gastos);
    if (ingresos === "invalido") errores.push({ id: fila.id, campo: "ingresos", mensaje: `${nombre}: ingresos no es un importe válido. Usá solo números positivos (ej. 1.250.000,50).` });
    if (gastos === "invalido") errores.push({ id: fila.id, campo: "gastos", mensaje: `${nombre}: gastos no es un importe válido. Usá solo números positivos (ej. 480.000).` });
    return {
      id: fila.id,
      nombre,
      ingresosCents: ingresos === "invalido" ? null : ingresos,
      gastosCents: gastos === "invalido" ? null : gastos,
    };
  });

  const vacio: ResultadoCoeficientes = {
    estado: "vacio",
    errores,
    avisos,
    filas: [],
    totalIngresosCents: 0n,
    totalGastosCents: 0n,
    sumaUnidades: 0,
    diferenciaUnidades: 0,
    cierraEnUno: false,
    ajustados: {},
    jurisdiccionAjustada: null,
  };

  if (errores.length) return { ...vacio, estado: "error" };

  const totalIngresos = parsed.reduce((acc, f) => acc + (f.ingresosCents ?? 0n), 0n);
  const totalGastos = parsed.reduce((acc, f) => acc + (f.gastosCents ?? 0n), 0n);
  if (totalIngresos === 0n && totalGastos === 0n) return vacio;
  if (totalIngresos === 0n) {
    avisos.push("Falta cargar ingresos: sin ingresos no se puede calcular la mitad de ingresos del coeficiente.");
    return { ...vacio, estado: "error", totalGastosCents: totalGastos };
  }
  if (totalGastos === 0n) {
    avisos.push("Falta cargar gastos computables: sin gastos no se puede calcular la mitad de gastos del coeficiente.");
    return { ...vacio, estado: "error", totalIngresosCents: totalIngresos };
  }

  const filas: FilaResultado[] = parsed
    .filter((f) => f.ingresosCents !== null || f.gastosCents !== null)
    .map((f) => {
      const ing = f.ingresosCents ?? 0n;
      const gas = f.gastosCents ?? 0n;
      // (gas/G + ing/I) / 2 = (gas*I + ing*G) / (2*G*I)
      const num = (gas * totalIngresos + ing * totalGastos) * 10000n;
      const den = 2n * totalGastos * totalIngresos;
      return {
        id: f.id,
        nombre: f.nombre,
        ingresosCents: f.ingresosCents,
        gastosCents: f.gastosCents,
        porcentajeIngresos: Number(roundDiv(ing * 1_000_000n, totalIngresos)) / 10000,
        porcentajeGastos: Number(roundDiv(gas * 1_000_000n, totalGastos)) / 10000,
        unidades: Number(roundDiv(num, den)),
      };
    });

  const suma = filas.reduce((acc, f) => acc + f.unidades, 0);
  const diferencia = 10000 - suma;
  const ajustados: Record<string, number> = {};
  for (const f of filas) ajustados[f.id] = f.unidades;
  let jurisdiccionAjustada: string | null = null;
  if (diferencia !== 0) {
    const mayor = [...filas].sort((a, b) => b.unidades - a.unidades)[0];
    ajustados[mayor.id] += diferencia;
    jurisdiccionAjustada = mayor.id;
  }
  return {
    estado: "ok",
    errores,
    avisos,
    filas,
    totalIngresosCents: totalIngresos,
    totalGastosCents: totalGastos,
    sumaUnidades: suma,
    diferenciaUnidades: diferencia,
    cierraEnUno: diferencia === 0,
    ajustados,
    jurisdiccionAjustada,
  };
}

/** 1234 -> "0,1234" */
export function formatearCoeficiente(unidades: number): string {
  const entero = Math.floor(unidades / 10000);
  const dec = String(unidades % 10000).padStart(4, "0");
  return `${entero},${dec}`;
}

/** Centavos -> "1.234.567,89" */
export function formatearCentavos(cents: bigint): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const entero = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dec = (abs % 100n).toString().padStart(2, "0");
  return `${negative ? "-" : ""}${entero},${dec}`;
}

/** CSV para Excel en español: separador ";", coma decimal, BOM UTF-8. */
export function coeficientesACsv(resultado: ResultadoCoeficientes, opciones: { ajustado?: boolean } = {}): string {
  const esc = (value: string) => (/[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const pct = (n: number) => n.toFixed(2).replace(".", ",");
  const lines: string[] = [["Jurisdicción", "Ingresos brutos (ARS)", "Gastos computables (ARS)", "% de ingresos", "% de gastos", opciones.ajustado ? "Coeficiente unificado (ajustado)" : "Coeficiente unificado"].map(esc).join(";")];
  for (const f of resultado.filas) {
    const unidades = opciones.ajustado ? resultado.ajustados[f.id] : f.unidades;
    lines.push([f.nombre, formatearCentavos(f.ingresosCents ?? 0n), formatearCentavos(f.gastosCents ?? 0n), pct(f.porcentajeIngresos), pct(f.porcentajeGastos), formatearCoeficiente(unidades)].map(esc).join(";"));
  }
  const suma = opciones.ajustado ? 10000 : resultado.sumaUnidades;
  lines.push(["Total", formatearCentavos(resultado.totalIngresosCents), formatearCentavos(resultado.totalGastosCents), "100,00", "100,00", formatearCoeficiente(suma)].map(esc).join(";"));
  lines.push("");
  lines.push(esc("Cálculo orientativo (art. 2 Convenio Multilateral, régimen general). Verificalo con tu contador antes de presentar la DDJJ. puna-tech.com/es/herramientas/coeficiente-convenio-multilateral"));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
