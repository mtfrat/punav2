import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { createOperationsServiceClient } from "../lib/admin.server";
import { cloudinaryWebhookBatchId, cloudinaryWebhookRunId, verifyCloudinaryWebhook } from "../lib/social-reels.server";

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
  const runId = cloudinaryWebhookRunId(payload, new URL(request.url).searchParams.get("run_id") || "");
  const batchId = cloudinaryWebhookBatchId(payload);
  console.info("reel_webhook_received", { has_query_run_id: Boolean(new URL(request.url).searchParams.get("run_id")), run_id: runId, has_batch_id: Boolean(batchId), notification_type: String(payload.notification_type || ""), status: String(payload.status || ""), eager_status: String(Array.isArray(payload.eager) ? payload.eager[0]?.status || "" : ""), has_error: Boolean(payload.error || (Array.isArray(payload.eager) && payload.eager[0]?.error)) });
  if (!/^[0-9a-f-]{36}$/i.test(runId) && !batchId) return response(400, { error: "missing_run_id" });
  const service = createOperationsServiceClient();
  const existing = await service.from("social_generation_runs").select("id,draft_id,status,request_hash,external_job_id,provider_metadata,content_distribution_drafts(media_urls,generation_metadata,reel_provider_metadata)").eq(/^[0-9a-f-]{36}$/i.test(runId) ? "id" : "external_job_id", /^[0-9a-f-]{36}$/i.test(runId) ? runId : batchId).eq("operation", "reel_render").maybeSingle();
  if (!existing.data) { console.warn("reel_webhook_run_not_found", { run_id: runId, has_batch_id: Boolean(batchId), lookup_error: Boolean(existing.error) }); return response(404, { error: "run_not_found" }); }
  if (existing.data.status === "succeeded") return response(200, { ok: true, duplicate: true });
  if (batchId && existing.data.external_job_id && existing.data.external_job_id !== batchId) return response(200, { ok: true, stale: true });
  const joined = Array.isArray(existing.data.content_distribution_drafts) ? existing.data.content_distribution_drafts[0] : existing.data.content_distribution_drafts;
  if (joined?.reel_provider_metadata?.render?.run_id !== existing.data.id) return response(200, { ok: true, stale: true });
  const eager = Array.isArray(payload.eager) ? payload.eager[0] : payload;
  const expectedTransformation = String(existing.data.provider_metadata?.transformation || "");
  const receivedTransformation = String(eager?.transformation || "");
  if (expectedTransformation && receivedTransformation && receivedTransformation !== expectedTransformation) return response(409, { error: "render_mismatch" });
  const providerStatus = String(eager?.status || payload.status || "").toLowerCase();
  const failed = Boolean(payload.error || eager?.error || providerStatus === "failed");
  const completed = ["success", "succeeded", "complete", "completed"].includes(providerStatus) || (Number(eager?.width) > 0 && Number(eager?.height) > 0 && Number(eager?.bytes) > 0);
  const succeeded = String(payload.notification_type || "").includes("eager") && !failed && completed;
  if (!succeeded) {
    await service.from("social_generation_runs").update({ status: "failed", provider_status: "failed", error_code: "cloudinary_render_failed", error_message: "No se pudo ensamblar el reel.", retryable: true, completed_at: new Date().toISOString() }).eq("id", existing.data.id).neq("status", "succeeded");
    return response(200, { ok: true });
  }
  const publicId = String(existing.data.provider_metadata.output_public_id || eager?.public_id || "");
  const video = { public_id: publicId, version: Number(eager?.version || payload.version || 0) || null, format: String(eager?.format || "mp4"), width: Number(eager?.width || 1080), height: Number(eager?.height || 1920), duration: Number(eager?.duration || 0), bytes: Number(eager?.bytes || 0), hash: existing.data.request_hash };
  const updated = await service.from("content_distribution_drafts").update({ media_urls: { ...(joined?.media_urls || {}), video }, reel_provider_metadata: { ...(joined?.reel_provider_metadata || {}), render: { ...(joined?.reel_provider_metadata?.render || {}), status: "ready" } }, rendered_visual_hash: existing.data.request_hash, generation_metadata: { ...(joined?.generation_metadata || {}), media_stale: false, reel_render_run_id: existing.data.id } }).eq("id", existing.data.draft_id).select("id").maybeSingle();
  if (!updated.data) return response(409, { error: "draft_conflict" });
  await service.from("social_generation_runs").update({ status: "succeeded", stage: "complete", provider_status: "ready", result_summary: { public_id: publicId, width: video.width, height: video.height, duration: video.duration, bytes: video.bytes }, completed_at: new Date().toISOString(), retryable: false }).eq("id", existing.data.id).neq("status", "succeeded");
  return response(200, { ok: true });
}
