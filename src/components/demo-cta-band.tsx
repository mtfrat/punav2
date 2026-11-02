import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { DemoCta } from "../content/demo-ctas";
import { trackEvent } from "./tracking";

/** Visible demo CTA band. `position` ("top" or "end") is only used to tell the two placements apart in analytics. */
export function DemoCtaBand({ cta, page, position, labelledBy }: { cta: DemoCta; page: string; position: "top" | "end"; labelledBy: string }) {
  const ref = useRef<HTMLElement>(null);
  const placement = `demo_cta_${position}`;

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    let sent = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !sent) {
        sent = true;
        trackEvent("cta_view", { locale: "es", placement, destination: cta.href, source_page: page });
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [placement, cta.href, page]);

  return (
    <section ref={ref} className="demo-cta-band" aria-labelledby={labelledBy}>
      <div className="shell demo-cta-band-inner">
        <div className="demo-cta-band-copy">
          <p className="eyebrow">{cta.eyebrow}</p>
          <h2 id={labelledBy}>{cta.title}</h2>
          <p>{cta.body}</p>
        </div>
        <div className="demo-cta-band-actions">
          <Link
            className="button-primary button-primary-terracotta"
            to={cta.href}
            onClick={() => trackEvent("cta_click", { locale: "es", placement, destination: cta.href, source_page: page })}
          >
            <span>{cta.label}</span>
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          {cta.second ? (
            <Link
              className="demo-cta-band-second"
              to={cta.second.href}
              onClick={() => trackEvent("cta_click", { locale: "es", placement: `${placement}_secondary`, destination: cta.second!.href, source_page: page })}
            >
              {cta.second.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
