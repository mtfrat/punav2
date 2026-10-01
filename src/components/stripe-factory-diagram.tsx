import type { Locale } from "../content/site";

/**
 * Unreferenced Steep/Stripe-quiet redesign artifact (kept for history; not used on home).
 * Wine (#702B38) is a color token elsewhere — never vineyard imagery here.
 */
export function StripeFactoryDiagram({ locale }: { locale: Locale }) {
  const caption = locale === "en" ? "Software factory stack" : "Stack de software factory";
  const alt =
    locale === "en"
      ? "Isometric editorial diagram of a software factory stack: API, Automation, and Dashboard layers"
      : "Diagrama editorial isométrico del stack de software factory: capas API, Automatización y Dashboard";
  const nodes = locale === "en" ? ["API", "Automation", "Dashboard"] : ["API", "Automatización", "Dashboard"];

  return (
    <figure className="stripe-factory" aria-labelledby="stripe-factory-caption">
      <figcaption id="stripe-factory-caption" className="sr-only">
        {caption}: {nodes.join(" → ")}
      </figcaption>
      <picture>
        <img
          className="stripe-factory-img"
          src="/landing/hero-editorial-iso-b.jpg"
          alt={alt}
          width={1078}
          height={766}
          decoding="async"
        />
      </picture>
      <ol className="sr-only">
        {nodes.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ol>
    </figure>
  );
}
