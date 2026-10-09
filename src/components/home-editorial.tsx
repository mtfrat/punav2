import { useEffect, useRef } from "react";
import { loadGsap } from "./defer";

function reduceMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const RIDGES = [
  { depth: "0.28", fill: "#E4C3AE", d: "M0 168 L90 150 L170 176 L280 112 L390 158 L520 86 L640 140 L760 78 L900 132 L1040 96 L1180 150 L1300 108 L1440 142 L1440 280 L0 280 Z" },
  { depth: "0.46", fill: "#C4623A", d: "M0 188 L120 156 L230 196 L360 132 L500 184 L640 124 L790 176 L940 118 L1080 168 L1220 130 L1440 164 L1440 280 L0 280 Z" },
  { depth: "0.7", fill: "#702B38", d: "M0 214 L150 176 L270 214 L430 156 L590 206 L740 150 L900 198 L1060 146 L1200 192 L1440 160 L1440 280 L0 280 Z" },
  { depth: "1", fill: "#1A1410", d: "M0 236 L160 204 L300 246 L470 188 L650 236 L830 196 L1000 242 L1160 200 L1320 230 L1440 208 L1440 280 L0 280 Z" },
] as const;

export function RidgeField() {
  return (
    <figure className="mm-ridges" data-mm-ridges aria-hidden="true">
      {RIDGES.map((ridge) => (
        <div className="mm-ridge-parallax" data-ridge={ridge.depth} key={ridge.fill}>
          <svg className="mm-ridge-intro" viewBox="0 0 1440 280" preserveAspectRatio="xMidYMax slice">
            <path d={ridge.d} fill={ridge.fill} />
          </svg>
        </div>
      ))}
    </figure>
  );
}

/** Scroll choreography for the home page. GSAP loads after first paint, on idle or first interaction. */
export function HomeMotion() {
  const revertRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    void import("../newsreader-italic.css");
  }, []);

  useEffect(() => {
    if (reduceMotion()) return;
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const root = document.querySelector("[data-mm-home]");
      if (!root) return;

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-ridge]").forEach((layer) => {
          const depth = Number(layer.dataset.ridge || "0.3");
          gsap.to(layer, {
            y: () => -150 * depth,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-mm-hero]",
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          });
        });

        const viewTimeline = typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()");
        if (!viewTimeline) {
          gsap.utils.toArray<HTMLElement>("[data-mm-rise]").forEach((group) => {
            const items = group.querySelectorAll<HTMLElement>(":scope > .mm-rise-item");
            if (!items.length) return;
            gsap.from(items, {
              y: 42,
              scale: 0.96,
              opacity: 0,
              duration: 0.8,
              stagger: 0.09,
              ease: "power3.out",
              scrollTrigger: { trigger: group, start: "top 86%", once: true },
            });
          });
          gsap.utils.toArray<HTMLElement>(".mm-h2 > span").forEach((span) => {
            gsap.from(span, {
              yPercent: 110,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: span.parentElement, start: "top 90%", once: true },
            });
          });
        }
      }, root);

      revertRef.current = () => ctx.revert();
      if (cancelled) revertRef.current();
    });

    return () => {
      cancelled = true;
      revertRef.current?.();
      revertRef.current = null;
    };
  }, []);

  return null;
}
