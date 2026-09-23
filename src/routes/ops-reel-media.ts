import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { operationsHeaders, requireAdmin } from "../lib/admin.server";
import { signedCloudinaryDownload } from "../lib/social-reels.server";
import { isUuid } from "../lib/social-studio";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  const variantId = params.variantId || "";
  if (!isUuid(variantId)) throw new Response("Reel inválido.", { status: 404 });

  const result = await context.service.from("content_distribution_drafts")
    .select("visual_kind,media_urls,reel_provider_metadata")
    .eq("id", variantId).maybeSingle();
  const video = result.data?.media_urls?.video;
  if (result.error || result.data?.visual_kind !== "reel" || !video?.public_id) {
    throw new Response("MP4 no disponible.", { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const transformation = String(result.data.reel_provider_metadata?.render?.transformation || "");
  const url = signedCloudinaryDownload(video.public_id, video.format || "mp4", transformation, Math.floor(Date.now() / 1000), download);
  return redirect(url, { headers: operationsHeaders(context.headers) });
}
