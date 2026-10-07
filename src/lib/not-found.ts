import type { Locale } from "../content/site";

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

export function notFoundTitle(locale: Locale) {
  return locale === "es" ? "Página no encontrada | Puna Tech" : "Page not found | Puna Tech";
}

export function notFoundDocumentMeta(locale: Locale) {
  return [
    { title: notFoundTitle(locale) },
    { name: "robots", content: "noindex, nofollow" },
  ];
}
