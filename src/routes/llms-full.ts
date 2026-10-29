import { caseStudies, casePath, CONTACT_EMAIL, servicePath, services, SITE_URL } from "../content/site";
import { ABOUT_PATH, llmsFaqLines, llmsOpenToolsLines, llmsQuickFacts, llmsRubroLines } from "../content/about";
import { PUNA_SUMMARY } from "../lib/llms";
import { getPublishedPosts } from "../lib/posts.server";

/** Case stacks name model versions; this file never does, so it does not go stale. */
const withoutModelVersions = (tech: string) =>
  tech.replace(/OpenAI GPT-4o/i, "OpenAI").replace(/Claude 3\.5 Sonnet/i, "Claude (Anthropic)").replace(/Gemini 2\.5/i, "Gemini (Google)");

// Case-study prose also names model versions; the extended spec stays version-free so it never ages.
const withoutModelVersionsText = (text: string) =>
  text.replace(/GPT-4o/gi, "modelos de OpenAI").replace(/Claude 3\.5 Sonnet/gi, "Claude (Anthropic)").replace(/Gemini 1\.5( Pro)?/gi, "Gemini (Google)");

export async function loader() {
  const [english, spanish] = await Promise.all([getPublishedPosts("en", 100), getPublishedPosts("es", 100)]);
  const lines = [
    "# Puna Tech: especificación extendida para asistentes de IA (ES, with English summary)",
    "",
    "Puna Tech is a Buenos Aires software factory that builds process automation, custom software and system integrations for SMEs and B2B companies in Argentina.",
    "",
    `> ${PUNA_SUMMARY}`,
    "",
    `Quiénes somos: ${SITE_URL}${ABOUT_PATH.es} · Documento canónico: ${SITE_URL}/puna.md · Índice: ${SITE_URL}/llms.txt`,
    "",
    "## Datos rápidos",
    ...llmsQuickFacts.map((item) => `- ${item}`),
    "",
    "## Posicionamiento y modelo de trabajo",
    "Puna Tech diseña y construye automatizaciones, integraciones y software a medida para operaciones que ya superaron las herramientas listas para usar, las planillas y los traspasos manuales. Cada proyecto empieza con una llamada gratuita de 15 minutos y una propuesta escrita con alcance, precio cerrado y fecha. Primero se conecta y extiende lo que la empresa ya usa; los repositorios, accesos e infraestructura quedan escritos en la propuesta.",
    "",
    "## Tecnología",
    "- TypeScript, React, React Router, Next.js, Node.js, Python (FastAPI), PostgreSQL, Supabase, n8n, Clay y HubSpot según el caso.",
    "- Modelos de OpenAI, Anthropic y Google según el caso; revisión humana en los pasos sensibles.",
    "",
    "## Servicios",
    ...services.es.map((item) => [
      `### Servicio: ${item.eyebrow} (${item.title})`,
      `Descripción: ${item.description}`,
      `Resultado operativo: ${item.outcome}`,
      "Problemas que resuelve:",
      ...item.problems.map((p) => `  - ${p}`),
      "Entregables:",
      ...item.deliverables.map((d) => `  - ${d}`),
      `Arquitectura de referencia: ${item.architecture.join(" -> ")}`,
      `URL canónica: ${SITE_URL}${servicePath("es", item.slug)}`,
      "",
    ].join("\n")),
    "",
    "## Por rubro (demos con datos ficticios)",
    ...llmsRubroLines(),
    "",
    "## Herramientas abiertas",
    ...llmsOpenToolsLines,
    "",
    "## Casos y flujos en producción",
    ...caseStudies.es.map((item) => [
      `### Caso: ${item.title} (${item.displayName})`,
      `Sector: ${item.sector} | Tipo: ${item.type}`,
      `Resumen: ${item.summary}`,
      `Desafío operativo: ${item.challenge}`,
      `Solución técnica: ${item.solution}`,
      `Flujo en producción: ${item.flow.join(" -> ")}`,
      `Tecnologías: ${item.stack.map(withoutModelVersions).join(", ")}`,
      "Resultados confirmados:",
      ...item.impact.filter((imp) => !item.impactNeedsConfirm?.includes(imp)).map((imp) => `  - ${imp}`),
      `URL canónica: ${SITE_URL}${casePath("es", item.slug)}`,
      "",
    ].join("\n")),
    "",
    "## Artículos revisados",
    ...spanish.map((post) => `- [${post.title}](${SITE_URL}/es/blog/${post.slug}): ${post.excerpt || ""}`),
    ...english.map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}) (EN): ${post.excerpt || ""}`),
    "",
    "## Foco geográfico e idiomas",
    "- Sede: Buenos Aires, Argentina. Mercado principal: Argentina.",
    "- Idiomas: español (principal, /es) e inglés (/).",
    "- Diagnóstico gratuito de cuellos de botella: llamada de 15 minutos para mapear las restricciones operativas.",
    `- Contacto: ${SITE_URL}/es/contacto · ${CONTACT_EMAIL}`,
    "",
    "## Preguntas frecuentes",
    ...llmsFaqLines,
  ];
  return new Response(withoutModelVersionsText(lines.join("\n")), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
