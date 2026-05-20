import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import TechStack from '../components/TechStack';
import Testimonials from '../components/Testimonials';
import Blog from '../components/Blog';
import FAQ from '../components/FAQ';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';
import SEOTags from '../components/SEO/SEOTags';


export default function Home() {
  return (
    <div className="min-h-screen bg-white font-body selection:bg-foreground selection:text-background">
      <SEOTags 
        title="Puna Tech | Escalá tu Negocio B2B con Agentes de IA y Automatización"
        description="Especialistas en ingeniería de automatización y GTM. Creamos agentes de IA personalizados para multiplicar tus ventas y liberar tu tiempo."
        keywords="agentes de ia, automatización de ventas, infraestructura de crecimiento, b2b scaling, ai agents argentina, prospección automatizada, clay automation, n8n expert"
        customSchema={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Puna Tech",
          "image": "https://puna-tech.com/darkLogo.png",
          "@id": "https://puna-tech.com/#organization",
          "url": "https://puna-tech.com/",
          "telephone": "",
          "priceRange": "$$$",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AR"
          },
          "sameAs": [
            "https://linkedin.com/company/puna-tech",
            "https://instagram.com/puna.tech"
          ],
          "description": "Especialistas en ingeniería de automatización y GTM. Creamos agentes de IA personalizados para multiplicar tus ventas y liberar tu tiempo."
        }}
      />
      <Navbar />
      <main role="main" className="overflow-x-hidden">
        <Hero />
        <About />
        <Services />
        <TechStack />
        <Testimonials />
        <Blog />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
