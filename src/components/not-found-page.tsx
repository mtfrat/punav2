import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { Locale } from "../content/site";
import { PageShell } from "./marketing";

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

export function RouteErrorPage({ locale, notFound }: { locale: Locale; notFound: boolean }) {
  const home = locale === "en" ? "/" : "/es";
  const eyebrow = notFound ? "404" : "Error";
  const heading = notFound
    ? (locale === "en" ? "Page not found." : "Página no encontrada.")
    : (locale === "en" ? "Something went wrong." : "Algo salió mal.");
  const body = notFound
    ? (locale === "en"
      ? "The address may have changed, or the page may no longer exist."
      : "La dirección puede haber cambiado o la página puede haber sido retirada.")
    : (locale === "en"
      ? "Please retry, or return to the homepage."
      : "Volvé a intentar o regresá al inicio.");
  const cta = locale === "en" ? "Return home" : "Volver al inicio";

  return (
    <PageShell locale={locale} includeChat={false}>
      <main id="main-content" className="error-page">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{heading}</h1>
        <p>{body}</p>
        <Link className="button-primary" to={home}>{cta}<ArrowRight aria-hidden="true" /></Link>
      </main>
    </PageShell>
  );
}
