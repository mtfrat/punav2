import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import "../about.css";
import { CalButton, PageShell, trackEvent } from "../components/marketing";
import { ABOUT_PATH, aboutCopy, aboutRubroLinks, CM_DEMO_PATH, CM_REPO_URL } from "../content/about";
import { casesHubPath, contactPath, SITE_URL, type Locale } from "../content/chrome";
import { breadcrumbSchema, createMeta, organizationSchema } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  return { locale, alternatePath: ABOUT_PATH[locale === "en" ? "es" : "en"] };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { locale, alternatePath } = data;
  const c = aboutCopy[locale];
  const path = ABOUT_PATH[locale];
  const url = `${SITE_URL}${path}`;
  const org = organizationSchema(locale);
  return createMeta({
    locale,
    title: c.metaTitle,
    description: c.metaDescription,
    path,
    alternatePath,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: c.h1,
        description: c.metaDescription,
        inLanguage: locale === "en" ? "en" : "es-AR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
      // Same Organization node as the home page (same @id), so assistants resolve one entity.
      org,
      {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: locale === "en" ? "Unified coefficient for Convenio Multilateral" : "Coeficiente unificado de Convenio Multilateral",
        codeRepository: CM_REPO_URL,
        programmingLanguage: "Python",
        license: "https://opensource.org/licenses/MIT",
        author: { "@id": `${SITE_URL}/#organization` },
      },
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: c.crumb, path },
      ]),
    ],
  });
};

export default function AboutPage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const c = aboutCopy[locale];
  const rubros = aboutRubroLinks(locale);
  const es = locale === "es";
  return (
    <PageShell locale={locale}>
      <main id="main-content" className="about">
        <section className="detail-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">Puna Tech · Buenos Aires</p>
            <h1>{c.h1}</h1>
            <p className="hero-lead">{c.definition}</p>
          </div>
        </section>

        <section className="section about-facts" aria-labelledby="about-facts-h">
          <div className="shell about-narrow">
            <h2 id="about-facts-h">{c.factsTitle}</h2>
            <dl className="about-dl">
              {c.facts.map(([label, value]) => (
                <div key={label} className="about-row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section about-section soft-section" aria-labelledby="about-what-h">
          <div className="shell about-narrow">
            <h2 id="about-what-h">{c.whatTitle}</h2>
            <ul className="about-list">
              {c.whatLinks.map(([label, path]) => (
                <li key={path}><Link to={path}>{label}<ArrowRight aria-hidden="true" size={16} /></Link></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section about-section" aria-labelledby="about-who-h">
          <div className="shell about-narrow">
            <h2 id="about-who-h">{c.whoTitle}</h2>
            <p>{c.whoLead}</p>
            <ul className="about-list">
              {rubros.map((r) => (
                <li key={r.path}><Link to={r.path}><strong>{r.name}</strong><span>{r.pain}</span><ArrowRight aria-hidden="true" size={16} /></Link></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section about-section soft-section" aria-labelledby="about-how-h">
          <div className="shell about-narrow">
            <h2 id="about-how-h">{c.howTitle}</h2>
            <ol className="about-steps">{c.how.map((item) => <li key={item}>{item}</li>)}</ol>
          </div>
        </section>

        <section className="section about-section" aria-labelledby="about-not-h">
          <div className="shell about-narrow">
            <h2 id="about-not-h">{c.notTitle}</h2>
            <ul className="about-bullets">{c.not.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="section about-section soft-section" aria-labelledby="about-tools-h">
          <div className="shell about-narrow">
            <h2 id="about-tools-h">{c.toolsTitle}</h2>
            <p>{c.toolsBody}</p>
            <ul className="about-list">
              <li><a href={CM_REPO_URL} target="_blank" rel="noopener noreferrer">{c.toolsRepo}<ExternalLink aria-hidden="true" size={16} /></a></li>
              <li><Link to={CM_DEMO_PATH[locale]}>{c.toolsDemo}<ArrowRight aria-hidden="true" size={16} /></Link></li>
            </ul>
          </div>
        </section>

        <section className="section about-section" aria-labelledby="about-cases-h">
          <div className="shell about-narrow">
            <h2 id="about-cases-h">{c.casesTitle}</h2>
            <p>{c.casesBody}</p>
            <p><Link className="text-link" to={casesHubPath(locale)}>{c.casesLink}<ArrowRight aria-hidden="true" size={17} /></Link></p>
          </div>
        </section>

        <section className="detail-cta dark-section">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-dark">{c.contactTitle}</p>
              <h2>{c.contactBody}</h2>
            </div>
            <div className="cta-group detail-cta-actions">
              <CalButton locale={locale} placement="about_final" label={es ? "Reservar llamada de 15 min" : "Book a 15-min call"} className="button-primary-terracotta" />
              <Link
                to={contactPath(locale)}
                className="button-ghost-burgundy button-ghost-burgundy-light"
                onClick={() => trackEvent("cta_click", { locale, placement: "about_final", destination: "contact" })}
              >
                <span>{c.contactCta}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
