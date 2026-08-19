import React from 'react';
import { motion } from 'motion/react';
import { Database, GitBranch, Terminal, Shield, ArrowUpRight } from 'lucide-react';

const cases = [
  {
    title: 'Automatización del 100% del pipeline de certificados',
    client: 'Plataforma de Educación Cripto',
    description: 'Eliminamos la intervención humana en la generación y entrega de certificados. Diseñamos un flujo de procesamiento en la nube que toma datos crudos, genera activos digitales seguros y los distribuye a miles de usuarios.',
    tech: ['Supabase', 'Python Pipelines', 'Google Cloud', 'PostgreSQL'],
    impact: 'Reducción de 45 horas de trabajo administrativo semanal a 0.',
    icon: <Database className="w-6 h-6 text-primary" />
  },
  {
    title: 'Integración CRM y Flujos de Outreach Autónomos (RevOps)',
    client: 'Agencia de Revenue Ops',
    description: 'Orquestamos arquitecturas multi-agente para manejar operaciones de ingresos. Los agentes se integran mediante APIs complejas al CRM, califican leads, extraen insights de llamadas y envían secuencias de outreach altamente personalizadas.',
    tech: ['LangChain', 'HubSpot API', 'OpenAI', 'Docker'],
    impact: 'Incremento del 300% en volumen de prospección con 0% de incremento en personal.',
    icon: <GitBranch className="w-6 h-6 text-primary" />
  },
  {
    title: 'Conciliación Financiera y Entornos Persistentes',
    client: 'Fintech de Conciliación',
    description: 'Desarrollamos un entorno persistente para que agentes IA realicen conciliación cruzada de facturas y movimientos bancarios. Implementamos un sistema "Human-in-the-Loop" para transacciones críticas.',
    tech: ['Vector DBs', 'Gemini', 'Node.js', 'Redis'],
    impact: '99.9% de precisión en cruce de datos fiscales y operativos.',
    icon: <Shield className="w-6 h-6 text-primary" />
  }
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-32 px-6 md:px-16 bg-[#050505] relative overflow-hidden">
      {/* Background acccents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center space-x-2 mb-6">
          <Terminal className="w-4 h-4 text-white/40" />
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Arquitecturas Implementadas
          </span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-light text-white mb-6 uppercase tracking-tight">
          Casos de <span className="font-medium">Éxito Operativo</span>
        </h2>
        
        <p className="text-white/60 text-sm md:text-base max-w-2xl mb-20 font-light leading-relaxed">
          Nuestros clientes corporativos no compran código; compran certidumbre, reducción de riesgos y escalabilidad. Construimos infraestructura técnica compleja que resuelve dolores operativos tangibles en áreas de RevOps, Finanzas y Gestión de Datos.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors flex flex-col group"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">
                  {item.client}
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
              
              <h3 className="text-xl text-white font-medium mb-4 leading-tight">
                {item.title}
              </h3>
              
              <p className="text-sm text-white/60 mb-8 flex-grow font-light">
                {item.description}
              </p>
              
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-mono">Stack Técnico</div>
                <div className="flex flex-wrap gap-2">
                  {item.tech.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-black/50 border border-white/10 text-[10px] text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-mono">Impacto en el Negocio</div>
                <p className="text-sm text-white font-medium">{item.impact}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
