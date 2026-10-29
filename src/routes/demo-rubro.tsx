import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { isRouteErrorResponse, Link } from "react-router";
import { ArrowRight, Info } from "lucide-react";
import "../demos.css";
import { CalButton, PageShell, trackEvent } from "../components/marketing";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import { DemoHeading, ExampleBadge } from "../components/demos/shared";
import { DEMO_ICONS, VERTICAL_ICONS } from "../components/demos/icons";
import VideoDemo, { VIDEO_BASE } from "../components/demos/video-demo";
import RubroContables from "../components/demos/rubro-contables";
import { demoDefinitions, demoPath, demosHubCopy, demosHubPath } from "../content/demos";
import { findRubroBySlug, rubroDefinitions, rubroOgPath, rubroPath, rubrosHubCopy } from "../content/rubros";
import { contactPath, SITE_URL, type Locale } from "../content/chrome";
import { localeFromPathname, notFoundDocumentMeta } from "../lib/not-found";
import { breadcrumbSchema, collectionPageSchema, createMeta } from "../lib/seo";

export { PublicNotFoundBoundary as ErrorBoundary };

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locale: Locale = new URL(request.url).pathname.startsWith("/es/") ? "es" : "en";
  const rubro = findRubroBySlug(locale, params.rubro ?? "");
  if (!rubro) throw new Response("Not found", { status: 404 });
  const other: Locale = locale === "en" ? "es" : "en";
  return { locale, id: rubro.id, alternatePath: rubroPath(other, rubro.slug[other]) };
}

export const meta: MetaFunction<typeof loader> = ({ data, error, location }) => {
  if (isRouteErrorResponse(error) && error.status === 404) return notFoundDocumentMeta(localeFromPathname(location.pathname));
  if (!data) return [];
  const { locale, id } = data;
  const rubro = rubroDefinitions.find((r) => r.id === id)!;
  const c = rubro.copy[locale];
  const path = rubroPath(locale, rubro.slug[locale]);
  const videoDemo = rubro.video ? demoDefinitions.find((d) => d.id === rubro.video) : undefined;
  const schema: Record<string, unknown>[] = [
    breadcrumbSchema([
      { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
      { name: demosHubCopy[locale].breadcrumb, path: demosHubPath(locale) },
      { name: c.name, path },
    ]),
    collectionPageSchema({
      locale,
      name: c.metaTitle,
      path,
      items: rubro.featured.map((demoId) => {
        const d = demoDefinitions.find((x) => x.id === demoId)!;
        return { name: d.copy[locale].title, path: demoPath(locale, d.slug[locale]) };
      }),
    }),
  ];
  if (videoDemo) {
    const v = videoDemo.copy[locale];
    schema.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: v.title,
      description: v.metaDescription,
      thumbnailUrl: [`${SITE_URL}${VIDEO_BASE}-16x9.webp`],
      contentUrl: `${SITE_URL}${VIDEO_BASE}-16x9.mp4`,
      uploadDate: "2026-10-28",
      duration: "PT34S",
      inLanguage: "es-AR",
      isAccessibleForFree: true,
      publisher: { "@id": `${SITE_URL}/#organization` },
    });
  }
  return createMeta({
    locale,
    title: c.metaTitle,
    description: c.metaDescription,
    path,
    alternatePath: data.alternatePath,
    image: rubroOgPath(locale, id),
    imageAlt: locale === "es" ? `Demos de automatización para ${c.name.toLowerCase()}. Datos de ejemplo.` : `Automation demos for ${c.name.toLowerCase()}. Sample data.`,
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/png",
    schema,
  });
};

export default function DemoRubro({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, id } = loaderData;
  const rubro = rubroDefinitions.find((r) => r.id === id)!;
  const c = rubro.copy[locale];
  const hub = demosHubCopy[locale];
  const r = rubrosHubCopy[locale];
  const Icon = VERTICAL_ICONS[id];
  const featured = rubro.featured.map((demoId) => demoDefinitions.find((d) => d.id === demoId)!);
  const others = demoDefinitions.filter((d) => d.verticals.includes(id) && !rubro.featured.includes(d.id));
  const otherRubros = rubroDefinitions.filter((x) => x.id !== id);
  const briefHref = `${contactPath(locale)}?bloque=${rubro.placement}#brief-form`;

  useEffect(() => { trackEvent("demo_rubro_view", { locale, rubro: id }); }, [locale, id]);

  // Estudios contables tiene su propio diseño; los demás rubros usan el layout común de abajo.
  if (id === "accounting") {
    return (
      <PageShell locale={locale}>
        <RubroContables locale={locale} />
      </PageShell>
    );
  }

  return (
    <PageShell locale={locale}>
      <main id="main-content" className="dm">
        <section className="dm-hero">
          <div className="shell">
            <nav className="dm-crumbs" aria-label="Breadcrumb">
              <Link to={locale === "en" ? "/" : "/es"}>Puna Tech</Link><span aria-hidden="true">/</span>
              <Link to={demosHubPath(locale)}>{hub.breadcrumb}</Link><span aria-hidden="true">/</span>
              <span aria-current="page">{c.name}</span>
            </nav>
            <p className="dm-kicker"><Icon aria-hidden="true" size={16} /> {hub.eyebrow} {r.forLabel} {c.name.toLowerCase()}</p>
            <h1 className="dm-h1"><DemoHeading text={c.h1} mark={c.mark} /></h1>
            <p className="dm-lead">{c.lead}</p>
            <p><ExampleBadge loc={locale} /> <span className="dm-hero-note">{hub.exampleNote}</span></p>
          </div>
        </section>

        {rubro.video ? (
          <section className="dm-section dm-section-tight dm-section-stage">
            <div className="shell"><VideoDemo loc={locale} /></div>
          </section>
        ) : null}

        <section className="dm-section" aria-labelledby="rubro-cards">
          <div className="shell">
            <h2 id="rubro-cards" className="dm-h2">{c.cardsTitle}</h2>
            <ul className="dm-cards">
              {featured.map((demo, index) => {
                const d = demo.copy[locale];
                const DemoIcon = DEMO_ICONS[demo.id];
                return (
                  <li key={demo.id}>
                    <Link to={demoPath(locale, demo.slug[locale])} className="dm-card" onClick={() => trackEvent("demo_rubro_card", { locale, rubro: id, demo: demo.id })}>
                      <span className="dm-card-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span className="dm-card-icon" aria-hidden="true"><DemoIcon size={22} /></span>
                      <h3 className="dm-card-title">{d.title}</h3>
                      <p>{d.blurb}</p>
                      <small className="dm-card-tags">{d.video ? r.video : r.interactive}</small>
                      <span className="dm-card-cta">{hub.open}<ArrowRight aria-hidden="true" size={16} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {c.comingNote ? <p className="dm-callout"><Info aria-hidden="true" size={18} /><span>{c.comingNote}</span></p> : null}
          </div>
        </section>

        <section className="dm-section dm-section-ink" aria-labelledby="rubro-adapt">
          <div className="shell">
            <h2 id="rubro-adapt" className="dm-h2">{c.adaptTitle}</h2>
            <p>{c.adaptLead}</p>
            <ol className="dm-steps">
              {c.adapt.map(([title, body], i) => (
                <li key={title}><span className="dm-step-num" aria-hidden="true">{i + 1}</span><h3 className="dm-h3">{title}</h3><p>{body}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="dm-section" aria-labelledby="rubro-cta">
          <div className="shell">
            <div className="dm-cta">
              <div><h2 id="rubro-cta" className="dm-h2">{c.ctaTitle}</h2><p>{c.ctaBody}</p></div>
              <div className="dm-cta-actions">
                <CalButton locale={locale} placement={rubro.placement} />
                <Link to={briefHref} className="dm-btn dm-btn-ink" onClick={() => trackEvent("cta_click", { locale, placement: rubro.placement, destination: "brief" })}>
                  {locale === "es" ? "Mandanos un brief" : "Send us a brief"}<ArrowRight aria-hidden="true" size={16} />
                </Link>
              </div>
            </div>
            {others.length > 0 ? (
              <>
                <h2 className="dm-h3 dm-more-title">{c.moreTitle}</h2>
                <ul className="dm-more">
                  {others.map((d) => <li key={d.id}><Link to={demoPath(locale, d.slug[locale])}>{d.copy[locale].title}<ArrowRight aria-hidden="true" size={14} /></Link></li>)}
                </ul>
              </>
            ) : null}
            <h2 className="dm-h3 dm-more-title">{locale === "es" ? "Otros rubros" : "Other industries"}</h2>
            <ul className="dm-more">
              {otherRubros.map((x) => <li key={x.id}><Link to={rubroPath(locale, x.slug[locale])}>{x.copy[locale].name}<ArrowRight aria-hidden="true" size={14} /></Link></li>)}
              <li><Link to={demosHubPath(locale)}>{r.allDemos}<ArrowRight aria-hidden="true" size={14} /></Link></li>
            </ul>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
