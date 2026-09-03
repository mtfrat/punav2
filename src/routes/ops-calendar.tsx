import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CalendarDays, Check, Clock3, ExternalLink, List, RotateCcw, Send } from "lucide-react";
import { EmptyState, Notice, OpsPageHeader, Pager, StatusBadge } from "../components/ops";
import { audit, assertTrustedMutation, operationsHeaders, opsData, pageFrom, requireAdmin, stringField } from "../lib/admin.server";
import { contentCalendarEnabled } from "../lib/content-worker.server";
import {
  CALENDAR_PAGE_SIZE,
  CONTENT_TIME_ZONE,
  addCalendarDays,
  calendarCollisionMessage,
  calendarDateTimeInput,
  calendarWeekDays,
  calendarWeekRange,
  calendarWeekStart,
  formatCalendarDateTime,
  formatCalendarDay,
  formatCalendarTime,
  isCalendarRange,
  isCalendarStatus,
  isCalendarView,
  isSafeCalendarReturnTo,
  todayCalendarKey,
} from "../lib/social-calendar";
import { SocialScheduleError, scheduleSocialVariant, unscheduleSocialVariant, type ScheduleConflict } from "../lib/social-scheduling.server";
import { SOCIAL_CHANNELS, isSocialChannel, isUuid, socialChannelLabel, socialLocaleLabel, type SocialChannel } from "../lib/social-studio";

type CalendarItem = {
  id: string;
  campaign_id: string;
  channel: string;
  locale: string;
  status: string;
  content: string;
  image_alt: string | null;
  media_urls: { primary?: { output_path?: string } } | null;
  scheduled_for: string;
  published_at: string | null;
  updated_at: string;
  social_campaigns: { title: string } | Array<{ title: string }> | null;
};

type ActionData = {
  error?: string;
  fieldError?: string;
  pending?: { variantId: string; updatedAt: string; localScheduledFor: string; returnTo: string };
  conflicts?: ScheduleConflict[];
};

function campaignTitle(item: CalendarItem) {
  return Array.isArray(item.social_campaigns) ? item.social_campaigns[0]?.title || "Campaña" : item.social_campaigns?.title || "Campaña";
}

function queryString(input: Record<string, string>, omit: string[] = []) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) if (value && !omit.includes(key)) params.set(key, value);
  return params;
}

function withoutSelectedVariant(value: string) {
  const url = new URL(value, "https://ops.puna.local");
  url.searchParams.delete("variant");
  return `${url.pathname}${url.search}`;
}

function actionFailure(context: Awaited<ReturnType<typeof requireAdmin>>, error: string, status: number, extra: Omit<ActionData, "error"> = {}) {
  return opsData({ error, ...extra } satisfies ActionData, context.headers, status);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentCalendarEnabled()) throw redirect("/ops/social", { headers: operationsHeaders(context.headers) });
  const url = new URL(request.url);
  const rawView = url.searchParams.get("view") || "week";
  const rawRange = url.searchParams.get("range") || "upcoming";
  const rawStatus = url.searchParams.get("status") || "";
  const rawChannel = url.searchParams.get("channel") || "";
  const view = isCalendarView(rawView) ? rawView : "week";
  const range = isCalendarRange(rawRange) ? rawRange : "upcoming";
  const status = isCalendarStatus(rawStatus) ? rawStatus : "";
  const channel = isSocialChannel(rawChannel) ? rawChannel : "";
  const week = calendarWeekStart(url.searchParams.get("week"));
  const page = pageFrom(request);
  const now = new Date().toISOString();

  let query = context.service
    .from("content_distribution_drafts")
    .select("id,campaign_id,channel,locale,status,content,image_alt,media_urls,scheduled_for,published_at,updated_at,social_campaigns(title)", { count: "exact" })
    .not("scheduled_for", "is", null);
  if (channel) query = query.eq("channel", channel);
  if (status) query = query.eq("status", status);
  else query = query.in("status", ["scheduled", "published"]);

  if (view === "week") {
    const bounds = calendarWeekRange(week);
    query = query.gte("scheduled_for", bounds.from).lt("scheduled_for", bounds.to).order("scheduled_for", { ascending: true });
  } else {
    if (range === "upcoming") query = query.gte("scheduled_for", now);
    else if (range === "past") query = query.lt("scheduled_for", now);
    query = query.order("scheduled_for", { ascending: range !== "past" }).range((page - 1) * CALENDAR_PAGE_SIZE, page * CALENDAR_PAGE_SIZE - 1);
  }

  const result = await query;
  if (result.error) throw new Response("No se pudo cargar el calendario.", { status: 500 });
  const items = (result.data || []) as unknown as CalendarItem[];
  const requestedVariant = url.searchParams.get("variant") || "";
  let selected = items.find((item) => item.id === requestedVariant) || null;
  if (!selected && isUuid(requestedVariant)) {
    const selectedResult = await context.service
      .from("content_distribution_drafts")
      .select("id,campaign_id,channel,locale,status,content,image_alt,media_urls,scheduled_for,published_at,updated_at,social_campaigns(title)")
      .eq("id", requestedVariant)
      .not("scheduled_for", "is", null)
      .maybeSingle();
    selected = selectedResult.data as unknown as CalendarItem | null;
  }

  let collisionRows: Array<{ id: string; channel: string; scheduled_for: string }> = [];
  if (items.length) {
    const times = items.map((item) => new Date(item.scheduled_for).valueOf());
    const collisionResult = await context.service
      .from("content_distribution_drafts")
      .select("id,channel,scheduled_for")
      .eq("status", "scheduled")
      .gte("scheduled_for", new Date(Math.min(...times) - 7_200_000).toISOString())
      .lte("scheduled_for", new Date(Math.max(...times) + 7_200_000).toISOString());
    collisionRows = (collisionResult.data || []) as Array<{ id: string; channel: string; scheduled_for: string }>;
  }
  const collisionCount = (item: CalendarItem) => collisionRows.filter((other) => other.id !== item.id && other.channel === item.channel && Math.abs(new Date(other.scheduled_for).valueOf() - new Date(item.scheduled_for).valueOf()) < 7_200_000).length;

  let mediaUrl: string | null = null;
  const mediaPath = selected?.media_urls?.primary?.output_path;
  if (mediaPath) mediaUrl = (await context.service.storage.from("generated-media").createSignedUrl(mediaPath, 1800)).data?.signedUrl || null;

  const filters = { view, range, status, channel, week, variant: requestedVariant };
  const returnTo = `/ops/calendar${url.search}`;
  return opsData({ items, selected, mediaUrl, count: result.count, page, filters, returnTo, collisionCounts: Object.fromEntries(items.map((item) => [item.id, collisionCount(item)])), today: todayCalendarKey() }, context.headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  if (!contentCalendarEnabled()) return actionFailure(context, "El calendario está deshabilitado.", 503);
  const form = await request.formData();
  const intent = stringField(form, "intent", 40);
  const variantId = stringField(form, "variant_id", 80);
  const updatedAt = stringField(form, "updated_at", 80);
  const requestedReturnTo = stringField(form, "return_to", 2000);
  const returnTo = isSafeCalendarReturnTo(requestedReturnTo) ? requestedReturnTo : "/ops/calendar";

  try {
    if (intent === "schedule_variant" || intent === "reschedule_variant") {
      const localScheduledFor = stringField(form, "scheduled_for", 30);
      const allowConflict = form.get("confirm_conflict") === "yes";
      const result = await scheduleSocialVariant(context, { variantId, expectedUpdatedAt: updatedAt, localScheduledFor, allowConflict });
      if (!result.applied) {
        return actionFailure(context, calendarCollisionMessage(result.conflicts.length || 1, result.before.channel as SocialChannel), 409, {
          fieldError: "Revisá el horario o confirmá que querés mantenerlo.",
          pending: { variantId, updatedAt, localScheduledFor, returnTo },
          conflicts: result.conflicts,
        });
      }
      throw redirect(returnTo, { headers: operationsHeaders(context.headers) });
    }
    if (intent === "unschedule_variant") {
      await unscheduleSocialVariant(context, { variantId, expectedUpdatedAt: updatedAt });
      throw redirect(withoutSelectedVariant(returnTo), { headers: operationsHeaders(context.headers) });
    }
    if (intent === "mark_published") {
      if (!isUuid(variantId)) return actionFailure(context, "Variante inválida.", 404);
      const before = await context.service.from("content_distribution_drafts").select("id,campaign_id,channel,status,scheduled_for,updated_at").eq("id", variantId).maybeSingle();
      if (!before.data) return actionFailure(context, "Variante no encontrada.", 404);
      if (before.data.updated_at !== updatedAt) return actionFailure(context, "La variante cambió en otra pestaña. Recargá antes de continuar.", 409);
      if (before.data.status !== "scheduled") return actionFailure(context, "Sólo una variante programada puede publicarse desde el calendario.", 409);
      const publishedAt = new Date().toISOString();
      const update = await context.service.from("content_distribution_drafts").update({ status: "published", published_at: publishedAt }).eq("id", variantId).eq("updated_at", updatedAt).select("id,updated_at").maybeSingle();
      if (!update.data) return actionFailure(context, "La variante cambió mientras la actualizabas. Recargá.", 409);
      await audit(context, { action: "mark_published", entityType: "distribution_draft", entityId: variantId, before: { status: before.data.status, channel: before.data.channel, scheduled_for: before.data.scheduled_for }, after: { status: "published", channel: before.data.channel, scheduled_for: before.data.scheduled_for, published_at: publishedAt } });
      throw redirect(returnTo, { headers: operationsHeaders(context.headers) });
    }
    return actionFailure(context, "Acción de calendario inválida.", 400);
  } catch (error) {
    if (error instanceof Response) throw error;
    if (error instanceof SocialScheduleError) return actionFailure(context, error.message, error.status, { fieldError: error.status === 422 ? error.message : undefined });
    return actionFailure(context, "No se pudo actualizar el calendario.", 500);
  }
}

function CalendarCard({ item, href, collisions }: { item: CalendarItem; href: string; collisions: number; key?: string }) {
  return <Link className={`ops-calendar-card ops-calendar-card-${item.status}`} to={href} aria-label={`${campaignTitle(item)}, ${socialChannelLabel(item.channel)}, ${formatCalendarDateTime(item.scheduled_for)}`}>
    <time dateTime={item.scheduled_for}>{formatCalendarTime(item.scheduled_for)}</time>
    <strong>{campaignTitle(item)}</strong>
    <span>{socialChannelLabel(item.channel)} · {socialLocaleLabel(item.locale)}</span>
    <StatusBadge value={item.status}/>
    {collisions ? <small className="ops-calendar-warning"><AlertTriangle size={14}/>{calendarCollisionMessage(collisions, item.channel as SocialChannel)}</small> : null}
  </Link>;
}

export default function OpsCalendar({ loaderData, actionData }: { loaderData: any; actionData?: ActionData }) {
  const { filters } = loaderData;
  const base = { view: filters.view, range: filters.range, status: filters.status, channel: filters.channel, week: filters.week };
  const weekDays = calendarWeekDays(filters.week);
  const hrefForVariant = (id: string) => `/ops/calendar?${queryString({ ...base, variant: id })}`;
  const previousWeek = `/ops/calendar?${queryString({ ...base, week: addCalendarDays(filters.week, -7) })}`;
  const nextWeek = `/ops/calendar?${queryString({ ...base, week: addCalendarDays(filters.week, 7) })}`;
  const thisWeek = `/ops/calendar?${queryString({ ...base, week: calendarWeekStart(loaderData.today) })}`;
  const listGroups = new Map<string, CalendarItem[]>();
  for (const item of loaderData.items as CalendarItem[]) {
    const key = calendarDateTimeInput(item.scheduled_for).slice(0, 10);
    listGroups.set(key, [...(listGroups.get(key) || []), item]);
  }
  const selected = loaderData.selected as CalendarItem | null;
  const formReturnTo = loaderData.returnTo;

  return <>
    <OpsPageHeader eyebrow="Editorial · Planificación" title="Calendario editorial" description="Fechas reales en hora de Buenos Aires. Programar organiza el trabajo; nunca publica automáticamente." action={<Link className="ops-button" to="/ops/social?status=approved"><CalendarClock size={17}/>Programar contenido</Link>}/>
    {actionData?.error ? <div className="ops-notice ops-notice-error" role="alert" tabIndex={-1}><strong>{actionData.error}</strong>{actionData.fieldError ? <p>{actionData.fieldError}</p> : null}</div> : null}
    {actionData?.pending ? <section className="ops-calendar-conflict" aria-labelledby="calendar-conflict-title"><AlertTriangle aria-hidden="true"/><div><h2 id="calendar-conflict-title">Confirmar horario con colisión</h2>{actionData.conflicts?.map((item) => <p key={item.id}><strong>{item.campaign_title}</strong> · {formatCalendarDateTime(item.scheduled_for)}</p>)}<Form method="post"><input type="hidden" name="intent" value="schedule_variant"/><input type="hidden" name="variant_id" value={actionData.pending.variantId}/><input type="hidden" name="updated_at" value={actionData.pending.updatedAt}/><input type="hidden" name="scheduled_for" value={actionData.pending.localScheduledFor}/><input type="hidden" name="return_to" value={actionData.pending.returnTo}/><input type="hidden" name="confirm_conflict" value="yes"/><button className="ops-button" type="submit">Programar igualmente</button></Form></div></section> : null}

    <div className="ops-calendar-toolbar">
      <nav aria-label="Vista del calendario"><Link className={filters.view === "week" ? "active" : ""} to={`/ops/calendar?${queryString({ ...base, view: "week" })}`}><CalendarDays size={16}/>Semana</Link><Link className={filters.view === "list" ? "active" : ""} to={`/ops/calendar?${queryString({ ...base, view: "list" })}`}><List size={16}/>Lista</Link></nav>
      <span><Clock3 size={15}/>Hora de Buenos Aires · {CONTENT_TIME_ZONE}</span>
    </div>
    <Form method="get" className="ops-filters ops-calendar-filters">
      <input type="hidden" name="view" value={filters.view}/><input type="hidden" name="week" value={filters.week}/>
      <label><span>Canal</span><select name="channel" defaultValue={filters.channel}><option value="">Todos</option>{SOCIAL_CHANNELS.map((item) => <option value={item} key={item}>{socialChannelLabel(item)}</option>)}</select></label>
      <label><span>Estado</span><select name="status" defaultValue={filters.status}><option value="">Programados y publicados</option><option value="scheduled">Programados</option><option value="published">Publicados</option></select></label>
      {filters.view === "list" ? <label><span>Período</span><select name="range" defaultValue={filters.range}><option value="upcoming">Próximas</option><option value="past">Anteriores</option><option value="all">Todas</option></select></label> : <input type="hidden" name="range" value={filters.range}/>}<button className="ops-button ops-button-secondary">Aplicar filtros</button>
    </Form>

    {filters.view === "week" ? <section className="ops-calendar-week" aria-label={`Semana del ${formatCalendarDay(filters.week)}`}>
      <header className="ops-calendar-week-nav"><Link to={previousWeek} aria-label="Semana anterior"><ArrowLeft size={17}/>Anterior</Link><div><strong>{formatCalendarDay(filters.week)} — {formatCalendarDay(addCalendarDays(filters.week, 6))}</strong><Link to={thisWeek}>Esta semana</Link></div><Link to={nextWeek} aria-label="Semana siguiente">Siguiente<ArrowRight size={17}/></Link></header>
      <div className="ops-calendar-days">{weekDays.map((day) => { const items = (loaderData.items as CalendarItem[]).filter((item) => calendarDateTimeInput(item.scheduled_for).startsWith(day)); return <section className={day === loaderData.today ? "is-today" : ""} key={day}><h2><span>{formatCalendarDay(day)}</span>{day === loaderData.today ? <small>Hoy</small> : null}</h2><div>{items.length ? items.map((item) => <CalendarCard key={item.id} item={item} href={hrefForVariant(item.id)} collisions={loaderData.collisionCounts[item.id] || 0}/>) : <p>Sin publicaciones</p>}</div></section>; })}</div>
    </section> : <section className="ops-calendar-list" aria-label="Publicaciones programadas">{listGroups.size ? [...listGroups].map(([day, items]) => <section key={day}><h2>{formatCalendarDay(day)}</h2><div>{items.map((item) => <CalendarCard key={item.id} item={item} href={hrefForVariant(item.id)} collisions={loaderData.collisionCounts[item.id] || 0}/>)}</div></section>) : <EmptyState title="No hay publicaciones con fecha real" body="Aprobá una variante y asignale una fecha desde Social Studio."/>}</section>}

    {filters.view === "list" ? <Pager page={loaderData.page} count={loaderData.count} path="/ops/calendar" params={queryString(base, ["variant"])}/> : null}

    {selected ? <aside className="ops-calendar-detail" aria-labelledby="calendar-detail-title">
      <header><div><p className="ops-eyebrow">{socialChannelLabel(selected.channel)} · {socialLocaleLabel(selected.locale)}</p><h2 id="calendar-detail-title">{campaignTitle(selected)}</h2></div><Link to={`/ops/calendar?${queryString(base)}`} aria-label="Cerrar detalle">×</Link></header>
      <div className="ops-calendar-detail-body"><StatusBadge value={selected.status}/><dl><div><dt>Programada</dt><dd>{formatCalendarDateTime(selected.scheduled_for)}</dd></div>{selected.published_at ? <div><dt>Publicada</dt><dd>{formatCalendarDateTime(selected.published_at)}</dd></div> : null}</dl><p className="ops-calendar-copy">{selected.content}</p>{loaderData.mediaUrl ? <img src={loaderData.mediaUrl} alt={selected.image_alt || "Pieza visual programada"}/> : null}<Link className="ops-source-link" to={`/ops/social/${selected.campaign_id}?variant=${selected.id}&return_to=${encodeURIComponent(formReturnTo)}`}><ExternalLink size={16}/>Abrir revisión completa</Link>
        {selected.status === "scheduled" ? <><Form method="post" className="ops-form ops-calendar-schedule-form"><input type="hidden" name="intent" value="reschedule_variant"/><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={formReturnTo}/><label className="ops-field"><span>Fecha y hora de Buenos Aires</span><input type="datetime-local" name="scheduled_for" step="900" min={`${loaderData.today}T00:00`} defaultValue={calendarDateTimeInput(selected.scheduled_for)} required/></label><button className="ops-button" type="submit"><RotateCcw size={16}/>Reprogramar</button></Form><div className="ops-review-buttons"><Form method="post"><input type="hidden" name="intent" value="mark_published"/><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={formReturnTo}/><button className="ops-button ops-button-secondary" type="submit" onClick={(event) => { if (!window.confirm("Confirmá únicamente si ya publicaste esta variante manualmente.")) event.preventDefault(); }}><Send size={16}/>Marcar publicada</button></Form><Form method="post"><input type="hidden" name="intent" value="unschedule_variant"/><input type="hidden" name="variant_id" value={selected.id}/><input type="hidden" name="updated_at" value={selected.updated_at}/><input type="hidden" name="return_to" value={formReturnTo}/><button className="ops-button ops-button-secondary" type="submit"><Check size={16}/>Desprogramar</button></Form></div></> : <Notice>La publicación ya fue registrada y su fecha planificada se conserva como historial.</Notice>}
      </div>
    </aside> : null}
  </>;
}
