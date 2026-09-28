/**
 * Scout Agent (B2B Lead Generation & Niche/Affiliate Explorer)
 * Identifies high-fit Non-Tech B2B businesses & agency partners with operational bottlenecks,
 * and formulates account-based acquisition strategies with low-friction outreach.
 */

import { discoverRealProspectsPool } from "../core/web-search.mjs";

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

    // 1. Live web discovery: find real, verified companies in target markets
    const realCompaniesPool = await discoverRealProspectsPool(this.config);

    const systemPrompt = `Eres el Director de Inteligencia de Mercado y Adquisición B2B para "${company.name}".
Tu misión nocturna es analizar empresas NO tecnológicas REALES (o agencias que necesitan partner técnico) descubiertas en la web, detectar sus cuellos de botella operativos manuales (caos de planillas de cálculo, WhatsApp, remitos en papel, procesos repetitivos) y formular una estrategia de captación quirúrgica (Account-Based Marketing).

Reglas de oro:
1. DEBES trabajar ÚNICAMENTE con las empresas reales proporcionadas en la lista descubierta. PROHIBIDO INVENTAR empresas o marcas ficticias.
2. Mantén intactos el "company_name" y el "website_url" oficiales provistos.
3. EVITAR startups de software (son competencia o tienen equipos propios).
4. PRIORIZAR verticales no-tech de alto flujo de caja: Logística/Transporte, Desarrolladoras Inmobiliarias, Agencias de Marketing (modelo White-Label) y Estudios Profesionales (Contables/Jurídicos).
5. Postura: Socio consultor / Arquitecto de sistemas, NO vendedor insistente. Cero tecnicismos vacíos. Foco en horas y dinero ahorrado.`;

    const userPrompt = `Analiza los siguientes parámetros de prospección y las empresas reales descubiertas:
Criterios B2B: ${JSON.stringify(scoutConfig.leadCriteria)}
Mercados: ${scoutConfig.targetMarkets.join(", ")}
Keywords de Nicho: ${scoutConfig.nicheKeywords.join(", ")}

EMPRESAS REALES DESCUBIERTAS EN LA WEB HOY:
${JSON.stringify(
  realCompaniesPool.map((c) => ({
    company_name: c.company_name,
    website_url: c.website_url,
    vertical: c.vertical,
    market: c.market,
    snippet: c.snippet,
  })),
  null,
  2
)}

INSTRUCCIÓN ESTRICTA:
Selecciona 3 de estas empresas reales y formula su estrategia ABM.
DEBES incluir obligatoriamente el "website_url" oficial de cada empresa seleccionada.

Genera un JSON estructurado con:
{
  "market_summary": "Resumen del rastreo nocturno de empresas reales no-tech en LATAM",
  "prospects": [
    {
      "company_name": "Nombre exacto de la empresa real descubierta",
      "website_url": "URL oficial del sitio web de la empresa (ej. https://...)",
      "vertical": "Logística | Real Estate | Agencia White-Label | Servicios Profesionales",
      "market": "País / Ciudad",
      "target_role": "Director de Operaciones | Gerente General | Dueño",
      "manual_friction_detected": "El proceso manual específico donde pierden horas y dinero deducido de su rubro",
      "acquisition_strategy": {
        "entry_angle": "El ángulo de entrada no invasivo",
        "free_value_asset": "Recurso de regalo (ej. demo interactiva de portal, cálculo de horas ahorradas)",
        "outreach_message": {
          "subject": "Asunto directo y específico",
          "opening": "Observación concreta de su operación y presencia web",
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
      market_summary: `Rastreo nocturno web exitoso: 3 empresas reales verificadas en LATAM con sitios web oficiales y severos cuellos de botella manuales identificados.`,
      prospects: [
        {
          company_name: "Buenos Aires Transporte SRL",
          website_url: "https://buenosairestransportes.com.ar",
          vertical: "Logística y Transporte",
          market: "Argentina (Buenos Aires)",
          target_role: "Gerente de Operaciones / COO",
          manual_friction_detected: "Coordinación de flota y choferes por WhatsApp, remitos de entrega en papel y demoras en conciliar los viajes con los clientes.",
          acquisition_strategy: {
            entry_angle: "Eliminar el caos de WhatsApp mediante un portal web operativo ligero para choferes y depósitos.",
            free_value_asset: "Video de 2 minutos mostrando un portal web móvil en Supabase donde el chofer marca 'Entregado' con foto y el cliente recibe tracking automático.",
            outreach_message: {
              subject: "Visibilidad de flota en tiempo real para Buenos Aires Transporte",
              opening: "Hola [Nombre], sigo las operaciones de transporte de cargas de Buenos Aires Transporte.",
              proposal: "Sabemos que las empresas de transporte con flota activa pierden entre 15 y 20 horas semanales atendiendo llamados de clientes que consultan el estado de sus cargas. En Puna Tech desarrollamos portales operativos simples donde choferes y depósitos actualizan estados en 3 segundos desde el celular sin instalar apps pesadas.",
              soft_cta: "¿Tendría sentido compartirte una muestra de 2 minutos de cómo funciona el portal?"
            }
          }
        },
        {
          company_name: "Grupo Proaco",
          website_url: "https://grupoproaco.com",
          vertical: "Real Estate & Desarrolladora",
          market: "Argentina (Córdoba)",
          target_role: "Director de Finanzas y Operaciones",
          manual_friction_detected: "Seguimiento de cuotas indexadas por CAC y pagos de compradores de pozo llevado en planillas y sistemas descentralizados, con demoras en enviar recibos y conciliar bancos.",
          acquisition_strategy: {
            entry_angle: "Automatizar la actualización de cuotas y dar a cada comprador un acceso privado para ver sus pagos y certificados de avance de obra.",
            free_value_asset: "Calculadora de automatización de cuotas y demo del portal de propietarios.",
            outreach_message: {
              subject: "Portal de autogestión de cuotas para inversores de Grupo Proaco",
              opening: "Hola [Nombre], felicitaciones por la magnitud de los desarrollos urbanísticos de Grupo Proaco.",
              proposal: "Notamos que las grandes desarrolladoras con cientos de inversores gastan semanas de trabajo administrativo actualizando cuotas y respondiendo consultas de saldos. En Puna Tech creamos portales ligeros para propietarios donde cada comprador consulta su estado de cuenta y comprobantes al instante.",
              soft_cta: "¿Vale la pena tener una charla breve de 15 minutos para ver si podemos ahorrarle ese trabajo manual a tu equipo?"
            }
          }
        },
        {
          company_name: "Estudio Lisicki Litvin & Asociados",
          website_url: "https://www.llyasoc.com",
          vertical: "Servicios Profesionales (Contable / Legal)",
          market: "Argentina (Buenos Aires)",
          target_role: "Socio Administrador / Managing Partner",
          manual_friction_detected: "Recolección manual de comprobantes, extractos y documentación impositiva de clientes corporativos por email disperso, requiriendo persecución constante de los contadores a los clientes.",
          acquisition_strategy: {
            entry_angle: "Portal de cliente exclusivo con checklist automático de vencimientos fiscales y subida directa de comprobantes.",
            free_value_asset: "Demo de bóveda documental segura para clientes de estudios tributarios.",
            outreach_message: {
              subject: "Bóveda digital de comprobantes fiscales para clientes del Estudio",
              opening: "Hola [Nombre], sigo las publicaciones de coyuntura tributaria de Lisicki Litvin & Asociados.",
              proposal: "Sabemos que la mayor fricción de las firmas contables de primer nivel es la recolección desordenada de facturas y documentación de clientes antes de cada cierre impositivo. En Puna Tech implementamos bóvedas web seguras donde cada cliente sube sus comprobantes contra un checklist automático, liberando al equipo contable de tareas de seguimiento repetitivas.",
              soft_cta: "¿Te interesaría ver una demo de 2 minutos de cómo funciona para clientes corporativos?"
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
