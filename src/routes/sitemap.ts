import { caseStudies, casePath, servicePath, services, SITE_URL } from "../content/site";
import { getPublishedPosts } from "../lib/posts.server";

function esc(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
interface SitemapItem { path: string; en: string; es: string; lastmod?: string }

function localizedPair(en: string, es: string, lastmod?: string): SitemapItem[] {
  return [{ path: en, en, es, lastmod }, { path: es, en, es, lastmod }];
}

export async function loader() {
  const staticItems: SitemapItem[] = [
    ...localizedPair("/", "/es"),
    ...services.en.flatMap((service, index) => localizedPair(servicePath("en", service.slug), servicePath("es", services.es[index].slug))),
    ...caseStudies.en.flatMap((study, index) => localizedPair(casePath("en", study.slug), casePath("es", caseStudies.es[index].slug))),
    ...localizedPair("/blog", "/es/blog"),
    ...localizedPair("/privacy", "/es/privacidad"),
    ...localizedPair("/terms", "/es/terminos"),
  ];
  const [english, spanish] = await Promise.all([getPublishedPosts("en", 200), getPublishedPosts("es", 200)]);
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
