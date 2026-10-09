import { blogPath, type Locale } from "../content/chrome.ts";

const localeRoutePairs: Record<string, string> = {
  "/": "/es",
  "/es": "/",
  "/services": "/es/servicios",
  "/es/servicios": "/services",
  "/case-studies": "/es/casos",
  "/es/casos": "/case-studies",
  "/services/ai-automation": "/es/servicios/automatizacion-ia",
  "/services/custom-software": "/es/servicios/software-a-medida",
  "/services/data-integrations": "/es/servicios/integraciones-de-datos",
  "/es/servicios/automatizacion-ia": "/services/ai-automation",
  "/es/servicios/software-a-medida": "/services/custom-software",
  "/es/servicios/integraciones-de-datos": "/services/data-integrations",
  "/case-studies/starpress-reviews-to-revenue": "/es/casos/starpress-resenas-a-ingresos",
  "/case-studies/viralyt-youtube-intelligence": "/es/casos/viralyt-inteligencia-youtube",
  "/case-studies/videome-ai-motion-recipes": "/es/casos/videome-recetas-video-ia",
  "/case-studies/autopost-b2b-content-studio": "/es/casos/autopost-estudio-contenido-b2b",
  "/case-studies/inbound-lead-routing-hubspot": "/es/casos/enrutamiento-leads-hubspot",
  "/case-studies/ai-linkedin-copilot-hitl": "/es/casos/copiloto-linkedin-ia-hitl",
  "/case-studies/edtech-web3-platform": "/es/casos/plataforma-edtech-web3",
  "/case-studies/b2b-gtm-automation": "/es/casos/automatizacion-gtm-b2b",
  "/es/casos/starpress-resenas-a-ingresos": "/case-studies/starpress-reviews-to-revenue",
  "/es/casos/viralyt-inteligencia-youtube": "/case-studies/viralyt-youtube-intelligence",
  "/es/casos/videome-recetas-video-ia": "/case-studies/videome-ai-motion-recipes",
  "/es/casos/autopost-estudio-contenido-b2b": "/case-studies/autopost-b2b-content-studio",
  "/es/casos/enrutamiento-leads-hubspot": "/case-studies/inbound-lead-routing-hubspot",
  "/es/casos/copiloto-linkedin-ia-hitl": "/case-studies/ai-linkedin-copilot-hitl",
  "/es/casos/plataforma-edtech-web3": "/case-studies/edtech-web3-platform",
  "/es/casos/automatizacion-gtm-b2b": "/case-studies/b2b-gtm-automation",
  "/blog": "/es/blog",
  "/es/blog": "/blog",
  "/privacy": "/es/privacidad",
  "/es/privacidad": "/privacy",
  "/terms": "/es/terminos",
  "/es/terminos": "/terms",
  "/contact": "/es/contacto",
  "/es/contacto": "/contact",
};

/** The hreflang target returned by a route loader, when that route has one. */
export function routeAlternatePath(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("alternatePath" in data)) return undefined;
  const value = (data as { alternatePath?: unknown }).alternatePath;
  return typeof value === "string" && value.startsWith("/") ? value : undefined;
}

/**
 * Visible language switch. Blog posts must pass the same `alternatePath` used
 * for hreflang. Without that path, a post falls back to the other blog hub
 * instead of copying the current slug into the other locale.
 */
export function languageSwitchPath(pathname: string, locale: Locale, translatedPath?: string) {
  if (translatedPath) return translatedPath;
  if (localeRoutePairs[pathname]) return localeRoutePairs[pathname];
  if (pathname.startsWith("/blog/") || pathname.startsWith("/es/blog/")) return blogPath(locale === "en" ? "es" : "en");
  return locale === "en" ? "/es" : "/";
}
