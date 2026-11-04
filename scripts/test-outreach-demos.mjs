import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Outreach demos: /es/demos/rescate-ia and /es/demos/liquid-software. Source checks always; build checks with --build.
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const pages = [
  { slug: "rescate-ia", route: "src/routes/demo-rescate-ia.tsx", component: "src/components/demos/rescate-ia-demo.tsx" },
  { slug: "liquid-software", route: "src/routes/demo-liquid-software.tsx", component: "src/components/demos/liquid-software-demo.tsx" },
];
const routes = read("src/routes.ts");
const prerender = read("react-router.config.ts");
const sitemap = read("src/routes/sitemap.ts");

for (const { slug, route, component } of pages) {
  assert.match(routes, new RegExp(`route\\("es/demos/${slug}", "\\./routes/demo-${slug}\\.tsx"`), `${slug}: route registered`);
  assert.ok(routes.indexOf(`es/demos/${slug}`) < routes.indexOf(`"demos/:slug"`), `${slug}: static route listed before the :slug pattern`);
  assert.ok(prerender.includes(`"/es/demos/${slug}"`), `${slug}: prerendered`);
  assert.ok(!sitemap.includes(slug), `${slug}: stays out of the sitemap`);
  assert.ok(existsSync(new URL(`../public/og/demos-${slug}-es.png`, import.meta.url)), `${slug}: OG image exists`);

  const src = read(route);
  assert.match(src, /robots: "noindex, follow"/, `${slug}: noindex`);
  const title = src.match(/const TITLE = "([^"]+)"/)[1];
  const description = src.match(/const DESCRIPTION = "([^"]+)"/)[1];
  assert.ok(title.length + " | Puna Tech".length <= 60, `${slug}: title length`);
  assert.ok(description.length >= 90 && description.length <= 155, `${slug}: description length ${description.length}`);
  assert.ok(/Datos ficticios/.test(description), `${slug}: description says fictional data`);
  assert.ok(!/[–—]/.test(title + description), `${slug}: no dashes in SERP text`);

  const all = src + read(component);
  assert.ok(!/Mauricio|Fraticelli/i.test(all), `${slug}: no forbidden names`);
  assert.ok(!/(?:^|[>"'`(])Ejemplo\b/m.test(all.replace(/«|»/g, "")), `${slug}: never "Ejemplo" as a name`);
  assert.ok(/Datos ficticios/.test(all), `${slug}: labelled as fictional data`);
}

if (process.argv.includes("--build")) {
  for (const { slug } of pages) {
    const html = readFileSync(new URL(`../build/client/es/demos/${slug}/index.html`, import.meta.url), "utf8");
    assert.ok(html.includes('<meta name="robots" content="noindex, follow"/>'), `${slug}: noindex in built HTML`);
    assert.ok(html.includes(`<link rel="canonical" href="https://www.puna-tech.com/es/demos/${slug}"/>`), `${slug}: canonical`);
    assert.ok(html.includes(`/og/demos-${slug}-es.png`), `${slug}: og:image`);
    assert.ok(/<h1[^>]*>/.test(html) && (html.match(/<h1[ >]/g) || []).length === 1, `${slug}: exactly one h1`);
    assert.ok(html.includes("/es/contacto?bloque=demo-"), `${slug}: CTA to real contact form`);
  }
}
console.log("outreach demos ok");
