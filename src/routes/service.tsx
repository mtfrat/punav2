import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { isRouteErrorResponse, Link } from "react-router";
import { ArrowRight, CheckCircle2, Compass } from "lucide-react";
import { Accordion, CalButton, FlowDiagram, PageShell, trackEvent } from "../components/marketing";
import {
  casePath,
  caseStudies,
  contactPath,
  copy,
  getCaseStudy,
  getService,
  servicePath,
  servicesHubPath,
  type Locale,
} from "../content/site";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import { notFoundDocumentMeta, localeFromPathname } from "../lib/not-found";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export { PublicNotFoundBoundary as ErrorBoundary };

const serviceGuides: Record<string, Record<Locale, Array<{ path: string; title: string }>>> = {
  "custom-software": {
    en: [
      { path: "/blog/when-to-leave-zapier-n8n-for-custom-software", title: "When to leave Zapier or n8n for custom software" },
      { path: "/blog/audit-crm-integration-commercial-follow-up", title: "How to audit a CRM integration and commercial follow-up workflow" },
    ],
    es: [
      { path: "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", title: "Cuándo dejar Zapier o n8n por software a medida" },
      { path: "/es/blog/auditar-integracion-crm-seguimiento-comercial", title: "Cómo auditar una integración CRM y el seguimiento comercial" },
    ],
  },
  "ai-automation": {
    en: [
      { path: "/blog/when-to-use-ai-vs-deterministic-software", title: "When to use AI—and when deterministic software is the better choice" },
    ],
    es: [
      { path: "/es/blog/cuando-usar-ia-vs-software-deterministico", title: "Cuándo usar IA y cuándo conviene software determinístico" },
    ],
  },
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es/") ? "es" : "en";
  const service = getService(locale, params.slug || "");
  if (!service) throw new Response("Not found", { status: 404 });
  const relatedCase = caseStudies[locale].find((study) => study.slug === service.relatedCase) || caseStudies[locale][0];
  const proofCases = service.proofStrip
    .map((item) => {
      const study = getCaseStudy(locale, item.slug);
      return study ? { study, caption: item.caption } : null;
    })
    .filter((item): item is { study: NonNullable<ReturnType<typeof getCaseStudy>>; caption: string } => Boolean(item));
  return { locale, service, relatedCase, proofCases };
}

export const meta: MetaFunction<typeof loader> = ({ data, error, location }) => {
  if (isRouteErrorResponse(error) && error.status === 404) return notFoundDocumentMeta(localeFromPathname(location.pathname));
  if (!data) return [];
  const { locale, service } = data;
  const path = servicePath(locale, service.slug);
  const alternatePath = servicePath(locale === "en" ? "es" : "en", service.alternateSlug);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return createMeta({
    locale,
    title: service.metaTitle,
    description: service.metaDescription,
    path,
    alternatePath,
    schema: [
      { "@context": "https://schema.org", "@type": "Service", name: service.eyebrow, serviceType: service.eyebrow, description: service.metaDescription, url: `https://www.puna-tech.com${path}`, inLanguage: locale === "en" ? "en" : "es-AR", provider: { "@id": "https://www.puna-tech.com/#organization" }, areaServed: ["US", "Latin America", "AR"] },
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: locale === "en" ? "Services" : "Servicios", path: servicesHubPath(locale) },
        { name: service.eyebrow, path },
      ]),
      faqSchema,
    ],
  });
};

export default function ServicePage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, service, relatedCase, proofCases } = loaderData;
  const t = copy[locale];
  const guides = serviceGuides[service.key]?.[locale] ?? [];
  useEffect(() => trackEvent("service_view", { locale, service: service.key }), [locale, service.key]);
  const briefHref = contactPath(locale);

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero dark-section">
          <div className="shell detail-hero-grid">
            <div>
              <p className="eyebrow eyebrow-dark">{locale === "en" ? "Focused capability" : "Capacidad enfocada"} · {service.eyebrow}</p>
              <h1>{service.title}</h1>
              <p>{service.description}</p>
              <div className="cta-group">
                <CalButton locale={locale} placement={`service_${service.key}`} label={t.book} className="button-primary-terracotta" />
                <a
                  href={briefHref}
                  className="button-ghost-burgundy"
                  onClick={() => trackEvent("cta_click", { locale, placement: `service_${service.key}`, destination: "contact" })}
                >
                  <span>{t.sendBrief}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>
            </div>
            <div>
              <p className="eyebrow eyebrow-dark">{locale === "en" ? "Reference architecture" : "Arquitectura de referencia"}</p>
              <FlowDiagram items={service.architecture} label={`${service.eyebrow}: ${service.architecture.join(", ")}`} />
            </div>
          </div>
        </section>

        <section className="section light-section">
          <div className="shell two-column">
            <header className="section-heading">
              <p className="eyebrow">{locale === "en" ? "The operating problem" : "El problema operativo"}</p>
              <h2>{locale === "en" ? "Signals this service may be useful." : "Señales de que este servicio puede ser útil."}</h2>
            </header>
            <ul className="check-list">{service.problems.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></li>)}</ul>
          </div>
        </section>

        <section className="section soft-section" aria-label={locale === "en" ? "Commercial focus" : "Enfoque comercial"}>
          <div className="shell commercial-expand-stack">
            {service.commercialSections.map((section) => (
              <article className="commercial-h2-block" key={section.heading}>
                <h2>{section.heading}</h2>
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="commercial-bullet-list">
                    {section.bullets.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section light-section">
          <div className="shell two-column">
            <header className="section-heading">
              <p className="eyebrow">{locale === "en" ? "What you receive" : "Qué recibís"}</p>
              <h2>{service.outcome}</h2>
            </header>
            <ul className="number-list">{service.deliverables.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ul>
          </div>
        </section>

        {proofCases.length > 0 && (
          <section className="section soft-section" aria-label={locale === "en" ? "Proof from related work" : "Prueba de trabajo relacionado"}>
            <div className="shell">
              <header className="section-heading" style={{ marginBottom: "2rem" }}>
                <p className="eyebrow">{locale === "en" ? "Proof from related work" : "Prueba de trabajo relacionado"}</p>
                <h2>{locale === "en" ? "Proof from related work" : "Prueba de trabajo relacionado"}</h2>
                <p>{locale === "en" ? "Client names can stay private. Outcomes and architecture stay concrete. Lab demos are labeled as such." : "Los nombres de clientes pueden quedar en reserva. Resultados y arquitectura se muestran con claridad. Las demos de lab se marcan como tales."}</p>
              </header>
              <div className="proof-case-grid">
                {proofCases.map(({ study, caption }) => {
                  const labish = ["starpress", "viralyt", "videome", "autopost"].includes(study.key);
                  return (
                    <article className="proof-case-card" key={study.slug}>
                      <p className="eyebrow">{labish ? (locale === "en" ? "Lab demo" : "Demo de lab") : (locale === "en" ? "Client delivery" : "Entrega a cliente")}</p>
                      <p className="work-name">{study.displayName}</p>
                      <h3>{caption}</h3>
                      <Link className="text-link" to={casePath(locale, study.slug)}>
                        {locale === "en" ? "Read the case study" : "Ver el caso"}
                        <ArrowRight aria-hidden="true" size={17} />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="section light-section">
          <div className="shell related-case">
            <div>
              <p className="eyebrow">{locale === "en" ? "Related work" : "Trabajo relacionado"}</p>
              <p className="work-name">{relatedCase.displayName}</p>
              <h2>{relatedCase.title}</h2>
              <p>{relatedCase.summary}</p>
              <Link className="text-link" to={casePath(locale, relatedCase.slug)}>{locale === "en" ? "Read the case study" : "Ver el caso"}<ArrowRight aria-hidden="true" size={17} /></Link>
            </div>
            <div>
              <p className="eyebrow">{relatedCase.confidentialityLabel}</p>
              <FlowDiagram items={relatedCase.flow} label={relatedCase.flow.join(", ")} />
            </div>
          </div>
        </section>

        {guides.length ? (
          <section className="related-guides" aria-labelledby="related-guides-heading">
            <div className="shell">
              <h2 id="related-guides-heading">{guides.length > 1 ? (locale === "en" ? "Related guides" : "Guías relacionadas") : (locale === "en" ? "Related guide" : "Guía relacionada")}</h2>
              <ol className="related-guide-list">
                {guides.map((guide, index) => (
                  <li key={guide.path}>
                    <Link to={guide.path}>
                      <span className="related-guide-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span className="related-guide-title">{guide.title}</span>
                      <ArrowRight aria-hidden="true" size={18} />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        <section className="section faq-section" id="faq">
          <div className="shell faq-grid">
            <header className="section-heading">
              <p className="eyebrow">FAQ</p>
              <h2>{locale === "en" ? "FAQ" : "FAQ"}</h2>
              <Compass aria-hidden="true" />
            </header>
            <Accordion items={service.faqs} />
          </div>
        </section>

        <section className="detail-cta dark-section">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-dark">{locale === "en" ? "A useful first conversation" : "Una primera conversación útil"}</p>
              <h2>{service.finalCtaTitle}</h2>
              <p className="detail-cta-body">{service.finalCtaBody}</p>
              {service.finalCtaMicro ? <p className="detail-cta-micro">{service.finalCtaMicro}</p> : null}
            </div>
            <div className="cta-group detail-cta-actions">
              <CalButton locale={locale} placement={`service_${service.key}_final`} label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale, placement: `service_${service.key}_final`, destination: "contact" })}
              >
                <span>{t.sendBrief}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
