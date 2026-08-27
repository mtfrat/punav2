import { SITE_URL, type Locale } from "../content/site";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

export interface SeoInput {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  alternatePath?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  type?: "website" | "article";
  robots?: string;
  schema?: JsonLd;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    author?: string;
  };
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

export function createMeta({
  locale,
  title,
  description,
  path,
  alternatePath,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  imageType,
  type = "website",
  robots = "index, follow, max-image-preview:large",
  schema,
  article,
}: SeoInput) {
  const canonical = absoluteUrl(path);
  const usesDefaultImage = !image;
  const resolvedImage = image || (locale === "en" ? "/og-en.png" : "/og-es.png");
  const imageUrl = absoluteUrl(resolvedImage);
  const resolvedImageWidth = imageWidth ?? (usesDefaultImage ? 1200 : undefined);
  const resolvedImageHeight = imageHeight ?? (usesDefaultImage ? 630 : undefined);
  const resolvedImageType = imageType ?? (usesDefaultImage ? "image/png" : undefined);
  const resolvedImageAlt = imageAlt || (locale === "en"
    ? "Puna Tech — custom software, AI automation, and systems integration."
    : "Puna Tech — software a medida y automatización con IA.");
  const entries: Array<Record<string, unknown>> = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { httpEquiv: "content-language", content: locale === "en" ? "en" : "es-AR" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: canonical },
    { property: "og:image", content: imageUrl },
    { property: "og:image:secure_url", content: imageUrl },
    { property: "og:image:alt", content: resolvedImageAlt },
    { property: "og:locale", content: locale === "en" ? "en_US" : "es_AR" },
    { property: "og:locale:alternate", content: locale === "en" ? "es_AR" : "en_US" },
    { property: "og:site_name", content: "Puna Tech" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: resolvedImageAlt },
    { tagName: "link", rel: "canonical", href: canonical },
  ];
  if (resolvedImageType) entries.push({ property: "og:image:type", content: resolvedImageType });
  if (resolvedImageWidth) entries.push({ property: "og:image:width", content: String(resolvedImageWidth) });
  if (resolvedImageHeight) entries.push({ property: "og:image:height", content: String(resolvedImageHeight) });

  if (alternatePath) {
    entries.push(
      { tagName: "link", rel: "alternate", hrefLang: locale === "en" ? "en" : "es-AR", href: canonical },
      { tagName: "link", rel: "alternate", hrefLang: locale === "en" ? "es-AR" : "en", href: absoluteUrl(alternatePath) },
      { tagName: "link", rel: "alternate", hrefLang: "x-default", href: locale === "en" ? canonical : absoluteUrl(alternatePath) },
    );
  }
  if (type === "article" && article) {
    if (article.publishedTime) entries.push({ property: "article:published_time", content: article.publishedTime });
    if (article.modifiedTime) entries.push({ property: "article:modified_time", content: article.modifiedTime });
    if (article.section) entries.push({ property: "article:section", content: article.section });
    if (article.author) entries.push({ property: "article:author", content: article.author });
  }
  if (schema) entries.push({ "script:ld+json": schema });
  return entries;
}

export function organizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Puna Tech",
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/profile-picture.png`,
        description: locale === "en"
          ? "Bilingual software factory for custom software, AI automation, and systems integration."
          : "Software factory bilingüe para software a medida, automatización con IA e integraciones de sistemas.",
        address: { "@type": "PostalAddress", addressLocality: "Buenos Aires", addressCountry: "AR" },
        sameAs: ["https://www.linkedin.com/company/puna-tech"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Puna Tech",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "es"],
      },
    ],
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
