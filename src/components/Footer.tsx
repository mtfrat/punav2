import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight, BookOpen } from 'lucide-react';
import Logo from './Logo';
import LegalModal from './ui/LegalModal';

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Footer = () => {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const openLegal = (tab: 'privacy' | 'terms', e: React.MouseEvent) => {
    e.preventDefault();
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const footerLinks = {
    navegacion: [
      { label: 'Nosotros', href: '/#about' },
      { label: 'Servicios', href: '/#services' },
      { label: 'Contacto', href: '/#contact' },
    ],
    recursos: [
      { label: 'Diario (Blog)', href: '/blog', isRoute: true },
      { label: 'Preguntas Frecuentes', href: '/#faq' },
    ],
  };

  const socialLinks = [
    { icon: <LinkedinIcon />, href: 'https://linkedin.com/company/puna-tech', label: 'LinkedIn', external: true },
    { icon: <InstagramIcon />, href: 'https://instagram.com/puna.tech', label: 'Instagram', external: true },
    { icon: <BookOpen size={18} />, href: '/blog', label: 'Blog', external: false },
  ];

  return (
    <>
      <footer id="footer" className="bg-[#3D2E1F] text-[#FFF2E1]/80 relative overflow-hidden">
        {/* Wave divider */}
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 26C672 32 768 40 864 42C960 44 1056 40 1152 34C1248 28 1344 20 1392 16L1440 12V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V60Z" fill="white" />
          </svg>
        </div>

        <div className="w-full max-w-none mx-auto px-4 sm:px-8 md:px-12 2xl:px-20 pt-24 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link 
                to="/" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center space-x-3 mb-6 group"
              >
                <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                   <Logo variant="white" />
                </div>
                <div className="text-xl tracking-tight text-[#FFF2E1] font-body font-bold">
                  Puna Tech<sup className="text-[10px] opacity-40">®</sup>
                </div>
              </Link>
              <p className="text-sm leading-relaxed mb-6 max-w-xs opacity-70">
                Potenciando empresas con soluciones de software inteligentes e infraestructura escalable.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) =>
                  social.external ? (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-9 h-9 rounded-lg bg-[#FFF2E1]/10 flex items-center justify-center hover:bg-primary/30 hover:text-primary transition-all duration-300"
                    >
                      {social.icon}
                    </a>
                  ) : (
                    <Link
                      key={social.label}
                      to={social.href}
                      aria-label={social.label}
                      className="w-9 h-9 rounded-lg bg-[#FFF2E1]/10 flex items-center justify-center hover:bg-primary/30 hover:text-primary transition-all duration-300"
                    >
                      {social.icon}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Navegación Column */}
            <div>
              <h4 className="text-sm font-bold text-[#FFF2E1] uppercase tracking-wider mb-5">Navegación</h4>
              <ul className="space-y-3">
                {footerLinks.navegacion.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm hover:text-primary transition-colors duration-200 flex items-center gap-1 group py-2">
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recursos Column */}
            <div>
              <h4 className="text-sm font-bold text-[#FFF2E1] uppercase tracking-wider mb-5">Recursos</h4>
              <ul className="space-y-3">
                {footerLinks.recursos.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link to={link.href} className="text-sm hover:text-primary transition-colors duration-200 flex items-center gap-1 group py-2">
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm hover:text-primary transition-colors duration-200 flex items-center gap-1 group py-2">
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Column */}
            <div>
              <h4 className="text-sm font-bold text-[#FFF2E1] uppercase tracking-wider mb-5">¿Listo para escalar?</h4>
              <p className="text-sm opacity-70 mb-5">
                Agendá tu auditoría gratuita y descubrí cómo automatizar tu crecimiento.
              </p>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Mail size={16} />
                Contactar
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#FFF2E1]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs opacity-50">
              © {new Date().getFullYear()} Puna Tech. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a 
                href="#" 
                onClick={(e) => openLegal('privacy', e)} 
                className="text-xs opacity-50 hover:opacity-100 hover:text-primary transition-all py-2"
              >
                Política de Privacidad
              </a>
              <a 
                href="#" 
                onClick={(e) => openLegal('terms', e)} 
                className="text-xs opacity-50 hover:opacity-100 hover:text-primary transition-all py-2"
              >
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={isLegalOpen} 
        onClose={() => setIsLegalOpen(false)} 
        initialTab={legalTab} 
      />
    </>
  );
};

export default Footer;
