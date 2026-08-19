import React from 'react';
import { Mail, Calendar } from "lucide-react";
import { Link } from 'react-router-dom';

const FooterEn = () => {
  return (
    <footer className="w-full pt-16 pb-8 bg-[#050505] border-t border-white/10 text-xs text-white/50 font-light mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Col 1 */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base uppercase tracking-widest">
            <span>PUNA <span className="font-light opacity-50">TECH</span></span>
          </div>
          <p className="leading-relaxed">
            B2B Software Factory. Transforming complex business ideas into agile and robust solutions with Artificial Intelligence.
          </p>
        </div>

        {/* Col 2 */}
        <div className="flex flex-col space-y-3">
          <span className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1">Company</span>
          <a href="/en#servicios" className="hover:text-white transition-colors">Services</a>
          <a href="/en#metodologia" className="hover:text-white transition-colors">Methodology</a>
          <a href="/en#estimador" className="hover:text-white transition-colors">Request a Quote</a>
          <a href="/en#casos" className="hover:text-white transition-colors">Success Cases</a>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>

        {/* Col 3 */}
        <div className="flex flex-col space-y-3">
          <span className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1">Social Networks</span>
          <a href="https://linkedin.com/company/puna-tech" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="https://instagram.com/puna.tech" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://x.com/punatechba" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">X</a>
        </div>

        {/* Col 4 */}
        <div className="flex flex-col space-y-3">
          <span className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1">Contact</span>
          <a href="mailto:punatechba@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="w-4 h-4 text-white/60" /> punatechba@gmail.com
          </a>
          <button
            data-cal-link="puna-tech-r7xi5x/15min"
            data-cal-config='{"layout":"month_view"}'
            className="flex items-center gap-2 hover:text-white transition-colors text-left font-light cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-white/60" /> Book Free Audit
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 PUNA TECH. All rights reserved.</p>
        <p className="font-mono text-[9px] text-white/30 tracking-widest uppercase">
          PUNA TECH © 2026 / SOFTWARE FACTORY
        </p>
      </div>
    </footer>
  );
};

export default FooterEn;
