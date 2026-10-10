import type { Locale } from "./chrome";

export interface ServiceContent {
  key: string;
  slug: string;
  alternateSlug: string;
  eyebrow: string;
  title: string;
  description: string;
  outcome: string;
  problems: string[];
  deliverables: string[];
  architecture: string[];
  relatedCase: string;
  metaTitle: string;
  metaDescription: string;
  hubBlurb: string;
  /** Commercial intent H2 sections (Copy pack) */
  commercialSections: { heading: string; body: string; bullets?: string[] }[];
  /** Real case study proof strip with pack captions */
  proofStrip: { slug: string; caption: string }[];
  faqs: [string, string][];
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCtaMicro?: string;
  /** Shorter breadcrumb label. Falls back to eyebrow. */
  breadcrumbName?: string;
  /** Service JSON-LD overrides. Unset pages keep the shared defaults. */
  schemaName?: string;
  schemaServiceType?: string;
  areaServed?: { "@type": "Country"; name: string } | string[];
}

export interface CaseStudyContent {
  key: string;
  slug: string;
  alternateSlug: string;
  type: string;
  sector: string;
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  impact: string[];
  impactNeedsConfirm?: string[];
  stack: string[];
  flow: string[];
  displayName: string;
  confidentialityLabel: string;
  visualCaption: string;
  relatedService: string;
  liveDemoUrl?: string;
  metrics?: { label: string; value: string; needsConfirm?: boolean }[];
  beforeAfter?: { before: string; after: string };
  category?: "saas" | "automation";
  operationalOutcome?: string;
  operationalOutcomeNeedsConfirm?: boolean;
}

export const services: Record<Locale, ServiceContent[]> = {
  en: [
    {
      key: "ai-automation", slug: "ai-automation", alternateSlug: "automatizacion-ia",
      eyebrow: "Process automation · AI-assisted workflows",
      title: "Automate the handoffs that slow your operation down.",
      description: "We design controlled process automation and AI-assisted workflows that classify, enrich, validate, and route operational information across your existing stack—without removing human control where it matters.",
      outcome: "A workflow your team can monitor, override, and improve—instead of another opaque chatbot or brittle Zapier-style chain.",
      problems: [
        "Teams copying information between systems",
        "Unstructured documents blocking downstream work",
        "AI prototypes with no validation or ownership model",
        "Manual handoffs that grow faster than headcount",
      ],
      deliverables: [
        "Workflow and risk map",
        "Production integrations and validation rules",
        "Observability, handoff, and operating documentation",
        "Human-approval points for consequential actions",
      ],
      architecture: ["Sources", "Orchestration", "Validation", "Human review", "Systems of record"],
      relatedCase: "b2b-gtm-automation",
      metaTitle: "Business Process Automation | Puna Tech",
      metaDescription: "Process automation and AI-assisted workflows—classify, enrich, validate, route—with human oversight. Map the bottleneck in 15 min.",
      hubBlurb: "Controlled handoffs: classify, enrich, validate, route—with human oversight where it matters.",
      commercialSections: [
        {
          heading: "Who this is for / when to hire",
          body: "Hire process automation when repetitive handoffs, document triage, lead routing, or CRM updates are eating operator time—and off-the-shelf iPaaS hits ceiling on logic, volume, or control. Fit: B2B teams that need deterministic orchestration (often n8n-class or custom) with validation and human review, not a demo chatbot.",
        },
        {
          heading: "What we build",
          body: "We do not sell “AI for everything.” We map the bottleneck, decide what should be deterministic vs model-assisted, and ship a workflow ops can own.",
          bullets: [
            "Process automation across forms, docs, CRM, and internal tools",
            "Classification / enrichment / routing with structured outputs",
            "Human-in-the-loop gates for consequential actions",
            "Observability: logs, retries, and clear failure states",
          ],
        },
        {
          heading: "How engagement works",
          body: "Discover the handoffs → design the smallest reliable path → build with validation and review gates → launch with runbooks. Scope stays tied to one operational outcome first.",
        },
      ],
      proofStrip: [
        { slug: "ai-linkedin-copilot-hitl", caption: "LinkedIn Copilot Guard — AI sales copilot with human-in-the-loop guard" },
        { slug: "b2b-gtm-automation", caption: "GTM Operations System — controlled pipeline from research to outreach" },
        { slug: "inbound-lead-routing-hubspot", caption: "Inbound Revenue Switch — multi-channel inbound router with CRM sync" },
        { slug: "autopost-b2b-content-studio", caption: "Autopost Studio — omnichannel content with strict human approval (Lab)" },
      ],
      faqs: [
        ["Is this “AI automation” or process automation?", "Both when useful. Most value is reliable process automation; AI assists classification or drafting only where structured validation and human oversight make it safe."],
        ["Will this replace my team?", "No. We remove repetitive handoffs so people keep judgment on consequential steps."],
        ["How do you handle AI risk?", "Structured outputs, validation, permissions, logging, and human approval for consequential actions—tuned to the workflow."],
        ["Can we start small?", "Yes. One bottleneck, one measurable path to production, then expand."],
        ["Do you work with HubSpot / n8n-style stacks?", "Yes when they fit the operation. We have shipped client systems around CRM sync, routing, and orchestration; stack choice follows the bottleneck, not a vendor pitch."],
      ],
      finalCtaTitle: "In 15 minutes, we map the constraint and decide the useful next step.",
      finalCtaBody: "Process automation, AI-assisted workflow—or no build at all.",
    },
    {
      key: "custom-software", slug: "custom-software", alternateSlug: "software-a-medida",
      eyebrow: "Custom B2B software · Software factory",
      title: "Custom software for operations that need their own product.",
      description: "We design and ship web platforms, internal tools, and customer portals around the workflows, roles, and permissions your business actually needs—not another generic template. Lab SaaS proves execution; client delivery is the business.",
      outcome: "A focused product with maintainable architecture, clear roles, and fewer operational workarounds—software your team can own.",
      problems: [
        "Spreadsheets acting as a critical system",
        "Disconnected customer and internal experiences",
        "Legacy interfaces that make simple work difficult",
        "Off-the-shelf tools that force workarounds on core workflows",
      ],
      deliverables: [
        "Product scope and interaction design",
        "Frontend, backend, database, and deployment",
        "Testing, documentation, and launch support",
        "Explicit ownership of repos, access, and handoff",
      ],
      architecture: ["User journeys", "Application", "Business logic", "Data model", "Cloud deployment"],
      relatedCase: "edtech-web3-platform",
      metaTitle: "Custom Software Development Argentina | Puna Tech",
      metaDescription: "Custom B2B software, internal tools, and portals built for how your operation works—owned by your team. Map the bottleneck in 15 min.",
      hubBlurb: "Platforms, internal tools, and portals shaped to your workflows and permissions.",
      commercialSections: [
        {
          heading: "Who this is for / when to hire",
          body: "Hire a custom software / software-factory engagement when a critical workflow needs roles, data rules, or integrations that standard tools cannot support cleanly—or when spreadsheets and disconnected portals have become the real system of record. Fit: PyME and mid-market B2B teams that need internal tools, operations portals, or a customer-facing product their stack does not already provide.",
        },
        {
          heading: "What we build",
          body: "We start with the bottleneck and the smallest useful scope. Factory delivery means reviewable increments, visible technical decisions, and a maintainable foundation—not a black-box handoff.",
          bullets: [
            "Internal tools and ops dashboards",
            "Customer / partner portals with real permissions",
            "Workflow-shaped B2B web applications",
            "Custom layers that extend (not blindly replace) your current stack",
          ],
        },
        {
          heading: "How engagement works",
          body: "Ownership of code, infrastructure, and access is explicit in the proposal. No hidden lock-in.",
          bullets: [
            "Discover — Map workflow, data, risks, and the business outcome that matters.",
            "Design — Smallest useful scope, architecture, and user journey.",
            "Build — Ship in reviewable increments with QA.",
            "Launch — Deploy, document, measure adoption, define the next improvement.",
          ],
        },
      ],
      proofStrip: [
        { slug: "edtech-web3-platform", caption: "Project Altiplano — one platform for education, users, and specialized application workflows" },
        { slug: "starpress-reviews-to-revenue", caption: "StarPress — local commerce reviews-to-revenue product (Lab · execution proof)" },
        { slug: "viralyt-youtube-intelligence", caption: "Viralyt — YouTube outlier intelligence product (Lab · execution proof)" },
      ],
      faqs: [
        ["When is custom software better than an off-the-shelf tool?", "When a critical workflow needs roles, data rules, or integrations standard tools cannot support cleanly. We first check whether current tools can be connected or extended."],
        ["Do you replace our existing tools?", "Usually no. We connect and extend first. Replacement only when the existing constraint makes it necessary."],
        ["Can we start with a small scope?", "Yes. The first engagement should prove one useful outcome, expose integration risk, and leave a production-quality foundation."],
        ["Who owns the software and data?", "Ownership, repos, infrastructure, access, and handoff are explicit in the proposal. No hidden lock-in."],
        ["How much does a project cost?", "Focused discovery or a first internal tool can start below a full product build. Scope and risk set investment—we qualify budget privately, not with misleading packages."],
      ],
      finalCtaTitle: "In 15 minutes, we map the constraint and decide the useful next step.",
      finalCtaBody: "Custom software, internal tools, or no build at all—honest framing.",
      finalCtaMicro: "Fifteen minutes. The bottleneck, the options, the next useful step.",
    },
    {
      key: "data-integrations", slug: "data-integrations", alternateSlug: "integraciones-de-datos",
      eyebrow: "Data & systems integration · CRM / ERP",
      title: "Make your CRM, ERP, and tools exchange reliable information.",
      description: "We connect CRMs, ERPs, databases, outreach tools, APIs, and internal services with deterministic pipelines and explicit failure handling—so teams stop reconciling the same records by hand.",
      outcome: "Cleaner data movement between systems, visible errors, and less manual reconciliation between teams.",
      problems: [
        "Duplicate or incomplete records across CRM and ops tools",
        "Brittle point-to-point automations",
        "No shared source of truth for operational data",
        "Manual reconciliation between sales, ops, and finance systems",
      ],
      deliverables: [
        "System and data-flow audit",
        "Versioned integrations and retry policies",
        "Monitoring, alerting, and runbooks",
        "Clear contracts between CRM / ERP / internal services",
      ],
      architecture: ["Applications", "API contracts", "Workflow engine", "Database", "Monitoring"],
      relatedCase: "b2b-gtm-automation",
      metaTitle: "Systems Integration CRM ERP | Puna Tech",
      metaDescription: "CRM, ERP, API, and internal-tool integration—deterministic pipelines, explicit failures, less manual reconciliation. Map the bottleneck in 15 min.",
      hubBlurb: "Reliable corridors between CRM, ERP, APIs, and internal services—with visible failures.",
      commercialSections: [
        {
          heading: "Who this is for / when to hire",
          body: "Hire systems integration when CRM, ERP, spreadsheets, and outreach tools disagree—and brittle Zapier/Make-style links or one-off scripts are the only glue. Fit: B2B operations that need a reliable path between systems of record, with retries, monitoring, and ownership—not another silent sync that fails on Friday.",
        },
        {
          heading: "What we build",
          body: "We start from the data path that hurts (leads, orders, inventory, tickets)—not from a vendor catalogue.",
          bullets: [
            "CRM ↔ ERP / database / internal API sync with explicit contracts",
            "Inbound and outbound pipelines with validation and idempotency",
            "Workflow engines that replace fragile point-to-point links",
            "Monitoring, alerting, and runbooks so failures are visible",
          ],
        },
        {
          heading: "How engagement works",
          body: "Audit systems and flows → define contracts and failure modes → build versioned integrations → launch with monitoring and handoff docs. First scope proves one reliable corridor between systems.",
        },
      ],
      proofStrip: [
        { slug: "inbound-lead-routing-hubspot", caption: "Inbound Revenue Switch — 82-node inbound router with CRM sync and team alerts" },
        { slug: "b2b-gtm-automation", caption: "GTM Operations System — controlled data pipeline from research to outreach" },
      ],
      faqs: [
        ["Do you integrate CRM and ERP?", "Yes—when the operation needs a reliable corridor between those systems and adjacent tools (APIs, databases, outreach). Scope follows the data path that is breaking."],
        ["Will you rip out our current tools?", "Usually no. We connect and stabilize first. Replacement only when the constraint requires it."],
        ["How is this different from Zapier or Make?", "Those tools are fine until logic, volume, or failure handling outgrow them. We build versioned, monitored integrations your team can operate—sometimes alongside iPaaS, sometimes instead of it for the critical path."],
        ["What do we get at handoff?", "Contracts, retry policies, monitoring, alerting, and runbooks—not a undocumented script."],
        ["Can we start with one sync only?", "Yes. One corridor, production-quality, then expand."],
      ],
      finalCtaTitle: "In 15 minutes, we map the constraint and decide the useful next step.",
      finalCtaBody: "Systems integration, data pipeline—or no build at all.",
    },
  ],
  es: [
    {
      key: "ai-automation", slug: "automatizacion-ia", alternateSlug: "ai-automation",
      eyebrow: "Automatización de procesos con IA",
      title: "Automatización de procesos con IA para empresas",
      description: "Automatizamos las tareas repetitivas de tu operación—carga de datos, seguimiento de leads, presupuestos, documentos y conciliaciones—conectando la inteligencia artificial a las herramientas que ya usás: WhatsApp, Gmail, planillas, CRM o ERP. La IA clasifica, extrae y redacta; las reglas validan; tu equipo aprueba lo sensible.",
      outcome: "Un flujo que tu equipo puede observar, corregir y mejorar—no otro chatbot opaco ni una cadena frágil tipo iPaaS genérico.",
      problems: [
        "Equipos copiando información entre sistemas",
        "Documentos sin estructura que bloquean procesos",
        "Prototipos de IA sin validación ni responsables",
        "Traspasos manuales que crecen más rápido que el equipo",
      ],
      deliverables: [
        "Mapa del flujo y sus riesgos",
        "Integraciones productivas y reglas de validación",
        "Observabilidad, traspaso y documentación operativa",
        "Puntos de aprobación humana en acciones sensibles",
      ],
      architecture: ["Fuentes", "Orquestación", "Validación", "Revisión humana", "Sistemas de registro"],
      relatedCase: "automatizacion-gtm-b2b",
      metaTitle: "Automatización de procesos con IA para empresas | Puna Tech",
      metaDescription: "Automatización de procesos con IA para pymes y empresas en Argentina: leads, CRM, documentos y cobranzas, con control humano. Diagnóstico en 15 min.",
      hubBlurb: "Automatización de procesos con IA: clasificar, extraer, validar y enrutar información—con control humano donde importa.",
      commercialSections: [
        {
          heading: "Qué es la automatización de procesos con IA (y qué no)",
          body: "Es conectar los pasos repetitivos de un proceso—recibir un dato, entenderlo, validarlo y cargarlo donde corresponde—para que sucedan solos. La IA se usa donde hace falta interpretar: leer un PDF, clasificar un mail, resumir una consulta o redactar un borrador. Todo lo que tiene que ser exacto (importes, estados, permisos) lo resuelven reglas determinísticas. No es un chatbot genérico ni “IA para todo”: es un flujo medible que tu equipo puede auditar y corregir.",
        },
        {
          heading: "Qué procesos automatizamos en pymes y empresas argentinas",
          body: "Empezamos por el proceso que más horas consume o más errores genera. Si se resuelve mejor sin IA, lo decimos y lo automatizamos igual.",
          bullets: [
            "Leads de WhatsApp, formulario web o Instagram: calificar, cargar en el CRM (por ejemplo HubSpot) y avisar al vendedor correcto.",
            "Facturas, remitos y comprobantes en PDF: extraer datos, validar CUIT e importes y cargarlos en tu sistema de gestión.",
            "Pedidos y presupuestos que llegan por mail o planilla: armar el borrador con precios y stock de tu ERP para que alguien lo apruebe.",
            "Cobranzas y conciliación: cruzar pagos de Mercado Pago o del banco con facturas pendientes y marcar diferencias.",
            "Atención y soporte: clasificar consultas, sugerir respuestas y derivar a la persona indicada, con revisión humana.",
            "Reportes operativos: tableros y resúmenes semanales que se arman solos desde tus sistemas, sin copiar y pegar en Excel.",
          ],
        },
        {
          heading: "Cómo trabajamos y en cuánto tiempo",
          body: "Los plazos son orientativos y dependen de la cantidad de sistemas y de la calidad de los datos. El alcance se ata primero a un resultado operativo medible (horas ahorradas, errores, tiempo de respuesta).",
          bullets: [
            "Diagnóstico — Llamada de 15 minutos y mapa del proceso: dónde se traba, qué sistemas toca y qué conviene automatizar primero.",
            "Piloto — Un solo proceso en producción controlada, normalmente en 2 a 4 semanas, con aprobación humana en los pasos sensibles.",
            "Producción — Monitoreo, reintentos, alertas y documentación para que tu equipo lo opere; un proceso completo suele quedar en 4 a 8 semanas.",
            "Expansión — Con el primer flujo midiendo resultados, sumamos el siguiente proceso sobre la misma base.",
          ],
        },
        {
          heading: "Cuándo conviene (y cuándo todavía no)",
          body: "Conviene cuando un proceso se repite todas las semanas, pasa por varias herramientas y hoy depende de que alguien copie, revise o reenvíe información a mano. También cuando ya probaste Zapier, Make o n8n y la lógica, el volumen o el manejo de errores te quedó chico. Todavía no conviene si el proceso cambia cada semana o nadie es dueño de él: ahí primero lo ordenamos y después lo automatizamos.",
        },
      ],
      proofStrip: [
        { slug: "copiloto-linkedin-ia-hitl", caption: "Copiloto LinkedIn Guard — copiloto comercial con control humano" },
        { slug: "automatizacion-gtm-b2b", caption: "Sistema de Operaciones GTM — pipeline de investigación a outreach" },
        { slug: "enrutamiento-leads-hubspot", caption: "Inbound Revenue Switch — enrutador inbound con sync a CRM" },
        { slug: "autopost-estudio-contenido-b2b", caption: "Autopost Studio — contenido omnicanal con aprobación humana (Lab)" },
      ],
      faqs: [
        ["¿Qué procesos se pueden automatizar con IA en una pyme?", "Los que se repiten y mueven información entre herramientas: carga y calificación de leads, lectura de facturas y comprobantes, armado de presupuestos, conciliación de cobros, clasificación de consultas y reportes. La IA aporta donde hay que interpretar texto o documentos; el resto se resuelve con reglas."],
        ["¿Cuánto tarda implementar una automatización con IA?", "Un piloto sobre un proceso suele estar funcionando en 2 a 4 semanas, y un proceso completo en producción con monitoreo en 4 a 8 semanas. Depende de cuántos sistemas hay que conectar y de cómo están los datos."],
        ["¿Cuánto cuesta automatizar un proceso?", "Depende del alcance y del riesgo, no de un paquete cerrado. Arrancamos por un proceso acotado y medible para no comprometer un presupuesto grande de entrada; después del diagnóstico te damos un rango concreto."],
        ["¿Qué pasa si la IA se equivoca?", "Diseñamos para que el error sea visible y no llegue al cliente: salidas estructuradas, validaciones automáticas, registros de cada ejecución y aprobación humana en las acciones sensibles (enviar, cobrar, modificar datos críticos)."],
        ["¿Tengo que cambiar mis sistemas actuales?", "No. Conectamos la automatización a lo que ya usás—WhatsApp, Gmail, Google Sheets, HubSpot u otro CRM, tu ERP o sistema de gestión—por API o integraciones. Si conviene usar n8n como orquestador, lo usamos; si el proceso lo supera, lo construimos a medida."],
        ["¿La automatización reemplaza al equipo?", "No. Saca las tareas repetitivas para que las personas conserven el criterio en los pasos que importan y atiendan más volumen sin sumar carga manual."],
      ],
      finalCtaTitle: "En 15 minutos mapeamos tu proceso y te decimos qué conviene automatizar primero.",
      finalCtaBody: "Automatización de procesos con IA, sin IA donde no hace falta—o no construir todavía.",
      finalCtaMicro: "Quince minutos. El proceso, las opciones y el próximo paso útil.",
    },
    {
      key: "custom-software", slug: "software-a-medida", alternateSlug: "custom-software",
      eyebrow: "Software B2B a medida · Software factory",
      title: "Software a medida para empresas en Argentina",
      description: "Software a medida es un sistema con las reglas, los roles y los datos de tu empresa, no un producto genérico. Para pymes y empresas en Argentina, le gana a Tango, a un SaaS, a una planilla y a n8n o Zapier cuando un proceso importante ya no entra ahí y alguien lo resuelve a mano todos los días.",
      outcome: "Un primer módulo en producción, a precio cerrado, con el código en manos de tu equipo.",
      problems: [
        "La operación corre en una planilla que ya nadie se anima a tocar",
        "Tango o el SaaS cubren lo estándar y el resto se resuelve por mail o WhatsApp",
        "Zapier o n8n se traban cuando aparece una excepción",
        "Cada cliente pide algo que el sistema enlatado no deja configurar",
      ],
      deliverables: [
        "Alcance, precio cerrado y fecha por escrito, antes de empezar",
        "El primer módulo de ese proceso: pantallas, reglas y datos",
        "Conexión con lo que ya usás, si se puede hacer de forma segura",
        "Código, repositorio y accesos a nombre de tu empresa",
      ],
      architecture: ["Experiencia", "Aplicación", "Lógica de negocio", "Modelo de datos", "Despliegue cloud"],
      relatedCase: "plataforma-edtech-web3",
      metaTitle: "Software a medida para empresas en Argentina | Puna Tech",
      metaDescription: "Software a medida para empresas y pymes en Argentina. Si Tango, n8n o la planilla ya no alcanzan, precio cerrado tras una llamada de 15 min.",
      hubBlurb: "Software a medida cuando Tango, la planilla o n8n ya no alcanzan: un primer módulo, a precio cerrado.",
      breadcrumbName: "Software a medida",
      schemaName: "Software a medida",
      schemaServiceType: "Desarrollo de software a medida",
      areaServed: { "@type": "Country", name: "Argentina" },
      commercialSections: [
        {
          heading: "Qué es el software a medida (y qué no)",
          body: "Es un sistema propio para cómo trabaja tu operación. El desarrollo de software a medida no es adaptar la empresa a un producto genérico, ni un chatbot, ni una cadena de Zapier que alguien tiene que cuidar. Tango, un SaaS del rubro, una planilla, n8n o Zapier alcanzan cuando el proceso cabe y hay alguien que los mantiene. Dejan de alcanzar cuando la excepción es el trabajo de todos los días. Si el canvas de n8n ya es el sistema, lo vemos en [cuándo dejar Zapier o n8n por software a medida](/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida).",
        },
        {
          heading: "Qué sistemas hacemos para pymes y empresas",
          body: "Empezamos por el trabajo que hoy hace una persona, no por un catálogo. Estos son ejemplos de todos los días, no clientes nuestros.",
          bullets: [
            "Stock. Por ejemplo, una distribuidora que anota el stock en una planilla y se entera tarde de lo que falta. Un sistema propio muestra qué hay, qué se reservó y qué hay que reponer.",
            "Turnos. Por ejemplo, una clínica o un taller donde los turnos viven en una planilla y se pisan. El sistema cruza la agenda y deja las excepciones a la vista.",
            "Facturación. Por ejemplo, una empresa que tipea cada factura de proveedor. Se leen, se validan y se cargan, y el equipo revisa solo las dudosas. Lo vemos en [carga de facturas de proveedores](/es/automatizaciones/carga-de-facturas-proveedores).",
            "Cobranzas. Por ejemplo, un comercio que cobra por Mercado Pago y concilia en Excel. Cada pago puede quedar asociado a su factura. Lo vemos en [integrar Mercado Pago](/es/integraciones/mercado-pago).",
            "Pedidos. Por ejemplo, un mayorista que recibe el pedido por WhatsApp y lo carga a mano. Se puede armar con el precio y el stock reales. Lo vemos en [pedidos por WhatsApp](/es/automatizaciones/pedidos-por-whatsapp).",
            "Paneles y reportes. Por ejemplo, un equipo que arma el Excel de la semana copiando de tres sistemas. El panel sale de los datos que ya están.",
            "Portal de clientes. Por ejemplo, una empresa que manda el estado de cuenta por mail. Un portal muestra pedidos, facturas y saldos, con un acceso por cliente.",
            "Integraciones con lo que ya usás: Tango u otro ERP, Mercado Pago, WhatsApp, planillas o un CRM. Si se puede conectar, no lo reemplazamos.",
          ],
        },
        {
          heading: "Cómo trabajamos y en cuánto tiempo",
          body: "Puna Tech hace desarrollo de software a medida desde Buenos Aires. La oferta es un primer módulo en 2 semanas a precio cerrado. Antes de arrancar queda escrito qué entra, qué no, el precio y la fecha. Si tu proceso no entra en 2 semanas, te lo decimos en la llamada, en lugar de estirar el proyecto. Si preferís dejarlo por escrito, está en [contacto](/es/contacto).",
          bullets: [
            "Diagnóstico. Una llamada de 15 minutos: cómo funciona hoy, qué sistemas toca y dónde se traba.",
            "Precio cerrado. Alcance, precio y fecha por escrito. Recién ahí se arranca.",
            "Entregas por etapas. El primer módulo queda andando con tu equipo. Si hace falta el siguiente, cada etapa tiene su alcance y su fecha.",
            "Si lo que necesitás es un sistema entero, el plazo va en la propuesta. No prometemos un sistema completo en 2 semanas.",
          ],
        },
        {
          heading: "Cuándo conviene (y cuándo no)",
          body: "Conviene cuando un proceso se repite todas las semanas, cruza varias herramientas y hoy depende de que alguien copie, revise o reenvíe a mano. También cuando ya probaste n8n, Zapier o una planilla y los permisos, las excepciones o el volumen te quedaron chicos. No conviene si el proceso cabe en Tango o en un SaaS del rubro, si cambia todas las semanas, o si nadie es dueño de él. En esos casos lo decimos en la llamada y no construimos.",
        },
        {
          heading: "De quién es el código",
          body: "El código es de tu empresa. El desarrollo de software a medida termina en un sistema tuyo: el repositorio, dónde está hosteado y quién tiene los accesos quedan escritos en la propuesta. No nos quedamos con una licencia. Si después querés que otro equipo lo mantenga, puede. El repo y la documentación van con la entrega.",
        },
      ],
      proofStrip: [
        { slug: "plataforma-edtech-web3", caption: "Proyecto Altiplano — una plataforma para educación, usuarios y flujos de aplicación" },
        { slug: "starpress-resenas-a-ingresos", caption: "StarPress — de reviews a ingresos (Lab · prueba de ejecución)" },
        { slug: "viralyt-inteligencia-youtube", caption: "Viralyt — inteligencia de outliers en YouTube (Lab · prueba de ejecución)" },
      ],
      faqs: [
        ["¿Cuánto cuesta el software a medida?", "Te pasamos un precio cerrado después de una llamada de 15 minutos, cuando ya vimos qué módulo entra. No publicamos rangos: una carga de facturas y un portal de clientes no son el mismo trabajo. Antes de arrancar queda escrito qué entra, qué no y cuánto sale."],
        ["¿Cuánto tarda?", "Un primer módulo lo entregamos en 2 semanas a precio cerrado, si entra en ese alcance. Lo que sigue va por etapas, con alcance y fecha en cada una. No prometemos un sistema completo en 2 semanas."],
        ["¿Quién es dueño del código?", "Tu empresa. El repositorio, el código y los accesos se entregan con el sistema y quedan escritos en la propuesta. Si después querés que otro equipo lo mantenga, puede."],
        ["¿Hay mantenimiento después de la entrega?", "En la entrega dejamos el sistema andando, el repositorio y la documentación para operarlo. El mantenimiento (fallas, cambios chicos o una guardia) se acuerda aparte y por escrito. No está incluido en las 2 semanas salvo que la propuesta lo diga."],
        ["¿Se integra con lo que ya uso?", "Sí, cuando hay una forma segura de conectarlo: una API, un archivo de importación o la base de datos. Lo hacemos con Tango u otro ERP, planillas, Mercado Pago, WhatsApp, un CRM o un sistema propio. Si no se puede conectar sin un atajo frágil, te lo decimos en la llamada, antes de prometerlo."],
        ["¿Conviene software a medida o alcanza con n8n, Zapier o una planilla?", "n8n, Zapier y una planilla alcanzan cuando el proceso es simple, hay alguien que lo mantiene y las excepciones son pocas. Conviene software a medida cuando el flujo ya es el sistema: permisos por persona, reglas que no entran en la herramienta, o una planilla que se rompe si falta quien la arma. Si con un conector alcanza, te lo decimos en la llamada."],
        ["¿Puedo empezar por un solo módulo?", "Sí. La oferta es un primer módulo en 2 semanas a precio cerrado. Si después hace falta el siguiente (un portal, cobranzas u otro flujo), se acuerda aparte, con alcance y fecha."],
        ["¿Trabajan con pymes en Argentina?", "Sí, con pymes y con empresas que tienen un proceso que ya no entra en lo que usan. No hace falta un equipo de sistemas propio. En la llamada de 15 minutos vemos si el primer módulo entra en 2 semanas."],
      ],
      finalCtaTitle: "En 15 minutos vemos si tu primer módulo entra en 2 semanas.",
      finalCtaBody: "Contanos cómo lo hacen hoy. Si alcanza con Tango, una planilla o n8n, también te lo decimos.",
      finalCtaMicro: "Quince minutos. El proceso, el alcance y el precio cerrado.",
    },
    {
      key: "data-integrations", slug: "integraciones-de-datos", alternateSlug: "data-integrations",
      eyebrow: "Integración de sistemas",
      title: "Integración de sistemas para empresas en Argentina",
      description: "La integración de sistemas conecta el CRM, el ERP, la tienda y las planillas para que un dato se cargue una sola vez. Así dejás de tipear lo mismo en dos lugares y de conciliar a mano los pagos, los pedidos y el stock.",
      outcome: "Menos carga doble entre sistemas, los errores a la vista y menos horas conciliando planillas.",
      problems: [
        "El mismo cliente o pedido está cargado distinto en el CRM y en el ERP",
        "El stock de la tienda no coincide con el del sistema de gestión",
        "Los cobros de Mercado Pago se cruzan a mano contra las facturas",
        "WhatsApp, mails y planillas no llegan solos al CRM",
      ],
      deliverables: [
        "Un mapa de qué sistemas se hablan y dónde se corta el dato",
        "La conexión del primer flujo, con reintento si algo falla",
        "Un aviso cuando un dato no pasa, para que no se pierda en silencio",
        "Una nota corta para que tu equipo sepa qué hace cada conexión",
      ],
      architecture: ["CRM y ERP", "Tienda y pagos", "Reglas", "Registro", "Avisos"],
      relatedCase: "automatizacion-gtm-b2b",
      metaTitle: "Integración de sistemas para empresas | Puna Tech",
      metaDescription: "Integración de sistemas para pymes en Argentina: conectamos CRM y ERP, Tienda Nube, Mercado Pago y planillas. Menos carga doble. Diagnóstico en 15 min.",
      hubBlurb: "Conectamos CRM, ERP, tienda, Mercado Pago y planillas para que el dato se cargue una sola vez.",
      breadcrumbName: "Integración de sistemas",
      schemaName: "Integración de sistemas",
      schemaServiceType: "Integración de sistemas",
      areaServed: { "@type": "Country", name: "Argentina" },
      commercialSections: [
        {
          heading: "Qué es la integración de sistemas (y qué no)",
          body: "Es hacer que las herramientas que ya usás se pasen la información solas. Un cliente que entra en el CRM queda en el ERP, un pago de Mercado Pago queda asociado a su factura, un pedido de la tienda descuenta el stock. No es cambiar de sistema, ni un chatbot, ni otra planilla. Zapier o n8n alcanzan cuando el paso es simple y hay alguien que los mira. Dejan de alcanzar cuando el dato se pierde, se duplica o hay que conciliarlo a mano todas las semanas. Si el conector ya es el sistema, lo vemos en [cuándo dejar Zapier o n8n por software a medida](/es/blog/cuando-dejar-zapier-n8n-por-software-a-medida).",
        },
        {
          heading: "Qué sistemas conectamos",
          body: "Empezamos por el dato que hoy se carga dos veces. Estos son ejemplos de todos los días, no clientes nuestros. Si el sistema tiene una API, la integración de APIs usa esa conexión. Si no la tiene, usamos un archivo de importación y te lo decimos antes de prometerlo.",
          bullets: [
            "CRM y ERP. Por ejemplo, ventas carga el cliente en HubSpot o en una planilla y administración lo vuelve a tipear en Tango o en el sistema de gestión. La integración deja el cliente, el pedido y el estado en los dos.",
            "Tienda y stock. Por ejemplo, una pyme vende por Tienda Nube o Mercado Libre y el stock vive en otra planilla. Cada venta puede descontar el stock y avisar cuando falta.",
            "Mercado Pago y contabilidad. Por ejemplo, un comercio cobra por link, QR o checkout y a fin de semana cruza el reporte con las facturas en Excel. Cada pago puede quedar asociado a su factura. Lo vemos en [integrar Mercado Pago](/es/integraciones/mercado-pago).",
            "WhatsApp y CRM. Por ejemplo, los pedidos llegan al chat y alguien los copia al CRM. El mensaje puede crear el contacto y el pedido para que el vendedor lo confirme. Lo vemos en [pedidos por WhatsApp](/es/automatizaciones/pedidos-por-whatsapp).",
            "Planillas y sistema. Por ejemplo, el equipo exporta un Excel, lo corrige y lo vuelve a subir. La planilla puede leer y escribir el sistema sin ese ida y vuelta.",
            "Facturas y sistema de gestión. Por ejemplo, las facturas de proveedores se tipean a mano. Se pueden leer y cargar, y el equipo revisa solo las dudosas. Lo vemos en [carga de facturas de proveedores](/es/automatizaciones/carga-de-facturas-proveedores).",
          ],
        },
        {
          heading: "Cómo trabajamos y en cuánto tiempo",
          body: "Puna Tech hace integración de sistemas desde Buenos Aires. La oferta es la misma que en el resto del sitio: un proceso en 2 semanas a precio cerrado. Antes de arrancar queda escrito qué entra, qué no, el precio y la fecha. Si tu conexión no entra en 2 semanas, te lo decimos en la llamada, en lugar de estirar el proyecto. Si preferís dejarlo por escrito, está en [contacto](/es/contacto).",
          bullets: [
            "Diagnóstico. Una llamada de 15 minutos: qué sistemas usás, dónde se carga el dato dos veces y qué conviene conectar primero.",
            "Precio cerrado. Alcance, precio y fecha por escrito. Recién ahí se arranca.",
            "Un primer flujo. Conectamos un solo recorrido, por ejemplo CRM y ERP, o Mercado Pago y facturas, y lo dejamos andando con tu equipo.",
            "Si hace falta el siguiente, cada uno tiene su alcance y su fecha. No prometemos conectar todo en 2 semanas.",
          ],
        },
        {
          heading: "Cuándo conviene una integración a medida y cuándo alcanza Zapier o n8n",
          body: "Zapier, Make o n8n alcanzan cuando el paso es simple, el volumen es bajo y hay alguien del equipo que los mantiene. Conviene una integración a medida cuando el dato no puede perderse (un pago, un stock, una factura), cuando hay reglas que el conector no deja escribir, o cuando la cadena se rompe y nadie se entera. Si con un conector alcanza, te lo decimos en la llamada y no construimos de más. Si el flujo ya pide pantallas, permisos o reglas propias, lo vemos como [software a medida](/es/servicios/software-a-medida). Para revisar un CRM que ya está conectado, está [cómo auditar una integración CRM](/es/blog/auditar-integracion-crm-seguimiento-comercial).",
        },
      ],
      proofStrip: [
        { slug: "enrutamiento-leads-hubspot", caption: "Inbound Revenue Switch — enrutador inbound de 82 nodos con sync a CRM" },
        { slug: "automatizacion-gtm-b2b", caption: "Sistema de Operaciones GTM — pipeline controlado de investigación a outreach" },
      ],
      faqs: [
        ["¿Qué es la integración de sistemas?", "Es conectar las herramientas que ya usás (CRM, ERP, tienda, Mercado Pago, WhatsApp o planillas) para que un dato se cargue una sola vez y viaje solo al resto. Resuelve la carga doble, las planillas de cruce y la conciliación manual de pagos, pedidos y stock."],
        ["¿Pueden integrar un CRM con un ERP?", "Sí. Por ejemplo, el cliente y el pedido que carga ventas pueden quedar en el sistema de gestión sin que administración los vuelva a tipear. Trabajamos con lo que ya usás: HubSpot u otro CRM, Tango, Bejerman, Odoo o un sistema propio, si hay una forma segura de conectarlos."],
        ["¿Qué es la integración de APIs?", "Es que dos sistemas se pasen datos por la conexión oficial del proveedor, sin exportar planillas. Hace falta cuando el CRM, el ERP, Tienda Nube, Mercado Libre o Mercado Pago ya ofrecen esa conexión. Si no hay API, buscamos una importación por archivo y te lo decimos antes de prometerlo."],
        ["¿Integran Tienda Nube, Mercado Libre o Mercado Pago?", "Sí, cuando la tienda o el medio de pago pueden pasar datos y tu sistema puede recibirlos. Un caso típico es que la venta descuente stock, o que el pago de Mercado Pago quede asociado a su factura. El detalle de pagos está en la página de integrar Mercado Pago."],
        ["¿Cuánto tarda una integración de sistemas?", "Un proceso acotado lo entregamos en 2 semanas a precio cerrado, si entra en ese alcance. Si hay que conectar más sistemas o los datos están desordenados, te lo decimos en la llamada y lo partimos en etapas. No prometemos conectar todo en 2 semanas."],
        ["¿Cuánto cuesta integrar sistemas?", "Te pasamos un precio cerrado después de una llamada de 15 minutos, cuando ya vimos qué conexión entra. No publicamos rangos: conectar un CRM con un ERP no es lo mismo que cruzar Mercado Pago con las facturas. Antes de arrancar queda escrito qué entra, qué no y cuánto sale."],
        ["¿Conviene una integración a medida o alcanza con Zapier o n8n?", "Zapier, Make y n8n alcanzan cuando el paso es simple, hay alguien que los mantiene y un error se nota enseguida. Conviene una integración a medida cuando el dato no puede perderse, el volumen crece o la cadena se rompe en silencio. Si con un conector alcanza, te lo decimos en la llamada."],
      ],
      finalCtaTitle: "En 15 minutos vemos qué sistemas conviene conectar primero.",
      finalCtaBody: "Contanos dónde cargan el dato dos veces. Si alcanza con Zapier o n8n, también te lo decimos.",
      finalCtaMicro: "Quince minutos. El dato, el alcance y el precio cerrado.",
    },
  ],
};

export const servicesHubCopy = {
  en: {
    metaTitle: "Services | Software, Automation, Integrations | Puna Tech",
    metaDescription: "Custom software, process automation, and systems integration for B2B operations—factory delivery your team can own.",
    eyebrow: "Three focused capabilities",
    title: "Custom software, automation, and integrations for B2B operations.",
    lead: "We start with the bottleneck, not the technology.",
    intro: "Puna Tech is a B2B software factory for automation, integrations, and custom systems. Each engagement is shaped around one operational outcome and a system your team can own. Lab SaaS proves execution; client delivery is the business. Choose the path that matches the constraint—or map it with us in 15 minutes.",
    /** Card order: custom → automation → integrations */
    cardOrderKeys: ["custom-software", "ai-automation", "data-integrations"] as const,
    cardTitles: {
      "custom-software": "Custom B2B software",
      "ai-automation": "Process automation · AI workflows",
      "data-integrations": "Data & systems integration",
    } as Record<string, string>,
  },
  es: {
    metaTitle: "Servicios | Software, automatización, integraciones | Puna Tech",
    metaDescription: "Software a medida, automatización de procesos e integración de sistemas para operaciones B2B—entrega factory que tu equipo pueda operar.",
    eyebrow: "Tres capacidades enfocadas",
    title: "Software a medida, automatización e integraciones para operaciones B2B.",
    lead: "Empezamos por el cuello de botella, no por la tecnología.",
    intro: "Puna Tech es una software factory B2B para automatización, integraciones y sistemas a medida. Cada proyecto se organiza alrededor de un resultado operativo y un sistema que tu equipo pueda operar. El lab SaaS prueba ejecución; la entrega a clientes es el negocio. Elegí el camino que matchea la restricción—o mapealo con nosotros en 15 minutos.",
    cardOrderKeys: ["custom-software", "ai-automation", "data-integrations"] as const,
    cardTitles: {
      "custom-software": "Software B2B a medida",
      "ai-automation": "Automatización de procesos con IA",
      "data-integrations": "Integración de datos y sistemas",
    } as Record<string, string>,
  },
};

export const casesHubCopy = {
  en: {
    metaTitle: "Case Studies | Client Delivery & Lab | Puna Tech",
    metaDescription: "Client delivery systems and Lab demos that prove architecture—custom software, automation, and integrations. Names stay private where required.",
    eyebrow: "Work",
    title: "Proof of delivery—Client systems and Lab demos.",
    intro: "Client engagements solve specific operational bottlenecks; names stay private where required, architectures stay concrete. Lab products are live systems we ship ourselves to prove execution standards—not the catalogue we sell. Browse by type, then open the service path that matches your constraint.",
    clientHeading: "Client delivery",
    labHeading: "Lab demos · execution proof",
  },
  es: {
    metaTitle: "Casos | Entrega a cliente y Lab | Puna Tech",
    metaDescription: "Sistemas de entrega a cliente y demos de lab que prueban arquitectura—software a medida, automatización e integraciones.",
    eyebrow: "Trabajo",
    title: "Prueba de entrega—sistemas de cliente y demos de lab.",
    intro: "Los proyectos de cliente resuelven cuellos de botella operativos concretos; los nombres quedan en reserva cuando corresponde, las arquitecturas se mantienen concretas. Los productos de lab son sistemas en vivo que construimos nosotros para probar estándar de ejecución—no el catálogo que vendemos. Mirales por tipo y después abrí el servicio que matchea tu restricción.",
    clientHeading: "Entrega a cliente",
    labHeading: "Demos de lab · prueba de ejecución",
  },
};

export const caseStudies: Record<Locale, CaseStudyContent[]> = {
  en: [
    {
      key: "starpress",
      slug: "starpress-reviews-to-revenue",
      alternateSlug: "starpress-resenas-a-ingresos",
      category: "saas",
      type: "Production SaaS Product",
      sector: "Local Commerce & E-commerce · Social Proof SaaS",
      displayName: "StarPress",
      confidentialityLabel: "Live public product · Puna Tech",
      operationalOutcome: "+34% verified Google ratings · 0 negative reviews leaked",
      visualCaption: "Google Maps review capture & sentiment pipeline",
      relatedService: "custom-software",
      liveDemoUrl: "https://starpress.puna-tech.com/",
      title: "Google Reviews to revenue: AI sentiment triage and conversion widgets.",
      summary: "A high-conversion SaaS that turns customer feedback into sales with automated Google Maps review scraping, sentiment-aware routing, and interactive review carousels.",
      challenge: "Physical stores and digital brands struggle to collect 5-star Google Reviews and present them tastefully on their sites. Unhappy customers often aired complaints publicly before staff could resolve them, hurting conversion rates.",
      solution: "Puna Tech engineered an end-to-end multi-tenant Next.js application with Supabase auth, Apify Google Maps review scraping, GPT-4o sentiment classification, and lightweight embeddable SVG/canvas review widgets with instant load times.",
      impact: [
        "Automated review capture delivers +34% more verified Google ratings",
        "Negative feedback descalated privately before reaching public review sites",
        "Zero-latency embeddable widgets deployed across 50+ client websites"
      ],
      metrics: [
        { label: "Review Conversion Boost", value: "+34%" },
        { label: "Scrape to Analysis Time", value: "< 8 sec" },
        { label: "Sentiment Classification", value: "98.5% acc" }
      ],
      beforeAfter: {
        before: "Businesses manually messaged customers asking for reviews. 85% ignored it, while unhappy customers vented on public Google listings without warning.",
        after: "Instant QR code review capture with smart AI sentiment branching: 5-star ratings route straight to Google Maps, while dissatisfied customers get private VIP resolution."
      },
      stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase", "Apify", "OpenAI GPT-4o", "Stripe"],
      flow: ["Customer QR Scan", "Sentiment Evaluation", "Positive -> Google Maps", "Negative -> Private Support", "Live Web Showcase"]
    },
    {
      key: "viralyt",
      slug: "viralyt-youtube-intelligence",
      alternateSlug: "viralyt-inteligencia-youtube",
      category: "saas",
      type: "Production SaaS Product",
      sector: "Creator Economy & Media · Video Analytics",
      displayName: "Viralyt",
      confidentialityLabel: "Live public product · Puna Tech",
      operationalOutcome: "10x faster breakout video discovery · 12h saved weekly",
      visualCaption: "Views-per-hour velocity & outlier algorithm",
      relatedService: "custom-software",
      liveDemoUrl: "https://viralyt-pink.vercel.app/",
      title: "YouTube outlier intelligence: spotting breakout videos before competition.",
      summary: "An analytics engine identifying anomalous video performance, computing views-per-hour velocity benchmarks, and extracting high-CTR packaging formulas across YouTube niches.",
      challenge: "Video teams and media agencies spent 15+ hours weekly manually browsing YouTube channels, guessing what thumbnail and topic formats the recommendation algorithm was actively favoring.",
      solution: "We built a reactive React 19 application powered by YouTube Data API v3 and velocity algorithms that calculate historical baseline averages, isolating videos gaining views 5x-50x faster than channel norms.",
      impact: [
        "Isolates viral breakout videos within hours of upload across any niche",
        "Saves content teams 12+ hours of manual competitive research weekly",
        "Surfaces high-CTR title patterns and thumbnail concepts with proven demand"
      ],
      metrics: [
        { label: "Discovery Speed", value: "10x faster" },
        { label: "Velocity Tracking", value: "Real-time" },
        { label: "Outlier Accuracy", value: "99.1%" }
      ],
      beforeAfter: {
        before: "Creators guessed video topics based on old views, producing videos that missed algorithmic momentum and underperformed for months.",
        after: "Real-time outlier detection surfacing statistical anomalies gaining 5x normal velocity, allowing teams to produce high-demand packaging predictably."
      },
      stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "YouTube Data API v3", "Vercel"],
      flow: ["Niche & Channel Ingestion", "Historical Baseline Calc", "Velocity Delta (VPH)", "Outlier Isolation", "Packaging Deconstruction"]
    },
    {
      key: "videome",
      slug: "videome-ai-motion-recipes",
      alternateSlug: "videome-recetas-video-ia",
      category: "saas",
      type: "Production SaaS Product",
      sector: "Generative AI · Multimedia Creation",
      displayName: "videome",
      confidentialityLabel: "Live public product · Puna Tech",
      operationalOutcome: "< 45s clip generation turnaround · 100% billing fidelity",
      visualCaption: "Generative AI video inference & ledger pipeline",
      relatedService: "ai-automation",
      liveDemoUrl: "https://video-me-alpha.vercel.app/",
      title: "Viral AI video recipes: cinematic motion without prompt engineering.",
      summary: "A generative video SaaS that democratizes cinematic AI motion using pre-tuned style recipes, serverless GPU pipelines, and real-time generation polling.",
      challenge: "Advanced diffusion video models generate stunning motion, but everyday marketers and creators are blocked by technical prompts, aspect ratio failures, and unpredictably high cloud GPU costs.",
      solution: "We engineered an intuitive Next.js application with Supabase Row Level Security, transactional Stripe credit purchases, and asynchronous Replicate webhook pipelines with optimistic client polling.",
      impact: [
        "Studio-quality cinematic AI clips rendered in under 60 seconds",
        "Zero prompt engineering or GPU setup required by end users",
        "Atomic credit ledger guarantees 100% billing and usage fidelity"
      ],
      metrics: [
        { label: "Generation Turnaround", value: "< 45 sec" },
        { label: "Cost Per Clip", value: "$0.12 avg" },
        { label: "Recipe Completion", value: "96.4%" }
      ],
      beforeAfter: {
        before: "Marketers spent hours experimenting with complex parameters and discarded 8 out of 10 failed video generations.",
        after: "Curated 1-click video recipes with pre-tested motion parameters and atomic credit accounting that generate publication-ready clips instantly."
      },
      stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase RLS", "Replicate API", "Stripe", "Vercel"],
      flow: ["Recipe Selection", "Credit Reservation", "Cloud GPU Inference", "Webhook Verification", "High-Def Video Delivery"]
    },
    {
      key: "autopost",
      slug: "autopost-b2b-content-studio",
      alternateSlug: "autopost-estudio-contenido-b2b",
      category: "saas",
      type: "Puna Tech Lab · SaaS Studio",
      sector: "Omnichannel Publishing · B2B Content Engine",
      displayName: "Autopost Studio",
      confidentialityLabel: "Puna Tech internal product · SaaS Studio",
      operationalOutcome: "90% publishing time reduction (15h → 45m) · 0 hallucinated posts",
      visualCaption: "Multimodal AI drafting & human-in-the-loop dispatch",
      relatedService: "ai-automation",
      title: "Omnichannel content studio: AI generation with strict human approval.",
      summary: "An enterprise-grade B2B publishing engine that converts raw ideas into brand-compliant social posts across LinkedIn, X, Instagram, and TikTok with visual review cards.",
      challenge: "Fully autonomous social bots post tone-deaf copy and distorted graphics. Manual social publishing, on the other hand, wastes 15+ hours weekly of leadership time.",
      solution: "We built an integrated studio combining FastAPI backend services, Next.js frontend, Supabase persistence, Gemini copywriting models, and an interactive Kanban board where humans approve or refine each post.",
      impact: [
        "Multi-network publishing time reduced by 90% (15 hours down to 45 minutes)",
        "Zero unapproved posts or hallucinated messages ever reach public channels",
        "Brand typography, colors, and layout guidelines applied automatically"
      ],
      metrics: [
        { label: "Production Time", value: "15h -> 45m" },
        { label: "Platforms Synced", value: "4 Networks" },
        { label: "Approval Cycle", value: "< 2 min" }
      ],
      beforeAfter: {
        before: "Founders spent weekends manually formatting posts, resizing images in Canva, and scheduling each network individually.",
        after: "One core idea generates platform-tailored posts with automated brand framing and a 1-click approval board that schedules all networks."
      },
      stack: ["Next.js 15", "FastAPI", "Python", "Supabase", "Gemini 2.5", "Docker", "Tailwind CSS"],
      flow: ["Raw Idea Ingestion", "AI Multi-Format Drafting", "Brand Template Overlay", "Operator 1-Click Review", "Multi-Network Dispatch"]
    },
    {
      key: "lead-router",
      slug: "inbound-lead-routing-hubspot",
      alternateSlug: "enrutamiento-leads-hubspot",
      category: "automation",
      type: "Enterprise Automation System",
      sector: "Enterprise Sales & CRM · Revenue Operations",
      displayName: "Inbound Revenue Switch",
      confidentialityLabel: "Production enterprise deployment · 82 Nodes",
      operationalOutcome: "8h → 2.4s response latency · 0 dropped leads across 50k events",
      operationalOutcomeNeedsConfirm: true,
      visualCaption: "12-channel form switch & HubSpot v4 company matching",
      relatedService: "data-integrations",
      title: "82-node inbound lead router: zero-drop CRM synchronization and instant team alerts.",
      summary: "An enterprise-grade n8n routing engine that ingests 12 disparate form channels, validates B2B domain authenticity, auto-associates HubSpot companies, and alerts sales reps in under 3 seconds.",
      challenge: "Enterprise leads were cooling down because form submissions were fragmented across marketing microsites. Incomplete data, free email providers, and manual CRM entry cost high-ticket revenue.",
      solution: "Puna Tech designed an 82-node resilient n8n workflow with parameterized form routing, RFC-compliant email sanitization, HubSpot v4 API company association, dynamic cohort classification, and instant Telegram bot dispatches.",
      impact: [
        "Lead response time dropped from 8 hours to 2.4 seconds",
        "100% of enterprise contacts automatically associated with parent CRM accounts",
        "Zero dropped submissions across 50,000+ monthly inbound events"
      ],
      impactNeedsConfirm: [
        "Lead response time dropped from 8 hours to 2.4 seconds",
        "Zero dropped submissions across 50,000+ monthly inbound events"
      ],
      metrics: [
        { label: "Routing Latency", value: "2.4 sec", needsConfirm: true },
        { label: "Enrichment Match", value: "99.9%", needsConfirm: true },
        { label: "Dropped Leads", value: "0%", needsConfirm: true }
      ],
      beforeAfter: {
        before: "Form submissions arrived via email inboxes, taking 4 to 24 hours to be triaged and manually typed into HubSpot by sales coordinators.",
        after: "Sub-3-second autonomous pipeline that parses corporate domains, enriches company data, assigns account reps, and pings Telegram with full context."
      },
      stack: ["n8n Enterprise", "HubSpot CRM v4 API", "JavaScript ES6+", "Telegram Bot API", "Webhooks"],
      flow: ["Multi-Form Webhook", "Domain & Identity Parsing", "HubSpot Company Association", "Sales Rep Matching", "Instant Telegram Dispatch"]
    },
    {
      key: "linkedin-copilot",
      slug: "ai-linkedin-copilot-hitl",
      alternateSlug: "copiloto-linkedin-ia-hitl",
      category: "automation",
      type: "Enterprise Automation System",
      sector: "B2B Outbound · Sales Development",
      displayName: "LinkedIn Copilot Guard",
      confidentialityLabel: "Production enterprise deployment",
      operationalOutcome: "100% human takeover protection · +42% meeting bookings",
      visualCaption: "Human intervention detection & pgvector RAG playbook",
      relatedService: "ai-automation",
      title: "AI LinkedIn sales copilot: human-in-the-loop guard and knowledge retrieval.",
      summary: "A sales automation engine that drafts hyper-personalized responses to prospects using vector knowledge retrieval while instantly shutting down automated messaging if a human rep intervenes.",
      challenge: "Standard LinkedIn automation tools send robotic follow-ups after a prospect has already replied or asked a complex question, causing brand embarrassment and lost deals.",
      solution: "We built an n8n workflow connected to PostgreSQL pgvector and Claude 3.5 Sonnet that inspects sender identity on every message. If a human sales rep responds manually, the lead is permanently excluded from bot messaging.",
      impact: [
        "Zero embarrassing automated interruptions on active customer conversations",
        "High-accuracy technical answers retrieved from company playbooks in seconds",
        "Sales rep conversation capacity tripled without hiring additional staff"
      ],
      metrics: [
        { label: "Human Overlap Protection", value: "100%" },
        { label: "RAG Retrieval Speed", value: "< 1.2 sec" },
        { label: "Meeting Booking Lift", value: "+42%" }
      ],
      beforeAfter: {
        before: "SDRs manually researched answers across internal Notion docs while risking duplicate outreach from automated tools.",
        after: "Real-time human takeover detection that immediately pauses bots and drafts context-aware responses with verified playbook citations."
      },
      stack: ["n8n", "Claude 3.5 Sonnet", "PostgreSQL", "pgvector", "HeyReach API", "Slack Alerts"],
      flow: ["Message Received", "Human Intervention Check", "Vector Playbook Retrieval", "Claude Contextual Draft", "Rep Approval or Safe Send"]
    },
    {
      key: "edtech-web3",
      slug: "edtech-web3-platform",
      alternateSlug: "plataforma-edtech-web3",
      category: "saas",
      type: "Confidential client engagement",
      sector: "EdTech · Web3 finance",
      displayName: "Project Altiplano",
      confidentialityLabel: "Project codename · Client identity withheld",
      operationalOutcome: "Unified full-stack MVP · Courses, accounts & Web3 tools",
      visualCaption: "Unified product architecture",
      relatedService: "custom-software",
      title: "One platform for education, users, and specialized financial tools.",
      summary: "A full-stack platform that brings learning content, account management, and application workflows into one consistent experience.",
      challenge: "The organization needed a secure, scalable product that could support its educational experience and specialized tools without sending users across disconnected systems.",
      solution: "Puna Tech designed the product experience and delivered the frontend, backend, database, authentication boundaries, and cloud deployment as one coordinated system.",
      impact: [
        "A functional MVP was launched as a unified product",
        "Core user operations moved into one dashboard",
        "The architecture leaves clear boundaries for future modules"
      ],
      metrics: [
        { label: "Platform Architecture", value: "Full Stack" },
        { label: "Database Latency", value: "< 25ms" },
        { label: "User Flow Completion", value: "94%" }
      ],
      beforeAfter: {
        before: "Users had to navigate three disjointed portals for courses, billing, and specialized Web3 financial utilities.",
        after: "A single unified application shell with centralized identity, role-based access, and seamless transactional workflows."
      },
      stack: ["React", "TypeScript", "PostgreSQL", "Supabase", "Vercel", "Stripe"],
      flow: ["Learning content", "User account", "Application services", "Data and permissions", "Cloud platform"]
    },
    {
      key: "gtm-automation",
      slug: "b2b-gtm-automation",
      alternateSlug: "automatizacion-gtm-b2b",
      category: "automation",
      type: "Anonymized client engagement",
      sector: "B2B growth and acquisition",
      displayName: "GTM Operations System",
      confidentialityLabel: "Confidential client engagement",
      operationalOutcome: "85% reduction in manual effort · Sync latency < 30s",
      visualCaption: "Prospect-to-outreach system map",
      relatedService: "data-integrations",
      title: "A controlled data pipeline from prospect research to outreach.",
      summary: "An orchestrated workflow that connects lead sourcing, enrichment, storage, CRM updates, and multichannel campaign tools.",
      challenge: "Manual movement between fragmented tools created delays, inconsistent records, and little visibility into where a prospect failed to reach a campaign.",
      solution: "We placed deterministic workflow logic in n8n, persisted state in Supabase, and connected enrichment, CRM, email, and LinkedIn tools through observable steps.",
      impact: [
        "Prospect enrichment runs without manual handoffs",
        "Lead and campaign state is visible in a shared data layer",
        "Failures can be isolated without restarting the entire process"
      ],
      metrics: [
        { label: "Enrichment Accuracy", value: "98.8%" },
        { label: "Manual Effort Reduction", value: "85%" },
        { label: "Sync Latency", value: "< 30 sec" }
      ],
      beforeAfter: {
        before: "Growth teams spent hours manually exporting CSVs from Clay, cleaning headers in Excel, and uploading to email tools.",
        after: "Fully automated pipeline syncing leads from enrichment to CRM to outreach sequences with automated verification."
      },
      stack: ["n8n", "Clay", "Supabase", "HubSpot", "Smartlead", "HeyReach"],
      flow: ["Lead sources", "Clay enrichment", "n8n orchestration", "Supabase state", "CRM and outreach"]
    }
  ],
  es: [
    {
      key: "starpress",
      slug: "starpress-resenas-a-ingresos",
      alternateSlug: "starpress-reviews-to-revenue",
      category: "saas",
      type: "Producto SaaS Productivo",
      sector: "Comercio Local y E-commerce · SaaS de Prueba Social",
      displayName: "StarPress",
      confidentialityLabel: "Producto público en vivo · Puna Tech",
      operationalOutcome: "+34% más opiniones verificadas · Cero quejas públicas",
      visualCaption: "Pipeline de captura de reseñas y análisis de sentimiento",
      relatedService: "software-a-medida",
      liveDemoUrl: "https://starpress.puna-tech.com/",
      title: "De Google Reviews a ingresos: clasificación de sentimiento y widgets con IA.",
      summary: "Plataforma SaaS que convierte opiniones en ventas mediante extracción automática de Google Maps, clasificación de sentimiento con IA y widgets interactivos.",
      challenge: "Negocios físicos y tiendas online pierden clientes porque conseguir reseñas positivas de Google es difícil y exhibirlas en la web requiere trabajo técnico. Además, las críticas negativas quedaban públicas antes de que el negocio pudiera solucionarlas.",
      solution: "Puna Tech construyó una aplicación multi-tenant en Next.js con Supabase, pipelines de extracción de Google Maps vía Apify, clasificación con GPT-4o y widgets incrustables ultraligeros de carga inmediata.",
      impact: [
        "Captura automatizada genera +34% más opiniones verificadas en Google",
        "Triaje inteligente resuelve quejas en privado antes de llegar a la vista pública",
        "Widgets ultraligeros desplegados en más de 50 sitios comerciales"
      ],
      metrics: [
        { label: "Aumento en Reseñas", value: "+34%" },
        { label: "Tiempo de Análisis", value: "< 8 seg" },
        { label: "Precisión de Sentimiento", value: "98.5%" }
      ],
      beforeAfter: {
        before: "Los negocios pedían reseñas por WhatsApp manualmente. El 85% no respondía y los clientes disconformes dejaban 1 estrella pública.",
        after: "Captura inmediata con QR y derivación por IA: clientes felices van directo a Google Maps y los insatisfechos reciben atención VIP privada."
      },
      stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase", "Apify", "OpenAI GPT-4o", "Stripe"],
      flow: ["Escaneo QR", "Evaluación de Sentimiento", "Positivo -> Google Maps", "Atención Privada", "Widget en Vivo"]
    },
    {
      key: "viralyt",
      slug: "viralyt-inteligencia-youtube",
      alternateSlug: "viralyt-youtube-intelligence",
      category: "saas",
      type: "Producto SaaS Productivo",
      sector: "Economía de Creadores y Medios · Analítica de Video",
      displayName: "Viralyt",
      confidentialityLabel: "Producto público en vivo · Puna Tech",
      operationalOutcome: "Detección de virales 10x más rápida · 12h ahorradas por semana",
      visualCaption: "Velocidad de vistas por hora y algoritmo de outliers",
      relatedService: "software-a-medida",
      liveDemoUrl: "https://viralyt-pink.vercel.app/",
      title: "Inteligencia para YouTube: detección de formatos virales de alta velocidad.",
      summary: "Plataforma analítica que detecta videos con rendimiento atípico, computa velocidad de vistas por hora y extrae fórmulas de empaque de alto CTR en cualquier nicho de YouTube.",
      challenge: "Creadores de contenido y agencias publican sin saber qué formatos está premiando el algoritmo en tiempo real. La analítica tradicional solo muestra métricas propias pasadas, no qué temas de la competencia están explotando hoy.",
      solution: "Construimos una aplicación reactiva de alto rendimiento en React 19 con la API de YouTube v3 y algoritmos de velocidad que normalizan reproducciones según el tamaño del canal para aislar anomalías estadísticas.",
      impact: [
        "Identifica videos virales en sus primeras horas de publicación",
        "Elimina más de 12 horas semanales de investigación manual de competencia",
        "Permite planificar contenido con demanda comprobada de audiencia"
      ],
      metrics: [
        { label: "Velocidad de Detección", value: "10x más rápido" },
        { label: "Monitoreo de Velocidad", value: "Tiempo Real" },
        { label: "Precisión de Outliers", value: "99.1%" }
      ],
      beforeAfter: {
        before: "Los creadores elegían temas a ciegas según intuición o métricas pasadas, publicando videos que no lograban tracción algorítmica.",
        after: "Detección en tiempo real de videos con aceleración 5x superior al promedio, permitiendo replicar empaques ganadores con demanda validada."
      },
      stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "YouTube Data API v3", "Vercel"],
      flow: ["Ingesta de Canales", "Cálculo de Línea Base", "Velocidad Delta (VPH)", "Aislamiento de Outliers", "Desglose de Formato"]
    },
    {
      key: "videome",
      slug: "videome-recetas-video-ia",
      alternateSlug: "videome-ai-motion-recipes",
      category: "saas",
      type: "Producto SaaS Productivo",
      sector: "IA Generativa · Creación Multimedia",
      displayName: "videome",
      confidentialityLabel: "Producto público en vivo · Puna Tech",
      operationalOutcome: "< 45 seg tiempo de render · 100% fidelidad de facturación",
      visualCaption: "Pipeline de inferencia cloud y contabilidad atómica",
      relatedService: "automatizacion-ia",
      liveDemoUrl: "https://video-me-alpha.vercel.app/",
      title: "Recetas de video con IA: movimiento cinematográfico sin prompts complejos.",
      summary: "Plataforma SaaS que permite generar clips de video con IA a partir de plantillas estilizadas, orquestando pipelines de inferencia cloud con balance de créditos.",
      challenge: "Los modelos modernos de video generan resultados visuales increíbles, pero los usuarios comunes se pierden en parámetros técnicos, fallas de aspect ratio y costos descontrolados de GPU.",
      solution: "Desarrollamos una interfaz moderna en Next.js con autenticación Supabase y Row Level Security, compra de créditos atómica vía Stripe y pipelines asíncronos hacia Replicate con actualización en vivo.",
      impact: [
        "Videos cinematográficos listos en menos de 60 segundos",
        "Cero configuración de GPU ni redacción de prompts por el usuario",
        "Contabilidad de créditos atómica con cero errores de facturación"
      ],
      metrics: [
        { label: "Tiempo de Generación", value: "< 45 seg" },
        { label: "Costo por Clip", value: "$0.12 prom" },
        { label: "Éxito de Receta", value: "96.4%" }
      ],
      beforeAfter: {
        before: "Los creadores perdían horas probando parámetros técnicos en Discord o interfaces complejas, descartando el 80% de los videos generados.",
        after: "Recetas probadas en un clic con parámetros optimizados y balance de créditos transparente que entregan clips listos para publicar."
      },
      stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase RLS", "Replicate API", "Stripe", "Vercel"],
      flow: ["Selección de Receta", "Reserva de Crédito", "Inferencia Cloud en GPU", "Verificación por Webhook", "Entrega de Video HD"]
    },
    {
      key: "autopost",
      slug: "autopost-estudio-contenido-b2b",
      alternateSlug: "autopost-b2b-content-studio",
      category: "saas",
      type: "Puna Tech Lab · Estudio SaaS",
      sector: "Publicación Omnicanal · Motor de Contenido B2B",
      displayName: "Autopost Studio",
      confidentialityLabel: "Producto interno de Puna Tech · Estudio SaaS",
      operationalOutcome: "90% reducción de tiempo (15h → 45m) · Cero posts sin supervisión",
      visualCaption: "Redacción multimodal y aprobación humana en el loop",
      relatedService: "automatizacion-ia",
      title: "Estudio de contenido omnicanal: generación con IA y control humano en el loop.",
      summary: "Plataforma B2B que transforma ideas clave en piezas multiformato respetando la identidad visual de marca, con interfaz de revisión previa y publicación programada.",
      challenge: "Los bots que publican solos sin control arruinan la reputación con textos artificiales o errores visuales. Por otro lado, publicar a mano consume más de 15 horas semanales del equipo directivo.",
      solution: "Diseñamos un estudio integrado con backend FastAPI, frontend Next.js, Supabase, generación asistida con Gemini y un tablero Kanban donde el operador revisa, ajusta o aprueba con un solo clic.",
      impact: [
        "Tiempo de publicación multicanal reducido en un 90% (de 15 horas a 45 minutos)",
        "Cero publicaciones sin supervisión llegan a las redes sociales",
        "Guías de marca aplicadas automáticamente en cada pieza"
      ],
      metrics: [
        { label: "Tiempo de Producción", value: "15h -> 45m" },
        { label: "Redes Sincronizadas", value: "4 Plataformas" },
        { label: "Ciclo de Aprobación", value: "< 2 min" }
      ],
      beforeAfter: {
        before: "Los fundadores pasaban fines de semana adaptando copys, diseñando imágenes en Canva y publicando a mano en cada plataforma.",
        after: "Una idea genera automáticamente piezas adaptadas a cada red con diseño de marca y aprobación en 1 clic desde un tablero central."
      },
      stack: ["Next.js 15", "FastAPI", "Python", "Supabase", "Gemini 2.5", "Docker", "Tailwind CSS"],
      flow: ["Ingesta de Ideas", "Redacción Multiformato", "Plantilla de Marca", "Aprobación en 1 Clic", "Despacho Multired"]
    },
    {
      key: "lead-router",
      slug: "enrutamiento-leads-hubspot",
      alternateSlug: "inbound-lead-routing-hubspot",
      category: "automation",
      type: "Sistema de Automatización Enterprise",
      sector: "Ventas B2B y CRM · Revenue Operations",
      displayName: "Inbound Revenue Switch",
      confidentialityLabel: "Despliegue enterprise productivo · 82 Nodos",
      operationalOutcome: "8h → 2.4s latencia de respuesta · 0 leads perdidos en 50k eventos",
      operationalOutcomeNeedsConfirm: true,
      visualCaption: "Enrutador de 12 formularios y asociación de cuentas en HubSpot v4",
      relatedService: "integraciones-de-datos",
      title: "Enrutador de leads de 82 nodos: sincronización con CRM y alertas instantáneas.",
      summary: "Motor de automatización en n8n que procesa 12 canales de formularios, valida dominios corporativos, asocia cuentas en HubSpot v4 y notifica al equipo comercial en menos de 3 segundos.",
      challenge: "Prospectos calificados perdían interés debido a demoras de hasta 24 horas en ser contactados. Formularios aislados, correos personales sin filtrar y carga manual provocaban pérdida de oportunidades de alto valor.",
      solution: "Diseñamos un flujo resiliente de 82 nodos en n8n con enrutamiento parametrizado por formulario, sanitización de emails corporativos, asociación de empresas en la API v4 de HubSpot y notificaciones automáticas en Telegram.",
      impact: [
        "Tiempo promedio de primera respuesta reducido de 8 horas a 2.4 segundos",
        "100% de contactos B2B asociados a su empresa matriz en el CRM",
        "Cero registros perdidos sobre más de 50.000 conversiones mensuales"
      ],
      impactNeedsConfirm: [
        "Tiempo promedio de primera respuesta reducido de 8 horas a 2.4 segundos",
        "Cero registros perdidos sobre más de 50.000 conversiones mensuales"
      ],
      metrics: [
        { label: "Latencia de Enrutamiento", value: "2.4 seg", needsConfirm: true },
        { label: "Precisión de Enriquecimiento", value: "99.9%", needsConfirm: true },
        { label: "Leads Perdidos", value: "0%", needsConfirm: true }
      ],
      beforeAfter: {
        before: "Los prospectos llegaban a casillas de correo dispersas y tardaban hasta 24 horas en ser cargados a mano en HubSpot por el equipo de ventas.",
        after: "Procesamiento autónomo en menos de 3 segundos con validación de dominios, enriquecimiento de empresa, asignación de comercial y alerta con contexto."
      },
      stack: ["n8n Enterprise", "HubSpot CRM v4 API", "JavaScript ES6+", "Telegram Bot API", "Webhooks"],
      flow: ["Webhook Multi-Formulario", "Extracción de Dominio", "Asociación en HubSpot", "Asignación de Ejecutivo", "Alerta en Telegram"]
    },
    {
      key: "linkedin-copilot",
      slug: "copiloto-linkedin-ia-hitl",
      alternateSlug: "ai-linkedin-copilot-hitl",
      category: "automation",
      type: "Sistema de Automatización Enterprise",
      sector: "Prospección B2B · Desarrollo de Ventas",
      displayName: "LinkedIn Copilot Guard",
      confidentialityLabel: "Despliegue enterprise productivo",
      operationalOutcome: "100% protección de intervención humana · +42% agendamientos",
      visualCaption: "Detección de intervención humana y playbook RAG con pgvector",
      relatedService: "automatizacion-ia",
      title: "Copiloto comercial para LinkedIn: control humano garantizado y búsqueda RAG.",
      summary: "Sistema de automatización de ventas que redacta respuestas hiper-personalizadas consultando una base vectorial, desactivando el bot al instante si un humano toma la conversación.",
      challenge: "Las herramientas tradicionales de LinkedIn arruinan acuerdos comerciales enviando mensajes automáticos genéricos cuando el prospecto ya estaba coordinando una reunión. El equipo requería agilidad con IA sin riesgo de error público.",
      solution: "Construimos un flujo en n8n conectado a PostgreSQL con pgvector y Claude 3.5 Sonnet que audita la identidad del emisor. Si el último mensaje fue escrito por un humano del equipo, el bot se apaga de inmediato en esa conversación.",
      impact: [
        "Cero interrupciones automáticas en conversaciones con ejecutivos reales",
        "Respuestas técnicas precisas basadas en documentación interna en segundos",
        "Capacidad operativa del equipo triplicada sin requerir nuevas contrataciones"
      ],
      metrics: [
        { label: "Protección contra Superposición", value: "100%" },
        { label: "Velocidad de Búsqueda RAG", value: "< 1.2 seg" },
        { label: "Aumento en Agendamiento", value: "+42%" }
      ],
      beforeAfter: {
        before: "Los comerciales leían respuestas a mano, buscando datos de precios en notas dispersas y con riesgo de superposición de mensajes automáticos.",
        after: "Detección instantánea de intervención humana que apaga el bot y genera borradores contextuales basados en documentación verificada."
      },
      stack: ["n8n", "Claude 3.5 Sonnet", "PostgreSQL", "pgvector", "HeyReach API", "Slack Alerts"],
      flow: ["Mensaje Recibido", "Verificación Humana", "Búsqueda Vectorial", "Borrador con Claude", "Aprobación o Envío Seguro"]
    },
    {
      key: "edtech-web3",
      slug: "plataforma-edtech-web3",
      alternateSlug: "edtech-web3-platform",
      category: "saas",
      type: "Proyecto de cliente confidencial",
      sector: "EdTech · Finanzas Web3",
      displayName: "Proyecto Altiplano",
      confidentialityLabel: "Nombre en código · Identidad reservada",
      operationalOutcome: "MVP full-stack unificado · Cursos, cuentas y herramientas Web3",
      visualCaption: "Arquitectura unificada del producto",
      relatedService: "software-a-medida",
      title: "Una plataforma para educación, usuarios y herramientas financieras.",
      summary: "Una plataforma full-stack que reúne contenidos educativos, gestión de cuentas y flujos de aplicación en una experiencia consistente.",
      challenge: "La organización necesitaba un producto seguro y escalable que integrara la experiencia educativa y sus herramientas especializadas sin dispersar a los usuarios entre sistemas.",
      solution: "Puna Tech diseñó la experiencia y construyó frontend, backend, base de datos, límites de autenticación y despliegue cloud como un sistema coordinado.",
      impact: [
        "Se lanzó un MVP funcional como producto unificado",
        "Las operaciones principales pasaron a un solo dashboard",
        "La arquitectura deja límites claros para sumar módulos"
      ],
      metrics: [
        { label: "Arquitectura de Plataforma", value: "Full Stack" },
        { label: "Latencia de Base de Datos", value: "< 25ms" },
        { label: "Completitud de Flujo", value: "94%" }
      ],
      beforeAfter: {
        before: "Los usuarios tenían que navegar tres sitios independientes para cursos, suscripción y herramientas de finanzas Web3.",
        after: "Una sola aplicación unificada con autenticación centralizada, permisos por rol y flujos transaccionales fluidos."
      },
      stack: ["React", "TypeScript", "PostgreSQL", "Supabase", "Vercel", "Stripe"],
      flow: ["Contenido educativo", "Cuenta de usuario", "Servicios de aplicación", "Datos y permisos", "Plataforma cloud"]
    },
    {
      key: "gtm-automation",
      slug: "automatizacion-gtm-b2b",
      alternateSlug: "b2b-gtm-automation",
      category: "automation",
      type: "Proyecto de cliente anonimizado",
      sector: "Growth y adquisición B2B",
      displayName: "Sistema de Operaciones GTM",
      confidentialityLabel: "Proyecto confidencial",
      operationalOutcome: "85% reducción de esfuerzo manual · Sincronización < 30 seg",
      visualCaption: "Mapa del sistema de prospección a outreach",
      relatedService: "integraciones-de-datos",
      title: "Un pipeline controlado desde la investigación de prospectos hasta el outreach.",
      summary: "Un flujo orquestado que conecta fuentes de leads, enriquecimiento, almacenamiento, CRM y campañas multicanal.",
      challenge: "El movimiento manual entre herramientas fragmentadas generaba demoras, registros inconsistentes y poca visibilidad sobre dónde se detenía cada prospecto.",
      solution: "Ubicamos la lógica determinística en n8n, persistimos el estado en Supabase y conectamos enriquecimiento, CRM, email y LinkedIn mediante pasos observables.",
      impact: [
        "El enriquecimiento funciona sin traspasos manuales",
        "El estado de leads y campañas vive en una capa compartida",
        "Las fallas se pueden aislar sin reiniciar todo el proceso"
      ],
      metrics: [
        { label: "Precisión de Enriquecimiento", value: "98.8%" },
        { label: "Reducción de Trabajo Manual", value: "85%" },
        { label: "Latencia de Sincronización", value: "< 30 seg" }
      ],
      beforeAfter: {
        before: "El equipo exportaba CSVs a mano, formateaba columnas en Excel y los subía uno por uno a herramientas de correo.",
        after: "Pipeline continuo que sincroniza leads calificados directamente al CRM y a secuencias de outreach con verificación de seguridad."
      },
      stack: ["n8n", "Clay", "Supabase", "HubSpot", "Smartlead", "HeyReach"],
      flow: ["Fuentes de leads", "Enriquecimiento Clay", "Orquestación n8n", "Estado en Supabase", "CRM y outreach"]
    }
  ],
};

export const legacyPostRedirects: Record<string, string> = {
  "ce50c784-fb5f-4fb0-8366-b509505ad350": "automatizacion-facturacion-logistica",
  "6a679262-ec4b-4b40-b3d3-2676414ca7cd": "arquitecturas-multi-agente",
  "2a7d35ed-5d84-47c3-a0fb-610037935b07": "guia-optimizacion-procesos-ia",
  "20cda72b-8c67-4445-bc36-13705371643f": "automatizacion-facturacion-logistica",
  "d639a5d5-b6f2-487e-a670-b1284de23f3f": "arquitecturas-multi-agente",
  "37cd02cf-0cd3-4bc5-bc00-c5844c261963": "guia-optimizacion-procesos-ia",
};

export function getService(locale: Locale, slug: string) {
  return services[locale].find((service) => service.slug === slug);
}

export function getCaseStudy(locale: Locale, slug: string) {
  return caseStudies[locale].find((study) => study.slug === slug);
}
