import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import "../demos.css";
import "../demos-outreach.css";
import { PageShell, trackEvent } from "../components/marketing";
import { PublicNotFoundBoundary } from "../components/not-found-page";
import { DemoHeading } from "../components/demos/shared";
import RescateIaDemo from "../components/demos/rescate-ia-demo";
import OutreachCta from "../components/demos/outreach-cta";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export { PublicNotFoundBoundary as ErrorBoundary };

const PATH = "/es/demos/rescate-ia";
const TITLE = "Rescate de apps hechas con IA o low-code";
const DESCRIPTION = "Probá cómo revisamos y estabilizamos una app hecha con IA: seguridad, datos, deploy y crecimiento, con antes y después. Datos ficticios.";
const H1 = "El vibe coding rompe proyectos";
const MARK = "rompe proyectos";

export const meta: MetaFunction = () => createMeta({
  locale: "es",
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  // Outreach demo: reachable by link, not for search (same rule as /demos/roi).
  robots: "noindex, follow",
  image: "/og/demos-rescate-ia-es.png",
  imageAlt: "Demo interactiva: rescate de apps hechas con IA. Datos ficticios.",
  imageWidth: 1200,
  imageHeight: 630,
  imageType: "image/png",
  schema: [
    breadcrumbSchema([
      { name: "Puna Tech", path: "/es" },
      { name: "Demos", path: "/es/demos" },
      { name: "Rescate de apps hechas con IA", path: PATH },
    ]),
  ],
});

const STORY = [
  ["Problema", "Armaste la app con IA o low-code y funcionó. Con usuarios reales aparecen datos que se mezclan, claves expuestas, caídas y arreglos que rompen otra cosa."],
  ["Cómo la rescatamos", "Primero leemos todo sin tocar nada. Después te damos un diagnóstico priorizado y arreglamos de lo más riesgoso a lo menos, con una persona revisando cada cambio."],
  ["Resultado", "Una app que aguanta usuarios, con copias, pruebas, publicación ordenada y documentación. Y un equipo que sabe cómo seguir."],
] as const;

const PROCESS = [
  ["Revisión sin tocar nada", "Código, base de datos, claves y publicación, solo lectura."],
  ["Diagnóstico priorizado", "Qué es crítico, qué puede esperar y qué no vale la pena arreglar."],
  ["Arreglos con prueba", "Cambios chicos, cada uno con su prueba y vuelta atrás."],
  ["Traspaso", "Guía, mapa del sistema y respaldo para que no dependas de nadie."],
] as const;

export default function DemoRescateIa() {
  useEffect(() => { trackEvent("demo_view", { locale: "es", demo: "rescate-ia" }); }, []);
  return (
    <PageShell locale="es">
      <main id="main-content" className="dm">
        <section className="dm-hero">
          <div className="shell">
            <nav className="dm-crumbs" aria-label="Breadcrumb">
              <Link to="/es">Puna Tech</Link><span aria-hidden="true">/</span>
              <Link to="/es/demos">Demos</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Rescate de apps con IA</span>
            </nav>
            <p className="dm-kicker">Demo interactiva · Puna Tech</p>
            <h1 className="dm-h1"><DemoHeading text={H1} mark={MARK} /></h1>
            <p className="dm-lead">Armaste una app con IA o low-code y ahora no sabés si aguanta. Mirá cómo revisamos una de ejemplo y la dejamos estable y lista para crecer.</p>
            <p className="dm-hero-note">Todo lo que ves son datos ficticios.</p>
          </div>
        </section>

        <section className="dm-section dm-section-tight">
          <div className="shell">
            <ol className="dm-story" aria-label="Problema, cómo la rescatamos y resultado">
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
            <RescateIaDemo />
            <p className="dm-origin">No reescribimos todo por reflejo: primero estabilizamos lo que ya tenés. Si una parte conviene rehacerla, te lo decimos antes de tocarla.</p>
          </div>
        </section>

        <section className="dm-section">
          <div className="shell">
            <h2 className="dm-h2">Cómo trabajamos</h2>
            <ol className="dm-steps">
              {PROCESS.map(([title, body], i) => (
                <li key={title}>
                  <span className="dm-step-num">{i + 1}</span>
                  <h3 className="dm-h3">{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
            <div className="ro-cta-gap" />
            <OutreachCta
              demo="rescate-ia"
              title="¿Querés que miremos tu app?"
              body="Contanos qué armaste y con qué herramienta. Te devolvemos un diagnóstico claro de lo que hay que arreglar primero."
              label="Quiero que revisen mi app"
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
