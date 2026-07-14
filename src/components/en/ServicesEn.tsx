import React from 'react';
import { Laptop, MessageSquareText, Brain, ChevronRight } from "lucide-react";
import { SERVICES } from '../../data';

const translateService = (id: string) => {
  if (id === "desarrollo-web-plataformas") {
    return {
      title: "Web & Platform Development",
      description: "Creation of B2B software, corporate portals, and scalable applications from scratch."
    };
  }
  if (id === "chatbots-asistentes") {
    return {
      title: "Chatbots & Virtual Assistants",
      description: "Intelligent, omnichannel conversational solutions with generative AI for customer support and sales optimization."
    };
  }
  return {
    title: "AI Agents Integration",
    description: "Development of autonomous systems (AI Agents) that interact with your corporate databases and automate complex administrative tasks."
  };
};

const ServicesEn = () => {
  const scrollToEstimator = () => {
    const el = document.getElementById('estimador');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="servicios" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
            Scalable B2B Solutions
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
            Our Services
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
            We provide end-to-end engineering and automation designed for companies looking to expand without multiplying operational costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((srv) => {
            let srvIcon = <Laptop className="w-6 h-6 text-white" />;
            if (srv.icon === "MessageSquareText")
              srvIcon = <MessageSquareText className="w-6 h-6 text-white" />;
            if (srv.icon === "Brain")
              srvIcon = <Brain className="w-6 h-6 text-white" />;

            const translated = translateService(srv.id);

            return (
              <div
                key={srv.id}
                onClick={scrollToEstimator}
                className="group bg-[#0d0d0d] border border-white/10 rounded-lg p-6 hover:border-white/30 hover:bg-[#121212] transition-all duration-300 cursor-pointer flex flex-col justify-between h-80 relative overflow-hidden"
              >
                <div>
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                    {srvIcon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide group-hover:text-white/80 transition-colors">
                    {translated.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/50 leading-relaxed line-clamp-3 font-light">
                    {translated.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 group-hover:text-white transition-colors pt-4 border-t border-white/5 mt-4">
                  <span>Quote Project</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesEn;
