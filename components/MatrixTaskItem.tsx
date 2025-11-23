
import React, { useState } from 'react';
import { Check, Box, Clock, Tag, CornerDownRight, Wand2, Trash2, GripVertical } from 'lucide-react';
import { Task, TaskQuadrant } from '../types';

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
}

export const MatrixTaskItem = React.memo<MatrixTaskItemProps>(({ 
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
  onOpenScheduler
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditingPurpose, setIsEditingPurpose] = useState(false);
  const [purposeInput, setPurposeInput] = useState(task.purpose || '');
  
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagsInput, setTagsInput] = useState(task.tags?.join(', ') || '');

  const handleCheck = () => {
    if (isCompleting) return;
    setIsCompleting(true);
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
    <div className={`bg-[#FAF9F6] p-3 border-l-2 border-stone-200 hover:border-stone-400 group relative transition-all duration-700 ease-out shadow-sm ${isCompleting ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 scale-100'}`}>
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
            <CornerDownRight size={12} />
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
