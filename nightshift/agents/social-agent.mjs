/**
 * Social Media & Content Agent (Commercial Pillars → Art Studio + Reels)
 * Generates commercial B2B drafts selling Puna Tech's core services:
 * Custom Software, Systems Integrations, and Process Automation.
 * Hands off toward /ops Art Studio molds + Social Studio reel storyboards.
 * Draft-first: ready_to_queue is strictly false.
 */

const DEFAULT_PILLARS = [
  "P1 Automatización: lo repetitivo → sistema (handoffs, gates humanos, Zap≠sistema)",
  "P2 Integraciones: sistemas que se hablan (contratos, glue code, triage de stack)",
  "P3 Custom software: cuando SaaS no alcanza (techo off-the-shelf, proceso real)",
  "P4 Lab vs Client: honestidad de entorno (no vender Lab como prod)",
  "P5 Bottlenecks de operador: cuello → 2–3 opciones → próximo paso (Cal/brief)"
];

const LAB_PROOF_REFERENCES = [
  {
    name: "[Lab] StarPress",
    focus: "Captura automatizada de reseñas en Google Maps con IA y microservicios",
    status: "Laboratorio interno (Lab)",
    use_case: "Demuestra capacidad de ingeniería y microservicios; nunca se vende como producto principal cerrado."
  },
  {
    name: "[Lab] Viralyt",
    focus: "Pipeline analítico de YouTube con cálculo de velocidad por hora (VPH)",
    status: "Laboratorio interno (Lab)",
    use_case: "Demuestra manejo de streaming de datos y pipelines de retención en tiempo real."
  },
  {
    name: "[Lab] videome",
    focus: "Inferencia serverless en GPU para video cinemático con costo fijo $0",
    status: "Laboratorio interno (Lab)",
    use_case: "Demuestra optimización de infraestructura cloud y cómputo serverless."
  }
];

export const ART_MOLDS = [
  "marker-note",
  "paper-photo",
  "bolder-poster",
  "notebook-carousel",
  "dark-tech",
  "polaroid"
];

export class SocialAgent {
  constructor({ llmClient, config }) {
    this.llmClient = llmClient;
    this.config = config;
  }

  async run() {
    const { company, agents } = this.config;
    const socialConfig = agents?.social;

    if (!socialConfig || socialConfig.enabled === false) {
      return { status: "skipped", message: "Social agent disabled in configuration." };
    }

    const pillars = socialConfig.pillars?.length ? socialConfig.pillars : DEFAULT_PILLARS;
    const channels = socialConfig.channels || ["linkedin", "x", "instagram"];
    const targetPlatformFormat = socialConfig.targetPlatformFormat || "art-reels";

    const systemPrompt = `Eres el Director Editorial y Estratega de Contenido Comercial de "${company.name}".
Tu misión es redactar publicaciones estratégicas para vender servicios B2B de desarrollo de software a medida, integraciones de sistemas y automatización operativa.
Los borradores se preparan en modo "Draft-First" para alimentar /ops/art (moldes de Art Studio) y /ops/social (Social Studio y guiones de Reels).

PILARes COMERCIALES OBLIGATORIOS (P1 a P5):
${pillars.map((p, idx) => `${idx + 1}. ${p}`).join("\n")}

REGLAS DE VOZ Y ESTILO:
- Voz: ACM editorial, español rioplatense (ES-AR voseo: tenés, hacé, mirá, resolvé, desarmá, fijate).
- Tono: Pragmático, directo, técnico con criterio operativo, cero humo, cero hype de IA.
- Estructura del contenido: Cuello de botella de operador → 2 a 3 opciones de resolución → Próximo paso concreto.
- Llamada a la acción (CTA): Orientada a Cal.com (diagnóstico de 20 min) o envío de brief de operaciones.
- Honestidad y métricas: Cero métricas inventadas o porcentajes fantasma. Si no hay dato verificado, describir el mecanismo técnico y la ganancia cualitativa real (horas ahorradas, desincronización eliminada, trazabilidad ganada).
- Regla Lab vs Cliente: Puna vende servicios de software y arquitectura. Los productos de laboratorio (${LAB_PROOF_REFERENCES.map(l => l.name).join(", ")}) son SOLO pruebas secundarias opcionales y DEBEN estar etiquetados como '[Lab]'. NUNCA los vendas como producto cerrado de catálogo.
- Anti-temas prohibidos: Growth hacks superficiales, métricas fabricadas, tutoriales Zapier genéricos, o anécdotas personales de Martin en la página de empresa.

CANALES Y FORMATOS:
- LinkedIn: Formato carousel (carrusel educativo/proceso), static (foto editorial + nota) o text.
- X (Twitter): Formato text (máximo 275 caracteres por tweet, conciso y de alto impacto técnico).
- Instagram: Reservado EXCLUSIVAMENTE para formato reel (guion vertical de 5 escenas).
- Moldes Art Studio disponibles (art_mold_suggestion): ${ART_MOLDS.join(", ")}.
  * marker-note: Anotación y marcador sobre fotografía de oficina/taller.
  * paper-photo: Papel rasgado + nota sobre escena cotidiana de trabajo.
  * bolder-poster: Afiche de impacto tipográfico y alto contraste editorial.
  * notebook-carousel: Hoja de cuaderno perforado con espiral, stickers y pestañas.
  * dark-tech: Estilo dark glow, render 3D / arquitectura técnica.
  * polaroid: Fotografía polaroid con cinta adhesiva y retícula editorial.

ESTRUCTURA DE REELS (5 BEATS / ESCENAS):
Cuando el formato sea 'reel', incluir 'reel_scene_hints' con exactamente 5 beats (15-30s total):
1. Gancho (hook, 3-5s): Plantea el dolor o error operativo sin rodeos.
2. Desarrollo 1 (problem, 3-5s): El síntoma visible en el día a día.
3. Desarrollo 2 (insight, 4-6s): Comparación de 2-3 opciones (parche vs solución real).
4. Desarrollo 3 (insight, 4-6s): Cómo lo resuelve Puna con software/sistema.
5. Cierre (cta, 3-5s): Llamada al brief o Cal.com.`;

    const userPrompt = `Genera ${socialConfig.postsPerNight || 3} borradores de contenido comercial para ${company.name}.
Distribución de canales: ${channels.join(", ")}.
Asegurate de cubrir distintos pilares (P1 a P5) y variar los formatos (carrusel, reel, static, text).
Recordá: Instagram solo para formato reel; LinkedIn/X para static, carousel o text.
Target platform format: ${targetPlatformFormat}.

Retorna un objeto JSON con este esquema exacto:
{
  "summary": "Resumen del lote comercial del día y enfoque de pilares",
  "posts": [
    {
      "id": "draft-social-1",
      "pillar_id": "P1" | "P2" | "P3" | "P4" | "P5",
      "pillar": "Nombre completo del pilar",
      "channel": "linkedin" | "x" | "instagram",
      "format": "static" | "carousel" | "reel" | "text",
      "locale": "es",
      "hook": "Gancho inicial de alto impacto (voseo ES-AR)",
      "body": "Cuerpo con problema de operador, opciones y solución técnica",
      "cta": "Llamada a la acción con Cal.com o brief operativo",
      "hashtags": ["#Tag1", "#Tag2"],
      "art_mold_suggestion": "marker-note" | "paper-photo" | "bolder-poster" | "notebook-carousel" | "dark-tech" | "polaroid",
      "ops_handoff": {
        "path_hint": "/ops/art" | "/ops/social/new",
        "visual_kind": "reel" | "single" | "carousel" | "text",
        "ready_to_queue": false
      },
      "reel_scene_hints": [
        {
          "beat": "Gancho" | "Desarrollo 1" | "Desarrollo 2" | "Desarrollo 3" | "Cierre",
          "role": "hook" | "problem" | "insight" | "cta",
          "duration_seconds": 4,
          "headline": "Titular de la escena",
          "visual_hint": "Descripción de la toma o material visual sugerido"
        }
      ],
      "scheduled_time_suggestion": "10:30 AM ART",
      "target_autopost_payload": {
        "scheduled_time_suggestion": "10:30 AM ART",
        "ready_to_queue": false
      }
    }
  ]
}`;

    const mockGenerator = () => ({
      summary: "3 borradores comerciales de Puna Tech orientados a cuellos de botella de operador (P1, P2 y P5) con handoff hacia Art Studio y Social Reels.",
      posts: [
        {
          id: "draft-social-1",
          pillar_id: "P1",
          pillar: "P1 Automatización: lo repetitivo → sistema (handoffs, gates humanos, Zap≠sistema)",
          channel: "linkedin",
          format: "carousel",
          locale: "es",
          hook: "Un Zap no es un sistema: si tu operación se cae porque alguien cambió el nombre de una columna, tenés una bomba de tiempo.",
          body: "El error común en operaciones es conectar herramientas sueltas sin un contrato de datos ni gates humanos de validación.\n\nCuando el volumen sube, los handoffs silenciosos fallan y el equipo pasa horas apagando incendios en planillas.\n\nEn Puna diseñamos automatizaciones con estado persistente, trazabilidad y alertas claras antes de que el error llegue al cliente.",
          cta: "Si tus automatizaciones te generan más soporte que alivio, agendá 20 minutos de diagnóstico en Cal.com o mandanos tu proceso en un brief.",
          hashtags: ["#Automatizacion", "#OperacionesB2B", "#Sistemas", "#PunaTech"],
          art_mold_suggestion: "notebook-carousel",
          ops_handoff: {
            path_hint: "/ops/art",
            visual_kind: "carousel",
            ready_to_queue: false
          },
          scheduled_time_suggestion: "10:30 AM ART",
          target_autopost_payload: {
            scheduled_time_suggestion: "10:30 AM ART",
            ready_to_queue: false
          }
        },
        {
          id: "draft-social-2",
          pillar_id: "P2",
          pillar: "P2 Integraciones: sistemas que se hablan (contratos, glue code, triage de stack)",
          channel: "x",
          format: "text",
          locale: "es",
          hook: "Comprar otro SaaS casi nunca resuelve un problema de datos entre sistemas.",
          body: "Antes de sumar otra suscripción mensual, hacé triage de stack: definí qué sistema es la fuente de verdad y qué glue code falta para que hablen con contratos claros.\n\nMenos herramientas, mejor conectadas.",
          cta: "¿Cuántas herramientas pagan hoy que duplican datos? Coordiná un brief de integraciones en Cal.com.",
          hashtags: ["#Integraciones", "#StackB2B", "#SoftwareArchitecture"],
          art_mold_suggestion: "dark-tech",
          ops_handoff: {
            path_hint: "/ops/social/new",
            visual_kind: "text",
            ready_to_queue: false
          },
          scheduled_time_suggestion: "02:15 PM ART",
          target_autopost_payload: {
            scheduled_time_suggestion: "02:15 PM ART",
            ready_to_queue: false
          }
        },
        {
          id: "draft-social-3",
          pillar_id: "P5",
          pillar: "P5 Bottlenecks de operador: cuello → 2–3 opciones → próximo paso (Cal/brief)",
          channel: "instagram",
          format: "reel",
          locale: "es",
          hook: "El cuello de botella de tu negocio no es la falta de herramientas, es la falta de handoffs claros.",
          body: "Cuando un pedido o cliente pasa de mano en mano por chats de WhatsApp, la fricción se come el margen operativo.\n\nTe mostramos las 3 opciones para destrabarlo sin rehacer todo el stack desde cero.",
          cta: "Revisá el brief en el link de la bio o coordiná 20 min en Cal.com para destrabar tu proceso.",
          hashtags: ["#Operaciones", "#ReelsB2B", "#Optimizacion", "#PunaTech"],
          art_mold_suggestion: "bolder-poster",
          ops_handoff: {
            path_hint: "/ops/social/new",
            visual_kind: "reel",
            ready_to_queue: false
          },
          reel_scene_hints: [
            {
              beat: "Gancho",
              role: "hook",
              duration_seconds: 4,
              headline: "¿Tu equipo pierde 15 horas por semana pasando datos a mano?",
              visual_hint: "Operador visiblemente saturado frente a múltiples pestañas de planillas y mensajes."
            },
            {
              beat: "Desarrollo 1",
              role: "problem",
              duration_seconds: 4,
              headline: "El síntoma: el caos operativo se disfraza de 'trabajo diario'",
              visual_hint: "Notificaciones acumuladas de chats y planillas de cálculo desincronizadas."
            },
            {
              beat: "Desarrollo 2",
              role: "insight",
              duration_seconds: 5,
              headline: "3 caminos: emparchar con otro Zap, contratar más personal, o fijar contratos de datos.",
              visual_hint: "Cuadro comparativo limpio con las 3 alternativas y su impacto de costo."
            },
            {
              beat: "Desarrollo 3",
              role: "insight",
              duration_seconds: 5,
              headline: "En Puna implementamos portales ligeros que eliminan la doble carga.",
              visual_hint: "Captura de interfaz de portal con validación de un clic y estado en tiempo real."
            },
            {
              beat: "Cierre",
              role: "cta",
              duration_seconds: 4,
              headline: "Destrabá el cuello de botella: enviá tu brief de operaciones.",
              visual_hint: "Placa tipográfica estilo Bolder Poster con llamada al brief y Cal.com."
            }
          ],
          scheduled_time_suggestion: "05:00 PM ART",
          target_autopost_payload: {
            scheduled_time_suggestion: "05:00 PM ART",
            ready_to_queue: false
          }
        }
      ]
    });

    const response = await this.llmClient.generate({
      agentName: "SocialAgent",
      systemPrompt,
      userPrompt,
      mockGenerator,
      jsonMode: true,
    });

    return {
      status: "success",
      agent: "Social & Autopost Agent",
      output: response.data || mockGenerator(),
      isSimulated: response.isSimulated,
    };
  }
}
