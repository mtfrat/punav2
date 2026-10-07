/**
 * Spanish use-case landing pages (one everyday problem per page).
 * Copy rules: no invented clients, testimonials, metrics or prices. Scenarios are
 * illustrative and worded as examples ("por ejemplo, …"). No price range until Martin sets one.
 */

export interface UseCaseContent {
  key: string;
  /** Full path, Spanish only. */
  path: string;
  section: "automatizaciones" | "integraciones";
  eyebrow: string;
  title: string;
  lead: string;
  metaTitle: string;
  metaDescription: string;
  serviceType: string;
  ogImage: string;
  ogImageAlt: string;
  /** Short label for cards and internal links. */
  cardTitle: string;
  cardBlurb: string;
  example: string;
  before: string[];
  after: string[];
  howTitle: string;
  how: { title: string; body: string }[];
  fit: string[];
  faqs: [string, string][];
  relatedService: { path: string; title: string };
  relatedPosts: { path: string; title: string }[];
}

export const USE_CASE_OFFER = {
  eyebrow: "La propuesta",
  title: "Automatizamos un proceso en 2 semanas a precio cerrado.",
  body: "Antes de arrancar acordamos por escrito qué entra, qué no, el precio y la fecha de entrega. Si tu proceso no entra en 2 semanas, te lo decimos en la primera llamada en lugar de estirar el proyecto.",
};

export const USE_CASE_STEPS: { title: string; body: string }[] = [
  {
    title: "Llamada de 15 minutos",
    body: "Nos contás cómo funciona hoy el proceso, qué sistemas toca y dónde se traba. Te decimos si conviene automatizarlo y qué parte primero.",
  },
  {
    title: "Propuesta cerrada",
    body: "Te mandamos alcance, precio cerrado y fecha por escrito. Probamos con datos reales tuyos (anonimizados si preferís) antes de prometer resultados.",
  },
  {
    title: "2 semanas y en marcha",
    body: "Construimos, conectamos con tus sistemas y lo ponemos en producción con tu equipo, con revisión humana en los pasos sensibles y documentación para operarlo.",
  },
];

const costFaq = (detail: string): [string, string] => [
  "¿Cuánto tarda y cuánto cuesta?",
  `La propuesta es automatizar un proceso en 2 semanas a precio cerrado. El precio depende de ${detail}. Lo acordamos por escrito antes de empezar, después de una llamada de 15 minutos. No publicamos precios en la web porque cada proceso es distinto.`,
];

export const useCases: UseCaseContent[] = [
  {
    key: "supplier-invoices",
    path: "/es/automatizaciones/carga-de-facturas-proveedores",
    section: "automatizaciones",
    eyebrow: "Automatización · Facturas de proveedores",
    title: "Automatizar la carga de facturas de proveedores",
    lead: "Las facturas llegan en PDF por mail o WhatsApp y alguien las tipea una por una en el sistema. Armamos un flujo que lee cada factura, valida CUIT, importes e IVA contra tus datos y la deja cargada en tu sistema de gestión. Tu equipo solo revisa las dudosas.",
    metaTitle: "Automatizar carga de facturas de proveedores | Puna Tech",
    metaDescription: "Automatizá la carga de facturas de proveedores en PDF: la IA lee CUIT e importes, valida y carga en tu sistema. Tu equipo solo aprueba las dudosas.",
    serviceType: "Automatización de carga de facturas de proveedores",
    ogImage: "/og/carga-de-facturas-proveedores.png",
    ogImageAlt: "Puna Tech: automatizar la carga de facturas de proveedores en PDF.",
    cardTitle: "Carga de facturas de proveedores",
    cardBlurb: "Las facturas en PDF se leen, se validan y se cargan solas en tu sistema. Tu equipo aprueba solo las dudosas.",
    example: "Por ejemplo, una distribuidora donde la administrativa recibe unas 300 facturas en PDF por mes y las carga a mano en Tango. Entre bajar cada adjunto, tipear CUIT, número, fecha, neto, IVA y percepciones, y revisar que coincida con la orden de compra, se le va buena parte del mes.",
    before: [
      "Bajar cada PDF del mail, abrirlo y tipear los datos a mano en el sistema.",
      "Errores de tipeo en CUIT, importes o alícuotas que aparecen recién al cerrar el mes.",
      "Facturas duplicadas o que no coinciden con la orden de compra o el remito.",
      "El cierre depende de que una sola persona esté y llegue con todo.",
    ],
    after: [
      "Las facturas que llegan al mail o a una carpeta se leen solas: proveedor, CUIT, tipo y número, fecha, neto, IVA, percepciones y total.",
      "Cada dato se valida: CUIT contra tu padrón de proveedores, sumas que cierran, duplicados y, si la tenés, la orden de compra.",
      "Lo que pasa todas las validaciones queda cargado en tu sistema. Lo dudoso va a una bandeja para que alguien lo apruebe con un clic.",
      "Queda registro de cada factura: qué se leyó, qué se validó y quién aprobó.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      { title: "Lectura con IA, control con reglas", body: "La IA lee el PDF aunque cada proveedor use un formato distinto. Lo que tiene que ser exacto (importes, CUIT, alícuotas) lo verifican reglas, no la IA. Si algo no cierra, no se carga: se marca." },
      { title: "Conectado a tu sistema de gestión", body: "Cargamos en Tango, Bejerman, un ERP propio o una planilla, según lo que uses. Si tu sistema tiene API o importación por archivo, usamos eso. Si no, lo vemos juntos en la llamada antes de prometer nada." },
      { title: "Tu equipo sigue al mando", body: "La administrativa pasa de tipear a revisar excepciones. Las reglas de aprobación (montos, proveedores nuevos, diferencias) las definís vos." },
    ],
    fit: [
      "Recibís decenas o cientos de facturas de proveedores por mes.",
      "La carga hoy es manual y la hacen una o dos personas.",
      "Ya tuviste errores o atrasos en el cierre por facturas mal cargadas.",
    ],
    faqs: [
      ["¿Se puede automatizar la carga de facturas de proveedores en PDF?", "Sí. Un flujo puede tomar los PDF que llegan por mail o a una carpeta, extraer los datos con IA, validarlos con reglas y cargarlos en tu sistema. Las facturas que no pasan las validaciones quedan para revisión humana."],
      ["¿Funciona con Tango u otro sistema de gestión?", "Trabajamos con lo que ya usás. Si el sistema tiene API o permite importar archivos, cargamos ahí directamente. Si no, buscamos la vía más segura (por ejemplo, un archivo de importación que alguien sube) y te lo decimos antes de arrancar."],
      ["¿Qué pasa si la IA lee mal un dato?", "Cada factura se valida antes de cargarse: CUIT contra tu padrón, sumas de neto, IVA y total, duplicados y, si la tenés, la orden de compra. Si algo no cierra, la factura no se carga sola: va a una bandeja de revisión."],
      ["¿Sirve si cada proveedor manda un formato distinto?", "Sí. Esa es justamente la parte donde la IA ayuda: no depende de una plantilla fija por proveedor. Igual probamos con facturas reales tuyas antes de ponerlo en producción."],
      costFaq("el volumen de facturas, cuántas validaciones hacen falta y cómo se conecta tu sistema"),
      ["¿Qué necesitamos de nuestro lado?", "Un lote de facturas reales (anonimizadas si preferís), acceso de prueba a tu sistema o a su importación, y una persona que conozca el proceso para validar las reglas."],
    ],
    relatedService: { path: "/es/servicios/automatizacion-ia", title: "Automatización de procesos con IA" },
    relatedPosts: [
      { path: "/es/blog/cuando-usar-ia-vs-software-deterministico", title: "Cuándo usar IA y cuándo conviene software determinístico" },
    ],
  },
  {
    key: "mercado-pago",
    path: "/es/integraciones/mercado-pago",
    section: "integraciones",
    eyebrow: "Integración · Mercado Pago",
    title: "Integrar Mercado Pago con tu sistema y conciliar cada pago con su factura",
    lead: "Cobrás por Mercado Pago, pero tu sistema no se entera. Conectamos Mercado Pago con tu sistema de gestión o tu planilla para que cada cobro quede asociado a su factura o pedido, con comisiones y retenciones registradas y las diferencias marcadas.",
    metaTitle: "Integrar Mercado Pago y conciliar pagos | Puna Tech",
    metaDescription: "Integrá Mercado Pago con tu sistema: conciliación automática de cada pago con su factura, con comisiones y retenciones, y las diferencias marcadas.",
    serviceType: "Integración de Mercado Pago y conciliación de pagos",
    ogImage: "/og/integracion-mercado-pago.png",
    ogImageAlt: "Puna Tech: integrar Mercado Pago con tu sistema y conciliar pagos con facturas.",
    cardTitle: "Integración y conciliación de Mercado Pago",
    cardBlurb: "Cada cobro de Mercado Pago queda asociado a su factura, con comisiones y retenciones, y las diferencias marcadas.",
    example: "Por ejemplo, un comercio que cobra varias decenas de pagos por día entre link de pago, QR y transferencias. A fin de semana alguien baja el reporte de Mercado Pago, lo pega en Excel y trata de adivinar a qué cliente y a qué factura corresponde cada movimiento, y por qué lo acreditado no coincide con lo vendido.",
    before: [
      "Bajar reportes de Mercado Pago y cruzarlos a mano con las facturas o pedidos.",
      "Pagos sin referencia: no se sabe de qué cliente ni de qué factura son.",
      "Comisiones, retenciones y contracargos que hacen que lo cobrado no coincida con lo facturado.",
      "Facturas que figuran impagas aunque el cliente ya pagó (y se lo reclamás igual).",
    ],
    after: [
      "Cada pago que entra en Mercado Pago se registra solo en tu sistema, con su referencia, fecha, medio y monto.",
      "Conciliación automática contra facturas o pedidos pendientes, por referencia, monto, cliente y fecha.",
      "Comisiones, retenciones e impuestos separados, para que el neto acreditado cierre con lo facturado.",
      "Un resumen diario con lo conciliado y una lista corta de diferencias para revisar.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      { title: "Conectado a la API de Mercado Pago", body: "Usamos las notificaciones de pago, la API y los reportes de Mercado Pago para tener cada movimiento sin bajar archivos a mano." },
      { title: "Reglas de conciliación claras", body: "Definimos con vos cómo se empareja un pago con una factura: referencia del link de pago, monto, CUIT o email del cliente, ventana de fechas. Lo que no coincide con certeza no se marca como cobrado: queda en una bandeja de diferencias." },
      { title: "Hacia tu sistema de gestión", body: "Registramos el cobro en tu sistema (Tango, Bejerman, Odoo, un ERP propio o una planilla) por API o importación. Si además querés que la factura se emita sola, lo vemos como siguiente paso." },
    ],
    fit: [
      "Cobrás una parte importante de tus ventas por Mercado Pago.",
      "Alguien concilia a mano todas las semanas, o directamente no se concilia.",
      "Tenés clientes que pagaron y siguen apareciendo como deudores.",
    ],
    faqs: [
      ["¿Se puede integrar Mercado Pago con mi sistema de gestión?", "Sí, si tu sistema tiene una forma de recibir datos: API, base de datos o importación por archivo. Mercado Pago tiene API y notificaciones de pago, así que de ese lado casi siempre está resuelto. Lo que define el trabajo es cómo entra la información en tu sistema."],
      ["¿Qué es la conciliación automática de Mercado Pago?", "Es cruzar solo, todos los días, cada pago acreditado con la factura o el pedido que corresponde, descontando comisiones y retenciones, y marcar lo que no coincide para que alguien lo revise."],
      ["¿Qué pasa con los pagos que no tienen referencia?", "Se intentan emparejar por monto, cliente y fecha. Si no hay certeza, el pago no se asigna solo: va a una lista de diferencias con las facturas candidatas para que alguien elija con un clic."],
      ["¿Incluye comisiones, retenciones y contracargos?", "Sí. Los movimientos de Mercado Pago traen el detalle de comisiones e impuestos retenidos. Los registramos por separado para que el neto acreditado cierre con lo facturado. Contracargos y devoluciones también se marcan."],
      ["¿Necesitan acceso a mi cuenta de Mercado Pago?", "Trabajamos con credenciales de una aplicación de Mercado Pago con los permisos mínimos para leer pagos y reportes, no con tu usuario y contraseña. Dónde se guardan y quién tiene acceso queda escrito en la propuesta."],
      costFaq("el volumen de pagos, las reglas de conciliación y cómo se conecta tu sistema de gestión"),
    ],
    relatedService: { path: "/es/servicios/integraciones-de-datos", title: "Integración de sistemas CRM, ERP y APIs" },
    relatedPosts: [
      { path: "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", title: "Cuándo dejar Zapier o n8n por software a medida" },
    ],
  },
  {
    key: "whatsapp-orders",
    path: "/es/automatizaciones/pedidos-por-whatsapp",
    section: "automatizaciones",
    eyebrow: "Automatización · Pedidos por WhatsApp",
    title: "Automatizar los pedidos por WhatsApp de tu empresa",
    lead: "Tus clientes piden por WhatsApp y alguien copia cada pedido al sistema, chequea stock y pasa precios a mano. Armamos un flujo que entiende el pedido, lo arma con el precio y el stock reales de tu sistema y lo deja listo para que el vendedor lo confirme.",
    metaTitle: "Automatizar pedidos por WhatsApp para empresas | Puna Tech",
    metaDescription: "Automatizá WhatsApp en tu empresa: los pedidos se arman solos con precio y stock reales de tu sistema y el vendedor solo confirma. API oficial de Meta.",
    serviceType: "Automatización de pedidos por WhatsApp para empresas",
    ogImage: "/og/pedidos-por-whatsapp.png",
    ogImageAlt: "Puna Tech: automatizar pedidos por WhatsApp con precio y stock reales.",
    cardTitle: "Pedidos por WhatsApp",
    cardBlurb: "Los pedidos que llegan por WhatsApp se arman con precio y stock reales de tu sistema. El vendedor solo confirma.",
    example: "Por ejemplo, una distribuidora de bebidas que recibe pedidos de almacenes por WhatsApp, con mensajes como “mandame 3 cajas de la de litro y 2 de la chica”. El vendedor tiene que interpretar, buscar el código, mirar si hay stock, calcular el precio de la lista que corresponde y cargarlo en el sistema. A la tarde, los pedidos se acumulan.",
    before: [
      "Pedidos escritos a mano, con abreviaturas, audios y fotos de listas.",
      "Copiar cada pedido al sistema, producto por producto.",
      "Precios de una lista vieja o equivocada, y stock que no se chequeó antes de confirmar.",
      "Pedidos que se pierden en el chat o se cargan dos veces.",
    ],
    after: [
      "El pedido que llega por WhatsApp se interpreta y se convierte en productos y cantidades de tu catálogo.",
      "Se arma con el precio de la lista del cliente y el stock real de tu sistema, en el momento.",
      "El vendedor ve el borrador, corrige si hace falta y confirma. Recién ahí se carga en el sistema y se le responde al cliente.",
      "Si falta stock o algo no se entendió, el flujo lo marca y propone una alternativa o repregunta.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      { title: "WhatsApp oficial, no un truco", body: "Usamos la plataforma oficial de WhatsApp Business de Meta, conectada a tu número. Nada de extensiones que leen tu WhatsApp Web ni números que se bloquean." },
      { title: "La IA interpreta, tu sistema decide", body: "La IA entiende el mensaje y lo traduce a productos de tu catálogo. Precio, stock y condiciones salen siempre de tu sistema, no de la IA." },
      { title: "Una persona confirma", body: "Al principio, cada pedido lo confirma un vendedor antes de cargarse. Cuando el flujo demuestra que acierta, definís qué pedidos pueden pasar solos (por ejemplo, clientes frecuentes y productos con stock)." },
    ],
    fit: [
      "Recibís pedidos de clientes (comercios, mayoristas, gastronómicos) por WhatsApp todos los días.",
      "Tus vendedores pasan horas copiando pedidos al sistema.",
      "Ya tuviste errores de precio o pedidos confirmados sin stock.",
    ],
    faqs: [
      ["¿Se pueden automatizar los pedidos que llegan por WhatsApp?", "Sí. Con la API oficial de WhatsApp Business, los mensajes llegan a un flujo que los interpreta, arma el pedido con tu catálogo, precio y stock, y lo deja listo para confirmar o cargar en tu sistema."],
      ["¿Necesito la API de WhatsApp Business? ¿Pierdo mi número?", "Se usa la plataforma oficial de WhatsApp Business de Meta. Se puede usar un número nuevo o pasar el que ya tenés; cada opción tiene pros y contras y lo vemos en la llamada. Meta cobra los mensajes según sus tarifas vigentes, aparte de nuestro trabajo."],
      ["¿Es un chatbot?", "No es un chatbot que charla con tus clientes. Es un flujo enfocado en tomar pedidos: entiende lo que te piden, lo arma con datos reales y un vendedor lo confirma. Si el cliente pregunta otra cosa, la conversación sigue con una persona."],
      ["¿Funciona con audios y fotos de listas?", "Se pueden transcribir audios y leer fotos de listas escritas, pero con más margen de error que un texto. Por eso esos pedidos siempre pasan por confirmación humana."],
      ["¿Con qué sistema de stock y precios se conecta?", "Con el que uses: Tango, Bejerman, un ERP propio, una tienda online o incluso una planilla de Google, siempre que haya una forma confiable de leer stock y precios y de cargar el pedido."],
      costFaq("cuántos productos y listas de precios tenés, el volumen de pedidos y cómo se conecta tu sistema"),
    ],
    relatedService: { path: "/es/servicios/automatizacion-ia", title: "Automatización de procesos con IA" },
    relatedPosts: [
      { path: "/es/blog/cuando-usar-ia-vs-software-deterministico", title: "Cuándo usar IA y cuándo conviene software determinístico" },
      { path: "/es/blog/auditar-integracion-crm-seguimiento-comercial", title: "Cómo auditar una integración CRM y el seguimiento comercial" },
    ],
  },
];

export function getUseCaseByPath(path: string) {
  return useCases.find((item) => item.path === path.replace(/\/+$/, ""));
}
