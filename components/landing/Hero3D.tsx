
import React from 'react';
import { useMouseTilt } from '../../hooks/useLandingAnimations';

export const Hero3D: React.FC = () => {
  const { x, y } = useMouseTilt(20);

  return (
    <div className="w-full h-full flex items-center justify-center relative z-20 pointer-events-none perspective-1000">
      <div
        className="relative w-[280px] h-[360px] md:w-[350px] md:h-[450px] transition-transform duration-100 ease-out preserve-3d"
        style={{ transform: `rotateX(${20 + x}deg) rotateY(${-20 + y}deg) rotateZ(0deg)` }}
      >
         {/* Shadow */}
         <div className="absolute top-0 left-0 w-full h-full bg-black/40 blur-2xl transform translate-z-[-100px] scale-90 rounded-full transition-transform duration-300"></div>

         {/* Layer 1: Foundation (Dark/Psychology) */}
         <div className="absolute inset-0 bg-[#1c1917] border border-stone-700/50 shadow-2xl transform translate-z-[-40px] rounded-sm flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
            <div className="text-stone-600 font-serif italic text-sm transform -rotate-90 absolute -left-12 bottom-10">Psychology</div>
            <div className="w-16 h-16 rounded-full border border-stone-600/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-stone-600/50"></div>
            </div>
         </div>

         {/* Layer 2: Process (Grid/Matrix) */}
         <div className="absolute inset-0 bg-[#FAF9F6] border border-stone-200 shadow-xl transform translate-z-[0px] rounded-sm flex flex-col overflow-hidden opacity-95">
            <div className="h-8 border-b border-stone-100 bg-stone-50 flex items-center px-3 gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
            </div>
            <div className="flex-1 p-4 grid grid-cols-2 grid-rows-2 gap-2">
                <div className="bg-amber-50 border border-amber-100 p-2 relative group">
                   <div className="w-6 h-1 bg-amber-500/50 mb-1"></div>
                   <div className="space-y-1">
                      <div className="h-1 w-full bg-stone-200 rounded-full"></div>
                      <div className="h-1 w-2/3 bg-stone-200 rounded-full"></div>
                   </div>
                </div>
                <div className="bg-white border border-dashed border-stone-200"></div>
                <div className="bg-white border border-dashed border-stone-200"></div>
                <div className="bg-stone-50 border border-stone-100"></div>
            </div>
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-stone-300 tracking-[0.3em]">SYSTEM</div>
         </div>

         {/* Layer 3: Purpose (Vision/Floating) */}
         <div className="absolute inset-x-8 inset-y-12 bg-white/80 backdrop-blur-md border border-white/50 shadow-2xl transform translate-z-[60px] rounded-sm flex flex-col items-center justify-center animate-[float-slow_6s_ease-in-out_infinite]">
             <div className="w-20 h-20 rounded-full border-2 border-stone-900 flex items-center justify-center relative">
                 <div className="absolute inset-0 border border-stone-300 rounded-full scale-125 animate-[pulse-ring_4s_infinite]"></div>
                 <div className="w-1.5 h-1.5 bg-stone-900 rounded-full"></div>
             </div>
             <div className="mt-6 text-center space-y-1.5">
                 <div className="h-1.5 w-24 bg-stone-900 rounded-full mx-auto"></div>
                 <div className="h-1.5 w-16 bg-stone-300 rounded-full mx-auto"></div>
             </div>
             
             {/* Connection beam */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[200px] bg-gradient-to-b from-transparent via-amber-500/50 to-transparent transform -translate-z-[100px] rotate-45 pointer-events-none"></div>
         </div>
      </div>
    </div>
  );
};
