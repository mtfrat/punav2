import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Methodology from '../components/Methodology';
import Estimator from '../components/Estimator';
import Pricing from '../components/Pricing';
import Portfolio from '../components/Portfolio';
import Results from '../components/Results';
import BlogHome from '../components/BlogHome';
import Footer from '../components/Footer';
import SEOTags from '../components/SEO/SEOTags';
import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <>
      <SEOTags 
        title="[2026] Puna Tech | Agentes de IA y Arquitectura B2B"
        description="Construimos agentes autónomos de IA y software B2B de alto rendimiento. Reducción del 80% en tiempos operativos y 99.8% de precisión en automatización."
        keywords="automatización con IA, agentes de IA, AI agents B2B, agentic workflows, software personalizado, Buenos Aires, Gemini 3.5, LangChain"
        canonicalUrl="https://www.puna-tech.com/"
        lang="es"
        locale="es_AR"
        customSchema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ProfessionalService",
              "@id": "https://www.puna-tech.com/#organization",
              "name": "Puna Tech",
              "url": "https://www.puna-tech.com/",
              "logo": "https://www.puna-tech.com/profile-picture.png",
              "image": "https://www.puna-tech.com/og-image.png",
              "description": "Agencia especializada en agentes autónomos de IA, automatización de procesos B2B y desarrollo de software a medida.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Buenos Aires",
                "addressCountry": "AR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "punatechba@gmail.com",
                "contactType": "customer service",
                "availableLanguage": ["Spanish", "English"]
              },
              "sameAs": [
                "https://www.linkedin.com/company/puna-tech"
              ],
              "knowsAbout": [
                "Artificial Intelligence Agents",
                "Generative Engine Optimization",
                "B2B Automation Workflows",
                "Enterprise RAG Vector Databases",
                "Gemini 3.5 Flash Integration"
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://www.puna-tech.com/#website",
              "url": "https://www.puna-tech.com/",
              "name": "Puna Tech",
              "publisher": {
                "@id": "https://www.puna-tech.com/#organization"
              },
              "inLanguage": "es"
            },
            {
              "@type": "FAQPage",
              "@id": "https://www.puna-tech.com/#faq",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Qué es un Agente de IA autónomo para empresas B2B?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Un agente de IA autónomo es un sistema de software que utiliza modelos de lenguaje (como Gemini 3.5) para planificar, tomar decisiones y ejecutar secuencias de tareas operativas complejas (extracción de facturas, consultas SQL, validaciones fiscales) integrándose directamente con ERPs y APIs corporativas."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cuánto tiempo toma implementar un flujo automatizado con Puna Tech?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Nuestras implementaciones se entregan mediante metodología ágil. Un Producto Mínimo Viable (MVP) funcional se desarrolla en un periodo de 3 a 6 semanas con impacto medible inmediato en ROI."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cómo garantizan que la IA no cometa errores en tareas financieras?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Implementamos arquitectura Human-in-the-Loop (HITL) con validaciones cruzadas. Si la certeza del agente es menor al 90% o supera un monto crítico, el sistema pausa la ejecución y genera una alerta de revisión humana."
                  }
                }
              ]
            }
          ]
        }}
      />
      <Navbar />
      <main className="flex-grow pt-16">
        <Hero />
        <Services />
        <Portfolio />
        <Methodology />
        <Estimator />
        <Pricing />
        <Results />
        <BlogHome />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
