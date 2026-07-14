import React from 'react';
import { Rocket, Brain, ShieldCheck } from "lucide-react";

const Results = () => {
  return (
    <section id="casos" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
            Métricas Reales de Rendimiento
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
            Resultados Tangibles
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
            Habilitamos optimizaciones de nivel de producción corporativa en flujos de trabajo B2B exigentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-1">
                6 - 8 Semanas
              </h3>
              <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold mb-1">Tiempo promedio de entrega (MVP)</p>
              <p className="text-[11px] text-white/40 font-light">Tiempo óptimo de salida al mercado para soluciones integrales.</p>
            </div>
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-1">
                150+
              </h3>
              <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold mb-1">Integraciones de APIs y Sistemas</p>
              <p className="text-[11px] text-white/40 font-light">Ecosistemas conectados de forma segura con base de datos robusta.</p>
            </div>
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-1">
                99.9%
              </h3>
              <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold mb-1">SLA de Uptime Garantizado</p>
              <p className="text-[11px] text-white/40 font-light">Alta disponibilidad automatizada en la nube con Cloud Run.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Results;
