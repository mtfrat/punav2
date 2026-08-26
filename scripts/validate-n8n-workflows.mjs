import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const workflowDirectory = new URL("../n8n/", import.meta.url);
const files = (await readdir(workflowDirectory)).filter((file) => file.endsWith(".json")).sort();
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const file of files) {
  const path = join(workflowDirectory.pathname, file);
  let workflow;
  try {
    workflow = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    failures.push(`${file}: invalid JSON (${error.message})`);
    continue;
  }

  assert(workflow.active === false, `${file}: workflow must be inactive on import`);
  assert(Array.isArray(workflow.nodes) && workflow.nodes.length > 0, `${file}: missing nodes`);
  const names = new Set();
  for (const node of workflow.nodes || []) {
    assert(node.name && !names.has(node.name), `${file}: duplicate or missing node name ${node.name || "(empty)"}`);
    names.add(node.name);
    if (node.type === "n8n-nodes-base.code") {
      try {
        new Function(node.parameters?.jsCode || "");
      } catch (error) {
        failures.push(`${file} / ${node.name}: invalid JavaScript (${error.message})`);
      }
    }
  }

  for (const [source, groups] of Object.entries(workflow.connections || {})) {
    assert(names.has(source), `${file}: connection source does not exist: ${source}`);
    for (const outputs of Object.values(groups)) {
      for (const branch of outputs || []) {
        for (const connection of branch || []) assert(names.has(connection.node), `${file}: connection target does not exist: ${connection.node}`);
      }
    }
  }

  const serialized = JSON.stringify(workflow);
  assert(!/(?:sk-|service_role=|eyJ[A-Za-z0-9_-]{40,})/.test(serialized), `${file}: possible hardcoded credential`);
  assert(!/status["']?\s*:\s*["']published["']/.test(serialized), `${file}: automation must never publish content`);
}

const editorial = JSON.parse(await readFile(new URL("../n8n/puna-editorial-drafts.json", import.meta.url), "utf8"));
const editorialText = JSON.stringify(editorial);
assert(editorialText.includes("Fetch Approved Brief"), "editorial: approved-brief gate missing");
assert(editorialText.includes("status: 'draft'"), "editorial: draft-only article status missing");
assert(editorialText.includes("Prompt injection"), "editorial: prompt-injection guard missing");
assert(editorialText.includes("source_urls.length < 2"), "editorial: minimum source guard missing");

const prospecting = JSON.parse(await readFile(new URL("../n8n/puna-prospecting-drafts.json", import.meta.url), "utf8"));
const prospectingText = JSON.stringify(prospecting);
assert(prospectingText.includes("compass~crawler-google-places"), "prospecting: maintained Apify actor missing");
assert(prospectingText.includes("robots.txt"), "prospecting: robots.txt check missing");
assert(prospectingText.includes("requested_limit: 200"), "prospecting: 200-result safety limit missing");
assert(prospectingText.includes("Nothing was sent to prospects"), "prospecting: manual-send guarantee missing");
for (const node of prospecting.nodes) {
  if (node.type === "n8n-nodes-base.emailSend") {
    assert(String(node.parameters?.toEmail || "").includes("FOUNDER_NOTIFICATION_EMAIL"), `prospecting / ${node.name}: email may only go to the founder summary address`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${files.length} inactive n8n workflows, code nodes, guardrails, and connections.`);
