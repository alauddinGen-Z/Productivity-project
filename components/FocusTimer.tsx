
import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface FocusTimerProps {
  mode: 'focus' | 'break';
  timeLeft: number;
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  selectedTaskTitle: string | undefined;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ 
  mode, 
  timeLeft, 
  isActive, 
  onToggle, 
  onReset,
  selectedTaskTitle 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = timeLeft / totalTime;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <div className="mb-12 text-center max-w-2xl px-4">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Currently Focusing On</p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 leading-tight">
            {selectedTaskTitle || "Unknown Task"}
        </h2>
      </div>

      <div className="relative mb-12">
        <div className="w-80 h-80 flex items-center justify-center relative">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none overflow-visible">
                <circle cx="50%" cy="50%" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="2" />
                <circle
                    cx="50%" cy="50%" r={radius} fill="none"
                    stroke={mode === 'focus' ? '#292524' : '#059669'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>

            <div className="text-center z-10">
                <div className="text-7xl font-serif text-stone-800 tabular-nums tracking-tight">
                    {formatTime(timeLeft)}
                </div>
                <div className={`text-xs font-bold uppercase tracking-[0.3em] mt-4 ${mode === 'focus' ? 'text-stone-400' : 'text-emerald-500'}`}>
                    {mode === 'focus' ? 'Deep Work' : 'Rest Phase'}
                </div>
            </div>
        </div>
      </div>

      <div className="flex gap-8">
        <button 
          onClick={onToggle}
          className="w-16 h-16 rounded-full border border-stone-200 flex items-center justify-center hover:border-stone-800 hover:bg-stone-800 hover:text-white transition-all duration-300 text-stone-600"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <button 
          onClick={onReset}
          className="w-16 h-16 rounded-full border border-stone-200 flex items-center justify-center hover:border-stone-400 text-stone-400 transition-all"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="mt-12 max-w-md text-center">
        {mode === 'focus' ? (
          <p className="text-stone-400 font-serif italic">
            "Focus is the art of knowing what to ignore."
          </p>
        ) : (
          <div className="bg-[#FAF9F6] border border-stone-200 p-6 shadow-sm">
            <h3 className="font-serif font-bold text-stone-700 mb-2">Break Ritual</h3>
            <p className="text-stone-500 text-sm leading-relaxed">Look away from the screen. Breathe deeply. Remember your Niyyah.</p>
          </div>
        )}
      </div>
    </div>
  );
};
