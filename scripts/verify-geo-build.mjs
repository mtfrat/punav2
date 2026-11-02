// Build/preview-level GEO checks: JSON-LD parses and has the expected schema.org types, every FAQ question is visible in
// the HTML, @id references resolve to the home Organization, the about page has its facts table in the initial HTML, and
// no page says "datos de ejemplo". Reads build/client (npm test) or, with GEO_BASE_URL (+ optional GEO_COOKIE), a live URL.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://www.puna-tech.com";
const base = process.env.GEO_BASE_URL?.replace(/\/$/, "");
const cookie = process.env.GEO_COOKIE;
const root = fileURLToPath(new URL("../build/client/", import.meta.url));
const extraPaths = (process.env.GEO_EXTRA_PATHS || "").split(",").filter(Boolean);

const rubros = [
  ["es", "/es/demos/para/estudios-contables", "Estudios contables"],
  ["es", "/es/demos/para/estudios-juridicos", "Estudios jurídicos"],
  ["es", "/es/demos/para/productores-de-seguros", "Productores de seguros"],
  ["es", "/es/demos/para/inmobiliarias", "Inmobiliarias"],
  ["es", "/es/demos/para/clinicas-y-consultorios", "Clínicas y consultorios"],
  ["en", "/demos/for/accounting-firms", "Accounting firms"],
  ["en", "/demos/for/law-firms", null],
  ["en", "/demos/for/insurance-brokers", null],
  ["en", "/demos/for/real-estate-agencies", null],
  ["en", "/demos/for/clinics-and-practices", null],
];

const failures = [];
const fail = (route, message) => failures.push(`${route}: ${message}`);

async function load(route) {
  if (base) {
    const response = await fetch(`${base}${route}`, { headers: cookie ? { cookie } : {}, redirect: "follow" });
    if (!response.ok) { fail(route, `HTTP ${response.status}`); return null; }
    return response.text();
  }
  try {
    return await readFile(route === "/" ? join(root, "index.html") : join(root, route.slice(1), "index.html"), "utf8");
  } catch {
    fail(route, "prerendered HTML is missing");
    return null;
  }
}

const decode = (value) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const visibleText = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ");

function jsonLd(route, html) {
  const nodes = [];
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    let parsed;
    try { parsed = JSON.parse(decode(match[1])); } catch (error) { fail(route, `invalid JSON-LD: ${error.message}`); continue; }
    for (const node of parsed["@graph"] ?? [parsed]) {
      if (node["@context"] !== undefined && node["@context"] !== "https://schema.org" && !parsed["@graph"]) fail(route, `unexpected @context ${node["@context"]}`);
      nodes.push(node);
    }
    if (parsed["@graph"] && parsed["@context"] !== "https://schema.org") fail(route, "@graph without schema.org @context");
  }
  return nodes;
}
const typesOf = (node) => (Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]);
const find = (nodes, type) => nodes.filter((node) => typesOf(node).includes(type));

function commonChecks(route, html, nodes) {
  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(route, `expected exactly one <h1>, found ${h1s.length}`);
  if (/datos de ejemplo/i.test(html)) fail(route, 'still says "datos de ejemplo"');
  if (/Fraticelli/i.test(html)) fail(route, "publishes the founder surname");
  // Every {"@id": ...} reference to the Organization must be the canonical home id.
  for (const node of nodes) for (const key of ["provider", "publisher", "author", "about", "mainEntity", "isPartOf"]) {
    const ref = node[key]?.["@id"];
    if (ref && !ref.startsWith(SITE)) fail(route, `${key} @id is not on ${SITE}: ${ref}`);
  }
}

function checkFaqVisible(route, html, nodes, expectMin) {
  const faq = find(nodes, "FAQPage");
  if (faq.length !== 1) { fail(route, `expected one FAQPage, found ${faq.length}`); return; }
  const questions = faq[0].mainEntity ?? [];
  if (questions.length < expectMin) fail(route, `FAQPage has ${questions.length} questions (min ${expectMin})`);
  const text = visibleText(html);
  for (const q of questions) {
    if (q["@type"] !== "Question" || q.acceptedAnswer?.["@type"] !== "Answer") fail(route, `bad Question node ${q.name}`);
    if (!text.includes(q.name)) fail(route, `FAQ question not visible on the page: ${q.name}`);
    const answerStart = (q.acceptedAnswer?.text ?? "").slice(0, 40);
    if (!text.includes(answerStart)) fail(route, `FAQ answer not visible on the page: ${answerStart}`);
  }
}

// Home: Organization + WebSite with the entity data.
for (const route of ["/es", "/"]) {
  const html = await load(route);
  if (!html) continue;
  const nodes = jsonLd(route, html);
  commonChecks(route, html, nodes);
  const [org] = find(nodes, "Organization");
  if (!org) { fail(route, "Organization missing"); continue; }
  if (!typesOf(org).includes("ProfessionalService")) fail(route, "Organization should also be ProfessionalService");
  if (org["@id"] !== `${SITE}/#organization`) fail(route, `Organization @id is ${org["@id"]}`);
  for (const url of ["https://github.com/mtfrat", "https://x.com/PunaTechBA", "https://www.instagram.com/puna.tech/", "https://www.linkedin.com/company/puna-tech"]) if (!org.sameAs?.includes(url)) fail(route, `sameAs missing ${url}`);
  if (org.founder?.name !== "Martin") fail(route, "founder should be Martin");
  if (org.areaServed?.[0]?.name !== "Argentina") fail(route, "areaServed should be Argentina");
  for (const key of ["legalName", "telephone", "foundingDate"]) if (key in org) fail(route, `Organization publishes ${key}`);
  if (!find(nodes, "WebSite").length) fail(route, "WebSite missing");
}
{
  const html = await load("/es");
  if (html && !/<title>Puna Tech, software factory de Buenos Aires<\/title>/.test(html)) fail("/es", "ES home title is not 'Puna Tech, software factory de Buenos Aires'");
}

// Rubro pages (ES + EN): Service + FAQPage + CollectionPage + Breadcrumb, FAQ visible, provider points at #organization.
for (const [locale, route] of rubros) {
  const html = await load(route);
  if (!html) continue;
  const nodes = jsonLd(route, html);
  commonChecks(route, html, nodes);
  for (const type of ["Service", "FAQPage", "BreadcrumbList", "CollectionPage"]) if (!find(nodes, type).length) fail(route, `${type} JSON-LD missing`);
  const [service] = find(nodes, "Service");
  if (service) {
    if (service.provider?.["@id"] !== `${SITE}/#organization`) fail(route, "Service provider does not point at #organization");
    if (service.areaServed?.name !== "Argentina") fail(route, "Service areaServed should be Argentina");
    if (service["@id"] !== `${SITE}${route}#service`) fail(route, `Service @id is ${service["@id"]}`);
    if (service.inLanguage !== (locale === "es" ? "es-AR" : "en")) fail(route, `Service inLanguage is ${service.inLanguage}`);
  }
  checkFaqVisible(route, html, nodes, 4);
  if (!html.includes(locale === "es" ? "Preguntas frecuentes" : "Frequently asked questions")) fail(route, "visible FAQ heading missing");
}

// Accounting rubro and CM demo link to the verified open-source repo.
const CM_REPO = "https://github.com/mtfrat/convenio-multilateral-coeficiente";
for (const route of ["/es/demos/para/estudios-contables", "/demos/for/accounting-firms", "/es/demos/convenio-multilateral", "/demos/multilateral-agreement"]) {
  const html = await load(route);
  if (html && !html.includes(CM_REPO)) fail(route, "missing link to the Convenio Multilateral repo");
  if (html && /convenio-multilateral$|multilateral-agreement$/.test(route) && !find(jsonLd(route, html), "SoftwareSourceCode").length) fail(route, "SoftwareSourceCode JSON-LD missing");
}

// About pages.
for (const [route, locale] of [["/es/sobre-puna", "es"], ["/about", "en"]]) {
  const html = await load(route);
  if (!html) continue;
  const nodes = jsonLd(route, html);
  commonChecks(route, html, nodes);
  for (const type of ["AboutPage", "Organization", "BreadcrumbList", "SoftwareSourceCode"]) if (!find(nodes, type).length) fail(route, `${type} JSON-LD missing`);
  const about = find(nodes, "AboutPage")[0];
  if (about?.about?.["@id"] !== `${SITE}/#organization` || about?.mainEntity?.["@id"] !== `${SITE}/#organization`) fail(route, "AboutPage about/mainEntity must be #organization");
  if (!html.includes(locale === "es" ? "Datos rápidos" : "Quick facts")) fail(route, "facts table missing from the initial HTML");
  if (!html.includes("<dl")) fail(route, "facts <dl> missing from the initial HTML");
  if (!html.includes(`rel="canonical" href="${SITE}${route}"`)) fail(route, "canonical mismatch");
  if (!/hreflang="es-AR"/i.test(html) || !/hreflang="en"/i.test(html) || !/hreflang="x-default"/i.test(html)) fail(route, "hreflang set incomplete");
  const text = visibleText(html);
  if (/\+?\d[\d\s().-]{8,}\d/.test(text.replace(/\d{4}-\d{2}-\d{2}/g, ""))) fail(route, "looks like it publishes a phone number");
  if (/\bCUIT\s*[:\d]|\bCalle\b|\bAv\.\s/.test(text)) fail(route, "looks like it publishes a tax ID or street address");
}

// Live-only: blog posts that carry a "Preguntas frecuentes" section must emit FAQPage JSON-LD built from it.
for (const route of extraPaths) {
  const html = await load(route);
  if (!html) continue;
  const nodes = jsonLd(route, html);
  for (const type of ["Article", "BreadcrumbList", "FAQPage"]) if (!find(nodes, type).length) fail(route, `${type} JSON-LD missing`);
  checkFaqVisible(route, html, nodes, 3);
}

// Live-only: SSR text endpoints stay free of stale model versions and the old "across the US" claim (GEO spec acceptance).
if (base) {
  for (const route of ["/llms-full.txt", "/llms.txt", "/puna.md"]) {
    const text = await load(route);
    if (text && /gpt-4o|claude 3\.5|gemini 1\.5|across the US/i.test(text)) fail(route, "mentions a stale model version or 'across the US'");
    if (text && /Fraticelli/i.test(text)) fail(route, "publishes the founder surname");
  }
}

if (failures.length) {
  console.error(`GEO build checks failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`GEO build checks: OK (${base ? base : "build/client"})`);
