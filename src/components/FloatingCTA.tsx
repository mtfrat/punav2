import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 600;
      
      // Hide when near contact or footer
      const hideSections = ['contact', 'footer'];
      for (const id of hideSections) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight - 50) {
            setIsVisible(false);
            return;
          }
        }
      }
      
      setIsVisible(shouldShow && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3"
        >
          <a
            href="/#contact"
            className="bg-foreground text-background px-8 py-4 rounded-full shadow-2xl shadow-black/20 flex items-center gap-3 group hover:scale-105 transition-transform"
            id="floating-cta"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Agenda tu Auditoría Gratuita</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <button
            onClick={() => setIsDismissed(true)}
            className="w-11 h-11 rounded-full bg-white border border-foreground/10 flex items-center justify-center text-foreground hover:bg-slate-50 transition-colors shadow-2xl cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;
