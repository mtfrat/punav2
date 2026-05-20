import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Mail, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Users, Clock } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from '../../lib/supabase';

export default function ROICalculator() {
  const [hoursPerEmployee, setHoursPerEmployee] = useState<number>(8);
  const [employeeCount, setEmployeeCount] = useState<number>(5);
  const [hourlyCost, setHourlyCost] = useState<number>(25);
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');

  // Math Calculations (80% automation efficiency)
  const weeklyHoursSaved = hoursPerEmployee * employeeCount * 0.8;
  const monthlyHoursSaved = Math.round(weeklyHoursSaved * 4.33);
  const annualHoursSaved = Math.round(weeklyHoursSaved * 52);
  
  const monthlySavings = Math.round(monthlyHoursSaved * hourlyCost);
  const annualSavings = Math.round(annualHoursSaved * hourlyCost);
  
  const freedFTE = Number((weeklyHoursSaved / 40).toFixed(1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    if (!email) {
      setEmailError('El correo electrónico es requerido.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Guardar en Supabase
      const { error } = await supabase
        .from('leads')
        .insert([
          { 
            email, 
            source: 'roi_calculator',
            hours_saved: monthlyHoursSaved,
            annual_savings: annualSavings,
            freed_fte: freedFTE
          }
        ]);

      if (error) throw error;

      // 2. Enviar alerta por EmailJS
      const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_yy0g002';
      const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_cr5obtd';
      const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'uTD7ft0fVaE7j9YlO';

      const templateParams = {
        from_name: 'Calculadora de ROI (puna-tech.com)',
        from_email: email,
        company: 'N/A',
        message: `Se ha realizado una simulación de ROI con los siguientes datos:\n- Horas perdidas/empleado semanal: ${hoursPerEmployee}h\n- Cantidad de empleados: ${employeeCount}\n- Costo estimado por hora: $${hourlyCost} USD\n\nResultados estimados:\n- Horas liberadas al mes: ${monthlyHoursSaved}h\n- Ahorro anual estimado: $${annualSavings} USD\n- FTE liberado: ${freedFTE} empleados full-time.`,
        to_name: 'PunaTech',
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error al guardar o enviar el lead:', err);
      setEmailError('Ocurrió un error al guardar tu reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="roi-calculator" className="py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-[#F8F4F0] border-t border-[#E8DCC2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 bg-white/60 border border-[#E8DCC2] rounded-full px-4 py-1.5 mb-8 inline-flex backdrop-blur-sm shadow-sm">
            <Calculator className="w-4 h-4 text-[#AF4C24]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6D2C2C]/70">Calculadora de ROI B2B</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-6 text-[#2A0E0E]">
            Mide el Impacto de la <em className="italic opacity-70">Automatización con IA</em>
          </h2>
          <p className="text-[#6D2C2C]/80 font-body text-sm sm:text-base max-w-xl mx-auto">
            Ingresa los parámetros de tu equipo operativo para ver cuántas horas y presupuesto puedes liberar al mes integrando flujos de trabajo autónomos (agénticos).
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Inputs Section */}
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#E8DCC2] shadow-soft flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-2xl font-display font-bold text-[#2A0E0E] border-b border-[#F8F4F0] pb-4">
                1. Configura tus Métricas de Operación
              </h3>
              
              {/* Slider 1: Horas semanales */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label className="font-bold text-[#2A0E0E] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#AF4C24]" />
                    Horas perdidas por empleado (semanal)
                  </label>
                  <span className="font-bold text-[#AF4C24] bg-[#AF4C24]/10 px-3 py-1 rounded-lg text-xs font-mono">
                    {hoursPerEmployee} horas
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={hoursPerEmployee}
                  onChange={(e) => setHoursPerEmployee(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#F8F4F0] rounded-lg appearance-none cursor-pointer accent-[#AF4C24]"
                />
                <div className="flex justify-between text-[10px] text-[#6D2C2C]/50">
                  <span>Mín: 2 hrs</span>
                  <span>Tareas repetitivas (copiar datos, responder correos, reportes)</span>
                  <span>Máx: 40 hrs</span>
                </div>
              </div>

              {/* Slider 2: Empleados */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label className="font-bold text-[#2A0E0E] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#AF4C24]" />
                    Cantidad de empleados afectados
                  </label>
                  <span className="font-bold text-[#AF4C24] bg-[#AF4C24]/10 px-3 py-1 rounded-lg text-xs font-mono">
                    {employeeCount} personas
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#F8F4F0] rounded-lg appearance-none cursor-pointer accent-[#AF4C24]"
                />
                <div className="flex justify-between text-[10px] text-[#6D2C2C]/50">
                  <span>1 empleado</span>
                  <span>Personal administrativo, ventas, soporte o marketing</span>
                  <span>200+ empleados</span>
                </div>
              </div>

              {/* Slider 3: Costo por hora */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label className="font-bold text-[#2A0E0E] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#AF4C24]" />
                    Costo laboral estimado por hora (USD)
                  </label>
                  <span className="font-bold text-[#AF4C24] bg-[#AF4C24]/10 px-3 py-1 rounded-lg text-xs font-mono">
                    ${hourlyCost} USD/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={hourlyCost}
                  onChange={(e) => setHourlyCost(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#F8F4F0] rounded-lg appearance-none cursor-pointer accent-[#AF4C24]"
                />
                <div className="flex justify-between text-[10px] text-[#6D2C2C]/50">
                  <span>$10 USD</span>
                  <span>Salario bruto + cargas patronales + herramientas de software</span>
                  <span>$120 USD</span>
                </div>
              </div>
            </div>

            {/* Lead Magnet inside */}
            <div className="mt-10 pt-8 border-t border-[#F8F4F0]">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="lead-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="bg-[#F8F4F0] rounded-2xl p-5 border border-[#E8DCC2]/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A0E0E] mb-1">
                        🎁 Obtén un plan de arquitectura agéntica personalizado
                      </h4>
                      <p className="text-xs text-[#6D2C2C]/80 leading-normal">
                        Enviamos a tu email un reporte detallado en PDF (5 páginas) con la arquitectura de automatización de agentes propuesta para tu volumen de operación.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#6D2C2C]/50" />
                        <input
                          type="email"
                          placeholder="Tu correo electrónico (ej: nombre@tuempresa.com)"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#F8F4F0] border border-[#E8DCC2] rounded-xl text-sm text-[#2A0E0E] placeholder-[#6D2C2C]/40 focus:outline-none focus:ring-2 focus:ring-[#AF4C24] focus:bg-white transition-all font-body"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#AF4C24] hover:bg-[#923E1C] text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Calculando...
                          </>
                        ) : (
                          <>
                            Obtener Plan
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                    {emailError && (
                      <p className="text-xs text-red-500 font-semibold">{emailError}</p>
                    )}
                  </motion.form>
                ) : (
                  <motion.div
                    key="lead-success"
                    className="bg-[#F8F4F0] rounded-2xl p-6 border border-[#E8DCC2] flex items-start gap-4 text-left"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#AF4C24] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-lg text-[#2A0E0E]">¡Plan en camino!</h4>
                      <p className="text-xs text-[#6D2C2C] mt-1 leading-relaxed">
                        Hemos enviado un análisis preliminar y la propuesta de arquitectura agéntica a <strong>{email}</strong>. 
                        Uno de nuestros arquitectos de software senior revisará tu estimación para coordinar una videollamada corta.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-5 bg-[#2A0E0E] text-white rounded-[2.5rem] p-8 md:p-10 border border-[#2A0E0E] shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#AF4C24]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#E8DCC2]">Resultados Estimados</span>
              <h3 className="text-3xl font-display font-bold mt-2 mb-8 text-white">
                Tu Retorno de Inversión
              </h3>

              <div className="space-y-6">
                
                {/* Metric 1: Horas recuperadas */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <span className="text-xs text-[#E8DCC2]/70">Tiempo Liberado al Mes</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-display font-bold text-[#E8DCC2]">
                      {monthlyHoursSaved.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#E8DCC2]/50 font-bold font-mono">horas / mes</span>
                  </div>
                  <p className="text-[11px] text-[#E8DCC2]/40 mt-2">
                    Equivale a {annualHoursSaved.toLocaleString()} horas recuperadas anualmente en tu organización.
                  </p>
                </div>

                {/* Metric 2: Dinero ahorrado */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <span className="text-xs text-[#E8DCC2]/70">Ahorro Financiero Anual Estimado</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-display font-bold text-[#AF4C24]">
                      ${annualSavings.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#E8DCC2]/50 font-bold font-mono">USD / año</span>
                  </div>
                  <p className="text-[11px] text-[#E8DCC2]/40 mt-2">
                    Ahorro mensual directo de ${monthlySavings.toLocaleString()} USD en costos operativos superfluos.
                  </p>
                </div>

                {/* Metric 3: FTEs */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <span className="text-xs text-[#E8DCC2]/70">Capacidad de Crecimiento Liberada (FTE)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-display font-bold text-[#E8DCC2]">
                      {freedFTE}
                    </span>
                    <span className="text-xs text-[#E8DCC2]/50 font-bold font-mono">empleados full-time</span>
                  </div>
                  <p className="text-[11px] text-[#E8DCC2]/40 mt-2">
                    Fuerza laboral reasignada desde tareas repetitivas a iniciativas estratégicas o ventas de alto margen.
                  </p>
                </div>

              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#E8DCC2]/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#AF4C24]" />
                Cálculo basado en 80% de eficiencia operativa
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
