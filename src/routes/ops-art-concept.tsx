import { Link, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { createHash, randomUUID } from "node:crypto";
import { ArrowLeft } from "lucide-react";
import "@fontsource-variable/newsreader/wght-italic.css";
import { ArtCompositionStudio } from "../components/art-composition-studio";
import { requireAdmin, operationsHeaders, opsData, assertTrustedMutation, audit, stringField } from "../lib/admin.server";
import { artStudioEnabled } from "../lib/content-worker.server";
import { isUuid } from "../lib/social-studio";
import { campaignArtDrafts, validateCampaignArtDraft } from "../lib/art-campaign-drafts";
import { ART_COMPOSITIONS, type ArtCopy } from "../lib/art-compositions";
import { recordArtVersion } from "../lib/art-version.server";
import "../art-concept.css";

async function load(request: Request, id: string) {
  const context = await requireAdmin(request);
  if (!artStudioEnabled()) throw redirect("/ops/social", { headers: operationsHeaders(context.headers) });
  if (!isUuid(id)) throw new Response("Campaña no encontrada", { status: 404 });
  const art = await context.service.from("art_campaigns").select("id,social_campaign_id,current_version,thesis,perspective,offer_cta,audience,objective,restrictions").eq("id", id).maybeSingle();
  if (art.error) throw new Response("No se pudo cargar la campaña", { status: 500 });
  if (!art.data) throw new Response("Campaña no encontrada", { status: 404 });
  const social = await context.service.from("social_campaigns").select("id,title,generation_context,updated_at").eq("id", art.data.social_campaign_id).single();
  if (social.error) throw new Response("No se pudo cargar el brief", { status: 500 });
  return { context, art: art.data, social: social.data };
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { context, art, social } = await load(request, params.campaignId || "");
  return opsData({ campaignId: art.id, campaignVersion: art.current_version, title: social.title, audience: art.audience, objective: art.objective, restrictions: art.restrictions,
    revision: social.updated_at, saved: campaignArtDrafts(social.generation_context),
    seed: { headline: art.thesis, support: art.perspective, closing: art.offer_cta } as ArtCopy,
  }, context.headers);
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const { context, art, social } = await load(request, params.campaignId || "");
  const form = await request.formData();
  if (form.get("intent") === "attach_editorial_piece") {
    const role = stringField(form, "role", 20);
    const draft = validateCampaignArtDraft(Object.fromEntries(form));
    const narrativeFunction = stringField(form, "narrative_function", 600);
    const altText = stringField(form, "alt_text", 500);
    const rightsSource = stringField(form, "rights_source", 500);
    const file = form.get("png");
    if (!["cover", "evidence"].includes(role) || !draft || !narrativeFunction || !altText || !rightsSource || form.get("rights_confirmed") !== "yes")
      return opsData({ error: "Elegí portada o prueba visual y completá función, texto alternativo, procedencia y permiso." }, context.headers, 422);
    if (Number(form.get("expected_version")) !== art.current_version)
      return opsData({ error: "La campaña cambió en otra pestaña. Recargá antes de guardar esta pieza." }, context.headers, 409);
    if (!(file instanceof File) || file.type !== "image/png" || file.size < 100 || file.size > 4 * 1024 * 1024)
      return opsData({ error: "El PNG debe ser válido y pesar menos de 4 MB." }, context.headers, 422);
    const bytes = Buffer.from(await file.arrayBuffer());
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!bytes.subarray(0, 8).equals(signature) || bytes.toString("ascii", 12, 16) !== "IHDR" || bytes.readUInt32BE(16) !== 1080 || bytes.readUInt32BE(20) !== 1350)
      return opsData({ error: "La imagen debe ser un PNG de 1080 × 1350 px." }, context.headers, 422);
    const piece = await context.service.from("art_campaign_pieces").select("id,version").eq("campaign_id", art.id).eq("role", role).single();
    if (piece.error) return opsData({ error: "No se encontró la pieza de campaña." }, context.headers, 404);
    const outputPath = `art/${art.id}/${piece.data.id}-canvas-${randomUUID()}.png`;
    const upload = await context.service.storage.from("generated-media").upload(outputPath, bytes, { contentType: "image/png", upsert: false });
    if (upload.error) return opsData({ error: "No se pudo subir la publicación. Reintentá." }, context.headers, 502);
    const result = await context.service.from("art_campaign_pieces").update({
      narrative_function: narrativeFunction,
      headline: draft.headline,
      support_copy: draft.support,
      alt_text: altText,
      asset_id: null,
      template_id: null,
      output_format: "instagram_portrait",
      media_urls: { primary: { kind: "editorial_canvas", composition: draft.composition, output_path: outputPath, mime_type: "image/png", width: 1080, height: 1350, sha256: createHash("sha256").update(bytes).digest("hex"), rights_source: rightsSource, rights_confirmed: true } },
      version: Number(piece.data.version || 1) + 1,
    }).eq("id", piece.data.id).eq("version", piece.data.version).select("id").maybeSingle();
    if (result.error || !result.data) return opsData({ error: "La pieza cambió mientras la guardabas. Recargá y comprobá la versión actual." }, context.headers, 409);
    await context.service.from("art_campaigns").update({ status: "production" }).eq("id", art.id);
    await recordArtVersion(context, art.id, "piece");
    await audit(context, { action: "attach_editorial_piece", entityType: "art_campaign_piece", entityId: piece.data.id, after: { role, composition: draft.composition, output_path: outputPath } });
    return opsData({ attached: role === "cover" ? "Portada / idea" : "Prueba visual" }, context.headers);
  }
  if (form.get("intent") !== "save_editorial_draft") return opsData({ error: "Acción inválida." }, context.headers, 400);
  const draft = validateCampaignArtDraft(Object.fromEntries(form));
  if (!draft) return opsData({ error: "Revisá los textos: titular hasta 100 caracteres, apoyo hasta 240 y cierre hasta 75. Comparativas: 2 líneas; listas: 3 líneas." }, context.headers, 422);
  if (form.get("expected_revision") !== social.updated_at) return opsData({ error: "La campaña cambió en otra pestaña. Copiá tus textos y recargá antes de guardar." }, context.headers, 409);
  const savedDraft = { ...draft, saved_at: new Date().toISOString() };
  const drafts = campaignArtDrafts(social.generation_context).filter(d => d.composition !== draft.composition);
  // Separate draft namespace: never changes approvals or production pieces.
  const result = await context.service.from("social_campaigns").update({ generation_context: { ...social.generation_context, editorial_drafts: [...drafts, savedDraft] } })
    .eq("id", social.id).eq("updated_at", social.updated_at).select("id").maybeSingle();
  if (result.error) return opsData({ error: "No se pudo guardar. Tus textos siguen en el editor; reintentá." }, context.headers, 500);
  if (!result.data) return opsData({ error: "Otro cambio llegó primero. Copiá tus textos y recargá antes de guardar." }, context.headers, 409);
  return opsData({ saved: ART_COMPOSITIONS.find(c => c.id === draft.composition)!.name }, context.headers);
}

export default function ArtConcept({ loaderData }: { loaderData: any }) {
  return <div className="art-study">
    <Link className="ops-back" to={`/ops/art/${loaderData.campaignId}#pieces`}><ArrowLeft size={16}/>Volver a la campaña</Link>
    <header className="art-study-heading"><div><h1>{loaderData.title}</h1><p>Tu brief, tus mensajes y doce maneras de diseñarlos.</p></div><span className="art-study-draft">Borradores · sin publicar</span></header>
    <details><summary>Ver el brief de esta campaña</summary><p><strong>Audiencia:</strong> {loaderData.audience}</p><p><strong>Objetivo:</strong> {loaderData.objective}</p><p><strong>Mensaje:</strong> {loaderData.seed.headline}</p><p><strong>Restricciones:</strong> {loaderData.restrictions || "No indicadas"}</p></details>
    <p>El editor parte de tu brief, sin inventar mensajes. Acortá los textos para la pieza y ajustá las líneas según el molde. Cada composición conserva su borrador guardado; no es generación automática con IA.</p>
    <div key={loaderData.campaignId}><ArtCompositionStudio campaign={{ action: `/ops/art/${loaderData.campaignId}/concept`, detailUrl: `/ops/art/${loaderData.campaignId}#pieces`, version: loaderData.campaignVersion, revision: loaderData.revision, saved: loaderData.saved, seed: loaderData.seed }}/></div>
  </div>;
}
