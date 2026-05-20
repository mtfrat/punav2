import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Database, Network, ShieldCheck, Mail, Play, RotateCcw, Slack, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  role: string;
  icon: React.ReactNode;
  description: string;
  status: 'idle' | 'active' | 'success';
}

export default function AgentFlowDiagram() {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const steps: Step[] = [
    {
      id: 0,
      name: 'Trigger: Entrada B2B',
      role: 'Webhook del Lead',
      icon: <Mail className="w-6 h-6 text-[#AF4C24]" />,
      description: 'Se detecta un nuevo lead corporativo de alto valor en el CRM o formulario web.',
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'success' : 'idle'
    },
    {
      id: 1,
      name: 'Agente Router',
      role: 'Orquestación y Planificación',
      icon: <Cpu className="w-6 h-6 text-[#6D2C2C]" />,
      description: 'Analiza la intención del mensaje, clasifica el perfil e inicia el plan de ejecución autónomo.',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'success' : 'idle'
    },
    {
      id: 2,
      name: 'Agente de Enriquecimiento',
      role: 'APIs y Consulta Externa',
      icon: <Database className="w-6 h-6 text-[#AF4C24]" />,
      description: 'Llama de forma autónoma a LinkedIn y Clay para extraer cargos, tecnologías utilizadas y revenue estimado.',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'success' : 'idle'
    },
    {
      id: 3,
      name: 'Agente de Acción',
      role: 'Generación y Outreach',
      icon: <Network className="w-6 h-6 text-[#6D2C2C]" />,
      description: 'Redacta una respuesta ultra-personalizada y agenda un correo en Smartlead para el contacto.',
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'success' : 'idle'
    },
    {
      id: 4,
      name: 'Agente Validador',
      role: 'Guardrails & Seguridad',
      icon: <ShieldCheck className="w-6 h-6 text-[#AF4C24]" />,
      description: 'Supervisa que el correo cumpla las normas de seguridad, tono de marca y coherencia lógica de la IA.',
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'success' : 'idle'
    },
    {
      id: 5,
      name: 'Acción Ejecutada',
      role: 'Notificación & CRM',
      icon: <Slack className="w-6 h-6 text-[#6D2C2C]" />,
      description: 'Actualiza el pipeline en Salesforce y alerta al equipo en Slack con el reporte detallado del lead.',
      status: currentStep === 5 ? 'active' : currentStep > 5 ? 'success' : 'idle'
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep === -1) {
      const timer = setTimeout(() => setCurrentStep(0), 1000);
      return () => clearTimeout(timer);
    }

    const intervalTime = currentStep === 0 ? 3000 : 4000;
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(-1);
      }
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  const handleReset = () => {
    setCurrentStep(-1);
    setIsPlaying(true);
  };

  const handleStepClick = (idx: number) => {
    setIsPlaying(false);
    setCurrentStep(idx);
  };

  return (
    <div className="w-full bg-[#F8F4F0] text-[#2A0E0E] rounded-[2.5rem] p-8 md:p-12 border border-[#E8DCC2] shadow-soft relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#AF4C24]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6D2C2C]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AF4C24]">Arquitectura Viva</span>
          <h4 className="text-4xl font-display font-bold mt-2 text-[#2A0E0E]">
            Simulación de Colaboración Agéntica
          </h4>
          <p className="text-xs sm:text-sm text-[#6D2C2C]/70 mt-1 max-w-xl">
            Haz clic en cualquier nodo para pausar la simulación e inspeccionar cómo opera cada agente de forma autónoma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-[#F8F4F0] transition-colors border border-[#E8DCC2]"
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#AF4C24] fill-[#AF4C24]' : 'text-slate-400'}`} />
            {isPlaying ? 'Simulación Activa' : 'Pausado'}
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-full bg-white hover:bg-[#F8F4F0] transition-colors border border-[#E8DCC2]"
            title="Reiniciar Simulación"
          >
            <RotateCcw className="w-4 h-4 text-[#6D2C2C]" />
          </button>
        </div>
      </div>

      {/* Interactive Diagram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        
        {/* Nodos de Agente */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, idx) => {
              const isActive = currentStep === idx;
              const isSuccess = currentStep > idx;

              return (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(idx)}
                  className={`cursor-pointer text-left p-6 rounded-2xl border transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-white border-[#AF4C24] shadow-md shadow-[#AF4C24]/10'
                      : isSuccess
                      ? 'bg-white/80 border-[#6D2C2C]/30 hover:border-[#6D2C2C]/60'
                      : 'bg-white/40 border-[#E8DCC2] hover:border-[#AF4C24]/30'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {isActive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AF4C24] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AF4C24]"></span>
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'text-[#AF4C24]'
                          : isSuccess
                          ? 'text-[#6D2C2C]'
                          : 'text-[#6D2C2C]/40'
                      }`}
                    >
                      {isActive ? 'Procesando' : isSuccess ? 'Completado' : 'En Espera'}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-[#AF4C24]/10 scale-110'
                          : isSuccess
                          ? 'bg-[#6D2C2C]/5'
                          : 'bg-white border border-[#E8DCC2] group-hover:scale-105'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-lg text-[#2A0E0E] group-hover:text-[#AF4C24] transition-colors">
                        {step.name}
                      </h5>
                      <p className="text-xs text-[#6D2C2C]/60 mt-0.5">{step.role}</p>
                    </div>
                  </div>

                  {/* Flow connection arrow */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-[#6D2C2C]/40">Nodo {idx + 1} de 6</span>
                    {idx < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[#E8DCC2] group-hover:text-[#AF4C24] transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Detalle del Agente Activo */}
        <div className="bg-white rounded-3xl border border-[#E8DCC2] p-8 flex flex-col justify-between min-h-[300px] shadow-soft">
          <AnimatePresence mode="wait">
            {currentStep === -1 ? (
              <motion.div
                key="idle-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-8"
              >
                <div className="p-4 bg-[#AF4C24]/5 rounded-full mb-4 animate-pulse">
                  <Cpu className="w-8 h-8 text-[#AF4C24]" />
                </div>
                <h5 className="font-display font-bold text-xl text-[#2A0E0E] mb-2">Simulación de Sistema</h5>
                <p className="text-xs text-[#6D2C2C]/70 leading-relaxed max-w-[240px]">
                  Presiona el botón de simulación para ver la orquestación agéntica autónoma en tiempo real.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`panel-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-[#AF4C24]/10 text-[#AF4C24] text-[10px] font-bold uppercase rounded-full tracking-wider">
                      Paso {currentStep + 1}
                    </span>
                    <span className="text-[11px] text-[#6D2C2C]/70">
                      Entregable de código real
                    </span>
                  </div>
                  
                  <h5 className="font-display text-2xl font-bold text-[#2A0E0E]">
                    {steps[currentStep].name}
                  </h5>
                  <p className="text-xs text-[#AF4C24] font-mono mt-1">
                    {`[status]: ${steps[currentStep].status.toUpperCase()}`}
                  </p>

                  <p className="text-sm text-[#2A0E0E]/85 mt-6 leading-relaxed">
                    {steps[currentStep].description}
                  </p>

                  {/* Operational Detail (Typewriter look) */}
                  <div className="bg-[#F8F4F0] rounded-xl p-4 mt-6 border border-[#E8DCC2] font-typewriter text-[11px] text-[#6D2C2C] leading-normal overflow-x-auto break-all whitespace-pre-wrap">
                    {currentStep === 0 && (
                      <>
                        <span className="text-[#6D2C2C]/50">// Payload recibido por API webhook</span>
                        <br />{"{ \"event\": \"lead_signup\", \"domain\": \"enterprise.com\", \"email\": \"cto@enterprise.com\" }"}
                      </>
                    )}
                    {currentStep === 1 && (
                      <>
                        <span className="text-[#6D2C2C]/50">// Orquestando plan de ejecución</span>
                        <br />{"router.route({ intent: 'GTMOptimization', securityCheck: true })"}
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <span className="text-[#6D2C2C]/50">// Consultando enriquecimiento semántico</span>
                        <br />{"clay.enrichCompany('enterprise.com').then(storeVectors)"}
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <span className="text-[#6D2C2C]/50">// Generando respuesta de alto impacto</span>
                        <br />{"smartlead.campaigns.addRecipient({ personalizedIntro: '...' })"}
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <span className="text-[#6D2C2C]/50">// Ejecutando validación de seguridad</span>
                        <br />{"guardrails.verifyPromptInjections(outreachMail).passed()"}
                      </>
                    )}
                    {currentStep === 5 && (
                      <>
                        <span className="text-[#6D2C2C]/50">// Actualizando infraestructura</span>
                        <br />{"slack.notify('#growth-alerts', 'Lead calificado: Listo')"}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E8DCC2]">
                  <div className="flex justify-between text-xs text-[#6D2C2C]">
                    <span>Estado del Flujo:</span>
                    <span className="font-bold text-[#2A0E0E]">
                      {Math.round(((currentStep + 1) / steps.length) * 100)}% Completado
                    </span>
                  </div>
                  <div className="w-full bg-[#E8DCC2] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#AF4C24] h-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
