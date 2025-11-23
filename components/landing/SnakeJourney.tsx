
import React, { useState, useEffect, useRef } from 'react';

export const SnakeJourney: React.FC = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { top, height } = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Calculate percentage of element traversed (with some offset for better visual)
        const start = top - windowHeight * 0.6;
        const end = height * 0.8;
        const p = Math.min(1, Math.max(0, -start / end));
        setScrollPercentage(p);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const milestones = [
    { title: "The Drift", desc: "Life feels like a stream of endless reactions. You are busy, but not productive.", align: 'left' },
    { title: "The Pause", desc: "You realize that activity is not achievement. You stop to find a better way.", align: 'right' },
    { title: "The System", desc: "You adopt a framework. Structure creates freedom. Intent replaces impulse.", align: 'left' },
    { title: "The Mastery", desc: "Work becomes worship. Every action is aligned with your higher purpose.", align: 'right' }
  ];

  return (
    <div ref={containerRef} className="relative py-40 max-w-4xl mx-auto overflow-hidden">
       {/* Snake Line (Desktop) */}
       <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-full pointer-events-none z-0 hidden md:block">
         <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Background Path */}
            <path 
              d="M 300 0 C 600 200, 0 400, 300 600 S 600 1000, 300 1200"
              fill="none"
              stroke="#E7E5E4"
              strokeWidth="2"
            />
            {/* Animated Foreground Path */}
            <path 
              d="M 300 0 C 600 200, 0 400, 300 600 S 600 1000, 300 1200"
              fill="none"
              stroke="#44403c"
              strokeWidth="3"
              className="snake-path"
              style={{ strokeDashoffset: 1200 - (scrollPercentage * 1200) }}
            />
         </svg>
       </div>

       {/* Timeline Content */}
       <div className="space-y-48 relative z-10 px-6">
          {milestones.map((m, i) => (
             <div key={i} className={`flex ${m.align === 'left' ? 'md:justify-start' : 'md:justify-end'} justify-center reveal-element`}>
                <div className={`md:w-5/12 bg-white p-8 rounded-sm shadow-sm border border-stone-200 relative group hover:border-amber-200 transition-colors`}>
                   <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-stone-200 rounded-full border-4 border-white ${m.align === 'left' ? '-right-[18%]' : '-left-[18%]'} group-hover:bg-amber-500 transition-colors`}></div>
                   <h4 className="text-2xl font-serif font-bold text-stone-800 mb-3">{m.title}</h4>
                   <p className="text-stone-500 leading-relaxed">{m.desc}</p>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};
