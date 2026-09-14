import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { createOperationsServiceClient } from "../lib/admin.server";
import { cloudinaryWebhookRunId, verifyCloudinaryWebhook } from "../lib/social-reels.server";

function response(status: number, body: Record<string, unknown>) {
  return data(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return response(405, { error: "method_not_allowed" });
  const rawBody = await request.text();
  if (rawBody.length > 200_000) return response(413, { error: "payload_too_large" });
  const signature = request.headers.get("X-Cld-Signature");
  const timestamp = request.headers.get("X-Cld-Timestamp");
  if (!verifyCloudinaryWebhook(rawBody, signature, timestamp)) return response(401, { error: "invalid_signature" });
  let payload: Record<string, any>;
  try { payload = JSON.parse(rawBody); } catch { return response(400, { error: "invalid_payload" }); }
  const runId = cloudinaryWebhookRunId(payload);
  if (!/^[0-9a-f-]{36}$/i.test(runId)) return response(400, { error: "missing_run_id" });
  const service = createOperationsServiceClient();
  const existing = await service.from("social_generation_runs").select("id,draft_id,status,request_hash,provider_metadata,content_distribution_drafts(media_urls,generation_metadata,reel_provider_metadata)").eq("id", runId).eq("operation", "reel_render").maybeSingle();
  if (!existing.data) return response(404, { error: "run_not_found" });
  if (existing.data.status === "succeeded") return response(200, { ok: true, duplicate: true });
  const eager = Array.isArray(payload.eager) ? payload.eager[0] : payload;
  const expectedTransformation = String(existing.data.provider_metadata?.transformation || "");
  const receivedTransformation = String(eager?.transformation || "");
  if (expectedTransformation && receivedTransformation && receivedTransformation !== expectedTransformation) return response(409, { error: "render_mismatch" });
  const providerStatus = String(eager?.status || payload.status || "").toLowerCase();
  const failed = Boolean(payload.error || eager?.error || providerStatus === "failed");
  const completed = ["success", "succeeded", "complete", "completed"].includes(providerStatus) || (Number(eager?.width) > 0 && Number(eager?.height) > 0 && Number(eager?.bytes) > 0);
  const succeeded = String(payload.notification_type || "").includes("eager") && !failed && completed;
  if (!succeeded) {
    await service.from("social_generation_runs").update({ status: "failed", provider_status: "failed", error_code: "cloudinary_render_failed", error_message: "No se pudo ensamblar el reel.", retryable: true, completed_at: new Date().toISOString() }).eq("id", runId).neq("status", "succeeded");
    return response(202, { ok: true });
  }
  const publicId = String(existing.data.provider_metadata.output_public_id || eager?.public_id || "");
  const video = { public_id: publicId, version: Number(eager?.version || payload.version || 0) || null, format: String(eager?.format || "mp4"), width: Number(eager?.width || 1080), height: Number(eager?.height || 1920), duration: Number(eager?.duration || 0), bytes: Number(eager?.bytes || 0), hash: existing.data.request_hash };
  const joined = Array.isArray(existing.data.content_distribution_drafts) ? existing.data.content_distribution_drafts[0] : existing.data.content_distribution_drafts;
  const updated = await service.from("content_distribution_drafts").update({ media_urls: { ...(joined?.media_urls || {}), video }, reel_provider_metadata: { ...(joined?.reel_provider_metadata || {}), render: { ...(joined?.reel_provider_metadata?.render || {}), status: "ready" } }, rendered_visual_hash: existing.data.request_hash, generation_metadata: { ...(joined?.generation_metadata || {}), media_stale: false, reel_render_run_id: runId } }).eq("id", existing.data.draft_id).select("id").maybeSingle();
  if (!updated.data) return response(409, { error: "draft_conflict" });
  await service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", provider_status: "ready", result_summary: { public_id: publicId, width: video.width, height: video.height, duration: video.duration, bytes: video.bytes }, completed_at: new Date().toISOString(), retryable: false }).eq("id", runId).neq("status", "succeeded");
  return response(200, { ok: true });
}
