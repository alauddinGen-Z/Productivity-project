import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Coffee, BellOff, Smartphone, Check } from 'lucide-react';

export const FocusLayer: React.FC = () => {
  const [isDeepWorkMode, setIsDeepWorkMode] = useState(false);
  const [checklist, setChecklist] = useState({
    phoneSilent: false,
    notificationsOff: false,
    waterReady: false,
  });

  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allChecked = Object.values(checklist).every(Boolean);

  if (!isDeepWorkMode) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-white rounded-sm shadow-md border border-stone-200 overflow-hidden">
          <div className="bg-[#292524] p-10 text-stone-100 text-center border-b border-stone-800">
            <h2 className="text-4xl font-serif font-bold mb-3">Deep Work</h2>
            <p className="text-stone-400 font-serif italic">"The ability to concentrate without distraction..."</p>
          </div>
          <div className="p-10 space-y-6">
            {[
              { key: 'phoneSilent', label: 'Phone silent & away', icon: Smartphone },
              { key: 'notificationsOff', label: 'Notifications disabled', icon: BellOff },
              { key: 'waterReady', label: 'Hydration ready', icon: Coffee },
            ].map(({ key, label, icon: Icon }) => (
              <div 
                key={key}
                className={`flex items-center p-4 border-b transition-all cursor-pointer group ${checklist[key as keyof typeof checklist] ? 'border-stone-800' : 'border-stone-100'}`}
                onClick={() => setChecklist({...checklist, [key]: !checklist[key as keyof typeof checklist]})}
              >
                <div className={`w-6 h-6 rounded-full border mr-6 flex items-center justify-center transition-colors ${checklist[key as keyof typeof checklist] ? 'bg-stone-800 border-stone-800 text-white' : 'border-stone-300 group-hover:border-stone-400'}`}>
                  {checklist[key as keyof typeof checklist] && <Check size={12} />}
                </div>
                <div className="flex items-center gap-3 text-stone-700 font-serif text-lg">
                  <Icon size={18} className="text-stone-400" />
                  {label}
                </div>
              </div>
            ))}

            <button
              disabled={!allChecked}
              onClick={() => setIsDeepWorkMode(true)}
              className={`w-full py-5 mt-8 text-xs font-bold uppercase tracking-[0.2em] transition-all border ${
                allChecked 
                  ? 'bg-stone-800 text-white border-stone-800 hover:bg-stone-700' 
                  : 'bg-stone-100 text-stone-400 border-stone-100 cursor-not-allowed'
              }`}
            >
              Enter The Zone
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
      {/* Minimal Zen Timer */}
      <div className="relative">
        <div className={`w-80 h-80 rounded-full flex items-center justify-center border-[1px] transition-all duration-1000 ${isActive ? 'border-stone-800 scale-105' : 'border-stone-300'}`}>
           {/* Inner thin ring */}
           <div className={`w-72 h-72 rounded-full border-[1px] absolute border-stone-100 ${isActive ? 'animate-pulse' : ''}`}></div>
           
           <div className="text-center z-10">
             <div className="text-7xl font-serif text-stone-800 tabular-nums tracking-tight">
               {formatTime(timeLeft)}
             </div>
             <div className="text-xs font-bold text-stone-400 uppercase tracking-[0.3em] mt-4">
               {mode === 'focus' ? 'Focus' : 'Rest'}
             </div>
           </div>
        </div>
      </div>

      <div className="mt-16 flex gap-8">
        <button 
          onClick={toggleTimer}
          className="w-16 h-16 rounded-full border border-stone-200 flex items-center justify-center hover:border-stone-800 hover:bg-stone-800 hover:text-white transition-all duration-300 text-stone-600"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
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
      
      <button 
        onClick={() => setIsDeepWorkMode(false)}
        className="mt-12 text-xs text-stone-300 hover:text-stone-500 uppercase tracking-widest"
      >
        End Session
      </button>
    </div>
  );
};