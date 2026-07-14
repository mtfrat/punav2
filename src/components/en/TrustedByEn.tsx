import React from 'react';

const TrustedByEn = () => {
  return (
    <section className="py-stack-md border-y border-border-subtle bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center">
        <p className="font-label-mono text-label-mono text-slate-text-muted mb-stack-sm text-center uppercase tracking-widest">
          Trusted by global leaders in tech and logistics
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-headline-sm text-headline-sm text-slate-text-primary">
            <span className="material-symbols-outlined text-[32px]">layers</span> TechCorp
          </div>
          <div className="flex items-center gap-2 font-headline-sm text-headline-sm text-slate-text-primary">
            <span className="material-symbols-outlined text-[32px]">public</span> GlobalLog
          </div>
          <div className="flex items-center gap-2 font-headline-sm text-headline-sm text-slate-text-primary">
            <span className="material-symbols-outlined text-[32px]">hub</span> NexusSystems
          </div>
          <div className="flex items-center gap-2 font-headline-sm text-headline-sm text-slate-text-primary hidden sm:flex">
            <span className="material-symbols-outlined text-[32px]">memory</span> DataFlow
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedByEn;
