/**
 * "Sobre Puna Tech" facts: one source for /es/sobre-puna, /about, llms.txt, llms-full.txt and puna.md.
 * Only facts already published on the site. No address, phone, tax ID, legal name or founder surname.
 * No prices (the policy is a closed price in writing after the call).
 */
import { CONTACT_EMAIL, SITE_URL, servicePath, type Locale } from "./chrome.ts";
import { rubroDefinitions, rubroPath } from "./rubros.ts";
import { TOOLS_BASE, toolDefinitions, toolHub, toolPath } from "./tools.ts";
import { rubroUseCases } from "./use-cases-rubros.ts";
import { useCases } from "./use-cases.ts";

export const ABOUT_PATH: Record<Locale, string> = { es: "/es/sobre-puna", en: "/about" };

import { CM_REPO_URL } from "./rubro-faq.ts";
export { CM_REPO_URL };
export const CM_DEMO_PATH: Record<Locale, string> = { es: "/es/demos/convenio-multilateral", en: "/demos/multilateral-agreement" };

const abs = (path: string) => `${SITE_URL}${path}`;

export interface AboutCopy {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  definition: string;
  factsTitle: string;
  facts: [label: string, value: string][];
  whatTitle: string;
  whatLinks: [label: string, path: string][];
  whoTitle: string;
  whoLead: string;
  howTitle: string;
  how: string[];
  notTitle: string;
  not: string[];
  toolsTitle: string;
  toolsBody: string;
  toolsRepo: string;
  toolsDemo: string;
  casesTitle: string;
  casesBody: string;
  casesLink: string;
  contactTitle: string;
  contactBody: string;
  contactCta: string;
  crumb: string;
}

export const aboutCopy: Record<Locale, AboutCopy> = {
  es: {
    metaTitle: "Sobre Puna: software factory de Buenos Aires | Puna Tech",
    metaDescription: "Quiénes somos, qué hacemos, para quién y cómo trabajamos: Puna Tech es una software factory de Buenos Aires que automatiza procesos de pymes.",
    h1: "Sobre Puna Tech",
    definition: "Puna Tech es una software factory de Buenos Aires, Argentina. Automatiza procesos y desarrolla software a medida para pymes y empresas B2B que ya superaron las planillas y los traspasos manuales.",
    factsTitle: "Datos rápidos",
    facts: [
      ["Nombre", "Puna Tech"],
      ["Qué hace", "Automatización de procesos, software a medida e integraciones de sistemas"],
      ["Para quién", "Pymes y empresas B2B de Argentina; estudios contables, estudios jurídicos, productores de seguros, inmobiliarias y clínicas"],
      ["Dónde", "Buenos Aires, Argentina; trabajo remoto"],
      ["Idiomas", "Español e inglés"],
      ["Cómo se empieza", "Llamada gratuita de 15 minutos"],
      ["Plazo típico", "Un proceso automatizado en 2 semanas, cuando entra en ese plazo"],
      ["Precio", "Cerrado y por escrito después de la llamada; no hay precio de lista"],
      ["Contacto", `${CONTACT_EMAIL} · ${abs("/es/contacto")}`],
    ],
    whatTitle: "Qué hacemos",
    whatLinks: [
      ["Automatización de procesos con IA", servicePath("es", "automatizacion-ia")],
      ["Software a medida", servicePath("es", "software-a-medida")],
      ["Integración de sistemas y datos", servicePath("es", "integraciones-de-datos")],
      ["Automatizaciones por proceso: facturas, cobranzas, pedidos, ARCA, conciliación", "/es/automatizaciones"],
      ["Integraciones con Mercado Libre, Tienda Nube y Mercado Pago", "/es/integraciones"],
      ["Herramientas gratis: Convenio Multilateral, plazos procesales y horas ahorradas", TOOLS_BASE],
    ],
    whoTitle: "Para quién",
    whoLead: "Demos con datos ficticios, pensadas para cada rubro:",
    howTitle: "Cómo trabajamos",
    how: [
      "Una llamada gratuita de 15 minutos para mapear el cuello de botella y decidir si conviene software, automatización, integración o no construir todavía.",
      "Propuesta escrita con alcance, precio cerrado y fecha. Un proceso concreto se automatiza en 2 semanas cuando entra en ese plazo.",
      "Primero se conecta y extiende lo que la empresa ya usa; se reemplaza solo si la limitación lo vuelve necesario.",
      "Repositorios, accesos e infraestructura quedan escritos en la propuesta.",
    ],
    notTitle: "Cuándo no somos la opción",
    not: [
      "Un conector estándar, una app de Tienda Nube o Zapier, n8n o Make ya resuelve el caso: lo decimos en la primera llamada.",
      "Buscás un sitio web, branding o campañas de marketing: eso es trabajo de agencia.",
      "Buscás un SaaS horizontal listo para usar o «IA para cualquier industria».",
      "Buscás a PUNA Software Factory de Salta (punasoftwarefactory.com.ar): es otra empresa.",
    ],
    toolsTitle: "Herramientas abiertas",
    toolsBody: "Publicamos una herramienta gratis y de código abierto: calculadora, validador y planilla Excel del coeficiente unificado del Régimen General de Convenio Multilateral (50 % ingresos + 50 % gastos, cuatro decimales). La normativa está citada en el repositorio.",
    toolsRepo: "Coeficiente unificado de Convenio Multilateral (GitHub, MIT)",
    toolsDemo: "Ver la demo en video",
    casesTitle: "Casos y productos propios",
    casesBody: "Separamos lo que es una demo de lab y producto propio de lo que es una entrega a un cliente. Cada caso lo aclara.",
    casesLink: "Ver los casos",
    contactTitle: "Contacto",
    contactBody: `Escribinos a ${CONTACT_EMAIL} o reservá la llamada de 15 minutos.`,
    contactCta: "Ir a contacto",
    crumb: "Sobre Puna Tech",
  },
  en: {
    metaTitle: "About Puna Tech: Buenos Aires software factory | Puna Tech",
    metaDescription: "Who we are, what we do, who we work for and how we work: Puna Tech is a Buenos Aires software factory that automates SME processes.",
    h1: "About Puna Tech",
    definition: "Puna Tech is a software factory in Buenos Aires, Argentina. It automates processes and builds custom software for SMEs and B2B companies that have outgrown spreadsheets and manual handoffs.",
    factsTitle: "Quick facts",
    facts: [
      ["Name", "Puna Tech"],
      ["What it does", "Process automation, custom software and systems integration"],
      ["Who it is for", "SMEs and B2B companies in Argentina; accounting firms, law firms, insurance brokers, real estate agencies and clinics"],
      ["Where", "Buenos Aires, Argentina; remote work"],
      ["Languages", "Spanish and English"],
      ["How it starts", "A free 15-minute call"],
      ["Typical timeline", "One process automated in 2 weeks, when it fits that window"],
      ["Price", "Fixed and in writing after the call; there is no list price"],
      ["Contact", `${CONTACT_EMAIL} · ${abs("/contact")}`],
    ],
    whatTitle: "What we do",
    whatLinks: [
      ["AI process automation", servicePath("en", "ai-automation")],
      ["Custom software", servicePath("en", "custom-software")],
      ["Systems and data integration", servicePath("en", "data-integrations")],
      ["Process automations (in Spanish): invoices, collections, orders, ARCA, reconciliation", "/es/automatizaciones"],
      ["Mercado Libre, Tienda Nube and Mercado Pago integrations (in Spanish)", "/es/integraciones"],
      ["Free tools (in Spanish): Convenio Multilateral, procedural deadlines and hours saved", TOOLS_BASE],
    ],
    whoTitle: "Who it is for",
    whoLead: "Demos with fictional data, built for each industry:",
    howTitle: "How we work",
    how: [
      "A free 15-minute call to map the bottleneck and decide whether software, automation, integration, or not building yet is the right move.",
      "A written proposal with scope, a fixed price and a date. A specific process is automated in 2 weeks when it fits that window.",
      "We connect and extend what the company already uses first; we only replace it when the limitation makes it necessary.",
      "Repositories, access and infrastructure are written into the proposal.",
    ],
    notTitle: "When we are not the right option",
    not: [
      "A standard connector, a Tienda Nube app or Zapier, n8n or Make already solves it: we say so on the first call.",
      "You are looking for a website, branding or marketing campaigns: that is agency work.",
      "You are looking for an off-the-shelf horizontal SaaS or \"AI for every industry\".",
      "You are looking for PUNA Software Factory of Salta (punasoftwarefactory.com.ar): that is a different company.",
    ],
    toolsTitle: "Open tools",
    toolsBody: "We publish a free, open-source tool: a calculator, validator and Excel sheet for the unified coefficient of the General Regime of the Convenio Multilateral (50% income + 50% expenses, four decimals). The regulations are cited in the repository.",
    toolsRepo: "Unified Convenio Multilateral coefficient (GitHub, MIT)",
    toolsDemo: "Watch the video demo",
    casesTitle: "Cases and own products",
    casesBody: "We keep lab demos and own products apart from client deliveries. Each case says which one it is.",
    casesLink: "See the case studies",
    contactTitle: "Contact",
    contactBody: `Write to ${CONTACT_EMAIL} or book the 15-minute call.`,
    contactCta: "Go to contact",
    crumb: "About Puna Tech",
  },
};

export function aboutRubroLinks(locale: Locale) {
  return rubroDefinitions.map((r) => ({ name: r.copy[locale].name, pain: r.copy[locale].pain, path: rubroPath(locale, r.slug[locale]) }));
}

/** Rubro one-liners for llms.txt (Spanish, verbatim from the GEO spec). */
const RUBRO_LLMS_LINE: Record<string, string> = {
  accounting: "facturas de clientes a planilla, documentación del mes y DDJJ de Convenio Multilateral.",
  legal: "consultas ordenadas por prioridad y cobro de honorarios.",
  insurance: "pólizas desde PDF a cartera y renovaciones del mes.",
  "real-estate": "consultas puntuadas y cobro de alquileres.",
  clinics: "liquidación de horas y sueldos del equipo.",
};
const RUBRO_LLMS_NAME: Record<string, string> = {
  accounting: "Estudios contables",
  legal: "Estudios jurídicos",
  insurance: "Productores de seguros",
  "real-estate": "Inmobiliarias",
  clinics: "Clínicas y consultorios",
};

export const llmsQuickFacts = [
  "Nombre: Puna Tech (no es PUNA Software Factory de Salta).",
  "Qué es: software factory de Buenos Aires, Argentina, que automatiza procesos y arma software a medida para pymes y empresas B2B.",
  "A quién sirve: pymes y empresas B2B de Argentina; foco en estudios contables, estudios jurídicos, productores de seguros, inmobiliarias y clínicas.",
  "Cómo trabaja: llamada gratuita de 15 minutos, propuesta por escrito con alcance, precio cerrado y fecha. Un proceso automatizado en 2 semanas cuando entra en ese plazo.",
  "Precio: no se publica; se acuerda por escrito después de la llamada.",
  "Idiomas: español (principal) e inglés.",
  `Contacto: ${abs("/es/contacto")} · ${CONTACT_EMAIL}`,
];

export function llmsRubroLines() {
  return rubroDefinitions.map((r) => `- [${RUBRO_LLMS_NAME[r.id]}](${abs(rubroPath("es", r.slug.es))}): ${RUBRO_LLMS_LINE[r.id]}`);
}

export const llmsOpenToolsLines = [
  `- [Coeficiente unificado de Convenio Multilateral (GitHub, MIT)](${CM_REPO_URL}): calculadora, validador y planilla Excel gratis del coeficiente del Régimen General (50 % ingresos + 50 % gastos, 4 decimales). Normativa citada en el repositorio. Demo: ${abs(CM_DEMO_PATH.es)}`,
];

export const llmsFaqLines = [
  "- ¿Qué hace Puna Tech? Automatiza procesos y desarrolla software a medida para pymes y empresas B2B de Argentina: facturas de proveedores, conciliación, facturación electrónica ARCA, pedidos por WhatsApp, integraciones con Mercado Libre, Tienda Nube y Mercado Pago, y sistemas propios.",
  "- ¿Dónde está? En Buenos Aires, Argentina. Trabaja de forma remota con clientes de Argentina y de la región.",
  "- ¿Cuánto cuesta? No hay precio de lista. Después de una llamada de 15 minutos se entrega una propuesta escrita con alcance, precio cerrado y fecha.",
  "- ¿Cuánto tarda? Un proceso concreto se automatiza en 2 semanas; si no entra en ese plazo se dice en la primera llamada.",
  "- ¿Hay que cambiar de sistema? No: primero se conecta y extiende lo que la empresa ya usa.",
  "- ¿Quién es el responsable? Martin, fundador de Puna Tech. Contacto en https://www.puna-tech.com/es/contacto.",
];

/** llms.txt: the free-tools hub and its tools, generated from content/tools.ts (the same source the pages and the sitemap use). */
export const llmsFreeToolsLines = () => [
  `- [${toolHub.h1}](${abs(TOOLS_BASE)}): ${toolHub.description}`,
  ...toolDefinitions.map((tool) => `- [${tool.name}](${abs(toolPath(tool.slug))}): ${tool.description}`),
];

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

/** llms-full: each free tool in full (what it does, the rule it applies, sources, caveat), from content/tools.ts. */
export const llmsToolDetailLines = () => [
  `Hub: ${abs(TOOLS_BASE)}`,
  oneLine(toolHub.lead),
  "Todas son gratuitas, sin registro, y calculan en el navegador sin guardar los datos que se cargan. Son orientativas, no reemplazan al profesional matriculado.",
  "",
  ...toolDefinitions.flatMap((tool) => [
    `### Herramienta: ${tool.name}`,
    `URL canónica: ${abs(toolPath(tool.slug))}`,
    `Qué hace: ${oneLine(tool.description)}`,
    `Para quién: ${oneLine(tool.audience)}`,
    oneLine(tool.lead),
    ...tool.sections.flatMap((section) => [
      `- ${section.heading}: ${[...(section.paragraphs ?? []).map(oneLine), ...(section.formula ? [`Fórmula: ${oneLine(section.formula)}`] : []), ...(section.items ?? []).map((item) => `· ${oneLine(item)}`)].join(" ")}`,
    ]),
    "Preguntas frecuentes:",
    ...tool.faqs.map((faq) => `  - ${oneLine(faq.q)} ${oneLine(faq.a)}`),
    "Fuentes oficiales consultadas:",
    ...tool.sources.map((source) => `  - ${source.label}: ${source.href} (${oneLine(source.note)})`),
    `Aviso: ${oneLine(tool.disclaimer)}`,
    `Última revisión: ${tool.lastmod}`,
    "",
  ]),
  "Preguntas frecuentes del hub:",
  ...toolHub.faqs.map((faq) => `  - ${oneLine(faq.q)} ${oneLine(faq.a)}`),
];

/**
 * llms-full: the Spanish /es/automatizaciones pages. The long-tail rubro landings (content/use-cases-rubros.ts) in detail,
 * every other use case as one line. Generated from the same arrays as the pages, so a copy edit flows here.
 */
export const llmsAutomationDetailLines = () => {
  const rubroPaths = new Set(rubroUseCases.map((item) => item.path));
  return [
    ...rubroUseCases.flatMap((item) => [
      `### Automatización: ${item.title}`,
      `URL canónica: ${abs(item.path)}`,
      `Rubro: ${item.eyebrow}`,
      oneLine(item.lead),
      ...(item.sections ?? []).map((section) => `- ${section.heading}: ${[...section.paragraphs.map(oneLine), ...(section.items ?? []).map((entry) => `· ${oneLine(entry)}`)].join(" ")}`),
      `Cómo se hace (${item.howTitle}): ${item.how.map((step) => `${step.title}: ${oneLine(step.body)}`).join(" | ")}`,
      "Preguntas frecuentes:",
      ...item.faqs.map(([q, a]) => `  - ${oneLine(q)} ${oneLine(a)}`),
      ...(item.sources?.length ? ["Fuentes oficiales consultadas:", ...item.sources.map((source) => `  - ${source.label}: ${source.href}`)] : []),
      ...(item.reviewedAt ? [`Revisado el ${item.reviewedAt}.`] : []),
      ...(item.disclaimer ? [`Aviso: ${oneLine(item.disclaimer)}`] : []),
      "",
    ]),
    "Otras páginas por proceso e integración:",
    ...useCases.filter((item) => !rubroPaths.has(item.path)).map((item) => `- [${item.title}](${abs(item.path)}): ${oneLine(item.metaDescription)}`),
  ];
};
