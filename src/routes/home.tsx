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
import { trackEvent } from "../components/tracking";
import {
  casePath,
  caseStudies,
  copy,
  servicePath,
  services,
  servicesHubPath,
  type CaseStudyContent,
  type Locale,
} from "../content/site";
import { createMeta, organizationSchema } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: Locale = new URL(request.url).pathname === "/es" ? "es" : "en";
  return { locale };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  const path = locale === "en" ? "/" : "/es";
  const alternatePath = locale === "en" ? "/es" : "/";
  return createMeta({
    locale,
    title: locale === "en" ? "Custom Software & AI Automation | Puna Tech" : "Software a Medida y Automatización con IA | Puna Tech",
    description: locale === "en"
      ? "Bilingual software factory building custom software, AI automation, and systems integrations for complex operational workflows."
      : "Software factory bilingüe que construye software a medida, automatización con IA e integraciones para flujos operativos complejos.",
    path,
    alternatePath,
    schema: organizationSchema(locale),
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

const slowdownIcons = [ScanSearch, Link2, Layers3];

export default function Home({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const t = copy[locale];
  const localizedCases = caseStudies[locale];
  const localizedServices = services[locale];
  const slowdownServices = [localizedServices[0], localizedServices[2], localizedServices[1]];

  const labCases = localizedCases.filter((c) => ["starpress", "viralyt", "videome", "autopost"].includes(c.key));
  const clientCases = localizedCases.filter((c) => ["lead-router", "linkedin-copilot", "edtech-web3", "gtm-automation"].includes(c.key));

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        {/* PILAR 1: HERO editorial asimétrico estilo cover brandsheet */}
        <section className="bs-cover-hero" aria-label={locale === "en" ? "Puna Tech Cover" : "Portada de Puna Tech"}>
          <div className="bs-cover-masthead shell">
            <span>{locale === "en" ? "PUNA TECH / B2B SOFTWARE FACTORY · 2026" : "PUNA TECH / SOFTWARE FACTORY B2B · 2026"}</span>
            <span>{locale === "en" ? "AUTOMATION · INTEGRATIONS · CUSTOM SYSTEMS" : "AUTOMATIZACIÓN · INTEGRACIONES · SOFTWARE A MEDIDA"}</span>
          </div>
          <div className="shell bs-cover-grid">
            <div className="bs-cover-copy">
              <p className="eyebrow">{t.heroEyebrow}</p>
              <h1 className="bs-cover-h1">
                {(() => {
                  const title = t.heroTitle;
                  const italic = t.heroItalic;
                  const idx = title.indexOf(italic);
                  if (idx === -1) return title;
                  return (
                    <>
                      {title.slice(0, idx)}
                      <em className="bs-hero-italic">{italic}</em>
                      {title.slice(idx + italic.length)}
                    </>
                  );
                })()}
              </h1>
              <p className="bs-intro-lead">
                {t.heroBody}
              </p>
              {/* PILAR 3: CTA Único como objeto de diseño (Primario Terracota + Secundario Ghost Borgoña) */}
              <div className="cta-group bs-cover-actions">
                <CalButton
                  locale={locale}
                  placement="hero_audit"
                  label={t.book}
                  className="button-primary-terracotta"
                />
                <a
                  href="#brief"
                  className="button-ghost-burgundy"
                  onClick={() => trackEvent("cta_click", { locale, placement: "hero", destination: "brief" })}
                >
                  <span>{t.sendBrief}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>
              <p className="bs-cover-microcopy">
                <Check aria-hidden="true" size={16} />
                <span>{t.heroMicrocopy}</span>
              </p>
            </div>
            <figure className="bs-cover-photo-side">
              <picture>
                <source
                  type="image/avif"
                  srcSet="/art-direction/workspace-cup-of-couple-480.avif 480w, /art-direction/workspace-cup-of-couple-768.avif 768w, /art-direction/workspace-cup-of-couple-960.avif 960w, /art-direction/workspace-cup-of-couple-1200.avif 1200w"
                  sizes="(max-width: 960px) 100vw, 520px"
                />
                <source
                  type="image/webp"
                  srcSet="/art-direction/workspace-cup-of-couple-480.webp 480w, /art-direction/workspace-cup-of-couple-768.webp 768w, /art-direction/workspace-cup-of-couple-960.webp 960w, /art-direction/workspace-cup-of-couple-1200.webp 1200w"
                  sizes="(max-width: 960px) 100vw, 520px"
                />
                <img
                  src="/art-direction/workspace-cup-of-couple-960.jpg"
                  alt={locale === "en" ? "Natural light on wooden work desk with laptop and notebook representing intentional engineering." : "Luz natural sobre mesa de trabajo con laptop y cuaderno: trabajo con criterio."}
                  width={1600}
                  height={2400}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
              <figcaption>
                {locale === "en" ? (
                  <>Repetitive handoffs,<br /><em>into the system.</em></>
                ) : (
                  <>Lo repetitivo,<br /><em>al sistema.</em></>
                )}
              </figcaption>
              <span className="bs-cover-photo-badge">
                {locale === "en" ? "PUNA TECH · CRAFTED FOR OWNERSHIP" : "PUNA TECH · CONSTRUIDO PARA CONTROL TOTAL"}
              </span>
            </figure>
          </div>
        </section>

        <section className="proof-strip" aria-label={locale === "en" ? "Puna Tech delivery principles" : "Principios de entrega de Puna Tech"}>
          <div className="shell proof-grid">
            {t.proof.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
          </div>
        </section>

        {locale === "es" && (
          <section className="section latam-ar-section" aria-labelledby="latam-ar-heading">
            <div className="shell latam-ar-grid">
              <header className="section-heading">
                <p className="eyebrow">{t.latamEyebrow}</p>
                <h2 id="latam-ar-heading">{t.latamTitle}</h2>
                <p>{t.latamBody}</p>
                <Link className="text-link" to={servicesHubPath("es")}>
                  Ver servicios
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </header>
              <ul className="latam-ar-points">
                {t.latamPoints.map(([title, body]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* SERVICES: Estructura preservada intacta */}
        <section id="services" className="section slowdown-section">
          <div className="shell slowdown-grid">
            <header className="section-heading sticky-heading"><p className="eyebrow">{t.slowdownEyebrow}</p><h2>{t.slowdownTitle}</h2><p>{t.servicesBody}</p></header>
            <div className="slowdown-list">
              {t.slowdowns.map(([problem, capability, description], index) => {
                const Icon = slowdownIcons[index];
                const service = slowdownServices[index];
                return (
                  <Link className="slowdown-item" key={problem} to={servicePath(locale, service.slug)}>
                    <span className="slowdown-icon"><Icon aria-hidden="true" /></span>
                    <span className="slowdown-copy"><small>{capability}</small><strong>{problem}</strong><span>{description}</span></span>
                    <ChevronRight aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* INDUSTRY ENTRY: Estructura preservada */}
        <section className="industry-entry-section" aria-labelledby="software-factory-title">
          <div className="shell industry-entry-grid">
            <div className="industry-entry-intro">
              <p className="eyebrow">Software factory</p>
              <h2 id="software-factory-title">{locale === "en" ? "From operational problem to production software." : "Del problema operativo al software en producción."}</h2>
              <p>{locale === "en" ? "We combine product design, engineering, automation, integrations, and deployment so the complete system remains coherent." : "Combinamos diseño de producto, ingeniería, automatización, integraciones y despliegue para que el sistema completo sea coherente."}</p>
            </div>
            <div className="industry-entry-links">
              <Link className="industry-entry-card" to={servicePath(locale, localizedServices[1].slug)}>
                <span>01</span>
                <div><small>{locale === "en" ? "End-to-end delivery" : "Entrega end-to-end"}</small><h3>{locale === "en" ? "One team across product, software, data, and launch." : "Un equipo para producto, software, datos y lanzamiento."}</h3><p>{locale === "en" ? "Start with a focused scope and expand on a maintainable technical foundation." : "Empezá con un alcance enfocado y crecé sobre una base técnica mantenible."}</p></div>
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* PILAR 2: SELECTED WORK — Dos franjas (Lab demo vs Client delivery) */}
        <section id="work" className="work-section-v3" aria-label={t.casesTitle}>
          {/* Franja 2: Client delivery (badge “Client delivery” + outcome operativo) */}
          <div className="franja-client" aria-labelledby="client-delivery-heading">
            <div className="shell">
              <header className="franja-header">
                <p className="eyebrow">{t.workClientEyebrow}</p>
                <h2 id="client-delivery-heading">{t.workClientTitle}</h2>
                <p>{t.workClientSubtitle}</p>
              </header>
              <div className="client-delivery-stack">
                {clientCases.map((study) => (
                  <article className="client-delivery-row" key={study.slug}>
                    <div className="client-row-info">
                      <div className="client-row-meta">
                        <span className="client-delivery-badge">{t.workClientBadge}</span>
                        {study.operationalOutcome && !study.operationalOutcomeNeedsConfirm && (
                          <span className="client-outcome-badge">
                            {study.operationalOutcome}
                          </span>
                        )}
                      </div>
                      <p className="client-row-name">{study.displayName}</p>
                      <h3>{study.title}</h3>
                      <p>{study.summary}</p>
                      <ul className="work-outcomes">
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
                      <div className="client-row-cta">
                        <Link
                          className="client-row-link"
                          to={casePath(locale, study.slug)}
                          aria-label={locale === "en" ? `View delivery architecture for ${study.displayName}` : `Ver arquitectura de entrega de ${study.displayName}`}
                        >
                          <span>{t.viewArchitecture}</span>
                          <ArrowRight aria-hidden="true" size={18} />
                        </Link>
                      </div>
                    </div>
                    <div className="client-row-visual">
                      <SystemMap study={study} compact />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Franja 1: Lab demo (badge “Built by Puna · demo”) */}
          <div className="franja-lab" aria-labelledby="lab-demos-heading">
            <div className="shell">
              <header className="franja-header">
                <p className="eyebrow">{t.workLabEyebrow}</p>
                <h2 id="lab-demos-heading">{t.workLabTitle}</h2>
                <p>{t.workLabSubtitle}</p>
              </header>
              <div className="lab-demo-grid">
                {labCases.map((study) => (
                  <article className="lab-demo-card" key={study.slug}>
                    <div>
                      <div className="lab-demo-badge">
                        <span className="lab-demo-dot" aria-hidden="true" />
                        <span>{t.workLabBadge}</span>
                      </div>
                      <div className="lab-card-title">
                        <h3>{study.displayName}</h3>
                        <span className="lab-card-name">{study.sector.split("·")[0]}</span>
                      </div>
                      <p className="lab-card-desc">{study.summary}</p>
                      <p className="lab-card-role">
                        {locale === "en" ? "Internal lab product · execution proof" : "Producto de lab interno · prueba de ejecución"}
                      </p>
                    </div>
                    <div className="lab-card-actions">
                      <Link className="text-link" to={casePath(locale, study.slug)} aria-label={locale === "en" ? `Open ${study.displayName} case study` : `Abrir caso de ${study.displayName}`}>
                        {t.openCase}
                        <ArrowRight aria-hidden="true" size={17} />
                      </Link>
                      {study.liveDemoUrl && (
                        <a
                          href={study.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lab-live-link"
                          aria-label={locale === "en" ? `Open ${study.displayName} live demo` : `Abrir demo en vivo de ${study.displayName}`}
                        >
                          <span>{t.liveDemo}</span>
                          <ExternalLink aria-hidden="true" size={14} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* PROCESS: Estructura preservada con CTA actualizado */}
        <section id="process" className="section audit-section">
          <div className="shell">
            <div className="audit-intro">
              <div><p className="eyebrow eyebrow-dark">{t.auditEyebrow}</p><h2>{t.auditTitle}</h2></div>
              <CalButton locale={locale} placement="audit_section" label={t.book} className="button-primary-terracotta" />
            </div>
            <ol className="audit-steps">
              {t.auditSteps.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}
            </ol>
            <div className="delivery-ribbon" aria-label={t.processTitle}>
              <p>{t.processTitle}</p>
              <ol>{t.process.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><small>{description}</small></div></li>)}</ol>
            </div>
          </div>
        </section>

        {/* FAQ: Estructura preservada intacta */}
        <section className="section faq-section" id="faq">
          <div className="shell faq-grid">
            <header className="section-heading"><p className="eyebrow">FAQ</p><h2>{t.faqTitle}</h2><Compass aria-hidden="true" /></header>
            <Accordion items={t.faqs as Array<[string, string]>} />
          </div>
        </section>

        {/* PILAR 3 & 4: FINAL SECTION - CTA único + Prueba social "nota editorial" + Brief form */}
        <section className="section final-section" id="brief">
          <div className="shell final-grid">
            <div className="final-copy">
              <p className="eyebrow eyebrow-dark">{locale === "en" ? "Start with the bottleneck" : "Empezá por el cuello de botella"}</p>
              <h2>{t.finalTitle}</h2>
              <p>{t.finalBody}</p>
              <div className="cta-group" style={{ marginBottom: "2.5rem" }}>
                <CalButton locale={locale} placement="final_audit" label={t.book} className="button-primary-terracotta" />
                <a
                  href="#brief-form"
                  className="button-ghost-burgundy button-ghost-burgundy-light"
                  onClick={() => trackEvent("cta_click", { locale, placement: "final_cta", destination: "brief" })}
                >
                  <span>{t.sendBrief}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>

            </div>

            <div className="brief-card" id="brief-form">
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
