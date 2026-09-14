import type { EvidenceSource, QualityFlag } from "./social-quality";

export type ReelSceneRole = "hook" | "problem" | "insight" | "cta";
export type SocialReelScene = {
  id: string;
  role: ReelSceneRole;
  duration_seconds: number;
  eyebrow: string;
  headline: string;
  supporting_text: string;
  emphasis: string | null;
  search_query: string;
  selected_candidate_key: string | null;
  evidence_refs: Array<{ claim: string; source_key: string }>;
  alt_text: string;
};

export type ReelClipCandidate = {
  key: string;
  scene_id: string;
  pexels_video_id: number;
  pexels_file_id: number;
  page_url: string;
  preview_url: string;
  creator_name: string;
  width: number;
  height: number;
  duration_seconds: number;
};

export type ReelImportedClip = {
  candidate_key: string;
  public_id: string;
  version: number | null;
  format: string;
  width: number;
  height: number;
  duration_seconds: number;
  bytes: number;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const expectedRoles: ReelSceneRole[] = ["hook", "problem", "insight", "insight", "cta"];
const allowedSceneKeys = new Set(["id", "role", "duration_seconds", "eyebrow", "headline", "supporting_text", "emphasis", "search_query", "selected_candidate_key", "evidence_refs", "alt_text"]);
const bannedPhrases = ["en la era digital", "revolucionar", "desbloquear", "el futuro es ahora", "soluciones innovadoras", "de vanguardia"];

export function parseReelScenes(value: unknown): SocialReelScene[] {
  if (!Array.isArray(value) || value.length !== 5) throw new Error("reel_scene_count");
  const scenes = value.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Object.keys(raw).some((key) => !allowedSceneKeys.has(key))) throw new Error("invalid_reel_scene");
    const item = raw as Record<string, unknown>;
    const evidence = Array.isArray(item.evidence_refs) ? item.evidence_refs.map((ref) => ({
      claim: String((ref as Record<string, unknown>)?.claim || "").trim(),
      source_key: String((ref as Record<string, unknown>)?.source_key || "").trim(),
    })) : [];
    const scene: SocialReelScene = {
      id: String(item.id || ""),
      role: String(item.role || "") as ReelSceneRole,
      duration_seconds: Number(item.duration_seconds),
      eyebrow: String(item.eyebrow || "").trim(),
      headline: String(item.headline || "").trim(),
      supporting_text: String(item.supporting_text || "").trim(),
      emphasis: item.emphasis == null || item.emphasis === "" ? null : String(item.emphasis).trim(),
      search_query: String(item.search_query || "").trim(),
      selected_candidate_key: item.selected_candidate_key == null || item.selected_candidate_key === "" ? null : String(item.selected_candidate_key),
      evidence_refs: evidence,
      alt_text: String(item.alt_text || "").trim(),
    };
    if (!uuidPattern.test(scene.id) || scene.role !== expectedRoles[index]) throw new Error("invalid_reel_scene");
    if (!Number.isInteger(scene.duration_seconds) || scene.duration_seconds < 3 || scene.duration_seconds > 6) throw new Error("invalid_reel_duration");
    if (scene.eyebrow.length > 40 || scene.headline.length < 1 || scene.headline.length > 72 || scene.supporting_text.length > 140 || (scene.emphasis?.length || 0) > 40) throw new Error("invalid_reel_text");
    if (scene.search_query.length < 2 || scene.search_query.length > 100 || scene.alt_text.length < 1 || scene.alt_text.length > 500) throw new Error("invalid_reel_metadata");
    if (!scene.evidence_refs.every((ref) => ref.claim.length >= 1 && ref.claim.length <= 500 && ref.source_key.length >= 1 && ref.source_key.length <= 200)) throw new Error("invalid_reel_evidence");
    return scene;
  });
  const total = scenes.reduce((sum, scene) => sum + scene.duration_seconds, 0);
  if (total < 15 || total > 30) throw new Error("invalid_reel_total_duration");
  if (new Set(scenes.map((scene) => scene.id)).size !== 5) throw new Error("duplicate_reel_scene_id");
  return scenes;
}

export function parseReelCandidates(value: unknown, sceneId: string): ReelClipCandidate[] {
  if (!Array.isArray(value) || value.length !== 3) throw new Error("reel_candidate_count");
  const seen = new Set<string>();
  return value.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("invalid_reel_candidate");
    const item = raw as Record<string, unknown>;
    const candidate: ReelClipCandidate = {
      key: String(item.key || ""), scene_id: String(item.scene_id || ""), pexels_video_id: Number(item.pexels_video_id), pexels_file_id: Number(item.pexels_file_id),
      page_url: String(item.page_url || ""), preview_url: String(item.preview_url || ""), creator_name: String(item.creator_name || ""),
      width: Number(item.width), height: Number(item.height), duration_seconds: Number(item.duration_seconds),
    };
    if (!/^[a-f0-9]{32,64}$/.test(candidate.key) || candidate.scene_id !== sceneId || seen.has(candidate.key)) throw new Error("invalid_reel_candidate");
    if (!Number.isInteger(candidate.pexels_video_id) || !Number.isInteger(candidate.pexels_file_id) || candidate.width <= 0 || candidate.height <= candidate.width || candidate.duration_seconds <= 0) throw new Error("invalid_reel_candidate");
    for (const url of [candidate.page_url, candidate.preview_url]) { const parsed = new URL(url); if (parsed.protocol !== "https:") throw new Error("invalid_reel_candidate"); }
    if (!candidate.creator_name.trim()) throw new Error("invalid_reel_candidate");
    seen.add(candidate.key);
    return candidate;
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

export function reelQualityFlags(scenes: SocialReelScene[], sources: EvidenceSource[], candidates: Record<string, ReelClipCandidate[]> = {}, imported: Record<string, ReelImportedClip> = {}): QualityFlag[] {
  const flags: QualityFlag[] = [];
  const byKey = new Map(sources.map((source) => [source.key, source]));
  const normalized = new Map<string, number>();
  scenes.forEach((scene, index) => {
    const copy = [scene.eyebrow, scene.headline, scene.supporting_text, scene.emphasis].filter(Boolean).join(" ");
    const comparable = copy.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    if (normalized.has(comparable)) flags.push({ code: "duplicate_reel_scene", severity: "blocking", message: `La escena ${index + 1} repite el contenido de la escena ${(normalized.get(comparable) || 0) + 1}.` });
    normalized.set(comparable, index);
    if (copy.length > 230) flags.push({ code: "dense_reel_scene", severity: "warning", message: `La escena ${index + 1} tiene demasiado texto para ${scene.duration_seconds} segundos.` });
    if (!scene.alt_text) flags.push({ code: "missing_reel_alt", severity: "blocking", message: `La escena ${index + 1} necesita texto alternativo.` });
    for (const phrase of bannedPhrases) if (copy.toLowerCase().includes(phrase)) flags.push({ code: "reel_cliche", severity: "warning", message: `Revisá “${phrase}” en la escena ${index + 1}.` });
    for (const token of numericTokens(copy)) {
      const supported = scene.evidence_refs.some((ref) => { const source = byKey.get(ref.source_key); return Boolean(source && ref.claim.toLowerCase().includes(token) && source.excerpt.toLowerCase().includes(token)); });
      if (!supported) flags.push({ code: "unsupported_reel_number", severity: "blocking", message: `La cifra “${token}” de la escena ${index + 1} no está respaldada.` });
    }
    if (!scene.selected_candidate_key) flags.push({ code: "missing_reel_clip", severity: "blocking", message: `Elegí un clip para la escena ${index + 1}.` });
    else {
      const candidate = (candidates[scene.id] || []).find((item) => item.key === scene.selected_candidate_key);
      if (!candidate || !imported[scene.id] || imported[scene.id].candidate_key !== candidate.key) flags.push({ code: "reel_clip_not_ready", severity: "blocking", message: `El clip de la escena ${index + 1} todavía no está importado.` });
    }
  });
  return flags.filter((flag, index, all) => all.findIndex((item) => item.code === flag.code && item.message === flag.message) === index);
}

export function reelDuration(scenes: SocialReelScene[]) { return scenes.reduce((sum, scene) => sum + scene.duration_seconds, 0); }

export function reelMaterial(scenes: SocialReelScene[], imported: Record<string, ReelImportedClip>) {
  return { kind: "reel", width: 1080, height: 1920, muted: true, scenes: scenes.map((scene) => ({ ...scene, imported_clip: imported[scene.id] || null })) };
}
