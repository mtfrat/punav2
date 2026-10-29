import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { isRouteErrorResponse, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import "../demos.css";
import { PageShell, trackEvent } from "../components/marketing";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import { demoComponents } from "../components/demos/registry";
import { DemoCta, DemoHeading, ExampleBadge } from "../components/demos/shared";
import { GumroadKitBox } from "../components/demos/dashboard-demo";
import { VIDEO_BASE } from "../components/demos/video-demo";
import { demoDefinitions, demoOgPath, demoPath, demosHubCopy, demosHubPath, findDemoBySlug } from "../content/demos";
import { rubroDefinitions, rubroPath } from "../content/rubros";
import { SITE_URL, type Locale } from "../content/chrome";
import { localeFromPathname, notFoundDocumentMeta } from "../lib/not-found";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export { PublicNotFoundBoundary as ErrorBoundary };

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locale: Locale = new URL(request.url).pathname.startsWith("/es/") ? "es" : "en";
  const demo = findDemoBySlug(locale, params.slug ?? "");
  if (!demo) throw new Response("Not found", { status: 404 });
  const other: Locale = locale === "en" ? "es" : "en";
  return { locale, id: demo.id, alternatePath: demoPath(other, demo.slug[other]) };
}

export const meta: MetaFunction<typeof loader> = ({ data, error, location }) => {
  if (isRouteErrorResponse(error) && error.status === 404) return notFoundDocumentMeta(localeFromPathname(location.pathname));
  if (!data) return [];
  const { locale, id } = data;
  const demo = demoDefinitions.find((d) => d.id === id)!;
  const c = demo.copy[locale];
  const path = demoPath(locale, demo.slug[locale]);
  return createMeta({
    locale,
    title: c.metaTitle,
    description: c.metaDescription,
    path,
    alternatePath: data.alternatePath,
    image: demoOgPath(locale, id),
    imageAlt: id === "convenio-multilateral"
      ? (locale === "es" ? `Demo en video: ${c.title}. Datos de ejemplo.` : `Video demo: ${c.title}. Sample data.`)
      : (locale === "es" ? `Demo interactiva: ${c.title}. Datos de ejemplo.` : `Interactive demo: ${c.title}. Sample data.`),
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/png",
    schema: [
      id === "convenio-multilateral"
        ? {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: c.title,
            description: c.metaDescription,
            thumbnailUrl: [`${SITE_URL}${VIDEO_BASE}-16x9.webp`],
            contentUrl: `${SITE_URL}${VIDEO_BASE}-16x9.mp4`,
            uploadDate: "2026-10-28",
            duration: "PT34S",
            inLanguage: "es-AR",
            isAccessibleForFree: true,
            publisher: { "@id": `${SITE_URL}/#organization` },
          }
        : {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: c.title,
            description: c.metaDescription,
            url: `${SITE_URL}${path}`,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript",
            isAccessibleForFree: true,
            inLanguage: locale === "en" ? "en" : "es-AR",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: demosHubCopy[locale].breadcrumb, path: demosHubPath(locale) },
        { name: c.title, path },
      ]),
    ],
  });
};

const storyLabels = {
  es: ["Problema", "Cómo lo automatizamos", "Resultado"],
  en: ["Problem", "How we automate it", "Result"],
};

export default function DemoDetail({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, id } = loaderData;
  const demo = demoDefinitions.find((d) => d.id === id)!;
  const c = demo.copy[locale];
  const Demo = demoComponents[id];
  const labels = storyLabels[locale];
  const hub = demosHubCopy[locale];
  const forRubros = rubroDefinitions.filter((r) => demo.verticals.includes(r.id));

  useEffect(() => { trackEvent("demo_view", { locale, demo: id }); }, [locale, id]);

  return (
    <PageShell locale={locale}>
      <main id="main-content" className="dm">
        <section className="dm-hero">
          <div className="shell">
            <nav className="dm-crumbs" aria-label="Breadcrumb">
              <Link to={locale === "en" ? "/" : "/es"}>Puna Tech</Link><span aria-hidden="true">/</span>
              <Link to={demosHubPath(locale)}>{hub.breadcrumb}</Link><span aria-hidden="true">/</span>
              <span aria-current="page">{c.title}</span>
            </nav>
            <p className="dm-kicker">{hub.eyebrow}</p>
            <h1 className="dm-h1"><DemoHeading text={c.h1} mark={c.mark} /></h1>
            <p className="dm-lead">{c.lead}</p>
            <p><ExampleBadge loc={locale} /></p>
          </div>
        </section>

        <section className="dm-section dm-section-tight">
          <div className="shell">
            <ol className="dm-story" aria-label={locale === "es" ? "Problema, cómo lo automatizamos y resultado" : "Problem, how we automate it and result"}>
              {[c.problem, c.how, c.result].map((body, i) => (
                <li key={i} className={i === 2 ? "is-result" : ""}>
                  <span className="dm-story-label"><b>{i + 1}</b>{labels[i]}</span>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="dm-section dm-section-stage">
          <div className="shell">
            <Demo loc={locale} />
            {id === "store-dashboard" ? <GumroadKitBox loc={locale} /> : null}
            {c.origin ? <p className="dm-origin">{c.origin}</p> : null}
            {locale === "es" && demo.related ? <p className="dm-related"><Link to={demo.related.path}>{demo.related.label}<ArrowRight aria-hidden="true" size={16} /></Link></p> : null}
          </div>
        </section>

        <section className="dm-section">
          <div className="shell">
            <DemoCta loc={locale} demo={id} />
            {forRubros.length > 0 ? (
              <>
                <h2 className="dm-h3 dm-more-title">{locale === "es" ? "Esta demo, por rubro" : "This demo, by industry"}</h2>
                <ul className="dm-more">
                  {forRubros.map((r) => (
                    <li key={r.id}><Link to={rubroPath(locale, r.slug[locale])}>{r.copy[locale].name}<ArrowRight aria-hidden="true" size={14} /></Link></li>
                  ))}
                </ul>
              </>
            ) : null}
            <h2 className="dm-h3 dm-more-title">{locale === "es" ? "Otras demos" : "More demos"}</h2>
            <ul className="dm-more">
              {demoDefinitions.filter((d) => d.id !== id).map((d) => (
                <li key={d.id}><Link to={demoPath(locale, d.slug[locale])}>{d.copy[locale].title}<ArrowRight aria-hidden="true" size={14} /></Link></li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
