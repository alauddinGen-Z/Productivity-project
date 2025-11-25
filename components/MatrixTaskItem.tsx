

import React, { useState, useRef, useEffect } from 'react';
import { Check, Box, Clock, Tag, CornerDownRight, Trash2, GripVertical, Sparkles, CheckCircle2, Plus, X, Edit2, Calendar, AlertTriangle } from 'lucide-react';
import { Task, TaskQuadrant, Settings } from '../types';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';

interface MatrixTaskItemProps {
  task: Task;
  quadrant: TaskQuadrant;
  toggleTask: (id: string) => void;
  toggleFrog: (id: string) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, quadrant: TaskQuadrant) => void;
  addSubtask: (id: string, title: string) => void;
  deleteSubtask: (id: string, index: number) => void;
  toggleSubtask: (taskId: string, index: number) => void;
  updatePurpose: (id: string, purpose: string) => void;
  updateTitle: (id: string, title: string) => void;
  updateTags: (id: string, tags: string[]) => void;
  scheduledSlot: string | null;
  onOpenScheduler: (id: string) => void;
  uniqueTags: string[];
  language?: Settings['language'];
}

export const MatrixTaskItem: React.FC<MatrixTaskItemProps> = ({
  task,
  quadrant,
  toggleTask,
  toggleFrog,
  deleteTask,
  moveTask,
  addSubtask,
  deleteSubtask,
  toggleSubtask,
  updatePurpose,
  updateTitle,
  updateTags,
  scheduledSlot,
  onOpenScheduler,
  uniqueTags,
  language = 'en'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(task.title || '');
  const [localTags, setLocalTags] = useState(task.tags?.join(', ') || '');
  const [localPurpose, setLocalPurpose] = useState(task.purpose || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Tag Autocomplete
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [activeTagIndex, setActiveTagIndex] = useState(0);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagWrapperRef = useRef<HTMLDivElement>(null);
  
  const { playSuccess, playClick, playDelete } = useSound();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagWrapperRef.current && !tagWrapperRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalTitle(task.title);
  }, [task.title]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: task.id, sourceQuadrant: quadrant }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveEdit = () => {
    if (localTitle.trim()) {
      updateTitle(task.id, localTitle.trim());
    }
    updatePurpose(task.id, localPurpose);
    const tags = localTags.split(',').map(t => t.trim()).filter(Boolean);
    updateTags(task.id, tags);
    setIsEditing(false);
  };
  
  const handleToggle = () => {
      if (task.completed) {
          toggleTask(task.id);
      } else {
          playSuccess();
          setIsCompleting(true);
          setTimeout(() => {
              toggleTask(task.id);
              setIsCompleting(false);
          }, 800);
      }
  };

  const onAddSubtask = () => {
    if (newSubtask.trim()) {
      playClick();
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };
  
  const onToggleSubtask = (idx: number) => {
      playClick();
      toggleSubtask(task.id, idx);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTags(val);
    const parts = val.split(',');
    const currentInput = parts[parts.length - 1].trim().toLowerCase();
    
    if (currentInput) {
       const alreadyUsed = parts.slice(0, -1).map(p => p.trim().toLowerCase());
       const matches = uniqueTags.filter(t => 
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
      const parts = localTags.split(',');
      parts.pop(); 
      parts.push(tag);
      setLocalTags(parts.join(', ').trim() + ', ');
      setShowTagSuggestions(false);
      tagInputRef.current?.focus();
      playClick();
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
      } else if (e.key === 'Enter') {
          handleSaveEdit();
      }
  };

  const getDeadlineStatus = (deadline: number) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const today = now.getTime();
      
      const dueDate = new Date(deadline);
      dueDate.setHours(0, 0, 0, 0);
      const due = dueDate.getTime();
      
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { status: 'overdue', label: t('task_overdue', language), color: 'text-red-500 bg-red-50 border-red-200' };
      if (diffDays === 0) return { status: 'today', label: t('task_due_today', language), color: 'text-amber-600 bg-amber-50 border-amber-200' };
      if (diffDays === 1) return { status: 'soon', label: t('task_due_soon', language), color: 'text-amber-500 bg-amber-50/50 border-amber-100' };
      
      return { status: 'future', label: dueDate.toLocaleDateString(), color: 'text-stone-400 bg-stone-50 border-stone-100' };
  };

  const deadlineInfo = task.deadline ? getDeadlineStatus(task.deadline) : null;

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className={`group relative bg-white border border-stone-100 rounded-sm p-3 hover:shadow-md transition-all duration-300 animate-fade-in ${
        task.isFrog ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''
      } ${isCompleting ? 'opacity-0 translate-y-4 scale-95 pointer-events-none transition-all duration-700' : ''}`}
    >
      {isCompleting && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-sm">
             <div className="flex flex-col items-center animate-fade-slide">
                 <CheckCircle2 size={32} className="text-emerald-500 mb-2 scale-125 transition-transform duration-500" />
                 <span className="text-emerald-700 font-serif font-bold text-sm">{t('task_completed_msg', language)}</span>
             </div>
          </div>
      )}

      <div className="absolute left-1 top-1/2 -translate-y-1/2 text-stone-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1">
        <GripVertical size={12} />
      </div>

      <div className="flex items-start gap-3 pl-4">
        <button 
          onClick={handleToggle}
          className={`mt-1 w-5 h-5 rounded-sm border flex items-center justify-center transition-all duration-300 ${
            task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-emerald-400 active:scale-95'
          } ${isCompleting ? 'scale-110 bg-emerald-500 border-emerald-500' : ''}`}
        >
          {task.completed || isCompleting ? <Check size={14} className={`text-white transition-transform ${isCompleting ? 'scale-125' : ''}`} /> : null}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
             <div className="flex-1 flex items-center gap-2">
                 {isEditing ? (
                    <input 
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      className="w-full text-sm font-serif border-b border-stone-300 focus:border-stone-800 outline-none bg-transparent"
                      placeholder="Task title"
                      autoFocus
                    />
                 ) : (
                    <>
                       <span className={`font-serif text-stone-800 leading-snug break-words ${task.completed ? 'line-through text-stone-400' : ''}`}>
                         {task.title}
                       </span>
                       <button 
                         onClick={() => { setIsEditing(true); playClick(); }} 
                         className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-600 transition-opacity p-0.5"
                         title={t('task_edit_tooltip', language)}
                       >
                         <Edit2 size={10} />
                       </button>
                    </>
                 )}
             </div>
             
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 bg-white/80 backdrop-blur-sm rounded p-0.5">
                <button 
                  onClick={() => { toggleFrog(task.id); playClick(); }}
                  title={task.isFrog ? t('task_frog_tooltip_on', language) : t('task_frog_tooltip_off', language)}
                  className={`p-1.5 rounded-sm hover:bg-stone-100 ${task.isFrog ? 'text-amber-500' : 'text-stone-400'}`}
                >
                   <Sparkles size={14} />
                </button>
                <button 
                  onClick={() => onOpenScheduler(task.id)} 
                  className={`p-1.5 rounded-sm hover:bg-stone-100 ${scheduledSlot ? 'text-amber-600 bg-amber-50' : 'text-stone-400'}`}
                  title={scheduledSlot ? `${t('matrix_scheduled', language)}: ${scheduledSlot}` : t('task_schedule_tooltip', language)}
                >
                   <Clock size={14} />
                </button>
                <button 
                  onClick={() => { deleteTask(task.id); playDelete(); }}
                  className="p-1.5 rounded-sm hover:bg-red-50 text-stone-400 hover:text-red-500"
                  title={t('task_delete_tooltip', language)}
                >
                   <Trash2 size={14} />
                </button>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 items-center">
             <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded flex items-center gap-1 border border-stone-200">
                <Box size={10} /> {task.blocks}
             </span>
             {task.duration === 30 && (
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1 rounded flex items-center gap-1">
                  {t('task_30m', language)}
                </span>
             )}
             {deadlineInfo && (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${deadlineInfo.color}`}>
                   {(deadlineInfo.status === 'overdue' || deadlineInfo.status === 'today') ? <AlertTriangle size={10} /> : <Calendar size={10} />}
                   <span>{deadlineInfo.label}</span>
                </div>
             )}
             {scheduledSlot && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 font-mono">
                    <Clock size={10} />
                    {scheduledSlot.split('-')[0]} @ {scheduledSlot.split('-')[1]}:00
                </div>
             )}
             {task.tags?.map(tag => (
                <span key={tag} className="text-[10px] text-stone-400">#{tag}</span>
             ))}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
             <div className="mt-3 pl-3 border-l-2 border-stone-100 space-y-1">
                {task.subtasks.map((st, idx) => (
                   <div key={idx} className="flex items-center gap-2 group/sub">
                      <button 
                        onClick={() => onToggleSubtask(idx)}
                        className={`w-3 h-3 border rounded-sm flex items-center justify-center ${st.completed ? 'bg-stone-400 border-stone-400' : 'border-stone-300'}`}
                      >
                         {st.completed && <Check size={8} className="text-white" />}
                      </button>
                      <span className={`text-xs ${st.completed ? 'text-stone-300 line-through' : 'text-stone-500'}`}>{st.title}</span>
                   </div>
                ))}
             </div>
          )}

          {isEditing ? (
             <div className="mt-3 bg-stone-50 p-3 rounded-sm border border-stone-200 animate-fade-in">
                <input 
                  value={localPurpose}
                  onChange={e => setLocalPurpose(e.target.value)}
                  placeholder={t('task_purpose_placeholder', language)}
                  className="w-full text-xs bg-white p-2 border border-stone-200 mb-2 focus:border-stone-400 outline-none"
                />
                
                <div className="relative" ref={tagWrapperRef}>
                    <input 
                      ref={tagInputRef}
                      value={localTags}
                      onChange={handleTagChange}
                      onKeyDown={handleTagKeyDown}
                      placeholder={t('matrix_tag_placeholder', language)}
                      className="w-full text-xs bg-white p-2 border border-stone-200 mb-2 focus:border-stone-400 outline-none"
                    />
                    {showTagSuggestions && (
                        <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-stone-200 shadow-xl rounded-sm z-50 max-h-32 overflow-y-auto custom-scrollbar flex flex-col">
                             <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 border-b border-stone-100 sticky top-0">
                                {t('task_suggestions', language)}
                             </div>
                             {tagSuggestions.map((tag, index) => (
                                <button 
                                    key={tag}
                                    type="button"
                                    onClick={() => selectTag(tag)}
                                    className={`text-left px-3 py-2 text-xs font-serif transition-colors flex items-center justify-between ${
                                        index === activeTagIndex ? 'bg-amber-50 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                                    }`}
                                >
                                    <span>#{tag}</span>
                                    {index === activeTagIndex && <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">{t('task_enter', language)}</span>}
                                </button>
                             ))}
                        </div>
                    )}
                </div>
                
                <div className="mt-2 pt-2 border-t border-stone-100">
                   <div className="text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-wide">{t('task_manage_subtasks', language)}</div>
                   {task.subtasks?.map((st, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-white border border-stone-200 p-1.5 mb-1 rounded-sm">
                         <span className="truncate mr-2">{st.title}</span>
                         <button onClick={() => deleteSubtask(task.id, i)} className="text-red-300 hover:text-red-500">
                           <X size={12}/>
                         </button>
                      </div>
                   ))}
                   <div className="flex gap-1 mt-2">
                      <input 
                        value={newSubtask}
                        onChange={e => setNewSubtask(e.target.value)}
                        placeholder={t('task_add_step_placeholder', language)} 
                        className="flex-1 text-xs bg-white p-1.5 border border-stone-200 focus:border-stone-400 outline-none"
                        onKeyDown={e => e.key === 'Enter' && onAddSubtask()}
                      />
                      <button onClick={onAddSubtask} className="bg-stone-200 hover:bg-stone-300 px-2 rounded-sm text-stone-600">
                        <Plus size={14}/>
                      </button>
                   </div>
                </div>

                <div className="flex justify-end items-center mt-3 gap-2">
                   <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-stone-200 text-stone-600 text-[10px] uppercase tracking-wider rounded-sm hover:bg-stone-300">
                      {t('reward_cancel', language)}
                   </button>
                   <button onClick={() => { handleSaveEdit(); playClick(); }} className="px-3 py-1 bg-stone-800 text-white text-[10px] uppercase tracking-wider rounded-sm hover:bg-stone-700">
                      {t('task_save_changes', language)}
                   </button>
                </div>
             </div>
          ) : (
            task.purpose && (
               <div className="mt-2 flex items-start gap-1.5 text-xs text-stone-400 italic">
                  <CornerDownRight size={12} className="mt-0.5 text-stone-300" />
                  {task.purpose}
               </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};