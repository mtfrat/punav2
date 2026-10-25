import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { useCaseHubs, useCases } from "../src/content/use-cases.ts";
import { buildLlmsTxt, buildPunaMd, PUNA_MD_PATH } from "../src/lib/llms.ts";

const SITE = "https://www.puna-tech.com";
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
  for (const match of text.matchAll(/\]\((https?:[^)]+)\)/g)) assert.ok(match[1].startsWith(SITE), `${name}: off-site link ${match[1]}`);
}

assert.ok(llms.includes(`${SITE}${PUNA_MD_PATH}`), "llms.txt must point to /puna.md");
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

console.log("llms.txt + puna.md: OK");
