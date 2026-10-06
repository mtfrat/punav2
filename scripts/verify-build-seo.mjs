import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../build/client/", import.meta.url));
const routes = [
  ["/", "en", "https://www.puna-tech.com/", "https://www.puna-tech.com/og-en.png"],
  ["/es", "es", "https://www.puna-tech.com/es", "https://www.puna-tech.com/og-es.png"],
  ["/services", "en", "https://www.puna-tech.com/services", "https://www.puna-tech.com/og-en.png"],
  ["/es/servicios", "es", "https://www.puna-tech.com/es/servicios", "https://www.puna-tech.com/og-es.png"],
  ["/case-studies", "en", "https://www.puna-tech.com/case-studies", "https://www.puna-tech.com/og-en.png"],
  ["/es/casos", "es", "https://www.puna-tech.com/es/casos", "https://www.puna-tech.com/og-es.png"],
  ["/services/ai-automation", "en", "https://www.puna-tech.com/services/ai-automation", "https://www.puna-tech.com/og-en.png"],
  ["/es/servicios/automatizacion-ia", "es", "https://www.puna-tech.com/es/servicios/automatizacion-ia", "https://www.puna-tech.com/og-es.png"],
  ["/services/custom-software", "en", "https://www.puna-tech.com/services/custom-software", "https://www.puna-tech.com/og-en.png"],
  ["/es/servicios/software-a-medida", "es", "https://www.puna-tech.com/es/servicios/software-a-medida", "https://www.puna-tech.com/og-es.png"],
  ["/case-studies/autopost-b2b-content-studio", "en", "https://www.puna-tech.com/case-studies/autopost-b2b-content-studio", "https://www.puna-tech.com/og-en.png"],
  ["/es/casos/autopost-estudio-contenido-b2b", "es", "https://www.puna-tech.com/es/casos/autopost-estudio-contenido-b2b", "https://www.puna-tech.com/og-es.png"],
];

const failures = [];
for (const [route, language, canonical, image] of routes) {
  const file = route === "/" ? join(root, "index.html") : join(root, route.slice(1), "index.html");
  try {
    await access(file);
  } catch {
    failures.push(`${route}: prerendered HTML is missing (${file})`);
    continue;
  }
  const html = await readFile(file, "utf8");
  const expect = (condition, label) => { if (!condition) failures.push(`${route}: ${label}`); };
  expect(new RegExp(`<html[^>]+lang=["']${language}["']`).test(html), `html lang is not ${language}`);
  expect(/<title>[^<]{10,}Puna Tech[^<]*<\/title>/.test(html), "missing descriptive title");
  expect(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}/.test(html), "missing substantive meta description");
  expect(html.includes(`rel="canonical" href="${canonical}"`) || html.includes(`rel='canonical' href='${canonical}'`), `canonical mismatch (expected ${canonical})`);
  expect(html.includes('hreflang="en"') || html.includes('hrefLang="en"'), "English hreflang missing");
  expect(html.includes('hreflang="es-AR"') || html.includes('hrefLang="es-AR"'), "es-AR hreflang missing");
  expect(html.includes('hreflang="x-default"') || html.includes('hrefLang="x-default"'), "x-default hreflang missing");
  expect(html.includes(`property="og:image" content="${image}"`), `Open Graph image mismatch (expected ${image})`);
  expect(html.includes('property="og:image:width" content="1200"'), "Open Graph image width missing");
  expect(html.includes('property="og:image:height" content="630"'), "Open Graph image height missing");
  expect(html.includes('property="og:image:alt"'), "Open Graph image alt missing");
  expect(html.includes('name="twitter:card" content="summary_large_image"'), "Twitter card missing");
  expect(html.includes('type="application/ld+json"'), "JSON-LD missing");
  expect(!html.includes("/og-image.png"), "stale Open Graph image reference remains");
}

for (const image of ["og-en.png", "og-es.png"]) {
  try { await access(join(root, image)); } catch { failures.push(`/${image}: generated asset is missing from build`); }
}

const englishHome = await readFile(join(root, "index.html"), "utf8");
const spanishHome = await readFile(join(root, "es", "index.html"), "utf8");
if (!englishHome.includes("Custom Software &amp; AI Automation | Puna Tech") && !englishHome.includes("Custom Software & AI Automation | Puna Tech")) failures.push("English homepage title did not render");
if (!spanishHome.includes("Software a Medida y Automatización con IA | Puna Tech")) failures.push("Spanish homepage title did not render");
if (!englishHome.includes("Custom software for operations that outgrew off-the-shelf tools.")) failures.push("English homepage H1 changed");
if (!spanishHome.includes("Software a medida para operaciones que ya superaron las herramientas estándar.")) failures.push("Spanish homepage H1 changed");

const spanishDescription = "Software a medida para automatizar operaciones B2B en Buenos Aires, Argentina: automatización, integraciones y sistemas que tu equipo puede operar.";
if (spanishDescription.length > 150) failures.push(`Spanish homepage meta description is ${spanishDescription.length} characters`);
for (const phrase of ["software a medida", "automatizar", "B2B", "Argentina", "Buenos Aires"]) {
  if (!spanishDescription.includes(phrase)) failures.push(`Spanish homepage meta description missing ${phrase}`);
}
for (const html of [spanishHome]) {
  if (!html.includes(`name="description" content="${spanishDescription}"`) && !html.includes(`content="${spanishDescription}" name="description"`)) {
    failures.push("Spanish homepage meta description did not render");
  }
  if (!html.includes(`property="og:description" content="${spanishDescription}"`)) failures.push("Spanish homepage og:description did not match meta description");
  if (!html.includes(`name="twitter:description" content="${spanishDescription}"`)) failures.push("Spanish homepage twitter:description did not match meta description");
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => {
    const raw = match[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    return JSON.parse(raw);
  });
}

const serviceHubExpectations = [
  ["/services", "Custom software, automation, and integrations for B2B operations.", "We start with the bottleneck, not the technology.", [
    ["Custom B2B software", "https://www.puna-tech.com/services/custom-software"],
    ["Process automation · AI workflows", "https://www.puna-tech.com/services/ai-automation"],
    ["Data & systems integration", "https://www.puna-tech.com/services/data-integrations"],
  ]],
  ["/es/servicios", "Software a medida, automatización e integraciones para operaciones B2B.", "Empezamos por el cuello de botella, no por la tecnología.", [
    ["Software B2B a medida", "https://www.puna-tech.com/es/servicios/software-a-medida"],
    ["Automatización de procesos · flujos con IA", "https://www.puna-tech.com/es/servicios/automatizacion-ia"],
    ["Integración de datos y sistemas", "https://www.puna-tech.com/es/servicios/integraciones-de-datos"],
  ]],
];

for (const [route, heading, lead, items] of serviceHubExpectations) {
  const file = join(root, route.slice(1), "index.html");
  const html = await readFile(file, "utf8");
  if (!html.includes(`<h1>${heading}</h1>`)) failures.push(`${route}: H1 is not the target keyword heading`);
  if (!html.includes(lead)) failures.push(`${route}: bottleneck lead is missing`);
  let blocks = [];
  try {
    blocks = jsonLdBlocks(html);
  } catch (error) {
    failures.push(`${route}: JSON-LD did not parse (${error.message})`);
    continue;
  }
  const nodes = blocks.flatMap((block) => Array.isArray(block) ? block : [block]);
  const collection = nodes.find((node) => node["@type"] === "CollectionPage");
  const list = collection?.mainEntity?.["@type"] === "ItemList" ? collection.mainEntity : nodes.find((node) => node["@type"] === "ItemList");
  if (!list) {
    failures.push(`${route}: ItemList JSON-LD missing`);
    continue;
  }
  const listed = (list.itemListElement || []).map((item) => [item.name, item.url]);
  const expected = items.map(([name, url]) => [name, url]);
  if (JSON.stringify(listed) !== JSON.stringify(expected)) {
    failures.push(`${route}: ItemList entries mismatch ${JSON.stringify(listed)}`);
  }
  const publisherId = collection?.publisher?.["@id"];
  if (publisherId !== "https://www.puna-tech.com/#organization") {
    failures.push(`${route}: CollectionPage publisher is not the home Organization @id`);
  }
  if (JSON.stringify(list).match(/review|aggregateRating|price|offers/i)) {
    failures.push(`${route}: ItemList includes invented commercial fields`);
  }
}
for (const [locale, html, prefix] of [["en", englishHome, "/case-studies/"], ["es", spanishHome, "/es/casos/"]]) {
  if (html.indexOf('id="services"') > html.indexOf('id="work"')) failures.push(`${locale}: services should appear before work`);
  const caseLinks = new Set([...html.matchAll(new RegExp(`href="(${prefix}[^"#?]+)"`, "g"))].map((match) => match[1]));
  if (caseLinks.size !== 8) failures.push(`${locale}: expected links to all 8 case studies, found ${caseLinks.size}`);
}

for (const routeFile of ["blog-index.tsx", "blog-post.tsx"]) {
  const source = await readFile(new URL(`../src/routes/${routeFile}`, import.meta.url), "utf8");
  if (!source.includes('timeZone: "America/Argentina/Buenos_Aires"')) {
    failures.push(`${routeFile}: blog dates must use the Buenos Aires timezone during SSR and hydration`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`Verified initial HTML SEO/GEO metadata for ${routes.length} bilingual routes.`);
