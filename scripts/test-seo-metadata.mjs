import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { caseStudies, casesHubCopy, legacyPostRedirects, services, servicesHubCopy } from "../src/content/catalog.ts";
import { useCaseHubs, useCases } from "../src/content/use-cases.ts";
import { languageSwitchPath } from "../src/lib/locale-switch.ts";
import { blogDocumentTitle, blogIndexSchema, createMeta, normalizeDocumentTitle } from "../src/lib/seo.ts";

const suffix = " | Puna Tech";
const cases = [
  ["When Zapier/n8n stop fitting: custom software", true],
  ["CRM integration audit: a practical checklist", true],
  ["Cuándo Zapier/n8n no alcanzan: software a medida", true],
  ["Auditoría de integración CRM: checklist práctico", true],
  ["AI vs deterministic software: a practical decision guide", false],
  ["IA vs software determinístico: guía práctica para decidir", false],
];

for (const [base, shouldBrand] of cases) {
  const title = blogDocumentTitle(base);
  if (shouldBrand) {
    assert.equal(title, `${base}${suffix}`);
    assert.ok(title.length <= 60, `${title} is ${title.length}`);
  } else {
    assert.equal(title, base);
    assert.ok(base.length + suffix.length > 60);
  }
  const meta = createMeta({
    locale: "en",
    title,
    description: "Reviewed guide from Puna Tech about operational software decisions and implementation.",
    path: "/blog/example",
    type: "article",
  });
  assert.equal(meta.find((entry) => entry.title === title)?.title, title);
  assert.equal(meta.find((entry) => entry.property === "og:title")?.content, title);
}

assert.equal(blogDocumentTitle(`Short note${suffix}`), `Short note${suffix}`);
assert.equal(blogDocumentTitle(`${"x".repeat(70)}${suffix}`), `${"x".repeat(70)}${suffix}`);

for (const [slug, title] of [
  ["when-to-use-ai-vs-deterministic-software", "AI vs deterministic software guide | Puna Tech"],
  ["cuando-usar-ia-vs-software-deterministico", "IA vs software determinístico: guía | Puna Tech"],
]) {
  assert.equal(blogDocumentTitle("stored article title", slug), title);
  assert.ok(title.length >= 45 && title.length <= 60, `${slug} document title is ${title.length}`);
  assert.ok(title.endsWith(suffix), slug);
}

assert.equal(
  languageSwitchPath("/blog/when-to-use-ai-vs-deterministic-software", "en", "/es/blog/cuando-usar-ia-vs-software-deterministico"),
  "/es/blog/cuando-usar-ia-vs-software-deterministico",
);
assert.equal(
  languageSwitchPath("/es/blog/cuando-usar-ia-vs-software-deterministico", "es", "/blog/when-to-use-ai-vs-deterministic-software"),
  "/blog/when-to-use-ai-vs-deterministic-software",
);
assert.equal(
  languageSwitchPath("/blog/when-to-leave-zapier-n8n-for-custom-software", "en", "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida"),
  "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida",
);
assert.equal(
  languageSwitchPath("/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", "es", "/blog/when-to-leave-zapier-n8n-for-custom-software"),
  "/blog/when-to-leave-zapier-n8n-for-custom-software",
);
assert.notEqual(
  languageSwitchPath("/blog/when-to-leave-zapier-n8n-for-custom-software", "en"),
  "/es/blog/when-to-leave-zapier-n8n-for-custom-software",
);
assert.equal(languageSwitchPath("/blog/when-to-leave-zapier-n8n-for-custom-software", "en"), "/es/blog");
assert.equal(languageSwitchPath("/services/custom-software", "en"), "/es/servicios/software-a-medida");
assert.equal(languageSwitchPath("/blog", "en"), "/es/blog");

const hub = blogIndexSchema("es", "Notas prácticas", [
  { name: "Cuándo usar IA y cuándo conviene software determinístico", path: "/es/blog/cuando-usar-ia-vs-software-deterministico" },
]);
assert.equal(hub[0]["@type"], "BreadcrumbList");
assert.equal(hub[0].itemListElement[1].item, "https://www.puna-tech.com/es/blog");
assert.equal(hub[1]["@type"], "CollectionPage");
assert.equal(hub[1].inLanguage, "es-AR");
assert.equal(hub[1].mainEntity["@type"], "ItemList");
assert.equal(hub[1].mainEntity.itemListElement[0].url, "https://www.puna-tech.com/es/blog/cuando-usar-ia-vs-software-deterministico");

const englishHub = blogIndexSchema("en", "Practical notes", [
  { name: "When to leave Zapier or n8n for custom software", path: "/blog/when-to-leave-zapier-n8n-for-custom-software" },
]);
assert.equal(englishHub[1].inLanguage, "en");
assert.equal(englishHub[1].mainEntity.itemListElement[0].url, "https://www.puna-tech.com/blog/when-to-leave-zapier-n8n-for-custom-software");

for (const [raw, expected] of [
  ["Términos de Uso | Puna Tech - Software Factory | Puna Tech", "Términos de Uso | Puna Tech"],
  ["clasificación de sentimiento y widgets con IA. - Software Factory | Puna Tech", "clasificación de sentimiento y widgets con IA | Puna Tech"],
  ["De Google Reviews a ingresos: widgets con IA. | Puna Tech", "De Google Reviews a ingresos: widgets con IA | Puna Tech"],
  ["Contacto | Puna Tech | Puna Tech", "Contacto | Puna Tech"],
  ["Contacto | Puna Tech", "Contacto | Puna Tech"],
  ["AI vs deterministic software: a practical decision guide", "AI vs deterministic software: a practical decision guide"],
  ["Sobre Puna Tech", "Sobre Puna Tech"],
]) {
  assert.equal(normalizeDocumentTitle(raw), expected);
  assert.equal(createMeta({ locale: "es", title: raw, description: "x".repeat(60), path: "/es" })[0].title, expected);
}
const structured = createMeta({
  locale: "es",
  title: "Software a medida para empresas en Argentina | Puna Tech",
  description: "x".repeat(80),
  path: "/es/servicios/software-a-medida",
  schema: [
    { "@type": "Service", name: "Software a medida" },
    { "@type": "BreadcrumbList" },
    { "@type": "FAQPage" },
  ],
});
const ldJson = structured.filter((entry) => entry["script:ld+json"]);
assert.equal(ldJson.length, 3, "each JSON-LD node needs its own script");
assert.deepEqual(ldJson.map((entry) => entry["script:ld+json"]["@type"]), ["Service", "BreadcrumbList", "FAQPage"]);

assert.equal(languageSwitchPath("/es/contacto", "es"), "/contact");
assert.equal(languageSwitchPath("/contact", "en"), "/es/contacto");

const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const redirects = new Map(vercel.redirects.map((rule) => [rule.source, rule]));
for (const [source, destination] of [
  ["/case-studies/autopost-content-infrastructure", "/case-studies/autopost-b2b-content-studio"],
  ["/es/casos/autopost-infraestructura-contenido", "/es/casos/autopost-estudio-contenido-b2b"],
  ["/es/automatizar-cobranzas", "/es/automatizaciones/automatizar-cobranzas"],
]) {
  const rule = redirects.get(source);
  assert.ok(rule, `missing redirect for ${source}`);
  assert.equal(rule.destination, destination);
  assert.equal(rule.statusCode, 301);
}

function assertSerpTitle(label, title) {
  assert.equal(title, title.trim());
  assert.ok(title.endsWith(suffix), `${label} missing brand suffix: ${title}`);
  assert.ok(title.length >= 45 && title.length <= 60, `${label} title length ${title.length}: ${title}`);
}

function assertSerpMeta(label, description) {
  assert.ok(description.length <= 160, `${label} meta length ${description.length}: ${description}`);
}

for (const locale of ["en", "es"]) {
  for (const study of caseStudies[locale]) {
    const label = `${locale} case ${study.slug}`;
    assertSerpTitle(label, study.metaTitle);
    assertSerpMeta(label, study.metaDescription);
    assert.ok(study.metaDescription.length >= 120 && study.metaDescription.length <= 158, `${label} meta length ${study.metaDescription.length}`);
    assert.notEqual(study.metaTitle, `${study.title}${suffix}`, `${label} document title still repeats the H1`);
  }
  for (const service of services[locale]) {
    assertSerpTitle(`${locale} service ${service.slug}`, service.metaTitle);
    assertSerpMeta(`${locale} service ${service.slug}`, service.metaDescription);
  }
  assertSerpTitle(`${locale} services hub`, servicesHubCopy[locale].metaTitle);
  assertSerpMeta(`${locale} services hub`, servicesHubCopy[locale].metaDescription);
  assertSerpTitle(`${locale} cases hub`, casesHubCopy[locale].metaTitle);
  assertSerpMeta(`${locale} cases hub`, casesHubCopy[locale].metaDescription);
}
for (const hub of useCaseHubs) {
  assertSerpTitle(hub.path, hub.metaTitle);
  assertSerpMeta(hub.path, hub.metaDescription);
}
for (const useCase of useCases) {
  assertSerpTitle(useCase.path, useCase.metaTitle);
  assertSerpMeta(useCase.path, useCase.metaDescription);
}

const arca = useCases.find((item) => item.path === "/es/automatizaciones/facturacion-electronica-arca");
assert.ok(arca, "missing facturación electrónica ARCA use case");
assert.equal(arca.metaTitle, "Automatizar facturación electrónica ARCA | Puna Tech");
assert.ok(arca.metaTitle.length >= 45 && arca.metaTitle.length <= 60);
assert.ok(arca.metaDescription.length <= 160);
assert.match(arca.metaDescription, /CUIT/);
assert.match(arca.metaDescription, /A, B y C/);
assert.match(arca.metaDescription, /ERP/);
assert.match(arca.metaDescription, /stock/);
assert.equal(arca.faqs.length >= 5 && arca.faqs.length <= 6, true);
assert.ok(arca.faqs.some(([question]) => question.includes("facturación electrónica")));

assert.equal(legacyPostRedirects["automatizacion-facturacion-logistica"], "/es/automatizaciones/carga-de-facturas-proveedores");
assert.equal(legacyPostRedirects["arquitecturas-multi-agente"], "/es/blog/cuando-usar-ia-vs-software-deterministico");
assert.equal(legacyPostRedirects["guia-optimizacion-procesos-ia"], "/es/servicios/automatizacion-ia");
assert.equal(legacyPostRedirects["ce50c784-fb5f-4fb0-8366-b509505ad350"], "/es/blog");

const blogRedirectSources = vercel.redirects.filter((rule) => rule.source.startsWith("/blog/") || rule.source.startsWith("/es/blog/"));
assert.equal(blogRedirectSources.length, Object.keys(legacyPostRedirects).length * 2);
for (const [id, destination] of Object.entries(legacyPostRedirects)) {
  assert.equal(redirects.has(destination), false, `${destination} is itself a redirect`);
  for (const source of [`/blog/${id}`, `/es/blog/${id}`]) {
    const rule = redirects.get(source);
    assert.ok(rule, `missing single-hop redirect for ${source}`);
    assert.equal(rule.destination, destination);
    assert.equal(rule.statusCode, 301);
  }
}
for (const rule of blogRedirectSources) {
  const id = rule.source.replace(/^\/(?:es\/)?blog\//, "");
  assert.equal(legacyPostRedirects[id], rule.destination, `${rule.source} is not in the legacy map`);
}

console.log("Verified blog title limits, language-switch paths, blog hub schema, legacy redirects, and SERP title/meta lengths.");
