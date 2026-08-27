import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { data, redirect } from "react-router";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "punatechba@gmail.com").trim().toLowerCase();
export const PAGE_SIZE = 25;

export interface AdminContext {
  email: string;
  userId: string;
  service: SupabaseClient;
  headers: Headers;
}

function env() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Response("Operations dashboard is not configured.", { status: 503 });
  return { url, anonKey };
}

export function createAdminAuthClient(request: Request) {
  const { url, anonKey } = env();
  const headers = new Headers();
  const secure = new URL(request.url).protocol === "https:";
  const supabase = createServerClient(url, anonKey, {
    auth: { flowType: "pkce", autoRefreshToken: false, detectSessionInUrl: false, persistSession: true },
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("cookie") || "");
      },
      setAll(cookies) {
        for (const cookie of cookies) {
          headers.append("Set-Cookie", serializeCookieHeader(cookie.name, cookie.value, {
            ...cookie.options,
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure,
          }));
        }
      },
    },
  });
  return { supabase, headers };
}

function serviceClient() {
  const { url } = env();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Response("Operations database access is not configured.", { status: 503 });
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function operationsHeaders(existing?: HeadersInit) {
  const headers = new Headers(existing);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  return headers;
}

export function opsData<T>(value: T, headers?: HeadersInit, status = 200) {
  return data(value, { status, headers: operationsHeaders(headers) });
}

export async function requireAdmin(request: Request): Promise<AdminContext> {
  const { supabase, headers } = createAdminAuthClient(request);
  const { data: userData, error } = await supabase.auth.getUser();
  const email = userData.user?.email?.trim().toLowerCase();
  if (error || !userData.user || email !== ADMIN_EMAIL) {
    if (userData.user) await supabase.auth.signOut();
    throw redirect("/ops/login", { headers: operationsHeaders(headers) });
  }
  return { email, userId: userData.user.id, service: serviceClient(), headers };
}

export function assertTrustedMutation(request: Request) {
  if (request.method.toUpperCase() !== "POST") throw new Response("Method not allowed", { status: 405 });
  const requestUrl = new URL(request.url);
  const source = request.headers.get("origin") || request.headers.get("referer");
  if (!source) throw new Response("Invalid origin", { status: 403 });
  let sourceUrl: URL;
  try { sourceUrl = new URL(source); } catch { throw new Response("Invalid origin", { status: 403 }); }
  if (sourceUrl.origin !== requestUrl.origin) throw new Response("Invalid origin", { status: 403 });
}

export async function audit(context: AdminContext, input: {
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  const { error } = await context.service.from("admin_audit_log").insert({
    actor_user_id: context.userId,
    actor_email: context.email,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    before_state: input.before ?? null,
    after_state: input.after ?? null,
  });
  if (error) throw new Response("The change was saved, but its audit record could not be created.", { status: 500 });
}

export function pageFrom(request: Request) {
  const value = Number(new URL(request.url).searchParams.get("page") || 1);
  return Number.isInteger(value) && value > 0 ? value : 1;
}

export function paginationRange(page: number, multiplier = 1) {
  const size = PAGE_SIZE * multiplier;
  return { from: (page - 1) * size, to: page * size - 1, size };
}

export function stringField(form: FormData, name: string, max = 10_000) {
  return String(form.get(name) || "").trim().slice(0, max);
}

export function sourcesFromText(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).flatMap((line) => {
    const separator = line.lastIndexOf("|");
    const title = separator > 0 ? line.slice(0, separator).trim() : "";
    const url = (separator > 0 ? line.slice(separator + 1) : line).trim();
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return [];
      return [{ ...(title ? { title } : {}), url: parsed.toString() }];
    } catch { return []; }
  });
}

export function sourcesToText(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (!item || typeof item !== "object" || !("url" in item) || typeof item.url !== "string") return [];
    return ["title" in item && typeof item.title === "string" && item.title ? `${item.title} | ${item.url}` : item.url];
  }).join("\n");
}

export function compactSnapshot(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const copy = { ...(value as Record<string, unknown>) };
  for (const key of ["content", "message", "problem", "internal_notes"]) {
    if (typeof copy[key] === "string" && copy[key].length > 500) copy[key] = `${copy[key].slice(0, 500)}…`;
  }
  return copy;
}

export function safeMessage(error: unknown) {
  return error instanceof Error ? error.message.replace(/https?:\/\/\S+/g, "[provider]").slice(0, 240) : "The operation could not be completed.";
}
