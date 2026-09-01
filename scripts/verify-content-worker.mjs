import {
  getContentWorkerCapabilities,
  getContentWorkerHealth,
} from "../src/lib/content-worker.server.ts";

const health = await getContentWorkerHealth();
const capabilities = await getContentWorkerCapabilities();
if (health.status !== "ok" || capabilities.mutations_enabled !== false) {
  throw new Error("Content worker did not satisfy the Phase 0 contract.");
}
console.log(JSON.stringify({ health: health.status, version: health.version, mutations_enabled: capabilities.mutations_enabled, capabilities: capabilities.capabilities }, null, 2));
