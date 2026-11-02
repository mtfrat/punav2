/**
 * FAQ extraction for blog posts. The editorial pipeline writes a "Preguntas frecuentes" / "Frequently asked questions"
 * section as an <h2> followed by <h3> question + <p> answer pairs. The page sanitizer strips <script>, so FAQPage
 * JSON-LD cannot live in the content: it is built here, server-side, from the same sanitized HTML that is rendered,
 * so every question in the JSON-LD is visible on the page. No DB column needed.
 */
const FAQ_HEADING = /^(preguntas frecuentes|frequently asked questions|faq|faqs)\b/i;

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

function plainText(html: string) {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

export function extractFaq(html: string): Array<[string, string]> {
  const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  const start = headings.find((m) => FAQ_HEADING.test(plainText(m[1])));
  if (!start || start.index === undefined) return [];
  const afterStart = html.slice(start.index + start[0].length);
  const nextH2 = afterStart.search(/<h2\b/i);
  const section = nextH2 === -1 ? afterStart : afterStart.slice(0, nextH2);
  const items: Array<[string, string]> = [];
  const parts = section.split(/<h3\b[^>]*>/i).slice(1);
  for (const part of parts) {
    const end = part.search(/<\/h3>/i);
    if (end === -1) continue;
    const question = plainText(part.slice(0, end));
    const answerMatch = part.slice(end).match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    const answer = answerMatch ? plainText(answerMatch[1]) : "";
    if (question && answer) items.push([question, answer]);
  }
  return items;
}
