import type * as React from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  ExternalLink,
  Layers3,
  Link2,
  ScanSearch,
} from "lucide-react";
import { Accordion, CalButton, PageShell, ProjectBrief } from "../components/marketing";
import { FlowDemo, HomeMotion, HoursCalculator, RidgeField } from "../components/home-editorial";
import { trackEvent } from "../components/tracking";
import {
  casePath,
  caseStudies,
  copy,
  servicePath,
  services,
  type CaseStudyContent,
  type Locale,
} from "../content/site";
import { useCases } from "../content/use-cases";
import { createMeta, organizationSchema } from "../lib/seo";
import "../home-editorial.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: Locale = new URL(request.url).pathname === "/es" ? "es" : "en";
  return { locale };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  const path = locale === "en" ? "/" : "/es";
  const alternatePath = locale === "en" ? "/es" : "/";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy[locale].faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return createMeta({
    locale,
    title: locale === "en" ? "Custom Software & AI Automation | Puna Tech" : "Software a Medida y Automatización con IA | Puna Tech",
    description: locale === "en"
      ? "Custom software to automate B2B operations in Argentina. Puna Tech, Buenos Aires: automation, integrations, and systems your team can run."
      : "Software a medida para automatizar operaciones B2B en Buenos Aires, Argentina: automatización, integraciones y sistemas que tu equipo puede operar.",
    path,
    alternatePath,
    schema: [organizationSchema(locale), faqSchema],
  });
};

function SystemMap({ study, compact = false }: { study: CaseStudyContent; compact?: boolean }) {
  return (
    <figure className={`editorial-map ${compact ? "editorial-map-compact" : ""}`} aria-label={`${study.displayName}: ${study.flow.join(", ")}`}>
      <figcaption>
        <span>{study.displayName}</span>
        <small>{study.visualCaption}</small>
      </figcaption>
      <div className="map-canvas">
        <span className="map-axis map-axis-x" aria-hidden="true" />
        <span className="map-axis map-axis-y" aria-hidden="true" />
        {study.flow.map((item, index) => (
          <div className="map-node" key={item} style={{ "--map-index": index } as React.CSSProperties}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
      <p>{study.confidentialityLabel}</p>
    </figure>
  );
}

function HeroTitle({ title, italic }: { title: string; italic: string }) {
  const index = title.indexOf(italic);
  if (index === -1) return title;
  const before = title.slice(0, index);
  const after = title.slice(index + italic.length);
  return (
    <>
      <span className="mm-line"><span className="mm-line-inner">{before}</span></span>
      <span className="mm-line mm-italic-line"><em className="mm-italic"><span className="mm-line-inner">{italic}{after}</span></em></span>
    </>
  );
}

const slowdownIcons = [ScanSearch, Link2, Layers3];

export default function Home({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const t = copy[locale];
  const localizedCases = caseStudies[locale];
  const localizedServices = services[locale];
  const slowdownServices = [localizedServices[0], localizedServices[2], localizedServices[1]];
  const latamServices = [localizedServices[1], localizedServices[0], localizedServices[2]];
  const labCases = localizedCases.filter((item) => ["starpress", "viralyt", "videome", "autopost"].includes(item.key));
  const clientCases = localizedCases.filter((item) => ["lead-router", "linkedin-copilot", "edtech-web3", "gtm-automation"].includes(item.key));

  return (
    <PageShell locale={locale} chrome="editorial">
      <HomeMotion />
      <main id="main-content" className="mm-home" data-mm-home>
        <section className="mm-hero" data-mm-hero aria-label={locale === "en" ? "Puna Tech Cover" : "Portada de Puna Tech"}>
          <div className="shell mm-hero-copy">
            <p className="mm-mast mm-intro">
              <span>{locale === "en" ? "PUNA TECH / B2B SOFTWARE FACTORY · 2026" : "PUNA TECH / SOFTWARE FACTORY B2B · 2026"}</span>
              <span>{locale === "en" ? "AUTOMATION · INTEGRATIONS · CUSTOM SYSTEMS" : "AUTOMATIZACIÓN · INTEGRACIONES · SOFTWARE A MEDIDA"}</span>
            </p>
            <p className="eyebrow mm-intro mm-d1">{t.heroEyebrow}</p>
            <h1 className="mm-display">
              <HeroTitle title={t.heroTitle} italic={t.heroItalic} />
            </h1>
            <p className="mm-hero-body mm-intro mm-d2">{t.heroBody}</p>
            <p className="mm-hero-body mm-intro mm-d3">{t.heroCompare}</p>
            <div className="cta-group mm-hero-actions mm-intro mm-d4">
              <CalButton locale={locale} placement="hero_audit" label={t.book} className="button-primary-terracotta mm-btn mm-btn-accent" />
              <a
                href="#brief"
                className="button-ghost-burgundy mm-btn mm-btn-ghost"
                onClick={() => trackEvent("cta_click", { locale, placement: "hero", destination: "brief" })}
              >
                <span>{t.sendBrief}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
            <p className="mm-micro mm-intro mm-d5">
              <Check aria-hidden="true" size={16} />
              <span>{t.heroMicrocopy}</span>
            </p>
          </div>
          <RidgeField
            badge={locale === "en" ? "PUNA TECH · CRAFTED FOR OWNERSHIP" : "PUNA TECH · CONSTRUIDO PARA CONTROL TOTAL"}
            caption={locale === "en" ? <>Repetitive handoffs,<br /><em>into the system.</em></> : <>Lo repetitivo,<br /><em>al sistema.</em></>}
          />
        </section>

        <section className="mm-proof" aria-label={locale === "en" ? "Puna Tech delivery principles" : "Principios de entrega de Puna Tech"}>
          <div className="shell mm-proof-grid" data-mm-rise>
            {t.proof.map((item, index) => (
              <div className="mm-rise-item" key={item}>
                <div className="mm-card mm-proof-card mm-tilt-inner">
                  <span>0{index + 1}</span>
                  <p>{item}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <FlowDemo locale={locale} />

        <section id="services" className="mm-section" aria-labelledby="services-heading">
          <div className="shell">
            <header className="mm-heading">
              <p className="eyebrow">{t.slowdownEyebrow}</p>
              <h2 id="services-heading" className="mm-h2"><span>{t.slowdownTitle}</span></h2>
              <p className="mm-dek">{t.servicesBody}</p>
            </header>
            <div className="mm-card-grid" data-mm-rise>
              {t.slowdowns.map(([problem, capability, description], index) => {
                const Icon = slowdownIcons[index];
                const service = slowdownServices[index];
                return (
                  <div className="mm-rise-item" key={problem}>
                    <Link className="mm-card mm-tilt-inner mm-service" to={servicePath(locale, service.slug)}>
                      <span className="mm-service-top">
                        <span className="mm-accent-dot" aria-hidden="true" />
                        <Icon aria-hidden="true" size={22} />
                      </span>
                      <small>{capability}</small>
                      <strong>{problem}</strong>
                      <span>{description}</span>
                      <ChevronRight className="mm-card-link" aria-hidden="true" size={18} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {locale === "es" && (
          <section className="mm-section mm-section-deep" aria-labelledby="home-use-cases-heading">
            <div className="shell">
              <header className="mm-heading">
                <h2 id="home-use-cases-heading" className="mm-h2"><span>Problemas del día a día que automatizamos</span></h2>
              </header>
              <ol className="mm-usecases mm-card-grid" data-mm-rise>
                {useCases.map((item, index) => (
                  <li className="mm-rise-item" key={item.path}>
                    <Link className="mm-card mm-tilt-inner mm-service" to={item.path}>
                      <span className="mm-kicker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{item.cardTitle}</strong>
                      <span>{item.cardBlurb}</span>
                      <ArrowRight className="mm-card-link" aria-hidden="true" size={18} />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <HoursCalculator locale={locale} />

        <section className="mm-section mm-section-deep" aria-labelledby="compare-heading">
          <div className="shell">
            <header className="mm-heading">
              <h2 id="compare-heading" className="mm-h2"><span>{t.compareTitle}</span></h2>
            </header>
            <div className="mm-table-wrap">
              <table className="mm-table compare-table">
                <thead>
                  <tr>
                    <th scope="col" />
                    {t.compareColumns.map((column) => <th scope="col" key={column}>{column}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {t.compareRows.map(([label, standard, custom]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td data-label={t.compareColumns[0]}>{standard}</td>
                      <td data-label={t.compareColumns[1]}>{custom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mm-section" aria-labelledby="versus-heading">
          <div className="shell">
            <header className="mm-heading">
              <h2 id="versus-heading" className="mm-h2"><span>{t.versusTitle}</span></h2>
            </header>
            <ol className="mm-versus" data-mm-rise>
              {t.versus.map(([title, body]) => (
                <li className="mm-rise-item" key={title}>
                  <article className="mm-card mm-tilt-inner">
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {locale === "es" && (
          <section className="mm-section mm-section-deep" aria-labelledby="latam-ar-heading">
            <div className="shell">
              <header className="mm-heading">
                <p className="eyebrow">{t.latamEyebrow}</p>
                <h2 id="latam-ar-heading" className="mm-h2"><span>{t.latamTitle}</span></h2>
                <p className="mm-dek">{t.latamBody}</p>
                <div className="cta-group" style={{ marginTop: "1.5rem" }}>
                  <CalButton locale={locale} placement="es_latam_block" label={t.book} className="button-primary-terracotta mm-btn mm-btn-accent" />
                  <a
                    href="#brief"
                    className="button-ghost-burgundy mm-btn mm-btn-ghost"
                    onClick={() => trackEvent("cta_click", { locale, placement: "es_latam_block", destination: "brief" })}
                  >
                    <span>{t.sendBrief}</span>
                    <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </div>
              </header>
              <ul className="mm-latam" data-mm-rise>
                {t.latamPoints.map(([title, body], index) => (
                  <li className="mm-rise-item" key={title}>
                    <article className="mm-card mm-tilt-inner">
                      <h3>{latamServices[index] ? <Link to={servicePath(locale, latamServices[index].slug)}>{title}</Link> : title}</h3>
                      <p>{body}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="mm-section" aria-labelledby="software-factory-title">
          <div className="shell">
            <header className="mm-heading">
              <p className="eyebrow">Software factory</p>
              <h2 id="software-factory-title" className="mm-h2"><span>{locale === "en" ? "From operational problem to production software." : "Del problema operativo al software en producción."}</span></h2>
              <p className="mm-dek">{locale === "en" ? "We combine product design, engineering, automation, integrations, and deployment so the complete system remains coherent." : "Combinamos diseño de producto, ingeniería, automatización, integraciones y despliegue para que el sistema completo sea coherente."}</p>
            </header>
            <div data-mm-rise>
              <div className="mm-rise-item">
                <Link className="mm-card mm-tilt-inner mm-service" to={servicePath(locale, localizedServices[1].slug)}>
                  <span className="mm-kicker">01</span>
                  <small>{locale === "en" ? "End-to-end delivery" : "Entrega end-to-end"}</small>
                  <strong>{locale === "en" ? "One team across product, software, data, and launch." : "Un equipo para producto, software, datos y lanzamiento."}</strong>
                  <span>{locale === "en" ? "Start with a focused scope and expand on a maintainable technical foundation." : "Empezá con un alcance enfocado y crecé sobre una base técnica mantenible."}</span>
                  <ArrowRight className="mm-card-link" aria-hidden="true" size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="mm-section mm-section-deep" aria-label={t.casesTitle}>
          <div className="shell">
            <header className="mm-heading">
              <p className="eyebrow">{t.workClientEyebrow}</p>
              <h2 id="client-delivery-heading" className="mm-h2"><span>{t.workClientTitle}</span></h2>
              <p className="mm-dek">{t.workClientSubtitle}</p>
            </header>
            <div className="mm-client-list" data-mm-rise>
              {clientCases.map((study) => (
                <article className="mm-card mm-client mm-rise-item" key={study.slug}>
                  <div>
                    <div className="mm-service-top">
                      <span className="mm-kicker">{t.workClientBadge}</span>
                      {study.operationalOutcome && !study.operationalOutcomeNeedsConfirm ? <span className="mm-kicker">{study.operationalOutcome}</span> : null}
                    </div>
                    <p className="mm-dek">{study.displayName}</p>
                    <h3>{study.title}</h3>
                    <p>{study.summary}</p>
                    <ul className="mm-outcomes">
                      {study.impact
                        .filter((item) => !study.impactNeedsConfirm?.includes(item))
                        .slice(0, 2)
                        .map((item) => (
                          <li key={item}>
                            <Check aria-hidden="true" size={16} />
                            <span>{item}</span>
                          </li>
                        ))}
                    </ul>
                    <Link
                      className="mm-inline"
                      to={casePath(locale, study.slug)}
                      aria-label={locale === "en" ? `View delivery architecture for ${study.displayName}` : `Ver arquitectura de entrega de ${study.displayName}`}
                    >
                      {t.viewArchitecture} <ArrowRight aria-hidden="true" size={18} />
                    </Link>
                  </div>
                  <div className="mm-map">
                    <SystemMap study={study} compact />
                  </div>
                </article>
              ))}
            </div>

            <header className="mm-heading" style={{ marginTop: "4.5rem" }}>
              <p className="eyebrow">{t.workLabEyebrow}</p>
              <h2 id="lab-demos-heading" className="mm-h2"><span>{t.workLabTitle}</span></h2>
              <p className="mm-dek">{t.workLabSubtitle}</p>
            </header>
            <div className="mm-lab-grid" data-mm-rise>
              {labCases.map((study) => (
                <article className="mm-rise-item" key={study.slug}>
                <div className="mm-card mm-tilt-inner">
                  <div className="lab-demo-badge">
                    <span className="lab-demo-dot" aria-hidden="true" />
                    <span>{t.workLabBadge}</span>
                  </div>
                  <div className="lab-card-title">
                    <h3>{study.displayName}</h3>
                    <span className="lab-card-name">{study.sector.split("·")[0]}</span>
                  </div>
                  <p>{study.summary}</p>
                  <p className="lab-card-role">{locale === "en" ? "Internal lab product · execution proof" : "Producto de lab interno · prueba de ejecución"}</p>
                  <div className="lab-card-actions">
                    <Link className="mm-inline" to={casePath(locale, study.slug)} aria-label={locale === "en" ? `Open ${study.displayName} case study` : `Abrir caso de ${study.displayName}`}>
                      {t.openCase} <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                    {study.liveDemoUrl ? (
                      <a
                        href={study.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mm-inline"
                        aria-label={locale === "en" ? `Open ${study.displayName} live demo` : `Abrir demo en vivo de ${study.displayName}`}
                      >
                        {t.liveDemo} <ExternalLink aria-hidden="true" size={14} />
                      </a>
                    ) : null}
                  </div>
                </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="mm-section" aria-labelledby="audit-heading">
          <div className="shell">
            <header className="mm-heading">
              <p className="eyebrow">{t.auditEyebrow}</p>
              <h2 id="audit-heading" className="mm-h2"><span>{t.auditTitle}</span></h2>
              <CalButton locale={locale} placement="audit_section" label={t.book} className="button-primary-terracotta mm-btn mm-btn-accent" />
            </header>
            <ol className="mm-audit" data-mm-rise>
              {t.auditSteps.map(([title, description], index) => (
                <li className="mm-rise-item" key={title}>
                  <article className="mm-card mm-tilt-inner">
                    <span className="mm-kicker">0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                </li>
              ))}
            </ol>
            <div className="mm-heading" style={{ marginTop: "3.5rem" }}>
              <h2 className="mm-h2"><span>{t.processTitle}</span></h2>
            </div>
            <ol className="mm-process" data-mm-rise aria-label={t.processTitle}>
              {t.process.map(([title, description], index) => (
                <li className="mm-rise-item" key={title}>
                  <article className="mm-card mm-tilt-inner">
                    <span className="mm-kicker">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mm-section mm-section-deep mm-faq" id="faq" aria-labelledby="faq-heading">
          <div className="shell">
            <header className="mm-heading">
              <p className="eyebrow">FAQ</p>
              <h2 id="faq-heading" className="mm-h2"><span>{t.faqTitle}</span></h2>
              <Compass aria-hidden="true" />
            </header>
            <div className="mm-card">
              <Accordion items={t.faqs as Array<[string, string]>} />
            </div>
          </div>
        </section>

        <section className="mm-section" id="brief">
          <div className="shell mm-final">
            <div>
              <p className="eyebrow">{locale === "en" ? "Start with the bottleneck" : "Empezá por el cuello de botella"}</p>
              <h2 className="mm-h2"><span>{t.finalTitle}</span></h2>
              <p className="mm-dek">{t.finalBody}</p>
              <div className="cta-group" style={{ marginTop: "1.5rem" }}>
                <CalButton locale={locale} placement="final_audit" label={t.book} className="button-primary-terracotta mm-btn mm-btn-accent" />
                <a
                  href="#brief-form"
                  className="button-ghost-burgundy mm-btn mm-btn-ghost"
                  onClick={() => trackEvent("cta_click", { locale, placement: "final_cta", destination: "brief" })}
                >
                  <span>{t.sendBrief}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>
            </div>
            <div className="mm-brief" id="brief-form">
              <p className="eyebrow">{locale === "en" ? "Written route" : "Por escrito"}</p>
              <h3>{t.briefTitle}</h3>
              <p>{t.briefBody}</p>
              <ProjectBrief locale={locale} />
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
