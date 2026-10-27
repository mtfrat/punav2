/**
 * Server-side handling for the public project brief form (/api/lead).
 * Pure orchestration with injected storage and alert so it can be unit tested.
 */

import { matchBlocklist, type BlocklistReason } from "./lead-spam.ts";

export const LEAD_LIMITS = {
  nameMax: 80,
  emailMax: 160,
  companyMax: 120,
  problemMin: 20,
  problemMax: 1600,
  maxLinks: 3,
  minFillMs: 3000,
  pageMax: 300,
  placementMax: 60,
} as const;

const budgetRanges = new Set(["usd_3_10", "usd_10_25", "usd_25_50", "usd_50_plus", "not_sure"]);
const EMAIL_PATTERN = /^[^\s@<>()",;:\\[\]]+@[^\s@<>()",;:\\[\]]+\.[^\s@<>()",;:\\[\]]+$/;
const LINK_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;

export interface LeadFields {
  name: string;
  email: string;
  company: string;
  problem: string;
  budget: string;
  locale: "en" | "es";
  page: string;
  placement: string;
}

export interface LeadRecord {
  name: string;
  work_email: string;
  company: string;
  problem: string;
  budget_range: string;
  locale: "en" | "es";
  source: string;
  consented_at: string;
}

export type SpamReason = "honeypot" | "too_fast" | "too_many_links" | BlocklistReason;

export interface LeadSubmissionDeps {
  /** Returns "stored", "unconfigured" (no DB credentials) or "error". */
  storeLead: (record: LeadRecord) => Promise<"stored" | "unconfigured" | "error">;
  /** Must never throw; result is ignored by the form response. */
  sendAlert: (lead: LeadFields & { stored: boolean; receivedAt: Date }) => Promise<unknown>;
  now?: () => Date;
  /** Overrides process.env for LEAD_SPAM_DOMAINS (tests). */
  spamEnv?: { LEAD_SPAM_DOMAINS?: string };
  referer?: string | null;
  logger?: Pick<Console, "info" | "warn" | "error">;
}

export interface LeadSubmissionResult {
  status: number;
  body: { ok: boolean; error?: string; fieldErrors?: Record<string, string> };
  spam?: SpamReason;
}

export function countLinks(...values: string[]): number {
  return values.reduce((total, value) => total + (value.match(LINK_PATTERN)?.length || 0), 0);
}

function cleanPath(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw, "https://www.puna-tech.com");
    return `${parsed.pathname}${parsed.search}`.slice(0, LEAD_LIMITS.pageMax);
  } catch {
    return "";
  }
}

export function detectSpam(form: FormData, now: Date, fields: Pick<LeadFields, "name" | "company" | "problem"> & { email?: string }, env?: { LEAD_SPAM_DOMAINS?: string }): SpamReason | null {
  if (String(form.get("website") || "").length > 0) return "honeypot";
  const startedAt = Number(form.get("started_at"));
  // Only enforced when the client-side timestamp is present and sane (JS ran); a missing value never blocks a lead.
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = now.getTime() - startedAt;
    if (elapsed >= 0 && elapsed < LEAD_LIMITS.minFillMs) return "too_fast";
  }
  if (countLinks(fields.name, fields.company, fields.problem) > LEAD_LIMITS.maxLinks) return "too_many_links";
  const blocked = matchBlocklist({ name: fields.name, email: fields.email ?? "", company: fields.company, problem: fields.problem }, env);
  if (blocked) return blocked;
  return null;
}

export async function handleLeadSubmission(form: FormData, deps: LeadSubmissionDeps): Promise<LeadSubmissionResult> {
  const now = deps.now ? deps.now() : new Date();
  const logger = deps.logger ?? console;
  const locale = form.get("locale") === "es" ? "es" : "en";
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const company = String(form.get("company") || "").trim();
  const problem = String(form.get("problem") || "").trim();
  const budget = String(form.get("budget") || "").trim();
  const consent = form.get("consent") === "yes";
  const page = cleanPath(String(form.get("page") || "")) || cleanPath(deps.referer || "");
  const placement = String(form.get("placement") || "").replace(/[^a-z0-9_-]/gi, "").slice(0, LEAD_LIMITS.placementMax);

  // Bots get a fake success and nothing is stored or sent.
  const spam = detectSpam(form, now, { name, email, company, problem }, deps.spamEnv);
  if (spam) {
    logger.warn(`lead dropped as spam: ${spam}`);
    return { status: 200, body: { ok: true }, spam };
  }

  const localizedError = locale === "es" ? "Revisá los campos e intentá nuevamente." : "Check the fields and try again.";
  const fieldErrors: Record<string, string> = {};
  if (!name || name.length > LEAD_LIMITS.nameMax) fieldErrors.name = locale === "es" ? "Ingresá un nombre de hasta 80 caracteres." : "Enter a name of up to 80 characters.";
  if (!EMAIL_PATTERN.test(email) || email.length > LEAD_LIMITS.emailMax) fieldErrors.email = locale === "es" ? "Ingresá un email válido." : "Enter a valid email address.";
  if (!company || company.length > LEAD_LIMITS.companyMax) fieldErrors.company = locale === "es" ? "Ingresá una empresa de hasta 120 caracteres." : "Enter a company name of up to 120 characters.";
  if (problem.length < LEAD_LIMITS.problemMin || problem.length > LEAD_LIMITS.problemMax) fieldErrors.problem = locale === "es" ? "Describí el problema en 20 a 1600 caracteres." : "Describe the problem in 20 to 1600 characters.";
  if (!budgetRanges.has(budget)) fieldErrors.budget = locale === "es" ? "Seleccioná un rango de presupuesto." : "Select a budget range.";
  if (!consent) fieldErrors.consent = locale === "es" ? "Aceptá el uso de tus datos para responderte." : "Agree to the use of your details so we can reply.";
  if (Object.keys(fieldErrors).length) return { status: 400, body: { ok: false, error: localizedError, fieldErrors } };

  const fields: LeadFields = { name, email, company, problem, budget, locale, page, placement };
  let outcome: "stored" | "unconfigured" | "error";
  try {
    outcome = await deps.storeLead({ name, work_email: email, company, problem, budget_range: budget, locale, source: "website_project_brief", consented_at: now.toISOString() });
  } catch (error) {
    logger.error(`lead store failed: ${error instanceof Error ? error.message : String(error)}`);
    outcome = "error";
  }

  // Additive and fail-soft: the alert can never change the form response.
  try {
    await deps.sendAlert({ ...fields, stored: outcome === "stored", receivedAt: now });
  } catch (error) {
    logger.error(`lead alert failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (outcome === "unconfigured") return { status: 503, body: { ok: false, error: locale === "es" ? "El formulario no está disponible. Escribinos por email." : "The form is unavailable. Please email us instead." } };
  if (outcome === "error") return { status: 500, body: { ok: false, error: locale === "es" ? "No pudimos guardar el brief. Escribinos por email." : "We could not save the brief. Please email us." } };
  return { status: 200, body: { ok: true } };
}
