import { createHash, randomUUID } from "node:crypto";
import { isSocialChannel, isSocialLocale } from "./social-studio.ts";
import type { EvidenceSource, GeneratedSocialVariant, QualityFlag, QualityReview, QualityScorecard } from "./social-quality.ts";
export type { EvidenceSource, GeneratedSocialVariant, QualityFlag } from "./social-quality.ts";
export { blockingQualityMessage, deterministicQualityFlags } from "./social-quality.ts";

export type OpeningOption = { kind: "observable_problem" | "verified_data" | "contrast" | "real_learning"; text: string; rationale: string; warnings: string[] };

const openingSchema = {
  type: "object", additionalProperties: false, required: ["options"], properties: {
    options: { type: "array", minItems: 3, maxItems: 3, items: { type: "object", additionalProperties: false, required: ["kind", "text", "rationale", "warnings"], properties: {
      kind: { type: "string", enum: ["observable_problem", "verified_data", "contrast", "real_learning"] },
      text: { type: "string" }, rationale: { type: "string" }, warnings: { type: "array", items: { type: "string" } },
    } } },
  },
};

const variantItemSchema = {
  type: "object", additionalProperties: false,
  required: ["channel", "locale", "hook", "body", "cta", "hashtags", "image_headline", "image_alt", "evidence_refs", "quality_flags", "generation_notes"],
  properties: {
    channel: { type: "string", enum: ["linkedin", "x", "instagram"] }, locale: { type: "string", enum: ["es", "en"] },
    hook: { type: "string" }, body: { type: "string" }, cta: { type: "string" }, hashtags: { type: "array", items: { type: "string" }, maxItems: 8 },
    image_headline: { type: "string" }, image_alt: { type: "string" },
    evidence_refs: { type: "array", items: { type: "object", additionalProperties: false, required: ["claim", "source_key"], properties: { claim: { type: "string" }, source_key: { type: "string" } } } },
    quality_flags: { type: "array", items: { type: "object", additionalProperties: false, required: ["code", "severity", "message"], properties: { code: { type: "string" }, severity: { type: "string", enum: ["warning", "blocking"] }, message: { type: "string" } } } },
    generation_notes: { type: "array", items: { type: "string" } },
  },
};

const variantsSchema = { type: "object", additionalProperties: false, required: ["variants"], properties: { variants: { type: "array", minItems: 1, maxItems: 6, items: variantItemSchema } } };
const sectionSchema = { type: "object", additionalProperties: false, required: ["text", "evidence_refs", "quality_flags", "generation_notes"], properties: {
  text: { type: "string" }, evidence_refs: variantItemSchema.properties.evidence_refs,
  quality_flags: variantItemSchema.properties.quality_flags, generation_notes: variantItemSchema.properties.generation_notes,
} };

const qualityDimensionSchema = { type: "object", additionalProperties: false, required: ["score", "rationale"], properties: {
  score: { type: "integer", minimum: 0, maximum: 100 }, rationale: { type: "string" },
} };
const qualityReviewSchema = { type: "object", additionalProperties: false, required: ["scores", "flags", "evidence_checks"], properties: {
  scores: { type: "object", additionalProperties: false, required: ["clarity", "specificity", "credibility", "channel_fit"], properties: {
    clarity: qualityDimensionSchema, specificity: qualityDimensionSchema, credibility: qualityDimensionSchema, channel_fit: qualityDimensionSchema,
  } },
  flags: variantItemSchema.properties.quality_flags,
  evidence_checks: { type: "array", items: { type: "object", additionalProperties: false, required: ["claim", "source_key", "supported"], properties: {
    claim: { type: "string" }, source_key: { type: ["string", "null"] }, supported: { type: "boolean" },
  } } },
} };

function extractResponseText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  for (const item of payload?.output || []) for (const content of item?.content || []) if (content?.type === "output_text" && typeof content.text === "string") return content.text;
  throw new Error("invalid_model_response");
}

async function structuredResponse<T>(name: string, schema: Record<string, unknown>, instructions: string, input: unknown): Promise<{ value: T; requestId: string; usage: Record<string, unknown>; durationMs: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("openai_not_configured");
  const model = process.env.CONTENT_TEXT_MODEL || "gpt-5.6-terra";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  const startedAt = Date.now();
  let providerRequestId = "";
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-Client-Request-Id": randomUUID() },
      body: JSON.stringify({ model, instructions, input: JSON.stringify(input), text: { format: { type: "json_schema", name, strict: true, schema } } }),
    });
    const payload = await response.json().catch(() => null);
    providerRequestId = response.headers.get("x-request-id") || String(payload?.id || "");
    if (!response.ok) throw Object.assign(new Error(response.status === 429 ? "model_rate_limited" : "model_unavailable"), { requestId: providerRequestId });
    const value = JSON.parse(extractResponseText(payload)) as T;
    return { value, requestId: providerRequestId, usage: payload?.usage || {}, durationMs: Date.now() - startedAt };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw Object.assign(new Error("model_timeout"), { requestId: providerRequestId });
    if (error instanceof Error && providerRequestId && !("requestId" in error)) Object.assign(error, { requestId: providerRequestId });
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function reviewSocialVariant(context: Record<string, unknown>, variant: GeneratedSocialVariant) {
  const result = await structuredResponse<Omit<QualityReview, "content_hash">>("puna_social_quality_review", qualityReviewSchema,
    "Review this Puna Tech social post without rewriting it. Score clarity, specificity, credibility and channel fit from 0 to 100 with a concise rationale. Check every factual claim against only the supplied sources. Flag unsupported claims, confidentiality risk, probable locale errors, clichés and weak CTAs. Unsupported quantitative claims and confidentiality risks are blocking. Low scores are warnings, never blockers by themselves. Return no copy or prompt text.",
    { context, variant });
  const scores = result.value.scores as QualityScorecard;
  for (const key of ["clarity", "specificity", "credibility", "channel_fit"] as const) {
    const dimension = scores?.[key];
    if (!Number.isInteger(dimension?.score) || dimension.score < 0 || dimension.score > 100 || typeof dimension.rationale !== "string") throw new Error("invalid_quality_review");
  }
  return { ...result, value: result.value };
}

export function stableHash(value: unknown) {
  const sort = (item: any): any => Array.isArray(item) ? item.map(sort) : item && typeof item === "object" ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, sort(item[key])])) : item;
  return createHash("sha256").update(JSON.stringify(sort(value))).digest("hex");
}

export async function generateOpeningOptions(context: Record<string, unknown>, hasVerifiedEvidence: boolean) {
  const result = await structuredResponse<{ options: OpeningOption[] }>("puna_opening_options", openingSchema,
    "Create exactly three calm, specific B2B post openings for Puna Tech. Use only supplied facts. Avoid hype, invented metrics and emojis. A verified_data opening is forbidden unless has_verified_evidence is true. Return Spanish unless the requested locale says otherwise.",
    { ...context, has_verified_evidence: hasVerifiedEvidence });
  if (!Array.isArray(result.value.options) || result.value.options.length !== 3) throw new Error("invalid_opening_options");
  if (!hasVerifiedEvidence && result.value.options.some((item) => item.kind === "verified_data")) throw new Error("unsupported_verified_opening");
  return { ...result, options: result.value.options };
}

export async function draftSocialVariants(context: Record<string, unknown>) {
  const result = await structuredResponse<{ variants: GeneratedSocialVariant[] }>("puna_social_variants", variantsSchema,
    "Write professional B2B social variants for Puna Tech. Translate technology into concrete operational impact. No hype, clichés, emojis, invented numbers, clients or results. Keep LinkedIn under 3000, X under 280 and Instagram under 2200 characters after hook/body/CTA/hashtags are joined. Use only supplied evidence and cite every factual or quantitative claim with a source_key.", context);
  return { ...result, variants: validateGeneratedShape(result.value.variants) };
}

export async function criticSocialVariants(context: Record<string, unknown>, variants: GeneratedSocialVariant[]) {
  const result = await structuredResponse<{ variants: GeneratedSocialVariant[] }>("puna_social_critic", variantsSchema,
    "Act as a strict editor. Return the same channel/locale pairs, improved for clarity, credibility and a specific CTA. Remove clichés and unsupported claims. Never add facts. Preserve valid evidence references. Zero emojis. Return blocking quality flags for anything that cannot be supported.", { context, variants });
  return { ...result, variants: validateGeneratedShape(result.value.variants) };
}

export async function regenerateSocialSection(context: Record<string, unknown>, variant: GeneratedSocialVariant, section: "hook" | "body" | "cta") {
  const first = await structuredResponse<{ text: string; evidence_refs: GeneratedSocialVariant["evidence_refs"]; quality_flags: QualityFlag[]; generation_notes: string[] }>("puna_social_section", sectionSchema,
    `Rewrite only the ${section} section for this Puna Tech social post. Match its channel and locale. Use only supplied evidence. No hype, clichés, emojis or invented claims. Keep every quantitative claim linked to a valid source_key.`, { context, variant, section });
  const second = await structuredResponse<typeof first.value>("puna_social_section_critic", sectionSchema,
    `Act as a strict editor for only the ${section} section. Improve clarity, credibility and channel fit. Never introduce new facts. Return blocking flags for unsupported claims.`, { context, variant, section, candidate: first.value });
  if (typeof second.value.text !== "string" || !second.value.text.trim()) throw new Error("invalid_generated_variant");
  return { ...second, value: { ...second.value, text: second.value.text.trim() }, draftingUsage: first.usage, draftingRequestId: first.requestId, draftingDurationMs: first.durationMs };
}

function validateGeneratedShape(value: unknown): GeneratedSocialVariant[] {
  if (!Array.isArray(value) || !value.length) throw new Error("invalid_generated_variants");
  return value.map((item: any) => {
    if (!item || !isSocialChannel(item.channel) || !isSocialLocale(item.locale)) throw new Error("invalid_generated_variant");
    for (const key of ["hook", "body", "cta", "image_headline", "image_alt"] as const) if (typeof item[key] !== "string") throw new Error("invalid_generated_variant");
    return { ...item, hashtags: Array.isArray(item.hashtags) ? item.hashtags.slice(0, 8).map(String) : [], evidence_refs: Array.isArray(item.evidence_refs) ? item.evidence_refs : [], quality_flags: Array.isArray(item.quality_flags) ? item.quality_flags : [], generation_notes: Array.isArray(item.generation_notes) ? item.generation_notes : [] } as GeneratedSocialVariant;
  });
}
