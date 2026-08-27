import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { Field, Notice, OpsPageHeader, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, requireAdmin, sourcesFromText, sourcesToText, stringField } from "../lib/admin.server";
import { renderPostContent } from "../lib/posts.server";

const editable = ["title", "slug", "meta_title", "meta_description", "excerpt", "content", "hero_image_url", "hero_image_alt", "category", "primary_keyword", "author_name", "reviewer_name", "related_service_slug"];

function validatePair(posts: Array<Record<string, unknown>>) {
  const errors: string[] = [];
  for (const locale of ["en", "es"]) {
    const post = posts.find((item) => item.locale === locale);
    if (!post) { errors.push(`Falta la versión ${locale.toUpperCase()}.`); continue; }
    for (const key of ["title", "slug", "excerpt", "content", "author_name", "reviewer_name"]) if (!String(post[key] || "").trim()) errors.push(`${locale.toUpperCase()}: falta ${key}.`);
    const metaTitle = String(post.meta_title || "");
    const metaDescription = String(post.meta_description || "");
    if (metaTitle.length < 10 || metaTitle.length > 70) errors.push(`${locale.toUpperCase()}: meta title debe tener 10–70 caracteres.`);
    if (metaDescription.length < 50 || metaDescription.length > 180) errors.push(`${locale.toUpperCase()}: meta description debe tener 50–180 caracteres.`);
    if (post.hero_image_url && !String(post.hero_image_alt || "").trim()) errors.push(`${locale.toUpperCase()}: falta alt text de la imagen.`);
    if (!Array.isArray(post.source_urls) || post.source_urls.length < 2) errors.push(`${locale.toUpperCase()}: se requieren al menos dos fuentes HTTPS.`);
  }
  return errors;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  const groupId = params.translationGroupId || "";
  const result = await context.service.from("posts").select("*").eq("translation_group_id", groupId).order("locale");
  if (result.error) throw new Response("No se pudo cargar el artículo.", { status: 500 });
  if (!result.data?.length) throw new Response("Not found", { status: 404 });
  const posts = result.data.map((post) => ({ ...post, sources_text: sourcesToText(post.source_urls), safe_content: renderPostContent(String(post.content || "")) }));
  return opsData({ groupId, posts, saved: new URL(request.url).searchParams.get("saved") === "1" }, context.headers);
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  const groupId = params.translationGroupId || "";
  const form = await request.formData();
  const intent = stringField(form, "intent", 30);
  const beforeResult = await context.service.from("posts").select("*").eq("translation_group_id", groupId).order("locale");
  if (beforeResult.error || !beforeResult.data?.length) return opsData({ ok: false, error: "No se encontró el contenido." }, context.headers, 404);
  const before = beforeResult.data;
  if (intent === "save") {
    const locale = form.get("locale") === "en" ? "en" : "es";
    const current = before.find((post) => post.locale === locale);
    if (!current) return opsData({ ok: false, error: "La versión solicitada no existe." }, context.headers, 404);
    if (current.status === "published" && form.get("confirm_published") !== "yes") return opsData({ ok: false, error: "Confirmá la actualización del contenido publicado." }, context.headers, 400);
    const update: Record<string, unknown> = {};
    for (const key of editable) update[key] = stringField(form, key, key === "content" ? 100_000 : 2_000) || null;
    update.title = String(update.title || "Sin título");
    update.slug = String(update.slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    update.source_urls = sourcesFromText(stringField(form, "source_urls", 10_000));
    const saved = await context.service.from("posts").update(update).eq("id", current.id).select("*").single();
    if (saved.error) return opsData({ ok: false, error: "No se pudo guardar. Revisá el slug y los campos." }, context.headers, 400);
    await audit(context, { action: current.status === "published" ? "update_published" : "save", entityType: "post", entityId: String(current.id), before: compactSnapshot(current), after: compactSnapshot(saved.data) });
  } else if (["approve", "publish", "archive"].includes(intent)) {
    if (intent !== "archive") {
      const errors = validatePair(before);
      if (errors.length) return opsData({ ok: false, error: errors.join(" ") }, context.headers, 400);
    }
    if (intent === "publish" && before.some((post) => !["approved", "published"].includes(post.status))) return opsData({ ok: false, error: "Aprobá ambas versiones antes de publicar." }, context.headers, 400);
    const status = intent === "approve" ? "approved" : intent === "publish" ? "published" : "archived";
    const result = await context.service.from("posts").update({ status }).eq("translation_group_id", groupId).select("id,locale,status,updated_at");
    if (result.error) return opsData({ ok: false, error: "No se pudo cambiar el estado." }, context.headers, 400);
    await audit(context, { action: intent, entityType: "translation_group", entityId: groupId, before: compactSnapshot(before), after: result.data });
  } else return opsData({ ok: false, error: "Acción inválida." }, context.headers, 400);
  throw redirect(`/ops/content/${encodeURIComponent(groupId)}?saved=1`, { headers: operationsHeaders(context.headers) });
}

export default function OpsContentDetail({ loaderData, actionData }: { loaderData: { groupId: string; posts: Array<Record<string, any>>; saved: boolean }; actionData?: { error?: string } }) {
  const title = loaderData.posts.find((post) => post.locale === "en")?.title || loaderData.posts[0]?.title || "Contenido";
  return <><Link className="ops-back" to="/ops/content"><ArrowLeft aria-hidden="true" size={18}/>Volver al contenido</Link><OpsPageHeader eyebrow="Revisión bilingüe" title={title} description={`Grupo ${loaderData.groupId}`}/>{loaderData.saved ? <Notice tone="success">Los cambios se guardaron correctamente.</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    <div className="ops-editor-grid">{loaderData.posts.map((post) => <article className="ops-editor-card" key={post.id}><header><div><span className="ops-locale">{post.locale === "en" ? "EN · English" : "ES · Español"}</span><StatusBadge value={post.status}/></div>{post.status === "published" ? <a href={post.locale === "en" ? `/blog/${post.slug}` : `/es/blog/${post.slug}`} target="_blank" rel="noreferrer">Ver publicado <ExternalLink aria-hidden="true" size={15}/></a> : null}</header><Form method="post" className="ops-form" onSubmit={post.status === "published" ? (event) => { if (!window.confirm("Este cambio se verá inmediatamente en el artículo publicado. ¿Continuar?")) event.preventDefault(); } : undefined}><input type="hidden" name="locale" value={post.locale}/>{post.status === "published" ? <input type="hidden" name="confirm_published" value="yes"/> : null}<div className="ops-field-grid"><Field label="Título" name="title" value={post.title} required/><Field label="Slug" name="slug" value={post.slug} required/></div><div className="ops-field-grid"><Field label="Meta title" name="meta_title" value={post.meta_title} maxLength={70}/><Field label="Categoría" name="category" value={post.category}/></div><TextAreaField label="Meta description" name="meta_description" value={post.meta_description} rows={3} maxLength={180}/><TextAreaField label="Extracto" name="excerpt" value={post.excerpt} rows={4}/><TextAreaField label="Contenido" name="content" value={post.content} required rows={18} hint="Acepta HTML sanitizado o Markdown simple."/><details className="ops-preview"><summary>Vista previa sanitizada</summary><div className="article-content" dangerouslySetInnerHTML={{ __html: post.safe_content }}/></details><div className="ops-field-grid"><Field label="Imagen hero URL" name="hero_image_url" type="url" value={post.hero_image_url}/><Field label="Alt text" name="hero_image_alt" value={post.hero_image_alt}/></div><div className="ops-field-grid"><Field label="Keyword principal" name="primary_keyword" value={post.primary_keyword}/><Field label="Servicio relacionado" name="related_service_slug" value={post.related_service_slug}/></div><div className="ops-field-grid"><Field label="Autor" name="author_name" value={post.author_name}/><Field label="Reviewer" name="reviewer_name" value={post.reviewer_name}/></div><TextAreaField label="Fuentes" name="source_urls" value={post.sources_text} rows={5} hint="Una por línea: Título | https://fuente.com"/><div className="ops-form-actions"><SubmitButton intent="save"><Save aria-hidden="true" size={17}/>Guardar {post.locale.toUpperCase()}</SubmitButton></div></Form></article>)}</div>
    <section className="ops-state-actions"><div><p className="ops-eyebrow">Estado editorial</p><h2>Acciones sobre ambas versiones</h2><p>Aprobar no publica. Publicar y archivar afectan EN y ES juntas.</p></div><Form method="post"><div className="ops-action-row"><SubmitButton intent="approve">Aprobar par</SubmitButton><SubmitButton intent="publish" confirmMessage="¿Publicar las versiones EN y ES ahora?">Publicar par</SubmitButton><SubmitButton intent="archive" danger confirmMessage="¿Archivar ambas versiones y retirarlas del blog público?">Archivar par</SubmitButton></div></Form></section>
  </>;
}
