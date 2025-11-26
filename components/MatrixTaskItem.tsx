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
                      className="w-full bg-white border border-stone-300 p-2 font-serif text-sm focus