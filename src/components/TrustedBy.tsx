import React from 'react';
import { motion } from 'motion/react';

const brands = [
  "Airbnb", "Stripe", "Plaid", "Segment", "Linear", "Vercel"
];

const TrustedBy = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30 mb-12">
          Empresas que confían en nuestra infraestructura
        </p>
        <div className="relative flex overflow-x-hidden">
          <div className="py-2 animate-marquee whitespace-nowrap flex items-center">
            {[...brands, ...brands].map((brand, i) => (
              <span key={i} className="text-4xl md:text-5xl font-display text-foreground/10 mx-12 md:mx-20 hover:text-primary/20 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
