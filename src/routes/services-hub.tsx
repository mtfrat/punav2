import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { CalButton, PageShell, trackEvent } from "../components/marketing";
import { copy, servicePath, services, servicesHubCopy, servicesHubPath, type Locale } from "../content/site";
import { breadcrumbSchema, collectionPageSchema, createMeta } from "../lib/seo";

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
    ],
  });
};

export default function ServicesHub({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, hub, ordered } = loaderData;
  const t = copy[locale];
  const briefHref = locale === "en" ? "/#brief" : "/es#brief";

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero services-hub-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">{hub.eyebrow}</p>
            <h1>{hub.title}</h1>
            <p className="hero-lead">{hub.lead}</p>
            <p className="hero-intro">{hub.intro}</p>
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
