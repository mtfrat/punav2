// Checks the rubro walkthrough videos. Without flags: content + asset checks (runs inside `npm run test:demos`).
// With --build: checks the prerendered HTML in build/client (runs after `npm run build`).
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { rubroVideos, musicCreditLine } from "../src/content/rubro-videos.ts";
import { rubroDefinitions, rubroPath } from "../src/content/rubros.ts";

const locales = ["es", "en"];
const MB = 1024 * 1024;
/** Attribution lines copied from each video's CREDITS.md ("Para publicar"). */
const expectedCredit = {
  accounting: 'Music: "Easy Lemon" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0 https://creativecommons.org/licenses/by/4.0/',
  legal: 'Music: "Relaxing Piano Music" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0 https://creativecommons.org/licenses/by/4.0/',
  insurance: 'Music: "Wholesome" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0 https://creativecommons.org/licenses/by/4.0/',
  "real-estate": 'Music: "Dreamy Flashback" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0 https://creativecommons.org/licenses/by/4.0/',
  clinics: 'Music: "Relaxing Piano Music" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0 https://creativecommons.org/licenses/by/4.0/',
};
assert.deepEqual(Object.keys(rubroVideos).sort(), Object.keys(expectedCredit).sort(), "videos exist for the five rubros");

const secs = (t) => { const [m, s] = t.split(":").map(Number); return m * 60 + s; };
const isoSecs = (d) => Number(/^PT(\d+(?:\.\d+)?)S$/.exec(d)?.[1]);
const publicFile = (p) => new URL(`../public${p}`, import.meta.url);

let total = 0;
for (const [id, v] of Object.entries(rubroVideos)) {
  assert.ok(rubroDefinitions.some((r) => r.id === id), `${id}: unknown rubro`);
  assert.equal(musicCreditLine(v.music.title), expectedCredit[id], `${id}: credit line must match CREDITS.md verbatim`);
  assert.match(v.uploadDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(isoSecs(v.duration) >= 30 && isoSecs(v.duration) <= 40, `${id}: duration`);
  for (const shape of ["16x9", "9x16"]) {
    for (const ext of ["webm", "mp4", "webp"]) {
      const file = publicFile(`${v.base}-${shape}.${ext}`);
      assert.ok(existsSync(file), `${id}: missing ${v.base}-${shape}.${ext}`);
      const size = statSync(file).size;
      total += size;
      const cap = ext === "webp" ? 0.1 * MB : 2.2 * MB;
      assert.ok(size > 1000 && size <= cap, `${id}: ${shape}.${ext} is ${size} bytes (cap ${cap})`);
    }
  }
  for (const locale of locales) {
    const c = v.copy[locale];
    for (const key of ["name", "description", "heading", "lead", "alt", "note"]) assert.ok(c[key].length >= 8, `${id}/${locale}: ${key}`);
    assert.ok(c.alt.length >= 80, `${id}/${locale}: alt text describes what is on screen`);
    assert.ok(c.chapters.length >= 5);
    let prev = -1;
    for (const [t, label] of c.chapters) {
      assert.match(t, /^\d:\d{2}$/);
      assert.ok(secs(t) > prev && secs(t) < isoSecs(v.duration), `${id}/${locale}: chapters ascend inside the video`);
      assert.ok(label.length > 3);
      prev = secs(t);
    }
    assert.ok(/fictional|ficticios/i.test(c.note + c.alt), `${id}/${locale}: says the data is fictional`);
    assert.ok(!/ejemplo|mauricio|example/i.test(JSON.stringify(c)), `${id}/${locale}: no «Ejemplo» / «Mauricio» wording`);
    assert.ok(!/basad[oa]s? en (casos|clientes)|based on (real )?(cases|clients)/i.test(JSON.stringify(c)), `${id}/${locale}: no claims of being based on real cases`);
  }
  assert.equal(v.copy.es.chapters.length, v.copy.en.chapters.length, `${id}: same chapters in both languages`);
}
for (const shape of ["16x9", "9x16"]) for (const ext of ["webm", "mp4", "webp"]) {
  const file = publicFile(`/media/demos/convenio-multilateral-${shape}.${ext}`);
  assert.ok(existsSync(file), `convenio-multilateral-${shape}.${ext} is missing`);
  const size = statSync(file).size;
  total += size;
  assert.ok(size <= (ext === "webp" ? 0.1 : 2.2) * MB, `convenio-multilateral-${shape}.${ext} is ${size} bytes`);
}
assert.ok(total <= 36 * MB, `rubro video assets weigh ${(total / MB).toFixed(1)} MB, budget is 36 MB`);

// Clinics: the page must lead with what the demo shows (hours and payroll). Authorizations only "a medida" / "to order".
const clinics = rubroDefinitions.find((r) => r.id === "clinics");
for (const locale of locales) {
  const c = clinics.copy[locale];
  const demoWords = locale === "es" ? /horas|liquidaci/i : /hours|payroll/i;
  assert.ok(demoWords.test(c.h1) && demoWords.test(c.lead) && demoWords.test(c.metaDescription) && demoWords.test(c.pain), `clinics/${locale}: H1, lead, meta and pain talk about hours and payroll`);
  const auth = locale === "es" ? /autorizaci|obras? sociales?/i : /authoriz|insurer/i;
  const bespoke = locale === "es" ? /a medida/i : /to order/i;
  assert.ok(!auth.test(c.h1 + c.metaTitle + c.mark), `clinics/${locale}: H1 and title do not promise authorizations`);
  for (const field of ["pain", "metaDescription", "lead", "adapt", "comingNote"]) {
    const text = JSON.stringify(c[field]);
    if (auth.test(text)) assert.ok(bespoke.test(text), `clinics/${locale}/${field}: authorizations only as bespoke: ${text}`);
  }
}

// The layout never autoplays and always defers loading.
const layout = readFileSync(new URL("../src/components/demos/rubro-layout.tsx", import.meta.url), "utf8");
assert.ok(!/autoPlay|autoplay/i.test(layout), "videos must not autoplay");
assert.ok((layout.match(/preload="none"/g) ?? []).length >= 4, "every video uses preload=none");

if (process.argv.includes("--build")) {
  const root = new URL("../build/client/", import.meta.url);
  const decode = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  for (const r of rubroDefinitions) {
    for (const locale of locales) {
      const route = rubroPath(locale, r.slug[locale]);
      const file = new URL(`${route.slice(1)}/index.html`, root);
      assert.ok(existsSync(file), `${route}: prerendered HTML missing`);
      const html = readFileSync(file, "utf8");
      assert.ok(!/autoplay/i.test(html), `${route}: no autoplay in the HTML`);
      const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(decode(m[1])));
      const flat = blocks.flatMap((b) => (Array.isArray(b) ? b : b["@graph"] ?? [b]));
      const allVideos = flat.filter((b) => b["@type"] === "VideoObject");
      const v = rubroVideos[r.id];
      assert.ok(v, `${route}: every rubro has a video now`);
      // The accounting page also keeps the Convenio Multilateral video (second VideoObject and second pair of players).
      const hasCm = r.id === "accounting";
      assert.equal(allVideos.length, hasCm ? 2 : 1, `${route}: VideoObject count`);
      const videos = allVideos.filter((b) => b.contentUrl.includes("/rubro-"));
      assert.equal(videos.length, 1, `${route}: exactly one rubro VideoObject`);
      if (hasCm) {
        const cm = allVideos.find((b) => b.contentUrl.includes("/convenio-multilateral-"));
        assert.equal(cm.creditText, 'Music: "Wholesome" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0 https://creativecommons.org/licenses/by/4.0/');
        assert.equal(cm.musicBy?.name, "Kevin MacLeod");
      }
      const o = videos[0];
      for (const key of ["name", "description", "thumbnailUrl", "uploadDate", "contentUrl", "duration"]) assert.ok(o[key] && o[key].length !== 0, `${route}: VideoObject.${key}`);
      assert.equal(o.duration, v.duration);
      assert.equal(o.creditText, expectedCredit[r.id], `${route}: creditText`);
      assert.equal(o.musicBy?.name, "Kevin MacLeod");
      assert.ok(o.contentUrl.startsWith("https://www.puna-tech.com/media/demos/rubro-"), `${route}: contentUrl is absolute`);
      for (const u of [o.contentUrl, ...o.thumbnailUrl]) assert.ok(existsSync(new URL(u.replace("https://www.puna-tech.com/", ""), root)), `${route}: ${u} not in build output`);
      const videoTags = html.match(/<video\b[^>]*>/g) ?? [];
      assert.equal(videoTags.length, hasCm ? 4 : 2, `${route}: players (wide + tall per video)`);
      for (const tag of videoTags) {
        assert.ok(/ controls=""/.test(tag) || / controls[ >]/.test(tag), `${route}: controls`);
        assert.ok(/preload="none"/.test(tag) && /poster="/.test(tag) && /playsinline/i.test(tag), `${route}: preload none, poster, playsinline`);
        assert.ok(/width="\d+"/.test(tag) && /height="\d+"/.test(tag), `${route}: reserved size`);
        assert.ok(/aria-label="[^"]{60,}/.test(tag), `${route}: aria-label`);
      }
      const text = decode(html.replace(/<[^>]+>/g, ""));
      assert.ok(text.includes(expectedCredit[r.id]), `${route}: visible credit line is on the page`);
      assert.ok(html.includes("https://creativecommons.org/licenses/by/4.0/"), `${route}: license link`);
    }
  }
  console.log("Verified rubro video markup in prerendered HTML (8 rubro pages).");
} else {
  console.log(`Rubro videos OK: ${(total / MB).toFixed(1)} MB across ${Object.keys(rubroVideos).length} rubros.`);
}
