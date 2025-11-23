
import React from 'react';
import { Layout, Clock, Zap, Target } from 'lucide-react';

const features = [
  {
    title: "The Matrix",
    description: "Separate the urgent from the important. Visualize your priorities on a dynamic 4-quadrant board.",
    icon: Layout
  },
  {
    title: "Time Blocking",
    description: "Give every intention a home. Drag and drop tasks into your 'Ideal Week' to ensure execution.",
    icon: Clock
  },
  {
    title: "Deep Work Mode",
    description: "Eliminate digital noise. A dedicated focus timer that blocks UI distractions.",
    icon: Zap
  },
  {
    title: "Niyyah Alignment",
    description: "Before you work, set your intention. Align your daily grind with your ultimate purpose.",
    icon: Target
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-32 px-6 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
           <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Tools of the Trade</h2>
           <div className="h-px w-full bg-stone-300"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
           {features.map((f, i) => (
              <div key={i} className="group hover:bg-white p-8 rounded-sm transition-all duration-300 hover:shadow-xl border border-transparent hover:border-stone-100">
                 <div className="w-14 h-14 bg-stone-200 text-stone-800 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    <f.icon size={24} />
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-stone-800 mb-4">{f.title}</h3>
                 <p className="text-stone-600 leading-relaxed">{f.description}</p>
              </div>
           ))}
        </div>
      </div>
    </section>
  );
};
