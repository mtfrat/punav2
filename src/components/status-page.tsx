import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "./marketing";
import type { Locale } from "../content/site";

export function isSpanishPath(pathname: string) {
  return pathname === "/es" || pathname.startsWith("/es/");
}

export function statusDocumentMeta(pathname: string, notFound: boolean) {
  const spanish = isSpanishPath(pathname);
  const title = notFound
    ? (spanish ? "Página no encontrada | Puna Tech" : "Page not found | Puna Tech")
    : (spanish ? "Algo salió mal | Puna Tech" : "Something went wrong | Puna Tech");
  return [
    { title },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export function StatusPage({ locale, notFound }: { locale: Locale; notFound: boolean }) {
  const home = locale === "en" ? "/" : "/es";
  const copy = notFound
    ? (locale === "en"
      ? {
          eyebrow: "404",
          title: "That page is not here.",
          body: "The link may be old, or the address may be wrong. Services, selected work, and contact are still on the homepage.",
          cta: "Return home",
        }
      : {
          eyebrow: "404",
          title: "Esa página no está acá.",
          body: "El enlace puede estar viejo o la dirección puede estar mal. En el inicio siguen los servicios, el trabajo y el contacto.",
          cta: "Volver al inicio",
        })
    : (locale === "en"
      ? {
          eyebrow: "Error",
          title: "Something went wrong.",
          body: "Please retry, or return home and try again.",
          cta: "Return home",
        }
      : {
          eyebrow: "Error",
          title: "Algo salió mal.",
          body: "Reintentá, o volvé al inicio.",
          cta: "Volver al inicio",
        });

  return (
    <PageShell locale={locale} includeChat={false}>
      <main id="main-content" className="error-page">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <Link className="button-primary" to={home}>
          {copy.cta}
          <ArrowRight aria-hidden="true" />
        </Link>
      </main>
    </PageShell>
  );
}
