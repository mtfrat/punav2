import assert from "node:assert/strict";
import { buildLeadAlertEmail, DEFAULT_LEAD_ALERT_FROM, DEFAULT_LEAD_ALERT_TO, escapeHtml, formatArt, RESEND_ENDPOINT, sendLeadAlert } from "../src/lib/lead-alert.ts";
import { matchBlocklist, parseDomainList, SPAM_EMAIL_DOMAINS, SPAM_TEXT_PATTERNS } from "../src/lib/lead-spam.ts";
import { countLinks, handleLeadSubmission, LEAD_LIMITS } from "../src/lib/lead-form.ts";

const NOW = new Date("2026-10-25T23:30:00.000Z"); // 20:30 ART
const silent = { info() {}, warn() {}, error() {} };

function makeForm(overrides = {}) {
  const base = {
    locale: "es",
    name: "Ana Pérez",
    email: "Ana@Empresa.com",
    company: "Empresa SA",
    problem: "Conciliamos Mercado Pago a mano todas las semanas y perdemos horas.",
    budget: "usd_10_25",
    consent: "yes",
    website: "",
    page: "/es/contacto",
    placement: "final_cta",
    started_at: String(NOW.getTime() - 60_000),
  };
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...base, ...overrides })) if (value !== undefined) form.set(key, value);
  return form;
}

function makeDeps(overrides = {}) {
  const calls = { stored: [], alerts: [] };
  const deps = {
    now: () => NOW,
    logger: silent,
    storeLead: async (record) => { calls.stored.push(record); return "stored"; },
    sendAlert: async (lead) => { calls.alerts.push(lead); return { status: "sent" }; },
    ...overrides,
  };
  return { deps, calls };
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test("valid lead is stored, alerted and succeeds", async () => {
  const { deps, calls } = makeDeps();
  const result = await handleLeadSubmission(makeForm(), deps);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(calls.stored.length, 1);
  assert.equal(calls.stored[0].work_email, "ana@empresa.com");
  assert.equal(calls.stored[0].source, "website_project_brief");
  assert.equal(calls.alerts.length, 1);
  assert.equal(calls.alerts[0].page, "/es/contacto");
  assert.equal(calls.alerts[0].placement, "final_cta");
  assert.equal(calls.alerts[0].stored, true);
});

test("honeypot gets fake success, nothing stored or sent", async () => {
  const { deps, calls } = makeDeps();
  const result = await handleLeadSubmission(makeForm({ website: "http://spam.example" }), deps);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(result.spam, "honeypot");
  assert.equal(calls.stored.length + calls.alerts.length, 0);
});

test("too-fast submission gets fake success, nothing stored or sent", async () => {
  const { deps, calls } = makeDeps();
  const result = await handleLeadSubmission(makeForm({ started_at: String(NOW.getTime() - 1000) }), deps);
  assert.equal(result.spam, "too_fast");
  assert.deepEqual(result.body, { ok: true });
  assert.equal(calls.stored.length + calls.alerts.length, 0);
});

test("missing or garbage started_at never blocks a real lead", async () => {
  for (const started_at of [undefined, "", "abc", String(NOW.getTime() + 60_000)]) {
    const { deps, calls } = makeDeps();
    const result = await handleLeadSubmission(makeForm({ started_at }), deps);
    assert.equal(result.status, 200, `started_at=${started_at}`);
    assert.equal(calls.stored.length, 1);
  }
});

test("more than 3 links is dropped as spam; 3 links is fine", async () => {
  assert.equal(countLinks("see https://a.com and www.b.com", "http://c.com/x"), 3);
  const four = "Mirá https://a.com https://b.com http://c.com www.d.com por favor gracias";
  let { deps, calls } = makeDeps();
  let result = await handleLeadSubmission(makeForm({ problem: four }), deps);
  assert.equal(result.spam, "too_many_links");
  assert.equal(calls.stored.length + calls.alerts.length, 0);
  ({ deps, calls } = makeDeps());
  result = await handleLeadSubmission(makeForm({ problem: "Mirá https://a.com https://b.com http://c.com por favor gracias" }), deps);
  assert.equal(result.status, 200);
  assert.equal(calls.stored.length, 1);
});

test("length and format limits return 400 field errors without storing", async () => {
  const cases = [
    [{ name: "" }, "name"],
    [{ name: "x".repeat(LEAD_LIMITS.nameMax + 1) }, "name"],
    [{ email: "not-an-email" }, "email"],
    [{ email: "a<b>@x.com" }, "email"],
    [{ email: `${"a".repeat(LEAD_LIMITS.emailMax)}@x.com` }, "email"],
    [{ company: "" }, "company"],
    [{ problem: "corto" }, "problem"],
    [{ problem: "x".repeat(LEAD_LIMITS.problemMax + 1) }, "problem"],
    [{ budget: "free" }, "budget"],
    [{ consent: undefined }, "consent"],
  ];
  for (const [overrides, field] of cases) {
    const { deps, calls } = makeDeps();
    const result = await handleLeadSubmission(makeForm(overrides), deps);
    assert.equal(result.status, 400, JSON.stringify(overrides).slice(0, 60));
    assert.ok(result.body.fieldErrors[field], `expected error on ${field}`);
    assert.equal(calls.stored.length + calls.alerts.length, 0);
  }
  assert.ok(LEAD_LIMITS.nameMax <= 100 && LEAD_LIMITS.emailMax <= 200 && LEAD_LIMITS.problemMin >= 10 && LEAD_LIMITS.problemMax <= 5000);
});

test("alert throwing never breaks the form", async () => {
  const { deps, calls } = makeDeps({ sendAlert: async () => { throw new Error("boom"); } });
  const result = await handleLeadSubmission(makeForm(), deps);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(calls.stored.length, 1);
});

test("storage failure keeps the existing 500/503 responses but still alerts with stored=false", async () => {
  for (const [outcome, status] of [["error", 500], ["unconfigured", 503]]) {
    const { deps, calls } = makeDeps({ storeLead: async () => outcome });
    const result = await handleLeadSubmission(makeForm(), deps);
    assert.equal(result.status, status);
    assert.equal(result.body.ok, false);
    assert.equal(calls.alerts.length, 1);
    assert.equal(calls.alerts[0].stored, false);
  }
  const { deps } = makeDeps({ storeLead: async () => { throw new Error("db down"); } });
  assert.equal((await handleLeadSubmission(makeForm(), deps)).status, 500);
});

test("page falls back to Referer path and strips the origin", async () => {
  const { deps, calls } = makeDeps({ referer: "https://www.puna-tech.com/es/servicios?x=1" });
  await handleLeadSubmission(makeForm({ page: undefined }), deps);
  assert.equal(calls.alerts[0].page, "/es/servicios?x=1");
});

const lead = {
  name: "Ana <script>alert(1)</script>",
  email: "ana@empresa.com",
  company: "Empresa & \"Hijos\"",
  problem: "Línea 1\n<img src=x onerror=alert(1)>",
  budget: "usd_10_25",
  locale: "es",
  page: "/es/contacto",
  placement: "final_cta",
  stored: true,
  receivedAt: NOW,
};

test("ART timestamp", () => {
  assert.equal(formatArt(NOW), "2026-10-25 20:30:00 ART");
});

test("email payload: from/to/reply_to, escaped HTML, header-safe subject", () => {
  const payload = buildLeadAlertEmail({ ...lead, name: "Ana\r\nBcc: x@y.com" }, { to: DEFAULT_LEAD_ALERT_TO, from: DEFAULT_LEAD_ALERT_FROM });
  assert.equal(payload.from, "Puna Tech <noreply@baratoya.app>");
  assert.deepEqual(payload.to, ["punatechba@gmail.com"]);
  assert.equal(payload.reply_to, "ana@empresa.com");
  assert.ok(!/[\r\n]/.test(payload.subject));
  const escaped = buildLeadAlertEmail(lead, { to: "a@b.c", from: "x <y@z.w>" });
  assert.ok(!escaped.html.includes("<script>"));
  assert.ok(!escaped.html.includes("<img"));
  assert.ok(escaped.html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(escaped.html.includes("Empresa &amp; &quot;Hijos&quot;"));
  for (const needle of ["ana@empresa.com", "/es/contacto", "final_cta", "2026-10-25 20:30:00 ART", "US$10–25k"]) assert.ok(escaped.html.includes(needle), needle);
  assert.ok(escaped.text.includes("Línea 1\n<img src=x onerror=alert(1)>"));
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("sendLeadAlert posts the right Resend request (mocked fetch)", async () => {
  const requests = [];
  const fetchImpl = async (url, init) => { requests.push({ url, init }); return { ok: true, status: 200, json: async () => ({ id: "email_123" }) }; };
  const result = await sendLeadAlert(lead, { env: { RESEND_API_KEY: "test_key_not_real" }, fetchImpl, logger: silent });
  assert.deepEqual(result, { status: "sent", id: "email_123" });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, RESEND_ENDPOINT);
  assert.equal(requests[0].url, "https://api.resend.com/emails");
  assert.equal(requests[0].init.method, "POST");
  assert.equal(requests[0].init.headers.Authorization, "Bearer test_key_not_real");
  assert.equal(requests[0].init.headers["Content-Type"], "application/json");
  const body = JSON.parse(requests[0].init.body);
  assert.equal(body.from, DEFAULT_LEAD_ALERT_FROM);
  assert.deepEqual(body.to, [DEFAULT_LEAD_ALERT_TO]);
  assert.equal(body.reply_to, "ana@empresa.com");
  assert.ok(body.subject.startsWith("Nuevo lead web:"));
  assert.ok(body.html && body.text);
});

test("sendLeadAlert honours LEAD_ALERT_TO / LEAD_ALERT_FROM", async () => {
  let body;
  const fetchImpl = async (_url, init) => { body = JSON.parse(init.body); return { ok: true, status: 200, json: async () => ({}) }; };
  await sendLeadAlert(lead, { env: { RESEND_API_KEY: "k", LEAD_ALERT_TO: "ops@example.com", LEAD_ALERT_FROM: "Ops <ops@example.com>" }, fetchImpl, logger: silent });
  assert.deepEqual(body.to, ["ops@example.com"]);
  assert.equal(body.from, "Ops <ops@example.com>");
});

test("missing key skips without calling fetch and logs the skip", async () => {
  const logs = [];
  let called = false;
  const result = await sendLeadAlert(lead, { env: {}, fetchImpl: async () => { called = true; return { ok: true, status: 200 }; }, logger: { info: (m) => logs.push(m), error: (m) => logs.push(m) } });
  assert.deepEqual(result, { status: "skipped", reason: "no_key" });
  assert.equal(called, false);
  assert.deepEqual(logs, ["lead alert skipped: no key"]);
});

test("Resend error or network failure is reported, never thrown", async () => {
  const errors = [];
  const logger = { info() {}, error: (m) => errors.push(m) };
  let result = await sendLeadAlert(lead, { env: { RESEND_API_KEY: "k" }, fetchImpl: async () => ({ ok: false, status: 422, text: async () => "bad from" }), logger });
  assert.deepEqual(result, { status: "failed", reason: "http_422" });
  result = await sendLeadAlert(lead, { env: { RESEND_API_KEY: "k" }, fetchImpl: async () => { throw new Error("ECONNRESET"); }, logger });
  assert.deepEqual(result, { status: "failed", reason: "exception" });
  assert.equal(errors.length, 2);
  assert.ok(errors.every((m) => m.startsWith("lead alert failed:") && !m.includes("Bearer")));
});

test("end to end: no key → form still succeeds and alert is skipped", async () => {
  const logs = [];
  const { deps, calls } = makeDeps({ sendAlert: (l) => sendLeadAlert(l, { env: {}, logger: { info: (m) => logs.push(m), error: (m) => logs.push(m) } }) });
  const result = await handleLeadSubmission(makeForm(), deps);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(calls.stored.length, 1);
  assert.deepEqual(logs, ["lead alert skipped: no key"]);
});

async function assertSpam(overrides, reason, spamEnv) {
  const { deps, calls } = makeDeps(spamEnv ? { spamEnv } : {});
  const result = await handleLeadSubmission(makeForm(overrides), deps);
  assert.equal(result.status, 200, JSON.stringify(overrides));
  assert.deepEqual(result.body, { ok: true });
  assert.equal(result.spam, reason, JSON.stringify(overrides));
  assert.equal(calls.stored.length + calls.alerts.length, 0, "spam must not be stored or alerted");
}

test("blocklist: sender domain search-puna-tech.com, its subdomains and exact address", async () => {
  await assertSpam({ email: "domains@search-puna-tech.com" }, "blocked_sender_address");
  await assertSpam({ email: "Domains@Search-Puna-Tech.com" }, "blocked_sender_address");
  await assertSpam({ email: "anyone@search-puna-tech.com" }, "blocked_sender_domain");
  await assertSpam({ email: "x@mail.search-puna-tech.com" }, "blocked_sender_domain");
});

test("blocklist: lookalike sender domains that are not blocked still pass", async () => {
  for (const email of ["a@puna-tech.com", "a@notsearch-puna-tech.com", "a@search-puna-tech.com.ar", "a@gmail.com"]) {
    const { deps, calls } = makeDeps();
    const result = await handleLeadSubmission(makeForm({ email }), deps);
    assert.equal(result.spam, undefined, email);
    assert.equal(calls.stored.length, 1, email);
  }
});

test("blocklist: searchregister.pro mentions in name/company/message (any form)", async () => {
  await assertSpam({ problem: "Registre su sitio en searchregister.pro para aparecer en Google ahora." }, "blocked_domain_mention");
  await assertSpam({ problem: "Visit https://www.searchregister.pro/invoice for details of the listing." }, "blocked_domain_mention");
  await assertSpam({ company: "SearchRegister.PRO" }, "blocked_domain_mention");
  await assertSpam({ name: "admin@searchregister.pro" }, "blocked_domain_mention");
  await assertSpam({ problem: "Escribinos a contacto@search-puna-tech.com para renovar el dominio ya." }, "blocked_domain_mention");
});

test("blocklist: 'Search Index' pattern, case-insensitive, in name/company/message", async () => {
  await assertSpam({ problem: "Your listing in the Web Search Index expires soon, please renew." }, "blocked_text_pattern");
  await assertSpam({ problem: "inscripcion en el SEARCH INDEX anual para su empresa, gracias" }, "blocked_text_pattern");
  await assertSpam({ company: "Web search-index Ltd" }, "blocked_text_pattern");
  await assertSpam({ name: "Search Index Team" }, "blocked_text_pattern");
});

test("blocklist: LEAD_SPAM_DOMAINS env extends sender and mention matching", async () => {
  assert.deepEqual(parseDomainList(" Bad.com, @evil.net ,,"), ["bad.com", "evil.net"]);
  const env = { LEAD_SPAM_DOMAINS: "bad.com, evil.net" };
  await assertSpam({ email: "x@bad.com" }, "blocked_sender_domain", env);
  await assertSpam({ email: "x@sub.evil.net" }, "blocked_sender_domain", env);
  await assertSpam({ problem: "Mirá evil.net para ver una oferta muy buena de dominios." }, "blocked_domain_mention", env);
  // Without the env, the same lead is fine.
  const { deps, calls } = makeDeps({ spamEnv: {} });
  assert.equal((await handleLeadSubmission(makeForm({ email: "x@bad.com" }), deps)).status, 200);
  assert.equal(calls.stored.length, 1);
});

test("blocklist: exports are plain arrays and a normal lead matches nothing", () => {
  assert.ok(Array.isArray(SPAM_EMAIL_DOMAINS) && SPAM_EMAIL_DOMAINS.includes("search-puna-tech.com"));
  assert.ok(Array.isArray(SPAM_TEXT_PATTERNS) && SPAM_TEXT_PATTERNS.every((p) => p instanceof RegExp));
  assert.equal(matchBlocklist({ name: "Ana", email: "ana@empresa.com", company: "Empresa SA", problem: "Necesitamos automatizar la conciliación bancaria de Mercado Pago." }, {}), null);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok - ${name}`); }
  catch (error) { failed += 1; console.error(`not ok - ${name}\n${error.stack}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} lead alert tests passed`);
if (failed) process.exit(1);
