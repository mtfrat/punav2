import {
  getContentWorkerCapabilities,
  getContentWorkerHealth,
} from "../src/lib/content-worker.server.ts";

const health = await getContentWorkerHealth();
const capabilities = await getContentWorkerCapabilities();
const required = ["brand_overlay", "carousel_document"];
if (health.status !== "ok" || capabilities.mutations_enabled !== true || !required.every((item) => capabilities.capabilities.includes(item))) {
  throw new Error("Content worker does not satisfy the launch rendering contract.");
}
console.log(JSON.stringify({ health: health.status, version: health.version, mutations_enabled: capabilities.mutations_enabled, capabilities: capabilities.capabilities }, null, 2));
