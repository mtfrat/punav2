import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "¿En cuánto tiempo veo resultados?",
    answer: "Nuestros clientes suelen notar una reducción del 30% en carga operativa durante los primeros 30 días tras la implementación técnica."
  },
  {
    question: "¿Se integra con mis herramientas actuales?",
    answer: "Sí, somos especialistas en conectar CRMs, ERPs y flujos de trabajo existentes para que no tengas que cambiar tu forma de trabajar."
  },
  {
    question: "¿Es seguro delegar mis datos?",
    answer: "Absolutamente. Implementamos arquitecturas con cifrado de grado bancario y cumplimos con estándares internacionales de privacidad."
  },
  {
    question: "¿Ofrecen soporte post-implementación?",
    answer: "Incluimos 3 meses de monitoreo activo y optimización continua en todos nuestros planes para asegurar que la escala sea estable."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-display mb-4 tracking-tight text-foreground">Preguntas Frecuentes</h2>
          <p className="text-foreground/50 font-body text-sm sm:text-base max-w-lg mx-auto">Todo lo que necesitas saber antes de dar el siguiente paso.</p>
        </div>
        
        <div className="divide-y divide-black/5 border-t border-b border-black/5">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="py-2"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full py-6 flex items-center justify-between text-left transition-colors group cursor-pointer"
                id={`faq-button-${i}`}
                aria-expanded={openIndex === i}
                aria-controls={`faq-panel-${i}`}
              >
                <span className="font-body text-base md:text-lg font-medium text-foreground group-hover:text-primary transition-colors pr-8">
                  {faq.question}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                  {openIndex === i ? <Minus className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                  >
                    <div className="pb-6 text-foreground/70 text-sm md:text-base font-body leading-relaxed pr-12">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
