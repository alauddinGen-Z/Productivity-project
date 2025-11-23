
import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RefreshCw, Coffee, BellOff, Smartphone, Check, Target, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Task, WeeklySchedule, TimeBlock } from '../types';

interface FocusLayerProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  schedule: WeeklySchedule;
}

export const FocusLayer: React.FC<FocusLayerProps> = ({ tasks, toggleTask, schedule }) => {
  const [isDeepWorkMode, setIsDeepWorkMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  const [checklist, setChecklist] = useState({
    phoneSilent: false,
    notificationsOff: false,
    waterReady: false,
  });

  // Time Context State
  const [currentTimeKey, setCurrentTimeKey] = useState<string>('');
  const [currentBlock, setCurrentBlock] = useState<TimeBlock | null>(null);

  useEffect(() => {
    const updateTimeContext = () => {
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'short' });
        const hour = now.getHours();
        const key = `${day}-${hour}`;
        setCurrentTimeKey(key);
        
        // Find block in Ideal schedule
        if (schedule.ideal[key]) {
            setCurrentBlock(schedule.ideal[key]);
            // Auto-select task if linked and not already selected
            const linkedTaskId = schedule.ideal[key].taskId;
            if (linkedTaskId && tasks.find(t => t.id === linkedTaskId && !t.completed)) {
                if (!selectedTaskId) setSelectedTaskId(linkedTaskId);
            }
        } else {
            setCurrentBlock(null);
        }
    };
    
    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000); // Update every min
    return () => clearInterval(interval);
  }, [schedule, tasks, selectedTaskId]);


  const FOCUS_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
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
        setTimeLeft(BREAK_DURATION);
      } else {
        setMode('focus');
        setTimeLeft(FOCUS_DURATION);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
  };

  const handleEndSession = () => {
    setIsActive(false);
  };

  const handleTaskCompletion = () => {
    if (selectedTaskId) {
        toggleTask(selectedTaskId);
        setIsDeepWorkMode(false);
        setSelectedTaskId('');
        // Reset checklist for next time
        setChecklist({ phoneSilent: false, notificationsOff: false, waterReady: false });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allChecked = Object.values(checklist).every(Boolean);

  // SVG Animation Math
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const totalTime = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
  const progress = timeLeft / totalTime;
  const dashOffset = circumference * (1 - progress);

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

  if (!isDeepWorkMode) {
    return (
      <div className="max-w-xl mx-auto mt-8 animate-fade-in pb-12">
        <div className="bg-white rounded-sm shadow-md border border-stone-200 overflow-hidden">
          <div className="bg-[#292524] p-10 text-stone-100 text-center border-b border-stone-800 relative">
            <h2 className="text-4xl font-serif font-bold mb-3">Deep Work</h2>
            <p className="text-stone-400 font-serif italic">"The ability to concentrate without distraction..."</p>
            
            {/* Live Context Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700">
               <Clock size={12} className="text-amber-500" />
               <span className="text-[10px] font-mono font-bold text-stone-300">{currentTimeKey.replace('-', ' @ ')}:00</span>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            
            {/* Current Schedule Context */}
            {currentBlock && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm flex items-start gap-3">
                    <Calendar className="text-amber-600 mt-1" size={18} />
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-amber-700 font-bold mb-1">Scheduled For Now</div>
                        <div className="font-serif text-stone-800 font-medium text-lg">{currentBlock.label}</div>
                        <div className="text-xs text-stone-500">{currentBlock.category} Block</div>
                    </div>
                </div>
            )}

            {/* Task Selector */}
            <div className="bg-[#FAF9F6] p-6 border border-stone-200 rounded-sm">
                <div className="flex items-center gap-2 mb-4 text-stone-800 font-bold uppercase tracking-widest text-xs">
                    <Target size={14} />
                    <span>Select Your Target</span>
                </div>
                {tasks.filter(t => !t.completed).length === 0 ? (
                    <div className="text-stone-400 text-sm italic">No open tasks. Add one in the Matrix first.</div>
                ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                        {tasks.filter(t => !t.completed).map(task => {
                            const isScheduledNow = currentBlock?.taskId === task.id;
                            
                            return (
                                <div 
                                    key={task.id}
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between group ${
                                        selectedTaskId === task.id 
                                        ? 'bg-stone-800 text-white border-stone-800' 
                                        : isScheduledNow 
                                            ? 'bg-amber-100 border-amber-300 text-stone-800' 
                                            : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600'
                                    }`}
                                >
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            {isScheduledNow && <span className="text-[9px] bg-amber-500 text-white px-1 rounded font-bold uppercase">Now</span>}
                                            <span className="text-sm font-serif truncate">{task.title}</span>
                                        </div>
                                    </div>
                                    {selectedTaskId === task.id && <Check size={14} />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Checklist */}
            <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Environment Check</div>
                {[
                { key: 'phoneSilent', label: 'Phone silent & away', icon: Smartphone },
                { key: 'notificationsOff', label: 'Notifications disabled', icon: BellOff },
                { key: 'waterReady', label: 'Hydration ready', icon: Coffee },
                ].map(({ key, label, icon: Icon }) => (
                <div 
                    key={key}
                    className={`flex items-center p-3 border rounded-sm transition-all cursor-pointer group ${checklist[key as keyof typeof checklist] ? 'bg-stone-50 border-stone-400' : 'border-stone-100 hover:border-stone-200'}`}
                    onClick={() => setChecklist({...checklist, [key]: !checklist[key as keyof typeof checklist]})}
                >
                    <div className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center transition-colors ${checklist[key as keyof typeof checklist] ? 'bg-stone-800 border-stone-800 text-white' : 'border-stone-300 group-hover:border-stone-400'}`}>
                    {checklist[key as keyof typeof checklist] && <Check size={10} />}
                    </div>
                    <div className="flex items-center gap-3 text-stone-700 font-serif text-sm">
                    <Icon size={16} className="text-stone-400" />
                    {label}
                    </div>
                </div>
                ))}
            </div>

            <button
              disabled={!allChecked || !selectedTaskId}
              onClick={() => setIsDeepWorkMode(true)}
              className={`w-full py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all border ${
                allChecked && selectedTaskId
                  ? 'bg-stone-800 text-white border-stone-800 hover:bg-stone-700' 
                  : 'bg-stone-100 text-stone-400 border-stone-100 cursor-not-allowed'
              }`}
            >
              Enter The Zone
            </button>
            {!selectedTaskId && (
                <p className="text-center text-[10px] text-red-400 uppercase tracking-wide">Please select a task first</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
      
      {/* Task Header */}
      <div className="mb-12 text-center max-w-2xl px-4">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Currently Focusing On</p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 leading-tight">
            {selectedTask?.title || "Unknown Task"}
        </h2>
      </div>

      {/* Animated SVG Timer */}
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
      
      {/* End Session Controls */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <button 
            onClick={() => setIsDeepWorkMode(false)}
            className="text-xs text-stone-300 hover:text-stone-500 uppercase tracking-widest"
        >
            Quit Session
        </button>
        
        {/* Completion Check */}
        <button 
            onClick={handleTaskCompletion}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 px-6 py-3 rounded-sm transition-all shadow-sm group"
        >
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Mark Task Complete</span>
        </button>
      </div>
    </div>
  );
};