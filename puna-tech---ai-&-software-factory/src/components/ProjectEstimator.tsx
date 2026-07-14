import React, { useState, useEffect } from "react";
import {
  Calculator,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  Lightbulb,
  CheckCircle2
} from "lucide-react";
import { EstimatorResponse } from "../types";

export default function ProjectEstimator() {
  const [projectType, setProjectType] = useState("Plataforma Web");
  const [stage, setStage] = useState("Tengo una idea");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [result, setResult] = useState<EstimatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sequenced loading messages
  const loadingPhrases = [
    "Iniciando tuberías cognitivas de Puna Tech...",
    "Analizando el alcance funcional del proyecto...",
    "Mapeando base de datos y flujos de integración...",
    "Estimando horas de desarrollo para Frontend y Backend...",
    "Consultando al motor inteligente Gemini para recomendaciones de IA...",
    "Finalizando reporte de cotización premium..."
  ];

  useEffect(() => {
    let index = 0;
    let interval: NodeJS.Timeout | null = null;

    if (loading) {
      setLoadingText(loadingPhrases[0]);
      interval = setInterval(() => {
        index = (index + 1) % loadingPhrases.length;
        setLoadingText(loadingPhrases[index]);
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !email.trim()) {
      setError("Por favor completa los campos de descripción e email.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectType, stage, description, email }),
      });

      if (!response.ok) {
        throw new Error("Ocurrió un error al procesar la cotización en el servidor.");
      }

      const data: EstimatorResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const resetEstimator = () => {
    setProjectType("Plataforma Web");
    setStage("Tengo una idea");
    setDescription("");
    setEmail("");
    setResult(null);
    setError(null);
  };

  return (
    <section id="estimador" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      {/* Subtle organic gradient accents */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-white/[0.01] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
              <Calculator className="w-4 h-4 text-white/80" />
              <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">
                Estimador Inteligente
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight leading-tight">
              Calculá el presupuesto de <br />
              <span className="font-normal text-white">
                tu próximo proyecto
              </span>
              .
            </h2>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl font-light">
              Descubrí de forma inmediata cuánto costaría desarrollar tu MVP, plataforma o
              asistente con agentes autónomos. Nuestra IA analiza tu descripción técnica y provee un desglose real.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/50 pt-4 font-light">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Estimación técnica personalizada con Gemini.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Desglose de presupuesto y roadmap por fases.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Recibe el reporte corporativo de inmediato en tu panel.</span>
              </div>
            </div>
          </div>

          {/* Right Interface Column */}
          <div className="lg:col-span-7">
            {/* 1. Loading State */}
            {loading && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-8 md:p-12 flex flex-col items-center justify-center min-h-[480px] backdrop-blur-md relative overflow-hidden">
                <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                  {/* Inner pulse */}
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-white text-base md:text-lg font-light uppercase tracking-wider text-center mb-2">
                  Generando reporte inteligente...
                </p>
                <p className="text-white/50 text-xs text-center font-mono max-w-md animate-pulse">
                  {loadingText}
                </p>
              </div>
            )}

            {/* 2. Form State */}
            {!loading && !result && (
              <form
                onSubmit={handleCalculate}
                className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden"
              >
                {error && (
                  <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Field 1: Project Type */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      ¿Qué necesitas construir?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {["Plataforma Web", "Chatbot IA", "Sistema Agentes IA", "App Móvil", "Otro"].map(
                        (type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setProjectType(type)}
                            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
                              projectType === type
                                ? "bg-white border-white text-black"
                                : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                            }`}
                          >
                            {type}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Field 2: Current Stage */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      ¿Cuál es tu etapa actual?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {["Tengo una idea", "Tengo figma/wireframes", "Reemplazo de legado"].map(
                        (stg) => (
                          <button
                            type="button"
                            key={stg}
                            onClick={() => setStage(stg)}
                            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
                              stage === stg
                                ? "bg-white border-white text-black"
                                : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                            }`}
                          >
                            {stg}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Field 3: Custom Description */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      Describe tu idea de forma simple
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: Necesito un portal web para administrar turnos de camiones que se integre con nuestra base de datos SQL actual y envíe notificaciones automáticas por WhatsApp."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none font-light"
                      required
                    ></textarea>
                  </div>

                  {/* Field 4: Corporate Email */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      Tu Correo Corporativo
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white font-light"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    Calcular Presupuesto con IA
                  </button>
                </div>
              </form>
            )}

            {/* 3. Results State */}
            {!loading && result && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden space-y-6">
                {/* Result header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-6">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block mb-1">
                      Estimación Generada con Éxito
                    </span>
                    <h3 className="text-lg md:text-xl font-light uppercase tracking-wide text-white">
                      Presupuesto Detallado
                    </h3>
                  </div>
                  <button
                    onClick={resetEstimator}
                    className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Recalcular
                  </button>
                </div>

                {/* Grid cost & timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-1">
                      Rango de Costo Estimado
                    </span>
                    <span className="text-2xl md:text-3xl font-semibold text-white">
                      {result.estimatedCostRange}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mt-3 font-light">
                      <ShieldCheck className="w-4 h-4 text-white/60" />
                      Sujeto a confirmación contractual
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-1">
                      Tiempo de Entrega (MVP)
                    </span>
                    <span className="text-2xl md:text-3xl font-light text-white uppercase tracking-wide">
                      {result.timeline}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mt-3 font-light">
                      <Clock className="w-4 h-4 text-white/60" />
                      Metodología Scrum ágil iterativa
                    </div>
                  </div>
                </div>

                {/* Recommended Architecture */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white tracking-widest uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-white/60" />
                    Resumen de Arquitectura Propuesta
                  </span>
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    {result.architectureSummary}
                  </p>
                </div>

                {/* Tech Stack recommended */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white tracking-widest uppercase block">
                    Tecnologías Ideales Sugeridas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedTechStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visual budget breakdown list */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-white tracking-widest uppercase block border-b border-white/5 pb-2">
                    Desglose Interno del Presupuesto
                  </span>
                  <div className="space-y-3">
                    {result.costBreakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-white uppercase tracking-wider">
                          <span>{item.category}</span>
                          <span className="text-white font-bold">{item.percentage}%</span>
                        </div>
                        {/* Styled SVG Progress Bar */}
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-white h-full rounded-full transition-all duration-1000"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phased roadmap */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-xs font-semibold text-white tracking-widest uppercase block mb-3">
                    Hitos y Entregables del Plan de Trabajo
                  </span>
                  <div className="space-y-4 border-l border-white/10 pl-4 ml-2">
                    {result.phasedRoadmap.map((phase, idx) => (
                      <div key={idx} className="relative space-y-1">
                        {/* Dot indicator */}
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-white border border-black ring-4 ring-white/10"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-light">
                          <span className="font-semibold text-white uppercase tracking-wide">{phase.phase}</span>
                          <span className="text-white/80 font-mono font-semibold mt-0.5 sm:mt-0">
                            {phase.duration}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 font-light">{phase.deliverables}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom AI Recommendation Glow Box */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2 relative overflow-hidden">
                  <span className="text-xs font-semibold text-white tracking-widest uppercase flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-white/80" />
                    Recomendación Estratégica de IA
                  </span>
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed italic font-light">
                    {result.aiRecommendation}
                  </p>
                </div>

                {/* Call to action for scheduled booking */}
                <div className="pt-2 text-center text-xs text-white/40 font-light">
                  ¿Quieres validar este presupuesto con nuestros ingenieros? Agenda tu llamada de descubrimiento arriba.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
