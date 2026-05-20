import React from 'react';
import { motion } from 'motion/react';

const services = [
  {
    title: 'Ventas y Prospección',
    description: 'Automatización de emails y mensajes 24/7 para prospección algorítmica.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop'
  },
  {
    title: 'Tareas Repetitivas',
    description: 'Conexión de herramientas complejas para eliminar el error humano.',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop'
  },
  {
    title: 'Asistentes IA',
    description: 'Chatbots personalizados y generación de contenido inteligente.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'
  },
  {
    title: 'Optimización del Tiempo',
    description: 'Reducción drástica de horas manuales (ej. de 40 a 4 horas semanales).',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&auto=format&fit=crop'
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
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
          loading="lazy"
          width="2000"
          height="1333"
        />
        <div className="absolute inset-0 bg-white/20 z-[1]" />

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
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-body text-foreground/50">Servicios</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8 text-foreground">
              tu <em className="italic opacity-60">tecnología</em>
            </h2>
            <p className="max-w-xl mx-auto text-foreground/50 font-body text-sm sm:text-base">
              Adaptamos y escalamos tus operaciones con nuestra infraestructura flexible, <br/>
              diseñada para potenciar el crecimiento de tu negocio.
            </p>
          </div>
   
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {services.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50/80 backdrop-blur-md p-10 rounded-[2.5rem] group hover:bg-white transition-all duration-500 border border-black/5 shadow-sm flex flex-col items-center md:items-start text-center md:text-left"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-black/5 group-hover:scale-110 transition-transform duration-500 bg-white">
                  <img 
                    src={service.image} 
                    alt={`Ilustración visual del servicio: ${service.title}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                    width="64"
                    height="64"
                  />
                </div>
                <h3 className="text-2xl font-display mb-4 tracking-tight text-foreground">{service.title}</h3>
                <p className="text-sm text-foreground/40 leading-relaxed font-body">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <a 
               href="#contact"
               className="bg-foreground text-background px-10 py-4 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-xl shadow-black/10 inline-block"
             >
               Empezar ahora
             </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
