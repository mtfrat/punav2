import type { SocialChannel, SocialLocale } from "./social-studio.ts";
import { composeSocialContent, validateSocialContent } from "./social-studio.ts";

export type EvidenceSource = { key: string; title: string; url?: string; excerpt: string };
export type QualityFlag = { code: string; severity: "warning" | "blocking"; message: string };
export type GeneratedSocialVariant = {
  channel: SocialChannel; locale: SocialLocale; hook: string; body: string; cta: string; hashtags: string[];
  image_headline: string; image_alt: string; evidence_refs: Array<{ claim: string; source_key: string }>;
  quality_flags: QualityFlag[]; generation_notes: string[];
};

const BANNED_PHRASES = ["en la era digital", "revolucionar", "desbloquear", "el futuro es ahora", "soluciones innovadoras", "de vanguardia", "transformar tu negocio", "impulsar el crecimiento", "aprovechar el poder de"];

function numericTokens(value: string) {
  return Array.from(new Set(value.match(/(?:US\$|[$€£])?\s?\d+(?:[.,]\d+)?(?:\s?%|\s?(?:minutos?|minutes?|horas?|hours?|d[ií]as?|days?|x))?/gi) || [])).map((token) => token.trim().toLowerCase());
}

export function deterministicQualityFlags(variant: GeneratedSocialVariant, sources: EvidenceSource[], mediaStrategy = "text_only"): QualityFlag[] {
  const content = composeSocialContent(variant); const flags: QualityFlag[] = [];
  const contentError = validateSocialContent(variant.channel, content);
  if (contentError) flags.push({ code: "channel_limit", severity: "blocking", message: contentError });
  const lower = content.toLowerCase();
  for (const phrase of BANNED_PHRASES) if (lower.includes(phrase)) flags.push({ code: "cliche", severity: "warning", message: `Revisá la frase “${phrase}”.` });
  if (mediaStrategy !== "text_only" && !variant.image_alt.trim()) flags.push({ code: "missing_alt", severity: "blocking", message: "La imagen necesita texto alternativo." });
  const byKey = new Map(sources.map((source) => [source.key, source]));
  for (const token of numericTokens(content)) {
    const supported = variant.evidence_refs.some((ref) => { const source = byKey.get(String(ref.source_key)); return source && String(ref.claim).toLowerCase().includes(token) && source.excerpt.toLowerCase().includes(token); });
    if (!supported) flags.push({ code: "unsupported_number", severity: "blocking", message: `La cifra “${token}” no está respaldada por una fuente.` });
  }
  return [...variant.quality_flags.filter((flag) => flag && flag.code && flag.message), ...flags];
}

export function blockingQualityMessage(flags: QualityFlag[]) {
  return flags.find((flag) => flag.severity === "blocking")?.message || null;
}
