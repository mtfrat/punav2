import React from 'react';

interface Crumb {
  name: string;
  url: string;
}

interface SEOTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  customSchema?: any;
  lang?: string;
  locale?: string;
  robots?: string;
  article?: boolean;
  breadcrumbs?: Crumb[];
}

const SEOTags: React.FC<SEOTagsProps> = ({ 
  title, 
  description, 
  keywords,
  ogTitle,
  ogDescription, 
  ogImage,
  canonicalUrl,
  customSchema,
  lang = 'es',
  locale = 'es_AR',
  robots = 'index, follow',
  article = false,
  breadcrumbs = []
}) => {
  // Static Spanish defaults
  const defaults = {
    title: 'Puna Tech | Agentes de IA y Automatización para Escalar Negocios B2B',
    description: 'Expertos en infraestructura de crecimiento con Inteligencia Artificial. Automatizamos ventas, prospección y procesos operativos para multiplicar la productividad de tu empresa.',
    keywords: 'agentes de ia, automatización b2b, prospección automatizada, agentes inteligentes, infraestructura de crecimiento, ai agents argentina, automatización de ventas, clay automation, n8n workflows'
  };

  const seoData = {
    title: title || defaults.title,
    description: description || defaults.description,
    keywords: keywords || defaults.keywords,
    ogTitle: ogTitle || title || defaults.title,
    ogDescription: ogDescription || description || defaults.description,
    ogImage: ogImage || 'https://www.puna-tech.com/darkLogo.png',
    canonicalUrl: canonicalUrl || 'https://www.puna-tech.com/'
  };

  React.useEffect(() => {
    // Update document title
    document.title = seoData.title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const updatePropertyTag = (property: string, content: string) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    // Update basic meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords);
    updateMetaTag('robots', robots);
    updateMetaTag('googlebot', robots);
    updateMetaTag('author', 'Puna Tech');
    
    // Update Open Graph tags
    updatePropertyTag('og:title', seoData.ogTitle);
    updatePropertyTag('og:description', seoData.ogDescription);
    updatePropertyTag('og:locale', locale);
    updatePropertyTag('og:type', article ? 'article' : 'website');
    updatePropertyTag('og:url', seoData.canonicalUrl);
    updatePropertyTag('og:site_name', 'Puna Tech');
    updatePropertyTag('og:image', seoData.ogImage);
    
    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoData.ogTitle);
    updateMetaTag('twitter:description', seoData.ogDescription);
    updateMetaTag('twitter:image', seoData.ogImage);
    
    // Update canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = seoData.canonicalUrl;

    // Update hreflang tags for bilingual SEO
    const updateHreflangTag = (hreflang: string, href: string) => {
      let tag = document.querySelector(`link[hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!tag) {
        tag = document.createElement('link');
        tag.rel = 'alternate';
        tag.hreflang = hreflang;
        document.head.appendChild(tag);
      }
      tag.href = href;
    };

    // Calculate base URL by removing language prefixes if any exist
    const baseUrl = seoData.canonicalUrl.replace(/\/en(\/|$)/, '/').replace(/\/es(\/|$)/, '/');
    const path = baseUrl.replace('https://www.puna-tech.com', '').replace('https://puna-tech.com', '');
    const cleanPath = path === '/' ? '' : path;

    // Inject Alternate Links
    updateHreflangTag('es', `https://www.puna-tech.com${cleanPath}`);
    updateHreflangTag('en', `https://www.puna-tech.com/en${cleanPath}`);
    updateHreflangTag('x-default', `https://www.puna-tech.com${cleanPath}`);

    // Update lang attribute
    document.documentElement.lang = lang;

    // Add enhanced schema if provided
    if (customSchema) {
      let schemaScript = document.querySelector('#custom-schema') as HTMLScriptElement | null;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'custom-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(customSchema);
    }

    // Add breadcrumb schema if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      };

      let breadcrumbScript = document.querySelector('#breadcrumb-schema') as HTMLScriptElement | null;
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.id = 'breadcrumb-schema';
        breadcrumbScript.type = 'application/ld+json';
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    }

  }, [seoData.title, seoData.description, seoData.keywords, seoData.ogTitle, seoData.ogDescription, seoData.ogImage, seoData.canonicalUrl, customSchema, breadcrumbs, robots, article, lang, locale]);

  return null;
};

export default SEOTags;
