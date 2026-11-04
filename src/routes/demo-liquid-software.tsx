import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import "../demos.css";
import "../demos-outreach.css";
import { PageShell, trackEvent } from "../components/marketing";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import { DemoHeading } from "../components/demos/shared";
import LiquidSoftwareDemo from "../components/demos/liquid-software-demo";
import OutreachCta from "../components/demos/outreach-cta";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export { PublicNotFoundBoundary as ErrorBoundary };

const PATH = "/es/demos/liquid-software";
const TITLE = "Panel a medida que cambia con tus pedidos";
const DESCRIPTION = "Probá un panel a medida para tu operación: pedís una mejora, el agente propone el cambio, vos aprobás y se publica. Datos ficticios.";
const H1 = "Tu panel a medida cambia cuando vos lo pedís";
const MARK = "cuando vos lo pedís";

export const meta: MetaFunction = () => createMeta({
  locale: "es",
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  // Outreach demo: reachable by link, not for search (same rule as /demos/roi).
  robots: "noindex, follow",
  image: "/og/demos-liquid-software-es.png",
  imageAlt: "Demo interactiva: panel a medida con pedido de mejoras aprobado por una persona. Datos ficticios.",
  imageWidth: 1200,
  imageHeight: 630,
  imageType: "image/png",
  schema: [
    breadcrumbSchema([
      { name: "Puna Tech", path: "/es" },
      { name: "Demos", path: "/es/demos" },
      { name: "Panel a medida", path: PATH },
    ]),
  ],
});

const STORY = [
  ["Problema", "Tu operación cambia todas las semanas y el sistema no. Cada ajuste es un pedido al programador, una espera y una factura."],
  ["Cómo funciona", "Tu panel es software a medida. Pedís la mejora con tus palabras, un agente prepara el cambio con pruebas y vos lo revisás."],
  ["Resultado", "Mejoras en minutos en vez de semanas. Nada se publica sin tu aprobación, y cualquier cambio se puede deshacer."],
] as const;

const GUARDRAILS = [
  ["Siempre aprobás vos", "El agente propone y prueba. Publicar es una decisión humana, cada vez."],
  ["Cambios chicos", "Una mejora por vez, con alcance, archivos y riesgo a la vista antes de decidir."],
  ["Vuelta atrás", "Cada cambio queda en un historial y se puede deshacer en un clic."],
  ["Pruebas antes de salir", "Si alguna prueba falla, el cambio no pasa a la etapa de aprobación."],
] as const;

export default function DemoLiquidSoftware() {
  useEffect(() => { trackEvent("demo_view", { locale: "es", demo: "liquid-software" }); }, []);
  return (
    <PageShell locale="es">
      <main id="main-content" className="dm">
        <section className="dm-hero">
          <div className="shell">
            <nav className="dm-crumbs" aria-label="Breadcrumb">
              <Link to="/es">Puna Tech</Link><span aria-hidden="true">/</span>
              <Link to="/es/demos">Demos</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Panel a medida</span>
            </nav>
            <p className="dm-kicker">Demo interactiva · Puna Tech</p>
            <h1 className="dm-h1"><DemoHeading text={H1} mark={MARK} /></h1>
            <p className="dm-lead">Un panel hecho a medida para tu operación, con una caja para pedir mejoras. Probalo: pedí un cambio, revisá la propuesta y aprobá la publicación.</p>
            <p className="dm-hero-note">Todo lo que ves son datos ficticios y la simulación corre en tu navegador.</p>
          </div>
        </section>

        <section className="dm-section dm-section-tight">
          <div className="shell">
            <ol className="dm-story" aria-label="Problema, cómo funciona y resultado">
              {STORY.map(([label, body], i) => (
                <li key={label} className={i === 2 ? "is-result" : ""}>
                  <span className="dm-story-label"><b>{i + 1}</b>{label}</span>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="dm-section dm-section-stage">
          <div className="shell">
            <LiquidSoftwareDemo />
          </div>
        </section>

        <section className="dm-section">
          <div className="shell">
            <h2 className="dm-h2">Cómo lo cuidamos</h2>
            <ul className="dm-steps">
              {GUARDRAILS.map(([title, body]) => (
                <li key={title}>
                  <h3 className="dm-h3">{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ul>
            <div className="ro-cta-gap" />
            <OutreachCta
              demo="liquid-software"
              title="¿Lo querés para tu operación?"
              body="Contanos cómo trabajan hoy: pedidos, stock, turnos, cobranzas. Armamos un panel a medida que puedan seguir mejorando."
              label="Quiero un panel así"
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
