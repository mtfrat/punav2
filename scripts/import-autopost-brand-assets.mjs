import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "LEGACY_AUTOPOST_SUPABASE_URL", "LEGACY_AUTOPOST_SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing server variables: ${missing.join(", ")}`);

const target = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const legacy = createClient(process.env.LEGACY_AUTOPOST_SUPABASE_URL, process.env.LEGACY_AUTOPOST_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function listFiles(client, prefix = "") {
  const { data, error } = await client.storage.from("brand-assets").list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) throw error;
  const output = [];
  for (const item of data || []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) output.push(path);
    else output.push(...await listFiles(client, path));
  }
  return output;
}

function dimensions(bytes) {
  if (bytes.length >= 24 && bytes.subarray(1, 4).toString("ascii") === "PNG") return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), mime: "image/png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1]; const length = bytes.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7), mime: "image/jpeg" };
      offset += 2 + length;
    }
  }
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP" && bytes.subarray(12, 16).toString("ascii") === "VP8X") return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3), mime: "image/webp" };
  throw new Error("Unsupported or unreadable legacy image.");
}

const allPaths = await listFiles(legacy);
const paths = allPaths.filter((path) => /\.(png|jpe?g|webp)$/i.test(path)).slice(0, 5);
if (paths.length !== 5) throw new Error(`Expected exactly 5 legacy brand images; found ${paths.length}. Nothing was imported.`);

let imported = 0;
for (const sourcePath of paths) {
  const { data, error } = await legacy.storage.from("brand-assets").download(sourcePath);
  if (error || !data) throw error || new Error("Legacy download failed.");
  const bytes = Buffer.from(await data.arrayBuffer());
  const info = dimensions(bytes);
  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  const extension = info.mime === "image/png" ? "png" : info.mime === "image/webp" ? "webp" : "jpg";
  const storagePath = `legacy/${digest}.${extension}`;
  const uploaded = await target.storage.from("brand-assets").upload(storagePath, bytes, { contentType: info.mime, upsert: false });
  if (uploaded.error && !String(uploaded.error.message).toLowerCase().includes("already exists")) throw uploaded.error;
  const title = sourcePath.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 160) || "Asset legacy";
  const saved = await target.from("brand_media_assets").upsert({ title, category: "general", storage_path: storagePath, mime_type: info.mime, width: info.width, height: info.height, alt_text: `Imagen de marca heredada: ${title}`, source: "legacy_import", is_active: false }, { onConflict: "storage_path", ignoreDuplicates: true });
  if (saved.error) throw saved.error;
  imported += 1;
}

console.log(`Legacy brand import verified: ${imported} inactive assets processed.`);
