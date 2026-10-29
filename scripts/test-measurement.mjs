import assert from "node:assert/strict";
import { detectInternalTraffic, INTERNAL_STORAGE_KEY, PRODUCTION_HOSTNAME } from "../src/lib/internal-traffic.ts";

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

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (error) { failed += 1; console.error(`not ok - ${name}\n${error.stack}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} measurement tests passed`);
if (failed) process.exit(1);
