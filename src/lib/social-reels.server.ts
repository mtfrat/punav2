import { createHash, timingSafeEqual } from "node:crypto";
import { parseReelCandidates, parseReelScenes, type ReelClipCandidate, type ReelImportedClip, type SocialReelScene } from "./social-reels.ts";

type ReelProviderConfig = { pexelsKey: string; cloudName: string; cloudinaryKey: string; cloudinarySecret: string };

function configuration(): ReelProviderConfig {
  const publicNames = ["PEXELS_API_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
    .flatMap((name) => [`VITE_${name}`, `NEXT_PUBLIC_${name}`]);
  if (publicNames.some((name) => process.env[name])) throw new Error("unsafe_reels_configuration");
  const config = {
    pexelsKey: process.env.PEXELS_API_KEY?.trim() || "",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || "",
    cloudinaryKey: process.env.CLOUDINARY_API_KEY?.trim() || "",
    cloudinarySecret: process.env.CLOUDINARY_API_SECRET?.trim() || "",
  };
  if (Object.values(config).some((value) => !value)) throw new Error("reels_not_configured");
  return config;
}

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timeout) };
}

function sanitizeError(error: unknown, fallback: string) {
  if (error instanceof Error && ["reels_not_configured", "unsafe_reels_configuration", "pexels_rate_limited", "pexels_unavailable", "pexels_invalid_response", "cloudinary_rate_limited", "cloudinary_unavailable", "cloudinary_invalid_response"].includes(error.message)) return error;
  return new Error(fallback);
}

function selectPortraitFile(video: any) {
  const files = Array.isArray(video?.video_files) ? video.video_files.filter((file: any) => file?.file_type === "video/mp4" && Number(file.height) > Number(file.width) && /^https:\/\//.test(String(file.link || ""))) : [];
  return files.sort((left: any, right: any) => Math.abs(Number(left.width) - 1080) - Math.abs(Number(right.width) - 1080))[0] || null;
}

export async function searchReelClips(sceneId: string, query: string): Promise<{ candidates: ReelClipCandidate[]; sources: Record<string, string> }> {
  const { pexelsKey } = configuration();
  const timer = withTimeout(12_000);
  try {
    const url = new URL("https://api.pexels.com/v1/videos/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("size", "medium");
    url.searchParams.set("per_page", "12");
    const response = await fetch(url, { headers: { Authorization: pexelsKey }, signal: timer.signal, cache: "no-store" });
    if (response.status === 429) throw new Error("pexels_rate_limited");
    if (!response.ok) throw new Error("pexels_unavailable");
    const payload = await response.json().catch(() => null);
    const selected = (Array.isArray(payload?.videos) ? payload.videos : []).flatMap((video: any) => {
      const file = selectPortraitFile(video);
      if (!file || !Number.isFinite(Number(video.duration)) || Number(video.duration) < 3) return [];
      const key = createHash("sha256").update(`${sceneId}:${video.id}:${file.id}`).digest("hex");
      return [{ key, scene_id: sceneId, pexels_video_id: Number(video.id), pexels_file_id: Number(file.id), page_url: String(video.url), preview_url: String(file.link), creator_name: String(video.user?.name || "Pexels"), width: Number(file.width), height: Number(file.height), duration_seconds: Number(video.duration) }];
    }).slice(0, 3);
    const candidates = parseReelCandidates(selected, sceneId);
    const sources = Object.fromEntries(selected.map((candidate: ReelClipCandidate, index: number) => [candidate.key, String((payload.videos || []).find((video: any) => Number(video.id) === candidate.pexels_video_id)?.video_files?.find((file: any) => Number(file.id) === candidate.pexels_file_id)?.link || "")]));
    if (Object.values(sources).some((value) => !/^https:\/\//.test(value))) throw new Error("pexels_invalid_response");
    return { candidates, sources };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("pexels_timeout");
    throw sanitizeError(error, "pexels_invalid_response");
  } finally { timer.done(); }
}

function cloudinarySignature(params: Record<string, string | number>, secret: string) {
  const excluded = new Set(["file", "cloud_name", "resource_type", "api_key"]);
  const material = Object.entries(params).filter(([key, value]) => value !== "" && !excluded.has(key)).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return createHash("sha256").update(`${material}${secret}`).digest("hex");
}

async function cloudinaryForm(endpoint: string, params: Record<string, string | number>, timeoutMs = 45_000) {
  const config = configuration();
  const timestamp = Math.floor(Date.now() / 1000);
  const signed = { ...params, timestamp };
  const body = new FormData();
  for (const [key, value] of Object.entries(signed)) body.set(key, String(value));
  body.set("api_key", config.cloudinaryKey);
  body.set("signature", cloudinarySignature(signed, config.cloudinarySecret));
  const timer = withTimeout(timeoutMs);
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/${endpoint}`, { method: "POST", body, signal: timer.signal });
    const payload = await response.json().catch(() => null);
    if (response.status === 429) throw new Error("cloudinary_rate_limited");
    if (!response.ok) throw new Error("cloudinary_unavailable");
    if (!payload || typeof payload !== "object") throw new Error("cloudinary_invalid_response");
    return payload as Record<string, any>;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("cloudinary_timeout");
    throw sanitizeError(error, "cloudinary_invalid_response");
  } finally { timer.done(); }
}

export async function importReelClip(input: { campaignId: string; draftId: string; scene: SocialReelScene; candidate: ReelClipCandidate; sourceUrl: string }): Promise<ReelImportedClip> {
  if (!input.sourceUrl.startsWith("https://")) throw new Error("invalid_pexels_source");
  const publicId = `puna/reels/${input.campaignId}/${input.draftId}/sources/${input.scene.id}-${input.candidate.key.slice(0, 12)}`;
  const payload = await cloudinaryForm("video/upload", { file: input.sourceUrl, public_id: publicId, type: "authenticated", overwrite: "true" });
  if (!payload.public_id || !payload.format || Number(payload.width) <= 0 || Number(payload.height) <= 0 || Number(payload.duration) <= 0) throw new Error("cloudinary_invalid_response");
  return { candidate_key: input.candidate.key, public_id: String(payload.public_id), version: Number.isFinite(Number(payload.version)) ? Number(payload.version) : null, format: String(payload.format), width: Number(payload.width), height: Number(payload.height), duration_seconds: Number(payload.duration), bytes: Number(payload.bytes || 0) };
}

function escapeCloudinaryText(value: string) {
  return encodeURIComponent(value.replace(/[,%/]/g, " ").replace(/\s+/g, " ").trim());
}

export function reelTransformation(scenes: SocialReelScene[], imported: Record<string, ReelImportedClip>) {
  const valid = parseReelScenes(scenes);
  const clipChain = valid.map((scene, index) => {
    const clip = imported[scene.id];
    if (!clip) throw new Error("reel_clip_not_ready");
    // Cloudinary rejects multiple g_auto operations in one spliced video transformation.
    const base = `c_fill,g_center,h_1920,w_1080,du_${scene.duration_seconds},e_volume:mute`;
    if (index === 0) return base;
    return `fl_splice,l_video:authenticated:${clip.public_id.replace(/\//g, ":")}/${base}/fl_layer_apply`;
  }).join("/");
  let start = 0;
  const timedText = valid.flatMap((scene) => {
    const end = start + scene.duration_seconds;
    const timing = `so_${start},eo_${end}`;
    const layers = [
      ...(scene.eyebrow ? [`l_text:Arial_32_bold:${escapeCloudinaryText(scene.eyebrow.toUpperCase())},co_rgb:F7EFE2/fl_layer_apply,g_north_west,x_90,y_210,${timing}`] : []),
      `l_text:Arial_74_bold:${escapeCloudinaryText(scene.headline)},co_rgb:F7EFE2,c_fit,w_900/fl_layer_apply,g_center,y_-40,${timing}`,
      ...(scene.supporting_text ? [`l_text:Arial_38:${escapeCloudinaryText(scene.supporting_text)},co_rgb:F7EFE2,c_fit,w_900/fl_layer_apply,g_south,y_260,${timing}`] : []),
    ];
    start = end;
    return layers;
  }).join("/");
  return `${clipChain}/${timedText}/l_text:Arial_26_bold:PUNA%20TECH,co_rgb:FF6B00/fl_layer_apply,g_south_east,x_70,y_70/e_volume:mute`;
}

export async function startReelRender(input: { campaignId: string; draftId: string; runId: string; visualHash: string; scenes: SocialReelScene[]; imported: Record<string, ReelImportedClip>; notificationUrl: string }) {
  const first = input.imported[input.scenes[0]?.id];
  if (!first) throw new Error("reel_clip_not_ready");
  const fullTransformation = `${reelTransformation(input.scenes, input.imported)}/f_mp4,vc_h264,ac_none`;
  const name = `puna_reel_${createHash("sha256").update(fullTransformation).digest("hex").slice(0, 32)}`;
  const config = configuration();
  const timer = withTimeout(15_000);
  try {
    const body = new URLSearchParams({ transformation: fullTransformation });
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/transformations/${name}`, {
      method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${config.cloudinaryKey}:${config.cloudinarySecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body, signal: timer.signal,
    });
    if (!response.ok && response.status !== 409) {
      console.error("reel_named_transformation_failed", { status: response.status, length: fullTransformation.length });
      throw new Error("cloudinary_unavailable");
    }
  } finally { timer.done(); }
  const eager = `t_${name}`;
  const payload = await cloudinaryForm("video/explicit", { public_id: first.public_id, type: "authenticated", eager, eager_async: "true", eager_notification_url: input.notificationUrl, context: `run_id=${input.runId}` }, 30_000);
  const batchId = String(payload.batch_id || "");
  const eagerItems = Array.isArray(payload.eager) ? payload.eager : [];
  console.info("reel_render_requested", { has_batch_id: Boolean(batchId), eager_count: eagerItems.length, status: String(payload.status || ""), eager: eagerItems.map((item: Record<string, any>) => ({ status: String(item.status || ""), format: String(item.format || ""), bytes: Number(item.bytes || 0), width: Number(item.width || 0), height: Number(item.height || 0), has_url: Boolean(item.secure_url || item.url), error_code: String(item.error?.code || ""), error_message: String(item.error?.message || "").slice(0, 300) })) });
  const eagerItem = eagerItems[0];
  const eagerStatus = String(eagerItem?.status || "").toLowerCase();
  if (eagerItem?.error || eagerStatus === "failed") throw new Error("cloudinary_render_failed");
  if (!batchId && !(eagerStatus === "processing" && (eagerItem.secure_url || eagerItem.url))) throw new Error("cloudinary_invalid_response");
  return { externalJobId: batchId || null, providerStatus: String(payload.status || eagerStatus || "processing"), publicId: first.public_id, transformation: eager };
}

export async function reelResource(publicId: string, transformation: string) {
  const config = configuration();
  const timer = withTimeout(15_000);
  try {
    const url = new URL(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/resources/video/authenticated/${encodeURIComponent(publicId)}`);
    url.searchParams.set("derived", "true");
    const response = await fetch(url, { headers: { Authorization: `Basic ${Buffer.from(`${config.cloudinaryKey}:${config.cloudinarySecret}`).toString("base64")}` }, signal: timer.signal, cache: "no-store" });
    if (!response.ok) throw new Error("cloudinary_unavailable");
    const payload = await response.json() as Record<string, any>;
    const derived = Array.isArray(payload.derived)
      ? payload.derived.find((item: Record<string, unknown>) => item.transformation === transformation && String(item.format || "") === "mp4")
      : null;
    if (!derived) {
      console.info("reel_derived_not_ready", { derived_count: Array.isArray(payload.derived) ? payload.derived.length : 0, mp4_count: Array.isArray(payload.derived) ? payload.derived.filter((item: Record<string, unknown>) => item.format === "mp4").length : 0 });
      return null;
    }
    return { ...derived, public_id: publicId, format: "mp4" } as Record<string, any>;
  } finally { timer.done(); }
}

export function cloudinaryWebhookRunId(payload: Record<string, any>, fallback = "") {
  if (payload?.context?.custom?.run_id) return String(payload.context.custom.run_id);
  if (typeof payload?.context === "string") {
    const params = new URLSearchParams(payload.context.replace(/\|/g, "&"));
    const value = params.get("run_id");
    if (value) return value;
  }
  return String(payload?.run_id || fallback);
}

export function cloudinaryWebhookBatchId(payload: Record<string, any>) {
  return String(payload?.batch_id || payload?.eager?.batch_id || "");
}

export function verifyCloudinaryWebhook(rawBody: string, signature: string | null, timestampValue: string | null, nowSeconds = Math.floor(Date.now() / 1000)) {
  const { cloudinarySecret } = configuration();
  const timestamp = Number(timestampValue);
  if (!signature || !Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 2 * 60 * 60) return false;
  const algorithm = signature.length === 40 ? "sha1" : signature.length === 64 ? "sha256" : null;
  if (!algorithm || !/^[0-9a-f]+$/i.test(signature)) return false;
  const expected = createHash(algorithm).update(`${rawBody}${timestamp}${cloudinarySecret}`).digest("hex");
  const left = Buffer.from(signature, "hex"); const right = Buffer.from(expected, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function signedCloudinaryDownload(publicId: string, format = "mp4", transformation = "", nowSeconds = Math.floor(Date.now() / 1000)) {
  const config = configuration();
  const signed: Record<string, string | number> = { public_id: publicId, format, type: "authenticated", timestamp: nowSeconds, expires_at: nowSeconds + 600, attachment: "false" };
  if (transformation) signed.transformation = transformation;
  const query = new URLSearchParams(Object.entries({ ...signed, api_key: config.cloudinaryKey, signature: cloudinarySignature(signed, config.cloudinarySecret) }).map(([key, value]) => [key, String(value)]));
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/video/download?${query}`;
}
