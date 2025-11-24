
import React, { useState, useMemo, useCallback } from 'react';
import { Task, TaskQuadrant, WeeklySchedule, TimeBlock, Settings } from '../types';
import { Box, CornerDownRight } from 'lucide-react';
import { SchedulingModal } from './SchedulingModal';
import { useSound } from '../hooks/useSound';
import { generateId } from '../utils/helpers';
import { t } from '../utils/translations';

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
  language?: Settings['language'];
}

export type SortOption = 'NEWEST' | 'OLDEST' | 'AZ' | 'ZA' | 'PRIORITY' | 'BLOCKS_DESC' | 'BLOCKS_ASC';

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks = [], setTasks, schedule, updateSchedule, toggleTask, language = 'en' }) => {
  const [activeView, setActiveView] = useState<'matrix' | 'ivylee'>('matrix');
  const [sortBy, setSortBy] = useState<SortOption>('PRIORITY');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const { playClick, playAdd } = useSound();
  
  // --- Handlers ---
  const handleAddTask = (newTaskPart: Partial<Task>, slot: {key: string, label: string, hour: number} | null) => {
    playAdd();
    // Use proper UUID for database compatibility
    const tempId = generateId();
    const newTask: Task = {
      id: tempId,
      title: newTaskPart.title || t('task_untitled', language),
      completed: false,
      quadrant: TaskQuadrant.SCHEDULE, 
      isFrog: false,
      createdAt: Date.now(),
      tags: newTaskPart.tags || [],
      purpose: newTaskPart.purpose || '',
      blocks: newTaskPart.blocks || 1,
      duration: newTaskPart.duration || 60
    };
    
    setTasks(prev => [...prev, newTask]);
    
    if (slot) {
        const newIdeal: Record<string, TimeBlock> = { ...schedule.ideal };
        // The slot key from Form might be "Day-Hour" or "Day-Hour-30"
        
        newIdeal[slot.key] = {
            category: 'DEEP', // Default category for new tasks
            label: newTask.title,
            taskId: tempId,
            duration: newTask.duration
        };
        updateSchedule({ ...schedule, ideal: newIdeal });
    }
  };

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const newIdeal: Record<string, TimeBlock> = { ...schedule.ideal };
    let changed = false;
    Object.keys(newIdeal).forEach(key => {
        if (newIdeal[key].taskId === id) {
            delete newIdeal[key]; // Actually remove the block
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

  const updateTitle = useCallback((id: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t));
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
             delete newIdeal[k];
          }
      });

      const existingBlock = newIdeal[key];
      newIdeal[key] = {
          category: existingBlock ? existingBlock.category : 'DEEP',
          label: existingBlock ? existingBlock.label : targetTask.title,
          taskId: schedulingTaskId,
          duration: targetTask.duration || 60
      };

      updateSchedule({ ...schedule, ideal: newIdeal });
      setSchedulingTaskId(null);
  };

  const clearTaskSchedule = () => {
    if (!schedulingTaskId) return;
    const newIdeal: Record<string, TimeBlock> = { ...schedule.ideal };
      Object.keys(newIdeal).forEach(k => {
          if (newIdeal[k].taskId === schedulingTaskId) {
              delete newIdeal[k];
          }
      });
    updateSchedule({ ...schedule, ideal: newIdeal });
    setSchedulingTaskId(null);
  };

  const getTaskSlot = (taskId: string) => {
      const entry = Object.entries(schedule.ideal).find(([_, block]) => block.taskId === taskId);
      if (!entry) return null;
      // Format key to user readable: "Mon-9" or "Mon-9-30"
      const [d, h, m] = entry[0].split('-');
      return m ? `${d}-${h}:30` : `${d}-${h}`;
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
            // 1. Frogs first
            if (a.isFrog !== b.isFrog) return a.isFrog ? -1 : 1;
            // 2. Then higher blocks (effort)
            if (a.blocks !== b.blocks) return b.blocks - a.blocks;
            // 3. Then newest
            return b.createdAt - a.createdAt;
          case 'BLOCKS_DESC': 
            if (a.blocks !== b.blocks) return b.blocks - a.blocks;
            return b.createdAt - a.createdAt;
          case 'BLOCKS_ASC': 
            if (a.blocks !== b.blocks) return a.blocks - b.blocks;
            return b.createdAt - a.createdAt;
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
        language={language}
      />

      <TaskCreationForm 
        onAddTask={handleAddTask} 
        schedule={schedule} 
        existingTags={uniqueTags}
        language={language}
      />

      {activeView === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.DO}
             title={t('matrix_do', language)}
             description={t('matrix_do_desc', language)}
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
             updateTitle={updateTitle}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
             uniqueTags={uniqueTags}
             language={language}
          />
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.SCHEDULE}
             title={t('matrix_schedule', language)}
             description={t('matrix_schedule_desc', language)}
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
             updateTitle={updateTitle}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
             uniqueTags={uniqueTags}
             language={language}
          />
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.DELEGATE}
             title={t('matrix_delegate', language)}
             description={t('matrix_delegate_desc', language)}
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
             updateTitle={updateTitle}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
             uniqueTags={uniqueTags}
             language={language}
          />
          <TaskQuadrantColumn 
             quadrant={TaskQuadrant.DELETE}
             title={t('matrix_delete', language)}
             description={t('matrix_delete_desc', language)}
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
             updateTitle={updateTitle}
             updateTags={updateTags}
             getTaskSlot={getTaskSlot}
             onOpenScheduler={(id) => { playClick(); setSchedulingTaskId(id); }}
             selectedTags={selectedTags}
             uniqueTags={uniqueTags}
             language={language}
          />
        </div>
      ) : (
        <div className="bg-white p-12 rounded-sm shadow-sm border border-stone-200 max-w-2xl mx-auto relative animate-fade-in">
          {/* Ivy Lee View Implementation */}
          <div className="absolute top-0 left-0 w-full h-2 bg-stone-800"></div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-stone-800">{t('matrix_view_list', language)}</h2>
            <p className="text-stone-500 mt-3 font-serif italic">{t('matrix_view_list_desc', language)}</p>
          </div>

          <div className="space-y-6">
            {ivyLeeTasks.length === 0 ? (
              <div className="text-center py-12 text-stone-400 font-serif italic">{t('matrix_empty', language)}</div>
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
                         {task.duration === 30 && (
                             <span className="text-[9px] bg-amber-50 text-amber-600 px-1 rounded flex items-center gap-1">
                               {t('task_30m', language)}
                             </span>
                         )}
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
                        {t('matrix_complete_btn', language)}
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
            language={language}
        />
      )}
    </div>
  );
};
