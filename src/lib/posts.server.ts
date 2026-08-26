import { createClient } from "@supabase/supabase-js";
import sanitizeHtml from "sanitize-html";
import type { Locale } from "../content/site";

export interface PublishedPost {
  id: string;
  translation_group_id: string;
  locale: Locale;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  content: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  category: string | null;
  primary_keyword: string | null;
  author_name: string | null;
  reviewer_name: string | null;
  source_urls: Array<{ title?: string; url: string }>;
  related_service_slug: string | null;
  status: "published";
  published_at: string;
  updated_at: string;
}

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function normalizeSources(value: unknown): Array<{ title?: string; url: string }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string" && /^https:\/\//.test(item)) return [{ url: item }];
    if (item && typeof item === "object" && "url" in item && typeof item.url === "string" && /^https:\/\//.test(item.url)) return [{ title: "title" in item && typeof item.title === "string" ? item.title : undefined, url: item.url }];
    return [];
  });
}

function plainExcerpt(content: string, limit = 180) {
  const text = content.replace(/<[^>]+>/g, " ").replace(/[#>*_`|\[\]()]/g, " ").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}

function mapPost(row: Record<string, unknown>): PublishedPost {
  const content = String(row.content || "");
  return {
    id: String(row.id),
    translation_group_id: String(row.translation_group_id || row.id),
    locale: row.locale === "en" ? "en" : "es",
    slug: String(row.slug || row.id),
    title: String(row.title || "Untitled"),
    meta_title: typeof row.meta_title === "string" ? row.meta_title : null,
    meta_description: typeof row.meta_description === "string" ? row.meta_description : null,
    excerpt: typeof row.excerpt === "string" ? row.excerpt : plainExcerpt(content),
    content,
    hero_image_url: typeof row.hero_image_url === "string" ? row.hero_image_url : typeof row.image_url === "string" ? row.image_url : null,
    hero_image_alt: typeof row.hero_image_alt === "string" ? row.hero_image_alt : null,
    category: typeof row.category === "string" ? row.category : null,
    primary_keyword: typeof row.primary_keyword === "string" ? row.primary_keyword : null,
    author_name: typeof row.author_name === "string" ? row.author_name : typeof row.author === "string" ? row.author : "Puna Tech Engineering",
    reviewer_name: typeof row.reviewer_name === "string" ? row.reviewer_name : null,
    source_urls: normalizeSources(row.source_urls),
    related_service_slug: typeof row.related_service_slug === "string" ? row.related_service_slug : null,
    status: "published",
    published_at: String(row.published_at || row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || row.published_at || row.created_at || new Date().toISOString()),
  };
}

export async function getPublishedPosts(locale: Locale, limit = 24) {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase.from("posts").select("*").eq("status", "published").eq("locale", locale).order("published_at", { ascending: false }).limit(limit);
  if (error || !data) return [];
  return data.map((row) => mapPost(row as Record<string, unknown>));
}

export async function getPublishedPost(locale: Locale, slug: string) {
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase.from("posts").select("*").eq("status", "published").eq("locale", locale).eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return mapPost(data as Record<string, unknown>);
}

export async function getTranslation(locale: Locale, translationGroupId: string) {
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase.from("posts").select("slug").eq("status", "published").eq("locale", locale).eq("translation_group_id", translationGroupId).maybeSingle();
  return error || !data ? null : String(data.slug);
}

export async function getLegacyPostRedirect(legacyPath: string) {
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase.from("post_legacy_redirects").select("locale,target_slug").eq("legacy_path", legacyPath).maybeSingle();
  if (error || !data || (data.locale !== "en" && data.locale !== "es")) return null;
  return { locale: data.locale as Locale, slug: String(data.target_slug) };
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function legacyMarkdownToHtml(markdown: string) {
  const escaped = escapeHtml(markdown);
  const blocks = escaped.split(/\n{2,}/).map((block) => {
    const value = block.trim();
    if (!value) return "";
    if (/^###\s/.test(value)) return `<h3>${value.replace(/^###\s/, "")}</h3>`;
    if (/^##\s/.test(value)) return `<h2>${value.replace(/^##\s/, "")}</h2>`;
    if (/^&gt;\s/.test(value)) return `<blockquote>${value.replace(/^&gt;\s*/, "")}</blockquote>`;
    if (/^-\s/m.test(value)) return `<ul>${value.split("\n").filter(Boolean).map((line) => `<li>${line.replace(/^-\s*/, "")}</li>`).join("")}</ul>`;
    return `<p>${value.replace(/\n/g, "<br>")}</p>`;
  }).join("");
  return blocks.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export function renderPostContent(content: string) {
  const html = /<\/?[a-z][\s\S]*>/i.test(content) ? content : legacyMarkdownToHtml(content);
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "a", "code", "pre", "br", "hr", "figure", "figcaption"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], th: ["scope"], td: ["colspan", "rowspan"] },
    allowedSchemes: ["https", "mailto"],
    transformTags: {
      a: (_tagName, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer", target: attribs.href?.startsWith("https://www.puna-tech.com") ? "_self" : "_blank" } }),
    },
  });
}
