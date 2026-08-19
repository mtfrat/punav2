import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, ArrowRight, ShieldCheck, Layers, Flame, Sparkles, Rocket } from "lucide-react";

const HeroEn = () => {
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
      "Billing Agent: Analyzing new customs provider PDF invoice...",
      "API Service: Ping received on /api/health - latency 12ms [OK]",
      "RAG Vector DB: Indexing 4 new corporate blog articles...",
      "Evaluator Agent: Validating conversational response compliance...",
      "Google Cloud Run: Scaling container on port 3000..."
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
          { text: "--- AVAILABLE PUNA TECH TERMINAL COMMANDS ---", type: "system" },
          { text: "  /status     - Check memory, CPU, and agent status.", type: "info" },
          { text: "  /optimize   - Run an animated DB optimization flow.", type: "info" },
          { text: "  /deploy     - Simulate MVP deployment on Cloud Run.", type: "info" },
          { text: "  /evaluate   - Audit cognitive pipeline performance.", type: "info" },
          { text: "  /clear      - Clear the console screen.", type: "info" }
        ]);
        break;
      case "/status":
        setLogs([
          ...newLogs,
          { text: "[CORPORATE SYSTEM ACTIVE]", type: "system" },
          { text: "  CPU Usage: 1.8% (Optimized for low cost)", type: "info" },
          { text: "  RAM Memory: 1.4GB / 16GB", type: "info" },
          { text: "  Active AI Agents: 3 (Billing, Support, Reconciler)", type: "success" },
          { text: "  API Uptime SLA: 99.98% - Overall status: EXCELLENT", type: "success" }
        ]);
        break;
      case "/optimize":
        setLogs([
          ...newLogs,
          { text: "Initiating overall optimization...", type: "system" }
        ]);
        setTimeout(() => {
          setLogs((prev) => [
            ...prev,
            { text: "Reducing model temperature to 0.1 for precision...", type: "info" },
            { text: "Optimizing pgvector indexes for semantic search...", type: "info" },
            { text: "Final optimization complete! Average latency reduced by 14%.", type: "success" }
          ]);
        }, 1000);
        break;
      case "/deploy":
        setLogs([
          ...newLogs,
          { text: "Initiating Puna Tech production build...", type: "system" }
        ]);
        setTimeout(() => {
          setLogs((prev) => [
            ...prev,
            { text: "Compiling Frontend assets via Vite...", type: "info" },
            { text: "Building secure Docker container image...", type: "info" },
            { text: "Deploying secure hosting service on Google Cloud Run...", type: "info" },
            { text: "Deployment complete! Service online on port 3000.", type: "success" }
          ]);
        }, 1200);
        break;
      case "/evaluate":
        setLogs([
          ...newLogs,
          { text: "[NEURAL AUDIT INFORMATION]", type: "system" },
          { text: "  Total records analyzed: 24,540", type: "info" },
          { text: "  RAG model hit rate: 99.82%", type: "success" },
          { text: "  Average milliseconds per generated token: 18.5ms", type: "info" },
          { text: "  Context leaks detected: 0 (Clean audit flow)", type: "success" }
        ]);
        break;
      case "/clear":
        setLogs([{ text: "Type '/help' to see active terminal controls.", type: "system" }]);
        break;
      default:
        setLogs([
          ...newLogs,
          { text: `Command '${input}' not recognized.`, type: "error" },
          { text: "Try typing '/help' to see the command list.", type: "system" }
        ]);
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-28 md:pb-32 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: "radial-gradient(circle at 75% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)" }}></div>
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ background: "radial-gradient(circle at 25% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)" }}></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 hover:border-white/20 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">
                Software Factory &amp; AI Solutions
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-extralight text-white leading-none uppercase tracking-tight">
              B2B Software Engineering <br />
              <span className="font-normal text-white">
                &amp; Custom Artificial
              </span> <br />
              <span className="font-light text-white/50">Intelligence.</span>
            </h1>

            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl font-light">
              We transform your ideas into robust digital products. We develop corporate web platforms, intelligent cognitive assistants, and multi-agent AI architectures to scale your business performance.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <button
                data-cal-link="puna-tech-r7xi5x/15min"
                data-cal-config='{"layout":"month_view"}'
                className="w-full sm:w-auto px-8 py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white font-bold text-xs tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Book Free Audit
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="font-mono text-[10px] text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-white/60" />
                No hiring commitment
              </span>
            </div>
          </div>

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
                  placeholder="Type a command... (ex: /help, /status)"
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

export default HeroEn;
