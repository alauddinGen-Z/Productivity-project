import React, { useState } from 'react';
import { Task, TaskQuadrant, AppState } from '../types';
import { Plus, Trash2, Wand2, GripVertical } from 'lucide-react';
import { simplifyTask } from '../services/geminiService';

interface TaskMatrixProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks, setTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeView, setActiveView] = useState<'matrix' | 'ivylee'>('matrix');
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      quadrant: TaskQuadrant.SCHEDULE, 
      isFrog: false,
      createdAt: Date.now(),
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const moveTask = (id: string, quadrant: TaskQuadrant) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, quadrant } : t));
  };

  const toggleFrog = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isFrog: !t.isFrog } : t));
  };

  const handleSimplify = async (taskId: string, title: string) => {
    setLoadingAI(taskId);
    const steps = await simplifyTask(title);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks: steps } : t));
    setLoadingAI(null);
  };

  const ivyLeeTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => (a.isFrog === b.isFrog ? 0 : a.isFrog ? -1 : 1))
    .slice(0, 6);

  const renderQuadrant = (quadrant: TaskQuadrant, title: string, description: string, colorClass: string) => {
    const qTasks = tasks.filter(t => t.quadrant === quadrant && !t.completed);
    return (
      <div className={`p-5 rounded-sm border-t-4 ${colorClass} bg-white shadow-sm flex flex-col h-full`}>
        <div className="mb-6 border-b border-stone-100 pb-2">
          <h3 className="font-serif font-bold text-stone-800 text-lg">{title}</h3>
          <p className="text-[10px] uppercase tracking-wider text-stone-400">{description}</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
          {qTasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-stone-300 text-sm italic font-serif">
              Empty
            </div>
          )}
          {qTasks.map(task => (
            <div key={task.id} className="bg-[#FAF9F6] p-3 border-l-2 border-stone-200 hover:border-stone-400 group relative transition-all shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(task.id)} className="mt-1 text-stone-300 hover:text-stone-800 transition-colors">
                    <div className="w-4 h-4 border border-current rounded-sm" />
                  </button>
                  <div>
                    <span className={`text-sm font-serif text-stone-700 ${task.isFrog ? 'font-bold text-emerald-800' : ''}`}>
                      {task.title}
                    </span>
                    {task.isFrog && <span className="block text-[9px] text-emerald-700 tracking-widest uppercase mt-1">Priority Frog</span>}
                    {task.subtasks && (
                      <ul className="mt-2 pl-4 list-disc text-xs text-stone-500 font-sans">
                        {task.subtasks.map((st, idx) => <li key={idx} className="my-0.5">{st}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!task.subtasks && (
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
              
              {/* Mover */}
              <div className="mt-3 pt-2 border-t border-stone-100 flex gap-1 justify-end">
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
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Input */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <form onSubmit={addTask} className="flex-1 w-full flex gap-0 border-b border-stone-300 focus-within:border-stone-800 transition-colors">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Write a new task..."
            className="flex-1 p-3 bg-transparent focus:outline-none font-serif text-lg text-stone-800 placeholder:text-stone-400"
          />
          <button type="submit" className="text-stone-400 hover:text-stone-800 p-3">
            <Plus />
          </button>
        </form>
        
        <div className="flex gap-4 text-sm font-serif">
          <button
            onClick={() => setActiveView('matrix')}
            className={`pb-1 transition-all ${activeView === 'matrix' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-400'}`}
          >
            Eisenhower Matrix
          </button>
          <button
            onClick={() => setActiveView('ivylee')}
            className={`pb-1 transition-all ${activeView === 'ivylee' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-400'}`}
          >
            Ivy Lee Method
          </button>
        </div>
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
        <div className="bg-white p-12 rounded-sm shadow-sm border border-stone-200 max-w-2xl mx-auto relative">
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
                    <span className={`flex-1 font-serif text-lg ${index === 0 ? 'text-stone-800' : ''}`}>{task.title}</span>
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
    </div>
  );
};