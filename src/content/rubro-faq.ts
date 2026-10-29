import type { Locale } from "./chrome";
import type { RubroId } from "./rubros";

/**
 * FAQ shown on each rubro landing (visible section + FAQPage JSON-LD, same text in both).
 * Only facts already on the site: what the demos do, the 15-minute call, the written fixed-price
 * proposal, the 2-week window. No prices, metrics or clients. EN is a 1:1 translation of ES.
 */
export type FaqItem = [question: string, answer: string];

export const CM_REPO_URL = "https://github.com/mtfrat/convenio-multilateral-coeficiente";

const PRICE_ES: FaqItem = [
  "¿Cuánto cuesta y cuánto tarda?",
  "No hay precio de lista: después de una llamada gratuita de 15 minutos te damos una propuesta escrita con alcance, precio cerrado y fecha. Un proceso concreto se automatiza en 2 semanas cuando entra en ese plazo.",
];
const PRICE_ES_SHORT: FaqItem = [
  "¿Cuánto cuesta y cuánto tarda?",
  "Precio cerrado por escrito después de una llamada gratuita de 15 minutos; no hay precio de lista.",
];
const PRICE_EN: FaqItem = [
  "How much does it cost and how long does it take?",
  "There is no list price: after a free 15-minute call we send a written proposal with scope, a fixed price and a date. A specific process is automated in 2 weeks when it fits that window.",
];
const PRICE_EN_SHORT: FaqItem = [
  "How much does it cost and how long does it take?",
  "A fixed price in writing after a free 15-minute call; there is no list price.",
];

export const rubroFaq: Record<RubroId, Record<Locale, FaqItem[]>> = {
  accounting: {
    es: [
      ["¿Qué automatiza Puna Tech en un estudio contable?", "Tenemos tres demos: las facturas de compra de tus clientes pasan a planilla con alertas de CUIT, CAE, duplicados y percepciones; la documentación del mes se controla por cliente y el recordatorio queda listo para que lo apruebes; y las DDJJ de Convenio Multilateral se arman con retenciones conciliadas y archivos para SIFERE WEB. En todos los casos el agente prepara y el contador aprueba."],
      ["¿Hay que cambiar el sistema que usa el estudio?", "No. Conectamos la demo a tu planilla de carga, tu cartera de clientes y los formatos que ya usás."],
      ["¿Cómo se calcula el coeficiente unificado de Convenio Multilateral?", `En el Régimen General, el coeficiente de cada jurisdicción es 50 % según sus ingresos computables sobre el total y 50 % según sus gastos computables sobre el total, redondeado a cuatro decimales. Publicamos una calculadora, un validador y una planilla gratis y de código abierto: ${CM_REPO_URL} (la normativa está citada en el repositorio). Es una ayuda para el cálculo y no reemplaza al profesional.`],
      PRICE_ES,
      ["¿Los datos de las demos son reales?", "No. Son datos ficticios y nada se envía a nadie desde tu navegador."],
    ],
    en: [
      ["What does Puna Tech automate in an accounting firm?", "We have three demos: your clients' purchase invoices move into a spreadsheet with alerts for tax ID, CAE, duplicates and withholdings; the monthly documents are checked per client and the reminder is ready for you to approve; and Convenio Multilateral returns are prepared with reconciled withholdings and files for SIFERE WEB. In every case the agent prepares and the accountant approves."],
      ["Does the firm have to change its current system?", "No. We connect the demo to your intake spreadsheet, your client list and the formats you already use."],
      ["How is the unified Convenio Multilateral coefficient calculated?", `Under the General Regime, each jurisdiction's coefficient is 50% based on its computable income over the total and 50% based on its computable expenses over the total, rounded to four decimals. We publish a free, open-source calculator, validator and spreadsheet: ${CM_REPO_URL} (the regulations are cited in the repository). It supports the calculation and does not replace the professional.`],
      PRICE_EN,
      ["Is the demo data real?", "No. The data is fictional and nothing is sent to anyone from your browser."],
    ],
  },
  legal: {
    es: [
      ["¿Qué se puede probar hoy?", "Dos demos: consultas ordenadas por prioridad y cobro de honorarios sin perseguir a nadie. El agente prepara el mensaje y el abogado lo aprueba antes de que salga."],
      ["¿Avisan a los clientes las novedades de cada causa?", "Todavía no tenemos una demo propia de eso. La base existe (leer lo que cambió y redactar el mensaje para aprobar) y se arma a medida para cada estudio."],
      ["¿Hay que cambiar de sistema?", "No. La demo se conecta a tu agenda, tus consultas entrantes y tu planilla de honorarios."],
      PRICE_ES_SHORT,
    ],
    en: [
      ["What can I try today?", "Two demos: inquiries sorted by priority, and fee collection without chasing anyone. The agent drafts the message and the lawyer approves it before it goes out."],
      ["Do you notify clients about case updates?", "We don't have a dedicated demo for that yet. The base exists (read what changed and draft the message for approval) and it is built to measure for each firm."],
      ["Do we have to change systems?", "No. The demo connects to your calendar, your incoming inquiries and your fee spreadsheet."],
      PRICE_EN_SHORT,
    ],
  },
  insurance: {
    es: [
      ["¿Qué hace la demo para productores?", "Lee los PDF de las pólizas, arma la cartera y prepara los avisos de renovación del mes para que los apruebes."],
      ["¿Funciona con los PDF de mis compañías?", "La demo muestra la lectura de documentos; la ajustamos a los PDF de las compañías con las que trabajás, a tu cartera y a tus avisos."],
      ["¿Hay que cambiar de sistema?", "No: primero conectamos lo que ya usás."],
      PRICE_ES_SHORT,
    ],
    en: [
      ["What does the demo do for insurance brokers?", "It reads policy PDFs, builds the portfolio and prepares this month's renewal notices for you to approve."],
      ["Does it work with my insurers' PDFs?", "The demo shows the document reading; we tune it to the PDFs of the insurers you work with, your portfolio and your notices."],
      ["Do we have to change systems?", "No: we connect what you already use first."],
      PRICE_EN_SHORT,
    ],
  },
  "real-estate": {
    es: [
      ["¿Qué se puede probar hoy?", "Consultas puntuadas con IA, con reglas que se pueden leer, y cobro de alquileres sin perseguir a nadie. El agente deja la respuesta o el aviso listo y vos aprobás."],
      ["¿Calculan el ajuste de alquileres?", "Todavía no hay una demo propia. Se arma a medida sobre la misma base: calcula el ajuste, redacta el aviso y espera tu aprobación."],
      ["¿Se conecta con los portales y WhatsApp?", "Se conecta a los portales, la planilla de contratos y los recordatorios de cobro que ya usás."],
      PRICE_ES_SHORT,
    ],
    en: [
      ["What can I try today?", "Inquiries scored by AI with rules you can read, and rent collection without chasing anyone. The agent leaves the reply or the notice ready and you approve."],
      ["Do you calculate rent adjustments?", "There is no dedicated demo yet. It is built to measure on the same base: it calculates the adjustment, drafts the notice and waits for your approval."],
      ["Does it connect to property portals and WhatsApp?", "It connects to the portals, the contracts spreadsheet and the payment reminders you already use."],
      PRICE_EN_SHORT,
    ],
  },
  clinics: {
    es: [
      ["¿Qué se puede probar hoy?", "La liquidación de horas y sueldos del equipo: alertas de salida faltante y horas extra, y una liquidación que aprobás antes de pagar."],
      ["¿Hacen el seguimiento de autorizaciones de obras sociales?", "Todavía no hay demo propia. La base existe (un tablero de pedidos y avisos al paciente que vos aprobás) y se arma a medida para cada clínica."],
      ["¿Hay que cambiar de sistema?", "No: se conecta a tu agenda, tus planillas y las obras sociales con las que trabajás."],
      PRICE_ES_SHORT,
    ],
    en: [
      ["What can I try today?", "Team hours and payroll: alerts for missing clock-outs and overtime, and a payroll preview you approve before paying."],
      ["Do you track health insurer authorizations?", "There is no dedicated demo yet. The base exists (a request board and patient notices that you approve) and it is built to measure for each clinic."],
      ["Do we have to change systems?", "No: it connects to your calendar, your spreadsheets and the health insurers you work with."],
      PRICE_EN_SHORT,
    ],
  },
};
