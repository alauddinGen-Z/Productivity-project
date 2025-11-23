
import React, { useState, useEffect } from 'react';
import { Target, Calendar, Heart, Quote, PenLine, CheckSquare, Clock } from 'lucide-react';
import { AppState, DailyQuests, TimeBlock } from '../types';

interface DashboardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, updateState }) => {
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [niyyahInput, setNiyyahInput] = useState(state.currentNiyyah);
  const [todayKey, setTodayKey] = useState<string>('Mon');

  useEffect(() => {
    // Get current day abbreviation (Mon, Tue, etc.)
    const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    setTodayKey(day);
  }, []);

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

  // --- Logic for Scheduled Blocks ---
  // 1. Get Ideal blocks for today
  // 2. Check if they exist in 'current' (Reality)
  const getDailySchedule = () => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm
    
    return hours.map(hour => {
      const key = `${todayKey}-${hour}`;
      const idealBlock = state.weeklySchedule.ideal[key];
      const realBlock = state.weeklySchedule.current[key];
      
      if (!idealBlock) return null;

      return {
        hour,
        key,
        ideal: idealBlock,
        isCompleted: !!realBlock // It's "completed" if it exists in Reality map
      };
    }).filter(Boolean) as { hour: number, key: string, ideal: TimeBlock, isCompleted: boolean }[];
  };

  const toggleScheduleBlock = (key: string, idealBlock: TimeBlock) => {
    const currentMap = { ...state.weeklySchedule.current };
    
    if (currentMap[key]) {
      // Remove from reality (uncheck)
      delete currentMap[key];
    } else {
      // Add to reality (check)
      currentMap[key] = idealBlock;
    }

    updateState({
      weeklySchedule: {
        ...state.weeklySchedule,
        current: currentMap
      }
    });
  };

  const scheduledItems = getDailySchedule();

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
        
        {/* Today's Blueprint (Linked from Schedule) */}
        <div className="bg-white p-0 rounded-sm shadow-sm border border-stone-200 col-span-1 lg:col-span-1 flex flex-col h-96">
           <div className="p-6 border-b border-stone-100 bg-[#FAF9F6]">
             <div className="flex items-center gap-2 mb-1">
                <Clock size={18} className="text-stone-400" />
                <h2 className="text-lg font-serif font-bold text-stone-800">Today's Blueprint</h2>
             </div>
             <p className="text-[10px] uppercase tracking-wider text-stone-400">
               {todayKey}'s Plan • Click to Complete
             </p>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
             {scheduledItems.length === 0 ? (
               <div className="text-center mt-10 text-stone-400 font-serif italic text-sm">
                 No schedule planned for {todayKey}.<br/>Go to "Time Structure" to plan.
               </div>
             ) : (
               scheduledItems.map((item) => (
                 <div 
                   key={item.key}
                   onClick={() => toggleScheduleBlock(item.key, item.ideal)}
                   className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all group ${
                     item.isCompleted 
                       ? 'bg-stone-50 border-stone-200 opacity-60' 
                       : 'bg-white border-stone-200 hover:border-stone-800 hover:shadow-sm'
                   }`}
                 >
                   <div className="w-10 text-xs font-bold text-stone-400 font-mono text-right">
                     {item.hour}:00
                   </div>
                   <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                     item.isCompleted ? 'bg-stone-800 border-stone-800' : 'border-stone-300'
                   }`}>
                     {item.isCompleted && <CheckSquare size={10} className="text-white" />}
                   </div>
                   <div className={`flex-1 text-sm font-serif ${item.isCompleted ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                     {item.ideal.label}
                   </div>
                   <div className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-500`}>
                     {item.ideal.category.substring(0,1)}
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* 12-Month Celebration */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 col-span-1 lg:col-span-2 relative h-96 flex flex-col">
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
          <h2 className="text-xl font-serif font-bold text-stone-800 mb-1">The "Thing"</h2>
          <p className="text-xs uppercase tracking-wider text-stone-400 mb-6">
            Intrinsic Fulfillment
          </p>
          <textarea
            value={state.theThing}
            onChange={(e) => updateState({ theThing: e.target.value })}
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
               <h2 className="text-xl font-serif font-bold text-stone-800">Daily Side Quests</h2>
               <p className="text-xs uppercase tracking-wider text-stone-400">Happiness of Pursuit</p>
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