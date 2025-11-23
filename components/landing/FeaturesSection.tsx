
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Clock, Zap, Target } from 'lucide-react';

const features = [
  {
    title: "The Matrix",
    description: "Separate the urgent from the important. Visualize your priorities on a dynamic 4-quadrant board.",
    icon: Layout,
    delay: 0
  },
  {
    title: "Time Blocking",
    description: "Give every intention a home. Drag and drop tasks into your 'Ideal Week' to ensure execution.",
    icon: Clock,
    delay: 200
  },
  {
    title: "Deep Work Mode",
    description: "Eliminate digital noise. A dedicated focus timer that blocks UI distractions.",
    icon: Zap,
    delay: 400
  },
  {
    title: "Niyyah Alignment",
    description: "Before you work, set your intention. Align your daily grind with your ultimate purpose.",
    icon: Target,
    delay: 600
  }
];

export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-[#FAF9F6] relative overflow-hidden">
      <style>{`
        @keyframes draw-h { from { width: 0; } to { width: 100%; } }
        @keyframes draw-v { from { height: 0; } to { height: 100%; } }
        
        .border-draw-t { width: 0; animation: draw-h 0.5s ease-out forwards; }
        .border-draw-r { height: 0; animation: draw-v 0.5s ease-out 0.5s forwards; }
        .border-draw-b { width: 0; animation: draw-h 0.5s ease-out 1s forwards; }
        .border-draw-l { height: 0; animation: draw-v 0.5s ease-out 1.5s forwards; }

        .reveal-content {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease-out 1.8s;
        }
        .reveal-content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes organic-morph {
          0%, 100% { border-radius: 2px 2px 2px 2px; transform: scale(1); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
          33% { border-radius: 8px 2px 6px 4px; transform: scale(1.005); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05); }
          66% { border-radius: 4px 8px 2px 6px; transform: scale(0.995); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        }

        .loop-shape {
          animation: organic-morph 8s ease-in-out infinite;
        }
        
        .card-container:hover .loop-shape {
          animation-play-state: paused;
          border-radius: 4px;
          border-color: #d6d3d1;
          background-color: #ffffff;
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
          transition: all 0.3s ease-out;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="mb-20 max-w-2xl">
           <h2 className={`text-4xl font-serif font-bold text-stone-900 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
             Tools of the Trade
           </h2>
           <div className={`h-1 bg-stone-900 mb-6 transition-all duration-1000 delay-300 ${isVisible ? 'w-24' : 'w-0'}`}></div>
           <p className={`text-stone-500 text-lg leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
             Precision instruments designed to align your actions with your intentions.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
           {features.map((f, i) => (
              <FeatureCard key={i} feature={f} isVisible={isVisible} index={i} />
           ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ feature: any, isVisible: boolean, index: number }> = ({ feature, isVisible, index }) => {
  // We use a separate state to switch from "constructing" mode to "looping" mode
  const [constructionComplete, setConstructionComplete] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Construction takes roughly 2s (4 sides * 0.5s) + wait time. 
      // We add index delay to stagger them.
      const totalDelay = 2200 + feature.delay;
      const timer = setTimeout(() => {
        setConstructionComplete(true);
      }, totalDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, feature.delay]);

  return (
    <div className={`relative min-h-[280px] p-8 card-container group cursor-default transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${feature.delay}ms` }}>
       
       {/* CONSTRUCTION PHASE: Lines drawing the box */}
       {!constructionComplete && isVisible && (
         <div className="absolute inset-0 pointer-events-none">
            {/* Top Line */}
            <div className="absolute top-0 left-0 h-[2px] bg-stone-800 border-draw-t"></div>
            {/* Right Line */}
            <div className="absolute top-0 right-0 w-[2px] bg-stone-800 border-draw-r"></div>
            {/* Bottom Line */}
            <div className="absolute bottom-0 right-0 h-[2px] bg-stone-800 border-draw-b"></div>
            {/* Left Line */}
            <div className="absolute bottom-0 left-0 w-[2px] bg-stone-800 border-draw-l"></div>
         </div>
       )}

       {/* LOOP PHASE: The Card itself morphing */}
       <div 
         className={`absolute inset-0 bg-white border border-stone-200 transition-all duration-1000 
           ${constructionComplete ? 'opacity-100 loop-shape' : 'opacity-0'}`}
       ></div>

       {/* CONTENT: Icon, Title, Desc */}
       <div className={`relative z-10 h-full flex flex-col justify-center reveal-content ${isVisible ? 'visible' : ''}`}>
          <div className="w-14 h-14 bg-stone-100 rounded-sm flex items-center justify-center mb-6 text-stone-700 group-hover:bg-stone-800 group-hover:text-white transition-colors duration-300 shadow-sm border border-stone-200 group-hover:border-stone-800">
            <feature.icon size={24} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3 group-hover:translate-x-1 transition-transform duration-300">
            {feature.title}
          </h3>
          
          <p className="text-stone-500 leading-relaxed font-serif">
            {feature.description}
          </p>

          {/* Decorative Corner Accent that appears on hover */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
       </div>
    </div>
  );
};
