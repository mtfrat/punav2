import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { CalButton, FlowDiagram, PageShell, trackEvent } from "../components/marketing";
import { casePath, getCaseStudy, type Locale } from "../content/site";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es/") ? "es" : "en";
  const study = getCaseStudy(locale, params.slug || "");
  if (!study) throw new Response("Not found", { status: 404 });
  return { locale, study };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { locale, study } = data;
  const path = casePath(locale, study.slug);
  const alternatePath = casePath(locale === "en" ? "es" : "en", study.alternateSlug);
  return createMeta({
    locale, title: `${study.title} | Puna Tech`, description: study.summary, path, alternatePath,
    schema: breadcrumbSchema([{ name: "Puna Tech", path: locale === "en" ? "/" : "/es" }, { name: study.title, path }]),
  });
};

export default function CaseStudyPage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, study } = loaderData;
  useEffect(() => trackEvent("case_study_view", { locale, case_study: study.key }), [locale, study.key]);
  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero case-detail-hero dark-section"><div className="shell detail-hero-grid"><div><div className="case-meta case-meta-dark"><span>{study.type}</span><span>{study.sector}</span></div><p className="eyebrow eyebrow-dark">{study.displayName} · {study.confidentialityLabel}</p><h1>{study.title}</h1><p>{study.summary}</p><CalButton locale={locale} placement={`case_${study.key}`} label={locale === "en" ? "Audit a similar bottleneck" : "Auditar un cuello similar"} /></div><div><p className="eyebrow eyebrow-dark">{study.visualCaption}</p><FlowDiagram items={study.flow} label={`${study.title}: ${study.flow.join(", ")}`} /></div></div></section>
        <section className="section light-section"><div className="shell case-narrative"><article><p className="eyebrow">{locale === "en" ? "The challenge" : "El desafío"}</p><h2>{locale === "en" ? "A fragmented experience was becoming an operating constraint." : "Una experiencia fragmentada se estaba convirtiendo en una limitación operativa."}</h2><p>{study.challenge}</p></article><article><p className="eyebrow">{locale === "en" ? "The solution" : "La solución"}</p><h2>{locale === "en" ? "One architecture with clear ownership at every layer." : "Una arquitectura con responsables claros en cada capa."}</h2><p>{study.solution}</p></article></div></section>
        <section className="section soft-section"><div className="shell two-column"><header className="section-heading"><p className="eyebrow">{locale === "en" ? "Verified impact" : "Impacto verificado"}</p><h2>{locale === "en" ? "What changed after delivery." : "Qué cambió después de la entrega."}</h2><p>{locale === "en" ? "Quantitative metrics remain private until they can be published with supporting evidence." : "Las métricas cuantitativas permanecen privadas hasta poder publicarlas con evidencia de respaldo."}</p></header><ul className="check-list">{study.impact.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></li>)}</ul></div></section>
        <section className="section light-section"><div className="shell"><header className="section-heading"><p className="eyebrow">{locale === "en" ? "Technology in context" : "Tecnología en contexto"}</p><h2>{locale === "en" ? "Tools chosen for the workflow—not for a logo wall." : "Herramientas elegidas para el flujo, no para llenar una pared de logos."}</h2></header><div className="tag-list tag-list-large">{study.stack.map((item) => <span key={item}>{item}</span>)}</div><div className="case-flow-large"><FlowDiagram items={study.flow} label={study.flow.join(", ")} /></div></div></section>
        <section className="detail-cta dark-section"><div className="shell"><div><p className="eyebrow eyebrow-dark">{locale === "en" ? "Your operation will be different" : "Tu operación va a ser diferente"}</p><h2>{locale === "en" ? "The useful pattern is a system shaped around the constraint." : "El patrón útil es un sistema diseñado alrededor de la restricción."}</h2></div><CalButton locale={locale} placement={`case_${study.key}_final`} label={locale === "en" ? "Get the free audit" : "Pedir auditoría gratis"} /></div></section>
      </main>
    </PageShell>
  );
}
