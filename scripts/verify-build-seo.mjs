import { access, readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import express from "express";
import { createRequestHandler } from "@react-router/express";

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

try {
  const ico = await readFile(join(root, "favicon.ico"));
  const count = ico.readUInt16LE(4);
  if (ico.length < 32 || ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) failures.push("favicon.ico is not an ICO file");
  if (count < 3) failures.push(`favicon.ico should include 16, 32, and 48px images, found ${count}`);
} catch {
  failures.push("/favicon.ico: generated asset is missing from build");
}

const englishHome = await readFile(join(root, "index.html"), "utf8");
const spanishHome = await readFile(join(root, "es", "index.html"), "utf8");
if (!englishHome.includes("Custom Software &amp; AI Automation | Puna Tech") && !englishHome.includes("Custom Software & AI Automation | Puna Tech")) failures.push("English homepage title did not render");
if (!spanishHome.includes("Software a Medida y Automatización con IA | Puna Tech")) failures.push("Spanish homepage title did not render");
if (!englishHome.includes("Custom software for operations that ") || !englishHome.includes("outgrew off-the-shelf tools")) failures.push("English homepage H1 changed");
if (!spanishHome.includes("Software a medida para operaciones que ya superaron las ") || !spanishHome.includes("herramientas estándar")) failures.push("Spanish homepage H1 changed");

const spanishDescription = "Software a medida para automatizar operaciones B2B en Buenos Aires, Argentina: automatización, integraciones y sistemas que tu equipo puede operar.";
if (spanishDescription.length > 150) failures.push(`Spanish homepage meta description is ${spanishDescription.length} characters`);
for (const phrase of ["software a medida", "automatizar", "B2B", "Argentina", "Buenos Aires"]) {
  if (!spanishDescription.toLowerCase().includes(phrase.toLowerCase())) failures.push(`Spanish homepage meta description missing ${phrase}`);
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
    ["Automatización de procesos con IA", "https://www.puna-tech.com/es/servicios/automatizacion-ia"],
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
const serviceGuideExpectations = [
  ["/services/custom-software", "Custom software for operations that need their own product.", "Related guides", [
    ["/blog/when-to-leave-zapier-n8n-for-custom-software", "When to leave Zapier or n8n for custom software"],
    ["/blog/audit-crm-integration-commercial-follow-up", "How to audit a CRM integration and commercial follow-up workflow"],
  ]],
  ["/es/servicios/software-a-medida", "Software a medida para operaciones que necesitan un producto propio.", "Guías relacionadas", [
    ["/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", "Cuándo dejar Zapier o n8n por software a medida"],
    ["/es/blog/auditar-integracion-crm-seguimiento-comercial", "Cómo auditar una integración CRM y el seguimiento comercial"],
  ]],
  ["/services/ai-automation", "Automate the handoffs that slow your operation down.", "Related guide", [
    ["/blog/when-to-use-ai-vs-deterministic-software", "When to use AI—and when deterministic software is the better choice"],
  ]],
  ["/es/servicios/automatizacion-ia", "Automatización de procesos con IA para empresas", "Guía relacionada", [
    ["/es/blog/cuando-usar-ia-vs-software-deterministico", "Cuándo usar IA y cuándo conviene software determinístico"],
  ]],
];

for (const [route, heading, label, guides] of serviceGuideExpectations) {
  const file = join(root, route.slice(1), "index.html");
  const html = await readFile(file, "utf8");
  if (!html.includes(`<h1>${heading}</h1>`)) failures.push(`${route}: service H1 changed`);
  if (!html.includes(`<h2 id="related-guides-heading">${label}</h2>`)) failures.push(`${route}: related guide label missing`);
  if (!html.includes("button-primary")) failures.push(`${route}: primary CTA missing`);
  for (const [path, title] of guides) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing guide link ${path}`);
    if (!html.includes(title)) failures.push(`${route}: missing guide title ${title}`);
  }
  const finalCta = html.indexOf("detail-cta");
  const guidesAt = html.indexOf("related-guides");
  if (guidesAt === -1 || finalCta === -1 || guidesAt > finalCta) failures.push(`${route}: related guides should stay above the final CTA`);
}

{
  const route = "/es/servicios/automatizacion-ia";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!html.includes("<title>Automatización de procesos con IA para empresas | Puna Tech</title>")) failures.push(`${route}: target-query title missing`);
  const description = metaDescription(html);
  if (!description.startsWith("Automatización de procesos con IA") || description.length > 155) failures.push(`${route}: target-query meta description (${description.length})`);
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  if (!faq || (faq.mainEntity || []).length < 5) failures.push(`${route}: FAQPage JSON-LD missing or too short`);
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.name !== "Automatización de procesos con IA") failures.push(`${route}: Service schema name is not the target query`);
  for (const heading of ["Qué es la automatización de procesos con IA (y qué no)", "Qué procesos automatizamos en pymes y empresas argentinas", "Cómo trabajamos y en cuánto tiempo"]) {
    if (!html.includes(`<h2>${heading}</h2>`)) failures.push(`${route}: missing section ${heading}`);
  }
}

for (const [route, href] of [["/es", "/es/servicios/automatizacion-ia"]]) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!html.includes(`href="${href}"`)) failures.push(`${route}: missing internal link to ${href}`);
}

for (const route of ["/services/data-integrations", "/es/servicios/integraciones-de-datos"]) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (html.includes("related-guides")) failures.push(`${route}: unexpected related guides block`);
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

const privacyDescription = {
  en: "How Puna Tech handles website and inquiry data.",
  es: "Cómo Puna Tech gestiona los datos del sitio y las consultas.",
};
const termsDescription = {
  en: "Terms of use for the Puna Tech website. Pages are general information, not a binding proposal, and a discovery call or brief is not a signed agreement.",
  es: "Términos de uso del sitio de Puna Tech. El contenido es información general, no una propuesta vinculante, y una llamada o un brief no son un acuerdo firmado.",
};

function metaDescription(html) {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*>/i);
  if (!match) return "";
  const content = match[0].match(/content=["']([^"']*)["']/i);
  return content?.[1] || "";
}

const legalPages = [
  ["/privacy", "en", "https://www.puna-tech.com/privacy", "https://www.puna-tech.com/es/privacidad", privacyDescription.en, "Google Analytics"],
  ["/es/privacidad", "es", "https://www.puna-tech.com/es/privacidad", "https://www.puna-tech.com/privacy", privacyDescription.es, "Google Analytics"],
  ["/terms", "en", "https://www.puna-tech.com/terms", "https://www.puna-tech.com/es/terminos", termsDescription.en, null],
  ["/es/terminos", "es", "https://www.puna-tech.com/es/terminos", "https://www.puna-tech.com/terms", termsDescription.es, null],
];

for (const [route, language, canonical, alternate, description, cookieMarker] of legalPages) {
  const file = join(root, route.slice(1), "index.html");
  let html = "";
  try {
    html = await readFile(file, "utf8");
  } catch {
    failures.push(`${route}: prerendered HTML is missing`);
    continue;
  }
  const rendered = metaDescription(html);
  if (rendered !== description) failures.push(`${route}: meta description mismatch (${rendered})`);
  if (!cookieMarker && (description.length < 50 || description.length > 160)) failures.push(`${route}: meta description length is ${description.length}`);
  if (!html.includes(`<html lang="${language}"`) && !html.includes(`<html lang='${language}'`)) failures.push(`${route}: html lang is not ${language}`);
  if (!html.includes(`rel="canonical" href="${canonical}"`) && !html.includes(`rel='canonical' href='${canonical}'`)) failures.push(`${route}: canonical mismatch`);
  if (!html.includes('hreflang="en"') && !html.includes('hrefLang="en"')) failures.push(`${route}: English hreflang missing`);
  if (!html.includes('hreflang="es-AR"') && !html.includes('hrefLang="es-AR"')) failures.push(`${route}: es-AR hreflang missing`);
  if (!html.includes('hreflang="x-default"') && !html.includes('hrefLang="x-default"')) failures.push(`${route}: x-default hreflang missing`);
  if (!html.includes(alternate)) failures.push(`${route}: missing alternate ${alternate}`);
  if (cookieMarker && !html.includes(cookieMarker)) failures.push(`${route}: privacy page does not mention ${cookieMarker}`);
  if (cookieMarker && !/cookie/i.test(html)) failures.push(`${route}: privacy page does not mention cookies`);
}

if (termsDescription.en === privacyDescription.en || termsDescription.es === privacyDescription.es) {
  failures.push("Terms meta description still duplicates privacy");
}

const serverRoot = fileURLToPath(new URL("../build/server/", import.meta.url));
const runtimeDir = (await readdir(serverRoot)).find((name) => name.startsWith("nodejs_"));
if (!runtimeDir) failures.push("Server build directory is missing");
else {
  const serverBuild = await import(pathToFileURL(join(serverRoot, runtimeDir, "index.js")).href);
  const app = express();
  app.use(createRequestHandler({ build: serverBuild, mode: "production" }));
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  async function fetchPath(path) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    return { status: response.status, html: await response.text() };
  }

  try {
    const notFoundPages = [
      ["/this-page-does-not-exist", "en", "Page not found | Puna Tech", "Page not found.", 'href="/"', "Return home"],
      ["/es/esta-pagina-no-existe", "es", "Página no encontrada | Puna Tech", "Página no encontrada.", 'href="/es"', "Volver al inicio"],
      ["/services/not-a-real-service", "en", "Page not found | Puna Tech", "Page not found.", 'href="/"', "Return home"],
      ["/es/servicios/servicio-inexistente", "es", "Página no encontrada | Puna Tech", "Página no encontrada.", 'href="/es"', "Volver al inicio"],
      ["/case-studies/not-a-real-case", "en", "Page not found | Puna Tech", "Page not found.", 'href="/"', "Return home"],
      ["/blog/not-a-real-post", "en", "Page not found | Puna Tech", "Page not found.", 'href="/"', "Return home"],
    ];
    for (const [path, language, title, heading, homeHref, cta] of notFoundPages) {
      const { status, html } = await fetchPath(path);
      if (status !== 404) failures.push(`${path}: expected HTTP 404, got ${status}`);
      if (!html.includes(`<html lang="${language}"`) && !html.includes(`<html lang='${language}'`)) failures.push(`${path}: html lang is not ${language}`);
      const titles = html.match(/<title>[^<]*<\/title>/g) || [];
      if (titles.length !== 1 || titles[0] !== `<title>${title}</title>`) failures.push(`${path}: title mismatch ${JSON.stringify(titles)}`);
      if (!html.includes(`<h1>${heading}</h1>`)) failures.push(`${path}: missing heading ${heading}`);
      if (!html.includes("site-header") || !html.includes("site-footer")) failures.push(`${path}: missing branded header or footer`);
      if (!html.includes(homeHref) || !html.includes(cta)) failures.push(`${path}: missing home link`);
      if (html.includes("This page could not be found.")) failures.push(`${path}: default Next 404 copy remains`);
      if (html.includes('rel="canonical"') || html.includes("rel='canonical'")) failures.push(`${path}: 404 should not declare a canonical`);
    }

    for (const [path, language] of [["/blog", "en"], ["/es/blog", "es-AR"]]) {
      const page = await fetchPath(path);
      if (page.status !== 200) {
        failures.push(`${path}: expected HTTP 200, got ${page.status}`);
        continue;
      }
      let blocks = [];
      try {
        blocks = jsonLdBlocks(page.html);
      } catch (error) {
        failures.push(`${path}: JSON-LD did not parse (${error.message})`);
        continue;
      }
      const nodes = blocks.flatMap((block) => Array.isArray(block) ? block : [block]);
      const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
      const collection = nodes.find((node) => node["@type"] === "CollectionPage");
      const list = collection?.mainEntity?.["@type"] === "ItemList" ? collection.mainEntity : null;
      if (!crumbs) failures.push(`${path}: BreadcrumbList JSON-LD missing`);
      if (!collection || !list) failures.push(`${path}: CollectionPage ItemList JSON-LD missing`);
      if (collection?.inLanguage !== language) failures.push(`${path}: blog hub inLanguage is ${collection?.inLanguage}`);
      const crumbUrls = (crumbs?.itemListElement || []).map((item) => item.item);
      const itemUrls = (list?.itemListElement || []).map((item) => item.url);
      for (const url of [...crumbUrls, ...itemUrls]) {
        if (typeof url !== "string" || !url.startsWith("https://www.puna-tech.com/")) failures.push(`${path}: schema URL is not absolute (${url})`);
      }
      if (list && list.numberOfItems !== (list.itemListElement || []).length) failures.push(`${path}: ItemList count mismatch`);
      const serviceHref = path === "/blog" ? "/services/ai-automation" : "/es/servicios/automatizacion-ia";
      if (!page.html.includes(`href="${serviceHref}"`)) failures.push(`${path}: blog hub missing link to ${serviceHref}`);
    }

    const sitemap = await fetchPath("/sitemap.xml");
    if (sitemap.status !== 200) failures.push(`sitemap.xml: expected HTTP 200, got ${sitemap.status}`);
    for (const path of ["/privacy", "/terms", "/es/privacidad", "/es/terminos"]) {
      if (!sitemap.html.includes(`https://www.puna-tech.com${path}<`) && !sitemap.html.includes(`https://www.puna-tech.com${path}`)) {
        failures.push(`sitemap.xml: missing ${path}`);
      }
    }
    if (sitemap.html.includes("this-page-does-not-exist") || sitemap.html.includes("not-a-real-service")) {
      failures.push("sitemap.xml: includes a 404 URL");
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`Verified initial HTML SEO/GEO metadata for ${routes.length} bilingual routes.`);
