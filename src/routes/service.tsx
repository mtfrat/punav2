import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CalButton, FlowDiagram, PageShell, trackEvent } from "../components/marketing";
import { casePath, caseStudies, getService, servicePath, type Locale } from "../content/site";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es/") ? "es" : "en";
  const service = getService(locale, params.slug || "");
  if (!service) throw new Response("Not found", { status: 404 });
  const relatedCase = caseStudies[locale].find((study) => study.slug === service.relatedCase) || caseStudies[locale][0];
  return { locale, service, relatedCase };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { locale, service } = data;
  const path = servicePath(locale, service.slug);
  const alternatePath = servicePath(locale === "en" ? "es" : "en", service.alternateSlug);
  const title = `${service.eyebrow} | Puna Tech`;
  const description = service.description;
  return createMeta({
    locale, title, description, path, alternatePath,
    schema: [
      { "@context": "https://schema.org", "@type": "Service", name: service.eyebrow, description, provider: { "@id": "https://www.puna-tech.com/#organization" }, areaServed: ["US", "Latin America"] },
      breadcrumbSchema([{ name: "Puna Tech", path: locale === "en" ? "/" : "/es" }, { name: service.eyebrow, path }]),
    ],
  });
};

export default function ServicePage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, service, relatedCase } = loaderData;
  useEffect(() => trackEvent("service_view", { locale, service: service.key }), [locale, service.key]);
  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero dark-section">
          <div className="shell detail-hero-grid"><div><p className="eyebrow eyebrow-dark">{locale === "en" ? "Focused capability" : "Capacidad enfocada"} · {service.eyebrow}</p><h1>{service.title}</h1><p>{service.description}</p><CalButton locale={locale} placement={`service_${service.key}`} label={locale === "en" ? "Audit this bottleneck" : "Auditar este cuello de botella"} /></div><div><p className="eyebrow eyebrow-dark">{locale === "en" ? "Reference architecture" : "Arquitectura de referencia"}</p><FlowDiagram items={service.architecture} label={`${service.eyebrow}: ${service.architecture.join(", ")}`} /></div></div>
        </section>
        <section className="section light-section"><div className="shell two-column"><header className="section-heading"><p className="eyebrow">{locale === "en" ? "The operating problem" : "El problema operativo"}</p><h2>{locale === "en" ? "Signals this service may be useful." : "Señales de que este servicio puede ser útil."}</h2></header><ul className="check-list">{service.problems.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></li>)}</ul></div></section>
        <section className="section soft-section"><div className="shell two-column"><header className="section-heading"><p className="eyebrow">{locale === "en" ? "What you receive" : "Qué recibís"}</p><h2>{service.outcome}</h2></header><ul className="number-list">{service.deliverables.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ul></div></section>
        <section className="section light-section"><div className="shell related-case"><div><p className="eyebrow">{locale === "en" ? "Related work" : "Trabajo relacionado"}</p><p className="work-name">{relatedCase.displayName}</p><h2>{relatedCase.title}</h2><p>{relatedCase.summary}</p><Link className="text-link" to={casePath(locale, relatedCase.slug)}>{locale === "en" ? "Read the case study" : "Ver el caso"}<ArrowRight aria-hidden="true" size={17} /></Link></div><div><p className="eyebrow">{relatedCase.confidentialityLabel}</p><FlowDiagram items={relatedCase.flow} label={relatedCase.flow.join(", ")} /></div></div></section>
        <section className="detail-cta dark-section"><div className="shell"><div><p className="eyebrow eyebrow-dark">{locale === "en" ? "A useful first conversation" : "Una primera conversación útil"}</p><h2>{locale === "en" ? "Bring the workflow, constraints, and current stack." : "Traé el flujo, las restricciones y el stack actual."}</h2></div><CalButton locale={locale} placement={`service_${service.key}_final`} label={locale === "en" ? "Get the free audit" : "Pedir auditoría gratis"} /></div></section>
      </main>
    </PageShell>
  );
}
