
import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { BarChart3, Trophy, CheckCircle, Clock, Archive } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface WeeklyReviewProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ state, updateState }) => {
  const [wins, setWins] = useState(['', '', '']);
  const [alignment, setAlignment] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { playSuccess, playSoftClick, playAdd } = useSound();

  // Dynamic Stats Calculation
  const stats = useMemo(() => {
    // 1. Task Completions
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.completed).length;
    
    // 2. Frogs Eaten (High Priority)
    const frogsCompleted = state.tasks.filter(t => t.isFrog && t.completed).length;
    const totalFrogs = state.tasks.filter(t => t.isFrog).length;

    // 3. Schedule Adherence (Reality vs Ideal)
    const idealBlocks = Object.keys(state.weeklySchedule.ideal).length;
    const realBlocks = Object.keys(state.weeklySchedule.current).length;
    const adherence = idealBlocks > 0 ? Math.round((realBlocks / idealBlocks) * 100) : 0;

    return { completedTasks, totalTasks, frogsCompleted, totalFrogs, adherence };
  }, [state]);

  const handleSave = () => {
    if (isSaved) return;
    playSuccess();

    const today = new Date().toISOString().split('T')[0];
    const content = JSON.stringify({
        wins: wins.filter(w => w.trim()),
        alignment: alignment,
        stats: stats
    });

    const newReflection = {
        date: today,
        content: content
    };

    updateState({
        reflections: [...state.reflections, newReflection]
    });
    
    setIsSaved(true);
  };

  const handleWinChange = (index: number, value: string) => {
    const newWins = [...wins];
    newWins[index] = value;
    setWins(newWins);
  };

  if (isSaved) {
      return (
          <div className="flex flex-col items-center justify-center h-[500px] animate-fade-in text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                  <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">Review Archived</h2>
              <p className="text-stone-500 font-serif italic">Your insights have been captured for the future.</p>
              <button 
                onClick={() => { setIsSaved(false); playAdd(); }}
                className="mt-8 text-stone-400 hover:text-stone-600 underline text-sm"
              >
                  Edit Review
              </button>
          </div>
      );
  }

  return (
    <div className="bg-white p-10 rounded-sm shadow-sm border border-stone-200 text-center max-w-3xl mx-auto mt-10 animate-fade-in">
      <div className="inline-block p-4 bg-stone-50 rounded-full mb-6">
         <BarChart3 size={32} className="text-stone-400" />
      </div>
      <h2 className="text-3xl font-serif font-bold text-stone-800">Weekly Reflection</h2>
      <p className="text-stone-500 mt-2 mb-10 font-serif italic">"Measure the Gain, not the Gap."</p>
      
      {/* Automated Data Insight Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-4 border border-stone-100 bg-[#FAF9F6] rounded-sm">
            <CheckCircle className="mx-auto text-stone-300 mb-2" size={20} />
            <div className="text-2xl font-serif font-bold text-stone-800">{stats.completedTasks}</div>
            <div className="text-[10px] uppercase tracking-widest text-stone-400">Tasks Completed</div>
        </div>
        <div className="p-4 border border-stone-100 bg-[#FAF9F6] rounded-sm">
            <Trophy className="mx-auto text-amber-300 mb-2" size={20} />
            <div className="text-2xl font-serif font-bold text-stone-800">{stats.frogsCompleted} <span className="text-base text-stone-300 font-normal">/ {stats.totalFrogs}</span></div>
            <div className="text-[10px] uppercase tracking-widest text-stone-400">Frogs Eaten</div>
        </div>
        <div className="p-4 border border-stone-100 bg-[#FAF9F6] rounded-sm">
            <Clock className="mx-auto text-stone-300 mb-2" size={20} />
            <div className="text-2xl font-serif font-bold text-stone-800">{stats.adherence}%</div>
            <div className="text-[10px] uppercase tracking-widest text-stone-400">Schedule Adherence</div>
        </div>
      </div>

      <div className="bg-paper-dark p-8 rounded-sm text-left space-y-8 border border-stone-200">
        <div>
          <p className="font-serif font-bold text-lg text-stone-700 mb-2">1. Three Wins This Week</p>
          <div className="space-y-2">
            {wins.map((win, i) => (
                <input 
                    key={i}
                    value={win}
                    onChange={(e) => handleWinChange(i, e.target.value)}
                    onFocus={() => playSoftClick()}
                    className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-stone-700 placeholder:text-stone-400 font-serif transition-colors" 
                    placeholder={`Win ${i + 1}...`} 
                />
            ))}
          </div>
        </div>
        
        <div>
          <p className="font-serif font-bold text-lg text-stone-700 mb-2">2. Niyyah Alignment Check</p>
          <p className="text-xs text-stone-400 mb-2">My intention was: <span className="italic">"{state.currentNiyyah}"</span></p>
          <textarea 
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            onFocus={() => playSoftClick()}
            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 h-20 resize-none text-stone-700 placeholder:text-stone-400 font-serif leading-relaxed transition-colors" 
            placeholder="Did my actions align with my intentions? What distracted me?"
          ></textarea>
        </div>
      </div>
      
      <button 
        onClick={handleSave}
        className="mt-8 bg-stone-800 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-700 transition-colors flex items-center gap-2 mx-auto"
      >
        <Archive size={16} />
        Complete Review & Archive
      </button>
    </div>
  );
};
