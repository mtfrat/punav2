import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, BadgeDollarSign, BarChart3, CalendarClock, ClipboardList, FileText, Users } from "lucide-react";
import "../demos.css";
import { CalButton, PageShell } from "../components/marketing";
import { DemoHeading, ExampleBadge } from "../components/demos/shared";
import { demoDefinitions, demoOgPath, demoPath, demosHubCopy, demosHubPath } from "../content/demos";
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

const ICONS = { collections: BadgeDollarSign, "stock-sync": ClipboardList, payroll: CalendarClock, "lead-scoring": Users, "wholesale-quotes": FileText, "store-dashboard": BarChart3 } as const;

export default function DemosHub({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const t = demosHubCopy[locale];
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

        <section className="dm-section">
          <div className="shell">
            <ul className="dm-cards">
              {demoDefinitions.map((demo, index) => {
                const c = demo.copy[locale];
                const Icon = ICONS[demo.id];
                return (
                  <li key={demo.id}>
                    <Link to={demoPath(locale, demo.slug[locale])} className="dm-card">
                      <span className="dm-card-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span className="dm-card-icon" aria-hidden="true"><Icon size={22} /></span>
                      <h2 className="dm-card-title">{c.title}</h2>
                      <p>{c.blurb}</p>
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
                <Link to={`${contactPath(locale)}#brief-form`} className="dm-btn dm-btn-ink">{locale === "es" ? "Mandanos un brief" : "Send us a brief"}<ArrowRight aria-hidden="true" size={16} /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
