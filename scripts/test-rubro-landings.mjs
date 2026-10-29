import assert from "node:assert/strict";
import { useCaseHubs, useCases } from "../src/content/use-cases.ts";
import { demoDefinitions, demoPath, demosHubPath } from "../src/content/demos.ts";
import { rubroDefinitions, rubroPath } from "../src/content/rubros.ts";
import { toolDefinitions, toolPath } from "../src/content/tools.ts";

// Content guards for the long-tail rubro landings (briefs of 2026-10-29).
const SLUGS = [
  "convenio-multilateral-coeficientes",
  "conciliacion-sifere-retenciones-percepciones",
  "control-de-expedientes-estudio-juridico",
  "control-de-honorarios-estudio-juridico",
  "cartera-de-polizas-y-renovaciones",
  "matricula-productor-asesor-de-seguros",
];
const pages = SLUGS.map((slug) => {
  const page = useCases.find((item) => item.path === `/es/automatizaciones/${slug}`);
  assert.ok(page, `missing use case ${slug}`);
  return page;
});
const hub = useCaseHubs.find((item) => item.section === "automatizaciones");
assert.ok(hub, "automatizaciones hub missing");

// Every internal link must land on a page that exists.
const blogPosts = [
  "/es/blog/automatizar-ddjj-convenio-multilateral-sifere",
  "/es/blog/conciliar-retenciones-percepciones-iibb-sin-excel",
  "/es/blog/controlar-vencimientos-procesales-estudio-juridico",
  "/es/blog/automatizar-renovaciones-cobranzas-productor-seguros",
];
const known = new Set([
  "/es/contacto",
  "/es/servicios/software-a-medida",
  "/es/servicios/automatizacion-ia",
  "/es/servicios/integraciones-de-datos",
  demosHubPath("es"),
  ...blogPosts,
  ...useCases.map((item) => item.path),
  ...useCaseHubs.map((item) => item.path),
  ...demoDefinitions.map((demo) => demoPath("es", demo.slug.es)),
  ...rubroDefinitions.map((rubro) => rubroPath("es", rubro.slug.es)),
  ...toolDefinitions.map((tool) => toolPath(tool.slug)),
]);

const text = (page) => JSON.stringify(page);
const prose = (page) => [
  page.title, page.lead, page.metaTitle, page.metaDescription, page.cardBlurb, page.example,
  ...page.before, ...page.after, ...page.fit,
  ...(page.sections ?? []).flatMap((s) => [s.heading, ...s.paragraphs, ...(s.items ?? [])]),
  ...page.how.flatMap((h) => [h.title, h.body]),
  ...page.faqs.flat(),
  page.demoLinks?.body ?? "", page.disclaimer ?? "",
].join("\n");

const OFFICIAL_SOURCES = /^https:\/\/(www\.ca\.gob\.ar|webs\.comarb\.gob\.ar|servicios\.infoleg\.gob\.ar|www\.argentina\.gob\.ar|servicios\.pjn\.gov\.ar|www\.csjn\.gov\.ar)\//;

for (const page of pages) {
  const body = prose(page);
  const raw = text(page);
  assert.equal(page.section, "automatizaciones");
  assert.ok(page.faqs.length >= 5 && page.faqs.length <= 7, `${page.key}: 5-7 FAQs`);
  assert.ok(page.sections?.length >= 3, `${page.key}: needs the brief's H2 sections`);
  assert.ok(page.demoLinks?.links.length, `${page.key}: demo links block`);
  assert.ok(page.relatedPosts.length >= 1, `${page.key}: related blog posts`);
  assert.equal(page.reviewedAt === undefined, !page.sources?.length, `${page.key}: reviewedAt only with sources`);

  // Links: internal paths exist, every page links its rubro demo hub and /es/contacto is reachable via the CTA (rendered by the route).
  const paths = [...raw.matchAll(/\]\((\/es\/[^)#?]*)\)/g)].map((m) => m[1]);
  paths.push(...page.demoLinks.links.map((l) => l.path), ...(page.relatedLinks ?? []).map((l) => l.path), ...page.relatedPosts.map((p) => p.path), page.relatedService.path);
  for (const path of paths) assert.ok(known.has(path), `${page.key}: broken internal link ${path}`);
  assert.ok(paths.some((path) => path.startsWith("/es/demos")), `${page.key}: must link a demo`);

  // Rule 3 and money: no amounts of any kind (SSN matrícula changes yearly).
  assert.ok(!/\$\s?\d|\d\s?(ARS|USD|pesos)\b|33\.?000|132\.?000/i.test(body), `${page.key}: no amounts`);
  // Rule 4: fictitious-name guardrails and honest demo claims.
  assert.ok(!/«?\bEjemplo\b/.test(body), `${page.key}: no «Ejemplo» names`);
  assert.ok(!/Mauricio/.test(raw), `${page.key}: no Mauricio`);
  assert.ok(!/basad[oa]s? en (casos|clientes|estudios|productor)/i.test(body), `${page.key}: demos are not based on other firms' cases`);
  assert.ok(!/(testimonio|caso real|casos reales|nuestros clientes)/i.test(body), `${page.key}: no invented proof`);
  if (/\/es\/demos\//.test(raw)) assert.ok(/datos ficticios/.test(body), `${page.key}: demos must be labelled "datos ficticios"`);
  assert.ok(page.how.some((h) => /a medida/i.test(h.title)), `${page.key}: needs an explicit "A medida" block`);

  // Sources: only official hosts, https, no query tricks.
  for (const source of page.sources ?? []) assert.ok(OFFICIAL_SOURCES.test(source.href), `${page.key}: unexpected source host ${source.href}`);
}

// Rule 1: Convenio Multilateral. The tool computes the art. 2 coeficiente; the April adjustment / annual recompute is "a medida".
const cm = pages[0];
assert.ok(text(cm).includes("/es/herramientas/coeficiente-convenio-multilateral"), "cm: link to the free tool");
const cmBody = prose(cm);
assert.ok(/solo eso/i.test(cmBody) && /no cubre[^.]*ajuste de abril/i.test(cmBody), "cm: say what the tool does not do");
assert.ok(/Lo armamos a medida[^.]*ajuste de abril/i.test(cmBody), "cm: the April adjustment is 'a medida'");
assert.ok(/los coeficientes se cargan; no se calculan/i.test(cmBody), "cm: the demo loads coefficients, it does not compute them");
assert.ok(!/(calculamos|calcula) (automáticamente )?(el )?ajuste/i.test(cmBody.replace(/Lo armamos a medida[^.]*\./g, "")), "cm: no claim that the April adjustment is computed today");

// Rule 2 and 5: jurídicos. Novedades/alertas are "a medida"; no promises about deadlines; the professional confirms.
for (const page of [pages[2], pages[3]]) {
  assert.ok(/el profesional confirma siempre los plazos/.test(page.disclaimer ?? ""), `${page.key}: legal disclaimer`);
  assert.ok(!/(garantiz(amos|a)|asegur(amos|a)) (el |los )?(plazo|vencimiento)/i.test(prose(page).replace(/(no|ni) garantiza[^.]*\./gi, "")), `${page.key}: no promises about deadlines`);
  assert.ok(!/(nunca (se )?(te )?(pas|olvid)|jamás|sin errores|100 ?%)/i.test(prose(page).replace(/100 ?% de recargo/g, "")), `${page.key}: no absolute promises`);
}
const exp = pages[2];
assert.ok(exp.how.some((h) => /novedades de la causa/i.test(h.title) && /^A medida/.test(h.title)), "expedientes: novedades are 'a medida'");
assert.ok(/no hay una demo propia ni una función ya hecha/i.test(prose(exp)), "expedientes: novedades are not an existing feature");

// Rule 3: SSN page keeps the official source and no amount.
const ssn = pages[5];
assert.ok(ssn.sources?.some((s) => s.href.includes("argentina.gob.ar")), "ssn: official source");
assert.ok(/no lo publicamos/.test(prose(ssn)), "ssn: explain why the amount is not published");

console.log("rubro landings OK");
