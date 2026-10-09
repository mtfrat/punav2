import { lazy, Suspense } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { CalButton, PageShell } from "../components/marketing";
import { HomeMotion, RidgeField } from "../components/home-editorial";
import { trackEvent } from "../components/tracking";
import { chromeCopy, type Locale } from "../content/chrome";
import { createMeta, organizationSchema } from "../lib/seo";
import "../home-editorial.css";

const HomeBelow = lazy(() => import("./home-below"));

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: Locale = new URL(request.url).pathname === "/es" ? "es" : "en";
  const { copy } = await import("../content/site");
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy[locale].faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return { locale, faqSchema };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  const path = locale === "en" ? "/" : "/es";
  const alternatePath = locale === "en" ? "/es" : "/";
  const faqSchema = data?.faqSchema;
  return createMeta({
    locale,
    title: locale === "en" ? "Custom Software & AI Automation | Puna Tech" : "Software a Medida y Automatización con IA | Puna Tech",
    description: locale === "en"
      ? "Custom software to automate B2B operations in Argentina. Puna Tech, Buenos Aires: automation, integrations, and systems your team can run."
      : "Software a medida para automatizar operaciones B2B en Buenos Aires, Argentina: automatización, integraciones y sistemas que tu equipo puede operar.",
    path,
    alternatePath,
    schema: [organizationSchema(locale), faqSchema],
  });
};

function HeroTitle({ title, italic }: { title: string; italic: string }) {
  const index = title.indexOf(italic);
  if (index === -1) return title;
  const before = title.slice(0, index);
  const after = title.slice(index + italic.length);
  return (
    <>
      <span className="mm-line mm-lcp"><span className="mm-line-inner">{before}</span></span>
      <span className="mm-line mm-italic-line"><em className="mm-italic"><span className="mm-line-inner">{italic}{after}</span></em></span>
    </>
  );
}

export default function Home({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const t = chromeCopy[locale];

  return (
    <PageShell locale={locale} chrome="editorial">
      <HomeMotion />
      <main id="main-content" className="mm-home" data-mm-home>
        <section className="mm-hero" data-mm-hero aria-label={locale === "en" ? "Puna Tech Cover" : "Portada de Puna Tech"}>
          <div className="shell mm-hero-copy">
            <p className="mm-mast mm-intro">
              <span>{locale === "en" ? "PUNA TECH / B2B SOFTWARE FACTORY · 2026" : "PUNA TECH / SOFTWARE FACTORY B2B · 2026"}</span>
              <span>{locale === "en" ? "AUTOMATION · INTEGRATIONS · CUSTOM SYSTEMS" : "AUTOMATIZACIÓN · INTEGRACIONES · SOFTWARE A MEDIDA"}</span>
            </p>
            <p className="eyebrow mm-intro mm-d1">{t.heroEyebrow}</p>
            <h1 className="mm-display">
              <HeroTitle title={t.heroTitle} italic={t.heroItalic} />
            </h1>
            <div className="mm-hero-lede">
              <p className="mm-hero-body mm-intro mm-d2">{t.heroBody}</p>
              <p className="mm-hero-body mm-intro mm-d3">{t.heroCompare}</p>
            </div>
            <div className="cta-group mm-hero-actions mm-intro mm-d4">
              <CalButton locale={locale} placement="hero_audit" label={t.book} className="button-primary-terracotta mm-btn mm-btn-accent" />
              <a
                href="#brief"
                className="button-ghost-burgundy mm-btn mm-btn-ghost"
                onClick={() => trackEvent("cta_click", { locale, placement: "hero", destination: "brief" })}
              >
                <span>{t.sendBrief}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
            <p className="mm-micro mm-intro mm-d5">
              <Check aria-hidden="true" size={16} />
              <span>{t.heroMicrocopy}</span>
            </p>
            <p className="mm-hero-caption mm-intro mm-d5">
              <span>{locale === "en" ? <>Repetitive handoffs, <em>into the system.</em></> : <>Lo repetitivo, <em>al sistema.</em></>}</span>
              <span className="mm-hero-badge">{locale === "en" ? "PUNA TECH · CRAFTED FOR OWNERSHIP" : "PUNA TECH · CONSTRUIDO PARA CONTROL TOTAL"}</span>
            </p>
          </div>
          <RidgeField />
        </section>
        <Suspense fallback={null}>
          <HomeBelow locale={locale} />
        </Suspense>
      </main>
    </PageShell>
  );
}
