import { useEffect, useLayoutEffect } from "react";
import { Play, Check } from "lucide-react";
import { useLocation } from "react-router";
import { heroVariantCopy } from "../content/hero-variants";
import type { Locale } from "../content/chrome";
import { readHeroVariant } from "../lib/hero-variant";
import { CalButton } from "./marketing";
import { trackEvent } from "./tracking";

let lastHeroView = "";

/** Re-apply `data-hero` after hydration and on client navigations. Fires `hero_variant_view` once per variant. */
export function HeroVariantRuntime({ locale }: { locale: Locale }) {
  const location = useLocation();

  useLayoutEffect(() => {
    document.documentElement.dataset.hero = readHeroVariant(location.search);
    return () => {
      delete document.documentElement.dataset.hero;
    };
  }, [location.search]);

  useEffect(() => {
    const variant = readHeroVariant(location.search);
    const key = `${location.pathname}:${variant}`;
    if (lastHeroView === key) return;
    lastHeroView = key;
    trackEvent("hero_variant_view", { variant, locale });
  }, [locale, location.pathname, location.search]);

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

function HeroMicro({ children }: { children: string }) {
  return (
    <p className="mm-micro">
      <Check aria-hidden="true" size={16} />
      <span>{children}</span>
    </p>
  );
}

function HeroActions({
  locale,
  variant,
  placement,
  primary,
  secondary,
}: {
  locale: Locale;
  variant: "a" | "b" | "c";
  placement: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="cta-group mm-hero-actions">
      <CalButton
        locale={locale}
        placement={placement}
        variant={variant}
        ctaId="diagnosis_15"
        label={primary}
        className="button-primary-terracotta mm-btn mm-btn-accent"
      />
      <a
        href="#flujo"
        className="mm-demo-link"
        data-variant={variant}
        data-cta-id="demo_2min"
        data-placement={placement}
        onClick={() => trackEvent("cta_click", {
          locale,
          variant,
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

export function HeroVariantSlots({ locale }: { locale: Locale }) {
  const copy = heroVariantCopy[locale];
  return (
    <>
      <div className="mm-hero-slot mm-hero-slot-a">
        <p className="mm-hero-body mm-variant-lede">{copy.a.subtitle}</p>
        <div className="mm-variant-rule" aria-hidden="true" />
        <HeroActions locale={locale} variant="a" placement="hero_above_fold" primary={copy.a.primary} secondary={copy.a.secondary} />
        <HeroMicro>{copy.a.micro}</HeroMicro>
        <HeroCaption before={copy.a.captionBefore} em={copy.a.captionEm} badge={copy.a.badge} />
      </div>
      <div className="mm-hero-slot mm-hero-slot-b">
        <p className="mm-hero-body mm-variant-lede">{copy.b.subtitle}</p>
        <div className="mm-variant-rule" aria-hidden="true" />
        <HeroActions locale={locale} variant="b" placement="hero_above_fold" primary={copy.b.primary} secondary={copy.b.secondary} />
        <HeroMicro>{copy.b.micro}</HeroMicro>
        <HeroCaption before={copy.b.captionBefore} em={copy.b.captionEm} badge={copy.b.badge} />
      </div>
      <div className="mm-hero-slot mm-hero-slot-c">
        <p className="mm-hero-body mm-variant-lede">{copy.c.subtitle}</p>
        <HeroCaption before={copy.c.captionBefore} em={copy.c.captionEm} badge={copy.c.badge} />
      </div>
    </>
  );
}

/** Mobile-only bar for variant B. Desktop uses the in-hero actions. Hidden for every other variant. */
export function HeroStickyBar({ locale }: { locale: Locale }) {
  const copy = heroVariantCopy[locale].b;
  const label = locale === "en" ? "Diagnosis and demo" : "Diagnóstico y demo";
  return (
    <div className="mm-sticky-b" role="region" aria-label={label}>
      <div className="mm-sticky-b-inner">
        <HeroActions locale={locale} variant="b" placement="sticky_mobile" primary={copy.primary} secondary={copy.secondary} />
      </div>
    </div>
  );
}

/**
 * Variant C offer, rendered after the concrete examples.
 * English home has no use-case index, so it follows the three starting-point cards.
 * Spanish follows the use-case strip.
 */
export function HeroUseCaseCta({ locale }: { locale: Locale }) {
  const copy = heroVariantCopy[locale].c;
  const label = locale === "en" ? "15-minute diagnosis" : "Diagnóstico de 15 minutos";
  return (
    <section className="mm-section mm-cta-c-section" aria-label={label}>
      <div className="shell">
        <aside className="mm-cta-c">
          <p className="eyebrow">{copy.kicker}</p>
          <p className="mm-cta-c-line"><em>{copy.italic}</em></p>
          <HeroActions locale={locale} variant="c" placement="after_use_case_strip" primary={copy.primary} secondary={copy.secondary} />
          <HeroMicro>{copy.micro}</HeroMicro>
        </aside>
      </div>
    </section>
  );
}
