import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, Compass } from "lucide-react";
import { Accordion, CalButton, PageShell, trackEvent } from "../components/marketing";
import { RichText } from "../components/rich-text";
import { contactPath, copy } from "../content/site";
import { getUseCaseHub, useCasesForHub } from "../content/use-cases";
import { breadcrumbSchema, collectionPageSchema, createMeta } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const hub = getUseCaseHub(pathname);
  if (!hub) throw new Response("Not found", { status: 404 });
  return { hub, items: useCasesForHub(hub.section) };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { hub, items } = data;
  return createMeta({
    locale: "es",
    title: hub.metaTitle,
    description: hub.metaDescription,
    path: hub.path,
    schema: [
      breadcrumbSchema([
        { name: "Puna Tech", path: "/es" },
        { name: hub.eyebrow, path: hub.path },
      ]),
      collectionPageSchema({
        locale: "es",
        name: hub.title,
        path: hub.path,
        items: items.map((item) => ({ name: item.cardTitle, path: item.path })),
      }),
      ...(hub.faqs?.length
        ? [{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: hub.faqs.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }]
        : []),
    ],
  });
};

export default function UseCasesHub({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { hub, items } = loaderData;
  const t = copy.es;
  const briefHref = contactPath("es");

  return (
    <PageShell locale="es">
      <main id="main-content">
        <section className="detail-hero services-hub-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">{hub.eyebrow}</p>
            <h1>{hub.title}</h1>
            <p className="hero-lead">{hub.lead}</p>
            <p className="hero-intro">{hub.intro}</p>
            <p className="hero-intro">
              Si el proceso pide pantallas, permisos o reglas propias, el camino es <Link to="/es/servicios/software-a-medida">software a medida</Link>.
              {" "}A un sistema propio, con roles y pantallas, lo llamamos <Link to="/es/servicios/software-a-medida">sistemas a medida</Link>.
              {" "}Si dos sistemas no se pasan los datos, el camino es <Link to="/es/servicios/integraciones-de-datos">integración de sistemas</Link>.
              {" "}Cuando hace falta un flujo con revisión humana, lo vemos en <Link to="/es/servicios/automatizacion-ia">automatización de procesos con IA</Link>.
            </p>
            <div className="cta-group">
              <CalButton locale="es" placement={`use_cases_hub_${hub.section}`} label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale: "es", placement: `use_cases_hub_${hub.section}`, destination: "contact" })}
              >
                <span>{t.sendBrief}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="section light-section" aria-labelledby="use-case-hub-heading">
          <div className="shell">
            <header className="section-heading" style={{ marginBottom: "2rem" }}>
              <p className="eyebrow">Casos de uso</p>
              <h2 id="use-case-hub-heading">{hub.section === "automatizaciones" ? "Procesos que automatizamos" : "Sistemas que conectamos"}</h2>
            </header>
            <div className="hub-card-grid">
              {items.map((item, index) => (
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

        {hub.guide?.length ? (
          <section className="section soft-section" aria-labelledby="use-case-hub-guide-heading">
            <div className="shell commercial-expand-stack">
              <h2 id="use-case-hub-guide-heading">{hub.guideTitle}</h2>
              {hub.guide.map((item) => (
                <article className="commercial-h2-block" key={item.title}>
                  <h3>{item.title}</h3>
                  <p><RichText text={item.body} /></p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {hub.faqs?.length ? (
          <section className="section faq-section" id="faq">
            <div className="shell faq-grid">
              <header className="section-heading">
                <p className="eyebrow">FAQ</p>
                <h2>Preguntas frecuentes</h2>
                <Compass aria-hidden="true" />
              </header>
              <Accordion items={hub.faqs} />
            </div>
          </section>
        ) : null}

        <section className="detail-cta dark-section">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-dark">¿No estás seguro qué capacidad encaja?</p>
              <h2>Mapeá el cuello de botella en 15 min.</h2>
            </div>
            <div className="cta-group detail-cta-actions">
              <CalButton locale="es" placement={`use_cases_hub_${hub.section}_final`} label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale: "es", placement: `use_cases_hub_${hub.section}_final`, destination: "contact" })}
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
