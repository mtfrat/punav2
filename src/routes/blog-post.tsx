import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, redirect } from "react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { CalButton, PageShell } from "../components/marketing";
import { blogPath, legacyPostRedirects, servicePath, services, SITE_URL, type Locale } from "../content/site";
import { getLegacyPostRedirect, getPublishedPost, getTranslation, renderPostContent } from "../lib/posts.server";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es/") ? "es" : "en";
  const requestedSlug = params.slug || "";
  if (locale === "en" && legacyPostRedirects[requestedSlug]) throw redirect(`/es/blog/${legacyPostRedirects[requestedSlug]}`, 301);
  if (locale === "en" && Object.values(legacyPostRedirects).includes(requestedSlug)) throw redirect(`/es/blog/${requestedSlug}`, 301);
  const post = await getPublishedPost(locale, requestedSlug);
  if (!post) {
    const legacy = await getLegacyPostRedirect(requestedSlug);
    if (legacy) throw redirect(blogPath(legacy.locale, legacy.slug), 301);
    throw new Response("Not found", { status: 404 });
  }
  const otherLocale: Locale = locale === "en" ? "es" : "en";
  const alternateSlug = await getTranslation(otherLocale, post.translation_group_id);
  return { locale, post: { ...post, safeContent: renderPostContent(post.content) }, alternateSlug };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { locale, post, alternateSlug } = data;
  const path = blogPath(locale, post.slug);
  const alternatePath = alternateSlug ? blogPath(locale === "en" ? "es" : "en", alternateSlug) : undefined;
  return createMeta({
    locale, title: post.meta_title || `${post.title} | Puna Tech`, description: post.meta_description || post.excerpt || post.title, path, alternatePath, type: "article",
    image: post.hero_image_url || undefined,
    imageAlt: post.hero_image_alt || post.title,
    article: { publishedTime: post.published_at, modifiedTime: post.updated_at, section: post.category || undefined, author: post.author_name || "Puna Tech Engineering" },
    schema: [
      { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, datePublished: post.published_at, dateModified: post.updated_at, inLanguage: locale === "en" ? "en" : "es-AR", author: { "@type": "Organization", name: post.author_name || "Puna Tech Engineering" }, publisher: { "@id": `${SITE_URL}/#organization` }, image: post.hero_image_url || `${SITE_URL}/${locale === "en" ? "og-en.png" : "og-es.png"}`, mainEntityOfPage: `${SITE_URL}${path}` },
      breadcrumbSchema([{ name: "Puna Tech", path: locale === "en" ? "/" : "/es" }, { name: locale === "en" ? "Insights" : "Insights", path: blogPath(locale) }, { name: post.title, path }]),
    ],
  });
};

export default function BlogPost({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, post } = loaderData;
  const related = services[locale].find((service) => service.slug === post.related_service_slug) || services[locale][0];
  return <PageShell locale={locale}><main id="main-content"><article><header className="article-hero dark-section"><div className="article-shell"><Link className="back-link" to={blogPath(locale)}><ArrowLeft aria-hidden="true" />{locale === "en" ? "All insights" : "Todos los insights"}</Link><p className="eyebrow eyebrow-dark">{post.category || (locale === "en" ? "Insight" : "Insight")}</p><h1>{post.title}</h1><p>{post.excerpt}</p><div className="article-byline"><span>{post.author_name}</span>{post.reviewer_name ? <span>{locale === "en" ? `Reviewed by ${post.reviewer_name}` : `Revisado por ${post.reviewer_name}`}</span> : null}<time dateTime={post.updated_at}>{locale === "en" ? "Updated " : "Actualizado "}{new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", { dateStyle: "long" }).format(new Date(post.updated_at))}</time></div></div></header>{post.hero_image_url ? <figure className="article-image article-shell"><img src={post.hero_image_url} alt={post.hero_image_alt || ""} width="1200" height="675" /><figcaption>{post.hero_image_alt}</figcaption></figure> : null}<div className="article-shell article-layout"><div className="article-content" dangerouslySetInnerHTML={{ __html: post.safeContent }} /><aside className="article-aside"><p className="eyebrow">{locale === "en" ? "Related capability" : "Capacidad relacionada"}</p><h2>{related.eyebrow}</h2><p>{related.outcome}</p><Link className="text-link" to={servicePath(locale, related.slug)}>{locale === "en" ? "Explore the service" : "Explorar el servicio"}<ArrowRight aria-hidden="true" /></Link></aside></div>{post.source_urls.length ? <section className="article-shell article-sources"><h2>{locale === "en" ? "Sources and further reading" : "Fuentes y lecturas adicionales"}</h2><ul>{post.source_urls.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title || new URL(source.url).hostname}<ExternalLink aria-hidden="true" size={15} /></a></li>)}</ul></section> : null}<section className="article-cta"><div className="article-shell"><p className="eyebrow eyebrow-dark">{locale === "en" ? "Apply the lesson" : "Aplicar el aprendizaje"}</p><h2>{locale === "en" ? "Discuss the workflow behind your current bottleneck." : "Conversemos sobre el flujo detrás de tu cuello de botella actual."}</h2><CalButton locale={locale} placement="article_final" /></div></section></article></main></PageShell>;
}
