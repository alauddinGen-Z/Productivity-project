
import React, { useState } from 'react';
import { Check, Box, Clock, Tag, CornerDownRight, Trash2, GripVertical, Sparkles, CheckCircle2, Plus, X } from 'lucide-react';
import { Task, TaskQuadrant } from '../types';

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
  updateTags: (id: string, tags: string[]) => void;
  scheduledSlot: string | null;
  onOpenScheduler: (id: string) => void;
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
  updateTags,
  scheduledSlot,
  onOpenScheduler
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTags, setLocalTags] = useState(task.tags?.join(', ') || '');
  const [localPurpose, setLocalPurpose] = useState(task.purpose || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // --- Sound Effects ---
  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Pleasant ascending chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const playClickSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Sharp tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: task.id, sourceQuadrant: quadrant }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveEdit = () => {
    updatePurpose(task.id, localPurpose);
    const tags = localTags.split(',').map(t => t.trim()).filter(Boolean);
    updateTags(task.id, tags);
    setIsEditing(false);
  };
  
  const handleToggle = () => {
      if (task.completed) {
          toggleTask(task.id);
      } else {
          playSuccessSound();
          setIsCompleting(true);
          setTimeout(() => {
              toggleTask(task.id);
              setIsCompleting(false);
          }, 800);
      }
  };

  const onAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };
  
  const onToggleSubtask = (idx: number) => {
      playClickSound();
      toggleSubtask(task.id, idx);
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className={`group relative bg-white border border-stone-100 rounded-sm p-3 hover:shadow-md transition-all duration-300 animate-fade-in ${
        task.isFrog ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''
      } ${isCompleting ? 'opacity-0 translate-y-4 scale-95 pointer-events-none transition-all duration-700' : ''}`}
    >
      {/* Completion Overlay */}
      {isCompleting && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-sm">
             <div className="flex flex-col items-center animate-fade-slide">
                 <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                 <span className="text-emerald-700 font-serif font-bold text-sm">Task Completed!</span>
             </div>
          </div>
      )}

      {/* Drag Handle */}
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
             <span className={`font-serif text-stone-800 leading-snug break-words ${task.completed ? 'line-through text-stone-400' : ''}`}>
               {task.title}
             </span>
             
             {/* Action Buttons */}
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 bg-white/80 backdrop-blur-sm rounded p-0.5">
                <button 
                  onClick={() => toggleFrog(task.id)}
                  title={task.isFrog ? "Unmark Priority" : "Eat The Frog"}
                  className={`p-1.5 rounded-sm hover:bg-stone-100 ${task.isFrog ? 'text-amber-500' : 'text-stone-400'}`}
                >
                   <Sparkles size={14} />
                </button>
                <button 
                  onClick={() => onOpenScheduler(task.id)} 
                  className={`p-1.5 rounded-sm hover:bg-stone-100 ${scheduledSlot ? 'text-amber-600 bg-amber-50' : 'text-stone-400'}`}
                  title={scheduledSlot ? `Scheduled: ${scheduledSlot}` : "Schedule Task"}
                >
                   <Clock size={14} />
                </button>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 rounded-sm hover:bg-stone-100 text-stone-400"
                  title="Edit Details"
                >
                   <Tag size={14} />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-sm hover:bg-red-50 text-stone-400 hover:text-red-500"
                  title="Delete"
                >
                   <Trash2 size={14} />
                </button>
             </div>
          </div>

          {/* Scheduled Badge */}
          {scheduledSlot && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 font-mono">
                  <Clock size={10} />
                  {scheduledSlot.split('-')[0]} @ {scheduledSlot.split('-')[1]}:00
              </div>
          )}
          
          {/* Metadata Row */}
          <div className="flex flex-wrap gap-2 mt-2 items-center">
             <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded flex items-center gap-1 border border-stone-200">
                <Box size={10} /> {task.blocks}
             </span>
             {task.tags?.map(tag => (
                <span key={tag} className="text-[10px] text-stone-400">#{tag}</span>
             ))}
          </div>

          {/* Subtasks */}
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

          {/* Edit Mode / Purpose */}
          {isEditing ? (
             <div className="mt-3 bg-stone-50 p-3 rounded-sm border border-stone-200 animate-fade-in">
                <input 
                  value={localPurpose}
                  onChange={e => setLocalPurpose(e.target.value)}
                  placeholder="The 'Why' (Niyyah)..."
                  className="w-full text-xs bg-white p-2 border border-stone-200 mb-2 focus:border-stone-400 outline-none"
                />
                <input 
                  value={localTags}
                  onChange={e => setLocalTags(e.target.value)}
                  placeholder="Tags (comma separated)..."
                  className="w-full text-xs bg-white p-2 border border-stone-200 mb-2 focus:border-stone-400 outline-none"
                />
                
                {/* Manual Subtask Management */}
                <div className="mt-2 pt-2 border-t border-stone-100">
                   <div className="text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-wide">Manage Subtasks</div>
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
                        placeholder="Add step..." 
                        className="flex-1 text-xs bg-white p-1.5 border border-stone-200 focus:border-stone-400 outline-none"
                        onKeyDown={e => e.key === 'Enter' && onAddSubtask()}
                      />
                      <button onClick={onAddSubtask} className="bg-stone-200 hover:bg-stone-300 px-2 rounded-sm text-stone-600">
                        <Plus size={14}/>
                      </button>
                   </div>
                </div>

                <div className="flex justify-end items-center mt-3">
                   <button onClick={handleSaveEdit} className="px-3 py-1 bg-stone-800 text-white text-[10px] uppercase tracking-wider rounded-sm hover:bg-stone-700">
                      Save Changes
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
