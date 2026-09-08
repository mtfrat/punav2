import { caseStudies, casePath, servicePath, services, SITE_URL } from "../content/site";
import { getPublishedPosts } from "../lib/posts.server";

export async function loader() {
  const [english, spanish] = await Promise.all([getPublishedPosts("en", 50), getPublishedPosts("es", 50)]);
  const lines = [
    "# Puna Tech",
    "",
    "> Bilingual software factory building custom software, AI workflow automation, digital products, and systems integrations across the US and Latin America. English is the default language; Spanish content lives under /es.",
    "",
    "## Core Capabilities & Technical Stack",
    "- **AI Workflow Automation**: Autonomous agentic workflows, LLM orchestration, structured data extraction, human-in-the-loop review queues.",
    "- **Data & Systems Integration**: Enterprise ETL/ELT pipelines, webhook synchronizations, API bridges, CRM data enrichment with Clay and n8n.",
    "- **Custom B2B Software**: High-performance web applications, internal tools, partner portals, and dashboards built with TypeScript, React 19, Node.js, and Supabase.",
    "",
    "## Technology Stack",
    "- **Languages & Frameworks**: TypeScript, React 19, Python, Node.js, Tailwind CSS.",
    "- **Data & Backend**: PostgreSQL, Supabase, Redis, REST & GraphQL APIs.",
    "- **Automation & AI Orchestration**: n8n, Clay, LangChain, OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini.",
    "",
    "## Core Services",
    ...services.en.map((item) => `- [${item.eyebrow}](${SITE_URL}${servicePath("en", item.slug)}): ${item.description}`),
    ...services.es.map((item) => `- [${item.eyebrow}](${SITE_URL}${servicePath("es", item.slug)}): ${item.description}`),
    "",
    "## Case Studies & Proven Workflows",
    ...caseStudies.en.map((item) => `- [${item.title}](${SITE_URL}${casePath("en", item.slug)}): ${item.summary} Flow: ${item.flow.join(" -> ")}`),
    ...caseStudies.es.map((item) => `- [${item.title}](${SITE_URL}${casePath("es", item.slug)}): ${item.summary} Flujo: ${item.flow.join(" -> ")}`),
    "",
    "## Reviewed Blog & Engineering Insights",
    `- [English blog](${SITE_URL}/blog): Technical architecture, automation, and software engineering articles.`,
    `- [Blog en español](${SITE_URL}/es/blog): Artículos sobre arquitectura técnica, automatización y desarrollo de software.`,
    ...english.map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt || ""}`),
    ...spanish.map((post) => `- [${post.title}](${SITE_URL}/es/blog/${post.slug}): ${post.excerpt || ""}`),
    "",
    "## Contact & Assessment",
    `- Discovery & 15-min Audit: ${SITE_URL}/#estimador`,
    `- Direct Email: ${CONTACT_EMAIL}`,
    "",
    "Full technical documentation for LLMs available at: /llms-full.txt",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
