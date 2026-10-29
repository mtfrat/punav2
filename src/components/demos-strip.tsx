import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { demosHubPath } from "../content/demos.ts";
import { rubroDefinitions, rubroPath } from "../content/rubros.ts";
import type { Locale } from "../content/chrome";
import { trackEvent } from "./tracking";

const COPY = {
  es: {
    eyebrow: "Demos por rubro",
    title: "Mirá cómo se ve en tu rubro",
    lead: "Demos interactivas con datos ficticios. Elegí tu rubro y probá el flujo antes de hablar con nadie.",
    open: "Ver demos",
    all: "Ver todas las demos",
  },
  en: {
    eyebrow: "Demos by industry",
    title: "See how it looks in your industry",
    lead: "Interactive demos with fictional data. Pick your industry and try the flow before you talk to anyone.",
    open: "See demos",
    all: "See all demos",
  },
} as const;

/** Strip linking the demos hub and the five rubro pages. Used on the home page and the services hub. */
export function DemosByIndustry({ locale, placement }: { locale: Locale; placement: string }) {
  const t = COPY[locale];
  const headingId = `${placement}-heading`;
  return (
    <section className="section soft-section rubro-strip" aria-labelledby={headingId}>
      <div className="shell">
        <header className="rubro-strip-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 id={headingId}>{t.title}</h2>
            <p>{t.lead}</p>
          </div>
          <Link
            className="text-link"
            to={demosHubPath(locale)}
            onClick={() => trackEvent("cta_click", { locale, placement, destination: "demos_hub" })}
          >
            {t.all}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </header>
        <ul className="rubro-strip-grid">
          {rubroDefinitions.map((rubro) => {
            const c = rubro.copy[locale];
            return (
              <li key={rubro.id}>
                <Link
                  className="rubro-strip-card"
                  to={rubroPath(locale, rubro.slug[locale])}
                  onClick={() => trackEvent("cta_click", { locale, placement, destination: `demos_${rubro.id}` })}
                >
                  <strong>{c.name}</strong>
                  <span>{c.pain}</span>
                  <em>
                    {t.open}
                    <ArrowRight aria-hidden="true" size={15} />
                  </em>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Compact list of the five rubro pages for sidebars (blog posts). Same links as the strip, no section chrome. */
export function DemosByIndustryList({ locale, placement }: { locale: Locale; placement: string }) {
  const t = COPY[locale];
  return (
    <div className="article-aside-solutions">
      <p className="eyebrow">{t.eyebrow}</p>
      <ul>
        {rubroDefinitions.map((rubro) => (
          <li key={rubro.id}>
            <Link to={rubroPath(locale, rubro.slug[locale])} onClick={() => trackEvent("cta_click", { locale, placement, destination: `demos_${rubro.id}` })}>
              {rubro.copy[locale].name}
            </Link>
          </li>
        ))}
        <li><Link to={demosHubPath(locale)}>{t.all}</Link></li>
      </ul>
    </div>
  );
}
