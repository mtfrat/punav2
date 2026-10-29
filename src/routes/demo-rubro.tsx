import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { isRouteErrorResponse } from "react-router";
import { PageShell } from "../components/marketing";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import { VIDEO_BASE } from "../components/demos/video-demo";
import RubroPage from "../components/demos/rubro-layout";
import { rubroPages } from "../components/demos/rubro-pages";
import { MUSIC_ARTIST, MUSIC_ARTIST_URL, musicCreditLine, rubroVideos } from "../content/rubro-videos";
import { demoDefinitions, demoPath, demosHubCopy, demosHubPath } from "../content/demos";
import { findRubroBySlug, rubroDefinitions, rubroOgPath, rubroPath } from "../content/rubros";
import { SITE_URL, type Locale } from "../content/chrome";
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
  const rv = rubroVideos[id];
  if (rv) {
    const v = rv.copy[locale];
    schema.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: v.name,
      description: v.description,
      thumbnailUrl: [`${SITE_URL}${rv.base}-16x9.webp`, `${SITE_URL}${rv.base}-9x16.webp`],
      contentUrl: `${SITE_URL}${rv.base}-16x9.mp4`,
      uploadDate: rv.uploadDate,
      duration: rv.duration,
      inLanguage: "es-AR",
      isAccessibleForFree: true,
      width: rv.size.wide[0],
      height: rv.size.wide[1],
      creditText: musicCreditLine(rv.music.title),
      musicBy: { "@type": "Person", name: MUSIC_ARTIST, url: MUSIC_ARTIST_URL },
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
    imageAlt: locale === "es" ? `Demos de automatización para ${c.name.toLowerCase()}. Datos ficticios.` : `Automation demos for ${c.name.toLowerCase()}. Fictional data.`,
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/png",
    schema,
  });
};

export default function DemoRubro({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, id } = loaderData;
  return (
    <PageShell locale={locale}>
      <RubroPage rubroId={id} locale={locale} config={rubroPages[id]} />
    </PageShell>
  );
}
