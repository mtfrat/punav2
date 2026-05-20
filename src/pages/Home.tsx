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
import ROICalculator from '../components/ui/ROICalculator';


export default function Home() {
  return (
    <div className="min-h-screen bg-white font-body selection:bg-foreground selection:text-background">
      <SEOTags 
        title="Puna Tech | Sistemas Agénticos de IA y Software B2B Personalizado"
        description="Desarrollamos sistemas agénticos de IA y soluciones de software personalizadas que automatizan flujos complejos de extremo a extremo. Elevamos la eficiencia y escalabilidad de tu empresa."
        keywords="agentes de ia, AI agent development, custom software solutions, agentic automation, machine learning consulting, automatización b2b, software a medida, puna tech"
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
          "description": "Desarrollamos sistemas agénticos de IA y soluciones de software personalizadas que automatizan flujos complejos de extremo a extremo. Elevamos la eficiencia y la escalabilidad operativa.",
          "knowsAbout": [
            "AI agent development",
            "custom software solutions",
            "agentic automation",
            "machine learning consulting",
            "intelligent workflows",
            "multi-agent orchestration"
          ]
        }}
      />
      <Navbar />
      <main role="main" className="overflow-x-hidden">
        <Hero />
        <About />
        <Services />
        <TechStack />
        <ROICalculator />
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
