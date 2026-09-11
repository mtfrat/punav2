import { randomUUID } from "node:crypto";
import { useState, type CSSProperties } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect } from "react-router";
import { Eye, ImagePlus, Save, Shapes } from "lucide-react";
import { Field, Notice, OpsPageHeader, StatusBadge, SubmitButton, TextAreaField } from "../components/ops";
import { audit, assertTrustedMutation, compactSnapshot, operationsHeaders, opsData, requireAdmin, stringField } from "../lib/admin.server";
import { contentComposerEnabled, contentVisualStudioEnabled } from "../lib/content-worker.server";

const categories = ["general", "systems", "automation", "software", "data", "people", "workspace"];
const formats = {
  instagram_portrait: { label: "Instagram 4:5", width: 1080, height: 1350, channels: ["instagram"] },
  linkedin_square: { label: "LinkedIn cuadrado", width: 1080, height: 1080, channels: ["linkedin"] },
  linkedin_horizontal: { label: "LinkedIn horizontal", width: 1200, height: 627, channels: ["linkedin"] },
  x_horizontal: { label: "X horizontal", width: 1600, height: 900, channels: ["x"] },
} as const;

function imageSignature(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index])) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!contentComposerEnabled()) throw redirect("/ops/social", { headers: operationsHeaders(context.headers) });
  const visualEnabled = contentVisualStudioEnabled();
  const [assetsResult, templatesResult] = await Promise.all([
    context.service.from("brand_media_assets").select("*").order("updated_at", { ascending: false }),
    context.service.from("brand_media_templates").select("*").order("name").order("output_format"),
  ]);
  if (assetsResult.error || templatesResult.error) throw new Response("No se pudo cargar Marca y plantillas.", { status: 500 });
  const assets = assetsResult.data || [];
  const paths = assets.map((asset) => String(asset.storage_path));
  const signed = paths.length ? await context.service.storage.from("brand-assets").createSignedUrls(paths, 3600) : { data: [], error: null };
  const urls = new Map((signed.data || []).map((item, index) => [paths[index], item.signedUrl]));
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = url.searchParams.get("category") || "all";
  const availability = url.searchParams.get("availability") || "all";
  const filtered = visualEnabled ? assets.filter((asset) => (!query || `${asset.title} ${asset.alt_text}`.toLowerCase().includes(query)) && (category === "all" || asset.category === category) && (availability === "all" || (availability === "active") === Boolean(asset.is_active))) : assets;
  const templates = visualEnabled ? (templatesResult.data || []).filter((template) => template.output_format !== "x_horizontal" && template.is_system !== false) : templatesResult.data || [];
  return opsData({ assets: filtered.map((asset) => ({ ...asset, signed_url: urls.get(String(asset.storage_path)) || null })), templates, saved: url.searchParams.get("saved") || "", filters: { query, category, availability }, visualEnabled }, context.headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  if (!contentComposerEnabled()) return opsData({ error: "El compositor está deshabilitado." }, context.headers, 503);
  const form = await request.formData();
  const intent = stringField(form, "intent", 40);
  const visualEnabled = contentVisualStudioEnabled();
  if (intent === "create_asset") {
    const file = form.get("image");
    const title = stringField(form, "title", 160);
    const altText = stringField(form, "alt_text", 500);
    const category = stringField(form, "category", 40);
    const width = Number(form.get("width"));
    const height = Number(form.get("height"));
    if (!(file instanceof File) || !title || !altText || !categories.includes(category)) return opsData({ error: "Completá imagen, título, categoría y texto alternativo." }, context.headers, 422);
    if (file.size < 1 || file.size > 3_670_016 || !Number.isInteger(width) || !Number.isInteger(height) || width < 320 || height < 320 || width > 8000 || height > 8000) return opsData({ error: "La imagen normalizada debe pesar hasta 3,5 MB y medir entre 320 y 8000 px." }, context.headers, 422);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = imageSignature(bytes);
    if (!mime || mime !== file.type) return opsData({ error: "El archivo no es un JPEG, PNG o WebP válido." }, context.headers, 422);
    const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const id = randomUUID();
    const path = `uploads/${id}.${extension}`;
    const upload = await context.service.storage.from("brand-assets").upload(path, bytes, { contentType: mime, upsert: false });
    if (upload.error) return opsData({ error: "No se pudo guardar la imagen." }, context.headers, 400);
    const result = await context.service.from("brand_media_assets").insert({ id, title, alt_text: altText, category, storage_path: path, mime_type: mime, width, height, source: "upload", is_active: false, created_by: context.userId }).select("*").single();
    if (result.error) { await context.service.storage.from("brand-assets").remove([path]); return opsData({ error: "No se pudo catalogar la imagen." }, context.headers, 400); }
    await audit(context, { action: "create", entityType: "brand_media_asset", entityId: id, after: compactSnapshot(result.data) });
    throw redirect("/ops/brand?saved=asset-created", { headers: operationsHeaders(context.headers) });
  }

  if (intent === "create_template") {
    if (visualEnabled) return opsData({ error: "Usá los presets curados del sistema visual." }, context.headers, 400);
    const name = stringField(form, "name", 120);
    const layout = stringField(form, "layout", 30);
    const outputFormat = stringField(form, "output_format", 40) as keyof typeof formats;
    const preset = formats[outputFormat];
    const baseAssetId = stringField(form, "base_asset_id", 80) || null;
    const position = stringField(form, "position", 20);
    const align = stringField(form, "text_align", 20);
    const strength = stringField(form, "overlay_strength", 20);
    if (!name || !preset || !["editorial", "image_overlay"].includes(layout) || !["top", "center", "bottom"].includes(position) || !["left", "center"].includes(align)) return opsData({ error: "Revisá la configuración de la plantilla." }, context.headers, 422);
    if (layout === "image_overlay" && !baseAssetId) return opsData({ error: "Elegí una imagen base para el template fotográfico." }, context.headers, 422);
    const margin = Math.round(preset.width * 0.075);
    const safeHeight = Math.round(preset.height * 0.48);
    const y = position === "top" ? Math.round(preset.height * 0.14) : position === "bottom" ? preset.height - safeHeight - margin : Math.round((preset.height - safeHeight) / 2);
    const opacity = strength === "strong" ? 0.72 : strength === "light" ? 0.38 : 0.58;
    const payload = { name, layout, output_format: outputFormat, width: preset.width, height: preset.height, channels: preset.channels, base_asset_id: baseAssetId, safe_zone: { x: margin, y, width: preset.width - margin * 2, height: safeHeight }, text_align: align, vertical_align: position, overlay_opacity: layout === "editorial" ? 0 : opacity, overlay_color: "#3B2A1E", text_color: layout === "editorial" ? "#181410" : "#FBF7F0", logo_enabled: true, created_by: context.userId };
    const result = await context.service.from("brand_media_templates").insert(payload).select("*").single();
    if (result.error) return opsData({ error: "No se pudo crear la plantilla. El nombre y formato deben ser únicos." }, context.headers, 400);
    await audit(context, { action: "create", entityType: "brand_media_template", entityId: String(result.data.id), after: compactSnapshot(result.data) });
    throw redirect("/ops/brand?saved=template-created", { headers: operationsHeaders(context.headers) });
  }

  if (intent === "save_template" || intent === "toggle_template") {
    if (!visualEnabled) return opsData({ error: "El estudio visual está deshabilitado." }, context.headers, 503);
    const id = stringField(form, "id", 80);
    const before = await context.service.from("brand_media_templates").select("*").eq("id", id).maybeSingle();
    if (!before.data || before.data.output_format === "x_horizontal") return opsData({ error: "Preset no encontrado." }, context.headers, 404);
    const changes = intent === "toggle_template" ? { is_active: !before.data.is_active } : {
      text_align: stringField(form, "text_align", 20),
      logo_enabled: form.get("logo_enabled") === "yes",
      overlay_opacity: { light: .38, medium: .58, strong: .72 }[stringField(form, "overlay_strength", 20)] ?? .58,
      visual_config: { density: stringField(form, "density", 20) === "compact" ? "compact" : "balanced" },
      template_version: Number(before.data.template_version || 1) + 1,
    };
    const result = await context.service.from("brand_media_templates").update(changes).eq("id", id).select("*").single();
    if (result.error) return opsData({ error: "No se pudo actualizar el preset." }, context.headers, 400);
    await audit(context, { action: intent === "toggle_template" ? (result.data.is_active ? "activate" : "deactivate") : "save", entityType: "brand_media_template", entityId: id, before: compactSnapshot(before.data), after: compactSnapshot(result.data) });
    throw redirect("/ops/brand?saved=template-saved", { headers: operationsHeaders(context.headers) });
  }

  const id = stringField(form, "id", 80);
  const before = await context.service.from("brand_media_assets").select("*").eq("id", id).maybeSingle();
  if (!before.data) return opsData({ error: "Imagen no encontrada." }, context.headers, 404);
  if (intent === "save_asset") {
    const title = stringField(form, "title", 160); const altText = stringField(form, "alt_text", 500); const category = stringField(form, "category", 40); const focalX = Number(form.get("focal_x")); const focalY = Number(form.get("focal_y"));
    if (!title || !altText || !categories.includes(category)) return opsData({ error: "Completá título, categoría y texto alternativo." }, context.headers, 422);
    if (visualEnabled && (!Number.isFinite(focalX) || !Number.isFinite(focalY) || focalX < 0 || focalX > 1 || focalY < 0 || focalY > 1)) return opsData({ error: "El punto focal no es válido." }, context.headers, 422);
    const result = await context.service.from("brand_media_assets").update({ title, alt_text: altText, category, ...(visualEnabled ? { focal_x: focalX, focal_y: focalY } : {}) }).eq("id", id).select("*").single();
    if (result.error) return opsData({ error: "No se pudo guardar la imagen." }, context.headers, 400);
    await audit(context, { action: "save", entityType: "brand_media_asset", entityId: id, before: compactSnapshot(before.data), after: compactSnapshot(result.data) });
  } else if (intent === "toggle_asset") {
    const result = await context.service.from("brand_media_assets").update({ is_active: !before.data.is_active }).eq("id", id).select("*").single();
    if (result.error) return opsData({ error: "No se pudo cambiar la disponibilidad." }, context.headers, 400);
    await audit(context, { action: result.data.is_active ? "activate" : "deactivate", entityType: "brand_media_asset", entityId: id, before: compactSnapshot(before.data), after: compactSnapshot(result.data) });
  } else return opsData({ error: "Acción inválida." }, context.headers, 400);
  throw redirect("/ops/brand?saved=asset-saved", { headers: operationsHeaders(context.headers) });
}

function NormalizedImageInput() {
  const [message, setMessage] = useState("JPEG, PNG o WebP. Se normaliza a un máximo de 2400 px y 3,5 MB.");
  return <><input name="width" id="brand-width" type="hidden"/><input name="height" id="brand-height" type="hidden"/><input name="image" type="file" accept="image/jpeg,image/png,image/webp" required onChange={async (event) => {
    const input = event.currentTarget; const file = input.files?.[0]; if (!file) return;
    try {
      const bitmap = await createImageBitmap(file); const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height)); const width = Math.round(bitmap.width * scale); const height = Math.round(bitmap.height * scale);
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height); bitmap.close();
      const type = file.type === "image/png" && file.size < 3_500_000 ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
      if (!blob || blob.size > 3_670_016) throw new Error("too_large");
      const transfer = new DataTransfer(); transfer.items.add(new File([blob], file.name.replace(/\.[^.]+$/, type === "image/png" ? ".png" : ".jpg"), { type })); input.files = transfer.files;
      (document.getElementById("brand-width") as HTMLInputElement).value = String(width); (document.getElementById("brand-height") as HTMLInputElement).value = String(height);
      setMessage(`${width}×${height} · ${(blob.size / 1024 / 1024).toFixed(1)} MB · lista para subir`);
    } catch { input.value = ""; setMessage("No se pudo normalizar la imagen. Probá exportarla como JPEG de menos de 3,5 MB."); }
  }}/><small>{message}</small></>;
}

function VisualAssetCard({ asset }: { key?: string; asset: Record<string, any> }) {
  const [focal, setFocal] = useState(() => ({ x: Number(asset.focal_x ?? .5), y: Number(asset.focal_y ?? .5) }));
  const position = `${focal.x * 100}% ${focal.y * 100}%`;
  return <article className="ops-media-card"><div className="ops-asset-crops" style={{ "--asset-position": position } as CSSProperties}>{["4:5","1:1","1.91:1"].map((ratio) => asset.signed_url ? <img key={ratio} src={asset.signed_url} alt="" style={{ aspectRatio: ratio, objectPosition: position }}/> : <div key={ratio} className="ops-media-placeholder"/>)}</div><header><div><strong>{asset.title}</strong><small>{asset.width}×{asset.height} · {asset.category}</small></div><StatusBadge value={asset.is_active ? "active" : "inactive"}/></header><Form method="post" className="ops-form"><input type="hidden" name="id" value={asset.id}/><Field label="Título" name="title" value={asset.title} required/><Field label="Categoría" name="category"><select name="category" defaultValue={asset.category}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><TextAreaField label="Texto alternativo" name="alt_text" value={asset.alt_text} required rows={3}/><fieldset className="ops-focal-controls"><legend>Punto focal del recorte</legend><label><span>Horizontal</span><input type="range" name="focal_x" min="0" max="1" step="0.01" value={focal.x} onChange={(event) => setFocal((current) => ({ ...current, x: Number(event.target.value) }))}/></label><label><span>Vertical</span><input type="range" name="focal_y" min="0" max="1" step="0.01" value={focal.y} onChange={(event) => setFocal((current) => ({ ...current, y: Number(event.target.value) }))}/></label><small>Las tres vistas cambian en vivo y muestran el recorte final.</small></fieldset><div className="ops-action-row"><SubmitButton intent="save_asset"><Save aria-hidden="true" size={17}/>Guardar</SubmitButton><SubmitButton intent="toggle_asset">{asset.is_active ? "Desactivar" : "Activar"}</SubmitButton></div></Form></article>;
}

function LegacyBrand({ loaderData, actionData }: { loaderData: { assets: Array<Record<string, any>>; templates: Array<Record<string, any>>; saved: string }; actionData?: { error?: string } }) {
  const activeAssets = loaderData.assets.filter((asset) => asset.is_active);
  return <><OpsPageHeader eyebrow="Editorial" title="Marca y plantillas" description="Administrá imágenes aprobadas y layouts determinísticos. Activar una imagen la vuelve elegible en el compositor."/>
    {loaderData.saved ? <Notice tone="success">Cambios guardados.</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    <div className="ops-brand-grid"><section className="ops-panel"><h2><ImagePlus aria-hidden="true"/>Agregar imagen</h2><Form method="post" encType="multipart/form-data" className="ops-form"><Field label="Título" name="title" required/><Field label="Categoría" name="category" required><select name="category" defaultValue="general">{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><label className="ops-field"><span>Archivo *</span><NormalizedImageInput/></label><TextAreaField label="Texto alternativo" name="alt_text" required rows={3}/><SubmitButton intent="create_asset"><ImagePlus aria-hidden="true" size={17}/>Guardar para revisión</SubmitButton></Form></section>
      <section className="ops-panel"><h2><Shapes aria-hidden="true"/>Nueva plantilla</h2><Form method="post" className="ops-form"><Field label="Nombre" name="name" required/><Field label="Layout" name="layout" required><select name="layout" defaultValue="image_overlay"><option value="editorial">Editorial Puna</option><option value="image_overlay">Imagen aprobada + título</option></select></Field><Field label="Formato" name="output_format" required><select name="output_format" defaultValue="instagram_portrait">{Object.entries(formats).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></Field><Field label="Imagen base" name="base_asset_id"><select name="base_asset_id" defaultValue=""><option value="">Sin imagen base</option>{activeAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.title}</option>)}</select></Field><div className="ops-field-grid"><Field label="Posición" name="position"><select name="position" defaultValue="center"><option value="top">Arriba</option><option value="center">Centro</option><option value="bottom">Abajo</option></select></Field><Field label="Alineación" name="text_align"><select name="text_align" defaultValue="left"><option value="left">Izquierda</option><option value="center">Centro</option></select></Field></div><Field label="Contraste" name="overlay_strength"><select name="overlay_strength" defaultValue="medium"><option value="light">Suave</option><option value="medium">Medio</option><option value="strong">Fuerte</option></select></Field><div className="ops-template-safe-preview" aria-label="Vista previa conceptual de la zona segura"><span>El título permanece dentro de esta zona segura</span></div><SubmitButton intent="create_template"><Shapes aria-hidden="true" size={17}/>Crear plantilla</SubmitButton></Form></section></div>
    <section className="ops-section"><div className="ops-section-heading"><div><p className="ops-eyebrow">Biblioteca</p><h2>Imágenes de marca</h2></div><span>{activeAssets.length} activas</span></div><div className="ops-media-grid">{loaderData.assets.map((asset) => <article className="ops-media-card" key={asset.id}>{asset.signed_url ? <img src={asset.signed_url} alt={asset.alt_text}/> : <div className="ops-media-placeholder"/>}<header><div><strong>{asset.title}</strong><small>{asset.width}×{asset.height} · {asset.category}</small></div><StatusBadge value={asset.is_active ? "active" : "inactive"}/></header><Form method="post" className="ops-form"><input type="hidden" name="id" value={asset.id}/><Field label="Título" name="title" value={asset.title} required/><Field label="Categoría" name="category"><select name="category" defaultValue={asset.category}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><TextAreaField label="Texto alternativo" name="alt_text" value={asset.alt_text} required rows={3}/><div className="ops-action-row"><SubmitButton intent="save_asset"><Save aria-hidden="true" size={17}/>Guardar</SubmitButton><SubmitButton intent="toggle_asset">{asset.is_active ? "Desactivar" : "Activar"}</SubmitButton></div></Form></article>)}</div></section>
    <section className="ops-section"><div className="ops-section-heading"><div><p className="ops-eyebrow">Layouts</p><h2>Plantillas disponibles</h2></div></div><div className="ops-stack">{loaderData.templates.map((template) => <article className="ops-template-row" key={template.id}><div><strong>{template.name}</strong><small>{formats[template.output_format as keyof typeof formats]?.label || template.output_format} · {template.layout === "editorial" ? "fondo Puna" : "imagen aprobada"}</small></div><StatusBadge value={template.is_active ? "active" : "inactive"}/></article>)}</div></section>
  </>;
}

export default function OpsBrand({ loaderData, actionData }: { loaderData: { assets: Array<Record<string, any>>; templates: Array<Record<string, any>>; saved: string; filters: { query: string; category: string; availability: string }; visualEnabled: boolean }; actionData?: { error?: string } }) {
  if (!loaderData.visualEnabled) return <LegacyBrand loaderData={loaderData} actionData={actionData}/>;
  return <>
    <OpsPageHeader eyebrow="Editorial" title="Biblioteca y presets" description="Aprobá imágenes, definí su recorte y elegí qué estilos Puna puede usar el compositor."/>
    {loaderData.saved ? <Notice tone="success">Cambios guardados.</Notice> : null}{actionData?.error ? <Notice tone="error">{actionData.error}</Notice> : null}
    <nav className="ops-brand-tabs" aria-label="Secciones de marca"><a href="#biblioteca">Biblioteca</a><a href="#presets">Presets</a></nav>
    <section className="ops-panel" id="biblioteca"><div className="ops-section-heading"><div><p className="ops-eyebrow">Biblioteca</p><h2>Imágenes aprobadas</h2></div><span>{loaderData.assets.filter((asset) => asset.is_active).length} activas en esta vista</span></div>
      <Form method="get" className="ops-brand-filters"><label><span>Buscar</span><input name="q" defaultValue={loaderData.filters.query} placeholder="Título o descripción"/></label><label><span>Categoría</span><select name="category" defaultValue={loaderData.filters.category}><option value="all">Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Estado</span><select name="availability" defaultValue={loaderData.filters.availability}><option value="all">Todos</option><option value="active">Activas</option><option value="inactive">En revisión</option></select></label><button className="ops-button ops-button-secondary">Filtrar</button></Form>
      <details className="ops-brand-upload"><summary><ImagePlus size={17}/>Agregar imagen</summary><Form method="post" encType="multipart/form-data" className="ops-form"><Field label="Título" name="title" required/><Field label="Categoría" name="category" required><select name="category" defaultValue="general">{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><label className="ops-field"><span>Archivo *</span><NormalizedImageInput/></label><TextAreaField label="Texto alternativo" name="alt_text" required rows={3}/><SubmitButton intent="create_asset"><ImagePlus aria-hidden="true" size={17}/>Guardar para revisión</SubmitButton></Form></details>
    </section>
    <div className="ops-media-grid">{loaderData.assets.map((asset) => <VisualAssetCard asset={asset} key={asset.id}/>)}</div>
    {!loaderData.assets.length ? <section className="ops-empty"><h2>No hay imágenes con estos filtros</h2><p>Limpiá los filtros o cargá una imagen nueva para revisión.</p></section> : null}
    <section className="ops-section" id="presets"><div className="ops-section-heading"><div><p className="ops-eyebrow">Sistema visual</p><h2>Presets curados</h2></div><span>LinkedIn e Instagram</span></div><div className="ops-preset-grid">{loaderData.templates.map((template) => <article className={`ops-preset-card is-${template.preset_key}`} key={template.id}><div className="ops-preset-preview"><span>{template.preset_key === "evidence" ? "30%" : template.preset_key === "system" ? "01 — 03" : "PUNA"}</span><strong>Operaciones más claras, decisiones más rápidas.</strong></div><header><div><strong>{template.name}</strong><small>{formats[template.output_format as keyof typeof formats]?.label || template.output_format}</small></div><StatusBadge value={template.is_active ? "active" : "inactive"}/></header><Form method="post" className="ops-form"><input type="hidden" name="id" value={template.id}/><div className="ops-field-grid"><Field label="Densidad" name="density"><select name="density" defaultValue={template.visual_config?.density || "balanced"}><option value="balanced">Equilibrada</option><option value="compact">Compacta</option></select></Field><Field label="Alineación" name="text_align"><select name="text_align" defaultValue={template.text_align}><option value="left">Izquierda</option><option value="center">Centro</option></select></Field></div><Field label="Contraste" name="overlay_strength"><select name="overlay_strength" defaultValue={Number(template.overlay_opacity) >= .7 ? "strong" : Number(template.overlay_opacity) <= .4 ? "light" : "medium"}><option value="light">Suave</option><option value="medium">Medio</option><option value="strong">Fuerte</option></select></Field><label className="ops-check"><input type="checkbox" name="logo_enabled" value="yes" defaultChecked={template.logo_enabled}/><span>Mostrar marca Puna</span></label><div className="ops-action-row"><SubmitButton intent="save_template"><Save size={17}/>Guardar preset</SubmitButton><SubmitButton intent="toggle_template">{template.is_active ? "Desactivar" : "Activar"}</SubmitButton></div></Form></article>)}</div></section>
    <Notice><Eye size={16}/>Los cambios afectan composiciones nuevas. Las piezas ya generadas conservan su archivo e historial.</Notice>
  </>;
}
