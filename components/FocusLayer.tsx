
import React, { useState, useEffect, useMemo } from 'react';
import { Coffee, BellOff, Smartphone, Check, Target, CheckCircle2, Clock, Moon, Zap } from 'lucide-react';
import { Task, WeeklySchedule, TimeBlock, Settings } from '../types';
import { useNavigate } from 'react-router-dom';
import { FocusTimer } from './FocusTimer';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';

interface FocusLayerProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  schedule: WeeklySchedule;
  language?: Settings['language'];
}

export const FocusLayer: React.FC<FocusLayerProps> = ({ tasks, toggleTask, schedule, language = 'en' }) => {
  const navigate = useNavigate();
  const { playClick, playSuccess, playSoftClick } = useSound();
  
  const [isDeepWorkMode, setIsDeepWorkMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  const [checklist, setChecklist] = useState({
    phoneSilent: false,
    notificationsOff: false,
    waterReady: false,
  });

  const [currentTimeKey, setCurrentTimeKey] = useState<string>('');
  const [currentBlock, setCurrentBlock] = useState<TimeBlock | null>(null);

  // Reading language from props or fallback to 'en'
  const lang = language;

  useEffect(() => {
    const updateTimeContext = () => {
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'short' });
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        const mainKey = `${day}-${hour}`;
        const halfKey = `${day}-${hour}-30`;

        const mainBlock = schedule.ideal[mainKey];
        const halfBlock = schedule.ideal[halfKey];
        
        let foundBlock = null;

        if (minute < 30) {
           // First half of hour. 
           // If main block exists, use it.
           if (mainBlock) {
             foundBlock = mainBlock;
             setCurrentTimeKey(mainKey);
           }
        } else {
           // Second half.
           // If halfBlock exists, use it.
           // Else if mainBlock exists and is 60m, use it.
           if (halfBlock) {
              foundBlock = halfBlock;
              setCurrentTimeKey(halfKey);
           } else if (mainBlock && (mainBlock.duration === 60 || mainBlock.duration === undefined)) {
              foundBlock = mainBlock;
              setCurrentTimeKey(mainKey);
           }
        }

        if (foundBlock) {
            setCurrentBlock(foundBlock);
            const linkedTaskId = foundBlock.taskId;
            if (linkedTaskId && tasks.find(t => t.id === linkedTaskId && !t.completed)) {
                if (!selectedTaskId) setSelectedTaskId(linkedTaskId);
            }
        } else {
            setCurrentBlock(null);
            // Only update key if we didn't find a block, to show generic time
            if (!foundBlock) setCurrentTimeKey(`${day}-${hour}:${minute < 10 ? '0'+minute : minute}`);
        }
    };
    
    updateTimeContext();
    const interval = setInterval(updateTimeContext, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [schedule, tasks, selectedTaskId]);


  const FOCUS_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

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
      playSuccess(); // Play sound when timer ends
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(BREAK_DURATION);
      } else {
        setMode('focus');
        setTimeLeft(FOCUS_DURATION);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, playSuccess]);

  const toggleTimer = () => {
      playClick();
      setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    playClick();
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    if (isDeepWorkMode) setIsDeepWorkMode(false); // If exiting full screen mode
  };

  const handleTaskCompletion = () => {
    if (selectedTaskId) {
        toggleTask(selectedTaskId);
        playSuccess();
        setIsDeepWorkMode(false);
        setSelectedTaskId('');
        setChecklist({ phoneSilent: false, notificationsOff: false, waterReady: false });
    }
  };

  const allChecked = Object.values(checklist).every(Boolean);
  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

  if (!currentBlock && !isDeepWorkMode) {
      return (
          <div className="max-w-xl mx-auto mt-12 animate-fade-in p-8 text-center bg-white rounded-sm shadow-sm border border-stone-200">
             <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
                 <Moon size={40} />
             </div>
             <h2 className="text-3xl font-serif font-bold text-stone-800 mb-3">{t('focus_rest', lang)}</h2>
             <p className="text-stone-500 font-serif italic mb-8 leading-relaxed max-w-md mx-auto">
                 {t('focus_rest_desc', lang)}
                 <br/><br/>
                 {t('focus_rest_advice', lang)}
             </p>

             <div className="flex flex-col gap-3 max-w-xs mx-auto">
                 <button 
                    onClick={() => navigate('/plan')}
                    className="flex items-center justify-center gap-2 bg-stone-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-700 transition-all rounded-sm"
                 >
                    <Clock size={14} /> {t('focus_check_schedule', lang)}
                 </button>
                 <button 
                    onClick={() => navigate('/rewards')}
                    className="flex items-center justify-center gap-2 bg-white text-stone-600 border border-stone-200 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-600 transition-all rounded-sm"
                 >
                    <Coffee size={14} /> {t('focus_visit_shop', lang)}
                 </button>
             </div>
          </div>
      );
  }

  // Active Timer View (Full Screen Mode)
  if (isDeepWorkMode) {
      return (
        <FocusTimer 
            mode={mode}
            timeLeft={timeLeft}
            isActive={isActive}
            onToggle={toggleTimer}
            onReset={resetTimer}
            selectedTaskTitle={selectedTask?.title}
            language={lang}
        />
      );
  }

  // Setup View
  return (
    <div className="max-w-xl mx-auto mt-8 animate-fade-in pb-12">
      <div className="bg-white rounded-sm shadow-md border border-stone-200 overflow-hidden">
        {/* Dynamic Header */}
        <div className="bg-[#292524] p-10 text-stone-100 text-center border-b border-stone-800 relative transition-all duration-300">
          {selectedTask ? (
            <div className="animate-fade-in space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <Target size={14} />
                    <span>{t('focus_active_target', lang)}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight break-words">{selectedTask.title}</h2>
                {selectedTask.purpose && (
                    <p className="text-stone-400 font-serif italic max-w-lg mx-auto text-sm">{selectedTask.purpose}</p>
                )}
            </div>
          ) : (
            <>
                <h2 className="text-4xl font-serif font-bold mb-3">{t('focus_deep', lang)}</h2>
                <p className="text-stone-400 font-serif italic">{t('focus_quote', lang)}</p>
            </>
          )}
          
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono font-bold text-stone-300">
                  {currentTimeKey.includes(':') ? currentTimeKey.split('-')[1] : currentTimeKey.replace('-', ' @ ') + (currentTimeKey.includes('-30') ? ':30' : ':00')}
              </span>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          
          {currentBlock && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-sm flex items-start gap-4 shadow-sm">
                  <div className="p-3 bg-white rounded-full border border-amber-100 text-amber-600">
                      <Clock size={20} />
                  </div>
                  <div>
                      <div className="text-[10px] uppercase tracking-widest text-amber-700 font-bold mb-1">{t('focus_scheduled_now', lang)}</div>
                      <div className="font-serif text-stone-800 font-bold text-xl">{currentBlock.label}</div>
                      <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${currentBlock.category === 'DEEP' ? 'bg-stone-800' : 'bg-emerald-500'}`}></div>
                            {currentBlock.category} {t('focus_category', lang)}
                            {currentBlock.duration === 30 && <span className="ml-1 px-1 bg-amber-200 text-amber-800 rounded text-[8px]">{t('task_30m', lang)}</span>}
                      </div>
                  </div>
              </div>
          )}

          <div className="bg-[#FAF9F6] p-6 border border-stone-200 rounded-sm">
              <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-stone-800 font-bold uppercase tracking-widest text-xs">
                      <Target size={14} />
                      <span>{t('focus_select_target', lang)}</span>
                  </div>
                  <button onClick={() => navigate('/tasks')} className="text-[10px] text-stone-400 hover:text-stone-600 underline">{t('focus_manage_tasks', lang)}</button>
              </div>
              
              {tasks.filter(t => !t.completed).length === 0 ? (
                  <div className="text-stone-400 text-sm italic py-4 text-center border border-dashed border-stone-300 rounded">
                      {t('focus_no_tasks', lang)}
                  </div>
              ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                      {tasks.filter(t => !t.completed).map(task => {
                          const isScheduledNow = currentBlock?.taskId === task.id;
                          const isSelected = selectedTaskId === task.id;
                          
                          return (
                              <div 
                                  key={task.id}
                                  onClick={() => { setSelectedTaskId(task.id); playSoftClick(); }}
                                  className={`p-4 rounded-sm border cursor-pointer transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${
                                      isSelected 
                                      ? 'bg-stone-800 text-white border-stone-800 shadow-xl transform scale-[1.02] z-10' 
                                      : isScheduledNow 
                                          ? 'bg-amber-50 border-amber-300 text-stone-800 shadow-sm hover:shadow-md' 
                                          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600 hover:shadow-md'
                                  }`}
                              >
                                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 animate-pulse"></div>}
                                  <div className="flex flex-col overflow-hidden flex-1">
                                      <div className="flex items-center gap-2">
                                          {isScheduledNow && <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isSelected ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-800'}`}>Now</span>}
                                          <span className="text-sm font-serif truncate font-medium">{task.title}</span>
                                      </div>
                                  </div>
                                  {isSelected && <Check size={16} className="text-emerald-400 ml-3" />}
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>

          <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">{t('focus_checklist', lang)}</div>
              {[
              { key: 'phoneSilent', label: t('focus_phone', lang), icon: Smartphone },
              { key: 'notificationsOff', label: t('focus_notif', lang), icon: BellOff },
              { key: 'waterReady', label: t('focus_water', lang), icon: Coffee },
              ].map(({ key, label, icon: Icon }) => (
              <div 
                  key={key}
                  className={`flex items-center p-3 border rounded-sm transition-all cursor-pointer group ${checklist[key as keyof typeof checklist] ? 'bg-stone-50 border-stone-400' : 'border-stone-100 hover:border-stone-200'}`}
                  onClick={() => {
                      setChecklist({...checklist, [key]: !checklist[key as keyof typeof checklist]});
                      playSoftClick();
                  }}
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
            onClick={() => { setIsDeepWorkMode(true); playSuccess(); setIsActive(true); }}
            className={`w-full py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-3 ${
              allChecked && selectedTaskId
                ? 'bg-stone-800 text-white border-stone-800 hover:bg-stone-700 shadow-md hover:shadow-lg transform active:scale-95' 
                : 'bg-stone-100 text-stone-400 border-stone-100 cursor-not-allowed'
            }`}
          >
            <Zap size={16} className={allChecked && selectedTaskId ? "text-amber-400 fill-amber-400" : ""} />
            {t('focus_enter_btn', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
