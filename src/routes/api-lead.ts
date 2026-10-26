import { createClient } from "@supabase/supabase-js";
import { data, type ActionFunctionArgs } from "react-router";
import { sendLeadAlert } from "../lib/lead-alert";
import { handleLeadSubmission } from "../lib/lead-form";

const attempts = new Map<string, { count: number; resetAt: number }>();

function permitted(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    if (host === "www.puna-tech.com" || host === "puna-tech.com" || host === "localhost" || host === "127.0.0.1") return true;
    return host.endsWith(".vercel.app") && (host === "punav2.vercel.app" || host.startsWith("punav2-"));
  } catch { return false; }
}

function rateLimited(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); return false; }
  current.count += 1;
  return current.count > 5;
}

export async function action({ request }: ActionFunctionArgs) {
  if (!permitted(request)) return data({ ok: false, error: "Invalid origin." }, { status: 403 });
  if (rateLimited(request)) return data({ ok: false, error: "Too many requests. Please wait before trying again." }, { status: 429 });
  if (Number(request.headers.get("content-length") || 0) > 12_000) return data({ ok: false, error: "Request too large." }, { status: 413 });
  const form = await request.formData();
  const result = await handleLeadSubmission(form, {
    referer: request.headers.get("referer"),
    storeLead: async (record) => {
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) return "unconfigured";
      const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await supabase.from("website_leads").insert(record);
      if (error) console.error(`lead store failed: ${error.message}`);
      return error ? "error" : "stored";
    },
    sendAlert: (lead) => sendLeadAlert(lead),
  });
  return data(result.body, { status: result.status });
}
