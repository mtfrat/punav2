/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  Laptop,
  MessageSquareText,
  Brain,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  Rocket,
  Flame,
  ChevronRight,
  Mail,
  Calendar,
  Code
} from "lucide-react";
import { SERVICES, METHODOLOGY, BLOG_ARTICLES } from "./data";
import { ServiceItem, BlogArticle } from "./types";

// Import custom interactive sub-components
import TopNavBar from "./components/TopNavBar";
import ServiceModal from "./components/ServiceModal";
import ProjectEstimator from "./components/ProjectEstimator";
import DemoModal from "./components/DemoModal";
import BlogDrawer from "./components/BlogDrawer";
import TerminalConsole from "./components/TerminalConsole";

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeMethodology, setActiveMethodology] = useState(1);

  return (
    <div className="bg-[#050505] min-h-screen text-[#f5f5f5] font-sans antialiased selection:bg-white/10 selection:text-white flex flex-col">
      {/* 1. Header Navigation */}
      <TopNavBar onOpenDemo={() => setDemoModalOpen(true)} />

      {/* 2. Main Content */}
      <main className="flex-grow pt-16">
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
                Transformamos tus ideas en productos digitales robustos. Desarrollamos plataformas web corporativas, asistentes cognitivos inteligentes y arquitecturas multi-agente de IA para escalar el rendimiento de tu negocio.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
                <button
                  onClick={() => setDemoModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white font-bold text-xs tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Agendar Sesión Gratuita
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
              <TerminalConsole />
            </div>
          </div>
        </section>

        {/* TRUSTED BY LOGO RAIL */}
        <section className="py-10 border-y border-white/10 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-center">
            <p className="font-mono text-[9px] text-white/40 mb-6 uppercase tracking-widest text-center">
              CONFIADO POR LÍDERES EN TECNOLOGÍA, LOGÍSTICA Y SOLUCIONES EMPRESARIALES
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-white/80 tracking-wider uppercase">
                <Layers className="w-5 h-5 text-white/60" /> TechCorp
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-white/80 tracking-wider uppercase">
                <Flame className="w-5 h-5 text-white/60" /> GlobalLog
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-white/80 tracking-wider uppercase">
                <Sparkles className="w-5 h-5 text-white/60" /> NexusSystems
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-white/80 tracking-wider uppercase">
                <Rocket className="w-5 h-5 text-white/60" /> DataFlow
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES BENTO-GRID */}
        <section id="servicios" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
                Soluciones B2B Escalables
              </span>
              <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
                Nuestros Servicios
              </h2>
              <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
                Proporcionamos ingeniería y automatización de extremo a extremo diseñadas para empresas que buscan expandirse sin multiplicar costos operativos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SERVICES.map((srv) => {
                let srvIcon = <Laptop className="w-6 h-6 text-white" />;
                if (srv.icon === "MessageSquareText")
                  srvIcon = <MessageSquareText className="w-6 h-6 text-white" />;
                if (srv.icon === "Brain")
                  srvIcon = <Brain className="w-6 h-6 text-white" />;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className="group bg-[#0d0d0d] border border-white/10 rounded-lg p-6 hover:border-white/30 hover:bg-[#121212] transition-all duration-300 cursor-pointer flex flex-col justify-between h-80 relative overflow-hidden"
                  >
                    <div>
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                        {srvIcon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide group-hover:text-white/80 transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-xs md:text-sm text-white/50 leading-relaxed line-clamp-3 font-light">
                        {srv.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 group-hover:text-white transition-colors pt-4 border-t border-white/5 mt-4">
                      <span>Ver Detalles</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* METHODOLOGY SECTION */}
        <section id="metodologia" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
                Iteración y Rigor Técnico
              </span>
              <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
                Nuestra Metodología
              </h2>
              <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
                Un proceso de ingeniería ágil y estructurado para llevar tu negocio desde un análisis inicial hasta la automatización en producción con total confianza.
              </p>
            </div>

            {/* Interactive Grid Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Selector Tab Columns */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {METHODOLOGY.map((step) => (
                  <button
                    key={step.number}
                    onClick={() => setActiveMethodology(step.number)}
                    className={`text-left p-4 rounded-lg border flex items-center gap-4 transition-all duration-300 ${
                      activeMethodology === step.number
                        ? "bg-white/5 border-white"
                        : "bg-transparent border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors shrink-0 ${
                        activeMethodology === step.number
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/50 border border-white/10"
                      }`}
                    >
                      0{step.number}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white uppercase tracking-wider text-xs md:text-sm leading-none mb-1">
                        {step.title}
                      </h4>
                      <p className="text-xs text-white/40 line-clamp-1 font-light">{step.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Detail Content Box */}
              <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-lg p-6 md:p-8 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/60 font-mono text-xs uppercase tracking-widest">
                    <Check className="w-4 h-4 text-white" />
                    <span>Fase {activeMethodology} del Proceso Técnico</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-light uppercase tracking-wide text-white">
                    {METHODOLOGY[activeMethodology - 1].title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    {METHODOLOGY[activeMethodology - 1].details}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-wider">
                  <span>Hito:</span>
                  <span className="text-white">{METHODOLOGY[activeMethodology - 1].timelineContribution}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI PROJECT ESTIMATOR COMPONENT */}
        <ProjectEstimator />

        {/* RESULTS AND STATS */}
        <section id="casos" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
                Métricas Reales de Rendimiento
              </span>
              <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
                Resultados Tangibles
              </h2>
              <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
                Habilitamos optimizaciones de nivel de producción corporativa en flujos de trabajo B2B exigentes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 flex flex-col justify-between h-48 relative overflow-hidden">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-1">
                    6 - 8 Semanas
                  </h3>
                  <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold mb-1">Tiempo promedio de entrega (MVP)</p>
                  <p className="text-[11px] text-white/40 font-light">Tiempo óptimo de salida al mercado para soluciones integrales.</p>
                </div>
              </div>

              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 flex flex-col justify-between h-48 relative overflow-hidden">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-1">
                    150+
                  </h3>
                  <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold mb-1">Integraciones de APIs y Sistemas</p>
                  <p className="text-[11px] text-white/40 font-light">Ecosistemas conectados de forma segura con base de datos robusta.</p>
                </div>
              </div>

              <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 flex flex-col justify-between h-48 relative overflow-hidden">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-1">
                    99.9%
                  </h3>
                  <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold mb-1">SLA de Uptime Garantizado</p>
                  <p className="text-[11px] text-white/40 font-light">Alta disponibilidad automatizada en la nube con Cloud Run.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BLOG AND INSIGHTS */}
        <section id="blog" className="py-24 px-6 md:px-16 bg-[#050505] border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase block">
                  Artículos Técnicos &amp; Casos de Estudio
                </span>
                <h2 className="text-3xl md:text-5xl font-extralight uppercase text-white tracking-tight">
                  Insights &amp; Visión
                </h2>
                <p className="text-white/60 text-sm md:text-base max-w-xl leading-relaxed font-light">
                  Perspectivas sobre el impacto de la Inteligencia Artificial en los negocios y el futuro del desarrollo de software B2B.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BLOG_ARTICLES.map((article) => (
                <article
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden hover:border-white/30 hover:bg-[#121212] transition-all duration-300 cursor-pointer flex flex-col h-[400px]"
                >
                  {/* Banner image wrapper */}
                  <div className="h-44 overflow-hidden relative shrink-0 border-b border-white/5">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#050505]/20"></div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 bg-white text-black rounded-[4px] text-[9px] font-mono font-bold uppercase tracking-widest">
                        {article.category}
                      </span>
                      <h3 className="text-base font-semibold uppercase tracking-wide text-white group-hover:text-white/80 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-white/50 leading-relaxed line-clamp-3 font-light">
                        {article.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/40 group-hover:text-white transition-colors pt-3 border-t border-white/5 mt-4">
                      <span>Leer artículo</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <footer className="w-full pt-16 pb-8 bg-[#050505] border-t border-white/10 text-xs text-white/50 font-light">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base uppercase tracking-widest">
              <span>PUNA <span className="font-light opacity-50">TECH</span></span>
            </div>
            <p className="leading-relaxed">
              Software Factory B2B. Transformando ideas complejas de negocios en soluciones ágiles y robustas con Inteligencia Artificial.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col space-y-3">
            <span className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1">Compañía</span>
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#metodologia" className="hover:text-white transition-colors">Metodología</a>
            <a href="#estimador" className="hover:text-white transition-colors">Cotizador Inteligente</a>
            <a href="#casos" className="hover:text-white transition-colors">Casos de Éxito</a>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col space-y-3">
            <span className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1">Legal</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacidad</span>
            <span className="hover:text-white transition-colors cursor-pointer">Términos de Servicio</span>
            <span className="hover:text-white transition-colors cursor-pointer">Cookies</span>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col space-y-3">
            <span className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1">Contacto</span>
            <a href="mailto:info@puna-tech.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-white/60" /> info@puna-tech.com
            </a>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="flex items-center gap-2 hover:text-white transition-colors text-left font-light"
            >
              <Calendar className="w-4 h-4 text-white/60" /> Agendar Llamada de Descubrimiento
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 PUNA TECH. Todos los derechos reservados.</p>
          <p className="font-mono text-[9px] text-white/30 tracking-widest uppercase">
            ESTABLISHED IN SYSTEM 01 / POWERED BY GEMINI
          </p>
        </div>
      </footer>

      {/* 4. MODALS & DRAWERS OVERLAYS */}
      {selectedService && (
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}

      {selectedArticle && (
        <BlogDrawer article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      {demoModalOpen && (
        <DemoModal onClose={() => setDemoModalOpen(false)} />
      )}
    </div>
  );
}
