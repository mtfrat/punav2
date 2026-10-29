// GEO / SEO source-level checks (2026-10-29): no duplicate H1 between a rubro page and its demo, privacy meta length,
// Organization entity data, rubro FAQ shape, blog FAQ extraction. Build-level checks live in verify-geo-build.mjs.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { demoDefinitions } from "../src/content/demos.ts";
import { rubroDefinitions } from "../src/content/rubros.ts";
import { rubroFaq } from "../src/content/rubro-faq.ts";
import { extractFaq } from "../src/lib/blog-faq.ts";
import { faqPageSchema, organizationSchema, ORGANIZATION_SAME_AS } from "../src/lib/seo.ts";

// 1. A rubro landing must not repeat the H1 of one of its demos (audit 2026-10-29: insurance brokers vs policies demo).
for (const locale of ["es", "en"]) {
  const demoH1 = new Map(demoDefinitions.map((d) => [d.copy[locale].h1.trim().toLowerCase(), d.id]));
  for (const rubro of rubroDefinitions) {
    const h1 = rubro.copy[locale].h1.trim().toLowerCase();
    assert.ok(!demoH1.has(h1), `${rubro.id}/${locale}: rubro H1 equals the H1 of demo ${demoH1.get(h1)}`);
    assert.ok(rubro.copy[locale].h1.endsWith(rubro.copy[locale].mark), `${rubro.id}/${locale}: mark must be the tail of the H1`);
  }
}

// 2. Legal metas stay between 70 and 155 characters.
const legal = readFileSync(new URL("../src/routes/legal.tsx", import.meta.url), "utf8");
const body = legal.slice(legal.indexOf("function legalDescription"), legal.indexOf("export const meta"));
const descriptions = [...body.matchAll(/"([^"\n]{40,})"/g)].map((m) => m[1]);
assert.equal(descriptions.length, 4, "expected 4 legal descriptions (privacy/terms x en/es)");
for (const text of descriptions) assert.ok(text.length >= 70 && text.length <= 155, `legal description is ${text.length} chars: ${text}`);

// 3. Organization entity: public profiles only, no private data.
const graph = organizationSchema("es")["@graph"];
const org = graph.find((n) => Array.isArray(n["@type"]) && n["@type"].includes("Organization"));
assert.ok(org["@type"].includes("ProfessionalService"));
assert.equal(org["@id"], "https://www.puna-tech.com/#organization");
for (const url of ["https://github.com/mtfrat", "https://x.com/PunaTechBA", "https://www.instagram.com/puna.tech/", "https://www.linkedin.com/company/puna-tech"]) {
  assert.ok(ORGANIZATION_SAME_AS.includes(url) && org.sameAs.includes(url), `sameAs missing ${url}`);
}
assert.deepEqual(org.founder, { "@type": "Person", name: "Martin" });
assert.equal(org.areaServed[0].name, "Argentina");
assert.match(org.description, /Software factory de Buenos Aires/);
for (const key of ["legalName", "telephone", "foundingDate", "taxID", "vatID"]) assert.ok(!(key in org), `Organization must not publish ${key}`);
assert.ok(!("streetAddress" in org.address), "no street address");
assert.ok(!/Fraticelli/i.test(JSON.stringify(organizationSchema("es")) + JSON.stringify(organizationSchema("en"))), "no founder surname");
assert.ok(graph.some((n) => n["@type"] === "WebSite"));

// 4. Rubro FAQ: 4-5 questions per rubro and locale, same count in both languages, never a price.
for (const rubro of rubroDefinitions) {
  const es = rubroFaq[rubro.id].es;
  const en = rubroFaq[rubro.id].en;
  assert.ok(es.length >= 4 && es.length <= 5, `${rubro.id}: ES FAQ has ${es.length} items`);
  assert.equal(en.length, es.length, `${rubro.id}: EN FAQ must mirror ES`);
  for (const [q, a] of [...es, ...en]) {
    assert.ok(q.endsWith("?") && a.length > 20, `${rubro.id}: weak FAQ item ${q}`);
    assert.ok(!/(US\$|USD|\$\s?\d|ARS\s?\d)/.test(a), `${rubro.id}: FAQ must not publish prices`);
    assert.ok(!/datos de ejemplo/i.test(q + a), `${rubro.id}: use "datos ficticios"`);
  }
}
const faq = faqPageSchema(rubroFaq.accounting.es);
assert.equal(faq["@type"], "FAQPage");
assert.equal(faq.mainEntity.length, rubroFaq.accounting.es.length);

// 5. Blog FAQ extraction: h2 "Preguntas frecuentes" + h3 question + first <p> answer; stops at the next h2.
const html = '<p>Intro</p><h2>Otra sección</h2><h3>No es FAQ</h3><p>x</p><h2>Preguntas frecuentes</h2>'
  + '<h3>¿Primera &amp; segunda?</h3><p>Sí, <a href="https://example.com">con link</a> y <strong>negrita</strong>.</p><p>Párrafo extra que no es la respuesta.</p>'
  + '<h3>¿Sin respuesta?</h3><ul><li>solo lista</li></ul>'
  + '<h3>¿Tercera?</h3><p>Respuesta tres.</p><h2>Fuentes</h2><h3>¿Ajena?</h3><p>No.</p>';
assert.deepEqual(extractFaq(html), [["¿Primera & segunda?", "Sí, con link y negrita."], ["¿Tercera?", "Respuesta tres."]]);
assert.deepEqual(extractFaq("<h2>Sin faq</h2><h3>¿Pregunta?</h3><p>Respuesta</p>"), []);
assert.deepEqual(extractFaq('<h2>Frequently asked questions</h2><h3>Why?</h3><p>Because.</p>'), [["Why?", "Because."]]);

console.log("geo source checks: OK");
