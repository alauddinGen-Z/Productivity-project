
import React, { useState } from 'react';
import { Target, Calendar, Heart, Quote, PenLine, CheckSquare } from 'lucide-react';
import { AppState, DailyQuests } from '../types';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';

interface DashboardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, updateState }) => {
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [niyyahInput, setNiyyahInput] = useState(state.currentNiyyah);
  const { playSuccess, playClick, playAdd, playSoftClick } = useSound();
  const lang = state.settings.language;

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
    playAdd();
    updateState({ currentNiyyah: niyyahInput });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header / Niyyah Setter */}
      <div className="bg-[#2c2a26] text-stone-200 p-8 rounded-sm shadow-md relative overflow-hidden border-t-4 border-amber-600">
        <div className="absolute top-0 right-0 p-6 opacity-10 text-stone-400">
          <Quote size={140} />
        </div>
        <h1 className="text-3xl font-serif mb-3 text-amber-50">{t('dash_intent_title', lang)}</h1>
        <p className="text-stone-400 mb-8 max-w-xl font-light leading-relaxed">
          {t('dash_intent_desc', lang)}
        </p>
        <div className="flex gap-0 max-w-2xl border-b border-stone-600 focus-within:border-amber-500 transition-colors">
          <input
            type="text"
            value={niyyahInput}
            onChange={(e) => setNiyyahInput(e.target.value)}
            onFocus={() => playSoftClick()}
            placeholder={t('dash_intent_placeholder', lang)}
            className="flex-1 bg-transparent px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:outline-none font-serif italic text-lg"
          />
          <button 
            onClick={saveNiyyah}
            className="text-stone-400 hover:text-amber-400 px-6 py-3 font-medium transition-colors uppercase text-xs tracking-widest"
          >
            {t('dash_set_btn', lang)}
          </button>
        </div>
        {state.currentNiyyah && (
          <div className="mt-6 flex items-center gap-3 text-amber-400/80 text-sm font-serif italic">
            <Heart size={14} className="fill-amber-400/80" />
            <span>Intention set.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 12-Month Celebration (Expanded to Full Width) */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 col-span-1 lg:col-span-3 relative h-96 flex flex-col">
           <div className="absolute top-0 left-0 w-full h-1 bg-stone-100"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-800 mb-1">{t('dash_vision_title', lang)}</h2>
              <p className="text-xs uppercase tracking-wider text-stone-400">{t('dash_vision_sub', lang)}</p>
            </div>
            <button 
              onClick={() => { setIsEditingVision(!isEditingVision); playClick(); }}
              className="text-stone-400 hover:text-stone-600 p-2"
            >
              <PenLine size={18} />
            </button>
          </div>
          {isEditingVision ? (
            <textarea
              value={state.celebrationVision}
              onChange={(e) => updateState({ celebrationVision: e.target.value })}
              className="w-full flex-1 p-4 bg-[#FAF9F6] rounded-sm border border-stone-200 focus:border-stone-400 outline-none font-serif text-stone-700 leading-7 resize-none"
              placeholder="Describe exactly what you are celebrating one year from now..."
            />
          ) : (
            <div className="w-full flex-1 p-6 bg-[#FAF9F6] rounded-sm border border-stone-100 overflow-y-auto font-serif text-stone-700 leading-7 italic relative">
              {/* Paper lines decoration */}
              <div className="absolute inset-0 pointer-events-none lined-paper opacity-30"></div>
              <div className="relative z-10">
                {state.celebrationVision ? (
                  state.celebrationVision
                ) : (
                  <span className="text-stone-400">"Write the vision and make it plain..."</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The Thing Focus Box */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-stone-100"></div>
           <div className="absolute top-4 right-4 text-stone-300">
            <Target size={20} />
           </div>
          <h2 className="text-xl font-serif font-bold text-stone-800 mb-1">{t('dash_thing_title', lang)}</h2>
          <p className="text-xs uppercase tracking-wider text-stone-400 mb-6">
            {t('dash_thing_sub', lang)}
          </p>
          <textarea
            value={state.theThing}
            onChange={(e) => updateState({ theThing: e.target.value })}
            onFocus={() => playSoftClick()}
            placeholder="What would you do even if you weren't paid?"
            className="w-full h-32 p-4 bg-[#FAF9F6] rounded-sm border-l-2 border-amber-200 focus:border-amber-400 outline-none resize-none text-stone-700 font-serif leading-relaxed text-sm"
          />
        </div>

        {/* Daily Side Quests */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-900/10"></div>
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="text-emerald-800" size={20} />
            <div>
               <h2 className="text-xl font-serif font-bold text-stone-800">{t('dash_quests_title', lang)}</h2>
               <p className="text-xs uppercase tracking-wider text-stone-400">{t('dash_quests_sub', lang)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {(['work', 'health', 'relationship'] as const).map((cat) => (
              <div key={cat} className="flex items-center gap-4">
                 <div className="w-24 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">
                    {cat}
                 </div>
                 <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={state.dailyQuests[cat].title}
                      onChange={(e) => updateQuestTitle(cat, e.target.value)}
                      placeholder="..."
                      className={`w-full bg-[#FAF9F6] px-3 py-2 border-b border-stone-200 focus:border-emerald-500 outline-none font-serif text-sm transition-colors ${state.dailyQuests[cat].completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}
                    />
                    <button
                      onClick={() => toggleQuest(cat)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${
                        state.dailyQuests[cat].completed 
                        ? 'bg-emerald-600 text-white opacity-100' 
                        : 'bg-stone-200 text-stone-400 opacity-0 group-hover:opacity-100 hover:bg-emerald-100 hover:text-emerald-600'
                      }`}
                    >
                       <CheckSquare size={12} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
