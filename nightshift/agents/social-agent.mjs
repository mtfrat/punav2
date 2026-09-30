/**
 * Social Media & Autopost Agent (Engineering Authority & Real Case Studies)
 * Generates high-impact B2B publications for LinkedIn and X anchored in Puna Tech's
 * real engineering projects (StarPress, Viralyt, videome, B2B Custom Portals).
 * Eliminates generic advice and drops low-ROI channels (Instagram).
 */

const PUNA_CASE_STUDIES = [
  {
    name: "StarPress",
    focus: "Motor de análisis de sentimiento con IA y captura automatizada de reseñas en Google Maps",
    metric: "+34% de calificaciones verificadas y 0 tiempo administrativo de persecución",
    tech: "Supabase + Node.js Microservices + Google Places API",
    problem: "Comercios y franquicias pierden el 80% de reseñas positivas porque pedir feedback manualmente a clientes es lento y desordenado."
  },
  {
    name: "Viralyt",
    focus: "Plataforma analítica para creadores de YouTube con cálculo de velocidad de reproducciones (VPH)",
    metric: "Predicción temprana de videos virales aislando métricas atípicas de retención",
    tech: "Pipeline de datos en TypeScript + Serverless Aggregations + YouTube Data API",
    problem: "Los paneles nativos de analítica muestran métricas con 48h de retraso, impidiendo iterar títulos y miniaturas a tiempo."
  },
  {
    name: "videome",
    focus: "Plataforma SaaS de generación de video con inferencia en GPU serverless",
    metric: "Procesamiento cinemático de videos en menos de 60 segundos",
    tech: "Inferencia en GPU serverless + React Router + Worker Queues",
    problem: "Renderizar videos con IA en servidores dedicados fijos cuesta miles de dólares al mes en capacidad ociosa."
  },
  {
    name: "Portales Operativos B2B",
    focus: "Sustitución de planillas Excel gigantescas y caos de WhatsApp por portales web ligeros",
    metric: "15 a 20 horas semanales ahorradas por equipo y conciliación inmediata de remitos/estados",
    tech: "React 19 + Supabase RLS + Webhooks en tiempo real",
    problem: "Empresas con decenas de choferes o compradores de pozo coordinan operaciones críticas por mensajes dispersos de WhatsApp."
  }
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

    // Default to LinkedIn and X only for engineering B2B authority
    const channels = (socialConfig.channels || ["linkedin", "x"]).filter(c => c !== "instagram");

    const systemPrompt = `Eres el Director de Estrategia de Contenido y Comunicación Técnica de "${company.name}".
Tu misión es redactar publicaciones de autoridad en ingeniería de software para LinkedIn y X (Twitter).
Cero clichés, cero hype superficial de IA, cero tecnicismos vacíos.

Fórmula obligatoria para cada post:
1. Problema Operativo Real (el dolor concreto en horas, dinero o caos que sufre una empresa).
2. Arquitectura de Código Implementada (la solución de ingeniería que Puna Tech construyó).
3. Resultado Cuantificable (la métrica de ahorro, velocidad o conversión lograda).

Casos de estudio reales de Puna Tech en los que DEBES anclar las publicaciones:
${JSON.stringify(PUNA_CASE_STUDIES, null, 2)}

Reglas de formato:
- Para X (Twitter): Máximo 275 caracteres por tweet, gancho contundente y directo.
- Para LinkedIn: Estructura clara con gancho inicial, desarrollo arquitectónico con valor real, y llamada a la acción (CTA) orientada a debate entre directores técnicos u operativos.
- Formato de respuesta: JSON estructurado.`;

    const userPrompt = `Genera ${socialConfig.postsPerNight || 3} publicaciones estratégicas distribuidas en los canales: ${channels.join(", ")}.
Rotar entre los casos de estudio reales de Puna Tech (StarPress, Viralyt, videome y Portales Operativos B2B).

Retorna un objeto JSON con este esquema:
{
  "summary": "Enfoque técnico del día y caso de estudio destacado",
  "posts": [
    {
      "id": "draft-1",
      "channel": "linkedin" | "x",
      "case_study_referenced": "StarPress | Viralyt | videome | Portales B2B",
      "locale": "es",
      "hook": "Gancho inicial de alto impacto",
      "body": "Cuerpo del post con la arquitectura técnica y el resultado cuantificable",
      "cta": "Llamada a la acción orientada a conversación",
      "hashtags": ["#Tag1", "#Tag2"],
      "image_suggestion": "Diagrama de arquitectura o captura de terminal sugerida",
      "target_autopost_payload": {
        "scheduled_time_suggestion": "10:30 AM ART",
        "ready_to_queue": true
      }
    }
  ]
}`;

    const mockGenerator = () => ({
      summary: `3 publicaciones de ingeniería técnica para Puna Tech ancladas en casos reales: StarPress, Viralyt y videome.`,
      posts: [
        {
          id: "draft-social-1",
          channel: "linkedin",
          case_study_referenced: "Portales B2B",
          locale: "es",
          hook: "Si tu equipo de logística coordina más de 20 choferes por WhatsApp, no tienes un canal de comunicación: tienes un pozo ciego de horas hombre.",
          body: "El error común es contratar más personal administrativo para pasar datos de chats a un Excel que tarda 48 horas en conciliarse.\n\nEn Puna Tech construimos portales operativos web ligeros sobre Supabase: el chofer marca 'Entregado' con una foto desde el navegador móvil en 3 segundos, y el cliente recibe trazabilidad en tiempo real sin instalar apps.\n\nResultado: 18 horas semanales ahorradas en llamados y 0 remitos extraviados.",
          cta: "¿Cómo resuelven hoy la trazabilidad de operaciones de última milla en su equipo? Los leo en comentarios.",
          hashtags: ["#SoftwareEngineering", "#Logistica", "#B2BArchitecture", "#PunaTech"],
          image_suggestion: "Diagrama minimalista de flujo: Chofer Móvil -> Supabase RLS -> Dashboard de Control en Tiempo Real.",
          target_autopost_payload: {
            scheduled_time_suggestion: "10:30 AM ART",
            ready_to_queue: true
          }
        },
        {
          id: "draft-social-2",
          channel: "x",
          case_study_referenced: "videome",
          locale: "es",
          hook: "Pagar servidores GPU dedicados 24/7 para renderizar video con IA es el error #1 de arquitectura en 2026.",
          body: "En videome implementamos inferencia serverless en GPU: las instancias se levantan en frío y procesan en <60s solo cuando entra el request. Cero costo fijo ocioso.",
          cta: "Medir latencia antes de sobreaprovisionar.",
          hashtags: ["#Serverless", "#GPUInference", "#BuildInPublic"],
          image_suggestion: "Gráfico de uso de GPU serverless vs instancias dedicadas ociosas.",
          target_autopost_payload: {
            scheduled_time_suggestion: "02:15 PM ART",
            ready_to_queue: true
          }
        },
        {
          id: "draft-social-3",
          channel: "linkedin",
          case_study_referenced: "Viralyt",
          locale: "es",
          hook: "¿Por qué los dashboards de analítica tradicionales no sirven para predecir qué contenido va a traccionar?",
          body: "El problema es la latencia de datos: cuando una plataforma te muestra que un video rindió bien, la curva de distribución orgánica ya pasó.\n\nCon Viralyt diseñamos un motor en TypeScript que calcula la velocidad por hora (VPH) y compara la retención contra la mediana histórica en los primeros 120 minutos.\n\nEso permite tomar decisiones de miniaturas y títulos en tiempo real, no como una autopsia a las 72 horas.",
          cta: "¿En sus productos analizan métricas en tiempo real o dependen de reportes diferidos?",
          hashtags: ["#DataPipelines", "#TypeScript", "#Analytics", "#PunaTech"],
          image_suggestion: "Captura de pantalla de la curva VPH con detección de anomalías.",
          target_autopost_payload: {
            scheduled_time_suggestion: "05:00 PM ART",
            ready_to_queue: true
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
