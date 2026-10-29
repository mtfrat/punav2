import assert from "node:assert/strict";
import { demoDefinitions, demosHubCopy } from "../src/content/demos.ts";
import { rubroDefinitions, rubroPath, findRubroBySlug, rubroOgPath } from "../src/content/rubros.ts";
import { SAMPLE_BATCH, checkBatch, expectedIva, formatCuit, isValidCae, isValidCuit, toCsv } from "../src/lib/demo-invoices.ts";
import { existsSync, readFileSync } from "node:fs";

const BRAND = " | Puna Tech";
const locales = ["es", "en"];
const verticals = ["accounting", "legal", "insurance", "real-estate", "clinics", "commerce"];

// --- demos: every demo declares who it is for, and the mapping agreed in the plan holds.
const byId = Object.fromEntries(demoDefinitions.map((d) => [d.id, d]));
for (const d of demoDefinitions) {
  assert.ok(d.verticals.length > 0, `${d.id}: needs at least one vertical`);
  for (const v of d.verticals) assert.ok(verticals.includes(v), `${d.id}: unknown vertical ${v}`);
}
assert.deepEqual(byId["convenio-multilateral"].verticals, ["accounting"]);
assert.deepEqual([...byId.collections.verticals].sort(), ["accounting", "legal", "real-estate"]);
assert.deepEqual([...byId["lead-scoring"].verticals].sort(), ["legal", "real-estate"]);
for (const id of ["stock-sync", "wholesale-quotes", "store-dashboard"]) assert.deepEqual(byId[id].verticals, ["commerce"], `${id} belongs to the commerce group`);
assert.equal(demoDefinitions.length, 10, "hub says ten demos");
for (const locale of locales) {
  assert.ok(/(10|Diez|Ten)/.test(demosHubCopy[locale].lead + demosHubCopy[locale].metaDescription), `${locale}: hub copy mentions ten demos`);
  const slugs = demoDefinitions.map((d) => d.slug[locale]);
  assert.equal(new Set(slugs).size, slugs.length, `${locale}: demo slugs are unique`);
  assert.ok(!slugs.includes("roi") && !slugs.includes("for") && !slugs.includes("para"), `${locale}: demo slug must not shadow a static route`);
}

for (const d of demoDefinitions) for (const locale of locales) {
  const c = d.copy[locale];
  assert.ok(c.metaTitle.length <= 60, `${d.id}/${locale}: title ${c.metaTitle.length} > 60`);
  assert.ok(c.metaDescription.length <= 155, `${d.id}/${locale}: description ${c.metaDescription.length} > 155`);
  assert.ok(c.h1.includes(c.mark), `${d.id}/${locale}: mark must be inside the H1`);
  assert.ok(!/[–—]/.test(c.metaTitle + c.metaDescription), `${d.id}/${locale}: no dashes in SERP text`);
}

// --- rubros: five pages, both locales, consistent SEO limits, a valid placement and real demos.
assert.equal(rubroDefinitions.length, 5);
const expectedEs = ["estudios-contables", "estudios-juridicos", "productores-de-seguros", "inmobiliarias", "clinicas-y-consultorios"];
assert.deepEqual(rubroDefinitions.map((r) => r.slug.es), expectedEs);
for (const r of rubroDefinitions) {
  assert.match(r.placement, /^demos-[a-z0-9-]+$/, `${r.id}: placement is a clean block name`);
  assert.ok(r.placement.length <= 60);
  assert.ok(r.featured.length >= 1 && r.featured.length <= 3, `${r.id}: one to three cards`);
  for (const demoId of r.featured) assert.ok(byId[demoId], `${r.id}: unknown demo ${demoId}`);
  if (r.video) assert.ok(byId[r.video].copy.es.video, `${r.id}: video demo has a video`);
  for (const locale of locales) {
    const c = r.copy[locale];
    assert.equal(rubroPath(locale, r.slug[locale]), (locale === "es" ? "/es/demos/para/" : "/demos/for/") + r.slug[locale]);
    assert.equal(findRubroBySlug(locale, r.slug[locale])?.id, r.id);
    assert.ok(c.metaTitle.endsWith(BRAND), `${r.id}/${locale}: title carries the brand`);
    assert.ok(c.metaTitle.length >= 45 && c.metaTitle.length <= 60, `${r.id}/${locale}: title length ${c.metaTitle.length} outside 45-60`);
    assert.ok(c.metaDescription.length <= 155, `${r.id}/${locale}: description ${c.metaDescription.length} > 155`);
    assert.ok(c.metaDescription.length >= 90, `${r.id}/${locale}: description too short`);
    assert.ok(c.h1.includes(c.mark), `${r.id}/${locale}: highlighted word must be part of the H1`);
    assert.equal(c.adapt.length, 3);
    for (const text of [c.metaTitle, c.metaDescription]) assert.ok(!/[–—]/.test(text), `${r.id}/${locale}: no dashes in SERP text`);
    // Honest copy: nothing promises prices, instant results, or names competitors.
    const all = JSON.stringify(c);
    assert.ok(!/(US\$|USD|\$\s?\d|ARS\s?\d|garantiz)/i.test(all), `${r.id}/${locale}: no prices or guarantees`);
    assert.ok(!/\b(el lab|demos? de lab)\b/i.test(all), `${r.id}/${locale}: no lab jargon`);
  }
  assert.ok(existsSync(new URL(`../public${rubroOgPath("es", r.id)}`, import.meta.url)), `${r.id}: es OG image is missing`);
  assert.ok(existsSync(new URL(`../public${rubroOgPath("en", r.id)}`, import.meta.url)), `${r.id}: en OG image is missing`);
}
// Every demo that has a home rubro is reachable from that rubro page (featured or in the "more" list).
for (const d of demoDefinitions) {
  for (const v of d.verticals.filter((x) => x !== "commerce")) assert.ok(rubroDefinitions.some((r) => r.id === v), `${d.id}: vertical ${v} has no page`);
}
for (const d of demoDefinitions) for (const locale of locales) assert.ok(existsSync(new URL(`../public/og/demos-${d.id}-${locale}.png`, import.meta.url)), `${d.id}/${locale}: OG image missing`);

// --- invoice checks.
assert.ok(isValidCuit("30-55667789-8"));
assert.ok(isValidCuit("30556677898"));
assert.ok(!isValidCuit("30-68901234-7"), "wrong check digit");
assert.ok(!isValidCuit("30-5566778-9"), "wrong length");
assert.equal(formatCuit("30556677898"), "30-55667789-8");
assert.ok(isValidCae("74123456789012"));
assert.ok(!isValidCae("7412345678"));
assert.equal(expectedIva(250000), 52500);
const base = { id: "a", file: "a.pdf", emisor: "X", cuit: "30-55667789-8", numero: "0003-00018422", neto: 1000, iva: 210, perc: 30, percRate: 3, total: 1240, cae: "74123456789012" };
assert.deepEqual(checkBatch([base]).a, [], "a clean invoice has no alerts");
const dup = checkBatch([base, { ...base, id: "b" }]);
assert.deepEqual(dup.b.map((a) => a.code), ["duplicate"]);
assert.equal(dup.b[0].value, "a");
assert.deepEqual(checkBatch([{ ...base, cuit: "" }]).a.map((a) => a.code), ["cuit-missing"]);
assert.deepEqual(checkBatch([{ ...base, cuit: "30-68901234-7" }]).a.map((a) => a.code), ["cuit-invalid"]);
assert.deepEqual(checkBatch([{ ...base, cae: "123" }]).a.map((a) => a.code), ["cae-invalid"]);
assert.deepEqual(checkBatch([{ ...base, perc: 50, total: 1260 }]).a.map((a) => a.code), ["perc"]);
assert.deepEqual(checkBatch([{ ...base, iva: 100, total: 1130 }]).a.map((a) => a.code), ["iva"]);
assert.deepEqual(checkBatch([{ ...base, total: 1300 }]).a.map((a) => a.code), ["total"]);
assert.deepEqual(checkBatch([{ ...base, percRate: 0, perc: 0, total: 1210 }]).a, [], "no rate on file and no withholding is fine");
const csv = toCsv([base]);
assert.ok(csv.split("\r\n").length === 2 && csv.includes("30-55667789-8") && csv.includes("1240,00"), "csv uses ; and comma decimals");
assert.ok(!csv.includes("undefined"));

// The sample batch shown in the demo behaves exactly as the copy promises.
const sample = checkBatch(SAMPLE_BATCH);
const codes = (id) => sample[id].map((a) => a.code);
for (const id of ["d1", "d2", "d3", "d9"]) assert.deepEqual(codes(id), [], `${id} should be clean`);
assert.deepEqual(codes("d4"), ["duplicate"]);
assert.equal(sample.d4[0].value, "d1");
assert.deepEqual(codes("d5"), ["perc"]);
assert.deepEqual(codes("d6"), ["cuit-invalid"]);
assert.deepEqual(codes("d7"), ["cae-invalid"]);
assert.deepEqual(codes("d8"), ["cuit-missing", "total"]);
assert.ok(SAMPLE_BATCH.every((r) => !/real|cliente real/i.test(r.emisor)), "invented suppliers only");

// --- fictional names must read as real-looking names: never "Ejemplo", "Example", "Demo", "Test", "Cliente A", "Proveedor X"...
const PLACEHOLDER_NAME = /\b(ejemplo|example|demo|test|prueba|ficticio|fake|lorem|acme|foo)\b|\b(cliente|proveedor|client|supplier|empresa|company)\s+[A-Z0-9]\b/i;
assert.ok(SAMPLE_BATCH.every((r) => !PLACEHOLDER_NAME.test(r.emisor)), "supplier names must not look like placeholders");
for (const file of ["src/components/demos/monthly-docs-demo.tsx", "src/components/demos/policies-renewals-demo.tsx", "src/components/demos/collections-demo.tsx", "src/components/demos/rubro-pages.tsx"]) {
  const src = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const names = [...src.matchAll(/(?:name|holder|insurer|client|main|seller):\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(names.length > 0, `${file}: expected to find fictional names`);
  for (const name of names) assert.ok(!PLACEHOLDER_NAME.test(name), `${file}: placeholder-looking name "${name}"`);
}
const quoteSrc = readFileSync(new URL("../src/components/demos/quote-demo.tsx", import.meta.url), "utf8");
assert.ok(!/seller:\s*"[^"]*(example|ejemplo|demo)/i.test(quoteSrc), "quote seller must not be a placeholder");
assert.ok(!/(Mayorista|Distribuidor) [AB]"/.test(quoteSrc), "quote clients must not be labelled A/B");
const notice = { es: "Datos ficticios con fines de demostración.", en: "Fictional data for demonstration purposes." };
assert.ok(demosHubCopy.es.exampleNote.startsWith(notice.es) && demosHubCopy.en.exampleNote.startsWith(notice.en), "hub shows the single fictional-data notice");


console.log("demos por rubro: ok");
