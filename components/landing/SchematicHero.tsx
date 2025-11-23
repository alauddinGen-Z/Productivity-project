
import React, { useEffect, useState } from 'react';

export const SchematicHero: React.FC = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setActive(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full drop-shadow-2xl"
        style={{ overflow: 'visible' }}
      >
        {/* Definition Filters */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
            <feOffset dx="4" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.1" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Background Card (The Paper) --- */}
        <rect 
          x="20" y="20" width="360" height="360" rx="4" 
          fill="#FFFFFF" 
          stroke="#E7E5E4" strokeWidth="1"
          className={`transition-all duration-1000 ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        />

        {/* --- The Matrix Grid Lines --- */}
        {/* Vertical Line */}
        <line 
          x1="200" y1="40" x2="200" y2="360" 
          stroke="#E7E5E4" strokeWidth="2" strokeDasharray="320" strokeDashoffset={active ? 0 : 320}
          className="transition-all duration-1000 ease-in-out delay-500"
        />
        {/* Horizontal Line */}
        <line 
          x1="40" y1="200" x2="360" y2="200" 
          stroke="#E7E5E4" strokeWidth="2" strokeDasharray="320" strokeDashoffset={active ? 0 : 320}
          className="transition-all duration-1000 ease-in-out delay-700"
        />

        {/* --- Quadrant Labels --- */}
        <text x="50" y="55" fontSize="10" fontWeight="bold" fill="#B45309" className={`uppercase tracking-widest transition-opacity duration-700 delay-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>Do First</text>
        <text x="230" y="55" fontSize="10" fontWeight="bold" fill="#78716C" className={`uppercase tracking-widest transition-opacity duration-700 delay-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>Schedule</text>
        <text x="50" y="235" fontSize="10" fontWeight="bold" fill="#78716C" className={`uppercase tracking-widest transition-opacity duration-700 delay-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>Delegate</text>
        <text x="230" y="235" fontSize="10" fontWeight="bold" fill="#78716C" className={`uppercase tracking-widest transition-opacity duration-700 delay-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>Eliminate</text>

        {/* --- Floating Elements (Tasks) --- */}
        
        {/* Task 1: Do First (Amber) */}
        <g className={`transition-all duration-700 delay-[1200ms] ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <rect x="50" y="80" width="120" height="60" rx="2" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1" filter="url(#shadow)" />
            <rect x="65" y="100" width="80" height="4" rx="2" fill="#B45309" />
            <rect x="65" y="115" width="50" height="4" rx="2" fill="#E7E5E4" />
        </g>

        {/* Task 2: Schedule (Dark) */}
        <g className={`transition-all duration-700 delay-[1400ms] ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <rect x="230" y="80" width="120" height="40" rx="2" fill="#FAFAFA" stroke="#E7E5E4" strokeWidth="1" filter="url(#shadow)" />
            <rect x="245" y="98" width="90" height="4" rx="2" fill="#57534E" />
        </g>

        {/* Task 3: Schedule Stacked */}
        <g className={`transition-all duration-700 delay-[1500ms] ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <rect x="230" y="130" width="120" height="40" rx="2" fill="#FAFAFA" stroke="#E7E5E4" strokeWidth="1" filter="url(#shadow)" />
            <rect x="245" y="148" width="60" height="4" rx="2" fill="#A8A29E" />
        </g>

        {/* Decoration: The Pen/Cursor */}
        <circle cx="360" cy="360" r="40" fill="#1C1917" className={`transition-all duration-700 delay-[1800ms] ${active ? 'scale-100' : 'scale-0'}`} />
        <path d="M350 360 L360 370 L375 350" stroke="white" strokeWidth="3" fill="none" className={`transition-all duration-500 delay-[2000ms] ${active ? 'opacity-100' : 'opacity-0'}`} />
      </svg>
    </div>
  );
};
