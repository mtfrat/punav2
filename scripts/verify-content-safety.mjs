import { renderPostContent } from "../src/lib/posts.server.ts";

const malicious = '<h2>Useful heading</h2><script>alert(1)</script><img src=x onerror=alert(2)><p onclick="steal()">Body</p><a href="javascript:alert(3)">unsafe</a><a href="https://example.com" target="_self">external</a><a href="https://www.puna-tech.com/services/custom-software" target="_blank">internal</a>';
const safe = renderPostContent(malicious);

const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }

assert(safe.includes("<h2>Useful heading</h2>"), "allowed semantic heading was removed");
assert(!safe.includes("<script"), "script tag survived sanitization");
assert(!safe.includes("<img"), "unapproved image tag survived sanitization");
assert(!safe.includes("onerror") && !safe.includes("onclick"), "event handler survived sanitization");
assert(!safe.includes("javascript:"), "unsafe URL scheme survived sanitization");
assert(safe.includes('href="https://example.com"') && safe.includes('target="_blank"') && safe.includes('rel="noopener noreferrer"'), "external-link protection is missing");
assert(safe.includes('href="https://www.puna-tech.com/services/custom-software"') && safe.includes('target="_self"'), "internal link target was not preserved as same-window navigation");

const legacy = renderPostContent("## Safe title\n\n<script>not HTML</script>\n\n- one\n- two");
assert(!legacy.includes("<script>"), "legacy content introduced executable markup");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Verified malicious HTML removal, safe link transforms, and legacy-content escaping.");
