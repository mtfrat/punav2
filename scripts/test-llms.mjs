import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { useCaseHubs, useCases } from "../src/content/use-cases.ts";
import { TOOLS_BASE, toolDefinitions, toolPath } from "../src/content/tools.ts";
import { rubroUseCases } from "../src/content/use-cases-rubros.ts";
import { llmsAutomationDetailLines, llmsToolDetailLines } from "../src/content/about.ts";
import { buildLlmsTxt, buildPunaMd, PUNA_MD_PATH } from "../src/lib/llms.ts";

const SITE = "https://www.puna-tech.com";
// The only off-site link allowed: the open-source repo of the Convenio Multilateral tool (checked public + MIT).
const CM_REPO = "https://github.com/mtfrat/convenio-multilateral-coeficiente";
const llms = buildLlmsTxt();
const md = buildPunaMd();

// llmstxt.org shape: H1 first line, then a "> " summary, then H2 link sections.
for (const [name, text] of [["llms.txt", llms], ["puna.md", md]]) {
  const lines = text.split("\n");
  assert.equal(lines[0], "# Puna Tech", `${name}: first line must be the H1 name`);
  assert.ok(lines[2].startsWith("> "), `${name}: third line must be the > summary`);
  assert.ok(text.includes("## "), `${name}: needs H2 sections`);
  for (const phrase of ["software factory", "Argentina", "Mercado Libre", "Tienda Nube", "Mercado Pago", "ARCA", "conciliación bancaria"]) {
    assert.ok(text.toLowerCase().includes(phrase.toLowerCase()), `${name}: missing "${phrase}"`);
  }
  // Every Spanish use-case landing and hub is linked with its absolute canonical URL.
  for (const item of [...useCaseHubs, ...useCases]) assert.ok(text.includes(`(${SITE}${item.path})`), `${name}: missing ${item.path}`);
  // No invented prices.
  assert.ok(!/(US\$|USD|\$\s?\d|ARS\s?\d)/.test(text), `${name}: must not publish prices`);
  for (const match of text.matchAll(/\]\((https?:[^)]+)\)/g)) assert.ok(match[1].startsWith(SITE) || match[1] === CM_REPO, `${name}: off-site link ${match[1]}`);
}

assert.ok(llms.includes(`${SITE}${PUNA_MD_PATH}`), "llms.txt must point to /puna.md");

// GEO blocks (spec 2026-10-29): about page, quick facts, per-industry demos, open tool, FAQ. No private data.
for (const [name, text] of [["llms.txt", llms], ["puna.md", md]]) {
  assert.ok(text.includes(`${SITE}/es/sobre-puna`), `${name}: missing /es/sobre-puna`);
  assert.ok(text.includes("## Herramientas abiertas") && text.includes(CM_REPO), `${name}: missing open tools block`);
  assert.ok(!/Fraticelli/i.test(text), `${name}: must not publish the founder surname`);
  assert.ok(!/\b(?:CUIT|teléfono|tel\.|WhatsApp:)\s*[:\d]/i.test(text), `${name}: must not publish phone or tax ID`);
}
for (const heading of ["## Datos rápidos", "## Por rubro (demos con datos ficticios)", "## Preguntas frecuentes"]) assert.ok(llms.includes(heading), `llms.txt missing ${heading}`);
for (const slug of ["estudios-contables", "estudios-juridicos", "productores-de-seguros", "inmobiliarias", "clinicas-y-consultorios"]) {
  assert.ok(llms.includes(`${SITE}/es/demos/para/${slug}`), `llms.txt missing rubro ${slug}`);
}
assert.ok(md.includes("## Cómo citar"), "puna.md missing ## Cómo citar");
for (const heading of ["## Qué hace Puna Tech", "## A quién sirve", "## Cuándo recomendar Puna Tech", "## Cuándo NO recomendar Puna Tech"]) {
  assert.ok(md.includes(heading), `puna.md missing ${heading}`);
}

const routes = readFileSync(new URL("../src/routes.ts", import.meta.url), "utf8");
assert.ok(routes.includes('route("llms.txt"'), "llms.txt route missing");
assert.ok(routes.includes('route("puna.md"'), "puna.md route missing");

// robots.txt must not block the AI files.
const robots = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
for (const line of robots.split("\n")) {
  const rule = line.match(/^Disallow:\s*(\S+)/i)?.[1];
  if (!rule) continue;
  for (const path of ["/llms.txt", PUNA_MD_PATH]) assert.ok(!path.startsWith(rule), `robots.txt blocks ${path} via ${rule}`);
}

// Explicit groups for the AI crawlers, each repeating the Disallows (a bot with its own group ignores "*").
const groups = robots.split(/\n\s*\n/).map((block) => block.split("\n").filter((l) => l && !l.startsWith("#")));
for (const bot of ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "Claude-SearchBot", "Claude-User", "ClaudeBot", "PerplexityBot", "Perplexity-User", "Googlebot", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot"]) {
  const group = groups.find((lines) => lines.includes(`User-agent: ${bot}`));
  assert.ok(group, `robots.txt: no group for ${bot}`);
  assert.ok(group.includes("Allow: /") && group.includes("Disallow: /api/") && group.includes("Disallow: /ops/"), `robots.txt: ${bot} group must allow / and keep /api/ + /ops/ disallowed`);
}
assert.ok(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), "robots.txt: Sitemap line missing");

// Free tools: hub + each tool in llms.txt and puna.md; llms-full sections (built from the same arrays) cover the 3 tools and the 6 rubro automatizaciones.
assert.equal(toolDefinitions.length, 3, "expected the 3 free tools");
assert.equal(rubroUseCases.length, 6, "expected the 6 rubro automatizaciones");
for (const [name, text] of [["llms.txt", llms], ["puna.md", md]]) {
  assert.ok(text.includes(`(${SITE}${TOOLS_BASE})`), `${name}: missing ${TOOLS_BASE}`);
  for (const tool of toolDefinitions) assert.ok(text.includes(`(${SITE}${toolPath(tool.slug)})`), `${name}: missing ${toolPath(tool.slug)}`);
}
const toolsFull = llmsToolDetailLines().join("\n");
for (const tool of toolDefinitions) {
  assert.ok(toolsFull.includes(`${SITE}${toolPath(tool.slug)}`) && toolsFull.includes(`### Herramienta: ${tool.name}`), `llms-full: tool ${tool.slug} missing`);
  for (const faq of tool.faqs) assert.ok(toolsFull.includes(faq.q), `llms-full: ${tool.slug} FAQ missing`);
}
const automationsFull = llmsAutomationDetailLines().join("\n");
for (const item of rubroUseCases) {
  assert.ok(automationsFull.includes(`URL canónica: ${SITE}${item.path}`) && automationsFull.includes(`### Automatización: ${item.title}`), `llms-full: ${item.path} missing`);
  for (const [q] of item.faqs) assert.ok(automationsFull.includes(q), `llms-full: ${item.path} FAQ missing`);
}
for (const item of useCases) assert.ok(automationsFull.includes(`${SITE}${item.path}`), `llms-full: ${item.path} missing`);
assert.ok(!/gpt-4o|claude 3\.5|gemini 1\.5|across the US/i.test(toolsFull + automationsFull), "llms-full: no stale model versions");
assert.ok(!/Fraticelli/i.test(toolsFull + automationsFull), "llms-full: no surname");

console.log("llms.txt + puna.md: OK");
