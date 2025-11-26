
import React, { useState, useRef, useEffect } from 'react';
import { Check, Box, Tag, CornerDownRight, Edit2, Calendar, X, Bell, Trash2, ArrowRight } from 'lucide-react';
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
      if (diff === 0) return { color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Due Today' };
      if (diff <= 2) return { color: 'text-orange-600 bg-orange-50 border-orange-200', text: 'Due Soon' };
      return { color: 'text-stone-500 bg-stone-50 border-stone-200', text: dueDate.toLocaleDateString() };
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
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            className={`mt-1 w-5 h-5 rounded-sm border transition-all flex items-center justify-center ${task.completed ? 'bg-stone-800 border-stone-800' : 'border-stone-300 hover:border-stone-500'}`}
        >
            {task.completed && <Check size={12} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
           {isEditing ? (
               <div className="space-y-3 mb-2 animate-fade-in">
                   <label htmlFor={`edit-title-${task.id}`} className="sr-only">Title</label>
                   <input 
                      id={`edit-title-${task.id}`}
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      className="w-full bg-white border border-stone-300 p-2 font-serif text-sm focus:border-stone-800 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                   />
                   
                   <label htmlFor={`edit-purpose-${task.id}`} className="sr-only">Purpose</label>
                   <input 
                      id={`edit-purpose-${task.id}`}
                      value={localPurpose}
                      onChange={(e) => setLocalPurpose(e.target.value)}
                      placeholder="Purpose (Niyyah)"
                      className="w-full bg-amber-50 border border-amber-200 p-2 font-serif text-xs text-stone-600 focus:border-amber-400 focus:outline-none"
                   />

                   <div className="relative" ref={tagWrapperRef}>
                      <label htmlFor={`edit-tags-${task.id}`} className="sr-only">Tags</label>
                      <input 
                          id={`edit-tags-${task.id}`}
                          ref={tagInputRef}
                          value={localTags}
                          onChange={handleTagChange}
                          onKeyDown={handleTagKeyDown}
                          placeholder="Tags..."
                          className="w-full bg-white border border-stone-300 p-2 text-xs focus:border-stone-800 focus:outline-none"
                      />
                      {showTagSuggestions && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-stone-200 shadow-xl rounded-sm z-50 max-h-40 overflow-y-auto custom-scrollbar flex flex-col">
                                {tagSuggestions.map((tag, index) => (
                                    <button 
                                        key={tag}
                                        type="button"
                                        onClick={() => selectTag(tag)}
                                        className={`text-left px-3 py-2 text-xs font-serif transition-colors flex items-center gap-2 ${
                                            index === activeTagIndex ? 'bg-amber-50 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                                        }`}
                                    >
                                        <Tag size={10} className={index === activeTagIndex ? 'text-amber-500' : 'text-stone-300'} />
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        )}
                   </div>

                   <div className="flex gap-2 justify-end">
                       <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-stone-500 hover:text-stone-800">Cancel</button>
                       <button onClick={handleSaveEdit} className="px-3 py-1 bg-stone-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-700">Save</button>
                   </div>
               </div>
           ) : (
               <div className="group/content">
                   <div className="flex justify-between items-start">
                        <h4 
                            onClick={() => { setIsEditing(true); playClick(); }}
                            className={`font-serif text-lg leading-snug cursor-text ${task.completed ? 'line-through text-stone-300' : 'text-stone-800'}`}
                        >
                            {task.title}
                        </h4>
                        
                        {/* Quick Actions overlay on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-sm absolute top-2 right-2 border border-stone-100 shadow-sm">
                            <button onClick={() => { setIsEditing(true); playClick(); }} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm" title="Edit">
                                <Edit2 size={12} />
                            </button>
                            <button onClick={() => { toggleFrog(task.id); playClick(); }} className={`p-1.5 rounded-sm transition-colors ${task.isFrog ? 'text-amber-500 bg-amber-50' : 'text-stone-400 hover:text-amber-500 hover:bg-amber-50'}`} title="Toggle Priority">
                                <Box size={12} />
                            </button>
                            <button onClick={() => { deleteTask(task.id); playDelete(); }} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-sm" title="Delete">
                                <Trash2 size={12} />
                            </button>
                        </div>
                   </div>

                   {task.purpose && (
                       <div className="flex items-start gap-1.5 mt-1 text-xs text-stone-500 font-serif italic">
                           <CornerDownRight size={10} className="mt-1 text-amber-500/50" />
                           <span>{task.purpose}</span>
                       </div>
                   )}
                   
                   <div className="flex flex-wrap items-center gap-2 mt-2">
                       {/* Blocks Badge */}
                       <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-sm">
                           <Box size={10} />
                           {task.blocks}
                       </div>

                       {/* Tags */}
                       {task.tags && task.tags.map(tag => (
                           <div key={tag} className="text-[9px] text-stone-400 font-medium px-1.5 py-0.5 rounded-sm border border-stone-100 bg-white">
                               #{tag}
                           </div>
                       ))}

                       {/* Deadline */}
                       {task.deadline && (
                           <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${getDeadlineStatus(task.deadline).color}`}>
                               <Calendar size={10} />
                               {getDeadlineStatus(task.deadline).text}
                           </div>
                       )}

                       {/* Reminder */}
                       {task.reminderTime && (
                           <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-sm border border-purple-100">
                               <Bell size={10} />
                               {task.reminderTime}
                           </div>
                       )}
                   </div>
               </div>
           )}

           {/* Schedule Button */}
           <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2">
                <button 
                    onClick={() => onOpenScheduler(task.id)}
                    className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 transition-colors ${scheduledSlot ? 'text-emerald-600 hover:text-emerald-700' : 'text-stone-300 hover:text-stone-500'}`}
                >
                    <Calendar size={12} />
                    {scheduledSlot ? (
                        <span>{scheduledSlot.split('-').length === 3 ? `${scheduledSlot.split('-')[0]} @ ${scheduledSlot.split('-')[1]}:30` : `${scheduledSlot.split('-')[0]} @ ${scheduledSlot.split('-')[1]}:00`}</span>
                    ) : (
                        <span>Schedule</span>
                    )}
                </button>
                
                {/* Subtask Toggle */}
                <div className="relative group/subtasks">
                     {(task.subtasks && task.subtasks.length > 0) && (
                         <div className="text-[10px] text-stone-400 font-mono">
                             {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                         </div>
                     )}
                </div>
           </div>
        </div>
      </div>
      
      {/* Subtasks Section (Always visible if exists or editing) */}
      {(task.subtasks?.length > 0 || isEditing) && (
          <div className="mt-2 pl-8 border-l-2 border-stone-100 ml-2.5">
              {task.subtasks?.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-1 group/sub">
                      <button 
                        onClick={() => onToggleSubtask(idx)}
                        className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${sub.completed ? 'bg-stone-400 border-stone-400' : 'border-stone-300 hover:border-stone-500'}`}
                      >
                          {sub.completed && <Check size={8} className="text-white" />}
                      </button>
                      <span className={`text-xs ${sub.completed ? 'line-through text-stone-300' : 'text-stone-600'}`}>{sub.title}</span>
                      {isEditing && (
                          <button onClick={() => deleteSubtask(task.id, idx)} className="ml-auto opacity-0 group-hover/sub:opacity-100 text-stone-300 hover:text-red-400">
                              <X size={10} />
                          </button>
                      )}
                  </div>
              ))}
              
              <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 border border-dashed border-stone-300 rounded-sm"></div>
                  <input 
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onAddSubtask()}
                      placeholder="Add sub-step..."
                      className="bg-transparent text-xs text-stone-500 placeholder:text-stone-300 focus:outline-none w-full"
                  />
                  {newSubtask && (
                      <button onClick={onAddSubtask} className="text-stone-400 hover:text-stone-800">
                          <ArrowRight size={10} />
                      </button>
                  )}
              </div>
          </div>
      )}
    </div>
  );
});
