import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Methodology from '../components/Methodology';
import Estimator from '../components/Estimator';
import Results from '../components/Results';
import BlogHome from '../components/BlogHome';
import Footer from '../components/Footer';
import SEOTags from '../components/SEO/SEOTags';
import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <>
      <SEOTags 
        title="Puna Tech | Automatización con IA y Agentes para Empresas B2B"
        description="Puna Tech construye agentes de IA y flujos de trabajo autónomos que automatizan procesos complejos B2B. Más resultados, menos fricciones operativas."
        keywords="automatización con IA, agentes de IA, AI agents B2B, automatización de procesos, agentic workflows, GTM automatizado, software personalizado, Buenos Aires"
        customSchema={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Puna Tech",
          "image": "https://www.puna-tech.com/darkLogo.png",
          "@id": "https://www.puna-tech.com/#organization",
          "url": "https://www.puna-tech.com/",
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
      <main className="flex-grow pt-16">
        <Hero />
        <Services />
        <Methodology />
        <Estimator />
        <Results />
        <BlogHome />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
