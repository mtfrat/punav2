/**
 * Spanish use-case landing pages (one everyday problem per page).
 * Copy rules: no invented clients, testimonials, metrics or prices. Scenarios are
 * illustrative and worded as examples ("por ejemplo, …"). No price range until Martin sets one.
 */

export interface UseCaseContent {
  key: string;
  /** Full path, Spanish only. */
  path: string;
  /** Sitemap <lastmod>: last significant change to this page's copy (YYYY-MM-DD). Bump it when the copy changes. */
  updatedAt: string;
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

export interface UseCaseHub {
  section: UseCaseContent["section"];
  path: string;
  /** Sitemap <lastmod>: last significant change to the hub copy (YYYY-MM-DD). */
  updatedAt: string;
  eyebrow: string;
  title: string;
  lead: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
}

/** Spanish index pages for the use-case clusters. No English alternate yet. */
export const useCaseHubs: UseCaseHub[] = [
  {
    section: "automatizaciones",
    path: "/es/automatizaciones",
    updatedAt: "2026-10-16",
    eyebrow: "Automatizaciones",
    title: "Automatizaciones para el día a día de tu empresa",
    lead: "Automatizamos procesos que hoy se hacen a mano: facturas de proveedores, pedidos por WhatsApp, cobranzas, facturación electrónica ARCA y conciliación bancaria. Un proceso en 2 semanas a precio cerrado.",
    intro: "Elegí el proceso. Cada página cuenta cómo es hoy, cómo queda y cómo lo resolvemos.",
    metaTitle: "Automatizaciones de procesos para empresas | Puna Tech",
    metaDescription: "Automatizaciones para empresas en Argentina: facturación electrónica ARCA, facturas, WhatsApp, cobranzas y conciliación. 2 semanas a precio cerrado.",
  },
  {
    section: "integraciones",
    path: "/es/integraciones",
    updatedAt: "2026-10-15",
    eyebrow: "Integraciones",
    title: "Integraciones con Mercado Libre, Mercado Pago y Tienda Nube",
    lead: "Conectamos Mercado Pago, Tienda Nube y Mercado Libre con tu sistema de gestión: conciliación de pagos, stock, pedidos y facturas, sin cruzar reportes a mano.",
    intro: "Elegí la herramienta. Cada página cuenta qué datos viajan, qué queda en tu sistema y qué se marca para revisar.",
    metaTitle: "Integraciones ML, Mercado Pago y Tienda Nube | Puna Tech",
    metaDescription: "Integraciones para empresas en Argentina: Mercado Pago, Tienda Nube y Mercado Libre con tu stock y ERP. Diagnóstico en 15 min.",
  },
];

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
    updatedAt: "2026-10-15",
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
      { title: "Conectado a tu sistema de gestión", body: "Cargamos en Tango, Bejerman, un ERP propio o una planilla, según lo que uses. Si tu sistema tiene API o importación por archivo, usamos eso. Si no, lo vemos juntos en la llamada antes de prometer nada. Emitir tus propios comprobantes A, B o C es otro flujo: [facturación electrónica ARCA](/es/automatizaciones/facturacion-electronica-arca)." },
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
    updatedAt: "2026-10-16",
    section: "integraciones",
    eyebrow: "Integración · Mercado Pago",
    title: "Conciliación de pagos con Mercado Pago y tu sistema",
    lead: "Cobrás por Mercado Pago, pero tu sistema no se entera. La conciliación de pagos asocia cada cobro a su factura o pedido, con comisiones y retenciones registradas y las diferencias marcadas.",
    metaTitle: "Conciliación de pagos con Mercado Pago | Puna Tech",
    metaDescription: "Conciliación de pagos con Mercado Pago: cada cobro queda asociado a su factura, con comisiones y retenciones, y las diferencias marcadas.",
    serviceType: "Integración de Mercado Pago y conciliación de pagos",
    ogImage: "/og/integracion-mercado-pago.png",
    ogImageAlt: "Puna Tech: conciliación de pagos con Mercado Pago y tu sistema.",
    cardTitle: "Conciliación de pagos con Mercado Pago",
    cardBlurb: "La conciliación de pagos asocia cada cobro de Mercado Pago a su factura, con comisiones, retenciones y las diferencias marcadas.",
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
      { title: "Hacia tu sistema de gestión", body: "Registramos el cobro en tu sistema (Tango, Bejerman, Odoo, un ERP propio o una planilla) por API o importación. Si además querés que la factura se emita sola, lo vemos como siguiente paso. Si el cruce también incluye el extracto del banco, está en [conciliación bancaria](/es/automatizaciones/conciliacion-bancaria). Si las ventas entran por Mercado Libre, el stock y la factura de ese canal van en [integrar Mercado Libre](/es/integraciones/mercado-libre)." },
    ],
    fit: [
      "Cobrás una parte importante de tus ventas por Mercado Pago.",
      "Alguien concilia a mano todas las semanas, o directamente no se concilia.",
      "Tenés clientes que pagaron y siguen apareciendo como deudores.",
    ],
    faqs: [
      ["¿Se puede integrar Mercado Pago con mi sistema de gestión?", "Sí, si tu sistema tiene una forma de recibir datos: API, base de datos o importación por archivo. Mercado Pago tiene API y notificaciones de pago, así que de ese lado casi siempre está resuelto. Lo que define el trabajo es cómo entra la información en tu sistema."],
      ["¿Qué es la conciliación de pagos con Mercado Pago?", "Es cruzar, todos los días, cada pago acreditado en Mercado Pago con la factura o el pedido que corresponde. Esa conciliación de pago descuenta comisiones y retenciones, y deja marcado lo que no coincide para que alguien lo revise, en lugar de bajar el reporte y cruzarlo a mano."],
      ["¿Qué pasa con los pagos que no tienen referencia?", "Se intentan emparejar por monto, cliente y fecha. Si no hay certeza, el pago no se asigna solo: va a una lista de diferencias con las facturas candidatas para que alguien elija con un clic."],
      ["¿Incluye comisiones, retenciones y contracargos?", "Sí. Los movimientos de Mercado Pago traen el detalle de comisiones e impuestos retenidos. Los registramos por separado para que el neto acreditado cierre con lo facturado. Contracargos y devoluciones también se marcan."],
      ["¿Necesitan acceso a mi cuenta de Mercado Pago?", "Trabajamos con credenciales de una aplicación de Mercado Pago con los permisos mínimos para leer pagos y reportes, no con tu usuario y contraseña. Dónde se guardan y quién tiene acceso queda escrito en la propuesta."],
      costFaq("el volumen de pagos, las reglas de conciliación y cómo se conecta tu sistema de gestión"),
    ],
    relatedService: { path: "/es/servicios/integraciones-de-datos", title: "integración de sistemas" },
    relatedPosts: [
      { path: "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", title: "Cuándo dejar Zapier o n8n por software a medida" },
    ],
  },
  {
    key: "whatsapp-orders",
    path: "/es/automatizaciones/pedidos-por-whatsapp",
    updatedAt: "2026-10-17",
    section: "automatizaciones",
    eyebrow: "Automatización · Pedidos por WhatsApp",
    title: "Sistema de pedidos por WhatsApp para empresas",
    lead: "Si tus clientes piden por WhatsApp y alguien copia cada pedido al sistema, chequea stock y pasa precios a mano, eso ya es un sistema de pedidos — solo que vive en el chat. Armamos un flujo que entiende el pedido, lo arma con el precio y el stock reales de tu sistema y lo deja listo para que el vendedor lo confirme.",
    metaTitle: "Sistema de pedidos por WhatsApp para empresas | Puna Tech",
    metaDescription: "Sistema de pedidos por WhatsApp para empresas en Argentina: precio y stock reales, el vendedor confirma. API oficial de Meta. Diagnóstico en 15 min.",
    serviceType: "Sistema de pedidos por WhatsApp para empresas",
    ogImage: "/og/pedidos-por-whatsapp.png",
    ogImageAlt: "Puna Tech: sistema de pedidos por WhatsApp con precio y stock reales.",
    cardTitle: "Pedidos por WhatsApp",
    cardBlurb: "Sistema de pedidos por WhatsApp: se arman con precio y stock reales. El vendedor solo confirma.",
    example: "Por ejemplo, una distribuidora de bebidas que recibe pedidos de almacenes por WhatsApp, con mensajes como “mandame 3 cajas de la de litro y 2 de la chica”. El vendedor tiene que interpretar, buscar el código, mirar si hay stock, calcular el precio de la lista que corresponde y cargarlo en el sistema. A la tarde, los pedidos se acumulan y alguno se carga dos veces o con el precio viejo.",
    before: [
      "Pedidos escritos a mano, con abreviaturas, audios y fotos de listas.",
      "Copiar cada pedido al sistema, producto por producto.",
      "Precios de una lista vieja o equivocada, y stock que no se chequeó antes de confirmar.",
      "Pedidos que se pierden en el chat o se cargan dos veces.",
      "Un Excel o un grupo de WhatsApp que hace de “sistema de pedidos” informal.",
    ],
    after: [
      "El pedido que llega por WhatsApp se interpreta y se convierte en productos y cantidades de tu catálogo.",
      "Se arma con el precio de la lista del cliente y el stock real de tu sistema, en el momento.",
      "El vendedor ve el borrador, corrige si hace falta y confirma. Recién ahí se carga en el sistema y se le responde al cliente.",
      "Si falta stock o algo no se entendió, el flujo lo marca y propone una alternativa o repregunta.",
      "Queda registro de cada pedido: quién pidió, qué se confirmó y qué quedó pendiente, sin depender del historial del chat.",
    ],
    howTitle: "Cómo armamos el sistema de pedidos por WhatsApp",
    how: [
      { title: "WhatsApp oficial, no un truco", body: "Usamos la plataforma oficial de WhatsApp Business de Meta, conectada a tu número. Nada de extensiones que leen tu WhatsApp Web ni números que se bloquean. El canal comercial sigue siendo WhatsApp; lo que cambia es que el pedido deja de vivir solo en el chat." },
      { title: "La IA interpreta, tu sistema decide", body: "La IA entiende el mensaje y lo traduce a productos de tu catálogo. Precio, stock, descuentos y condiciones salen siempre de tu sistema (Tango, Bejerman, ERP propio, tienda o planilla), no de la IA. Si el código no matchea, no se inventa un producto." },
      { title: "Una persona confirma", body: "Al principio, cada pedido lo confirma un vendedor antes de cargarse. Cuando el flujo demuestra que acierta, definís qué pedidos pueden pasar solos (por ejemplo, clientes frecuentes y productos con stock) y cuáles siguen con revisión." },
      { title: "Respuesta al cliente y carga al sistema", body: "Cuando el vendedor confirma, el pedido queda en tu sistema de gestión y se puede responder al cliente por el mismo WhatsApp con el detalle acordado. Si preferís que la respuesta la mande una persona, también se puede." },
    ],
    fit: [
      "Recibís pedidos de clientes (comercios, mayoristas, gastronómicos) por WhatsApp todos los días.",
      "Tus vendedores pasan horas copiando pedidos al sistema.",
      "Ya tuviste errores de precio o pedidos confirmados sin stock.",
      "Estás buscando un sistema de pedidos por WhatsApp para empresas, no un chatbot genérico.",
    ],
    faqs: [
      ["¿Qué es un sistema de pedidos por WhatsApp para empresas?", "Es un flujo que toma lo que el cliente escribe (o manda por audio/foto), lo convierte en un pedido con productos de tu catálogo, precio y stock reales, y lo deja listo para que un vendedor lo confirme antes de cargarlo en tu sistema. WhatsApp sigue siendo el canal; el sistema evita que el pedido viva solo en el chat."],
      ["¿Se pueden automatizar los pedidos que llegan por WhatsApp?", "Sí. Con la API oficial de WhatsApp Business, los mensajes llegan a un flujo que los interpreta, arma el pedido con tu catálogo, precio y stock, y lo deja listo para confirmar o cargar en tu sistema."],
      ["¿Necesito la API de WhatsApp Business? ¿Pierdo mi número?", "Se usa la plataforma oficial de WhatsApp Business de Meta. Se puede usar un número nuevo o pasar el que ya tenés; cada opción tiene pros y contras y lo vemos en la llamada. Meta cobra los mensajes según sus tarifas vigentes, aparte de nuestro trabajo."],
      ["¿Es un chatbot?", "No es un chatbot que charla con tus clientes. Es un sistema de pedidos: entiende lo que te piden, lo arma con datos reales y un vendedor lo confirma. Si el cliente pregunta otra cosa, la conversación sigue con una persona."],
      ["¿Funciona con audios y fotos de listas?", "Se pueden transcribir audios y leer fotos de listas escritas, pero con más margen de error que un texto. Por eso esos pedidos siempre pasan por confirmación humana."],
      ["¿Con qué sistema de stock y precios se conecta?", "Con el que uses: Tango, Bejerman, un ERP propio, una tienda online o incluso una planilla de Google, siempre que haya una forma confiable de leer stock y precios y de cargar el pedido. Si también necesitás conectar el CRM o el ERP entre sí, lo vemos como [integración de sistemas](/es/servicios/integraciones-de-datos)."],
      ["¿Cuánto tarda poner en marcha un sistema de pedidos por WhatsApp?", "Un proceso acotado (tomar el pedido, armarlo con precio y stock, confirmación humana y carga) entra en la propuesta de 2 semanas a precio cerrado, si el alcance cierra en la llamada. Si hay que ordenar el catálogo o conectar varios sistemas frágiles, te lo decimos antes y lo partimos."],
      costFaq("cuántos productos y listas de precios tenés, el volumen de pedidos y cómo se conecta tu sistema"),
    ],
    relatedService: { path: "/es/servicios/automatizacion-ia", title: "Automatización de procesos con IA" },
    relatedPosts: [
      { path: "/es/blog/cuando-usar-ia-vs-software-deterministico", title: "Cuándo usar IA y cuándo conviene software determinístico" },
      { path: "/es/blog/auditar-integracion-crm-seguimiento-comercial", title: "Cómo auditar una integración CRM y el seguimiento comercial" },
    ],
  },
  {
    key: "collections",
    path: "/es/automatizaciones/automatizar-cobranzas",
    updatedAt: "2026-10-16",
    section: "automatizaciones",
    eyebrow: "Automatización · Cobranzas",
    title: "Automatizar cobranzas para pymes y empresas",
    lead: "Las facturas vencen y alguien persigue a cada cliente por WhatsApp o por mail, con el saldo anotado en una planilla. Armamos un flujo para automatizar cobranzas: toma los vencimientos de tu sistema, prepara el aviso con el saldo real y lo deja listo para que tu equipo lo confirme antes de enviarlo.",
    metaTitle: "Automatizar cobranzas para empresas | Puna Tech",
    metaDescription: "Automatizar cobranzas para pymes en Argentina: avisos de vencimiento y seguimiento de facturas impagas, con revisión humana. Diagnóstico en 15 min.",
    serviceType: "Automatización de cobranzas para empresas",
    ogImage: "/og/automatizar-cobranzas.png",
    ogImageAlt: "Puna Tech: automatizar cobranzas para pymes y empresas en Argentina.",
    cardTitle: "Automatizar cobranzas",
    cardBlurb: "Los avisos de facturas vencidas salen del saldo real de tu sistema. Tu equipo confirma antes de enviar.",
    example: "Por ejemplo, una distribuidora donde cada lunes alguien revisa quién debe, copia el saldo a un mensaje de WhatsApp y anota en una planilla quién prometió pagar. Entre facturas vencidas, pagos parciales y clientes que ya transfirieron, se le va buena parte de la mañana.",
    before: [
      "Revisar a mano quién debe y desde cuándo, en el sistema o en una planilla.",
      "Mandar recordatorios uno por uno por WhatsApp o mail, copiando saldo y vencimiento.",
      "Pagos que llegan por transferencia y no se imputan, y se le reclama a quien ya pagó.",
      "Promesas de pago anotadas en un chat que nadie vuelve a mirar.",
    ],
    after: [
      "El flujo lee las facturas vencidas y por vencer desde tu sistema, con cliente, saldo y fecha.",
      "Arma el recordatorio con esos datos y lo deja para que alguien lo confirme antes de enviarlo.",
      "Cuando entra un pago, se intenta imputar a la factura. Si no hay certeza, queda en una bandeja para revisar.",
      "Queda registro de cada aviso y cada pago, para que el seguimiento no dependa de una sola persona.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      {
        title: "El saldo sale de tu sistema",
        body: "Cliente, factura, vencimiento y saldo salen de tu sistema de gestión, no de la IA. La IA redacta el texto del aviso. Las reglas deciden a quién, cuándo y con qué monto. Si el número no cierra, el aviso no sale.",
      },
      {
        title: "Alguien confirma antes de avisar",
        body: "Al principio, cada recordatorio lo aprueba una persona del equipo. Cuando el flujo demuestra que acierta, definís qué avisos pueden salir solos (por ejemplo, el primer recordatorio de un cliente habitual) y cuáles siguen pasando por vos.",
      },
      {
        title: "Lo cobrado y lo dudoso, separados",
        body: "Transferencias, cheques o Mercado Pago se cruzan con las facturas pendientes. Lo que no coincide con certeza no se marca como cobrado. Si el problema principal es cruzar el extracto del banco o Mercado Pago con las facturas, ese cruce es [conciliación bancaria](/es/automatizaciones/conciliacion-bancaria). Acá el foco es el seguimiento de lo vencido. Si la factura de la venta todavía hay que emitirla, el comprobante está en [facturación electrónica ARCA](/es/automatizaciones/facturacion-electronica-arca).",
      },
    ],
    fit: [
      "Tenés clientes que pagan a plazo y alguien los persigue a mano.",
      "Los recordatorios salen tarde, o se le reclama a quien ya pagó.",
      "El seguimiento vive en WhatsApp, mails y una planilla que no cierra con el sistema.",
    ],
    faqs: [
      ["¿Se pueden automatizar las cobranzas de una pyme?", "Sí. Un flujo puede leer las facturas vencidas o por vencer en tu sistema, armar el recordatorio con el saldo real y dejarlo para que alguien lo confirme antes de enviarlo por mail o WhatsApp. Lo que no cierra no se manda solo."],
      ["¿Qué son las cobranzas automáticas para empresas?", "Es que el seguimiento de facturas impagas deje de depender de que alguien revise una planilla y escriba cada aviso a mano. El sistema propone a quién avisarle y con qué saldo. Una persona confirma los pasos sensibles, como enviar un reclamo o marcar una factura como cobrada."],
      ["¿El recordatorio se manda solo al cliente?", "No al principio. Cada aviso queda para que alguien del equipo lo revise y lo envíe. Recién cuando el flujo acierta, se puede definir qué recordatorios salen sin esa confirmación (por ejemplo, un primer aviso de un cliente habitual)."],
      ["¿Funciona si cobrás por transferencia, cheque o Mercado Pago?", "Sí, si el pago puede entrar a tu sistema o a una planilla de forma confiable. El flujo intenta imputarlo a la factura pendiente. Si no hay certeza (un monto parcial, un pago sin referencia), no lo marca como cobrado: queda para revisar. Cruzar el extracto del banco o Mercado Pago con las facturas es la conciliación bancaria, un flujo aparte."],
      costFaq("cuántos clientes y facturas entran en el seguimiento, por dónde se avisa y cómo se conecta tu sistema"),
      ["¿Qué necesitamos de nuestro lado?", "Acceso de prueba a las facturas pendientes (o un archivo de export), las reglas de aviso que ya usan (a los cuántos días, con qué tono) y una persona que conozca el proceso para validarlas."],
    ],
    relatedService: { path: "/es/servicios/automatizacion-ia", title: "Automatización de procesos con IA" },
    relatedPosts: [
      { path: "/es/blog/cuando-usar-ia-vs-software-deterministico", title: "Cuándo usar IA y cuándo conviene software determinístico" },
    ],
  },
  {
    key: "arca-invoicing",
    path: "/es/automatizaciones/facturacion-electronica-arca",
    updatedAt: "2026-10-16",
    section: "automatizaciones",
    eyebrow: "Automatización · Facturación electrónica",
    title: "Automatizar la facturación electrónica ARCA",
    lead: "Las ventas ya están en el ERP o en una planilla, y alguien entra al facturador de ARCA (ex AFIP) a emitir cada comprobante. Armamos un flujo que toma esa venta, valida el CUIT y la condición fiscal, emite el comprobante A, B o C y lo vuelve a dejar en tu sistema. Si un dato no cierra, no se factura solo.",
    metaTitle: "Automatizar facturación electrónica ARCA | Puna Tech",
    metaDescription: "Facturación electrónica ARCA: comprobantes A, B y C con CUIT, sincronizados al ERP y al stock. Para pymes en Argentina. Diagnóstico en 15 min.",
    serviceType: "Automatización de facturación electrónica ARCA",
    ogImage: "/og/facturacion-electronica-arca.png",
    ogImageAlt: "Puna Tech: automatizar la facturación electrónica ARCA para pymes.",
    cardTitle: "Facturación electrónica ARCA",
    cardBlurb: "Cada venta emite el comprobante A, B o C cuando el CUIT y el importe cierran. El número vuelve al ERP.",
    example: "Por ejemplo, una distribuidora que factura a la tarde lo que vendió en el mostrador y por Mercado Libre. Alguien abre el facturador, busca el CUIT, elige A, B o C y vuelve a tipear ítems que ya estaban en el pedido. Un consumidor final con factura A, o una venta descontada del stock y sin comprobante, aparece recién cuando cierra el mes.",
    before: [
      "Abrir ARCA o el facturador y cargar cada venta a mano.",
      "Elegir de memoria si corresponde comprobante A, B o C.",
      "Un CUIT mal tipeado, un punto de venta equivocado o un total que no coincide con el pedido.",
      "Stock que ya se movió y una factura que sigue pendiente.",
    ],
    after: [
      "La venta sale del ERP o de la planilla, con ítems, cantidades e importes.",
      "El flujo valida CUIT y condición fiscal, y define A, B o C con la regla que acordamos.",
      "Si cierra, el comprobante se emite por el facturador que ya usás con ARCA y el número vuelve a la venta.",
      "Si falta el CUIT, no cierra el IVA o la condición no está clara, queda en una bandeja. No se factura solo.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      {
        title: "La factura sale de la venta",
        body: "Ítems, cantidades, precio e impuestos salen del pedido que ya está en tu sistema. El importe no lo pone la IA: si el neto, el IVA y el total no cierran, el comprobante no se emite.",
      },
      {
        title: "A, B o C según la condición fiscal",
        body: "Un responsable inscripto emite A a otro responsable inscripto, y B a un monotributista, exento o consumidor final. Un monotributista emite C. El CUIT se valida contra el padrón que ya usás. Si no hay certeza, no se elige un tipo a ciegas.",
      },
      {
        title: "Vuelto al ERP y al stock",
        body: "El número de comprobante queda en la venta, y el stock de esos ítems queda atado a esa misma operación. Si la venta entró por Mercado Libre, el canal está en [integrar Mercado Libre](/es/integraciones/mercado-libre). Las facturas de proveedores que te llegan en PDF son [carga de facturas de proveedores](/es/automatizaciones/carga-de-facturas-proveedores). Lo que quedó impago se sigue en [automatizar cobranzas](/es/automatizaciones/automatizar-cobranzas). Lo que el banco o Mercado Pago ya acreditó y hay que cruzar con la factura está en [conciliación bancaria](/es/automatizaciones/conciliacion-bancaria).",
      },
    ],
    fit: [
      "Emitís comprobantes todos los días y alguien los carga a mano.",
      "Las ventas ya están en Tango, Bejerman, otro ERP o una planilla.",
      "Ya salió una factura con el tipo equivocado, un CUIT mal cargado o una venta sin facturar.",
    ],
    faqs: [
      ["¿Se puede automatizar la facturación electrónica de ARCA?", "Sí. Un flujo puede tomar la venta de tu ERP o de una planilla, validar el CUIT y la condición fiscal, y emitir el comprobante A, B o C por el facturador que ya usás con ARCA (ex AFIP). Si un dato no cierra, la factura no sale sola. No reemplazamos a ARCA ni te pedimos la clave fiscal."],
      ["¿Cómo integrar la facturación electrónica con un ERP en Argentina?", "La venta que ya está en el ERP dispara el comprobante, y el número vuelve a esa venta. El stock de los ítems queda atado a la misma operación. No es cambiar de facturador ni tipear cada ticket en la web de ARCA. Si tu sistema no tiene una vía segura para recibir el comprobante, te lo decimos antes de prometerlo."],
      ["¿Qué comprobante corresponde, A, B o C?", "Depende de quién factura y de quién compra. Un responsable inscripto emite A a otro responsable inscripto, y B a un monotributista, exento o consumidor final. Un monotributista emite C. Si el padrón no alcanza para decidir, el comprobante queda para revisar. Factura E o M entra solo si forma parte del mismo alcance, y lo vemos en la llamada."],
      ["¿Funciona si hoy facturás en la web de ARCA?", "Solo si hay una forma segura de emitir desde afuera de esa pantalla: el facturador de tu ERP, una API o un archivo que el sistema importa. Si la única vía es tipear en la web de ARCA, te lo decimos en la llamada y no prometemos una emisión que no se puede conectar."],
      costFaq("el volumen de comprobantes, si tu facturador ya se conecta con ARCA y cómo vuelve el número al ERP"),
      ["¿Qué necesitamos de nuestro lado?", "Un lote de ventas reales (anonimizadas si preferís), acceso de prueba al facturador o a su importación, y una persona que sepa qué tipo de comprobante corresponde en cada caso."],
    ],
    relatedService: { path: "/es/servicios/automatizacion-ia", title: "Automatización de procesos con IA" },
    relatedPosts: [
      { path: "/es/blog/cuando-usar-ia-vs-software-deterministico", title: "Cuándo usar IA y cuándo conviene software determinístico" },
    ],
  },
  {
    key: "bank-reconciliation",
    path: "/es/automatizaciones/conciliacion-bancaria",
    updatedAt: "2026-10-17",
    section: "automatizaciones",
    eyebrow: "Automatización · Conciliación bancaria",
    title: "Conciliación bancaria automática para pymes y empresas",
    lead: "El extracto del banco y Mercado Pago no cierran con las facturas. Alguien baja el archivo, lo pega en Excel y trata de ver qué cobro corresponde a cada comprobante. Armamos una conciliación bancaria y de pagos automática: cruza cada movimiento con las facturas y las cobranzas de tu ERP o de tu planilla, y deja marcado lo que no coincide para que una persona lo revise.",
    metaTitle: "Conciliación bancaria automática para pymes | Puna Tech",
    metaDescription: "Conciliación bancaria automática y conciliación de pagos: banco y Mercado Pago contra facturas del ERP, para pymes en Argentina. Diagnóstico en 15 min.",
    serviceType: "Conciliación bancaria automática para pymes",
    ogImage: "/og/conciliacion-bancaria.png",
    ogImageAlt: "Puna Tech: conciliación bancaria automática para pymes en Argentina.",
    cardTitle: "Conciliación bancaria",
    cardBlurb: "Los movimientos del banco y de Mercado Pago se cruzan con las facturas y las cobranzas. Lo que no coincide queda para revisar.",
    example: "Por ejemplo, un comercio que cobra por transferencia y por Mercado Pago. Cada mañana alguien baja el extracto, lo pega en una planilla y busca a qué factura corresponde cada importe. Un pago parcial, una comisión o un movimiento sin referencia queda sin cruzar, y a fin de mes el saldo del banco no cierra con el sistema.",
    before: [
      "Bajar el extracto del banco y el reporte de Mercado Pago y cruzarlos a mano con las facturas.",
      "Movimientos sin referencia: no se sabe de qué cliente ni de qué factura son.",
      "Pagos parciales, comisiones o transferencias que no coinciden con el importe de la factura.",
      "Facturas que siguen impagas aunque el dinero ya entró, o un mismo cobro marcado dos veces.",
    ],
    after: [
      "Cada movimiento del banco y de Mercado Pago se lee solo, con fecha, importe y referencia.",
      "Se cruza con las facturas y las cobranzas pendientes del ERP o de la planilla, por referencia, monto, cliente y fecha.",
      "Lo que coincide con certeza queda asociado a su factura. Lo que no, queda en una lista para que alguien lo revise.",
      "Queda registro de qué se concilió y qué quedó pendiente: la conciliación de pagos deja de depender de una planilla.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      {
        title: "El extracto y Mercado Pago, sin bajar archivos a mano",
        body: "Leemos los movimientos del banco por el archivo que ya exportás, o por la conexión que tu banco ofrezca, y los de Mercado Pago por su API. Si una vía no se puede conectar de forma segura, te lo decimos en la llamada, antes de prometerla.",
      },
      {
        title: "Reglas de cruce, no adivinanzas",
        body: "Definimos con vos cómo se empareja un movimiento con una factura o una cobranza: referencia, importe, CUIT o cliente, y una ventana de fechas. Lo que no coincide con certeza no se marca como cobrado: queda para revisar. El aviso al cliente por lo vencido está en [automatizar cobranzas](/es/automatizaciones/automatizar-cobranzas).",
      },
      {
        title: "Hacia tu ERP o tu planilla",
        body: "Registramos el cruce en Tango, Bejerman, un ERP propio o una planilla, por API o por archivo de importación. Si la factura todavía hay que emitirla, el comprobante está en [facturación electrónica ARCA](/es/automatizaciones/facturacion-electronica-arca). Si el trabajo es solo la conciliación de comisiones y retenciones de Mercado Pago, lo vemos en [integrar Mercado Pago](/es/integraciones/mercado-pago).",
      },
    ],
    fit: [
      "Cobrás por transferencia, depósito o Mercado Pago y alguien concilia a mano.",
      "El extracto del banco no cierra con las facturas del ERP o de la planilla.",
      "Ya le reclamaste a un cliente que había pagado, o un cobro quedó sin asociar a su factura.",
    ],
    faqs: [
      ["¿Se puede automatizar la conciliación bancaria?", "Sí. Un flujo puede leer los movimientos del banco y de Mercado Pago, cruzarlos con las facturas y las cobranzas de tu ERP o de tu planilla, y asociar los que coinciden. Lo que no cierra no se marca como cobrado: queda para que una persona lo revise."],
      ["¿Qué es la conciliación bancaria automática?", "Es cruzar, todos los días, cada movimiento del extracto y de Mercado Pago con la factura o la cobranza que corresponde. En lugar de bajar el archivo y buscarlo en Excel, el sistema propone el cruce y deja marcada la diferencia. Incluye la conciliación de pagos: cada cobro (transferencia, Mercado Pago, tarjeta) queda asociado a su factura o pedido."],
      ["¿Funciona con el banco y con Mercado Pago?", "Sí, si el movimiento puede entrar de forma confiable: el archivo que ya exportás del home banking, o la API de Mercado Pago. Si tu banco no deja leer los movimientos de forma segura, te lo decimos en la llamada y no prometemos una conexión que no existe."],
      ["¿Qué pasa con los movimientos que no coinciden?", "Un pago parcial, una comisión o un importe sin referencia no se asocia solo. Queda en una lista, con las facturas candidatas, para que alguien elija. Recién entonces se marca como cobrado."],
      costFaq("cuántas cuentas y medios de cobro entran, las reglas de cruce y cómo se conecta tu ERP o tu planilla"),
      ["¿Qué necesitamos de nuestro lado?", "Un extracto real y un lote de facturas o cobranzas (anonimizados si preferís), la forma en que hoy exportan el banco, y una persona que sepa cómo asocian un pago cuando el importe no coincide."],
    ],
    relatedService: { path: "/es/servicios/automatizacion-ia", title: "Automatización de procesos con IA" },
    relatedPosts: [
      { path: "/es/blog/cuando-usar-ia-vs-software-deterministico", title: "Cuándo usar IA y cuándo conviene software determinístico" },
    ],
  },
  {
    key: "tienda-nube",
    path: "/es/integraciones/tienda-nube",
    updatedAt: "2026-10-13",
    section: "integraciones",
    eyebrow: "Integración · Tienda Nube",
    title: "Integrar Tienda Nube con tu ERP y el stock",
    lead: "Vendés por Tienda Nube y el stock vive en el ERP o en una planilla. Conectamos la tienda con tu sistema para que cada pedido descuente el stock real y quede cargado, y lo que no coincide quede marcado para revisar.",
    metaTitle: "Integrar Tienda Nube con stock y ERP | Puna Tech",
    metaDescription: "Integrar Tienda Nube con tu ERP y el stock: cada venta descuenta el inventario y carga el pedido. Para pymes en Argentina. Diagnóstico en 15 min.",
    serviceType: "Integración de Tienda Nube con ERP y stock",
    ogImage: "/og/integracion-tienda-nube.png",
    ogImageAlt: "Puna Tech: integrar Tienda Nube con tu ERP y el stock real.",
    cardTitle: "Integrar Tienda Nube",
    cardBlurb: "Cada venta de Tienda Nube descuenta el stock real y el pedido queda en tu sistema.",
    example: "Por ejemplo, una tienda de indumentaria que vende por Tienda Nube y anota el stock en una planilla o en el ERP. Cuando entra un pedido, alguien lo copia al sistema y descuenta a mano. A la tarde, la tienda sigue mostrando un talle que ya no hay.",
    before: [
      "Copiar cada pedido de Tienda Nube al ERP o a una planilla, producto por producto.",
      "El stock de la tienda no coincide con el del depósito.",
      "Se vende un producto que ya no hay, o se frena una venta que sí había.",
      "Precios y variantes desactualizados entre la tienda y el sistema.",
    ],
    after: [
      "Cada pedido de Tienda Nube queda en tu sistema, con productos, cantidades y cliente.",
      "El stock se descuenta en el momento. Si el depósito cambia, la tienda se puede actualizar.",
      "Si no hay stock o el código no coincide, el pedido no se pisa solo: queda marcado para revisar.",
      "Queda registro de qué se sincronizó y qué falló.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      {
        title: "Conectado a Tienda Nube",
        body: "Usamos la API de Tienda Nube para leer pedidos, productos y stock, sin bajar planillas. Si tu tienda no puede pasar un dato que necesitás, te lo decimos en la llamada, antes de prometerlo.",
      },
      {
        title: "El stock sale de tu sistema",
        body: "Precio y stock salen de tu ERP, de Tango, de Bejerman o de una planilla, no de un número cargado a mano en la tienda. Si el dato no cierra, no actualizamos el stock a ciegas.",
      },
      {
        title: "Un primer flujo",
        body: "Empezamos por pedidos y stock. Si también vendés por Mercado Libre, el stock y la factura de ese canal están en [integrar Mercado Libre](/es/integraciones/mercado-libre). El cruce de cada pago de Mercado Pago va en [integrar Mercado Pago](/es/integraciones/mercado-pago). Cada uno tiene su alcance. No prometemos conectar todo en 2 semanas.",
      },
    ],
    fit: [
      "Vendés por Tienda Nube y el stock vive en otro sistema.",
      "Alguien copia pedidos o ajusta el inventario a mano todos los días.",
      "Ya tuviste ventas de algo que no había, o stock que no coincidía con el depósito.",
    ],
    faqs: [
      ["¿Se puede integrar Tienda Nube con un ERP?", "Sí, si Tienda Nube puede pasar pedidos y productos y tu sistema puede recibirlos: una API, una base o un archivo de importación. El trabajo es que el pedido y el stock viajen solos, y que lo dudoso quede para revisar."],
      ["¿Cómo conectar Tienda Nube con el stock?", "El stock de referencia sale de tu sistema (ERP, Tango, Bejerman o una planilla). Cada venta en Tienda Nube lo descuenta, y un cambio en el depósito puede volver a la tienda. Si el código del producto no coincide, no se actualiza solo."],
      ["¿Qué es una integración de Tienda Nube?", "Es que la tienda y tu sistema de gestión dejen de ser dos listas distintas. Un pedido que entra en Tienda Nube queda cargado, y el stock que vendiste deja de figurar como disponible. No es cambiar de tienda ni cargar otra planilla."],
      ["¿Sirve si también vendés por Mercado Libre o cobrás con Mercado Pago?", "El primer flujo es Tienda Nube con tu stock y tus pedidos. Mercado Libre tiene su propio flujo de stock, pedidos y factura electrónica. El cruce de cada pago de Mercado Pago con su factura es otro flujo."],
      costFaq("cuántos productos y depósitos hay, si el stock vive en un ERP o en una planilla, y si también hay que sincronizar precios"),
      ["¿Qué necesitamos de nuestro lado?", "Acceso de prueba a la tienda (una aplicación de Tienda Nube con permisos para leer pedidos y productos, no tu usuario y contraseña), el listado de productos con sus códigos, y una persona que conozca cómo cuentan el stock hoy."],
    ],
    relatedService: { path: "/es/servicios/integraciones-de-datos", title: "integración de sistemas" },
    relatedPosts: [
      { path: "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", title: "Cuándo dejar Zapier o n8n por software a medida" },
    ],
  },
  {
    key: "mercado-libre",
    path: "/es/integraciones/mercado-libre",
    updatedAt: "2026-10-15",
    section: "integraciones",
    eyebrow: "Integración · Mercado Libre",
    title: "Integrar Mercado Libre con tu stock y tu ERP",
    lead: "Vendés por Mercado Libre y el stock vive en Tienda Nube, en el ERP o en una planilla. Conectamos el canal con tu depósito: cada venta descuenta el stock real, el pedido queda cargado y la factura electrónica sale por ARCA cuando los datos cierran.",
    metaTitle: "Integrar Mercado Libre con stock y ERP | Puna Tech",
    metaDescription: "Integrar Mercado Libre con tu ERP y el stock: sincronizá Tienda Nube, cargá el pedido y facturá la venta. Para pymes en Argentina. Diagnóstico en 15 min.",
    serviceType: "Integración de Mercado Libre con ERP y stock",
    ogImage: "/og/integracion-mercado-libre.png",
    ogImageAlt: "Puna Tech: integrar Mercado Libre con tu ERP y el stock real.",
    cardTitle: "Integrar Mercado Libre",
    cardBlurb: "El stock de Mercado Libre sale de tu depósito. Cada venta queda en el ERP y se puede facturar.",
    example: "Por ejemplo, un comercio que publica en Mercado Libre y también vende por Tienda Nube. El stock vive en el depósito, anotado en el ERP o en una planilla. Cada venta hay que copiarla, descontarla y facturarla. Mientras tanto, una publicación queda activa sin stock o pausada con mercadería en el estante, y las preguntas de los compradores se juntan en la bandeja.",
    before: [
      "El stock de Mercado Libre, el de Tienda Nube y el del depósito no coinciden.",
      "Publicaciones activas de algo que ya no hay, o pausadas cuando el producto volvió.",
      "Cada venta se carga en el sistema y se factura a mano.",
      "Preguntas y mensajes de compradores mezclados con el trabajo de stock y facturación.",
    ],
    after: [
      "Stock y precios salen de tu sistema y se actualizan en Mercado Libre. Si también vendés por Tienda Nube, se actualizan ahí desde el mismo depósito.",
      "Cada orden queda en el ERP o en la planilla, con productos, cantidades y comprador.",
      "La factura electrónica de la venta se emite por ARCA cuando los ítems, los importes y la condición fiscal cierran. Si no cierran, no se factura sola.",
      "Un aviso cuando el stock no coincide, la factura no sale, una publicación se pausa o una pregunta queda sin responder.",
    ],
    howTitle: "Cómo lo resolvemos",
    how: [
      {
        title: "Conectado a Mercado Libre",
        body: "Usamos la API de Mercado Libre para leer órdenes, publicaciones, stock y precios, sin bajar planillas. Si un dato que necesitás no se puede pasar de forma segura, te lo decimos en la llamada, antes de prometerlo.",
      },
      {
        title: "El stock sale de tu depósito",
        body: "Precio y stock salen de tu ERP, de Tango, de Bejerman o de una planilla. Mercado Libre se actualiza desde ahí. Si también está Tienda Nube, los dos canales leen el mismo número: lo vemos en [integrar Tienda Nube](/es/integraciones/tienda-nube). Si el código del producto no coincide, no actualizamos a ciegas.",
      },
      {
        title: "Orden, factura y alerta",
        body: "La orden entra al sistema. Si los datos fiscales cierran, emitimos la factura electrónica por el facturador que ya usás con ARCA: el comprobante A, B o C y el vuelco al ERP están en [facturación electrónica ARCA](/es/automatizaciones/facturacion-electronica-arca). Si el stock, el precio, la factura o una pregunta no cierran, queda un aviso para revisar. El cruce de cada pago de Mercado Pago con su factura es otro flujo: [integrar Mercado Pago](/es/integraciones/mercado-pago). No prometemos conectar todo en 2 semanas.",
      },
    ],
    fit: [
      "Vendés por Mercado Libre y el stock vive en Tienda Nube, en el ERP o en una planilla.",
      "Alguien copia ventas, pausa publicaciones o factura a mano todos los días.",
      "Ya vendiste algo que no había, o una publicación quedó pausada con stock en el depósito.",
    ],
    faqs: [
      ["¿Se puede sincronizar el stock de Mercado Libre y Tienda Nube?", "Sí, si Mercado Libre, Tienda Nube y tu sistema pueden pasarse el dato. El stock de referencia sale del depósito: ERP, Tango, Bejerman o una planilla. Cada venta lo descuenta y los dos canales se actualizan desde ahí. Si el código no coincide, ese producto no se actualiza solo."],
      ["¿Puedo facturar automáticamente las ventas de Mercado Libre?", "Sí, cuando los datos de la venta cierran: ítems, importes y la condición fiscal del comprador. La factura electrónica sale por el facturador que ya usás con ARCA, si ese sistema puede recibir la venta. Si falta un dato, el importe no cierra, o hoy facturás solo en la web de ARCA y no hay forma segura de conectarlo, la venta no se factura sola: queda para revisar, y te lo decimos antes de prometerlo."],
      ["¿Necesito cambiar de ERP?", "No. Conectamos Mercado Libre con el sistema que ya usás, si hay una forma segura de leer stock y precios y de cargar la orden: API, base o archivo de importación. Si tu ERP no la tiene, te lo decimos en la llamada y no prometemos una carga que no se puede hacer."],
      ["¿Qué es una integración de Mercado Libre con el ERP?", "Es que una venta en Mercado Libre deje de vivir solo en el canal. El pedido queda en tu ERP o en la planilla, el stock que vendiste deja de figurar en el depósito y, si los datos cierran, sale la factura. No es mudarte de Mercado Libre ni cambiar de sistema."],
      ["¿Qué pasa con las publicaciones pausadas y con las preguntas?", "Si el stock llega a cero, la publicación se puede pausar para no vender lo que no hay, y volver a activarse cuando el depósito repone. Las preguntas y los mensajes los responde tu equipo. El flujo avisa cuando uno queda sin contestar, para que no se pierda entre las ventas."],
      costFaq("cuántos productos y depósitos hay, si el stock vive en un ERP o en una planilla, y si la factura electrónica entra en el mismo alcance"),
    ],
    relatedService: { path: "/es/servicios/integraciones-de-datos", title: "integración de sistemas" },
    relatedPosts: [
      { path: "/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida", title: "Cuándo dejar Zapier o n8n por software a medida" },
    ],
  },
];

export function getUseCaseByPath(path: string) {
  return useCases.find((item) => item.path === path.replace(/\/+$/, ""));
}

export function getUseCaseHub(path: string) {
  const normalized = path.replace(/\/+$/, "");
  return useCaseHubs.find((hub) => hub.path === normalized);
}

export function getUseCaseHubBySection(section: UseCaseContent["section"]) {
  const hub = useCaseHubs.find((item) => item.section === section);
  if (!hub) throw new Error(`Missing use-case hub for ${section}`);
  return hub;
}

export function useCasesForHub(section: UseCaseContent["section"]) {
  const prefix = `/es/${section}/`;
  return useCases.filter((item) => item.path.startsWith(prefix));
}
