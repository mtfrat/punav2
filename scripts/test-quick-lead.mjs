import assert from "node:assert/strict";
import { buildLeadAlertEmail } from "../src/lib/lead-alert.ts";
import { createRateLimiter, isPermittedOrigin } from "../src/lib/lead-guard.ts";
import { cleanNote, handleQuickLead, QUICK_LEAD_LIMITS } from "../src/lib/quick-lead.ts";

const NOW = new Date("2026-11-02T15:00:00.000Z");
const silent = { info() {}, warn() {}, error() {} };

function makeForm(overrides = {}) {
  const base = { locale: "es", email: "Ana@Estudio.com.ar", note: "Pasar facturas a la planilla", website: "", page: "/es/herramientas/plazos-procesales", placement: "use_case_x_final", started_at: String(NOW.getTime() - 20_000) };
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...base, ...overrides })) if (value !== undefined) form.set(key, value);
  return form;
}
function makeDeps(outcome = "stored") {
  const calls = { stored: [], alerts: [] };
  return {
    calls,
    deps: {
      now: () => NOW,
      logger: silent,
      storeLead: async (record) => { calls.stored.push(record); if (outcome === "throw") throw new Error("boom"); return outcome; },
      sendAlert: async (lead) => { calls.alerts.push(lead); if (outcome === "alert-throws") throw new Error("alert down"); },
    },
  };
}

// happy path: email is lower-cased, note kept, record has the expected shape
{
  const { deps, calls } = makeDeps();
  const result = await handleQuickLead(makeForm(), deps);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(calls.stored.length, 1);
  assert.deepEqual(calls.stored[0], { email: "ana@estudio.com.ar", note: "Pasar facturas a la planilla", locale: "es", page: "/es/herramientas/plazos-procesales", placement: "use_case_x_final", source: "website_quick_lead", consented_at: NOW.toISOString() });
  assert.equal(calls.alerts.length, 1);
  assert.equal(calls.alerts[0].stored, true);
}

// note is optional
{
  const { deps, calls } = makeDeps();
  const result = await handleQuickLead(makeForm({ note: "" }), deps);
  assert.equal(result.status, 200);
  assert.equal(calls.stored[0].note, null);
}

// validation
for (const email of ["", "no-es-un-mail", "a@b", "a b@c.com", "x".repeat(170) + "@a.com"]) {
  const { deps, calls } = makeDeps();
  const result = await handleQuickLead(makeForm({ email }), deps);
  assert.equal(result.status, 400, `email ${email.slice(0, 20)}`);
  assert.ok(result.body.fieldErrors?.email);
  assert.equal(calls.stored.length, 0);
}
{
  const { deps, calls } = makeDeps();
  const result = await handleQuickLead(makeForm({ note: "a".repeat(QUICK_LEAD_LIMITS.noteMax + 1) }), deps);
  assert.equal(result.status, 400);
  assert.ok(result.body.fieldErrors?.note);
  assert.equal(calls.stored.length, 0);
}
{
  const { deps } = makeDeps();
  const result = await handleQuickLead(makeForm({ email: "nope", locale: "en" }), deps);
  assert.equal(result.body.fieldErrors.email, "Enter a valid email address.");
}

// spam: fake success, nothing stored or alerted
for (const [label, overrides, reason] of [
  ["honeypot", { website: "http://spam.example" }, "honeypot"],
  ["missing timestamp", { started_at: undefined }, "missing_timestamp"],
  ["garbage timestamp", { started_at: "abc" }, "missing_timestamp"],
  ["too fast", { started_at: String(NOW.getTime() - 300) }, "too_fast"],
  ["links", { note: "mirá https://a.com y https://b.com" }, "too_many_links"],
  ["blocked sender", { email: "x@search-puna-tech.com" }, "blocked_sender_domain"],
]) {
  const { deps, calls } = makeDeps();
  const result = await handleQuickLead(makeForm(overrides), deps);
  assert.equal(result.status, 200, label);
  assert.equal(result.spam, reason, label);
  assert.equal(calls.stored.length + calls.alerts.length, 0, label);
}

// storage outcomes: graceful errors, alert still fires and is told the lead was not stored
for (const [outcome, status] of [["unconfigured", 503], ["error", 500], ["throw", 500]]) {
  const { deps, calls } = makeDeps(outcome);
  const result = await handleQuickLead(makeForm(), deps);
  assert.equal(result.status, status, outcome);
  assert.equal(result.body.ok, false);
  assert.match(result.body.error, /punatechba@gmail\.com/);
  assert.equal(calls.alerts[0].stored, false);
}
{
  const { deps } = makeDeps("alert-throws");
  const result = await handleQuickLead(makeForm(), deps);
  assert.equal(result.status, 200, "alert failure must not change the response");
}

// note cleaning: control chars and newlines are flattened
assert.equal(cleanNote("hola\r\n\tmundo\u0000  ok"), "hola mundo ok");

// alert email: quick variant has its own subject and no blank company/budget rows
{
  const mail = buildLeadAlertEmail({ name: "", email: "ana@estudio.com.ar", company: "", problem: "Pasar <b>facturas</b>", budget: "", locale: "es", page: "/es/contacto", placement: "contact_page", stored: true, receivedAt: NOW, kind: "quick" }, { to: "to@x.com", from: "from@x.com" });
  assert.equal(mail.subject, "Nuevo contacto rápido: ana@estudio.com.ar");
  assert.equal(mail.reply_to, "ana@estudio.com.ar");
  assert.ok(mail.html.includes("Pasar &lt;b&gt;facturas&lt;/b&gt;"), "note is HTML-escaped");
  assert.ok(!mail.html.includes("Empresa") && !mail.html.includes("Presupuesto"));
  assert.ok(mail.text.includes("website_quick_leads"));
  const empty = buildLeadAlertEmail({ name: "", email: "a@b.co", company: "", problem: "", budget: "", locale: "es", page: "", placement: "", stored: false, receivedAt: NOW, kind: "quick" }, { to: "t@x.com", from: "f@x.com" });
  assert.ok(empty.text.includes("(no dejó nota)") && empty.text.includes("ATENCIÓN"));
  // the full-brief email is untouched
  const full = buildLeadAlertEmail({ name: "Ana", email: "a@b.co", company: "X", problem: "p".repeat(30), budget: "usd_3_10", locale: "es", page: "/es/contacto", placement: "", stored: true, receivedAt: NOW }, { to: "t@x.com", from: "f@x.com" });
  assert.ok(full.subject.startsWith("Nuevo lead web: Ana"));
}

// guard: origin allow-list and rate limiter
{
  const req = (headers) => new Request("https://www.puna-tech.com/api/lead-rapido", { method: "POST", headers });
  assert.equal(isPermittedOrigin(req({})), true);
  assert.equal(isPermittedOrigin(req({ origin: "https://www.puna-tech.com" })), true);
  assert.equal(isPermittedOrigin(req({ origin: "https://punav2-git-feat-x-mtfrat.vercel.app" })), true);
  assert.equal(isPermittedOrigin(req({ origin: "https://evil.vercel.app" })), false);
  assert.equal(isPermittedOrigin(req({ origin: "https://evil.com" })), false);
  assert.equal(isPermittedOrigin(req({ origin: "not a url" })), false);
  const limited = createRateLimiter(5, 60_000);
  const r = req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
  for (let i = 0; i < 5; i++) assert.equal(limited(r, 1000), false);
  assert.equal(limited(r, 1000), true, "6th request in the window is limited");
  assert.equal(limited(req({ "x-forwarded-for": "9.9.9.9" }), 1000), false, "another IP is unaffected");
  assert.equal(limited(r, 1000 + 61_000), false, "window resets");
}

console.log("quick lead tests passed");
