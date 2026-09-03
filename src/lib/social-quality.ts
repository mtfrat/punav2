import type { SocialChannel, SocialLocale } from "./social-studio.ts";
import { composeSocialContent, validateSocialContent } from "./social-studio.ts";

export type EvidenceSource = { key: string; title: string; url?: string; excerpt: string };
export type QualityFlag = { code: string; severity: "warning" | "blocking"; message: string };
export type QualityDimension = { score: number; rationale: string };
export type QualityScorecard = {
  clarity: QualityDimension;
  specificity: QualityDimension;
  credibility: QualityDimension;
  channel_fit: QualityDimension;
};
export type QualityReview = {
  content_hash: string;
  scores: QualityScorecard;
  flags: QualityFlag[];
  evidence_checks: Array<{ claim: string; source_key: string | null; supported: boolean }>;
};
export type DuplicateCandidate = { id: string; campaignId: string; campaignTitle: string; channel: string; content: string; occurredAt: string };
export type DuplicateMatch = DuplicateCandidate & { similarity: number; exact: boolean };
export type GeneratedSocialVariant = {
  channel: SocialChannel; locale: SocialLocale; hook: string; body: string; cta: string; hashtags: string[];
  image_headline: string; image_alt: string; evidence_refs: Array<{ claim: string; source_key: string }>;
  quality_flags: QualityFlag[]; generation_notes: string[];
};

const BANNED_PHRASES = ["en la era digital", "revolucionar", "desbloquear", "el futuro es ahora", "soluciones innovadoras", "de vanguardia", "transformar tu negocio", "impulsar el crecimiento", "aprovechar el poder de"];

function numericTokens(value: string) {
  return Array.from(new Set(value.match(/(?:US\$|[$€£])?\s?\d+(?:[.,]\d+)?(?:\s?%|\s?(?:minutos?|minutes?|horas?|hours?|d[ií]as?|days?|x))?/gi) || [])).map((token) => token.trim().toLowerCase());
}

function isHttps(value: string | null | undefined) {
  if (!value) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function qualityContentMaterial(variant: Pick<GeneratedSocialVariant, "hook" | "body" | "cta" | "hashtags" | "image_headline" | "image_alt"> & { channel: SocialChannel; locale: SocialLocale }, mediaStrategy = "text_only") {
  return [composeSocialContent(variant), variant.image_headline || "", variant.image_alt || "", mediaStrategy].join("\n--puna-quality--\n");
}

export function normalizeSocialCopy(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/https?:\/\/\S+/g, " ").replace(/#/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function shingles(value: string) {
  const words = normalizeSocialCopy(value).split(" ").filter(Boolean);
  if (words.length < 3) return new Set(words);
  return new Set(words.slice(0, -2).map((_, index) => words.slice(index, index + 3).join(" ")));
}

export function socialCopySimilarity(left: string, right: string) {
  const a = shingles(left); const b = shingles(right);
  if (!a.size && !b.size) return 1;
  const intersection = [...a].filter((item) => b.has(item)).length;
  return intersection / (a.size + b.size - intersection || 1);
}

export function duplicateMatches(content: string, candidates: DuplicateCandidate[]): DuplicateMatch[] {
  const normalized = normalizeSocialCopy(content);
  return candidates.map((candidate) => {
    const candidateNormalized = normalizeSocialCopy(candidate.content);
    const exact = Boolean(normalized) && normalized === candidateNormalized;
    return { ...candidate, exact, similarity: exact ? 1 : socialCopySimilarity(content, candidate.content) };
  }).filter((candidate) => candidate.exact || candidate.similarity >= 0.72).sort((a, b) => b.similarity - a.similarity);
}

export function duplicateQualityFlags(matches: DuplicateMatch[]): QualityFlag[] {
  return matches.map((match) => ({
    code: match.exact ? "duplicate_exact" : "duplicate_similar",
    severity: match.exact ? "blocking" : "warning",
    message: match.exact
      ? `El copy es idéntico a “${match.campaignTitle}” (${match.channel}).`
      : `El copy tiene ${Math.round(match.similarity * 100)}% de similitud con “${match.campaignTitle}” (${match.channel}).`,
  }));
}

export function deterministicQualityFlags(variant: GeneratedSocialVariant, sources: EvidenceSource[], mediaStrategy = "text_only", campaign?: { ctaType?: string | null; ctaUrl?: string | null }): QualityFlag[] {
  const content = composeSocialContent(variant); const flags: QualityFlag[] = [];
  const contentError = validateSocialContent(variant.channel, content);
  if (contentError) flags.push({ code: "channel_limit", severity: "blocking", message: contentError });
  const lower = content.toLowerCase();
  for (const phrase of BANNED_PHRASES) if (lower.includes(phrase)) flags.push({ code: "cliche", severity: "warning", message: `Revisá la frase “${phrase}”.` });
  if (mediaStrategy !== "text_only" && !variant.image_alt.trim()) flags.push({ code: "missing_alt", severity: "blocking", message: "La imagen necesita texto alternativo." });
  if (["audit", "service", "article"].includes(campaign?.ctaType || "") && !isHttps(campaign?.ctaUrl)) flags.push({ code: "missing_cta_url", severity: "blocking", message: "El CTA necesita un destino HTTPS válido." });
  const byKey = new Map(sources.map((source) => [source.key, source]));
  for (const token of numericTokens(content)) {
    const supported = variant.evidence_refs.some((ref) => { const source = byKey.get(String(ref.source_key)); return source && String(ref.claim).toLowerCase().includes(token) && source.excerpt.toLowerCase().includes(token); });
    if (!supported) flags.push({ code: "unsupported_number", severity: "blocking", message: `La cifra “${token}” no está respaldada por una fuente.` });
  }
  const combined = [...variant.quality_flags.filter((flag) => flag && flag.code && flag.message), ...flags];
  return combined.filter((flag, index) => combined.findIndex((item) => item.code === flag.code && item.message === flag.message) === index);
}

export function blockingQualityMessage(flags: QualityFlag[]) {
  return flags.find((flag) => flag.severity === "blocking")?.message || null;
}
