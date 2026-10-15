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
  ["/contact", "en", "https://www.puna-tech.com/contact", "https://www.puna-tech.com/og-en.png"],
  ["/es/contacto", "es", "https://www.puna-tech.com/es/contacto", "https://www.puna-tech.com/og-es.png"],
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
if (!englishHome.includes("Custom Software and AI Automation | Puna Tech")) failures.push("English homepage title did not render");
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
  ["/es/servicios/software-a-medida", "Software a medida para empresas en Argentina", "Guías relacionadas", [
    ["/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", "Cuándo dejar Zapier o n8n por software a medida"],
    ["/es/blog/auditar-integracion-crm-seguimiento-comercial", "Cómo auditar una integración CRM y el seguimiento comercial"],
  ]],
  ["/services/ai-automation", "Automate the handoffs that slow your operation down.", "Related guide", [
    ["/blog/when-to-use-ai-vs-deterministic-software", "When to use AI—and when deterministic software is the better choice"],
  ]],
  ["/es/servicios/automatizacion-ia", "Automatización de procesos con IA para empresas", "Guía relacionada", [
    ["/es/blog/cuando-usar-ia-vs-software-deterministico", "Cuándo usar IA y cuándo conviene software determinístico"],
  ]],
  ["/es/servicios/integraciones-de-datos", "Integración de sistemas para empresas en Argentina", "Guías relacionadas", [
    ["/es/blog/auditar-integracion-crm-seguimiento-comercial", "Cómo auditar una integración CRM y el seguimiento comercial"],
    ["/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", "Cuándo dejar Zapier o n8n por software a medida"],
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
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (title !== "Automatización de procesos con IA para empresas | Puna Tech") failures.push(`${route}: target-query title missing (${title})`);
  if (title.length > 60) failures.push(`${route}: title is ${title.length} characters`);
  if (!html.includes("<h1>Automatización de procesos con IA para empresas</h1>")) failures.push(`${route}: H1 changed`);
  const description = metaDescription(html);
  const expectedDescription = "Automatización de procesos con IA para pymes en Argentina: cobranzas, facturas, WhatsApp al CRM y reportes, con revisión humana. Diagnóstico en 15 min.";
  if (description !== expectedDescription || description.length > 155) failures.push(`${route}: target-query meta description (${description.length}: ${description})`);
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  if (questions.length < 5 || questions.length > 6) failures.push(`${route}: FAQPage should have 5 or 6 questions, found ${questions.length}`);
  for (const question of [
    "¿Qué es la automatización de procesos para una empresa?",
    "¿Qué procesos se pueden automatizar en una pyme argentina?",
    "¿Cuánto tarda automatizar un proceso?",
    "¿Cuánto cuesta automatizar un proceso?",
    "¿Conviene automatización a medida o alcanza con Make, n8n o Zapier?",
    "¿Qué pasa si la IA se equivoca?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
    if (!html.includes(question)) failures.push(`${route}: visible FAQ missing ${question}`);
  }
  const costAnswer = (faq?.mainEntity || []).find((item) => item.name === "¿Cuánto cuesta automatizar un proceso?")?.acceptedAnswer?.text || "";
  if (!/precio cerrado/i.test(costAnswer) || /\$\s?\d|\d+\s*(?:usd|dólares|dolares)/i.test(costAnswer)) failures.push(`${route}: cost FAQ publishes a price`);
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.name !== "Automatización de procesos con IA") failures.push(`${route}: Service schema name is not the target query`);
  if (service?.serviceType !== "Automatización de procesos") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  if (!JSON.stringify(service?.areaServed || {}).includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  for (const heading of [
    "Qué es la automatización de procesos con IA (y qué no)",
    "Qué procesos automatizamos en pymes y empresas argentinas",
    "Cómo trabajamos y en cuánto tiempo",
    "Cuándo conviene a medida y cuándo alcanza Make, n8n o Zapier",
    "Qué hace subir el costo de automatizar un proceso",
    "Cuándo conviene (y cuándo todavía no)",
  ]) {
    if (!html.includes(`<h2>${heading}</h2>`)) failures.push(`${route}: missing section ${heading}`);
  }
  if (!html.includes("Por ejemplo, una distribuidora")) failures.push(`${route}: examples are not labeled as examples`);
  if (!html.includes("un proceso en 2 semanas a precio cerrado")) failures.push(`${route}: timeline diverges from the existing 2-week offer`);
  if (!html.includes("No publicamos un precio de lista")) failures.push(`${route}: cost factors section missing`);
  if (!html.includes("Make, n8n o Zapier")) failures.push(`${route}: no-code comparison missing`);
  for (const path of [
    "/es/automatizaciones/automatizar-cobranzas",
    "/es/automatizaciones/carga-de-facturas-proveedores",
    "/es/automatizaciones/pedidos-por-whatsapp",
    "/es/integraciones/mercado-pago",
    "/es/servicios/software-a-medida",
    "/es/servicios/integraciones-de-datos",
    "/es/casos/automatizacion-gtm-b2b",
    "/es/casos/enrutamiento-leads-hubspot",
    "/es/casos/copiloto-linkedin-ia-hitl",
    "/es/contacto",
  ]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing contextual link ${path}`);
  }
  if (/US\$\s?\d|\$\s?\d{2,}|testimonio/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${route}: price or testimonial text found`);
  if (!html.includes('<h2 id="service-use-cases-heading">Casos de uso</h2>')) failures.push(`${route}: Casos de uso heading missing`);
  for (const path of [
    "/es/automatizaciones",
    "/es/automatizaciones/pedidos-por-whatsapp",
    "/es/automatizaciones/carga-de-facturas-proveedores",
    "/es/automatizaciones/facturacion-electronica-arca",
    "/es/automatizaciones/automatizar-cobranzas",
    "/es/automatizaciones/conciliacion-bancaria",
    "/es/integraciones",
  ]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: Casos de uso missing ${path}`);
  }
  const useCasesAt = html.indexOf("service-use-cases-heading");
  const finalCtaAt = html.indexOf("detail-cta");
  if (useCasesAt === -1 || finalCtaAt === -1 || useCasesAt > finalCtaAt) failures.push(`${route}: Casos de uso should stay above the final CTA`);
  if (JSON.stringify(nodes).match(/aggregateRating|"review"|"offers"|"price"/i)) failures.push(`${route}: JSON-LD includes invented commercial fields`);
}

for (const route of ["/es", "/es/servicios", "/es/servicios/software-a-medida", "/es/servicios/integraciones-de-datos", "/es/integraciones/mercado-pago", "/es/casos/automatizacion-gtm-b2b", "/es/casos/enrutamiento-leads-hubspot", "/es/casos/copiloto-linkedin-ia-hitl"]) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!/href="\/es\/servicios\/automatizacion-ia"[^>]*>automatización de procesos<\/a>/.test(html)) {
    failures.push(`${route}: missing keyword anchor link to /es/servicios/automatizacion-ia`);
  }
}

{
  const englishAutomation = await readFile(join(root, "services/ai-automation/index.html"), "utf8");
  if (englishAutomation.includes("service-use-cases-heading")) failures.push("/services/ai-automation: Spanish use-case block rendered on the English page");
}

for (const [route, href] of [["/es", "/es/servicios/automatizacion-ia"]]) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!html.includes(`href="${href}"`)) failures.push(`${route}: missing internal link to ${href}`);
}

{
  const route = "/es/servicios/software-a-medida";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (title !== "Software a medida para empresas en Argentina | Puna Tech") failures.push(`${route}: target-query title missing (${title})`);
  if (title.length > 60) failures.push(`${route}: title is ${title.length} characters`);
  const description = metaDescription(html);
  const expectedDescription = "Software a medida para empresas en Argentina: qué lo encarece, cuánto tarda y cuándo gana a Tango, un SaaS o n8n. Precio cerrado tras la llamada.";
  if (description !== expectedDescription || description.length > 155 || !/precio cerrado/i.test(description)) {
    failures.push(`${route}: target-query meta description (${description.length}: ${description})`);
  }
  for (const heading of [
    "Qué es el software a medida (y qué no)",
    "Qué sistemas hacemos para pymes y empresas",
    "Cómo trabajamos y en cuánto tiempo",
    "Cuánto cuesta un sistema a medida",
    "Software a medida frente a Tango, SaaS y no-code",
    "Cuándo conviene (y cuándo no)",
    "De quién es el código",
  ]) {
    if (!html.includes(`<h2>${heading}</h2>`)) failures.push(`${route}: missing section ${heading}`);
  }
  for (const phrase of ["software a la medida", "sistemas a medida", "desarrollo de software a medida", "n8n", "Zapier", "Tango"]) {
    if (!html.includes(phrase)) failures.push(`${route}: missing phrase ${phrase}`);
  }
  if (!html.includes("No publicamos un precio de lista")) failures.push(`${route}: cost factors section missing`);
  if (!html.includes("un primer módulo en 2 semanas a precio cerrado")) failures.push(`${route}: 2-week fixed-price offer missing`);
  if (!html.includes("Por ejemplo, una distribuidora")) failures.push(`${route}: examples are not labeled as examples`);
  for (const path of [
    "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida",
    "/es/automatizaciones/carga-de-facturas-proveedores",
    "/es/integraciones/mercado-pago",
    "/es/automatizaciones/pedidos-por-whatsapp",
    "/es/automatizaciones/automatizar-cobranzas",
    "/es/automatizaciones/facturacion-electronica-arca",
    "/es/automatizaciones/conciliacion-bancaria",
    "/es/integraciones/tienda-nube",
    "/es/integraciones/mercado-libre",
    "/es/contacto",
  ]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing contextual link ${path}`);
  }
  if (/US\$\s?\d|\$\s?\d{2,}|testimonio/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${route}: price or testimonial text found`);
  let blocks = [];
  let nodes = [];
  try {
    blocks = jsonLdBlocks(html);
    nodes = blocks.flatMap((block) => Array.isArray(block) ? block : [block]);
  } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const blockTypes = blocks.map((block) => block?.["@type"]);
  if (blocks.length < 3 || blocks.some((block) => Array.isArray(block))) {
    failures.push(`${route}: expected separate JSON-LD scripts, found ${blocks.length}`);
  }
  for (const type of ["Service", "BreadcrumbList", "FAQPage"]) {
    if (!blockTypes.includes(type)) failures.push(`${route}: JSON-LD script missing ${type}`);
  }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  if (questions.length < 6 || questions.length > 8) failures.push(`${route}: FAQPage should have 6 to 8 questions, found ${questions.length}`);
  for (const question of [
    "¿Cuánto cuesta el software a medida?",
    "¿Cuánto tarda?",
    "¿Quién es dueño del código?",
    "¿Hay mantenimiento después de la entrega?",
    "¿Se integra con lo que ya uso?",
    "¿Conviene software a medida o alcanza con n8n, Zapier o una planilla?",
    "¿Puedo empezar por un solo módulo?",
    "¿Trabajan con pymes en Argentina?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
    if (!html.includes(question)) failures.push(`${route}: visible FAQ missing ${question}`);
  }
  const costAnswer = (faq?.mainEntity || []).find((item) => item.name === "¿Cuánto cuesta el software a medida?")?.acceptedAnswer?.text || "";
  if (!/precio cerrado/i.test(costAnswer) || /\$\s?\d|\d+\s*(?:usd|dólares|dolares)/i.test(costAnswer)) failures.push(`${route}: cost FAQ is not a closed price after the call`);
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.serviceType !== "Desarrollo de software a medida") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  const area = JSON.stringify(service?.areaServed || {});
  if (!area.includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  if (!crumbs) failures.push(`${route}: BreadcrumbList JSON-LD missing`);
  if (!html.includes('rel="canonical" href="https://www.puna-tech.com/es/servicios/software-a-medida"')) failures.push(`${route}: canonical changed`);
  if (!html.includes('href="https://www.puna-tech.com/services/custom-software"')) failures.push(`${route}: English hreflang target changed`);
  if (JSON.stringify(nodes).match(/aggregateRating|"review"|"offers"|"price"/i)) failures.push(`${route}: JSON-LD includes invented commercial fields`);
}

for (const route of ["/es", "/es/servicios", "/es/automatizaciones", "/es/integraciones", "/es/automatizaciones/carga-de-facturas-proveedores", "/es/integraciones/mercado-pago", "/es/automatizaciones/pedidos-por-whatsapp", "/es/automatizaciones/automatizar-cobranzas", "/es/automatizaciones/facturacion-electronica-arca", "/es/automatizaciones/conciliacion-bancaria", "/es/integraciones/tienda-nube", "/es/integraciones/mercado-libre"]) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!/href="\/es\/servicios\/software-a-medida"[^>]*>software a medida<\/a>/.test(html)) {
    failures.push(`${route}: missing keyword anchor link to /es/servicios/software-a-medida`);
  }
  if (!/href="\/es\/servicios\/software-a-medida"[^>]*>sistemas a medida<\/a>/.test(html)) {
    failures.push(`${route}: missing sistemas a medida anchor to /es/servicios/software-a-medida`);
  }
}

{
  const route = "/services/data-integrations";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (html.includes("related-guides")) failures.push(`${route}: unexpected related guides block`);
  if (!html.includes("<title>CRM &amp; ERP Systems Integration for B2B | Puna Tech</title>") && !html.includes("<title>CRM & ERP Systems Integration for B2B | Puna Tech</title>")) failures.push(`${route}: English title changed`);
  if (!html.includes("<h1>Make your CRM, ERP, and tools exchange reliable information.</h1>")) failures.push(`${route}: English H1 changed`);
}

{
  const route = "/es/servicios/integraciones-de-datos";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) failures.push(`${route}: expected a single H1, found ${h1s.length}`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (title !== "Integración de sistemas para empresas | Puna Tech") failures.push(`${route}: target-query title missing (${title})`);
  if (title.length > 60) failures.push(`${route}: title is ${title.length} characters`);
  if (!html.includes("<h1>Integración de sistemas para empresas en Argentina</h1>")) failures.push(`${route}: H1 does not contain the query`);
  const description = metaDescription(html);
  if (!description.startsWith("Integración de sistemas") || description.length > 155 || !description.includes("Tienda Nube") || !description.includes("Mercado Pago") || !description.includes("15 min")) {
    failures.push(`${route}: target-query meta description (${description.length}: ${description})`);
  }
  for (const heading of [
    "Qué es la integración de sistemas (y qué no)",
    "Qué sistemas conectamos",
    "Cómo trabajamos y en cuánto tiempo",
    "Cuándo conviene una integración a medida y cuándo alcanza Zapier o n8n",
  ]) {
    if (!html.includes(`<h2>${heading}</h2>`)) failures.push(`${route}: missing section ${heading}`);
  }
  if (!html.includes("un proceso en 2 semanas a precio cerrado")) failures.push(`${route}: timeline diverges from the existing 2-week offer`);
  if (!html.includes("Por ejemplo, ventas carga el cliente")) failures.push(`${route}: examples are not labeled as examples`);
  for (const path of [
    "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida",
    "/es/blog/auditar-integracion-crm-seguimiento-comercial",
    "/es/integraciones/mercado-pago",
    "/es/integraciones/tienda-nube",
    "/es/integraciones/mercado-libre",
    "/es/automatizaciones/pedidos-por-whatsapp",
    "/es/automatizaciones/carga-de-facturas-proveedores",
    "/es/contacto",
    "/es/servicios/software-a-medida",
  ]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing contextual link ${path}`);
  }
  if (/US\$\s?\d|\$\s?\d{2,}|testimonio/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${route}: price or testimonial text found`);
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  if (questions.length < 5 || questions.length > 7) failures.push(`${route}: FAQPage should have 5 to 7 questions, found ${questions.length}`);
  for (const question of [
    "¿Qué es la integración de sistemas?",
    "¿Pueden integrar un CRM con un ERP?",
    "¿Qué es la integración de APIs?",
    "¿Integran Tienda Nube, Mercado Libre o Mercado Pago?",
    "¿Cuánto tarda una integración de sistemas?",
    "¿Cuánto cuesta integrar sistemas?",
    "¿Conviene una integración a medida o alcanza con Zapier o n8n?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
    if (!html.includes(question)) failures.push(`${route}: visible FAQ missing ${question}`);
  }
  const costAnswer = (faq?.mainEntity || []).find((item) => item.name === "¿Cuánto cuesta integrar sistemas?")?.acceptedAnswer?.text || "";
  if (!/precio cerrado/i.test(costAnswer) || /\$\s?\d|\d+\s*(?:usd|dólares|dolares)/i.test(costAnswer)) failures.push(`${route}: cost FAQ publishes a price`);
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.serviceType !== "Integración de sistemas") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.name !== "Integración de sistemas") failures.push(`${route}: Service schema name mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  const area = JSON.stringify(service?.areaServed || {});
  if (!area.includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  if (!crumbs) failures.push(`${route}: BreadcrumbList JSON-LD missing`);
  if (!html.includes('rel="canonical" href="https://www.puna-tech.com/es/servicios/integraciones-de-datos"')) failures.push(`${route}: canonical changed`);
  if (!html.includes('hreflang="en"') && !html.includes('hrefLang="en"')) failures.push(`${route}: English hreflang missing`);
  if (!html.includes('hreflang="es-AR"') && !html.includes('hrefLang="es-AR"')) failures.push(`${route}: es-AR hreflang missing`);
  if (!html.includes('href="https://www.puna-tech.com/services/data-integrations"')) failures.push(`${route}: English hreflang target changed`);
  if (JSON.stringify(nodes).match(/aggregateRating|"review"|"offers"|"price"/i)) failures.push(`${route}: JSON-LD includes invented commercial fields`);
}

const integrationAnchorRoutes = [
  "/es",
  "/es/servicios",
  "/es/casos",
  "/es/casos/enrutamiento-leads-hubspot",
  "/es/casos/automatizacion-gtm-b2b",
  "/es/automatizaciones",
  "/es/integraciones",
  "/es/automatizaciones/carga-de-facturas-proveedores",
  "/es/integraciones/mercado-pago",
  "/es/automatizaciones/pedidos-por-whatsapp",
  "/es/automatizaciones/automatizar-cobranzas",
  "/es/automatizaciones/facturacion-electronica-arca",
  "/es/automatizaciones/conciliacion-bancaria",
  "/es/integraciones/tienda-nube",
  "/es/integraciones/mercado-libre",
];
for (const route of integrationAnchorRoutes) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!/href="\/es\/servicios\/integraciones-de-datos"[^>]*>integración de sistemas<\/a>/.test(html)) {
    failures.push(`${route}: missing keyword anchor link to /es/servicios/integraciones-de-datos`);
  }
}

for (const [locale, html, prefix] of [["en", englishHome, "/case-studies/"], ["es", spanishHome, "/es/casos/"]]) {
  if (html.indexOf('id="services"') > html.indexOf('id="work"')) failures.push(`${locale}: services should appear before work`);
  const caseLinks = new Set([...html.matchAll(new RegExp(`href="(${prefix}[^"#?]+)"`, "g"))].map((match) => match[1]));
  if (caseLinks.size !== 8) failures.push(`${locale}: expected links to all 8 case studies, found ${caseLinks.size}`);
}


const useCaseExpectations = [
  ["/es/automatizaciones/carga-de-facturas-proveedores", "Automatizar carga de facturas de proveedores | Puna Tech", "/og/carga-de-facturas-proveedores.png"],
  ["/es/integraciones/mercado-pago", "Conciliación de pagos con Mercado Pago | Puna Tech", "/og/integracion-mercado-pago.png"],
  ["/es/automatizaciones/pedidos-por-whatsapp", "Automatizar pedidos por WhatsApp para empresas | Puna Tech", "/og/pedidos-por-whatsapp.png"],
  ["/es/automatizaciones/automatizar-cobranzas", "Automatizar cobranzas para empresas | Puna Tech", "/og/automatizar-cobranzas.png"],
  ["/es/integraciones/tienda-nube", "Integrar Tienda Nube con stock y ERP | Puna Tech", "/og/integracion-tienda-nube.png"],
  ["/es/integraciones/mercado-libre", "Integrar Mercado Libre con stock y ERP | Puna Tech", "/og/integracion-mercado-libre.png"],
  ["/es/automatizaciones/facturacion-electronica-arca", "Automatizar facturación electrónica ARCA | Puna Tech", "/og/facturacion-electronica-arca.png"],
  ["/es/automatizaciones/conciliacion-bancaria", "Conciliación bancaria automática para pymes | Puna Tech", "/og/conciliacion-bancaria.png"],
];
for (const [route, title, image] of useCaseExpectations) {
  const file = join(root, route.slice(1), "index.html");
  let html = "";
  try { html = await readFile(file, "utf8"); } catch { failures.push(`${route}: prerendered HTML is missing`); continue; }
  const titles = html.match(/<title>[^<]*<\/title>/g) || [];
  if (titles.length !== 1 || titles[0] !== `<title>${title}</title>`) failures.push(`${route}: title mismatch ${JSON.stringify(titles)}`);
  if (title.length > 60) failures.push(`${route}: title longer than 60 (${title.length})`);
  const description = metaDescription(html);
  if (description.length < 70 || description.length > 155) failures.push(`${route}: meta description length ${description.length}`);
  if (!html.includes('<html lang="es"')) failures.push(`${route}: html lang is not es`);
  if (!html.includes(`rel="canonical" href="https://www.puna-tech.com${route}"`)) failures.push(`${route}: canonical mismatch`);
  if (!html.includes(`property="og:image" content="https://www.puna-tech.com${image}"`)) failures.push(`${route}: og:image mismatch`);
  try { await access(join(root, image.slice(1))); } catch { failures.push(`${image}: OG asset missing from build`); }
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  if (!faq || (faq.mainEntity || []).length < 5) failures.push(`${route}: FAQPage JSON-LD missing or too short`);
  const service = nodes.find((node) => node["@type"] === "Service");
  if (!service || service.provider?.["@id"] !== "https://www.puna-tech.com/#organization") failures.push(`${route}: Service JSON-LD missing provider`);
  if (JSON.stringify(nodes).match(/aggregateRating|"review"|"offers"|"price"/i)) failures.push(`${route}: JSON-LD includes invented commercial fields`);
  if (!html.includes("Automatizamos un proceso en 2 semanas a precio cerrado.")) failures.push(`${route}: offer missing`);
  if (!html.includes('href="/es/contacto"')) failures.push(`${route}: contact CTA missing`);
  if (!html.includes("button-primary")) failures.push(`${route}: primary CTA missing`);
  if (/<link\b[^>]*\brel=["']alternate["'][^>]*\bhreflang=["']en["']/i.test(html) || /<link\b[^>]*\bhreflang=["']en["'][^>]*\brel=["']alternate["']/i.test(html)) {
    failures.push(`${route}: Spanish-only use case declares an English hreflang alternate`);
  }
  if (/US\$\s?\d|\$\s?\d{2,}|testimonio/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${route}: price or testimonial text found`);
  const hubPath = route.startsWith("/es/automatizaciones/") ? "/es/automatizaciones" : "/es/integraciones";
  if (!html.includes(`href="${hubPath}"`)) failures.push(`${route}: missing link to parent hub ${hubPath}`);
  for (const [linkRoute] of [["/es"], ["/es/servicios"]]) {
    const linking = await readFile(join(root, linkRoute.slice(1), "index.html"), "utf8");
    if (!linking.includes(`href="${route}"`)) failures.push(`${linkRoute}: missing internal link to ${route}`);
  }
}

{
  const route = "/es/integraciones/mercado-pago";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!html.includes("<h1>Conciliación de pagos con Mercado Pago y tu sistema</h1>")) failures.push(`${route}: H1 does not target conciliación de pagos`);
  const description = metaDescription(html);
  if (!description.includes("Conciliación de pagos")) failures.push(`${route}: meta description missing conciliación de pagos`);
  if (!html.includes("¿Qué es la conciliación de pagos con Mercado Pago?")) failures.push(`${route}: visible FAQ missing the payments query`);
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const questions = (nodes.find((node) => node["@type"] === "FAQPage")?.mainEntity || []).map((item) => item.name);
  if (!questions.includes("¿Qué es la conciliación de pagos con Mercado Pago?")) failures.push(`${route}: FAQPage missing the payments query`);
  if (!html.includes('href="/es/integraciones/mercado-libre"')) failures.push(`${route}: missing link to integrar Mercado Libre`);
}

const useCaseHubExpectations = [
  ["/es/automatizaciones", "Automatizaciones de procesos para empresas | Puna Tech", "Automatizaciones para el día a día de tu empresa", [
    "/es/automatizaciones/carga-de-facturas-proveedores",
    "/es/automatizaciones/pedidos-por-whatsapp",
    "/es/automatizaciones/automatizar-cobranzas",
    "/es/automatizaciones/facturacion-electronica-arca",
    "/es/automatizaciones/conciliacion-bancaria",
  ]],
  ["/es/integraciones", "Integraciones ML, Mercado Pago y Tienda Nube | Puna Tech", "Integraciones con Mercado Libre, Mercado Pago y Tienda Nube", [
    "/es/integraciones/mercado-pago",
    "/es/integraciones/tienda-nube",
    "/es/integraciones/mercado-libre",
  ]],
];
for (const [route, title, heading, children] of useCaseHubExpectations) {
  const file = join(root, route.slice(1), "index.html");
  let html = "";
  try { html = await readFile(file, "utf8"); } catch { failures.push(`${route}: prerendered HTML is missing`); continue; }
  const titles = html.match(/<title>[^<]*<\/title>/g) || [];
  if (titles.length !== 1 || titles[0] !== `<title>${title}</title>`) failures.push(`${route}: title mismatch ${JSON.stringify(titles)}`);
  if (title.length > 60) failures.push(`${route}: title longer than 60 (${title.length})`);
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1 || !html.includes(`<h1>${heading}</h1>`)) failures.push(`${route}: H1 mismatch`);
  const description = metaDescription(html);
  if (description.length < 70 || description.length > 155) failures.push(`${route}: meta description length ${description.length}`);
  if (!html.includes('<html lang="es"')) failures.push(`${route}: html lang is not es`);
  if (!html.includes(`rel="canonical" href="https://www.puna-tech.com${route}"`)) failures.push(`${route}: canonical mismatch`);
  if (!html.includes('href="/es/servicios/automatizacion-ia"')) failures.push(`${route}: missing link to automatización de procesos`);
  if (!html.includes('href="/es/contacto"') || !html.includes("button-primary")) failures.push(`${route}: hub CTA missing`);
  if (/<link\b[^>]*\brel=["']alternate["'][^>]*\bhreflang=["']en["']/i.test(html) || /<link\b[^>]*\bhreflang=["']en["'][^>]*\brel=["']alternate["']/i.test(html)) {
    failures.push(`${route}: Spanish-only hub declares an English hreflang alternate`);
  }
  for (const child of children) {
    if (!html.includes(`href="${child}"`)) failures.push(`${route}: missing card link ${child}`);
  }
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  if (!nodes.find((node) => node["@type"] === "BreadcrumbList")) failures.push(`${route}: BreadcrumbList JSON-LD missing`);
  const collection = nodes.find((node) => node["@type"] === "CollectionPage");
  const list = collection?.mainEntity?.["@type"] === "ItemList" ? collection.mainEntity : null;
  if (!collection || !list) failures.push(`${route}: CollectionPage ItemList JSON-LD missing`);
  const itemUrls = (list?.itemListElement || []).map((item) => item.url);
  if (list && list.numberOfItems !== children.length) failures.push(`${route}: ItemList count ${list.numberOfItems}, expected ${children.length}`);
  for (const child of children) {
    if (!itemUrls.includes(`https://www.puna-tech.com${child}`)) failures.push(`${route}: ItemList missing ${child}`);
  }
  for (const linkRoute of ["/es", "/es/servicios"]) {
    const linking = await readFile(join(root, linkRoute.slice(1), "index.html"), "utf8");
    if (!linking.includes(`href="${route}"`)) failures.push(`${linkRoute}: missing internal link to hub ${route}`);
  }
}

{
  const route = "/es/automatizaciones/automatizar-cobranzas";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (!html.includes("<h1>Automatizar cobranzas para pymes y empresas</h1>")) failures.push(`${route}: H1 does not answer the query`);
  const description = metaDescription(html);
  if (!description.startsWith("Automatizar cobranzas") || !description.includes("pymes") || !description.includes("Argentina") || !description.includes("15 min")) {
    failures.push(`${route}: meta description is not query-led (${description})`);
  }
  if (!html.includes("Por ejemplo, una distribuidora")) failures.push(`${route}: example is not labeled as an example`);
  if (!html.includes('href="/es/servicios/automatizacion-ia"')) failures.push(`${route}: missing link to the related service`);
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  for (const question of [
    "¿Se pueden automatizar las cobranzas de una pyme?",
    "¿Qué son las cobranzas automáticas para empresas?",
    "¿Cuánto tarda y cuánto cuesta?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
  }
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.serviceType !== "Automatización de cobranzas para empresas") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  if (!JSON.stringify(service?.areaServed || {}).includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  const crumbNames = (crumbs?.itemListElement || []).map((item) => item.name);
  if (!crumbNames.includes("Automatizar cobranzas")) failures.push(`${route}: BreadcrumbList missing the use case`);
}

{
  const route = "/es/integraciones/tienda-nube";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1 || !html.includes("<h1>Integrar Tienda Nube con tu ERP y el stock</h1>")) failures.push(`${route}: H1 does not answer the query`);
  const description = metaDescription(html);
  if (!description.startsWith("Integrar Tienda Nube") || !description.includes("ERP") || !description.includes("stock") || !description.includes("pymes") || !description.includes("Argentina") || !description.includes("15 min") || description.length > 155) {
    failures.push(`${route}: meta description is not query-led (${description.length}: ${description})`);
  }
  if (!html.includes("Por ejemplo, una tienda")) failures.push(`${route}: example is not labeled as an example`);
  for (const path of ["/es/servicios/integraciones-de-datos", "/es/integraciones/mercado-pago", "/es/integraciones/mercado-libre", "/es/servicios/software-a-medida", "/es/contacto"]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing related link ${path}`);
  }
  if (!html.includes("¿Cómo conectar Tienda Nube con el stock?")) failures.push(`${route}: visible FAQ missing the stock query`);
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  for (const question of [
    "¿Se puede integrar Tienda Nube con un ERP?",
    "¿Cómo conectar Tienda Nube con el stock?",
    "¿Qué es una integración de Tienda Nube?",
    "¿Cuánto tarda y cuánto cuesta?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
  }
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.serviceType !== "Integración de Tienda Nube con ERP y stock") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  if (!JSON.stringify(service?.areaServed || {}).includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  const crumbNames = (crumbs?.itemListElement || []).map((item) => item.name);
  if (!crumbNames.includes("Integrar Tienda Nube")) failures.push(`${route}: BreadcrumbList missing the use case`);
}

{
  const route = "/es/integraciones/mercado-libre";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1 || !html.includes("<h1>Integrar Mercado Libre con tu stock y tu ERP</h1>")) failures.push(`${route}: H1 does not answer the query`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (title.length < 45 || title.length > 60 || !title.endsWith(" | Puna Tech")) failures.push(`${route}: title length ${title.length} is outside 45-60`);
  const description = metaDescription(html);
  if (!description.startsWith("Integrar Mercado Libre") || !description.includes("ERP") || !description.includes("stock") || !description.includes("Tienda Nube") || !description.includes("pymes") || !description.includes("Argentina") || !description.includes("15 min") || description.length < 120 || description.length > 158) {
    failures.push(`${route}: meta description is not query-led (${description.length}: ${description})`);
  }
  if (!html.includes("Por ejemplo, un comercio")) failures.push(`${route}: example is not labeled as an example`);
  for (const path of ["/es/servicios/integraciones-de-datos", "/es/integraciones/tienda-nube", "/es/integraciones/mercado-pago", "/es/servicios/software-a-medida", "/es/contacto"]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing related link ${path}`);
  }
  for (const question of [
    "¿Se puede sincronizar el stock de Mercado Libre y Tienda Nube?",
    "¿Puedo facturar automáticamente las ventas de Mercado Libre?",
    "¿Necesito cambiar de ERP?",
  ]) {
    if (!html.includes(question)) failures.push(`${route}: visible FAQ missing ${question}`);
  }
  let nodes = [];
  try { nodes = jsonLdBlocks(html).flatMap((block) => Array.isArray(block) ? block : [block]); } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  if (questions.length < 5 || questions.length > 6) failures.push(`${route}: FAQPage should have 5 or 6 questions, found ${questions.length}`);
  for (const question of [
    "¿Se puede sincronizar el stock de Mercado Libre y Tienda Nube?",
    "¿Puedo facturar automáticamente las ventas de Mercado Libre?",
    "¿Necesito cambiar de ERP?",
    "¿Qué es una integración de Mercado Libre con el ERP?",
    "¿Cuánto tarda y cuánto cuesta?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
  }
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.serviceType !== "Integración de Mercado Libre con ERP y stock") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  if (!JSON.stringify(service?.areaServed || {}).includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  const crumbNames = (crumbs?.itemListElement || []).map((item) => item.name);
  if (!crumbNames.includes("Integrar Mercado Libre")) failures.push(`${route}: BreadcrumbList missing the use case`);
}

{
  const route = "/es/automatizaciones/facturacion-electronica-arca";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1 || !html.includes("<h1>Automatizar la facturación electrónica ARCA</h1>")) failures.push(`${route}: H1 does not answer the query`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (title !== "Automatizar facturación electrónica ARCA | Puna Tech") failures.push(`${route}: title mismatch (${title})`);
  if (title.length < 45 || title.length > 60 || !title.endsWith(" | Puna Tech")) failures.push(`${route}: title length ${title.length} is outside 45-60`);
  const description = metaDescription(html);
  if (!description.includes("CUIT") || !description.includes("A, B y C") || !description.includes("ERP") || !description.includes("stock") || !description.includes("pymes") || !description.includes("Argentina") || !description.includes("15 min") || description.length < 120 || description.length > 160) {
    failures.push(`${route}: meta description is not query-led (${description.length}: ${description})`);
  }
  const ogTitle = metaContent(html, "property", "og:title");
  const ogDescription = metaContent(html, "property", "og:description");
  if (ogTitle !== title) failures.push(`${route}: og:title mismatch`);
  if (ogDescription !== description) failures.push(`${route}: og:description mismatch`);
  if (!html.includes('property="og:image" content="https://www.puna-tech.com/og/facturacion-electronica-arca.png"')) failures.push(`${route}: og:image missing`);
  if (!html.includes("Por ejemplo, una distribuidora")) failures.push(`${route}: example is not labeled as an example`);
  for (const path of ["/es/integraciones/mercado-libre", "/es/automatizaciones/carga-de-facturas-proveedores", "/es/automatizaciones/automatizar-cobranzas", "/es/automatizaciones/conciliacion-bancaria", "/es/servicios/automatizacion-ia", "/es/contacto"]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing related link ${path}`);
  }
  for (const question of [
    "¿Se puede automatizar la facturación electrónica de ARCA?",
    "¿Cómo integrar la facturación electrónica con un ERP en Argentina?",
    "¿Qué comprobante corresponde, A, B o C?",
  ]) {
    if (!html.includes(question)) failures.push(`${route}: visible FAQ missing ${question}`);
  }
  let blocks = [];
  let nodes = [];
  try {
    blocks = jsonLdBlocks(html);
    nodes = blocks.flatMap((block) => Array.isArray(block) ? block : [block]);
  } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const blockTypes = blocks.map((block) => block?.["@type"]);
  for (const type of ["Service", "BreadcrumbList", "FAQPage"]) {
    if (!blockTypes.includes(type)) failures.push(`${route}: JSON-LD script missing ${type}`);
  }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  if (questions.length < 5 || questions.length > 6) failures.push(`${route}: FAQPage should have 5 or 6 questions, found ${questions.length}`);
  for (const question of [
    "¿Se puede automatizar la facturación electrónica de ARCA?",
    "¿Cómo integrar la facturación electrónica con un ERP en Argentina?",
    "¿Qué comprobante corresponde, A, B o C?",
    "¿Cuánto tarda y cuánto cuesta?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
  }
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.serviceType !== "Automatización de facturación electrónica ARCA") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  if (!JSON.stringify(service?.areaServed || {}).includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  const crumbNames = (crumbs?.itemListElement || []).map((item) => item.name);
  if (!crumbNames.includes("Facturación electrónica ARCA")) failures.push(`${route}: BreadcrumbList missing the use case`);
  for (const source of [
    "/es/automatizaciones",
    "/es/automatizaciones/automatizar-cobranzas",
    "/es/automatizaciones/carga-de-facturas-proveedores",
    "/es/automatizaciones/conciliacion-bancaria",
    "/es/integraciones/mercado-libre",
  ]) {
    const sourceHtml = await readFile(join(root, source.slice(1), "index.html"), "utf8");
    if (!sourceHtml.includes(`href="${route}"`)) failures.push(`${source}: missing link to ${route}`);
  }
}

{
  const route = "/es/automatizaciones/conciliacion-bancaria";
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1 || !html.includes("<h1>Conciliación bancaria automática para pymes y empresas</h1>")) failures.push(`${route}: H1 does not answer the query`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (title !== "Conciliación bancaria automática para pymes | Puna Tech") failures.push(`${route}: title mismatch (${title})`);
  if (title.length < 45 || title.length > 60 || !title.endsWith(" | Puna Tech")) failures.push(`${route}: title length ${title.length} is outside 45-60`);
  const description = metaDescription(html);
  if (!description.startsWith("Conciliación bancaria automática") || !description.includes("Mercado Pago") || !description.includes("facturas") || !description.includes("ERP") || !description.includes("pymes") || !description.includes("Argentina") || !description.includes("15 min") || description.length < 120 || description.length > 155) {
    failures.push(`${route}: meta description is not query-led (${description.length}: ${description})`);
  }
  const ogTitle = metaContent(html, "property", "og:title");
  const ogDescription = metaContent(html, "property", "og:description");
  if (ogTitle !== title) failures.push(`${route}: og:title mismatch`);
  if (ogDescription !== description) failures.push(`${route}: og:description mismatch`);
  if (!html.includes('property="og:image" content="https://www.puna-tech.com/og/conciliacion-bancaria.png"')) failures.push(`${route}: og:image missing`);
  if (!html.includes("Por ejemplo, un comercio")) failures.push(`${route}: example is not labeled as an example`);
  for (const path of ["/es/automatizaciones/automatizar-cobranzas", "/es/automatizaciones/facturacion-electronica-arca", "/es/integraciones/mercado-pago", "/es/servicios/automatizacion-ia", "/es/contacto"]) {
    if (!html.includes(`href="${path}"`)) failures.push(`${route}: missing related link ${path}`);
  }
  for (const question of [
    "¿Se puede automatizar la conciliación bancaria?",
    "¿Qué es la conciliación bancaria automática?",
    "¿Funciona con el banco y con Mercado Pago?",
  ]) {
    if (!html.includes(question)) failures.push(`${route}: visible FAQ missing ${question}`);
  }
  let blocks = [];
  let nodes = [];
  try {
    blocks = jsonLdBlocks(html);
    nodes = blocks.flatMap((block) => Array.isArray(block) ? block : [block]);
  } catch (error) { failures.push(`${route}: JSON-LD did not parse (${error.message})`); }
  const blockTypes = blocks.map((block) => block?.["@type"]);
  for (const type of ["Service", "BreadcrumbList", "FAQPage"]) {
    if (!blockTypes.includes(type)) failures.push(`${route}: JSON-LD script missing ${type}`);
  }
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const questions = (faq?.mainEntity || []).map((item) => item.name);
  if (questions.length < 5 || questions.length > 6) failures.push(`${route}: FAQPage should have 5 or 6 questions, found ${questions.length}`);
  for (const question of [
    "¿Se puede automatizar la conciliación bancaria?",
    "¿Qué es la conciliación bancaria automática?",
    "¿Funciona con el banco y con Mercado Pago?",
    "¿Cuánto tarda y cuánto cuesta?",
  ]) {
    if (!questions.includes(question)) failures.push(`${route}: FAQPage missing ${question}`);
  }
  const service = nodes.find((node) => node["@type"] === "Service");
  if (service?.serviceType !== "Conciliación bancaria automática para pymes") failures.push(`${route}: Service schema serviceType mismatch`);
  if (service?.inLanguage !== "es-AR") failures.push(`${route}: Service schema inLanguage is not es-AR`);
  if (!JSON.stringify(service?.areaServed || {}).includes("Argentina")) failures.push(`${route}: Service schema areaServed is not Argentina`);
  const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
  const crumbNames = (crumbs?.itemListElement || []).map((item) => item.name);
  if (!crumbNames.includes("Conciliación bancaria")) failures.push(`${route}: BreadcrumbList missing the use case`);
  if (/US\$\s?\d|\$\s?\d{2,}|testimonio|cliente real/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${route}: price or testimonial text found`);
  for (const source of [
    "/es/automatizaciones",
    "/es/automatizaciones/automatizar-cobranzas",
    "/es/automatizaciones/facturacion-electronica-arca",
    "/es/integraciones/mercado-pago",
  ]) {
    const sourceHtml = await readFile(join(root, source.slice(1), "index.html"), "utf8");
    if (!sourceHtml.includes(`href="${route}"`)) failures.push(`${source}: missing link to ${route}`);
  }
}

{
  const casesHubExpectations = [
    ["/es/casos", "Casos de software y automatización en Argentina | Puna Tech", "Casos de software a medida y automatización para pymes en Argentina: sistemas internos, cobranzas, facturas e integraciones que hoy se hacen a mano.", "Casos de software a medida y automatización en Argentina."],
    ["/case-studies", "Custom software and automation case studies | Puna Tech", "Custom software and automation case studies for businesses: internal systems, integrations, and processes that used to be done by hand.", "Custom software and automation case studies."],
  ];
  for (const [route, title, description, heading] of casesHubExpectations) {
    const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
    const renderedTitle = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
    if (renderedTitle !== title || title.length > 60) failures.push(`${route}: title mismatch (${renderedTitle.length}: ${renderedTitle})`);
    const renderedDescription = metaDescription(html);
    if (renderedDescription !== description || description.length > 155) failures.push(`${route}: meta description mismatch (${renderedDescription.length}: ${renderedDescription})`);
    if (/[—–]|el Lab|demos de lab|prueban arquitectura/i.test(`${title} ${description} ${heading}`)) failures.push(`${route}: SERP copy still uses jargon or a dash`);
    const h1s = html.match(/<h1[\s>]/g) || [];
    if (h1s.length !== 1 || !html.includes(`<h1>${heading}</h1>`)) failures.push(`${route}: H1 mismatch`);
  }
  const automationHub = await readFile(join(root, "es/automatizaciones/index.html"), "utf8");
  const automationDescription = metaDescription(automationHub);
  if (automationDescription.length > 155 || !automationDescription.includes("facturación electrónica ARCA") || !automationDescription.includes("conciliación") || !automationDescription.includes("2 semanas a precio cerrado")) {
    failures.push(`/es/automatizaciones: meta description (${automationDescription.length}: ${automationDescription})`);
  }
}

for (const route of ["/es/servicios/automatizacion-ia", "/es/servicios/software-a-medida", "/es/servicios"]) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  if (html.includes('href="/es#brief"')) failures.push(`${route}: brief CTA still jumps to /es#brief`);
  if (!html.includes('href="/es/contacto"')) failures.push(`${route}: missing contact page CTA`);
}
const contactExpectations = {
  "/es/contacto": {
    title: "Contacto | Software a medida Buenos Aires | Puna Tech",
    titleKeywords: ["software a medida", "Buenos Aires"],
    descriptionKeywords: ["software a medida", "Buenos Aires"],
    h1: "Contanos qué proceso te está frenando.",
  },
  "/contact": {
    title: "Contact | Custom Software Buenos Aires | Puna Tech",
    titleKeywords: ["Custom Software", "Buenos Aires"],
    descriptionKeywords: ["custom software", "Buenos Aires"],
    h1: "Tell us which process is slowing you down.",
  },
};
for (const route of ["/es/contacto", "/contact"]) {
  const html = await readFile(join(root, route.slice(1), "index.html"), "utf8");
  const expected = contactExpectations[route];
  const titles = html.match(/<title>[^<]*<\/title>/g) || [];
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (titles.length !== 1 || title !== expected.title) failures.push(`${route}: title mismatch ${JSON.stringify(titles)}`);
  if (title.length < 45 || title.length > 60) failures.push(`${route}: title length ${title.length} is outside 45-60`);
  if (!title.endsWith(" | Puna Tech")) failures.push(`${route}: title missing brand suffix`);
  const titleLower = title.toLowerCase();
  for (const keyword of expected.titleKeywords) {
    if (!titleLower.includes(keyword.toLowerCase())) failures.push(`${route}: title missing ${keyword}`);
  }
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*>/i)?.[0] || "";
  if (!ogTitle.includes(`content="${title}"`) && !ogTitle.includes(`content='${title}'`)) failures.push(`${route}: og:title mismatch`);
  if (!html.includes(`<h1>${expected.h1}</h1>`)) failures.push(`${route}: conversion H1 changed`);
  const description = metaDescription(html);
  if (description.length > 155) failures.push(`${route}: meta description longer than 155 (${description.length})`);
  const descriptionLower = description.toLowerCase();
  for (const keyword of expected.descriptionKeywords) {
    if (!descriptionLower.includes(keyword.toLowerCase())) failures.push(`${route}: meta description missing ${keyword}`);
  }
  if (!html.includes('action="/api/lead"')) failures.push(`${route}: brief form missing`);
  if (!html.includes("mailto:punatechba@gmail.com")) failures.push(`${route}: email missing`);
  if (!html.includes("cal.com/puna-tech-r7xi5x/15min")) failures.push(`${route}: Cal.com link missing`);
}
for (const [locale, html] of [["en", englishHome], ["es", spanishHome]]) {
  if (html.includes("mfrats-projects.vercel.app")) failures.push(`${locale}: home links to a protected Vercel deployment`);
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

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html, attribute, name) {
  const match = html.match(new RegExp(`<meta[^>]*${attribute}=["']${name}["'][^>]*>`, "i"))
    || html.match(new RegExp(`<meta[^>]*content=["'][^"']*["'][^>]*${attribute}=["']${name}["'][^>]*>`, "i"));
  if (!match) return "";
  const content = match[0].match(/content=["']([^"']*)["']/i);
  return content?.[1] || "";
}

function metaDescription(html) {
  return metaContent(html, "name", "description");
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
      ["/es/automatizaciones/no-existe", "es", "Página no encontrada | Puna Tech", "Página no encontrada.", 'href="/es"', "Volver al inicio"],
      ["/es/integraciones/no-existe", "es", "Página no encontrada | Puna Tech", "Página no encontrada.", 'href="/es"', "Volver al inicio"],
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
      if (path === "/es/blog" && !/href="\/es\/servicios\/software-a-medida"[^>]*>software a medida<\/a>/.test(page.html)) {
        failures.push(`${path}: missing keyword anchor link to /es/servicios/software-a-medida`);
      }
      if (path === "/es/blog" && !/href="\/es\/servicios\/integraciones-de-datos"[^>]*>integración de sistemas<\/a>/.test(page.html)) {
        failures.push(`${path}: missing keyword anchor link to /es/servicios/integraciones-de-datos`);
      }
      if (path === "/es/blog" && !page.html.includes('href="/es/automatizaciones/automatizar-cobranzas"')) {
        failures.push(`${path}: missing link to automatizar cobranzas`);
      }
      if (path === "/es/blog" && !page.html.includes('href="/es/integraciones/tienda-nube"')) {
        failures.push(`${path}: missing link to integrar Tienda Nube`);
      }
      if (path === "/es/blog" && !page.html.includes('href="/es/integraciones/mercado-libre"')) {
        failures.push(`${path}: missing link to integrar Mercado Libre`);
      }
    }

    const sitemap = await fetchPath("/sitemap.xml");
    if (sitemap.status !== 200) failures.push(`sitemap.xml: expected HTTP 200, got ${sitemap.status}`);
    for (const path of ["/privacy", "/terms", "/es/privacidad", "/es/terminos", "/contact", "/es/contacto", "/es/servicios/software-a-medida", "/es/servicios/integraciones-de-datos", "/es/automatizaciones/carga-de-facturas-proveedores", "/es/integraciones/mercado-pago", "/es/automatizaciones/pedidos-por-whatsapp", "/es/automatizaciones/automatizar-cobranzas", "/es/automatizaciones/facturacion-electronica-arca", "/es/automatizaciones/conciliacion-bancaria", "/es/integraciones/tienda-nube", "/es/integraciones/mercado-libre"]) {
      if (path === "/es/integraciones/mercado-libre" || path === "/es/automatizaciones/facturacion-electronica-arca" || path === "/es/automatizaciones/conciliacion-bancaria") {
        const block = sitemap.html.split("<url>").find((part) => part.includes(`https://www.puna-tech.com${path}</loc>`));
        if (!block || !block.includes('hreflang="es-AR"') || block.includes('hreflang="en"') || block.includes('hreflang="x-default"')) {
          failures.push(`sitemap.xml: ${path} is not ES-only hreflang`);
        }
      }
      if (!sitemap.html.includes(`https://www.puna-tech.com${path}<`) && !sitemap.html.includes(`https://www.puna-tech.com${path}`)) {
        failures.push(`sitemap.xml: missing ${path}`);
      }
    }
    for (const path of ["/es/automatizaciones", "/es/integraciones"]) {
      const page = await fetchPath(path);
      if (page.status !== 200) failures.push(`${path}: expected HTTP 200, got ${page.status}`);
      if (!sitemap.html.includes(`https://www.puna-tech.com${path}</loc>`)) failures.push(`sitemap.xml: missing hub ${path}`);
    }
    if (sitemap.html.includes("this-page-does-not-exist") || sitemap.html.includes("not-a-real-service")) {
      failures.push("sitemap.xml: includes a 404 URL");
    }
    const locs = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    if (locs.length < 20) failures.push(`sitemap.xml: expected the public page set, found ${locs.length} URLs`);
    for (const loc of locs) {
      const path = loc.replace("https://www.puna-tech.com", "") || "/";
      const page = await fetchPath(path === "" ? "/" : path);
      if (page.status !== 200) {
        failures.push(`${path}: sitemap URL returned ${page.status}`);
        continue;
      }
      const title = decodeHtml(page.html.match(/<title>([^<]*)<\/title>/)?.[1] || "");
      const description = decodeHtml(metaDescription(page.html));
      if (title.length < 45 || title.length > 60) failures.push(`${path}: title length ${title.length} is outside 45-60 (${title})`);
      if (!title.endsWith(" | Puna Tech")) failures.push(`${path}: title missing brand suffix (${title})`);
      if (description.length > 160) failures.push(`${path}: meta description is ${description.length} characters`);
      const ogTitle = decodeHtml(metaContent(page.html, "property", "og:title"));
      const twitterTitle = decodeHtml(metaContent(page.html, "name", "twitter:title"));
      const ogDescription = decodeHtml(metaContent(page.html, "property", "og:description"));
      const twitterDescription = decodeHtml(metaContent(page.html, "name", "twitter:description"));
      if (ogTitle !== title) failures.push(`${path}: og:title does not match title`);
      if (twitterTitle !== title) failures.push(`${path}: twitter:title does not match title`);
      if (ogDescription !== description) failures.push(`${path}: og:description does not match meta description`);
      if (twitterDescription !== description) failures.push(`${path}: twitter:description does not match meta description`);
    }

    const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
    const redirectSources = new Set(vercel.redirects.map((rule) => rule.source));
    const cobranzasRedirect = vercel.redirects.find((rule) => rule.source === "/es/automatizar-cobranzas");
    if (!cobranzasRedirect || cobranzasRedirect.statusCode !== 301 || cobranzasRedirect.destination !== "/es/automatizaciones/automatizar-cobranzas") {
      failures.push("/es/automatizar-cobranzas: expected one 301 to /es/automatizaciones/automatizar-cobranzas");
    } else if (redirectSources.has(cobranzasRedirect.destination)) {
      failures.push("/es/automatizar-cobranzas: destination is another redirect (chain)");
    } else {
      const response = await fetch(`http://127.0.0.1:${port}/es/automatizar-cobranzas`, { redirect: "manual" });
      const location = response.headers.get("location") || "";
      const pathname = location.startsWith("http") ? new URL(location).pathname : location.split("?")[0];
      if (response.status !== 301) failures.push(`/es/automatizar-cobranzas: app expected one 301, got ${response.status}`);
      if (pathname !== cobranzasRedirect.destination) failures.push(`/es/automatizar-cobranzas: app Location ${location} is not ${cobranzasRedirect.destination}`);
      await response.arrayBuffer();
      const target = await fetchPath(cobranzasRedirect.destination);
      if (target.status !== 200) failures.push(`${cobranzasRedirect.destination}: redirect target returned ${target.status}`);
    }
    const legacyRules = vercel.redirects.filter((rule) => rule.source.startsWith("/blog/") || rule.source.startsWith("/es/blog/"));
    const editorialPostsInSitemap = /<loc>https:\/\/www\.puna-tech\.com\/(?:es\/)?blog\/[^<]+<\/loc>/.test(sitemap.html);
    if (!legacyRules.length) failures.push("vercel.json: legacy blog redirects missing");
    for (const rule of legacyRules) {
      if (rule.statusCode !== 301) failures.push(`${rule.source}: expected HTTP 301, got ${rule.statusCode}`);
      if (redirectSources.has(rule.destination)) failures.push(`${rule.source}: ${rule.destination} is another redirect (chain)`);
      const isBlogArticle = /^\/(?:es\/)?blog\/.+/.test(rule.destination);
      const inSitemap = sitemap.html.includes(`https://www.puna-tech.com${rule.destination}<`);
      if (!inSitemap && !(isBlogArticle && !editorialPostsInSitemap)) {
        failures.push(`${rule.source}: destination ${rule.destination} is not in the sitemap`);
      }
      const response = await fetch(`http://127.0.0.1:${port}${rule.source}`, { redirect: "manual" });
      const location = response.headers.get("location") || "";
      const pathname = location.startsWith("http") ? new URL(location).pathname : location.split("?")[0];
      if (response.status !== 301) failures.push(`${rule.source}: app expected one 301, got ${response.status}`);
      if (pathname !== rule.destination) failures.push(`${rule.source}: app Location ${location} is not ${rule.destination}`);
      await response.arrayBuffer();
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
