import { useState } from "react";
import { trackEvent } from "../marketing";
import { money, num, type Loc } from "./shared";
import { SAMPLE_BATCH } from "../../lib/demo-invoices";
import type { RubroId } from "../../content/rubros";
import { Fragment, PickHero, type FragBlock, type PickRow, type RubroPageConfig, type Tone } from "./rubro-layout";

/**
 * Configuración de cada landing de rubro (es + en): titular, elemento vivo del hero y los fragmentos de interfaz de sus demos.
 * Todos los datos son ficticios, tomados de las mismas demos que se enlazan en cada capítulo.
 */

const T = {
  es: {
    h1: ["Facturas de clientes,", "cargadas sin tipear"],
    lead: "Tres demos para estudios contables: comprobantes a la planilla, documentación del mes sin perseguir a nadie y DDJJ de Convenio Multilateral.",
    seeDemos: "Probá las demos",
    crumbs: "Migas de pan",
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
    crumbs: "Breadcrumb",
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
  { name: "Almacén Los Tilos S.R.L.", cells: ["yes", "yes", "yes", "yes"] },
  { name: "Ferretería San Martín S.A.", cells: ["yes", "yes", "no", "no"] },
  { name: "Consultorio Dr. Salas", cells: ["no", "no", "na", "na"] },
  { name: "Taller Los Pinos S.R.L.", cells: ["yes", "no", "no", "no"] },
  { name: "Panadería La Aurora", cells: ["yes", "yes", "no", "yes"] },
];


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
    </div>
  );
}
/* ======================================================================
   Consultas por prioridad (estudios jurídicos e inmobiliarias): reglas de la demo "leads con IA"
   ====================================================================== */

const TIER = {
  es: { hot: "Caliente", warm: "Tibio", cold: "Frío" },
  en: { hot: "Hot", warm: "Warm", cold: "Cold" },
} as const;
const TIER_TONE: Record<"hot" | "warm" | "cold", Tone> = { hot: "bad", warm: "mute", cold: "mute" };

interface Inquiry { name: string; channel: Record<Loc, string>; topic: Record<Loc, string>; tier: "hot" | "warm" | "cold"; pts: number; route: Record<Loc, string> }

const INBOX_T = {
  es: { read: "Lo que leyó el agente", fields: ["Consultante", "Canal", "Mensaje", "Prioridad"], first: "Consulta", cols: ["Prioridad", "Puntos"], pts: "puntos" },
  en: { read: "What the agent read", fields: ["Contact", "Channel", "Message", "Priority"], first: "Inquiry", cols: ["Priority", "Points"], pts: "points" },
} as const;

function inboxHero(loc: Loc, rubro: RubroId, tableTitle: string, pickLabel: string, list: Inquiry[]) {
  const t = INBOX_T[loc];
  const rows: PickRow[] = list.map((q, i) => ({
    id: `q${i}`,
    label: q.name,
    values: [q.name, q.channel[loc], q.topic[loc], `${TIER[loc][q.tier]} · ${q.pts} ${t.pts}`],
    cells: [[TIER[loc][q.tier], TIER_TONE[q.tier]], String(q.pts)],
    verdict: q.route[loc],
    verdictTone: q.tier === "hot" ? "bad" : undefined,
  }));
  return (
    <PickHero loc={loc} rubro={rubro} readTitle={t.read} fields={[...t.fields]} tableTitle={tableTitle} pickLabel={pickLabel}
      firstCol={t.first} cols={[{ label: t.cols[0] }, { label: t.cols[1], num: true }]} rows={rows} />
  );
}

/* ---------- estudios jurídicos ---------- */

const LEGAL_INQUIRIES: Inquiry[] = [
  { name: "Ana Beltrán", channel: { es: "WhatsApp", en: "WhatsApp" }, topic: { es: "Me llegó una carta documento y tengo 10 días para responder.", en: "I got a formal notice letter and have 10 days to reply." }, tier: "hot", pts: 72,
    route: { es: "Avisar ahora y ofrecer una llamada hoy.", en: "Alert now and offer a call today." } },
  { name: "Marcos Ledesma", channel: { es: "Mail", en: "Email" }, topic: { es: "Quiero consultar por una sucesión: ¿qué documentos hacen falta?", en: "I want to ask about an estate: which documents are needed?" }, tier: "warm", pts: 46,
    route: { es: "Mandar la lista de documentos y hacer seguimiento automático en 2 días.", en: "Send the document list and follow up automatically in 2 days." } },
  { name: "Consulta sin datos", channel: { es: "Instagram", en: "Instagram" }, topic: { es: "Hola, quería saber más.", en: "Hi, I wanted to know more." }, tier: "cold", pts: 12,
    route: { es: "Responder con la guía de primera consulta. Sin seguimiento manual.", en: "Reply with the first-consultation guide. No manual follow-up." } },
];

const LEGAL_T = {
  es: {
    table: "Bandeja de consultas", pick: "Elegí una consulta para ver cómo la ordena el agente",
    whyTitle: "Por qué este puntaje (reglas visibles)", why: [["Plazo urgente", "+25"], ["Tema de los que atendés", "+20"], ["Documento adjunto", "+15"], ["Mensaje con detalle", "+5"], ["Llegó por referido", "+5"], ["Escribió por WhatsApp", "+2"]] as [string, string][], total: ["Ana Beltrán", "72 puntos · Caliente"] as [string, string],
    draftTitle: "Respuesta sugerida", draftTo: "A Ana, por WhatsApp", draftBody: "Hola Ana, recibimos tu mensaje y la carta documento. Te llamamos hoy para ver los plazos. ¿Nos mandás una foto de los dos lados?", draftState: "Sale cuando vos la aprobás.",
    feesTitle: "Honorarios a cobrar", fees: [
      { main: "Textil Alborada S.A.", value: money(184500, "es"), sub: "18 días vencida", tag: "Para aprobar: segundo aviso firme", tone: "bad" as Tone },
      { main: "Marcos Ledesma", value: money(95000, "es"), sub: "Vence en 3 días", tag: "Recordatorio amable programado", tone: "mute" as Tone },
      { main: "Paula Quiroga", value: money(210000, "es"), sub: "Cobrados", tag: "Pago recibido: avisos frenados", tone: "good" as Tone },
    ],
    payTitle: "Recordatorio para aprobar", payTo: "A Textil Alborada S.A., por mail", payBody: "Hola, vimos que los honorarios por $ 184.500 vencieron. Si ya los pagaste, avisanos y los conciliamos. Si no, te dejamos el link: mpago.la/k7Qp2x.", payState: "Sale cuando vos lo aprobás.",
  },
  en: {
    table: "Inquiry inbox", pick: "Pick an inquiry to see how the agent sorts it",
    whyTitle: "Why this score (visible rules)", why: [["Urgent deadline", "+25"], ["A matter you handle", "+20"], ["Attached document", "+15"], ["Detailed message", "+5"], ["Came by referral", "+5"], ["Wrote on WhatsApp", "+2"]] as [string, string][], total: ["Ana Beltrán", "72 points · Hot"] as [string, string],
    draftTitle: "Suggested reply", draftTo: "To Ana, by WhatsApp", draftBody: "Hi Ana, we received your message and the formal notice. We will call you today to go over the deadlines. Can you send us a photo of both sides?", draftState: "It goes out when you approve it.",
    feesTitle: "Fees to collect", fees: [
      { main: "Textil Alborada S.A.", value: money(184500, "en"), sub: "18 days overdue", tag: "To approve: firm second notice", tone: "bad" as Tone },
      { main: "Marcos Ledesma", value: money(95000, "en"), sub: "Due in 3 days", tag: "Friendly reminder scheduled", tone: "mute" as Tone },
      { main: "Paula Quiroga", value: money(210000, "en"), sub: "Paid", tag: "Payment received: notices stopped", tone: "good" as Tone },
    ],
    payTitle: "Reminder to approve", payTo: "To Textil Alborada S.A., by email", payBody: "Hi, we noticed the fees of ARS 184,500 are overdue. If you already paid, let us know and we will reconcile it. If not, here is the link: mpago.la/k7Qp2x.", payState: "It goes out when you approve it.",
  },
} as const;


const legalConfig: RubroPageConfig = {
  size: "l",
  hero: (loc) => inboxHero(loc, "legal", LEGAL_T[loc].table, LEGAL_T[loc].pick, LEGAL_INQUIRIES),
  chapters: [
    {
      demo: "lead-scoring",
      render: (loc) => {
        const t = LEGAL_T[loc];
        const blocks: FragBlock[] = [
          { kind: "rows", title: t.whyTitle, rows: t.why.map(([main, value]) => ({ main, value })), total: [...t.total] },
          { kind: "draft", title: t.draftTitle, to: t.draftTo, body: t.draftBody, state: t.draftState },
        ];
        return <Fragment blocks={blocks} />;
      },
    },
    {
      demo: "collections",
      render: (loc) => {
        const t = LEGAL_T[loc];
        const blocks: FragBlock[] = [
          { kind: "rows", title: t.feesTitle, rows: t.fees.map((f) => ({ ...f })) },
          { kind: "draft", title: t.payTitle, to: t.payTo, body: t.payBody, state: t.payState },
        ];
        return <Fragment blocks={blocks} />;
      },
    },
  ],
};

/* ---------- inmobiliarias ---------- */

const ESTATE_INQUIRIES: Inquiry[] = [
  { name: "Lucía Ferreyra", channel: { es: "Portal inmobiliario", en: "Property portal" }, topic: { es: "Busco 2 ambientes en alquiler, me mudo este mes y tengo garantía propietaria.", en: "Looking for a 2-room rental, moving this month, with an owner guarantee." }, tier: "hot", pts: 71,
    route: { es: "Avisar ahora al asesor por WhatsApp y proponer una visita esta semana.", en: "Alert the agent on WhatsApp now and propose a viewing this week." } },
  { name: "Julián Moyano", channel: { es: "WhatsApp", en: "WhatsApp" }, topic: { es: "Me interesa el departamento de la publicación. ¿Las expensas son altas?", en: "I like the flat in the listing. Are the service charges high?" }, tier: "warm", pts: 44,
    route: { es: "Mandar fichas parecidas y hacer seguimiento automático en 2 días.", en: "Send similar listings and follow up automatically in 2 days." } },
  { name: "Consulta sin datos", channel: { es: "Instagram", en: "Instagram" }, topic: { es: "Info.", en: "Info." }, tier: "cold", pts: 9,
    route: { es: "Responder con el link a las propiedades. Sin seguimiento manual.", en: "Reply with the link to the listings. No manual follow-up." } },
];

const ESTATE_T = {
  es: {
    table: "Consultas de la semana", pick: "Elegí una consulta para ver cómo la ordena el agente",
    routeTitle: "Qué hace el agente según la prioridad", route: [
      { main: "Caliente", sub: "Avisar ahora al asesor por WhatsApp y proponer una visita esta semana.", tag: "65 puntos o más", tone: "bad" as Tone },
      { main: "Tibio", sub: "Mandar fichas parecidas. Seguimiento automático en 2 días.", tag: "De 40 a 64 puntos", tone: "mute" as Tone },
      { main: "Frío", sub: "Responder con el link a las propiedades. Sin seguimiento manual.", tag: "Menos de 40 puntos", tone: "mute" as Tone },
    ],
    rentTitle: "Alquileres del mes", rents: [
      { main: "Depto 3B · Gabriela Núñez", value: money(420000, "es"), sub: "9 días vencido", tag: "Para aprobar: aviso de vencido", tone: "bad" as Tone },
      { main: "Local 2 · Óptica Mirador S.R.L.", value: money(880000, "es"), sub: "Vence en 5 días", tag: "Recordatorio amable programado", tone: "mute" as Tone },
      { main: "Casa Norte · Paula Quiroga", value: money(310000, "es"), sub: "Cobrado", tag: "Pago recibido: avisos frenados", tone: "good" as Tone },
    ],
    stepsTitle: "Escalonamiento", stepsCols: ["Paso", "Cuándo"], steps: [["Recordatorio amable", "3 días antes"], ["Aviso de vencido", "1 día después"], ["Segundo aviso firme", "7 días después"], ["Último aviso + llamada", "15 días después"]],
  },
  en: {
    table: "This week's inquiries", pick: "Pick an inquiry to see how the agent sorts it",
    routeTitle: "What the agent does by priority", route: [
      { main: "Hot", sub: "Alert the agent on WhatsApp now and propose a viewing this week.", tag: "65 points or more", tone: "bad" as Tone },
      { main: "Warm", sub: "Send similar listings. Automatic follow-up in 2 days.", tag: "40 to 64 points", tone: "mute" as Tone },
      { main: "Cold", sub: "Reply with the link to the listings. No manual follow-up.", tag: "Under 40 points", tone: "mute" as Tone },
    ],
    rentTitle: "This month's rents", rents: [
      { main: "Flat 3B · Gabriela Núñez", value: money(420000, "en"), sub: "9 days overdue", tag: "To approve: overdue notice", tone: "bad" as Tone },
      { main: "Shop 2 · Óptica Mirador S.R.L.", value: money(880000, "en"), sub: "Due in 5 days", tag: "Friendly reminder scheduled", tone: "mute" as Tone },
      { main: "North House · Paula Quiroga", value: money(310000, "en"), sub: "Paid", tag: "Payment received: notices stopped", tone: "good" as Tone },
    ],
    stepsTitle: "Escalation", stepsCols: ["Step", "When"], steps: [["Friendly reminder", "3 days before"], ["Overdue notice", "1 day after"], ["Firm second notice", "7 days after"], ["Final notice + call", "15 days after"]],
  },
} as const;

const estateConfig: RubroPageConfig = {
  size: "l",
  hero: (loc) => inboxHero(loc, "real-estate", ESTATE_T[loc].table, ESTATE_T[loc].pick, ESTATE_INQUIRIES),
  chapters: [
    {
      demo: "lead-scoring",
      render: (loc) => <Fragment blocks={[{ kind: "rows", title: ESTATE_T[loc].routeTitle, rows: ESTATE_T[loc].route.map((r) => ({ ...r })) }]} />,
    },
    {
      demo: "collections",
      render: (loc) => {
        const t = ESTATE_T[loc];
        const blocks: FragBlock[] = [
          { kind: "rows", title: t.rentTitle, rows: t.rents.map((r) => ({ ...r })) },
          { kind: "table", title: t.stepsTitle, cols: [...t.stepsCols], rows: t.steps.map((s) => [...s]) },
        ];
        return <Fragment blocks={blocks} />;
      },
    },
  ],
};

/* ======================================================================
   Productores de seguros: cartera de la demo "pólizas y renovaciones"
   ====================================================================== */

interface Policy { holder: string; ramo: Record<Loc, string>; insurer: string; number: string; days: number; premium: number }
const POLICIES: Policy[] = [
  { holder: "Ana Beltrán", ramo: { es: "Automotor", en: "Motor" }, insurer: "Aseguradora Faro del Sur", number: "AU-100231", days: 9, premium: 184000 },
  { holder: "Transporte Pampa Alta S.A.", ramo: { es: "Automotor", en: "Motor" }, insurer: "Aseguradora Monte Verde", number: "AU-100877", days: 15, premium: 1260000 },
  { holder: "Óptica Mirador S.R.L.", ramo: { es: "Integral comercio", en: "Business package" }, insurer: "Aseguradora Monte Verde", number: "IN-200458", days: 21, premium: 420000 },
];

const INS_T = {
  es: {
    read: "Lo que leyó de la póliza", fields: ["Asegurado", "Compañía", "Póliza", "Vence"], verdict: "Entra a las renovaciones del mes.",
    table: "Cartera", pick: "Elegí una póliza para ver lo que leyó el agente", first: "Asegurado", cols: ["Ramo", "Vence", "Prima anual"], foot: "Prima anual",
    ends: (d: number) => `En ${d} días`,
    renewTitle: "Renovaciones del mes", urgent: "Urgente", reviewTitle: "Para revisar",
    review: { main: "poliza-escaneada.jpg", tag: "No se pudo leer la vigencia", sub: "Escaneo borroso: el agente no adivina, la manda a revisar." },
    draftTitle: "Aviso de renovación", draftTo: "A Ana, por WhatsApp",
    draftBody: "Hola Ana, te escribimos porque tu póliza de automotor (AU-100231) vence en 9 días. ¿La renovamos con las mismas condiciones? Si querés, te preparamos antes una comparación con otras coberturas.", draftState: "Sale cuando vos lo aprobás.",
  },
  en: {
    read: "What it read from the policy", fields: ["Policyholder", "Insurer", "Policy", "Ends"], verdict: "It joins this month's renewals.",
    table: "Portfolio", pick: "Pick a policy to see what the agent read", first: "Policyholder", cols: ["Line", "Ends", "Annual premium"], foot: "Annual premium",
    ends: (d: number) => `In ${d} days`,
    renewTitle: "This month's renewals", urgent: "Urgent", reviewTitle: "To review",
    review: { main: "poliza-escaneada.jpg", tag: "The end date could not be read", sub: "Blurry scan: the agent does not guess, it sends it to review." },
    draftTitle: "Renewal notice", draftTo: "To Ana, by WhatsApp",
    draftBody: "Hi Ana, your motor policy (AU-100231) ends in 9 days. Shall we renew it on the same terms? If you like, we can first prepare a comparison with other coverages.", draftState: "It goes out when you approve it.",
  },
} as const;

const insuranceConfig: RubroPageConfig = {
  size: "l",
  hero: (loc) => {
    const t = INS_T[loc];
    const rows: PickRow[] = POLICIES.map((p) => ({
      id: p.number,
      label: p.holder,
      values: [p.holder, p.insurer, p.number, t.ends(p.days)],
      cells: [p.ramo[loc], t.ends(p.days), money(p.premium, loc)],
      verdict: t.verdict,
    }));
    const total = money(POLICIES.reduce((n, p) => n + p.premium, 0), loc);
    return (
      <PickHero loc={loc} rubro="insurance" readTitle={t.read} fields={[...t.fields]} tableTitle={t.table} pickLabel={t.pick} firstCol={t.first}
        cols={[{ label: t.cols[0], hideSm: true }, { label: t.cols[1] }, { label: t.cols[2], num: true }]} rows={rows} foot={[t.foot, "", "", total]} />
    );
  },
  chapters: [
    {
      demo: "policies-renewals",
      render: (loc) => {
        const t = INS_T[loc];
        const blocks: FragBlock[] = [
          { kind: "rows", title: t.renewTitle, rows: POLICIES.map((p, i) => ({ main: `${p.holder} · ${p.ramo[loc]}`, value: t.ends(p.days), sub: p.number, tag: i === 0 ? t.urgent : undefined, tone: "bad" as Tone })) },
          { kind: "rows", title: t.reviewTitle, rows: [{ main: t.review.main, sub: t.review.sub, tag: t.review.tag, tone: "bad" as Tone }] },
          { kind: "draft", title: t.draftTitle, to: t.draftTo, body: t.draftBody, state: t.draftState },
        ];
        return <Fragment blocks={blocks} />;
      },
    },
    { demo: "client-invoices", render: (loc) => <AlertsFragment loc={loc} /> },
  ],
};

/* ======================================================================
   Clínicas y consultorios: semana de la demo "control de horas y pagos"
   ====================================================================== */

type Day = [string, string];
interface Person { name: string; role: Record<Loc, string>; week: Day[]; status: "ok" | "missOut" | "long" }
const toMin = (v: string) => { const [h, m] = v.split(":").map(Number); return h * 60 + m; };
const hoursOf = (week: Day[]) => week.reduce((n, [i, o]) => (i && o && toMin(o) > toMin(i) ? n + (toMin(o) - toMin(i)) / 60 : n), 0);

/** Mismas tarjetas de horas de tres personas de la demo, con cargos de clínica. */
const STAFF: Person[] = [
  { name: "Lucía Fernández", role: { es: "Recepción", en: "Front desk" }, status: "ok", week: [["09:00", "17:00"], ["09:00", "17:05"], ["09:00", "17:00"], ["09:00", "19:30"], ["09:00", "17:00"], ["09:00", "13:00"], ["", ""]] },
  { name: "Marcos Giménez", role: { es: "Enfermería", en: "Nursing" }, status: "missOut", week: [["08:00", "16:00"], ["08:00", "16:00"], ["08:00", ""], ["08:00", "16:00"], ["08:00", "16:00"], ["08:00", "14:00"], ["", ""]] },
  { name: "Camila Rojas", role: { es: "Coordinación", en: "Coordination" }, status: "long", week: [["08:30", "18:30"], ["08:30", "19:45"], ["08:30", "17:30"], ["08:30", "17:30"], ["08:30", "17:30"], ["09:00", "15:00"], ["", ""]] },
];

const DAYS = { es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] } as const;

const CLINIC_T = {
  es: {
    read: "Lo que leyó de la tarjeta", fields: ["Persona", "Cargo", "Horas de la semana", "Estado"], table: "Equipo de la semana", pick: "Elegí una persona para ver su tarjeta de horas", first: "Persona", cols: ["Horas", "Estado"], h: "h",
    status: { ok: "Todo bien", missOut: "Falta la salida", long: "Jornada de más de 10 h" },
    verdict: { ok: "Sin alertas: entra a la liquidación.", missOut: "Falta la salida del miércoles. El agente sugiere 16:00 y espera tu OK.", long: "El martes pasa las 10 horas. El agente te pide confirmar que está bien." },
    cardTitle: "Tarjeta de horas · Marcos Giménez", cardCols: ["Día", "Entrada", "Salida", "Estado"], off: "Franco", ok: "Todo bien", miss: "Falta la salida",
    suggestTitle: "Sugerencia del agente", suggest: [{ main: "Miércoles: salida 16:00", sub: "Misma jornada que el resto de la semana.", tag: "Esperando tu OK", tone: "mute" as Tone }],
    payTitle: "Liquidación", pay: [{ main: "Aprobar liquidación", sub: "Resolvé 1 alerta para poder aprobar.", tag: "Bloqueada", tone: "bad" as Tone }],
  },
  en: {
    read: "What it read from the timecard", fields: ["Person", "Role", "Hours this week", "Status"], table: "This week's team", pick: "Pick a person to see their timecard", first: "Person", cols: ["Hours", "Status"], h: "h",
    status: { ok: "All good", missOut: "Missing clock-out", long: "Shift longer than 10 h" },
    verdict: { ok: "No alerts: it goes into payroll.", missOut: "Wednesday's clock-out is missing. The agent suggests 16:00 and waits for your OK.", long: "Tuesday goes over 10 hours. The agent asks you to confirm it is fine." },
    cardTitle: "Timecard · Marcos Giménez", cardCols: ["Day", "Clock in", "Clock out", "Status"], off: "Day off", ok: "All good", miss: "Missing clock-out",
    suggestTitle: "Agent suggestion", suggest: [{ main: "Wednesday: clock-out 16:00", sub: "Same shift as the rest of the week.", tag: "Waiting for your OK", tone: "mute" as Tone }],
    payTitle: "Payroll", pay: [{ main: "Approve payroll", sub: "Resolve 1 alert to approve.", tag: "Blocked", tone: "bad" as Tone }],
  },
} as const;

const clinicsConfig: RubroPageConfig = {
  size: "l",
  hero: (loc) => {
    const t = CLINIC_T[loc];
    const rows: PickRow[] = STAFF.map((p) => {
      const hrs = `${num(hoursOf(p.week), loc, 1)} ${t.h}`;
      return {
        id: p.name, label: p.name,
        values: [p.name, p.role[loc], hrs, t.status[p.status]],
        cells: [hrs, [t.status[p.status], p.status === "ok" ? "good" : "bad"]],
        verdict: t.verdict[p.status], verdictTone: p.status === "ok" ? undefined : "bad",
      };
    });
    return (
      <PickHero loc={loc} rubro="clinics" readTitle={t.read} fields={[...t.fields]} tableTitle={t.table} pickLabel={t.pick} firstCol={t.first}
        cols={[{ label: t.cols[0], num: true }, { label: t.cols[1] }]} rows={rows} />
    );
  },
  chapters: [
    {
      demo: "payroll",
      render: (loc) => {
        const t = CLINIC_T[loc];
        const marcos = STAFF[1];
        const blocks: FragBlock[] = [
          {
            kind: "table", title: t.cardTitle, cols: [...t.cardCols], midFrom: 1,
            rows: marcos.week.map(([i, o], d): (string | [string, Tone])[] => [
              DAYS[loc][d], i || "—", o || "—",
              !i && !o ? t.off : i && !o ? [t.miss, "bad"] : [t.ok, "good"],
            ]),
          },
          { kind: "rows", title: t.suggestTitle, rows: t.suggest.map((s) => ({ ...s })) },
          { kind: "rows", title: t.payTitle, rows: t.pay.map((s) => ({ ...s })) },
        ];
        return <Fragment blocks={blocks} />;
      },
    },
  ],
};

/* ======================================================================
   Estudios contables
   ====================================================================== */

const accountingConfig: RubroPageConfig = {
  h1: { es: [...T.es.h1] as [string, string], en: [...T.en.h1] as [string, string] },
  lead: { es: T.es.lead, en: T.en.lead },
  hero: (loc) => <InvoiceToSheet loc={loc} />,
  chapters: [
    { demo: "client-invoices", render: (loc) => <AlertsFragment loc={loc} /> },
    { demo: "monthly-docs", render: (loc) => <ChecklistFragment loc={loc} /> },
  ],
};

export const rubroPages: Record<RubroId, RubroPageConfig> = {
  accounting: accountingConfig,
  legal: legalConfig,
  insurance: insuranceConfig,
  "real-estate": estateConfig,
  clinics: clinicsConfig,
};
