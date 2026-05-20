import React from 'react';
import { motion } from 'motion/react';

const About = () => {
  return (
    <section id="about" className="py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-background text-foreground relative overflow-hidden">
      <div className="w-full max-w-none mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center space-x-2 bg-foreground/5 border border-foreground/10 rounded-full px-4 py-1.5 mb-12"
        >
          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
             <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
             </svg>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">Sobre nosotros</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-[56px] font-display mb-20 tracking-tight max-w-[80rem] leading-[1.1] text-foreground"
        >
          Nos apasiona empoderar a personas y empresas para que tomen el 
          control de su <em className="italic opacity-60">tecnología</em> y logren sus <em className="italic opacity-60">objetivos estratégicos</em>.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full max-w-none">
           <div className="space-y-3 flex flex-col items-center">
              <div className="text-7xl font-display text-foreground">80%</div>
              <div className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Reducción en tiempo <br/> de reporting.</div>
           </div>
           <div className="space-y-3 flex flex-col items-center">
              <div className="text-7xl font-display text-foreground">$70k</div>
              <div className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Ahorro mensual <br/> promedio (aprox).</div>
           </div>
           <div className="space-y-3 flex flex-col items-center">
              <div className="text-7xl font-display text-foreground">99</div>
              <div className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Incremento en horas <br/> facturables.</div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default About;
