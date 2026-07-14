import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, MessageSquare } from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API Key is missing. Configura VITE_OPENAI_API_KEY en tu archivo .env");
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: newMessages
        })
      });

      if (!response.ok) {
        throw new Error('Error al conectar con OpenAI');
      }

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error(error);
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
            className="w-[350px] sm:w-[400px] h-[500px] bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4"
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
                    En línea
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

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-3 bg-white/5 border-t border-white/10 flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
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
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 shrink-0 rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/80 transition-colors disabled:opacity-50 cursor-pointer mb-0.5"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
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
