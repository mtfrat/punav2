import type { Locale } from "./chrome";

export type DemoId =
  | "collections" | "stock-sync" | "payroll" | "lead-scoring" | "wholesale-quotes" | "store-dashboard" | "convenio-multilateral"
  | "client-invoices" | "monthly-docs" | "policies-renewals";

/** Who a demo is useful for. "commerce" is a group on the hub ("Comercio y distribución"), not a rubro page. */
export type VerticalId = "accounting" | "legal" | "insurance" | "real-estate" | "clinics" | "commerce";

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
  /** Extra copy for video-only demos. */
  video?: {
    /** Visible heading above the player. */
    heading: string;
    /** Alt text / aria-label for the video (what is on screen). */
    alt: string;
    /** Short note under the player (language, no data). */
    note: string;
    /** Chapters shown below the player. */
    chapters: [string, string][];
    /** Music credit line. */
    credit: string;
  };
}

export interface DemoDefinition {
  id: DemoId;
  slug: Record<Locale, string>;
  /** Rubros where this demo is shown. The first one is the "home" rubro of the demo. */
  verticals: VerticalId[];
  /** Spanish-only landing pages that explain the same automation in more depth. */
  related?: { label: string; path: string };
  copy: Record<Locale, DemoCopy>;
}

export const demoDefinitions: DemoDefinition[] = [
  {
    id: "collections",
    verticals: ["accounting", "real-estate", "legal"],
    slug: { es: "cobranzas", en: "collections" },
    related: { label: "Cómo funciona la automatización de cobranzas", path: "/es/automatizaciones/automatizar-cobranzas" },
    copy: {
      es: {
        title: "Cobranzas automáticas",
        blurb: "Facturas, recordatorios por WhatsApp y mail, escalonamiento y cobrado vs vencido.",
        metaTitle: "Demo de cobranzas automáticas para pymes | Puna Tech",
        metaDescription: "Probá una demo de cobranzas: el agente prepara recordatorios por WhatsApp y mail según el vencimiento y vos aprobás cada envío. Datos ficticios.",
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
        metaDescription: "Try a collections demo: the agent drafts WhatsApp and email reminders based on due dates and you approve every send. Fictional data.",
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
    verticals: ["commerce"],
    slug: { es: "sync-stock", en: "stock-sync" },
    related: { label: "Integración con Tienda Nube", path: "/es/integraciones/tienda-nube" },
    copy: {
      es: {
        title: "Sync de stock con proveedores",
        blurb: "Feed CSV del proveedor contra el stock de tu tienda, con reglas de margen y ocultar sin stock.",
        metaTitle: "Demo de sync de stock con proveedores de tienda | Puna Tech",
        metaDescription: "Demo de stock: compará el CSV de tu proveedor con tu tienda online, aplicá reglas de margen y ocultar sin stock, y aprobá. Datos ficticios.",
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
        metaDescription: "Stock demo: compare your supplier CSV with your online store, apply margin and hide-out-of-stock rules, and approve. Fictional data.",
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
    verticals: ["accounting", "clinics"],
    slug: { es: "horas-y-pagos", en: "payroll" },
    copy: {
      es: {
        title: "Control de horas y pagos de personal",
        blurb: "Tarjetas de horas, alertas de anomalías y vista previa de liquidación que aprobás vos.",
        metaTitle: "Demo de control de horas y pagos del personal | Puna Tech",
        metaDescription: "Demo de horas: alertas de salida faltante y horas extra, y una liquidación que aprobás antes de pagar. Datos ficticios.",
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
        metaDescription: "Hours demo: missing clock-out and overtime flags, plus a payroll preview you approve before paying. Fictional data.",
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
    verticals: ["real-estate", "legal"],
    slug: { es: "leads-con-ia", en: "lead-scoring" },
    copy: {
      es: {
        title: "Captación y calificación de leads con IA",
        blurb: "Un formulario, un puntaje con reglas visibles, ruteo y una respuesta sugerida para aprobar.",
        metaTitle: "Demo de calificación de leads con IA y reglas | Puna Tech",
        metaDescription: "Demo de leads: la IA puntúa cada consulta con reglas que podés leer, la rutea y deja la respuesta lista para aprobar. Datos ficticios.",
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
        metaDescription: "Leads demo: the AI scores each inquiry with rules you can read, routes it and leaves a reply ready to approve. Fictional data.",
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
    verticals: ["commerce"],
    slug: { es: "cotizador-mayorista", en: "wholesale-quotes" },
    related: { label: "Pedidos por WhatsApp", path: "/es/automatizaciones/pedidos-por-whatsapp" },
    copy: {
      es: {
        title: "Cotizador y pedidos mayorista",
        blurb: "Catálogo con escalas por volumen, descuento por cliente y cotización lista para WhatsApp.",
        metaTitle: "Demo de cotizador mayorista con escalas | Puna Tech",
        metaDescription: "Demo de cotizador: precios por volumen, descuento por cliente y un pedido de WhatsApp convertido en cotización lista. Datos ficticios.",
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
        metaDescription: "Quote demo: volume pricing, client discounts and a WhatsApp order turned into a ready quote. Fictional data.",
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
    verticals: ["commerce"],
    slug: { es: "panel-comercio", en: "store-dashboard" },
    copy: {
      es: {
        title: "Panel de gestión para comercio",
        blurb: "Ventas, stock y caja en un tablero con gráficos, y el kit para armarlo vos.",
        metaTitle: "Demo de panel de gestión de ventas y stock | Puna Tech",
        metaDescription: "Demo de panel para comercios: ventas, stock y caja con gráficos, reposición sugerida y cierre de caja. Datos ficticios y kit en Gumroad.",
        h1: "Ventas, stock y caja en una sola pantalla",
        mark: "en una sola pantalla",
        lead: "Cambiá el período, prepará una reposición y cerrá la caja del día. Todo con datos ficticios.",
        problem: "Las ventas están en un cuaderno, el stock en una planilla y la caja en la cabeza. Para saber cómo vas tenés que juntar todo a mano.",
        how: "El panel junta ventas, stock y caja. El agente detecta lo que está bajo el mínimo, arma el pedido a proveedores y marca diferencias de caja. Vos aprobás.",
        result: "Una foto clara del negocio cada día, con alertas a tiempo y las decisiones de compra listas para aprobar.",
        origin: "Si todavía no necesitás un sistema a medida, el kit de planillas es un buen primer paso por un pago único.",
      },
      en: {
        title: "Store management dashboard",
        blurb: "Sales, stock and cash in one dashboard with charts, plus the kit to build it yourself.",
        metaTitle: "Store management dashboard demo for shops | Puna Tech",
        metaDescription: "Shop dashboard demo: sales, stock and cash with charts, suggested restocking and register closing. Fictional data and Gumroad kit.",
        h1: "Sales, stock and cash on one screen",
        mark: "on one screen",
        lead: "Change the period, prepare a restock and close the day's register. All with fictional data.",
        problem: "Sales are in a notebook, stock in a spreadsheet and cash in your head. To know how you're doing you have to pull everything together by hand.",
        how: "The dashboard pulls sales, stock and cash together. The agent spots what is under the minimum, drafts the supplier order and flags cash differences. You approve.",
        result: "A clear daily picture of the business, with timely alerts and purchase decisions ready to approve.",
        origin: "If you don't need custom software, the spreadsheet kit covers most of it for a one-time payment.",
      },
    },
  },
  {
    id: "convenio-multilateral",
    verticals: ["accounting"],
    slug: { es: "convenio-multilateral", en: "multilateral-agreement" },
    copy: {
      es: {
        title: "Convenio Multilateral / DDJJ SIFERE",
        blurb: "Cartera de clientes, retenciones conciliadas, reparto por jurisdicción y archivos listos para SIFERE WEB. Video de 34 segundos.",
        metaTitle: "Demo Convenio Multilateral y DDJJ SIFERE | Puna Tech",
        metaDescription: "Video de 34 s: un estudio contable arma las DDJJ de Convenio Multilateral con retenciones conciliadas y archivos para SIFERE WEB. Datos ficticios.",
        h1: "Las DDJJ de Convenio Multilateral, sin armar planillas a mano",
        mark: "sin armar planillas a mano",
        lead: "Mirá en 34 segundos cómo un estudio contable carga las ventas, concilia las retenciones, reparte por jurisdicción y deja listo el archivo para SIFERE WEB.",
        problem: "Cada cliente de Convenio Multilateral lleva horas: pasar ventas y retenciones a planillas, cruzarlas con lo que informan los agentes, calcular cada jurisdicción y recién después armar la presentación.",
        how: "El sistema lee la planilla de ventas, cruza las retenciones, aplica el coeficiente unificado jurisdicción por jurisdicción y avisa los errores antes de presentar. Genera el XML o Excel para SIFERE WEB y el papel de trabajo para firmar. Vos revisás y presentás.",
        result: "Una cartera con el estado de cada cliente, alertas a la vista y una estimación de las horas que vuelven al estudio: 12,1 h por mes en el ejemplo (25 clientes, 4 jurisdicciones, 60 min por cliente hoy).",
        origin: "Es la base de un sistema que se adapta a cómo trabaja cada estudio. El video usa datos ficticios, ningún dato de un cliente real.",
        video: {
          heading: "Video del recorrido",
          alt: "Recorrido en video de un panel para Convenio Multilateral: cartera de clientes, conciliación de ventas y retenciones, reparto por jurisdicción, alertas, archivos para SIFERE WEB y ahorro de horas. Datos ficticios.",
          note: "Video sin voz, con subtítulos en pantalla en español. Datos ficticios.",
          chapters: [["0:00", "Cartera de clientes"], ["0:05", "Ventas y retenciones, conciliadas"], ["0:12", "Distribución por jurisdicción"], ["0:20", "Alertas antes de presentar"], ["0:23", "Archivos para SIFERE WEB"], ["0:27", "Horas que vuelven al estudio"]],
          credit: "Música: “Wholesome” de Kevin MacLeod (incompetech.com), licencia Creative Commons Atribución 4.0.",
        },
      },
      en: {
        title: "Multilateral Agreement / SIFERE returns",
        blurb: "Client portfolio, reconciled withholdings, split by province and files ready for SIFERE WEB. 34-second video.",
        metaTitle: "Convenio Multilateral and SIFERE demo | Puna Tech",
        metaDescription: "34-second video: an accounting firm prepares Convenio Multilateral returns with reconciled withholdings and SIFERE WEB files. Fictional data.",
        h1: "Multilateral Agreement tax returns without building spreadsheets by hand",
        mark: "without building spreadsheets by hand",
        lead: "Watch in 34 seconds how an accounting firm loads sales, reconciles withholdings, splits by province and gets the file ready for SIFERE WEB.",
        problem: "Every Convenio Multilateral client takes hours: moving sales and withholdings into spreadsheets, matching them with what withholding agents report, calculating each province and only then building the filing.",
        how: "The system reads the sales sheet, matches withholdings, applies the unified coefficient province by province and flags errors before filing. It produces the XML or Excel for SIFERE WEB and a work paper to sign. You review and file.",
        result: "A portfolio with each client's status, alerts in plain sight and an estimate of the hours that come back to the firm: 12.1 h per month in the example (25 clients, 4 provinces, 60 min per client today).",
        origin: "This is the base of a system that adapts to how each firm works. The video uses fictional data, nothing from a real client.",
        video: {
          heading: "Walkthrough video",
          alt: "Video walkthrough of a Convenio Multilateral dashboard: client portfolio, sales and withholdings reconciliation, split by province, alerts, files for SIFERE WEB and hours saved. Fictional data.",
          note: "No voiceover. On-screen captions are in Spanish. Fictional data.",
          chapters: [["0:00", "Client portfolio"], ["0:05", "Sales and withholdings, reconciled"], ["0:12", "Split by province"], ["0:20", "Alerts before filing"], ["0:23", "Files for SIFERE WEB"], ["0:27", "Hours back to the firm"]],
          credit: "Music: “Wholesome” by Kevin MacLeod (incompetech.com), Creative Commons Attribution 4.0.",
        },
      },
    },
  },
  {
    id: "client-invoices",
    verticals: ["accounting", "insurance"],
    slug: { es: "facturas-de-clientes", en: "client-invoices" },
    copy: {
      es: {
        title: "Facturas de compra de tus clientes",
        blurb: "Los comprobantes que suben tus clientes pasan a la planilla del estudio con alertas de CUIT, CAE, duplicados y percepciones.",
        metaTitle: "Facturas de clientes a planilla del estudio | Puna Tech",
        metaDescription: "Probá cómo un estudio pasa las facturas de compra de sus clientes a planilla con alertas de CUIT, CAE, duplicados y percepciones. Datos ficticios.",
        h1: "Las facturas de tus clientes, cargadas sin tipear",
        mark: "sin tipear",
        lead: "Tu cliente sube PDF y fotos. El agente las lee, controla cada comprobante y deja la planilla lista. Vos aprobás lo que se carga.",
        problem: "Cada mes llegan cientos de comprobantes en PDF, fotos y capturas. Alguien los tipea, y los errores aparecen recién cuando ya se liquidó: un CUIT mal leído, un CAE incompleto, una factura cargada dos veces, una percepción que no coincide.",
        how: "El agente lee cada comprobante y valida el CUIT, el CAE, el IVA, las percepciones y los duplicados. Lo que está limpio queda listo; lo dudoso se marca con el motivo. Con una foto mala no adivina: la manda a revisar. Vos aprobás y se carga la planilla del estudio.",
        result: "Una planilla con una fila por comprobante, los totales a la vista y una lista corta de lo que una persona tiene que mirar.",
        origin: "Es la base de un lector de facturas que se adapta a cómo trabaja cada estudio. Los proveedores y los montos de la demo son inventados.",
      },
      en: {
        title: "Your clients' purchase invoices",
        blurb: "The documents your clients upload land in the firm's spreadsheet with alerts for tax ID, CAE, duplicates and withholdings.",
        metaTitle: "Client invoices to the firm's spreadsheet | Puna Tech",
        metaDescription: "See how an accounting firm moves clients' purchase invoices into a spreadsheet with alerts for tax ID, CAE, duplicates and withholdings. Fictional data.",
        h1: "Your clients' invoices, loaded without typing",
        mark: "without typing",
        lead: "Your client uploads PDFs and photos. The agent reads them, checks every document and leaves the spreadsheet ready. You approve what gets loaded.",
        problem: "Hundreds of documents arrive every month as PDFs, photos and screenshots. Someone types them in, and mistakes only show up after the books are closed: a misread tax ID, a short CAE, an invoice loaded twice, a withholding that doesn't match.",
        how: "The agent reads each document and validates the tax ID, the CAE, VAT, withholdings and duplicates. What is clean is ready; what is doubtful is flagged with the reason. With a bad photo it doesn't guess: it sends it to review. You approve and the firm's spreadsheet is filled.",
        result: "A spreadsheet with one row per document, totals in plain sight and a short list of what a person has to look at.",
        origin: "This is the base of an invoice reader that adapts to how each firm works. Suppliers and amounts in the demo are invented.",
      },
    },
  },
  {
    id: "monthly-docs",
    verticals: ["accounting"],
    slug: { es: "documentacion-del-mes", en: "monthly-documents" },
    copy: {
      es: {
        title: "Documentación del mes de tus clientes",
        blurb: "Checklist por cliente, recordatorio a medida que vos aprobás y un tablero de quién falta.",
        metaTitle: "Documentación del mes: checklist por cliente | Puna Tech",
        metaDescription: "Probá un checklist mensual por cliente: el agente detecta qué falta, arma el recordatorio y vos lo aprobás antes de enviarlo. Datos ficticios.",
        h1: "Dejá de pedir la documentación una y otra vez",
        mark: "una y otra vez",
        lead: "Cada cliente tiene su lista. El agente ve qué llegó y qué falta, redacta el pedido justo y lo manda cuando vos aprobás.",
        problem: "Cerrar el mes depende de que cada cliente mande facturas, extractos y novedades. Alguien tiene que acordarse de quién entregó qué, y salir a perseguir a los demás por WhatsApp o mail, cliente por cliente.",
        how: "El agente clasifica lo que sube cada cliente y lo cruza con su lista. Arma un recordatorio que nombra solo lo que falta. Vos lo revisás, lo editás si querés y lo aprobás. El tablero muestra quién no subió nada, a quién le falta algo y quién ya está completo.",
        result: "Un tablero claro del cierre y recordatorios a medida, sin que nadie lleve la cuenta de memoria.",
        origin: "Es la base de un tablero de documentación que se adapta a cómo trabaja cada estudio. Los clientes de la demo son inventados.",
      },
      en: {
        title: "Your clients' monthly documents",
        blurb: "A checklist per client, a tailored reminder you approve, and a board of who is missing what.",
        metaTitle: "Monthly documents: a checklist per client | Puna Tech",
        metaDescription: "Try a monthly document checklist per client: the agent finds what is missing, drafts the reminder and you approve it before it goes out. Fictional data.",
        h1: "Stop chasing the same documents every month",
        mark: "every month",
        lead: "Each client has their own list. The agent sees what arrived and what is missing, writes the exact request and sends it when you approve.",
        problem: "Closing the month depends on every client sending invoices, bank statements and staff changes. Someone has to remember who delivered what and chase the rest over WhatsApp or email, client by client.",
        how: "The agent classifies what each client uploads and matches it with their list. It drafts a reminder that names only what is missing. You review it, edit it if you like and approve it. The board shows who uploaded nothing, who is missing something and who is complete.",
        result: "A clear board for the close and tailored reminders, with nobody keeping count from memory.",
        origin: "This is the base of a documentation board that adapts to how each firm works. The clients in the demo are invented.",
      },
    },
  },
  {
    id: "policies-renewals",
    verticals: ["insurance"],
    slug: { es: "polizas-y-renovaciones", en: "policies-and-renewals" },
    copy: {
      es: {
        title: "Pólizas desde PDF y renovaciones",
        blurb: "La cartera se arma sola desde los PDF y las renovaciones del mes quedan con el aviso listo para aprobar.",
        metaTitle: "Pólizas desde PDF y renovaciones del mes | Puna Tech",
        metaDescription: "Probá cómo un productor de seguros arma la cartera desde los PDF de las pólizas y prepara los avisos de renovación del mes para aprobar. Datos ficticios.",
        h1: "Pólizas sin tipear y ninguna renovación olvidada",
        mark: "ninguna renovación olvidada",
        lead: "Subí los PDF de las pólizas. El agente arma la cartera, separa lo que vence este mes y deja el aviso listo para que lo apruebes.",
        problem: "Las pólizas llegan en PDF de cada compañía y alguien las pasa a mano a una planilla. Si el vencimiento se tipea mal o nadie mira la planilla a tiempo, la renovación se pierde y el cliente queda sin cobertura.",
        how: "El agente lee cada póliza (asegurado, ramo, compañía, número, vigencia y prima) y arma la cartera. Separa las que vencen en los próximos 30 días y redacta el aviso de renovación para cada asegurado. Vos lo editás si querés y lo aprobás. Si un escaneo no se lee bien, te pide confirmar la vigencia.",
        result: "Una cartera siempre al día y una lista de renovaciones del mes con el aviso listo, sin planillas a mano.",
        origin: "Es la base de una cartera con renovaciones que se adapta a cómo trabaja cada productor. La cartera, las compañías y los asegurados de la demo son inventados.",
      },
      en: {
        title: "Policies from PDF and renewals",
        blurb: "The portfolio builds itself from PDFs and this month's renewals come with a notice ready to approve.",
        metaTitle: "Policies from PDF and monthly renewals | Puna Tech",
        metaDescription: "See how an insurance broker builds a portfolio from policy PDFs and prepares this month's renewal notices for approval. Fictional data.",
        h1: "Policies without typing and no renewal forgotten",
        mark: "no renewal forgotten",
        lead: "Upload the policy PDFs. The agent builds the portfolio, separates what ends this month and leaves the notice ready for you to approve.",
        problem: "Policies arrive as PDFs from each insurer and someone copies them by hand into a spreadsheet. If an end date is mistyped or nobody checks the sheet in time, the renewal is lost and the client is left uncovered.",
        how: "The agent reads each policy (holder, line, insurer, number, term and premium) and builds the portfolio. It separates the ones ending in the next 30 days and drafts the renewal notice for each holder. You edit it if you like and approve it. If a scan is hard to read, it asks you to confirm the end date.",
        result: "A portfolio that is always current and a list of this month's renewals with the notice ready, no hand-made spreadsheets.",
        origin: "This is the base of a portfolio with renewals that adapts to how each broker works. The portfolio, insurers and policyholders in the demo are invented.",
      },
    },
  },
];

export const demosHubCopy = {
  es: {
    metaTitle: "Demos interactivas de automatización para pymes | Puna Tech",
    metaDescription: "Probá 10 demos de automatización para estudios, productores de seguros, inmobiliarias y comercios. Elegí tu rubro y mirá cómo funciona. Datos ficticios.",
    eyebrow: "Demos interactivas",
    h1: "Probalo antes de contratarlo",
    mark: "Probalo",
    lead: "Diez casos de automatización para pymes y estudios argentinos: nueve funcionan en tu navegador y uno es un video. En todos pasa lo mismo: el agente prepara, vos aprobás.",
    exampleNote: "Datos ficticios con fines de demostración. Las demos no envían nada a nadie.",
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
    metaDescription: "Try 10 automation demos for accounting firms, insurance brokers, real estate agencies and shops. Pick your industry and see how it works. Fictional data.",
    eyebrow: "Interactive demos",
    h1: "Try it before you hire it",
    mark: "Try it",
    lead: "Ten automation cases for Argentine small businesses and firms: nine run in your browser and one is a video. They all follow the same rule: the agent prepares, you approve.",
    exampleNote: "Fictional data for demonstration purposes. The demos send nothing to anyone.",
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
