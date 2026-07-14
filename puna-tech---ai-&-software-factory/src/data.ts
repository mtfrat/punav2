import { ServiceItem, MethodologyStep, BlogArticle } from "./types";

export const SERVICES: ServiceItem[] = [
  {
    id: "desarrollo-web-plataformas",
    title: "Desarrollo Web y Plataformas",
    description: "Creación de software B2B, portales corporativos y aplicaciones escalables desde cero.",
    icon: "Laptop",
    techStack: ["React", "TypeScript", "Vite", "Node.js", "PostgreSQL", "Tailwind CSS"],
    deliverables: [
      "Arquitectura de software modular con tipado estricto.",
      "Diseño responsive pixel-perfect adaptado a móviles y escritorio.",
      "Panel de administración integrado y gestión de roles / seguridad."
    ],
    caseStudySummary: "Logramos que GlobalLog redujera su latencia en consultas operativas críticas de 4.2 segundos a solo 180ms con una re-arquitectura completa en React y Node.js."
  },
  {
    id: "chatbots-asistentes",
    title: "Chatbots y Asistentes Virtuales",
    description: "Soluciones conversacionales inteligentes y omnicanales con IA generativa para atención al cliente y optimización de ventas.",
    icon: "MessageSquareText",
    techStack: ["Gemini 3.5 Flash", "LangChain", "FastAPI", "Redis", "WhatsApp Cloud API", "Stripe"],
    deliverables: [
      "Integración directa con WhatsApp, Slack, Web y Telegram.",
      "Memoria contextual a largo plazo mediante bases de datos de vectores (RAG).",
      "Escalamiento automático y traspaso inteligente a agentes humanos."
    ],
    caseStudySummary: "Reducción de un 65% en tickets de soporte repetitivos de TechCorp mediante la integración de un asistente cognitivo conversacional basado en Gemini."
  },
  {
    id: "agentes-ia",
    title: "Integración de Agentes de IA",
    description: "Desarrollo de sistemas autónomos (AI Agents) que interactúan con tus bases de datos corporativas y automatizan tareas administrativas complejas.",
    icon: "Brain",
    techStack: ["Google GenAI SDK", "LlamaIndex", "Docker", "Python", "Google Cloud Run"],
    deliverables: [
      "Orquestación multi-agente para flujos de facturación e inventario automáticos.",
      "Análisis predictivo de datos históricos mediante modelos avanzados.",
      "Agentes de conciliación bancaria con 99.8% de precisión certificada."
    ],
    caseStudySummary: "Implementamos un sistema de conciliación de facturas autónomo para NexusSystems que procesa 40,000 registros diarios sin intervención humana, reduciendo costos operativos en un 72%."
  }
];

export const METHODOLOGY: MethodologyStep[] = [
  {
    number: 1,
    title: "Discovery & Auditoría",
    description: "Análisis profundo de tus procesos actuales y detección de cuellos de botella con alto retorno de inversión (ROI).",
    details: "Mapeamos tus operaciones actuales mediante entrevistas técnicas y análisis de bases de datos. Definimos el alcance del Producto Mínimo Viable (MVP) y calculamos los ahorros potenciales al automatizar flujos clave con Inteligencia Artificial.",
    timelineContribution: "Semana 1 - Planificación e identificación de requerimientos."
  },
  {
    number: 2,
    title: "Arquitectura & UX",
    description: "Diseño detallado del ecosistema de IA, diseño de wireframes interactivos y definición del stack de tecnologías óptimo.",
    details: "Creamos la estructura de datos, definimos las APIs necesarias y el flujo de los agentes de IA. Diseñamos mockups de alta fidelidad utilizando el sistema de diseño Aura Precision, buscando velocidad, minimalismo y alta tasa de conversión.",
    timelineContribution: "Semana 2 - Prototipos interactivos aprobados."
  },
  {
    number: 3,
    title: "Implementación Ágil",
    description: "Desarrollo de código modular bajo estándares estrictos, entrenamiento/ajuste de modelos y despliegue continuo en testing.",
    details: "Programamos las funcionalidades principales en ciclos bisemanales (Sprints) con feedback inmediato. Conectamos los servicios a los modelos de lenguaje (LLMs) y ajustamos las instrucciones de sistema para respuestas precisas.",
    timelineContribution: "Semanas 3 a 6 - Desarrollo activo y control de calidad interactivo."
  },
  {
    number: 4,
    title: "Escalamiento & Optimización",
    description: "Puesta en producción ágil, monitoreo de costos de tokens, ajuste fino de rendimiento y expansión analítica.",
    details: "Desplegamos la solución de forma segura en contenedores. Implementamos observabilidad en tiempo real de llamadas a APIs, control de errores automático y adaptamos el sistema para la incorporación de nuevos departamentos.",
    timelineContribution: "Semana 7 en adelante - Soporte proactivo y crecimiento continuo."
  }
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "automatizacion-facturacion-logistica",
    category: "Caso de Éxito",
    title: "Caso de Éxito: Automatización de Facturación en Logística Regional",
    description: "Cómo redujimos en un 80% el tiempo de procesamiento manual mediante agentes cognitivos.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5hN07mSqAwVmZt2pzenumCYbewJwBDtc391Emi92zSWZskIwpBJdcEKP5Xb1bktFdvVYFzJyy-nz0C4hS6IlhKuPN-6XYuC71e3QqnwuyqiI1z17uncRurc2s-LMs8sCWOQR8eAhI3WZL4EFamx8V8vwt6SMsQMHgwFDIhCw4gKeAi3rICRFyEwZqvJeLnQi_Dm5qkUWQwCn22_lnW8YincdoUOziSWCnsQTFgkMKgtUNDpRRxjDnqOL5dbHJQqe56yTjFy_VVco",
    author: "Ing. Martín Fraticelli",
    date: "Junio 2026",
    content: `## El Desafío Logístico

El cliente, **GlobalLog**, uno de los operadores de transporte de carga más grandes de la región, procesaba manualmente más de **5,000 facturas y remitos de aduana por semana**. Este proceso requería un equipo dedicado de 12 analistas que extraían datos de PDFs escaneados, correos electrónicos informales y hojas de cálculo desorganizadas, para luego cargarlos manualmente en su ERP legado.

Los problemas eran críticos:
- **Errores humanos:** Más del 5.8% de los registros ingresados contenían errores tipográficos, provocando demoras en pagos y multas aduaneras.
- **Cuellos de botella:** El tiempo promedio de procesamiento para aprobar una factura era de **4 días hábiles**.
- **Incapacidad de escalar:** En temporadas altas, la acumulación de documentos paralizaba las operaciones logísticas.

---

## La Solución de Puna Tech: Agentes Cognitivos de IA

En lugar de crear un software rígido de OCR que fallaría ante cambios menores en los formatos de los proveedores, diseñamos una **arquitectura basada en agentes de IA autónomos** utilizando el modelo **Gemini 3.5 Flash** y nuestro motor de orquestación.

El flujo automatizado funciona de la siguiente manera:
1. **Ingesta Inteligente:** Un agente de correo monitorea las casillas de administración, identifica facturas adjuntas en cualquier formato (PDF, PNG, JPG, XML) y las extrae automáticamente.
2. **Extracción Semántica con LLM:** Se envía el documento visual al modelo Gemini, que interpreta semánticamente los campos clave (Monto Total, Proveedor, Número de Factura, Detalle de Impuestos e Ítems) sin requerir plantillas fijas.
3. **Validación Cruzada:** El agente consulta la base de datos fiscal del gobierno y las órdenes de compra internas para asegurar que los datos coincidan exactamente.
4. **Carga Segura en el ERP:** Si todo es correcto, un agente de integración registra la transacción en el ERP a través de su API en menos de 5 segundos. Si detecta discrepancias, deriva automáticamente el caso a un analista con una explicación detallada del error destacado en rojo.

---

## Resultados e Impacto en el Negocio

Tras un periodo de desarrollo e implementación ágil de **6 semanas**, logramos métricas excepcionales:
- **Reducción del 80% en tiempo de procesamiento:** De 4 días a un promedio de **12 minutos por factura**.
- **Reducción de errores al 0.1%:** El sistema eliminó por completo los errores de transcripción tipográficos.
- **Eficiencia operativa:** Los 12 analistas ahora se dedican a tareas estratégicas de auditoría y optimización de proveedores, liberando el 90% de su carga administrativa diaria.
- **Amortización completa del proyecto (ROI):** El sistema se pagó solo en menos de 3 meses.
`
  },
  {
    id: "arquitecturas-multi-agente",
    category: "Whitepaper",
    title: "Whitepaper: Arquitecturas Multi-Agente en la Empresa",
    description: "Una guía estratégica sobre la orquestación de IA autónoma para flujos de trabajo complejos.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcUyfM0EbSJAi5x-yzLXawT2JH_wCcL0ZYLByP5ODu4x-NKlouRV-NcckVKs8gZo_C4XBCxw8EYFhTHJHQVPZZnJ9RGwMv5lMzIXLOZoUUPya-9S6CpIwBsgOQiSUhTrPgj8VuxJc1lA8cblcZWbPI0J9Ao9pTLhY5chEh7-x_eMZ_ZcyJTSW9bouApOlleJgU5hR4DtUPWrjXL8U2EV63m8_WC3Z0ym_bYiwcsSJYLb0euXAOecEYSB9nGGG_PuQsH4c9qMqeSSc",
    author: "Tech Team Puna Tech",
    date: "Mayo 2026",
    content: `## Introducción a la IA Agéntica

Durante los últimos años, el uso de la Inteligencia Artificial se limitó en gran medida al modelo de "Pregunta y Respuesta" (Chatbots sencillos). Sin embargo, el futuro corporativo reside en la **IA Agéntica**, donde múltiples agentes autónomos cooperan entre sí para lograr objetivos complejos con mínima supervisión humana.

Este whitepaper técnico analiza los principios de arquitectura, patrones de comunicación y seguridad necesarios para implementar con éxito sistemas multi-agente en entornos B2B.

---

## Pilares de una Arquitectura Multi-Agente Exitosa

Para que un ecosistema de agentes funcione de manera robusta y libre de bucles infinitos, estructuramos el software en tres capas fundamentales:

### 1. Especialización de Roles
En lugar de tener un único agente genérico que intente resolverlo todo, dividimos las tareas. Diseñamos agentes especialistas con system instructions específicas:
- **Agente Analista de Datos:** Especializado en escribir y ejecutar consultas SQL optimizadas sobre almacenes de datos.
- **Agente Evaluador de Calidad:** Su único rol es auditar las respuestas de otros agentes para asegurar que cumplen con el formato técnico, tono corporativo y restricciones de seguridad.
- **Agente Coordinador:** Distribuye los sub-problemas al agente correspondiente y consolida la respuesta final.

### 2. Memoria Semántica Compartida (RAG)
Los agentes necesitan recordar el contexto del negocio. Implementamos bases de datos de vectores (como pgvector o Pinecone) donde indexamos manuales de operaciones, políticas de precios e historial de tickets para proveer contexto en tiempo real mediante Generación Aumentada por Recuperación (RAG).

### 3. "Human-in-the-Loop" (Intervención Humana)
La autonomía total es peligrosa para procesos críticos de negocio. Nuestra arquitectura implementa compuertas de seguridad automáticas: si una decisión requiere transacciones monetarias superiores a un umbral definido o si el agente tiene una certeza menor al 90%, el flujo se pausa y genera una alerta interactiva para aprobación humana.

---

## Conclusiones Técnicas

Las arquitecturas multi-agente ya no son ciencia ficción; son la herramienta competitiva definitiva para las compañías del mañana. Reducen drásticamente la fricción de software, permiten crear automatizaciones que toleran la ambigüedad y proporcionan flexibilidad organizativa sin precedentes.
`
  },
  {
    id: "guia-optimizacion-procesos-ia",
    category: "Guía",
    title: "Guía: Optimización de Procesos con IA Agéntica",
    description: "Metodologías para identificar y automatizar cuellos de botella operativos de alto impacto.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEdqqmKViity7-mZsmS3K_j_GVLizb4PL8qioazaWnI3AIRnElOiYU0hXT_7S7ESEFai5LqFYmP1a3D5ty4RAg9dEnj096RZxJLrESimznflFzIQHVEA6VkLGl5SGAZhJ6a_1YbpS5b4yMECxCpvqPleXaZZoaUw-E4xDDiQ6p0xLsmJolkQLoRexU2L4NXrTFU0UdiBzFmcpsTE4uq4O2DdSHfW6aqf5zMQeFc5HpN5x6a6QLnQi-tUkWJOMAkK4e2lrtAzf6FAc",
    author: "Product Strategy Team",
    date: "Marzo 2026",
    content: `## Cómo empezar con Inteligencia Artificial en tu Empresa

Una de las preguntas más frecuentes que recibimos en **Puna Tech** es: *"Sé que la Inteligencia Artificial es potente, pero ¿por dónde empiezo en mi empresa?"*

Esta guía práctica te ayudará a mapear tus operaciones y elegir los casos de uso con el **mayor ROI y menor riesgo de implementación**.

---

## Paso 1: Mapear la Matriz de Viabilidad (Impacto vs. Complejidad)

No todos los problemas son aptos para resolverse con IA. Recomendamos clasificar tus tareas en una matriz de 4 cuadrantes:

1. **Ganancias Rápidas (Quick Wins):** Alto impacto y baja complejidad técnica. Ejemplo: Un asistente interno que busque en el manual de recursos humanos o redacte correos de cobranza estándar.
2. **Proyectos Estratégicos:** Alto impacto y alta complejidad. Ejemplo: Automatizar la conciliación de facturas bancarias que se conecte a múltiples portales bancarios y ERPs.
3. **Casos de Vanidad:** Bajo impacto y baja complejidad. Ejemplo: Poner un chatbot genérico de 'Hola' en la home de tu web sin integraciones reales. **Evita estos, no agregan valor real.**
4. **Desagües de Tiempo:** Bajo impacto y alta complejidad. Ejemplo: Intentar predecir comportamientos de usuarios hiper-específicos en mercados sumamente volátiles con datos sucios.

---

## Paso 2: La Auditoría de Datos

La IA es tan buena como los datos con los que se alimenta. Antes de comenzar a programar agentes, asegúrate de:
- **Centralizar tus datos:** Si tus contratos de clientes están repartidos en carpetas personales de tus vendedores en lugar de un CRM, los agentes no podrán acceder a ellos de manera segura.
- **Definir formatos estandarizados:** Trabajar con PDFs digitales es mucho más sencillo que trabajar con notas a mano alzada escaneadas con baja iluminación.

---

## Conclusión

El camino hacia la automatización inteligente no requiere una transformación masiva de un día para el otro. Se trata de **iterar inteligentemente**. Empieza con un MVP enfocado en un cuello de botella de alta fricción administrativa, mide el impacto y escala la arquitectura progresivamente. En Puna Tech estamos listos para acompañarte en cada paso.
`
  }
];
