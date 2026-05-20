import React, { useState } from 'react';
import { motion } from 'motion/react';
import emailjs from '@emailjs/browser';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';



const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_yy0g002';
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_cr5obtd';
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'uTD7ft0fVaE7j9YlO';

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company,
        message: formData.message,
        to_name: 'PunaTech',
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSubmitted(true);
    const input = (e.currentTarget as HTMLFormElement).querySelector('input');
    if (input) input.value = '';
    setTimeout(() => setNewsletterSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="py-32 px-4 sm:px-8 md:px-12 2xl:px-20 bg-background">
      <div className="w-full max-w-none mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
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
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60 text-foreground">Contáctanos</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-display tracking-tight mb-8 text-foreground">
              Conectemos
            </h2>
            <p className="text-lg text-foreground/60 font-body mb-12">
              ¿Listo para transformar tu negocio con automatización inteligente? <br/>
              Completa el formulario y te responderemos en menos de 24 horas.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-background p-10 rounded-[3rem] shadow-2xl shadow-foreground/5 border border-foreground/10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium ml-4">Nombre *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-sm text-foreground" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium ml-4">Email *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-sm text-foreground" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium ml-4">Empresa</label>
                <input 
                  type="text" 
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-muted border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-sm text-foreground" 
                  placeholder="Acme Corp (opcional)" 
                />
              </div>



              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium ml-4">Mensaje *</label>
                <textarea 
                  rows={4} 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-muted border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-sm resize-none text-foreground" 
                  placeholder="Cuéntanos sobre tu proyecto... ¿Qué procesos quieres automatizar?" 
                />
              </div>

              {submitStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="flex items-center gap-2 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-xs font-semibold"
                >
                  <CheckCircle2 size={16} />
                  <span>¡Mensaje enviado con éxito! Te contactaremos a la brevedad.</span>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold"
                >
                  <XCircle size={16} />
                  <span>Ocurrió un error al enviar. Por favor, intenta de nuevo o escríbenos a punatechba@gmail.com.</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar Solicitud</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 w-full rounded-[3.5rem] p-12 md:p-20 text-center relative overflow-hidden"
        >
           {/* Sky background for CTA */}
           <img
             src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=2000"
             alt="Cielo azul profundo como fondo del llamado a la acción"
             className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
             loading="lazy"
           />
           <div className="absolute inset-0 bg-white/20 z-[1]" />

           <h2 className="text-4xl md:text-5xl lg:text-[64px] font-display mb-8 relative z-10 text-foreground leading-tight">
             Logra la excelencia <br/> <em className="italic opacity-60">operacional</em> con nosotros
           </h2>
           <p className="max-w-xl mx-auto text-foreground/60 mb-12 font-body relative z-10">
             Únete a más de 500 empresas que ya usan Puna Tech para optimizar sus negocios.
           </p>
           <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 relative z-10">
              <label htmlFor="newsletter-email" className="sr-only">Correo electrónico para newsletter</label>
              <input 
                id="newsletter-email"
                type="email" 
                required
                autoComplete="email"
                placeholder="Ingresa tu correo" 
                className="flex-1 bg-white/60 backdrop-blur-md border border-white/40 rounded-full px-8 py-4 outline-none focus:bg-white transition-all placeholder:text-foreground/40 font-body text-foreground"
              />
              <button type="submit" className="bg-foreground text-background font-bold rounded-full px-10 py-4 hover:scale-105 transition-all shadow-xl shadow-black/10 cursor-pointer">
                 Empezar ahora
              </button>
           </form>
           {newsletterSubmitted && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="relative z-10 mt-4 flex items-center justify-center gap-2 text-sm text-foreground/80 font-semibold"
             >
               <CheckCircle2 size={16} className="text-green-600" />
               ¡Gracias por suscribirte!
             </motion.div>
           )}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
