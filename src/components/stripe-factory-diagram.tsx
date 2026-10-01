import type { Locale } from "../content/site";
import { copy } from "../content/site";

/**
 * Hero right panel: B Editorial iso (API → Automation → Dashboard).
 * Wine (#702B38) is a color token elsewhere — never vineyard imagery here.
 */
export function StripeFactoryDiagram({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const nodes = t.factoryDiagramNodes;
  const caption = t.factoryDiagramCaption;

  return (
    <figure className="stripe-factory" aria-labelledby="stripe-factory-caption">
      <figcaption id="stripe-factory-caption" className="sr-only">
        {caption}: {nodes.join(" → ")}
      </figcaption>
      <img
        className="stripe-factory-img"
        src="/landing/hero-editorial-iso-b.jpg"
        alt={t.factoryDiagramAlt}
        width={1280}
        height={720}
        decoding="async"
        fetchPriority="high"
      />
      <ol className="sr-only">
        {nodes.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ol>
    </figure>
  );
}
