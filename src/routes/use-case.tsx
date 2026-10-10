import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { isRouteErrorResponse, Link } from "react-router";
import { ArrowRight, CheckCircle2, Compass } from "lucide-react";
import { Accordion, CalButton, PageShell, trackEvent } from "../components/marketing";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import { contactPath, copy, servicesHubPath, SITE_URL } from "../content/site";
import { getUseCaseByPath, USE_CASE_OFFER, USE_CASE_STEPS, useCases } from "../content/use-cases";
import { localeFromPathname, notFoundDocumentMeta } from "../lib/not-found";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export { PublicNotFoundBoundary as ErrorBoundary };

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const useCase = getUseCaseByPath(pathname);
  if (!useCase) throw new Response("Not found", { status: 404 });
  const siblings = useCases.filter((item) => item.key !== useCase.key).map(({ path, cardTitle, cardBlurb }) => ({ path, cardTitle, cardBlurb }));
  return { locale: "es" as const, useCase, siblings };
}

export const meta: MetaFunction<typeof loader> = ({ data, error, location }) => {
  if (isRouteErrorResponse(error) && error.status === 404) return notFoundDocumentMeta(localeFromPathname(location.pathname));
  if (!data) return [];
  const { useCase } = data;
  const url = `${SITE_URL}${useCase.path}`;
  return createMeta({
    locale: "es",
    title: useCase.metaTitle,
    description: useCase.metaDescription,
    path: useCase.path,
    image: useCase.ogImage,
    imageAlt: useCase.ogImageAlt,
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/png",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: useCase.title,
        serviceType: useCase.serviceType,
        description: useCase.metaDescription,
        url,
        inLanguage: "es-AR",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Argentina" },
      },
      breadcrumbSchema([
        { name: "Puna Tech", path: "/es" },
        { name: "Servicios", path: servicesHubPath("es") },
        { name: useCase.cardTitle, path: useCase.path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: useCase.faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  });
};

function ContactLink({ placement, light = false }: { placement: string; light?: boolean }) {
  return (
    <Link
      to={contactPath("es")}
      className={light ? "button-ghost-burgundy button-ghost-burgundy-light" : "button-ghost-burgundy"}
      onClick={() => trackEvent("cta_click", { locale: "es", placement, destination: "contact" })}
    >
      <span>Escribinos</span>
      <ArrowRight aria-hidden="true" size={16} />
    </Link>
  );
}

export default function UseCasePage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { useCase, siblings } = loaderData;
  const t = copy.es;
  useEffect(() => trackEvent("use_case_view", { locale: "es", use_case: useCase.key }), [useCase.key]);

  return (
    <PageShell locale="es">
      <main id="main-content">
        <section className="detail-hero use-case-hero dark-section">
          <div className="shell detail-hero-grid">
            <div>
              <p className="eyebrow eyebrow-dark">{useCase.eyebrow}</p>
              <h1>{useCase.title}</h1>
              <p>{useCase.lead}</p>
              <div className="cta-group">
                <CalButton locale="es" placement={`use_case_${useCase.key}`} label={t.book} className="button-primary-terracotta" />
                <ContactLink placement={`use_case_${useCase.key}`} light />
              </div>
            </div>
            <div className="use-case-offer-card">
              <p className="eyebrow eyebrow-dark">{USE_CASE_OFFER.eyebrow}</p>
              <p className="use-case-offer-title">{USE_CASE_OFFER.title}</p>
              <p>{USE_CASE_OFFER.body}</p>
            </div>
          </div>
        </section>

        <section className="section light-section" aria-labelledby="before-after-heading">
          <div className="shell">
            <header className="section-heading">
              <p className="eyebrow">El problema</p>
              <h2 id="before-after-heading">Antes y después</h2>
              <p>{useCase.example}</p>
            </header>
            <div className="before-after-grid">
              <div className="before-card">
                <span className="transformation-badge before-badge">Antes: a mano</span>
                <ul className="use-case-list">{useCase.before.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div className="after-card">
                <span className="transformation-badge after-badge">Después: automatizado</span>
                <ul className="use-case-list">{useCase.after.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section soft-section" aria-label={useCase.howTitle}>
          <div className="shell commercial-expand-stack">
            <h2>{useCase.howTitle}</h2>
            {useCase.how.map((item) => (
              <article className="commercial-h2-block" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section light-section">
          <div className="shell two-column">
            <header className="section-heading">
              <p className="eyebrow">Cómo trabajamos</p>
              <h2>Tres pasos, sin vueltas</h2>
              <p>{USE_CASE_OFFER.title}</p>
            </header>
            <ol className="number-list">
              {USE_CASE_STEPS.map((step, index) => (
                <li key={step.title}><span>0{index + 1}</span><p><strong>{step.title}.</strong> {step.body}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section soft-section">
          <div className="shell two-column">
            <header className="section-heading">
              <p className="eyebrow">¿Es para vos?</p>
              <h2>Cuándo conviene</h2>
            </header>
            <ul className="check-list">{useCase.fit.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></li>)}</ul>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="shell faq-grid">
            <header className="section-heading">
              <p className="eyebrow">FAQ</p>
              <h2>Preguntas frecuentes</h2>
              <Compass aria-hidden="true" />
            </header>
            <Accordion items={useCase.faqs} />
          </div>
        </section>

        <section className="related-guides" aria-labelledby="related-solutions-heading">
          <div className="shell">
            <h2 id="related-solutions-heading">Relacionado</h2>
            <p className="related-guides-note">
              Si este proceso ya pide pantallas, permisos o reglas que no entran en la herramienta, lo vemos como <Link to="/es/servicios/software-a-medida">software a medida</Link>.
              {" "}Si lo que falta es que dos sistemas se pasen los datos solos, lo vemos como <Link to="/es/servicios/integraciones-de-datos">integración de sistemas</Link>.
            </p>
            <ol className="related-guide-list">
              {[
                ...siblings.map((item) => ({ path: item.path, title: item.cardTitle })),
                useCase.relatedService,
                ...useCase.relatedPosts,
              ].map((item, index) => (
                <li key={item.path}>
                  <Link to={item.path}>
                    <span className="related-guide-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className="related-guide-title">{item.title}</span>
                    <ArrowRight aria-hidden="true" size={18} />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="detail-cta dark-section">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-dark">Una primera conversación útil</p>
              <h2>En 15 minutos vemos si tu proceso entra en 2 semanas.</h2>
              <p className="detail-cta-body">Contanos cómo lo hacen hoy. Si no conviene automatizarlo, también te lo decimos.</p>
            </div>
            <div className="cta-group detail-cta-actions">
              <CalButton locale="es" placement={`use_case_${useCase.key}_final`} label={t.book} className="button-primary-terracotta" />
              <ContactLink placement={`use_case_${useCase.key}_final`} light />
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
