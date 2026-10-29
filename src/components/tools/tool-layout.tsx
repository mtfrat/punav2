import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, ExternalLink, ShieldAlert } from "lucide-react";
import { DemoHeading } from "../demos/shared";
import { toolDefinitions, toolPath, TOOLS_BASE, type ToolDefinition } from "../../content/tools";
import { trackEvent } from "../tracking";
import { Accordion } from "../marketing";

/** Shared page frame for a tool: hero, calculator slot, how it works, sources, FAQ, soft CTA. Server-rendered. */
export default function ToolPage({ tool, children }: { tool: ToolDefinition; children: ReactNode }) {
  const others = toolDefinitions.filter((t) => t.slug !== tool.slug);
  return (
    <main id="main-content" className="dm tl">
      <section className="dm-hero tl-hero">
        <div className="shell">
          <nav className="dm-crumbs" aria-label="Migas de pan">
            <Link to="/es">Puna Tech</Link>
            <span aria-hidden="true">/</span>
            <Link to={TOOLS_BASE}>Herramientas</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{tool.name}</span>
          </nav>
          <p className="dm-kicker">Herramienta gratis · {tool.audience}</p>
          <h1 className="dm-h1 tl-h1"><DemoHeading text={tool.h1} mark={tool.mark} /></h1>
          <p className="dm-lead">{tool.lead}</p>
          <p className="tl-hero-badges">
            <span className="dm-badge">Gratis y sin registro</span>
            <span className="tl-hero-note">Los datos que cargás no salen de tu navegador.</span>
          </p>
        </div>
      </section>

      <section className="dm-section tl-tool" aria-label="Calculadora">
        <div className="shell">
          {children}
          <aside className="tl-disclaimer" aria-label="Aviso importante">
            <ShieldAlert aria-hidden="true" size={20} />
            <p><strong>Importante:</strong> {tool.disclaimer}</p>
          </aside>
        </div>
      </section>

      <section className="dm-section tl-explain" aria-labelledby="tl-explain-heading">
        <div className="shell tl-narrow">
          <h2 id="tl-explain-heading" className="dm-h2">Cómo funciona y qué reglas aplica</h2>
          {tool.sections.map((section) => (
            <article key={section.id} className="tl-article" aria-labelledby={`tl-${section.id}`}>
              <h3 id={`tl-${section.id}`} className="dm-h3">{section.heading}</h3>
              {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {section.formula ? <p className="tl-formula"><code>{section.formula}</code></p> : null}
              {section.items ? <ul className="tl-list">{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="dm-section dm-section-tight tl-sources" aria-labelledby="tl-sources-heading">
        <div className="shell tl-narrow">
          <h2 id="tl-sources-heading" className="dm-h2">Fuentes</h2>
          {tool.sources.length ? (
            <>
              <p>Cada regla de esta herramienta sale de una norma publicada. Acá están los textos originales para que los verifiques:</p>
              <ol className="tl-sources-list">
                {tool.sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink aria-hidden="true" size={14} /></a>
                    <span>{source.note}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p>Esta calculadora usa supuestos de cálculo propios, que están explicados arriba, y no depende de ninguna norma. Cambiá los valores por los de tu empresa.</p>
          )}
        </div>
      </section>

      <section className="dm-section tl-faq" aria-labelledby="tl-faq-heading">
        <div className="shell tl-narrow">
          <h2 id="tl-faq-heading" className="dm-h2">Preguntas frecuentes</h2>
          <Accordion items={tool.faqs.map((faq) => [faq.q, faq.a] as [string, string])} />
        </div>
      </section>

      <section className="dm-section dm-section-tight" aria-labelledby="tl-cta-heading">
        <div className="shell">
          <div className="dm-cta tl-cta">
            <div>
              <h2 id="tl-cta-heading" className="dm-h2">{tool.cta.heading}</h2>
              <p>{tool.cta.text}</p>
            </div>
            <div className="dm-cta-actions">
              <Link
                className="button button-primary"
                to={tool.cta.href}
                onClick={() => trackEvent("cta_click", { locale: "es", placement: "tool_cta", tool: tool.slug, destination: tool.cta.href })}
              >
                {tool.cta.label}
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dm-section tl-more" aria-labelledby="tl-more-heading">
        <div className="shell">
          <h2 id="tl-more-heading" className="dm-h3">Otras herramientas gratis</h2>
          <ul className="dm-more">
            {others.map((other) => (
              <li key={other.slug}>
                <Link to={toolPath(other.slug)} onClick={() => trackEvent("cta_click", { locale: "es", placement: "tool_more", tool: tool.slug, destination: other.slug })}>
                  {other.name}
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </li>
            ))}
            <li><Link to={TOOLS_BASE}>Todas las herramientas<ArrowRight aria-hidden="true" size={15} /></Link></li>
          </ul>
        </div>
      </section>
    </main>
  );
}
