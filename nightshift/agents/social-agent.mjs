/**
 * Social Media & Autopost Agent
 * Generates high-quality, brand-aligned social drafts ready for 1-click publishing in Autopost.
 */

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

    const systemPrompt = `Eres el estratega senior de contenido y redes sociales para "${company.name}".
Tu objetivo es generar borradores de publicaciones de alto impacto, libres de hype o afirmaciones sin sustento, perfectamente adaptadas al tono: "${company.toneOfVoice}".
Propuesta de valor: "${company.valueProposition}".
Audiencia: ${company.targetAudience.join(", ")}.

Reglas críticas de formato:
- Para X (Twitter): Máximo 275 caracteres por tweet, gancho contundente.
- Para LinkedIn: Estructura clara con gancho inicial, desarrollo con valor real o aprendizajes técnicos, y llamada a la acción (CTA) orientada a conversación.
- Para Instagram: Copy atractivo con sugerencia visual para carrusel o imagen.
- Todos los posts deben retornar en JSON estructurado.`;

    const userPrompt = `Genera ${socialConfig.postsPerNight || 3} publicaciones para los siguientes canales: ${socialConfig.channels.join(", ")}.
Pilares temáticos a cubrir:
${socialConfig.pillars.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Retorna un objeto JSON con este esquema:
{
  "summary": "Breve resumen del enfoque del día",
  "posts": [
    {
      "id": "draft-1",
      "channel": "linkedin" | "x" | "instagram",
      "locale": "es",
      "hook": "Gancho inicial de alto impacto",
      "body": "Cuerpo del post con valor concreto",
      "cta": "Llamada a la acción clara",
      "hashtags": ["#Tag1", "#Tag2"],
      "image_suggestion": "Descripción para el equipo visual o banner",
      "target_autopost_payload": {
        "scheduled_time_suggestion": "10:30 AM",
        "ready_to_queue": true
      }
    }
  ]
}`;

    const mockGenerator = () => ({
      summary: `3 publicaciones generadas para ${company.name} enfocadas en ingeniería de software y automatización operativa.`,
      posts: [
        {
          id: "draft-social-1",
          channel: "linkedin",
          locale: "es",
          hook: "¿Por qué el 70% de las automatizaciones con IA fallan en agencias antes de los 90 días?",
          body: "El error no suele ser el modelo, sino la falta de supervisión humana y arquitectura desacoplada.\n\nEn Puna Tech implementamos el principio de 'Draft-First': el modelo nunca envía correos ni publica en producción por su cuenta; prepara colas de trabajo que un humano aprueba con 1 clic.\n\nEl resultado: 0 riesgo reputacional y 10x más velocidad en operaciones repetitivas.",
          cta: "¿Cómo manejan hoy la supervisión de procesos automáticos en su equipo? Los leo.",
          hashtags: ["#SoftwareEngineering", "#AIWorkflows", "#Operations", "#PunaTech"],
          image_suggestion: "Diagrama minimalista comparando 'Black-Box AI' vs 'Human-in-the-Loop Architecture'.",
          target_autopost_payload: {
            scheduled_time_suggestion: "10:30 AM ART",
            ready_to_queue: true
          }
        },
        {
          id: "draft-social-2",
          channel: "x",
          locale: "es",
          hook: "Regla de oro para escalar una agencia dev en 2026: menos micro-gestión, más pipelines supervisados.",
          body: "Si tu equipo gasta 2 horas diarias copiando datos entre CRM, briefs y código, no necesitas más personal: necesitas un pipeline con n8n + Supabase.",
          cta: "Medir antes de construir.",
          hashtags: ["#BuildInPublic", "#DevAgency"],
          image_suggestion: "Captura de pantalla limpia de terminal con build exitoso.",
          target_autopost_payload: {
            scheduled_time_suggestion: "02:15 PM ART",
            ready_to_queue: true
          }
        },
        {
          id: "draft-social-3",
          channel: "instagram",
          locale: "es",
          hook: "3 errores silenciosos en la arquitectura de un software a medida",
          body: "1. Acoplar la lógica de negocio al proveedor de IA.\n2. No auditar el gasto de tokens por request.\n3. Descuidar el SEO técnico prerenderizado desde el día 1.\n\nEn este carrusel te mostramos cómo estructuramos proyectos escalables.",
          cta: "Guarda este post si estás planificando tu próximo desarrollo.",
          hashtags: ["#TechTips", "#DesarrolloWeb", "#SoftwareFactory"],
          image_suggestion: "Carrusel de 4 slides en paleta oscura con acentos turquesa y tipografía mono.",
          target_autopost_payload: {
            scheduled_time_suggestion: "07:00 PM ART",
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
