import { renderContentDocument, renderContentOverlay } from "./content-worker.server";
import { stableHash } from "./social-generation.server";
import { carouselMaterial, parseCarouselSlides, type VisualPreset } from "./social-visual";

type ServiceClient = any;

async function signedAsset(service: ServiceClient, assetId: string | null, modern: boolean) {
  if (!assetId) return null;
  const asset = await service.from("brand_media_assets").select(modern ? "storage_path,focal_x,focal_y" : "storage_path").eq("id", assetId).eq("is_active", true).maybeSingle();
  if (!asset.data) throw new Error("brand_asset_unavailable");
  const signed = await service.storage.from("brand-assets").createSignedUrl(asset.data.storage_path, 600);
  if (!signed.data?.signedUrl) throw new Error("brand_asset_unavailable");
  return { url: signed.data.signedUrl, focal: { x: Number(asset.data.focal_x ?? .5), y: Number(asset.data.focal_y ?? .5) } };
}

function priorPaths(media: Record<string, any>) {
  return [media?.primary?.output_path, media?.document?.output_path, ...(Array.isArray(media?.slides) ? media.slides.map((item: any) => item?.output_path) : [])].filter(Boolean) as string[];
}

async function assetFingerprint(service: ServiceClient, assetId: string | null, modern: boolean) {
  if (!assetId) return null;
  const asset = await service.from("brand_media_assets").select(modern ? "id,focal_x,focal_y" : "id").eq("id", assetId).eq("is_active", true).maybeSingle();
  if (!asset.data) throw new Error("brand_asset_unavailable");
  return { id: asset.data.id, focal: { x: Number(asset.data.focal_x ?? .5), y: Number(asset.data.focal_y ?? .5) } };
}

export async function socialVisualHash(service: ServiceClient, campaign: Record<string, any>, draft: Record<string, any>, template: Record<string, any>, modern = true) {
  const preset = String(template.preset_key || (template.layout === "image_overlay" ? "image" : "editorial")) as VisualPreset;
  const carousel = draft.visual_kind === "carousel";
  const slides = carousel ? parseCarouselSlides(draft.carousel_slides) : [];
  const assetIds = template.layout === "image_overlay" ? (carousel ? slides.map((slide) => slide.asset_id || campaign.generation_context?.visual?.asset_id || template.base_asset_id || null) : [campaign.generation_context?.visual?.asset_id || template.base_asset_id || null]) : [];
  const fingerprints = await Promise.all(assetIds.map((id) => assetFingerprint(service, id, modern)));
  const templateMaterial = { preset, template_id: template.id, template_version: Number(template.template_version || 1), visual_config: template.visual_config || {} };
  const material = carousel
    ? { ...carouselMaterial(slides, preset, template.id, templateMaterial.template_version, templateMaterial.visual_config), assets: fingerprints }
    : { ...templateMaterial, headline: draft.image_headline, alt: draft.image_alt, assets: fingerprints };
  return stableHash(material);
}

export async function renderSocialVisual(service: ServiceClient, campaign: Record<string, any>, draft: Record<string, any>, template: Record<string, any>, requestId: string, modern = true) {
  const preset = String(template.preset_key || (template.layout === "image_overlay" ? "image" : "editorial")) as VisualPreset;
  const carousel = draft.visual_kind === "carousel";
  const slides = carousel ? parseCarouselSlides(draft.carousel_slides) : [];
  const visualHash = await socialVisualHash(service, campaign, draft, template, modern);
  const jpeg = draft.channel === "instagram";
  const extension = jpeg ? "jpg" : "png";
  const mime = jpeg ? "image/jpeg" : "image/png";
  const compact = template.visual_config?.density === "compact";
  const renderOne = async (slide: any, index: number) => {
    const assetId = slide?.asset_id || campaign.generation_context?.visual?.asset_id || template.base_asset_id || null;
    const asset = template.layout === "image_overlay" ? await signedAsset(service, assetId, modern) : null;
    const outputPath = carousel ? `${campaign.id}/${draft.id}/carousel/${visualHash}/${String(index + 1).padStart(2, "0")}-${slide.id}.${extension}` : `${campaign.id}/${draft.id}/${visualHash}.${extension}`;
    const upload = await service.storage.from("generated-media").createSignedUploadUrl(outputPath, { upsert: true });
    if (!upload.data?.signedUrl) throw new Error("media_upload_unavailable");
    return renderContentOverlay({
      layout: template.layout, composition_kind: carousel ? "carousel_slide" : "single", ...(carousel ? { slide_role: slide.role, eyebrow: slide.eyebrow || undefined, body: slide.body || undefined, bullets: slide.bullets, emphasis: slide.emphasis || undefined, slide_number: index + 1, slide_count: slides.length } : {}),
      output_format: template.output_format, ...(asset ? { source_url: asset.url, focal_point: asset.focal } : {}), destination_upload_url: upload.data.signedUrl, output_path: outputPath, output_mime: mime,
      headline: String(carousel ? slide.headline : draft.image_headline || campaign.title).slice(0, carousel ? 100 : 120), safe_zone: template.safe_zone, text_align: template.text_align,
      vertical_align: template.vertical_align, overlay_color: template.overlay_color, overlay_opacity: Number(template.overlay_opacity), text_color: template.text_color,
      min_font_size: compact ? Math.max(24, Number(template.min_font_size) - 6) : template.min_font_size, max_font_size: compact ? Math.max(24, Number(template.max_font_size) - 8) : template.max_font_size, logo_enabled: template.logo_enabled,
    }, `visual:${draft.id}:${visualHash}:${index}`, requestId);
  };
  const renderedSlides = carousel ? [] as any[] : null;
  if (carousel) for (let index = 0; index < slides.length; index += 1) renderedSlides!.push(await renderOne(slides[index], index));
  const primary = carousel ? null : await renderOne(null, 0);
  let document = null;
  if (carousel && draft.channel === "linkedin") {
    const paths = renderedSlides!.map((item) => item.output_path);
    const signed = await service.storage.from("generated-media").createSignedUrls(paths, 600);
    if (signed.error || signed.data?.some((item: any) => !item.signedUrl)) throw new Error("carousel_sources_unavailable");
    const outputPath = `${campaign.id}/${draft.id}/carousel/${visualHash}/linkedin.pdf`;
    const upload = await service.storage.from("generated-media").createSignedUploadUrl(outputPath, { upsert: true });
    if (!upload.data?.signedUrl) throw new Error("media_upload_unavailable");
    document = await renderContentDocument({ source_urls: signed.data.map((item: any) => item.signedUrl), destination_upload_url: upload.data.signedUrl, output_path: outputPath }, `document:${draft.id}:${visualHash}`, requestId);
  }
  const mediaUrls = carousel ? { slides: renderedSlides, ...(document ? { document } : {}) } : { primary };
  const updatePayload = modern ? { media_urls: mediaUrls, rendered_visual_hash: visualHash, generation_metadata: { ...(draft.generation_metadata || {}), media_stale: false } } : { media_urls: mediaUrls };
  const update = await service.from("content_distribution_drafts").update(updatePayload).eq("id", draft.id).select("id").maybeSingle();
  if (!update.data) throw new Error("render_conflict");
  const oldPaths = priorPaths(draft.media_urls || {}).filter((path) => !priorPaths(mediaUrls).includes(path));
  if (oldPaths.length) await service.storage.from("generated-media").remove(oldPaths);
  return { mediaUrls, visualHash };
}
