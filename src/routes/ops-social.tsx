import type { LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { ArrowRight, FileText, Languages, Send } from "lucide-react";
import { EmptyState, OpsPageHeader, Pager, StatusBadge, formatDate } from "../components/ops";
import { operationsHeaders, opsData, pageFrom, paginationRange, requireAdmin } from "../lib/admin.server";
import { contentStudioEnabled } from "../lib/content-worker.server";
import {
  SOCIAL_CHANNELS,
  SOCIAL_DRAFT_STATUSES,
  SOCIAL_LOCALES,
  isSocialChannel,
  isSocialLocale,
  isSocialStatus,
  socialChannelLabel,
  socialLocaleLabel,
} from "../lib/social-studio";

type CampaignRow = {
  id: string;
  title: string;
  source_type: string;
  source_id: string;
  status: string;
  updated_at: string;
};

type VariantSummary = {
  id: string;
  campaign_id: string;
  channel: string;
  locale: string;
  status: string;
  updated_at: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentStudioEnabled()) throw redirect("/ops/distribution", { headers: operationsHeaders(context.headers) });

  const url = new URL(request.url);
  const page = pageFrom(request);
  const statusParam = url.searchParams.get("status");
  const status = statusParam === null ? "attention" : statusParam;
  const channel = url.searchParams.get("channel") || "";
  const locale = url.searchParams.get("locale") || "";
  const validStatus = status === "attention" || status === "all" || isSocialStatus(status) ? status : "attention";
  const validChannel = isSocialChannel(channel) ? channel : "";
  const validLocale = isSocialLocale(locale) ? locale : "";
  const { from, to } = paginationRange(page);

  let query = context.service
    .from("social_campaigns")
    .select("id,title,source_type,source_id,status,updated_at,content_distribution_drafts!inner(id)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (validStatus === "attention") query = query.in("status", ["draft", "rejected"]);
  else if (validStatus !== "all") query = query.eq("status", validStatus);
  if (validChannel) query = query.eq("content_distribution_drafts.channel", validChannel);
  if (validLocale) query = query.eq("content_distribution_drafts.locale", validLocale);

  const result = await query;
  if (result.error) throw new Response("No se pudo cargar Social Studio.", { status: 500 });
  const campaigns = (result.data || []) as unknown as CampaignRow[];
  const campaignIds = campaigns.map((campaign) => campaign.id);
  let variants: VariantSummary[] = [];
  if (campaignIds.length) {
    const variantResult = await context.service
      .from("content_distribution_drafts")
      .select("id,campaign_id,channel,locale,status,updated_at")
      .in("campaign_id", campaignIds)
      .order("locale")
      .order("channel");
    if (variantResult.error) throw new Response("No se pudieron cargar las variantes sociales.", { status: 500 });
    variants = (variantResult.data || []) as VariantSummary[];
  }

  return opsData({
    campaigns: campaigns.map((campaign) => ({ ...campaign, variants: variants.filter((variant) => variant.campaign_id === campaign.id) })),
    count: result.count,
    page,
    filters: { status: validStatus, channel: validChannel, locale: validLocale },
  }, context.headers);
}

export default function OpsSocial({ loaderData }: { loaderData: { campaigns: Array<CampaignRow & { variants: VariantSummary[] }>; count: number | null; page: number; filters: { status: string; channel: string; locale: string } } }) {
  const params = new URLSearchParams();
  if (loaderData.filters.status !== "attention") params.set("status", loaderData.filters.status);
  if (loaderData.filters.channel) params.set("channel", loaderData.filters.channel);
  if (loaderData.filters.locale) params.set("locale", loaderData.filters.locale);

  return <>
    <OpsPageHeader eyebrow="Editorial · Social" title="Social Studio" description="Revisá cada campaña por canal e idioma. Aprobar deja el contenido listo; nunca lo programa ni lo publica."/>
    <Form method="get" className="ops-filters ops-social-filters">
      <label><span>Atención</span><select name="status" defaultValue={loaderData.filters.status}><option value="attention">Necesita revisión</option><option value="all">Todas</option>{SOCIAL_DRAFT_STATUSES.map((item) => <option key={item} value={item}>{item === "draft" ? "Borrador" : item === "approved" ? "Aprobado" : item === "rejected" ? "Rechazado" : item === "published" ? "Publicado" : "Archivado"}</option>)}</select></label>
      <label><span>Canal</span><select name="channel" defaultValue={loaderData.filters.channel}><option value="">Todos</option>{SOCIAL_CHANNELS.map((item) => <option key={item} value={item}>{socialChannelLabel(item)}</option>)}</select></label>
      <label><span>Idioma</span><select name="locale" defaultValue={loaderData.filters.locale}><option value="">Todos</option>{SOCIAL_LOCALES.map((item) => <option key={item} value={item}>{socialLocaleLabel(item)}</option>)}</select></label>
      <button className="ops-button ops-button-secondary">Aplicar filtros</button>
    </Form>

    {loaderData.campaigns.length ? <div className="ops-campaign-list">
      {loaderData.campaigns.map((campaign) => {
        const attentionCount = campaign.variants.filter((variant) => variant.status === "draft" || variant.status === "rejected").length;
        return <article className="ops-campaign-row" key={campaign.id}>
          <div className="ops-campaign-source"><span><FileText aria-hidden="true" size={19}/></span><div><small>Campaña desde artículo</small><h2>{campaign.title}</h2><Link to={`/ops/content/${campaign.source_id}`}>Ver artículo fuente</Link></div></div>
          <div className="ops-campaign-variants" aria-label={`${campaign.variants.length} variantes`}>
            {campaign.variants.map((variant) => <span className={`ops-variant-chip ops-variant-chip-${variant.status}`} key={variant.id}><Send aria-hidden="true" size={13}/>{socialChannelLabel(variant.channel)} · {variant.locale.toUpperCase()}</span>)}
          </div>
          <div className="ops-campaign-state"><StatusBadge value={campaign.status}/><small>{attentionCount ? `${attentionCount} requieren atención` : "Sin pendientes"}</small><time dateTime={campaign.updated_at}>Actualizada {formatDate(campaign.updated_at, true)}</time></div>
          <Link className="ops-button ops-button-secondary ops-campaign-review" to={`/ops/social/${campaign.id}`}><Languages aria-hidden="true" size={17}/>Revisar<ArrowRight aria-hidden="true" size={16}/></Link>
        </article>;
      })}
    </div> : <EmptyState title="No hay campañas en esta vista" body="Probá cambiar los filtros. Los próximos borradores de n8n se agruparán automáticamente por artículo."/>}
    <Pager page={loaderData.page} count={loaderData.count} path="/ops/social" params={params}/>
  </>;
}
