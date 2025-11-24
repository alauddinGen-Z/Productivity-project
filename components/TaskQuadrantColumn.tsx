
import React from 'react';
import { Task, TaskQuadrant, Settings } from '../types';
import { MatrixTaskItem } from './MatrixTaskItem';
import { useSound } from '../hooks/useSound';

interface TaskQuadrantColumnProps {
  quadrant: TaskQuadrant;
  title: string;
  description: string;
  colorClass: string;
  tasks: Task[];
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
  getTaskSlot: (taskId: string) => string | null;
  onOpenScheduler: (taskId: string) => void;
  selectedTags: string[];
  uniqueTags: string[];
  language?: Settings['language'];
}

export const TaskQuadrantColumn: React.FC<TaskQuadrantColumnProps> = ({
  quadrant,
  title,
  description,
  colorClass,
  tasks,
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
  getTaskSlot,
  onOpenScheduler,
  selectedTags,
  uniqueTags,
  language = 'en'
}) => {
  const { playWhoosh } = useSound();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-stone-50', 'ring-2', 'ring-stone-200');
    
    const data = e.dataTransfer.getData('application/json');
    if (data) {
        try {
            const { id, sourceQuadrant } = JSON.parse(data);
            if (id && sourceQuadrant !== quadrant) {
                moveTask(id, quadrant);
                playWhoosh();
            }
        } catch (err) { console.error(err); }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-stone-50', 'ring-2', 'ring-stone-200');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-stone-50', 'ring-2', 'ring-stone-200');
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`p-5 rounded-sm border-t-4 ${colorClass} bg-white shadow-sm flex flex-col h-full transition-colors duration-200`}
    >
      <div className="mb-6 border-b border-stone-100 pb-2 flex justify-between items-start pointer-events-none">
        <div>
          <h3 className="font-serif font-bold text-stone-800 text-lg">{title}</h3>
          <p className="text-[10px] uppercase tracking-wider text-stone-400">{description}</p>
        </div>
        <div className="text-xs text-stone-300 font-serif">
          {tasks.length}
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-stone-300 text-sm italic font-serif pointer-events-none">
            {selectedTags.length > 0 ? 'No tasks with these tags' : 'Empty'}
          </div>
        )}
        {tasks.map(task => (
          <MatrixTaskItem 
            key={task.id}
            task={task}
            quadrant={quadrant}
            toggleTask={toggleTask}
            toggleFrog={toggleFrog}
            deleteTask={deleteTask}
            moveTask={moveTask}
            addSubtask={addSubtask}
            deleteSubtask={deleteSubtask}
            toggleSubtask={toggleSubtask}
            updatePurpose={updatePurpose}
            updateTitle={updateTitle}
            updateTags={updateTags}
            scheduledSlot={getTaskSlot(task.id)}
            onOpenScheduler={onOpenScheduler}
            uniqueTags={uniqueTags}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};
