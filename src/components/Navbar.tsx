import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"ES" | "EN">("ES");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#050505]/95 backdrop-blur-md py-3 shadow-md border-white/10"
          : "bg-transparent py-5 border-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-16 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 select-none">
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-widest text-white leading-none uppercase">
              PUNA <span className="font-light opacity-50">TECH</span>
            </span>
            <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase mt-1">
              AI FACTORY / V.04
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("servicios")}
            className="text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Servicios
          </button>
          <button
            onClick={() => scrollToSection("metodologia")}
            className="text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Metodología
          </button>
          <button
            onClick={() => scrollToSection("estimador")}
            className="text-xs font-semibold uppercase tracking-wider text-white hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/25 cursor-pointer"
          >
            Solicita tu presupuesto
          </button>
          <button
            onClick={() => scrollToSection("casos")}
            className="text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Casos de Éxito
          </button>
          <Link
            to="/blog"
            className="text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Blog
          </Link>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-6 ml-2 text-xs font-bold text-white/40">
            <Globe className="w-3.5 h-3.5 text-white/40" />
            <button
              onClick={() => setLang("ES")}
              className={`hover:text-white transition-colors uppercase cursor-pointer ${
                lang === "ES" ? "text-white" : ""
              }`}
            >
              ES
            </button>
            <span className="text-white/20">/</span>
            <Link
              to="/en"
              className={`hover:text-white transition-colors uppercase cursor-pointer ${
                lang === "EN" ? "text-white" : ""
              }`}
            >
              EN
            </Link>
          </div>
        </div>

        {/* Action Button & Menu Icon */}
        <div className="flex items-center gap-4">
          <button
            data-cal-link="puna-tech-r7xi5x/15min"
            data-cal-config='{"layout":"month_view"}'
            className="hidden md:block px-6 py-2.5 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white font-semibold text-xs tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer"
          >
            Agendar Demo
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#050505] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-fade-in">
          <button
            onClick={() => scrollToSection("servicios")}
            className="text-sm uppercase tracking-wider font-semibold text-white/60 py-2 border-b border-white/5 text-left cursor-pointer"
          >
            Servicios
          </button>
          <button
            onClick={() => scrollToSection("metodologia")}
            className="text-sm uppercase tracking-wider font-semibold text-white/60 py-2 border-b border-white/5 text-left cursor-pointer"
          >
            Metodología
          </button>
          <button
            onClick={() => scrollToSection("estimador")}
            className="text-sm uppercase tracking-wider font-semibold text-white py-2 border-b border-white/5 text-left cursor-pointer"
          >
            Solicita tu presupuesto
          </button>
          <button
            onClick={() => scrollToSection("casos")}
            className="text-sm uppercase tracking-wider font-semibold text-white/60 py-2 border-b border-white/5 text-left cursor-pointer"
          >
            Casos de Éxito
          </button>
          <Link
            to="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm uppercase tracking-wider font-semibold text-white/60 py-2 border-b border-white/5 text-left cursor-pointer"
          >
            Blog / Insights
          </Link>

          <div className="flex justify-between items-center py-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/40">Idioma / Language</span>
            <div className="flex gap-2">
              <button
                onClick={() => setLang("ES")}
                className={`px-2 py-1 rounded text-xs font-bold uppercase cursor-pointer ${
                  lang === "ES" ? "bg-white text-black" : "text-white/60"
                }`}
              >
                ES
              </button>
              <Link
                to="/en"
                className={`px-2 py-1 rounded text-xs font-bold uppercase cursor-pointer ${
                  lang === "EN" ? "bg-white text-black" : "text-white/60"
                }`}
              >
                EN
              </Link>
            </div>
          </div>

          <button
            data-cal-link="puna-tech-r7xi5x/15min"
            data-cal-config='{"layout":"month_view"}'
            onClick={() => setMobileMenuOpen(false)}
            className="w-full mt-2 py-3 border border-white/30 hover:border-white hover:bg-white hover:text-black text-white font-bold text-xs tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer"
          >
            Agendar Demo de IA
          </button>
        </div>
      )}
    </nav>
  );
}
