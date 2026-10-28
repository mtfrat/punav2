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
export const SPAM_TEXT_PATTERNS: RegExp[] = [/search[\s_-]*index/i];

export type BlocklistReason = "blocked_sender_domain" | "blocked_sender_address" | "blocked_domain_mention" | "blocked_text_pattern";

export function parseDomainList(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
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
  if (SPAM_TEXT_PATTERNS.some((pattern) => texts.some((text) => pattern.test(text)))) return "blocked_text_pattern";
  return null;
}
