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
        title="Puna Tech | AI Automation and Agents for B2B Companies"
        description="Puna Tech builds AI agents and autonomous workflows that automate complex B2B processes. More results, less operational friction."
        keywords="AI automation, AI agents, B2B AI agents, process automation, agentic workflows, custom software, Buenos Aires"
        lang="en"
        locale="en_US"
        canonicalUrl="https://www.puna-tech.com/en"
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
