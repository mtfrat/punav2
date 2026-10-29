import type { Locale } from "./chrome";
import type { VerticalId } from "./demos.ts";

/** "I want this for my …" CTA shown inside every demo chapter. The noun changes per rubro. */
const nouns: Record<VerticalId, Record<Locale, string>> = {
  accounting: { es: "estudio", en: "firm" },
  legal: { es: "estudio", en: "firm" },
  insurance: { es: "productora", en: "brokerage" },
  "real-estate": { es: "inmobiliaria", en: "agency" },
  clinics: { es: "clínica", en: "clinic" },
  commerce: { es: "negocio", en: "business" },
};

export function wantThisLabel(locale: Locale, rubro: VerticalId): string {
  return locale === "es" ? `Quiero esto para mi ${nouns[rubro].es}` : `I want this for my ${nouns[rubro].en}`;
}

/** Brief link that keeps the block (rubro and demo) so the lead alert names where the visitor came from. */
export function wantThisHref(contactHref: string, blockPrefix: string, demoId: string): string {
  const block = `${blockPrefix}-${demoId}`.replace(/[^a-z0-9_-]/gi, "").slice(0, 60);
  return `${contactHref}?bloque=${block}#brief-form`;
}
