import { X, CheckCircle2, Cpu } from "lucide-react";
import { ServiceItem } from "../types";
import { Laptop, MessageSquareText, Brain, Code } from "lucide-react";

function getServiceIcon(name: string) {
  switch (name) {
    case "Laptop":
      return <Laptop className="w-7 h-7 text-white" />;
    case "MessageSquareText":
      return <MessageSquareText className="w-7 h-7 text-white" />;
    case "Brain":
      return <Brain className="w-7 h-7 text-white" />;
    default:
      return <Code className="w-7 h-7 text-white" />;
  }
}

interface ServiceModalProps {
  service: ServiceItem;
  onClose: () => void;
}

export default function ServiceModal({ service, onClose }: ServiceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
            {getServiceIcon(service.icon)}
          </div>
          <div>
            <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block mb-1">
              Servicios Premium Puna Tech
            </span>
            <h3 className="text-xl md:text-2xl font-light uppercase text-white tracking-tight">
              {service.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6 font-light">
          {service.description}
        </p>

        {/* Tech Stack */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-white tracking-wider uppercase block mb-3">
            Stack Tecnológico Recomendado
          </span>
          <div className="flex flex-wrap gap-2">
            {service.techStack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs rounded-full flex items-center gap-1.5"
              >
                <Cpu className="w-3 h-3 text-white/70" />
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4 md:p-5">
          <span className="text-xs font-semibold text-white/80 tracking-wider uppercase block mb-3">
            Entregables Clave del Proyecto
          </span>
          <ul className="space-y-3 font-light">
            {service.deliverables.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-white/60">
                <CheckCircle2 className="w-5 h-5 text-white/80 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Case Study Block */}
        <div className="border-t border-white/10 pt-6">
          <span className="text-xs font-semibold text-white tracking-wider uppercase block mb-2">
            Caso de Éxito Asociado
          </span>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-white/60 leading-relaxed italic font-light">
              "{service.caseStudySummary}"
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white text-xs font-semibold tracking-wider uppercase rounded-full transition-all duration-300"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}
