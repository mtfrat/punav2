import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

function storageEntries(media = {}) {
  return [
    ...(media.primary?.output_path ? [["primary", media.primary.output_path]] : []),
    ...(media.slides || []).flatMap((item, index) => item?.output_path ? [[`slides:${index}`, item.output_path]] : []),
    ...(media.document?.output_path ? [["document", media.document.output_path]] : []),
    ...(media.cover?.output_path ? [["cover", media.cover.output_path]] : []),
  ];
}

async function exists(path) {
  const signed = await supabase.storage.from("generated-media").createSignedUrl(path, 60);
  if (signed.error || !signed.data?.signedUrl) return false;
  const response = await fetch(signed.data.signedUrl, { headers: { Range: "bytes=0-0" } });
  return response.ok;
}

function removeBroken(media, broken) {
  const next = { ...media };
  if (broken.has("primary")) delete next.primary;
  if (broken.has("document")) delete next.document;
  if (broken.has("cover")) delete next.cover;
  if (Array.isArray(next.slides)) {
    next.slides = next.slides.filter((_item, index) => !broken.has(`slides:${index}`));
    if (!next.slides.length) delete next.slides;
  }
  return next;
}

let from = 0;
let checked = 0;
let affected = 0;
while (true) {
  const result = await supabase.from("content_distribution_drafts").select("id,media_urls,generation_metadata").order("id").range(from, from + 499);
  if (result.error) throw result.error;
  const rows = result.data || [];
  for (const row of rows) {
    const entries = storageEntries(row.media_urls);
    checked += entries.length;
    const states = await Promise.all(entries.map(async ([slot, path]) => [slot, path, await exists(path)]));
    const missing = states.filter(([, , present]) => !present);
    if (!missing.length) continue;
    affected += 1;
    console.log(`${row.id}: ${missing.map(([, path]) => path).join(", ")}`);
    if (apply) {
      const broken = new Set(missing.map(([slot]) => slot));
      const update = await supabase.from("content_distribution_drafts").update({
        media_urls: removeBroken(row.media_urls || {}, broken),
        rendered_visual_hash: null,
        generation_metadata: { ...(row.generation_metadata || {}), media_stale: true },
      }).eq("id", row.id);
      if (update.error) throw update.error;
    }
  }
  if (rows.length < 500) break;
  from += 500;
}
console.log(`${apply ? "Repaired" : "Found"} ${affected} drafts with missing media after checking ${checked} references.`);
