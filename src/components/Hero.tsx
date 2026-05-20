import React from 'react';
import { motion } from 'motion/react';

const Hero = () => {
  return (
    <section className="relative h-[95vh] w-full flex flex-col overflow-hidden bg-white mx-auto mt-4 px-4">
      <div className="relative w-full h-full rounded-[3rem] overflow-hidden">
        {/* Cloud Background */}
        <img
          src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=2000"
          alt="Cielo con nubes como fondo del hero"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
          loading="eager"
          fetchPriority="high"
          width="2000"
          height="1333"
        />
        
        {/* Soft overlay to ensure readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent z-[1]" />

        {/* Hero Content */}
        <main className="relative z-10 flex-1 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="flex flex-col items-center max-w-6xl w-full">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-2 bg-white/40 border border-white/40 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md shadow-sm"
            >
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                 <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 0L6.12257 3.87743L10 5L6.12257 6.12257L5 10L3.87743 6.12257L0 5L3.87743 3.87743L5 0Z" fill="white"/>
                 </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-body text-foreground/70">De la Estrategia al Éxito</span>
            </motion.div>

            <motion.h1 
              className="animate-fade-rise text-6xl sm:text-7xl md:text-8xl lg:text-[110px] leading-[0.85] tracking-[-0.04em] font-normal text-foreground font-display"
            >
              Multiplica tus <em className="italic font-display">Operaciones</em> <br />
              con Infraestructura Ágil
            </motion.h1>

            <motion.p 
              className="animate-fade-rise-delay text-foreground/60 text-sm sm:text-base md:text-lg max-w-xl mt-10 leading-relaxed font-body"
            >
              Liberamos el potencial técnico de tu empresa mediante sistemas automatizados y 
              arquitecturas escalables que garantizan autoridad absoluta en tu nicho.
            </motion.p>

            <motion.div className="animate-fade-rise-delay-2 mt-12 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="#about"
                className="bg-foreground text-background font-bold rounded-full px-10 py-4 text-sm hover:scale-105 transition-all duration-300 shadow-xl shadow-black/10 inline-block"
              >
                Empezar ahora
              </a>
              <a 
                href="#services"
                className="bg-white/60 backdrop-blur-md text-foreground font-bold rounded-full px-10 py-4 text-sm hover:bg-white transition-all duration-300 inline-block border border-white/20"
              >
                Saber más
              </a>
            </motion.div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Hero;
