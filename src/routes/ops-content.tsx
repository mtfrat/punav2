import type { LoaderFunctionArgs } from "react-router";
import { Form, Link } from "react-router";
import { ArrowRight, Search } from "lucide-react";
import { EmptyState, formatDate, OpsPageHeader, Pager, StatusBadge } from "../components/ops";
import { opsData, pageFrom, paginationRange, requireAdmin } from "../lib/admin.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  const url = new URL(request.url);
  const page = pageFrom(request);
  const status = url.searchParams.get("status") || "";
  const search = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const { from, to } = paginationRange(page, 2);
  let query = context.service.from("posts").select("id,translation_group_id,locale,title,slug,status,category,updated_at,published_at", { count: "exact" }).order("updated_at", { ascending: false }).range(from, to);
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("title", `%${search.replace(/[%_]/g, "")}%`);
  const result = await query;
  if (result.error) throw new Response("No se pudo cargar el contenido.", { status: 500 });
  const groups = new Map<string, { translation_group_id: string; updated_at: string; posts: Array<Record<string, string | null>> }>();
  for (const post of result.data || []) {
    const id = String(post.translation_group_id);
    const current = groups.get(id) || { translation_group_id: id, updated_at: String(post.updated_at), posts: [] };
    current.posts.push(post as Record<string, string | null>);
    if (String(post.updated_at) > current.updated_at) current.updated_at = String(post.updated_at);
    groups.set(id, current);
  }
  return opsData({ groups: [...groups.values()].slice(0, 25), page, entityCount: Math.ceil((result.count || 0) / 2), filters: { status, search } }, context.headers);
}

export default function OpsContent({ loaderData }: { loaderData: { groups: Array<{ translation_group_id: string; updated_at: string; posts: Array<Record<string, string | null>> }>; page: number; entityCount: number; filters: { status: string; search: string } } }) {
  const params = new URLSearchParams(); if (loaderData.filters.status) params.set("status", loaderData.filters.status); if (loaderData.filters.search) params.set("q", loaderData.filters.search);
  return <><OpsPageHeader eyebrow="Editorial" title="Contenido bilingüe" description="Revisá cada par EN/ES. Aprobar prepara el contenido; publicar es siempre una acción separada."/>
    <Form method="get" className="ops-filters"><label><span className="sr-only">Buscar por título</span><Search aria-hidden="true"/><input name="q" type="search" defaultValue={loaderData.filters.search} placeholder="Buscar por título…"/></label><label><span>Estado</span><select name="status" defaultValue={loaderData.filters.status}><option value="">Todos</option><option value="draft">Draft</option><option value="approved">Approved</option><option value="published">Published</option><option value="archived">Archived</option></select></label><button className="ops-button ops-button-secondary" type="submit">Filtrar</button></Form>
    {loaderData.groups.length ? <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Contenido</th><th>English</th><th>Español</th><th>Actualizado</th><th><span className="sr-only">Abrir</span></th></tr></thead><tbody>{loaderData.groups.map((group) => { const en = group.posts.find((post) => post.locale === "en"); const es = group.posts.find((post) => post.locale === "es"); return <tr key={group.translation_group_id}><td data-label="Contenido"><strong>{String(en?.title || es?.title || "Sin título")}</strong><small>{String(en?.category || es?.category || "Sin categoría")}</small></td><td data-label="English">{en ? <StatusBadge value={String(en.status)}/> : <span className="ops-missing">Falta EN</span>}</td><td data-label="Español">{es ? <StatusBadge value={String(es.status)}/> : <span className="ops-missing">Falta ES</span>}</td><td data-label="Actualizado">{formatDate(group.updated_at, true)}</td><td data-label="Abrir"><Link className="ops-row-link" to={`/ops/content/${encodeURIComponent(group.translation_group_id)}`}>Revisar <ArrowRight aria-hidden="true" size={16}/></Link></td></tr>; })}</tbody></table></div> : <EmptyState title="No hay contenido en esta vista" body="Probá quitando los filtros o esperá el próximo borrador editorial de n8n."/>}
    <Pager page={loaderData.page} count={loaderData.entityCount} path="/ops/content" params={params}/>
  </>;
}
