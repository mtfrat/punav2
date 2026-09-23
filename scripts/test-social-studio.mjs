import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  SOCIAL_CHANNEL_LIMITS,
  canTransitionSocialDraft,
  countSocialCharacters,
  deriveSocialCampaignStatus,
  validateRejectionReason,
  validateSocialContent,
  composeSocialContent,
  parseHashtags,
  validateOperatorPerspective,
  visibleOpening,
  isAllowedManualPublicationUrl,
  shouldInvalidateSocialMedia,
} from "../src/lib/social-studio.ts";
import { buildChatRepairPrompt, buildChatSystemPrompt, chatReplyNeedsRepair } from "../src/lib/chat-prompt.ts";
import { blockingQualityMessage, deterministicQualityFlags, duplicateMatches, duplicateQualityFlags, normalizeSocialCopy, socialCopySimilarity } from "../src/lib/social-quality.ts";
import { buildRunTelemetry } from "../src/lib/social-observability.server.ts";
import { carouselMaterial, carouselQualityFlags, parseCarouselSlides } from "../src/lib/social-visual.ts";
import { parseReelCandidates, parseReelScenes, reelDuration, reelMaterial, reelQualityFlags } from "../src/lib/social-reels.ts";
import { cloudinaryWebhookBatchId, cloudinaryWebhookRunId, reelTransformation, signedCloudinaryDownload, startReelRender, verifyCloudinaryWebhook } from "../src/lib/social-reels.server.ts";
import {
  addCalendarDays,
  calendarDateTimeInput,
  calendarLocalToUtc,
  calendarWeekDays,
  calendarWeekRange,
  calendarWeekStart,
  isSafeCalendarReturnTo,
} from "../src/lib/social-calendar.ts";

assert.equal(deriveSocialCampaignStatus(["draft", "approved"]), "draft");
assert.equal(deriveSocialCampaignStatus(["rejected", "draft"]), "rejected");
assert.equal(deriveSocialCampaignStatus(["approved", "published"]), "approved");
assert.equal(deriveSocialCampaignStatus(["scheduled", "published"]), "scheduled");
assert.equal(deriveSocialCampaignStatus(["approved", "scheduled"]), "approved");
assert.equal(deriveSocialCampaignStatus(["published", "published"]), "published");
assert.equal(deriveSocialCampaignStatus(["archived", "archived"]), "archived");

assert.equal(canTransitionSocialDraft("draft", "approved"), true);
assert.equal(canTransitionSocialDraft("approved", "published"), true);
assert.equal(canTransitionSocialDraft("approved", "scheduled"), true);
assert.equal(canTransitionSocialDraft("scheduled", "approved"), true);
assert.equal(canTransitionSocialDraft("scheduled", "rejected"), true);
assert.equal(canTransitionSocialDraft("published", "draft"), false);
assert.equal(canTransitionSocialDraft("archived", "approved"), false);

assert.equal(countSocialCharacters("cafe\u0301"), 4);
assert.equal(validateSocialContent("x", "x".repeat(SOCIAL_CHANNEL_LIMITS.x)), null);
assert.match(validateSocialContent("x", "x".repeat(SOCIAL_CHANNEL_LIMITS.x + 1)) || "", /280/);
assert.match(validateSocialContent("linkedin", "   ") || "", /vacío/);
assert.equal(validateRejectionReason("Motivo suficientemente claro"), null);
assert.match(validateRejectionReason("corto") || "", /10/);
assert.deepEqual(parseHashtags("#IA, automatización #IA ventas! seguimiento comercial", "linkedin"), ["IA", "automatizacion", "ventas", "seguimiento", "comercial"]);
assert.deepEqual(parseHashtags("#IA #ventas #extra", "x"), ["IA", "ventas"]);
assert.equal(composeSocialContent({ hook: "Gancho", hashtags: ["IA", "#ventas"] }), "Gancho\n\n#IA #ventas");
assert.match(validateOperatorPerspective("muy breve") || "", /20/);
assert.equal(validateOperatorPerspective("Las excepciones necesitan una persona responsable."), null);
assert.equal(visibleOpening("a".repeat(240)).length, 210);
assert.equal(isAllowedManualPublicationUrl("https://www.linkedin.com/posts/example"), true);
assert.equal(isAllowedManualPublicationUrl("https://evil.test/linkedin.com"), false);
const renderedVariant = { media_strategy: "puna_editorial", media_urls: { primary: { output_path: "campaign/image.png" } }, hook: "Gancho", body: "Cuerpo", cta: "Leé más", hashtags: ["IA"], image_headline: "Título visual", image_alt: "Descripción" };
assert.equal(shouldInvalidateSocialMedia(renderedVariant, { ...renderedVariant, hook: "Gancho editado" }), true);
assert.equal(shouldInvalidateSocialMedia(renderedVariant, { ...renderedVariant }), false);
assert.equal(shouldInvalidateSocialMedia({ ...renderedVariant, media_strategy: "text_only" }, { ...renderedVariant, media_strategy: "text_only", hook: "Gancho editado" }), false);
for (const locale of ["es", "en"]) {
  const prompt = buildChatSystemPrompt(locale);
  assert.match(prompt, /initial|inicial/i);
  assert.match(prompt, /software/i);
  assert.match(prompt, /one useful question|una sola pregunta útil/i);
  assert.match(prompt, /prices|precios/i);
  assert.match(buildChatRepairPrompt(locale), /Rewrite|Reescrib/i);
}
assert.equal(chatReplyNeedsRepair("El problema parece estar en el traspaso manual. Una integración es el enfoque probable porque mantiene una sola fuente de verdad. ¿Qué CRM usás hoy?", "es"), false);
assert.equal(chatReplyNeedsRepair("El problema parece estar en el traspaso manual. Una integración es el enfoque probable porque mantiene una sola fuente de verdad. ¿Qué CRM utilizas y qué formularios tienes?", "es"), true);
assert.equal(chatReplyNeedsRepair("The handoff appears to be the bottleneck. Integration is the likely approach because it can keep one source of truth. Which CRM is in use today?", "en"), false);
assert.equal(chatReplyNeedsRepair("Which CRM is in use?", "en"), true);

assert.equal(calendarWeekStart("2027-01-01"), "2026-12-28");
assert.deepEqual(calendarWeekDays("2026-12-28"), ["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03"]);
assert.equal(addCalendarDays("2026-12-31", 1), "2027-01-01");
assert.equal(calendarLocalToUtc("2026-09-07T09:00").toISOString(), "2026-09-07T12:00:00.000Z");
assert.equal(calendarDateTimeInput("2026-09-07T12:00:00.000Z"), "2026-09-07T09:00");
assert.deepEqual(calendarWeekRange("2026-09-07"), { from: "2026-09-07T03:00:00.000Z", to: "2026-09-14T03:00:00.000Z" });
assert.throws(() => calendarLocalToUtc("2026-09-07T09:07"), /invalid_calendar_datetime/);
assert.equal(isSafeCalendarReturnTo("/ops/calendar?view=week&variant=abc"), true);
assert.equal(isSafeCalendarReturnTo("//evil.test/ops/calendar"), false);

const quantitativeVariant = { channel: "linkedin", locale: "es", hook: "Reducimos 30% del trabajo manual", body: "Un proceso verificable.", cta: "Hablemos.", hashtags: [], image_headline: "30% menos trabajo manual", image_alt: "Gráfico editorial", evidence_refs: [], quality_flags: [], generation_notes: [] };
assert.match(blockingQualityMessage(deterministicQualityFlags(quantitativeVariant, [], "puna_editorial")) || "", /30%/);
quantitativeVariant.evidence_refs = [{ claim: "Reducimos 30% del trabajo manual", source_key: "source-1" }];
assert.equal(blockingQualityMessage(deterministicQualityFlags(quantitativeVariant, [{ key: "source-1", title: "Caso", excerpt: "Se redujo 30% del trabajo manual." }], "puna_editorial")), null);
const identifierVariant = { ...quantitativeVariant, hook: "Equipos B2B", body: "Trabajo operativo respaldado. [manual-1]", image_headline: "Seguimiento B2B", evidence_refs: [] };
assert.equal(blockingQualityMessage(deterministicQualityFlags(identifierVariant, [], "text_only")), null);
for (const value of ["30%", "US$ 500", "3.6", "15 minutos", "2x"]) {
  const unsupported = { ...identifierVariant, body: `Resultado: ${value}.` };
  assert.match(blockingQualityMessage(deterministicQualityFlags(unsupported, [], "text_only")) || "", new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
}
assert.equal(normalizeSocialCopy("¡Automatización! https://puna-tech.com #IA"), "automatizacion ia");
assert.equal(socialCopySimilarity("uno dos tres cuatro", "uno dos tres cuatro"), 1);
const duplicateCandidates = [{ id: "other", campaignId: "campaign", campaignTitle: "Otra campaña", channel: "instagram", content: "Un proceso claro reduce errores operativos", occurredAt: "2026-09-01T00:00:00Z" }];
const exactMatches = duplicateMatches("Un proceso claro reduce errores operativos", duplicateCandidates);
assert.equal(exactMatches[0].exact, true);
assert.equal(blockingQualityMessage(duplicateQualityFlags(exactMatches)), "El copy es idéntico a “Otra campaña” (instagram).");
assert.equal(duplicateMatches("Texto completamente diferente", duplicateCandidates).length, 0);
assert.match(blockingQualityMessage(deterministicQualityFlags(quantitativeVariant, [{ key: "source-1", title: "Caso", excerpt: "Se redujo 30% del trabajo manual." }], "puna_editorial", { ctaType: "article", ctaUrl: null })) || "", /HTTPS/);
const localeFlags = deterministicQualityFlags({ ...identifierVariant, body: "Os recomendamos ordenar vuestro proceso." }, [], "text_only");
assert.equal(localeFlags.some((flag) => flag.code === "locale_mismatch"), true);
const densityFlags = deterministicQualityFlags({ ...identifierVariant, image_headline: "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece" }, [], "puna_editorial");
assert.equal(densityFlags.some((flag) => flag.code === "visual_density"), true);
assert.match(blockingQualityMessage(deterministicQualityFlags({ ...identifierVariant, cta: "Comentá qué pensás" }, [], "text_only")) || "", /CTA genérico/);

const slide = (id, role, headline) => ({ id, role, eyebrow: "Sistema", headline, body: "Una explicación breve y operativa.", bullets: [], emphasis: null, evidence_refs: [], asset_id: null, alt_text: `Placa: ${headline}` });
const carousel = [
  slide("00000000-0000-4000-8000-000000000001", "cover", "Un sistema editorial claro"),
  slide("00000000-0000-4000-8000-000000000002", "content", "Separá creación y aprobación"),
  slide("00000000-0000-4000-8000-000000000003", "cta", "Revisá el próximo paso"),
];
assert.equal(parseCarouselSlides(carousel).length, 3);
assert.throws(() => parseCarouselSlides(carousel.slice(0, 2)), /carousel_slide_count/);
assert.throws(() => parseCarouselSlides([...carousel, ...carousel, ...carousel].slice(0, 8)), /carousel_slide_count/);
assert.throws(() => parseCarouselSlides(carousel.map((item, index) => index === 0 ? { ...item, role: "content" } : item)), /invalid_carousel_slide/);
assert.throws(() => parseCarouselSlides(carousel.map((item, index) => index === 1 ? { ...item, alt_text: "" } : item)), /invalid_carousel_slide/);
assert.throws(() => parseCarouselSlides([...carousel, { ...carousel[2], id: "00000000-0000-4000-8000-000000000004", role: "extra" }]), /invalid_carousel_slide/);
assert.throws(() => parseCarouselSlides(carousel.map((item, index) => index === 1 ? { ...item, unexpected: true } : item)), /invalid_carousel_slide/);
assert.match(blockingQualityMessage(carouselQualityFlags(carousel.map((item, index) => index === 1 ? { ...item, body: "El proceso mejora 30%." } : item), [], "system")) || "", /30%/);
const supportedCarousel = carousel.map((item, index) => index === 1 ? { ...item, body: "El proceso mejora 30%.", evidence_refs: [{ claim: "El proceso mejora 30%.", source_key: "source-1" }] } : item);
assert.equal(blockingQualityMessage(carouselQualityFlags(supportedCarousel, [{ key: "source-1", title: "Caso", excerpt: "El proceso mejora 30%." }], "system")), null);
assert.equal(carouselMaterial(carousel, "system", "00000000-0000-4000-8000-000000000099").slides.length, 3);

const reelScenes = ["hook", "problem", "insight", "insight", "cta"].map((role, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, role, duration_seconds: 4, eyebrow: "Sistema",
  headline: ["Una apertura operativa", "El problema visible", "Una decisión concreta", "El siguiente criterio", "Una acción clara"][index], supporting_text: "Una idea breve y concreta.", emphasis: null, search_query: `business operations scene ${["hook","problem","process","decision","action"][index]}`,
  selected_candidate_key: "a".repeat(63) + index, evidence_refs: [], alt_text: `Video vertical para escena ${index + 1}`,
}));
assert.equal(parseReelScenes(reelScenes).length, 5);
assert.equal(reelDuration(reelScenes), 20);
assert.throws(() => parseReelScenes(reelScenes.slice(0, 4)), /reel_scene_count/);
assert.throws(() => parseReelScenes(reelScenes.map((item, index) => index === 1 ? { ...item, duration_seconds: 2 } : item)), /invalid_reel_duration/);
assert.throws(() => parseReelScenes(reelScenes.map((item, index) => index === 4 ? { ...item, headline: "x".repeat(73) } : item)), /invalid_reel_text/);
const reelCandidates = Object.fromEntries(reelScenes.map((scene, sceneIndex) => [scene.id, [0, 1, 2].map((candidateIndex) => ({
  key: candidateIndex === 0 ? scene.selected_candidate_key : `${String(sceneIndex + 1)}${String(candidateIndex + 1)}`.padEnd(64, "a"), scene_id: scene.id, pexels_video_id: sceneIndex * 10 + candidateIndex + 1,
  pexels_file_id: sceneIndex * 10 + candidateIndex + 101, page_url: "https://www.pexels.com/video/example", preview_url: "https://images.pexels.com/videos/example.jpeg",
  creator_name: "Pexels creator", width: 1080, height: 1920, duration_seconds: 12,
}))]));
for (const scene of reelScenes) assert.equal(parseReelCandidates(reelCandidates[scene.id], scene.id).length, 3);
assert.throws(() => parseReelCandidates(reelCandidates[reelScenes[0].id].map((candidate, index) => index === 0 ? { ...candidate, preview_url: "http://unsafe.test/video.mp4" } : candidate), reelScenes[0].id), /invalid_reel_candidate/);
const importedClips = Object.fromEntries(reelScenes.map((scene) => [scene.id, { candidate_key: scene.selected_candidate_key, public_id: `puna/reels/${scene.id}`, version: 1, format: "mp4", width: 1080, height: 1920, duration_seconds: 12, bytes: 1000 }]));
assert.equal(blockingQualityMessage(reelQualityFlags(reelScenes, [], reelCandidates, importedClips)), null);
assert.match(blockingQualityMessage(reelQualityFlags(reelScenes.map((scene, index) => index === 2 ? { ...scene, headline: "Mejora 30%" } : scene), [], reelCandidates, importedClips)) || "", /30%/);
assert.equal(reelMaterial(reelScenes, importedClips).muted, true);
const transformation = reelTransformation(reelScenes, importedClips);
assert.match(transformation, /e_volume:mute/);
assert.match(transformation, /fl_splice/);
assert.match(transformation, /fl_splice,l_video:authenticated:[^/]+\/[^/]+\/fl_layer_apply/);
assert.doesNotMatch(transformation, /fl_layer_apply,fl_splice/);
assert.ok(transformation.length > 1024, "Five-scene transformation must be shortened before requesting a Cloudinary derivative");
assert.doesNotMatch(transformation, /audio_codec/);
assert.match(transformation, /l_video:authenticated:/);
process.env.PEXELS_API_KEY = "pexels-test";
process.env.CLOUDINARY_CLOUD_NAME = "puna-test";
process.env.CLOUDINARY_API_KEY = "cloudinary-test";
process.env.CLOUDINARY_API_SECRET = "secret-test";
const originalFetch = globalThis.fetch;
const renderRequests = [];
globalThis.fetch = async (url, options) => {
  renderRequests.push({ url: String(url), options });
  if (String(url).includes("/transformations/")) return new Response(JSON.stringify({ error: { message: "Already exists" } }), { status: 409 });
  return Response.json({ batch_id: "reel-batch-1", status: "processing" });
};
try {
  const startedReel = await startReelRender({ campaignId: "campaign", draftId: "draft", runId: "00000000-0000-4000-8000-000000000001", visualHash: "visual", scenes: reelScenes, imported: importedClips, notificationUrl: "https://puna-tech.com/api/webhooks/cloudinary/reel-render" });
  assert.equal(startedReel.externalJobId, "reel-batch-1");
  assert.match(startedReel.transformation, /^t_puna_reel_[0-9a-f]{32}$/);
  assert.equal(renderRequests.length, 2);
  assert.equal(renderRequests[0].options.method, "POST");
  assert.match(String(renderRequests[0].options.body), /transformation=/);
  assert.equal(renderRequests[1].options.body.get("eager"), startedReel.transformation);
  assert.equal(renderRequests[1].options.body.get("eager_async"), "true");
  assert.equal(renderRequests[1].options.body.get("type"), "authenticated");
  assert.equal(renderRequests[1].options.body.get("context"), "run_id=00000000-0000-4000-8000-000000000001");
  globalThis.fetch = async (url) => String(url).includes("/transformations/") ? Response.json({ message: "created" }) : Response.json({ eager: [{ status: "processing", secure_url: "https://res.cloudinary.com/puna-test/video/authenticated/reel.mp4" }] });
  const processingReel = await startReelRender({ campaignId: "campaign", draftId: "draft", runId: "00000000-0000-4000-8000-000000000001", visualHash: "visual", scenes: reelScenes, imported: importedClips, notificationUrl: "https://puna-tech.com/api/webhooks/cloudinary/reel-render?run_id=00000000-0000-4000-8000-000000000001" });
  assert.equal(processingReel.externalJobId, null);
  assert.equal(processingReel.providerStatus, "processing");
  globalThis.fetch = async (url) => String(url).includes("/transformations/") ? Response.json({ message: "created" }) : Response.json({ asset_id: "not-a-batch" });
  await assert.rejects(() => startReelRender({ campaignId: "campaign", draftId: "draft", runId: "00000000-0000-4000-8000-000000000001", visualHash: "visual", scenes: reelScenes, imported: importedClips, notificationUrl: "https://puna-tech.com/api/webhooks/cloudinary/reel-render" }), /cloudinary_invalid_response/);
} finally { globalThis.fetch = originalFetch; }
const webhookBody = JSON.stringify({ run_id: "00000000-0000-4000-8000-000000000001" });
const webhookTimestamp = 2_000_000_000;
const webhookSignature = createHash("sha256").update(`${webhookBody}${webhookTimestamp}secret-test`).digest("hex");
assert.equal(verifyCloudinaryWebhook(webhookBody, webhookSignature, String(webhookTimestamp), webhookTimestamp), true);
const sha1WebhookSignature = createHash("sha1").update(`${webhookBody}${webhookTimestamp}secret-test`).digest("hex");
assert.equal(verifyCloudinaryWebhook(webhookBody, sha1WebhookSignature, String(webhookTimestamp), webhookTimestamp), true);
assert.equal(verifyCloudinaryWebhook(`${webhookBody}x`, webhookSignature, String(webhookTimestamp), webhookTimestamp), false);
assert.equal(verifyCloudinaryWebhook(webhookBody, "xyz", String(webhookTimestamp), webhookTimestamp), false);
const retriedTimestamp = webhookTimestamp - 9 * 60;
const retriedSignature = createHash("sha256").update(`${webhookBody}${retriedTimestamp}secret-test`).digest("hex");
assert.equal(verifyCloudinaryWebhook(webhookBody, retriedSignature, String(retriedTimestamp), webhookTimestamp), true);
const expiredTimestamp = webhookTimestamp - 2 * 60 * 60 - 1;
const expiredSignature = createHash("sha256").update(`${webhookBody}${expiredTimestamp}secret-test`).digest("hex");
assert.equal(verifyCloudinaryWebhook(webhookBody, expiredSignature, String(expiredTimestamp), webhookTimestamp), false);
assert.equal(cloudinaryWebhookRunId({ context: { custom: { run_id: "nested" } } }), "nested");
assert.equal(cloudinaryWebhookRunId({ context: "run_id=flat|other=value" }), "flat");
assert.equal(cloudinaryWebhookRunId({}, "00000000-0000-4000-8000-000000000001"), "00000000-0000-4000-8000-000000000001");
assert.equal(cloudinaryWebhookBatchId({ batch_id: "batch-123" }), "batch-123");
const downloadUrl = signedCloudinaryDownload("puna/reels/example", "mp4", "c_fill,w_1080,h_1920", 2_000_000_000);
assert.match(downloadUrl, /video\/download\?/);
assert.match(downloadUrl, /expires_at=2000000600/);
assert.match(downloadUrl, /type=authenticated/);
assert.doesNotMatch(downloadUrl, /secret-test/);

process.env.CONTENT_MODEL_INPUT_USD_PER_MILLION = "2";
process.env.CONTENT_MODEL_CACHED_INPUT_USD_PER_MILLION = "1";
process.env.CONTENT_MODEL_OUTPUT_USD_PER_MILLION = "8";
process.env.CONTENT_PRICING_VERSION = "test";
const telemetry = buildRunTelemetry({ critic: { usage: { input_tokens: 1000, input_tokens_details: { cached_tokens: 200 }, output_tokens: 100 }, requestId: "req_test", durationMs: 400 } }, "2026-09-01T00:00:00.000Z", "2026-09-01T00:00:01.000Z");
assert.equal(telemetry.duration_ms, 1000);
assert.equal(telemetry.estimated_cost_usd, 0.0026);
assert.deepEqual(telemetry.request_trace, { critic: "req_test" });

const migration = await readFile(new URL("../supabase/migrations/20260901190000_social_studio_phase1.sql", import.meta.url), "utf8");
for (const contract of [
  "create table if not exists public.social_campaigns",
  "content_distribution_drafts_ensure_campaign",
  "content_distribution_drafts_refresh_campaign",
  "create or replace function public.approve_social_campaign",
  "for update",
  "errcode = '40001'",
  "grant execute on function public.approve_social_campaign(uuid, timestamptz) to service_role",
  "alter column campaign_id set not null",
  "alter table public.social_campaigns enable row level security",
]) assert.ok(migration.includes(contract), `Missing migration contract: ${contract}`);
assert.equal(/create policy[\s\S]+social_campaigns/i.test(migration), false, "Social campaigns must not receive browser policies");

const phase2 = await readFile(new URL("../supabase/migrations/20260902120000_social_studio_phase2.sql", import.meta.url), "utf8");
for (const contract of [
  "create table if not exists public.brand_media_assets",
  "create table if not exists public.brand_media_templates",
  "create table if not exists public.social_generation_runs",
  "create or replace function public.begin_social_generation",
  "create or replace function public.persist_social_generation_variants",
  "('brand-assets', 'brand-assets', false",
  "('generated-media', 'generated-media', false",
  "alter table public.social_generation_runs enable row level security",
]) assert.ok(phase2.includes(contract), `Missing Phase 2 migration contract: ${contract}`);

const phase3 = await readFile(new URL("../supabase/migrations/20260903120000_social_calendar_phase3.sql", import.meta.url), "utf8");
for (const contract of [
  "add column if not exists scheduled_for timestamptz",
  "'scheduled'",
  "content_distribution_drafts_calendar_idx",
  "create or replace function public.schedule_social_variant",
  "create or replace function public.unschedule_social_variant",
  "at time zone 'America/Argentina/Buenos_Aires'",
  "< 7200",
  "for update",
  "grant execute on function public.schedule_social_variant(uuid, timestamptz, text, boolean) to service_role",
]) assert.ok(phase3.includes(contract), `Missing Phase 3 migration contract: ${contract}`);
assert.equal(/create table/i.test(phase3), false, "Phase 3 must not create a calendar table");

const phase4 = await readFile(new URL("../supabase/migrations/20260904120000_social_quality_phase4.sql", import.meta.url), "utf8");
for (const contract of [
  "add column if not exists cta_url text",
  "create table if not exists public.social_variant_versions",
  "create or replace function public.capture_social_variant_version",
  "create or replace function public.restore_social_variant_version",
  "create or replace function public.approve_social_campaign_with_quality",
  "set content = coalesce(snap->>'content', '')",
  "new.generation_metadata->>'restored_from_version_id'",
  "'quality_review'",
  "estimated_cost_usd",
  "alter table public.social_variant_versions enable row level security",
  "grant execute on function public.restore_social_variant_version(uuid, uuid, timestamptz, uuid) to service_role",
]) assert.ok(phase4.includes(contract), `Missing Phase 4 migration contract: ${contract}`);
assert.equal(/create policy[\s\S]+social_variant_versions/i.test(phase4), false, "Variant history must not receive browser policies");

const phase6 = await readFile(new URL("../supabase/migrations/20260906120000_social_visual_system_phase6.sql", import.meta.url), "utf8");
for (const contract of [
  "add column if not exists focal_x",
  "add column if not exists visual_kind",
  "create or replace function public.valid_social_carousel",
  "'visual_drafting'",
  "'quality_review','carousel'",
  "'Puna Evidencia'",
  "'Puna Sistema'",
  "'application/pdf'",
  "'carousel_slides',draft.carousel_slides",
  "new.rendered_visual_hash is distinct from old.rendered_visual_hash",
  "create or replace function public.social_variant_quality_hash",
  "grant execute on function public.valid_social_carousel(jsonb) to service_role",
]) assert.ok(phase6.includes(contract), `Missing Phase 6 migration contract: ${contract}`);
assert.equal(/create policy[\s\S]+(brand_media_assets|content_distribution_drafts)/i.test(phase6), false, "Phase 6 must not expose visual data to browser roles");

const phase7 = await readFile(new URL("../supabase/migrations/20260914120000_social_reels_phase7.sql", import.meta.url), "utf8");
for (const contract of [
  "add column if not exists reel_scenes",
  "create or replace function public.valid_social_reel",
  "'reel_storyboard','reel_sources','reel_render'",
  "new.reel_scenes is distinct from old.reel_scenes",
  "'reel_scenes',draft.reel_scenes",
  "'reel_candidates',coalesce(draft.reel_provider_metadata->'candidates'",
  "grant execute on function public.valid_social_reel(jsonb) to service_role",
  "No cron, OAuth or automatic publication is created",
]) assert.ok(phase7.includes(contract), `Missing Phase 7 migration contract: ${contract}`);
assert.equal(/create policy/i.test(phase7), false, "Phase 7 must not expose reel data to browser roles");
assert.equal(/cron\.|http_post|social_publications/i.test(phase7), false, "Phase 7 must not add automatic publishing infrastructure");

const reelOperationFix = await readFile(new URL("../supabase/migrations/20260922190000_social_reels_operation_constraint_fix.sql", import.meta.url), "utf8");
for (const operation of ["'reel_sources'", "'reel_render'"]) {
  assert.ok(reelOperationFix.includes(operation), `Reel operation constraint fix must allow ${operation}`);
}
assert.ok(reelOperationFix.includes("drop constraint if exists social_generation_runs_operation_check"), "Reel operation constraint fix must replace the drifted constraint");
assert.equal(/create policy|cron\.|http_post|social_publications/i.test(reelOperationFix), false, "Reel constraint fix must not expose data or add publishing infrastructure");

const reelImportFix = await readFile(new URL("../supabase/migrations/20260922193000_social_reels_import_constraints_fix.sql", import.meta.url), "utf8");
assert.ok(reelImportFix.includes("stage = 'importing'"), "Reel import constraint fix must allow importing stage");
assert.ok(reelImportFix.includes("operation = 'reel_sources'"), "Reel import constraint fix must scope the exception to reel sources");
assert.ok(reelImportFix.includes("section ~ '^import:"), "Reel import constraint fix must accept scene-scoped import sections");
assert.equal(/create policy|cron\.|http_post|social_publications/i.test(reelImportFix), false, "Reel import constraint fix must not expose data or add publishing infrastructure");

console.log("Social Studio contracts passed.");
