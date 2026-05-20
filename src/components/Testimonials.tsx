import React from 'react';
import { motion } from 'motion/react';

const testimonials = [
  {
    name: '320%',
    role: 'Aumento en Reuniones',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop',
    text: 'La automatización de prospección cambió por completo nuestro embudo de ventas industrial. ROI inmediato.'
  },
  {
    name: '15h',
    role: 'Ahorro Semanal',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop',
    text: 'Eliminamos el trabajo manual en la organización de datos, permitiendo al equipo enfocarse en cerrar ventas.'
  },
  {
    name: '8x',
    role: 'ROI en 90 días',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop',
    text: 'La inversión se recuperó en tiempo récord gracias a los asistentes de IA personalizados diseñados por Puna.'
  }
];

const Testimonials = () => {
  return (
    <section className="py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-background text-foreground overflow-hidden">
      <div className="w-full max-w-none mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center space-x-2 bg-foreground/5 border border-foreground/10 rounded-full px-4 py-1.5 mb-8 inline-flex"
          >
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
               <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
               </svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">Métricas</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8 text-foreground">
            Qué dicen <br/> nuestros <em className="italic opacity-60">clientes</em>
          </h2>
          <p className="max-w-xl mx-auto text-foreground/40 font-body text-sm">
            Nuestros usuarios aman cómo Puna Tech simplifica sus procesos y optimiza sus operaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-10 bg-slate-50 rounded-[2.5rem] border border-black/5 flex flex-col items-center md:items-start text-center md:text-left hover:bg-white transition-all duration-500 group shadow-sm"
            >
              <div className="text-4xl mb-6 text-foreground/10 leading-none group-hover:text-primary/20 transition-colors w-full md:w-auto">"</div>
              <p className="text-sm leading-relaxed text-foreground/70 font-body mb-8">
                {t.text}
              </p>
              <div className="mt-auto flex flex-col md:flex-row items-center gap-4">
                <img 
                  src={t.image} 
                  alt={`Foto de perfil de testimonio sobre ${t.role}`} 
                  className="w-12 h-12 rounded-full object-cover grayscale transition-all duration-500 border border-black/5" 
                />
                <div className="flex flex-col items-center md:items-start">
                  <div className="text-lg font-display text-foreground leading-tight">{t.name}</div>
                  <div className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
