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
  liveDemoUrl?: string;
  metrics?: { label: string; value: string }[];
  beforeAfter?: { before: string; after: string };
  category?: "saas" | "automation";
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
      key: "starpress",
      slug: "starpress-reviews-to-revenue",
      alternateSlug: "starpress-resenas-a-ingresos",
      category: "saas",
      type: "Production SaaS Product",
      sector: "Local Commerce & E-commerce · Social Proof SaaS",
      displayName: "StarPress",
      confidentialityLabel: "Live public product · Puna Tech",
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
      metrics: [
        { label: "Routing Latency", value: "2.4 sec" },
        { label: "Enrichment Match", value: "99.9%" },
        { label: "Dropped Leads", value: "0%" }
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
      metrics: [
        { label: "Latencia de Enrutamiento", value: "2.4 seg" },
        { label: "Precisión de Enriquecimiento", value: "99.9%" },
        { label: "Leads Perdidos", value: "0%" }
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

export function blogPath(locale: Locale, slug?: string) {
  const base = locale === "en" ? "/blog" : "/es/blog";
  return slug ? `${base}/${slug}` : base;
}
