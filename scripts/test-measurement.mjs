import assert from "node:assert/strict";
import { detectInternalTraffic, planAnalytics, INTERNAL_STORAGE_KEY, PRODUCTION_HOSTNAME } from "../src/lib/internal-traffic.ts";
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const PROD = PRODUCTION_HOSTNAME;
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

function memory(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
  };
}
const broken = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test("a normal visitor on www.puna-tech.com is not internal", () => {
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, webdriver: false, search: "", storage: memory() }), { internal: false, reason: null });
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "?utm_source=x&internal=2", storage: memory() }), { internal: false, reason: null });
});

test("any other hostname is internal: previews, apex, localhost", () => {
  for (const hostname of ["punav2-git-feat-x-mfrats-projects.vercel.app", "punav2.vercel.app", "puna-tech.com", "localhost", "127.0.0.1", "", "www.puna-tech.com.evil.test"]) {
    assert.deepEqual(detectInternalTraffic({ hostname, userAgent: CHROME }), { internal: true, reason: "hostname" }, hostname);
  }
});

test("navigator.webdriver is internal", () => {
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, webdriver: true }), { internal: true, reason: "webdriver" });
});

test("HeadlessChrome and Lighthouse user agents are internal (case-insensitive)", () => {
  for (const ua of [CHROME.replace("Chrome/", "HeadlessChrome/"), `${CHROME} Chrome-Lighthouse`, `${CHROME} lighthouse`, "headlesschrome"]) {
    assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: ua }), { internal: true, reason: "user_agent" }, ua);
  }
});

test("?internal=1 marks the visit and persists the flag; later visits without the query stay internal", () => {
  const storage = memory();
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "?internal=1", storage }), { internal: true, reason: "query_flag" });
  assert.equal(storage.data.get(INTERNAL_STORAGE_KEY), "1");
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "", storage }), { internal: true, reason: "stored_flag" });
});

test("?internal=0 clears the flag; the visit and the following ones are external again", () => {
  const storage = memory({ [INTERNAL_STORAGE_KEY]: "1" });
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "?internal=0", storage }), { internal: false, reason: null });
  assert.equal(storage.data.has(INTERNAL_STORAGE_KEY), false);
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "", storage }), { internal: false, reason: null });
});

test("?internal=0 does not hide a preview hostname or an automated browser", () => {
  const storage = memory({ [INTERNAL_STORAGE_KEY]: "1" });
  assert.equal(detectInternalTraffic({ hostname: "x.vercel.app", userAgent: CHROME, search: "?internal=0", storage }).internal, true);
  assert.equal(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, webdriver: true, search: "?internal=0", storage }).internal, true);
});

test("storage that throws or is missing never breaks detection", () => {
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "?internal=1", storage: broken }), { internal: true, reason: "query_flag" });
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "", storage: broken }), { internal: false, reason: null });
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "?internal=1", storage: null }), { internal: true, reason: "query_flag" });
  assert.deepEqual(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, search: "?internal=0", storage: broken }), { internal: false, reason: null });
});

test("a stored value other than '1' is ignored", () => {
  assert.equal(detectInternalTraffic({ hostname: PROD, userAgent: CHROME, storage: memory({ [INTERNAL_STORAGE_KEY]: "0" }) }).internal, false);
});

// ---- planAnalytics: whether gtag loads at all, and whether the config call is flagged ----

test("plan: only www.puna-tech.com loads gtag; every other host never does", () => {
  assert.equal(planAnalytics({ hostname: PROD, userAgent: CHROME }).loadGtag, true);
  for (const hostname of ["punav2-git-feat-x-mfrats-projects.vercel.app", "punav2-e3neyc8qd-mfrats-projects.vercel.app", "puna-tech.com", "localhost", "127.0.0.1", "", "www.puna-tech.com.evil.test"]) {
    assert.deepEqual(planAnalytics({ hostname, userAgent: CHROME }), { loadGtag: false, internal: true, reason: "hostname" }, hostname);
  }
});

test("plan: on the prod host a normal visitor loads gtag unflagged; each automation rule loads it flagged", () => {
  assert.deepEqual(planAnalytics({ hostname: PROD, userAgent: CHROME }), { loadGtag: true, internal: false, reason: null });
  assert.deepEqual(planAnalytics({ hostname: PROD, userAgent: CHROME, webdriver: true }), { loadGtag: true, internal: true, reason: "webdriver" });
  assert.deepEqual(planAnalytics({ hostname: PROD, userAgent: `${CHROME} HeadlessChrome/130` }), { loadGtag: true, internal: true, reason: "user_agent" });
  assert.deepEqual(planAnalytics({ hostname: PROD, userAgent: `${CHROME} Chrome-Lighthouse` }), { loadGtag: true, internal: true, reason: "user_agent" });
  assert.deepEqual(planAnalytics({ hostname: PROD, userAgent: CHROME, search: "?internal=1", storage: memory() }), { loadGtag: true, internal: true, reason: "query_flag" });
});

// ---- tracking.ts end to end against a fake window: what gtag receives, and in which order ----

function loadTracking() {
  const dir = mkdtempSync(join(tmpdir(), "puna-tracking-"));
  const outfile = join(dir, "tracking.mjs");
  buildSync({ entryPoints: ["src/components/tracking.ts"], bundle: true, format: "esm", platform: "neutral", outfile, logLevel: "silent" });
  return { url: pathToFileURL(outfile).href, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

let bundleSeq = 0;
async function runPage({ hostname = PROD, userAgent = CHROME, webdriver = false, search = "", pathname = "/es/", storage = memory(), earlyEvent = false }) {
  const { url, cleanup } = loadTracking();
  const calls = [];
  globalThis.window = { location: { hostname, pathname, search }, localStorage: storage, dataLayer: [], clarity: () => {} };
  Object.defineProperty(globalThis, "navigator", { value: { userAgent, webdriver }, configurable: true, writable: true });
  window.gtag = (...args) => calls.push(args);
  try {
    const mod = await import(`${url}?v=${bundleSeq++}`);
    if (earlyEvent) mod.trackEvent("cta_view", { place: "hero" });
    const loadScript = mod.activateAnalytics();
    mod.trackEvent("tool_use", { tool: "x" });
    return { loadScript, calls, GA: mod.GA_MEASUREMENT_ID };
  } finally {
    cleanup();
    delete globalThis.window;
    delete globalThis.navigator;
  }
}
const configs = (calls) => calls.filter((c) => c[0] === "config");

test("tracking: off the prod host nothing reaches gtag (no js, no config, no events, queued events dropped)", async () => {
  for (const hostname of ["punav2-git-feat-x-mfrats-projects.vercel.app", "localhost", "puna-tech.com"]) {
    const r = await runPage({ hostname, earlyEvent: true });
    assert.equal(r.loadScript, false, hostname);
    assert.deepEqual(r.calls, [], hostname);
  }
});

test("tracking: a normal visitor on prod gets a plain config with no traffic_type, and queued events flush after it", async () => {
  const r = await runPage({ earlyEvent: true });
  assert.equal(r.loadScript, true);
  assert.deepEqual(configs(r.calls), [["config", r.GA]]);
  assert.deepEqual(r.calls.map((c) => c[0]), ["js", "config", "event", "event"]);
});

test("tracking: webdriver, HeadlessChrome, Lighthouse and ?internal=1 put traffic_type=internal on the config call, before any event", async () => {
  const cases = {
    webdriver: { webdriver: true },
    headless: { userAgent: `${CHROME} HeadlessChrome/130` },
    lighthouse: { userAgent: `${CHROME} Chrome-Lighthouse` },
    query: { search: "?internal=1" },
    stored: { storage: memory({ [INTERNAL_STORAGE_KEY]: "1" }) },
  };
  for (const [name, input] of Object.entries(cases)) {
    const r = await runPage({ earlyEvent: true, ...input });
    assert.equal(r.loadScript, true, name);
    assert.deepEqual(configs(r.calls), [["config", r.GA, { traffic_type: "internal" }]], name);
    assert.equal(r.calls.findIndex((c) => c[0] === "config") < r.calls.findIndex((c) => c[0] === "event"), true, name);
  }
});

test("tracking: no manual page_view is ever sent (Enhanced Measurement owns SPA page_views)", async () => {
  const r = await runPage({ earlyEvent: true });
  assert.equal(r.calls.some((c) => c[0] === "event" && c[1] === "page_view"), false);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok - ${name}`); }
  catch (error) { failed += 1; console.error(`not ok - ${name}\n${error.stack}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} measurement tests passed`);
if (failed) process.exit(1);
