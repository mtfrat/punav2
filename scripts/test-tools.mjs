import assert from "node:assert/strict";
import {
  JURISDICCIONES,
  calcularCoeficientes,
  coeficientesACsv,
  formatearCentavos,
  formatearCoeficiente,
  parseMonto,
} from "../src/lib/convenio-multilateral.ts";
import {
  AVISOS_PENDIENTES,
  addDays,
  calcularVencimiento,
  diaSemana,
  esInhabil,
  expandirRango,
  feriadosLey27399,
  fechaLarga,
  isoValida,
  listaFeriados,
  pascua,
} from "../src/lib/plazos-procesales.ts";
import { calcularAhorro, parseNumero } from "../src/lib/horas-ahorradas.ts";
import { toolDefinitions, toolHub, toolPath } from "../src/content/tools.ts";
import { rubroPath } from "../src/content/rubros.ts";
import { existsSync } from "node:fs";

// ------------------------------------------------------------------ Convenio Multilateral
assert.equal(JURISDICCIONES.length, 24, "23 provincias + CABA");
assert.equal(new Set(JURISDICCIONES.map((j) => j.id)).size, 24);

assert.equal(parseMonto("1.250.000,50"), 125000050n);
assert.equal(parseMonto("1250000.5"), 125000050n);
assert.equal(parseMonto("1,250,000.50"), 125000050n);
assert.equal(parseMonto("$ 480.000"), 48000000n);
assert.equal(parseMonto("1.250"), 125000n, "un punto con tres dígitos es separador de miles");
assert.equal(parseMonto("0,5"), 50n);
assert.equal(parseMonto(""), null);
assert.equal(parseMonto("  "), null);
assert.equal(parseMonto("-5"), "invalido");
assert.equal(parseMonto("12a"), "invalido");
assert.equal(parseMonto("1.2.3"), "invalido");
assert.equal(formatearCentavos(125000050n), "1.250.000,50");
assert.equal(formatearCoeficiente(5025), "0,5025");
assert.equal(formatearCoeficiente(10000), "1,0000");
assert.equal(formatearCoeficiente(7), "0,0007");

const fila = (id, ingresos, gastos) => ({ id, ingresos, gastos });
const vacias = () => JURISDICCIONES.map((j) => fila(j.id, "", ""));
const conDatos = (datos) => vacias().map((f) => (datos[f.id] ? { ...f, ingresos: datos[f.id][0], gastos: datos[f.id][1] } : f));

// Caso a mano 1: ingresos 6.000/3.000/1.000, gastos 2.000/4.000/4.000 -> total 10.000 y 10.000.
//   CABA = (0,60 + 0,20) / 2 = 0,4000 ; BsAs = (0,30 + 0,40) / 2 = 0,3500 ; Córdoba = (0,10 + 0,40) / 2 = 0,2500
{
  const r = calcularCoeficientes(conDatos({ caba: ["6000", "2000"], bsas: ["3000", "4000"], cordoba: ["1000", "4000"] }));
  assert.equal(r.estado, "ok");
  const u = Object.fromEntries(r.filas.map((f) => [f.id, f.unidades]));
  assert.deepEqual(u, { caba: 4000, bsas: 3500, cordoba: 2500 });
  assert.equal(r.sumaUnidades, 10000);
  assert.equal(r.cierraEnUno, true);
  assert.equal(r.diferenciaUnidades, 0);
  assert.equal(r.jurisdiccionAjustada, null);
}
// Caso a mano 2 (el del prefill de la página): ingresos 50.250.000 / 30.000.000 / 19.750.000, gastos iguales a los ingresos
//   cada coeficiente = proporción -> 0,5025 / 0,3000 / 0,1975.
{
  const r = calcularCoeficientes(conDatos({ caba: ["50250000", "50250000"], bsas: ["30000000", "30000000"], mendoza: ["19750000", "19750000"] }));
  assert.equal(r.estado, "ok");
  const u = Object.fromEntries(r.filas.map((f) => [f.id, f.unidades]));
  assert.deepEqual(u, { caba: 5025, bsas: 3000, mendoza: 1975 });
  assert.equal(r.sumaUnidades, 10000);
}
// Caso a mano 2b (el que carga la página como muestra): ingresos 182,4 / 96,3 / 71,8 / 54,9 / 24,6 M (total 430 M) y
//   gastos 61,2 / 48,7 / 29,5 / 18,4 / 9,8 M (total 167,6 M). CABA = (182,4/430 + 61,2/167,6)/2 = 0,39467 -> 0,3947, etc.
{
  const r = calcularCoeficientes(conDatos({
    caba: ["182.400.000", "61.200.000"], bsas: ["96.300.000", "48.700.000"], cordoba: ["71.800.000", "29.500.000"],
    "santa-fe": ["54.900.000", "18.400.000"], mendoza: ["24.600.000", "9.800.000"],
  }));
  assert.equal(r.estado, "ok");
  const u = Object.fromEntries(r.filas.map((f) => [f.id, f.unidades]));
  assert.deepEqual(u, { caba: 3947, bsas: 2573, cordoba: 1715, "santa-fe": 1187, mendoza: 578 });
  assert.equal(r.sumaUnidades, 10000);
  assert.equal(r.cierraEnUno, true);
}
// Redondeo: tres jurisdicciones iguales -> 0,3333 x 3 = 0,9999 (diferencia +1 diezmilésimo), el ajuste va a la primera de mayor coeficiente.
{
  const r = calcularCoeficientes(conDatos({ caba: ["100", "100"], bsas: ["100", "100"], cordoba: ["100", "100"] }));
  assert.deepEqual(r.filas.map((f) => f.unidades), [3333, 3333, 3333]);
  assert.equal(r.sumaUnidades, 9999);
  assert.equal(r.diferenciaUnidades, 1);
  assert.equal(r.cierraEnUno, false);
  assert.equal(Object.values(r.ajustados).reduce((a, b) => a + b, 0), 10000);
  assert.ok(r.jurisdiccionAjustada);
}
// Redondeo mitad hacia arriba: 1/8 = 0,125 -> con 2 jurisdicciones 0,5 y 0,5 no; probamos 1 de 16 = 0,0625 y 15 de 16 = 0,9375 (exactos)
{
  const r = calcularCoeficientes(conDatos({ caba: ["1", "1"], bsas: ["15", "15"] }));
  assert.deepEqual(r.filas.map((f) => f.unidades), [625, 9375]);
  // 1/32 = 0,03125 -> 0,0313 (mitad hacia arriba) y 31/32 = 0,96875 -> 0,9688
  const r2 = calcularCoeficientes(conDatos({ caba: ["1", "1"], bsas: ["31", "31"] }));
  assert.deepEqual(r2.filas.map((f) => f.unidades), [313, 9688]);
  assert.equal(r2.sumaUnidades, 10001);
  assert.equal(r2.diferenciaUnidades, -1);
}
// Gastos distintos de ingresos y jurisdicción con un solo dato
{
  const r = calcularCoeficientes(conDatos({ caba: ["1000", "0"], bsas: ["0", "500"] }));
  const u = Object.fromEntries(r.filas.map((f) => [f.id, f.unidades]));
  assert.deepEqual(u, { caba: 5000, bsas: 5000 });
}
// Estados vacío y error
assert.equal(calcularCoeficientes(vacias()).estado, "vacio");
{
  const r = calcularCoeficientes(conDatos({ caba: ["abc", "1"] }));
  assert.equal(r.estado, "error");
  assert.equal(r.errores[0].id, "caba");
  assert.equal(r.errores[0].campo, "ingresos");
  const sinGastos = calcularCoeficientes(conDatos({ caba: ["1000", ""] }));
  assert.equal(sinGastos.estado, "error");
  assert.ok(sinGastos.avisos[0].includes("gastos"));
  const sinIngresos = calcularCoeficientes(conDatos({ caba: ["", "1000"] }));
  assert.equal(sinIngresos.estado, "error");
}
// Enteros grandes sin pérdida de precisión
{
  const r = calcularCoeficientes(conDatos({ caba: ["123456789012345678,99", "1"], bsas: ["1", "123456789012345678"] }));
  assert.equal(r.estado, "ok");
  assert.equal(r.sumaUnidades, 10000);
}
// CSV
{
  const r = calcularCoeficientes(conDatos({ caba: ["6000", "2000"], bsas: ["3000", "4000"], cordoba: ["1000", "4000"] }));
  const csv = coeficientesACsv(r);
  assert.ok(csv.startsWith("\uFEFFJurisdicción;Ingresos brutos (ARS);Gastos computables (ARS);% de ingresos;% de gastos;Coeficiente unificado"));
  assert.ok(csv.includes("Ciudad Autónoma de Buenos Aires;6.000,00;2.000,00;60,00;20,00;0,4000"));
  assert.ok(csv.includes("Total;10.000,00;10.000,00;100,00;100,00;1,0000"));
}

// ------------------------------------------------------------------ Plazos procesales
assert.equal(pascua(2026), "2026-04-05");
assert.equal(pascua(2027), "2027-03-28");
assert.equal(isoValida("2026-02-29"), false);
assert.equal(isoValida("2028-02-29"), true);
assert.equal(diaSemana("2026-03-19"), 4, "jueves");
assert.equal(addDays("2026-12-31", 1), "2027-01-01");
assert.equal(fechaLarga("2026-03-30"), "lunes 30 de marzo de 2026");

// Feriados por ley: traslados
const f26 = Object.fromEntries(feriadosLey27399(2026).map((e) => [e.fecha, e.motivo]));
assert.ok(f26["2026-02-16"] && f26["2026-02-17"], "Carnaval 2026");
assert.ok(f26["2026-04-03"], "Viernes Santo 2026");
assert.ok(f26["2026-04-02"], "2 de abril 2026");
assert.ok(f26["2026-06-15"], "Güemes (miércoles 17) pasa al lunes 15");
assert.ok(!f26["2026-06-17"]);
assert.ok(f26["2026-06-20"], "Belgrano es inamovible (sábado)");
assert.ok(f26["2026-08-17"] && f26["2026-10-12"]);
assert.ok(f26["2026-11-23"], "Soberanía Nacional (viernes 20) pasa al lunes 23");
const f27 = Object.fromEntries(feriadosLey27399(2027).map((e) => [e.fecha, e.motivo]));
assert.ok(f27["2027-02-08"] && f27["2027-02-09"], "Carnaval 2027");
assert.ok(f27["2027-03-26"], "Viernes Santo 2027");
assert.ok(f27["2027-06-21"], "Güemes (jueves 17) pasa al lunes 21");
assert.ok(f27["2027-08-16"], "San Martín (martes 17) pasa al lunes 16");
assert.ok(f27["2027-10-11"], "Diversidad Cultural (martes 12) pasa al lunes 11");
assert.ok(f27["2027-11-20"], "Soberanía 2027 cae sábado y no se mueve sola");
assert.equal(listaFeriados(2026).length > 15, true);

// Inhábiles
assert.equal(esInhabil("2026-03-21")?.tipo, "fin-de-semana");
assert.equal(esInhabil("2026-01-15")?.tipo, "feria");
assert.equal(esInhabil("2026-01-01")?.tipo, "feria", "1 de enero se muestra dentro de la feria");
assert.equal(esInhabil("2026-07-24")?.tipo, "feria");
assert.equal(esInhabil("2026-07-19")?.tipo, "fin-de-semana");
assert.equal(esInhabil("2026-07-17"), null, "viernes antes de la feria");
assert.equal(esInhabil("2026-08-03"), null, "primer día hábil luego de la feria");
assert.equal(esInhabil("2026-04-02")?.tipo, "feriado", "2 de abril gana sobre Jueves Santo");
assert.equal(esInhabil("2026-10-20")?.tipo, "inhabil-judicial");
assert.equal(esInhabil("2026-11-16"), null, "día a confirmar: por defecto hábil");
assert.equal(esInhabil("2026-11-16", { confirmadosInhabiles: ["2026-11-16"] })?.tipo, "a-confirmar");
assert.equal(esInhabil("2026-11-10", { habilitados: ["2026-11-10"] }), null);
assert.equal(esInhabil("2026-03-21", { habilitados: ["2026-03-21"] })?.tipo, "fin-de-semana", "un sábado nunca se habilita");

const venc = (notificacion, dias, extra = {}) => calcularVencimiento({ notificacion, dias, ...extra });

// 1. Fin de semana + día turístico + feriado: jueves 19/3/2026 + 5 -> 20(1) 25(2) 26(3) 27(4) 30(5)
{
  const r = venc("2026-03-19", 5);
  assert.equal(r.ok, true);
  assert.equal(r.vencimiento, "2026-03-30");
  assert.deepEqual(r.contados.map((c) => c.fecha), ["2026-03-20", "2026-03-25", "2026-03-26", "2026-03-27", "2026-03-30"]);
  assert.deepEqual(r.salteados.map((s) => s.fecha), ["2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24", "2026-03-28", "2026-03-29"]);
  assert.equal(r.graciaHasta, "2026-03-31", "plazo de gracia: primeras horas del martes 31");
  assert.ok(r.grupos.some((g) => g.tipo === "fin-de-semana"));
}
// 2. Feria de enero: lunes 28/12/2026 + 5 -> 29(1) 30(2) 31(3), feria todo enero, 1/2(4) 2/2(5)
{
  const r = venc("2026-12-28", 5);
  assert.equal(r.vencimiento, "2027-02-02");
  const feria = r.grupos.find((g) => g.tipo === "feria");
  assert.equal(feria.desde, "2027-01-01");
  assert.equal(feria.hasta, "2027-01-31", "se muestra el rango oficial completo");
  assert.equal(feria.fechas.length, 21, "días de lunes a viernes de enero 2027 que saltea");
}
// 3. Feria de invierno 2026 (20 al 31 de julio): viernes 17/7 + 3 -> 3/8(1) 4/8(2) 5/8(3)
{
  const r = venc("2026-07-17", 3);
  assert.equal(r.vencimiento, "2026-08-05");
  const feria = r.grupos.find((g) => g.tipo === "feria");
  assert.equal(feria.desde, "2026-07-20");
  assert.equal(feria.hasta, "2026-07-31");
}
// 4. Feriado + día puente consecutivos: miércoles 8/7/2026 + 2 -> 9/7 feriado, 10/7 no laborable, finde, 13/7(1) 14/7(2)
{
  const r = venc("2026-07-08", 2);
  assert.equal(r.vencimiento, "2026-07-14");
  assert.deepEqual(r.salteados.filter((s) => s.tipo !== "fin-de-semana").map((s) => s.fecha), ["2026-07-09", "2026-07-10"]);
}
// 5. Carnaval: jueves 12/2/2026 + 3 -> 13(1) 18(2) 19(3)
assert.equal(venc("2026-02-12", 3).vencimiento, "2026-02-19");
// 6. Semana Santa y 2 de abril: lunes 30/3/2026 + 4 -> 31/3(1) 1/4(2) [2/4 y 3/4 inhábiles] 6/4(3) 7/4(4)
assert.equal(venc("2026-03-30", 4).vencimiento, "2026-04-07");
// 7. Visita del Papa (9 y 10 de noviembre de 2026): jueves 5/11 + 3 -> 6/11(1) 11/11(2) 12/11(3); con el 10/11 habilitado -> 10/11(2) 11/11(3)
assert.equal(venc("2026-11-05", 3).vencimiento, "2026-11-12");
assert.equal(venc("2026-11-05", 3, { habilitados: ["2026-11-10"] }).vencimiento, "2026-11-11");
// 8. Acordada CSJN 26/2026: viernes 16/10 + 2 -> 19/10(1) [20/10 inhábil] 21/10(2)
assert.equal(venc("2026-10-16", 2).vencimiento, "2026-10-21");
// 9. Día extra agregado por el usuario: caso 1 con el 26/3 inhábil -> 25(2) 27(3) 30(4) 31(5)
{
  const r = venc("2026-03-19", 5, { extras: [{ fecha: "2026-03-26", motivo: "Cierre del tribunal" }] });
  assert.equal(r.vencimiento, "2026-03-31");
  assert.ok(r.salteados.some((s) => s.fecha === "2026-03-26" && s.tipo === "extra" && s.motivo === "Cierre del tribunal"));
}
// 10. Plazo de gracia cuando vence un viernes: jueves 12/3/2026 + 1 -> viernes 13/3; gracia el lunes 16/3
{
  const r = venc("2026-03-12", 1);
  assert.equal(r.vencimiento, "2026-03-13");
  assert.equal(r.graciaHasta, "2026-03-16");
}
// 11. Notificación en sábado: aviso y cuenta desde el lunes
{
  const r = venc("2026-03-14", 1);
  assert.equal(r.vencimiento, "2026-03-16");
  assert.ok(r.avisos.some((a) => a.includes("inhábil")));
}
// 12. Día a confirmar (16/11): hábil por defecto, inhábil si el usuario lo decide
{
  const base = venc("2026-11-12", 2);
  assert.equal(base.vencimiento, "2026-11-16");
  assert.ok(base.avisos.some((a) => a.includes("Trabajador Judicial")));
  assert.equal(venc("2026-11-12", 2, { confirmadosInhabiles: ["2026-11-16"] }).vencimiento, "2026-11-17");
}
// 13. Avisos de lo que todavía no se publicó
assert.ok(AVISOS_PENDIENTES.length >= 3);
assert.ok(venc("2027-07-14", 3).avisos.some((a) => a.includes("feria judicial de invierno 2027")));
assert.ok(venc("2027-03-01", 3).avisos.some((a) => a.includes("no laborables con fines turísticos de 2027")));
// 14. Errores
assert.equal(venc("2026-02-30", 3).ok, false);
assert.equal(venc("2026-03-19", 0).ok, false);
assert.equal(venc("2026-03-19", 2.5).ok, false);
assert.equal(venc("2026-03-19", 400).ok, false);
assert.equal(venc("2025-12-30", 3).ok, false, "antes del calendario");
assert.equal(venc("2028-01-03", 3).ok, false, "después del calendario");
assert.equal(venc("2027-12-28", 10).ok, false, "el plazo se sale del calendario");
// 15. 2027 con las reglas de ley: viernes 11/6/2027 + 3 -> 14/6(1) 15/6(2) 16/6(3) (17/6 jueves no es feriado: pasa al lunes 21)
assert.equal(venc("2027-06-11", 3).vencimiento, "2027-06-16");
assert.equal(venc("2027-06-16", 2).vencimiento, "2027-06-18", "17/6/2027 es hábil: pasó al lunes 21");
assert.equal(venc("2027-06-18", 1).vencimiento, "2027-06-22", "21/6/2027 feriado trasladado");
// 16. Rango de días extra
assert.deepEqual(expandirRango("2026-05-04", "2026-05-06"), ["2026-05-04", "2026-05-05", "2026-05-06"]);
assert.equal(expandirRango("2026-05-06", "2026-05-04"), null);
assert.equal(expandirRango("2026-01-01", "2026-12-31"), null);

// ------------------------------------------------------------------ Horas ahorradas
// 15 min x 5 por día x 3 personas = 15/60 x 5 x 21 x 3 = 78,75 h/mes; 60% -> 47,25 h; x $8.000 = $378.000/mes; $2.400.000 / 378.000 = 6,349 meses
{
  const r = calcularAhorro({ minutosPorTarea: 15, veces: 5, frecuencia: "dia", personas: 3, costoHora: 8000, porcentajeAutomatizable: 60, implementacion: 2400000 });
  assert.equal(r.ok, true);
  assert.ok(Math.abs(r.horasActualesMes - 78.75) < 1e-9);
  assert.ok(Math.abs(r.horasAhorradasMes - 47.25) < 1e-9);
  assert.ok(Math.abs(r.ahorroMes - 378000) < 1e-6);
  assert.ok(Math.abs(r.ahorroAnio - 4536000) < 1e-6);
  assert.ok(Math.abs(r.paybackMeses - 2400000 / 378000) < 1e-9);
  assert.ok(Math.abs(r.horasAhorradasAnio - 567) < 1e-9);
}
// Semanal: 30 min x 2 por semana x 1 persona, 100% -> 1 h x (52/12) = 4,3333 h/mes
{
  const r = calcularAhorro({ minutosPorTarea: 30, veces: 2, frecuencia: "semana", personas: 1, costoHora: 6000, porcentajeAutomatizable: 100 });
  assert.ok(Math.abs(r.horasAhorradasMes - 52 / 12) < 1e-9);
  assert.equal(r.paybackMeses, null);
}
// Mensual con mantenimiento que se come el ahorro: nunca se recupera
{
  const r = calcularAhorro({ minutosPorTarea: 60, veces: 1, frecuencia: "mes", personas: 1, costoHora: 5000, porcentajeAutomatizable: 50, implementacion: 100000, mantenimientoMensual: 3000 });
  assert.equal(r.ahorroMes, 2500);
  assert.equal(r.ahorroNetoMes, -500);
  assert.equal(r.paybackMeses, Infinity);
}
{
  const r = calcularAhorro({ minutosPorTarea: 0, veces: 1, frecuencia: "mes", personas: 1, costoHora: 5000, porcentajeAutomatizable: 120 });
  assert.equal(r.ok, false);
  assert.equal(r.errores.length, 2);
}
assert.equal(parseNumero("8.000"), 8000);
assert.equal(parseNumero("8000,50"), 8000.5);
assert.equal(parseNumero("2.400.000"), 2400000);
assert.equal(parseNumero("1,5"), 1.5);
assert.equal(parseNumero("0.5"), 0.5);
assert.ok(Number.isNaN(parseNumero("")));
assert.ok(Number.isNaN(parseNumero("abc")));

// ------------------------------------------------------------------ Contenido de las herramientas (SEO)
assert.equal(toolDefinitions.length, 3);
const slugs = toolDefinitions.map((t) => t.slug);
assert.deepEqual(slugs, ["coeficiente-convenio-multilateral", "plazos-procesales", "calculadora-horas-ahorradas"]);
const BRAND = " | Puna Tech";
for (const tool of [...toolDefinitions, toolHub]) {
  assert.ok(tool.title.endsWith(BRAND), `${tool.slug ?? "hub"}: title suffix`);
  assert.ok(tool.title.length >= 45 && tool.title.length <= 60, `${tool.slug ?? "hub"}: title length ${tool.title.length}`);
  assert.ok(tool.description.length >= 100 && tool.description.length <= 155, `${tool.slug ?? "hub"}: description length ${tool.description.length}`);
  assert.ok(!/[—–]/.test(`${tool.title} ${tool.description}`), `${tool.slug ?? "hub"}: no dashes in SERP copy`);
  assert.ok(existsSync(new URL(`../public${tool.ogImage}`, import.meta.url)), `${tool.ogImage} must exist`);
}
for (const tool of toolDefinitions) {
  assert.ok(tool.faqs.length >= 3 && tool.faqs.length <= 5, `${tool.slug}: 3 to 5 FAQs`);
  if (tool.slug !== "calculadora-horas-ahorradas") assert.ok(tool.sources.length >= 1, `${tool.slug}: sources`);
  for (const source of tool.sources) assert.ok(/^https:\/\//.test(source.href), `${tool.slug}: source link ${source.href}`);
  assert.ok(tool.disclaimer.length > 40);
  assert.ok(tool.cta.href.startsWith("/es/demos"), `${tool.slug}: CTA goes to the demos`);
  assert.equal(toolPath(tool.slug), `/es/herramientas/${tool.slug}`);
}
assert.equal(toolDefinitions[0].cta.href, rubroPath("es", "estudios-contables"));
assert.equal(toolDefinitions[1].cta.href, rubroPath("es", "estudios-juridicos"));
assert.equal(toolDefinitions[2].cta.href, "/es/demos");

console.log("tools tests passed");
