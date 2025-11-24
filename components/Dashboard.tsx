
import React, { useState, useMemo } from 'react';
import { Target, Calendar, Heart, Quote, PenLine, CheckSquare, Sparkles, Feather, Activity, Box, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { AppState, DailyQuests } from '../types';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, updateState }) => {
  const navigate = useNavigate();
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [isVisionExpanded, setIsVisionExpanded] = useState(false);
  const [niyyahInput, setNiyyahInput] = useState(state.currentNiyyah);
  const { playSuccess, playClick, playAdd, playSoftClick } = useSound();
  const lang = state.settings.language;

  const greeting = useMemo(() => {
     const hour = new Date().getHours();
     if (hour < 12) return t('dash_greeting_morning', lang);
     if (hour < 18) return t('dash_greeting_afternoon', lang);
     return t('dash_greeting_evening', lang);
  }, [lang]);

  const toggleQuest = (category: keyof DailyQuests) => {
    const isCompleted = !state.dailyQuests[category].completed;
    if (isCompleted) playSuccess(); else playClick();
    
    updateState({
      dailyQuests: {
        ...state.dailyQuests,
        [category]: {
          ...state.dailyQuests[category],
          completed: isCompleted,
        },
      },
    });
  };

  const updateQuestTitle = (category: keyof DailyQuests, title: string) => {
    updateState({
      dailyQuests: {
        ...state.dailyQuests,
        [category]: { ...state.dailyQuests[category], title },
      },
    });
  };

  const saveNiyyah = () => {
    if (niyyahInput !== state.currentNiyyah) {
        playAdd();
        updateState({ currentNiyyah: niyyahInput });
    }
  };

  const activeTaskCount = state.tasks.filter(t => !t.completed).length;
  const cardsDueCount = state.flashcards.filter(c => c.nextReview < Date.now()).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* 1. Header: Greeting & Intention */}
      <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between pb-6 border-b border-stone-200">
          <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{state.userName} — {t('dash_subtitle', lang)}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-800 tracking-tight">{greeting}.</h1>
          </div>
          <div className="w-full md:w-1/2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-2">
                <Sparkles size={10} className="text-amber-500" />
                {t('dash_intent_label', lang)}
             </label>
             <input
                type="text"
                value={niyyahInput}
                onChange={(e) => setNiyyahInput(e.target.value)}
                onBlur={saveNiyyah}
                onKeyDown={(e) => e.key === 'Enter' && saveNiyyah()}
                placeholder={t('dash_intent_placeholder', lang)}
                className="w-full bg-transparent text-xl md:text-2xl font-serif italic text-stone-700 placeholder:text-stone-300 border-b-2 border-stone-100 focus:border-amber-400 focus:outline-none py-2 transition-all"
             />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 2. Main Objective (The Thing) */}
          <div className="lg:col-span-2 bg-[#1c1917] text-stone-100 p-8 rounded-sm shadow-xl flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12">
                <Feather size={200} />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-2 text-stone-400 mb-4">
                   <Target size={18} className="text-amber-500" />
                   <span className="text-xs font-bold uppercase tracking-widest">{t('dash_thing_title', lang)}</span>
                </div>
                
                <textarea
                  value={state.theThing}
                  onChange={(e) => updateState({ theThing: e.target.value })}
                  placeholder={t('dash_thing_placeholder', lang)}
                  className="w-full bg-transparent text-2xl md:text-3xl font-serif font-bold text-white placeholder:text-stone-600 outline-none resize-none h-32"
                />
             </div>

             <div className="relative z-10 mt-6 pt-6 border-t border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-500 uppercase tracking-wider">{t('dash_thing_sub', lang)}</span>
                <button onClick={() => navigate('/focus')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-stone-800 hover:bg-amber-600 text-white px-4 py-2 rounded-sm transition-colors">
                   <Zap size={14} /> {t('dash_focus_now', lang)}
                </button>
             </div>
          </div>

          {/* 3. Status Grid */}
          <div className="grid grid-cols-1 gap-4">
              {/* Balance */}
              <div onClick={() => navigate('/rewards')} className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors group">
                 <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-emerald-600 transition-colors">{t('dash_balance', lang)}</span>
                    <div className="text-3xl font-mono font-bold text-stone-800 mt-1">{state.blockBalance}</div>
                 </div>
                 <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                    <Box size={24} />
                 </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                 <div onClick={() => navigate('/tasks')} className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm cursor-pointer hover:border-stone-400 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t('dash_tasks_active', lang)}</span>
                    <div className="text-2xl font-serif font-bold text-stone-800 mt-1">{activeTaskCount}</div>
                 </div>
                 <div onClick={() => navigate('/psych')} className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm cursor-pointer hover:border-stone-400 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t('dash_cards_due', lang)}</span>
                    <div className="text-2xl font-serif font-bold text-stone-800 mt-1">{cardsDueCount}</div>
                 </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 4. Daily Protocols (Quests) */}
        <div className="lg:col-span-5 bg-white p-8 rounded-sm shadow-sm border border-stone-200 h-full">
            <div className="flex items-center gap-2 mb-8">
               <Activity size={18} className="text-stone-400" />
               <h3 className="font-serif font-bold text-xl text-stone-800">{t('dash_quests_title', lang)}</h3>
            </div>
            
            <div className="space-y-6">
                {(['work', 'health', 'relationship'] as const).map((cat) => (
                    <div key={cat} className="group">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-focus-within:text-amber-600 transition-colors">{t(`quest_${cat}`, lang)}</span>
                        <button 
                            onClick={() => toggleQuest(cat)}
                            className={`transition-colors p-1 rounded-sm hover:bg-stone-50 ${state.dailyQuests[cat].completed ? 'text-emerald-500' : 'text-stone-200 group-hover:text-stone-300'}`}
                        >
                            <CheckSquare size={18} />
                        </button>
                    </div>
                    <input
                        type="text"
                        value={state.dailyQuests[cat].title}
                        onChange={(e) => updateQuestTitle(cat, e.target.value)}
                        placeholder={t('dash_quests_placeholder', lang)}
                        className={`w-full bg-transparent border-b ${state.dailyQuests[cat].completed ? 'border-emerald-200 text-stone-400 line-through' : 'border-stone-100 text-stone-700'} focus:border-stone-800 outline-none py-2 font-serif text-lg transition-all`}
                    />
                    </div>
                ))}
            </div>
        </div>

        {/* 5. The Vision (Collapsible) */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-8 rounded-sm shadow-sm border border-stone-200 relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-stone-200"></div>
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-xl font-serif font-bold text-stone-800">{t('dash_vision_title', lang)}</h2>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mt-1">{t('dash_vision_sub', lang)}</p>
               </div>
               <div className="flex gap-2">
                   <button 
                     onClick={() => setIsVisionExpanded(!isVisionExpanded)}
                     className="p-2 text-stone-400 hover:text-stone-800 transition-colors"
                     title={isVisionExpanded ? t('dash_collapse_vision', lang) : t('dash_expand_vision', lang)}
                   >
                     {isVisionExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                   </button>
                   <button 
                     onClick={() => { setIsEditingVision(!isEditingVision); playClick(); if (!isVisionExpanded) setIsVisionExpanded(true); }}
                     className={`p-2 transition-colors ${isEditingVision ? 'text-amber-600 bg-amber-50 rounded-sm' : 'text-stone-400 hover:text-stone-800'}`}
                   >
                     <PenLine size={18} />
                   </button>
               </div>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isVisionExpanded ? 'flex-1 min-h-[300px]' : 'h-32'}`}>
                {isEditingVision ? (
                   <textarea
                     value={state.celebrationVision}
                     onChange={(e) => updateState({ celebrationVision: e.target.value })}
                     className="w-full h-full p-4 bg-white rounded-sm border border-stone-200 focus:border-stone-400 outline-none font-serif text-stone-700 leading-8 resize-none text-lg"
                     placeholder={t('dash_vision_placeholder', lang)}
                     autoFocus
                   />
                ) : (
                   <div className="prose prose-stone max-w-none font-serif text-stone-700 leading-8 text-lg relative h-full">
                      {state.celebrationVision ? (
                        state.celebrationVision.split('\n').map((line, i) => (
                          <p key={i} className="mb-4">{line}</p>
                        ))
                      ) : (
                        <p className="text-stone-400 italic text-center mt-8">{t('dash_vision_empty', lang)}</p>
                      )}
                      {!isVisionExpanded && (
                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF9F6] to-transparent pointer-events-none flex items-end justify-center pb-2">
                              <ChevronDown className="text-stone-300 animate-bounce" size={20} />
                          </div>
                      )}
                   </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
