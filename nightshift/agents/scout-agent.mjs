/**
 * Scout Agent (B2B Lead Generation & Niche/Affiliate Explorer)
 * Identifies high-fit Non-Tech B2B businesses & agency partners with operational bottlenecks,
 * and formulates account-based acquisition strategies with low-friction outreach.
 */

export class ScoutAgent {
  constructor({ llmClient, config }) {
    this.llmClient = llmClient;
    this.config = config;
  }

  async run() {
    const { company, agents } = this.config;
    const scoutConfig = agents?.scout;

    if (!scoutConfig || scoutConfig.enabled === false) {
      return { status: "skipped", message: "Scout agent disabled in configuration." };
    }

    const systemPrompt = `Eres el Director de Inteligencia de Mercado y Adquisición B2B para "${company.name}".
Tu misión nocturna es identificar empresas NO tecnológicas (o agencias que necesitan partner técnico) que sufren de cuellos de botella operativos manuales (caos de planillas de cálculo, WhatsApp, remitos en papel, procesos repetitivos) y formular una estrategia de captación quirúrgica (Account-Based Marketing).

Reglas de oro:
1. EVITAR startups de software (son competencia o tienen equipos propios).
2. PRIORIZAR verticales no-tech de alto flujo de caja: Logística/Transporte, Desarrolladoras Inmobiliarias, Agencias de Marketing (modelo White-Label) y Estudios Profesionales (Contables/Jurídicos).
3. Postura: Socio consultor / Arquitecto de sistemas, NO vendedor insistente. Cero tecnicismos vacíos. Foco en horas y dinero ahorrado.`;

    const userPrompt = `Analiza los siguientes parámetros de prospección:
Criterios B2B: ${JSON.stringify(scoutConfig.leadCriteria)}
Mercados: ${scoutConfig.targetMarkets.join(", ")}
Keywords de Nicho: ${scoutConfig.nicheKeywords.join(", ")}

Genera un JSON estructurado con:
{
  "market_summary": "Resumen del rastreo nocturno de empresas no-tech",
  "prospects": [
    {
      "company_name": "Nombre de la empresa",
      "vertical": "Logística | Real Estate | Agencia White-Label | Servicios Profesionales",
      "market": "País / Ciudad",
      "target_role": "Director de Operaciones | Gerente General | Dueño",
      "manual_friction_detected": "El proceso manual específico donde pierden horas y dinero",
      "acquisition_strategy": {
        "entry_angle": "El ángulo de entrada no invasivo",
        "free_value_asset": "Recurso de regalo (ej. demo interactiva de portal, cálculo de horas ahorradas)",
        "outreach_message": {
          "subject": "Asunto directo y específico",
          "opening": "Observación concreta de su operación",
          "proposal": "Cómo Puna Tech resuelve el cuello de botella sin cambiar sus herramientas actuales",
          "soft_cta": "Invitación a diagnóstico de 15 minutos sin costo"
        }
      }
    }
  ],
  "niche_monetization_opportunity": {
    "concept_name": "Nombre de la micro-herramienta o página de nicho",
    "target_vertical": "Sector no-tech al que ayuda",
    "monetization_type": "Captación de Leads B2B + Afiliados SaaS",
    "search_intent": "Búsqueda orgánica de alta intención",
    "legal_compliance": "Explicación de por qué es 100% legal y de valor real",
    "recommended_action": "Siguiente paso para construir el prototipo"
  }
}`;

    const mockGenerator = () => ({
      market_summary: `Rastreo nocturno exitoso: 3 empresas tradicionales y 1 agencia estratégica perfiladas en LATAM con severos cuellos de botella manuales. Cero solapamiento con empresas de software.`,
      prospects: [
        {
          company_name: "TransAndina Cargas & Distribución",
          vertical: "Logística y Transporte",
          market: "Chile / Argentina",
          target_role: "Gerente de Operaciones / COO",
          manual_friction_detected: "Coordinación de 40+ choferes por WhatsApp, remitos de entrega en papel que tardan 48 horas en conciliarse y clientes llamando por teléfono para saber el estado de su carga.",
          acquisition_strategy: {
            entry_angle: "Eliminar el 'teléfono descompuesto' de WhatsApp mediante un portal web operativo ligero para choferes y depósitos.",
            free_value_asset: "Video de 2 minutos mostrando un portal web móvil en Supabase donde el chofer marca 'Entregado' con foto y el cliente recibe un tracking automático.",
            outreach_message: {
              subject: "Visibilidad de flota en tiempo real para TransAndina",
              opening: "Hola [Nombre], sigo las operaciones de transporte de carga de TransAndina en las rutas del cono sur.",
              proposal: "Sabemos que las empresas de transporte con más de 30 unidades pierden entre 15 y 20 horas semanales atendiendo llamados de clientes que preguntan por el estado de sus pedidos. En Puna Tech desarrollamos portales operativos simples donde choferes y depósitos actualizan estados en 3 segundos desde el celular sin instalar apps pesadas.",
              soft_cta: "¿Tendría sentido compartirte una muestra de 2 minutos de cómo funciona el portal?"
            }
          }
        },
        {
          company_name: "Alvear & Asociados Desarrollos Inmobiliarios",
          vertical: "Real Estate & Desarrolladora",
          market: "Argentina (Córdoba / Buenos Aires)",
          target_role: "Director de Finanzas y Operaciones",
          manual_friction_detected: "Seguimiento de cuotas indexadas por CAC y pagos de más de 120 compradores de pozo llevado en planillas Excel gigantescas, con demoras en enviar recibos y conciliar bancos.",
          acquisition_strategy: {
            entry_angle: "Automatizar la actualización de cuotas y dar a cada comprador un acceso privado para ver sus pagos y certificados de avance de obra.",
            free_value_asset: "Calculadora de automatización de cuotas y demo del portal de propietarios.",
            outreach_message: {
              subject: "Seguimiento de cuotas de fideicomisos en Alvear Desarrollos",
              opening: "Hola [Nombre], felicitaciones por el avance del último desarrollo residencial en la zona norte.",
              proposal: "Notamos que muchas desarrolladoras inmobiliarias con más de 80 clientes activos gastan hasta 2 semanas de trabajo administrativo al mes actualizando cuotas en Excel y respondiendo consultas de saldos. En Puna Tech creamos portales ligeros para propietarios donde cada comprador consulta su estado de cuenta y comprobantes al instante.",
              soft_cta: "¿Vale la pena tener una charla breve de 15 minutos para ver si podemos ahorrarle ese trabajo manual a tu equipo?"
            }
          }
        },
        {
          company_name: "Pixel & Media Brand Studio",
          vertical: "Agencia de Marketing & Medios (White-Label)",
          market: "México (CDMX / Guadalajara)",
          target_role: "Managing Director / Dueño",
          manual_friction_detected: "Clientes corporativos les piden desarrollo de portales web a medida y automatizaciones de CRM, pero la agencia solo cuenta con diseñadores y creativos, viéndose obligada a rechazar presupuestos.",
          acquisition_strategy: {
            entry_angle: "Convertirse en su brazo de ingeniería invisible para que ofrezcan software a medida bajo su propia marca sin contratar programadores en nómina.",
            free_value_asset: "Acuerdo marco White-Label y catálogo de soluciones llave en mano con margen del 40% para la agencia.",
            outreach_message: {
              subject: "Capacidad de desarrollo web para los clientes de Pixel & Media",
              opening: "Hola [Nombre], estuve viendo los casos de branding y medios que publicaron recientemente; excelente nivel visual.",
              proposal: "Trabajamos como partner técnico silencioso (White-Label) para agencias creativas: cuando un cliente te pide un desarrollo de software, un portal privado o una automatización compleja, nosotros lo programamos con tu marca. Tu agencia gana el margen y nosotros nos encargamos del soporte técnico.",
              soft_cta: "¿Te interesaría que tengamos una llamada de 15 minutos para ver si tiene sentido para sus próximos proyectos?"
            }
          }
        }
      ],
      niche_monetization_opportunity: {
        concept_name: "Calculadora de Ahorro Operativo para Flotas y Logística Pyme",
        target_vertical: "Transporte, Logística y Distribución",
        monetization_type: "Captación directa de leads calificados B2B + Afiliados de software de gestión y tracking",
        search_intent: "como reducir costos operativos de fletes y gestion de choferes",
        legal_compliance: "100% legal y de alta utilidad: herramienta gratuita de cálculo con llamada a la acción para consultoría técnica de Puna Tech.",
        recommended_action: "Montar una landing interactiva de 1 página que estime el costo del caos manual en horas hombre según cantidad de camiones."
      }
    });

    const response = await this.llmClient.generate({
      agentName: "ScoutAgent",
      systemPrompt,
      userPrompt,
      mockGenerator,
      jsonMode: true,
    });

    return {
      status: "success",
      agent: "Scout (Leads & Niche Explorer)",
      output: response.data || mockGenerator(),
      isSimulated: response.isSimulated,
    };
  }
}
