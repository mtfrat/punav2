export type Locale = "en" | "es";

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
  stack: string[];
  flow: string[];
  displayName: string;
  confidentialityLabel: string;
  visualCaption: string;
  relatedService: string;
}

export const SITE_URL = "https://www.puna-tech.com";
export const CAL_LINK = "puna-tech-r7xi5x/15min";
export const CONTACT_EMAIL = "punatechba@gmail.com";

export const copy = {
  en: {
    locale: "en" as const,
    languageName: "English",
    nav: { services: "Services", work: "Work", process: "How it works", insights: "Blog", brief: "Send a brief" },
    book: "Get a free 15-minute bottleneck audit",
    heroEyebrow: "Software factory",
    heroTitle: "Turn operational bottlenecks into software your team actually uses.",
    heroBody: "Puna Tech designs and builds custom software, AI automation, and systems integrations for operations that have outgrown off-the-shelf tools.",
    heroMicrocopy: "No sales deck—just the bottleneck, the technical options, and the next useful step.",
    seeWork: "See real work",
    proof: ["From discovery through production launch", "Bilingual collaboration across the Americas", "Software, automation, and integrations in one team"],
    fitEyebrow: "Where Puna fits best",
    fitTitle: "For operations that have outgrown spreadsheets, manual handoffs, and disconnected tools.",
    fitBody: "We are most useful when the problem crosses product, data, and operations—not when the answer is another generic website or an AI demo.",
    fit: [
      ["Operational workflows", "Critical work coordinated across spreadsheets, inboxes, CRMs, and internal tools."],
      ["Digital products", "Customer and internal experiences that need reliable permissions, workflows, and ownership."],
      ["Connected systems", "Products that combine data, permissions, user accounts, and specialized workflows."],
    ],
    servicesEyebrow: "Three focused capabilities",
    servicesTitle: "Start with the bottleneck, not the technology.",
    servicesBody: "Each engagement is shaped around one operational outcome and a system your team can own.",
    casesEyebrow: "Selected work",
    casesTitle: "Real systems for work that could not stay manual.",
    casesBody: "The client names can stay private. The operating problem, architecture, and delivered system stay concrete.",
    slowdownEyebrow: "Find your starting point",
    slowdownTitle: "What is slowing your team down?",
    slowdowns: [
      ["Manual work keeps multiplying", "AI workflow automation", "Map and automate the repetitive handoffs without removing human control."],
      ["Your tools do not agree", "Data & systems integration", "Create a reliable data path between the systems already running the operation."],
      ["The operation needs its own product", "Custom B2B software", "Build the portal, platform, or internal tool the workflow actually requires."],
    ],
    auditEyebrow: "The free bottleneck audit",
    auditTitle: "Fifteen focused minutes. One clearer next move.",
    auditSteps: [
      ["Map", "Show us where work stalls, repeats, or disappears between tools."],
      ["Frame", "We separate the process problem from the software problem."],
      ["Decide", "Leave with the most useful next step—even when that is not a build."],
    ],
    processEyebrow: "How we work",
    processTitle: "A short path from ambiguity to a working system.",
    process: [
      ["Discover", "Map the workflow, data, risks, and the business outcome that matters."],
      ["Design", "Define the smallest useful scope, system architecture, and user journey."],
      ["Build", "Ship in reviewable increments with visible technical decisions and QA."],
      ["Launch", "Deploy, document, measure adoption, and define the next improvement."],
    ],
    standardsEyebrow: "Built for ownership",
    standardsTitle: "Clear interfaces. Observable workflows. No black boxes.",
    standards: [
      ["Integration-first", "Connect the tools already running your operation instead of creating another isolated dashboard."],
      ["Human control", "Keep review and approval steps where financial, customer, or operational risk requires them."],
      ["Measurable delivery", "Define what success means before implementation and instrument the workflow from launch."],
    ],
    faqTitle: "Common questions before the first call",
    faqs: [
      ["What kinds of projects are a fit?", "Operational platforms, AI-assisted workflows, data pipelines, and integrations where off-the-shelf software creates friction or leaves important gaps."],
      ["Do you replace our existing tools?", "Usually no. We first look for a reliable way to connect and extend your current stack. Replacement is recommended only when the existing constraint makes it necessary."],
      ["Can we start with a small scope?", "Yes. The first engagement should prove one useful outcome, expose the real integration risks, and leave a production-quality foundation for expansion."],
      ["How do you handle AI risk?", "We use structured outputs, validation, permissions, logging, and human approval for consequential actions. The exact controls depend on the workflow."],
      ["Who owns the software and data?", "Ownership, repositories, infrastructure, access, and handoff are made explicit in the proposal. We build so your business can operate and extend the system without a hidden lock-in."],
      ["How much does a project cost?", "Focused discovery and automation work can start below a full product build. Scope, integration risk, and ownership requirements determine the investment, so we qualify budget privately rather than publishing a misleading package price."],
    ],
    finalTitle: "Bring us the workflow your team has learned to work around.",
    finalBody: "In 15 minutes, we will map the constraint and decide whether software, automation, integration—or no build at all—is the useful next step.",
    briefTitle: "Prefer to write it down?",
    briefBody: "Send a short project brief. We will reply with the next useful question—not an automated sales sequence.",
    blogTitle: "Practical notes on software and operations",
    blogBody: "Evidence-backed guides, implementation lessons, and case-study analysis. Every article is reviewed before publication.",
    readMore: "Read more",
    emptyBlog: "Editorial work is in review. New articles will appear here after human approval.",
    footerLine: "Custom software, AI automation, and systems integrations.",
  },
  es: {
    locale: "es" as const,
    languageName: "Español",
    nav: { services: "Servicios", work: "Trabajo", process: "Cómo funciona", insights: "Blog", brief: "Enviar brief" },
    book: "Pedí una auditoría gratuita de 15 minutos",
    heroEyebrow: "Software factory",
    heroTitle: "Convertí cuellos de botella operativos en software que tu equipo realmente use.",
    heroBody: "Puna Tech diseña y construye software a medida, automatización con IA e integraciones para operaciones que ya superaron las herramientas estándar.",
    heroMicrocopy: "Sin presentación de ventas: el cuello de botella, las opciones técnicas y el próximo paso útil.",
    seeWork: "Ver proyectos reales",
    proof: ["De discovery al lanzamiento productivo", "Colaboración bilingüe en todo el continente", "Software, automatización e integraciones en un solo equipo"],
    fitEyebrow: "Dónde encaja mejor Puna",
    fitTitle: "Para operaciones que ya superaron las planillas, los traspasos manuales y las herramientas desconectadas.",
    fitBody: "Somos más útiles cuando el problema cruza producto, datos y operaciones, no cuando la respuesta es otro sitio genérico o una demo de IA.",
    fit: [
      ["Flujos operativos", "Trabajo crítico coordinado entre planillas, correos, CRMs y herramientas internas."],
      ["Productos digitales", "Experiencias internas y de clientes que necesitan permisos, flujos y propiedad confiables."],
      ["Sistemas conectados", "Productos que combinan datos, permisos, cuentas de usuario y flujos especializados."],
    ],
    servicesEyebrow: "Tres capacidades enfocadas",
    servicesTitle: "Empezamos por el cuello de botella, no por la tecnología.",
    servicesBody: "Cada proyecto se organiza alrededor de un resultado operativo y un sistema que tu equipo pueda comprender y operar.",
    casesEyebrow: "Trabajo seleccionado",
    casesTitle: "Sistemas reales para trabajo que no podía seguir siendo manual.",
    casesBody: "Los nombres pueden permanecer privados. El problema operativo, la arquitectura y el sistema entregado se muestran con claridad.",
    slowdownEyebrow: "Encontrá el punto de partida",
    slowdownTitle: "¿Qué está frenando a tu equipo?",
    slowdowns: [
      ["El trabajo manual no deja de crecer", "Automatización de flujos con IA", "Mapeamos y automatizamos traspasos repetitivos sin eliminar el control humano."],
      ["Tus herramientas no se ponen de acuerdo", "Integración de datos y sistemas", "Creamos un recorrido confiable entre los sistemas que ya sostienen la operación."],
      ["La operación necesita un producto propio", "Software B2B a medida", "Construimos el portal, la plataforma o la herramienta interna que el flujo necesita."],
    ],
    auditEyebrow: "La auditoría gratuita",
    auditTitle: "Quince minutos enfocados. Un próximo paso más claro.",
    auditSteps: [
      ["Mapear", "Mostranos dónde el trabajo se detiene, se repite o se pierde entre herramientas."],
      ["Enmarcar", "Separamos el problema del proceso del problema de software."],
      ["Decidir", "Te llevás el próximo paso más útil, incluso si no implica construir nada."],
    ],
    processEyebrow: "Cómo trabajamos",
    processTitle: "Un recorrido corto desde la ambigüedad hasta un sistema funcionando.",
    process: [
      ["Descubrir", "Mapeamos el flujo, los datos, los riesgos y el resultado de negocio relevante."],
      ["Diseñar", "Definimos el alcance mínimo útil, la arquitectura y la experiencia de usuario."],
      ["Construir", "Entregamos avances revisables con decisiones técnicas visibles y control de calidad."],
      ["Lanzar", "Desplegamos, documentamos, medimos adopción y definimos la siguiente mejora."],
    ],
    standardsEyebrow: "Construido para dar control",
    standardsTitle: "Interfaces claras. Flujos observables. Sin cajas negras.",
    standards: [
      ["Integración primero", "Conectamos las herramientas que ya sostienen la operación antes de sumar otro sistema aislado."],
      ["Control humano", "Conservamos revisión y aprobación donde existe riesgo financiero, operativo o de clientes."],
      ["Entrega medible", "Definimos qué significa éxito antes de implementar e instrumentamos el flujo desde el lanzamiento."],
    ],
    faqTitle: "Preguntas frecuentes antes de la primera llamada",
    faqs: [
      ["¿Qué proyectos encajan mejor?", "Plataformas operativas, flujos asistidos por IA, pipelines de datos e integraciones donde el software estándar genera fricción o deja vacíos importantes."],
      ["¿Reemplazan nuestras herramientas actuales?", "En general, no. Primero buscamos conectar y extender el stack actual. Recomendamos reemplazarlo solo cuando la limitación existente lo vuelve necesario."],
      ["¿Podemos empezar con un alcance pequeño?", "Sí. El primer proyecto debe demostrar un resultado útil, revelar los riesgos reales de integración y dejar una base de producción que pueda crecer."],
      ["¿Cómo controlan el riesgo de la IA?", "Usamos salidas estructuradas, validaciones, permisos, registros y aprobación humana para acciones sensibles. Los controles exactos dependen del flujo."],
      ["¿Quién es dueño del software y los datos?", "La propiedad, los repositorios, la infraestructura, los accesos y el traspaso quedan explícitos en la propuesta. Construimos para que tu empresa pueda operar y extender el sistema sin dependencia oculta."],
      ["¿Cuánto cuesta un proyecto?", "Un trabajo enfocado de discovery o automatización puede comenzar por debajo de un producto completo. El alcance, el riesgo de integración y los requisitos de propiedad definen la inversión; por eso calificamos presupuesto en privado."],
    ],
    finalTitle: "Contanos qué proceso aprendió tu equipo a soportar todos los días.",
    finalBody: "En 15 minutos mapeamos la restricción y definimos si el próximo paso útil es software, automatización, integración o no construir todavía.",
    briefTitle: "¿Preferís explicarlo por escrito?",
    briefBody: "Enviá un brief corto. Te responderemos con la siguiente pregunta útil, no con una secuencia automática de ventas.",
    blogTitle: "Notas prácticas sobre software y operaciones",
    blogBody: "Guías con evidencia, aprendizajes de implementación y análisis de casos. Cada artículo se revisa antes de publicarse.",
    readMore: "Leer más",
    emptyBlog: "El contenido editorial está en revisión. Los nuevos artículos aparecerán después de la aprobación humana.",
    footerLine: "Software a medida, automatización con IA e integraciones de sistemas.",
  },
};

export const services: Record<Locale, ServiceContent[]> = {
  en: [
    {
      key: "ai-automation", slug: "ai-automation", alternateSlug: "automatizacion-ia", eyebrow: "AI workflow automation",
      title: "Automate the handoffs that slow your operation down.",
      description: "We design controlled AI-assisted workflows that classify, enrich, validate, and route operational information across your existing stack.",
      outcome: "A workflow your team can monitor, override, and improve instead of another opaque chatbot.",
      problems: ["Teams copying information between systems", "Unstructured documents blocking downstream work", "AI prototypes with no validation or ownership model"],
      deliverables: ["Workflow and risk map", "Production integrations and validation rules", "Observability, handoff, and operating documentation"],
      architecture: ["Sources", "Orchestration", "Validation", "Human review", "Systems of record"], relatedCase: "b2b-gtm-automation",
    },
    {
      key: "custom-software", slug: "custom-software", alternateSlug: "software-a-medida", eyebrow: "Custom B2B software",
      title: "Turn a fragmented operation into one coherent product.",
      description: "We build web platforms, internal tools, and customer portals around the workflows and permissions your business actually needs.",
      outcome: "A focused product with a maintainable architecture, clear roles, and fewer operational workarounds.",
      problems: ["Spreadsheets acting as a critical system", "Disconnected customer and internal experiences", "Legacy interfaces that make simple work difficult"],
      deliverables: ["Product scope and interaction design", "Frontend, backend, database, and deployment", "Testing, documentation, and launch support"],
      architecture: ["User journeys", "Application", "Business logic", "Data model", "Cloud deployment"], relatedCase: "edtech-web3-platform",
    },
    {
      key: "data-integrations", slug: "data-integrations", alternateSlug: "integraciones-de-datos", eyebrow: "Data and systems integration",
      title: "Make your tools exchange reliable information.",
      description: "We connect CRMs, databases, outreach tools, APIs, and internal services with deterministic pipelines and explicit failure handling.",
      outcome: "Cleaner data movement, visible errors, and less manual reconciliation between teams.",
      problems: ["Duplicate or incomplete records", "Brittle point-to-point automations", "No shared source of truth for operational data"],
      deliverables: ["System and data-flow audit", "Versioned integrations and retry policies", "Monitoring, alerting, and runbooks"],
      architecture: ["Applications", "API contracts", "Workflow engine", "Database", "Monitoring"], relatedCase: "b2b-gtm-automation",
    },
  ],
  es: [
    {
      key: "ai-automation", slug: "automatizacion-ia", alternateSlug: "ai-automation", eyebrow: "Automatización de flujos con IA",
      title: "Automatizá los traspasos que frenan tu operación.",
      description: "Diseñamos flujos controlados que clasifican, enriquecen, validan y distribuyen información operativa entre las herramientas que ya usás.",
      outcome: "Un flujo que tu equipo puede observar, corregir y mejorar, no otro chatbot opaco.",
      problems: ["Equipos copiando información entre sistemas", "Documentos sin estructura que bloquean procesos", "Prototipos de IA sin validación ni responsables"],
      deliverables: ["Mapa del flujo y sus riesgos", "Integraciones productivas y reglas de validación", "Observabilidad, traspaso y documentación operativa"],
      architecture: ["Fuentes", "Orquestación", "Validación", "Revisión humana", "Sistemas de registro"], relatedCase: "automatizacion-gtm-b2b",
    },
    {
      key: "custom-software", slug: "software-a-medida", alternateSlug: "custom-software", eyebrow: "Software B2B a medida",
      title: "Convertí una operación fragmentada en un producto coherente.",
      description: "Construimos plataformas web, herramientas internas y portales alrededor de los flujos y permisos que realmente necesita tu negocio.",
      outcome: "Un producto enfocado, con arquitectura mantenible, roles claros y menos soluciones improvisadas.",
      problems: ["Planillas funcionando como sistema crítico", "Experiencias internas y de clientes desconectadas", "Interfaces heredadas que complican tareas simples"],
      deliverables: ["Alcance de producto y diseño de interacción", "Frontend, backend, base de datos y despliegue", "Pruebas, documentación y acompañamiento de lanzamiento"],
      architecture: ["Experiencia", "Aplicación", "Lógica de negocio", "Modelo de datos", "Despliegue cloud"], relatedCase: "plataforma-edtech-web3",
    },
    {
      key: "data-integrations", slug: "integraciones-de-datos", alternateSlug: "data-integrations", eyebrow: "Integración de datos y sistemas",
      title: "Hacé que tus herramientas intercambien información confiable.",
      description: "Conectamos CRMs, bases de datos, herramientas de outreach, APIs y servicios internos con pipelines determinísticos y fallas explícitas.",
      outcome: "Datos más limpios, errores visibles y menos conciliación manual entre equipos.",
      problems: ["Registros duplicados o incompletos", "Automatizaciones punto a punto frágiles", "Ausencia de una fuente compartida de datos operativos"],
      deliverables: ["Auditoría de sistemas y flujos de datos", "Integraciones versionadas y políticas de reintento", "Monitoreo, alertas y manuales operativos"],
      architecture: ["Aplicaciones", "Contratos de API", "Motor de flujos", "Base de datos", "Monitoreo"], relatedCase: "automatizacion-gtm-b2b",
    },
  ],
};

export const caseStudies: Record<Locale, CaseStudyContent[]> = {
  en: [
    {
      key: "edtech-web3", slug: "edtech-web3-platform", alternateSlug: "plataforma-edtech-web3", type: "Confidential client engagement", sector: "EdTech · Web3 finance",
      displayName: "Project Altiplano", confidentialityLabel: "Project codename · Client identity withheld", visualCaption: "Unified product architecture", relatedService: "custom-software",
      title: "One platform for education, users, and specialized financial tools.",
      summary: "A full-stack platform that brings learning content, account management, and application workflows into one consistent experience.",
      challenge: "The organization needed a secure, scalable product that could support its educational experience and specialized tools without sending users across disconnected systems.",
      solution: "Puna Tech designed the product experience and delivered the frontend, backend, database, authentication boundaries, and cloud deployment as one coordinated system.",
      impact: ["A functional MVP was launched as a unified product", "Core user operations moved into one dashboard", "The architecture leaves clear boundaries for future modules"],
      stack: ["React", "TypeScript", "PostgreSQL", "Supabase", "Vercel", "Stripe"],
      flow: ["Learning content", "User account", "Application services", "Data and permissions", "Cloud platform"],
    },
    {
      key: "gtm-automation", slug: "b2b-gtm-automation", alternateSlug: "automatizacion-gtm-b2b", type: "Anonymized client engagement", sector: "B2B growth and acquisition",
      displayName: "GTM Operations System", confidentialityLabel: "Confidential client engagement", visualCaption: "Prospect-to-outreach system map", relatedService: "data-integrations",
      title: "A controlled data pipeline from prospect research to outreach.",
      summary: "An orchestrated workflow that connects lead sourcing, enrichment, storage, CRM updates, and multichannel campaign tools.",
      challenge: "Manual movement between fragmented tools created delays, inconsistent records, and little visibility into where a prospect failed to reach a campaign.",
      solution: "We placed deterministic workflow logic in n8n, persisted state in Supabase, and connected enrichment, CRM, email, and LinkedIn tools through observable steps.",
      impact: ["Prospect enrichment runs without manual handoffs", "Lead and campaign state is visible in a shared data layer", "Failures can be isolated without restarting the entire process"],
      stack: ["n8n", "Clay", "Supabase", "HubSpot", "Smartlead", "HeyReach"],
      flow: ["Lead sources", "Clay enrichment", "n8n orchestration", "Supabase state", "CRM and outreach"],
    },
    {
      key: "autopost", slug: "autopost-content-infrastructure", alternateSlug: "autopost-infraestructura-contenido", type: "Puna Tech Lab · Internal product", sector: "Content operations",
      displayName: "Autopost", confidentialityLabel: "Puna Tech internal product", visualCaption: "Containerized publishing workflow", relatedService: "ai-automation",
      title: "Autopost: repeatable content operations in isolated cloud jobs.",
      summary: "An internal system for processing content inputs, media assets, schedules, and publishing steps without daily manual coordination.",
      challenge: "Recurring audiovisual publishing across multiple channels consumed operator time and made consistency dependent on repeated manual steps.",
      solution: "Puna Tech packaged the workflow into managed repositories and containers, with media-processing scripts and cloud execution that can be deployed and monitored consistently.",
      impact: ["Recurring steps run through one defined workflow", "Deployments are reproducible across isolated environments", "Manual attention is reserved for review and exceptions"],
      stack: ["GitHub", "Docker", "Cloudflare", "Media automation", "Scheduled jobs"],
      flow: ["Content inputs", "Processing scripts", "Container job", "Cloud storage", "Publishing channels"],
    },
  ],
  es: [
    {
      key: "edtech-web3", slug: "plataforma-edtech-web3", alternateSlug: "edtech-web3-platform", type: "Proyecto de cliente confidencial", sector: "EdTech · Finanzas Web3",
      displayName: "Proyecto Altiplano", confidentialityLabel: "Nombre en código · Identidad reservada", visualCaption: "Arquitectura unificada del producto", relatedService: "software-a-medida",
      title: "Una plataforma para educación, usuarios y herramientas financieras.",
      summary: "Una plataforma full-stack que reúne contenidos educativos, gestión de cuentas y flujos de aplicación en una experiencia consistente.",
      challenge: "La organización necesitaba un producto seguro y escalable que integrara la experiencia educativa y sus herramientas especializadas sin dispersar a los usuarios entre sistemas.",
      solution: "Puna Tech diseñó la experiencia y construyó frontend, backend, base de datos, límites de autenticación y despliegue cloud como un sistema coordinado.",
      impact: ["Se lanzó un MVP funcional como producto unificado", "Las operaciones principales pasaron a un solo dashboard", "La arquitectura deja límites claros para sumar módulos"],
      stack: ["React", "TypeScript", "PostgreSQL", "Supabase", "Vercel", "Stripe"],
      flow: ["Contenido educativo", "Cuenta de usuario", "Servicios de aplicación", "Datos y permisos", "Plataforma cloud"],
    },
    {
      key: "gtm-automation", slug: "automatizacion-gtm-b2b", alternateSlug: "b2b-gtm-automation", type: "Proyecto de cliente anonimizado", sector: "Growth y adquisición B2B",
      displayName: "Sistema de Operaciones GTM", confidentialityLabel: "Proyecto confidencial", visualCaption: "Mapa del sistema de prospección a outreach", relatedService: "integraciones-de-datos",
      title: "Un pipeline controlado desde la investigación de prospectos hasta el outreach.",
      summary: "Un flujo orquestado que conecta fuentes de leads, enriquecimiento, almacenamiento, CRM y campañas multicanal.",
      challenge: "El movimiento manual entre herramientas fragmentadas generaba demoras, registros inconsistentes y poca visibilidad sobre dónde se detenía cada prospecto.",
      solution: "Ubicamos la lógica determinística en n8n, persistimos el estado en Supabase y conectamos enriquecimiento, CRM, email y LinkedIn mediante pasos observables.",
      impact: ["El enriquecimiento funciona sin traspasos manuales", "El estado de leads y campañas vive en una capa compartida", "Las fallas se pueden aislar sin reiniciar todo el proceso"],
      stack: ["n8n", "Clay", "Supabase", "HubSpot", "Smartlead", "HeyReach"],
      flow: ["Fuentes de leads", "Enriquecimiento Clay", "Orquestación n8n", "Estado en Supabase", "CRM y outreach"],
    },
    {
      key: "autopost", slug: "autopost-infraestructura-contenido", alternateSlug: "autopost-content-infrastructure", type: "Puna Tech Lab · Producto interno", sector: "Operaciones de contenido",
      displayName: "Autopost", confidentialityLabel: "Producto interno de Puna Tech", visualCaption: "Flujo de publicación en contenedores", relatedService: "automatizacion-ia",
      title: "Autopost: operaciones de contenido repetibles en la nube.",
      summary: "Un sistema interno para procesar entradas, medios, programación y publicación sin coordinación manual diaria.",
      challenge: "La publicación audiovisual recurrente en múltiples canales consumía tiempo operativo y hacía que la consistencia dependiera de pasos manuales repetidos.",
      solution: "Puna Tech empaquetó el flujo en repositorios y contenedores gestionados, con scripts de procesamiento de medios y ejecución cloud reproducible.",
      impact: ["Los pasos recurrentes funcionan en un flujo definido", "Los despliegues son reproducibles en entornos aislados", "La intervención manual queda reservada para revisión y excepciones"],
      stack: ["GitHub", "Docker", "Cloudflare", "Automatización de medios", "Tareas programadas"],
      flow: ["Entradas", "Scripts de procesamiento", "Contenedor", "Almacenamiento cloud", "Canales de publicación"],
    },
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

export function homePath(locale: Locale) {
  return locale === "en" ? "/" : "/es";
}

export function servicePath(locale: Locale, slug: string) {
  return locale === "en" ? `/services/${slug}` : `/es/servicios/${slug}`;
}

export function casePath(locale: Locale, slug: string) {
  return locale === "en" ? `/case-studies/${slug}` : `/es/casos/${slug}`;
}

export function blogPath(locale: Locale, slug?: string) {
  const base = locale === "en" ? "/blog" : "/es/blog";
  return slug ? `${base}/${slug}` : base;
}
