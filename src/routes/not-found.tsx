import type { MetaFunction } from "react-router";
import { Link, useLocation } from "react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "../components/marketing";

export function loader() { throw new Response("Not found", { status: 404 }); }
export const meta: MetaFunction = () => [{ title: "Page not found | Puna Tech" }, { name: "robots", content: "noindex, nofollow" }];

export default function NotFound() {
  const locale = useLocation().pathname.startsWith("/es") ? "es" : "en";
  return <PageShell locale={locale}><main id="main-content" className="error-page"><p className="eyebrow">404</p><h1>{locale === "en" ? "This page could not be found." : "No encontramos esta página."}</h1><p>{locale === "en" ? "The URL may have changed or the page may no longer exist." : "La URL puede haber cambiado o la página puede haber sido retirada."}</p><Link className="button-primary" to={locale === "en" ? "/" : "/es"}>{locale === "en" ? "Return home" : "Volver al inicio"}<ArrowRight aria-hidden="true" /></Link></main></PageShell>;
}
