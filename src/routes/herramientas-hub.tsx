import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, Calculator, CalendarDays, Clock } from "lucide-react";
import "../demos.css";
import "../tools.css";
import { Accordion, PageShell, trackEvent } from "../components/marketing";
import { DemoHeading } from "../components/demos/shared";
import { toolDefinitions, toolHub, toolPath, TOOLS_BASE } from "../content/tools";
import { breadcrumbSchema, collectionPageSchema, createMeta } from "../lib/seo";

export const meta: MetaFunction = () =>
  createMeta({
    locale: "es",
    title: toolHub.title,
    description: toolHub.description,
    path: TOOLS_BASE,
    image: toolHub.ogImage,
    imageAlt: toolHub.ogAlt,
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/png",
    schema: [
      collectionPageSchema({
        locale: "es",
        name: toolHub.h1,
        path: TOOLS_BASE,
        items: toolDefinitions.map((t) => ({ name: t.name, path: toolPath(t.slug) })),
      }),
      breadcrumbSchema([
        { name: "Puna Tech", path: "/es" },
        { name: toolHub.breadcrumb, path: TOOLS_BASE },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: toolHub.faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
      },
    ],
  });

const ICONS = {
  "coeficiente-convenio-multilateral": Calculator,
  "plazos-procesales": CalendarDays,
  "calculadora-horas-ahorradas": Clock,
} as const;

const AUDIENCE_CHIP = {
  "coeficiente-convenio-multilateral": "Contadores",
  "plazos-procesales": "Abogados",
  "calculadora-horas-ahorradas": "Pymes",
} as const;

export default function HerramientasHub() {
  return (
    <PageShell locale="es">
      <main id="main-content" className="dm tl">
        <section className="dm-hero tl-hero">
          <div className="shell">
            <nav className="dm-crumbs" aria-label="Migas de pan">
              <Link to="/es">Puna Tech</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{toolHub.breadcrumb}</span>
            </nav>
            <p className="dm-kicker">Herramientas · Argentina</p>
            <h1 className="dm-h1 tl-h1"><DemoHeading text={toolHub.h1} mark={toolHub.mark} /></h1>
            <p className="dm-lead">{toolHub.lead}</p>
          </div>
        </section>

        <section className="dm-section" aria-labelledby="tl-hub-list">
          <div className="shell">
            <h2 id="tl-hub-list" className="dm-sr">Lista de herramientas</h2>
            <ul className="dm-cards tl-hub-cards">
              {toolDefinitions.map((tool) => {
                const Icon = ICONS[tool.slug];
                return (
                  <li key={tool.slug} className="dm-card tl-hub-card">
                    <span className="dm-chip is-orange">{AUDIENCE_CHIP[tool.slug]}</span>
                    <Icon aria-hidden="true" size={28} />
                    <h3 className="dm-h3"><Link to={toolPath(tool.slug)} onClick={() => trackEvent("cta_click", { locale: "es", placement: "tools_hub_card", tool: tool.slug, destination: toolPath(tool.slug) })}>{tool.name}</Link></h3>
                    <p>{tool.card}</p>
                    <Link className="dm-link-btn" to={toolPath(tool.slug)} aria-label={`Abrir ${tool.name}`} onClick={() => trackEvent("cta_click", { locale: "es", placement: "tools_hub_card", tool: tool.slug, destination: toolPath(tool.slug) })}>
                      Usar gratis<ArrowRight aria-hidden="true" size={15} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="dm-section dm-section-tight" aria-labelledby="tl-hub-faq">
          <div className="shell tl-narrow">
            <h2 id="tl-hub-faq" className="dm-h2">Preguntas frecuentes</h2>
            <Accordion items={toolHub.faqs.map((f) => [f.q, f.a] as [string, string])} />
          </div>
        </section>

        <section className="dm-section dm-section-tight" aria-labelledby="tl-hub-cta">
          <div className="shell">
            <div className="dm-cta tl-cta">
              <div>
                <h2 id="tl-hub-cta" className="dm-h2">¿Querés ver cómo se automatiza el resto del estudio?</h2>
                <p>Mirá demos interactivas por rubro, con datos ficticios, y probá cómo quedaría tu operación.</p>
              </div>
              <div className="dm-cta-actions">
                <Link className="button button-primary" to="/es/demos" onClick={() => trackEvent("cta_click", { locale: "es", placement: "tools_hub_cta", destination: "/es/demos" })}>Ver las demos<ArrowRight aria-hidden="true" size={17} /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
