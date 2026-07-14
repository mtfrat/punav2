import React, { useState } from 'react';
import { METHODOLOGY } from '../data';
import { Check } from "lucide-react";

const Methodology = () => {
  const [activeMethodology, setActiveMethodology] = useState(1);

  return (
    <section id="metodologia" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
            Iteración y Rigor Técnico
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
            Nuestra Metodología
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
            Un proceso de ingeniería ágil y estructurado para llevar tu negocio desde un análisis inicial hasta la automatización en producción con total confianza.
          </p>
        </div>

        {/* Interactive Grid Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Selector Tab Columns */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {METHODOLOGY.map((step) => (
              <button
                key={step.number}
                onClick={() => setActiveMethodology(step.number)}
                className={`text-left p-4 rounded-lg border flex items-center gap-4 transition-all duration-300 cursor-pointer ${
                  activeMethodology === step.number
                    ? "bg-white/5 border-white"
                    : "bg-transparent border-white/10 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors shrink-0 ${
                    activeMethodology === step.number
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/50 border border-white/10"
                  }`}
                >
                  0{step.number}
                </div>
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider text-xs md:text-sm leading-none mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-white/40 line-clamp-1 font-light">{step.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Detail Content Box */}
          <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/60 font-mono text-xs uppercase tracking-widest">
                <Check className="w-4 h-4 text-white" />
                <span>Fase {activeMethodology} del Proceso Técnico</span>
              </div>
              <h3 className="text-xl md:text-2xl font-light uppercase tracking-wide text-white">
                {METHODOLOGY[activeMethodology - 1].title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed font-light">
                {METHODOLOGY[activeMethodology - 1].details}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-wider">
              <span>Hito:</span>
              <span className="text-white">{METHODOLOGY[activeMethodology - 1].timelineContribution}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
