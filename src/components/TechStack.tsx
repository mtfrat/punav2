import React from 'react';
import { motion } from 'motion/react';

const agenticStack = [
  {
    title: 'Cerebro y Cognición',
    subtitle: 'Razonamiento y Toma de Decisiones',
    status: 'Activo',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .462-.375.837-.837.837-.462 0-.837-.375-.837-.837V3.104m3 0v1.244c0 .462-.375.837-.837.837-.462 0-.837-.375-.837-.837V3.104m3 0v1.244c0 .462-.375.837-.837.837-.462 0-.837-.375-.837-.837V3.104M3 5.25h18M3 8.25h18M3 11.25h18m-18 3h18m-18 3h18m-18 3h18" />
      </svg>
    ),
    items: [
      { name: 'Claude 3.5 Sonnet', desc: 'Razonamiento lógico y redacción avanzada.' },
      { name: 'GPT-4o & DeepSeek', desc: 'Procesamiento masivo y extracción rápida.' },
      { name: 'LangChain & LlamaIndex', desc: 'Orquestación de flujos y pipelines cognitivos.' },
      { name: 'Prompting Estructurado', desc: 'Guiado por XML y JSON schema para cero fallos.' }
    ]
  },
  {
    title: 'Memoria y Contexto',
    subtitle: 'Persistencia y RAG Avanzado',
    status: 'Sincronizado',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m0-3.75v3.75m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m0-3.75v3.75" />
      </svg>
    ),
    items: [
      { name: 'Vectores (Pinecone/Qdrant)', desc: 'Recuperación semántica de información.' },
      { name: 'Supabase & PostgreSQL', desc: 'Bases de datos seguras con sync en vivo.' },
      { name: 'Memoria de Corto Plazo', desc: 'Mantenimiento del contexto de conversación.' },
      { name: 'Historial del Lead', desc: 'Personalización contextual de cada contacto.' }
    ]
  },
  {
    title: 'Loops de Autonomía',
    subtitle: 'Ejecución y Cron Jobs 24/7',
    status: 'Online 24/7',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    items: [
      { name: 'Loops Autónomos n8n', desc: 'Nodos que operan y validan indefinidamente.' },
      { name: 'Python Scripts (Custom)', desc: 'Lógica matemática y procesamiento interno.' },
      { name: 'Cron Schedulers', desc: 'Lanzadores automatizados cada hora o minuto.' },
      { name: 'Alertas y Auto-recovery', desc: 'Notificación instantánea en caso de desvíos.' }
    ]
  },
  {
    title: 'Conexión e Integración',
    subtitle: 'Acciones en el Mundo Real',
    status: 'Conectado',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
    items: [
      { name: 'Clay & Smartlead APIs', desc: 'Enriquecimiento y alcance frío hyper-personalizado.' },
      { name: 'Webhooks Bidireccionales', desc: 'Actualización en tiempo real entre sistemas.' },
      { name: 'Navegación Simulada', desc: 'Web scraping y automatización de portales.' },
      { name: 'Sync de CRM y Slack', desc: 'Traspaso de leads tibios y alertas de negocio.' }
    ]
  }
];

const TechStack = () => {
  return (
    <section id="tech-stack" className="py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-white text-foreground">
      <div className="w-full max-w-none mx-auto flex flex-col items-center text-center">
        <div className="mb-24 flex flex-col items-center text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center space-x-2 bg-slate-50 border border-black/5 rounded-full px-4 py-1.5 mb-8 inline-flex"
          >
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
               <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
               </svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Sistemas 24/7</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8">
            Infraestructura de <em className="italic opacity-60">Operación Autónoma</em>
          </h2>
          <p className="text-foreground/60 font-body text-sm sm:text-base">
            Diseñamos e integramos ecosistemas de agentes autónomos que se ejecutan sin pausa: procesando leads, enriqueciendo datos y cerrando oportunidades día y noche.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {agenticStack.map((tech, idx) => (
            <motion.div
              key={tech.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-black/5 hover:border-black/10 hover:bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 group flex flex-col items-start w-full text-left"
            >
              <div className="flex justify-between items-center w-full mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  {tech.icon}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-full px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{tech.status}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-body font-bold text-foreground tracking-tight mb-1">{tech.title}</h3>
                <p className="text-xs text-foreground/40 font-body leading-normal">{tech.subtitle}</p>
              </div>

              <div className="w-full h-px bg-black/5 mb-6" />

              <div className="flex flex-col gap-5 w-full">
                {tech.items.map((item) => (
                  <div key={item.name} className="flex flex-col items-start">
                    <span className="text-sm font-body font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {item.name}
                    </span>
                    <span className="text-xs text-foreground/50 font-body mt-0.5 leading-relaxed">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
