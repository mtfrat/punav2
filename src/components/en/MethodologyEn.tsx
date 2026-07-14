import React, { useState } from 'react';
import { METHODOLOGY } from '../../data';
import { Check } from "lucide-react";

const translateMethodology = (number: number) => {
  if (number === 1) return {
    title: "Discovery & Audit",
    description: "Deep analysis of your current processes and detection of high ROI bottlenecks.",
    details: "We map your operations through technical interviews and database analysis. We define the MVP scope and calculate potential savings.",
    timelineContribution: "Week 1 - Planning and requirements."
  };
  if (number === 2) return {
    title: "Architecture & UX",
    description: "Detailed ecosystem design, wireframing, and optimal tech stack definition.",
    details: "We design the data structure, APIs, and AI agent flows. We create high-fidelity mockups for speed, minimalism, and conversion.",
    timelineContribution: "Week 2 - Interactive prototypes approved."
  };
  if (number === 3) return {
    title: "Agile Implementation",
    description: "Modular coding under strict standards, model fine-tuning, and continuous testing deployment.",
    details: "We code features in 2-week sprints with immediate feedback. We connect services to LLMs and adjust prompts for accuracy.",
    timelineContribution: "Weeks 3 to 6 - Active development and QA."
  };
  return {
    title: "Scaling & Optimization",
    description: "Agile production deployment, token cost monitoring, performance fine-tuning, and analytical expansion.",
    details: "We deploy securely in containers. We implement real-time observability and adapt the system for new departments.",
    timelineContribution: "Week 7 onwards - Proactive support and continuous growth."
  };
};

const MethodologyEn = () => {
  const [activeMethodology, setActiveMethodology] = useState(1);

  return (
    <section id="metodologia" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
            Iteration and Technical Rigor
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
            Our Methodology
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
            An agile and structured engineering process to take your business from initial analysis to production automation with total confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Selector Tab Columns */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {METHODOLOGY.map((step) => {
              const translated = translateMethodology(step.number);
              return (
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
                      {translated.title}
                    </h4>
                    <p className="text-xs text-white/40 line-clamp-1 font-light">{translated.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Content Box */}
          <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/60 font-mono text-xs uppercase tracking-widest">
                <Check className="w-4 h-4 text-white" />
                <span>Phase {activeMethodology} of the Technical Process</span>
              </div>
              <h3 className="text-xl md:text-2xl font-light uppercase tracking-wide text-white">
                {translateMethodology(activeMethodology).title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed font-light">
                {translateMethodology(activeMethodology).details}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-wider">
              <span>Milestone:</span>
              <span className="text-white">{translateMethodology(activeMethodology).timelineContribution}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologyEn;
