import React, { useEffect, useRef, useState } from 'react';

export const SolutionSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="solution" ref={sectionRef} className="py-32 px-6 bg-[#1c1917] text-stone-200 relative overflow-hidden">
      <style>{`
        .draw-path {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          transition: stroke-dashoffset 1.5s ease-out;
        }
        .draw-path.active {
          stroke-dashoffset: 0;
        }
        
        .quadrant-enter {
          opacity: 0;
          transform: scale(0.8) translateY(10px);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .quadrant-enter.active {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes morph {
          0%, 100% { rx: 4px; width: 120px; }
          50% { rx: 16px; width: 110px; transform: translateX(5px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .loop-anim-1 { animation: float 6s ease-in-out infinite 2s, morph 8s ease-in-out infinite 2s; }
        .loop-anim-2 { animation: float 7s ease-in-out infinite 2.5s; }
        .loop-anim-3 { animation: float 5s ease-in-out infinite 3s; }
        .loop-anim-4 { animation: float 8s ease-in-out infinite 3.5s; }

      `}</style>

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
           
           <div className={`mt-10 grid grid-cols-2 gap-6 transition-all duration-700 delay-300 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="p-4 border border-stone-800 rounded-sm bg-stone-900/50">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mb-2"></div>
                  <h4 className="font-bold text-sm mb-1">Urgent</h4>
                  <p className="text-xs text-stone-500">Immediate action required.</p>
              </div>
              <div className="p-4 border border-stone-800 rounded-sm bg-stone-900/50">
                  <div className="w-2 h-2 bg-stone-500 rounded-full mb-2"></div>
                  <h4 className="font-bold text-sm mb-1">Important</h4>
                  <p className="text-xs text-stone-500">Long-term value alignment.</p>
              </div>
           </div>
        </div>

        {/* SVG Animation (The Blueprint) */}
        <div className="order-1 lg:order-2 flex justify-center">
           <div className="relative w-[360px] h-[360px] md:w-[460px] md:h-[460px]">
              <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                 <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                       <feGaussianBlur stdDeviation="3" result="blur" />
                       <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                 </defs>

                 {/* --- Base Grid Construction --- */}
                 <rect x="20" y="20" width="360" height="360" fill="none" stroke="#44403c" strokeWidth="1" 
                       className={`draw-path ${active ? 'active' : ''}`} />
                 
                 <line x1="200" y1="20" x2="200" y2="380" stroke="#44403c" strokeWidth="1" 
                       className={`draw-path ${active ? 'active' : ''}`} style={{ transitionDelay: '0.3s' }} />
                 <line x1="20" y1="200" x2="380" y2="200" stroke="#44403c" strokeWidth="1" 
                       className={`draw-path ${active ? 'active' : ''}`} style={{ transitionDelay: '0.5s' }} />


                 {/* --- Quadrant 1: DO FIRST (Top Left) --- */}
                 <g className={`quadrant-enter ${active ? 'active' : ''}`} style={{ transitionDelay: '0.8s' }}>
                     {/* Label */}
                     <text x="40" y="50" fill="#fbbf24" fontSize="10" fontWeight="bold" className="uppercase tracking-widest">Do First</text>
                     
                     {/* Task Visual - Morphing Card */}
                     <g className="loop-anim-1" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                        <rect x="40" y="70" width="120" height="80" rx="4" fill="#292524" stroke="#fbbf24" strokeWidth="2" />
                        <rect x="55" y="95" width="40" height="4" rx="2" fill="#fbbf24" />
                        <rect x="55" y="110" width="90" height="4" rx="2" fill="#57534e" />
                        {/* Accent */}
                        <circle cx="140" cy="90" r="12" fill="#fbbf24" fillOpacity="0.2" />
                        <circle cx="140" cy="90" r="4" fill="#fbbf24" />
                     </g>
                 </g>


                 {/* --- Quadrant 2: SCHEDULE (Top Right) --- */}
                 <g className={`quadrant-enter ${active ? 'active' : ''}`} style={{ transitionDelay: '1.1s' }}>
                     <text x="220" y="50" fill="#a8a29e" fontSize="10" fontWeight="bold" className="uppercase tracking-widest">Schedule</text>
                     
                     {/* Task Visual - Stacked Cards */}
                     <g className="loop-anim-2" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                        <rect x="230" y="80" width="110" height="70" rx="4" fill="#1c1917" stroke="#57534e" strokeWidth="1" opacity="0.6" transform="rotate(5 285 115)" />
                        <rect x="220" y="70" width="110" height="70" rx="4" fill="#292524" stroke="#a8a29e" strokeWidth="1" />
                        {/* Calendar Grid lines */}
                        <line x1="235" y1="90" x2="315" y2="90" stroke="#57534e" strokeWidth="1" />
                        <line x1="235" y1="105" x2="315" y2="105" stroke="#57534e" strokeWidth="1" />
                        <line x1="235" y1="120" x2="280" y2="120" stroke="#57534e" strokeWidth="1" />
                     </g>
                 </g>


                 {/* --- Quadrant 3: DELEGATE (Bottom Left) --- */}
                 <g className={`quadrant-enter ${active ? 'active' : ''}`} style={{ transitionDelay: '1.4s' }}>
                     <text x="40" y="230" fill="#a8a29e" fontSize="10" fontWeight="bold" className="uppercase tracking-widest">Delegate</text>
                     
                     <g className="loop-anim-3" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                        {/* Main Card */}
                        <rect x="40" y="250" width="100" height="60" rx="20" fill="#292524" stroke="#3b82f6" strokeWidth="1" />
                        {/* Connecting Card */}
                        <rect x="120" y="280" width="60" height="40" rx="10" fill="#1c1917" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
                        {/* Connection Line */}
                        <path d="M 90 280 Q 110 280 120 300" fill="none" stroke="#3b82f6" strokeWidth="1" />
                        <circle cx="90" cy="280" r="3" fill="#3b82f6" />
                     </g>
                 </g>


                 {/* --- Quadrant 4: ELIMINATE (Bottom Right) --- */}
                 <g className={`quadrant-enter ${active ? 'active' : ''}`} style={{ transitionDelay: '1.7s' }}>
                     <text x="220" y="230" fill="#78716c" fontSize="10" fontWeight="bold" className="uppercase tracking-widest">Eliminate</text>
                     
                     <g className="loop-anim-4" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                        <rect x="220" y="250" width="120" height="80" rx="4" fill="none" stroke="#78716c" strokeWidth="1" strokeDasharray="4 4" />
                        {/* Dissolving particles */}
                        <circle cx="240" cy="270" r="2" fill="#ef4444" opacity="0.6" />
                        <circle cx="320" cy="310" r="3" fill="#ef4444" opacity="0.4" />
                        <circle cx="280" cy="290" r="1" fill="#ef4444" opacity="0.8" />
                        {/* Cross */}
                        <path d="M 270 280 L 290 300 M 290 280 L 270 300" stroke="#ef4444" strokeWidth="2" opacity="0.7" />
                     </g>
                 </g>

                 {/* Central Axis Dot */}
                 <circle cx="200" cy="200" r="4" fill="#d6d3d1" className={`transition-all duration-500 delay-[2000ms] ${active ? 'scale-100' : 'scale-0'}`} />

              </svg>
           </div>
        </div>

      </div>
    </section>
  );
};
