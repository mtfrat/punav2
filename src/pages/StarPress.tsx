import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Bot, BarChart3, Shield, QrCode, Globe } from 'lucide-react';
import NavbarEn from '../components/en/NavbarEn';
import FooterEn from '../components/en/FooterEn';
import SEOTags from '../components/SEO/SEOTags';

const features = [
  { icon: Star, title: 'Embed Reviews', desc: 'Paste your Google Maps link and get a beautiful widget for your website.' },
  { icon: Bot, title: 'AI Analysis', desc: 'Sentiment analysis, actionable insights, and social media copy.' },
  { icon: BarChart3, title: 'Weekly Reports', desc: 'AI-generated reputation summaries delivered to your inbox.' },
  { icon: Shield, title: 'Fake Review Detection', desc: 'AI analyzes suspicious reviews and generates dispute letters.' },
  { icon: QrCode, title: 'QR Feedback', desc: 'Collect feedback before it goes public. Route happy customers to Google.' },
  { icon: Globe, title: 'GBP Integration', desc: 'Sync directly with Google Business Profile. Reply to reviews from one place.' },
];

export default function StarPressPage() {
  return (
    <>
      <SEOTags
        title="StarPress - Turn Google Reviews Into Revenue"
        description="Embed Google Reviews on your website, get AI-powered insights, and grow your business. Free plan available."
        keywords="google reviews, review widget, AI review analysis, reputation management"
        lang="en"
        locale="en_US"
        canonicalUrl="https://www.puna-tech.com/products/starpress"
      />
      <NavbarEn />
      <main className="flex-grow pt-16">
        {/* Hero */}
        <section className="py-24 px-6 md:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#af4c24] border border-[#af4c24]/30 rounded-full mb-6">
              Puna Tech Product
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Turn Google Reviews Into <span className="text-[#af4c24]">Revenue</span>
            </h1>
            <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
              Embed reviews on your website, get AI-powered insights, and grow your business — all from a single platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://starpress.puna-tech.com/auth/signup"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-[#af4c24] hover:bg-[#af4c24]/90 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://starpress.puna-tech.com/pricing"
                className="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all"
              >
                View Pricing
              </a>
            </div>
            <p className="text-xs text-white/40 mt-4">Free plan · No credit card · Setup in 2 minutes</p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 md:px-16 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Everything you need</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f) => (
                <div key={f.title} className="p-6 border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
                  <f.icon className="w-8 h-8 text-[#af4c24] mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/50">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-6 md:px-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Simple pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 border border-white/10 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-1">$0</div>
                <p className="text-sm text-white/40 mb-6">forever</p>
                <ul className="space-y-3 text-sm text-white/60 mb-8">
                  <li>✓ 1 location</li>
                  <li>✓ Review widget</li>
                  <li>✓ Badge widget</li>
                  <li>✓ QR feedback</li>
                </ul>
                <a href="https://starpress.puna-tech.com/auth/signup" className="block text-center py-3 border border-white/20 hover:border-white text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all">
                  Get Started
                </a>
              </div>
              <div className="p-8 border-2 border-[#af4c24] rounded-2xl relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#af4c24] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Popular
                </span>
                <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-1">$19<span className="text-lg font-normal text-white/40">/mo</span></div>
                <p className="text-sm text-white/40 mb-6">or $190/year (save 17%)</p>
                <ul className="space-y-3 text-sm text-white/60 mb-8">
                  <li>✓ Unlimited locations</li>
                  <li>✓ AI responses</li>
                  <li>✓ Weekly reports</li>
                  <li>✓ All widgets</li>
                </ul>
                <a href="https://starpress.puna-tech.com/auth/signup" className="block text-center py-3 bg-[#af4c24] hover:bg-[#af4c24]/90 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all">
                  Start Free Trial
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 md:px-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to grow your reputation?</h2>
          <p className="text-white/60 mb-8">Join hundreds of businesses using StarPress.</p>
          <a
            href="https://starpress.puna-tech.com/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#af4c24] hover:bg-[#af4c24]/90 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </a>
        </section>
      </main>
      <FooterEn />
    </>
  );
}
