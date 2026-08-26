import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Accordion, CalButton, FlowDiagram, PageShell, trackEvent } from "../components/marketing";
import { getIndustry, industryPath } from "../content/industries";
import { getService, servicePath, type Locale } from "../content/site";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es/") ? "es" : "en";
  const industry = getIndustry(locale, params.slug || "");
  if (!industry) throw new Response("Not found", { status: 404 });
  const relatedServices = industry.relatedServiceKeys.flatMap((key) => {
    const service = getService(locale, locale === "en" ? key : ({
      "data-integrations": "integraciones-de-datos",
      "ai-automation": "automatizacion-ia",
      "custom-software": "software-a-medida",
    } as Record<string, string>)[key]);
    return service ? [service] : [];
  });
  return { locale, industry, relatedServices };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { locale, industry } = data;
  const path = industryPath(locale, industry.slug);
  const alternatePath = industryPath(locale === "en" ? "es" : "en", industry.alternateSlug);
  return createMeta({
    locale,
    title: industry.metaTitle,
    description: industry.metaDescription,
    path,
    alternatePath,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: industry.title,
        description: industry.metaDescription,
        provider: { "@id": "https://www.puna-tech.com/#organization" },
        areaServed: locale === "en" ? ["US", "Latin America"] : ["Argentina", "Latin America"],
        serviceType: ["Custom software", "Workflow automation", "Systems integration"],
      },
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: industry.eyebrow, path },
      ]),
    ],
  });
};

export default function IndustryPage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, industry, relatedServices } = loaderData;

  useEffect(() => {
    trackEvent("industry_view", { locale, industry: industry.key });
  }, [industry.key, locale]);

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero industry-hero dark-section">
          <div className="shell detail-hero-grid">
            <div>
              <p className="eyebrow eyebrow-dark">{industry.eyebrow}</p>
              <h1>{industry.title}</h1>
              <p>{industry.introduction}</p>
              <CalButton locale={locale} placement={`industry_${industry.key}_hero`} label={locale === "en" ? "Audit one workflow" : "Auditar un proceso"} />
            </div>
            <div className="industry-map">
              <p className="eyebrow eyebrow-dark">{industry.workflowCaption}</p>
              <FlowDiagram items={industry.workflow} label={`${industry.workflowCaption}: ${industry.workflow.join(", ")}`} />
              <p className="industry-qualifier"><ShieldCheck aria-hidden="true" size={18} />{industry.qualifier}</p>
            </div>
          </div>
        </section>

        <section className="section light-section">
          <div className="shell">
            <header className="section-heading">
              <p className="eyebrow">{locale === "en" ? "Operational signals" : "Señales operativas"}</p>
              <h2>{locale === "en" ? "Where disconnected work becomes expensive to coordinate." : "Dónde el trabajo desconectado se vuelve difícil de coordinar."}</h2>
            </header>
            <div className="industry-problem-grid">
              {industry.problems.map(([title, body], index) => (
                <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft-section">
          <div className="shell two-column">
            <header className="section-heading">
              <p className="eyebrow">{locale === "en" ? "Useful first scopes" : "Primeros alcances útiles"}</p>
              <h2>{locale === "en" ? "Improve one handoff before rebuilding the whole operation." : "Mejorá un traspaso antes de reconstruir toda la operación."}</h2>
              <p>{industry.proofNote}</p>
            </header>
            <ul className="industry-opportunities">
              {industry.opportunities.map(([title, body]) => (
                <li key={title}><CheckCircle2 aria-hidden="true" /><div><h3>{title}</h3><p>{body}</p></div></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section light-section">
          <div className="shell">
            <header className="section-heading">
              <p className="eyebrow">{locale === "en" ? "Capabilities" : "Capacidades"}</p>
              <h2>{locale === "en" ? "Choose the capability that matches the constraint." : "Elegí la capacidad que corresponda a la restricción."}</h2>
            </header>
            <div className="industry-service-grid">
              {relatedServices.map((service) => (
                <article key={service.key}>
                  <p className="eyebrow">{service.eyebrow}</p>
                  <h3>{service.outcome}</h3>
                  <Link className="text-link" to={servicePath(locale, service.slug)}>{locale === "en" ? "Explore the capability" : "Explorar la capacidad"}<ArrowRight aria-hidden="true" size={17} /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section faq-section">
          <div className="shell faq-grid">
            <header className="section-heading"><p className="eyebrow">FAQ</p><h2>{locale === "en" ? "Questions before mapping the workflow." : "Preguntas antes de mapear el proceso."}</h2></header>
            <Accordion items={industry.faqs} />
          </div>
        </section>

        <section className="detail-cta dark-section">
          <div className="shell"><div><p className="eyebrow eyebrow-dark">{locale === "en" ? "Free bottleneck audit" : "Auditoría gratuita"}</p><h2>{locale === "en" ? "Bring one workflow your team is holding together manually." : "Traé un proceso que hoy tu equipo sostiene manualmente."}</h2></div><CalButton locale={locale} placement={`industry_${industry.key}_final`} label={locale === "en" ? "Book the free audit" : "Pedir auditoría gratis"} /></div>
        </section>
      </main>
    </PageShell>
  );
}
