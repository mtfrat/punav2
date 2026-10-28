import type { Locale } from "./chrome";

export type DemoId = "collections" | "stock-sync" | "payroll" | "lead-scoring" | "wholesale-quotes" | "store-dashboard";

export interface DemoCopy {
  /** Short card / nav title. */
  title: string;
  /** One line shown on the index card. */
  blurb: string;
  /** Document title (brand suffix is added by createMeta). */
  metaTitle: string;
  metaDescription: string;
  /** Hero H1. */
  h1: string;
  /** The orange keyword highlighted inside the H1. */
  mark: string;
  lead: string;
  problem: string;
  how: string;
  result: string;
  /** Where this comes from, e.g. a community pain we heard. */
  origin?: string;
}

export interface DemoDefinition {
  id: DemoId;
  slug: Record<Locale, string>;
  /** Spanish-only landing pages that explain the same automation in more depth. */
  related?: { label: string; path: string };
  copy: Record<Locale, DemoCopy>;
}

export const demoDefinitions: DemoDefinition[] = [
  {
    id: "collections",
    slug: { es: "cobranzas", en: "collections" },
    related: { label: "Cómo funciona la automatización de cobranzas", path: "/es/automatizaciones/automatizar-cobranzas" },
    copy: {
      es: {
        title: "Cobranzas automáticas",
        blurb: "Facturas, recordatorios por WhatsApp y mail, escalonamiento y cobrado vs vencido.",
        metaTitle: "Demo de cobranzas automáticas para pymes | Puna Tech",
        metaDescription: "Probá una demo de cobranzas: el agente prepara recordatorios por WhatsApp y mail según el vencimiento y vos aprobás cada envío. Datos de ejemplo.",
        h1: "Cobrá a tiempo sin ir atrás de nadie",
        mark: "sin ir atrás de nadie",
        lead: "Mirá cómo un agente revisa tus facturas, prepara el recordatorio justo para cada cliente y espera tu OK antes de mandar nada.",
        problem: "Las facturas vencen y nadie reclama a tiempo. Perseguir clientes por WhatsApp te come horas, y cuando te acordás ya pasaron 30 días.",
        how: "El agente lee las facturas abiertas, calcula en qué paso de escalonamiento está cada una y deja un borrador en WhatsApp o mail. Vos editás, aprobás o salteás. Si entra el pago, frena solo.",
        result: "Ves de un vistazo cobrado, por vencer y vencido, con un registro de cada aviso aprobado. Nada sale sin tu OK.",
        origin: "Caso típico de pymes que cobran a 30 días y reclaman por WhatsApp.",
      },
      en: {
        title: "Automatic collections",
        blurb: "Invoices, WhatsApp and email reminders, escalation, and collected vs overdue.",
        metaTitle: "Automatic collections demo for small business | Puna Tech",
        metaDescription: "Try a collections demo: the agent drafts WhatsApp and email reminders based on due dates and you approve every send. Sample data.",
        h1: "Get paid on time without chasing anyone",
        mark: "without chasing anyone",
        lead: "See how an agent reviews your invoices, drafts the right reminder for each client and waits for your OK before sending anything.",
        problem: "Invoices go overdue and nobody follows up in time. Chasing clients on WhatsApp eats hours, and by the time you remember, 30 days have passed.",
        how: "The agent reads open invoices, works out which escalation step each one is on and leaves a WhatsApp or email draft. You edit, approve or skip. When the payment lands, it stops on its own.",
        result: "You see collected, upcoming and overdue at a glance, with a log of every approved notice. Nothing goes out without your OK.",
        origin: "A common case for small businesses that invoice at 30 days and chase on WhatsApp.",
      },
    },
  },
  {
    id: "stock-sync",
    slug: { es: "sync-stock", en: "stock-sync" },
    related: { label: "Integración con Tienda Nube", path: "/es/integraciones/tienda-nube" },
    copy: {
      es: {
        title: "Sync de stock con proveedores",
        blurb: "Feed CSV del proveedor contra el stock de tu tienda, con reglas de margen y ocultar sin stock.",
        metaTitle: "Demo de sync de stock con proveedores de tienda | Puna Tech",
        metaDescription: "Demo de stock: compará el CSV de tu proveedor con tu tienda online, aplicá reglas de margen y ocultar sin stock, y aprobá. Datos de ejemplo.",
        h1: "Tu tienda al día con el stock del proveedor",
        mark: "al día",
        lead: "Pegá el CSV del proveedor y mirá cómo el agente arma la tabla de diferencias, calcula precios con tu margen y te deja aprobar.",
        problem: "El proveedor te manda una lista nueva por mail y vos la copiás a mano a la tienda. Resultado: productos vendidos sin stock y precios desactualizados.",
        how: "El agente lee el feed, lo compara producto por producto, aplica tus reglas (margen, redondeo, ocultar sin stock) y marca para revisar los saltos raros de precio. Vos aprobás el lote.",
        result: "Una tabla clara de qué cambia y por qué, un registro de lo aplicado y cero pasos manuales en Shopify, Tienda Nube o Mercado Libre.",
        origin: "Un dolor que se repite en comunidades de e-commerce y dropshipping.",
      },
      en: {
        title: "Supplier stock sync",
        blurb: "Supplier CSV feed against your store stock, with margin and hide-out-of-stock rules.",
        metaTitle: "Supplier stock sync demo for online stores | Puna Tech",
        metaDescription: "Stock demo: compare your supplier CSV with your online store, apply margin and hide-out-of-stock rules, and approve. Sample data.",
        h1: "Keep your store in sync with supplier stock",
        mark: "in sync",
        lead: "Paste the supplier CSV and watch the agent build the diff table, price items with your margin and let you approve.",
        problem: "Your supplier emails a new list and you copy it into the store by hand. The result: items sold without stock and outdated prices.",
        how: "The agent reads the feed, compares it product by product, applies your rules (margin, rounding, hide out of stock) and flags odd price jumps for review. You approve the batch.",
        result: "A clear table of what changes and why, a log of what was applied, and no manual steps in Shopify, Tienda Nube or Mercado Libre.",
        origin: "A pain that keeps showing up in e-commerce and dropshipping communities.",
      },
    },
  },
  {
    id: "payroll",
    slug: { es: "horas-y-pagos", en: "payroll" },
    copy: {
      es: {
        title: "Control de horas y pagos de personal",
        blurb: "Tarjetas de horas, alertas de anomalías y vista previa de liquidación que aprobás vos.",
        metaTitle: "Demo de control de horas y pagos del personal | Puna Tech",
        metaDescription: "Demo de horas: alertas de salida faltante y horas extra, y una liquidación que aprobás antes de pagar. Datos de ejemplo.",
        h1: "Horas y sueldos sin planillas ni sorpresas",
        mark: "sin planillas ni sorpresas",
        lead: "Mirá cómo el agente detecta fichadas incompletas y horas extra, propone arreglos y te deja aprobar la liquidación.",
        problem: "Las horas se anotan en cuadernos o por WhatsApp, alguien se olvida de fichar la salida y a fin de semana nadie sabe cuánto pagar.",
        how: "El agente junta las fichadas, marca salidas faltantes, jornadas larguísimas y horas extra, y propone la corrección. Con todo resuelto arma la liquidación y espera tu aprobación.",
        result: "Una liquidación clara por persona, con extras al 50% y al 100%, y un registro de cada corrección que confirmaste.",
        origin: "Un reclamo frecuente de dueños de comercios y gastronomía con personal por hora.",
      },
      en: {
        title: "Staff hours and payroll control",
        blurb: "Timecards, anomaly flags and a payroll preview that you approve.",
        metaTitle: "Staff hours and payroll control demo | Puna Tech",
        metaDescription: "Hours demo: missing clock-out and overtime flags, plus a payroll preview you approve before paying. Sample data.",
        h1: "Hours and payroll without spreadsheets or surprises",
        mark: "without spreadsheets or surprises",
        lead: "See how the agent spots incomplete clock-ins and overtime, suggests fixes and lets you approve payroll.",
        problem: "Hours get jotted in notebooks or WhatsApp, someone forgets to clock out, and at the end of the week nobody knows what to pay.",
        how: "The agent gathers clock-ins, flags missing clock-outs, very long shifts and overtime, and proposes the fix. Once everything is resolved it builds the payroll and waits for your approval.",
        result: "A clear payroll per person, with overtime at 50% and 100%, and a log of every correction you confirmed.",
        origin: "A frequent complaint from owners of shops and restaurants with hourly staff.",
      },
    },
  },
  {
    id: "lead-scoring",
    slug: { es: "leads-con-ia", en: "lead-scoring" },
    copy: {
      es: {
        title: "Captación y calificación de leads con IA",
        blurb: "Un formulario, un puntaje con reglas visibles, ruteo y una respuesta sugerida para aprobar.",
        metaTitle: "Demo de calificación de leads con IA y reglas | Puna Tech",
        metaDescription: "Demo de leads: la IA puntúa cada consulta con reglas que podés leer, la rutea y deja la respuesta lista para aprobar. Datos de ejemplo.",
        h1: "Que cada consulta llegue puntuada y con respuesta lista",
        mark: "puntuada y con respuesta lista",
        lead: "Cargá un lead de ejemplo y mirá por qué la IA lo califica como caliente, tibio, frío o spam, sin cajas negras.",
        problem: "Entran consultas por todos lados y no sabés cuáles valen la pena. Las buenas se enfrían esperando y el spam te hace perder tiempo.",
        how: "Cada lead se puntúa con reglas que ves una por una (presupuesto, urgencia, dolor concreto, señales de spam). Según el puntaje se rutea y el agente deja una respuesta personalizada.",
        result: "Una bandeja ordenada por prioridad, con el motivo de cada puntaje y la respuesta lista para aprobar o ajustar.",
        origin: "La IA de esta demo es simulada con reglas. No llama a ninguna API externa.",
      },
      en: {
        title: "AI lead capture and qualification",
        blurb: "A form, a score with visible rules, routing and a suggested reply to approve.",
        metaTitle: "AI lead scoring demo with transparent rules | Puna Tech",
        metaDescription: "Leads demo: the AI scores each inquiry with rules you can read, routes it and leaves a reply ready to approve. Sample data.",
        h1: "Every inquiry scored, routed and ready to answer",
        mark: "scored, routed and ready to answer",
        lead: "Load a sample lead and see why the AI rates it hot, warm, cold or spam, with no black box.",
        problem: "Inquiries arrive from everywhere and you can't tell which are worth it. Good ones go cold waiting and spam wastes your time.",
        how: "Each lead is scored with rules you can read one by one (budget, urgency, concrete pain, spam signals). The score decides the routing and the agent drafts a personalized reply.",
        result: "An inbox sorted by priority, with the reason behind each score and the reply ready to approve or tweak.",
        origin: "The AI in this demo is simulated with rules. It calls no external API.",
      },
    },
  },
  {
    id: "wholesale-quotes",
    slug: { es: "cotizador-mayorista", en: "wholesale-quotes" },
    related: { label: "Pedidos por WhatsApp", path: "/es/automatizaciones/pedidos-por-whatsapp" },
    copy: {
      es: {
        title: "Cotizador y pedidos mayorista",
        blurb: "Catálogo con escalas por volumen, descuento por cliente y cotización lista para WhatsApp.",
        metaTitle: "Demo de cotizador mayorista con escalas | Puna Tech",
        metaDescription: "Demo de cotizador: precios por volumen, descuento por cliente y un pedido de WhatsApp convertido en cotización lista. Datos de ejemplo.",
        h1: "Cotizá en segundos, no en una tarde",
        mark: "en segundos",
        lead: "Pegá un pedido de WhatsApp y mirá cómo el agente arma el carrito, aplica escalas y descuentos y deja la cotización lista para aprobar.",
        problem: "Cada pedido mayorista te lleva media hora con la calculadora: escalas por cantidad, descuentos por cliente, IVA y después el mensaje a mano.",
        how: "El agente interpreta el pedido, aplica el precio por volumen y el descuento del cliente, avisa cuánto falta para la siguiente escala y arma el PDF y el mensaje de WhatsApp.",
        result: "Una cotización prolija con totales claros, sugerencias para vender más y un registro de lo que aprobaste.",
        origin: "Pensado para distribuidores y mayoristas que venden por WhatsApp.",
      },
      en: {
        title: "Wholesale quotes and orders",
        blurb: "Catalog with volume tiers, client discounts and a quote ready for WhatsApp.",
        metaTitle: "Wholesale quote builder demo with volume tiers | Puna Tech",
        metaDescription: "Quote demo: volume pricing, client discounts and a WhatsApp order turned into a ready quote. Sample data.",
        h1: "Quote in seconds, not in an afternoon",
        mark: "in seconds",
        lead: "Paste a WhatsApp order and watch the agent build the cart, apply tiers and discounts, and leave the quote ready to approve.",
        problem: "Every wholesale order takes half an hour with a calculator: quantity tiers, client discounts, VAT, and then the message by hand.",
        how: "The agent reads the order, applies volume pricing and the client discount, tells you how far the next tier is and builds the PDF-style quote and the WhatsApp message.",
        result: "A tidy quote with clear totals, upsell hints and a log of what you approved.",
        origin: "Built for distributors and wholesalers who sell over WhatsApp.",
      },
    },
  },
  {
    id: "store-dashboard",
    slug: { es: "panel-comercio", en: "store-dashboard" },
    copy: {
      es: {
        title: "Panel de gestión para comercio",
        blurb: "Ventas, stock y caja en un tablero con gráficos, y el kit para armarlo vos.",
        metaTitle: "Demo de panel de gestión de ventas y stock | Puna Tech",
        metaDescription: "Demo de panel para comercios: ventas, stock y caja con gráficos, reposición sugerida y cierre de caja. Datos de ejemplo y kit en Gumroad.",
        h1: "Ventas, stock y caja en una sola pantalla",
        mark: "en una sola pantalla",
        lead: "Cambiá el período, prepará una reposición y cerrá la caja del día. Todo con datos de ejemplo.",
        problem: "Las ventas están en un cuaderno, el stock en una planilla y la caja en la cabeza. Para saber cómo vas tenés que juntar todo a mano.",
        how: "El panel junta ventas, stock y caja. El agente detecta lo que está bajo el mínimo, arma el pedido a proveedores y marca diferencias de caja. Vos aprobás.",
        result: "Una foto clara del negocio cada día, con alertas a tiempo y las decisiones de compra listas para aprobar.",
        origin: "Si todavía no necesitás un sistema a medida, el kit de planillas es un buen primer paso por un pago único.",
      },
      en: {
        title: "Store management dashboard",
        blurb: "Sales, stock and cash in one dashboard with charts, plus the kit to build it yourself.",
        metaTitle: "Store management dashboard demo for shops | Puna Tech",
        metaDescription: "Shop dashboard demo: sales, stock and cash with charts, suggested restocking and register closing. Sample data and Gumroad kit.",
        h1: "Sales, stock and cash on one screen",
        mark: "on one screen",
        lead: "Change the period, prepare a restock and close the day's register. All with sample data.",
        problem: "Sales are in a notebook, stock in a spreadsheet and cash in your head. To know how you're doing you have to pull everything together by hand.",
        how: "The dashboard pulls sales, stock and cash together. The agent spots what is under the minimum, drafts the supplier order and flags cash differences. You approve.",
        result: "A clear daily picture of the business, with timely alerts and purchase decisions ready to approve.",
        origin: "If you don't need custom software, the spreadsheet kit covers most of it for a one-time payment.",
      },
    },
  },
];

export const demosHubCopy = {
  es: {
    metaTitle: "Demos interactivas de automatización para pymes | Puna Tech",
    metaDescription: "Probá 6 demos de automatización para pymes: cobranzas, stock, horas y sueldos, leads con IA, cotizador y panel de comercio.",
    eyebrow: "Demos interactivas",
    h1: "Probalo antes de contratarlo",
    mark: "Probalo",
    lead: "Seis casos reales de automatización para pymes argentinas, funcionando en tu navegador. En todos pasa lo mismo: el agente prepara, vos aprobás.",
    exampleNote: "Todas las demos usan datos de ejemplo y no envían nada a nadie.",
    open: "Abrir la demo",
    patternTitle: "El patrón de todas las demos",
    pattern: [["El agente prepara", "Lee tus datos y deja listo el borrador, el diff o la liquidación."], ["Vos revisás", "Ves qué va a pasar y por qué. Editás lo que quieras."], ["Vos aprobás", "Recién ahí se ejecuta, y queda anotado en un registro."]],
    roi: "¿Querés ponerle números? Probá el simulador de ahorro",
    ctaTitle: "¿Cuál es tu cuello de botella?",
    ctaBody: "Contanos qué proceso te frena y te decimos si conviene automatizarlo y por dónde empezar. Sin compromiso.",
    breadcrumb: "Demos",
  },
  en: {
    metaTitle: "Interactive automation demos for small business | Puna Tech",
    metaDescription: "Try 6 automation demos for small businesses: collections, stock, hours and payroll, AI leads, wholesale quotes and a shop dashboard.",
    eyebrow: "Interactive demos",
    h1: "Try it before you hire it",
    mark: "Try it",
    lead: "Six real automation cases for Argentine small businesses, running in your browser. They all follow the same rule: the agent prepares, you approve.",
    exampleNote: "Every demo uses sample data and sends nothing to anyone.",
    open: "Open the demo",
    patternTitle: "The pattern behind every demo",
    pattern: [["The agent prepares", "Reads your data and leaves the draft, the diff or the payroll ready."], ["You review", "You see what will happen and why. Edit whatever you like."], ["You approve", "Only then it runs, and it is written to a log."]],
    roi: "Want numbers on it? Try the savings simulator",
    ctaTitle: "What is your bottleneck?",
    ctaBody: "Tell us which process is slowing you down and we'll say whether it is worth automating and where to start. No strings attached.",
    breadcrumb: "Demos",
  },
};

export function demosHubPath(locale: Locale) {
  return locale === "en" ? "/demos" : "/es/demos";
}
export function demoPath(locale: Locale, slug: string) {
  return `${demosHubPath(locale)}/${slug}`;
}
export function findDemoBySlug(locale: Locale, slug: string) {
  return demoDefinitions.find((d) => d.slug[locale] === slug);
}
export function demoOgPath(locale: Locale, id: DemoId | "hub") {
  return `/og/demos-${id}-${locale}.png`;
}
