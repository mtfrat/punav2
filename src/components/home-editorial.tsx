import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { contactPath, type Locale } from "../content/site";
import { trackEvent } from "./tracking";

function reduceMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const RIDGES = [
  { depth: "0.28", fill: "#E4C3AE", d: "M0 168 L90 150 L170 176 L280 112 L390 158 L520 86 L640 140 L760 78 L900 132 L1040 96 L1180 150 L1300 108 L1440 142 L1440 280 L0 280 Z" },
  { depth: "0.46", fill: "#C4623A", d: "M0 188 L120 156 L230 196 L360 132 L500 184 L640 124 L790 176 L940 118 L1080 168 L1220 130 L1440 164 L1440 280 L0 280 Z" },
  { depth: "0.7", fill: "#702B38", d: "M0 214 L150 176 L270 214 L430 156 L590 206 L740 150 L900 198 L1060 146 L1200 192 L1440 160 L1440 280 L0 280 Z" },
  { depth: "1", fill: "#1A1410", d: "M0 236 L160 204 L300 246 L470 188 L650 236 L830 196 L1000 242 L1160 200 L1320 230 L1440 208 L1440 280 L0 280 Z" },
] as const;

export function RidgeField({ caption, badge }: { caption: ReactNode; badge: string }) {
  return (
    <figure className="mm-ridges" data-mm-ridges>
      {RIDGES.map((ridge) => (
        <div className="mm-ridge-parallax" data-ridge={ridge.depth} key={ridge.fill}>
          <svg className="mm-ridge-intro" viewBox="0 0 1440 280" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <path d={ridge.d} fill={ridge.fill} />
          </svg>
        </div>
      ))}
      <figcaption className="mm-ridge-caption">
        {caption}
        <span className="mm-ridge-badge">{badge}</span>
      </figcaption>
    </figure>
  );
}

type FlowId = "invoices" | "stock" | "appointments" | "collections" | "reports";
type Mode = "manual" | "auto";

const FLOWS: Record<Locale, Array<{ id: FlowId; label: string; href?: string; linkLabel?: string; manual: string[]; auto: string[] }>> = {
  es: [
    {
      id: "invoices",
      label: "Facturas",
      href: "/es/automatizaciones/carga-de-facturas-proveedores",
      linkLabel: "Carga de facturas de proveedores",
      manual: ["Llega la factura", "Alguien la carga a mano", "Excel", "Reclamo"],
      auto: ["Llega la factura", "Se lee sola", "Se valida contra tus datos", "Tu equipo revisa las dudosas"],
    },
    {
      id: "stock",
      label: "Stock",
      manual: ["Entra el pedido", "Alguien mira el stock", "Planilla", "Se confirma sin mirar el sistema"],
      auto: ["Entra el pedido", "Stock real del sistema", "Borrador con precio", "Una persona confirma"],
    },
    {
      id: "appointments",
      label: "Turnos",
      manual: ["Piden un turno", "Alguien lo anota", "Planilla", "Se pisan o se pierden"],
      auto: ["Piden un turno", "Se cruza con la agenda", "Queda en el sistema", "El equipo ve las excepciones"],
    },
    {
      id: "collections",
      label: "Cobranzas",
      href: "/es/integraciones/mercado-pago",
      linkLabel: "Integración y conciliación de Mercado Pago",
      manual: ["Entra el pago", "Bajan el reporte", "Excel", "Reclamo al que ya pagó"],
      auto: ["Entra el pago", "Se concilia con la factura", "Comisiones aparte", "Diferencias para revisar"],
    },
    {
      id: "reports",
      label: "Reportes",
      manual: ["Piden el número", "Alguien arma el Excel", "Se manda tarde", "El dato no cierra"],
      auto: ["El dato ya está en el sistema", "El reporte se arma solo", "Llega a tiempo", "El equipo revisa excepciones"],
    },
  ],
  en: [
    {
      id: "invoices",
      label: "Invoices",
      manual: ["The invoice arrives", "Someone types it in", "Spreadsheet", "A dispute"],
      auto: ["The invoice arrives", "It is read on its own", "It is checked against your data", "The team reviews the doubtful ones"],
    },
    {
      id: "stock",
      label: "Stock",
      manual: ["An order comes in", "Someone checks stock", "Spreadsheet", "It is confirmed off-system"],
      auto: ["An order comes in", "Live stock from the system", "A priced draft", "A person confirms"],
    },
    {
      id: "appointments",
      label: "Appointments",
      manual: ["Someone asks for a slot", "Someone writes it down", "Spreadsheet", "Double-booked or lost"],
      auto: ["Someone asks for a slot", "It is checked against the calendar", "It lands in the system", "The team sees the exceptions"],
    },
    {
      id: "collections",
      label: "Collections",
      manual: ["A payment comes in", "Someone downloads the report", "Spreadsheet", "A chase for money already paid"],
      auto: ["A payment comes in", "It is matched to the invoice", "Fees kept separate", "Differences left to review"],
    },
    {
      id: "reports",
      label: "Reports",
      manual: ["Someone asks for the number", "Someone builds the spreadsheet", "It goes out late", "The figure does not tie"],
      auto: ["The figure is already in the system", "The report builds itself", "It arrives on time", "The team reviews exceptions"],
    },
  ],
};

function StepList({ steps, mode, lit }: { steps: string[]; mode: Mode; lit: number }) {
  return (
    <ol className={`mm-steps ${mode === "auto" ? "mm-flow-auto" : "mm-flow-manual"}`}>
      {steps.map((step, index) => (
        <li className={`mm-step${mode === "manual" || index < lit ? " is-on" : ""}`} key={step}>
          <span className="mm-step-index" aria-hidden="true">{index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function FlowDemo({ locale }: { locale: Locale }) {
  const flows = FLOWS[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const touched = useRef(false);
  const mounted = useRef(true);
  const [scenario, setScenario] = useState(0);
  const [mode, setMode] = useState<Mode>("manual");
  const [lit, setLit] = useState(4);
  const playTimer = useRef<number | null>(null);
  const flow = flows[scenario];
  const manualLabel = locale === "es" ? "Proceso manual" : "Manual process";
  const autoLabel = locale === "es" ? "Proceso automatizado" : "Automated process";

  useEffect(() => {
    mounted.current = true;
    if (reduceMotion()) return;
    const node = sectionRef.current;
    if (!node) return;
    let revert: (() => void) | null = null;
    let cancelled = false;

    const apply = (progress: number) => {
      if (!mounted.current || touched.current) return;
      const nextMode: Mode = progress > 0.14 ? "auto" : "manual";
      const nextLit = nextMode === "manual" ? 4 : Math.max(1, Math.ceil(((progress - 0.14) / 0.86) * 4));
      setMode((current) => (current === nextMode ? current : nextMode));
      setLit((current) => (current === nextLit ? current : nextLit));
    };

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        ScrollTrigger.create({
          trigger: node,
          start: "top 108px",
          end: "+=62%",
          pin: true,
          anticipatePin: 1,
          scrub: 0.65,
          onUpdate: (self) => apply(self.progress),
        });
      });
      mm.add("(max-width: 899px)", () => {
        ScrollTrigger.create({
          trigger: node,
          start: "top 72%",
          end: "bottom 55%",
          scrub: 0.65,
          onUpdate: (self) => apply(self.progress),
        });
      });
      revert = () => mm.revert();
    })();

    return () => {
      cancelled = true;
      mounted.current = false;
      revert?.();
      if (playTimer.current) window.clearInterval(playTimer.current);
    };
  }, []);

  function chooseMode(next: Mode) {
    touched.current = true;
    if (playTimer.current) window.clearInterval(playTimer.current);
    setMode(next);
    if (next === "manual" || reduceMotion()) {
      setLit(4);
      return;
    }
    setLit(0);
    let count = 0;
    playTimer.current = window.setInterval(() => {
      count += 1;
      setLit(count);
      if (count >= 4 && playTimer.current) {
        window.clearInterval(playTimer.current);
        playTimer.current = null;
      }
    }, 180);
  }

  const activeSteps = mode === "auto" ? flow.auto : flow.manual;
  const summary = `${mode === "auto" ? autoLabel : manualLabel}. ${flow.label}: ${activeSteps.join(", ")}`;

  return (
    <section className="mm-section mm-section-deep" id="flujo" aria-labelledby="flow-heading" ref={sectionRef} data-mm-flow>
      <div className="shell">
        <header className="mm-heading">
          <p className="eyebrow">{locale === "es" ? "En la operación" : "In the operation"}</p>
          <h2 id="flow-heading" className="mm-h2"><span>{locale === "es" ? "Proceso manual o automatizado" : "Manual process or automated"}</span></h2>
          <p className="mm-dek">
            {locale === "es"
              ? "Deslizá o usá el interruptor. Los pasos son ejemplos de lo que ya está en el sitio: facturas, stock, turnos, cobranzas y reportes."
              : "Scroll or use the toggle. The steps are examples of work already on this site: invoices, stock, appointments, collections, and reports."}
          </p>
        </header>
        <div className="mm-flow-card">
          <div className="mm-flow-toolbar">
            <div className="mm-tabs" role="tablist" aria-label={locale === "es" ? "Ejemplos de proceso" : "Process examples"}>
              {flows.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`flow-tab-${item.id}`}
                  aria-selected={index === scenario}
                  aria-controls="flow-panel"
                  tabIndex={index === scenario ? 0 : -1}
                  onClick={() => setScenario(index)}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                    event.preventDefault();
                    const direction = event.key === "ArrowRight" ? 1 : -1;
                    const next = (index + direction + flows.length) % flows.length;
                    setScenario(next);
                    document.getElementById(`flow-tab-${flows[next].id}`)?.focus();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mm-toggle" role="group" aria-label={locale === "es" ? "Tipo de proceso" : "Process type"}>
              <button type="button" aria-pressed={mode === "manual"} onClick={() => chooseMode("manual")}>{manualLabel}</button>
              <button type="button" aria-pressed={mode === "auto"} onClick={() => chooseMode("auto")}>
                <span className="nav-dot" aria-hidden="true" />
                {autoLabel}
              </button>
            </div>
          </div>
          <div className="mm-flow-stage" id="flow-panel" role="tabpanel" aria-labelledby={`flow-tab-${flow.id}`}>
            <div className={`mm-flow-pane${mode === "manual" ? " is-active" : ""}`}>
              <StepList steps={flow.manual} mode="manual" lit={4} />
            </div>
            <div className={`mm-flow-pane${mode === "auto" ? " is-active" : ""}`}>
              <StepList steps={flow.auto} mode="auto" lit={lit} />
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{summary}</p>
          {flow.href && flow.linkLabel ? (
            <Link className="mm-inline" to={flow.href}>{flow.linkLabel}</Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function parseHours(raw: string) {
  const value = Number(raw.replace(",", "."));
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(168, value);
}

function parseRate(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  const value = Number(digits);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(10_000_000, value);
}

function useAnimatedNumber(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      from.current = value;
      setShown(value);
      return;
    }
    if (reduceMotion()) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = from.current;
    const delta = value - start;
    if (delta === 0) return;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 720);
      const eased = 1 - (1 - progress) ** 3;
      if (progress >= 1) {
        from.current = value;
        setShown(value);
        return;
      }
      setShown(start + delta * eased);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return shown;
}

export function HoursCalculator({ locale }: { locale: Locale }) {
  const [hoursText, setHoursText] = useState("6");
  const [rateText, setRateText] = useState("8000");
  const perYear = parseHours(hoursText) * 52;
  const cost = perYear * parseRate(rateText);
  const shownHours = useAnimatedNumber(perYear);
  const shownCost = useAnimatedNumber(cost);
  const numberLocale = locale === "es" ? "es-AR" : "en-US";
  const hoursLabel = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(Math.round(shownHours));
  const costLabel = new Intl.NumberFormat(numberLocale, { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Math.round(shownCost));
  const cta = locale === "es" ? "Precio cerrado después de una llamada de 15 min" : "Fixed price after a 15-minute call";

  return (
    <section className="mm-section" id="horas" aria-labelledby="hours-heading">
      <div className="shell">
        <header className="mm-heading" data-mm-heading>
          <p className="eyebrow">{locale === "es" ? "Tu tiempo" : "Your time"}</p>
          <h2 id="hours-heading" className="mm-h2"><span>{locale === "es" ? "Horas ahorradas" : "Hours saved"}</span></h2>
        </header>
        <div data-mm-rise>
        <div className="mm-calc mm-rise-item">
          <div className="mm-calc-fields">
            <label className="mm-field" htmlFor="hours-week">
              <span>{locale === "es" ? "Horas por semana que lleva la tarea" : "Hours per week the task takes"}</span>
              <input
                id="hours-week"
                inputMode="decimal"
                min={0}
                max={168}
                step="0.5"
                value={hoursText}
                onChange={(event) => setHoursText(event.target.value)}
              />
            </label>
            <label className="mm-field" htmlFor="hour-cost">
              <span>{locale === "es" ? "Costo por hora de esa tarea (ARS)" : "Hourly cost of that task (ARS)"}</span>
              <input
                id="hour-cost"
                inputMode="numeric"
                min={0}
                value={rateText}
                onChange={(event) => setRateText(event.target.value)}
              />
            </label>
          </div>
          <div className="mm-calc-results" aria-live="polite">
            <p>
              <span className="mm-calc-kicker">{locale === "es" ? "Horas por año" : "Hours per year"}</span>
              <strong className="mm-calc-value">{hoursLabel}</strong>
            </p>
            <p>
              <span className="mm-calc-kicker">{locale === "es" ? "Costo de esa tarea por año" : "Cost of that task per year"}</span>
              <strong className="mm-calc-value">{costLabel}</strong>
            </p>
          </div>
          <p className="mm-calc-note">
            {locale === "es"
              ? "Horas por año = horas por semana × 52. El costo usa el valor por hora que ingresás. Es el tiempo de tu equipo, no un precio de Puna."
              : "Hours per year = hours per week × 52. The cost uses the hourly figure you enter. This is your team's time, not a Puna price."}
          </p>
          <Link
            className="mm-btn mm-btn-accent"
            to={contactPath(locale)}
            onClick={() => trackEvent("cta_click", { locale, placement: "hours_calculator", destination: "contact" })}
          >
            <span className="nav-dot nav-dot-light" aria-hidden="true" />
            {cta}
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
}

/** Scroll choreography for the home page. GSAP is already a dependency and loads only after first paint. */
export function HomeMotion() {
  const revertRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (reduceMotion()) return;
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
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
    })();

    return () => {
      cancelled = true;
      revertRef.current?.();
      revertRef.current = null;
    };
  }, []);

  return null;
}
