import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Plan Inicial',
    price: '$50.00',
    features: [
      'Herramientas básicas de análisis',
      'Hasta 3 cuentas de usuario',
      'Monitoreo en tiempo real de operaciones',
      'Reportes mensuales de rendimiento',
      'Soporte por correo electrónico'
    ]
  },
  {
    name: 'Plan Crecimiento',
    price: '$90.00',
    features: [
      'Herramientas avanzadas de análisis',
      'Hasta 10 cuentas de usuario',
      'Monitoreo en tiempo real de operaciones',
      'Reportes mensuales personalizados',
      'Soporte prioritario por correo'
    ],
    active: true
  },
  {
    name: 'Plan Escala',
    price: '$150.00',
    features: [
      'Herramientas avanzadas de análisis',
      'Cuentas de usuario ilimitadas',
      'Monitoreo en tiempo real de operaciones',
      'Reportes personalizados y exportables',
      'Soporte dedicado por email y chat'
    ]
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-32 px-4 bg-white">
      <div className="relative max-w-7xl mx-auto rounded-[3.5rem] overflow-hidden">
        {/* Soft Sky Background */}
        <img
          src="https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=2000"
          alt="Fondo de pantalla de nubes"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
        />
        <div className="absolute inset-0 bg-white/20 z-[1]" />

        <div className="relative z-10 py-24 px-8 sm:px-12 flex flex-col items-center">
          <div className="text-center mb-20">
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
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-body text-foreground/50">Precios</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8">
              Precios simples y <em className="italic opacity-60">transparentes</em>
            </h2>
            <p className="max-w-xl mx-auto text-foreground/40 font-body text-sm">
              Elige el plan que mejor se adapte a las necesidades y presupuesto de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-8 rounded-[2.5rem] flex flex-col border transition-all duration-500 ${plan.active ? 'scale-105 border-primary bg-white shadow-2xl z-10' : 'bg-slate-50/80 backdrop-blur-md border-black/5 hover:bg-white'}`}
              >
                <div className="flex items-center space-x-2 mb-8">
                  <div className={`p-1.5 rounded-md ${plan.active ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-40 font-body">{plan.name}</span>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-display tracking-tighter text-foreground">{plan.price}</span>
                  <span className="text-sm opacity-40 ml-2 font-body text-foreground">/mes</span>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold font-body mb-4 text-foreground">Características:</div>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start space-x-3 text-sm font-body">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2 h-2 text-primary" />
                      </div>
                      <span className="text-foreground/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-4 rounded-full text-sm font-bold transition-all duration-300 ${plan.active ? 'bg-primary text-white hover:bg-primary/90' : 'bg-foreground text-background hover:scale-105'}`}>
                   Comenzar
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
