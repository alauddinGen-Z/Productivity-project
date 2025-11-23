
import React from 'react';

export const PhilosophySection: React.FC = () => {
  return (
    <section id="philosophy" className="py-40 px-6 bg-white flex items-center justify-center border-y border-stone-200">
      <div className="max-w-4xl text-center">
         <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-8">The Philosophy</p>
         <blockquote className="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight">
           "Discipline is not a restriction of freedom. It is the <span className="text-amber-600 bg-amber-50 px-2">prerequisite</span> of it."
         </blockquote>
         <div className="mt-12 w-px h-20 bg-stone-300 mx-auto"></div>
      </div>
    </section>
  );
};
