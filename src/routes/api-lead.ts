import { createClient } from "@supabase/supabase-js";
import { data, type ActionFunctionArgs } from "react-router";

const attempts = new Map<string, { count: number; resetAt: number }>();

function permitted(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return host === "www.puna-tech.com" || host === "puna-tech.com" || host === "localhost" || host === "127.0.0.1";
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
  if (form.get("website")) return data({ ok: true });
  const locale = form.get("locale") === "es" ? "es" : "en";
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const company = String(form.get("company") || "").trim();
  const problem = String(form.get("problem") || "").trim();
  const budget = String(form.get("budget") || "").trim();
  const consent = form.get("consent") === "yes";
  const budgetRanges = new Set(["usd_3_10", "usd_10_25", "usd_25_50", "usd_50_plus", "not_sure"]);
  const localizedError = locale === "es" ? "Revisá los campos e intentá nuevamente." : "Check the fields and try again.";
  if (!name || name.length > 80 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 160 || !company || company.length > 120 || problem.length < 20 || problem.length > 1600 || !budgetRanges.has(budget) || !consent) return data({ ok: false, error: localizedError }, { status: 400 });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return data({ ok: false, error: locale === "es" ? "El formulario no está disponible. Escribinos por email." : "The form is unavailable. Please email us instead." }, { status: 503 });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.from("website_leads").insert({ name, work_email: email, company, problem, budget_range: budget, locale, source: "website_project_brief", consented_at: new Date().toISOString() });
  if (error) return data({ ok: false, error: locale === "es" ? "No pudimos guardar el brief. Escribinos por email." : "We could not save the brief. Please email us." }, { status: 500 });
  return data({ ok: true });
}
