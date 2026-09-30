import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { Accordion, CalButton, PageShell, ProjectBrief } from "../components/marketing";
import { SteepArtifactStage, SteepMotion } from "../components/steep-motion";
import {
  casePath,
  caseStudies,
  copy,
  servicePath,
  services,
  steepClients,
  steepLab,
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

function HeroTitle({ title, italic }: { title: string; italic: string }) {
  const index = title.indexOf(italic);
  if (index === -1) return title;
  return (
    <>
      {title.slice(0, index)}
      <em>{italic}</em>
      {title.slice(index + italic.length)}
    </>
  );
}

export default function Home({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const t = copy[locale];
  const localizedServices = services[locale];
  const slowdownServices = [localizedServices[0], localizedServices[2], localizedServices[1]];
  const studies = caseStudies[locale];
  const clients = steepClients[locale];
  const labs = steepLab[locale];

  return (
    <PageShell locale={locale}>
      <SteepMotion />
      <main id="main-content" className="steep-landing">
        <section className="steep-hero" aria-label={locale === "en" ? "Puna Tech" : "Puna Tech"}>
          <div className="shell steep-hero-grid">
            <div className="steep-hero-copy">
              <p className="eyebrow">{t.heroEyebrow}</p>
              <h1>
                <HeroTitle title={t.heroTitle} italic={t.heroItalic} />
              </h1>
              <p className="steep-sub">{t.heroBody}</p>
              <div className="cta-group steep-hero-actions">
                <CalButton locale={locale} placement="hero_audit" label={t.book} className="button-primary-terracotta" />
                <a href="#brief" className="button-ghost-ink">
                  <span>{t.sendBrief}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>
              <p className="steep-micro">
                <Check aria-hidden="true" size={16} />
                <span>{t.heroMicrocopy}</span>
              </p>
              <ul className="steep-badges">
                {t.heroBadges.map((badge) => <li key={badge}>{badge}</li>)}
              </ul>
            </div>
            <SteepArtifactStage locale={locale} />
          </div>
        </section>

        <section className="steep-section steep-outcomes" data-steep-cue="outcomes" aria-label={locale === "en" ? "Outcomes" : "Resultados"}>
          <div className="shell">
            <ul className="steep-chips">
              {t.proof.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section id="services" className="steep-section steep-triad">
          <div className="shell">
            <header className="steep-heading">
              <h2>{t.slowdownTitle}</h2>
              <p>{t.servicesBody}</p>
            </header>
            <div className="steep-triad-grid">
              {t.slowdowns.map(([hook, capability, description], index) => {
                const service = slowdownServices[index];
                return (
                  <Link className="steep-triad-card" key={capability} to={servicePath(locale, service.slug)}>
                    <small>{capability}</small>
                    <strong>{hook}</strong>
                    <span>{description}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="steep-section steep-bridge" aria-labelledby="bridge-title">
          <div className="shell">
            <h2 id="bridge-title">{t.bridgeTitle}</h2>
            <p>{t.bridgeSub}</p>
            <p className="steep-bridge-line">{t.bridgeLine}</p>
          </div>
        </section>

        <section id="work" className="steep-section steep-client" data-steep-cue="client" aria-labelledby="client-delivery-heading">
          <div className="shell">
            <header className="steep-heading">
              <p className="eyebrow">{t.workClientBadge}</p>
              <h2 id="client-delivery-heading">{t.workClientTitle}</h2>
              <p>{t.workClientSubtitle}</p>
            </header>
            <div className="steep-client-grid">
              {clients.map((item) => {
                const study = studies.find((entry) => entry.key === item.key);
                return (
                  <article className="steep-client-card" key={item.key}>
                    <span className="steep-kicker">{t.workClientBadge}</span>
                    <h3>{item.name}</h3>
                    <p className="steep-client-headline">{item.headline}</p>
                    <p>{item.body}</p>
                    <ul>
                      {item.bullets.map((bullet) => (
                        <li key={bullet.text}>
                          {/* needsConfirm stays in data only — never render [CONFIRM] in public UI */}
                          <span>{bullet.text}</span>
                        </li>
                      ))}
                    </ul>
                    {study ? (
                      <Link className="text-link" to={casePath(locale, study.slug)}>
                        {t.viewArchitecture}
                        <ArrowRight aria-hidden="true" size={16} />
                      </Link>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="lab" className="steep-section steep-lab" data-steep-cue="lab" aria-labelledby="lab-demos-heading">
          <div className="shell">
            <header className="steep-heading steep-heading-compact">
              <p className="eyebrow">{t.workLabBadge}</p>
              <h2 id="lab-demos-heading">{t.workLabTitle}</h2>
              <p>{t.workLabSubtitle}</p>
            </header>
            <div className="steep-lab-grid">
              {labs.map((item) => {
                const study = studies.find((entry) => entry.key === item.key);
                return (
                  <article className="steep-lab-card" key={item.key}>
                    <span className="steep-kicker">{t.workLabBadge}</span>
                    <h3>{item.name}</h3>
                    <small>{item.sector}</small>
                    <p>{item.body}</p>
                    <p className="steep-lab-tag">{item.tag}</p>
                    {study ? (
                      <div className="steep-lab-actions">
                        <Link className="text-link" to={casePath(locale, study.slug)}>{t.openCase}</Link>
                        {study.liveDemoUrl ? (
                          <a className="lab-live-link" href={study.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                            <span>{t.liveDemo}</span>
                            <ExternalLink aria-hidden="true" size={14} />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="process" className="steep-section steep-process" aria-labelledby="process-title">
          <div className="shell">
            <header className="steep-heading">
              <h2 id="process-title">{t.processTitle}</h2>
            </header>
            <ol className="steep-process-grid">
              {t.process.map(([title, description], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Quote band omitted until a real client line is approved — no PLACEHOLDER brackets in public UI */}

        <section id="faq" className="steep-section steep-faq">
          <div className="shell steep-faq-grid">
            <header className="steep-heading">
              <p className="eyebrow">FAQ</p>
              <h2>{t.faqTitle}</h2>
            </header>
            <Accordion items={t.faqs as Array<[string, string]>} />
          </div>
        </section>

        <section id="brief" className="steep-section steep-final">
          <div className="shell steep-final-grid">
            <div className="steep-final-copy">
              <h2>{t.finalTitle}</h2>
              <p>{t.finalBody}</p>
              <CalButton locale={locale} placement="final_audit" label={t.book} className="button-primary-terracotta" />
              <ol className="steep-audit" aria-label={t.auditTitle}>
                {t.auditSteps.map(([title, description]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="brief-card" id="brief-form">
              <h3>{t.briefTitle}</h3>
              <p>{t.briefBody}</p>
              <a className="sr-only" href="#brief-form">{t.sendBrief}</a>
              <ProjectBrief locale={locale} />
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
