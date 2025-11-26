import React, { useEffect, useState } from 'react';
import { ArrowRight, Layout, Zap, Brain } from 'lucide-react';

export const HeroSection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 pt-32 pb-20 relative overflow-hidden bg-[#FAF9F6]">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#44403c 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-amber-200/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Editorial Typography */}
        <div className="lg:col-span-7 space-y-8 relative">
             
             {/* Operational Badge */}
             <div className={`transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="inline-flex items-center gap-2.5 border border-stone-200 rounded-full px-4 py-1.5 bg-white/80 backdrop-blur-sm shadow-sm">
                   <span className="relative flex h-2.5 w-2.5">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                   </span>
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Operational V2.0</span>
                </div>
             </div>

             {/* Main Title */}
             <h1 className={`text-7xl sm:text-8xl lg:text-[7.5rem] font-serif font-medium text-stone-900 leading-[0.9] tracking-tighter transition-all duration-1000 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Design <br/>
                <span className="text-stone-300 italic">Your</span> Mind.
             </h1>

             {/* Description */}
             <p className={`text-xl text-stone-500 font-serif max-w-lg leading-relaxed transition-all duration-1000 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
               Stop reacting. Start architecting. The Intentional System turns the chaos of daily life into a <span className="text-stone-900 font-medium border-b border-stone-300 pb-0.5">structured masterpiece</span> of focus.
             </p>

             {/* CTAs */}
             <div className={`flex flex-wrap items-center gap-6 pt-4 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button 
                  onClick={onOpenAuth}
                  className="group relative bg-[#1c1917] text-white px-10 py-5 text-xs font-bold uppercase tracking-[0.25em] hover:bg-stone-800 transition-all shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Start Building
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
                
                <button className="px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-stone-400 hover:text-stone-900 transition-colors">
                  View Manifesto
                </button>
             </div>
        </div>

        {/* RIGHT COLUMN: 3D Floating Dashboard Visual */}
        <div className={`lg:col-span-5 relative h-[600px] w-full perspective-[2000px] transition-opacity duration-1000 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-full h-full transform-style-3d rotate-y-[-10deg] rotate-x-[5deg] scale-95 hover:rotate-y-[-5deg] hover:rotate-x-[2deg] transition-transform duration-700 ease-out">
                
                {/* Back Card: The Matrix (Structure) */}
                <div className="absolute top-0 right-0 w-[90%] h-[65%] bg-white border border-stone-200 shadow-2xl rounded-sm z-10 animate-[float_8s_ease-in-out_infinite]">
                    <div className="h-full p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-stone-100 rounded-sm"><Layout size={16} className="text-stone-500"/></div>
                              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Architecture</span>
                           </div>
                           <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-stone-200"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-stone-200"></div>
                           </div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                           <div className="bg-[#FAF9F6] border border-stone-100 rounded-sm p-3">
                              <div className="w-8 h-1 bg-amber-400 mb-2"></div>
                              <div className="w-full h-1 bg-stone-200 rounded-full mb-1"></div>
                              <div className="w-2/3 h-1 bg-stone-200 rounded-full"></div>
                           </div>
                           <div className="bg-white border border-dashed border-stone-200 rounded-sm"></div>
                           <div className="bg-white border border-dashed border-stone-200 rounded-sm"></div>
                           <div className="bg-[#FAF9F6] border border-stone-100 rounded-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Middle Card: Psychology (Intention) */}
                <div className="absolute top-[45%] left-[5%] w-[60%] h-[40%] bg-[#FAF9F6] border border-stone-200 shadow-xl rounded-sm z-20 animate-[float_7s_ease-in-out_infinite_1s]">
                    <div className="h-full p-5 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 bg-white border border-stone-100 rounded-sm"><Brain size={14} className="text-stone-400"/></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Intention</span>
                        </div>
                        <div className="space-y-2">
                             <div className="w-full h-1.5 bg-stone-200/50 rounded-full"></div>
                             <div className="w-[80%] h-1.5 bg-stone-200/50 rounded-full"></div>
                             <div className="w-[90%] h-1.5 bg-stone-200/50 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Front Card: Focus (Execution) */}
                <div className="absolute bottom-[5%] right-[10%] w-[55%] h-[35%] bg-[#1c1917] text-stone-100 border border-stone-700 shadow-2xl rounded-sm z-30 animate-[float_6s_ease-in-out_infinite_2s]">
                     <div className="h-full p-5 flex flex-col justify-between relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={64} /></div>
                         <div className="flex justify-between items-start relative z-10">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Deep Work</div>
                                <div className="text-3xl font-mono font-bold tracking-tighter text-white">24:59</div>
                            </div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                         </div>
                         <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden relative z-10">
                            <div className="w-[45%] bg-emerald-500 h-full"></div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
