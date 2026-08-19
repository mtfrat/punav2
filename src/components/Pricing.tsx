import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Desarrollo a Medida',
    price: 'Cotización',
    suffix: 'según alcance',
    features: [
      'Arquitectura B2B y multi-agente',
      'Integración con ERPs y bases de datos',
      'Despliegue en infraestructura escalable (GCP/AWS)',
      'Diseño UX/UI de alta fidelidad',
      'Propiedad total del código fuente'
    ]
  },
  {
    name: 'Staff Augmentation',
    price: 'Retainer',
    suffix: 'mensual',
    features: [
      'Ingenieros dedicados (React/Node/Python)',
      'Especialistas en integraciones LLM y RAG',
      'Metodología ágil (Sprints bisemanales)',
      'Escalado de equipo on-demand',
      'Reporte directo con líderes técnicos'
    ],
    active: true
  },
  {
    name: 'Infraestructura',
    price: 'Horas',
    suffix: 'a demanda',
    features: [
      'Soporte técnico y resolución de incidencias',
      'Monitoreo de latencia y observabilidad',
      'Ajuste fino (fine-tuning) de modelos',
      'Actualizaciones de seguridad críticas',
      'Auditoría continua de sistemas'
    ]
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-32 px-4 bg-[#050505]">
      <div className="relative max-w-7xl mx-auto rounded-[3.5rem] overflow-hidden border border-white/10">
        {/* Dark futuristic background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#050505] z-0" />
        
        {/* Subtle glow effects to make it premium */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="relative z-10 py-24 px-8 sm:px-12 flex flex-col items-center">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 inline-flex backdrop-blur-sm shadow-sm"
            >
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                 <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
                 </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-body text-foreground/50">Precios</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8 text-balance text-white">
              Inversión en <em className="italic opacity-60">tecnología core</em>
            </h2>
            <p className="max-w-xl mx-auto text-white/60 font-body text-sm font-light">
              Esquemas flexibles diseñados para corporaciones y scale-ups que buscan construir o escalar infraestructura de alto rendimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-8 rounded-[2.5rem] flex flex-col border transition-all duration-500 ${plan.active ? 'scale-105 border-white/40 bg-white/5 shadow-2xl shadow-white/5 z-10' : 'bg-[#0a0a0a] border-white/10 hover:bg-white/[0.02]'}`}
              >
                <div className="flex items-center space-x-2 mb-8">
                  <div className={`p-1.5 rounded-md ${plan.active ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60 font-mono">{plan.name}</span>
                </div>

                <div className="mb-8 flex flex-col xl:flex-row xl:items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-display tracking-tighter text-white">{plan.price}</span>
                  <span className="text-sm text-white/40 font-mono tracking-wide">{plan.suffix}</span>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold font-mono mb-4">Características:</div>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start space-x-3 text-sm font-light">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2 h-2 text-white/80" />
                      </div>
                      <span className="text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  data-cal-link="puna-tech-r7xi5x/15min"
                  data-cal-config='{"layout":"month_view"}'
                  className={`w-full py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 border cursor-pointer ${plan.active ? 'bg-white text-black border-white hover:bg-white/90' : 'bg-transparent text-white border-white/20 hover:border-white/50'}`}
                >
                   Agendar Auditoría Gratuita
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
