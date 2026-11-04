import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { CalButton, trackEvent } from "../marketing";
import { contactPath } from "../../content/chrome";
import { wantThisHref } from "../../content/demo-cta";

/** Closing CTA for the Spanish-only outreach demos. Same look as DemoCta, with its own copy and block id (lead alert names it). */
export default function OutreachCta({ demo, title, body, label }: { demo: string; title: string; body: string; label: string }) {
  const params = { demo_slug: demo };
  return (
    <section className="dm-cta" aria-labelledby={`cta-${demo}`}>
      <div>
        <h2 id={`cta-${demo}`} className="dm-h2">{title}</h2>
        <p>{body}</p>
        <small>Respondemos por mail, sin secuencias automáticas.</small>
      </div>
      <div className="dm-cta-actions">
        <CalButton locale="es" placement={`demo_${demo}`} params={params} />
        <Link
          to={wantThisHref(contactPath("es"), "demo", demo)}
          className="dm-btn dm-btn-ink"
          data-cta="want-this"
          onClick={() => trackEvent("cta_click", { locale: "es", placement: `demo_${demo}`, destination: "brief", cta: "want_this", ...params })}
        >{label}<ArrowRight aria-hidden="true" size={16} /></Link>
      </div>
    </section>
  );
}
