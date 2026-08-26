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
import { industries, industryPath } from "../content/industries";
import {
  blogPath,
  casePath,
  caseStudies,
  copy,
  founder,
  servicePath,
  services,
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
    title: locale === "en" ? "Founder-Led Custom Software & AI Automation | Puna Tech" : "Software a Medida y Automatización con IA | Puna Tech",
    description: locale === "en"
      ? "Founder-led custom software, AI automation, and systems integration for B2B operations teams across the US and Latin America."
      : "Software a medida, automatización con IA e integraciones para equipos de operaciones B2B de EE. UU. y Latinoamérica.",
    path,
    alternatePath,
    schema: organizationSchema(locale),
  });
};

function MountainSymbol() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 102" focusable="false">
      <path d="M0 102 48 26l37 76H0Z" fill="#ff6b00" />
      <path d="M38 102 101 0l59 102H38Z" fill="currentColor" />
      <path d="M108 102 136 52l24 50h-52Z" fill="#7d2935" />
    </svg>
  );
}

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

function HeroProof({ locale }: { locale: Locale }) {
  const study = caseStudies[locale][0];
  return (
    <div className="hero-proof" aria-label={locale === "en" ? "Founder-led delivery and selected system architecture" : "Entrega liderada por el fundador y arquitectura seleccionada"}>
      <SystemMap study={study} compact />
      <div className="founder-proof-card">
        <MountainSymbol />
        <div>
          <span>{locale === "en" ? "FOUNDER-LED" : "LIDERADO POR SU FUNDADOR"}</span>
          <strong>{locale === "en" ? "The first call and the hard decisions stay connected." : "La primera llamada y las decisiones difíciles siguen conectadas."}</strong>
        </div>
      </div>
    </div>
  );
}

const slowdownIcons = [ScanSearch, Link2, Layers3];

export default function Home({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const t = copy[locale];
  const localizedCases = caseStudies[locale];
  const localizedServices = services[locale];
  const localizedIndustries = industries[locale];
  const founderCopy = founder[locale];
  const slowdownServices = [localizedServices[0], localizedServices[2], localizedServices[1]];

  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="hero-section editorial-hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{t.heroEyebrow}</p>
              <h1>{t.heroTitle}</h1>
              <p className="hero-body">{t.heroBody}</p>
              <div className="hero-actions">
                <CalButton locale={locale} placement="hero_audit" />
                <a className="button-text" href="#work">{t.seeWork}<ArrowRight aria-hidden="true" size={18} /></a>
              </div>
              <p className="hero-microcopy"><Check aria-hidden="true" size={16} />{t.heroMicrocopy}</p>
            </div>
            <HeroProof locale={locale} />
          </div>
        </section>

        <section className="proof-strip" aria-label={locale === "en" ? "Puna Tech delivery principles" : "Principios de entrega de Puna Tech"}>
          <div className="shell proof-grid">
            {t.proof.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
          </div>
        </section>

        <section id="work" className="section work-section">
          <div className="shell">
            <header className="section-heading work-heading">
              <div><p className="eyebrow">{t.casesEyebrow}</p><h2>{t.casesTitle}</h2></div>
              <p>{t.casesBody}</p>
            </header>
            <div className="featured-work">
              {localizedCases.map((study, index) => (
                <article className={`work-piece work-piece-${index + 1}`} key={study.slug}>
                  <div className="work-copy">
                    <div className="work-number">{String(index + 1).padStart(2, "0")}</div>
                    <div className="case-meta"><span>{study.type}</span><span>{study.sector}</span></div>
                    <p className="work-name">{study.displayName}</p>
                    <h3>{study.title}</h3>
                    <p>{study.summary}</p>
                    <ul className="work-outcomes">
                      {study.impact.slice(0, 2).map((item) => <li key={item}><Check aria-hidden="true" size={16} />{item}</li>)}
                    </ul>
                    <Link className="text-link" to={casePath(locale, study.slug)}>{locale === "en" ? "Open the case" : "Abrir el caso"}<ArrowRight aria-hidden="true" size={18} /></Link>
                  </div>
                  <SystemMap study={study} />
                </article>
              ))}
            </div>
          </div>
        </section>

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

        <section className="industry-entry-section" aria-labelledby="industry-guides-title">
          <div className="shell industry-entry-grid">
            <div className="industry-entry-intro">
              <p className="eyebrow">{locale === "en" ? "Industry workflow guides" : "Guías por industria"}</p>
              <h2 id="industry-guides-title">{locale === "en" ? "Start with the operation you already run." : "Empezá por la operación que ya gestionás."}</h2>
              <p>{locale === "en" ? "These guides map common constraints and illustrative solution patterns. They do not claim experience we cannot publicly verify." : "Estas guías mapean restricciones frecuentes y patrones ilustrativos de solución. No atribuyen experiencia que no podamos verificar públicamente."}</p>
            </div>
            <div className="industry-entry-links">
              {localizedIndustries.map((industry, index) => (
                <Link className="industry-entry-card" key={industry.key} to={industryPath(locale, industry.slug)}>
                  <span>0{index + 1}</span>
                  <div><small>{industry.eyebrow}</small><h3>{industry.title}</h3><p>{industry.introduction}</p></div>
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="section audit-section">
          <div className="shell">
            <div className="audit-intro">
              <div><p className="eyebrow eyebrow-dark">{t.auditEyebrow}</p><h2>{t.auditTitle}</h2></div>
              <CalButton locale={locale} placement="audit_section" label={locale === "en" ? "Book the free audit" : "Agendar auditoría gratis"} />
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

        <section className="section founder-section">
          <div className="shell founder-grid">
            <div className="founder-art" aria-hidden="true"><MountainSymbol /><span>FOUNDER<br />LED</span></div>
            <div className="founder-copy">
              <p className="eyebrow">{founderCopy.role}</p>
              <h2>{founderCopy.headline}</h2>
              <p className="founder-lede">{founderCopy.bio}</p>
              <p>{founderCopy.promise}</p>
              <a className="text-link" href={founderCopy.linkedinUrl} target="_blank" rel="noreferrer">{locale === "en" ? "Meet Puna Tech on LinkedIn" : "Conocé Puna Tech en LinkedIn"}<ExternalLink aria-hidden="true" size={17} /></a>
            </div>
          </div>
        </section>

        <section id="insights" className="section insights-section">
          <div className="shell">
            <header className="compact-heading"><div><p className="eyebrow">{t.nav.insights}</p><h2>{t.blogTitle}</h2></div><Link className="button-outline" to={blogPath(locale)}>{locale === "en" ? "All field notes" : "Todas las notas"}<ArrowRight aria-hidden="true" /></Link></header>
            <div className="editorial-links">
              {(locale === "en" ? [
                ["Decision guide", "Where AI automation belongs—and where deterministic software is safer."],
                ["Implementation", "How to define a first workflow without building an unmaintainable prototype."],
                ["Systems lesson", "What unified data ownership changes in a multi-tool operation."],
              ] : [
                ["Guía de decisión", "Dónde conviene automatizar con IA y dónde el software determinístico es más seguro."],
                ["Implementación", "Cómo definir un primer flujo sin crear un prototipo imposible de mantener."],
                ["Lección de sistemas", "Qué cambia cuando una operación con múltiples herramientas comparte una capa de datos."],
              ]).map(([label, title], index) => (
                <Link to={blogPath(locale)} key={title}><span>0{index + 1}</span><small>{label}</small><h3>{title}</h3><ArrowRight aria-hidden="true" /></Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="shell faq-grid">
            <header className="section-heading"><p className="eyebrow">FAQ</p><h2>{t.faqTitle}</h2><Compass aria-hidden="true" /></header>
            <Accordion items={t.faqs as Array<[string, string]>} />
          </div>
        </section>

        <section className="section final-section">
          <div className="shell final-grid">
            <div className="final-copy"><p className="eyebrow eyebrow-dark">{locale === "en" ? "Start with the bottleneck" : "Empezá por el cuello de botella"}</p><h2>{t.finalTitle}</h2><p>{t.finalBody}</p><CalButton locale={locale} placement="final_audit" label={locale === "en" ? "Get the free audit" : "Pedir auditoría gratis"} /></div>
            <div className="brief-card"><p className="eyebrow">{locale === "en" ? "Written route" : "Por escrito"}</p><h3>{t.briefTitle}</h3><p>{t.briefBody}</p><ProjectBrief locale={locale} /></div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
