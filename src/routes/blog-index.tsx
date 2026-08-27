import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "../components/marketing";
import { blogPath, copy, type Locale } from "../content/site";
import { getPublishedPosts } from "../lib/posts.server";
import { createMeta } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: Locale = new URL(request.url).pathname.startsWith("/es") ? "es" : "en";
  const posts = await getPublishedPosts(locale);
  return { locale, posts };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  return createMeta({ locale, title: locale === "en" ? "Software & Automation Blog | Puna Tech" : "Blog de Software y Automatización | Puna Tech", description: locale === "en" ? "Reviewed guides and implementation lessons about custom software, AI workflows, digital products, and systems integrations." : "Guías revisadas sobre software a medida, flujos con IA, productos digitales e integraciones de sistemas.", path: blogPath(locale), alternatePath: blogPath(locale === "en" ? "es" : "en") });
};

export default function BlogIndex({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, posts } = loaderData;
  return <PageShell locale={locale}><main id="main-content"><section className="blog-hero dark-section"><div className="shell"><p className="eyebrow eyebrow-dark">{locale === "en" ? "Reviewed editorial work" : "Contenido editorial revisado"}</p><h1>{copy[locale].blogTitle}</h1><p>{copy[locale].blogBody}</p></div></section><section className="section light-section"><div className="shell">{posts.length ? <div className="blog-grid">{posts.map((post) => <article className="blog-card" key={post.id}>{post.hero_image_url ? <img src={post.hero_image_url} alt={post.hero_image_alt || ""} width="640" height="360" loading="lazy" /> : <div className="blog-placeholder" aria-hidden="true"><span>{post.category || "Puna Tech"}</span></div>}<div><p className="eyebrow">{post.category || (locale === "en" ? "Guide" : "Guía")}</p><h2><Link to={blogPath(locale, post.slug)}>{post.title}</Link></h2><p>{post.excerpt}</p><div className="article-meta"><span>{post.author_name}</span><time dateTime={post.published_at}>{new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", { dateStyle: "medium" }).format(new Date(post.published_at))}</time></div><Link className="text-link" to={blogPath(locale, post.slug)}>{copy[locale].readMore}<ArrowRight aria-hidden="true" size={17} /></Link></div></article>)}</div> : <div className="empty-state"><h2>{copy[locale].emptyBlog}</h2><p>{locale === "en" ? "The automated workflow now creates drafts; nothing reaches this page until a person verifies the evidence and approves publication." : "El flujo automatizado ahora crea borradores; nada llega a esta página hasta que una persona verifica la evidencia y aprueba la publicación."}</p><Link className="button-secondary" to={locale === "en" ? "/#work" : "/es#work"}>{locale === "en" ? "View case studies" : "Ver casos"}<ArrowRight aria-hidden="true" /></Link></div>}</div></section></main></PageShell>;
}
