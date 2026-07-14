import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw
} from "lucide-react";

const Estimator = () => {
  const [projectType, setProjectType] = useState("Plataforma Web");
  const [stage, setStage] = useState("Tengo una idea");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('');

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !email.trim() || !name.trim()) {
      return;
    }

    setLoading(true);
    setSubmitStatus('');

    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_yy0g002';
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_cr5obtd';
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'uTD7ft0fVaE7j9YlO';

    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        company: company || 'No especificada',
        message: `Cotizador IA:\n- Tipo: ${projectType}\n- Etapa: ${stage}\n- Nombre: ${name}\n- Empresa: ${company}\n- Email: ${email}\n- Descripción: ${description}`,
        to_name: 'PunaTech',
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const resetEstimator = () => {
    setProjectType("Plataforma Web");
    setStage("Tengo una idea");
    setDescription("");
    setEmail("");
    setName("");
    setCompany("");
    setSubmitStatus('');
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
                Solicita tu presupuesto
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
              asistente con agentes autónomos. Completa tus datos para agendar una sesión estratégica y recibir un desglose real.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/50 pt-4 font-light">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Estimación técnica personalizada.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Desglose de presupuesto y roadmap por fases.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/80" />
                <span>Sesión de descubrimiento de 15 minutos sin costo.</span>
              </div>
            </div>
          </div>

          {/* Right Interface Column */}
          <div className="lg:col-span-7">
            {/* 1. Loading State */}
            {loading && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-8 md:p-12 flex flex-col items-center justify-center min-h-[480px] backdrop-blur-md relative overflow-hidden">
                <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-white text-base md:text-lg font-light uppercase tracking-wider text-center mb-2">
                  Procesando solicitud...
                </p>
              </div>
            )}

            {/* 2. Form State */}
            {!loading && submitStatus === '' && (
              <form
                onSubmit={handleCalculate}
                className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden"
              >
                <div className="space-y-6">
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
                            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
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
                            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-semibold text-white tracking-widest uppercase">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Juan Pérez" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white font-light"
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-semibold text-white tracking-widest uppercase">Empresa (Opcional)</label>
                      <input 
                        type="text" 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Tu Empresa" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white font-light"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">Correo Corporativo</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white font-light"
                      required
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-white tracking-widest uppercase">
                      Describe tu idea
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: Necesito un portal web para administrar turnos que se integre con nuestra base de datos..."
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none font-light"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Solicita tu presupuesto
                  </button>
                </div>
              </form>
            )}

            {/* 3. Results State */}
            {!loading && submitStatus === 'success' && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden space-y-6">
                <div className="flex justify-between items-start border-b border-white/5 pb-6">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block mb-1">
                      Solicitud Enviada con Éxito
                    </span>
                    <h3 className="text-lg md:text-xl font-light uppercase tracking-wide text-white">
                      ¡Gracias por contactarnos!
                    </h3>
                  </div>
                  <button
                    onClick={resetEstimator}
                    className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Nueva Solicitud
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    Hemos recibido los detalles de tu proyecto ({projectType}). Nuestro equipo de ingeniería analizará tu requerimiento y nos pondremos en contacto contigo a la brevedad a través de <strong>{email}</strong> para enviarte una propuesta inicial.
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    Mientras tanto, puedes agendar una llamada de descubrimiento en cualquier momento usando el botón del menú principal.
                  </p>
                </div>
              </div>
            )}
            
            {!loading && submitStatus === 'error' && (
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 backdrop-blur-md relative overflow-hidden space-y-6">
                <div className="flex items-center gap-3 text-red-400 mb-4">
                  <XCircle className="w-8 h-8" />
                  <h3 className="text-lg md:text-xl font-light uppercase tracking-wide">
                    Ocurrió un error
                  </h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed font-light">
                  No pudimos procesar tu solicitud en este momento. Por favor intenta nuevamente más tarde o contáctanos directamente.
                </p>
                <button
                  onClick={resetEstimator}
                  className="mt-4 px-6 py-2 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 cursor-pointer"
                >
                  Volver a intentar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Estimator;
