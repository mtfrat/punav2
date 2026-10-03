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

export const SITE_URL = "https://www.puna-tech.com";
export const CAL_LINK = "puna-tech-r7xi5x/15min";
export const CONTACT_EMAIL = "punatechba@gmail.com";

export const copy = {
  en: {
    locale: "en" as const,
    languageName: "English",
    nav: { services: "Services", work: "Work", process: "How it works", insights: "Blog", brief: "Prefer writing? Send a short note" },
    book: "Map the bottleneck in 15 min",
    sendBrief: "Prefer writing? Send a short note",
    heroEyebrow: "Puna Tech · Buenos Aires · B2B software factory",
    heroTitle: "Custom software for operations that outgrew off-the-shelf tools.",
    heroItalic: "outgrew off-the-shelf tools",
    heroBody: "Custom software to automate B2B operations in Argentina. For operations teams that no longer fit a spreadsheet or a catalog tool. Not a generic SaaS, and not software for everyone.",
    heroCompare: "If a critical flow needs permissions, rules, or integrations the standard tool does not cover, we build it custom. If connecting what you already run is enough, we start there.",
    heroLabClarification: "Lab SaaS products demonstrate how we ship and operate software; client delivery is the core business.",
    heroMicrocopy: "Fifteen minutes. The bottleneck, the options, the next useful step.",
    seeWork: "Explore our services",
    proof: ["From discovery through production launch", "Bilingual collaboration across the Americas", "Software, automation, and integrations in one team"],
    workLabEyebrow: "SaaS Lab",
    workLabTitle: "Lab demos · Proof of execution",
    workLabSubtitle: "Live products we ship ourselves to prove architecture and delivery standards—not the catalogue we sell.",
    workLabBadge: "Lab demo",
    workClientEyebrow: "Client Delivery",
    workClientTitle: "Client delivery · Production systems",
    workClientSubtitle: "Custom software, automations, and integrations built for specific operational bottlenecks. Client names stay private; outcomes and architectures stay concrete.",
    workClientBadge: "Client delivery",
    openCase: "Open case",
    liveDemo: "Live demo",
    viewArchitecture: "View delivery architecture",
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
      ["Manual work keeps multiplying", "Process automation · AI workflows", "Map and automate the repetitive handoffs without removing human control."],
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
    compareTitle: "When off-the-shelf is enough, and when custom is required",
    compareColumns: ["Off-the-shelf tool", "Custom software (Puna Tech)"],
    compareRows: [
      ["Fits when", "The process fits the product and native integrations are enough", "The handoff, the exception, or the data does not fit the product"],
      ["What you get", "Configuration or an extension of what you already run", "Your own system: automation, integrations, a portal, or an internal tool"],
      ["Ownership", "You depend on the vendor roadmap", "Your team runs it. Repos and access are written into the proposal"],
      ["Typical risk", "Forcing the process into the product’s mold", "Building too much when what you already run still works"],
      ["First step", "Connect or extend what you have", "Map the bottleneck in 15 min and decide whether to build"],
    ] as [string, string, string][],
    versusTitle: "Puna Tech versus other ways to solve it",
    versus: [
      ["Vs a generic agency.", "An agency usually works on the site, the brand, or campaigns. We build the system of the workflow: automation, data, and integrations your team can run."],
      ["Vs loose no-code.", "No-code is fine for prototypes and simple flows. When permissions, exceptions, CRM or ERP, and visible failures matter, you need engineering with an owner and an explicit handoff, not a chain of automations with no owner."],
      ["Vs “software for everyone”.", "We do not sell a horizontal SaaS or “AI for any industry.” The work is B2B operations in Argentina, and bilingual collaboration across the Americas, when the team outgrew off-the-shelf tools."],
    ] as [string, string][],
    faqTitle: "Common questions before the first call",
    faqs: [
      ["What kinds of projects are a fit?", "Operational platforms, AI-assisted workflows, data pipelines, and integrations where off-the-shelf software creates friction or leaves important gaps."],
      ["When is custom software better than an off-the-shelf tool?", "When a critical workflow needs specific roles, data rules, or integrations that standard tools cannot support cleanly. We first check whether your current tools can be connected or extended."],
      ["Do you replace our existing tools?", "Usually no. We first look for a reliable way to connect and extend your current stack. Replacement is recommended only when the existing constraint makes it necessary."],
      ["Can we start with a small scope?", "Yes. The first engagement should prove one useful outcome, expose the real integration risks, and leave a production-quality foundation for expansion."],
      ["How do you handle AI risk?", "We use structured outputs, validation, permissions, logging, and human approval for consequential actions. The exact controls depend on the workflow."],
      ["Are you the same company as PUNA Software Factory?", "No. PUNA Software Factory is based in Salta (punasoftwarefactory.com.ar). We are Puna Tech (puna-tech.com), a Buenos Aires software factory: custom software, automation, and integrations for B2B operations."],
      ["Do you automate business operations in Argentina?", "Yes. We design and ship custom software to automate B2B operations in Argentina, with bilingual collaboration when the project spans the Americas."],
      ["How are you different from other software factories?", "Other factories may be the right fit depending on scope. We fit when the bottleneck is a concrete operational workflow (automation, integration, or an internal tool) and the team needs a system it can run."],
      ["How much does it cost to automate one process?", "It depends on the process: discovery, how many integrations, third-party licenses, and what has to be maintained afterward. We do not publish a price. Scope sets the investment, and we talk budget in private. In 15 minutes we frame what is in and what is out, not a quote."],
      ["If we hire custom work, who owns the code, the repo, and the access?", "Ownership, repositories, and access are written into the proposal. We build so your team can run and extend the system without a hidden lock-in."],
      ["Zapier, n8n, Make, or custom development?", "Zapier, n8n, or Make is enough when the process fits, someone can maintain it, and exceptions are few. When the handoff, the exception, or the data is the work, and the flow cannot live in one person’s account, you need custom engineering or an integration with an owner. If a connector closes the case, we say so: custom build is not required."],
      ["Our SaaS is too small for the exceptions. When do we go custom?", "Stay on SaaS if the process is industry-standard and the vendor’s integrations cover it. Go custom when the business rule does not fit the product, when a parallel spreadsheet is already the real system, or when a critical handoff is not recorded anywhere."],
    ],
    finalTitle: "Bring us the workflow your team has learned to work around.",
    finalBody: "In 15 minutes, we will map the constraint and decide whether software, automation, integration—or no build at all—is the useful next step.",
    briefTitle: "Prefer to write it down?",
    briefBody: "Send a short project brief. We will reply with the next useful question—not an automated sales sequence.",
    blogTitle: "Practical notes on software and operations",
    blogBody: "Evidence-backed guides, implementation lessons, and case-study analysis. Every article is reviewed before publication.",
    readMore: "Read more",
    emptyBlog: "Editorial work is in review. New articles will appear here after human approval.",
    footerLine: "Puna Tech · Buenos Aires · custom software for B2B operations.",
    latamEyebrow: "Buenos Aires · LATAM-AR",
    latamTitle: "Software factory in Argentina and LATAM for B2B operations.",
    latamBody: "Puna Tech (Buenos Aires) is a software factory that designs and ships custom software to automate B2B operations in Argentina: process automation, integrations (CRM, ERP, APIs), and systems the team can run. Lab SaaS proves execution; client delivery is the business.",
    latamPoints: [
      ["Custom software · internal tools", "Platforms and portals shaped to your workflows."],
      ["Process automation with human control", "Handoffs with validation where risk requires it."],
      ["CRM / ERP / API integration", "Reliable corridors with visible failures."],
      ["Explicit ownership · no hidden lock-in", "Repos, access, and infrastructure in the proposal."],
      ["Bilingual collaboration across the Americas", "US and LATAM stakeholders in one engagement."],
    ],
  },
  es: {
    locale: "es" as const,
    languageName: "Español",
    nav: { services: "Servicios", work: "Trabajo", process: "Cómo funciona", insights: "Blog", brief: "¿Preferís escribir? Mandá una nota corta" },
    book: "Mapeá el cuello de botella en 15 min",
    sendBrief: "¿Preferís escribir? Mandá una nota corta",
    heroEyebrow: "Puna Tech · Buenos Aires · software factory B2B",
    heroTitle: "Software a medida para operaciones que ya superaron las herramientas estándar.",
    heroItalic: "herramientas estándar",
    heroBody: "Software a medida para automatizar operaciones B2B en Argentina. Para equipos de operaciones que ya no entran en una planilla o en una herramienta de catálogo. No es un SaaS genérico ni un producto para todo el mundo.",
    heroCompare: "Si un flujo crítico necesita permisos, reglas o integraciones que lo estándar no resuelve, lo construimos a medida. Si alcanza con conectar lo que ya usan, empezamos por ahí.",
    heroLabClarification: "Los productos SaaS del lab demuestran cómo construimos y operamos software; la entrega a clientes es el negocio principal.",
    heroMicrocopy: "Quince minutos. El cuello de botella, las opciones y el próximo paso útil.",
    seeWork: "Explorar servicios",
    proof: ["De discovery al lanzamiento productivo", "Colaboración bilingüe en todo el continente", "Software, automatización e integraciones en un solo equipo"],
    workLabEyebrow: "Laboratorio SaaS",
    workLabTitle: "Demos de lab · Prueba de ejecución",
    workLabSubtitle: "Productos en vivo que construimos nosotros para probar arquitectura y estándar de entrega—no el catálogo que vendemos.",
    workLabBadge: "Demo de lab",
    workClientEyebrow: "Entrega a Clientes",
    workClientTitle: "Entrega a clientes · Sistemas en producción",
    workClientSubtitle: "Software a medida, automatizaciones e integraciones para cuellos de botella específicos. Nombres en reserva; resultados y arquitecturas concretas.",
    workClientBadge: "Entrega a cliente",
    openCase: "Abrir caso",
    liveDemo: "Demo en vivo",
    viewArchitecture: "Ver arquitectura de entrega",
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
      ["El trabajo manual no deja de crecer", "Automatización de procesos · flujos con IA", "Mapeamos y automatizamos traspasos repetitivos sin eliminar el control humano."],
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
    compareTitle: "¿Cuándo alcanza lo estándar y cuándo hace falta a medida?",
    compareColumns: ["Herramienta estándar", "Software a medida (Puna Tech)"],
    compareRows: [
      ["Encaja cuando", "El proceso cabe en el producto y las integraciones nativas bastan", "El handoff, la excepción o el dato no caben en el producto"],
      ["Qué obtenés", "Configuración o extensión de lo que ya usan", "Sistema propio: automatización, integraciones, portal o herramienta interna"],
      ["Propiedad", "Dependés del roadmap del proveedor", "El equipo lo opera. Repos y accesos quedan escritos en la propuesta"],
      ["Riesgo típico", "Forzar el proceso al molde del software", "Construir de más cuando lo que ya usan todavía alcanza"],
      ["Primer paso", "Conectar o extender lo que ya tienen", "Mapear el cuello de botella en 15 min y decidir si construir"],
    ] as [string, string, string][],
    versusTitle: "Puna Tech frente a otras formas de resolverlo",
    versus: [
      ["Vs agencia genérica.", "Una agencia suele trabajar sitio, marca o campañas. Nosotros armamos el sistema del flujo: automatización, datos e integraciones que el equipo puede operar."],
      ["Vs no-code suelto.", "El no-code sirve para prototipos y flujos simples. Cuando hay permisos, excepciones, CRM o ERP, y las fallas tienen que verse, hace falta ingeniería con dueño y handoff explícito, no una cadena de automatizaciones sin dueño."],
      ["Vs “software para todos”.", "No vendemos un SaaS horizontal ni “IA para cualquier industria”. El trabajo es operaciones B2B en Argentina, y colaboración bilingüe en las Américas, cuando el equipo ya superó las herramientas estándar."],
    ] as [string, string][],
    faqTitle: "Preguntas frecuentes antes de la primera llamada",
    faqs: [
      ["¿Qué proyectos encajan mejor?", "Plataformas operativas, flujos asistidos por IA, pipelines de datos e integraciones donde el software estándar genera fricción o deja vacíos importantes."],
      ["¿Cuándo conviene el software a medida frente a uno estándar?", "Cuando un flujo crítico necesita permisos, reglas de datos o integraciones que las herramientas estándar no resuelven bien. Primero evaluamos si se pueden conectar o extender las herramientas actuales."],
      ["¿Reemplazan nuestras herramientas actuales?", "En general, no. Primero buscamos conectar y extender el stack actual. Recomendamos reemplazarlo solo cuando la limitación existente lo vuelve necesario."],
      ["¿Podemos empezar con un alcance pequeño?", "Sí. El primer proyecto debe demostrar un resultado útil, revelar los riesgos reales de integración y dejar una base de producción que pueda crecer."],
      ["¿Cómo controlan el riesgo de la IA?", "Usamos salidas estructuradas, validaciones, permisos, registros y aprobación humana para acciones sensibles. Los controles exactos dependen del flujo."],
      ["¿Son la misma empresa que PUNA Software Factory?", "No. PUNA Software Factory opera desde Salta (punasoftwarefactory.com.ar). Nosotros somos Puna Tech (puna-tech.com), software factory en Buenos Aires: software a medida, automatización e integraciones para operaciones B2B."],
      ["¿Automatizan operaciones de empresas en Argentina?", "Sí. Diseñamos y entregamos software a medida para automatizar operaciones B2B en Argentina, con colaboración bilingüe cuando el proyecto cruza las Américas."],
      ["¿En qué se diferencian de otras software factories?", "Otras factories pueden ser la opción correcta según el alcance. Nosotros encajamos cuando el cuello de botella es un flujo operativo concreto (automatización, integración o herramienta interna) y el equipo necesita un sistema que pueda operar."],
      ["¿Cuánto cuesta automatizar un proceso?", "Depende del proceso: el relevamiento, cuántas integraciones hacen falta, las licencias de terceros y qué hay que mantener después. No publicamos un precio. El alcance define la inversión, y el presupuesto lo vemos en privado. En 15 minutos acotamos qué entra y qué no, no una cotización."],
      ["Si contratamos a medida, ¿de quién queda el código, el repo y los accesos?", "La propiedad, los repositorios y los accesos quedan escritos en la propuesta. Construimos para que tu equipo pueda operar y extender el sistema sin dependencia oculta."],
      ["¿Zapier, n8n, Make o desarrollo a medida?", "Zapier, n8n o Make alcanzan cuando el proceso cabe, hay alguien que lo mantiene y las excepciones son pocas. Cuando el handoff, la excepción o el dato son el trabajo, y el flujo no puede vivir en la cuenta de una sola persona, hace falta ingeniería a medida o una integración con dueño. Si un conector cierra el caso, lo decimos: no hace falta construir a medida."],
      ["El SaaS nos queda chico en las excepciones. ¿Cuándo pedimos a medida?", "Seguí en SaaS si el proceso es el del rubro y las integraciones del proveedor alcanzan. Pedí a medida cuando la regla de negocio no entra en el producto, cuando una planilla paralela ya es el sistema real, o cuando el handoff crítico no queda registrado en ninguna herramienta."],
    ],
    finalTitle: "Contanos qué proceso aprendió tu equipo a soportar todos los días.",
    finalBody: "En 15 minutos mapeamos la restricción y definimos si el próximo paso útil es software, automatización, integración o no construir todavía.",
    briefTitle: "¿Preferís explicarlo por escrito?",
    briefBody: "Enviá un brief corto. Te responderemos con la siguiente pregunta útil, no con una secuencia automática de ventas.",
    blogTitle: "Notas prácticas sobre software y operaciones",
    blogBody: "Guías con evidencia, aprendizajes de implementación y análisis de casos. Cada artículo se revisa antes de publicarse.",
    readMore: "Leer más",
    emptyBlog: "El contenido editorial está en revisión. Los nuevos artículos aparecerán después de la aprobación humana.",
    footerLine: "Puna Tech · Buenos Aires · software a medida para operaciones B2B.",
    latamEyebrow: "Buenos Aires · LATAM-AR",
    latamTitle: "Software factory en Argentina y LATAM para operaciones B2B.",
    latamBody: "Puna Tech (Buenos Aires) es una software factory que diseña y entrega software a medida para automatizar operaciones B2B en Argentina: automatización de procesos, integraciones (CRM, ERP, APIs) y sistemas que el equipo puede operar. El lab SaaS prueba ejecución; la entrega a clientes es el negocio.",
    latamPoints: [
      ["Software a medida · herramientas internas", "Plataformas y portales armados alrededor de tus flujos."],
      ["Automatización de procesos con control humano", "Traspasos con validación donde el riesgo lo pide."],
      ["Integración CRM / ERP / APIs", "Corredores confiables con fallas visibles."],
      ["Propiedad explícita · sin lock-in oculto", "repositorios, accesos e infraestructura en la propuesta."],
      ["Colaboración bilingüe en las Américas", "Stakeholders en LATAM y EE.UU. en el mismo proyecto."],
    ],
  },
};

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
      eyebrow: "Automatización de procesos · Flujos con IA",
      title: "Automatizá los traspasos que frenan tu operación.",
      description: "Diseñamos automatización de procesos y flujos asistidos por IA que clasifican, enriquecen, validan y distribuyen información operativa entre las herramientas que ya usás—sin sacar el control humano donde importa.",
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
      metaTitle: "Automatización de procesos | Puna Tech",
      metaDescription: "Automatización de procesos y flujos con IA controlada: clasificar, enriquecer, validar y enrutar—con control humano. Mapeá el cuello de botella en 15 min.",
      hubBlurb: "Traspasos controlados: clasificar, enriquecer, validar, enrutar—con control humano donde importa.",
      commercialSections: [
        {
          heading: "Para quién es / cuándo contratar",
          body: "Contratá automatización de procesos cuando los traspasos repetitivos, la triaje de documentos, el enrutamiento de leads o las actualizaciones de CRM consumen tiempo operativo—y las herramientas estándar llegan al techo de lógica, volumen o control. Encaja con equipos B2B que necesitan orquestación determinística (a menudo estilo n8n o a medida) con validación y revisión humana, no un demo de chatbot.",
        },
        {
          heading: "Qué construimos",
          body: "No vendemos “IA para todo”. Mapeamos el cuello de botella, decidimos qué debe ser determinístico vs asistido por modelo, y entregamos un flujo que ops pueda operar.",
          bullets: [
            "Automatización de procesos entre formularios, docs, CRM y herramientas internas",
            "Clasificación / enriquecimiento / enrutamiento con salidas estructuradas",
            "Gates human-in-the-loop en acciones sensibles",
            "Observabilidad: logs, reintentos y fallas explícitas",
          ],
        },
        {
          heading: "Cómo funciona el engagement",
          body: "Descubrir traspasos → diseñar el camino mínimo confiable → construir con validación y revisión → lanzar con manuales. El alcance se ata primero a un resultado operativo.",
        },
      ],
      proofStrip: [
        { slug: "copiloto-linkedin-ia-hitl", caption: "Copiloto LinkedIn Guard — copiloto comercial con control humano" },
        { slug: "automatizacion-gtm-b2b", caption: "Sistema de Operaciones GTM — pipeline de investigación a outreach" },
        { slug: "enrutamiento-leads-hubspot", caption: "Inbound Revenue Switch — enrutador inbound con sync a CRM" },
        { slug: "autopost-estudio-contenido-b2b", caption: "Autopost Studio — contenido omnicanal con aprobación humana (Lab)" },
      ],
      faqs: [
        ["¿Es automatización de procesos o “automatización con IA”?", "Las dos cuando aportan. La mayor parte del valor es automatización de procesos confiable; la IA asiste en clasificación o borradores solo donde hay validación y control humano."],
        ["¿Esto reemplaza al equipo?", "No. Sacamos traspasos repetitivos para que las personas conserven el criterio en pasos sensibles."],
        ["¿Cómo controlan el riesgo de la IA?", "Salidas estructuradas, validaciones, permisos, registros y aprobación humana en acciones sensibles—según el flujo."],
        ["¿Podemos empezar chico?", "Sí. Un cuello de botella, un camino medible a producción, después expandimos."],
        ["¿Trabajan con HubSpot / stacks tipo n8n?", "Sí cuando encajan en la operación. Ya entregamos sistemas de cliente con sync a CRM, enrutamiento y orquestación; la stack sigue al cuello de botella, no a un pitch de vendor."],
      ],
      finalCtaTitle: "En 15 minutos mapeamos la restricción y definimos el próximo paso útil.",
      finalCtaBody: "Automatización de procesos, flujo con IA—o no construir todavía.",
    },
    {
      key: "custom-software", slug: "software-a-medida", alternateSlug: "custom-software",
      eyebrow: "Software B2B a medida · Software factory",
      title: "Software a medida para operaciones que necesitan un producto propio.",
      description: "Diseñamos y entregamos plataformas web, herramientas internas y portales alrededor de los flujos, roles y permisos que realmente necesita tu negocio—no otro template genérico. El lab SaaS prueba ejecución; la entrega a clientes es el negocio.",
      outcome: "Un producto enfocado, con arquitectura mantenible, roles claros y menos soluciones improvisadas—software que tu equipo pueda operar.",
      problems: [
        "Planillas funcionando como sistema crítico",
        "Experiencias internas y de clientes desconectadas",
        "Interfaces heredadas que complican tareas simples",
        "Herramientas estándar que fuerzan workarounds en flujos core",
      ],
      deliverables: [
        "Alcance de producto y diseño de interacción",
        "Frontend, backend, base de datos y despliegue",
        "Pruebas, documentación y acompañamiento de lanzamiento",
        "Propiedad explícita de repos, accesos y traspaso",
      ],
      architecture: ["Experiencia", "Aplicación", "Lógica de negocio", "Modelo de datos", "Despliegue cloud"],
      relatedCase: "plataforma-edtech-web3",
      metaTitle: "Software a medida Argentina | Puna Tech",
      metaDescription: "Software B2B a medida, herramientas internas y portales para cómo opera tu empresa—con propiedad de tu equipo. Mapeá el cuello de botella en 15 min.",
      hubBlurb: "Plataformas, herramientas internas y portales armados alrededor de tus flujos y permisos.",
      commercialSections: [
        {
          heading: "Para quién es / cuándo contratar",
          body: "Contratá desarrollo de software a medida / software factory cuando un flujo crítico necesita permisos, reglas de datos o integraciones que las herramientas estándar no resuelven bien—o cuando planillas y portales desconectados ya son el sistema real. Encaja con PyMEs y mid-market B2B que necesitan herramientas internas, portales operativos o un producto para clientes que el stack actual no cubre.",
        },
        {
          heading: "Qué construimos",
          body: "Arrancamos por el cuello de botella y el alcance mínimo útil. Entrega tipo factory: avances revisables, decisiones técnicas visibles y una base mantenible.",
          bullets: [
            "Herramientas internas y dashboards operativos",
            "Portales de clientes / partners con permisos reales",
            "Aplicaciones web B2B armadas alrededor del flujo",
            "Capas a medida que extienden (no reemplazan a ciegas) el stack actual",
          ],
        },
        {
          heading: "Cómo funciona el engagement",
          body: "La propiedad del código, la infraestructura y los accesos queda explícita en la propuesta. Sin dependencia oculta.",
          bullets: [
            "Descubrir — Flujo, datos, riesgos y resultado de negocio.",
            "Diseñar — Alcance mínimo útil, arquitectura y experiencia.",
            "Construir — Avances revisables con QA.",
            "Lanzar — Despliegue, documentación, adopción y siguiente mejora.",
          ],
        },
      ],
      proofStrip: [
        { slug: "plataforma-edtech-web3", caption: "Proyecto Altiplano — una plataforma para educación, usuarios y flujos de aplicación" },
        { slug: "starpress-resenas-a-ingresos", caption: "StarPress — de reviews a ingresos (Lab · prueba de ejecución)" },
        { slug: "viralyt-inteligencia-youtube", caption: "Viralyt — inteligencia de outliers en YouTube (Lab · prueba de ejecución)" },
      ],
      faqs: [
        ["¿Cuándo conviene el software a medida frente a uno estándar?", "Cuando un flujo crítico necesita permisos, reglas de datos o integraciones que las herramientas estándar no resuelven bien. Primero evaluamos conectar o extender el stack actual."],
        ["¿Reemplazan nuestras herramientas actuales?", "En general, no. Primero conectamos y extendemos. Reemplazo solo cuando la limitación lo vuelve necesario."],
        ["¿Podemos empezar con un alcance pequeño?", "Sí. El primer proyecto debe demostrar un resultado útil, revelar riesgos de integración y dejar una base de producción."],
        ["¿Quién es dueño del software y los datos?", "Propiedad, repos, infraestructura, accesos y traspaso quedan explícitos en la propuesta. Sin dependencia oculta."],
        ["¿Cuánto cuesta un proyecto?", "Discovery o una primera herramienta interna puede empezar por debajo de un producto completo. El alcance y el riesgo definen la inversión; calificamos presupuesto en privado."],
      ],
      finalCtaTitle: "En 15 minutos mapeamos la restricción y definimos el próximo paso útil.",
      finalCtaBody: "Software a medida, herramientas internas—o no construir todavía.",
      finalCtaMicro: "Quince minutos. El cuello de botella, las opciones y el próximo paso útil.",
    },
    {
      key: "data-integrations", slug: "integraciones-de-datos", alternateSlug: "data-integrations",
      eyebrow: "Integración de datos y sistemas · CRM / ERP",
      title: "Hacé que tu CRM, ERP y herramientas intercambien información confiable.",
      description: "Conectamos CRMs, ERPs, bases de datos, herramientas de outreach, APIs y servicios internos con pipelines determinísticos y fallas explícitas—para que los equipos dejen de conciliar a mano los mismos registros.",
      outcome: "Datos más limpios entre sistemas, errores visibles y menos conciliación manual entre equipos.",
      problems: [
        "Registros duplicados o incompletos entre CRM y ops",
        "Automatizaciones punto a punto frágiles",
        "Ausencia de una fuente compartida de datos operativos",
        "Conciliación manual entre ventas, ops y finanzas",
      ],
      deliverables: [
        "Auditoría de sistemas y flujos de datos",
        "Integraciones versionadas y políticas de reintento",
        "Monitoreo, alertas y manuales operativos",
        "Contratos claros entre CRM / ERP / servicios internos",
      ],
      architecture: ["Aplicaciones", "Contratos de API", "Motor de flujos", "Base de datos", "Monitoreo"],
      relatedCase: "automatizacion-gtm-b2b",
      metaTitle: "Integración de sistemas CRM ERP | Puna Tech",
      metaDescription: "Integración CRM, ERP, APIs e internas—pipelines determinísticos, fallas explícitas, menos conciliación manual. Mapeá el cuello de botella en 15 min.",
      hubBlurb: "Corredores confiables entre CRM, ERP, APIs y servicios internos—con fallas visibles.",
      commercialSections: [
        {
          heading: "Para quién es / cuándo contratar",
          body: "Contratá integración de sistemas cuando CRM, ERP, planillas y herramientas de outreach no se ponen de acuerdo—y el pegamento son scripts sueltos o cadenas frágiles tipo Zapier/Make. Encaja con operaciones B2B que necesitan un recorrido confiable entre sistemas de registro, con reintentos, monitoreo y dueños claros.",
        },
        {
          heading: "Qué construimos",
          body: "Arrancamos por el recorrido de datos que duele (leads, órdenes, stock, tickets)—no por un catálogo de vendors.",
          bullets: [
            "Sync CRM ↔ ERP / base de datos / API interna con contratos explícitos",
            "Pipelines de entrada y salida con validación e idempotencia",
            "Motores de flujo que reemplazan enlaces punto a punto frágiles",
            "Monitoreo, alertas y manuales para que las fallas se vean",
          ],
        },
        {
          heading: "Cómo funciona el engagement",
          body: "Auditar sistemas y flujos → definir contratos y modos de falla → construir integraciones versionadas → lanzar con monitoreo y documentación de traspaso. El primer alcance prueba un corredor confiable entre sistemas.",
        },
      ],
      proofStrip: [
        { slug: "enrutamiento-leads-hubspot", caption: "Inbound Revenue Switch — enrutador inbound de 82 nodos con sync a CRM" },
        { slug: "automatizacion-gtm-b2b", caption: "Sistema de Operaciones GTM — pipeline controlado de investigación a outreach" },
      ],
      faqs: [
        ["¿Integran CRM y ERP?", "Sí—cuando la operación necesita un corredor confiable entre esos sistemas y herramientas adyacentes (APIs, bases, outreach). El alcance sigue al recorrido de datos que se rompe."],
        ["¿Sacan nuestras herramientas actuales?", "En general, no. Primero conectamos y estabilizamos. Reemplazo solo cuando la limitación lo exige."],
        ["¿En qué se diferencia de Zapier o Make?", "Esas herramientas sirven hasta que la lógica, el volumen o el manejo de fallas las supera. Construimos integraciones versionadas y monitoreadas que tu equipo pueda operar—a veces junto al iPaaS, a veces en lugar de él en el camino crítico."],
        ["¿Qué queda en el traspaso?", "Contratos, políticas de reintento, monitoreo, alertas y manuales—no un script sin documentar."],
        ["¿Podemos empezar con un solo sync?", "Sí. Un corredor, calidad de producción, después expandimos."],
      ],
      finalCtaTitle: "En 15 minutos mapeamos la restricción y definimos el próximo paso útil.",
      finalCtaBody: "Integración de sistemas, pipeline de datos—o no construir todavía.",
    },
  ],
};

export const servicesHubCopy = {
  en: {
    metaTitle: "Services | Software, Automation, Integrations | Puna Tech",
    metaDescription: "Custom software, process automation, and systems integration for B2B operations—factory delivery your team can own.",
    eyebrow: "Three focused capabilities",
    title: "Start with the bottleneck, not the technology.",
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
    title: "Empezamos por el cuello de botella, no por la tecnología.",
    intro: "Puna Tech es una software factory B2B para automatización, integraciones y sistemas a medida. Cada proyecto se organiza alrededor de un resultado operativo y un sistema que tu equipo pueda operar. El lab SaaS prueba ejecución; la entrega a clientes es el negocio. Elegí el camino que matchea la restricción—o mapealo con nosotros en 15 minutos.",
    cardOrderKeys: ["custom-software", "ai-automation", "data-integrations"] as const,
    cardTitles: {
      "custom-software": "Software B2B a medida",
      "ai-automation": "Automatización de procesos · flujos con IA",
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
      liveDemoUrl: "https://video-dy9egdm6l-mfrats-projects.vercel.app/",
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
      liveDemoUrl: "https://video-dy9egdm6l-mfrats-projects.vercel.app/",
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

export function homePath(locale: Locale) {
  return locale === "en" ? "/" : "/es";
}

export function servicePath(locale: Locale, slug: string) {
  return locale === "en" ? `/services/${slug}` : `/es/servicios/${slug}`;
}

export function casePath(locale: Locale, slug: string) {
  return locale === "en" ? `/case-studies/${slug}` : `/es/casos/${slug}`;
}

export function servicesHubPath(locale: Locale) {
  return locale === "en" ? "/services" : "/es/servicios";
}

export function casesHubPath(locale: Locale) {
  return locale === "en" ? "/case-studies" : "/es/casos";
}

export function blogPath(locale: Locale, slug?: string) {
  const base = locale === "en" ? "/blog" : "/es/blog";
  return slug ? `${base}/${slug}` : base;
}
