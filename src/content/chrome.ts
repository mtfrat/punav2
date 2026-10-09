export type Locale = "en" | "es";

export const SITE_URL = "https://www.puna-tech.com";
export const CAL_LINK = "puna-tech-r7xi5x/15min";
export const CONTACT_EMAIL = "punatechba@gmail.com";
/**
 * WhatsApp / phone: intentionally empty until Martin confirms a number.
 * Set it in international format without "+" or spaces (e.g. "5491100000000") and the
 * contact page shows a WhatsApp button automatically. Leave "" to hide it.
 */
export const CONTACT_WHATSAPP = "";

export function homePath(locale: Locale) {
  return locale === "en" ? "/" : "/es";
}

export function servicePath(locale: Locale, slug: string) {
  return locale === "en" ? `/services/${slug}` : `/es/servicios/${slug}`;
}

export function casePath(locale: Locale, slug: string) {
  return locale === "en" ? `/case-studies/${slug}` : `/es/casos/${slug}`;
}

export function servicesHubPath(locale: Locale) {
  return locale === "en" ? "/services" : "/es/servicios";
}

export function casesHubPath(locale: Locale) {
  return locale === "en" ? "/case-studies" : "/es/casos";
}

export function blogPath(locale: Locale, slug?: string) {
  const base = locale === "en" ? "/blog" : "/es/blog";
  return slug ? `${base}/${slug}` : base;
}

export function contactPath(locale: Locale) {
  return locale === "en" ? "/contact" : "/es/contacto";
}

/** Strings the header, footer, and home hero paint before the rest of the page. */
export const chromeCopy = {
  en: {
    locale: "en" as const,
    languageName: "English",
    nav: { services: "Services", work: "Work", process: "How it works", insights: "Blog", brief: "Prefer writing? Send a short note" },
    book: "Map the bottleneck in 15 min",
    sendBrief: "Prefer writing? Send a short note",
    heroEyebrow: "Puna Tech · Buenos Aires · B2B software factory",
    heroTitle: "Custom software for operations that outgrew off-the-shelf tools.",
    heroItalic: "outgrew off-the-shelf tools",
    heroBody: "Custom software to automate B2B operations in Argentina. For operations teams that no longer fit a spreadsheet or a catalog tool. Not a generic SaaS, and not software for everyone.",
    heroCompare: "If a critical flow needs permissions, rules, or integrations the standard tool does not cover, we build it custom. If connecting what you already run is enough, we start there.",
    heroMicrocopy: "Fifteen minutes. The bottleneck, the options, the next useful step.",
    footerLine: "Puna Tech · Buenos Aires · custom software for B2B operations.",
  },
  es: {
    locale: "es" as const,
    languageName: "Español",
    nav: { services: "Servicios", work: "Trabajo", process: "Cómo funciona", insights: "Blog", brief: "¿Preferís escribir? Mandá una nota corta" },
    book: "Mapeá el cuello de botella en 15 min",
    sendBrief: "¿Preferís escribir? Mandá una nota corta",
    heroEyebrow: "Puna Tech · Buenos Aires · software factory B2B",
    heroTitle: "Software a medida para operaciones que ya superaron las herramientas estándar.",
    heroItalic: "herramientas estándar",
    heroBody: "Software a medida para automatizar operaciones B2B en Argentina. Para equipos de operaciones que ya no entran en una planilla o en una herramienta de catálogo. No es un SaaS genérico ni un producto para todo el mundo.",
    heroCompare: "Si un flujo crítico necesita permisos, reglas o integraciones que lo estándar no resuelve, lo construimos a medida. Si alcanza con conectar lo que ya usan, empezamos por ahí.",
    heroMicrocopy: "Quince minutos. El cuello de botella, las opciones y el próximo paso útil.",
    footerLine: "Puna Tech · Buenos Aires · software a medida para operaciones B2B.",
  },
};
