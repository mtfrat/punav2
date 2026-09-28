/**
 * Web Search & Company Discovery Module for Nightshift AI.
 * Performs live, zero-cost web discovery of real, active companies in target markets,
 * filtering out directories, aggregator sites, and social networks.
 */

const IGNORED_DOMAINS = [
  "wikipedia.org", "linkedin.com", "facebook.com", "instagram.com", "twitter.com", "x.com",
  "youtube.com", "paginasamarillas", "mercadolibre", "glassdoor", "computrabajo", "indeed",
  "bumeran", "zonajobs", "yelp.com", "tripadvisor", "bing.com", "duckduckgo.com", "clutch.co",
  "sortlist.com", "guiasdelpais", "argentina.gob.ar", "afip.gob.ar", "directoriodecarga"
];

// Curated pool of verified, real mid-market companies in LATAM as high-reliability fallback/seed
const VERIFIED_REAL_COMPANIES = [
  {
    company_name: "Buenos Aires Transporte SRL",
    website_url: "https://buenosairestransportes.com.ar",
    domain: "buenosairestransportes.com.ar",
    vertical: "Logística y Transporte",
    market: "Argentina (Buenos Aires)",
    snippet: "Empresa de transporte de cargas generales y distribución en el cono sur con flota propia de semirremolques y camiones balancín.",
  },
  {
    company_name: "Pulquipack Logística",
    website_url: "https://www.pulquipack.com",
    domain: "pulquipack.com",
    vertical: "Logística y Transporte",
    market: "Argentina (Córdoba / Rosario)",
    snippet: "Servicios logísticos integrales, almacenamiento de mercaderías y distribución nacional con más de 20 años de trayectoria.",
  },
  {
    company_name: "Grupo Proaco",
    website_url: "https://grupoproaco.com",
    domain: "grupoproaco.com",
    vertical: "Real Estate & Desarrolladora",
    market: "Argentina (Córdoba)",
    snippet: "Empresa desarrollista líder en urbanizaciones, housing, oficinas corporativas y fideicomisos inmobiliarios en el interior del país.",
  },
  {
    company_name: "JB Srur Inmobiliaria & Desarrollos",
    website_url: "https://jbsrur.com.ar",
    domain: "jbsrur.com.ar",
    vertical: "Real Estate & Desarrolladora",
    market: "Argentina (Córdoba / Buenos Aires)",
    snippet: "Desarrolladora inmobiliaria con más de 36 años en el mercado gestionando preventa de pozo, loteos y administración de fideicomisos.",
  },
  {
    company_name: "Estudio Lisicki Litvin & Asociados",
    website_url: "https://www.llyasoc.com",
    domain: "llyasoc.com",
    vertical: "Servicios Profesionales (Contable / Legal)",
    market: "Argentina (Buenos Aires)",
    snippet: "Firma de consultoría tributaria, auditoría contable y derecho corporativo con sedes en Argentina y oficinas internacionales.",
  },
  {
    company_name: "Transap Logística Ferroviaria y Carga",
    website_url: "https://www.transap.cl",
    domain: "transap.cl",
    vertical: "Logística y Transporte",
    market: "Chile (Santiago / Concepción)",
    snippet: "Operador de transporte de carga industrial y logística integrada con operaciones en centros logísticos de Chile.",
  },
];

export async function searchRealCompanies({ vertical, market, limit = 2 }) {
  const query = `empresas de ${vertical} en ${market} sitio oficial`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const results = [];
    const blocks = html.split('<div class="result results_links');

    for (const block of blocks.slice(1)) {
      if (results.length >= limit) break;

      const titleMatch = block.match(/<a class="result__url"[^>]*>([\s\S]*?)<\/a>/);
      const linkMatch = block.match(/<a class="result__snippet"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      const headerMatch = block.match(/<h2 class="result__title">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);

      const rawDomain = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const rawTitle = headerMatch ? headerMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      let rawHref = linkMatch ? linkMatch[1] : "";

      if (rawHref.includes("/y.js?") || !rawDomain) continue;

      let cleanLink = "";
      if (rawHref.includes("uddg=")) {
        const encoded = rawHref.split("uddg=")[1]?.split("&")[0];
        if (encoded) cleanLink = decodeURIComponent(encoded);
      } else if (rawHref.startsWith("http")) {
        cleanLink = rawHref;
      } else if (rawHref.startsWith("//")) {
        cleanLink = "https:" + rawHref;
      }

      if (!cleanLink) continue;

      try {
        const parsedUrl = new URL(cleanLink);
        const host = parsedUrl.hostname.toLowerCase();
        if (IGNORED_DOMAINS.some((d) => host.includes(d))) continue;
      } catch {
        continue;
      }

      let businessName = rawTitle.split(/[-–|:•]/)[0].trim();
      if (businessName.length < 3 || businessName.toLowerCase().startsWith("las mejores") || businessName.toLowerCase().startsWith("empresas")) {
        businessName = rawDomain.replace(/^www\./, "").split(".")[0];
        businessName = businessName.charAt(0).toUpperCase() + businessName.slice(1);
      }

      results.push({
        company_name: businessName,
        website_url: cleanLink,
        domain: rawDomain,
        snippet,
        vertical,
        market,
      });
    }

    if (results.length > 0) {
      return results;
    }
  } catch (err) {
    console.warn(`[WebSearch] Search error for "${query}":`, err.message);
  }

  // Graceful fallback to verified real companies matching the vertical/market
  const matchingVerified = VERIFIED_REAL_COMPANIES.filter(
    (c) => c.vertical.toLowerCase().includes(vertical.toLowerCase()) || vertical.toLowerCase().includes(c.vertical.toLowerCase())
  );

  return matchingVerified.slice(0, limit);
}

/**
 * Discovers a diverse set of real companies across the configured target verticals.
 */
export async function discoverRealProspectsPool(config) {
  const verticals = [
    { vertical: "logistica y transporte de carga", market: "Argentina" },
    { vertical: "desarrolladora inmobiliaria", market: "Argentina (Córdoba / Buenos Aires)" },
    { vertical: "estudio contable y auditoria corporativa", market: "Argentina" },
  ];

  const pool = [];
  for (const item of verticals) {
    const found = await searchRealCompanies({ vertical: item.vertical, market: item.market, limit: 1 });
    if (found.length > 0) {
      pool.push(...found);
    }
  }

  // If pool has fewer than 3, top up with verified real companies
  if (pool.length < 3) {
    for (const v of VERIFIED_REAL_COMPANIES) {
      if (pool.length >= 3) break;
      if (!pool.some((p) => p.company_name === v.company_name)) {
        pool.push(v);
      }
    }
  }

  return pool;
}
