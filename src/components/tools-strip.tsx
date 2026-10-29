import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { toolDefinitions, toolPath, TOOLS_BASE } from "../content/tools.ts";
import { trackEvent } from "./tracking";

/** Small strip on the Spanish home page linking the free tools hub and each tool. Reuses the rubro-strip look. */
export function ToolsStrip({ placement }: { placement: string }) {
  const headingId = `${placement}-heading`;
  return (
    <section className="section rubro-strip" aria-labelledby={headingId}>
      <div className="shell">
        <header className="rubro-strip-head">
          <div>
            <p className="eyebrow">Herramientas gratis</p>
            <h2 id={headingId}>Calculadoras para tu estudio o tu pyme</h2>
            <p>Sin registro y con la fuente de cada regla a la vista: coeficiente de Convenio Multilateral, plazos procesales y horas ahorradas.</p>
          </div>
          <Link
            className="text-link"
            to={TOOLS_BASE}
            onClick={() => trackEvent("cta_click", { locale: "es", placement, destination: "tools_hub" })}
          >
            Ver todas las herramientas
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </header>
        <ul className="rubro-strip-grid">
          {toolDefinitions.map((tool) => (
            <li key={tool.slug}>
              <Link
                className="rubro-strip-card"
                to={toolPath(tool.slug)}
                onClick={() => trackEvent("cta_click", { locale: "es", placement, destination: `tool_${tool.slug}`, tool: tool.slug })}
              >
                <strong>{tool.name}</strong>
                <span>{tool.card}</span>
                <em>
                  Usar gratis
                  <ArrowRight aria-hidden="true" size={15} />
                </em>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
