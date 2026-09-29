import assert from "node:assert/strict";
import { ART_COMPOSITIONS, nextArtComposition, parseArtHistory, trendResearchUrl } from "../src/lib/art-compositions.ts";
import { campaignArtDrafts, validateCampaignArtDraft } from "../src/lib/art-campaign-drafts.ts";

const draft = { composition: "paper-photo", headline: "Un tema propio", support: "Una mirada propia", closing: "Conversemos" };
assert.ok(validateCampaignArtDraft(draft));
assert.equal(validateCampaignArtDraft({ ...draft, headline: "x".repeat(101) }), null);
assert.equal(validateCampaignArtDraft({ ...draft, composition: "unknown" }), null);
assert.deepEqual(campaignArtDrafts(null), []);
assert.equal(campaignArtDrafts({ editorial_drafts: [draft, draft, {}] }).length, 1);

assert.equal(ART_COMPOSITIONS.length, 6);
assert.equal(new Set(ART_COMPOSITIONS.map(c => c.id)).size, 6);
assert.equal(new Set(ART_COMPOSITIONS.map(c => c.family)).size, 6);
assert.ok(ART_COMPOSITIONS.every(c => c.photo === true));
assert.deepEqual(parseArtHistory("not-json"), []);
assert.deepEqual(parseArtHistory('{"id":"paper-photo"}'), []);
assert.deepEqual(parseArtHistory('["paper-photo", "unknown", null, 3]'), ["paper-photo"]);
assert.equal(parseArtHistory(JSON.stringify(Array(150).fill("paper-photo"))).length, 120);

// Multiple full cycles, including the UI's current-preview exclusion.
let history = [];
let current = ART_COMPOSITIONS[0].id;
for (let cycle = 0; cycle < 4; cycle++) {
  const seen = new Set();
  for (let i = 0; i < 6; i++) {
    assert.ok(!seen.has(current), `Repeated ${current} within cycle ${cycle}`);
    seen.add(current);
    history.push(current);
    const next = nextArtComposition(current, history);
    assert.notEqual(next, current);
    current = next;
  }
  assert.equal(seen.size, 6);
}
const lastId = ART_COMPOSITIONS[ART_COMPOSITIONS.length - 1].id;
const allButLast = ART_COMPOSITIONS.slice(0, -1).map(c => c.id);
assert.equal(nextArtComposition(lastId, allButLast), lastId);
const firstNext = nextArtComposition("paper-photo", ["paper-photo"]);
assert.notEqual(ART_COMPOSITIONS.find(c => c.id === firstNext).family, "Editorial");
const url = new URL(trendResearchUrl("IA & equipos", "AR"));
assert.equal(url.searchParams.get("q"), "IA & equipos");
assert.equal(url.searchParams.get("date"), "now 7-d");
assert.equal(new URL(trendResearchUrl("", "bad")).searchParams.get("geo"), "AR");
console.log("Art variety: 6 pro compositions, 6 families, four non-repeating cycles, history validation and research links passed.");
