import assert from "node:assert/strict";

import {
  ContentWorkerError,
  contentWorkerRequest,
  getContentWorkerCapabilities,
  getContentWorkerHealth,
} from "../src/lib/content-worker.server.ts";

const token = "test-worker-token-with-at-least-32-characters";
let mode = "ok";
process.env.AUTOPOST_WORKER_URL = "https://worker.example.com";
process.env.AUTOPOST_WORKER_TOKEN = token;
process.env.CONTENT_STUDIO_ENABLED = "false";

globalThis.fetch = async (url, options) => {
  assert.equal(options.headers.Authorization, `Bearer ${token}`);
  assert.match(options.headers["X-Request-ID"], /^[a-f0-9-]{36}$/);
  if (mode === "unavailable") throw new TypeError("network unavailable");
  if (mode === "slow") {
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    });
  }
  if (mode === "unauthorized") {
    return new Response(
      JSON.stringify({ error: { code: "unauthorized", message: "Denied.", retryable: false, request_id: "worker-request" } }),
      { status: 401, headers: { "Content-Type": "application/json", "X-Request-ID": "worker-request" } },
    );
  }
  return Response.json(String(url).endsWith("/health")
    ? { status: "ok", service: "puna-content-worker", version: "1" }
    : { service: "puna-content-worker", version: "1", mutations_enabled: false, capabilities: ["text_generation", "brand_overlay", "brand_library"] });
};

assert.equal((await getContentWorkerHealth()).status, "ok");
assert.equal((await getContentWorkerCapabilities()).mutations_enabled, false);

mode = "unauthorized";
await assert.rejects(getContentWorkerCapabilities(), (error) => error instanceof ContentWorkerError && error.code === "unauthorized" && error.requestId === "worker-request");

mode = "slow";
await assert.rejects(contentWorkerRequest("/slow", { timeoutMs: 10 }), (error) => error instanceof ContentWorkerError && error.code === "worker_timeout" && error.retryable);

mode = "unavailable";
await assert.rejects(getContentWorkerHealth(), (error) => error instanceof ContentWorkerError && error.code === "worker_unavailable");

console.log("Content worker client checks passed.");
