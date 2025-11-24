
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, CornerDownRight, Tag, BarChart2, Clock, X, Calendar, ChevronDown, Zap, Hourglass } from 'lucide-react';
import { WeeklySchedule, Task, TaskQuadrant, Settings } from '../types';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';

interface TaskCreationFormProps {
  onAddTask: (task: Partial<Task>, slot: {key: string, label: string, hour: number} | null) => void;
  schedule: WeeklySchedule;
  existingTags: string[];
  language: Settings['language'];
}

export const TaskCreationForm: React.FC<TaskCreationFormProps> = ({ onAddTask, schedule, existingTags, language }) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [purpose, setPurpose] = useState('');
  const [blocks, setBlocks] = useState(1);
  const [duration, setDuration] = useState<30 | 60>(60);
  
  const [slot, setSlot] = useState<{key: string, label: string, hour: number} | null>(null);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  // Tag Autocomplete State
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [activeTagIndex, setActiveTagIndex] = useState(0);

  const timeMenuRef = useRef<HTMLDivElement>(null);
  const tagWrapperRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const { playClick, playAdd } = useSound();

  const todayKey = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'short' }), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeMenuRef.current && !timeMenuRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
      if (tagWrapperRef.current && !tagWrapperRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter slots based on duration selected
  const availableSlots = useMemo(() => {
      const hours = Array.from({ length: 16 }, (_, i) => i + 6);
      const slots = [];
      for (const h of hours) {
          const mainKey = `${todayKey}-${h}`;
          const halfKey = `${todayKey}-${h}-30`;
          
          const mainBlock = schedule.ideal[mainKey];
          const halfBlock = schedule.ideal[halfKey];

          if (duration === 60) {
              const isBlocked = !!mainBlock || !!halfBlock;
              slots.push({
                  key: mainKey,
                  hour: h,
                  displayTime: `${h}:00`,
                  label: isBlocked ? (mainBlock?.label || halfBlock?.label || 'Busy') : 'Available',
                  category: mainBlock?.category || halfBlock?.category,
                  isBusy: isBlocked
              });
          } else {
              const mainIsFull = mainBlock && (mainBlock.duration === 60 || mainBlock.duration === undefined);
              slots.push({
                  key: mainKey,
                  hour: h,
                  displayTime: `${h}:00`,
                  label: mainBlock ? mainBlock.label : 'Available',
                  category: mainBlock?.category,
                  isBusy: !!mainBlock
              });
              const slot2Blocked = !!halfBlock || !!mainIsFull;
              slots.push({
                  key: halfKey,
                  hour: h,
                  displayTime: `${h}:30`,
                  label: slot2Blocked ? (halfBlock?.label || mainBlock?.label || 'Busy') : 'Available',
                  category: halfBlock?.category || (mainIsFull ? mainBlock?.category : undefined),
                  isBusy: slot2Blocked
              });
          }
      }
      return slots;
  }, [schedule.ideal, todayKey, duration]);

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTags(val);
    const parts = val.split(',');
    const currentInput = parts[parts.length - 1].trim().toLowerCase();
    
    if (currentInput) {
       const alreadyUsed = parts.slice(0, -1).map(p => p.trim().toLowerCase());
       const matches = existingTags.filter(t => 
         t.toLowerCase().includes(currentInput) && 
         !alreadyUsed.includes(t.toLowerCase()) &&
         t.toLowerCase() !== currentInput
       );
       setTagSuggestions(matches);
       setShowTagSuggestions(matches.length > 0);
       setActiveTagIndex(0);
    } else {
       setShowTagSuggestions(false);
    }
  };

  const selectTag = (tag: string) => {
      const parts = tags.split(',');
      parts.pop(); 
      parts.push(tag);
      setTags(parts.join(', ').trim() + ', ');
      setShowTagSuggestions(false);
      playClick();
      tagInputRef.current?.focus();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (showTagSuggestions && tagSuggestions.length > 0) {
          if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveTagIndex(prev => (prev + 1) % tagSuggestions.length);
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveTagIndex(prev => (prev - 1 + tagSuggestions.length) % tagSuggestions.length);
          } else if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
              selectTag(tagSuggestions[activeTagIndex]);
          } else if (e.key === 'Escape') {
              setShowTagSuggestions(false);
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const newTaskPart: Partial<Task> = {
      title,
      tags: newTags,
      purpose,
      blocks,
      duration,
      quadrant: TaskQuadrant.SCHEDULE,
      isFrog: false,
      createdAt: Date.now()
    };

    onAddTask(newTaskPart, slot);

    setTitle('');
    setTags('');
    setPurpose('');
    setBlocks(1);
    setDuration(60);
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
                  placeholder={t('matrix_input_placeholder', language)}
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
                      placeholder={t('matrix_purpose_placeholder', language)}
                      className="flex-1 bg-amber-50/50 px-3 py-2 text-sm font-serif italic text-stone-600 focus:bg-amber-50 focus:outline-none rounded-sm placeholder:text-amber-700/30 transition-colors"
                    />
                 </div>

                 <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px] relative" ref={tagWrapperRef}>
                        <Tag size={14} className="text-stone-300 flex-shrink-0 ml-1" />
                        <input 
                          ref={tagInputRef}
                          type="text"
                          value={tags}
                          onChange={handleTagChange}
                          onKeyDown={handleTagKeyDown}
                          placeholder={t('filter_tags', language) + "..."}
                          className="w-full bg-transparent text-xs text-stone-500 focus:outline-none placeholder:text-stone-300 ml-1"
                        />
                        {showTagSuggestions && (
                            <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-stone-200 shadow-xl rounded-sm z-50 max-h-32 overflow-y-auto custom-scrollbar flex flex-col">
                                {tagSuggestions.map((tag, index) => (
                                    <button 
                                        key={tag}
                                        type="button"
                                        onClick={() => selectTag(tag)}
                                        className={`text-left px-3 py-1.5 text-xs font-serif transition-colors ${index === activeTagIndex ? 'bg-amber-50 text-amber-800 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Duration Selector */}
                    <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-sm border border-stone-100">
                      <Hourglass size={12} className="text-stone-400" />
                       <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => { setDuration(30); setSlot(null); playClick(); }}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${duration === 30 ? 'bg-stone-800 text-white' : 'bg-white text-stone-400 border border-stone-200 hover:border-stone-400'}`}
                          >
                            30m
                          </button>
                          <button
                            type="button"
                            onClick={() => { setDuration(60); setSlot(null); playClick(); }}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${duration === 60 ? 'bg-stone-800 text-white' : 'bg-white text-stone-400 border border-stone-200 hover:border-stone-400'}`}
                          >
                            1h
                          </button>
                       </div>
                    </div>

                    {/* Blocks Difficulty */}
                    <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-sm border border-stone-100">
                      <BarChart2 size={12} className="text-stone-400" />
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
                    </div>

                    {/* Time Dropdown */}
                    <div className="relative" ref={timeMenuRef}>
                        {slot ? (
                            <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-sm border border-amber-300">
                                <Clock size={12} className="text-amber-700" />
                                <span className="text-xs font-bold text-amber-800 font-mono">
                                  {todayKey} @ {slot.key.includes('-30') ? `${slot.hour}:30` : `${slot.hour}:00`}
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
                                <span>{t('matrix_pick_time', language)}</span>
                                <ChevronDown size={10} />
                            </button>
                        )}

                        {isTimeDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-stone-200 shadow-xl rounded-sm z-50 animate-fade-in max-h-60 overflow-y-auto custom-scrollbar">
                                <div className="p-2 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 sticky top-0">
                                    {todayKey}'s {duration}m Slots
                                </div>
                                {availableSlots.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-stone-400 italic">
                                        No slots available for {duration}m.
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
                                                <span className="text-xs font-mono font-bold text-stone-600">{s.displayTime}</span>
                                                <span className="text-[10px] text-stone-400 truncate max-w-[150px]">{s.label}</span>
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
                   {t('matrix_add_task_btn', language)}
                 </button>
              </div>
          </div>
      </form>
    </div>
  );
};
