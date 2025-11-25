
import React, { useState, useRef, useEffect } from 'react';
import { Check, Box, Tag, CornerDownRight, Edit2, Calendar, X, Bell } from 'lucide-react';
import { Task, TaskQuadrant } from '../types';
import { useSound } from '../hooks/useSound';
import { useApp } from '../context/AppContext';

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
}

export const MatrixTaskItem: React.FC<MatrixTaskItemProps> = React.memo(({
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
  uniqueTags
}) => {
  const { state } = useApp();
  const language = state.settings.language;

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
      
      const diff = (due - today) / (1000 * 60 * 60 * 24);

      if (diff < 0) return { color: 'text-red-500 bg-red-50 border-red-200', text: 'Overdue' };
      if (diff === 0) return { color: 'text-amber-600 bg-amber-50 border-amber-200', text: 'Due Today' };
      if (diff <= 2) return { color: 'text-orange-500 bg-orange-50 border-orange-200', text: 'Due Soon' };
      return { color: 'text-stone-400 bg-stone-50 border-stone-200', text: dueDate.toLocaleDateString() };
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      className={`group bg-[#FAF9F6] p-4 rounded-sm border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 relative ${isCompleting ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="flex items-start gap-3">
        <button 
            onClick={handleToggle}
            className={`mt-1 w-5 h-5 rounded-sm border transition-all flex items-center justify-center ${task.completed ? 'bg-stone-800 border-stone-800' : 'border-stone-300 hover:border-stone-500'}`}
        >
            {task.completed && <Check size={12} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
           {isEditing ? (
               <div className="space-y-3 mb-2 animate-fade-in">
                   <input 
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      className="w-full bg-white border border-stone-300 p-2 font-serif text-sm focus:border-stone-800 outline-none rounded-sm"
                      placeholder="Task title..."
                      autoFocus
                   />
                   
                   <div className="flex items-center gap-2 border border-stone-200 bg-white p-2 rounded-sm relative" ref={tagWrapperRef}>
                       <Tag size={12} className="text-stone-400" />
                       <input 
                          ref={tagInputRef}
                          value={localTags}
                          onChange={handleTagChange}
                          onKeyDown={handleTagKeyDown}
                          className="w-full text-xs outline-none bg-transparent"
                          placeholder="Tags..."
                       />
                       {showTagSuggestions && (
                            <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-stone-200 shadow-xl rounded-sm z-50 max-h-32 overflow-y-auto custom-scrollbar flex flex-col">
                                {tagSuggestions.map((tag, index) => (
                                    <button 
                                        key={tag}
                                        type="button"
                                        onClick={() => selectTag(tag)}
                                        className={`text-left px-3 py-2 text-xs font-serif transition-colors ${
                                            index === activeTagIndex ? 'bg-amber-50 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                                        }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                       )}
                   </div>

                   <div className="flex items-center gap-2 border border-stone-200 bg-white p-2 rounded-sm">
                       <CornerDownRight size={12} className="text-stone-400" />
                       <input 
                          value={localPurpose}
                          onChange={(e) => setLocalPurpose(e.target.value)}
                          className="w-full text-xs outline-none bg-transparent font-serif italic"
                          placeholder="Purpose (Niyyah)..."
                       />
                   </div>

                   <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => { deleteTask(task.id); playDelete(); }} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded">Delete</button>
                        <button onClick={handleSaveEdit} className="px-3 py-1 bg-stone-800 text-white text-xs uppercase font-bold tracking-wider rounded-sm">Save</button>
                   </div>
               </div>
           ) : (
               <div className="group/content relative">
                   <div className="flex justify-between items-start">
                       <h4 className={`font-serif text-base leading-tight mb-1 cursor-pointer hover:text-amber-700 transition-colors ${task.completed ? 'line-through text-stone-400' : 'text-stone-800'}`} onClick={() => { setIsEditing(true); playClick(); }}>
                           {task.title}
                       </h4>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                           <button onClick={() => { setIsEditing(true); playClick(); }} className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-600">
                               <Edit2 size={12} />
                           </button>
                       </div>
                   </div>

                   {task.purpose && (
                       <p className="text-xs text-stone-500 font-serif italic mb-2 flex items-center gap-1">
                           <CornerDownRight size={10} className="opacity-50" />
                           {task.purpose}
                       </p>
                   )}

                   <div className="flex flex-wrap gap-2 items-center mt-2">
                       <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono border border-stone-200">
                           <Box size={8} /> {task.blocks}
                       </span>
                       
                       {task.deadline && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold border ${getDeadlineStatus(task.deadline).color}`}>
                                <Calendar size={8} /> {getDeadlineStatus(task.deadline).text}
                            </span>
                       )}

                       {task.reminderTime && (
                           <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold border border-purple-200 bg-purple-50 text-purple-600" title={`Reminder: ${task.reminderTime}`}>
                               <Bell size={8} /> {task.reminderTime}
                           </span>
                       )}

                       {task.tags?.map((tag, i) => (
                           <span key={i} className="text-[9px] text-stone-400 hover:text-stone-600 cursor-pointer">#{tag}</span>
                       ))}
                       
                       {/* Schedule Indicator */}
                       <button 
                          onClick={() => { onOpenScheduler(task.id); playClick(); }}
                          className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${scheduledSlot ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-stone-300 border-stone-200 hover:border-amber-300 hover:text-amber-500'}`}
                       >
                          {scheduledSlot ? scheduledSlot : 'Schedule'}
                       </button>

                       {/* Frog Toggle */}
                       <button 
                           onClick={(e) => { e.stopPropagation(); toggleFrog(task.id); playClick(); }}
                           className={`ml-auto w-4 h-4 rounded-full flex items-center justify-center transition-all ${task.isFrog ? 'bg-amber-100 text-amber-600' : 'bg-transparent text-stone-200 hover:text-stone-400'}`}
                           title="Toggle Priority (Eat the Frog)"
                       >
                           <span className="text-[10px]">★</span>
                       </button>
                   </div>
               </div>
           )}

            {/* Subtasks Section */}
            {(task.subtasks?.length > 0 || isEditing) && (
                <div className="mt-3 pt-2 border-t border-stone-100 pl-1">
                    {task.subtasks?.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-1 group/sub">
                            <button 
                                onClick={() => onToggleSubtask(idx)}
                                className={`w-3 h-3 border rounded-sm flex items-center justify-center ${sub.completed ? 'bg-stone-300 border-stone-300' : 'border-stone-200'}`}
                            >
                                {sub.completed && <Check size={8} className="text-white" />}
                            </button>
                            <span className={`text-xs ${sub.completed ? 'line-through text-stone-300' : 'text-stone-500'}`}>{sub.title}</span>
                            {isEditing && (
                                <button onClick={() => deleteSubtask(task.id, idx)} className="ml-auto opacity-0 group-hover/sub:opacity-100 text-red-300 hover:text-red-500"><X size={10} /></button>
                            )}
                        </div>
                    ))}
                    {isEditing && (
                        <div className="flex items-center gap-2 mt-2">
                             <input 
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                className="flex-1 bg-stone-50 text-xs p-1 outline-none border border-transparent focus:border-stone-200 rounded-sm"
                                placeholder="Add step..."
                                onKeyDown={(e) => e.key === 'Enter' && onAddSubtask()}
                             />
                             <button onClick={onAddSubtask} className="text-stone-400 hover:text-stone-600"><Check size={12} /></button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
});
