import { rubroPath } from "./rubros.ts";

/**
 * Free Spanish tools (Argentina). ES only on purpose: the keywords, the law and the money are Argentine.
 * Every tool: own meta, own OG image, SoftwareApplication + FAQPage JSON-LD, explanatory section with sources,
 * disclaimer and one soft CTA to the matching demo page.
 */

export type ToolSlug = "coeficiente-convenio-multilateral" | "plazos-procesales" | "calculadora-horas-ahorradas";

export interface ToolSource {
  label: string;
  href: string;
  /** What we took from it. */
  note: string;
}

export interface ToolSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  /** Plain bullet list rendered after the paragraphs. */
  items?: string[];
  /** Code-like line shown in a block (the formula). */
  formula?: string;
}

export interface ToolDefinition {
  slug: ToolSlug;
  /** Short name used in the hub, the breadcrumb and the SoftwareApplication. */
  name: string;
  title: string;
  description: string;
  h1: string;
  mark: string;
  lead: string;
  audience: string;
  ogImage: string;
  ogAlt: string;
  /** Hub card copy. */
  card: string;
  faqs: Array<{ q: string; a: string }>;
  sections: ToolSection[];
  sources: ToolSource[];
  disclaimer: string;
  cta: { heading: string; text: string; label: string; href: string };
  lastmod: string;
  datePublished: string;
}

export const TOOLS_BASE = "/es/herramientas";

export function toolPath(slug: string) {
  return `${TOOLS_BASE}/${slug}`;
}

const CA_CM = "https://www.ca.gob.ar/ordenamiento-juridico/convenio-multilateral-comarb/regimen-de-distribucion-de-ingresos-regimen-general";
const CA_CM_ESPECIALES = "https://www.ca.gob.ar/ordenamiento-juridico/convenio-multilateral-comarb/regimen-de-distribucion-de-ingresos-regimenes-especiales";
const CA_RG = "https://www.ca.gob.ar/resoluciones/resoluciones/gr";

export const toolDefinitions: ToolDefinition[] = [
  {
    slug: "coeficiente-convenio-multilateral",
    name: "Calculadora de coeficientes de Convenio Multilateral",
    title: "Coeficiente unificado de Convenio Multilateral | Puna Tech",
    description: "Calculá el coeficiente unificado por jurisdicción del Convenio Multilateral (art. 2, 50% ingresos y 50% gastos), con 4 decimales y export a CSV.",
    h1: "Coeficiente unificado de Convenio Multilateral",
    mark: "Convenio Multilateral",
    lead: "Cargá los ingresos y los gastos computables de cada jurisdicción y obtené el coeficiente del régimen general con 4 decimales, la verificación de la suma y un CSV listo para Excel.",
    audience: "Estudios contables y contribuyentes de Convenio Multilateral",
    ogImage: "/og/herramientas-coeficiente-convenio-multilateral.png",
    ogAlt: "Calculadora gratuita del coeficiente unificado de Convenio Multilateral, por jurisdicción.",
    card: "Distribuí la base imponible entre las 24 jurisdicciones con el art. 2 del Convenio: 50% gastos, 50% ingresos.",
    sections: [
      {
        id: "como-se-calcula",
        heading: "Cómo se calcula el coeficiente unificado",
        paragraphs: [
          "El artículo 2 del Convenio Multilateral distribuye los ingresos brutos totales del contribuyente entre las jurisdicciones: el 50% en proporción a los gastos efectivamente soportados en cada una y el otro 50% en proporción a los ingresos brutos provenientes de cada una. El resultado es el coeficiente unificado de cada jurisdicción.",
          "La herramienta hace exactamente eso con aritmética exacta (sin errores de coma flotante) y redondea cada coeficiente a 4 decimales, que es lo que fija la Resolución General CA 46/1993 (diez milésimos, con redondeo en exceso o por defecto). Cuando el quinto decimal es exactamente 5, la herramienta redondea hacia arriba.",
        ],
        formula: "coeficiente de J = 50% × (gastos de J ÷ total de gastos) + 50% × (ingresos de J ÷ total de ingresos)",
      },
      {
        id: "que-datos-usar",
        heading: "Qué ingresos y gastos cargar",
        paragraphs: [
          "Según el artículo 5 del Convenio y la RG CA 10/2019, se usan los ingresos y gastos del último balance cerrado en el año calendario inmediato anterior; si no se practican balances comerciales, los del año calendario inmediato anterior. Ese coeficiente se aplica en los anticipos del año siguiente.",
          "Los gastos son los que se originan en el ejercicio de la actividad (artículo 3): sueldos y cargas, combustibles, reparaciones, alquileres, seguros, gastos de compra, administración, producción y comercialización, y las amortizaciones ordinarias admitidas por la ley de Ganancias. Un gasto se asigna a la jurisdicción donde se soporta, es decir, donde se desarrolla la actividad con la que tiene relación directa (artículo 4).",
        ],
        items: [
          "No computan como gastos (art. 3): el costo de la materia prima y de las mercaderías, el costo de obras o servicios contratados para su comercialización, publicidad y propaganda, tributos nacionales, provinciales y municipales, intereses, y honorarios y sueldos a directores, síndicos y socios por el excedente del 1% de la utilidad del balance comercial.",
          "Gastos que no se pueden atribuir con certeza: se reparten en la misma proporción que los demás si son de escasa significación (RG CA 22/1984: en conjunto hasta el 10% del total de gastos computables y cada uno hasta el 20% de ese porcentaje). Si no, hay que estimarlos de forma razonablemente fundada (art. 4).",
          "Gastos de transporte: se atribuyen por partes iguales a las jurisdicciones entre las que se realiza el hecho imponible (art. 4).",
          "Amortizaciones de bienes de uso que se usan en varias jurisdicciones: se reparten en proporción a los ingresos atribuidos a cada una (RG CA 8/2008).",
          "Quedan fuera del coeficiente, entre otros: los ingresos de regímenes especiales, la venta de bienes de uso, el recupero de gastos que cumpla los requisitos de la norma y los subsidios estatales (RG CA 3/2017); el valor patrimonial proporcional y las diferencias de cambio (RG CA 5/2017); los deudores incobrables como gasto (RG CA 5/2012); y los ingresos y gastos de exportaciones (RG CA 2/2018).",
        ],
      },
      {
        id: "redondeo-suma",
        heading: "Redondeo y suma 1,0000",
        paragraphs: [
          "Los coeficientes de todas las jurisdicciones representan el 100% de la base imponible, así que deberían sumar 1,0000. Al redondear cada uno a 4 decimales la suma puede dar 0,9999 o 1,0001 (por ejemplo, tres jurisdicciones iguales dan 0,3333 cada una). La herramienta te muestra la diferencia y, si querés, aplica el ajuste habitual de sumarla o restarla a la jurisdicción de mayor coeficiente.",
          "Ese ajuste es una práctica profesional extendida, no una regla del Convenio ni de la Comisión Arbitral: antes de usarlo, fijate qué exige el aplicativo SIFERE para tu caso.",
        ],
      },
      {
        id: "alcance",
        heading: "Qué cubre y qué no",
        paragraphs: [
          "Esta herramienta resuelve el régimen general (arts. 2 a 5). Los regímenes especiales (arts. 6 a 13: construcción, seguros y entidades financieras, transporte, comunicaciones, profesiones liberales, entre otros) tienen reglas propias de atribución y no están cubiertos. Tampoco calcula inicio o cese de actividades (art. 14), ni anticipos, ni la distribución a municipios.",
          "Los importes se cargan en pesos. Si una jurisdicción no tiene datos, dejá la fila en blanco: no se incluye en el resultado.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo se calcula el coeficiente unificado de Convenio Multilateral?",
        a: "Con el artículo 2 del Convenio: el 50% de la base se distribuye según los gastos efectivamente soportados en cada jurisdicción y el otro 50% según los ingresos brutos provenientes de cada una. Para cada jurisdicción se suma la mitad de su proporción de gastos y la mitad de su proporción de ingresos.",
      },
      {
        q: "¿Qué balance se usa para calcular el coeficiente?",
        a: "El último balance cerrado en el año calendario inmediato anterior; si el contribuyente no practica balances comerciales, los ingresos y gastos determinados en el año calendario inmediato anterior (art. 5 del Convenio y RG CA 10/2019). Si al presentar el primer anticipo no se cuenta con esa información, se usa el coeficiente del año anterior en los tres primeros anticipos y se ajusta en el cuarto.",
      },
      {
        q: "¿Con cuántos decimales se expresan los coeficientes?",
        a: "Con 4 decimales (diez milésimos), con redondeo en exceso o por defecto, según la Resolución General CA 46/1993. Por eso la suma de los coeficientes puede diferir de 1,0000 en 0,0001 o 0,0002; la herramienta te muestra esa diferencia.",
      },
      {
        q: "¿Qué gastos no se computan?",
        a: "El artículo 3 excluye el costo de la materia prima y de las mercaderías, el costo de obras o servicios contratados para su comercialización, publicidad, tributos, intereses y los honorarios y sueldos de directores, síndicos y socios por encima del 1% de la utilidad del balance comercial. Varias resoluciones generales de la Comisión Arbitral agregan otras exclusiones, y están resumidas más arriba.",
      },
      {
        q: "¿Sirve para los regímenes especiales?",
        a: "No. Los artículos 6 a 13 del Convenio (construcción, seguros, transporte, comunicaciones, entre otros) tienen reglas de atribución propias y esta calculadora solo resuelve el régimen general.",
      },
    ],
    sources: [
      { label: "Convenio Multilateral, arts. 1 a 5 (Comisión Arbitral)", href: CA_CM, note: "Regla 50/50 (art. 2), gastos computables y no computables (art. 3), gastos soportados (art. 4) y balance base (art. 5)." },
      { label: "Convenio Multilateral, regímenes especiales, arts. 6 a 13 (Comisión Arbitral)", href: CA_CM_ESPECIALES, note: "Casos que esta herramienta no cubre." },
      { label: "RG CA 46/1993", href: `${CA_RG}/1993/r.g_n46_16.11.93.pdf`, note: "Coeficientes en diez milésimos, con redondeo en exceso o por defecto." },
      { label: "RG CA 10/2019", href: `${CA_RG}/2019/2019-10.pdf`, note: "Balance de base y uso del coeficiente anterior en los primeros anticipos." },
      { label: "RG CA 22/1984", href: `${CA_RG}/1984/r.g_n22_26.03.84.pdf`, note: "Qué son gastos de escasa significación (10% y 20%)." },
      { label: "RG CA 8/2008", href: `${CA_RG}/2008/r.g_n08_amortizacion_bienes_de_uso.pdf`, note: "Amortizaciones de bienes de uso usados en varias jurisdicciones." },
      { label: "RG CA 3/2017", href: `${CA_RG}/2017/2017-3.pdf`, note: "Ingresos que no integran el coeficiente." },
      { label: "RG CA 5/2017", href: `${CA_RG}/2017/2017-5.pdf`, note: "Valor patrimonial proporcional y diferencias de cambio." },
      { label: "RG CA 2/2018", href: `${CA_RG}/2018/2018-2.pdf`, note: "Exportaciones: ingresos y gastos no computables." },
      { label: "RG CA 5/2012", href: `${CA_RG}/2012/RG.%2005%20-%20DEUDORES%20INCOBRABLES.pdf`, note: "Deudores incobrables no computan como gasto." },
    ],
    disclaimer: "Resultado orientativo, con fines informativos. No reemplaza el cálculo del contribuyente ni el aplicativo SIFERE. Verificá los datos de base, las exclusiones que te correspondan y el resultado con un contador matriculado antes de presentar una declaración jurada.",
    cta: {
      heading: "¿Armás estos coeficientes todos los meses?",
      text: "Mirá cómo se automatiza la carga y el control de coeficientes para un estudio contable, con datos de ejemplo.",
      label: "Ver demos para estudios contables",
      href: rubroPath("es", "estudios-contables"),
    },
    lastmod: "2026-10-29",
    datePublished: "2026-10-29",
  },
  {
    slug: "plazos-procesales",
    name: "Calculadora de plazos procesales",
    title: "Calculadora de plazos procesales en días hábiles | Puna Tech",
    description: "Calculá el vencimiento de un plazo en días hábiles judiciales de la Justicia Nacional y Federal, con feriados, ferias y plazo de gracia 2026 y 2027.",
    h1: "Plazos procesales en días hábiles judiciales",
    mark: "días hábiles",
    lead: "Elegí la fecha de notificación y los días hábiles del plazo: te mostramos el vencimiento, el plazo de gracia y cada día inhábil que se salteó, con su motivo.",
    audience: "Abogados y estudios jurídicos de la Justicia Nacional y Federal",
    ogImage: "/og/herramientas-plazos-procesales.png",
    ogAlt: "Calculadora gratuita de plazos procesales en días hábiles judiciales de la Justicia Nacional y Federal.",
    card: "Vencimientos en días hábiles judiciales con feriados, ferias y plazo de gracia, y la lista de días salteados.",
    sections: [
      {
        id: "como-se-cuenta",
        heading: "Cómo se cuenta un plazo",
        paragraphs: [
          "El artículo 156 del Código Procesal Civil y Comercial de la Nación (CPCCN) dice que los plazos empiezan a correr desde la notificación y que no se cuenta el día en que se practica esa diligencia ni los días inhábiles. Por eso el primer día del plazo es el siguiente día hábil después de la notificación, y el vencimiento es el último día hábil contado.",
          "Son hábiles todos los días del año salvo los que determina el Reglamento para la Justicia Nacional (art. 152 CPCCN). Según su artículo 2, los tribunales no funcionan en enero, durante la feria de julio, los domingos, los días no laborables por disposición del Congreso o del Poder Ejecutivo, y los feriados judiciales que declare la Corte Suprema.",
        ],
      },
      {
        id: "plazo-de-gracia",
        heading: "Plazo de gracia",
        paragraphs: [
          "Según el artículo 124 del CPCCN, el escrito que no se presentó dentro del horario judicial del día del vencimiento solo puede entregarse válidamente el día hábil inmediato y dentro de las dos primeras horas del despacho. La herramienta te muestra ese día hábil siguiente como dato informativo.",
          "Ojo con las presentaciones electrónicas: si el sistema permite ingresar escritos las 24 horas, la aplicación del plazo de gracia es discutida y depende del fuero y de la normativa aplicable. Lo más seguro es presentar antes de que venza el plazo.",
        ],
      },
      {
        id: "calendario",
        heading: "Qué calendario usa",
        paragraphs: [
          "Por defecto usa el de la Justicia Nacional y Federal con asiento en la Ciudad de Buenos Aires, para 2026 y 2027: feriados y días no laborables de la Ley 27.399 (con los traslados que fija su artículo 6), los días no laborables con fines turísticos de 2026 (Resolución JGM 164/2025), el feriado del 9 y 10 de noviembre de 2026 por la visita del Papa (DNU 1103/2026), las ferias judiciales de enero y la de invierno 2026 del 20 al 31 de julio (Acordada CSJN 11/2026), y el 20 de octubre de 2026 declarado inhábil por la Acordada CSJN 26/2026.",
          "Lo que todavía no se publicó para 2027 (los días no laborables con fines turísticos, la feria de invierno y el traslado del 20 de noviembre) no está cargado: la herramienta te avisa cuando tu plazo cae en esas fechas y podés agregarlas a mano como días inhábiles.",
          "Los tribunales provinciales y los federales del interior tienen sus propias ferias y días inhábiles. Esta herramienta no los cubre: en esos casos usá el calendario de tu cámara o superior tribunal y agregá los días que correspondan como extras.",
        ],
      },
      {
        id: "criterios",
        heading: "Criterios que conviene conocer",
        items: [
          "Los sábados se cuentan como inhábiles, como en la práctica de los tribunales. El Reglamento para la Justicia Nacional menciona los domingos, pero no los sábados, así que si tu plazo depende de esto, confirmalo en el tribunal.",
          "El 16 de noviembre (Día del Trabajador Judicial, Ley 26.674) se equipara a feriado para los trabajadores judiciales, pero no encontramos una acordada que lo declare inhábil para los plazos de los tribunales nacionales. Por defecto lo contamos como hábil, que es el criterio prudente (el plazo vence antes). Podés marcarlo como inhábil.",
          "El 10 de noviembre de 2026 es feriado en la Ciudad de Buenos Aires (DNU 1103/2026) y lo contamos como inhábil para tribunales con asiento allí. Si tu tribunal tiene asiento en otra jurisdicción, podés contarlo como hábil.",
          "Esta calculadora no reemplaza la revisión de las acordadas y resoluciones de tu cámara, que pueden declarar otros días inhábiles o suspender plazos.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Desde cuándo se cuenta un plazo procesal?",
        a: "Desde la notificación. Según el artículo 156 del CPCCN, no se cuenta el día en que se practica la notificación ni los días inhábiles, por lo que el primer día hábil del plazo es el siguiente a la notificación.",
      },
      {
        q: "¿Qué días son inhábiles en la Justicia Nacional?",
        a: "Los domingos, el mes de enero, la feria de julio, los días no laborables por disposición del Congreso o del Poder Ejecutivo y los feriados judiciales que declare la Corte Suprema (art. 2 del Reglamento para la Justicia Nacional). En la práctica los sábados tampoco se cuentan.",
      },
      {
        q: "¿Cuáles son las fechas de la feria judicial de invierno 2026?",
        a: "La Acordada CSJN 11/2026 fijó el feriado judicial de invierno para los tribunales federales y nacionales de la Capital Federal del 20 al 31 de julio de 2026, ambas fechas inclusive. Las Cámaras Federales del interior fijan su propio feriado de diez días hábiles. La feria de invierno 2027 todavía no fue fijada.",
      },
      {
        q: "¿Qué es el plazo de gracia?",
        a: "Es la posibilidad, prevista en el artículo 124 del CPCCN, de entregar el escrito el día hábil siguiente al vencimiento dentro de las dos primeras horas del despacho. Si presentás por vía electrónica con el sistema habilitado las 24 horas, su aplicación es discutida: no te confíes en él.",
      },
      {
        q: "¿Sirve para tribunales provinciales?",
        a: "No. Cada provincia tiene sus ferias, feriados judiciales y reglas de cómputo. Esta herramienta usa el calendario de la Justicia Nacional y Federal con asiento en la Ciudad de Buenos Aires; para otros tribunales podés cargar días inhábiles extra, pero revisá siempre la normativa local.",
      },
    ],
    sources: [
      { label: "Código Procesal Civil y Comercial de la Nación, arts. 124, 152, 153, 156 a 158", href: "https://www.argentina.gob.ar/normativa/nacional/ley-17454-16547/actualizacion", note: "Cómputo de plazos, días hábiles y plazo de gracia." },
      { label: "Reglamento para la Justicia Nacional, arts. 2 y 3 (CSJN)", href: "https://www.csjn.gov.ar/transparencia/organizacion-interna/reglamentos", note: "Días y meses en que los tribunales nacionales no funcionan." },
      { label: "CSJN: feriados judiciales y días inhábiles", href: "https://www.csjn.gov.ar/transparencia/organizacion-interna/feriados-judiciales-y-dias-inhabiles", note: "Página oficial de la Corte con los feriados judiciales." },
      { label: "CSJN: feria judicial de invierno 2026 (Acordada 11/2026)", href: "https://www.csjn.gov.ar/novedades/detalle/13582", note: "Feria del 20 al 31 de julio de 2026." },
      { label: "Acordada CSJN 26/2026", href: "https://www.casm.org.ar/subidas/AC_2026_26_2026.pdf", note: "20 de octubre de 2026 declarado inhábil (copia publicada por un colegio de abogados)." },
      { label: "Ley 27.399, feriados nacionales", href: "https://www.argentina.gob.ar/normativa/nacional/ley-27399-281835/texto", note: "Feriados, días no laborables y reglas de traslado (arts. 1, 6 y 7)." },
      { label: "Decreto 614/2025", href: "https://www.argentina.gob.ar/normativa/nacional/decreto-614-2025-416911/texto", note: "Jefatura de Gabinete como autoridad de aplicación de la Ley 27.399." },
      { label: "Resolución JGM 164/2025", href: "https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-164-2025-421799/texto", note: "Días no laborables con fines turísticos de 2026: 23 de marzo, 10 de julio y 7 de diciembre." },
      { label: "DNU 1103/2026", href: "https://www.argentina.gob.ar/normativa/nacional/norma-430580/texto", note: "Feriado del 9 de noviembre de 2026 y del 10 en la Ciudad de Buenos Aires y Córdoba." },
      { label: "Ley 26.674, Día del Trabajador Judicial", href: "https://www.argentina.gob.ar/normativa/nacional/norma-182272/texto", note: "16 de noviembre, equiparado a feriado para los trabajadores judiciales." },
    ],
    disclaimer: "Resultado orientativo, con fines informativos. Los plazos procesales son una carga del profesional: verificá siempre el vencimiento contra la normativa y las acordadas vigentes de tu tribunal, y ante la duda presentá antes. Esta herramienta no constituye asesoramiento legal.",
    cta: {
      heading: "¿Seguís los vencimientos a mano?",
      text: "Mirá cómo se automatizan las alertas de vencimientos y el seguimiento de expedientes para un estudio jurídico, con datos de ejemplo.",
      label: "Ver demos para estudios jurídicos",
      href: rubroPath("es", "estudios-juridicos"),
    },
    lastmod: "2026-10-29",
    datePublished: "2026-10-29",
  },
  {
    slug: "calculadora-horas-ahorradas",
    name: "Calculadora de horas ahorradas por automatización",
    title: "Calculadora de horas ahorradas al automatizar | Puna Tech",
    description: "Calculá cuántas horas y cuántos pesos ahorrás al automatizar una tarea repetitiva, y en cuántos meses se paga la inversión. Gratis y sin registro.",
    h1: "Cuántas horas ahorrás si automatizás una tarea",
    mark: "horas ahorrás",
    lead: "Cargá cuánto tarda la tarea, cada cuánto se repite y cuánto cuesta la hora de quien la hace. Te mostramos las horas liberadas, el ahorro en pesos y en cuántos meses recuperás la inversión.",
    audience: "Pymes y equipos administrativos de cualquier rubro",
    ogImage: "/og/herramientas-calculadora-horas-ahorradas.png",
    ogAlt: "Calculadora gratuita de horas y pesos ahorrados al automatizar una tarea repetitiva.",
    card: "Horas liberadas, ahorro en pesos y meses de recupero de una tarea repetitiva, para cualquier rubro.",
    sections: [
      {
        id: "como-se-calcula",
        heading: "Cómo se calcula",
        paragraphs: [
          "Multiplicamos el tiempo de la tarea por la cantidad de veces que se repite y por la cantidad de personas que la hacen, llevado a un mes. Después aplicamos el porcentaje que realmente se puede automatizar y lo valuamos con el costo por hora.",
        ],
        formula: "horas ahorradas por mes = (minutos por tarea ÷ 60) × veces por mes × personas × % automatizable",
      },
      {
        id: "supuestos",
        heading: "Supuestos que conviene revisar",
        items: [
          "Un mes tiene 21 días hábiles. Una semana equivale a 52 ÷ 12 = 4,33 semanas por mes.",
          "El costo por hora es lo que cuesta una hora de la persona que hace la tarea: sueldo bruto más cargas sociales, dividido por las horas efectivamente trabajadas. Si no lo sabés, empezá con un valor conservador.",
          "El porcentaje automatizable es la parte de la tarea que el sistema hace solo. Lo habitual es que quede una revisión humana: no pongas 100% salvo que la tarea desaparezca por completo.",
          "El recupero se calcula como inversión inicial ÷ (ahorro mensual menos mantenimiento mensual). Si el mantenimiento supera al ahorro, la inversión no se recupera y te lo avisamos.",
          "Los pesos son nominales, a valores de hoy: no incluye inflación ni ajustes de sueldos.",
          "No se cuentan beneficios que no se miden en horas: menos errores, mejor atención o tareas de más valor para el tiempo liberado.",
        ],
      },
      {
        id: "como-usarla",
        heading: "Cómo usar el resultado",
        paragraphs: [
          "Probá con una sola tarea por vez (cargar facturas, conciliar pagos, responder las mismas consultas) y sumá los resultados. Si el recupero es menor a 12 meses, suele valer la pena mirarlo con más detalle; si es mayor, revisá si se puede automatizar una parte más grande de la tarea o si conviene empezar por otra.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo calculo cuántas horas ahorro al automatizar una tarea?",
        a: "Multiplicá los minutos que lleva la tarea por las veces que se repite en el mes y por la cantidad de personas que la hacen, pasalo a horas y aplicá el porcentaje que se puede automatizar. La calculadora hace esa cuenta y además la valúa en pesos.",
      },
      {
        q: "¿Qué costo por hora tengo que poner?",
        a: "El costo total de una hora de trabajo de quien hace la tarea: sueldo más cargas sociales dividido por las horas efectivamente trabajadas en el mes. Si trabajás por tu cuenta, usá lo que valdría tu hora facturable.",
      },
      {
        q: "¿Qué porcentaje de una tarea se puede automatizar?",
        a: "Depende de la tarea. Las partes repetitivas y con reglas claras (copiar datos, controlar contra una lista, mandar avisos) son las que más se automatizan; las que requieren criterio suelen quedar con una revisión humana. Por eso conviene empezar con un valor entre 50% y 80% y no con 100%.",
      },
      {
        q: "¿Cómo se calcula el recupero de la inversión?",
        a: "Dividiendo el costo de implementación por el ahorro mensual neto, es decir el ahorro en pesos menos el costo mensual de mantenimiento o licencias. El resultado son los meses que tarda en pagarse la inversión.",
      },
    ],
    sources: [],
    disclaimer: "Estimación orientativa basada en los datos que cargás. No es una promesa de ahorro ni una cotización: el resultado real depende de la tarea, de cómo se implemente y de los costos de cada empresa.",
    cta: {
      heading: "¿Querés ver cómo se vería en tu empresa?",
      text: "Probá demos interactivas de automatización para distintos rubros, con datos de ejemplo, y mirá cuánto de tu tarea se puede resolver solo.",
      label: "Ver las demos",
      href: "/es/demos",
    },
    lastmod: "2026-10-29",
    datePublished: "2026-10-29",
  },
];

export interface ToolHub {
  title: string;
  description: string;
  h1: string;
  mark: string;
  lead: string;
  breadcrumb: string;
  ogImage: string;
  ogAlt: string;
  lastmod: string;
  faqs: Array<{ q: string; a: string }>;
}

export const toolHub: ToolHub & { slug?: undefined } = {
  title: "Herramientas gratis para estudios y pymes | Puna Tech",
  description: "Calculadoras gratuitas y sin registro para estudios contables, estudios jurídicos y pymes de Argentina: Convenio Multilateral, plazos y horas ahorradas.",
  h1: "Herramientas gratis para tu estudio y tu empresa",
  mark: "gratis",
  lead: "Calculadoras en español para el trabajo diario de estudios contables, estudios jurídicos y pymes de Argentina. Sin registro, sin tarjeta, con la fuente de cada regla a la vista.",
  breadcrumb: "Herramientas",
  ogImage: "/og/herramientas-hub.png",
  ogAlt: "Herramientas gratuitas de Puna Tech: coeficiente de Convenio Multilateral, plazos procesales y horas ahorradas.",
  lastmod: "2026-10-29",
  faqs: [
    { q: "¿Las herramientas son gratis?", a: "Sí. No hay que registrarse ni dejar un email, y no guardamos los datos que cargás: el cálculo se hace en tu navegador." },
    { q: "¿Los resultados son oficiales?", a: "No. Son orientativos y cada página cita las normas en las que se basa. Verificalos con un profesional matriculado antes de usarlos en una presentación." },
    { q: "¿Qué hago con una duda sobre una regla?", a: "Cada herramienta lista las fuentes oficiales y los supuestos que usa. Si encontrás un error, escribinos desde la página de contacto y lo revisamos." },
  ],
};

export function findTool(slug: string | undefined) {
  return toolDefinitions.find((t) => t.slug === slug);
}
