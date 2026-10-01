import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { CalButton, PageShell, trackEvent } from "../components/marketing";
import { casePath, caseStudies, casesHubCopy, casesHubPath, copy, type Locale } from "../content/site";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  const all = caseStudies[locale];
  const labKeys = new Set(["starpress", "viralyt", "videome", "autopost"]);
  return {
    locale,
    hub: casesHubCopy[locale],
    clientCases: all.filter((study) => !labKeys.has(study.key)),
    labCases: all.filter((study) => labKeys.has(study.key)),
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  const hub = data?.hub || casesHubCopy.en;
  const path = casesHubPath(locale);
  return createMeta({
    locale,
    title: hub.metaTitle,
    description: hub.metaDescription,
    path,
    alternatePath: casesHubPath(locale === "en" ? "es" : "en"),
    schema: [
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: locale === "en" ? "Case studies" : "Casos", path },
      ]),
    ],
  });
};

export default function CaseStudiesHub({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, hub, clientCases, labCases } = loaderData;
  const t = copy[locale];
  const briefHref = locale === "en" ? "/#brief" : "/es#brief";

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">{hub.eyebrow}</p>
            <h1>{hub.title}</h1>
            <p style={{ maxWidth: "46rem" }}>{hub.intro}</p>
            <div className="cta-group">
              <CalButton locale={locale} placement="cases_hub" label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale, placement: "cases_hub", destination: "brief" })}
              >
                <span>{t.sendBrief}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="section light-section" aria-labelledby="client-cases-heading">
          <div className="shell">
            <header className="section-heading" style={{ marginBottom: "2rem" }}>
              <p className="eyebrow">{t.workClientEyebrow}</p>
              <h2 id="client-cases-heading">{hub.clientHeading}</h2>
            </header>
            <div className="hub-card-grid">
              {clientCases.map((study) => (
                <article className="hub-card" key={study.slug}>
                  <span className="client-delivery-badge">{t.workClientBadge}</span>
                  <p className="work-name">{study.displayName}</p>
                  <h2><Link to={casePath(locale, study.slug)}>{study.title}</Link></h2>
                  <Link className="text-link" to={casePath(locale, study.slug)}>
                    {t.viewArchitecture}
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft-section" aria-labelledby="lab-cases-heading">
          <div className="shell">
            <header className="section-heading" style={{ marginBottom: "2rem" }}>
              <p className="eyebrow">{t.workLabEyebrow}</p>
              <h2 id="lab-cases-heading">{hub.labHeading}</h2>
            </header>
            <div className="hub-card-grid">
              {labCases.map((study) => (
                <article className="hub-card" key={study.slug}>
                  <div className="lab-demo-badge">
                    <span className="lab-demo-dot" aria-hidden="true" />
                    <span>{t.workLabBadge}</span>
                  </div>
                  <p className="work-name">{study.displayName}</p>
                  <h2><Link to={casePath(locale, study.slug)}>{study.title}</Link></h2>
                  <Link className="text-link" to={casePath(locale, study.slug)}>
                    {t.openCase}
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="detail-cta dark-section">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-dark">{locale === "en" ? "Have a similar bottleneck?" : "¿Tenés un cuello de botella similar?"}</p>
              <h2>{locale === "en" ? "Map the bottleneck in 15 min." : "Mapeá el cuello de botella en 15 min."}</h2>
            </div>
            <div className="cta-group detail-cta-actions">
              <CalButton locale={locale} placement="cases_hub_final" label={t.book} className="button-primary-terracotta" />
              <a
                href={briefHref}
                className="button-ghost-burgundy"
                onClick={() => trackEvent("cta_click", { locale, placement: "cases_hub_final", destination: "brief" })}
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
