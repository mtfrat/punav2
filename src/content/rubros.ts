import type { Locale } from "./chrome";
import { demoDefinitions, demosHubPath, type DemoId, type VerticalId } from "./demos.ts";

/** Rubros that get their own landing page. "commerce" is only a group on the hub. */
export type RubroId = Exclude<VerticalId, "commerce">;

export interface RubroCopy {
  /** Short name used in chips and cards. */
  name: string;
  /** One line shown on the hub selector: the pain, not the product. */
  pain: string;
  metaTitle: string;
  metaDescription: string;
  /** H1: the pain, in the words of the rubro. */
  h1: string;
  mark: string;
  lead: string;
  /** Heading above the demo cards. */
  cardsTitle: string;
  adaptTitle: string;
  adaptLead: string;
  adapt: [string, string][];
  /** Honest note when we have no dedicated demo for part of the pain. */
  comingNote?: string;
  /** Label for the "other demos" link list. */
  moreTitle: string;
  ctaTitle: string;
  ctaBody: string;
}

export interface RubroDefinition {
  id: RubroId;
  slug: Record<Locale, string>;
  /** cal.com / brief attribution block. Sanitized by /api/lead to [a-z0-9_-]. */
  placement: string;
  /** Up to three demos shown as cards, in order. */
  featured: DemoId[];
  /** Demo whose video is embedded at the top of the page, when it has one. */
  video?: DemoId;
  copy: Record<Locale, RubroCopy>;
}

const adaptEs = (who: string, base: string): [string, string][] => [
  ["Vemos cómo trabajás hoy", `Una charla corta sobre tus planillas, tu WhatsApp y las herramientas que ya usa ${who}. No te pedimos cambiar de sistema.`],
  ["Adaptamos la base", `${base} Ajustamos reglas, textos y formatos a tu forma de trabajar.`],
  ["Vos aprobás, siempre", "El agente prepara y vos revisás. Nada sale a un cliente ni se carga en un sistema sin tu OK, y todo queda anotado."],
];
const adaptEn = (who: string, base: string): [string, string][] => [
  ["We look at how you work today", `A short call about your spreadsheets, your WhatsApp and the tools ${who} already uses. We don't ask you to switch systems.`],
  ["We adapt the base", `${base} We tune rules, wording and formats to the way you work.`],
  ["You approve, always", "The agent prepares and you review. Nothing goes to a client or into a system without your OK, and everything is logged."],
];

export const rubroDefinitions: RubroDefinition[] = [
  {
    id: "accounting",
    slug: { es: "estudios-contables", en: "accounting-firms" },
    placement: "demos-contables",
    featured: ["client-invoices", "monthly-docs", "convenio-multilateral"],
    video: "convenio-multilateral",
    copy: {
      es: {
        name: "Estudios contables",
        pain: "Facturas de clientes que se tipean a mano y documentación que hay que pedir todos los meses.",
        metaTitle: "Demos de automatización para estudios contables | Puna Tech",
        metaDescription: "Facturas de clientes a planilla, documentación del mes y DDJJ de Convenio Multilateral: probá demos para estudios contables. Datos ficticios.",
        h1: "Las facturas de tus clientes, cargadas sin tipear",
        mark: "cargadas sin tipear",
        lead: "Tres demos pensadas para un estudio contable: comprobantes que pasan solos a la planilla, la documentación del mes sin perseguir a nadie y las DDJJ de Convenio Multilateral. Probalas con datos ficticios.",
        cardsTitle: "Demos para estudios contables",
        adaptTitle: "Cómo lo adaptamos a tu estudio",
        adaptLead: "Ya tenemos la base armada. No arrancamos de cero: la adaptamos a tu forma de trabajar.",
        adapt: adaptEs("tu estudio", "Partimos de las demos que ves acá y las conectamos a tu planilla de carga, tu cartera de clientes y los formatos que ya usás."),
        moreTitle: "También aplican a un estudio",
        ctaTitle: "Contanos cómo trabaja tu estudio",
        ctaBody: "Elegí un horario y vemos juntos qué conviene automatizar primero. Sin compromiso.",
      },
      en: {
        name: "Accounting firms",
        pain: "Client invoices typed by hand and documents to chase every month.",
        metaTitle: "Automation demos for accounting firms | Puna Tech",
        metaDescription: "Client invoices to a spreadsheet, monthly documents and Convenio Multilateral returns: try demos built for accounting firms. Fictional data.",
        h1: "Your clients' invoices, loaded without typing",
        mark: "loaded without typing",
        lead: "Three demos built for an accounting firm: documents that move to the spreadsheet on their own, the month's paperwork without chasing anyone, and Convenio Multilateral returns. Try them with fictional data.",
        cardsTitle: "Demos for accounting firms",
        adaptTitle: "How we adapt it to your firm",
        adaptLead: "The base is already built. We don't start from zero: we adapt it to the way you work.",
        adapt: adaptEn("your firm", "We start from the demos you see here and connect them to your intake spreadsheet, your client portfolio and the formats you already use."),
        moreTitle: "Also useful for a firm",
        ctaTitle: "Tell us how your firm works",
        ctaBody: "Pick a time and we'll look together at what is worth automating first. No strings attached.",
      },
    },
  },
  {
    id: "legal",
    slug: { es: "estudios-juridicos", en: "law-firms" },
    placement: "demos-juridicos",
    featured: ["lead-scoring", "collections"],
    copy: {
      es: {
        name: "Estudios jurídicos",
        pain: "Clientes que preguntan por su causa todo el día y honorarios que se cobran tarde.",
        metaTitle: "Demos de automatización para estudios jurídicos | Puna Tech",
        metaDescription: "Consultas ordenadas por prioridad y cobro de honorarios sin perseguir a nadie: probá demos para estudios jurídicos. Datos ficticios.",
        h1: "Clientes que escriben todo el día: ¿cómo va mi causa?",
        mark: "¿cómo va mi causa?",
        lead: "Las consultas llegan por WhatsApp y mail a cualquier hora, y los honorarios se reclaman cuando alguien se acuerda. Estas dos demos muestran cómo se ordena eso con un agente que prepara y vos aprobás.",
        cardsTitle: "Demos para estudios jurídicos",
        adaptTitle: "Cómo lo adaptamos a tu estudio",
        adaptLead: "Ya tenemos la base armada. No arrancamos de cero: la adaptamos a tu forma de trabajar.",
        adapt: adaptEs("tu estudio", "Partimos de las demos que ves acá y las conectamos a tu agenda, tus consultas entrantes y tu planilla de honorarios."),
        comingNote: "Todavía no tenemos una demo propia del aviso de novedades de cada causa. La base existe (leer lo que cambió y redactar el mensaje para que apruebes) y la armamos a medida para tu estudio.",
        moreTitle: "Más demos",
        ctaTitle: "Contanos cómo trabaja tu estudio",
        ctaBody: "Elegí un horario y vemos juntos qué conviene automatizar primero. Sin compromiso.",
      },
      en: {
        name: "Law firms",
        pain: "Clients asking about their case all day and fees that get collected late.",
        metaTitle: "Automation demos for law firms in Argentina | Puna Tech",
        metaDescription: "Inquiries sorted by priority and fee collection without chasing anyone: try demos built for law firms. Fictional data.",
        h1: "Clients writing all day: how is my case going?",
        mark: "how is my case going?",
        lead: "Inquiries arrive over WhatsApp and email at any hour, and fees get claimed whenever someone remembers. These two demos show how an agent that prepares while you approve brings order to that.",
        cardsTitle: "Demos for law firms",
        adaptTitle: "How we adapt it to your firm",
        adaptLead: "The base is already built. We don't start from zero: we adapt it to the way you work.",
        adapt: adaptEn("your firm", "We start from the demos you see here and connect them to your calendar, your incoming inquiries and your fee spreadsheet."),
        comingNote: "We don't have a dedicated demo yet for case-status updates to clients. The base exists (read what changed and draft the message for you to approve) and we build it to order for your firm.",
        moreTitle: "More demos",
        ctaTitle: "Tell us how your firm works",
        ctaBody: "Pick a time and we'll look together at what is worth automating first. No strings attached.",
      },
    },
  },
  {
    id: "insurance",
    slug: { es: "productores-de-seguros", en: "insurance-brokers" },
    placement: "demos-seguros",
    featured: ["policies-renewals", "client-invoices"],
    copy: {
      es: {
        name: "Productores de seguros",
        pain: "Pólizas que se pasan a mano desde PDF y renovaciones que se olvidan.",
        metaTitle: "Demos para productores de seguros | Puna Tech",
        metaDescription: "Pólizas desde PDF a cartera y renovaciones del mes con el aviso listo para aprobar: probá demos para productores de seguros. Datos ficticios.",
        h1: "Pólizas sin tipear y ninguna renovación olvidada",
        mark: "ninguna renovación olvidada",
        lead: "Subí los PDF de las compañías y mirá cómo se arma la cartera y qué vence este mes. La segunda demo muestra el motor de lectura de comprobantes que adaptamos a distintos rubros.",
        cardsTitle: "Demos para productores de seguros",
        adaptTitle: "Cómo lo adaptamos a tu productora",
        adaptLead: "Ya tenemos la base armada. No arrancamos de cero: la adaptamos a tu forma de trabajar.",
        adapt: adaptEs("tu productora", "Partimos de la lectura de documentos que ves acá y la ajustamos a los PDF de las compañías con las que trabajás, a tu cartera y a tus avisos."),
        moreTitle: "Más demos",
        ctaTitle: "Contanos cómo trabaja tu productora",
        ctaBody: "Elegí un horario y vemos juntos qué conviene automatizar primero. Sin compromiso.",
      },
      en: {
        name: "Insurance brokers",
        pain: "Policies copied by hand from PDFs and renewals that slip through.",
        metaTitle: "Automation demos for insurance brokers | Puna Tech",
        metaDescription: "Policies from PDF into a portfolio, and this month's renewals with the notice ready to approve: try demos for insurance brokers. Fictional data.",
        h1: "Policies without typing and no renewal forgotten",
        mark: "no renewal forgotten",
        lead: "Upload the insurers' PDFs and watch the portfolio build itself and what ends this month. The second demo shows the document-reading engine we adapt to different industries.",
        cardsTitle: "Demos for insurance brokers",
        adaptTitle: "How we adapt it to your agency",
        adaptLead: "The base is already built. We don't start from zero: we adapt it to the way you work.",
        adapt: adaptEn("your agency", "We start from the document reading you see here and tune it to the PDFs of the insurers you work with, your portfolio and your notices."),
        moreTitle: "More demos",
        ctaTitle: "Tell us how your agency works",
        ctaBody: "Pick a time and we'll look together at what is worth automating first. No strings attached.",
      },
    },
  },
  {
    id: "real-estate",
    slug: { es: "inmobiliarias", en: "real-estate-agencies" },
    placement: "demos-inmobiliarias",
    featured: ["lead-scoring", "collections"],
    copy: {
      es: {
        name: "Inmobiliarias",
        pain: "Consultas dispersas, seguimientos que se caen y alquileres que se cobran tarde.",
        metaTitle: "Demos de automatización para inmobiliarias | Puna Tech",
        metaDescription: "Consultas puntuadas con IA y cobro de alquileres sin perseguir a nadie: probá demos para inmobiliarias. Datos ficticios.",
        h1: "Consultas dispersas y seguimientos que se caen",
        mark: "seguimientos que se caen",
        lead: "Las consultas entran por portales, WhatsApp y redes, y el seguimiento depende de la memoria de cada asesor. Estas demos muestran cómo ordenarlo y cobrar a tiempo, con vos aprobando cada paso.",
        cardsTitle: "Demos para inmobiliarias",
        adaptTitle: "Cómo lo adaptamos a tu inmobiliaria",
        adaptLead: "Ya tenemos la base armada. No arrancamos de cero: la adaptamos a tu forma de trabajar.",
        adapt: adaptEs("tu inmobiliaria", "Partimos de las demos que ves acá y las conectamos a tus portales, tu planilla de contratos y tus recordatorios de cobro."),
        comingNote: "Todavía no tenemos una demo propia del ajuste de alquileres. Lo armamos a medida sobre la misma base: calcula el ajuste, redacta el aviso y espera tu aprobación.",
        moreTitle: "Más demos",
        ctaTitle: "Contanos cómo trabaja tu inmobiliaria",
        ctaBody: "Elegí un horario y vemos juntos qué conviene automatizar primero. Sin compromiso.",
      },
      en: {
        name: "Real estate agencies",
        pain: "Scattered inquiries, follow-ups that get dropped and rent collected late.",
        metaTitle: "Automation demos for real estate agencies | Puna Tech",
        metaDescription: "AI-scored inquiries and rent collection without chasing anyone: try demos built for real estate agencies. Fictional data.",
        h1: "Scattered inquiries and follow-ups that fall through",
        mark: "follow-ups that fall through",
        lead: "Inquiries arrive from portals, WhatsApp and social media, and follow-up depends on each agent's memory. These demos show how to organize it and collect on time, with you approving every step.",
        cardsTitle: "Demos for real estate agencies",
        adaptTitle: "How we adapt it to your agency",
        adaptLead: "The base is already built. We don't start from zero: we adapt it to the way you work.",
        adapt: adaptEn("your agency", "We start from the demos you see here and connect them to your portals, your contract spreadsheet and your collection reminders."),
        comingNote: "We don't have a dedicated demo yet for rent adjustments. We build it to order on the same base: it calculates the adjustment, drafts the notice and waits for your approval.",
        moreTitle: "More demos",
        ctaTitle: "Tell us how your agency works",
        ctaBody: "Pick a time and we'll look together at what is worth automating first. No strings attached.",
      },
    },
  },
  {
    id: "clinics",
    slug: { es: "clinicas-y-consultorios", en: "clinics-and-practices" },
    placement: "demos-clinicas",
    featured: ["payroll"],
    copy: {
      es: {
        name: "Clínicas y consultorios",
        pain: "Horas del equipo que se anotan en planillas y se liquidan a mano, con fichadas que faltan.",
        metaTitle: "Demo de horas y liquidación para clínicas | Puna Tech",
        metaDescription: "Horas del equipo y liquidación sin planillas a mano: probá la demo y mirá el video de 34 s para clínicas y consultorios. Datos ficticios.",
        h1: "Las horas del equipo, liquidadas sin planillas a mano",
        mark: "liquidadas sin planillas a mano",
        lead: "Fichadas que faltan, jornadas larguísimas y una liquidación que se arma a mano cada semana. Probá cómo el agente lo detecta, propone el arreglo y te deja aprobar. Las autorizaciones de obras sociales las armamos a medida.",
        cardsTitle: "Lo que podés probar hoy",
        adaptTitle: "Cómo lo adaptamos a tu clínica",
        adaptLead: "Ya tenemos la base armada. No arrancamos de cero: la adaptamos a tu forma de trabajar.",
        adapt: adaptEs("tu clínica", "Partimos de la demo de horas y la conectamos a tu agenda y tus planillas. Si además querés seguir autorizaciones, lo armamos a medida con las obras sociales con las que trabajás."),
        comingNote: "Todavía no tenemos una demo propia del seguimiento de autorizaciones de obras sociales. La base existe (un tablero de pedidos, avisos al paciente que vos aprobás) y la armamos a medida para tu clínica.",
        moreTitle: "Más demos",
        ctaTitle: "Contanos cómo trabaja tu clínica",
        ctaBody: "Elegí un horario y vemos juntos qué conviene automatizar primero. Sin compromiso.",
      },
      en: {
        name: "Clinics and practices",
        pain: "Team hours jotted in spreadsheets and settled by hand, with clock-outs that go missing.",
        metaTitle: "Staff hours and payroll demo for clinics | Puna Tech",
        metaDescription: "Team hours and payroll without hand-made spreadsheets: try the demo and watch the 34 s video for clinics and medical practices. Fictional data.",
        h1: "Team hours, settled without hand-made spreadsheets",
        mark: "settled without hand-made spreadsheets",
        lead: "Missing clock-outs, very long shifts and a payroll built by hand every week. Try how the agent spots it, suggests the fix and lets you approve. Health-insurer authorizations we build to order.",
        cardsTitle: "What you can try today",
        adaptTitle: "How we adapt it to your clinic",
        adaptLead: "The base is already built. We don't start from zero: we adapt it to the way you work.",
        adapt: adaptEn("your clinic", "We start from the hours demo and connect it to your calendar and your spreadsheets. If you also want to track authorizations, we build that to order with the insurers you work with."),
        comingNote: "We don't have a dedicated demo yet for health-insurer authorization tracking. The base exists (a request board, patient notices you approve) and we build it to order for your clinic.",
        moreTitle: "More demos",
        ctaTitle: "Tell us how your clinic works",
        ctaBody: "Pick a time and we'll look together at what is worth automating first. No strings attached.",
      },
    },
  },
];

export const rubrosHubCopy = {
  es: {
    title: "Elegí tu rubro",
    lead: "Cada rubro tiene su recorrido: el problema de todos los días y las demos que lo resuelven.",
    open: "Ver demos para este rubro",
    filterLabel: "Filtrar demos por rubro",
    filterAll: "Todas",
    commerce: "Comercio y distribución",
    groupAll: "Todas las demos",
    groupCount: (n: number) => (n === 1 ? "1 demo" : `${n} demos`),
    otherDemos: "Más demos para",
    allDemos: "Ver todas las demos",
    howTitle: "Cómo es una demo",
    video: "Video",
    interactive: "Interactiva",
    breadcrumbHub: "Demos",
    forLabel: "para",
  },
  en: {
    title: "Pick your industry",
    lead: "Each industry has its own path: the everyday problem and the demos that solve it.",
    open: "See demos for this industry",
    filterLabel: "Filter demos by industry",
    filterAll: "All",
    commerce: "Retail and distribution",
    groupAll: "All demos",
    groupCount: (n: number) => (n === 1 ? "1 demo" : `${n} demos`),
    otherDemos: "More demos for",
    allDemos: "See all demos",
    howTitle: "What a demo is like",
    video: "Video",
    interactive: "Interactive",
    breadcrumbHub: "Demos",
    forLabel: "for",
  },
};

export function rubroSegment(locale: Locale) {
  return locale === "en" ? "for" : "para";
}
export function rubroPath(locale: Locale, slug: string) {
  return `${demosHubPath(locale)}/${rubroSegment(locale)}/${slug}`;
}
export function findRubroBySlug(locale: Locale, slug: string) {
  return rubroDefinitions.find((r) => r.slug[locale] === slug);
}
export function rubroOgPath(locale: Locale, id: RubroId) {
  return `/og/demos-para-${id}-${locale}.png`;
}
/** Demos shown for a vertical, rubro-first ordering: the demos whose home rubro it is, then the rest. */
export function demosForVertical(vertical: VerticalId) {
  return demoDefinitions.filter((d) => d.verticals.includes(vertical));
}
