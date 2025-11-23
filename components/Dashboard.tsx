import React, { useState } from 'react';
import { Sparkles, Target, Calendar, Heart, Quote, PenLine } from 'lucide-react';
import { AppState, DailyQuests } from '../types';

interface DashboardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, updateState }) => {
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [niyyahInput, setNiyyahInput] = useState(state.currentNiyyah);

  const toggleQuest = (category: keyof DailyQuests) => {
    updateState({
      dailyQuests: {
        ...state.dailyQuests,
        [category]: {
          ...state.dailyQuests[category],
          completed: !state.dailyQuests[category].completed,
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
    updateState({ currentNiyyah: niyyahInput });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header / Niyyah Setter */}
      <div className="bg-[#2c2a26] text-stone-200 p-8 rounded-sm shadow-md relative overflow-hidden border-t-4 border-amber-600">
        <div className="absolute top-0 right-0 p-6 opacity-10 text-stone-400">
          <Quote size={140} />
        </div>
        <h1 className="text-3xl font-serif mb-3 text-amber-50">Intentionality First</h1>
        <p className="text-stone-400 mb-8 max-w-xl font-light leading-relaxed">
          Before you begin, anchor your heart. What is the ultimate meaning (Niyyah) behind your actions today?
        </p>
        <div className="flex gap-0 max-w-2xl border-b border-stone-600 focus-within:border-amber-500 transition-colors">
          <input
            type="text"
            value={niyyahInput}
            onChange={(e) => setNiyyahInput(e.target.value)}
            placeholder="e.g., To seek beneficial knowledge..."
            className="flex-1 bg-transparent px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:outline-none font-serif italic text-lg"
          />
          <button 
            onClick={saveNiyyah}
            className="text-stone-400 hover:text-amber-400 px-6 py-3 font-medium transition-colors uppercase text-xs tracking-widest"
          >
            Set Intention
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
        {/* The Thing Focus Box */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 col-span-1 relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-stone-100"></div>
           <div className="absolute top-4 right-4 text-stone-300">
            <Target size={20} />
           </div>
          <h2 className="text-xl font-serif font-bold text-stone-800 mb-1">The "Thing"</h2>
          <p className="text-xs uppercase tracking-wider text-stone-400 mb-6">
            Intrinsic Fulfillment
          </p>
          <textarea
            value={state.theThing}
            onChange={(e) => updateState({ theThing: e.target.value })}
            placeholder="What would you do even if you weren't paid?"
            className="w-full h-40 p-4 bg-[#FAF9F6] rounded-sm border-l-2 border-amber-200 focus:border-amber-400 outline-none resize-none text-stone-700 font-serif leading-relaxed text-sm"
          />
        </div>

        {/* 12-Month Celebration */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 col-span-1 lg:col-span-2 relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-stone-100"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-800 mb-1">12-Month Vision</h2>
              <p className="text-xs uppercase tracking-wider text-stone-400">Future Celebration</p>
            </div>
            <button 
              onClick={() => setIsEditingVision(!isEditingVision)}
              className="text-stone-400 hover:text-stone-600 p-2"
            >
              <PenLine size={18} />
            </button>
          </div>
          {isEditingVision ? (
            <textarea
              value={state.celebrationVision}
              onChange={(e) => updateState({ celebrationVision: e.target.value })}
              className="w-full h-40 p-4 bg-[#FAF9F6] rounded-sm border border-stone-200 focus:border-stone-400 outline-none font-serif text-stone-700 leading-7"
              placeholder="Describe exactly what you are celebrating one year from now..."
            />
          ) : (
            <div className="w-full h-40 p-6 bg-[#FAF9F6] rounded-sm border border-stone-100 overflow-y-auto font-serif text-stone-700 leading-7 italic relative">
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

      {/* Daily Side Quests */}
      <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-900/10"></div>
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="text-emerald-800" size={20} />
          <h2 className="text-xl font-serif font-bold text-stone-800">Daily Side Quests</h2>
          <span className="text-[10px] uppercase tracking-widest border border-emerald-800 text-emerald-900 px-2 py-0.5 rounded-full ml-2">
            Happiness of Pursuit
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['work', 'health', 'relationship'] as const).map((cat) => (
            <div key={cat} className="group relative bg-[#fffef0] p-1 shadow-sm rotate-0 hover:-rotate-1 transition-transform duration-300">
              {/* Sticky note tape look */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-yellow-200/50 rotate-1"></div>
              
              <div className="h-full p-5 border border-stone-100 flex flex-col">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
                  {cat}
                </div>
                <input
                  type="text"
                  value={state.dailyQuests[cat].title}
                  onChange={(e) => updateQuestTitle(cat, e.target.value)}
                  placeholder="..."
                  className={`w-full bg-transparent pb-1 mb-4 focus:outline-none font-serif text-lg ${state.dailyQuests[cat].completed ? 'line-through text-stone-300' : 'text-stone-800'}`}
                />
                <button
                  onClick={() => toggleQuest(cat)}
                  className={`mt-auto w-full py-2 text-xs font-bold uppercase tracking-widest transition-all border ${
                    state.dailyQuests[cat].completed
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                      : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
                  }`}
                >
                  {state.dailyQuests[cat].completed ? 'Done' : 'Complete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};