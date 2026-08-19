import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';

const NavbarEn = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/en" className="flex items-center gap-2 text-white font-bold text-xl uppercase tracking-widest relative z-50">
          <span>PUNA <span className="font-light opacity-50">TECH</span></span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('servicios')} className="text-[11px] font-semibold text-white/60 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">
            Services
          </button>
          <button onClick={() => scrollToSection('metodologia')} className="text-[11px] font-semibold text-white/60 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">
            Methodology
          </button>

          <button onClick={() => scrollToSection('casos')} className="text-[11px] font-semibold text-white/60 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">
            Success Cases
          </button>
          <Link to="/blog" className="text-[11px] font-semibold text-white/60 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">
            Blog
          </Link>

          {/* Lang selector */}
          <div className="flex items-center gap-2 border-l border-white/20 pl-4 ml-2">
            <Link to="/es" className="text-[11px] font-semibold text-white/60 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">ES</Link>
            <span className="text-white/40">/</span>
            <span className="text-[11px] font-semibold text-white uppercase tracking-widest cursor-default">EN</span>
          </div>

          <button 
            data-cal-link="puna-tech-r7xi5x/15min" 
            data-cal-config='{"layout":"month_view"}' 
            className="flex items-center gap-2 px-5 py-2.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 ml-4 cursor-pointer"
          >
            Book Free Audit
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden text-white relative z-50 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-[#050505] z-40 transition-transform duration-500 ease-in-out flex flex-col items-center justify-center gap-8 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <button onClick={() => scrollToSection('servicios')} className="text-2xl font-light text-white uppercase tracking-widest cursor-pointer">
          Services
        </button>
        <button onClick={() => scrollToSection('metodologia')} className="text-2xl font-light text-white uppercase tracking-widest cursor-pointer">
          Methodology
        </button>

        <button onClick={() => scrollToSection('casos')} className="text-2xl font-light text-white uppercase tracking-widest cursor-pointer">
          Success Cases
        </button>
        <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-light text-white uppercase tracking-widest cursor-pointer">
          Blog
        </Link>
        <div className="flex gap-6 mt-4">
          <Link to="/es" className="text-lg font-light text-white/60 uppercase tracking-widest">ES</Link>
          <span className="text-lg font-light text-white uppercase tracking-widest border-b border-white">EN</span>
        </div>
        <button 
          data-cal-link="puna-tech-r7xi5x/15min" 
          data-cal-config='{"layout":"month_view"}'
          className="mt-8 px-8 py-4 border border-white text-white hover:bg-white hover:text-black text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer"
        >
          Book Free Audit
        </button>
      </div>
    </nav>
  );
};

export default NavbarEn;
