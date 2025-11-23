
import React, { useEffect, useRef, useState } from 'react';

export const SolutionSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="solution" ref={sectionRef} className="py-32 px-6 bg-[#1c1917] text-stone-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Text Content */}
        <div className="order-2 lg:order-1">
           <div className={`w-12 h-1 bg-amber-500 mb-8 transition-all duration-700 ${active ? 'w-12 opacity-100' : 'w-0 opacity-0'}`}></div>
           <h2 className={`text-4xl md:text-5xl font-serif font-bold mb-6 transition-all duration-700 delay-100 ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
             The Framework <br/> of Focus.
           </h2>
           <p className={`text-lg text-stone-400 leading-relaxed max-w-md transition-all duration-700 delay-200 ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
             We replace entropy with architecture. The Intentional System is built on three pillars: The Eisenhower Matrix for prioritization, Time Blocking for execution, and Deep Work for mastery.
           </p>
        </div>

        {/* SVG Animation (The Blueprint) */}
        <div className="order-1 lg:order-2 flex justify-center">
           <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                 {/* Outer Box */}
                 <rect x="20" y="20" width="360" height="360" fill="none" stroke="#57534e" strokeWidth="1" 
                       className={`draw-line ${active ? 'active' : ''}`} />
                 
                 {/* Cross Lines */}
                 <line x1="200" y1="20" x2="200" y2="380" stroke="#57534e" strokeWidth="1" 
                       className={`draw-line ${active ? 'active' : ''}`} style={{ transitionDelay: '0.5s' }} />
                 <line x1="20" y1="200" x2="380" y2="200" stroke="#57534e" strokeWidth="1" 
                       className={`draw-line ${active ? 'active' : ''}`} style={{ transitionDelay: '0.7s' }} />

                 {/* Active Quadrant (Top Left) */}
                 <rect x="20" y="20" width="180" height="180" fill="#292524" stroke="none" 
                       className={`transition-opacity duration-1000 delay-[1.2s] ${active ? 'opacity-100' : 'opacity-0'}`} />
                 
                 <text x="40" y="50" fill="#fbbf24" fontSize="12" fontWeight="bold" className={`uppercase tracking-widest transition-opacity delay-[1.5s] duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
                    Do First
                 </text>

                 {/* Sample Task */}
                 <rect x="40" y="80" width="120" height="40" rx="2" fill="#44403c" 
                        className={`transition-all duration-500 delay-[1.8s] ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} />
                 <rect x="50" y="98" width="60" height="4" rx="2" fill="#fbbf24" 
                        className={`transition-all duration-500 delay-[2s] ${active ? 'opacity-100' : 'opacity-0'}`} />

              </svg>
           </div>
        </div>

      </div>
    </section>
  );
};
