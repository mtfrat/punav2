import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '' });
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const leadSentRef = useRef<boolean>(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    // Fetch knowledge base text
    fetch('/chatbot-knowledge.md')
      .then(res => res.text())
      .then(text => {
        // Start conversation with a greeting
        setMessages([
          { role: 'system', content: text },
          { role: 'assistant', content: '¡Hola! Soy el asistente virtual de Puna Tech. ¿En qué te puedo ayudar hoy?' }
        ]);
      })
      .catch(err => console.error("Error loading knowledge base:", err));
  }, []);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTo({
        top: logsContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLimitReached]);

  const sendLeadNotification = async ({ name, email, details, messagesHistory }: { name: string; email: string; details: string; messagesHistory: Message[] }) => {
    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_yy0g002';
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_cr5obtd';
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'uTD7ft0fVaE7j9YlO';

    const chatLog = messagesHistory
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Bot'}: ${m.content}`)
      .join('\n\n');

    // 1. Guardar en Supabase (leads)
    try {
      await supabase.from('leads').insert([
        {
          name: name || 'Lead de Chatbot',
          email: email,
          company: 'N/A (Chatbot)',
          source: 'chatbot',
          notes: `Interés: ${details}\n\nHistorial completo:\n${chatLog}`
        }
      ]);
    } catch (err) {
      console.error('Error guardando lead de chatbot en Supabase:', err);
    }

    // 2. Enviar email por EmailJS
    try {
      const templateParams = {
        from_name: `${name} (Lead de Chatbot)`,
        from_email: email,
        company: 'Lead de Chatbot IA',
        message: `🤖 ¡NUEVA CONSULTA CAPTURADA POR EL CHATBOT!\n\n` +
                 `👤 Nombre: ${name}\n` +
                 `✉️ Email: ${email}\n` +
                 `💡 Interés/Detalles: ${details}\n\n` +
                 `========================================\n` +
                 `💬 HISTORIAL COMPLETO DE LA CONVERSACIÓN:\n\n` +
                 `${chatLog}`,
        to_name: 'PunaTech',
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      console.log('Notificación de lead de chatbot enviada por correo exitosamente.');
    } catch (err) {
      console.error('Error enviando notificación por email del chatbot:', err);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.email.trim() || isSubmittingLead) return;

    setIsSubmittingLead(true);
    try {
      leadSentRef.current = true;
      await sendLeadNotification({
        name: leadForm.name.trim(),
        email: leadForm.email.trim(),
        details: 'Usuario alcanzó el límite de 5 preguntas e ingresó sus datos para continuar.',
        messagesHistory: messages
      });

      // Desbloquear el chat y reiniciar contador
      setIsLimitReached(false);
      setUserMessageCount(0);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `¡Gracias **${leadForm.name.trim()}**! Hemos recibido tus datos correctamente y te contactaremos en breve. Tu chat ha sido desbloqueado para que puedas continuar consultando.`
        }
      ]);
      setLeadForm({ name: '', email: '' });
    } catch (err) {
      console.error('Error al enviar formulario de lead:', err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isLimitReached) return;

    const userMsg = input.trim();
    setInput('');
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Llamada al endpoint backend seguro /api/chat (la API Key nunca se expone al cliente)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.error('Error en respuesta de /api/chat:', response.status, errJson);
        throw new Error(`Error en servidor: ${response.status}`);
      }

      const data = await response.json();
      const rawBotReply = data.choices[0]?.message?.content || '';

      // Detectar etiqueta [[LEAD_CAPTURED: name="...", email="...", details="..."]]
      const leadTagMatch = rawBotReply.match(/\[\[LEAD_CAPTURED:\s*name="([^"]*)",\s*email="([^"]*)",\s*details="([^"]*)"\]\]/i);
      const cleanReply = rawBotReply.replace(/\[\[LEAD_CAPTURED:.*?\]\]/g, '').trim();

      const updatedMessages: Message[] = [...newMessages, { role: 'assistant', content: cleanReply }];

      if (leadTagMatch && !leadSentRef.current) {
        const name = leadTagMatch[1];
        const email = leadTagMatch[2];
        const details = leadTagMatch[3];
        leadSentRef.current = true;
        sendLeadNotification({ name, email, details, messagesHistory: updatedMessages });
      } else {
        // Respálmulo: si el usuario escribió un email y el bot aún no ha enviado el lead
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
        const emailMatch = userMsg.match(emailRegex);
        if (emailMatch && !leadSentRef.current) {
          leadSentRef.current = true;
          sendLeadNotification({ 
            name: 'Usuario Chatbot', 
            email: emailMatch[0], 
            details: 'Consulta sobre productos/servicios en chatbot', 
            messagesHistory: updatedMessages 
          });
        }
      }

      // Si alcanzó las 5 preguntas en esta sesión, activar límite
      if (newCount >= 5 && !leadSentRef.current) {
        setIsLimitReached(true);
        updatedMessages.push({
          role: 'assistant',
          content: '🔒 **Has alcanzado el límite de 5 consultas gratuitas en línea.**\nPara continuar la conversación o recibir un presupuesto detallado a la medida de tu empresa, por favor déjanos tu **Nombre** y **Email** a continuación.'
        });
      }

      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error en Chatbot:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, estoy teniendo problemas de conexión. Por favor, contáctanos en punatechba@gmail.com' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[350px] sm:w-[400px] h-[520px] bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Asistente IA</h3>
                  <p className="text-[10px] font-mono text-white/60 flex items-center gap-1.5 uppercase tracking-widest mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    En línea ({userMessageCount}/5 consultas)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={logsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-light text-sm bg-[#050505]">
              {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-white text-black rounded-tr-none' 
                        : 'bg-[#121212] text-white/80 rounded-tl-none border border-white/10'
                    }`}
                  >
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i !== 0 ? 'mt-2' : ''} dangerouslySetInnerHTML={{
                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}></p>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-2xl bg-[#121212] text-white/80 rounded-tl-none border border-white/10 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario de Captura de Contacto al alcanzar el límite */}
            {isLimitReached ? (
              <form onSubmit={handleLeadSubmit} className="p-4 bg-white/5 border-t border-white/10 space-y-3">
                <p className="text-xs text-white/80 font-medium">Ingresa tus datos para continuar el chat:</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  />
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingLead ? 'Enviando y Desbloqueando...' : 'Enviar y Continuar Chat'}
                </button>
              </form>
            ) : (
              /* Input Area Normal */
              <form onSubmit={sendMessage} className="p-3 bg-white/5 border-t border-white/10 flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !isLoading && !isLimitReached) {
                        sendMessage(e as unknown as React.FormEvent);
                        if (textareaRef.current) {
                          textareaRef.current.style.height = 'auto';
                        }
                      }
                    }
                  }}
                  rows={1}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors resize-none overflow-y-auto no-scrollbar font-light placeholder:text-white/20"
                  style={{ maxHeight: '120px' }}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading || isLimitReached}
                  className="w-11 h-11 shrink-0 rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/80 transition-colors disabled:opacity-50 cursor-pointer mb-0.5"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center text-black hover:bg-white/90 transition-colors cursor-pointer relative"
      >
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-black"></span>
          </span>
        )}
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
