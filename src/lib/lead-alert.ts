/**
 * Founder email alert for website leads, sent through Resend's HTTP API.
 * Server-only. Never throws: a failed alert must not break the lead form.
 */

export interface LeadAlertInput {
  name: string;
  email: string;
  company: string;
  problem: string;
  budget: string;
  locale: "en" | "es";
  page: string;
  placement: string;
  stored: boolean;
  receivedAt: Date;
}

export interface LeadAlertEnv {
  RESEND_API_KEY?: string;
  LEAD_ALERT_TO?: string;
  LEAD_ALERT_FROM?: string;
}

export type LeadAlertResult = { status: "sent"; id?: string } | { status: "skipped"; reason: string } | { status: "failed"; reason: string };

type FetchLike = (input: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json?: () => Promise<unknown>; text?: () => Promise<string> }>;

export const RESEND_ENDPOINT = "https://api.resend.com/emails";
export const DEFAULT_LEAD_ALERT_TO = "punatechba@gmail.com";
export const DEFAULT_LEAD_ALERT_FROM = "Puna Tech <noreply@baratoya.app>";

const budgetLabels: Record<string, string> = {
  usd_3_10: "US$3–10k",
  usd_10_25: "US$10–25k",
  usd_25_50: "US$25–50k",
  usd_50_plus: "US$50k+",
  not_sure: "Todavía no lo sabe",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Header-safe single line: no CR/LF, trimmed, capped. */
function oneLine(value: string, max = 120): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, max);
}

export function formatArt(date: Date): string {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} ART`;
}

export function buildLeadAlertEmail(lead: LeadAlertInput, options: { to: string; from: string }) {
  const when = formatArt(lead.receivedAt);
  const budget = budgetLabels[lead.budget] || lead.budget;
  const source = [lead.page || "(desconocida)", lead.placement ? `bloque: ${lead.placement}` : ""].filter(Boolean).join(" · ");
  const storedNote = lead.stored ? "Guardado en /ops/leads." : "ATENCIÓN: no se pudo guardar en la base. Este mail es la única copia.";
  const rows: Array<[string, string]> = [
    ["Nombre", lead.name],
    ["Email", lead.email],
    ["Empresa", lead.company],
    ["Presupuesto", budget],
    ["Idioma", lead.locale],
    ["Página / origen", source],
    ["Recibido", when],
  ];
  const subject = oneLine(`Nuevo lead web: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`, 150);
  const html = [
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#181410;line-height:1.5">`,
    `<h2 style="margin:0 0 12px;font-size:18px">Nuevo lead en puna-tech.com</h2>`,
    `<table cellpadding="6" cellspacing="0" style="border-collapse:collapse">`,
    ...rows.map(([label, value]) => `<tr><td style="color:#6b6258;vertical-align:top"><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`),
    `</table>`,
    `<h3 style="margin:16px 0 6px;font-size:15px">Mensaje</h3>`,
    `<div style="white-space:pre-wrap;border-left:3px solid #ff6b00;padding:8px 12px;background:#faf7f2">${escapeHtml(lead.problem)}</div>`,
    `<p style="color:#6b6258;font-size:12px;margin-top:16px">${escapeHtml(storedNote)} Respondé este mail para contestarle directo al lead.</p>`,
    `</div>`,
  ].join("");
  const text = [
    "Nuevo lead en puna-tech.com",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Mensaje:",
    lead.problem,
    "",
    storedNote,
  ].join("\n");
  return { from: options.from, to: [options.to], reply_to: lead.email, subject, html, text };
}

export async function sendLeadAlert(
  lead: LeadAlertInput,
  deps: { env?: LeadAlertEnv; fetchImpl?: FetchLike; logger?: Pick<Console, "info" | "error">; timeoutMs?: number } = {},
): Promise<LeadAlertResult> {
  const env = deps.env ?? (process.env as LeadAlertEnv);
  const logger = deps.logger ?? console;
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    logger.info("lead alert skipped: no key");
    return { status: "skipped", reason: "no_key" };
  }
  try {
    const payload = buildLeadAlertEmail(lead, {
      to: env.LEAD_ALERT_TO?.trim() || DEFAULT_LEAD_ALERT_TO,
      from: env.LEAD_ALERT_FROM?.trim() || DEFAULT_LEAD_ALERT_FROM,
    });
    const fetchImpl = deps.fetchImpl ?? (globalThis.fetch as unknown as FetchLike);
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(deps.timeoutMs ?? 5000),
    });
    if (!response.ok) {
      const detail = response.text ? (await response.text().catch(() => "")).slice(0, 300) : "";
      logger.error(`lead alert failed: resend ${response.status} ${detail}`);
      return { status: "failed", reason: `http_${response.status}` };
    }
    const body = response.json ? ((await response.json().catch(() => null)) as { id?: string } | null) : null;
    return { status: "sent", id: body?.id };
  } catch (error) {
    logger.error(`lead alert failed: ${error instanceof Error ? error.message : String(error)}`);
    return { status: "failed", reason: "exception" };
  }
}
