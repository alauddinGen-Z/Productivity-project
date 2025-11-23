import React, { useState, useMemo, useCallback } from 'react';
import { Task, TaskQuadrant, WeeklySchedule, TimeBlock } from '../types';
import { Box, CornerDownRight } from 'lucide-react';
import { SchedulingModal } from './SchedulingModal';
import { useSound } from '../hooks/useSound';

// Sub-components
import { TaskToolbar } from './TaskToolbar';
import { TaskCreationForm } from './TaskCreationForm';
import { TaskQuadrantColumn } from './TaskQuadrantColumn';

interface TaskMatrixProps {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  schedule: WeeklySchedule;
  updateSchedule: (schedule: WeeklySchedule) => void;
  toggleTask: (id: string) => void;
}

type SortOption = 'NEWEST' | 'OLDEST' | 'AZ' | 'ZA' | 'PRIORITY';

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks = [], setTasks, schedule, updateSchedule, toggleTask }) => {
  const [activeView, setActiveView] = useState<'matrix' | 'ivylee'>('matrix');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const { playClick, playAdd } = useSound();

  // --- Handlers ---
  const handleAddTask = (newTaskPart: Partial<Task>, slot: {key: string, label: string, hour: number} | null) => {
    playAdd();
    const tempId = Date.now().toString();
    const newTask: Task = {
      id: tempId,
      title: newTaskPart.title || 'Untitled',
      completed: false,
      quadrant: TaskQuadrant.SCHEDULE, 
      isFrog: false,
      createdAt: Date.now(),
      tags: newTaskPart.tags || [],
      purpose: newTaskPart.purpose || '',
      blocks: newTaskPart.blocks || 1
    };
    
    setTasks(prev => [...prev, newTask]);
    
    if (slot) {
        const newIdeal: Record<string, TimeBlock> = { ...schedule.ideal };
        if (newIdeal[slot.key]) {
            newIdeal[slot.key] = {
                ...newIdeal[slot.key],
                taskId: tempId
            };
            updateSchedule({ ...schedule, ideal: newIdeal });
        }
    }
  };

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const newIdeal: Record<string, TimeBlock> = { ...schedule.ideal };
    let changed = false;
    Object.keys(newIdeal).forEach(key => {
        if (newIdeal[key].taskId === id) {
            delete newIdeal[key].taskId;
            changed = true;
        }
    });
    if (changed) updateSchedule({ ...schedule, ideal: newIdeal });
  }, [setTasks, schedule, updateSchedule]);

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

  const handleAddSubtask = useCallback((taskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const currentSubtasks = t.subtasks || [];
        return { ...t, subtasks: [...currentSubtasks, { title, completed: false }] };
      }
      return t;
    }));
  }, [setTasks]);

  const handleDeleteSubtask = useCallback((taskId: string, index: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        const newSubtasks = t.subtasks.filter((_, i) => i !== index);
        return { ...t, subtasks: newSubtasks };
      }
      return t;
    }));
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

  const confirmSchedule = (day: string, hour: number) => {
      if (!schedulingTaskId) return;
      playClick();
      const targetTask = tasks.find(t => t.id === schedulingTaskId);
      if (!targetTask) return;

      const key = `${day}-${hour}`;
      const newIdeal: Record<string, TimeBlock> = { ...schedule.ideal };
      // Clear old slot for this task if exists
      Object.keys(newIdeal).forEach(k => {
          if (newIdeal[k].taskId === schedulingTaskId) {
              const oldBlock = newIdeal[k];
              const newBlock = { ...oldBlock };
              delete newBlock.taskId;
              newIdeal[k] = newBlock;
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
    const newIdeal: Record<string, TimeBlock> = { ...schedule.ideal };
      Object.keys(newIdeal).forEach(k => {
          if (newIdeal[k].taskId === schedulingTaskId) {
              const oldBlock = newIdeal[k];
              const newBlock = { ...oldBlock };
              delete newBlock.taskId;
              newIdeal[k] = newBlock;
          }
      });
    updateSchedule({ ...schedule, ideal: newIdeal });
    setSchedulingTaskId(null);
  };

  const getTaskSlot = (taskId: string) => {
      const entry = Object.entries(schedule.ideal).find(([_, block]) => block.taskId === taskId);
      return entry ? entry[0] : null;
  };

  // --- Derived State ---
  const uniqueTags = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    const allTags = tasks.reduce<string[]>((acc, t) => {
      if (t.tags && Array.isArray(t.tags)) return acc.concat(t.tags);
      return acc;
    }, []);
    return Array.from(new Set(allTags)).sort();
  }, [tasks]);

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

  return (
    <div className="space-y-6 animate-fade-in relative">
      <TaskToolbar 
        activeView={activeView}
        setActiveView={setActiveView}
        selectedTags={selectedTags}
        toggleTagFilter={(tag) => {
            playClick();
            setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
        }}
        clearTags={() => setSelectedTags([])}
        uniqueTags={uniqueTags}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <TaskCreationForm onAddTask={handleAddTask} schedule={schedule} />

      {activeView === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.DO}
             title="Do First"
             description="Urgent & Important"
             colorClass="border-amber-700/60"
             tasks={sortedQuadrantTasks[TaskQuadrant.DO]}
             toggleTask={toggleTask}
             toggleFrog={toggleFrog}
             deleteTask={deleteTask}
             moveTask={moveTask}
             addSubtask={handleAddSubtask}
             deleteSubtask={handleDeleteSubtask}
             toggleSubtask={toggleSubtask}
             updatePurpose={updatePurpose}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
          />
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.SCHEDULE}
             title="Schedule"
             description="Deep Work & Strategy"
             colorClass="border-stone-600"
             tasks={sortedQuadrantTasks[TaskQuadrant.SCHEDULE]}
             toggleTask={toggleTask}
             toggleFrog={toggleFrog}
             deleteTask={deleteTask}
             moveTask={moveTask}
             addSubtask={handleAddSubtask}
             deleteSubtask={handleDeleteSubtask}
             toggleSubtask={toggleSubtask}
             updatePurpose={updatePurpose}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
          />
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.DELEGATE}
             title="Delegate"
             description="Urgent, Not Important"
             colorClass="border-stone-400"
             tasks={sortedQuadrantTasks[TaskQuadrant.DELEGATE]}
             toggleTask={toggleTask}
             toggleFrog={toggleFrog}
             deleteTask={deleteTask}
             moveTask={moveTask}
             addSubtask={handleAddSubtask}
             deleteSubtask={handleDeleteSubtask}
             toggleSubtask={toggleSubtask}
             updatePurpose={updatePurpose}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
          />
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.DELETE}
             title="Eliminate"
             description="Distractions"
             colorClass="border-stone-300"
             tasks={sortedQuadrantTasks[TaskQuadrant.DELETE]}
             toggleTask={toggleTask}
             toggleFrog={toggleFrog}
             deleteTask={deleteTask}
             moveTask={moveTask}
             addSubtask={handleAddSubtask}
             deleteSubtask={handleDeleteSubtask}
             toggleSubtask={toggleSubtask}
             updatePurpose={updatePurpose}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
          />
        </div>
      ) : (
        <div className="bg-white p-12 rounded-sm shadow-sm border border-stone-200 max-w-2xl mx-auto relative animate-fade-in">
          {/* Ivy Lee View Implementation */}
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