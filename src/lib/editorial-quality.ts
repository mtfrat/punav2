import { copy, servicePath, services, type Locale } from "../content/site.ts";

/**
 * OPS Tip P0 — editorial gates for Approve/Publish.
 *
 * App-side only: this module never touches the n8n pipeline. It enforces the
 * Copy quality bar on the bilingual pair before a human can Approve or Publish:
 *   1. an in-body, locale-correct service <a href> (the template aside does not count);
 *   2. the editorial banlist;
 *   3. CTA A when the body already carries a Cal/brief signal (soft-close stays OK).
 */

const LOCALES: Locale[] = ["en", "es"];

/**
 * Canonical service allowlist, derived from the site content so it cannot drift.
 * EN: /services/<slug> · ES: /es/servicios/<slug>
 */
export const SERVICE_CLUSTER_PATHS: Record<Locale, Record<string, string>> = {
  en: Object.fromEntries(services.en.map((service) => [service.slug, servicePath("en", service.slug)] as const)),
  es: Object.fromEntries(services.es.map((service) => [service.slug, servicePath("es", service.slug)] as const)),
};

/** CTA A labels accepted per locale (primary + secondary). */
export const CTA_A_LABELS: Record<Locale, string[]> = {
  en: [copy.en.book, copy.en.sendBrief],
  es: [copy.es.book, copy.es.sendBrief],
};

interface BanlistRule {
  label: string;
  pattern: RegExp;
}

/** Old free-audit framing: still a CTA signal, never a valid CTA A label. */
const OLD_CTA_RULES: BanlistRule[] = [
  { label: "Book free", pattern: /\bbook\s+(?:a\s+)?free\b/i },
  { label: "Auditoría gratis", pattern: /\bauditor[ií]a\s+gratis\b/i },
  { label: "auditoría gratuita", pattern: /\bauditor[ií]a\s+gratuita\b/i },
  { label: "15-min audit", pattern: /\b(?:free\s+)?15[-\s]?min(?:ute)?\s+audit\b/i },
];

const BANLIST_RULES: BanlistRule[] = [
  { label: "guarantee", pattern: /\bguarantee(?:s|d)?\b/i },
  { label: "garantía", pattern: /\bgarant[ií]as?\b/i },
  { label: "synergy", pattern: /\bsynerg(?:y|ies|istic)\b/i },
  { label: "sinergia", pattern: /\bsinergias?\b/i },
  { label: "next-gen", pattern: /\bnext[-\s]?gen(?:eration)?\b/i },
  { label: "próxima generación", pattern: /\bpr[óo]xima\s+generaci[óo]n\b/i },
  { label: "revolutionize", pattern: /\brevolutioniz\w*/i },
  { label: "revolucion", pattern: /\brevoluci[óo]n\w*/i },
  { label: "ROI percentage", pattern: /\b\d+\s*%\s*(?:ROI|return)\b/i },
  { label: "ROI de N", pattern: /\bROI\s+de\s+\d+/i },
  ...OLD_CTA_RULES,
];

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ");
}

/** Resolve a raw href to a comparable pathname, or null when it is not internal. */
function toComparablePath(href: string): string | null {
  const value = String(href || "").trim();
  if (!value) return null;
  let path: string;
  if (/^https?:\/\//i.test(value)) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return null;
    }
    if (!/(^|\.)puna-tech\.com$/i.test(url.hostname)) return null;
    path = url.pathname;
  } else if (value.startsWith("/")) {
    path = value.split(/[?#]/)[0];
  } else {
    return null;
  }
  path = path.split(/[?#]/)[0];
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
}

function extractHrefs(contentHtml: string): string[] {
  const html = String(contentHtml || "");
  const hrefs: string[] = [];
  let match: RegExpExecArray | null;
  const anchor = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  while ((match = anchor.exec(html))) hrefs.push(match[1] ?? match[2] ?? match[3] ?? "");
  const markdown = /\[[^\]]*\]\(\s*(?:<([^>]+)>|([^)\s]+))/g;
  while ((match = markdown.exec(html))) hrefs.push(match[1] ?? match[2] ?? "");
  return hrefs;
}

/** Expected in-body href for a post, or null when the slug is missing/outside the allowlist. */
export function expectedServiceHref(locale: Locale | string, relatedServiceSlug: string | null | undefined): string | null {
  if (!isLocale(locale)) return null;
  const slug = String(relatedServiceSlug || "").trim().toLowerCase();
  if (!slug) return null;
  return SERVICE_CLUSTER_PATHS[locale][slug] || null;
}

/** True when the body HTML/text links to the expected locale-correct service path. */
export function bodyHasServiceHref(contentHtml: string, expectedPath: string | null): boolean {
  const expected = expectedPath ? toComparablePath(expectedPath) : null;
  if (!expected) return false;
  return extractHrefs(contentHtml).some((href) => toComparablePath(href) === expected);
}

/** Case-insensitive editorial banlist scan. Returns the matched canonical labels. */
export function scanEditorialBanlist(text: string): string[] {
  const value = String(text || "");
  const hits: string[] = [];
  for (const rule of BANLIST_RULES) {
    if (rule.pattern.test(value) && !hits.includes(rule.label)) hits.push(rule.label);
  }
  return hits;
}

export interface CtaAScan {
  hasCalOrBrief: boolean;
  ok: boolean;
  detail?: string;
}

/**
 * CTA A policy:
 * - Soft-close only (no Cal/brief URL/label) → OK; the footer CalButton is enough.
 * - Cal/brief present → the body must carry one of the locale CTA A labels.
 */
export function scanCtaA(locale: Locale | string, contentHtml: string): CtaAScan {
  const raw = String(contentHtml || "");
  const text = collapse(stripHtml(raw));
  const hasCal = /puna-tech-r7xi5x/i.test(raw) || /cal\.com/i.test(raw) || /\/15min\b/i.test(raw);
  const hasBrief = /(?:\/es)?\/brief\b|#brief\b/i.test(raw);
  const hasOldCta = OLD_CTA_RULES.some((rule) => rule.pattern.test(text));
  const hasCalOrBrief = hasCal || hasBrief || hasOldCta;
  const labels = isLocale(locale) ? CTA_A_LABELS[locale] : [];
  const hasCtaA = labels.some((label) => text.includes(collapse(label)));
  const ok = !hasCalOrBrief || hasCtaA;
  return {
    hasCalOrBrief,
    ok,
    detail: ok ? undefined : "Cal/brief present without a locale CTA A label",
  };
}

/**
 * Editorial gate for a bilingual pair. Merges into validatePair() so Approve and
 * Publish share the same rules. Posts without an EN/ES locale are skipped here
 * (the base validator already reports missing locales).
 */
export function validateEditorialPair(posts: Array<Record<string, unknown>>): string[] {
  const errors: string[] = [];
  for (const locale of LOCALES) {
    const post = posts.find((item) => item.locale === locale);
    if (!post) continue;
    const label = locale.toUpperCase();
    const content = String(post.content || "");

    const scanned = [post.title, post.excerpt, post.meta_title, post.meta_description, content]
      .map((value) => String(value || ""))
      .join("\n");
    const banned = scanEditorialBanlist(scanned);
    if (banned.length) errors.push(`${label}: banlist: ${banned.map((term) => `"${term}"`).join(", ")}.`);

    const expected = expectedServiceHref(locale, post.related_service_slug as string | null | undefined);
    if (!expected) {
      errors.push(`${label}: related_service_slug ausente o fuera del allowlist (ai-automation, custom-software, data-integrations).`);
    } else if (!bodyHasServiceHref(content, expected)) {
      errors.push(`${label}: falta enlace in-body al servicio (${expected}). El aside del template no cuenta.`);
    }

    const cta = scanCtaA(locale, content);
    if (!cta.ok) errors.push(`${label}: CTA Cal/brief presente pero el texto no es CTA A.`);
  }
  return errors;
}
