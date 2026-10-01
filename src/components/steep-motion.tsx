import { useEffect, useRef } from "react";
import type { Locale } from "../content/site";

const ARTIFACTS = [
  {
    webp: "/art-direction/steep/01-client-live.webp",
    png: "/art-direction/steep/01-client-live.png",
    alt: {
      en: "Client delivery interface: production systems on the Puna landing",
      es: "Interfaz de entrega a cliente: sistemas en producción",
    },
    badge: {
      en: "Client delivery",
      es: "Entrega a cliente",
    },
    className: "steep-card steep-card-a",
    eager: false,
  },
  {
    webp: "/art-direction/steep/02-starpress.webp",
    png: "/art-direction/steep/02-starpress.png",
    alt: { en: "StarPress product interface", es: "Interfaz de producto StarPress" },
    badge: {
      en: "Lab demo · StarPress",
      es: "Demo de lab · StarPress",
    },
    className: "steep-card steep-card-b",
    eager: false,
  },
  {
    webp: "/art-direction/steep/03-viralyt.webp",
    png: "/art-direction/steep/03-viralyt.png",
    alt: { en: "Viralyt product interface", es: "Interfaz de producto Viralyt" },
    badge: {
      en: "Lab demo · Viralyt",
      es: "Demo de lab · Viralyt",
    },
    className: "steep-card steep-card-c",
    eager: false,
  },
  {
    webp: "/art-direction/steep/04-videome.webp",
    png: "/art-direction/steep/04-videome.png",
    alt: { en: "videome product interface", es: "Interfaz de producto videome" },
    badge: {
      en: "Lab demo · videome",
      es: "Demo de lab · videome",
    },
    className: "steep-card steep-card-d",
    eager: false,
  },
] as const;

function motionAllowed() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  return true;
}

/** Client-only GSAP. At most five ScrollTrigger cues: one artifact parallax plus four section reveals. */
export function SteepMotion() {
  const revertRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!motionAllowed()) return;
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const stage = document.querySelector("[data-steep-stage]");
        const cards = gsap.utils.toArray<HTMLElement>("[data-steep-artifact]");
        if (stage && cards.length) {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
          cards.forEach((card, index) => {
            const distance = 8 + index * 4;
            timeline.to(card, { y: Math.min(distance, 20), ease: "none" }, 0);
          });
        }

        gsap.utils.toArray<HTMLElement>("[data-steep-cue]").forEach((section) => {
          gsap.from(section, {
            y: 16,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 88%", once: true },
          });
        });
      });

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

export function SteepArtifactStage({ locale }: { locale: Locale }) {
  return (
    <div className="steep-stage" data-steep-stage>
      {ARTIFACTS.map((artifact) => (
        <figure className={artifact.className} data-steep-artifact key={artifact.png}>
          <div className="steep-card-chrome">
            <span className="steep-chrome-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <small className="steep-chrome-badge">{artifact.badge[locale]}</small>
          </div>
          <picture>
            <source srcSet={artifact.webp} type="image/webp" />
            <img
              src={artifact.png}
              alt={artifact.alt[locale]}
              width="640"
              height="400"
              loading={artifact.eager ? "eager" : "lazy"}
              decoding="async"
              {...(artifact.eager ? { fetchPriority: "high" as const } : {})}
            />
          </picture>
        </figure>
      ))}
    </div>
  );
}
