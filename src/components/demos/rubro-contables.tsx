import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import "../../demos-contables.css";
import { CalButton, trackEvent } from "../marketing";
import { money, type Loc } from "./shared";
import { SAMPLE_BATCH } from "../../lib/demo-invoices";
import { demoDefinitions, demoPath, demosHubCopy, demosHubPath } from "../../content/demos";
import { rubroDefinitions, rubroPath, rubrosHubCopy } from "../../content/rubros";
import { contactPath } from "../../content/chrome";

/**
 * Landing de "Estudios contables" (es + en). Es la única página que usa este diseño:
 * los demás rubros siguen con el layout común de demo-rubro.tsx.
 * Una paleta de la marca (ink, orange, cream, paper), Anton en los títulos y cada sección es un capítulo de color.
 */

const T = {
  es: {
    h1: ["Facturas de clientes,", "cargadas sin tipear"],
    lead: "Tres demos para estudios contables: comprobantes a la planilla, documentación del mes sin perseguir a nadie y DDJJ de Convenio Multilateral.",
    seeDemos: "Probá las demos",
    exampleNote: "Datos de ejemplo. Nada de esto sale del navegador ni se envía a nadie.",
    crumbs: "Migas de pan",
    sample: "Datos de ejemplo",
    // hero fragment
    pickLabel: "Elegí una factura para ver lo que leyó el agente",
    readTitle: "Lo que leyó",
    sheetTitle: "Planilla del estudio",
    cols: { doc: "Factura", net: "Neto", vat: "IVA 21%", total: "Total" },
    fields: { supplier: "Emisor", taxId: "CUIT", doc: "Comprobante", cae: "CAE" },
    totals: "Totales",
    checked: "Controlada: CUIT, CAE, IVA y duplicados sin alertas.",
    // invoices alerts
    alertsTitle: "Lo que el agente no carga solo",
    alerts: [
      ["factura-0003-18422 (copia).pdf", "Duplicada", "Ya está cargado el mismo comprobante de este CUIT."],
      ["factura-0008-12005.pdf", "CAE inválido", "El CAE tiene que tener 14 dígitos y acá tiene 10."],
      ["foto-factura-mayorista.jpg", "CUIT ilegible", "Foto borrosa: el agente no adivina, la manda a revisar."],
    ] as [string, string, string][],
    // docs
    docsTitle: "Checklist del mes",
    docsCols: ["Cliente", "Facturas", "Banco", "Personal", "F.931"],
    yes: "Sí", no: "Falta", na: "—",
    yesLabel: "Recibido", naLabel: "No aplica",
    draftTitle: "Recordatorio para aprobar",
    draftTo: "Mensaje a Diego, por WhatsApp",
    draftBody: "Hola Diego, para cerrar el mes nos faltan las novedades de personal y el F.931 del mes anterior. ¿Podés mandarlos hoy?",
    draftState: "Sale cuando vos lo aprobás.",
    // video
    videoNote: "Video de 34 segundos, sin voz.",
    chaptersLabel: "Capítulos del video",
    // adapt
    stepsLabel: "Pasos",
    // links
    otherRubros: "Otros rubros",
    tagVideo: "Video",
    tagInteractive: "Demo interactiva",
    briefCta: "Mandanos un brief",
  },
  en: {
    h1: ["Client invoices,", "loaded without typing"],
    lead: "Three demos for accounting firms: documents into the spreadsheet, the month's paperwork without chasing anyone, and Convenio Multilateral returns.",
    seeDemos: "Try the demos",
    exampleNote: "Sample data. Nothing here leaves your browser or is sent to anyone.",
    crumbs: "Breadcrumb",
    sample: "Sample data",
    pickLabel: "Pick an invoice to see what the agent read",
    readTitle: "What it read",
    sheetTitle: "The firm's spreadsheet",
    cols: { doc: "Invoice", net: "Net", vat: "VAT 21%", total: "Total" },
    fields: { supplier: "Supplier", taxId: "Tax ID", doc: "Document", cae: "CAE" },
    totals: "Totals",
    checked: "Checked: tax ID, CAE, VAT and duplicates, no alerts.",
    alertsTitle: "What the agent will not load on its own",
    alerts: [
      ["factura-0003-18422 (copia).pdf", "Duplicate", "The same document from this tax ID is already loaded."],
      ["factura-0008-12005.pdf", "Invalid CAE", "A CAE must have 14 digits and this one has 10."],
      ["foto-factura-mayorista.jpg", "Unreadable tax ID", "Blurry photo: the agent does not guess, it sends it to review."],
    ] as [string, string, string][],
    docsTitle: "This month's checklist",
    docsCols: ["Client", "Invoices", "Bank", "Staff", "F.931"],
    yes: "Yes", no: "Missing", na: "—",
    yesLabel: "Received", naLabel: "Not applicable",
    draftTitle: "Reminder to approve",
    draftTo: "Message to Diego, by WhatsApp",
    draftBody: "Hi Diego, to close the month we are missing the staff changes and last month's F.931. Can you send them today?",
    draftState: "It goes out when you approve it.",
    videoNote: "34-second video, no voiceover.",
    chaptersLabel: "Video chapters",
    stepsLabel: "Steps",
    otherRubros: "Other industries",
    tagVideo: "Video",
    tagInteractive: "Interactive demo",
    briefCta: "Send us a brief",
  },
} as const;

type Cell = "yes" | "no" | "na";
/** Mismos clientes inventados que la demo de documentación del mes. */
const CHECKLIST: { name: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { name: "Almacén Ejemplo S.R.L.", cells: ["yes", "yes", "yes", "yes"] },
  { name: "Ferretería Ejemplo S.A.", cells: ["yes", "yes", "no", "no"] },
  { name: "Consultorio Ejemplo", cells: ["no", "no", "na", "na"] },
  { name: "Taller Ejemplo S.R.L.", cells: ["yes", "no", "no", "no"] },
  { name: "Panadería Ejemplo", cells: ["yes", "yes", "no", "yes"] },
];

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

function InvoiceToSheet({ loc }: { loc: Loc }) {
  const t = T[loc];
  const rows = ["d1", "d2", "d3"].map((id) => SAMPLE_BATCH.find((b) => b.id === id)!);
  const [sel, setSel] = useState(0);
  const cur = rows[sel];
  const sum = (key: "neto" | "iva" | "total") => rows.reduce((n, r) => n + r[key], 0);
  return (
    <div className="ac-ui" data-ui>
      <section aria-label={t.readTitle} className="ac-ui-read">
        <h2 className="ac-ui-title">{t.readTitle}</h2>
        <dl className="ac-ui-dl" aria-live="polite">
          <div><dt>{t.fields.supplier}</dt><dd>{cur.emisor}</dd></div>
          <div><dt>{t.fields.taxId}</dt><dd>{cur.cuit}</dd></div>
          <div><dt>{t.fields.doc}</dt><dd>{cur.numero}</dd></div>
          <div><dt>{t.fields.cae}</dt><dd>{cur.cae}</dd></div>
        </dl>
        <p className="ac-ui-ok">{t.checked}</p>
      </section>
      <section aria-label={t.sheetTitle}>
        <h2 className="ac-ui-title">{t.sheetTitle}</h2>
        <table className="ac-ui-table">
          <caption className="ac-sr">{t.pickLabel}</caption>
          <thead>
            <tr><th scope="col">{t.cols.doc}</th><th scope="col" className="ac-num">{t.cols.net}</th><th scope="col" className="ac-num ac-hide-sm">{t.cols.vat}</th><th scope="col" className="ac-num">{t.cols.total}</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i === sel ? "is-sel" : undefined}>
                <th scope="row">
                  <button type="button" aria-pressed={i === sel} onClick={() => { setSel(i); trackEvent("demo_rubro_card", { locale: loc, rubro: "accounting", demo: "hero-invoice" }); }}>{r.emisor}</button>
                </th>
                <td className="ac-num">{money(r.neto, loc)}</td>
                <td className="ac-num ac-hide-sm">{money(r.iva, loc)}</td>
                <td className="ac-num">{money(r.total, loc)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row">{t.totals}</th><td className="ac-num">{money(sum("neto"), loc)}</td><td className="ac-num ac-hide-sm">{money(sum("iva"), loc)}</td><td className="ac-num">{money(sum("total"), loc)}</td></tr>
          </tfoot>
        </table>
      </section>
      <p className="ac-ui-foot">{t.sample}</p>
    </div>
  );
}

function AlertsFragment({ loc }: { loc: Loc }) {
  const t = T[loc];
  return (
    <div className="ac-ui" data-ui>
      <h3 className="ac-ui-title">{t.alertsTitle}</h3>
      <ul className="ac-alerts">
        {t.alerts.map(([file, tag, msg]) => (
          <li key={file}><p className="ac-alert-file">{file}</p><p className="ac-alert-tag">{tag}</p><p className="ac-alert-msg">{msg}</p></li>
        ))}
      </ul>
      <p className="ac-ui-foot">{t.sample}</p>
    </div>
  );
}

function ChecklistFragment({ loc }: { loc: Loc }) {
  const t = T[loc];
  return (
    <div className="ac-ui" data-ui>
      <h3 className="ac-ui-title">{t.docsTitle}</h3>
      <table className="ac-ui-table ac-check">
        <thead><tr>{t.docsCols.map((c, i) => <th key={c} scope="col" className={i ? "ac-mid" : undefined}>{c}</th>)}</tr></thead>
        <tbody>
          {CHECKLIST.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              {row.cells.map((cell, i) => (
                <td key={i} className={`ac-mid ac-cell-${cell}`} title={cell === "yes" ? t.yesLabel : cell === "na" ? t.naLabel : t.no}>
                  <span aria-hidden="true">{cell === "yes" ? t.yes : cell === "no" ? t.no : t.na}</span>
                  <span className="ac-sr">{cell === "yes" ? t.yesLabel : cell === "na" ? t.naLabel : t.no}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ac-draft">
        <h3 className="ac-ui-title">{t.draftTitle}</h3>
        <p className="ac-draft-to">{t.draftTo}</p>
        <p className="ac-draft-body">{t.draftBody}</p>
        <p className="ac-ui-foot">{t.draftState}</p>
      </div>
      <p className="ac-ui-foot">{t.sample}</p>
    </div>
  );
}

export default function RubroContables({ locale }: { locale: Loc }) {
  const t = T[locale];
  const rootRef = useRef<HTMLElement>(null);
  const hub = demosHubCopy[locale];
  const r = rubrosHubCopy[locale];
  const rubro = rubroDefinitions.find((x) => x.id === "accounting")!;
  const c = rubro.copy[locale];
  const demo = (id: string) => demoDefinitions.find((d) => d.id === id)!;
  const invoices = demo("client-invoices");
  const docs = demo("monthly-docs");
  const convenio = demo("convenio-multilateral");
  const others = demoDefinitions.filter((d) => d.verticals.includes("accounting") && !rubro.featured.includes(d.id));
  const otherRubros = rubroDefinitions.filter((x) => x.id !== "accounting");
  const briefHref = `${contactPath(locale)}?bloque=${rubro.placement}#brief-form`;
  const track = (demoId: string) => () => trackEvent("demo_rubro_card", { locale, rubro: "accounting", demo: demoId });

  useReveal(rootRef);
  useEffect(() => { trackEvent("demo_rubro_view", { locale, rubro: "accounting" }); }, [locale]);

  const chapter = (d: ReturnType<typeof demo>, tag: string, hid: string) => {
    const k = d.copy[locale];
    return (
      <>
        <h2 id={hid} className="ac-h2" {...reveal()}>{k.title}</h2>
        <p className="ac-lead" {...reveal(80)}>{k.lead}</p>
        <p className="ac-tag" {...reveal(120)}>{tag}</p>
        <p {...reveal(160)}>
          <Link to={demoPath(locale, d.slug[locale])} className="ac-btn" onClick={track(d.id)}>{hub.open}<ArrowRight aria-hidden="true" size={18} /></Link>
        </p>
      </>
    );
  };

  const v = convenio.copy[locale].video!;

  return (
    <main id="main-content" className="ac" ref={rootRef}>
      <section className="ac-field ac-ink ac-hero" aria-labelledby="ac-h1">
        <div className="ac-wrap">
          <nav className="ac-crumbs" aria-label={t.crumbs}>
            <Link to={locale === "en" ? "/" : "/es"}>Puna Tech</Link><span aria-hidden="true">/</span>
            <Link to={demosHubPath(locale)}>{hub.breadcrumb}</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{c.name}</span>
          </nav>
          <h1 id="ac-h1" className="ac-h1">
            <span className="ac-line"><span className="ac-line-in">{t.h1[0]}</span></span>{" "}
            <span className="ac-line ac-line-accent"><span className="ac-line-in" style={{ animationDelay: "110ms" }}>{t.h1[1]}</span></span>
          </h1>
          <div className="ac-hero-grid">
            <div className="ac-hero-copy">
              <p className="ac-lead ac-fade" style={{ animationDelay: "700ms" }}>{t.lead}</p>
              <p className="ac-actions ac-fade" style={{ animationDelay: "800ms" }}>
                <CalButton locale={locale} placement={rubro.placement} className="ac-cal" />
                <a href="#ac-demos" className="ac-link">{t.seeDemos}</a>
              </p>
              <p className="ac-note ac-fade" style={{ animationDelay: "900ms" }}>{t.exampleNote}</p>
            </div>
            <div className="ac-hero-ui" {...reveal(0)}><InvoiceToSheet loc={locale} /></div>
          </div>
        </div>
      </section>

      <section id="ac-demos" className="ac-field ac-cream" aria-labelledby="ac-inv-h">
        <div className="ac-wrap ac-split">
          <div className="ac-split-text">{chapter(invoices, t.tagInteractive, "ac-inv-h")}</div>
          <div className="ac-split-ui" {...reveal(120)}><AlertsFragment loc={locale} /></div>
        </div>
      </section>

      <section className="ac-field ac-orange" aria-labelledby="ac-docs-h">
        <div className="ac-wrap ac-split ac-split-flip">
          <div className="ac-split-text">{chapter(docs, t.tagInteractive, "ac-docs-h")}</div>
          <div className="ac-split-ui" {...reveal(120)}><ChecklistFragment loc={locale} /></div>
        </div>
      </section>

      <section className="ac-field ac-ink ac-video" aria-labelledby="ac-vid-h">
        <div className="ac-wrap">
          <div className="ac-video-head">
            <h2 id="ac-vid-h" className="ac-h2" {...reveal()}>{convenio.copy[locale].title}</h2>
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
              <p className="ac-lead" {...reveal(120)}>{convenio.copy[locale].lead}</p>
              <ol className="ac-chapters" aria-label={t.chaptersLabel} {...reveal(160)}>
                {v.chapters.map(([time, label]) => <li key={time}><time>{time}</time><span>{label}</span></li>)}
              </ol>
              <p {...reveal(200)}>
                <Link to={demoPath(locale, convenio.slug[locale])} className="ac-btn ac-btn-orange" onClick={track(convenio.id)}>{hub.open}<ArrowRight aria-hidden="true" size={18} /></Link>
              </p>
            </div>
          </div>
          <p className="ac-credit">{t.videoNote} {v.credit}</p>
        </div>
      </section>

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
              <CalButton locale={locale} placement={rubro.placement} className="ac-cal" />
              <Link to={briefHref} className="ac-link" onClick={() => trackEvent("cta_click", { locale, placement: rubro.placement, destination: "brief" })}>{t.briefCta}</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="ac-field ac-cream ac-more" aria-label={locale === "es" ? "Más demos y rubros" : "More demos and industries"}>
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
