
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Task, TaskQuadrant, WeeklySchedule } from '../types';
import { Plus, LayoutGrid, List, Filter, CheckSquare, Square, ArrowUpDown, Tag, CornerDownRight, Box, Clock, Calendar, ChevronDown, X, Zap } from 'lucide-react';
import { estimateTaskDifficulty, simplifyTask } from '../services/geminiService';
import { MatrixTaskItem } from './MatrixTaskItem';
import { SchedulingModal } from './SchedulingModal';

interface TaskMatrixProps {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  schedule: WeeklySchedule;
  updateSchedule: (schedule: WeeklySchedule) => void;
}

type SortOption = 'NEWEST' | 'OLDEST' | 'AZ' | 'ZA' | 'PRIORITY';

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks = [], setTasks, schedule, updateSchedule }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [newTaskPurpose, setNewTaskPurpose] = useState('');
  // New State for Quick Scheduling
  const [newTaskSlot, setNewTaskSlot] = useState<{key: string, label: string, hour: number} | null>(null);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  const [activeView, setActiveView] = useState<'matrix' | 'ivylee'>('matrix');
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const tagMenuRef = useRef<HTMLDivElement>(null);
  const timeMenuRef = useRef<HTMLDivElement>(null);

  // Scheduling Modal State
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(event.target as Node)) {
        setIsTagMenuOpen(false);
      }
      if (timeMenuRef.current && !timeMenuRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Quick Schedule Logic ---
  const todayKey = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'short' }), []);
  
  const availableSlots = useMemo(() => {
      const slots = [];
      const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am - 9pm
      
      for (const h of hours) {
          const key = `${todayKey}-${h}`;
          const block = schedule.ideal[key];
          if (block) {
              slots.push({
                  key,
                  hour: h,
                  label: block.label,
                  category: block.category,
                  isBusy: !!block.taskId // Check if already assigned
              });
          }
      }
      return slots;
  }, [schedule.ideal, todayKey]);


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
    
    // Handle Quick Schedule Linking
    if (newTaskSlot) {
        const newIdeal = { ...schedule.ideal };
        // Check if slot still exists
        if (newIdeal[newTaskSlot.key]) {
            newIdeal[newTaskSlot.key] = {
                ...newIdeal[newTaskSlot.key],
                taskId: tempId // Link the new task
            };
            updateSchedule({ ...schedule, ideal: newIdeal });
        }
    }

    // Reset Form
    setNewTaskTitle('');
    setNewTaskTags('');
    setNewTaskPurpose('');
    setNewTaskSlot(null);

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
    // Also remove from schedule if linked
    const newIdeal = { ...schedule.ideal };
    let changed = false;
    Object.keys(newIdeal).forEach(key => {
        if (newIdeal[key].taskId === id) {
            delete newIdeal[key].taskId;
            changed = true;
        }
    });
    if (changed) updateSchedule({ ...schedule, ideal: newIdeal });

  }, [setTasks, schedule, updateSchedule]);

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

  // Schedule Logic
  const handleOpenScheduler = useCallback((taskId: string) => {
      setSchedulingTaskId(taskId);
  }, []);

  const confirmSchedule = (day: string, hour: number) => {
      if (!schedulingTaskId) return;
      const targetTask = tasks.find(t => t.id === schedulingTaskId);
      if (!targetTask) return;

      const key = `${day}-${hour}`;
      
      const newIdeal = { ...schedule.ideal };
      // Remove old slot if any
      Object.keys(newIdeal).forEach(k => {
          if (newIdeal[k].taskId === schedulingTaskId) {
              delete newIdeal[k]; 
          }
      });

      const existingBlock = newIdeal[key];
      newIdeal[key] = {
          category: existingBlock ? existingBlock.category : 'DEEP',
          label: existingBlock ? existingBlock.label : targetTask.title,
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
              delete newIdeal[k].taskId;
          }
      });
    updateSchedule({ ...schedule, ideal: newIdeal });
    setSchedulingTaskId(null);
  };

  const getTaskSlot = (taskId: string) => {
      const entry = Object.entries(schedule.ideal).find(([_, block]) => block.taskId === taskId);
      return entry ? entry[0] : null;
  };

  // Derive unique tags for filter dropdown
  const uniqueTags = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
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
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Memoize Sorted Tasks by Quadrant
  const sortedQuadrantTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      return { [TaskQuadrant.DO]: [], [TaskQuadrant.SCHEDULE]: [], [TaskQuadrant.DELEGATE]: [], [TaskQuadrant.DELETE]: [] };
    }

    const getSorted = (list: Task[]) => {
      return [...list].sort((a, b) => {
        switch (sortBy) {
          case 'NEWEST': return b.createdAt - a.createdAt;
          case 'OLDEST': return a.createdAt - b.createdAt;
          case 'AZ': return a.title.localeCompare(b.title);
          case 'ZA': return b.title.localeCompare(a.title);
          case 'PRIORITY':
            if (a.isFrog === b.isFrog) return b.createdAt - a.createdAt;
            return a.isFrog ? -1 : 1;
          default: return 0;
        }
      });
    };

    let activeTasks = tasks.filter(t => !t.completed);
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

    return (
      <div className={`p-5 rounded-sm border-t-4 ${colorClass} bg-white shadow-sm flex flex-col h-full`}>
        <div className="mb-6 border-b border-stone-100 pb-2 flex justify-between items-start">
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
            <div className="h-full flex items-center justify-center text-stone-300 text-sm italic font-serif">
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

                <div className="pl-12 space-y-3">
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

                   <div className="flex items-center gap-4">
                      {/* Tags Input */}
                      <div className="flex items-center gap-2 flex-1">
                          <Tag size={14} className="text-stone-300 flex-shrink-0 ml-1" />
                          <input 
                            type="text"
                            value={newTaskTags}
                            onChange={(e) => setNewTaskTags(e.target.value)}
                            placeholder="Tags (comma separated)..."
                            className="w-full bg-transparent text-xs text-stone-500 focus:outline-none placeholder:text-stone-300 ml-1"
                          />
                      </div>

                      {/* Quick Schedule Selector */}
                      <div className="relative" ref={timeMenuRef}>
                          {newTaskSlot ? (
                              <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-sm border border-amber-300">
                                  <Clock size={12} className="text-amber-700" />
                                  <span className="text-xs font-bold text-amber-800 font-mono">
                                    {todayKey} @ {newTaskSlot.hour}:00
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => setNewTaskSlot(null)}
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
                                      availableSlots.map(slot => (
                                          <button
                                              key={slot.key}
                                              type="button"
                                              onClick={() => {
                                                  if (slot.isBusy) return;
                                                  setNewTaskSlot({ key: slot.key, label: slot.label, hour: slot.hour });
                                                  setIsTimeDropdownOpen(false);
                                              }}
                                              disabled={slot.isBusy}
                                              className={`w-full text-left px-3 py-2 border-b border-stone-50 flex items-center justify-between group ${
                                                  slot.isBusy ? 'bg-stone-50 opacity-50 cursor-not-allowed' : 'hover:bg-amber-50 cursor-pointer'
                                              }`}
                                          >
                                              <div className="flex flex-col">
                                                  <span className="text-xs font-mono font-bold text-stone-600">{slot.hour}:00</span>
                                                  <span className="text-[10px] text-stone-400">{slot.label}</span>
                                              </div>
                                              {slot.isBusy ? (
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
                    disabled={!newTaskTitle.trim()}
                    className="bg-stone-800 text-white px-6 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-stone-700 disabled:opacity-50 transition-colors shadow-sm"
                   >
                     Add Task
                   </button>
                </div>
            </div>
        </form>
      </div>

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
                    index === 0 ? 'border-stone-800 bg-[#FAF9F6] shadow-sm -mx-4 px-10' : 'border-stone-100 text-stone-500'
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

      {schedulingTaskId && (
        <SchedulingModal 
            schedule={schedule}
            taskId={schedulingTaskId}
            onClose={() => setSchedulingTaskId(null)}
            onConfirm={confirmSchedule}
            onClear={clearTaskSchedule}
            existingSlot={getTaskSlot(schedulingTaskId)}
        />
      )}
    </div>
  );
};
