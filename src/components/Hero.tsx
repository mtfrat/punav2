import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, ArrowRight, ShieldCheck, Layers, Flame, Sparkles, Rocket } from "lucide-react";

const Hero = () => {
  // Terminal Console State & Logic inline to avoid extra component file
  const [logs, setLogs] = useState<{ text: string; type: "info" | "success" | "error" | "input" | "system" }[]>([
    { text: "Initializing neural pipeline...", type: "system" },
    { text: "Connecting to legacy DB (192.168.1.5)... [OK]", type: "info" },
    { text: "Fetching unstructured payload... [OK]", type: "info" },
    { text: "Applying cognitive extraction model v4.2...", type: "info" },
    { text: "Entities identified: 1,240, warnings: 0", type: "success" },
    { text: "Cross-referencing logic gates... [OK]", type: "info" },
    { text: "Generating structured output...", type: "info" },
    { text: "Type '/help' to see active terminal controls.", type: "system" }
  ]);
  const [input, setInput] = useState("");
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTo({
        top: logsContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [logs]);

  useEffect(() => {
    const events = [
      "Agente de Cobros: Analizando nueva factura PDF de proveedor aduanero...",
      "Servicio de API: Ping recibido en /api/health - latencia 12ms [OK]",
      "RAG Vector DB: Indexando 4 nuevos artículos del blog corporativo...",
      "Agente Evaluador: Validando conformidad de respuesta conversacional...",
      "Google Cloud Run: Escalando contenedor en puerto 3000..."
    ];

    const interval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLogs((prev) => [...prev, { text: `> ${randomEvent}`, type: "info" }]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newLogs = [...logs, { text: `> ${input}`, type: "input" }];
    setInput("");

    switch (cmd) {
      case "/help":
        setLogs([
          ...newLogs,
          { text: "--- COMANDOS DISPONIBLES DE PUNA TECH TERMINAL ---", type: "system" },
          { text: "  /status     - Verifica el estado de memoria, CPU y agentes.", type: "info" },
          { text: "  /optimize   - Ejecuta un flujo animado de optimización de DB.", type: "info" },
          { text: "  /deploy     - Simula el despliegue del MVP en Cloud Run.", type: "info" },
          { text: "  /evaluate   - Audita el rendimiento del pipeline cognitivo.", type: "info" },
          { text: "  /clear      - Limpia la pantalla de la consola.", type: "info" }
        ]);
        break;
      case "/status":
        setLogs([
          ...newLogs,
          { text: "[SISTEMA CORPORATIVO ACTIVO]", type: "system" },
          { text: "  CPU Usage: 1.8% (Optimizado para bajo costo)", type: "info" },
          { text: "  Memoria RAM: 1.4GB / 16GB", type: "info" },
          { text: "  Agentes de IA Activos: 3 (Facturación, Soporte, Conciliador)", type: "success" },
          { text: "  API Uptime SLA: 99.98% - Estado general: EXCELENTE", type: "success" }
        ]);
        break;
      case "/optimize":
        setLogs([
          ...newLogs,
          { text: "Iniciando optimización general...", type: "system" }
        ]);
        setTimeout(() => {
          setLogs((prev) => [
            ...prev,
            { text: "Reduciendo temperatura del modelo a 0.1 para precisión...", type: "info" },
            { text: "Optimizando índices en pgvector para búsquedas semánticas...", type: "info" },
            { text: "¡Optimización finalizada! Latencia promedio reducida en 14%.", type: "success" }
          ]);
        }, 1000);
        break;
      case "/deploy":
        setLogs([
          ...newLogs,
          { text: "Iniciando empaquetado de producción de Puna Tech...", type: "system" }
        ]);
        setTimeout(() => {
          setLogs((prev) => [
            ...prev,
            { text: "Compilando activos de Frontend mediante Vite...", type: "info" },
            { text: "Construyendo imagen de contenedor seguro Docker...", type: "info" },
            { text: "Desplegando servicio seguro de hosting en Google Cloud Run...", type: "info" },
            { text: "¡Despliegue completado! Servicio online en puerto 3000.", type: "success" }
          ]);
        }, 1200);
        break;
      case "/evaluate":
        setLogs([
          ...newLogs,
          { text: "[INFORMACIÓN DE AUDITORÍA NEURAL]", type: "system" },
          { text: "  Total registros analizados: 24,540", type: "info" },
          { text: "  Tasa de acierto del modelo RAG: 99.82%", type: "success" },
          { text: "  Milisegundos promedio por token generado: 18.5ms", type: "info" },
          { text: "  Fugas de contexto detectadas: 0 (Flujo de auditoría limpio)", type: "success" }
        ]);
        break;
      case "/clear":
        setLogs([{ text: "Type '/help' to see active terminal controls.", type: "system" }]);
        break;
      default:
        setLogs([
          ...newLogs,
          { text: `Comando '${input}' no reconocido.`, type: "error" },
          { text: "Prueba escribiendo '/help' para ver el listado de comandos.", type: "system" }
        ]);
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-28 md:pb-32 px-6 md:px-16 overflow-hidden">
        {/* Subtle cosmic background gradient */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: "radial-gradient(circle at 75% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)" }}></div>
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ background: "radial-gradient(circle at 25% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)" }}></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Copy block */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 hover:border-white/20 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">
                Software Factory &amp; AI Solutions
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-extralight text-white leading-none uppercase tracking-tight">
              Desarrollo de Software B2B <br />
              <span className="font-normal text-white">
                &amp; Inteligencia Artificial
              </span> <br />
              <span className="font-light text-white/50">a Medida.</span>
            </h1>

            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl font-light">
              Diseñamos infraestructuras B2B, automatizamos pipelines operativos y construimos agentes de IA para agencias y empresas que necesitan escalar su facturación sin multiplicar su personal.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <button
                data-cal-link="puna-tech-r7xi5x/15min"
                data-cal-config='{"layout":"month_view"}'
                className="w-full sm:w-auto px-8 py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white font-bold text-xs tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Agendar Auditoría Gratuita
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="font-mono text-[10px] text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-white/60" />
                Sin compromiso de contratación
              </span>
            </div>
          </div>

          {/* Right Interactive Console block */}
          <div className="lg:col-span-5 h-[360px] md:h-[420px] relative">
            <div className="absolute inset-0 rounded-lg overflow-hidden flex flex-col border border-white/10 bg-[#0d0d0d] shadow-2xl">
              <div className="h-10 border-b border-white/10 bg-white/5 flex items-center justify-between px-4 gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                  <span className="font-mono text-[9px] text-white/40 ml-2 tracking-wider">sys_process_monitor.sh</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/40 font-mono text-[9px] uppercase tracking-wider">
                  <Terminal className="w-3 h-3 text-white/60" />
                  <span>Interactive Shell</span>
                </div>
              </div>

              <div ref={logsContainerRef} className="flex-grow p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2">
                {logs.map((log, idx) => {
                  let style = "text-white/50 font-light";
                  if (log.type === "success") style = "text-white/80 font-semibold";
                  if (log.type === "error") style = "text-red-400";
                  if (log.type === "system") style = "text-white font-bold";
                  if (log.type === "input") style = "text-white/70 italic font-light";

                  return (
                    <div key={idx} className={style}>
                      {log.text}
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleCommand}
                className="h-12 border-t border-white/10 bg-black flex items-center px-3 gap-2 shrink-0"
              >
                <span className="text-white/40 font-mono text-xs font-bold shrink-0">$</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un comando... (ej: /help, /status)"
                  className="flex-grow bg-transparent text-white font-mono text-xs border-none focus:outline-none placeholder-white/20 focus:ring-0"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
                  aria-label="Ejecutar"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default Hero;
