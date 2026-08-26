import type { Locale } from "./site";

export interface IndustryContent {
  key: "automotive-dealers" | "agricultural-equipment-dealers";
  slug: string;
  alternateSlug: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  introduction: string;
  qualifier: string;
  problems: Array<[string, string]>;
  opportunities: Array<[string, string]>;
  workflow: string[];
  workflowCaption: string;
  proofNote: string;
  relatedServiceKeys: string[];
  faqs: Array<[string, string]>;
}

export const industries: Record<Locale, IndustryContent[]> = {
  en: [
    {
      key: "automotive-dealers",
      slug: "automotive-dealers",
      alternateSlug: "concesionarias",
      eyebrow: "Automotive dealership operations",
      metaTitle: "Software & Automation for Car Dealerships | Puna Tech",
      metaDescription: "Custom software, workflow automation and integrations for automotive dealerships managing leads, inventory, documents and after-sales operations.",
      title: "Custom software and automation for automotive dealerships.",
      introduction: "Connect lead intake, sales follow-up, documentation, inventory, service, and management reporting without forcing every team into another disconnected tool.",
      qualifier: "This is an illustrative solution architecture, not a claim of a published dealership engagement.",
      problems: [
        ["Leads arrive everywhere", "Website forms, marketplaces, messages, and campaigns create separate queues with inconsistent ownership."],
        ["Follow-up is difficult to audit", "Managers cannot reliably see response status, handoffs, lost opportunities, or why a lead stopped moving."],
        ["Sales and after-sales are disconnected", "Customer, vehicle, document, and service information is re-entered instead of moving through one controlled process."],
      ],
      opportunities: [
        ["Unified lead intake", "Normalize enquiries from approved channels, validate required data, assign ownership, and keep the original source."],
        ["Document and approval workflows", "Track missing documents, internal reviews, customer actions, and exceptions without relying on inbox memory."],
        ["Operational visibility", "Create focused reporting from the systems already in use, with explicit definitions and traceable events."],
      ],
      workflow: ["Lead channels", "Qualification and ownership", "Sales and documents", "Delivery and service", "Operational reporting"],
      workflowCaption: "Illustrative dealership workflow",
      proofNote: "The first engagement maps the dealership's real systems and permissions. The diagram describes a useful pattern; the final architecture depends on the brand, dealer-management software, CRM, and local operating process.",
      relatedServiceKeys: ["data-integrations", "ai-automation", "custom-software"],
      faqs: [
        ["Do we need to replace our CRM or dealer-management system?", "Usually not. The first option is to connect, validate, and extend the systems already supporting sales and service."],
        ["Can AI answer or qualify every enquiry?", "AI can assist with classification and summarization, but commercial promises, sensitive data, approvals, and customer-impacting actions need explicit controls."],
        ["Can we begin with one process?", "Yes. A useful first scope may cover one lead source, one document flow, or one reporting bottleneck before expanding."],
        ["Will you publish our dealership name or operating data?", "No. Confidentiality, access, data ownership, and any public reference are agreed before work begins."],
      ],
    },
    {
      key: "agricultural-equipment-dealers",
      slug: "agricultural-equipment-dealers",
      alternateSlug: "maquinaria-agricola",
      eyebrow: "Agricultural equipment operations",
      metaTitle: "Software for Agricultural Equipment Dealers | Puna Tech",
      metaDescription: "Custom software and integrations for agricultural equipment dealers coordinating enquiries, quotes, inventory, parts and field service.",
      title: "Software and integrations for agricultural equipment dealers.",
      introduction: "Build a reliable path between enquiries, quotes, equipment availability, documentation, parts, and field service across branches and territories.",
      qualifier: "This is an illustrative solution architecture, not a claim of a published agricultural-equipment engagement.",
      problems: [
        ["Quotes depend on fragmented information", "Commercial teams reconcile models, availability, attachments, financing details, and customer context across several sources."],
        ["Branches develop separate workarounds", "Local spreadsheets and messages become critical systems, making ownership and reporting inconsistent."],
        ["Sales, parts, and service lose context", "The operational history does not travel cleanly from the opportunity to delivery, maintenance, and support."],
      ],
      opportunities: [
        ["Structured opportunity workflows", "Collect the required technical and commercial context before a quote moves to review."],
        ["Inventory and systems integration", "Synchronize approved data between commercial tools, databases, product sources, and reporting layers."],
        ["Service coordination", "Route requests, supporting documents, approvals, and status updates with a visible owner and history."],
      ],
      workflow: ["Enquiry and requirements", "Product and stock data", "Quote and approval", "Delivery and documentation", "Parts and field service"],
      workflowCaption: "Illustrative agricultural-equipment workflow",
      proofNote: "We begin by mapping the actual commercial, inventory, and service systems. The reference flow shows where integration or focused software may help without assuming a specific ERP, CRM, or manufacturer process.",
      relatedServiceKeys: ["data-integrations", "custom-software", "ai-automation"],
      faqs: [
        ["Can you integrate with an existing ERP or CRM?", "If the system exposes a supported API, export, database interface, or approved integration method, we can assess a controlled connection."],
        ["Does the solution have to cover every branch from day one?", "No. A pilot can validate one region, product family, or handoff before broader rollout."],
        ["Where is AI appropriate?", "Useful areas may include document extraction, classification, and operator assistance. Inventory, pricing, permissions, and consequential actions should remain deterministic and validated."],
        ["Who owns the integration and its data?", "Repositories, infrastructure, access, operating documentation, and data ownership are made explicit in the proposal."],
      ],
    },
  ],
  es: [
    {
      key: "automotive-dealers",
      slug: "concesionarias",
      alternateSlug: "automotive-dealers",
      eyebrow: "Operaciones de concesionarias",
      metaTitle: "Software y Automatización para Concesionarias | Puna Tech",
      metaDescription: "Software a medida, automatización e integraciones para concesionarias que gestionan leads, stock, documentación, ventas y postventa.",
      title: "Software y automatización para concesionarias.",
      introduction: "Conectá la recepción de consultas, el seguimiento comercial, la documentación, el stock, la postventa y los reportes sin sumar otra herramienta aislada.",
      qualifier: "Esta es una arquitectura ilustrativa, no la afirmación de un proyecto publicado con una concesionaria.",
      problems: [
        ["Los leads llegan por todos lados", "Formularios, portales, mensajes y campañas generan colas separadas con responsables y datos inconsistentes."],
        ["El seguimiento es difícil de auditar", "La gerencia no puede ver con claridad tiempos de respuesta, traspasos, oportunidades detenidas o motivos de pérdida."],
        ["Venta y postventa quedan desconectadas", "Datos del cliente, vehículo, documentación y servicio se vuelven a cargar en lugar de recorrer un proceso controlado."],
      ],
      opportunities: [
        ["Ingreso unificado de leads", "Normalizar consultas de canales aprobados, validar datos mínimos, asignar responsables y conservar la fuente original."],
        ["Flujos de documentación y aprobación", "Seguir documentos pendientes, revisiones internas, acciones del cliente y excepciones sin depender de la memoria del correo."],
        ["Visibilidad operativa", "Construir reportes enfocados sobre los sistemas existentes, con definiciones explícitas y eventos trazables."],
      ],
      workflow: ["Canales de leads", "Calificación y responsable", "Venta y documentación", "Entrega y postventa", "Reportes operativos"],
      workflowCaption: "Flujo ilustrativo para concesionarias",
      proofNote: "El primer trabajo mapea los sistemas y permisos reales de la concesionaria. El diagrama representa un patrón útil; la arquitectura final depende de la marca, el DMS, el CRM y el proceso local.",
      relatedServiceKeys: ["data-integrations", "ai-automation", "custom-software"],
      faqs: [
        ["¿Hay que reemplazar el CRM o sistema de gestión?", "En general, no. La primera opción es conectar, validar y extender las herramientas que ya sostienen ventas y servicio."],
        ["¿La IA puede responder o calificar todas las consultas?", "Puede asistir con clasificación y síntesis, pero promesas comerciales, datos sensibles, aprobaciones y acciones con impacto requieren controles explícitos."],
        ["¿Podemos empezar por un solo proceso?", "Sí. Un primer alcance puede cubrir una fuente de leads, un flujo documental o un cuello de botella de reportes antes de expandirse."],
        ["¿Van a publicar el nombre o los datos de la concesionaria?", "No. La confidencialidad, los accesos, la propiedad de los datos y cualquier referencia pública se acuerdan antes de comenzar."],
      ],
    },
    {
      key: "agricultural-equipment-dealers",
      slug: "maquinaria-agricola",
      alternateSlug: "agricultural-equipment-dealers",
      eyebrow: "Operaciones de maquinaria agrícola",
      metaTitle: "Software para Empresas de Maquinaria Agrícola | Puna Tech",
      metaDescription: "Software e integraciones para empresas de maquinaria agrícola que coordinan consultas, cotizaciones, stock, repuestos y servicio técnico.",
      title: "Software e integraciones para empresas de maquinaria agrícola.",
      introduction: "Creá un recorrido confiable entre consultas, cotizaciones, disponibilidad de equipos, documentación, repuestos y servicio de campo entre sucursales y territorios.",
      qualifier: "Esta es una arquitectura ilustrativa, no la afirmación de un proyecto publicado con una empresa de maquinaria agrícola.",
      problems: [
        ["Las cotizaciones dependen de información fragmentada", "Los equipos comerciales concilian modelos, disponibilidad, implementos, financiación y contexto del cliente entre distintas fuentes."],
        ["Cada sucursal desarrolla sus propios atajos", "Planillas y mensajes locales se convierten en sistemas críticos, con responsables y reportes inconsistentes."],
        ["Venta, repuestos y servicio pierden contexto", "La historia operativa no viaja con claridad desde la oportunidad hasta la entrega, el mantenimiento y el soporte."],
      ],
      opportunities: [
        ["Oportunidades comerciales estructuradas", "Reunir el contexto técnico y comercial necesario antes de que una cotización avance a revisión."],
        ["Integración de stock y sistemas", "Sincronizar datos aprobados entre herramientas comerciales, bases, fuentes de producto y reportes."],
        ["Coordinación de servicio", "Distribuir solicitudes, documentos, aprobaciones y estados con responsables e historial visibles."],
      ],
      workflow: ["Consulta y requisitos", "Producto y stock", "Cotización y aprobación", "Entrega y documentación", "Repuestos y servicio de campo"],
      workflowCaption: "Flujo ilustrativo para maquinaria agrícola",
      proofNote: "Comenzamos mapeando los sistemas comerciales, de stock y servicio existentes. El flujo de referencia muestra dónde puede ayudar una integración o un software enfocado sin asumir un ERP, CRM o proceso de fabricante específico.",
      relatedServiceKeys: ["data-integrations", "custom-software", "ai-automation"],
      faqs: [
        ["¿Pueden integrar el ERP o CRM existente?", "Si el sistema ofrece una API, exportación, interfaz de base de datos o método de integración aprobado, podemos evaluar una conexión controlada."],
        ["¿La solución debe cubrir todas las sucursales desde el inicio?", "No. Un piloto puede validar una región, familia de productos o traspaso antes de una implementación más amplia."],
        ["¿Dónde resulta útil la IA?", "Puede ayudar con extracción documental, clasificación y asistencia al operador. Stock, precios, permisos y acciones sensibles deben seguir reglas determinísticas y validadas."],
        ["¿Quién es dueño de la integración y los datos?", "Los repositorios, la infraestructura, los accesos, la documentación operativa y la propiedad de los datos quedan explícitos en la propuesta."],
      ],
    },
  ],
};

export function getIndustry(locale: Locale, slug: string) {
  return industries[locale].find((industry) => industry.slug === slug);
}

export function industryPath(locale: Locale, slug: string) {
  return locale === "en" ? `/industries/${slug}` : `/es/industrias/${slug}`;
}
