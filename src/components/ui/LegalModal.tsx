import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-background w-full max-w-3xl max-h-[85vh] rounded-[2.5rem] shadow-2xl shadow-foreground/10 flex flex-col border border-foreground/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-foreground/5">
              <div className="flex gap-6">
                <button 
                  className={`text-sm font-semibold transition-all pb-2 border-b-2 font-body cursor-pointer ${
                    activeTab === 'privacy' 
                      ? 'border-primary text-primary font-bold' 
                      : 'border-transparent text-foreground/40 hover:text-foreground/80'
                  }`}
                  onClick={() => setActiveTab('privacy')}
                >
                  Política de Privacidad
                </button>
                <button 
                  className={`text-sm font-semibold transition-all pb-2 border-b-2 font-body cursor-pointer ${
                    activeTab === 'terms' 
                      ? 'border-primary text-primary font-bold' 
                      : 'border-transparent text-foreground/40 hover:text-foreground/80'
                  }`}
                  onClick={() => setActiveTab('terms')}
                >
                  Términos de Servicio
                </button>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto text-foreground/75 text-sm space-y-6 font-body leading-relaxed no-scrollbar">
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-2xl font-display font-bold text-foreground mb-4">Política de Privacidad</h3>
                  <p className="mb-4">En Puna Tech valoramos y respetamos tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tus datos.</p>
                  
                  <h4 className="font-bold text-foreground text-base mt-6 mb-2">1. Información que recopilamos</h4>
                  <p className="mb-4 text-foreground/70">Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico y detalles de tu empresa al completar nuestros formularios de contacto o interactuar con nuestros servicios de automatización.</p>
                  
                  <h4 className="font-bold text-foreground text-base mt-6 mb-2">2. Uso de la información</h4>
                  <p className="mb-4 text-foreground/70">Utilizamos tus datos para proveer y mejorar nuestros servicios, contactarte sobre tu solicitud, diseñar arquitecturas de crecimiento personalizadas y enviarte actualizaciones relevantes si así lo aceptas.</p>
                  
                  <h4 className="font-bold text-foreground text-base mt-6 mb-2">3. Protección de datos</h4>
                  <p className="mb-4 text-foreground/70">Implementamos medidas de seguridad y protocolos avanzados para proteger tu información personal contra acceso no autorizado, alteración o destrucción.</p>
                  
                  <p className="mt-8 text-xs text-foreground/40">Última actualización: {new Date().getFullYear()}</p>
                </motion.div>
              )}
              {activeTab === 'terms' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-2xl font-display font-bold text-foreground mb-4">Términos de Servicio</h3>
                  <p className="mb-4">Al acceder y utilizar los servicios de Puna Tech, aceptas los siguientes términos y condiciones.</p>
                  
                  <h4 className="font-bold text-foreground text-base mt-6 mb-2">1. Uso de los Servicios</h4>
                  <p className="mb-4 text-foreground/70">Nuestros servicios de automatización, prospección e ingeniería de datos están destinados exclusivamente a empresas B2B. Te comprometes a utilizar nuestros sistemas de manera legal y ética.</p>
                  
                  <h4 className="font-bold text-foreground text-base mt-6 mb-2">2. Propiedad Intelectual</h4>
                  <p className="mb-4 text-foreground/70">Todo el contenido, diseños, arquitecturas de software y código generado en nuestra plataforma o entregado como parte de nuestro servicio es propiedad de Puna Tech o está licenciado para nuestro uso.</p>
                  
                  <h4 className="font-bold text-foreground text-base mt-6 mb-2">3. Limitación de Responsabilidad</h4>
                  <p className="mb-4 text-foreground/70">Puna Tech no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso de nuestros flujos de trabajo automatizados o agentes de IA.</p>
                  
                  <p className="mt-8 text-xs text-foreground/40">Última actualización: {new Date().getFullYear()}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;
