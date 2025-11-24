
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Volume2, X, CloudRain, TreePine, Flame, Waves, Moon, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { useAmbientSound, SoundType } from '../hooks/useAmbientSound';
import { t } from '../utils/translations';
import { Settings } from '../types';

interface FocusTimerProps {
  mode: 'focus' | 'break';
  timeLeft: number;
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  selectedTaskTitle: string | undefined;
  language: Settings['language'];
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ 
  mode, 
  timeLeft, 
  isActive, 
  onToggle, 
  onReset,
  selectedTaskTitle,
  language
}) => {
  const { selectedSound, setSelectedSound, volume, setVolume, AudioElement } = useAmbientSound();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Reading from props now
  const lang = language;

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const radius = 100; // Compact radius
  const circumference = 2 * Math.PI * radius;
  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = timeLeft / totalTime;
  const dashOffset = circumference * (1 - progress);

  const soundOptions: { type: SoundType, icon: any, label: string }[] = [
    { type: 'none', icon: VolumeX, label: t('focus_sound_off', lang) },
    { type: 'rain', icon: CloudRain, label: t('focus_sound_rain', lang) },
    { type: 'forest', icon: TreePine, label: t('focus_sound_forest', lang) },
    { type: 'fire', icon: Flame, label: t('focus_sound_fire', lang) },
    { type: 'ocean', icon: Waves, label: t('focus_sound_ocean', lang) },
    { type: 'night', icon: Moon, label: t('focus_sound_night', lang) },
  ];

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#FAF9F6] flex flex-col items-center justify-between p-6 animate-fade-in overflow-hidden text-stone-800">
      
      {/* Ensure Audio Element is in DOM */}
      <AudioElement />

      {/* 1. Header Area */}
      <div className="w-full max-w-lg flex justify-between items-start shrink-0 h-16">
         <div className="flex-1 mr-4">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></span>
                {mode === 'focus' ? t('focus_deep', lang) : t('focus_rest', lang)}
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-800 leading-tight truncate">
                {selectedTaskTitle || t('focus_default_title', lang)}
            </h2>
         </div>
         <div className="flex gap-2">
            <button onClick={toggleFullScreen} className="p-2 text-stone-400 hover:text-stone-600 transition-colors bg-white rounded-full border border-stone-200 shadow-sm">
               {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onReset} className="p-2 text-stone-400 hover:text-red-500 transition-colors bg-white rounded-full border border-stone-200 shadow-sm" title="Exit">
               <X size={18} />
            </button>
         </div>
      </div>

      {/* 2. Timer Visual (Centered & Large) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
        <div className="relative transform scale-90 md:scale-110 lg:scale-125 transition-transform">
            <svg width="240" height="240" className="transform -rotate-90 pointer-events-none overflow-visible">
                <circle cx="120" cy="120" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="4" />
                <circle
                    cx="120" cy="120" r={radius} fill="none"
                    stroke={mode === 'focus' ? '#292524' : '#059669'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4">
                <div className="text-6xl font-serif text-stone-800 tabular-nums tracking-tighter">
                    {formatTime(timeLeft)}
                </div>
                
                <button 
                    onClick={onToggle}
                    className={`px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        isActive 
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200' 
                        : 'bg-stone-800 text-white hover:bg-stone-700 shadow-lg'
                    }`}
                >
                    {isActive ? (
                        <><Pause size={12} /> {t('focus_pause', lang)}</>
                    ) : (
                        <><Play size={12} /> {t('focus_resume', lang)}</>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* 3. Soundscape Controls (Sticky Bottom) */}
      <div className="w-full max-w-xl shrink-0 mt-8">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-3 md:p-4 flex flex-col gap-4">
             {/* Volume */}
             <div className="flex items-center gap-3 px-1">
                 <Volume2 size={14} className="text-stone-400" />
                 <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-800"
                 />
             </div>
             
             {/* Options */}
             <div className="flex items-center justify-between gap-2">
                {soundOptions.map((opt) => (
                    <button
                        key={opt.type}
                        onClick={() => setSelectedSound(opt.type)}
                        className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${
                            selectedSound === opt.type 
                                ? 'bg-amber-50 border border-amber-200 text-amber-900 shadow-sm' 
                                : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                        }`}
                    >
                        <opt.icon size={18} className="mb-1" />
                        <span className="text-[9px] font-bold uppercase hidden md:block">{opt.label}</span>
                    </button>
                ))}
             </div>
          </div>
      </div>
    </div>,
    document.body
  );
};
