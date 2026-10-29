import type { UseCaseContent } from "./use-cases.ts";

/**
 * Long-tail landings by rubro (estudios contables, estudios jurídicos, productores de seguros).
 * Source: SEO/UX briefs of 2026-10-29. Rules that apply to every page here:
 * - Only claim what exists today: the free tools (/es/herramientas) and the demos (datos ficticios). Everything else is "a medida".
 * - No invented clients, people, figures, hours or prices. No amounts that change every year (SSN matrícula).
 * - Regulatory facts carry a link to the official source and a "Revisado el" date. The page informs; the professional decides.
 * - Legal pages (jurídicos) never promise deadlines: "el profesional confirma los plazos".
 */

export const RUBRO_REVIEWED_AT = "29/10/2026";
const UPDATED_AT = "2026-10-29";
const costFaq = (detail: string): [string, string] => [
  "¿Cuánto tarda y cuánto cuesta?",
  `La propuesta es automatizar un proceso en 2 semanas a precio cerrado. El precio depende de ${detail}. Lo acordamos por escrito antes de empezar, después de una llamada de 15 minutos. No publicamos precios en la web porque cada proceso es distinto.`,
];

const BLOG = {
  cm: { path: "/es/blog/automatizar-ddjj-convenio-multilateral-sifere", title: "Cómo automatizar las DDJJ de Convenio Multilateral y SIFERE" },
  conc: { path: "/es/blog/conciliar-retenciones-percepciones-iibb-sin-excel", title: "Conciliar retenciones y percepciones de IIBB sin Excel" },
  venc: { path: "/es/blog/controlar-vencimientos-procesales-estudio-juridico", title: "Cómo controlar los vencimientos procesales en un estudio jurídico" },
  renov: { path: "/es/blog/automatizar-renovaciones-cobranzas-productor-seguros", title: "Automatizar renovaciones y cobranzas en una productora de seguros" },
};
const SERVICE = { path: "/es/servicios/software-a-medida", title: "Software a medida" };
const AUTOMATION = { path: "/es/servicios/automatizacion-ia", title: "Automatización de procesos con IA" };
const DEMO_ACC = { path: "/es/demos/para/estudios-contables", title: "Demos para estudios contables" };
const DEMO_LEGAL = { path: "/es/demos/para/estudios-juridicos", title: "Demos para estudios jurídicos" };
const DEMO_INS = { path: "/es/demos/para/productores-de-seguros", title: "Demos para productores de seguros" };
const HOURS_TOOL = { path: "/es/herramientas/calculadora-horas-ahorradas", title: "Calculadora de horas ahorradas" };

const CA = {
  convenio: { label: "Convenio Multilateral 18.8.77, arts. 2, 3 y 5 (Comisión Arbitral)", href: "https://www.ca.gob.ar/convenio" },
  rg10: { label: "RG CA 10/2019: aplicación del art. 5 (coeficiente unificado, ajuste del cuarto anticipo, inicio de actividades)", href: "https://www.ca.gob.ar/resoluciones/resoluciones/gr/2019/2019-10.pdf" },
  rg20: { label: "RG CA 20/2025: vencimientos CM03/CM04 2026 y CM05 del período fiscal 2025", href: "https://www.ca.gob.ar/descargas/sifere/vencimientos/2025-20.pdf" },
  rg46: { label: "RG CA 46/1993: coeficientes con cuatro decimales (Ordenamiento de RG, Infoleg)", href: "https://servicios.infoleg.gob.ar/infolegInternet/anexos/105000-109999/105409/norma.htm" },
  faqDdjj: { label: "Comisión Arbitral: preguntas frecuentes SIFERE WEB DDJJ", href: "https://www.ca.gob.ar/preguntas-frecuentes/sistemas/sifere/sifere-web-ddjj" },
  ev27: { label: "Mesa de Ayuda SIFERE: carga de coeficientes unificados (Evento 27)", href: "https://www.ca.gob.ar/descargas/faqs/sifere/MesaAyuda_sifere_Carga_Coeficientes_Unificados_Evento27.pdf" },
  ev32: { label: "Mesa de Ayuda SIFERE: resumen del período fiscal y determinación de coeficientes en el CM05 (Evento 32)", href: "https://www.ca.gob.ar/descargas/faqs/sifere/MesaAyuda_Sifere_Carga_Resumen_Periodo_Fiscal%20_Determina_Coef_CM05_Evento_32.pdf" },
  cm05: { label: "Comisión Arbitral (SUM@): ayuda práctica para la declaración jurada anual CM05", href: "https://webs.comarb.gob.ar/suma/public.pl?Action=PublicFAQPrint&ItemID=107" },
  faqSifere: { label: "Comisión Arbitral: preguntas frecuentes SIFERE (DDJJ y Consultas)", href: "https://www.ca.gob.ar/preguntas-frecuentes/sistemas/sifere" },
  consultas: { label: "Comisión Arbitral: SIFERE WEB Consultas", href: "https://www.ca.gob.ar/preguntas-frecuentes/sistemas/sifere/sifere-web-consultas" },
  deducciones: { label: "Comisión Arbitral: Módulo Deducciones de SIFERE (Eventos 43 a 56)", href: "https://www.ca.gob.ar/preguntas-frecuentes/sistemas/sifere/modulo-deducciones" },
  sircreb: { label: "Comisión Arbitral: ¿cómo se deducen las recaudaciones bancarias? (SIRCREB)", href: "https://www.ca.gob.ar/preguntas-frecuentes/sistemas/sircreb/como-se-deducen-las-recaudaciones-bancarias" },
};

const STANDARD_DISCLAIMER = "Esta página informa y no es asesoramiento legal ni contable. La presentación, el pago y las decisiones las toma el profesional: el sistema prepara y vos aprobás.";
const LEGAL_DISCLAIMER = "Esta página informa y no es asesoramiento jurídico. No promete ni garantiza plazos procesales: el profesional confirma siempre los plazos y los vencimientos contra la norma y las acordadas de su tribunal. Un sistema puede recordar fechas que vos cargás; no las determina con valor legal.";
const DEMO_BODY = "Todo con datos ficticios, sin enviar nada a nadie.";

export const rubroUseCases: UseCaseContent[] = [];

/* ───────────────────────── 1. Convenio Multilateral: coeficientes ───────────────────────── */
rubroUseCases.push({
  key: "cm-coeficientes",
  path: "/es/automatizaciones/convenio-multilateral-coeficientes",
  updatedAt: UPDATED_AT,
  section: "automatizaciones",
  eyebrow: "Estudios contables · Convenio Multilateral",
  title: "Convenio Multilateral: coeficientes, CM03 y CM05 sin planillas a mano",
  lead: "Llega el CM05 y toca rehacer, cliente por cliente, ventas por jurisdicción, gastos, coeficientes que tienen que sumar 1 y el ajuste de abril. Acá te explicamos cómo se calcula, con las normas a la vista, y qué podemos dejar armado a medida para que revises y presentes vos. Mirá también las [demos para estudios contables](/es/demos/para/estudios-contables).",
  metaTitle: "Cálculo de coeficientes de Convenio Multilateral | Puna Tech",
  metaDescription: "Cómo se calculan los coeficientes de Convenio Multilateral, el ajuste de abril y el CM05, y cómo automatizarlo para tus clientes. Diagnóstico en 15 min.",
  serviceType: "Convenio Multilateral: coeficientes",
  ogImage: "/og/automatizaciones-convenio-multilateral-coeficientes.png",
  ogImageAlt: "Puna Tech: coeficientes de Convenio Multilateral, CM03 y CM05 para estudios contables.",
  cardTitle: "Convenio Multilateral: coeficientes",
  cardBlurb: "Cómo se calculan los coeficientes, el ajuste de abril y el CM05, con las normas a la vista y una calculadora gratis.",
  example: "Un estudio con varios clientes de Convenio Multilateral arma, para cada uno, una planilla con las ventas por jurisdicción, los gastos y los coeficientes. Cuando una jurisdicción cambia o el balance llega tarde, hay que rehacer el cálculo y volver a controlar que todo cierre.",
  before: [
    "Ventas que hay que bajar del sistema de facturación y repartir por jurisdicción, cliente por cliente.",
    "Gastos que cambian de jurisdicción de un año a otro y coeficientes que no suman 1.",
    "Una jurisdicción activa en Padrón Web que falta en la planilla.",
    "El ajuste de abril recalculado a mano, jurisdicción por jurisdicción y actividad por actividad.",
  ],
  after: [
    "Una calculadora gratis resuelve el coeficiente del régimen general desde los ingresos y los gastos que cargás.",
    "A medida, el cálculo sale de las planillas de cada cliente, con los controles antes de presentar.",
    "El papel de trabajo queda listo para que lo revises y lo firmes.",
    "Vos presentás en SIFERE WEB con tu clave fiscal: la declaración nunca la presentamos nosotros.",
  ],
  sections: [
    {
      heading: "Cómo se calculan los coeficientes (régimen general, art. 2)",
      paragraphs: [
        "El Convenio reparte los ingresos brutos así: 50 % según los gastos efectivamente soportados en cada jurisdicción y 50 % según los ingresos atribuibles a cada una (art. 2). Qué gastos computan lo define el art. 3.",
        "Para llegar al número se suman el coeficiente de ingresos y el de gastos de cada jurisdicción y se divide por 2. El resultado lleva cuatro decimales (0,0000), con redondeo (RG CA 46/1993), y el total tiene que dar 1: SIFERE valida que la suma sea 1 o 0.",
        "Se usa el último balance cerrado en el año calendario anterior. Si no se practican balances comerciales, los ingresos y gastos del año calendario anterior (art. 5 y RG CA 10/2019). Las sociedades de la Ley 19.550 trabajan con estados contables en moneda constante, según la FAQ oficial (Evento 18).",
        "Los regímenes especiales (arts. 6 a 13) se atribuyen distinto, y el criterio con que se asigna cada gasto lo define el contador.",
      ],
    },
    {
      heading: "Dónde se cargan: CM05, tabla de coeficientes y CM03",
      paragraphs: [
        "El CM05 anual se completa en SIFERE WEB: resumen del período fiscal y determinación de coeficientes, con planillas Excel que se importan («Seleccionar archivo» y «Procesar archivo»). El sistema muestra las jurisdicciones activas según Padrón Web; si hay que corregirlas, se hace en Padrón Web o en el Padrón Federal de ARCA (Evento 32).",
        "En la Tabla Auxiliar de Coeficientes se cargan los del último CM05 antes de armar el CM03 (Evento 27).",
        "Los CM03 y CM04 de 2026 vencen según el dígito verificador del CUIT, y el CM05 del período 2025 venció el 30/06/2026 (RG CA 20/2025). La Comisión Arbitral publica el calendario del año siguiente cada diciembre: consultalo en la fuente.",
      ],
    },
    {
      heading: "Enero a marzo y el ajuste de abril",
      paragraphs: [
        "La regla general es usar los coeficientes del último balance. Solo si al presentar el primer anticipo no se puede contar con esa información, se aplican los del año anterior en los tres primeros anticipos y se ajusta en el cuarto (RG CA 10/2019).",
        "En SIFERE WEB el ajuste va en el campo «Ajuste» de «Actividades por Jurisdicción», por jurisdicción y por actividad, en la DDJJ de abril. No va dentro de la base imponible y no se rectifican enero, febrero ni marzo (Evento 25). Puede ser positivo o negativo.",
        "Es uno de los cálculos más tediosos de hacer a mano, cliente por cliente.",
      ],
    },
    {
      heading: "Primer año o jurisdicción nueva: artículo 14 y coeficiente 0",
      paragraphs: [
        "Si no hay coeficientes de distribución, porque es el primer año en el régimen general del art. 2 o la jurisdicción es nueva, SIFERE WEB pide tildar «Artículo 14» y cargar 0 donde corresponda (Evento 26).",
        "Si se da de alta una jurisdicción después de generar el borrador del CM03, hay que eliminar el borrador, generar una tabla de coeficientes nueva y crear la DDJJ de nuevo (Evento 275). Cada caso tiene matices y los define el contador.",
      ],
    },
  ],
  howTitle: "Qué hay hoy y qué armamos a medida",
  how: [
    {
      title: "Hoy, gratis: la calculadora del coeficiente",
      body: "La [calculadora de coeficientes de Convenio Multilateral](/es/herramientas/coeficiente-convenio-multilateral) toma los ingresos y los gastos computables que cargás por jurisdicción y calcula el coeficiente del régimen general (art. 2), con 4 decimales y la verificación de la suma. Solo eso: no cubre los regímenes especiales, el artículo 14, los anticipos ni el ajuste de abril.",
    },
    {
      title: "Hoy, en video: la demo con datos ficticios",
      body: "La [demo de Convenio Multilateral](/es/demos/convenio-multilateral) es un video de 34 segundos con datos ficticios: una cartera de clientes, ventas y retenciones conciliadas, el reparto por jurisdicción con los coeficientes unificados ya cargados, alertas antes de presentar y archivos XML o Excel para SIFERE WEB con el papel de trabajo. En la demo los coeficientes se cargan; no se calculan desde los gastos y los ingresos.",
    },
    {
      title: "A medida: lo que armamos sobre tus planillas",
      body: "Lo armamos a medida para tu estudio, no viene hecho: leer la planilla de ventas o el export del sistema de facturación, calcular los coeficientes desde los ingresos y los gastos de cada cliente, el ajuste de abril y el recálculo anual del CM05. Más los controles antes de presentar (que los coeficientes sumen 1, que estén todas las jurisdicciones activas, que ventas y gastos coincidan con el balance) y los archivos de importación. Esos archivos los validamos con datos reales tuyos antes de usarlos.",
    },
    {
      title: "Qué queda de tu lado",
      body: "Revisás, firmás y presentás en SIFERE WEB con tu clave fiscal. Para empezar necesitamos la planilla de ventas de un cliente real (anonimizada si preferís), el CM05 anterior, las jurisdicciones y cómo atribuyen los gastos. El cruce con las deducciones está en [conciliación de retenciones y percepciones de SIFERE](/es/automatizaciones/conciliacion-sifere-retenciones-percepciones). Los gastos y las compras de cada cliente alimentan el coeficiente de gastos: mirá [carga de facturas de proveedores](/es/automatizaciones/carga-de-facturas-proveedores).",
    },
  ],
  demoLinks: {
    title: "Probalo antes de contratarlo",
    body: DEMO_BODY,
    links: [
      { label: "Mirá cómo funciona en 34 segundos", path: "/es/demos/convenio-multilateral", note: "Demo en video: Convenio Multilateral / DDJJ SIFERE" },
      { label: "Calculadora gratis del coeficiente", path: "/es/herramientas/coeficiente-convenio-multilateral", note: "Régimen general, art. 2" },
      { label: "Demos para estudios contables", path: DEMO_ACC.path, note: "Facturas, documentación del mes y más" },
    ],
  },
  fit: [
    "Liquidás Convenio Multilateral para varios clientes y cada uno vive en su propia planilla.",
    "Cada abril rehacés a mano el ajuste de coeficientes.",
    "Ya tuviste coeficientes que no sumaban 1 o una jurisdicción activa que faltaba al presentar.",
  ],
  faqs: [
    ["¿Cómo se calcula el coeficiente unificado de Convenio Multilateral?", "En el régimen general (artículo 2), los ingresos brutos se distribuyen 50 % según los gastos efectivamente soportados en cada jurisdicción y 50 % según los ingresos atribuibles a cada una. Se calcula un coeficiente de gastos y uno de ingresos por jurisdicción, se promedian y el resultado lleva cuatro decimales. Los de todas las jurisdicciones suman 1. Los regímenes especiales (artículos 6 a 13) se atribuyen distinto."],
    ["¿Qué balance se usa para calcular los coeficientes?", "El último balance cerrado en el año calendario inmediato anterior. Si no se practican balances comerciales, los ingresos y gastos del año calendario inmediato anterior (artículo 5 del Convenio y RG CA 10/2019). Las sociedades regidas por la Ley de Sociedades Comerciales usan estados contables en moneda constante, según lo que indica la Comisión Arbitral."],
    ["¿Qué pasa de enero a marzo si todavía no tengo los coeficientes nuevos?", "Si al presentar el primer anticipo no se puede contar con la información del último balance, se usan los coeficientes del año anterior en los tres primeros anticipos y en el cuarto, el de abril, se hace el ajuste. En SIFERE WEB va en el campo «Ajuste» de «Actividades por Jurisdicción» y no se rectifican las DDJJ de enero, febrero y marzo."],
    ["¿Y si recién empecé a operar o sumé una jurisdicción?", "Si no tenés coeficientes de distribución, porque es tu primer año en el régimen general del artículo 2 o la jurisdicción es nueva, SIFERE WEB pide tildar «Artículo 14» y cargar 0 en las jurisdicciones que correspondan. Cada caso tiene matices (fecha de alta, tipo de actividad), y los define el contador."],
    ["¿Se puede automatizar el cálculo de coeficientes y la carga en SIFERE WEB?", "Sí, a medida. Hoy hay una calculadora gratis que calcula el coeficiente del régimen general con los ingresos y los gastos que cargás, y una demo en video con datos ficticios que muestra el reparto por jurisdicción y los archivos para SIFERE WEB. El cálculo desde tus planillas, el ajuste de abril y los archivos de importación los armamos a medida de tu estudio. La declaración la revisás y la presentás vos."],
    costFaq("cuántos clientes, fuentes de datos y reglas entran"),
  ],
  sources: [CA.convenio, CA.rg10, CA.rg20, CA.rg46, CA.faqDdjj, CA.ev27, CA.ev32, CA.cm05],
  reviewedAt: RUBRO_REVIEWED_AT,
  disclaimer: STANDARD_DISCLAIMER,
  relatedLinks: [
    { path: "/es/automatizaciones/conciliacion-sifere-retenciones-percepciones", title: "Conciliación de retenciones y percepciones de SIFERE" },
    { path: "/es/automatizaciones/carga-de-facturas-proveedores", title: "Carga de facturas de proveedores" },
    { path: "/es/demos/facturas-de-clientes", title: "Demo: facturas de compra de tus clientes" },
    DEMO_ACC,
    { path: "/es/herramientas/coeficiente-convenio-multilateral", title: "Calculadora gratis de coeficientes de Convenio Multilateral" },
    SERVICE,
  ],
  relatedService: AUTOMATION,
  relatedPosts: [BLOG.cm],
});

/* ───────────────────────── 2. Conciliación SIFERE ───────────────────────── */
rubroUseCases.push({
  key: "sifere-conciliacion",
  path: "/es/automatizaciones/conciliacion-sifere-retenciones-percepciones",
  updatedAt: UPDATED_AT,
  section: "automatizaciones",
  eyebrow: "Estudios contables · SIFERE",
  title: "Conciliación SIFERE: retenciones, percepciones y SIRCREB contra tus papeles",
  lead: "El módulo Deducciones de SIFERE WEB te trae retenciones, percepciones y recaudaciones bancarias, pero no siempre trae todo ni a tiempo. Acá va cómo se concilia con tus extractos y tus certificados, qué dice la Comisión Arbitral y qué podemos armar para que el estudio solo revise lo que no cierra. Mirá las [demos para estudios contables](/es/demos/para/estudios-contables).",
  metaTitle: "Conciliar retenciones y percepciones en SIFERE | Puna Tech",
  metaDescription: "Retenciones, percepciones y SIRCREB de SIFERE contra tus extractos y certificados: cómo conciliarlas y automatizarlo en tu estudio. Diagnóstico en 15 min.",
  serviceType: "Conciliación de retenciones y percepciones SIFERE",
  ogImage: "/og/automatizaciones-conciliacion-sifere-retenciones-percepciones.png",
  ogImageAlt: "Puna Tech: conciliación de retenciones, percepciones y SIRCREB de SIFERE para estudios contables.",
  cardTitle: "Conciliación de retenciones y percepciones SIFERE",
  cardBlurb: "Retenciones, percepciones y SIRCREB de SIFERE cruzadas con extractos y certificados. Lo que no cierra queda para revisar.",
  example: "Un estudio carga las deducciones de un cliente en SIFERE y tiene que verificar que estén todas: las que informaron los agentes, las del banco y las de los certificados que mandó el cliente. Se cruzan a mano, renglón por renglón, y lo que no coincide se descubre cuando ya se está por presentar.",
  before: [
    "Una retención que está en el certificado del cliente pero no en SIRCAR.",
    "Un agente que todavía no informó, o una retención del mes siguiente.",
    "La misma deducción cargada a mano y también por el módulo.",
    "Importes que difieren por redondeo o por una jurisdicción mal asignada.",
  ],
  after: [
    "El export del módulo Deducciones, el extracto y los certificados se cruzan por CUIT del agente, fecha, jurisdicción e importe.",
    "Lo que coincide queda conciliado; lo que no, queda en una lista con los candidatos para que el estudio elija.",
    "Lo dudoso nunca se da por bueno.",
    "Nada se carga en SIFERE sin tu OK.",
  ],
  sections: [
    {
      heading: "Qué trae SIFERE WEB y qué no",
      paragraphs: [
        "El módulo Consultas muestra las recaudaciones bancarias (SIRCREB), las percepciones aduaneras (SIRPEI) y las retenciones y percepciones informadas por los agentes de SIRCAR. La Comisión Arbitral aclara que no están todas las jurisdicciones ni todos los agentes: lo que falta se consulta a cada jurisdicción.",
        "Se accede con clave fiscal de ARCA, con los servicios «Convenio Multilateral – SIFERE WEB – Consultas» y «– DDJJ». Revisá en la fuente qué jurisdicciones están adheridas: esa lista cambia.",
      ],
    },
    {
      heading: "Cuándo aparece cada deducción",
      paragraphs: [
        "Según la Comisión Arbitral y de forma aproximada: SIRCREB desde el día 5 de cada mes, SIRPEI desde el 6, retenciones y percepciones de SIRCAR desde el 9 y SIRTAC alrededor del 12. Son fechas de referencia, no garantizadas.",
        "Si cerrás el CM03 antes de esas fechas, la conciliación se hace en dos pasadas. Los vencimientos 2026 están en la RG CA 20/2025: cada diciembre la Comisión publica el calendario del año siguiente.",
      ],
    },
    {
      heading: "El módulo Deducciones, paso a paso",
      paragraphs: [
        "Con el CM03 en borrador: Datos a Nivel País, Carga de Deducciones. Muestra solo las del mismo mes del anticipo; las de meses anteriores se agregan a mano si la jurisdicción lo permite (Evento 54).",
        "Se puede sumar por ingreso manual o por lotes, eliminar y cargar de cero, y recién con «Incluir Deducciones en DJ» pasan a la declaración (Eventos 46 a 51). Se verifica en «Datos de Deducciones» (Evento 48).",
        "Abajo hay una opción para exportar la deducción y compararla con extractos o archivos propios (Evento 45). Ahí empieza la conciliación.",
      ],
    },
    {
      heading: "SIRCREB: del extracto al coeficiente por jurisdicción",
      paragraphs: [
        "El banco marca los débitos como «Régimen Sistema SIRCREB» en el resumen de cuenta. Con el CUIT y el período se consultan los coeficientes de distribución en el Módulo Contribuyentes de SIRCREB, se aplican a la suma de los débitos y se deduce por jurisdicción en la DDJJ del anticipo en que se sufrió el débito, en «Deducciones – Recaudaciones Bancarias».",
        "El extracto es la otra mitad del cruce: mirá cómo lo resolvemos en [conciliación bancaria](/es/automatizaciones/conciliacion-bancaria).",
      ],
    },
  ],
  howTitle: "Qué hay hoy y qué armamos a medida",
  how: [
    {
      title: "Hoy: la demo con datos ficticios",
      body: "La [demo de Convenio Multilateral](/es/demos/convenio-multilateral) es un video de 34 segundos con datos ficticios. Muestra una cartera de clientes con las ventas y las retenciones conciliadas, el reparto por jurisdicción y las alertas antes de presentar. No muestra el cruce del módulo Deducciones de SIFERE contra extractos y certificados.",
    },
    {
      title: "A medida: el cruce de tus papeles",
      body: "Lo armamos a medida: leemos la exportación del módulo Deducciones, el extracto y los certificados o la planilla del cliente, y los cruzamos por CUIT del agente, fecha, jurisdicción e importe. Lo que coincide queda conciliado. Lo que no, queda en una lista con los candidatos para que el estudio elija, con el mismo criterio de la conciliación bancaria: lo dudoso nunca se da por bueno. Dejamos el papel de trabajo por cliente. Un archivo para la carga por lotes del módulo se puede evaluar, pero primero hay que confirmar el formato oficial con datos reales.",
    },
    {
      title: "Qué necesitamos de tu lado",
      body: "Una exportación real del módulo Deducciones de un cliente, su extracto y los certificados de retención o la planilla donde los llevás (anonimizados si preferís), y alguien del estudio que sepa cómo decide cuando algo no cierra. Los coeficientes que alimentan la DDJJ están en [coeficientes de Convenio Multilateral](/es/automatizaciones/convenio-multilateral-coeficientes). Si hay que pedirle a un cliente un certificado o un extracto que falta, mirá la [demo de documentación del mes](/es/demos/documentacion-del-mes).",
    },
  ],
  demoLinks: {
    title: "Probalo antes de contratarlo",
    body: DEMO_BODY,
    links: [
      { label: "Mirá la demo de Convenio Multilateral", path: "/es/demos/convenio-multilateral", note: "Video de 34 segundos" },
      { label: "Demos para estudios contables", path: DEMO_ACC.path, note: "Facturas, documentación del mes y más" },
      { label: "Calculadora de horas ahorradas", path: HOURS_TOOL.path, note: "Una estimación con tus propios datos" },
    ],
  },
  fit: [
    "Cruzás las retenciones de SIFERE contra el extracto y los certificados a mano.",
    "Te encontraste con una retención que no estaba en el módulo cuando ya cerraste el anticipo.",
    "Cada cliente lleva sus certificados en un formato distinto.",
  ],
  faqs: [
    ["¿Dónde veo las retenciones y percepciones en SIFERE WEB?", "En el módulo Consultas, con el servicio «Convenio Multilateral – SIFERE WEB – Consultas» y tu clave fiscal, ves el detalle de retenciones y percepciones que informaron los agentes de SIRCAR, además de las recaudaciones bancarias (SIRCREB) y las percepciones aduaneras (SIRPEI). Cuando armás una DDJJ, las del mes aparecen en «Carga de Deducciones»."],
    ["¿Por qué no me aparecen todas mis retenciones en SIFERE?", "Porque SIFERE solo muestra lo que informan los agentes en los sistemas de la Comisión Arbitral. La propia Comisión aclara que no están todas las jurisdicciones ni todos los agentes en SIRCAR. Lo que falte se carga a mano o por lotes y, ante la duda, se consulta a la jurisdicción."],
    ["¿Cuándo aparecen las deducciones en el módulo?", "Según la Comisión Arbitral, de forma aproximada: las recaudaciones bancarias (SIRCREB) desde el día 5 de cada mes, las percepciones aduaneras (SIRPEI) desde el 6, las retenciones y percepciones de SIRCAR desde el 9 y las de SIRTAC alrededor del 12. Son fechas de referencia, no garantizadas."],
    ["¿Cómo se deducen las recaudaciones bancarias (SIRCREB)?", "El banco las identifica en el resumen de cuenta como «Régimen Sistema SIRCREB». Con el CUIT y el período consultás en SIRCREB los coeficientes de distribución, los aplicás a la suma de los débitos y deducís el resultado por jurisdicción en la DDJJ del anticipo del mes en que se sufrió el débito."],
    ["¿Se puede comparar lo que trae SIFERE con mis extractos y archivos?", "Sí. En «Carga de Deducciones» hay una opción para exportar la información y compararla con extractos u otros archivos. Ese cruce es lo que armamos a medida: el sistema propone y marca las diferencias, y el estudio decide."],
    ["¿Qué necesitamos de tu lado para armarlo?", "Una exportación real del módulo Deducciones de un cliente, su extracto bancario y los certificados de retención o la planilla donde los llevás (anonimizados si preferís), más alguien del estudio que sepa cómo se resuelve cuando algo no cierra. El plazo y el precio los vemos en la llamada de 15 minutos."],
  ],
  sources: [CA.faqSifere, CA.consultas, CA.deducciones, CA.sircreb, CA.rg20, CA.faqDdjj],
  reviewedAt: RUBRO_REVIEWED_AT,
  disclaimer: STANDARD_DISCLAIMER,
  relatedLinks: [
    { path: "/es/automatizaciones/convenio-multilateral-coeficientes", title: "Coeficientes de Convenio Multilateral" },
    { path: "/es/automatizaciones/conciliacion-bancaria", title: "Conciliación bancaria" },
    { path: "/es/demos/convenio-multilateral", title: "Demo: Convenio Multilateral / DDJJ SIFERE" },
    { path: "/es/demos/documentacion-del-mes", title: "Demo: documentación del mes de tus clientes" },
    DEMO_ACC,
    SERVICE,
  ],
  relatedService: AUTOMATION,
  relatedPosts: [BLOG.conc, BLOG.cm],
});

/* ───────────────────────── 3. Control de expedientes ───────────────────────── */
rubroUseCases.push({
  key: "legal-expedientes",
  path: "/es/automatizaciones/control-de-expedientes-estudio-juridico",
  updatedAt: UPDATED_AT,
  section: "automatizaciones",
  eyebrow: "Estudios jurídicos · Expedientes",
  title: "Control de expedientes y vencimientos: del Excel a un sistema con avisos",
  lead: "La planilla de expedientes funciona hasta que alguien no la mira un día. Te contamos cómo armarla bien, dónde se queda corta y qué cambia cuando los vencimientos y los avisos a clientes dejan de depender de la memoria de alguien del estudio. Mirá también las [demos para estudios jurídicos](/es/demos/para/estudios-juridicos).",
  metaTitle: "Control de expedientes en Excel o con sistema | Puna Tech",
  metaDescription: "Cómo llevar el control de expedientes y vencimientos en Excel, cuándo conviene dejar la planilla y cómo automatizar los avisos. Diagnóstico en 15 min.",
  serviceType: "Control de expedientes para estudios jurídicos",
  ogImage: "/og/automatizaciones-control-de-expedientes-estudio-juridico.png",
  ogImageAlt: "Puna Tech: control de expedientes y vencimientos para estudios jurídicos, del Excel a un sistema con avisos.",
  cardTitle: "Control de expedientes para estudios jurídicos",
  cardBlurb: "Cómo armar bien la planilla de expedientes, cuándo deja de alcanzar y qué avisos armamos a medida. Sin promesas sobre plazos.",
  example: "Un estudio lleva sus causas en una planilla compartida. Un día entra una novedad, quien lleva la causa no está y nadie más mira la hoja: el aviso al cliente sale tarde y el vencimiento lo sabe una sola persona.",
  before: [
    "Te enterás de una novedad de la causa por el cliente.",
    "Hay dos versiones de la planilla y nadie sabe cuál es la buena.",
    "El vencimiento lo sabe una sola persona.",
    "Las consultas por WhatsApp no tienen dueño.",
  ],
  after: [
    "Una base única de causas, que arranca desde tu planilla, con vencimientos y responsables.",
    "Avisos al abogado responsable con la anticipación que definas, a medida.",
    "Consultas ordenadas por prioridad con reglas visibles.",
    "Todo lo que sale hacia un cliente lo aprueba el abogado.",
  ],
  sections: [
    {
      heading: "Qué tiene que tener una planilla de expedientes",
      paragraphs: [
        "Una fila por expediente y una hoja aparte de vencimientos. Es lo que pide quien busca cómo armarla, y te sirve aunque no nos contrates nunca.",
      ],
      items: [
        "Hoja de expedientes: carátula, número, fuero y juzgado, cliente, abogado responsable, estado, última actuación y su fecha, próxima actuación y su fecha.",
        "Hoja de vencimientos: expediente, qué vence, fecha, responsable y estado (hecho o pendiente).",
        "Una tabla con filtros, listas desplegables para el estado y el fuero, y formato condicional por días restantes.",
        "Una sola persona que actualiza, con un suplente nombrado.",
      ],
    },
    {
      heading: "Hasta dónde llega Excel",
      paragraphs: [
        "Funciona bien en un estudio chico, con pocas personas editando y alguien con el hábito de mirarla cada mañana.",
        "Falla cuando no avisa sola, cuando la editan varios a la vez y se pisan, cuando el aviso al cliente sale tarde porque nadie sabe qué cambió, y cuando el vencimiento depende de que alguien lo vea.",
      ],
    },
    {
      heading: "Señales de que la planilla ya no alcanza",
      paragraphs: ["Cuatro señales, en lenguaje de estudio:"],
      items: [
        "Te enterás de una novedad por el cliente.",
        "Hay dos versiones de la planilla.",
        "El vencimiento lo sabe una sola persona.",
        "Las consultas por WhatsApp no tienen dueño.",
      ],
    },
  ],
  howTitle: "Qué hay hoy y qué armamos a medida",
  how: [
    {
      title: "Hoy: demos con datos ficticios",
      body: "En la [demo de captación y calificación de leads con IA](/es/demos/leads-con-ia) ves cómo se ordenan las consultas por prioridad con reglas que leés una por una: se carga una consulta ficticia sobre una carta documento recibida y la demo muestra el puntaje, el ruteo y una respuesta sugerida que sale cuando la aprobás. La IA de la demo está simulada con reglas.",
    },
    {
      title: "A medida: base de causas y avisos al responsable",
      body: "Lo armamos a medida: una base única de causas, que arranca desde tu planilla, con vencimientos y responsables, y avisos al abogado responsable con la anticipación que definas. La fecha del vencimiento la confirma siempre el abogado: el sistema recuerda las fechas que cargás y no calcula plazos con valor legal. Si querés contar un plazo de ejemplo en días hábiles, hay una [calculadora gratis de plazos procesales](/es/herramientas/plazos-procesales): es orientativa y no reemplaza tu cómputo.",
    },
    {
      title: "A medida: novedades de la causa para el cliente",
      body: "También a medida: leer lo que cambió en una causa y redactar el mensaje para el cliente, que sale solo cuando el abogado lo aprueba. Hoy no hay una demo propia ni una función ya hecha de este aviso: lo definimos con tu estudio. No prometemos una conexión directa con el sistema de ningún juzgado; si las notificaciones ya te llegan por mail o las cargás en la planilla, partimos de ahí y lo evaluamos en la llamada.",
    },
    {
      title: "Qué necesitamos de tu lado",
      body: "Tu planilla actual (anonimizada si preferís) y una persona que explique cómo se enteran hoy de una novedad. Los honorarios tienen su propia página: [control de honorarios](/es/automatizaciones/control-de-honorarios-estudio-juridico). Y para el método de control de plazos, el [artículo sobre vencimientos procesales](/es/blog/controlar-vencimientos-procesales-estudio-juridico).",
    },
  ],
  demoLinks: {
    title: "Probalo antes de contratarlo",
    body: DEMO_BODY,
    links: [
      { label: "Demos para estudios jurídicos", path: DEMO_LEGAL.path, note: "Consultas y cobro de honorarios" },
      { label: "Demo: captación y calificación de leads con IA", path: "/es/demos/leads-con-ia", note: "Consultas ordenadas por prioridad" },
      { label: "Calculadora gratis de plazos procesales", path: "/es/herramientas/plazos-procesales", note: "Orientativa: el profesional confirma" },
    ],
  },
  fit: [
    "Llevás tus causas en una planilla que edita más de una persona.",
    "Los avisos a clientes dependen de que alguien se acuerde.",
    "Querés ordenar las consultas por WhatsApp y por mail sin sumar un sistema de gestión.",
  ],
  faqs: [
    ["¿Cómo llevar el control de expedientes en Excel?", "Con una hoja de expedientes (una fila por causa, con carátula, juzgado, cliente, abogado responsable, estado y próxima fecha) y otra de vencimientos (expediente, qué vence, fecha y responsable). Con filtros y formato condicional por días restantes alcanza para un estudio chico, siempre que alguien la actualice todos los días."],
    ["¿Cuándo conviene dejar la planilla de Excel?", "Cuando depende de que una persona se acuerde de mirarla, cuando la editan varios a la vez o cuando el aviso al cliente sale tarde porque nadie sabe qué cambió. Ahí un sistema con avisos ahorra más que otra pestaña."],
    ["¿Pueden avisar solos los vencimientos?", "A medida, sí: pueden avisar al abogado responsable con la anticipación que definas. La fecha del vencimiento la confirma siempre el abogado: el sistema recuerda, no calcula plazos con valor legal ni garantiza ningún plazo."],
    ["¿Se conectan con el sistema del Poder Judicial?", "Depende de cada jurisdicción y de cómo recibas hoy las notificaciones. Si te llegan por mail o las cargás en una planilla, partimos de ahí. No prometemos una conexión que no podamos hacer de forma segura: lo vemos en la llamada."],
    ["¿Se puede avisar a los clientes cómo va su causa sin llamar uno por uno?", "Es algo que armamos a medida del estudio: el sistema redacta el mensaje con lo que cambió y sale cuando el abogado lo aprueba. Hoy no tenemos una demo propia de este aviso, así que lo definimos juntos en la llamada."],
    costFaq("cuántos clientes, fuentes de datos y reglas entran"),
  ],
  sources: [
    { label: "Código Procesal Civil y Comercial de la Nación, Ley 17.454 (texto actualizado, argentina.gob.ar)", href: "https://www.argentina.gob.ar/normativa/nacional/ley-17454-16547/actualizacion" },
    { label: "Poder Judicial de la Nación: notificaciones electrónicas, preguntas frecuentes", href: "https://servicios.pjn.gov.ar/formularios_externos/FP/sne.html" },
    { label: "Corte Suprema: feriados judiciales y días inhábiles", href: "https://www.csjn.gov.ar/transparencia/organizacion-interna/feriados-judiciales-y-dias-inhabiles" },
  ],
  reviewedAt: RUBRO_REVIEWED_AT,
  disclaimer: LEGAL_DISCLAIMER,
  relatedLinks: [
    { path: "/es/automatizaciones/control-de-honorarios-estudio-juridico", title: "Control de honorarios para estudios jurídicos" },
    { path: "/es/demos/leads-con-ia", title: "Demo: captación y calificación de leads con IA" },
    { path: "/es/demos/cobranzas", title: "Demo: cobranzas automáticas" },
    DEMO_LEGAL,
    { path: "/es/herramientas/plazos-procesales", title: "Calculadora gratis de plazos procesales" },
    SERVICE,
  ],
  relatedService: AUTOMATION,
  relatedPosts: [BLOG.venc],
});

/* ───────────────────────── 4. Control de honorarios ───────────────────────── */
rubroUseCases.push({
  key: "legal-honorarios",
  path: "/es/automatizaciones/control-de-honorarios-estudio-juridico",
  updatedAt: UPDATED_AT,
  section: "automatizaciones",
  eyebrow: "Estudios jurídicos · Honorarios",
  title: "Control de honorarios: saldos, vencimientos y recordatorios para tu estudio",
  lead: "Los honorarios se reclaman cuando alguien se acuerda, y reclamar tarde cuesta plata y también incomodidad con el cliente. Te mostramos qué conviene registrar, cómo armar recordatorios que no queman la relación y qué podemos automatizar, con vos aprobando cada aviso. Mirá las [demos para estudios jurídicos](/es/demos/para/estudios-juridicos).",
  metaTitle: "Control de honorarios para estudios jurídicos | Puna Tech",
  metaDescription: "Cómo controlar honorarios, saldos y vencimientos en un estudio jurídico y mandar recordatorios que aprobás vos. Diagnóstico en 15 min.",
  serviceType: "Control de honorarios para estudios jurídicos",
  ogImage: "/og/automatizaciones-control-de-honorarios-estudio-juridico.png",
  ogImageAlt: "Puna Tech: control de honorarios, saldos y recordatorios para estudios jurídicos.",
  cardTitle: "Control de honorarios para estudios jurídicos",
  cardBlurb: "Qué registrar de cada honorario, recordatorios que no queman la relación y avisos que aprobás vos. Sin asesoramiento jurídico.",
  example: "Un estudio lleva los honorarios en una planilla sin avisos. Los cobros llegan por transferencia, por Mercado Pago o en efectivo, y nadie quiere ser el pesado: el reclamo sale cuando alguien se acuerda.",
  before: [
    "La planilla de honorarios no avisa nada: el saldo se calcula de memoria.",
    "Los cobros llegan por distintos canales y cuesta saber a qué honorario corresponde cada uno.",
    "Reclamar le toca a quien menos quiere hacerlo.",
    "Cuando el abogado tiene que decidir el paso siguiente, el historial de avisos no está a mano.",
  ],
  after: [
    "Un registro único de honorarios, que arranca desde tu planilla, con saldo por cliente y por expediente.",
    "Una lista de vencidos y por vencer.",
    "Recordatorios redactados por el sistema, que salen solo cuando vos aprobás.",
    "Historial de avisos y saldo siempre a mano.",
  ],
  sections: [
    {
      heading: "Qué conviene registrar de cada honorario",
      paragraphs: ["Sin entrar en el contenido jurídico del convenio de honorarios, un buen registro tiene:"],
      items: [
        "Cliente y expediente.",
        "Monto y forma acordados: por hitos, mensual, en cuotas.",
        "Fecha de vencimiento.",
        "Importe emitido, importe cobrado y saldo.",
        "Medio de pago.",
        "Los gastos a reintegrar, por separado.",
      ],
    },
    {
      heading: "Por qué los honorarios se reclaman «cuando alguien se acuerda»",
      paragraphs: [
        "El control está en una planilla sin avisos, los cobros llegan por distintos canales y nadie quiere ser el pesado. No hace falta ninguna estadística para reconocerlo: pasa en cuanto el estudio crece y el reclamo depende de la memoria de una persona.",
      ],
    },
    {
      heading: "Recordatorios que no queman la relación",
      paragraphs: [
        "Una escalera de avisos: uno amable antes del vencimiento, otro cuando vence y, si sigue impago, un aviso firme y una llamada del abogado. El tono lo define el estudio.",
        "En la [demo de cobranzas](/es/demos/cobranzas) se ve esa lógica con facturas de ejemplo (no honorarios) y datos ficticios: recordatorio amable, aviso de vencida, segundo aviso firme y último aviso con llamada, y los avisos se frenan cuando entra el pago. Todo sale con aprobación.",
      ],
    },
    {
      heading: "Conciliar cada cobro con su honorario",
      paragraphs: [
        "Transferencia, Mercado Pago, efectivo: cada ingreso se cruza con el honorario que corresponde, y lo que no cierra queda para revisar. Es el criterio de la [conciliación bancaria](/es/automatizaciones/conciliacion-bancaria) y de [integrar Mercado Pago](/es/integraciones/mercado-pago). Si el estudio factura sus honorarios, el comprobante está en [facturación electrónica ARCA](/es/automatizaciones/facturacion-electronica-arca).",
      ],
    },
    {
      heading: "Qué decide siempre el abogado",
      paragraphs: [
        "Una intimación formal, una carta documento o una acción de cobro son decisiones del abogado. No damos asesoramiento jurídico ni armamos esas piezas: dejamos el saldo y el historial para que decidas con todo a mano. Tampoco hablamos de montos, aranceles ni plazos de prescripción de honorarios: cambian por jurisdicción y los define el profesional.",
      ],
    },
  ],
  howTitle: "Qué hay hoy y qué armamos a medida",
  how: [
    {
      title: "Hoy: la demo de cobranzas, con datos ficticios",
      body: "La [demo de cobranzas automáticas](/es/demos/cobranzas) trabaja con facturas de ejemplo: lee las abiertas, calcula en qué paso de escalonamiento está cada una y deja un borrador para que lo edites, lo apruebes o lo saltees. Los envíos de la demo son simulados. No es una función ya instalada en tu estudio.",
    },
    {
      title: "A medida: honorarios, saldos y recordatorios",
      body: "Lo armamos a medida para tu estudio: un registro único de honorarios que arranca desde tu planilla, el saldo por cliente y por expediente, la lista de vencidos y por vencer, y recordatorios redactados con el monto y los medios de pago, que salen cuando aprobás. Por qué canal salen (mail o WhatsApp, y desde qué número) lo definimos en la llamada. Lo armamos sobre tu planilla, tu mail y tu WhatsApp, sin cambiar de sistema de gestión.",
    },
    {
      title: "Qué necesitamos de tu lado",
      body: "Tu planilla de honorarios actual (anonimizada si preferís), cómo cobran hoy y un criterio de cuándo se pasa de un aviso amable a uno firme. La versión genérica está en [automatizar cobranzas](/es/automatizaciones/automatizar-cobranzas); esta se ancla en los honorarios del estudio. Para las causas, mirá [control de expedientes](/es/automatizaciones/control-de-expedientes-estudio-juridico).",
    },
  ],
  demoLinks: {
    title: "Probalo antes de contratarlo",
    body: DEMO_BODY,
    links: [
      { label: "Demo de cobranzas automáticas", path: "/es/demos/cobranzas", note: "Facturas de ejemplo y escalonamiento de avisos" },
      { label: "Demos para estudios jurídicos", path: DEMO_LEGAL.path, note: "Consultas y cobro de honorarios" },
      { label: "Calculadora de horas ahorradas", path: HOURS_TOOL.path, note: "Una estimación con tus propios datos" },
    ],
  },
  fit: [
    "Los honorarios se reclaman cuando alguien se acuerda.",
    "Los cobros llegan por varios canales y cuesta saber a qué honorario corresponde cada uno.",
    "Querés recordatorios con tu tono, que salgan solo cuando vos los aprobás.",
  ],
  faqs: [
    ["¿Cómo llevar el control de honorarios de un estudio jurídico?", "Con un registro por honorario: cliente y expediente, monto acordado, fecha de vencimiento, lo emitido, lo cobrado y el saldo, y aparte los gastos a reintegrar. Lo que importa es que cada cobro quede asociado al honorario que corresponde y que el saldo no se calcule de memoria."],
    ["¿Cómo recordar un honorario sin pelearme con el cliente?", "Con una escalera de avisos: uno amable antes del vencimiento, otro cuando vence y, si sigue impago, un aviso firme y una llamada tuya. El tono lo definís vos y nada sale sin tu aprobación."],
    ["¿Pueden mandar la intimación o la carta documento?", "No. Una intimación formal o una acción de cobro es una decisión del abogado. Lo que dejamos a mano es el saldo y el historial de avisos para que decidas con todo a la vista."],
    ["¿Se pueden conciliar los cobros por transferencia o Mercado Pago?", "Sí, es algo que armamos a medida: cada cobro se cruza con el honorario correspondiente y lo que no coincide queda en una lista para que alguien lo revise. Es el mismo criterio de la conciliación bancaria automática."],
    ["¿Tengo que cambiar mi sistema de gestión?", "No. Lo armamos sobre tu planilla, tu mail y tu WhatsApp. Por qué canal salen los avisos y desde dónde lo definimos juntos en la llamada."],
    costFaq("cuántos clientes, fuentes de datos y reglas entran"),
  ],
  sources: [],
  disclaimer: LEGAL_DISCLAIMER,
  relatedLinks: [
    { path: "/es/automatizaciones/control-de-expedientes-estudio-juridico", title: "Control de expedientes para estudios jurídicos" },
    { path: "/es/automatizaciones/automatizar-cobranzas", title: "Automatizar cobranzas" },
    { path: "/es/automatizaciones/conciliacion-bancaria", title: "Conciliación bancaria" },
    { path: "/es/integraciones/mercado-pago", title: "Integrar Mercado Pago" },
    { path: "/es/demos/cobranzas", title: "Demo: cobranzas automáticas" },
    DEMO_LEGAL,
    SERVICE,
  ],
  relatedService: AUTOMATION,
  relatedPosts: [BLOG.venc],
});

/* ───────────────────────── 5. Cartera de pólizas y renovaciones ───────────────────────── */
rubroUseCases.push({
  key: "seguros-cartera",
  path: "/es/automatizaciones/cartera-de-polizas-y-renovaciones",
  updatedAt: UPDATED_AT,
  section: "automatizaciones",
  eyebrow: "Productores de seguros · Cartera",
  title: "Cartera de pólizas y renovaciones: de los PDF al Excel y a los avisos",
  lead: "Cada póliza llega en un PDF distinto y el vencimiento está en una planilla que nadie actualiza. Te mostramos qué datos conviene registrar, cómo armar una cartera que se pueda filtrar y cómo recordar renovaciones con tiempo, sin cambiar de sistema. Mirá las [demos para productores de seguros](/es/demos/para/productores-de-seguros).",
  metaTitle: "Cartera de pólizas y renovaciones en Excel | Puna Tech",
  metaDescription: "Cómo armar la cartera de pólizas de tu productora, pasar los datos de los PDF a Excel y avisar renovaciones a tiempo. Diagnóstico en 15 min.",
  serviceType: "Cartera de pólizas y renovaciones para productores de seguros",
  ogImage: "/og/automatizaciones-cartera-de-polizas-y-renovaciones.png",
  ogImageAlt: "Puna Tech: cartera de pólizas y renovaciones para productores de seguros, de los PDF al Excel y a los avisos.",
  cardTitle: "Cartera de pólizas y renovaciones",
  cardBlurb: "Datos de pólizas desde los PDF a un Excel filtrable y avisos de renovación a 30 días, aprobados por vos.",
  example: "Una productora recibe las pólizas de cada compañía en PDF, con formatos distintos. Los vencimientos están en una planilla que se actualiza cuando alguien tiene tiempo, y el cliente se entera de que su póliza venció cuando ya no tiene cobertura.",
  before: [
    "Cada compañía manda sus pólizas en un PDF con otro formato.",
    "Los vencimientos viven en una planilla que se actualiza cuando hay tiempo.",
    "Las renovaciones se avisan de memoria, o no se avisan.",
    "El cliente se entera de que su póliza venció cuando ya no tiene cobertura.",
  ],
  after: [
    "Los datos de cada póliza pasan del PDF a una cartera que se puede filtrar, y vos los revisás.",
    "Una lista de renovaciones con 30 días de anticipación.",
    "El aviso lo redacta el sistema y sale cuando aprobás.",
    "Un Excel de la cartera siempre al día.",
  ],
  sections: [
    {
      heading: "Qué datos conviene registrar de cada póliza",
      paragraphs: ["Una cartera útil tiene una fila por póliza, con campos que se puedan filtrar:"],
      items: [
        "Asegurado y documento.",
        "Compañía, ramo y número de póliza.",
        "Vigencia: desde y hasta.",
        "Suma asegurada y premio.",
        "Forma de pago y datos de contacto del asegurado.",
        "Estado: vigente, a renovar o vencida.",
      ],
    },
    {
      heading: "De los PDF de las compañías a la cartera",
      paragraphs: [
        "El problema es que cada compañía manda su PDF con otro formato. En la demo, el sistema lee los datos del PDF y deja una ficha por póliza para que la revises antes de guardarla. En tu productora partimos de tus PDF reales: no hay un formato único y por eso lo validamos con tus archivos antes de usarlo.",
      ],
    },
    {
      heading: "La cartera en Excel, sin cambiar de sistema",
      paragraphs: [
        "Una planilla con filtros por vencimiento, ramo y compañía alcanza para empezar y es la salida que muchas productoras ya usan. Lo que a medida suma es que se complete sola y que avise.",
      ],
    },
    {
      heading: "Renovaciones: avisar con 30 días",
      paragraphs: [
        "La lógica es simple: una lista de las pólizas que vencen en los próximos 30 días, un mensaje por cliente y la aprobación tuya antes de enviar. Mirá el [artículo sobre renovaciones y cobranzas](/es/blog/automatizar-renovaciones-cobranzas-productor-seguros) para el paso a paso.",
      ],
    },
  ],
  howTitle: "Qué hay hoy y qué armamos a medida",
  how: [
    {
      title: "Hoy: la demo con datos ficticios",
      body: "La [demo de pólizas y renovaciones](/es/demos/polizas-y-renovaciones) usa datos ficticios: lee los PDF de pólizas, arma la cartera con una ficha por póliza, la exporta a Excel y deja un aviso de renovación con 30 días de anticipación que se envía recién cuando lo aprobás. El envío de la demo es simulado y no sale nada a nadie.",
    },
    {
      title: "A medida: tu cartera, tus PDF, tus avisos",
      body: "Lo armamos a medida: partimos de tus PDF reales y de tu planilla actual, los datos que importan para tu operación y la lista de renovaciones. Por qué canal salen los avisos (mail o WhatsApp) lo definimos en la llamada. No cambiamos tu sistema de gestión ni hay que migrar nada.",
    },
    {
      title: "Qué no es",
      body: "No es un sistema de gestión de compañías ni cambia cómo emitís las pólizas. Tampoco decide qué se renueva o a qué precio: eso lo define el productor.",
    },
    {
      title: "Qué necesitamos de tu lado",
      body: "Algunos PDF de pólizas reales (anonimizados si preferís), tu planilla actual y cómo avisás hoy una renovación. Para cobrar las cuotas, mirá la [demo de cobranzas](/es/demos/cobranzas).",
    },
  ],
  demoLinks: {
    title: "Probalo antes de contratarlo",
    body: DEMO_BODY,
    links: [
      { label: "Demo de pólizas y renovaciones", path: "/es/demos/polizas-y-renovaciones", note: "Cartera desde PDF, Excel y aviso a 30 días" },
      { label: "Demos para productores de seguros", path: DEMO_INS.path, note: "Cartera, renovaciones y cobranzas" },
      { label: "Calculadora de horas ahorradas", path: HOURS_TOOL.path, note: "Una estimación con tus propios datos" },
    ],
  },
  fit: [
    "Recibís pólizas en PDF de varias compañías y las pasás a mano a una planilla.",
    "Te enteraste de una renovación cuando el cliente ya la había perdido.",
    "Querés una cartera que se pueda filtrar sin cambiar de sistema.",
  ],
  faqs: [
    ["¿Cómo armar la cartera de pólizas en Excel?", "Con una fila por póliza y campos que se puedan filtrar: asegurado, compañía, ramo, número, vigencia desde y hasta, suma asegurada, premio, forma de pago y estado. Con filtros por vencimiento, ramo y compañía alcanza para empezar."],
    ["¿Se pueden pasar los datos de los PDF de las pólizas a Excel?", "Sí. En la demo, con datos ficticios, el sistema lee los PDF y deja una ficha por póliza para que la revises antes de guardarla. En tu productora partimos de tus PDF reales y validamos la lectura con tus archivos antes de usarla."],
    ["¿Cómo avisar las renovaciones a tiempo?", "Con una lista de las pólizas que vencen en los próximos 30 días y un mensaje por cliente. El aviso lo redacta el sistema y sale solo cuando vos lo aprobás."],
    ["¿Tengo que cambiar mi sistema de gestión?", "No. Armamos la automatización sobre tus planillas, tu mail y tu WhatsApp. No tocamos cómo emitís las pólizas ni cómo trabajás con las compañías."],
    ["¿Con qué compañías funciona?", "No tenemos una lista de compañías compatibles: partimos de los PDF reales de tu productora y los probamos uno a uno antes de ponerlo en uso."],
    costFaq("cuántas compañías, formatos de PDF y avisos entran"),
  ],
  sources: [],
  disclaimer: STANDARD_DISCLAIMER,
  relatedLinks: [
    { path: "/es/automatizaciones/matricula-productor-asesor-de-seguros", title: "Matrícula de productor asesor de seguros" },
    { path: "/es/automatizaciones/automatizar-cobranzas", title: "Automatizar cobranzas" },
    { path: "/es/demos/polizas-y-renovaciones", title: "Demo: pólizas y renovaciones" },
    { path: "/es/demos/cobranzas", title: "Demo: cobranzas automáticas" },
    DEMO_INS,
    SERVICE,
  ],
  relatedService: AUTOMATION,
  relatedPosts: [BLOG.renov],
});

/* ───────────────────────── 6. Matrícula de productor asesor ───────────────────────── */
rubroUseCases.push({
  key: "seguros-matricula",
  path: "/es/automatizaciones/matricula-productor-asesor-de-seguros",
  updatedAt: UPDATED_AT,
  section: "automatizaciones",
  eyebrow: "Productores de seguros · Matrícula",
  title: "Matrícula de productor asesor de seguros: cómo pagarla y no olvidarte",
  lead: "La matrícula de productor asesor se renueva todos los años, con una fecha de pago y un recargo si te pasás. Acá resumimos lo que dice la Superintendencia de Seguros de la Nación (SSN), con el link a la fuente, y cómo no dejar que se te pase: un recordatorio tuyo, a medida. Mirá las [demos para productores de seguros](/es/demos/para/productores-de-seguros).",
  metaTitle: "Pago de matrícula de productor asesor de seguros | Puna Tech",
  metaDescription: "Matrícula de productor asesor de seguros: hasta cuándo se paga, recargos y cómo pagar en REPAS. Y un calendario que te avisa antes. Diagnóstico en 15 min.",
  serviceType: "Recordatorios de matrícula para productores asesores de seguros",
  ogImage: "/og/automatizaciones-matricula-productor-asesor-de-seguros.png",
  ogImageAlt: "Puna Tech: matrícula de productor asesor de seguros, fechas de la SSN y recordatorios de renovación.",
  cardTitle: "Matrícula de productor asesor de seguros",
  cardBlurb: "Fechas, recargo y pasos del pago anual según la SSN, y un calendario a medida para que no se te pase.",
  example: "Un productor tiene la matrícula al día, pero la fecha de pago y la de presentación viven en su cabeza. Un abril se le pasa, y el recargo corre.",
  before: [
    "La fecha de renovación solo la sabe el productor.",
    "El pago y la presentación se hacen a último momento.",
    "Cuando se pasa, el recargo sale de su bolsillo.",
    "Los otros vencimientos del año (REPAS, certificados) viven en distintas partes.",
  ],
  after: [
    "Un calendario con las fechas de la SSN, revisadas contra la fuente, con aviso por mail antes de cada una.",
    "Un recordatorio con los pasos de la renovación y los comprobantes a guardar.",
    "Todo lo ejecuta el productor: el recordatorio avisa, no paga ni presenta por vos.",
  ],
  sections: [
    {
      heading: "Hasta cuándo se paga y cuál es el recargo",
      paragraphs: [
        "Según la SSN, el productor asesor de seguros paga anualmente una suma fija en concepto de matrícula, que debe abonar antes del 30 de abril. Si no paga en término, abona el importe vigente al momento del pago más una multa del 50 % de ese importe. Si no lo abona antes del 1.º de enero del año siguiente, la multa se incrementa al 100 %.",
        "El importe lo fija la SSN cada año y cambia, por eso no lo publicamos acá: consultalo en la página oficial. Sobre el fin del período con recargo, la SSN lo expresa de dos maneras; escribimos «hasta fin de año» y te recomendamos confirmar el día exacto en la fuente.",
      ],
    },
    {
      heading: "Qué necesitás antes de pagar",
      paragraphs: [
        "La SSN pide haber cumplido los cursos anuales del Programa de Capacitación Continuada (PCC) para Productores, con información en el Ente Cooperador Ley 22.400. El pago del Derecho Anual de Inscripción se hace a través del sistema REPAS.",
      ],
    },
    {
      heading: "Cómo se paga en REPAS, paso a paso",
      paragraphs: [
        "Los pasos oficiales son cuatro: entrar a ARCA, adherir el servicio con clave fiscal «REPAS», ingresar al sistema, elegir la opción «Pago de Matrículas» dentro del menú y seleccionar el período. La SSN tiene un video del paso a paso y el Manual de REPAS: seguí esas guías, no esta página.",
        "Esta página no reemplaza el trámite oficial y los pasos pueden cambiar.",
      ],
    },
    {
      heading: "Qué más vence en una productora",
      paragraphs: [
        "Solo damos por verificado lo que dice la SSN: la matrícula anual y los cursos anuales del PCC. A eso se suma lo propio de cada productora: las renovaciones de las pólizas de la cartera, los avisos a los asegurados y los cobros pendientes. Para la cartera, mirá [cartera de pólizas y renovaciones](/es/automatizaciones/cartera-de-polizas-y-renovaciones).",
        "Si tenés otras obligaciones ante la SSN, las sumamos al calendario después de verificarlas una por una en la fuente.",
      ],
    },
  ],
  howTitle: "Qué hay hoy y qué armamos a medida",
  how: [
    {
      title: "Hoy: no hay una función para esto",
      body: "No existe un recordatorio de matrícula ya hecho ni una demo de este proceso. La [demo de pólizas y renovaciones](/es/demos/polizas-y-renovaciones) muestra, con datos ficticios, un aviso de renovación de una póliza que sale cuando se aprueba: la misma idea que podemos aplicar al calendario del productor.",
    },
    {
      title: "A medida: tu calendario de vencimientos",
      body: "Lo armamos a medida: un calendario único con la matrícula, los cursos del PCC y las renovaciones de tu cartera, con avisos a vos con la anticipación que definas (por ejemplo 60, 30 y 7 días antes). Los avisos a tus asegurados salen solo cuando los aprobás. Las fechas las cargamos contra la fuente oficial y las revisás vos: nosotros no pagamos ni presentamos nada por vos. Por qué canal llegan los avisos lo definimos en la llamada.",
    },
    {
      title: "Qué necesitamos de tu lado",
      body: "Tu calendario actual (aunque sea una nota), cuántos días antes querés el aviso y por qué canal. Para las cobranzas de las cuotas, mirá [automatizar cobranzas](/es/automatizaciones/automatizar-cobranzas).",
    },
  ],
  demoLinks: {
    title: "Probalo antes de contratarlo",
    body: DEMO_BODY,
    links: [
      { label: "Demo de pólizas y renovaciones", path: "/es/demos/polizas-y-renovaciones", note: "Aviso de renovación aprobado por vos" },
      { label: "Demos para productores de seguros", path: DEMO_INS.path, note: "Cartera, renovaciones y cobranzas" },
      { label: "Calculadora de horas ahorradas", path: HOURS_TOOL.path, note: "Una estimación con tus propios datos" },
    ],
  },
  fit: [
    "Sos productor asesor y la fecha de la matrícula depende de tu memoria.",
    "Querés un solo calendario con la matrícula y las renovaciones de tu cartera.",
    "Preferís un aviso por mail o WhatsApp antes de cada vencimiento.",
  ],
  faqs: [
    ["¿Hasta cuándo se paga la matrícula de productor asesor de seguros?", "Según la SSN, hasta el 30 de abril de cada año. Verificá la fecha vigente en la página oficial, porque puede cambiar."],
    ["¿Qué recargo hay si pago fuera de término?", "Según la SSN, si no pagás en término abonás el importe vigente más una multa del 50 %, y si no pagás antes del 1.º de enero del año siguiente la multa pasa al 100 %. Confirmalo en la fuente antes de pagar."],
    ["¿Cuánto cuesta la matrícula?", "El importe lo fija la SSN cada año, y por eso no lo publicamos acá. Consultalo en la página oficial de la SSN."],
    ["¿Cómo se paga la matrícula en REPAS?", "Según la SSN: entrás a ARCA, adherís el servicio con clave fiscal «REPAS», ingresás al sistema, elegís «Pago de Matrículas» y seleccionás el período. Pagás vos: lo que armamos a medida es el aviso para que no se te pase la fecha."],
    ["¿Qué otras fechas conviene controlar en el año?", "Las renovaciones de las pólizas de tu cartera, las cobranzas de las cuotas y la documentación que te pida la SSN. Todas se pueden cargar en un mismo calendario con avisos, a medida."],
    costFaq("cuántos vencimientos y canales de aviso entran"),
  ],
  sources: [
    { label: "Superintendencia de Seguros de la Nación: pagar la matrícula de productor asesor de seguros", href: "https://www.argentina.gob.ar/pagar-la-matricula-de-productor-asesor-deseguros" },
    { label: "Argentina.gob.ar: pagos de matrículas 2026 (SSN)", href: "https://www.argentina.gob.ar/noticias/pagos-de-matriculas-2026" },
  ],
  reviewedAt: RUBRO_REVIEWED_AT,
  disclaimer: "Esta página resume información pública de la SSN y no reemplaza el trámite en el sistema oficial. Verificá siempre fechas y recargos vigentes en la fuente. " + STANDARD_DISCLAIMER,
  relatedLinks: [
    { path: "/es/automatizaciones/cartera-de-polizas-y-renovaciones", title: "Cartera de pólizas y renovaciones" },
    { path: "/es/automatizaciones/automatizar-cobranzas", title: "Automatizar cobranzas" },
    { path: "/es/demos/polizas-y-renovaciones", title: "Demo: pólizas y renovaciones" },
    DEMO_INS,
    SERVICE,
  ],
  relatedService: AUTOMATION,
  relatedPosts: [BLOG.renov],
});
