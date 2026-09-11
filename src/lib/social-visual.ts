import type { EvidenceSource, QualityFlag } from "./social-quality";

export type VisualKind = "text" | "single" | "carousel";
export type VisualPreset = "editorial" | "evidence" | "system" | "image";
export type CarouselSlideRole = "cover" | "content" | "cta";
export type CarouselEvidenceRef = { claim: string; source_key: string };
export type SocialCarouselSlide = {
  id: string;
  role: CarouselSlideRole;
  eyebrow: string;
  headline: string;
  body: string;
  bullets: string[];
  emphasis: string | null;
  evidence_refs: CarouselEvidenceRef[];
  asset_id: string | null;
  alt_text: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const bannedPhrases = ["en la era digital", "revolucionar", "desbloquear", "el futuro es ahora", "soluciones innovadoras", "de vanguardia"];

export function parseCarouselSlides(value: unknown): SocialCarouselSlide[] {
  if (!Array.isArray(value) || value.length < 3 || value.length > 7) throw new Error("carousel_slide_count");
  const allowed = new Set(["id", "role", "eyebrow", "headline", "body", "bullets", "emphasis", "evidence_refs", "asset_id", "alt_text"]);
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Object.keys(raw).some((key) => !allowed.has(key))) throw new Error("invalid_carousel_slide");
    const item = raw as Record<string, unknown>;
    const role = String(item.role || "") as CarouselSlideRole;
    const expectedRole = index === 0 ? "cover" : index === value.length - 1 ? "cta" : "content";
    const bullets = Array.isArray(item.bullets) ? item.bullets.map(String) : [];
    const evidence = Array.isArray(item.evidence_refs) ? item.evidence_refs.map((ref) => ({ claim: String((ref as any)?.claim || ""), source_key: String((ref as any)?.source_key || "") })) : [];
    const slide: SocialCarouselSlide = {
      id: String(item.id || ""), role, eyebrow: String(item.eyebrow || "").trim(), headline: String(item.headline || "").trim(),
      body: String(item.body || "").trim(), bullets: bullets.map((bullet) => bullet.trim()),
      emphasis: item.emphasis == null || item.emphasis === "" ? null : String(item.emphasis).trim(),
      evidence_refs: evidence, asset_id: item.asset_id == null || item.asset_id === "" ? null : String(item.asset_id), alt_text: String(item.alt_text || "").trim(),
    };
    if (!uuidPattern.test(slide.id) || role !== expectedRole || slide.eyebrow.length > 40 || slide.headline.length < 1 || slide.headline.length > 100 || slide.body.length > 260 || bullets.length > 4 || bullets.some((item) => item.length < 1 || item.length > 90) || slide.alt_text.length < 1 || slide.alt_text.length > 500 || (slide.emphasis?.length || 0) > 40) throw new Error("invalid_carousel_slide");
    return slide;
  });
}

function numericTokens(value: string) {
  const candidates = value.matchAll(/(?:US\$\s?|[$€£]\s?)?\d+(?:[.,]\d+)?(?:\s?%|\s?(?:minutos?|minutes?|horas?|hours?|d[ií]as?|days?|x))?/giu);
  const identifier = /[\p{L}\p{N}_-]/u;
  return [...new Set([...candidates].flatMap((match) => {
    const start = match.index;
    const before = start > 0 ? value[start - 1] : "";
    const after = value[start + match[0].length] || "";
    return identifier.test(before) || identifier.test(after) ? [] : [match[0].trim().toLowerCase()];
  }))];
}

export function carouselQualityFlags(slides: SocialCarouselSlide[], sources: EvidenceSource[], preset: VisualPreset): QualityFlag[] {
  const flags: QualityFlag[] = [];
  const byKey = new Map(sources.map((source) => [source.key, source]));
  const seen = new Set<string>();
  slides.forEach((slide, index) => {
    const copy = [slide.eyebrow, slide.emphasis, slide.headline, slide.body, ...slide.bullets].filter(Boolean).join(" ");
    const normalized = copy.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    if (seen.has(normalized)) flags.push({ code: "duplicate_slide", severity: "blocking", message: `La placa ${index + 1} repite contenido de otra placa.` });
    seen.add(normalized);
    if (copy.length > 430) flags.push({ code: "dense_slide", severity: "warning", message: `La placa ${index + 1} tiene demasiado texto para una lectura rápida.` });
    if (!slide.alt_text) flags.push({ code: "missing_slide_alt", severity: "blocking", message: `La placa ${index + 1} necesita texto alternativo.` });
    if (slide.emphasis && preset !== "evidence") flags.push({ code: "invalid_emphasis", severity: "blocking", message: `El énfasis de la placa ${index + 1} sólo puede usarse con Puna Evidencia.` });
    for (const phrase of bannedPhrases) if (copy.toLowerCase().includes(phrase)) flags.push({ code: "carousel_cliche", severity: "warning", message: `Revisá “${phrase}” en la placa ${index + 1}.` });
    for (const token of numericTokens(copy)) {
      const supported = slide.evidence_refs.some((ref) => { const source = byKey.get(ref.source_key); return Boolean(source && ref.claim.toLowerCase().includes(token) && source.excerpt.toLowerCase().includes(token)); });
      if (!supported) flags.push({ code: "unsupported_slide_number", severity: "blocking", message: `La cifra “${token}” de la placa ${index + 1} no está respaldada.` });
    }
  });
  return flags.filter((flag, index, all) => all.findIndex((item) => item.code === flag.code && item.message === flag.message) === index);
}

export function carouselMaterial(slides: SocialCarouselSlide[], preset: VisualPreset, templateId: string | null, templateVersion = 1, visualConfig: unknown = {}) {
  return { preset, template_id: templateId, template_version: templateVersion, visual_config: visualConfig, slides: slides.map(({ id, ...slide }) => ({ id, ...slide })) };
}
