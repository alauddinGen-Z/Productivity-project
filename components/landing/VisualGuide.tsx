
import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Calendar, Layers, Clock } from 'lucide-react';

export const VisualGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (triggerRef.current) {
        const triggers = triggerRef.current.children;
        const windowHeight = window.innerHeight;
        
        for (let i = 0; i < triggers.length; i++) {
          const rect = triggers[i].getBoundingClientRect();
          // Active when element is in the middle-ish of screen
          if (rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4) {
            setActiveStep(i);
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      title: 'The Matrix',
      desc: 'Capture everything. Organize by urgency and importance. Never lose a thought.',
      icon: LayoutGrid
    },
    {
      title: 'Time Blocking',
      desc: 'Give every intention a time and place. Visualize your ideal week versus reality.',
      icon: Calendar
    },
    {
      title: 'Deep Focus',
      desc: 'Enter the tunnel. Eliminate distractions with a dedicated focus timer and environment checklist.',
      icon: Layers
    }
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-48">
       {/* Grid: 3D Stage on Left, Text on Right */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Sticky Visual Stage (Left) */}
          <div className="hidden lg:block relative h-full min-h-[600px]">
             <div className="sticky top-32 w-full perspective-2000 flex items-center justify-center">
                {/* 3D Scene Root */}
                <div className="relative w-[500px] h-[500px] preserve-3d transition-all duration-700 ease-out" 
                     style={{ 
                       transform: activeStep === 0 ? 'rotateX(20deg) rotateY(20deg)' : 
                                  activeStep === 1 ? 'rotateX(10deg) rotateY(-10deg)' : 
                                  'rotateX(5deg) rotateY(0deg)' 
                     }}>
                   
                   {/* SCENE 1: Matrix */}
                   <div className={`absolute inset-0 bg-stone-100 rounded-xl border border-stone-300 shadow-2xl transition-all duration-700 ease-out flex flex-col overflow-hidden ${activeStep === 0 ? 'opacity-100 translate-z-[0px]' : 'opacity-0 translate-z-[-200px] pointer-events-none'}`}>
                      <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-stone-300 p-px">
                         <div className="bg-white p-6 relative group">
                            <span className="text-[10px] uppercase font-bold text-amber-600">Do First</span>
                            <div className="mt-4 bg-white border border-stone-200 p-3 shadow-lg rounded-sm transform group-hover:-translate-y-2 transition-transform duration-500">
                               <div className="h-2 w-12 bg-stone-800 rounded-full mb-2"></div>
                               <div className="h-1.5 w-full bg-stone-100 rounded-full"></div>
                            </div>
                         </div>
                         <div className="bg-stone-50 p-6"><span className="text-[10px] uppercase font-bold text-stone-400">Schedule</span></div>
                         <div className="bg-stone-50 p-6"><span className="text-[10px] uppercase font-bold text-stone-400">Delegate</span></div>
                         <div className="bg-stone-50 p-6"><span className="text-[10px] uppercase font-bold text-stone-400">Delete</span></div>
                      </div>
                      <div className="absolute -right-12 top-20 bg-white p-4 rounded shadow-xl border border-stone-200 animate-[float-slow_4s_ease-in-out_infinite]">
                         <div className="h-2 w-24 bg-stone-400 rounded-full"></div>
                      </div>
                   </div>

                   {/* SCENE 2: Timeline */}
                   <div className={`absolute inset-0 bg-[#F5F5F4] rounded-xl border border-stone-300 shadow-2xl transition-all duration-700 ease-out flex flex-col overflow-hidden ${activeStep === 1 ? 'opacity-100 translate-z-[0px]' : 'opacity-0 translate-z-[-200px] pointer-events-none'}`}>
                      <div className="flex-1 relative overflow-hidden">
                         {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-6 px-6 border-b border-stone-200/60">
                               <div className="w-12 text-xs font-mono text-stone-400">0{i+9}:00</div>
                               <div className="flex-1 h-px bg-stone-200"></div>
                            </div>
                         ))}
                         <div className="absolute top-[90px] left-24 right-8 h-24 bg-amber-100 border-l-4 border-amber-500 rounded-sm p-4 shadow-lg transform hover:scale-[1.02] transition-transform">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <div className="font-bold text-amber-900 text-sm">Deep Work Block</div>
                                     <div className="text-xs text-amber-700/60 mt-1">Project Alpha</div>
                                 </div>
                                 <Clock size={16} className="text-amber-500" />
                             </div>
                         </div>
                      </div>
                   </div>

                   {/* SCENE 3: Focus */}
                   <div className={`absolute inset-0 bg-[#1C1917] rounded-xl border border-stone-800 shadow-2xl transition-all duration-700 ease-out flex items-center justify-center ${activeStep === 2 ? 'opacity-100 translate-z-[0px]' : 'opacity-0 translate-z-[-200px] pointer-events-none'}`}>
                      <div className="relative w-72 h-72">
                          <div className="absolute inset-0 border-[1px] border-stone-800 rounded-full"></div>
                          <div className="absolute inset-0 border-2 border-transparent border-t-amber-500 rounded-full animate-spin [animation-duration:3s]"></div>
                          <div className="absolute inset-8 border-[1px] border-stone-800 rounded-full"></div>
                          <div className="absolute inset-8 border-2 border-transparent border-l-emerald-600 rounded-full animate-spin [animation-duration:4s] [animation-direction:reverse]"></div>
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                              <div className="text-6xl font-mono font-bold text-white tracking-tighter tabular-nums">24:59</div>
                              <div className="text-xs font-bold text-stone-500 uppercase tracking-[0.4em] mt-4">Flow State</div>
                          </div>
                          
                          {/* Particles */}
                          <div className="absolute top-0 left-1/2 w-1 h-1 bg-amber-500 rounded-full animate-[pulse-ring_2s_infinite]"></div>
                      </div>
                   </div>

                </div>
             </div>
          </div>

          {/* Scroll Triggers (Right) */}
          <div ref={triggerRef} className="space-y-[60vh] py-[10vh]">
             {steps.map((step, idx) => (
                <div key={idx} className={`transition-all duration-500 bg-white/50 backdrop-blur-sm p-8 rounded-lg border border-stone-200/50 ${activeStep === idx ? 'opacity-100 scale-100 blur-0 shadow-lg' : 'opacity-30 scale-95 blur-[2px]'}`}>
                   <div className="w-16 h-16 bg-stone-900 text-white rounded-sm flex items-center justify-center mb-8 shadow-xl">
                      <step.icon size={32} strokeWidth={1.5} />
                   </div>
                   <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">{step.title}</h3>
                   <p className="text-xl text-stone-600 leading-relaxed font-serif">{step.desc}</p>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
