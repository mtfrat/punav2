import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect } from "react-router";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { Field, Notice, OpsPageHeader, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, requireAdmin, sourcesFromText, sourcesToText, stringField } from "../lib/admin.server";
import { renderPostContent } from "../lib/posts.server";

const editable = ["title", "slug", "meta_title", "meta_description", "excerpt", "content", "hero_image_url", "hero_image_alt", "category", "primary_keyword", "author_name", "reviewer_name", "related_service_slug"];
const resultMessages = {
  saved: "El par EN/ES quedó guardado como borrador.",
  approved: "El par EN/ES quedó guardado y aprobado. Todavía no es público.",
  published: "El par EN/ES quedó guardado y publicado.",
  archived: "El par EN/ES fue archivado y retirado del blog público.",
} as const;
type EditorialResult = keyof typeof resultMessages;

function fieldName(locale: string, key: string) {
  return `${locale}_${key}`;
}

function postUpdateFromForm(form: FormData, locale: string) {
  const update: Record<string, unknown> = {};
  for (const key of editable) update[key] = stringField(form, fieldName(locale, key), key === "content" ? 100_000 : 2_000) || null;
  update.title = String(update.title || "Sin título");
  update.slug = String(update.slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  update.source_urls = sourcesFromText(stringField(form, fieldName(locale, "source_urls"), 10_000));
  return update;
}

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
  const url = new URL(request.url);
  const requestedResult = url.searchParams.get("result");
  const editorialResult = requestedResult && requestedResult in resultMessages ? requestedResult as EditorialResult : url.searchParams.get("saved") === "1" ? "saved" : null;
  return opsData({ groupId, posts, editorialResult }, context.headers);
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
  if (!["save", "approve", "publish", "archive"].includes(intent)) return opsData({ ok: false, error: "Acción inválida." }, context.headers, 400);

  if (intent !== "archive") {
    if (before.some((post) => post.status === "published") && form.get("confirm_published") !== "yes") return opsData({ ok: false, error: "Confirmá la actualización del contenido publicado." }, context.headers, 400);
    const updates = before.map((post) => ({ id: post.id, locale: post.locale, update: postUpdateFromForm(form, post.locale) }));
    const projected = before.map((post) => ({ ...post, ...updates.find((item) => item.id === post.id)?.update }));

    if (["approve", "publish"].includes(intent)) {
      const errors = validatePair(projected);
      if (errors.length) return opsData({ ok: false, error: `No se ${intent === "approve" ? "aprobó" : "publicó"} el par. ${errors.join(" ")}` }, context.headers, 400);
    }
    if (intent === "publish" && before.some((post) => !["approved", "published"].includes(post.status))) return opsData({ ok: false, error: "No se publicó el par. Primero usá “Guardar y aprobar par”." }, context.headers, 400);

    const savedResults = await Promise.all(updates.map(({ id, update }) => context.service.from("posts").update(update).eq("id", id).select("*").single()));
    if (savedResults.some((result) => result.error)) return opsData({ ok: false, error: "No se guardó el par. Revisá los slugs y los campos de ambas versiones." }, context.headers, 400);
    const saved = savedResults.flatMap((result) => result.data ? [result.data] : []);

    if (intent === "save") {
      await audit(context, { action: "save", entityType: "translation_group", entityId: groupId, before: compactSnapshot(before), after: compactSnapshot(saved) });
      throw redirect(`/ops/content/${encodeURIComponent(groupId)}?result=saved`, { headers: operationsHeaders(context.headers) });
    }
  }

  const status = intent === "approve" ? "approved" : intent === "publish" ? "published" : "archived";
  const result = await context.service.from("posts").update({ status }).eq("translation_group_id", groupId).select("id,locale,status,updated_at");
  if (result.error) return opsData({ ok: false, error: "No se pudo cambiar el estado del par." }, context.headers, 400);
  await audit(context, { action: intent, entityType: "translation_group", entityId: groupId, before: compactSnapshot(before), after: result.data });
  const editorialResult: EditorialResult = intent === "approve" ? "approved" : intent === "publish" ? "published" : "archived";
  throw redirect(`/ops/content/${encodeURIComponent(groupId)}?result=${editorialResult}`, { headers: operationsHeaders(context.headers) });
}

export default function OpsContentDetail({ loaderData, actionData }: { loaderData: { groupId: string; posts: Array<Record<string, any>>; editorialResult: EditorialResult | null }; actionData?: { error?: string } }) {
  const title = loaderData.posts.find((post) => post.locale === "en")?.title || loaderData.posts[0]?.title || "Contenido";
  const pairPublished = loaderData.posts.some((post) => post.status === "published");
  const pairApproved = loaderData.posts.every((post) => ["approved", "published"].includes(post.status));
  const successMessage = !actionData?.error && loaderData.editorialResult ? resultMessages[loaderData.editorialResult] : null;

  return <><Link className="ops-back" to="/ops/content"><ArrowLeft aria-hidden="true" size={18}/>Volver al contenido</Link><OpsPageHeader eyebrow="Revisión bilingüe" title={title} description={`Grupo ${loaderData.groupId}`}/>{successMessage ? <Notice tone="success">{successMessage}</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    <Form method="post">
      {pairPublished ? <input type="hidden" name="confirm_published" value="yes"/> : null}
      <div className="ops-editor-grid">{loaderData.posts.map((post) => <article className="ops-editor-card" key={post.id}><header><div><span className="ops-locale">{post.locale === "en" ? "EN · English" : "ES · Español"}</span><StatusBadge value={post.status}/></div>{post.status === "published" ? <a href={post.locale === "en" ? `/blog/${post.slug}` : `/es/blog/${post.slug}`} target="_blank" rel="noreferrer">Ver publicado <ExternalLink aria-hidden="true" size={15}/></a> : null}</header><div className="ops-form"><div className="ops-field-grid"><Field label="Título" name={fieldName(post.locale, "title")} value={post.title} required/><Field label="Slug" name={fieldName(post.locale, "slug")} value={post.slug} required/></div><div className="ops-field-grid"><Field label="Meta title" name={fieldName(post.locale, "meta_title")} value={post.meta_title} maxLength={70}/><Field label="Categoría" name={fieldName(post.locale, "category")} value={post.category}/></div><TextAreaField label="Meta description" name={fieldName(post.locale, "meta_description")} value={post.meta_description} rows={3} maxLength={180}/><TextAreaField label="Extracto" name={fieldName(post.locale, "excerpt")} value={post.excerpt} rows={4}/><TextAreaField label="Contenido" name={fieldName(post.locale, "content")} value={post.content} required rows={18} hint="Acepta HTML sanitizado o Markdown simple."/><details className="ops-preview"><summary>Vista previa sanitizada</summary><div className="article-content" dangerouslySetInnerHTML={{ __html: post.safe_content }}/></details><div className="ops-field-grid"><Field label="Imagen hero URL" name={fieldName(post.locale, "hero_image_url")} type="url" value={post.hero_image_url}/><Field label="Alt text" name={fieldName(post.locale, "hero_image_alt")} value={post.hero_image_alt}/></div><div className="ops-field-grid"><Field label="Keyword principal" name={fieldName(post.locale, "primary_keyword")} value={post.primary_keyword}/><Field label="Servicio relacionado" name={fieldName(post.locale, "related_service_slug")} value={post.related_service_slug}/></div><div className="ops-field-grid"><Field label="Autor" name={fieldName(post.locale, "author_name")} value={post.author_name}/><Field label="Reviewer" name={fieldName(post.locale, "reviewer_name")} value={post.reviewer_name}/></div><TextAreaField label="Fuentes" name={fieldName(post.locale, "source_urls")} value={post.sources_text} rows={5} hint="Una por línea: Título | https://fuente.com"/></div></article>)}</div>
      <section className="ops-state-actions"><div><p className="ops-eyebrow">Estado editorial</p><h2>Acciones sobre ambas versiones</h2><p>Guardar, aprobar y publicar procesan EN y ES juntos. Aprobar no publica; publicar hace visibles ambas versiones.</p></div><div className="ops-action-row">{!pairPublished ? <SubmitButton intent="save"><Save aria-hidden="true" size={17}/>Guardar par</SubmitButton> : null}{!pairPublished ? <SubmitButton intent="approve">Guardar y aprobar par</SubmitButton> : null}{pairApproved ? <SubmitButton intent="publish" confirmMessage={pairPublished ? "¿Guardar estos cambios en las versiones EN y ES ya publicadas?" : "¿Guardar y publicar las versiones EN y ES ahora?"}>{pairPublished ? "Guardar y actualizar publicación" : "Guardar y publicar par"}</SubmitButton> : <span className="ops-action-hint">Primero guardá y aprobá el par.</span>}<SubmitButton intent="archive" danger confirmMessage="¿Archivar ambas versiones y retirarlas del blog público?">Archivar par</SubmitButton></div></section>
    </Form>
  </>;
}
