import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { ArrowLeft, CheckCircle2, ExternalLink, Image as ImageIcon, Layers3, Palette, Send } from "lucide-react";
import { Field, Notice, OpsPageHeader, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { ART_PIECE_LABELS, ART_PIECE_ROLES, ART_REVIEW_KEYS, ART_REVIEW_LABELS, artCampaignReadiness, hasValidAssetRights, isArtPieceRole, type ArtPieceRole } from "../lib/art-studio";
import { audit, assertTrustedMutation, operationsHeaders, opsData, requireAdmin, stringField, type AdminContext } from "../lib/admin.server";
import { artStudioEnabled, renderContentOverlay } from "../lib/content-worker.server";
import { isUuid } from "../lib/social-studio";
import { recordArtVersion as recordVersion } from "../lib/art-version.server";

function factsFromText(value: string) {
  return value.split(/\r?\n/).flatMap((line) => {
    const [claim, rawUrl] = line.split("|").map((part) => part.trim());
    try {
      const url = new URL(rawUrl);
      return claim && url.protocol === "https:" ? [{ claim: claim.slice(0, 500), url: url.toString() }] : [];
    } catch { return []; }
  });
}

function factsToText(value: unknown) {
  return Array.isArray(value) ? value.map((item) => `${item?.claim || ""} | ${item?.url || ""}`).join("\n") : "";
}

function compactText(value: unknown, max: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max) || undefined;
}

function metricCopy(headline: string, support: string) {
  const match = `${headline} ${support}`.match(/\b\d+(?:[.,]\d+)?%?/);
  if (!match) return { headline };
  const withoutMetric = headline.replace(match[0], "").replace(/^\s*[:—–-]\s*|\s*[:—–-]\s*$/g, "").trim();
  return { emphasis: match[0], headline: withoutMetric || headline };
}

function templateKind(layout: string) {
  return ({ editorial: "Tipográfica", image_overlay: "Foto + titular", metric: "Dato protagonista", framework: "Sistema / pasos" } as Record<string, string>)[layout] || layout;
}

async function loadCampaign(context: AdminContext, id: string) {
  if (!isUuid(id)) return null;
  const result = await context.service.from("art_campaigns").select("*").eq("id", id).maybeSingle();
  return result.data as Record<string, any> | null;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!artStudioEnabled()) throw redirect("/ops/social", { headers: operationsHeaders(context.headers) });
  const campaign = await loadCampaign(context, params.campaignId || "");
  if (!campaign) throw new Response("Campaña no encontrada.", { status: 404 });
  const [socialResult, piecesResult, assetsResult, templatesResult, versionsResult] = await Promise.all([
    context.service.from("social_campaigns").select("*").eq("id", campaign.social_campaign_id).single(),
    context.service.from("art_campaign_pieces").select("*").eq("campaign_id", campaign.id),
    context.service.from("brand_media_assets").select("*").eq("is_active", true).order("title"),
    context.service.from("brand_media_templates").select("*").eq("is_active", true).order("name"),
    context.service.from("art_campaign_versions").select("id,version_number,change_type,created_at").eq("campaign_id", campaign.id).order("version_number", { ascending: false }).limit(8),
  ]);
  if (socialResult.error || piecesResult.error || assetsResult.error || templatesResult.error || versionsResult.error)
    throw new Response("No se pudo cargar el piloto.", { status: 500 });
  const pieces = ART_PIECE_ROLES.map((role) => (piecesResult.data || []).find((piece) => piece.role === role)).filter(Boolean);
  const assets = assetsResult.data || [];
  const assetPaths = assets.map((asset) => String(asset.storage_path));
  const outputPaths = pieces.flatMap((piece: any) => {
    const primary = piece.media_urls?.primary?.output_path ? [String(piece.media_urls.primary.output_path)] : [];
    const slides = Array.isArray(piece.media_urls?.slides) ? piece.media_urls.slides.flatMap((slide: any) => slide?.output_path ? [String(slide.output_path)] : []) : [];
    return [...primary, ...slides];
  });
  const [assetSigned, outputSigned] = await Promise.all([
    assetPaths.length ? context.service.storage.from("brand-assets").createSignedUrls(assetPaths, 3600) : Promise.resolve({ data: [], error: null }),
    outputPaths.length ? context.service.storage.from("generated-media").createSignedUrls(outputPaths, 3600) : Promise.resolve({ data: [], error: null }),
  ]);
  const assetUrls = new Map((assetSigned.data || []).map((item, index) => [assetPaths[index], item.signedUrl]));
  const outputUrls = new Map((outputSigned.data || []).map((item, index) => [outputPaths[index], item.signedUrl]));
  const hydratedAssets = assets.map((asset) => ({ ...asset, signed_url: assetUrls.get(String(asset.storage_path)) || null }));
  const hydratedPieces = pieces.map((piece: any) => ({
    ...piece,
    signed_url: outputUrls.get(String(piece.media_urls?.primary?.output_path)) || null,
    signed_slides: Array.isArray(piece.media_urls?.slides) ? piece.media_urls.slides.map((slide: any) => outputUrls.get(String(slide?.output_path)) || null).filter(Boolean) : [],
  }));
  return opsData({
    campaign,
    social: socialResult.data,
    pieces: hydratedPieces,
    assets: hydratedAssets,
    templates: templatesResult.data || [],
    versions: versionsResult.data || [],
    issues: artCampaignReadiness(campaign, hydratedPieces, hydratedAssets),
    saved: new URL(request.url).searchParams.get("saved") || "",
  }, context.headers);
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  if (!artStudioEnabled()) return opsData({ error: "Art Studio está deshabilitado." }, context.headers, 503);
  const campaign = await loadCampaign(context, params.campaignId || "");
  if (!campaign) return opsData({ error: "Campaña no encontrada." }, context.headers, 404);
  const form = await request.formData();
  const intent = stringField(form, "intent", 40);
  const expectedVersion = Number(form.get("expected_version"));
  if (!Number.isInteger(expectedVersion) || expectedVersion !== campaign.current_version)
    return opsData({ error: "La campaña cambió en otra pestaña. Recargá antes de guardar." }, context.headers, 409);

  if (intent === "save_brief") {
    const title = stringField(form, "title", 180);
    const audience = stringField(form, "audience", 500);
    const problem = stringField(form, "problem_statement", 1200);
    const thesis = stringField(form, "thesis", 800);
    const perspective = stringField(form, "perspective", 800);
    const objective = stringField(form, "objective", 500);
    const offerCta = stringField(form, "offer_cta", 500);
    const facts = factsFromText(stringField(form, "facts", 8000));
    if (!title || !audience || !problem || !thesis || !perspective || !objective || !offerCta)
      return opsData({ error: "Completá todos los campos esenciales del brief." }, context.headers, 422);
    const update = await context.service.from("art_campaigns").update({
      audience, problem_statement: problem, thesis, perspective, objective, offer_cta: offerCta, facts,
      restrictions: stringField(form, "restrictions", 2000) || null,
      art_director: stringField(form, "art_director", 160) || null,
      facts_approver: stringField(form, "facts_approver", 160) || null,
    }).eq("id", campaign.id);
    const social = await context.service.from("social_campaigns").update({ title, audience, problem_statement: problem }).eq("id", campaign.social_campaign_id);
    if (update.error || social.error) return opsData({ error: "No se pudo guardar el brief." }, context.headers, 400);
    await recordVersion(context, campaign.id, "brief");
    await audit(context, { action: "save_brief", entityType: "art_campaign", entityId: campaign.id, after: { facts: facts.length } });
  } else if (intent === "save_direction") {
    const route = (key: "a" | "b") => ({
      key,
      name: stringField(form, `route_${key}_name`, 120),
      rationale: stringField(form, `route_${key}_rationale`, 800),
      palette: stringField(form, `route_${key}_palette`, 500),
      typography: stringField(form, `route_${key}_typography`, 500),
      image_treatment: stringField(form, `route_${key}_images`, 800),
      composition_rules: stringField(form, `route_${key}_composition`, 1000),
      examples: stringField(form, `route_${key}_examples`, 1000),
    });
    const routes = [route("a"), route("b")];
    const selected = stringField(form, "selected_route_key", 1);
    if (routes.some((item) => Object.values(item).some((value) => !value)) || !["a", "b"].includes(selected) || routes[0].name === routes[1].name)
      return opsData({ error: "Completá dos rutas distintas, elegí una y explicá la decisión." }, context.headers, 422);
    const selectionReason = stringField(form, "selection_reason", 1000);
    if (!selectionReason) return opsData({ error: "Anotá por qué la ruta elegida comunica mejor la tesis." }, context.headers, 422);
    const update = await context.service.from("art_campaigns").update({ direction_routes: routes, selected_route_key: selected, selection_reason: selectionReason, status: "direction" }).eq("id", campaign.id);
    if (update.error) return opsData({ error: "No se pudo guardar la dirección de arte." }, context.headers, 400);
    await recordVersion(context, campaign.id, "direction");
    await audit(context, { action: "select_direction", entityType: "art_campaign", entityId: campaign.id, after: { selected_route_key: selected } });
  } else if (intent === "save_piece") {
    const role = stringField(form, "role", 20);
    if (!isArtPieceRole(role)) return opsData({ error: "Pieza inválida." }, context.headers, 422);
    const pieceResult = await context.service.from("art_campaign_pieces").select("*").eq("campaign_id", campaign.id).eq("role", role).single();
    const templateId = stringField(form, "template_id", 80);
    const assetId = stringField(form, "asset_id", 80) || null;
    const templateResult = await context.service.from("brand_media_templates").select("*").eq("id", templateId).eq("is_active", true).maybeSingle();
    if (pieceResult.error || !templateResult.data) return opsData({ error: "Elegí una plantilla activa." }, context.headers, 422);
    if (templateResult.data.layout === "image_overlay" && !assetId)
      return opsData({ error: "Esta plantilla necesita una imagen aprobada." }, context.headers, 422);
    if (assetId) {
      const assetResult = await context.service.from("brand_media_assets").select("*").eq("id", assetId).eq("is_active", true).maybeSingle();
      if (!hasValidAssetRights(assetResult.data))
        return opsData({ error: "El activo necesita derechos vigentes y, si muestra personas, consentimiento confirmado." }, context.headers, 422);
    }
    const payload = {
      narrative_function: stringField(form, "narrative_function", 600),
      headline: stringField(form, "headline", 120),
      support_copy: stringField(form, "support_copy", 1200) || null,
      alt_text: stringField(form, "alt_text", 500),
      asset_id: assetId,
      template_id: templateId,
      output_format: templateResult.data.output_format,
      crop_focus: stringField(form, "crop_focus", 20),
      hierarchy: stringField(form, "hierarchy", 30),
      media_urls: {},
      version: Number(pieceResult.data.version || 1) + 1,
    };
    if (!payload.narrative_function || !payload.headline || !payload.alt_text || !["top", "center", "bottom"].includes(payload.crop_focus) || !["headline_led", "image_led", "evidence_led"].includes(payload.hierarchy))
      return opsData({ error: "Completá función, titular, jerarquía, recorte y texto alternativo." }, context.headers, 422);
    const update = await context.service.from("art_campaign_pieces").update(payload).eq("id", pieceResult.data.id);
    if (update.error) return opsData({ error: "No se pudo guardar la pieza." }, context.headers, 400);
    await context.service.from("art_campaigns").update({ status: "production" }).eq("id", campaign.id);
    await recordVersion(context, campaign.id, "piece");
    await audit(context, { action: "save_piece", entityType: "art_campaign_piece", entityId: pieceResult.data.id, after: { role, template_id: templateId, asset_id: assetId } });
  } else if (intent === "render_piece") {
    const pieceId = stringField(form, "piece_id", 80);
    const pieceResult = await context.service.from("art_campaign_pieces").select("*").eq("id", pieceId).eq("campaign_id", campaign.id).single();
    if (pieceResult.error || !pieceResult.data.headline || !pieceResult.data.template_id || !pieceResult.data.alt_text)
      return opsData({ error: "Guardá la configuración completa antes de componer." }, context.headers, 422);
    const templateResult = await context.service.from("brand_media_templates").select("*").eq("id", pieceResult.data.template_id).eq("is_active", true).single();
    if (templateResult.error) return opsData({ error: "La plantilla ya no está disponible." }, context.headers, 422);
    let sourceUrl: string | undefined;
    if (templateResult.data.layout === "image_overlay") {
      const assetResult = await context.service.from("brand_media_assets").select("*").eq("id", pieceResult.data.asset_id).eq("is_active", true).single();
      if (assetResult.error || !hasValidAssetRights(assetResult.data))
        return opsData({ error: "No se puede componer con un activo sin derechos confirmados." }, context.headers, 422);
      const signed = await context.service.storage.from("brand-assets").createSignedUrl(assetResult.data.storage_path, 600);
      if (!signed.data?.signedUrl) return opsData({ error: "No se pudo leer el activo." }, context.headers, 400);
      sourceUrl = signed.data.signedUrl;
    }
    const jpeg = templateResult.data.output_format === "instagram_portrait";
    const extension = jpeg ? "jpg" : "png";
    const carouselSlides = pieceResult.data.role === "carousel"
      ? String(pieceResult.data.support_copy || "").split(/\r?\n/).map((slide: string) => slide.trim()).filter(Boolean).slice(0, 6)
      : [];
    if (pieceResult.data.role === "carousel" && carouselSlides.length < 2)
      return opsData({ error: "El carrusel necesita al menos dos placas, una por línea en el campo Apoyo." }, context.headers, 422);
    const headlines = pieceResult.data.role === "carousel" ? [pieceResult.data.headline, ...carouselSlides] : [pieceResult.data.headline];
    const selectedDirection = Array.isArray(campaign.direction_routes)
      ? campaign.direction_routes.find((item: any) => item.key === campaign.selected_route_key)
      : null;
    try {
      const rendered = [];
      for (let index = 0; index < headlines.length; index += 1) {
        const outputPath = `art/${campaign.id}/${pieceResult.data.id}-v${pieceResult.data.version}-${index + 1}.${extension}`;
        const upload = await context.service.storage.from("generated-media").createSignedUploadUrl(outputPath, { upsert: true });
        if (!upload.data?.signedUrl) throw new Error("media_upload_unavailable");
        const isCarousel = pieceResult.data.role === "carousel";
        const isLastSlide = isCarousel && index === headlines.length - 1;
        const support = String(pieceResult.data.support_copy || "");
        const frameworkBullets = templateResult.data.layout === "framework" && !isCarousel
          ? support.split(/\r?\n|\s*•\s*/).map((item: string) => item.trim()).filter(Boolean).slice(0, 4)
          : [];
        const copy = templateResult.data.layout === "metric"
          ? metricCopy(String(headlines[index]), support)
          : { headline: String(headlines[index]), emphasis: undefined };
        rendered.push(await renderContentOverlay({
          layout: templateResult.data.layout,
          composition_kind: isCarousel ? "carousel_slide" : "single",
          ...(isCarousel ? {
            slide_role: index === 0 ? "cover" : isLastSlide ? "cta" : "content",
            slide_number: index + 1,
            slide_count: headlines.length,
          } as const : {}),
          output_format: templateResult.data.output_format,
          ...(sourceUrl ? { source_url: sourceUrl } : {}),
          ...(sourceUrl ? { focal_point: { x: .5, y: pieceResult.data.crop_focus === "top" ? .2 : pieceResult.data.crop_focus === "bottom" ? .8 : .5 } } : {}),
          destination_upload_url: upload.data.signedUrl,
          output_path: outputPath,
          output_mime: jpeg ? "image/jpeg" : "image/png",
          headline: copy.headline.slice(0, 120),
          eyebrow: compactText(index === 0 ? selectedDirection?.name || pieceResult.data.narrative_function : pieceResult.data.narrative_function, 40),
          body: compactText(isCarousel ? index === 0 ? campaign.thesis : isLastSlide ? campaign.offer_cta : "" : frameworkBullets.length > 1 ? "" : support, 260),
          ...(frameworkBullets.length > 1 ? { bullets: frameworkBullets.map((item: string) => item.slice(0, 90)) } : {}),
          ...(copy.emphasis ? { emphasis: copy.emphasis } : {}),
          safe_zone: templateResult.data.safe_zone,
          text_align: templateResult.data.text_align,
          vertical_align: pieceResult.data.crop_focus,
          overlay_color: templateResult.data.overlay_color,
          overlay_opacity: Number(templateResult.data.overlay_opacity),
          text_color: templateResult.data.text_color,
          min_font_size: templateResult.data.min_font_size,
          max_font_size: templateResult.data.max_font_size,
          logo_enabled: templateResult.data.logo_enabled,
        }, `art:${pieceResult.data.id}:v${pieceResult.data.version}:${index + 1}`, campaign.id));
      }
      await context.service.from("art_campaign_pieces").update({ media_urls: { primary: rendered[0], ...(pieceResult.data.role === "carousel" ? { slides: rendered } : {}) } }).eq("id", pieceResult.data.id);
      await recordVersion(context, campaign.id, "piece");
      await audit(context, { action: "render_piece", entityType: "art_campaign_piece", entityId: pieceResult.data.id, after: { output_paths: rendered.map((item) => item.output_path) } });
    } catch {
      return opsData({ error: "El worker no pudo componer la pieza. La configuración quedó guardada para reintentar." }, context.headers, 502);
    }
  } else if (intent === "save_review") {
    const review = Object.fromEntries(ART_REVIEW_KEYS.map((key) => [key, form.get(key) === "yes"]));
    Object.assign(review, {
      internal_reviewer: stringField(form, "internal_reviewer", 160),
      design_reviewer: stringField(form, "design_reviewer", 160),
      notes: stringField(form, "review_notes", 3000),
      reviewed_at: new Date().toISOString(),
    });
    const allChecked = ART_REVIEW_KEYS.every((key) => review[key] === true) && Boolean(review.internal_reviewer) && Boolean(review.design_reviewer);
    const [reviewPieces, reviewAssets] = await Promise.all([
      context.service.from("art_campaign_pieces").select("*").eq("campaign_id", campaign.id),
      context.service.from("brand_media_assets").select("*").eq("is_active", true),
    ]);
    const ready = allChecked && artCampaignReadiness({ ...campaign, review }, reviewPieces.data || [], reviewAssets.data || []).length === 0;
    const update = await context.service.from("art_campaigns").update({
      review,
      status: ready ? "ready" : "review",
      pilot_metrics: {
        production_minutes: Number(form.get("production_minutes")) || null,
        correction_rounds: Number(form.get("correction_rounds")) || 0,
        cost_usd: Number(form.get("cost_usd")) || 0,
        material_problems: stringField(form, "material_problems", 2000),
        system_limits: stringField(form, "system_limits", 2000),
      },
    }).eq("id", campaign.id);
    if (update.error) return opsData({ error: "No se pudo guardar la revisión." }, context.headers, 400);
    await recordVersion(context, campaign.id, "review");
    await audit(context, { action: "review", entityType: "art_campaign", entityId: campaign.id, after: { passed: ready } });
  } else if (intent === "handoff") {
    const [piecesResult, assetsResult] = await Promise.all([
      context.service.from("art_campaign_pieces").select("*").eq("campaign_id", campaign.id),
      context.service.from("brand_media_assets").select("*").eq("is_active", true),
    ]);
    const issues = artCampaignReadiness(campaign, piecesResult.data || [], assetsResult.data || []);
    if (issues.length) return opsData({ error: `No se puede entregar todavía: ${issues.join(" ")}` }, context.headers, 422);
    const selectedRoute = (campaign.direction_routes || []).find((item: any) => item.key === campaign.selected_route_key);
    const socialResult = await context.service.from("social_campaigns").select("generation_context").eq("id", campaign.social_campaign_id).single();
    const generationContext = {
      ...(socialResult.data?.generation_context || {}),
      sources: (campaign.facts || []).map((fact: any, index: number) => ({ key: `art-${index + 1}`, title: fact.claim, url: fact.url, excerpt: fact.claim })),
      art_studio: {
        campaign_id: campaign.id,
        version: campaign.current_version + 1,
        thesis: campaign.thesis,
        perspective: campaign.perspective,
        objective: campaign.objective,
        offer_cta: campaign.offer_cta,
        selected_direction: selectedRoute,
        pieces: (piecesResult.data || []).map((piece) => ({ role: piece.role, narrative_function: piece.narrative_function, headline: piece.headline, alt_text: piece.alt_text, asset_id: piece.asset_id, template_id: piece.template_id, media_urls: piece.media_urls, version: piece.version })),
        rights_checked: true,
        reviewed_at: campaign.review.reviewed_at,
      },
    };
    const socialUpdate = await context.service.from("social_campaigns").update({ generation_context: generationContext, status: "idea" }).eq("id", campaign.social_campaign_id);
    const artUpdate = await context.service.from("art_campaigns").update({ status: "handed_off" }).eq("id", campaign.id);
    if (socialUpdate.error || artUpdate.error) return opsData({ error: "No se pudo entregar la campaña a Social Studio." }, context.headers, 400);
    await recordVersion(context, campaign.id, "handoff");
    await audit(context, { action: "handoff", entityType: "art_campaign", entityId: campaign.id, after: { social_campaign_id: campaign.social_campaign_id } });
    throw redirect(`/ops/social/new?campaign=${campaign.social_campaign_id}&step=1`, { headers: operationsHeaders(context.headers) });
  } else return opsData({ error: "Acción inválida." }, context.headers, 400);

  throw redirect(`/ops/art/${campaign.id}?saved=${intent}`, { headers: operationsHeaders(context.headers) });
}

function VersionInput({ version }: { version: number }) {
  return <input type="hidden" name="expected_version" value={version}/>;
}

function DirectionFields({ route, keyName }: { route?: Record<string, any>; keyName: "a" | "b" }) {
  const prefix = `route_${keyName}`;
  return <article className="ops-art-direction"><span>Ruta {keyName.toUpperCase()}</span><Field label="Nombre" name={`${prefix}_name`} value={route?.name} required/><TextAreaField label="Por qué funciona" name={`${prefix}_rationale`} value={route?.rationale} required rows={3}/><Field label="Paleta" name={`${prefix}_palette`} value={route?.palette} required/><Field label="Tipografía" name={`${prefix}_typography`} value={route?.typography} required/><TextAreaField label="Tratamiento de imagen" name={`${prefix}_images`} value={route?.image_treatment} required rows={3}/><TextAreaField label="Reglas de composición" name={`${prefix}_composition`} value={route?.composition_rules} required rows={3}/><TextAreaField label="2–3 ejemplos de aplicación" name={`${prefix}_examples`} value={route?.examples} required rows={3}/></article>;
}

function PieceCard({ piece, assets, templates, version }: { piece: any; assets: any[]; templates: any[]; version: number; key?: string }) {
  const role = piece.role as ArtPieceRole;
  const asset = assets.find((item) => item.id === piece.asset_id);
  const editorial = piece.media_urls?.primary?.kind === "editorial_canvas";
  return <article className="ops-art-piece" data-format={piece.output_format}><header><div><span>{ART_PIECE_ROLES.indexOf(role) + 1}</span><div><small>PUBLICACIÓN INDIVIDUAL</small><h3>{ART_PIECE_LABELS[role]}</h3></div></div>{piece.signed_url ? <StatusBadge value="succeeded"/> : <StatusBadge value="pending"/>}</header>
    <div className="ops-art-piece-preview">{piece.signed_url ? <img src={piece.signed_url} alt={piece.alt_text || ""} width="540" height="675"/> : asset?.signed_url ? <img src={asset.signed_url} alt={asset.alt_text || ""} width="540" height="675"/> : <div><ImageIcon aria-hidden="true"/><span>Configurá y componé la publicación</span></div>}</div>
    {role === "carousel" && piece.signed_slides?.length ? <div className="ops-art-carousel-strip" aria-label={`${piece.signed_slides.length} placas del carrusel`}>{piece.signed_slides.map((url: string, index: number) => <figure key={url}><img src={url} alt={`${piece.alt_text || "Carrusel"} — placa ${index + 1}`} width="180" height="225"/><figcaption>{String(index + 1).padStart(2, "0")}</figcaption></figure>)}</div> : null}
    {editorial ? <div className="ops-art-editorial-meta"><p>Composición editorial · {piece.media_urls.primary.composition}</p><p><strong>Procedencia:</strong> {piece.media_urls.primary.rights_source}</p><p>PNG versionado. Para editar texto, foto o estructura, prepará y guardá una nueva versión en el editor.</p><Link to={`/ops/art/${piece.campaign_id}/concept`}>Editar esta publicación</Link></div> : <Form method="post" className="ops-form"><VersionInput version={version}/><input type="hidden" name="role" value={role}/><TextAreaField label="Función narrativa" name="narrative_function" value={piece.narrative_function} required rows={2}/><Field label="Titular" name="headline" value={piece.headline} required maxLength={120}/><TextAreaField label={role === "carousel" ? "Placas del carrusel" : "Texto de apoyo"} name="support_copy" value={piece.support_copy} rows={role === "carousel" ? 5 : 3} hint={role === "carousel" ? "Una idea por línea; entre 2 y 6, además de la portada." : "En Sistema / pasos, separá los puntos con saltos de línea."}/><Field label="Sistema visual" name="template_id" required><select name="template_id" defaultValue={piece.template_id || ""}><option value="">Elegir…</option>{templates.map((template) => <option key={template.id} value={template.id}>{templateKind(template.layout)} · {template.name} · {template.output_format}</option>)}</select></Field><Field label="Activo autorizado" name="asset_id"><select name="asset_id" defaultValue={piece.asset_id || ""}><option value="">Sin activo</option>{assets.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.rights_status}</option>)}</select></Field><div className="ops-field-grid"><Field label="Jerarquía" name="hierarchy"><select name="hierarchy" defaultValue={piece.hierarchy || "headline_led"}><option value="headline_led">Titular primero</option><option value="image_led">Imagen primero</option><option value="evidence_led">Evidencia primero</option></select></Field><Field label="Foco de recorte" name="crop_focus"><select name="crop_focus" defaultValue={piece.crop_focus || "center"}><option value="top">Arriba</option><option value="center">Centro</option><option value="bottom">Abajo</option></select></Field></div><TextAreaField label="Texto alternativo" name="alt_text" value={piece.alt_text} required rows={2}/><SubmitButton intent="save_piece">Guardar dirección de la publicación</SubmitButton></Form>}
    {piece.headline && piece.template_id && piece.alt_text ? <Form method="post" className="ops-art-render-form"><VersionInput version={version}/><input type="hidden" name="piece_id" value={piece.id}/><SubmitButton intent="render_piece"><Palette size={16}/>Componer publicación</SubmitButton></Form> : null}
  </article>;
}

export default function OpsArtDetail({ loaderData, actionData }: { loaderData: any; actionData?: { error?: string } }) {
  const { campaign, social, pieces, assets, templates } = loaderData;
  const routes = Array.isArray(campaign.direction_routes) ? campaign.direction_routes : [];
  return <>
    <Link className="ops-back" to="/ops/art"><ArrowLeft size={16}/>Volver a Art Studio</Link>
    <OpsPageHeader eyebrow={`Piloto · versión ${campaign.current_version}`} title={social.title} description="Una tesis, dos rutas razonadas y tres piezas deliberadamente distintas." action={<StatusBadge value={campaign.status}/>}/>
    {loaderData.saved ? <Notice tone="success">Cambios guardados y versionados.</Notice> : null}
    {actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    <Link className="ops-button ops-button-secondary" to={`/ops/art/${campaign.id}/concept`}><Palette size={17}/>Personalizar publicaciones · 12 composiciones</Link>
    <nav className="ops-art-jump" aria-label="Secciones del piloto"><a href="#brief">1. Brief</a><a href="#direction">2. Dirección</a><a href="#pieces">3. Piezas</a><a href="#review">4. Revisión</a></nav>

    <section id="brief" className="ops-panel ops-art-section"><header><div><p className="ops-eyebrow">01 · Brief</p><h2>Una tesis concreta</h2></div></header><Form method="post" className="ops-form"><VersionInput version={campaign.current_version}/><Field label="Título interno" name="title" value={social.title} required/><Field label="Audiencia" name="audience" value={campaign.audience} required/><TextAreaField label="Problema" name="problem_statement" value={campaign.problem_statement} required rows={3}/><TextAreaField label="Tesis de campaña" name="thesis" value={campaign.thesis} required rows={3}/><TextAreaField label="Perspectiva propia de Puna" name="perspective" value={campaign.perspective} required rows={3}/><div className="ops-field-grid"><Field label="Objetivo" name="objective" value={campaign.objective} required/><Field label="Oferta / CTA" name="offer_cta" value={campaign.offer_cta} required/></div><TextAreaField label="Hechos y evidencia" name="facts" value={factsToText(campaign.facts)} rows={4} hint="Una por línea: afirmación | https://fuente"/><TextAreaField label="Restricciones" name="restrictions" value={campaign.restrictions} rows={3}/><div className="ops-field-grid"><Field label="Quién elige la dirección" name="art_director" value={campaign.art_director}/><Field label="Quién aprueba hechos y permisos" name="facts_approver" value={campaign.facts_approver}/></div><SubmitButton intent="save_brief">Guardar brief</SubmitButton></Form></section>

    <section id="direction" className="ops-panel ops-art-section"><header><div><p className="ops-eyebrow">02 · Dirección de arte</p><h2>Compará sólo dos rutas</h2></div></header><Form method="post" className="ops-form"><VersionInput version={campaign.current_version}/><div className="ops-art-directions"><DirectionFields keyName="a" route={routes.find((item: any) => item.key === "a")}/><DirectionFields keyName="b" route={routes.find((item: any) => item.key === "b")}/></div><fieldset className="ops-choice-group"><legend>Ruta elegida</legend><label><input type="radio" name="selected_route_key" value="a" defaultChecked={campaign.selected_route_key === "a"}/>Ruta A</label><label><input type="radio" name="selected_route_key" value="b" defaultChecked={campaign.selected_route_key === "b"}/>Ruta B</label></fieldset><TextAreaField label="Por qué comunica mejor la tesis" name="selection_reason" value={campaign.selection_reason} required rows={3}/><SubmitButton intent="save_direction">Guardar dirección</SubmitButton></Form></section>

    <section id="pieces" className="ops-art-section"><header className="ops-art-section-heading"><div><p className="ops-eyebrow">03 · Producción</p><h2><Layers3 size={25}/>Publicaciones con criterio propio</h2><p>Cada publicación se revisa a tamaño real y debe sostenerse por sí sola. El carrusel muestra todas sus placas; no usamos una grilla como sustituto de dirección de arte.</p></div><Link className="ops-button ops-button-secondary" to="/ops/brand">Revisar activos y derechos<ExternalLink size={15}/></Link></header><div className="ops-art-piece-grid">{pieces.map((piece: any) => <PieceCard key={piece.id} piece={piece} assets={assets} templates={templates} version={campaign.current_version}/>)}</div></section>

    <section id="review" className="ops-panel ops-art-section"><header><div><p className="ops-eyebrow">04 · Revisión humana</p><h2>Calidad, derechos y aprendizaje</h2></div></header><Form method="post" className="ops-form"><VersionInput version={campaign.current_version}/><fieldset className="ops-art-checklist"><legend>Criterios de éxito</legend>{ART_REVIEW_KEYS.map((key) => <label key={key}><input type="checkbox" name={key} value="yes" defaultChecked={campaign.review?.[key] === true}/><span><CheckCircle2 aria-hidden="true" size={18}/>{ART_REVIEW_LABELS[key]}</span></label>)}</fieldset><div className="ops-field-grid"><Field label="Revisión de Puna" name="internal_reviewer" value={campaign.review?.internal_reviewer} required/><Field label="Revisión diseño / CM" name="design_reviewer" value={campaign.review?.design_reviewer} required/></div><TextAreaField label="Observaciones" name="review_notes" value={campaign.review?.notes} rows={4}/><div className="ops-art-metrics"><Field label="Minutos de producción" name="production_minutes" type="number" value={campaign.pilot_metrics?.production_minutes}/><Field label="Rondas de corrección" name="correction_rounds" type="number" value={campaign.pilot_metrics?.correction_rounds}/><Field label="Costo USD" name="cost_usd" type="number" value={campaign.pilot_metrics?.cost_usd}/></div><TextAreaField label="Problemas de material" name="material_problems" value={campaign.pilot_metrics?.material_problems} rows={3}/><TextAreaField label="Límites del sistema actual" name="system_limits" value={campaign.pilot_metrics?.system_limits} rows={3}/><SubmitButton intent="save_review">Guardar revisión</SubmitButton></Form></section>

    <section className="ops-panel ops-art-handoff"><div><p className="ops-eyebrow">Entrega</p><h2>Pasar a Social Studio</h2>{loaderData.issues.length ? <><p>Faltan {loaderData.issues.length} controles:</p><ul>{loaderData.issues.map((issue: string) => <li key={issue}>{issue}</li>)}</ul></> : <Notice tone="success">La campaña está lista. El copy, la evidencia final, la aprobación y la salida siguen en Social Studio.</Notice>}</div>{loaderData.issues.length ? <button className="ops-button" type="button" disabled><Send size={17}/>Completar controles</button> : <Form method="post"><VersionInput version={campaign.current_version}/><SubmitButton intent="handoff"><Send size={17}/>Entregar versión</SubmitButton></Form>}</section>

    {loaderData.versions.length ? <section className="ops-version-history"><header><h3>Versiones del piloto</h3><span>{loaderData.versions.length} recientes</span></header><div className="ops-version-list">{loaderData.versions.map((version: any) => <article key={version.id}><div><strong>Versión {version.version_number}</strong><small>{version.change_type}</small></div><time dateTime={version.created_at}>{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(version.created_at))}</time></article>)}</div></section> : null}
  </>;
}
