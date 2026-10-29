/**
 * Known-spam blocklist for the lead form. Easy to extend:
 *  - add domains to SPAM_EMAIL_DOMAINS (a sender domain also blocks its subdomains),
 *  - add exact addresses to SPAM_EMAIL_ADDRESSES,
 *  - add regexes to SPAM_TEXT_PATTERNS (tested against name, company, message),
 *  - or set env LEAD_SPAM_DOMAINS="a.com,b.net" (comma list) without a code change.
 * Domains are also matched when they are mentioned in the text.
 */

export const SPAM_EMAIL_DOMAINS: string[] = ["search-puna-tech.com"];
export const SPAM_EMAIL_ADDRESSES: string[] = ["domains@search-puna-tech.com"];
/** Domains that are blocked when mentioned in name/company/message (not only as sender). */
export const SPAM_TEXT_DOMAINS: string[] = ["searchregister.pro"];
/**
 * Patterns are tested against name, company and message, both as written and with accents stripped (so write them
 * without accents). They target the "directory / index / SEO submission" mass-mailing family and are deliberately
 * specific: a lead that says "quiero mejorar mi SEO", "listing de propiedades" or "no aparezco en Google" must pass.
 * Do NOT add bare words such as "google index", "listing", "seo" or "dominio".
 */
export const SPAM_TEXT_PATTERNS: RegExp[] = [
  /search[\s_-]*index/i, // "Web Search Index", "Search-Index Team"
  /search[\s_-]*engine[\s_-]*(?:index|submission|registration|listing|inclusion)/i,
  /\b(?:google|bing|yahoo)[\s_-]*(?:search[\s_-]*)?index(?:ing)?[\s_-]*(?:submission|registration|listing|inclusion|fee|service|renewal|invoice)/i,
  /\bsubmit\s+(?:your|the)\s+(?:web\s*)?(?:site|website|domain|url)\b/i, // "submit your site"
  /\bseo\s+(?:submission|listing|registration)\b/i,
  /\b(?:web\s*)?(?:site|domain)\s+(?:listing|registration)(?:\s+registration)?\s+(?:expir|fee|invoice|renewal|notice|service)/i,
  /\b(?:register|renew|list)\s+(?:your|ur)\s+(?:web\s*)?(?:site|website|domain)\b/i, // "register your domain"
  /\byour\s+(?:domain|web\s*site|listing)\s+(?:\w+\s+){0,2}(?:expires?|expir(?:ing|ed|ation)|will\s+expire)/i,
  /\b(?:registre|registrar|renueve|renovar|inscriba|inscribir)\s+(?:su|tu)\s+(?:sitio|pagina|web|dominio)\b/i, // "registre su dominio"
  /\b(?:inscripcion|registro|inclusion)\s+(?:de\s+(?:su|tu)\s+(?:sitio|pagina|web|dominio)\s+)?(?:en|al|a)\s+(?:el\s+)?(?:indice|directorio)\s+(?:de\s+)?(?:busqueda|buscadores|google|web)\b/i,
  /\bindice\s+(?:web\s+)?de\s+busqueda\b/i, // "índice de búsqueda web"
  /\b(?:garantiz\w*|guarantee\w*)\s+(?:\w+\s+){0,4}(?:primera\s+pagina|first\s+page|top\s+(?:3|5|10)|posicion\s+1)\b/i,
];

export type BlocklistReason = "blocked_sender_domain" | "blocked_sender_address" | "blocked_domain_mention" | "blocked_text_pattern";

export function parseDomainList(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function emailDomain(email: string): string {
  return email.trim().toLowerCase().split("@").pop() || "";
}

function domainMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function mentionsDomain(text: string, domain: string): boolean {
  const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9-])(?:[a-z0-9-]+\\.)*${escaped}(?![a-z0-9-])`, "i").test(text);
}

export function matchBlocklist(
  fields: { name: string; email: string; company: string; problem: string },
  env: { LEAD_SPAM_DOMAINS?: string } = (typeof process !== "undefined" ? process.env : {}) as { LEAD_SPAM_DOMAINS?: string },
): BlocklistReason | null {
  const email = fields.email.trim().toLowerCase();
  const host = emailDomain(email);
  const extra = parseDomainList(env.LEAD_SPAM_DOMAINS);
  if (SPAM_EMAIL_ADDRESSES.some((address) => address.toLowerCase() === email)) return "blocked_sender_address";
  if ([...SPAM_EMAIL_DOMAINS, ...extra].some((domain) => domainMatches(host, domain))) return "blocked_sender_domain";
  const texts = [fields.name, fields.company, fields.problem];
  if ([...SPAM_TEXT_DOMAINS, ...SPAM_EMAIL_DOMAINS, ...extra].some((domain) => texts.some((text) => mentionsDomain(text, domain)))) return "blocked_domain_mention";
  const folded = texts.map(stripAccents);
  if (SPAM_TEXT_PATTERNS.some((pattern) => texts.some((text) => pattern.test(text)) || folded.some((text) => pattern.test(text)))) return "blocked_text_pattern";
  return null;
}
