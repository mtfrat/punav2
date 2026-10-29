import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { isRouteErrorResponse, useLoaderData } from "react-router";
import "../demos.css";
import "../tools.css";
import { PageShell } from "../components/marketing";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import CmCalculator from "../components/tools/cm-calculator";
import HorasCalculator from "../components/tools/horas-calculator";
import PlazosCalculator from "../components/tools/plazos-calculator";
import ToolPage from "../components/tools/tool-layout";
import { findTool, toolPath, TOOLS_BASE } from "../content/tools";
import { SITE_URL } from "../content/site";
import { localeFromPathname, notFoundDocumentMeta } from "../lib/not-found";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export { PublicNotFoundBoundary as ErrorBoundary };

export async function loader({ params }: LoaderFunctionArgs) {
  const tool = findTool(params.slug);
  if (!tool) throw new Response("Not found", { status: 404 });
  return { slug: tool.slug };
}

export const meta: MetaFunction<typeof loader> = ({ data, error, location }) => {
  if (isRouteErrorResponse(error) && error.status === 404) return notFoundDocumentMeta(localeFromPathname(location.pathname));
  const tool = findTool(data?.slug);
  if (!tool) return [];
  const path = toolPath(tool.slug);
  return createMeta({
    locale: "es",
    title: tool.title,
    description: tool.description,
    path,
    image: tool.ogImage,
    imageAlt: tool.ogAlt,
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/png",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}${path}#app`,
        name: tool.name,
        description: tool.description,
        url: `${SITE_URL}${path}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        browserRequirements: "Requiere JavaScript",
        inLanguage: "es-AR",
        isAccessibleForFree: true,
        datePublished: tool.datePublished,
        dateModified: tool.lastmod,
        audience: { "@type": "Audience", audienceType: tool.audience },
        offers: { "@type": "Offer", price: "0", priceCurrency: "ARS", availability: "https://schema.org/InStock" },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      breadcrumbSchema([
        { name: "Puna Tech", path: "/es" },
        { name: "Herramientas", path: TOOLS_BASE },
        { name: tool.name, path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  });
};

export default function Herramienta() {
  const { slug } = useLoaderData<typeof loader>();
  const tool = findTool(slug)!;
  return (
    <PageShell locale="es">
      <ToolPage tool={tool}>
        {slug === "coeficiente-convenio-multilateral" ? <CmCalculator slug={slug} /> : null}
        {slug === "plazos-procesales" ? <PlazosCalculator slug={slug} /> : null}
        {slug === "calculadora-horas-ahorradas" ? <HorasCalculator slug={slug} /> : null}
      </ToolPage>
    </PageShell>
  );
}
