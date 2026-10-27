import { caseStudies, casePath, casesHubPath, servicePath, services, servicesHubGuideEs, servicesHubPath, SITE_URL } from "../content/site";
import { useCaseHubs, useCases } from "../content/use-cases";
import { demoDefinitions, demoPath, demosHubPath } from "../content/demos";
import { getPublishedPosts } from "../lib/posts.server";

function esc(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
interface SitemapItem { path: string; en: string; es: string; lastmod?: string }

function localizedPair(en: string, es: string, lastmod?: string): SitemapItem[] {
  return [{ path: en, en, es, lastmod }, { path: es, en, es, lastmod }];
}

/**
 * <lastmod> for the static marketing pages: the last significant change to each page family's
 * main copy (YYYY-MM-DD). Header/footer/navigation edits don't count. Bump the family when its copy changes.
 * Use-case pages and hubs carry their own `updatedAt` in content/use-cases.ts; a service page can set `updatedAt` in content/catalog.ts (per locale); blog posts use `updated_at`.
 */
export const STATIC_LASTMOD = {
  home: "2026-10-15",
  servicesHub: "2026-10-15",
  service: "2026-10-16",
  casesHub: "2026-10-16",
  caseStudy: "2026-10-15",
  blogHub: "2026-10-13",
  legal: "2026-10-13",
  contact: "2026-10-13",
  demos: "2026-10-27",
} as const;

function latest(...dates: (string | undefined)[]) {
  return dates.filter((date): date is string => !!date).map((date) => date.slice(0, 10)).sort().at(-1);
}

export async function loader() {
  const [english, spanish] = await Promise.all([getPublishedPosts("en", 200), getPublishedPosts("es", 200)]);
  const blogHubLastmod = latest(STATIC_LASTMOD.blogHub, ...english.map((post) => post.updated_at), ...spanish.map((post) => post.updated_at));
  const staticItems: SitemapItem[] = [
    ...localizedPair("/", "/es", STATIC_LASTMOD.home),
    // The ES hub carries its own updatedAt (2026-10-25: cómo elegir + cómo trabajamos + FAQ); EN unchanged.
    { path: servicesHubPath("en"), en: servicesHubPath("en"), es: servicesHubPath("es"), lastmod: STATIC_LASTMOD.servicesHub },
    { path: servicesHubPath("es"), en: servicesHubPath("en"), es: servicesHubPath("es"), lastmod: latest(STATIC_LASTMOD.servicesHub, servicesHubGuideEs.updatedAt) },
    // Each locale carries its own updatedAt when its copy changed alone (e.g. the ES page on 2026-10-20).
    ...services.en.flatMap((service, index) => {
      const en = servicePath("en", service.slug);
      const es = servicePath("es", services.es[index].slug);
      return [
        { path: en, en, es, lastmod: latest(STATIC_LASTMOD.service, service.updatedAt) },
        { path: es, en, es, lastmod: latest(STATIC_LASTMOD.service, services.es[index].updatedAt) },
      ];
    }),
    ...localizedPair(casesHubPath("en"), casesHubPath("es"), STATIC_LASTMOD.casesHub),
    ...caseStudies.en.flatMap((study, index) => localizedPair(casePath("en", study.slug), casePath("es", caseStudies.es[index].slug), STATIC_LASTMOD.caseStudy)),
    ...localizedPair("/blog", "/es/blog", blogHubLastmod),
    ...localizedPair("/privacy", "/es/privacidad", STATIC_LASTMOD.legal),
    ...localizedPair("/terms", "/es/terminos", STATIC_LASTMOD.legal),
    ...localizedPair("/contact", "/es/contacto", STATIC_LASTMOD.contact),
    ...localizedPair(demosHubPath("en"), demosHubPath("es"), STATIC_LASTMOD.demos),
    ...demoDefinitions.flatMap((demo) => localizedPair(demoPath("en", demo.slug.en), demoPath("es", demo.slug.es), STATIC_LASTMOD.demos)),
    // Spanish-only use-case hubs and landings (no English alternate yet).
    ...useCaseHubs.map((hub) => ({ path: hub.path, en: "", es: hub.path, lastmod: hub.updatedAt })),
    ...useCases.map((item) => ({ path: item.path, en: "", es: item.path, lastmod: item.updatedAt })),
  ];
  const spanishByGroup = new Map(spanish.map((post) => [post.translation_group_id, post]));
  const blogItems: SitemapItem[] = [];
  for (const post of english) {
    const alternate = spanishByGroup.get(post.translation_group_id);
    const englishPath = `/blog/${post.slug}`;
    if (alternate) blogItems.push(...localizedPair(englishPath, `/es/blog/${alternate.slug}`, post.updated_at));
    else blogItems.push({ path: englishPath, en: englishPath, es: "", lastmod: post.updated_at });
  }
  const englishGroups = new Set(english.map((post) => post.translation_group_id));
  for (const post of spanish) if (!englishGroups.has(post.translation_group_id)) blogItems.push({ path: `/es/blog/${post.slug}`, en: "", es: `/es/blog/${post.slug}`, lastmod: post.updated_at });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[...staticItems, ...blogItems].map((item) => `  <url>\n    <loc>${esc(`${SITE_URL}${item.path}`)}</loc>${item.lastmod ? `\n    <lastmod>${esc(item.lastmod)}</lastmod>` : ""}${item.en ? `\n    <xhtml:link rel="alternate" hreflang="en" href="${esc(`${SITE_URL}${item.en}`)}"/>` : ""}${item.es ? `\n    <xhtml:link rel="alternate" hreflang="es-AR" href="${esc(`${SITE_URL}${item.es}`)}"/>` : ""}${item.en ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(`${SITE_URL}${item.en}`)}"/>` : ""}\n  </url>`).join("\n")}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
