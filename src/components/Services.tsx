import React from 'react';
import { motion } from 'motion/react';
import AgentFlowDiagram from './ui/AgentFlowDiagram';

const services = [
  {
    title: 'Desarrollo de Agentes de IA',
    subtitle: 'Sistemas Cognitivos Autónomos',
    description: 'Creamos arquitecturas multi-agente personalizadas que ejecutan flujos de trabajo de razonamiento lógico, planificación y aprendizaje continuo. Diseñados para tomar decisiones y realizar tareas de alta complejidad operacional sin intervención humana.',
    bullets: [
      'Orquestación multi-agente con paso de mensajes estructurado',
      'Sistemas de validación en tiempo real (Guardrails de seguridad)',
      'Memoria a corto/largo plazo y recuperación semántica avanzada (RAG)',
      'Conexión nativa con modelos frontera (Claude 3.5 Sonnet, GPT-4o, DeepSeek)'
    ],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
  },
  {
    title: 'Software Personalizado & Integraciones',
    subtitle: 'Orquestación e Infraestructura Cloud',
    description: 'Desarrollamos e integramos la infraestructura de software necesaria para desplegar tus agentes dentro de tu ecosistema actual de APIs y bases de datos. Garantizamos flujos robustos, tolerantes a fallos y con sincronización bidireccional en la nube.',
    bullets: [
      'Desarrollo Cloud nativo y microservicios escalables',
      'Orquestación de flujos de automatización con n8n, LangGraph o Python',
      'Sincronización segura de bases de datos (Supabase, PostgreSQL, Vector DBs)',
      'Conexión y webhooks seguros para CRMs (Salesforce, HubSpot, Slack)'
    ],
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop'
  }
];

const Services = () => {
  return (
    <section id="services" className="relative py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-white">
      <div className="relative w-full max-w-none rounded-[3.5rem] overflow-hidden">
        {/* Soft Sky Background */}
        <img
          src="https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&q=80&w=2000"
          alt="Cielo con nubes altocúmulos como fondo de servicios"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
          loading="lazy"
          width="2000"
          height="1333"
        />
        <div className="absolute inset-0 bg-white/40 z-[1]" />

        <div className="relative z-10 py-24 px-8 sm:px-16 md:px-24 2xl:px-32 flex flex-col items-center">
          <div className="text-center mb-20 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 bg-white/60 border border-white/60 rounded-full px-4 py-1.5 mb-8 inline-flex backdrop-blur-sm shadow-sm"
            >
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                 <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
                 </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-body text-foreground/50">Capacidades</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8 text-foreground">
              Nuestros <em className="italic opacity-60">Servicios</em>
            </h2>
            <p className="max-w-xl mx-auto text-foreground/60 font-body text-sm sm:text-base">
              Nos alejamos de plantillas genéricas. Desarrollamos soluciones técnicas a medida diseñadas para integrarse en tu infraestructura y generar valor real.
            </p>
          </div>
   
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-24">
            {services.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-white/80 backdrop-blur-md p-10 md:p-12 rounded-[2.5rem] group hover:bg-white transition-all duration-500 border border-black/5 shadow-xl shadow-black/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-xs uppercase font-bold tracking-wider text-primary bg-primary/5 px-4 py-1.5 rounded-full">
                      {service.subtitle}
                    </span>
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500 bg-white">
                      <img 
                        src={service.image} 
                        alt={`Ilustración visual del servicio: ${service.title}`} 
                        className="w-full h-full object-cover" 
                        loading="lazy" 
                        width="64"
                        height="64"
                      />
                    </div>
                  </div>
                  <h3 className="text-3xl font-display mb-6 tracking-tight text-foreground">{service.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed font-body mb-8">
                    {service.description}
                  </p>
                  
                  <div className="w-full h-px bg-black/5 mb-8" />
                  
                  <ul className="space-y-3.5 mb-8">
                    {service.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs text-foreground/70 font-body">
                        <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <a 
                    href="#contact"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                  >
                    Hablar con un especialista
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Agent flow section */}
          <div className="w-full">
            <AgentFlowDiagram />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;

