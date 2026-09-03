import { randomUUID } from "node:crypto";
import { useEffect, useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useFetcher } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  LoaderCircle,
  Shapes,
  Sparkles,
} from "lucide-react";
import {
  Field,
  Notice,
  OpsPageHeader,
  StatusBadge,
  SubmitButton,
  TextAreaField,
} from "../components/ops";
import {
  audit,
  assertTrustedMutation,
  operationsHeaders,
  opsData,
  requireAdmin,
  safeMessage,
  stringField,
} from "../lib/admin.server";
import {
  contentComposerEnabled,
  contentQualityEnabled,
  renderContentOverlay,
} from "../lib/content-worker.server";
import {
  criticSocialVariants,
  deterministicQualityFlags,
  draftSocialVariants,
  generateOpeningOptions,
  stableHash,
  type EvidenceSource,
  type GeneratedSocialVariant,
  type OpeningOption,
} from "../lib/social-generation.server";
import { isSocialChannel, isSocialLocale, isUuid } from "../lib/social-studio";
import { buildRunTelemetry, isRetryableGenerationError } from "../lib/social-observability.server";

const objectives = {
  educate: "Educar",
  demonstrate: "Demostrar capacidad",
  conversation: "Generar conversación",
  convert: "Convertir",
} as const;
const services = {
  "ai-automation": "Automatización con IA",
  "custom-software": "Software a medida",
  "data-integrations": "Integración de datos",
} as const;
const sourceTypes = {
  article: "Artículo publicado",
  brief: "Brief aprobado",
  manual: "Tema manual",
  brand_asset: "Imagen de marca",
  internal_learning: "Aprendizaje interno",
} as const;
const ctaTypes = {
  audit: "Agendar auditoría",
  service: "Ver servicio",
  article: "Leer artículo",
  conversation: "Iniciar conversación",
  none: "Sin CTA",
} as const;
const openingLabels = {
  observable_problem: "Problema observable",
  verified_data: "Dato verificado",
  contrast: "Contraste",
  real_learning: "Aprendizaje real",
} as const;

function stripMarkup(value: unknown) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12_000);
}

function manualSources(value: string): EvidenceSource[] {
  return value.split(/\r?\n/).flatMap((line, index) => {
    const [title, rawUrl, ...excerptParts] = line
      .split("|")
      .map((part) => part.trim());
    const excerpt = excerptParts.join(" | ").trim();
    try {
      const url = new URL(rawUrl);
      return title && url.protocol === "https:" && excerpt
        ? [
            {
              key: `manual-${index + 1}`,
              title,
              url: url.toString(),
              excerpt: excerpt.slice(0, 3000),
            },
          ]
        : [];
    } catch {
      return [];
    }
  });
}

function generationErrorCode(error: unknown) {
  const value = typeof (error as { code?: unknown })?.code === "string"
    ? String((error as { code: string }).code)
    : error instanceof Error ? error.message : "generation_failed";
  return [
    "model_timeout",
    "model_rate_limited",
    "model_unavailable",
    "invalid_model_response",
    "invalid_generated_variants",
    "unsupported_verified_opening",
    "worker_timeout",
    "worker_unavailable",
    "worker_request_failed",
    "invalid_worker_response",
  ].includes(value)
    ? value
    : "generation_failed";
}

function ctaForObjective(
  objective: keyof typeof objectives,
): keyof typeof ctaTypes {
  return objective === "convert"
    ? "audit"
    : objective === "demonstrate"
      ? "service"
      : objective === "educate"
        ? "article"
        : "conversation";
}

function campaignModelContext(campaign: Record<string, any>) {
  return {
    title: campaign.title,
    objective: campaign.objective,
    audience: campaign.audience,
    service_cluster: campaign.service_cluster,
    problem_statement: campaign.problem_statement,
    cta_type: campaign.cta_type,
    cta_url: campaign.cta_url,
    locales: campaign.locale_strategy?.locales || ["es"],
    channels: campaign.locale_strategy?.channels || ["linkedin", "instagram"],
    opening: campaign.selected_opening,
    sources: campaign.generation_context?.sources || [],
    tone_notes: campaign.generation_context?.tone_notes || "",
    confidentiality: "Use only the supplied, non-confidential context.",
  };
}

function assertRequestedVariants(
  campaign: Record<string, any>,
  variants: GeneratedSocialVariant[],
) {
  const expected = (campaign.locale_strategy?.locales || ["es"])
    .flatMap((locale: string) =>
      (campaign.locale_strategy?.channels || ["linkedin", "instagram"]).map(
        (channel: string) => `${channel}:${locale}`,
      ),
    )
    .sort();
  const actual = variants
    .map((variant) => `${variant.channel}:${variant.locale}`)
    .sort();
  if (
    actual.length !== new Set(actual).size ||
    JSON.stringify(actual) !== JSON.stringify(expected)
  )
    throw new Error("invalid_generated_variants");
}

async function loadCampaign(
  context: Awaited<ReturnType<typeof requireAdmin>>,
  id: string,
) {
  if (!isUuid(id)) return null;
  const result = await context.service
    .from("social_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return result.data as Record<string, any> | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentComposerEnabled())
    throw redirect("/ops/social", {
      headers: operationsHeaders(context.headers),
    });
  const url = new URL(request.url);
  const campaignId = url.searchParams.get("campaign") || "";
  const runId = url.searchParams.get("run") || "";
  const [
    campaign,
    articlesResult,
    briefsResult,
    assetsResult,
    templatesResult,
    runResult,
  ] = await Promise.all([
    campaignId ? loadCampaign(context, campaignId) : Promise.resolve(null),
    context.service
      .from("posts")
      .select("translation_group_id,locale,title,status")
      .eq("status", "published")
      .order("updated_at", { ascending: false }),
    context.service
      .from("content_briefs")
      .select("id,title,audience,service_cluster,status")
      .eq("status", "approved")
      .order("updated_at", { ascending: false }),
    context.service
      .from("brand_media_assets")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false }),
    context.service
      .from("brand_media_templates")
      .select("*")
      .eq("is_active", true)
      .order("name"),
    isUuid(runId)
      ? context.service
          .from("social_generation_runs")
          .select(
            "id,campaign_id,operation,stage,status,error_code,error_message,result_summary,updated_at",
          )
          .eq("id", runId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  const articleGroups = new Map<string, string>();
  for (const post of articlesResult.data || [])
    if (
      !articleGroups.has(String(post.translation_group_id)) ||
      post.locale === "es"
    )
      articleGroups.set(String(post.translation_group_id), String(post.title));
  const assets = assetsResult.data || [];
  const paths = assets.map((item) => String(item.storage_path));
  const signed = paths.length
    ? await context.service.storage
        .from("brand-assets")
        .createSignedUrls(paths, 3600)
    : { data: [], error: null };
  const signedMap = new Map(
    (signed.data || []).map((item, index) => [paths[index], item.signedUrl]),
  );
  const requestedStep = Number(
    url.searchParams.get("step") || (campaign ? 2 : 1),
  );
  const step = Math.min(
    4,
    Math.max(1, Number.isInteger(requestedStep) ? requestedStep : 1),
  );
  return opsData(
    {
      campaign,
      articles: [...articleGroups].map(([id, title]) => ({ id, title })),
      briefs: briefsResult.data || [],
      assets: assets.map((item) => ({
        ...item,
        signed_url: signedMap.get(String(item.storage_path)) || null,
      })),
      templates: templatesResult.data || [],
      run: runResult.data,
      step,
      actionKey: randomUUID(),
      saved: url.searchParams.get("saved") || "",
      qualityEnabled: contentQualityEnabled(),
    },
    context.headers,
  );
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  if (!contentComposerEnabled())
    return opsData(
      { error: "El compositor está deshabilitado." },
      context.headers,
      503,
    );
  const form = await request.formData();
  const intent = stringField(form, "intent", 50);
  const campaignId = stringField(form, "campaign_id", 80);
  const campaign = campaignId ? await loadCampaign(context, campaignId) : null;

  if (intent === "save_context") {
    const objective = stringField(
      form,
      "objective",
      30,
    ) as keyof typeof objectives;
    const audience = stringField(form, "audience", 500);
    const serviceCluster = stringField(
      form,
      "service_cluster",
      40,
    ) as keyof typeof services;
    const problem = stringField(form, "problem_statement", 1200);
    const sourceType = stringField(
      form,
      "source_type",
      40,
    ) as keyof typeof sourceTypes;
    const locales = Array.from(
      new Set(form.getAll("locales").map(String)),
    ).filter(isSocialLocale);
    const channels = Array.from(
      new Set(form.getAll("channels").map(String)),
    ).filter(isSocialChannel);
    if (
      !objectives[objective] ||
      !services[serviceCluster] ||
      !sourceTypes[sourceType] ||
      !audience ||
      !problem ||
      !locales.length ||
      !channels.length
    )
      return opsData(
        {
          error:
            "Completá objetivo, audiencia, servicio, problema, idioma y al menos un canal.",
        },
        context.headers,
        422,
      );
    const ctaType = ctaForObjective(objective);
    const ctaUrl = stringField(form, "cta_url", 1000);
    if (contentQualityEnabled() && ["audit", "service", "article"].includes(ctaType)) {
      try {
        if (new URL(ctaUrl).protocol !== "https:") throw new Error("invalid_protocol");
      } catch {
        return opsData({ error: "El CTA necesita un destino HTTPS válido." }, context.headers, 422);
      }
    }
    let sourceId = stringField(form, "source_id", 200);
    let title = stringField(form, "title", 180);
    let sources: EvidenceSource[] = [];
    if (sourceType === "article") {
      const posts = await context.service
        .from("posts")
        .select("id,locale,title,content,source_urls,status")
        .eq("translation_group_id", sourceId)
        .eq("status", "published");
      if (posts.error || !posts.data?.length)
        return opsData(
          { error: "Elegí un artículo publicado válido." },
          context.headers,
          422,
        );
      title =
        posts.data.find((post) => post.locale === "es")?.title ||
        posts.data[0].title;
      sources = posts.data.map((post) => ({
        key: `article-${post.id}`,
        title: `${post.title} (${String(post.locale).toUpperCase()})`,
        excerpt: stripMarkup(post.content),
      }));
    } else if (sourceType === "brief") {
      const brief = await context.service
        .from("content_briefs")
        .select("*")
        .eq("id", sourceId)
        .eq("status", "approved")
        .maybeSingle();
      if (!brief.data)
        return opsData(
          { error: "Elegí un brief aprobado válido." },
          context.headers,
          422,
        );
      title = brief.data.title;
      sources = [
        {
          key: `brief-${brief.data.id}`,
          title: brief.data.title,
          excerpt: stripMarkup(`${brief.data.angle} ${brief.data.notes || ""}`),
        },
      ];
    } else if (sourceType === "manual") {
      sources = manualSources(stringField(form, "manual_sources", 20_000));
      sourceId =
        campaign?.source_type === "manual"
          ? campaign.source_id
          : `manual-${randomUUID()}`;
      if (!title || !sources.length)
        return opsData(
          {
            error:
              "El tema manual requiere título y al menos una fuente con formato Título | https://… | extracto verificable.",
          },
          context.headers,
          422,
        );
    } else if (sourceType === "brand_asset") {
      const asset = await context.service
        .from("brand_media_assets")
        .select("id,title")
        .eq("id", sourceId)
        .eq("is_active", true)
        .maybeSingle();
      if (!asset.data)
        return opsData(
          { error: "Elegí una imagen activa de la biblioteca." },
          context.headers,
          422,
        );
      title ||= asset.data.title;
    } else {
      if (form.get("confidentiality_confirmed") !== "yes")
        return opsData(
          {
            error:
              "Confirmá que el aprendizaje interno no contiene información confidencial.",
          },
          context.headers,
          422,
        );
      sourceId =
        campaign?.source_type === "internal_learning"
          ? campaign.source_id
          : `learning-${randomUUID()}`;
      if (!title)
        return opsData(
          { error: "Ingresá un título interno." },
          context.headers,
          422,
        );
    }
    const payload = {
      title,
      source_type: sourceType,
      source_id: sourceId,
      status: "idea",
      objective,
      audience,
      service_cluster: serviceCluster,
      problem_statement: problem,
      source_urls: sources.flatMap((item) =>
        item.url ? [{ title: item.title, url: item.url }] : [],
      ),
      locale_strategy: { locales, channels },
      generation_context: {
        sources,
        tone_notes: stringField(form, "tone_notes", 500),
        confidentiality_confirmed:
          sourceType !== "internal_learning" ||
          form.get("confidentiality_confirmed") === "yes",
        visual: campaign?.generation_context?.visual || {
          strategy: "puna_editorial",
          linkedin_format: "linkedin_square",
        },
      },
      cta_type: ctaType,
      ...(contentQualityEnabled() ? { cta_url: ctaUrl || null } : {}),
      created_by: context.userId,
    };
    const result = campaign
      ? await context.service
          .from("social_campaigns")
          .update(payload)
          .eq("id", campaign.id)
          .select("*")
          .single()
      : await context.service
          .from("social_campaigns")
          .insert(payload)
          .select("*")
          .single();
    if (result.error)
      return opsData(
        {
          error:
            "No se pudo guardar la idea. Revisá que la fuente no esté usada por otra campaña.",
        },
        context.headers,
        400,
      );
    await audit(context, {
      action: campaign ? "save_context" : "create",
      entityType: "social_campaign",
      entityId: String(result.data.id),
      before: campaign
        ? { status: campaign.status, source_type: campaign.source_type }
        : null,
      after: {
        status: result.data.status,
        source_type: result.data.source_type,
        objective: result.data.objective,
        channels: result.data.locale_strategy?.channels,
        locales: result.data.locale_strategy?.locales,
      },
    });
    throw redirect(`/ops/social/new?campaign=${result.data.id}&step=2`, {
      headers: operationsHeaders(context.headers),
    });
  }

  if (!campaign)
    return opsData({ error: "Campaña no encontrada." }, context.headers, 404);

  if (intent === "generate_openings") {
    const key = stringField(form, "idempotency_key", 200);
    const model = process.env.CONTENT_TEXT_MODEL || "gpt-5.6-terra";
    const modelContext = campaignModelContext(campaign);
    const hash = stableHash({ operation: "openings", modelContext });
    const begun = await context.service.rpc("begin_social_generation", {
      target_campaign_id: campaign.id,
      target_draft_id: null,
      target_operation: "openings",
      target_stage: "drafting",
      target_section: null,
      target_idempotency_key: key,
      target_request_hash: hash,
      target_model: model,
      target_created_by: context.userId,
    });
    if (begun.error)
      return opsData(
        { error: "No se pudo iniciar la generación de aperturas." },
        context.headers,
        409,
      );
    const run = (
      Array.isArray(begun.data) ? begun.data[0] : begun.data
    ) as Record<string, any>;
    if (run.status === "succeeded")
      throw redirect(`/ops/social/new?campaign=${campaign.id}&step=2`, {
        headers: operationsHeaders(context.headers),
      });
    const startedAt = run.started_at || new Date().toISOString();
    await context.service
      .from("social_generation_runs")
      .update({ status: "running", started_at: startedAt })
      .eq("id", run.id);
    try {
      const sources = (campaign.generation_context?.sources ||
        []) as EvidenceSource[];
      const hasEvidence = sources.some((source) => /\d/.test(source.excerpt));
      const generated = await generateOpeningOptions(modelContext, hasEvidence);
      const completedAt = new Date().toISOString();
      await context.service
        .from("social_campaigns")
        .update({ opening_options: generated.options })
        .eq("id", campaign.id);
      await context.service
        .from("social_generation_runs")
        .update({
          status: "succeeded",
          stage: "complete",
          request_id: generated.requestId,
          usage: generated.usage,
          ...(contentQualityEnabled() ? buildRunTelemetry({ drafting: { usage: generated.usage, requestId: generated.requestId, durationMs: generated.durationMs } }, startedAt, completedAt) : {}),
          result_summary: { option_count: 3 },
          completed_at: completedAt,
        })
        .eq("id", run.id);
      await audit(context, {
        action: "generate_openings",
        entityType: "social_campaign",
        entityId: campaign.id,
        after: { option_count: 3, run_id: run.id },
      });
      throw redirect(`/ops/social/new?campaign=${campaign.id}&step=2`, {
        headers: operationsHeaders(context.headers),
      });
    } catch (error) {
      if (error instanceof Response) throw error;
      const code = generationErrorCode(error);
      const completedAt = new Date().toISOString();
      const requestId = typeof (error as any)?.requestId === "string" ? (error as any).requestId : "";
      await context.service
        .from("social_generation_runs")
        .update({
          status: "failed",
          error_code: code,
          error_message: safeMessage(error),
          ...(contentQualityEnabled() ? { retryable: isRetryableGenerationError(code), request_id: requestId || null, request_trace: requestId ? { drafting: requestId } : {}, duration_ms: Math.max(0, Date.parse(completedAt) - Date.parse(startedAt)) } : {}),
          completed_at: completedAt,
        })
        .eq("id", run.id);
      return opsData(
        {
          error:
            "No se pudieron generar las aperturas. Podés reintentar sin perder la idea.",
        },
        context.headers,
        502,
      );
    }
  }

  if (intent === "select_opening") {
    const index = Number(form.get("opening_index"));
    const options = Array.isArray(campaign.opening_options)
      ? (campaign.opening_options as OpeningOption[])
      : [];
    const original = options[index];
    const text = stringField(form, "opening_text", 500);
    if (!original || !text)
      return opsData(
        { error: "Elegí una apertura válida." },
        context.headers,
        422,
      );
    const selected = { ...original, text };
    const result = await context.service
      .from("social_campaigns")
      .update({ selected_opening: selected })
      .eq("id", campaign.id)
      .select("*")
      .single();
    if (result.error)
      return opsData(
        { error: "No se pudo guardar la apertura." },
        context.headers,
        400,
      );
    await audit(context, {
      action: "select_opening",
      entityType: "social_campaign",
      entityId: campaign.id,
      after: {
        opening_index: index,
        opening_type: selected.kind,
        edited: text !== original.text,
        character_count: text.length,
      },
    });
    throw redirect(`/ops/social/new?campaign=${campaign.id}&step=3`, {
      headers: operationsHeaders(context.headers),
    });
  }

  if (intent === "save_visual") {
    const strategy = stringField(form, "media_strategy", 40);
    const assetId = stringField(form, "asset_id", 80) || null;
    const linkedinFormat = stringField(form, "linkedin_format", 40);
    if (
      !["puna_editorial", "approved_image", "text_only"].includes(strategy) ||
      !["linkedin_square", "linkedin_horizontal"].includes(linkedinFormat)
    )
      return opsData(
        { error: "Elegí un formato visual válido." },
        context.headers,
        422,
      );
    if (strategy === "approved_image") {
      const asset = await context.service
        .from("brand_media_assets")
        .select("id")
        .eq("id", assetId)
        .eq("is_active", true)
        .maybeSingle();
      if (!asset.data)
        return opsData(
          { error: "Elegí una imagen activa." },
          context.headers,
          422,
        );
    }
    const altText = stringField(form, "visual_alt", 500);
    if (strategy !== "text_only" && !altText)
      return opsData(
        { error: "Escribí el texto alternativo antes de generar la pieza." },
        context.headers,
        422,
      );
    const generationContext = {
      ...campaign.generation_context,
      visual: {
        strategy,
        asset_id: assetId,
        linkedin_format: linkedinFormat,
        headline:
          stringField(form, "visual_headline", 120) ||
          campaign.selected_opening?.text?.slice(0, 120) ||
          campaign.title,
        alt_text: altText,
      },
    };
    const result = await context.service
      .from("social_campaigns")
      .update({ generation_context: generationContext })
      .eq("id", campaign.id)
      .select("*")
      .single();
    if (result.error)
      return opsData(
        { error: "No se pudo guardar el formato visual." },
        context.headers,
        400,
      );
    await audit(context, {
      action: "save_visual",
      entityType: "social_campaign",
      entityId: campaign.id,
      after: {
        strategy,
        asset_id: assetId,
        linkedin_format: linkedinFormat,
        has_alt_text: Boolean(altText),
      },
    });
    throw redirect(`/ops/social/new?campaign=${campaign.id}&step=4`, {
      headers: operationsHeaders(context.headers),
    });
  }

  if (intent === "start_generation") {
    if (!campaign.selected_opening)
      return opsData(
        { error: "Elegí una apertura antes de generar." },
        context.headers,
        422,
      );
    const existing = await context.service
      .from("content_distribution_drafts")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id);
    if ((existing.count || 0) > 0)
      return opsData(
        {
          error:
            "Esta campaña ya tiene variantes. Abrila desde la cola para editarlas.",
        },
        context.headers,
        409,
      );
    const key = stringField(form, "idempotency_key", 200);
    const modelContext = campaignModelContext(campaign);
    const model = process.env.CONTENT_TEXT_MODEL || "gpt-5.6-terra";
    const hash = stableHash({ operation: "campaign", modelContext });
    const begun = await context.service.rpc("begin_social_generation", {
      target_campaign_id: campaign.id,
      target_draft_id: null,
      target_operation: "campaign",
      target_stage: "drafting",
      target_section: null,
      target_idempotency_key: key,
      target_request_hash: hash,
      target_model: model,
      target_created_by: context.userId,
    });
    if (begun.error)
      return opsData(
        { error: "No se pudo iniciar la generación." },
        context.headers,
        409,
      );
    const run = (
      Array.isArray(begun.data) ? begun.data[0] : begun.data
    ) as Record<string, any>;
    await context.service
      .from("social_campaigns")
      .update({ status: "generating" })
      .eq("id", campaign.id);
    throw redirect(
      `/ops/social/new?campaign=${campaign.id}&step=4&run=${run.id}`,
      { headers: operationsHeaders(context.headers) },
    );
  }

  const runId = stringField(form, "run_id", 80);
  if (!isUuid(runId))
    return opsData({ error: "Ejecución inválida." }, context.headers, 404);
  const runResult = await context.service
    .from("social_generation_runs")
    .select("*")
    .eq("id", runId)
    .eq("campaign_id", campaign.id)
    .maybeSingle();
  const run = runResult.data as Record<string, any> | null;
  if (!run)
    return opsData({ error: "Ejecución no encontrada." }, context.headers, 404);
  const modelContext = campaignModelContext(campaign);
  const sources = (campaign.generation_context?.sources ||
    []) as EvidenceSource[];

  try {
    if (intent === "run_drafting" && run.stage === "drafting") {
      await context.service
        .from("social_generation_runs")
        .update({
          status: "running",
          error_code: null,
          error_message: null,
          started_at: run.started_at || new Date().toISOString(),
        })
        .eq("id", run.id);
      const generated = await draftSocialVariants(modelContext);
      assertRequestedVariants(campaign, generated.variants);
      await context.service
        .from("social_generation_runs")
        .update({
          status: "pending",
          stage: "critic",
          checkpoint_payload: { drafts: generated.variants },
          request_id: generated.requestId,
          usage: { drafting: generated.usage },
          ...(contentQualityEnabled() ? { request_trace: { ...(run.request_trace || {}), drafting: generated.requestId }, stage_timings: { ...(run.stage_timings || {}), drafting: { duration_ms: generated.durationMs } } } : {}),
        })
        .eq("id", run.id);
    } else if (intent === "run_critic" && run.stage === "critic") {
      await context.service
        .from("social_generation_runs")
        .update({ status: "running", error_code: null, error_message: null })
        .eq("id", run.id);
      const drafts = run.checkpoint_payload?.drafts as GeneratedSocialVariant[];
      if (!Array.isArray(drafts)) throw new Error("missing_draft_checkpoint");
      const generated = await criticSocialVariants(modelContext, drafts);
      assertRequestedVariants(campaign, generated.variants);
      const strategy =
        campaign.generation_context?.visual?.strategy || "puna_editorial";
      const variants = generated.variants.map((variant) => ({
        ...variant,
        quality_flags: deterministicQualityFlags(variant, sources, strategy),
      }));
      await context.service
        .from("social_generation_runs")
        .update({
          status: "pending",
          stage: "persisting",
          checkpoint_payload: { drafts, critic: variants },
          request_id: generated.requestId,
          usage: { ...(run.usage || {}), critic: generated.usage },
          ...(contentQualityEnabled() ? { request_trace: { ...(run.request_trace || {}), critic: generated.requestId }, stage_timings: { ...(run.stage_timings || {}), critic: { duration_ms: generated.durationMs } } } : {}),
        })
        .eq("id", run.id);
    } else if (intent === "run_persisting" && run.stage === "persisting") {
      const persistingStarted = Date.now();
      await context.service
        .from("social_generation_runs")
        .update({ status: "running", error_code: null, error_message: null })
        .eq("id", run.id);
      const variants = run.checkpoint_payload
        ?.critic as GeneratedSocialVariant[];
      if (!Array.isArray(variants))
        throw new Error("missing_critic_checkpoint");
      const strategy =
        campaign.generation_context?.visual?.strategy || "puna_editorial";
      const linkedinFormat =
        campaign.generation_context?.visual?.linkedin_format ||
        "linkedin_square";
      const templates = await context.service
        .from("brand_media_templates")
        .select("id,name,output_format")
        .eq("is_active", true)
        .eq(
          "name",
          strategy === "approved_image" ? "Puna Imagen" : "Puna Editorial",
        );
      const enriched = variants.map((variant) => {
        const format =
          variant.channel === "instagram"
            ? "instagram_portrait"
            : variant.channel === "x"
              ? "x_horizontal"
              : linkedinFormat;
        const template = templates.data?.find(
          (item) => item.output_format === format,
        );
        return {
          ...variant,
          image_headline:
            campaign.generation_context?.visual?.headline ||
            variant.image_headline,
          image_alt:
            campaign.generation_context?.visual?.alt_text || variant.image_alt,
          media_strategy: strategy,
          brand_template_id:
            strategy === "text_only" ? null : template?.id || null,
        };
      });
      const persisted = await context.service.rpc(
        "persist_social_generation_variants",
        { target_run_id: run.id, target_variants: enriched },
      );
      if (persisted.error) throw new Error("persist_variants_failed");
      const resultRow = Array.isArray(persisted.data)
        ? persisted.data[0]
        : persisted.data;
      const draftIds = (resultRow?.draft_ids || []) as string[];
      if (!draftIds.length) throw new Error("persist_variants_failed");
      await context.service
        .from("social_generation_runs")
        .update({
          status: "pending",
          stage: "rendering",
          result_summary: { draft_ids: draftIds },
          ...(contentQualityEnabled() ? { stage_timings: { ...(run.stage_timings || {}), persisting: { duration_ms: Date.now() - persistingStarted } } } : {}),
        })
        .eq("id", run.id);
    } else if (intent === "run_rendering" && run.stage === "rendering") {
      const renderingStarted = Date.now();
      await context.service
        .from("social_generation_runs")
        .update({ status: "running", error_code: null, error_message: null })
        .eq("id", run.id);
      const draftIds = (run.result_summary?.draft_ids || []) as string[];
      const drafts = await context.service
        .from("content_distribution_drafts")
        .select("id,image_headline,media_strategy,brand_template_id")
        .in("id", draftIds);
      if (drafts.error) throw new Error("drafts_unavailable");
      for (const draft of drafts.data || []) {
        if (draft.media_strategy === "text_only") continue;
        const template = await context.service
          .from("brand_media_templates")
          .select("*")
          .eq("id", draft.brand_template_id)
          .maybeSingle();
        if (!template.data) throw new Error("template_unavailable");
        let sourceUrl: string | undefined;
        const assetId = campaign.generation_context?.visual?.asset_id;
        if (template.data.layout === "image_overlay") {
          const asset = await context.service
            .from("brand_media_assets")
            .select("storage_path")
            .eq("id", assetId)
            .eq("is_active", true)
            .maybeSingle();
          if (!asset.data) throw new Error("brand_asset_unavailable");
          const signed = await context.service.storage
            .from("brand-assets")
            .createSignedUrl(asset.data.storage_path, 600);
          if (!signed.data?.signedUrl)
            throw new Error("brand_asset_unavailable");
          sourceUrl = signed.data.signedUrl;
        }
        const outputPath = `${campaign.id}/${draft.id}.png`;
        const upload = await context.service.storage
          .from("generated-media")
          .createSignedUploadUrl(outputPath, { upsert: true });
        if (!upload.data?.signedUrl)
          throw new Error("media_upload_unavailable");
        const rendered = await renderContentOverlay(
          {
            layout: template.data.layout,
            output_format: template.data.output_format,
            ...(sourceUrl ? { source_url: sourceUrl } : {}),
            destination_upload_url: upload.data.signedUrl,
            output_path: outputPath,
            headline: String(draft.image_headline || campaign.title).slice(
              0,
              120,
            ),
            safe_zone: template.data.safe_zone,
            text_align: template.data.text_align,
            vertical_align: template.data.vertical_align,
            overlay_color: template.data.overlay_color,
            overlay_opacity: Number(template.data.overlay_opacity),
            text_color: template.data.text_color,
            min_font_size: template.data.min_font_size,
            max_font_size: template.data.max_font_size,
            logo_enabled: template.data.logo_enabled,
          },
          `${run.id}:${draft.id}`,
          run.id,
        );
        await context.service
          .from("content_distribution_drafts")
          .update({ media_urls: { primary: rendered } })
          .eq("id", draft.id);
      }
      const completedAt = new Date().toISOString();
      const telemetry = buildRunTelemetry({
        drafting: { usage: run.usage?.drafting, requestId: run.request_trace?.drafting, durationMs: run.stage_timings?.drafting?.duration_ms },
        critic: { usage: run.usage?.critic, requestId: run.request_trace?.critic, durationMs: run.stage_timings?.critic?.duration_ms },
        persisting: { durationMs: run.stage_timings?.persisting?.duration_ms },
        rendering: { requestId: run.id, durationMs: Date.now() - renderingStarted },
      }, run.started_at, completedAt);
      await context.service
        .from("social_generation_runs")
        .update({
          status: "succeeded",
          stage: "complete",
          checkpoint_payload: null,
          completed_at: completedAt,
          ...(contentQualityEnabled() ? telemetry : {}),
          error_code: null,
          error_message: null,
        })
        .eq("id", run.id);
      await audit(context, {
        action: "generate",
        entityType: "social_campaign",
        entityId: campaign.id,
        after: {
          run_id: run.id,
          draft_ids: run.result_summary?.draft_ids || [],
        },
      });
    } else
      return opsData(
        { error: "La etapa ya cambió. Recargá para continuar." },
        context.headers,
        409,
      );
    return opsData({ ok: true }, context.headers);
  } catch (error) {
    const code = generationErrorCode(error);
    const completedAt = new Date().toISOString();
    const requestId = typeof (error as any)?.requestId === "string" ? (error as any).requestId : "";
    await context.service
      .from("social_generation_runs")
      .update({
        status: "failed",
        error_code: code,
        error_message: safeMessage(error),
        ...(contentQualityEnabled() ? { retryable: isRetryableGenerationError(code), request_id: requestId || run.request_id || null, request_trace: requestId ? { ...(run.request_trace || {}), [run.stage]: requestId } : (run.request_trace || {}), duration_ms: run.started_at ? Math.max(0, Date.parse(completedAt) - Date.parse(run.started_at)) : null, completed_at: completedAt } : {}),
      })
      .eq("id", run.id);
    await context.service
      .from("social_campaigns")
      .update({
        status: run.stage === "rendering" ? "draft" : "generation_failed",
      })
      .eq("id", campaign.id);
    return opsData(
      {
        error:
          run.stage === "rendering"
            ? "El copy quedó guardado, pero faltó componer el medio. Reintentá esta etapa."
            : "La etapa falló. Reintentá sin volver a generar lo que ya está listo.",
      },
      context.headers,
      502,
    );
  }
}

function Steps({ step, campaignId }: { step: number; campaignId?: string }) {
  return (
    <nav className="ops-composer-steps" aria-label="Pasos del compositor">
      {["Objetivo y fuente", "Apertura", "Formato visual", "Confirmación"].map(
        (label, index) => {
          const number = index + 1;
          const href =
            campaignId && number <= step
              ? `/ops/social/new?campaign=${campaignId}&step=${number}`
              : undefined;
          return href ? (
            <Link
              key={label}
              to={href}
              className={
                number === step ? "active" : number < step ? "complete" : ""
              }
            >
              <span>{number < step ? <Check size={15} /> : number}</span>
              {label}
            </Link>
          ) : (
            <span key={label} className={number === step ? "active" : ""}>
              <span>{number}</span>
              {label}
            </span>
          );
        },
      )}
    </nav>
  );
}

function GenerationRunner({
  campaignId,
  run,
}: {
  campaignId: string;
  run: Record<string, any>;
}) {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const submitted = useRef("");
  const intent =
    run.stage === "drafting"
      ? "run_drafting"
      : run.stage === "critic"
        ? "run_critic"
        : run.stage === "persisting"
          ? "run_persisting"
          : run.stage === "rendering"
            ? "run_rendering"
            : "";
  useEffect(() => {
    const signature = `${run.id}:${run.stage}:${run.updated_at}`;
    if (
      intent &&
      run.status === "pending" &&
      fetcher.state === "idle" &&
      submitted.current !== signature
    ) {
      submitted.current = signature;
      fetcher.submit(
        { intent, campaign_id: campaignId, run_id: run.id },
        { method: "post" },
      );
    }
  }, [
    campaignId,
    fetcher,
    intent,
    run.id,
    run.stage,
    run.status,
    run.updated_at,
  ]);
  const labels: Record<string, string> = {
    drafting: "Redactando variantes",
    critic: "Revisando evidencia y calidad",
    persisting: "Guardando borradores",
    rendering: "Componiendo piezas visuales",
    complete: "Generación completa",
  };
  if (run.status === "succeeded" && run.stage === "complete")
    return (
      <Notice tone="success">
        Borradores y medios listos.{" "}
        <Link to={`/ops/social/${campaignId}`}>Abrir campaña</Link>
      </Notice>
    );
  if (run.status === "failed")
    return (
      <div className="ops-generation-failed" role="alert">
        <strong>{run.error_message || "La etapa no pudo completarse."}</strong>
        <p>Lo ya completado permanece guardado.</p>
        <fetcher.Form method="post">
          <input type="hidden" name="campaign_id" value={campaignId} />
          <input type="hidden" name="run_id" value={run.id} />
          <button className="ops-button" name="intent" value={intent}>
            Reintentar {labels[run.stage]?.toLowerCase()}
          </button>
        </fetcher.Form>
      </div>
    );
  return (
    <div className="ops-generation-progress" role="status" aria-live="polite">
      <LoaderCircle aria-hidden="true" />
      <div>
        <strong>{labels[run.stage] || "Preparando"}</strong>
        <p>
          Etapa{" "}
          {["drafting", "critic", "persisting", "rendering"].indexOf(
            run.stage,
          ) + 1}{" "}
          de 4. No cierres esta pestaña.
        </p>
      </div>
    </div>
  );
}

export default function OpsSocialNew({
  loaderData,
  actionData,
}: {
  loaderData: any;
  actionData?: { error?: string };
}) {
  const { campaign, step, assets, run } = loaderData;
  const visual = campaign?.generation_context?.visual || {};
  return (
    <>
      <Link className="ops-back" to="/ops/social">
        <ArrowLeft aria-hidden="true" size={16} />
        Volver a Social Studio
      </Link>
      <OpsPageHeader
        eyebrow="Nueva campaña"
        title="Compositor profesional"
        description="Convertí una fuente verificable en variantes listas para revisión humana."
      />
      <Steps step={step} campaignId={campaign?.id} />
      {actionData?.error ? (
        <Notice tone="error">{actionData.error}</Notice>
      ) : null}
      {step === 1 ? (
        <Form method="post" className="ops-panel ops-form ops-composer-form">
          <input type="hidden" name="intent" value="save_context" />
          {campaign ? (
            <input type="hidden" name="campaign_id" value={campaign.id} />
          ) : null}
          <div className="ops-field-grid">
            <Field label="Objetivo" name="objective" required>
              <select
                name="objective"
                defaultValue={campaign?.objective || "educate"}
              >
                {Object.entries(objectives).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Servicio" name="service_cluster" required>
              <select
                name="service_cluster"
                defaultValue={campaign?.service_cluster || "ai-automation"}
              >
                {Object.entries(services).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label="Audiencia"
            name="audience"
            value={campaign?.audience}
            required
            hint="Ej.: responsables de operaciones en agencias B2B"
          />
          <TextAreaField
            label="Problema operativo"
            name="problem_statement"
            value={campaign?.problem_statement}
            required
            rows={4}
          />
          {loaderData.qualityEnabled ? <Field
            label="Destino del CTA"
            name="cta_url"
            type="url"
            value={campaign?.cta_url}
            hint="URL HTTPS para auditoría, servicio o artículo. El objetivo Conversar no requiere enlace."
          /> : null}
          <div className="ops-field-grid">
            <Field label="Tipo de fuente" name="source_type">
              <select
                name="source_type"
                defaultValue={campaign?.source_type || "article"}
              >
                {Object.entries(sourceTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fuente existente" name="source_id">
              <select name="source_id" defaultValue={campaign?.source_id || ""}>
                <option value="">Elegir…</option>
                <optgroup label="Artículos">
                  {loaderData.articles.map((item: any) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Briefs">
                  {loaderData.briefs.map((item: any) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Imágenes activas">
                  {assets.map((item: any) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>
          </div>
          <Field
            label="Título interno / tema manual"
            name="title"
            value={campaign?.title}
          />
          <TextAreaField
            label="Fuentes manuales"
            name="manual_sources"
            rows={4}
            hint="Una por línea: Título | https://fuente.com | extracto exacto que respalda el dato"
          />
          <label className="ops-check">
            <input
              type="checkbox"
              name="confidentiality_confirmed"
              value="yes"
              defaultChecked
            />
            <span>
              Confirmo que el contexto no contiene información confidencial.
            </span>
          </label>
          <fieldset className="ops-choice-group">
            <legend>Idiomas</legend>
            <label>
              <input
                type="checkbox"
                name="locales"
                value="es"
                defaultChecked={
                  campaign
                    ? campaign.locale_strategy?.locales?.includes("es")
                    : true
                }
              />
              Español
            </label>
            <label>
              <input
                type="checkbox"
                name="locales"
                value="en"
                defaultChecked={campaign?.locale_strategy?.locales?.includes(
                  "en",
                )}
              />
              English
            </label>
          </fieldset>
          <fieldset className="ops-choice-group">
            <legend>Canales</legend>
            <label>
              <input
                type="checkbox"
                name="channels"
                value="linkedin"
                defaultChecked={
                  campaign
                    ? campaign.locale_strategy?.channels?.includes("linkedin")
                    : true
                }
              />
              LinkedIn
            </label>
            <label>
              <input
                type="checkbox"
                name="channels"
                value="instagram"
                defaultChecked={
                  campaign
                    ? campaign.locale_strategy?.channels?.includes("instagram")
                    : true
                }
              />
              Instagram
            </label>
            <label>
              <input
                type="checkbox"
                name="channels"
                value="x"
                defaultChecked={campaign?.locale_strategy?.channels?.includes(
                  "x",
                )}
              />
              X
            </label>
          </fieldset>
          <div className="ops-field-grid">
            <Field
              label="CTA automático"
              name="cta_preview"
              hint="Educar → artículo · Demostrar → servicio · Conversar → conversación · Convertir → auditoría"
            >
              <input
                name="cta_preview"
                value={
                  campaign?.cta_type
                    ? ctaTypes[campaign.cta_type as keyof typeof ctaTypes]
                    : "Se define según el objetivo al guardar"
                }
                readOnly
                aria-readonly="true"
              />
            </Field>
            <Field
              label="Ajuste de tono"
              name="tone_notes"
              value={campaign?.generation_context?.tone_notes}
            />
          </div>
          <button className="ops-button" type="submit">
            Guardar y elegir apertura <ArrowRight size={16} />
          </button>
        </Form>
      ) : null}
      {step === 2 && campaign ? (
        <section className="ops-panel ops-composer-section">
          <header>
            <div>
              <p className="ops-eyebrow">Paso 2</p>
              <h2>Elegí cómo abrir la publicación</h2>
            </div>
            {campaign.selected_opening ? (
              <StatusBadge value="selected" />
            ) : null}
          </header>
          {campaign.opening_options?.length ? (
            <div className="ops-opening-grid">
              {campaign.opening_options.map(
                (option: OpeningOption, index: number) => (
                  <Form
                    method="post"
                    className="ops-opening-card"
                    key={`${option.kind}-${index}`}
                  >
                    <input
                      type="hidden"
                      name="campaign_id"
                      value={campaign.id}
                    />
                    <input type="hidden" name="opening_index" value={index} />
                    <span>{openingLabels[option.kind]}</span>
                    <textarea
                      name="opening_text"
                      defaultValue={option.text}
                      maxLength={500}
                      rows={5}
                    />
                    <p>{option.rationale}</p>
                    {option.warnings?.length ? (
                      <ul>
                        {option.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    ) : null}
                    <button
                      className="ops-button ops-button-secondary"
                      name="intent"
                      value="select_opening"
                    >
                      Usar esta apertura
                    </button>
                  </Form>
                ),
              )}
            </div>
          ) : (
            <Form method="post">
              <input type="hidden" name="campaign_id" value={campaign.id} />
              <input
                type="hidden"
                name="idempotency_key"
                value={loaderData.actionKey}
              />
              <button
                className="ops-button"
                name="intent"
                value="generate_openings"
              >
                <Sparkles size={17} />
                Generar tres aperturas
              </button>
            </Form>
          )}
        </section>
      ) : null}
      {step === 3 && campaign ? (
        <Form method="post" className="ops-panel ops-form ops-composer-form">
          <input type="hidden" name="campaign_id" value={campaign.id} />
          <h2>Formato visual</h2>
          <fieldset className="ops-visual-options">
            <legend>Elegí un resultado</legend>
            <label>
              <input
                type="radio"
                name="media_strategy"
                value="puna_editorial"
                defaultChecked={
                  (visual.strategy || "puna_editorial") === "puna_editorial"
                }
              />
              <span>
                <Shapes />
                Puna Editorial<small>Grilla, marca y título legible.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="media_strategy"
                value="approved_image"
                defaultChecked={visual.strategy === "approved_image"}
              />
              <span>
                <ImageIcon />
                Imagen aprobada + título
                <small>Usa una imagen activa de la biblioteca.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="media_strategy"
                value="text_only"
                defaultChecked={visual.strategy === "text_only"}
              />
              <span>
                Solo texto<small>No compone ningún archivo.</small>
              </span>
            </label>
          </fieldset>
          <Field label="Imagen aprobada" name="asset_id">
            <select name="asset_id" defaultValue={visual.asset_id || ""}>
              <option value="">Elegir cuando corresponda…</option>
              {assets.map((asset: any) => (
                <option key={asset.id} value={asset.id}>
                  {asset.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Formato de LinkedIn" name="linkedin_format">
            <select
              name="linkedin_format"
              defaultValue={visual.linkedin_format || "linkedin_square"}
            >
              <option value="linkedin_square">Cuadrado 1080×1080</option>
              <option value="linkedin_horizontal">Horizontal 1200×627</option>
            </select>
          </Field>
          <Field
            label="Título visual"
            name="visual_headline"
            value={
              visual.headline || campaign.selected_opening?.text?.slice(0, 120)
            }
            maxLength={120}
          />
          <TextAreaField
            label="Texto alternativo"
            name="visual_alt"
            value={visual.alt_text}
            rows={3}
          />
          <div className="ops-crop-preview">
            <div className="instagram">
              <span>{visual.headline || campaign.selected_opening?.text}</span>
            </div>
            <div className="linkedin">
              <span>{visual.headline || campaign.selected_opening?.text}</span>
            </div>
          </div>
          <button className="ops-button" name="intent" value="save_visual">
            Revisar configuración <ArrowRight size={16} />
          </button>
        </Form>
      ) : null}
      {step === 4 && campaign ? (
        <section className="ops-panel ops-composer-confirm">
          <h2>Confirmación</h2>
          <dl className="ops-definition">
            <div>
              <dt>Objetivo</dt>
              <dd>
                {objectives[campaign.objective as keyof typeof objectives]}
              </dd>
            </div>
            <div>
              <dt>Audiencia</dt>
              <dd>{campaign.audience}</dd>
            </div>
            <div>
              <dt>Canales</dt>
              <dd>{campaign.locale_strategy.channels.join(", ")}</dd>
            </div>
            <div>
              <dt>Idiomas</dt>
              <dd>{campaign.locale_strategy.locales.join(", ")}</dd>
            </div>
            <div>
              <dt>Apertura</dt>
              <dd>{campaign.selected_opening?.text}</dd>
            </div>
            <div>
              <dt>Formato</dt>
              <dd>
                {visual.strategy === "puna_editorial"
                  ? "Puna Editorial"
                  : visual.strategy === "approved_image"
                    ? "Imagen aprobada + título"
                    : "Solo texto"}
              </dd>
            </div>
          </dl>
          {run ? (
            <GenerationRunner campaignId={campaign.id} run={run} />
          ) : (
            <Form method="post">
              <input type="hidden" name="campaign_id" value={campaign.id} />
              <input
                type="hidden"
                name="idempotency_key"
                value={loaderData.actionKey}
              />
              <button
                className="ops-button"
                name="intent"
                value="start_generation"
              >
                <Sparkles size={17} />
                Generar borradores
              </button>
            </Form>
          )}
        </section>
      ) : null}
    </>
  );
}
