import type { Locale } from "../content/site";
import { copy } from "../content/site";

/**
 * Thin-line SVG: software-factory process nodes.
 * Wine (#702B38) is a color token elsewhere — never vineyard imagery here.
 */
export function StripeFactoryDiagram({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const nodes = t.factoryDiagramNodes;
  const caption = t.factoryDiagramCaption;

  const centers = [80, 240, 400, 560];
  const cy = 88;
  const r = 18;

  return (
    <figure className="stripe-factory" aria-labelledby="stripe-factory-caption">
      <figcaption id="stripe-factory-caption" className="sr-only">
        {caption}: {nodes.join(" → ")}
      </figcaption>
      <svg
        className="stripe-factory-svg"
        viewBox="0 0 640 220"
        role="presentation"
        focusable="false"
        aria-hidden="true"
      >
        {centers.slice(0, -1).map((x, i) => (
          <line
            key={`line-${i}`}
            className="stripe-factory-stroke"
            x1={x + r + 4}
            y1={cy}
            x2={centers[i + 1] - r - 4}
            y2={cy}
          />
        ))}
        {centers.slice(0, -1).map((x, i) => {
          const mid = (x + centers[i + 1]) / 2;
          return (
            <polyline
              key={`arrow-${i}`}
              className="stripe-factory-stroke"
              points={`${mid - 5},${cy - 5} ${mid + 2},${cy} ${mid - 5},${cy + 5}`}
              fill="none"
            />
          );
        })}
        {centers.map((x, i) => (
          <g key={nodes[i]}>
            <circle className="stripe-factory-node" cx={x} cy={cy} r={r} />
            <text
              className="stripe-factory-index"
              x={x}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {String(i + 1).padStart(2, "0")}
            </text>
            <text
              className="stripe-factory-label"
              x={x}
              y={cy + r + 28}
              textAnchor="middle"
            >
              {nodes[i]}
            </text>
          </g>
        ))}
      </svg>
      <ol className="sr-only">
        {nodes.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ol>
    </figure>
  );
}
