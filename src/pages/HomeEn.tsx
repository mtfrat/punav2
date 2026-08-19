import React from 'react';
import NavbarEn from '../components/en/NavbarEn';
import HeroEn from '../components/en/HeroEn';
import ServicesEn from '../components/en/ServicesEn';
import MethodologyEn from '../components/en/MethodologyEn';
import EstimatorEn from '../components/en/EstimatorEn';
import ResultsEn from '../components/en/ResultsEn';
import BlogHomeEn from '../components/en/BlogHomeEn';
import FooterEn from '../components/en/FooterEn';
import SEOTags from '../components/SEO/SEOTags';
import Chatbot from '../components/Chatbot';

export default function HomeEn() {
  return (
    <>
      <SEOTags 
        title="[2026] Puna Tech | B2B AI Agents & Systems Architecture"
        description="We build production-grade autonomous AI agents and enterprise software. 80% operational time reduction and 99.8% precision."
        keywords="AI automation, AI agents, B2B AI agents, process automation, agentic workflows, custom software, Gemini 3.5, LangChain"
        lang="en"
        locale="en_US"
        canonicalUrl="https://www.puna-tech.com/"
        customSchema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ProfessionalService",
              "@id": "https://www.puna-tech.com/en#organization",
              "name": "Puna Tech",
              "url": "https://www.puna-tech.com/en",
              "logo": "https://www.puna-tech.com/profile-picture.png",
              "image": "https://www.puna-tech.com/og-image.png",
              "description": "Specialized engineering agency for autonomous AI agents, enterprise B2B workflow automation, and custom web software.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Buenos Aires",
                "addressCountry": "AR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "punatechba@gmail.com",
                "contactType": "customer service",
                "availableLanguage": ["English", "Spanish"]
              },
              "sameAs": [
                "https://www.linkedin.com/company/puna-tech"
              ]
            },
            {
              "@type": "FAQPage",
              "@id": "https://www.puna-tech.com/en#faq",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is an autonomous B2B AI agent?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "An autonomous B2B AI agent is a specialized software system powered by models like Gemini 3.5 that plans and executes complex operational tasks—such as invoice extraction, SQL database queries, and fiscal validation—integrating directly with ERPs and APIs."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How quickly can Puna Tech deploy an automated workflow?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We deliver a production-ready Minimum Viable Product (MVP) within 3 to 6 weeks, driving measurable operational efficiency and rapid ROI."
                  }
                }
              ]
            }
          ]
        }}
      />
      <NavbarEn />
      <main className="flex-grow pt-16">
        <HeroEn />
        <ServicesEn />
        <MethodologyEn />
        <EstimatorEn />
        <ResultsEn />
        <BlogHomeEn />
      </main>
      <FooterEn />
      <Chatbot />
    </>
  );
}
