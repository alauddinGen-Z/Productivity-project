
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Task, TaskQuadrant, WeeklySchedule } from '../types';
import { Plus, Trash2, Wand2, GripVertical, Check, ArrowUpDown, Target, CornerDownRight, Tag, X, LayoutGrid, List, Filter, CheckSquare, Square, Box, Clock, Calendar } from 'lucide-react';
import { simplifyTask, estimateTaskDifficulty } from '../services/geminiService';

interface TaskMatrixProps {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  schedule: WeeklySchedule;
  updateSchedule: (schedule: WeeklySchedule) => void;
}

interface MatrixTaskItemProps {
  task: Task;
  quadrant: TaskQuadrant;
  toggleTask: (id: string) => void;
  toggleFrog: (id: string) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, quadrant: TaskQuadrant) => void;
  handleSimplify: (id: string, title: string) => void;
  toggleSubtask: (taskId: string, index: number) => void;
  updatePurpose: (taskId: string, purpose: string) => void;
  updateTags: (taskId: string, tags: string[]) => void;
  loadingAI: string | null;
  scheduledSlot: string | null; // "Mon-9" or null
  onOpenScheduler: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

type SortOption = 'NEWEST' | 'OLDEST' | 'AZ' | 'ZA' | 'PRIORITY';

const MatrixTaskItem = React.memo<MatrixTaskItemProps>(({ 
  task, 
  quadrant, 
  toggleTask, 
  toggleFrog, 
  deleteTask, 
  moveTask, 
  handleSimplify, 
  toggleSubtask,
  updatePurpose,
  updateTags,
  loadingAI,
  scheduledSlot,
  onOpenScheduler,
  onDragStart
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditingPurpose, setIsEditingPurpose] = useState(false);
  const [purposeInput, setPurposeInput] = useState(task.purpose || '');
  
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagsInput, setTagsInput] = useState(task.tags?.join(', ') || '');

  const handleCheck = () => {
    if (isCompleting) return;
    setIsCompleting(true);
    // Increased delay to allow the "check" animation to fully register before the fade out
    setTimeout(() => {
      toggleTask(task.id);
    }, 700);
  };

  const savePurpose = () => {
    updatePurpose(task.id, purposeInput);
    setIsEditingPurpose(false);
  };

  const saveTags = () => {
    const splitTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    updateTags(task.id, splitTags);
    setIsEditingTags(false);
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`bg-[#FAF9F6] p-3 border-l-2 border-stone-200 hover:border-stone-400 group relative transition-all duration-700 ease-out shadow-sm cursor-grab active:cursor-grabbing ${isCompleting ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 w-full">
          {/* Checkbox with Animation */}
          <button 
            onClick={handleCheck} 
            className="mt-1 relative group/check flex-shrink-0"
            title="Complete Task"
            disabled={isCompleting}
          >
            <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-all duration-300 ${isCompleting ? 'bg-emerald-600 border-emerald-600 scale-110' : 'border-stone-300 text-transparent hover:border-stone-800'}`}>
              <Check size={12} className={`text-white transition-all duration-300 ${isCompleting ? 'scale-125' : 'scale-0'}`} strokeWidth={4} />
            </div>
          </button>
          
          <div className="w-full">
            <span className={`text-sm font-serif text-stone-700 transition-all duration-500 ${isCompleting ? 'line-through text-stone-400' : ''} ${task.isFrog ? 'font-bold text-emerald-800' : ''}`}>
              {task.title}
            </span>
            {task.isFrog && <span className="block text-[9px] text-emerald-700 tracking-widest uppercase mt-1">Priority Frog</span>}
            
            <div className={`flex flex-wrap gap-2 items-center mt-2 transition-opacity duration-500 ${isCompleting ? 'opacity-50' : 'opacity-100'}`}>
                {/* Block Value Badge */}
                <div className="flex items-center gap-1 text-[9px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 border border-stone-200" title="Reward Value">
                    <Box size={10} className="text-stone-400" />
                    <span className="font-mono font-bold">{task.blocks || 1}</span>
                </div>

                {/* Scheduled Time Badge */}
                {scheduledSlot ? (
                    <div 
                        onClick={() => onOpenScheduler(task.id)}
                        className="flex items-center gap-1 text-[9px] bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                        title="Reschedule Task"
                    >
                        <Clock size={10} />
                        <span className="font-mono font-bold">{scheduledSlot.replace('-', ' @ ')}:00</span>
                    </div>
                ) : (
                    <button 
                        onClick={() => onOpenScheduler(task.id)}
                        className="flex items-center gap-1 text-[9px] bg-stone-50 px-1.5 py-0.5 rounded text-stone-300 border border-stone-100 hover:text-stone-500 hover:border-stone-300 transition-colors opacity-0 group-hover:opacity-100"
                        title="Schedule this task"
                    >
                        <Clock size={10} />
                        <span>Schedule</span>
                    </button>
                )}

                {/* Tags Display/Edit */}
                {(isEditingTags || (task.tags && task.tags.length > 0)) && (
                <>
                    {isEditingTags ? (
                    <div className="flex items-center gap-1 w-full animate-fade-in">
                        <Tag size={10} className="text-stone-400" />
                        <input 
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        onBlur={saveTags}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); saveTags(); }}}
                        className="text-xs bg-stone-100 border border-stone-200 rounded px-2 py-1 flex-1 focus:outline-none focus:border-stone-400"
                        placeholder="comma, separated, tags"
                        autoFocus
                        />
                    </div>
                    ) : (
                    task.tags?.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded border border-stone-200">
                        #{tag}
                        </span>
                    ))
                    )}
                </>
                )}
            </div>

            {/* Purpose / Why Section */}
            {(task.purpose || isEditingPurpose) && (
              <div className={`mt-2 pl-2 border-l-2 border-amber-200/50 transition-opacity duration-500 ${isCompleting ? 'opacity-40' : ''}`}>
                 {isEditingPurpose ? (
                    <div className="animate-fade-in">
                       <label className="text-[9px] uppercase tracking-wider text-amber-600 font-bold mb-1 block">The Why / Niyyah</label>
                       <textarea 
                          value={purposeInput}
                          onChange={(e) => setPurposeInput(e.target.value)}
                          onBlur={savePurpose}
                          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); savePurpose(); }}}
                          placeholder="Connect this to your greater goal..."
                          className="w-full bg-amber-50/50 p-2 text-xs font-serif italic text-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-200 rounded-sm resize-none"
                          rows={2}
                          autoFocus
                       />
                    </div>
                 ) : (
                    <div 
                      onClick={() => setIsEditingPurpose(true)}
                      className="cursor-pointer hover:bg-stone-100/50 p-1 rounded transition-colors group/purpose"
                    >
                       <div className="flex items-start gap-1">
                          <CornerDownRight size={10} className="text-amber-400 mt-1 flex-shrink-0" />
                          <p className="text-xs font-serif italic text-stone-500 leading-tight">
                            {task.purpose}
                          </p>
                       </div>
                    </div>
                 )}
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {task.subtasks.map((st, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 text-xs text-stone-600 font-sans cursor-pointer group/sub"
                    onClick={(e) => { e.stopPropagation(); toggleSubtask(task.id, idx); }}
                  >
                     <div className={`w-3 h-3 mt-0.5 rounded-[2px] border flex-shrink-0 flex items-center justify-center transition-colors ${st.completed ? 'bg-stone-400 border-stone-400' : 'border-stone-300 group-hover/sub:border-stone-500 bg-white'}`}>
                        {st.completed && <Check size={8} className="text-white" />}
                     </div>
                     <span className={`${st.completed ? 'line-through text-stone-400' : 'text-stone-600'} transition-colors leading-tight`}>
                       {st.title}
                     </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex gap-1 transition-opacity ${isCompleting ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} ml-2`}>
           <button 
            onClick={() => {
                setIsEditingTags(!isEditingTags);
                if (!isEditingTags) setTagsInput(task.tags?.join(', ') || '');
            }} 
            className={`p-1 rounded ${task.tags && task.tags.length > 0 ? 'text-stone-400 bg-stone-50' : 'text-stone-300 hover:bg-stone-100'}`}
            title="Edit Tags"
          >
            <Tag size={12} />
          </button>
           <button 
            onClick={() => {
                setIsEditingPurpose(!isEditingPurpose);
                if (!isEditingPurpose) setPurposeInput(task.purpose || '');
            }} 
            className={`p-1 rounded ${task.purpose ? 'text-amber-600 bg-amber-50' : 'text-stone-300 hover:bg-stone-100'}`}
            title="Set Purpose / Niyyah"
          >
            <Target size={12} />
          </button>
          
          {(!task.subtasks || task.subtasks.length === 0) && (
            <button 
              onClick={() => handleSimplify(task.id, task.title)} 
              className="p-1 hover:bg-stone-200 text-stone-400 rounded"
              title="Use AI to simplify"
            >
              {loadingAI === task.id ? <span className="animate-spin text-xs">⌛</span> : <Wand2 size={12} />}
            </button>
          )}
          <button 
            onClick={() => toggleFrog(task.id)} 
            className={`p-1 rounded ${task.isFrog ? 'text-emerald-600 bg-emerald-50' : 'text-stone-300 hover:bg-stone-100'}`}
          >
            🐸
          </button>
          <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-50 text-stone-300 hover:text-red-400 rounded">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      {/* Mover - kept for accessibility but drag also works */}
      <div className={`mt-3 pt-2 border-t border-stone-100 flex gap-1 justify-end transition-opacity ${isCompleting ? 'opacity-0' : ''}`}>
          <GripVertical size={10} className="text-stone-300 mr-auto" />
          {Object.values(TaskQuadrant).filter(q => q !== quadrant).map(q => (
          <button
            key={q}
            onClick={() => moveTask(task.id, q)}
            className="text-[9px] uppercase tracking-wider text-stone-400 hover:text-stone-700 px-1"
          >
            {q.substring(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
});

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks = [], setTasks, schedule, updateSchedule }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [newTaskPurpose, setNewTaskPurpose] = useState('');
  
  const [activeView, setActiveView] = useState<'matrix' | 'ivylee'>('matrix');
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const tagMenuRef = useRef<HTMLDivElement>(null);

  // Drag and Drop State
  const [dragOverQuadrant, setDragOverQuadrant] = useState<TaskQuadrant | null>(null);

  // Scheduling Modal State
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedHour, setSelectedHour] = useState(9);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(event.target as Node)) {
        setIsTagMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const tags = newTaskTags.split(',').map(t => t.trim()).filter(Boolean);
    const tempId = Date.now().toString();

    const newTask: Task = {
      id: tempId,
      title: newTaskTitle,
      completed: false,
      quadrant: TaskQuadrant.SCHEDULE, 
      isFrog: false,
      createdAt: Date.now(),
      tags: tags,
      purpose: newTaskPurpose, // Explicitly adding intention at creation
      blocks: 1 // Default to 1, update later via AI
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskTags('');
    setNewTaskPurpose('');

    // AI Difficulty Estimation
    try {
        const difficulty = await estimateTaskDifficulty(newTask.title);
        setTasks(prev => prev.map(t => t.id === tempId ? { ...t, blocks: difficulty } : t));
    } catch (err) {
        console.error("Failed to estimate difficulty", err);
    }
  };

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [setTasks]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [setTasks]);

  const moveTask = useCallback((id: string, quadrant: TaskQuadrant) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, quadrant } : t));
  }, [setTasks]);

  const toggleFrog = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isFrog: !t.isFrog } : t));
  }, [setTasks]);

  const updatePurpose = useCallback((id: string, purpose: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, purpose } : t));
  }, [setTasks]);

  const updateTags = useCallback((id: string, tags: string[]) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, tags } : t));
  }, [setTasks]);

  const handleSimplify = useCallback(async (taskId: string, title: string) => {
    setLoadingAI(taskId);
    const steps = await simplifyTask(title);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: steps.map(s => ({ title: s, completed: false })) } : t));
    setLoadingAI(null);
  }, [setTasks]);

  const toggleSubtask = useCallback((taskId: string, index: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        const newSubtasks = [...t.subtasks];
        newSubtasks[index] = { ...newSubtasks[index], completed: !newSubtasks[index].completed };
        return { ...t, subtasks: newSubtasks };
      }
      return t;
    }));
  }, [setTasks]);

  // Drag and Drop Logic
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = (e: React.DragEvent, quadrant: TaskQuadrant) => {
    e.preventDefault();
    if (dragOverQuadrant !== quadrant) {
      setDragOverQuadrant(quadrant);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Check if the related target is still inside the current target (the drop zone)
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverQuadrant(null);
  };

  const handleDrop = (e: React.DragEvent, quadrant: TaskQuadrant) => {
    e.preventDefault();
    setDragOverQuadrant(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, quadrant);
    }
  };

  // Schedule Logic
  const handleOpenScheduler = useCallback((taskId: string) => {
      setSchedulingTaskId(taskId);
      // Optional: if task already scheduled, preload that time
      const existingSlot = Object.entries(schedule.ideal).find(([key, block]) => block.taskId === taskId);
      if (existingSlot) {
          const [d, h] = existingSlot[0].split('-');
          setSelectedDay(d);
          setSelectedHour(parseInt(h));
      }
  }, [schedule]);

  const confirmSchedule = () => {
      if (!schedulingTaskId) return;
      const targetTask = tasks.find(t => t.id === schedulingTaskId);
      if (!targetTask) return;

      const key = `${selectedDay}-${selectedHour}`;
      
      // Clean up previous slot if exists
      const newIdeal = { ...schedule.ideal };
      Object.keys(newIdeal).forEach(k => {
          if (newIdeal[k].taskId === schedulingTaskId) {
              delete newIdeal[k]; // or just remove taskId? For now, remove block to move it.
          }
      });

      // Set new slot
      newIdeal[key] = {
          category: 'DEEP', // Default
          label: targetTask.title,
          taskId: schedulingTaskId
      };

      updateSchedule({ ...schedule, ideal: newIdeal });
      setSchedulingTaskId(null);
  };

  const clearTaskSchedule = () => {
    if (!schedulingTaskId) return;
    const newIdeal = { ...schedule.ideal };
      Object.keys(newIdeal).forEach(k => {
          if (newIdeal[k].taskId === schedulingTaskId) {
              delete newIdeal[k]; 
          }
      });
    updateSchedule({ ...schedule, ideal: newIdeal });
    setSchedulingTaskId(null);
  }

  // Derive unique tags for filter dropdown
  const uniqueTags = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    // Use reduce instead of flatMap for better robustness and compatibility
    const allTags = tasks.reduce<string[]>((acc, t) => {
      if (t.tags && Array.isArray(t.tags)) {
        return acc.concat(t.tags);
      }
      return acc;
    }, []);

    return Array.from(new Set(allTags)).sort();
  }, [tasks]);

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Helper to find schedule slot for a task
  const getTaskSlot = (taskId: string) => {
      const entry = Object.entries(schedule.ideal).find(([_, block]) => block.taskId === taskId);
      return entry ? entry[0] : null;
  };

  // Memoize Sorted Tasks by Quadrant
  const sortedQuadrantTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      return {
        [TaskQuadrant.DO]: [],
        [TaskQuadrant.SCHEDULE]: [],
        [TaskQuadrant.DELEGATE]: [],
        [TaskQuadrant.DELETE]: [],
      };
    }

    const getSorted = (list: Task[]) => {
      return [...list].sort((a, b) => {
        switch (sortBy) {
          case 'NEWEST':
            return b.createdAt - a.createdAt;
          case 'OLDEST':
            return a.createdAt - b.createdAt;
          case 'AZ':
            return a.title.localeCompare(b.title);
          case 'ZA':
            return b.title.localeCompare(a.title);
          case 'PRIORITY':
            if (a.isFrog === b.isFrog) return b.createdAt - a.createdAt;
            return a.isFrog ? -1 : 1;
          default:
            return 0;
        }
      });
    };

    let activeTasks = tasks.filter(t => !t.completed);
    
    // Apply Tag Filter
    if (selectedTags.length > 0) {
      activeTasks = activeTasks.filter(t => t.tags?.some(tag => selectedTags.includes(tag)));
    }

    return {
      [TaskQuadrant.DO]: getSorted(activeTasks.filter(t => t.quadrant === TaskQuadrant.DO)),
      [TaskQuadrant.SCHEDULE]: getSorted(activeTasks.filter(t => t.quadrant === TaskQuadrant.SCHEDULE)),
      [TaskQuadrant.DELEGATE]: getSorted(activeTasks.filter(t => t.quadrant === TaskQuadrant.DELEGATE)),
      [TaskQuadrant.DELETE]: getSorted(activeTasks.filter(t => t.quadrant === TaskQuadrant.DELETE)),
    };
  }, [tasks, sortBy, selectedTags]);

  const ivyLeeTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    return tasks
      .filter(t => !t.completed)
      .filter(t => selectedTags.length > 0 ? t.tags?.some(tag => selectedTags.includes(tag)) : true)
      .sort((a, b) => (a.isFrog === b.isFrog ? 0 : a.isFrog ? -1 : 1))
      .slice(0, 6);
  }, [tasks, selectedTags]);

  const renderQuadrant = (quadrant: TaskQuadrant, title: string, description: string, colorClass: string) => {
    const qTasks = sortedQuadrantTasks[quadrant];
    const isOver = dragOverQuadrant === quadrant;

    return (
      <div 
        onDragOver={(e) => handleDragOver(e, quadrant)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, quadrant)}
        className={`p-5 rounded-sm border-t-4 ${colorClass} bg-white shadow-sm flex flex-col h-full transition-colors duration-200 ${isOver ? 'bg-stone-50 ring-2 ring-stone-200' : ''}`}
      >
        <div className="mb-6 border-b border-stone-100 pb-2 flex justify-between items-start pointer-events-none">
          <div>
            <h3 className="font-serif font-bold text-stone-800 text-lg">{title}</h3>
            <p className="text-[10px] uppercase tracking-wider text-stone-400">{description}</p>
          </div>
          <div className="text-xs text-stone-300 font-serif">
            {qTasks.length}
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
          {qTasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-stone-300 text-sm italic font-serif pointer-events-none">
              {selectedTags.length > 0 ? 'No tasks with these tags' : 'Empty'}
            </div>
          )}
          {qTasks.map(task => (
            <MatrixTaskItem 
              key={task.id}
              task={task}
              quadrant={quadrant}
              toggleTask={toggleTask}
              toggleFrog={toggleFrog}
              deleteTask={deleteTask}
              moveTask={moveTask}
              handleSimplify={handleSimplify}
              toggleSubtask={toggleSubtask}
              updatePurpose={updatePurpose}
              updateTags={updateTags}
              loadingAI={loadingAI}
              scheduledSlot={getTaskSlot(task.id)}
              onOpenScheduler={handleOpenScheduler}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Top Toolbar: View Switcher & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-stone-200">
         <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView('matrix')}
              className={`flex items-center gap-2 text-sm font-serif transition-colors ${activeView === 'matrix' ? 'text-stone-800 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <LayoutGrid size={16} />
              Eisenhower Matrix
            </button>
            <button
              onClick={() => setActiveView('ivylee')}
              className={`flex items-center gap-2 text-sm font-serif transition-colors ${activeView === 'ivylee' ? 'text-stone-800 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <List size={16} />
              Ivy Lee Method
            </button>
         </div>

         {/* Filters */}
         {activeView === 'matrix' && (
            <div className="flex items-center gap-4">
              {/* Multi-Select Tag Filter */}
              <div className="relative" ref={tagMenuRef}>
                 <button 
                    onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors ${selectedTags.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-stone-50 border-stone-100 text-stone-500 hover:border-stone-300'}`}
                 >
                    <Filter size={12} />
                    <span className="text-xs font-serif font-medium">
                        {selectedTags.length > 0 ? `Tags (${selectedTags.length})` : 'Filter Tags'}
                    </span>
                 </button>

                 {isTagMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-stone-200 shadow-xl rounded-sm z-50 animate-fade-in">
                        <div className="p-3 border-b border-stone-100 flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Available Tags</span>
                            {selectedTags.length > 0 && (
                                <button onClick={() => setSelectedTags([])} className="text-[10px] text-red-400 hover:text-red-600">Clear</button>
                            )}
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {uniqueTags.length === 0 ? (
                                <div className="p-4 text-center text-xs text-stone-400 italic">No tags created yet</div>
                            ) : (
                                uniqueTags.map(tag => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <div 
                                            key={tag} 
                                            onClick={() => toggleTagFilter(tag)}
                                            className={`flex items-center gap-3 px-2 py-2 cursor-pointer rounded-sm hover:bg-stone-50 transition-colors ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}
                                        >
                                            <div className={`text-stone-400 ${isSelected ? 'text-stone-800' : ''}`}>
                                                {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                            </div>
                                            <span className="text-sm font-serif truncate">#{tag}</span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                 )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 group cursor-pointer bg-stone-50 px-3 py-1.5 rounded-sm border border-stone-100 hover:border-stone-300 transition-colors">
                <ArrowUpDown size={12} className="text-stone-400 group-hover:text-stone-600" />
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-serif text-stone-600 focus:outline-none cursor-pointer hover:text-stone-800 appearance-none pr-2"
                  >
                    <option value="NEWEST">Newest</option>
                    <option value="OLDEST">Oldest</option>
                    <option value="PRIORITY">Priority</option>
                    <option value="AZ">Name (A-Z)</option>
                    <option value="ZA">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
         )}
      </div>

      {/* Enhanced Task Creation Card */}
      <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 transition-all duration-300 focus-within:ring-1 focus-within:ring-stone-200">
        <form onSubmit={addTask}>
            <div className="flex flex-col gap-4">
                {/* Title Input */}
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-stone-100 rounded-full text-stone-400">
                      <Plus size={18} />
                   </div>
                   <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 bg-transparent text-xl font-serif text-stone-800 placeholder:text-stone-300 focus:outline-none"
                   />
                </div>

                {/* Expanded Fields */}
                <div className="pl-12 space-y-3">
                   {/* Purpose Input - The "Why" */}
                   <div className="flex items-start gap-2">
                      <CornerDownRight size={14} className="text-amber-500 mt-2 flex-shrink-0" />
                      <input
                        type="text"
                        value={newTaskPurpose}
                        onChange={(e) => setNewTaskPurpose(e.target.value)}
                        placeholder="Why is this important? (Connect to Niyyah/Goal)"
                        className="flex-1 bg-amber-50/50 px-3 py-2 text-sm font-serif italic text-stone-600 focus:bg-amber-50 focus:outline-none rounded-sm placeholder:text-amber-700/30 transition-colors"
                      />
                   </div>

                   {/* Tags Input */}
                   <div className="flex items-center gap-2">
                      <Tag size={14} className="text-stone-300 flex-shrink-0 ml-1" />
                      <input 
                        type="text"
                        value={newTaskTags}
                        onChange={(e) => setNewTaskTags(e.target.value)}
                        placeholder="Tags (comma separated)..."
                        className="flex-1 bg-transparent text-xs text-stone-500 focus:outline-none placeholder:text-stone-300 ml-1"
                      />
                   </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-2 border-t border-stone-50 mt-2">
                   <button 
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="bg-stone-800 text-white px-6 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-stone-700 disabled:opacity-50 transition-colors shadow-sm"
                   >
                     Add Task
                   </button>
                </div>
            </div>
        </form>
      </div>

      {/* Main View Switcher */}
      {activeView === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
          {renderQuadrant(TaskQuadrant.DO, 'Do First', 'Urgent & Important', 'border-amber-700/60')}
          {renderQuadrant(TaskQuadrant.SCHEDULE, 'Schedule', 'Deep Work & Strategy', 'border-stone-600')}
          {renderQuadrant(TaskQuadrant.DELEGATE, 'Delegate', 'Urgent, Not Important', 'border-stone-400')}
          {renderQuadrant(TaskQuadrant.DELETE, 'Eliminate', 'Distractions', 'border-stone-300')}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-sm shadow-sm border border-stone-200 max-w-2xl mx-auto relative animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-2 bg-stone-800"></div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-stone-800">The Ivy Lee Method</h2>
            <p className="text-stone-500 mt-3 font-serif italic">Simplicity is the ultimate sophistication.</p>
          </div>

          <div className="space-y-6">
            {ivyLeeTasks.length === 0 ? (
              <div className="text-center py-12 text-stone-400 font-serif italic">Your mind is clear.</div>
            ) : (
              ivyLeeTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`relative p-6 border-b transition-all ${
                    index === 0 
                      ? 'border-stone-800 bg-[#FAF9F6] shadow-sm -mx-4 px-10' 
                      : 'border-stone-100 text-stone-500'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`font-serif font-bold text-2xl w-8 text-center ${index === 0 ? 'text-stone-800' : 'text-stone-300'}`}>
                      {index + 1}.
                    </div>
                    <div className="flex-1">
                      <span className={`font-serif text-lg ${index === 0 ? 'text-stone-800' : ''}`}>{task.title}</span>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                         <span className="text-[9px] bg-stone-100 text-stone-400 px-1 rounded flex items-center gap-1">
                           <Box size={8} /> {task.blocks || 1}
                         </span>
                        {task.tags?.map((tag, i) => (
                           <span key={i} className="text-[9px] bg-stone-100 text-stone-400 px-1 rounded">#{tag}</span>
                        ))}
                      </div>

                      {task.purpose && (
                        <div className="text-xs font-serif italic text-amber-600/70 mt-1 flex items-center gap-1">
                          <CornerDownRight size={10} />
                          {task.purpose}
                        </div>
                      )}
                      
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-2 pl-2 border-l border-stone-200">
                           {task.subtasks.map((st, i) => (
                              <div key={i} className={`text-xs my-1 flex items-center gap-2 ${st.completed ? 'text-stone-300 line-through' : 'text-stone-500'}`}>
                                <div className={`w-2 h-2 rounded-full border ${st.completed ? 'bg-stone-300 border-stone-300' : 'border-stone-300'}`}></div>
                                {st.title}
                              </div>
                           ))}
                        </div>
                      )}
                    </div>
                    {index === 0 && (
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className="text-xs uppercase tracking-widest border border-stone-800 px-4 py-2 hover:bg-stone-800 hover:text-white transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-12 text-center text-xs text-stone-400 uppercase tracking-widest">
            Limit: 6 Tasks
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {schedulingTaskId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm p-6 rounded-sm shadow-xl border border-stone-200 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-stone-400" size={18} />
                        <h3 className="font-serif font-bold text-lg text-stone-800">Assign Time</h3>
                    </div>
                    <button onClick={() => setSchedulingTaskId(null)} className="text-stone-400 hover:text-stone-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Ideal Day</label>
                        <div className="grid grid-cols-4 gap-2">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`py-2 text-xs font-bold rounded-sm border ${selectedDay === day ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Start Hour</label>
                         <select 
                            value={selectedHour} 
                            onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                            className="w-full p-2 bg-stone-50 border border-stone-200 outline-none font-serif"
                         >
                             {HOURS.map(h => (
                                 <option key={h} value={h}>{h}:00</option>
                             ))}
                         </select>
                    </div>

                    <div className="pt-4 flex gap-2">
                        {getTaskSlot(schedulingTaskId) && (
                            <button 
                                onClick={clearTaskSchedule}
                                className="px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Clear Schedule"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button 
                            onClick={confirmSchedule}
                            className="flex-1 bg-stone-800 text-white py-3 font-bold text-xs uppercase tracking-widest hover:bg-stone-700"
                        >
                            Set Schedule
                        </button>
                    </div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};
