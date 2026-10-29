import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import "../../demos-rubros.css";
import { CalButton, trackEvent } from "../marketing";
import type { Loc } from "./shared";
import { demoDefinitions, demoPath, demosHubCopy, demosHubPath, type DemoId } from "../../content/demos";
import { rubroDefinitions, rubroPath, rubrosHubCopy, type RubroId } from "../../content/rubros";
import { contactPath } from "../../content/chrome";
import { wantThisHref, wantThisLabel } from "../../content/demo-cta";

/**
 * Landing de un rubro con el diseño "capítulos de color" (es + en), manejada por datos.
 * Una paleta de la marca (ink, orange, cream, paper), Anton en los títulos y cada sección es un capítulo de color.
 * Cada rubro aporta su configuración (rubro-pages.tsx): titular, elemento vivo del hero y los fragmentos de interfaz de sus demos.
 */

const T = {
  es: {
    exampleNote: "Datos ficticios con fines de demostración. Nada de esto sale del navegador ni se envía a nadie.",
    crumbs: "Migas de pan",
    seeDemos: "Probá las demos",
    videoNote: "Video de 34 segundos, sin voz.",
    chaptersLabel: "Capítulos del video",
    stepsLabel: "Pasos",
    otherRubros: "Otros rubros",
    tagVideo: "Video",
    tagInteractive: "Demo interactiva",
    briefCta: "Mandanos un brief",
    moreAria: "Más demos y rubros",
    customTitle: "Esto lo armamos a medida",
  },
  en: {
    exampleNote: "Fictional data for demonstration purposes. Nothing here leaves your browser or is sent to anyone.",
    crumbs: "Breadcrumb",
    seeDemos: "Try the demos",
    videoNote: "34-second video, no voiceover.",
    chaptersLabel: "Video chapters",
    stepsLabel: "Steps",
    otherRubros: "Other industries",
    tagVideo: "Video",
    tagInteractive: "Interactive demo",
    briefCta: "Send us a brief",
    moreAria: "More demos and industries",
    customTitle: "We build this one to order",
  },
} as const;

export interface RubroChapter {
  demo: DemoId;
  /** Fragmento de interfaz armado con los datos ficticios de esa demo. */
  render: (loc: Loc) => ReactNode;
}

export interface RubroPageConfig {
  /** Dos líneas del titular. Si falta, se parte el h1 del rubro en el texto antes de la marca y la marca. */
  h1?: Record<Loc, [string, string]>;
  /** "l" para titulares largos: letra más chica y líneas que pueden cortarse. */
  size?: "xl" | "l";
  /** Bajada del hero. Si falta, la del rubro. */
  lead?: Record<Loc, string>;
  hero: (loc: Loc) => ReactNode;
  chapters: RubroChapter[];
}

const reveal = (delay = 0): { "data-reveal": string; style: CSSProperties } => ({ "data-reveal": "", style: { "--d": `${delay}ms` } as CSSProperties });

function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const items: HTMLElement[] = [];
    el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((n) => items.push(n));
    const below = items.filter((n) => n.getBoundingClientRect().top > window.innerHeight * 0.92);
    below.forEach((n) => n.classList.add("ac-pre"));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.remove("ac-pre"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    below.forEach((n) => io.observe(n));
    return () => { io.disconnect(); below.forEach((n) => n.classList.remove("ac-pre")); };
  }, [root]);
}

/* ---------- piezas de interfaz compartidas ---------- */

export type Tone = "good" | "bad" | "mute";

/** Hero vivo genérico: elegís un ítem de la lista y ves lo que leyó el agente. Todo con datos ficticios. */
export interface PickRow {
  id: string;
  /** Texto del botón de la primera columna. */
  label: string;
  /** Un valor por cada campo del panel "lo que leyó". */
  values: string[];
  /** El resto de las columnas de la tabla. */
  cells: (string | [string, Tone])[];
  verdict: string;
  verdictTone?: Tone;
}
export interface PickHeroProps {
  loc: Loc;
  rubro: string;
  readTitle: string;
  fields: string[];
  tableTitle: string;
  pickLabel: string;
  firstCol: string;
  cols: { label: string; num?: boolean; hideSm?: boolean }[];
  rows: PickRow[];
  /** Fila final opcional (totales). Primer valor es la etiqueta. */
  foot?: string[];
}
export function PickHero({ loc, rubro, readTitle, fields, tableTitle, pickLabel, firstCol, cols, rows, foot }: PickHeroProps) {
  const [sel, setSel] = useState(0);
  const cur = rows[sel];
  const cls = (c: { num?: boolean; hideSm?: boolean }) => [c.num ? "ac-num" : "", c.hideSm ? "ac-hide-sm" : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="ac-ui" data-ui>
      <section aria-label={readTitle} className="ac-ui-read">
        <h2 className="ac-ui-title">{readTitle}</h2>
        <dl className="ac-ui-dl" aria-live="polite">
          {fields.map((f, i) => <div key={f}><dt>{f}</dt><dd>{cur.values[i]}</dd></div>)}
        </dl>
        <p className={`ac-ui-ok${cur.verdictTone === "bad" ? " is-bad" : ""}`}>{cur.verdict}</p>
      </section>
      <section aria-label={tableTitle}>
        <h2 className="ac-ui-title">{tableTitle}</h2>
        <table className="ac-ui-table">
          <caption className="ac-sr">{pickLabel}</caption>
          <thead>
            <tr><th scope="col">{firstCol}</th>{cols.map((c) => <th key={c.label} scope="col" className={cls(c)}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i === sel ? "is-sel" : undefined}>
                <th scope="row">
                  <button type="button" aria-pressed={i === sel} onClick={() => { setSel(i); trackEvent("demo_rubro_card", { locale: loc, rubro, demo: "hero" }); }}>{r.label}</button>
                </th>
                {r.cells.map((cell, k) => {
                  const [text, tone] = typeof cell === "string" ? [cell, undefined] : cell;
                  return <td key={k} className={[cls(cols[k]) ?? "", tone ? `ac-tone-${tone}` : ""].join(" ").trim() || undefined}>{text}</td>;
                })}
              </tr>
            ))}
          </tbody>
          {foot ? (
            <tfoot>
              <tr><th scope="row">{foot[0]}</th>{foot.slice(1).map((v, k) => <td key={k} className={cls(cols[k])}>{v}</td>)}</tr>
            </tfoot>
          ) : null}
        </table>
      </section>
    </div>
  );
}

/** Fragmento estático: bloques de lista, tabla o borrador, armados con datos ficticios. */
export type FragBlock =
  | { kind: "rows"; title: string; rows: { main: string; value?: string; sub?: string; tag?: string; tone?: Tone }[]; total?: [string, string] }
  | { kind: "table"; title: string; cols: string[]; rows: (string | [string, Tone])[][]; midFrom?: number }
  | { kind: "draft"; title: string; to: string; body: string; state: string };

export function Fragment({ blocks }: { blocks: FragBlock[] }) {
  return (
    <div className="ac-ui" data-ui>
      {blocks.map((b, i) => {
        if (b.kind === "draft") {
          return (
            <div className="ac-draft" key={i}>
              <h3 className="ac-ui-title">{b.title}</h3>
              <p className="ac-draft-to">{b.to}</p>
              <p className="ac-draft-body">{b.body}</p>
              <p className="ac-ui-foot">{b.state}</p>
            </div>
          );
        }
        if (b.kind === "table") {
          return (
            <div key={i}>
              <h3 className="ac-ui-title">{b.title}</h3>
              <table className="ac-ui-table">
                <thead><tr>{b.cols.map((c, k) => <th key={c} scope="col" className={b.midFrom !== undefined && k >= b.midFrom ? "ac-mid" : undefined}>{c}</th>)}</tr></thead>
                <tbody>
                  {b.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, k) => {
                        const [text, tone] = typeof cell === "string" ? [cell, undefined] : cell;
                        const className = [b.midFrom !== undefined && k >= b.midFrom ? "ac-mid" : "", tone ? `ac-tone-${tone}` : ""].join(" ").trim() || undefined;
                        return k === 0 ? <th key={k} scope="row" className={className}>{text}</th> : <td key={k} className={className}>{text}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <div key={i}>
            <h3 className="ac-ui-title">{b.title}</h3>
            <ul className="ac-rows">
              {b.rows.map((r) => (
                <li key={r.main}>
                  <p className="ac-row-main">{r.main}</p>
                  {r.value ? <p className="ac-row-value">{r.value}</p> : null}
                  {r.sub ? <p className="ac-row-sub">{r.sub}</p> : null}
                  {r.tag ? <p className={`ac-row-tag ac-tone-${r.tone ?? "mute"}`}>{r.tag}</p> : null}
                </li>
              ))}
            </ul>
            {b.total ? <p className="ac-row-total"><span>{b.total[0]}</span><span>{b.total[1]}</span></p> : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- la página ---------- */

export default function RubroPage({ rubroId, locale, config }: { rubroId: RubroId; locale: Loc; config: RubroPageConfig }) {
  const t = T[locale];
  const rootRef = useRef<HTMLElement>(null);
  const hub = demosHubCopy[locale];
  const r = rubrosHubCopy[locale];
  const rubro = rubroDefinitions.find((x) => x.id === rubroId)!;
  const c = rubro.copy[locale];
  const demo = (id: DemoId) => demoDefinitions.find((d) => d.id === id)!;
  const videoDemo = rubro.video ? demo(rubro.video) : undefined;
  const others = demoDefinitions.filter((d) => d.verticals.includes(rubroId) && !rubro.featured.includes(d.id));
  const otherRubros = rubroDefinitions.filter((x) => x.id !== rubroId);
  const briefHref = `${contactPath(locale)}?bloque=${rubro.placement}#brief-form`;
  const track = (demoId: string) => () => trackEvent("demo_rubro_card", { locale, rubro: rubroId, demo: demoId });
  const wantLabel = wantThisLabel(locale, rubroId);
  /** "Quiero esto para mi …" inside a demo chapter: brief link tagged with rubro and demo_slug. */
  const wantThis = (id: DemoId, tone: "orange" | "ink") => {
    const d = demo(id);
    const demoSlug = d.slug[locale];
    return (
      <Link
        to={wantThisHref(contactPath(locale), rubro.placement, d.id)}
        className={`ac-btn ac-want${tone === "orange" ? " ac-btn-orange" : ""}`}
        data-cta="want-this"
        onClick={() => trackEvent("cta_click", { locale, placement: rubro.placement, destination: "brief", cta: "want_this", rubro: rubroId, demo_slug: demoSlug })}
      >{wantLabel}<ArrowRight aria-hidden="true" size={18} /></Link>
    );
  };

  const h1 = config.h1?.[locale] ?? (c.h1.endsWith(c.mark) ? [c.h1.slice(0, c.h1.length - c.mark.length).trim(), c.mark] : [c.h1, ""]);
  const long = config.size === "l";

  useReveal(rootRef);
  useEffect(() => { trackEvent("demo_rubro_view", { locale, rubro: rubroId }); }, [locale, rubroId]);

  const chapter = (id: DemoId, tag: string, hid: string, tone: "orange" | "ink") => {
    const d = demo(id);
    const k = d.copy[locale];
    return (
      <>
        <h2 id={hid} className="ac-h2" {...reveal()}>{k.title}</h2>
        <p className="ac-lead" {...reveal(80)}>{k.lead}</p>
        <p className="ac-tag" {...reveal(120)}>{tag}</p>
        <p className="ac-chapter-actions" {...reveal(160)}>
          {wantThis(id, tone)}
          <Link to={demoPath(locale, d.slug[locale])} className="ac-link" onClick={track(d.id)}>{hub.open}</Link>
        </p>
      </>
    );
  };

  const v = videoDemo?.copy[locale].video;
  const chapterTone = ["ac-cream", "ac-orange"];

  return (
    <main id="main-content" className={`ac${long ? " ac-long" : ""}`} ref={rootRef}>
      <section className="ac-field ac-ink ac-hero" aria-labelledby="ac-h1">
        <div className="ac-wrap">
          <nav className="ac-crumbs" aria-label={t.crumbs}>
            <Link to={locale === "en" ? "/" : "/es"}>Puna Tech</Link><span aria-hidden="true">/</span>
            <Link to={demosHubPath(locale)}>{hub.breadcrumb}</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{c.name}</span>
          </nav>
          <h1 id="ac-h1" className="ac-h1">
            <span className="ac-line"><span className="ac-line-in">{h1[0]}</span></span>{h1[1] ? " " : null}
            {h1[1] ? <span className="ac-line ac-line-accent"><span className="ac-line-in" style={{ animationDelay: "110ms" }}>{h1[1]}</span></span> : null}
          </h1>
          <div className="ac-hero-grid">
            <div className="ac-hero-copy">
              <p className="ac-lead ac-fade" style={{ animationDelay: "700ms" }}>{config.lead?.[locale] ?? c.lead}</p>
              <p className="ac-actions ac-fade" style={{ animationDelay: "800ms" }}>
                <CalButton locale={locale} placement={rubro.placement} className="ac-cal" params={{ rubro: rubroId }} />
                <a href="#ac-demos" className="ac-link">{t.seeDemos}</a>
              </p>
              <p className="ac-note ac-fade" style={{ animationDelay: "900ms" }}>{t.exampleNote}</p>
            </div>
            <div className="ac-hero-ui" {...reveal(0)}>{config.hero(locale)}</div>
          </div>
        </div>
      </section>

      {config.chapters.map((ch, i) => {
        const hid = `ac-${ch.demo}-h`;
        return (
          <section key={ch.demo} id={i === 0 ? "ac-demos" : undefined} className={`ac-field ${chapterTone[i % 2]}`} aria-labelledby={hid}>
            <div className={`ac-wrap ac-split${i % 2 ? " ac-split-flip" : ""}`}>
              <div className="ac-split-text">{chapter(ch.demo, t.tagInteractive, hid, i % 2 ? "ink" : "orange")}</div>
              <div className="ac-split-ui" {...reveal(120)}>{ch.render(locale)}</div>
            </div>
          </section>
        );
      })}

      {videoDemo && v ? (
        <section className="ac-field ac-ink ac-video" aria-labelledby="ac-vid-h">
          <div className="ac-wrap">
            <div className="ac-video-head">
              <h2 id="ac-vid-h" className="ac-h2" {...reveal()}>{videoDemo.copy[locale].title}</h2>
            </div>
            <div className="ac-video-grid">
              <div className="ac-video-media" {...reveal(80)}>
                <video className="ac-video-wide" controls playsInline preload="none" poster="/media/demos/convenio-multilateral-16x9.webp" aria-label={v.alt} width={1280} height={720}>
                  <source src="/media/demos/convenio-multilateral-16x9.mp4" type="video/mp4" />
                </video>
                <video className="ac-video-tall" controls playsInline preload="none" poster="/media/demos/convenio-multilateral-9x16.webp" aria-label={v.alt} width={720} height={1280}>
                  <source src="/media/demos/convenio-multilateral-9x16.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="ac-video-side">
                <p className="ac-lead" {...reveal(120)}>{videoDemo.copy[locale].lead}</p>
                <ol className="ac-chapters" aria-label={t.chaptersLabel} {...reveal(160)}>
                  {v.chapters.map(([time, label]) => <li key={time}><time>{time}</time><span>{label}</span></li>)}
                </ol>
                <p className="ac-chapter-actions" {...reveal(200)}>
                  {wantThis(videoDemo.id, "orange")}
                  <Link to={demoPath(locale, videoDemo.slug[locale])} className="ac-link" onClick={track(videoDemo.id)}>{hub.open}</Link>
                </p>
              </div>
            </div>
            <p className="ac-credit">{t.videoNote} {v.credit}</p>
          </div>
        </section>
      ) : null}

      {c.comingNote ? (
        <section className="ac-field ac-ink ac-custom" aria-labelledby="ac-custom-h">
          <div className="ac-wrap ac-custom-grid">
            <h2 id="ac-custom-h" className="ac-h2" {...reveal()}>{t.customTitle}</h2>
            <p className="ac-lead" {...reveal(100)}>{c.comingNote}</p>
          </div>
        </section>
      ) : null}

      <section className="ac-field ac-paper" aria-labelledby="ac-adapt">
        <div className="ac-wrap">
          <h2 id="ac-adapt" className="ac-h2" {...reveal()}>{c.adaptTitle}</h2>
          <p className="ac-lead ac-adapt-lead" {...reveal(60)}>{c.adaptLead}</p>
          <ol className="ac-steps" aria-label={t.stepsLabel}>
            {c.adapt.map(([title, body], i) => (
              <li key={title} {...reveal(i * 90)}><h3 className="ac-h2 ac-step-title">{title}</h3><p className="ac-step-body">{body}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ac-field ac-orange ac-cta" aria-labelledby="ac-cta-h">
        <div className="ac-wrap ac-cta-grid">
          <h2 id="ac-cta-h" className="ac-h2" {...reveal()}>{c.ctaTitle}</h2>
          <div className="ac-cta-side" {...reveal(100)}>
            <p className="ac-lead">{c.ctaBody}</p>
            <p className="ac-actions">
              <CalButton locale={locale} placement={rubro.placement} className="ac-cal" params={{ rubro: rubroId }} />
              <Link to={briefHref} className="ac-link" onClick={() => trackEvent("cta_click", { locale, placement: rubro.placement, destination: "brief", rubro: rubroId })}>{t.briefCta}</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="ac-field ac-cream ac-more" aria-label={t.moreAria}>
        <div className="ac-wrap ac-more-grid">
          {others.length > 0 ? (
            <div {...reveal()}>
              <h2 className="ac-lead ac-more-title">{c.moreTitle}</h2>
              <ul className="ac-more-list">
                {others.map((d) => <li key={d.id}><Link to={demoPath(locale, d.slug[locale])}>{d.copy[locale].title}<ArrowRight aria-hidden="true" size={16} /></Link></li>)}
              </ul>
            </div>
          ) : null}
          <div {...reveal(80)}>
            <h2 className="ac-lead ac-more-title">{t.otherRubros}</h2>
            <ul className="ac-more-list">
              {otherRubros.map((x) => <li key={x.id}><Link to={rubroPath(locale, x.slug[locale])}>{x.copy[locale].name}<ArrowRight aria-hidden="true" size={16} /></Link></li>)}
              <li><Link to={demosHubPath(locale)}>{r.allDemos}<ArrowRight aria-hidden="true" size={16} /></Link></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
