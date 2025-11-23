
import React from 'react';
import { ArrowRight } from 'lucide-react';

export const CTASection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  return (
    <section className="py-32 px-6 bg-[#1c1917] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8">
          Ready to Build?
        </h2>
        <p className="text-xl text-stone-400 font-serif mb-12">
          Join the architects of time. Claim your focus today.
        </p>
        <button 
          onClick={onOpenAuth}
          className="bg-white text-stone-900 px-12 py-6 text-sm font-bold uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-2xl flex items-center gap-4 mx-auto group"
        >
          Enter The System
          <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </section>
  );
};
