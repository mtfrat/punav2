import assert from "node:assert/strict";
import { blogDocumentTitle, blogIndexSchema, createMeta } from "../src/lib/seo.ts";
import { languageSwitchPath } from "../src/lib/locale-switch.ts";

const suffix = " | Puna Tech";
const cases = [
  ["When Zapier/n8n stop fitting: custom software", true],
  ["CRM integration audit: a practical checklist", true],
  ["Cuándo Zapier/n8n no alcanzan: software a medida", true],
  ["Auditoría de integración CRM: checklist práctico", true],
  ["AI vs deterministic software: a practical decision guide", false],
  ["IA vs software determinístico: guía práctica para decidir", false],
];

for (const [base, shouldBrand] of cases) {
  const title = blogDocumentTitle(base);
  if (shouldBrand) {
    assert.equal(title, `${base}${suffix}`);
    assert.ok(title.length <= 60, `${title} is ${title.length}`);
  } else {
    assert.equal(title, base);
    assert.ok(base.length + suffix.length > 60);
  }
  const meta = createMeta({
    locale: "en",
    title,
    description: "Reviewed guide from Puna Tech about operational software decisions and implementation.",
    path: "/blog/example",
    type: "article",
  });
  assert.equal(meta.find((entry) => entry.title === title)?.title, title);
  assert.equal(meta.find((entry) => entry.property === "og:title")?.content, title);
}

assert.equal(blogDocumentTitle(`Short note${suffix}`), `Short note${suffix}`);
assert.equal(blogDocumentTitle(`${"x".repeat(70)}${suffix}`), `${"x".repeat(70)}${suffix}`);

assert.equal(
  languageSwitchPath("/blog/when-to-use-ai-vs-deterministic-software", "en", "/es/blog/cuando-usar-ia-vs-software-deterministico"),
  "/es/blog/cuando-usar-ia-vs-software-deterministico",
);
assert.equal(
  languageSwitchPath("/es/blog/cuando-usar-ia-vs-software-deterministico", "es", "/blog/when-to-use-ai-vs-deterministic-software"),
  "/blog/when-to-use-ai-vs-deterministic-software",
);
assert.equal(
  languageSwitchPath("/blog/when-to-leave-zapier-n8n-for-custom-software", "en", "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida"),
  "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida",
);
assert.equal(
  languageSwitchPath("/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", "es", "/blog/when-to-leave-zapier-n8n-for-custom-software"),
  "/blog/when-to-leave-zapier-n8n-for-custom-software",
);
assert.notEqual(
  languageSwitchPath("/blog/when-to-leave-zapier-n8n-for-custom-software", "en"),
  "/es/blog/when-to-leave-zapier-n8n-for-custom-software",
);
assert.equal(languageSwitchPath("/blog/when-to-leave-zapier-n8n-for-custom-software", "en"), "/es/blog");
assert.equal(languageSwitchPath("/services/custom-software", "en"), "/es/servicios/software-a-medida");
assert.equal(languageSwitchPath("/blog", "en"), "/es/blog");

const hub = blogIndexSchema("es", "Notas prácticas", [
  { name: "Cuándo usar IA y cuándo conviene software determinístico", path: "/es/blog/cuando-usar-ia-vs-software-deterministico" },
]);
assert.equal(hub[0]["@type"], "BreadcrumbList");
assert.equal(hub[0].itemListElement[1].item, "https://www.puna-tech.com/es/blog");
assert.equal(hub[1]["@type"], "CollectionPage");
assert.equal(hub[1].inLanguage, "es-AR");
assert.equal(hub[1].mainEntity["@type"], "ItemList");
assert.equal(hub[1].mainEntity.itemListElement[0].url, "https://www.puna-tech.com/es/blog/cuando-usar-ia-vs-software-deterministico");

const englishHub = blogIndexSchema("en", "Practical notes", [
  { name: "When to leave Zapier or n8n for custom software", path: "/blog/when-to-leave-zapier-n8n-for-custom-software" },
]);
assert.equal(englishHub[1].inLanguage, "en");
assert.equal(englishHub[1].mainEntity.itemListElement[0].url, "https://www.puna-tech.com/blog/when-to-leave-zapier-n8n-for-custom-software");

console.log("Verified blog title limits, language-switch paths, and blog hub schema.");
