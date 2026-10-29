import type { ReactNode } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, Compass } from "lucide-react";
import { Accordion, CalButton, PageShell, trackEvent } from "../components/marketing";
import { RichText } from "../components/rich-text";
import { contactPath, copy, servicePath, services, servicesHubCopy, servicesHubGuideEs, servicesHubPath, type Locale } from "../content/site";
import { useCases } from "../content/use-cases";
import { DemosByIndustry } from "../components/demos-strip";
import { breadcrumbSchema, collectionPageSchema, createMeta } from "../lib/seo";

function linkPhrase(text: string, phrase: string, to: string): ReactNode {
  const index = text.indexOf(phrase);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <Link to={to}>{phrase}</Link>
      {text.slice(index + phrase.length)}
    </>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  const hub = servicesHubCopy[locale];
  const byKey = Object.fromEntries(services[locale].map((service) => [service.key, service]));
  const ordered = hub.cardOrderKeys.map((key) => byKey[key]).filter(Boolean);
  return { locale, hub, ordered };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  const hub = data?.hub || servicesHubCopy.en;
  const path = servicesHubPath(locale);
  return createMeta({
    locale,
    title: hub.metaTitle,
    description: hub.metaDescription,
    path,
    alternatePath: servicesHubPath(locale === "en" ? "es" : "en"),
    schema: [
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: locale === "en" ? "Services" : "Servicios", path },
      ]),
      collectionPageSchema({
        locale,
        name: hub.title,
        path,
        items: (data?.ordered ?? []).map((service) => ({
          name: hub.cardTitles[service.key] || service.eyebrow,
          path: servicePath(locale, service.slug),
        })),
      }),
      ...(locale === "es"
        ? [{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: servicesHubGuideEs.faqs.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }]
        : []),
    ],
  });
};

export default function ServicesHub({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, hub, ordered } = loaderData;
  const t = copy[locale];
  const briefHref = contactPath(locale);

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero services-hub-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">{hub.eyebrow}</p>
            <h1>{hub.title}</h1>
            <p className="hero-lead">{hub.lead}</p>
            <p className="hero-intro">{locale === "es" ? linkPhrase(hub.intro, "sistemas a medida", "/es/servicios/software-a-medida") : hub.intro}</p>
            {locale === "es" ? (
              <p className="hero-intro">
                Si Tango, la planilla o un SaaS ya no alcanzan, el camino es <Link to="/es/servicios/software-a-medida">software a medida</Link>.
                {" "}Si el CRM y el ERP no se pasan los datos, el camino es <Link to="/es/servicios/integraciones-de-datos">integración de sistemas</Link>.
                {" "}Si cobranzas, facturas o pedidos por WhatsApp se hacen a mano, el camino es <Link to="/es/servicios/automatizacion-ia">automatización de procesos</Link>.
              </p>
            ) : null}
            <div className="cta-group">
              <CalButton locale={locale} placement="services_hub" label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale, placement: "services_hub", destination: "contact" })}
              >
                <span>{t.sendBrief}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="section light-section">
          <div className="shell hub-card-grid">
            {ordered.map((service, index) => (
              <article className="hub-card" key={service.slug}>
                <span className="hub-card-index">0{index + 1}</span>
                <p className="eyebrow">{service.eyebrow}</p>
                <h2><Link to={servicePath(locale, service.slug)}>{hub.cardTitles[service.key] || service.eyebrow}</Link></h2>
                <p>{service.hubBlurb}</p>
                <Link className="text-link" to={servicePath(locale, service.slug)}>
                  {locale === "en" ? "Open service" : "Abrir servicio"}
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        {locale === "es" ? (
          <section className="section soft-section" aria-labelledby="choose-service-heading">
            <div className="shell commercial-expand-stack">
              <h2 id="choose-service-heading">{servicesHubGuideEs.chooseTitle}</h2>
              <p className="services-hub-guide-intro">{servicesHubGuideEs.chooseIntro}</p>
              {servicesHubGuideEs.choose.map((item) => (
                <article className="commercial-h2-block" key={item.title}>
                  <h3>{item.title}</h3>
                  <p><RichText text={item.body} /></p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {locale === "es" ? (
          <section className="section light-section" aria-labelledby="how-we-work-heading">
            <div className="shell commercial-expand-stack">
              <h2 id="how-we-work-heading">{servicesHubGuideEs.processTitle}</h2>
              <ol className="services-hub-steps">
                {servicesHubGuideEs.process.map((step) => {
                  const [head, ...rest] = step.split(". ");
                  return (
                    <li key={head}>
                      <strong>{head}.</strong> {rest.join(". ")}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}

        {locale === "es" ? (
          <section className="section soft-section" aria-labelledby="use-cases-heading">
            <div className="shell">
              <header className="section-heading" style={{ marginBottom: "2rem" }}>
                <p className="eyebrow">Casos de uso del día a día</p>
                <h2 id="use-cases-heading">Problemas concretos que automatizamos</h2>
                <p>
                  Una página por problema: cómo es hoy, cómo queda y cómo lo resolvemos. Automatizamos un proceso en 2 semanas a precio cerrado.
                  {" "}El índice está en <Link to="/es/automatizaciones">automatizaciones</Link> y en cómo <Link to="/es/integraciones">integrar Mercado Libre, Tienda Nube y Mercado Pago con tu sistema</Link>.
                </p>
              </header>
              <div className="hub-card-grid">
                {useCases.map((item, index) => (
                  <article className="hub-card" key={item.path}>
                    <span className="hub-card-index">0{index + 1}</span>
                    <p className="eyebrow">{item.eyebrow}</p>
                    <h3><Link to={item.path}>{item.cardTitle}</Link></h3>
                    <p>{item.cardBlurb}</p>
                    <Link className="text-link" to={item.path}>
                      Ver cómo funciona
                      <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {locale === "es" ? (
          <section className="section faq-section" id="faq">
            <div className="shell faq-grid">
              <header className="section-heading">
                <p className="eyebrow">FAQ</p>
                <h2>Preguntas frecuentes sobre los servicios</h2>
                <Compass aria-hidden="true" />
              </header>
              <Accordion items={servicesHubGuideEs.faqs} />
            </div>
          </section>
        ) : null}

        <DemosByIndustry locale={locale} placement="services_demos_rubro" />

        <section className="detail-cta dark-section">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-dark">{locale === "en" ? "Not sure which capability fits?" : "¿No estás seguro qué capacidad encaja?"}</p>
              <h2>{locale === "en" ? "Map the bottleneck in 15 min." : "Mapeá el cuello de botella en 15 min."}</h2>
            </div>
            <div className="cta-group detail-cta-actions">
              <CalButton locale={locale} placement="services_hub_final" label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale, placement: "services_hub_final", destination: "contact" })}
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
