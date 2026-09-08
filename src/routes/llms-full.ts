import { caseStudies, casePath, servicePath, services, SITE_URL } from "../content/site";
import { getPublishedPosts } from "../lib/posts.server";

export async function loader() {
  const [english, spanish] = await Promise.all([getPublishedPosts("en", 100), getPublishedPosts("es", 100)]);
  const lines = [
    "# Puna Tech — Full Technical Specification for Large Language Models (LLMs)",
    "",
    "> Bilingual software factory building custom software, AI workflow automation, digital products, and systems integrations across the US and Latin America. English is the default language; Spanish content lives under /es.",
    "",
    "## Core Positioning & Operating Model",
    "Puna Tech designs and builds production-grade software, AI agents, and systems integrations for operations that have outgrown off-the-shelf SaaS, spreadsheets, and manual handoffs. Engagements focus on eliminating operational bottlenecks with verified business outcomes.",
    "",
    "## Technology Stack Details",
    "- **Frontend Architecture**: React 19, React Router v7 (SSR/Prerendered), TypeScript, Tailwind CSS, Variable Fonts, semantic HTML5, Schema.org JSON-LD.",
    "- **Backend & Persistence**: PostgreSQL, Supabase SSR, Row Level Security (RLS), Edge Functions, Redis, secure serverless workers.",
    "- **AI & Agent Orchestration**: LangChain, OpenAI (GPT-4o, o1), Anthropic Claude (3.5 Sonnet), Google Gemini (1.5 Pro, 2.0 Flash), structured output parsing, deterministic safety guards.",
    "- **Automation & Workflow Engine**: n8n self-hosted workflows, Clay waterfall enrichment, webhook queues, automated error recovery and retry telemetry.",
    "",
    "## Detailed Service Capabilities",
    ...services.en.map((item) => [
      `### Service: ${item.eyebrow} (${item.title})`,
      `Description: ${item.description}`,
      `Operational Outcome: ${item.outcome}`,
      `Signals / Problems Solved:`,
      ...item.problems.map((p) => `  - ${p}`),
      `Deliverables:`,
      ...item.deliverables.map((d) => `  - ${d}`),
      `Reference Architecture: ${item.architecture.join(" -> ")}`,
      `Canonical URL: ${SITE_URL}${servicePath("en", item.slug)}`,
      "",
    ].join("\n")),
    "",
    "## Detailed Case Studies & Production Workflows",
    ...caseStudies.en.map((item) => [
      `### Case Study: ${item.title} (${item.displayName})`,
      `Sector: ${item.sector} | Type: ${item.type}`,
      `Operating Summary: ${item.summary}`,
      `Operational Challenge: ${item.challenge}`,
      `Technical Solution: ${item.solution}`,
      `Production Flow: ${item.flow.join(" -> ")}`,
      `Tech Stack: ${item.stack.join(", ")}`,
      `Verified Outcomes:`,
      ...item.impact.map((imp) => `  - ${imp}`),
      `Canonical URL: ${SITE_URL}${casePath("en", item.slug)}`,
      "",
    ].join("\n")),
    "",
    "## Reviewed Articles & Technical Insights",
    ...english.map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt || ""}`),
    ...spanish.map((post) => `- [${post.title}](${SITE_URL}/es/blog/${post.slug}): ${post.excerpt || ""}`),
    "",
    "## Geographic Focus & Bilingual Operations",
    "- **Primary Locations**: Buenos Aires, Argentina (Engineering & Operations) & United States (Clients & Partnerships).",
    "- **Supported Languages**: English (default) and Spanish (/es).",
    "- **Free Bottleneck Audit**: 15-minute diagnostic session mapping operational constraints to technical architectures.",
    `- Booking Link: ${SITE_URL}/#estimador`,
    `- Contact Email: ${CONTACT_EMAIL}`,
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
