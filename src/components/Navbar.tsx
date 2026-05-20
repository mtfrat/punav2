import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '/#' },
    { name: 'Nosotros', href: '/#about' },
    { name: 'Servicios', href: '/#services' },
    { name: 'Blog', href: '/#blog' },
  ];

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-8 md:px-12 2xl:px-20"
      >
        <div className="w-full max-w-none mx-auto bg-white rounded-b-[2.5rem] shadow-2xl shadow-black/5 px-6 sm:px-10 py-4 flex flex-row justify-between items-center">
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
               <Logo />
            </div>
            <div className="text-xl tracking-tight text-foreground font-body font-bold hidden sm:block">
              Puna Tech
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="text-[14px] text-foreground/50 hover:text-foreground transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </nav>
   
          <div className="flex items-center gap-4">
            <a 
              href="/#contact"
              className="hidden sm:block bg-foreground text-white font-bold rounded-full px-8 py-3 text-[14px] hover:bg-foreground/90 transition-all duration-300 shadow-lg shadow-foreground/10"
            >
              Contacto
            </a>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              className="absolute top-24 left-4 right-4 bg-white rounded-[2rem] shadow-2xl p-8 flex flex-col space-y-6"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-body font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="/#contact"
                onClick={() => setIsOpen(false)}
                className="w-full bg-foreground text-white text-center font-body font-bold rounded-full py-4 text-lg"
              >
                Contacto
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
