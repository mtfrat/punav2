import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API 1: AI Project Estimator
  app.post("/api/estimator", async (req, res) => {
    try {
      const { projectType, stage, description, email } = req.body;

      if (!description || !email) {
        return res.status(400).json({ error: "Faltan datos obligatorios (descripción o email)" });
      }

      if (!ai) {
        // Fallback mockup responses in case API key is missing
        return res.json({
          estimatedCostRange: "$15,000 - $25,000 USD",
          timeline: "6 - 8 semanas",
          architectureSummary: "Arquitectura moderna orientada a servicios. Frontend React con Vite + Tailwind CSS; Backend Express/Node.js para proxy seguro; APIs de orquestación y base de datos relacional para almacenamiento seguro.",
          suggestedTechStack: ["React 19", "Express.js", "PostgreSQL", "Tailwind CSS", "Vite"],
          costBreakdown: [
            { category: "Diseño UI/UX y Prototipado", percentage: 20, description: "Wireframes interactivos, paleta Aura y flujos listos para desarrollo." },
            { category: "Desarrollo Frontend", percentage: 35, description: "Desarrollo modular de vistas interactivas con Tailwind y Framer Motion." },
            { category: "Backend y API", percentage: 25, description: "Endpoints, autenticación y lógica de negocio." },
            { category: "Integración de IA", percentage: 10, description: "Conexión a agentes autónomos con el SDK de Gemini." },
            { category: "Control de Calidad (QA)", percentage: 10, description: "Pruebas de estrés, responsivas y validación de seguridad." }
          ],
          phasedRoadmap: [
            { phase: "Fase 1: Descubrimiento y Diseño", duration: "1-2 semanas", deliverables: "Documento de especificaciones, mockup figma inicial." },
            { phase: "Fase 2: Core Frontend y Base de Datos", duration: "3-4 semanas", deliverables: "Vistas conectadas, base de datos provista." },
            { phase: "Fase 3: Inteligencia Artificial y Backend", duration: "2 semanas", deliverables: "Modelos entrenados de orquestación e integraciones completas." },
            { phase: "Fase 4: Pruebas y Despliegue", duration: "1 semana", deliverables: "Auditoría, pase a producción con Cloud Run y liveness." }
          ],
          aiRecommendation: "Recomendamos implementar un flujo de agentes asincrónicos para procesar los datos de entrada en background. Esto optimizará el consumo de tokens y reducirá la latencia percibida por el usuario final a menos de 200ms."
        });
      }

      const prompt = `Analiza detalladamente este proyecto de software y genera una estimación realista de presupuesto, tiempos de entrega y recomendaciones de IA:
      - Tipo de Proyecto: ${projectType || 'Software a medida'}
      - Etapa Actual: ${stage || 'Idea inicial'}
      - Correo Corporativo: ${email}
      - Descripción del Proyecto: "${description}"

      Por favor, retorna la respuesta estrictamente en formato JSON que respete el esquema solicitado. Todo debe estar en español de forma altamente profesional y motivante, ideal para cerrar un trato comercial de desarrollo de software empresarial de alto nivel. Evita usar símbolos de markdown fuera del JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres el Arquitecto de Software y CTO Principal de Puna Tech, una Software Factory B2B premium de altísimo nivel. Tu objetivo es cotizar proyectos de software de forma realista pero atractiva, estructurada y muy profesional.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedCostRange: {
                type: Type.STRING,
                description: "Rango de costo estimado en USD, ej. '$12,000 - $18,000 USD'"
              },
              timeline: {
                type: Type.STRING,
                description: "Tiempo estimado de desarrollo, ej. '5-7 semanas'"
              },
              architectureSummary: {
                type: Type.STRING,
                description: "Resumen técnico formal de la arquitectura recomendada"
              },
              suggestedTechStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de 4-6 tecnologías ideales para el proyecto"
              },
              costBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    percentage: { type: Type.INTEGER },
                    description: { type: Type.STRING }
                  },
                  required: ["category", "percentage", "description"]
                }
              },
              phasedRoadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    deliverables: { type: Type.STRING }
                  },
                  required: ["phase", "duration", "deliverables"]
                }
              },
              aiRecommendation: {
                type: Type.STRING,
                description: "Consejo estratégico de cómo la Inteligencia Artificial (especialmente agentes inteligentes y LLMs) puede automatizar o mejorar radicalmente el proceso descrito en el proyecto"
              }
            },
            required: [
              "estimatedCostRange",
              "timeline",
              "architectureSummary",
              "suggestedTechStack",
              "costBreakdown",
              "phasedRoadmap",
              "aiRecommendation"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se recibió respuesta del modelo Gemini");
      }

      const cleanJson = JSON.parse(responseText.trim());
      res.json(cleanJson);
    } catch (error: any) {
      console.error("Error en estimación del estimador:", error);
      res.status(500).json({ error: "Ocurrió un error al procesar la cotización inteligente con IA: " + error.message });
    }
  });

  // API 2: Demo Booking with customized preparation questions via Gemini
  app.post("/api/book-demo", async (req, res) => {
    try {
      const { name, email, company, date, time, businessNeeds } = req.body;

      if (!name || !email || !company || !date || !time) {
        return res.status(400).json({ error: "Faltan campos obligatorios para el agendamiento." });
      }

      let prepQuestions = [
        "¿Cuáles son los principales cuellos de botella en su flujo de trabajo actual?",
        "¿Cuenta con un presupuesto pre-aprobado para esta iniciativa de desarrollo?",
        "¿Qué sistemas legados (CRMs, ERPs, DBs) necesitarían integrarse con la nueva solución?"
      ];

      if (ai && businessNeeds) {
        try {
          const prompt = `Un prospecto ha agendado una llamada para su empresa "${company}".
          Su descripción de necesidad es: "${businessNeeds}".
          Genera 3 preguntas de preparación altamente específicas y estratégicas para realizar durante la llamada de descubrimiento técnica. Retorna únicamente un arreglo JSON de strings con las 3 preguntas en español.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          });

          if (response.text) {
            prepQuestions = JSON.parse(response.text.trim());
          }
        } catch (innerError) {
          console.error("Error al generar preguntas personalizadas de demo:", innerError);
        }
      }

      res.json({
        success: true,
        message: `¡Demo agendada con éxito para el ${date} a las ${time} h!`,
        bookingDetails: {
          name,
          email,
          company,
          date,
          time,
          prepQuestions
        }
      });
    } catch (error: any) {
      console.error("Error en agendamiento de demo:", error);
      res.status(500).json({ error: "Error interno al agendar la sesión de descubrimiento." });
    }
  });

  // Serve static assets or mount Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
