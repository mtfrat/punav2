/**
 * Server-side handling for the email-only "dejanos tu mail" box (/api/lead-rapido).
 * Same shape as lead-form.ts: pure orchestration with injected storage and alert, so it can be unit tested.
 */

import { countLinks, EMAIL_PATTERN } from "./lead-form.ts";
import { matchBlocklist, type BlocklistReason } from "./lead-spam.ts";

export const QUICK_LEAD_LIMITS = {
  emailMax: 160,
  noteMax: 280,
  /** One field: a human needs a moment, a bot posting instantly does not. Lower than the full brief (3000). */
  minFillMs: 1500,
  maxLinks: 1,
  pageMax: 300,
  placementMax: 60,
} as const;

export interface QuickLeadRecord {
  email: string;
  note: string | null;
  locale: "en" | "es";
  page: string | null;
  placement: string | null;
  source: string;
  consented_at: string;
}

export type QuickSpamReason = "honeypot" | "too_fast" | "missing_timestamp" | "too_many_links" | BlocklistReason;

export interface QuickLeadDeps {
  /** Returns "stored", "unconfigured" (no DB credentials) or "error". */
  storeLead: (record: QuickLeadRecord) => Promise<"stored" | "unconfigured" | "error">;
  /** Must never throw; the result is ignored by the response. */
  sendAlert: (lead: { email: string; note: string; locale: "en" | "es"; page: string; placement: string; stored: boolean; receivedAt: Date }) => Promise<unknown>;
  now?: () => Date;
  spamEnv?: { LEAD_SPAM_DOMAINS?: string };
  referer?: string | null;
  logger?: Pick<Console, "info" | "warn" | "error">;
}

export interface QuickLeadResult {
  status: number;
  body: { ok: boolean; error?: string; fieldErrors?: Record<string, string> };
  spam?: QuickSpamReason;
}

function cleanPath(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw, "https://www.puna-tech.com");
    return `${parsed.pathname}${parsed.search}`.slice(0, QUICK_LEAD_LIMITS.pageMax);
  } catch {
    return "";
  }
}

/** Drops control characters and collapses whitespace so the note is one clean line. */
export function cleanNote(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

export function detectQuickSpam(form: FormData, now: Date, fields: { email: string; note: string }, env?: { LEAD_SPAM_DOMAINS?: string }): QuickSpamReason | null {
  if (String(form.get("website") || "").length > 0) return "honeypot";
  const startedAt = Number(form.get("started_at"));
  if (!Number.isFinite(startedAt) || startedAt <= 0) return "missing_timestamp";
  const elapsed = now.getTime() - startedAt;
  if (elapsed >= 0 && elapsed < QUICK_LEAD_LIMITS.minFillMs) return "too_fast";
  if (countLinks(fields.note) > QUICK_LEAD_LIMITS.maxLinks) return "too_many_links";
  return matchBlocklist({ name: "", email: fields.email, company: "", problem: fields.note }, env);
}

export async function handleQuickLead(form: FormData, deps: QuickLeadDeps): Promise<QuickLeadResult> {
  const now = deps.now ? deps.now() : new Date();
  const logger = deps.logger ?? console;
  const locale = form.get("locale") === "es" ? "es" : "en";
  const email = String(form.get("email") || "").trim().toLowerCase();
  const note = cleanNote(String(form.get("note") || ""));
  const page = cleanPath(String(form.get("page") || "")) || cleanPath(deps.referer || "");
  const placement = String(form.get("placement") || "").replace(/[^a-z0-9_-]/gi, "").slice(0, QUICK_LEAD_LIMITS.placementMax);

  // Bots get a fake success and nothing is stored or sent.
  const spam = detectQuickSpam(form, now, { email, note }, deps.spamEnv);
  if (spam) {
    logger.warn(`quick lead dropped as spam: ${spam}`);
    return { status: 200, body: { ok: true }, spam };
  }

  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_PATTERN.test(email) || email.length > QUICK_LEAD_LIMITS.emailMax) fieldErrors.email = locale === "es" ? "Ingresá un email válido." : "Enter a valid email address.";
  if (note.length > QUICK_LEAD_LIMITS.noteMax) fieldErrors.note = locale === "es" ? "Contalo en una línea, hasta 280 caracteres." : "Keep it to one line, up to 280 characters.";
  if (Object.keys(fieldErrors).length) {
    return { status: 400, body: { ok: false, error: locale === "es" ? "Revisá el mail e intentá de nuevo." : "Check the email and try again.", fieldErrors } };
  }

  let outcome: "stored" | "unconfigured" | "error";
  try {
    outcome = await deps.storeLead({ email, note: note || null, locale, page: page || null, placement: placement || null, source: "website_quick_lead", consented_at: now.toISOString() });
  } catch (error) {
    logger.error(`quick lead store failed: ${error instanceof Error ? error.message : String(error)}`);
    outcome = "error";
  }

  // Additive and fail-soft: the alert can never change the response.
  try {
    await deps.sendAlert({ email, note, locale, page, placement, stored: outcome === "stored", receivedAt: now });
  } catch (error) {
    logger.error(`quick lead alert failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (outcome === "unconfigured") return { status: 503, body: { ok: false, error: locale === "es" ? "El formulario no está disponible ahora. Escribinos a punatechba@gmail.com." : "The form is unavailable right now. Please email punatechba@gmail.com." } };
  if (outcome === "error") return { status: 500, body: { ok: false, error: locale === "es" ? "No pudimos guardar tu mail. Probá de nuevo o escribinos a punatechba@gmail.com." : "We could not save your email. Try again or write to punatechba@gmail.com." } };
  return { status: 200, body: { ok: true } };
}
