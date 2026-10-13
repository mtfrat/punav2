import { useEffect } from "react";
import { Play, Check } from "lucide-react";
import { useLocation } from "react-router";
import { heroCopy } from "../content/hero-variants";
import type { Locale } from "../content/chrome";
import { CalButton } from "./marketing";
import { trackEvent } from "./tracking";

const VARIANT = "b";
let lastHeroView = "";

/** Fires `hero_variant_view` once per home path. Variant B is the home hero. */
export function HeroVariantView({ locale }: { locale: Locale }) {
  const location = useLocation();

  useEffect(() => {
    const key = `${location.pathname}:${VARIANT}`;
    if (lastHeroView === key) return;
    lastHeroView = key;
    trackEvent("hero_variant_view", { variant: VARIANT, locale });
  }, [locale, location.pathname]);

  return null;
}

function HeroCaption({ before, em, badge }: { before: string; em: string; badge: string }) {
  return (
    <p className="mm-hero-caption">
      <span>{before}<em>{em}</em></span>
      <span className="mm-hero-badge">{badge}</span>
    </p>
  );
}

function HeroActions({
  locale,
  placement,
  primary,
  secondary,
}: {
  locale: Locale;
  placement: "hero_above_fold" | "sticky_mobile";
  primary: string;
  secondary: string;
}) {
  return (
    <div className="cta-group mm-hero-actions">
      <CalButton
        locale={locale}
        placement={placement}
        variant={VARIANT}
        ctaId="diagnosis_15"
        label={primary}
        className="button-primary-terracotta mm-btn mm-btn-accent"
      />
      <a
        href="#flujo"
        className="mm-demo-link"
        data-variant={VARIANT}
        data-cta-id="demo_2min"
        data-placement={placement}
        onClick={() => trackEvent("cta_click", {
          locale,
          variant: VARIANT,
          cta_id: "demo_2min",
          placement,
          destination: "flow_demo",
        })}
      >
        <Play aria-hidden="true" size={15} />
        <span>{secondary}</span>
        <span className="mm-demo-chip" aria-hidden="true">2 min</span>
      </a>
    </div>
  );
}

export function HeroOffer({ locale }: { locale: Locale }) {
  const copy = heroCopy[locale];
  return (
    <div className="mm-hero-offer">
      <p className="mm-hero-body mm-variant-lede">{copy.subtitle}</p>
      <div className="mm-variant-rule" aria-hidden="true" />
      <HeroActions locale={locale} placement="hero_above_fold" primary={copy.primary} secondary={copy.secondary} />
      <p className="mm-micro">
        <Check aria-hidden="true" size={16} />
        <span>{copy.micro}</span>
      </p>
      <HeroCaption before={copy.captionBefore} em={copy.captionEm} badge={copy.badge} />
    </div>
  );
}

/** Mobile bar. Desktop uses the in-hero pair. */
export function HeroStickyBar({ locale }: { locale: Locale }) {
  const copy = heroCopy[locale];
  const label = locale === "en" ? "Diagnosis and demo" : "Diagnóstico y demo";
  return (
    <div className="mm-sticky-b" role="region" aria-label={label}>
      <div className="mm-sticky-b-inner">
        <HeroActions locale={locale} placement="sticky_mobile" primary={copy.primary} secondary={copy.secondary} />
      </div>
    </div>
  );
}
