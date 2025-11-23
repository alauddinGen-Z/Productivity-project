
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, CornerDownRight, Tag, BarChart2, Clock, X, Calendar, ChevronDown, Zap } from 'lucide-react';
import { WeeklySchedule, Task, TaskQuadrant } from '../types';
import { useSound } from '../hooks/useSound';

interface TaskCreationFormProps {
  onAddTask: (task: Partial<Task>, slot: {key: string, label: string, hour: number} | null) => void;
  schedule: WeeklySchedule;
}

export const TaskCreationForm: React.FC<TaskCreationFormProps> = ({ onAddTask, schedule }) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [purpose, setPurpose] = useState('');
  const [blocks, setBlocks] = useState(1);
  
  const [slot, setSlot] = useState<{key: string, label: string, hour: number} | null>(null);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeMenuRef = useRef<HTMLDivElement>(null);
  const { playClick, playAdd } = useSound();

  const todayKey = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'short' }), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeMenuRef.current && !timeMenuRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableSlots = useMemo(() => {
      const hours = Array.from({ length: 16 }, (_, i) => i + 6);
      const slots = [];
      for (const h of hours) {
          const key = `${todayKey}-${h}`;
          const block = schedule.ideal[key];
          if (block) {
              slots.push({
                  key,
                  hour: h,
                  label: block.label,
                  category: block.category,
                  isBusy: !!block.taskId 
              });
          }
      }
      return slots;
  }, [schedule.ideal, todayKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const newTaskPart: Partial<Task> = {
      title,
      tags: newTags,
      purpose,
      blocks,
      quadrant: TaskQuadrant.SCHEDULE,
      isFrog: false,
      createdAt: Date.now()
    };

    onAddTask(newTaskPart, slot);

    // Reset Form
    setTitle('');
    setTags('');
    setPurpose('');
    setBlocks(1);
    setSlot(null);
  };

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 transition-all duration-300 focus-within:ring-1 focus-within:ring-stone-200">
      <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-stone-100 rounded-full text-stone-400">
                    <Plus size={18} />
                 </div>
                 <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-transparent text-xl font-serif text-stone-800 placeholder:text-stone-300 focus:outline-none"
                 />
              </div>

              <div className="pl-12 space-y-3">
                 <div className="flex items-start gap-2">
                    <CornerDownRight size={14} className="text-amber-500 mt-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Why is this important? (Connect to Niyyah/Goal)"
                      className="flex-1 bg-amber-50/50 px-3 py-2 text-sm font-serif italic text-stone-600 focus:bg-amber-50 focus:outline-none rounded-sm placeholder:text-amber-700/30 transition-colors"
                    />
                 </div>

                 <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Tag size={14} className="text-stone-300 flex-shrink-0 ml-1" />
                        <input 
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="Tags (comma separated)..."
                          className="w-full bg-transparent text-xs text-stone-500 focus:outline-none placeholder:text-stone-300 ml-1"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-sm border border-stone-100">
                      <BarChart2 size={12} className="text-stone-400" />
                      <span className="text-xs text-stone-400 font-bold uppercase">Difficulty:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(level => (
                           <button
                              key={level}
                              type="button"
                              onClick={() => { setBlocks(level); playClick(); }}
                              className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${blocks === level ? 'bg-stone-800 text-white' : 'bg-white text-stone-400 border border-stone-200 hover:border-stone-400'}`}
                           >
                             {level}
                           </button>
                        ))}
                      </div>
                      <span className="text-[9px] text-stone-400 ml-1">Blocks</span>
                    </div>

                    <div className="relative" ref={timeMenuRef}>
                        {slot ? (
                            <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-sm border border-amber-300">
                                <Clock size={12} className="text-amber-700" />
                                <span className="text-xs font-bold text-amber-800 font-mono">
                                  {todayKey} @ {slot.hour}:00
                                </span>
                                <button 
                                  type="button"
                                  onClick={() => setSlot(null)}
                                  className="ml-2 text-amber-600 hover:text-amber-800"
                                >
                                  <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <button
                              type="button"
                              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                              className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-sm border border-stone-200 hover:border-stone-400 transition-colors text-xs text-stone-500"
                            >
                                <Calendar size={12} />
                                <span>Pick Available Time</span>
                                <ChevronDown size={10} />
                            </button>
                        )}

                        {isTimeDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-stone-200 shadow-xl rounded-sm z-50 animate-fade-in max-h-60 overflow-y-auto custom-scrollbar">
                                <div className="p-2 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 sticky top-0">
                                    {todayKey}'s Time Blocks
                                </div>
                                {availableSlots.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-stone-400 italic">
                                        No blocks in Schedule for today.
                                    </div>
                                ) : (
                                    availableSlots.map(s => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => {
                                                if (s.isBusy) return;
                                                setSlot({ key: s.key, label: s.label, hour: s.hour });
                                                setIsTimeDropdownOpen(false);
                                                playClick();
                                            }}
                                            disabled={s.isBusy}
                                            className={`w-full text-left px-3 py-2 border-b border-stone-50 flex items-center justify-between group ${
                                                s.isBusy ? 'bg-stone-50 opacity-50 cursor-not-allowed' : 'hover:bg-amber-50 cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono font-bold text-stone-600">{s.hour}:00</span>
                                                <span className="text-[10px] text-stone-400">{s.label}</span>
                                            </div>
                                            {s.isBusy ? (
                                                <span className="text-[9px] uppercase font-bold text-red-300">Busy</span>
                                            ) : (
                                                <Zap size={12} className="text-stone-300 group-hover:text-amber-400" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                 </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-stone-50 mt-2">
                 <button 
                  type="submit"
                  disabled={!title.trim()}
                  className="bg-stone-800 text-white px-6 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-stone-700 disabled:opacity-50 transition-colors shadow-sm"
                 >
                   Add Task
                 </button>
              </div>
          </div>
      </form>
    </div>
  );
};
