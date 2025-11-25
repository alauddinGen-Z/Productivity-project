
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, CornerDownRight, Tag, BarChart2, Clock, X, Calendar, ChevronDown, Zap, Hourglass, Lock, CalendarDays, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [deadline, setDeadline] = useState('');
  
  const [slot, setSlot] = useState<{key: string, label: string, hour: number} | null>(null);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  // Tag Autocomplete State
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [activeTagIndex, setActiveTagIndex] = useState(0);

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date()); // Controls the month view

  const timeMenuRef = useRef<HTMLDivElement>(null);
  const tagWrapperRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  const { playClick, playAdd } = useSound();

  // Map app language to standard locales for Date formatting
  const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      jp: 'ja-JP',
      ky: 'ky-KG'
  };

  const todayKey = useMemo(() => {
     return new Date().toLocaleDateString(localeMap[language] || 'en-US', { weekday: 'short' });
  }, [language]);

  const scheduleDayKey = useMemo(() => {
     return new Date().toLocaleDateString('en-US', { weekday: 'short' });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeMenuRef.current && !timeMenuRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
      if (tagWrapperRef.current && !tagWrapperRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(pickerDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setPickerDate(newDate);
  };

  const isSelectedDate = (d: Date) => {
      if (!deadline) return false;
      const dead = new Date(deadline);
      return d.getDate() === dead.getDate() && 
             d.getMonth() === dead.getMonth() && 
             d.getFullYear() === dead.getFullYear();
  };

  const isToday = (d: Date) => {
      const today = new Date();
      return d.getDate() === today.getDate() && 
             d.getMonth() === today.getMonth() && 
             d.getFullYear() === today.getFullYear();
  };
  
  // --- Slots Logic ---
  const availableSlots = useMemo(() => {
      const hours = Array.from({ length: 16 }, (_, i) => i + 6);
      const slots = [];
      for (const h of hours) {
          const mainKey = `${scheduleDayKey}-${h}`;
          const halfKey = `${scheduleDayKey}-${h}-30`;
          
          const mainBlock = schedule.ideal[mainKey];
          const halfBlock = schedule.ideal[halfKey];

          if (duration === 60) {
              const hasBlock = !!mainBlock || !!halfBlock;
              slots.push({
                  key: mainKey,
                  hour: h,
                  displayTime: `${h}:00`,
                  label: hasBlock ? (mainBlock?.label || halfBlock?.label) : t('status_available', language),
                  category: mainBlock?.category || halfBlock?.category,
                  isSelectable: hasBlock 
              });
          } else {
              // 30m slots
              const mainIsFull = mainBlock && (mainBlock.duration === 60 || mainBlock.duration === undefined);
              
              slots.push({
                  key: mainKey,
                  hour: h,
                  displayTime: `${h}:00`,
                  label: mainBlock ? mainBlock.label : t('status_available', language),
                  category: mainBlock?.category,
                  isSelectable: !!mainBlock
              });
              
              const slot2HasBlock = !!halfBlock || !!mainIsFull;
              slots.push({
                  key: halfKey,
                  hour: h,
                  displayTime: `${h}:30`,
                  label: slot2HasBlock ? (halfBlock?.label || mainBlock?.label) : t('status_available', language),
                  category: halfBlock?.category || (mainIsFull ? mainBlock?.category : undefined),
                  isSelectable: slot2HasBlock
              });
          }
      }
      return slots;
  }, [schedule.ideal, scheduleDayKey, duration, language]);

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

  const handleDateQuickSelect = (type: 'today' | 'tomorrow' | 'nextWeek') => {
      const d = new Date();
      if (type === 'tomorrow') {
          d.setDate(d.getDate() + 1);
      } else if (type === 'nextWeek') {
          // Calculate next Monday
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 7;
          d.setDate(diff);
      }
      
      // format to YYYY-MM-DD
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - (offset*60*1000));
      const dateString = local.toISOString().split('T')[0];
      
      setDeadline(dateString);
      setShowDatePicker(false);
      playClick();
  };

  const selectSpecificDate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - (offset*60*1000));
      const dateString = local.toISOString().split('T')[0];
      
      setDeadline(dateString);
      setShowDatePicker(false);
      playClick();
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
      createdAt: Date.now(),
      deadline: deadline ? new Date(deadline).getTime() : undefined
    };

    onAddTask(newTaskPart, slot);

    setTitle('');
    setTags('');
    setPurpose('');
    setBlocks(1);
    setDuration(60);
    setSlot(null);
    setDeadline('');
  };

  const daysGrid = getDaysInMonth(pickerDate);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
                          placeholder={t('matrix_tag_placeholder', language)}
                          className="w-full bg-transparent text-xs text-stone-500 focus:outline-none placeholder:text-stone-300 ml-1"
                        />
                        {showTagSuggestions && (
                            <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-stone-200 shadow-xl rounded-sm z-50 max-h-40 overflow-y-auto custom-scrollbar flex flex-col">
                                <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 border-b border-stone-100 sticky top-0">
                                    {t('task_suggestions', language)}
                                </div>
                                {tagSuggestions.map((tag, index) => (
                                    <button 
                                        key={tag}
                                        type="button"
                                        onClick={() => selectTag(tag)}
                                        className={`text-left px-3 py-2 text-xs font-serif transition-colors flex items-center justify-between group ${
                                            index === activeTagIndex ? 'bg-amber-50 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                           <Tag size={10} className={index === activeTagIndex ? 'text-amber-500' : 'text-stone-300'} />
                                           #{tag}
                                        </span>
                                        {index === activeTagIndex && <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">{t('task_enter', language)}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Advanced Date Picker */}
                    <div className="relative" ref={datePickerRef}>
                         {deadline ? (
                            <button 
                                type="button"
                                onClick={() => { setDeadline(''); playClick(); }}
                                className="flex items-center gap-1.5 bg-stone-800 text-white pl-2.5 pr-1.5 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 transition-colors group shadow-sm"
                            >
                                <CalendarDays size={12} />
                                <span>{new Date(deadline).toLocaleDateString(localeMap[language], { month: 'short', day: 'numeric' })}</span>
                                <div className="w-px h-3 bg-white/20 mx-1"></div>
                                <X size={12} className="opacity-70 group-hover:opacity-100" />
                            </button>
                         ) : (
                            <button 
                                type="button"
                                onClick={() => { setShowDatePicker(!showDatePicker); playClick(); }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all duration-200 ${showDatePicker ? 'bg-stone-100 border-stone-300 text-stone-600 shadow-inner' : 'bg-stone-50 border-stone-100 hover:border-stone-300 text-stone-400 hover:text-stone-600'}`}
                                title={t('task_deadline', language)}
                            >
                                <Calendar size={14} />
                            </button>
                         )}

                         {showDatePicker && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-stone-200 shadow-xl rounded-sm z-50 animate-fade-in flex flex-col overflow-hidden">
                                <div className="px-3 py-2 bg-stone-50 border-b border-stone-100 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                                    {t('task_deadline', language)}
                                </div>
                                <div className="p-1 space-y-0.5 border-b border-stone-100">
                                    <button 
                                        type="button"
                                        onClick={() => handleDateQuickSelect('today')}
                                        className="w-full text-left px-3 py-1.5 text-xs font-serif text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-sm flex items-center justify-between group"
                                    >
                                        <span>{t('task_due_today', language).replace('Due ', '')}</span>
                                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-stone-300" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleDateQuickSelect('tomorrow')}
                                        className="w-full text-left px-3 py-1.5 text-xs font-serif text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-sm flex items-center justify-between group"
                                    >
                                        <span>Tomorrow</span>
                                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-stone-300" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleDateQuickSelect('nextWeek')}
                                        className="w-full text-left px-3 py-1.5 text-xs font-serif text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-sm flex items-center justify-between group"
                                    >
                                        <span>Next Week</span>
                                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-stone-300" />
                                    </button>
                                </div>
                                
                                {/* Custom Calendar Grid */}
                                <div className="p-3 bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-800"><ChevronLeft size={14}/></button>
                                        <span className="text-xs font-bold text-stone-700">
                                            {pickerDate.toLocaleDateString(localeMap[language], { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-800"><ChevronRight size={14}/></button>
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1 mb-1">
                                        {weekDays.map(d => (
                                            <div key={d} className="text-[9px] text-center text-stone-300 font-bold uppercase">{d}</div>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1">
                                        {daysGrid.map((date, i) => {
                                            if (!date) return <div key={i} className="aspect-square"></div>;
                                            
                                            const isSelected = isSelectedDate(date);
                                            const today = isToday(date);
                                            
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => selectSpecificDate(date)}
                                                    className={`
                                                        aspect-square flex items-center justify-center text-[10px] rounded-sm transition-all
                                                        ${isSelected 
                                                            ? 'bg-stone-800 text-white font-bold shadow-sm' 
                                                            : today 
                                                                ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200'
                                                                : 'hover:bg-stone-100 text-stone-600'
                                                        }
                                                    `}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
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
                                <Clock size={12} />
                                <span>{t('matrix_pick_time', language)}</span>
                                <ChevronDown size={10} />
                            </button>
                        )}

                        {isTimeDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-stone-200 shadow-xl rounded-sm z-50 animate-fade-in max-h-60 overflow-y-auto custom-scrollbar">
                                <div className="p-2 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 sticky top-0">
                                    {todayKey} {duration}m {t('slots_header', language)}
                                </div>
                                {availableSlots.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-stone-400 italic">
                                        No slots available.
                                    </div>
                                ) : (
                                    availableSlots.map(s => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => {
                                                if (!s.isSelectable) return;
                                                setSlot({ key: s.key, label: s.label, hour: s.hour });
                                                setIsTimeDropdownOpen(false);
                                                playClick();
                                            }}
                                            disabled={!s.isSelectable}
                                            className={`w-full text-left px-3 py-2 border-b border-stone-50 flex items-center justify-between group ${
                                                !s.isSelectable 
                                                    ? 'bg-stone-50 opacity-50 cursor-not-allowed text-stone-300' 
                                                    : 'hover:bg-amber-50 cursor-pointer bg-white'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-mono font-bold ${!s.isSelectable ? 'text-stone-300' : 'text-stone-600'}`}>
                                                  {s.displayTime}
                                                </span>
                                                <span className={`text-[10px] truncate max-w-[150px] ${!s.isSelectable ? 'text-stone-300' : 'text-stone-500'}`}>
                                                  {s.isSelectable ? s.label : "Free (Unplanned)"}
                                                </span>
                                            </div>
                                            {!s.isSelectable ? (
                                                <Lock size={12} className="text-stone-300" />
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                   <span className="text-[9px] uppercase font-bold text-emerald-500 bg-emerald-50 px-1 rounded">Open</span>
                                                </div>
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
