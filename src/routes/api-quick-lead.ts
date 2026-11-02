import { createClient } from "@supabase/supabase-js";
import { data, type ActionFunctionArgs } from "react-router";
import { createRateLimiter, isPermittedOrigin } from "../lib/lead-guard";
import { sendLeadAlert } from "../lib/lead-alert";
import { handleQuickLead } from "../lib/quick-lead";

const limited = createRateLimiter(5, 15 * 60_000);

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return data({ ok: false, error: "Method not allowed." }, { status: 405 });
  if (!isPermittedOrigin(request)) return data({ ok: false, error: "Invalid origin." }, { status: 403 });
  if (limited(request)) return data({ ok: false, error: "Too many requests. Please wait before trying again." }, { status: 429 });
  if (Number(request.headers.get("content-length") || 0) > 4_000) return data({ ok: false, error: "Request too large." }, { status: 413 });
  const form = await request.formData();
  const result = await handleQuickLead(form, {
    referer: request.headers.get("referer"),
    storeLead: async (record) => {
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) return "unconfigured";
      const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await supabase.from("website_quick_leads").insert(record);
      if (error) console.error(`quick lead store failed: ${error.message}`);
      return error ? "error" : "stored";
    },
    sendAlert: (lead) => sendLeadAlert({ name: "", email: lead.email, company: "", problem: lead.note, budget: "", locale: lead.locale, page: lead.page, placement: lead.placement, stored: lead.stored, receivedAt: lead.receivedAt, kind: "quick" }),
  });
  return data(result.body, { status: result.status });
}

// POST-only resource route: a GET answers 405 with an Allow header instead of an HTML error page.
export function loader() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
