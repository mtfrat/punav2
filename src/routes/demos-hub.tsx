import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import "../demos.css";
import { CalButton, PageShell, trackEvent } from "../components/marketing";
import { DemoHeading, ExampleBadge } from "../components/demos/shared";
import { DEMO_ICONS, VERTICAL_ICONS } from "../components/demos/icons";
import { demoDefinitions, demoOgPath, demoPath, demosHubCopy, demosHubPath, type VerticalId } from "../content/demos";
import { rubroDefinitions, rubroPath, rubrosHubCopy } from "../content/rubros";
import { contactPath, type Locale } from "../content/chrome";
import { breadcrumbSchema, collectionPageSchema, createMeta } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: Locale = new URL(request.url).pathname.startsWith("/es") ? "es" : "en";
  return { locale, alternatePath: demosHubPath(locale === "en" ? "es" : "en") };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { locale } = data;
  const t = demosHubCopy[locale];
  const path = demosHubPath(locale);
  return createMeta({
    locale,
    title: t.metaTitle,
    description: t.metaDescription,
    path,
    alternatePath: data.alternatePath,
    image: demoOgPath(locale, "hub"),
    imageAlt: locale === "es" ? "Demos interactivas de automatización de Puna Tech, con datos de ejemplo." : "Puna Tech interactive automation demos, with sample data.",
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/png",
    schema: [
      breadcrumbSchema([{ name: "Puna Tech", path: locale === "en" ? "/" : "/es" }, { name: t.breadcrumb, path }]),
      collectionPageSchema({ locale, name: t.metaTitle, path, items: demoDefinitions.map((d) => ({ name: d.copy[locale].title, path: demoPath(locale, d.slug[locale]) })) }),
    ],
  });
};

export default function DemosHub({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const t = demosHubCopy[locale];
  const r = rubrosHubCopy[locale];
  const [filter, setFilter] = useState<"all" | VerticalId>("all");
  const visibleDemos = demoDefinitions.filter((d) => filter === "all" || d.verticals.includes(filter));
  const verticalName = (v: VerticalId) => (v === "commerce" ? r.commerce : rubroDefinitions.find((x) => x.id === v)?.copy[locale].name ?? v);
  const filters: ("all" | VerticalId)[] = ["all", ...rubroDefinitions.map((x) => x.id), "commerce"];
  return (
    <PageShell locale={locale}>
      <main id="main-content" className="dm">
        <section className="dm-hero">
          <div className="shell">
            <p className="dm-kicker">{t.eyebrow} · Puna Tech</p>
            <h1 className="dm-h1"><DemoHeading text={t.h1} mark={t.mark} /></h1>
            <p className="dm-lead">{t.lead}</p>
            <p><ExampleBadge loc={locale} /> <span className="dm-hero-note">{t.exampleNote}</span></p>
          </div>
        </section>

        <section className="dm-section dm-section-tight" aria-labelledby="rubro-title">
          <div className="shell">
            <h2 id="rubro-title" className="dm-h2">{r.title}</h2>
            <p className="dm-lead">{r.lead}</p>
            <ul className="dm-cards dm-rubros">
              {rubroDefinitions.map((rubro) => {
                const c = rubro.copy[locale];
                const Icon = VERTICAL_ICONS[rubro.id];
                return (
                  <li key={rubro.id}>
                    <Link to={rubroPath(locale, rubro.slug[locale])} className="dm-card">
                      <span className="dm-card-icon" aria-hidden="true"><Icon size={22} /></span>
                      <h3 className="dm-card-title">{c.name}</h3>
                      <p>{c.pain}</p>
                      <span className="dm-card-cta">{r.open}<ArrowRight aria-hidden="true" size={16} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="dm-section" aria-labelledby="all-demos-title">
          <div className="shell">
            <h2 id="all-demos-title" className="dm-h2">{r.groupAll}</h2>
            <div className="dm-chips dm-filters" role="group" aria-label={r.filterLabel}>
              {filters.map((f) => (
                <button key={f} type="button" className={`dm-pill${filter === f ? " is-on" : ""}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f === "all" ? r.filterAll : verticalName(f)}
                </button>
              ))}
            </div>
            <p className="dm-hint" role="status">{r.groupCount(visibleDemos.length)}</p>
            <ul className="dm-cards">
              {visibleDemos.map((demo, index) => {
                const c = demo.copy[locale];
                const Icon = DEMO_ICONS[demo.id];
                return (
                  <li key={demo.id}>
                    <Link to={demoPath(locale, demo.slug[locale])} className="dm-card">
                      <span className="dm-card-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span className="dm-card-icon" aria-hidden="true"><Icon size={22} /></span>
                      <h2 className="dm-card-title">{c.title}</h2>
                      <p>{c.blurb}</p>
                      <small className="dm-card-tags">{demo.verticals.map(verticalName).join(" · ")}</small>
                      <span className="dm-card-cta">{t.open}<ArrowRight aria-hidden="true" size={16} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="dm-section dm-section-ink">
          <div className="shell">
            <h2 className="dm-h2">{t.patternTitle}</h2>
            <ol className="dm-steps">
              {t.pattern.map(([title, body], i) => (
                <li key={title}><span className="dm-step-num" aria-hidden="true">{i + 1}</span><h3 className="dm-h3">{title}</h3><p>{body}</p></li>
              ))}
            </ol>
            <p className="dm-roi-link"><Link to={locale === "es" ? "/es/demos/roi" : "/demos/roi"}>{t.roi}<ArrowRight aria-hidden="true" size={16} /></Link></p>
          </div>
        </section>

        <section className="dm-section">
          <div className="shell">
            <div className="dm-cta">
              <div><h2 className="dm-h2">{t.ctaTitle}</h2><p>{t.ctaBody}</p></div>
              <div className="dm-cta-actions">
                <CalButton locale={locale} placement="demos_hub" />
                <Link to={`${contactPath(locale)}?bloque=demos_hub#brief-form`} className="dm-btn dm-btn-ink" onClick={() => trackEvent("cta_click", { locale, placement: "demos_hub", destination: "brief" })}>{locale === "es" ? "Mandanos un brief" : "Send us a brief"}<ArrowRight aria-hidden="true" size={16} /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
