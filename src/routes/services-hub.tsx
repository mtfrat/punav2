import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { CalButton, PageShell, trackEvent } from "../components/marketing";
import { copy, servicePath, services, servicesHubPath, type Locale } from "../content/site";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  return { locale, services: services[locale] };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  const path = servicesHubPath(locale);
  const alternatePath = servicesHubPath(locale === "en" ? "es" : "en");
  return createMeta({
    locale,
    title: locale === "en" ? "Services | Custom Software, Automation & Integrations | Puna Tech" : "Servicios | Software a Medida, Automatización e Integraciones | Puna Tech",
    description: locale === "en"
      ? "Three focused capabilities: custom B2B software, business process automation, and systems integration. Start with the bottleneck."
      : "Tres capacidades enfocadas: software B2B a medida, automatización de procesos e integración de sistemas. Empezá por el cuello de botella.",
    path,
    alternatePath,
    schema: [
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: locale === "en" ? "Services" : "Servicios", path },
      ]),
    ],
  });
};

export default function ServicesHub({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, services: list } = loaderData;
  const t = copy[locale];
  const briefHref = locale === "en" ? "/#brief" : "/es#brief";

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">{locale === "en" ? "Services hub" : "Hub de servicios"}</p>
            <h1>{locale === "en" ? "Start with the bottleneck, not the technology." : "Empezá por el cuello de botella, no por la tecnología."}</h1>
            <p style={{ maxWidth: "42rem" }}>
              {locale === "en"
                ? "Custom software, process automation, and systems integration—shaped around one operational outcome and a system your team can own."
                : "Software a medida, automatización de procesos e integración de sistemas—organizados alrededor de un resultado operativo y un sistema que tu equipo pueda operar."}
            </p>
            <div className="cta-group">
              <CalButton locale={locale} placement="services_hub" label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale, placement: "services_hub", destination: "brief" })}
              >
                <span>{t.sendBrief}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="section light-section">
          <div className="shell hub-card-grid">
            {list.map((service, index) => (
              <article className="hub-card" key={service.slug}>
                <span className="hub-card-index">0{index + 1}</span>
                <p className="eyebrow">{service.eyebrow}</p>
                <h2><Link to={servicePath(locale, service.slug)}>{service.title}</Link></h2>
                <p>{service.description}</p>
                <ul className="hub-card-points">
                  {service.problems.slice(0, 2).map((item) => <li key={item}>{item}</li>)}
                </ul>
                <Link className="text-link" to={servicePath(locale, service.slug)}>
                  {locale === "en" ? "Open service" : "Abrir servicio"}
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-cta dark-section">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-dark">{locale === "en" ? "Not sure which capability fits?" : "¿No estás seguro qué capacidad encaja?"}</p>
              <h2>{locale === "en" ? "Fifteen minutes to map the constraint." : "Quince minutos para mapear la restricción."}</h2>
            </div>
            <div className="cta-group detail-cta-actions">
              <CalButton locale={locale} placement="services_hub_final" label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale, placement: "services_hub_final", destination: "brief" })}
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
