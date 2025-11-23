
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Briefcase, Coffee, Heart, Users, Moon, Trash2, PieChart, ArrowDown, ArrowRight } from 'lucide-react';
import { WeeklySchedule, TimeBlock, BlockCategory, Task, TaskQuadrant } from '../types';
import { TimeBlockModal } from './TimeBlockModal';
import { useSound } from '../hooks/useSound';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface TimeStructurerProps {
  schedule: WeeklySchedule;
  updateSchedule: (schedule: WeeklySchedule) => void;
  updateTasks: (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => void;
}

const CATEGORIES: { id: BlockCategory; label: string; color: string; icon: React.ElementType }[] = [
  { id: 'DEEP', label: 'Deep Work', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-800 font-bold', icon: Briefcase },
  { id: 'SHALLOW', label: 'Admin / Shallow', color: 'bg-white text-stone-500 border-l-4 border-stone-300 italic', icon: Coffee },
  { id: 'HEALTH', label: 'Health & Body', color: 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600', icon: Heart },
  { id: 'LIFE', label: 'Social & Life', color: 'bg-amber-50 text-amber-800 border-l-4 border-amber-600', icon: Users },
  { id: 'REST', label: 'Rest & Recharge', color: 'bg-indigo-50 text-indigo-800 border-l-4 border-indigo-400', icon: Moon },
];

export const TimeStructurer: React.FC<TimeStructurerProps> = ({ schedule, updateSchedule, updateTasks }) => {
  const [view, setView] = useState<'ideal' | 'current'>('ideal');
  const [editingCell, setEditingCell] = useState<{ day: string, hour: number } | null>(null);
  const [tempBlock, setTempBlock] = useState<TimeBlock>({ category: 'DEEP', label: '' });
  
  // Advanced Features State
  const [duration, setDuration] = useState(1);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [addToMatrix, setAddToMatrix] = useState(false);
  
  // Drag and Drop State
  const [dragSource, setDragSource] = useState<{ day: string, hour: number } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ day: string, hour: number } | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, day: string, hour: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { playClick, playSoftClick, playAdd, playDelete, playWhoosh } = useSound();

  const getBlock = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    return schedule[view][key];
  };

  const currentScheduleMap = schedule[view];

  // Calculate Statistics
  const stats = useMemo(() => {
    const counts: Record<BlockCategory, number> = { DEEP: 0, SHALLOW: 0, HEALTH: 0, LIFE: 0, REST: 0 };
    let totalBlocks = 0;
    Object.values(currentScheduleMap).forEach((block: TimeBlock) => {
      if (counts[block.category] !== undefined) {
        counts[block.category]++;
        totalBlocks++;
      }
    });
    return { counts, totalBlocks };
  }, [currentScheduleMap]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCellClick = (day: string, hour: number) => {
    if (contextMenu) {
      setContextMenu(null);
      return;
    }
    playSoftClick();
    const existing = getBlock(day, hour);
    if (existing) {
      setTempBlock(existing);
      setDuration(1);
    } else {
      setTempBlock({ category: 'DEEP', label: '' });
      setDuration(1);
    }
    setAddToMatrix(false); 
    setEditingCell({ day, hour });
    setApplyToAllDays(false);
  };

  const saveBlock = () => {
    if (!editingCell) return;
    playAdd();
    
    const finalLabel = tempBlock.label.trim() || CATEGORIES.find(c => c.id === tempBlock.category)?.label || 'Block';
    let blockToSave = { ...tempBlock, label: finalLabel };

    if (addToMatrix && view === 'ideal') {
        const taskId = `task-${Date.now()}`;
        const newTask: Task = {
            id: taskId,
            title: finalLabel,
            completed: false,
            quadrant: TaskQuadrant.SCHEDULE,
            isFrog: false,
            createdAt: Date.now(),
            blocks: 1, 
            tags: ['scheduled']
        };
        updateTasks(prev => [...prev, newTask]);
        blockToSave.taskId = taskId;
    }

    let newViewMap = { ...schedule[view] };
    const hoursToFill = duration;

    if (applyToAllDays) {
        DAYS.forEach(d => {
            for (let i = 0; i < hoursToFill; i++) {
                const h = editingCell.hour + i;
                if (h <= 21) { 
                    const key = `${d}-${h}`;
                    newViewMap[key] = blockToSave;
                }
            }
        });
    } else {
        for (let i = 0; i < hoursToFill; i++) {
            const h = editingCell.hour + i;
            if (h <= 21) {
                const key = `${editingCell.day}-${h}`;
                newViewMap[key] = blockToSave;
            }
        }
    }

    updateSchedule({ ...schedule, [view]: newViewMap });
    setEditingCell(null);
  };

  const deleteBlock = (day?: string, hour?: number) => {
    const d = day || editingCell?.day;
    const h = hour || editingCell?.hour;
    if (!d || h === undefined) return;
    playDelete();

    const key = `${d}-${h}`;
    const newViewMap = { ...schedule[view] };
    delete newViewMap[key];
    
    updateSchedule({ ...schedule, [view]: newViewMap });
    setEditingCell(null);
    setContextMenu(null);
  };

  const clearSchedule = () => {
    if (confirm(`Are you sure you want to clear the entire ${view === 'ideal' ? 'Vision' : 'Reality'} schedule?`)) {
        playDelete();
        updateSchedule({ ...schedule, [view]: {} });
    }
  };

  const duplicateBlock = (sourceDay: string, sourceHour: number, target: 'DOWN' | 'TOMORROW') => {
    const block = getBlock(sourceDay, sourceHour);
    if (!block) return;
    playAdd();

    let targetDay = sourceDay;
    let targetHour = sourceHour;
    if (target === 'DOWN') {
      targetHour = sourceHour + 1;
    } else if (target === 'TOMORROW') {
      const dayIdx = DAYS.indexOf(sourceDay);
      if (dayIdx < DAYS.length - 1) {
          targetDay = DAYS[dayIdx + 1];
      } else {
          targetDay = DAYS[0]; 
      }
    }
    if (targetHour > 21) return;
    const targetKey = `${targetDay}-${targetHour}`;
    updateSchedule({
        ...schedule,
        [view]: { ...schedule[view], [targetKey]: block }
    });
    setContextMenu(null);
  };

  const handleDragStart = (e: React.DragEvent, day: string, hour: number) => {
    const block = getBlock(day, hour);
    if (!block) {
      e.preventDefault();
      return;
    }
    setDragSource({ day, hour });
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', JSON.stringify({ day, hour }));
  };

  const handleDragOver = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    if (dragOverCell?.day !== day || dragOverCell?.hour !== hour) {
        setDragOverCell({ day, hour });
    }
  };

  const handleDrop = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!dragSource) return;
    const block = getBlock(dragSource.day, dragSource.hour);
    if (!block) return;

    playWhoosh();
    const targetKey = `${day}-${hour}`;
    const sourceKey = `${dragSource.day}-${dragSource.hour}`;
    const isCopy = e.ctrlKey || e.altKey || e.metaKey;
    const newMap = { ...schedule[view] };
    newMap[targetKey] = block;
    if (!isCopy && targetKey !== sourceKey) {
        delete newMap[sourceKey];
    }
    updateSchedule({ ...schedule, [view]: newMap });
    setDragSource(null);
  };

  const handleContextMenu = (e: React.MouseEvent, day: string, hour: number) => {
    e.preventDefault();
    if (!getBlock(day, hour)) return;
    playSoftClick();
    
    let x = e.clientX;
    let y = e.clientY;

    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    setContextMenu({ x, y, day, hour });
  };

  const renderCell = (day: string, hour: number) => {
    const block = getBlock(day, hour);
    const categoryInfo = block ? CATEGORIES.find(c => c.id === block.category) : null;
    const isDragging = dragSource?.day === day && dragSource?.hour === hour;
    const isOver = dragOverCell?.day === day && dragOverCell?.hour === hour;

    return (
      <div 
        key={`${day}-${hour}`} 
        className={`h-16 border-r border-b border-stone-200 p-1 relative group transition-all duration-200 ${isOver ? 'bg-amber-50 ring-2 ring-inset ring-amber-300' : ''}`}
        onClick={() => handleCellClick(day, hour)}
        onContextMenu={(e) => handleContextMenu(e, day, hour)}
        onDragOver={(e) => handleDragOver(e, day, hour)}
        onDrop={(e) => handleDrop(e, day, hour)}
      >
        {block && categoryInfo ? (
          <div 
            draggable
            onDragStart={(e) => handleDragStart(e, day, hour)}
            onDragEnd={() => { setDragSource(null); setDragOverCell(null); }}
            className={`h-full w-full rounded-sm p-1.5 text-[10px] shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between overflow-hidden transition-all ${categoryInfo.color} ${isDragging ? 'opacity-40 grayscale' : 'opacity-100'}`}
          >
             <div className="font-bold leading-tight truncate">{block.label}</div>
             <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                <categoryInfo.icon size={10} />
                <button 
                    onClick={(e) => { e.stopPropagation(); duplicateBlock(day, hour, 'DOWN'); }}
                    className="p-0.5 hover:bg-black/10 rounded"
                    title="Quick Duplicate Down"
                >
                    <ArrowDown size={10} />
                </button>
             </div>
          </div>
        ) : (
          <div className="h-full w-full hover:bg-stone-50 transition-colors"></div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-stone-200">
        <div className="flex gap-4">
          <button onClick={() => { setView('ideal'); playClick(); }} className={`px-4 py-2 text-sm font-serif font-bold transition-colors border-b-2 ${view === 'ideal' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Ideal Week (Vision)</button>
          <button onClick={() => { setView('current'); playClick(); }} className={`px-4 py-2 text-sm font-serif font-bold transition-colors border-b-2 ${view === 'current' ? 'border-amber-600 text-amber-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Reality (Log)</button>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => { setShowStats(!showStats); playClick(); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors ${showStats ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                <PieChart size={14} />
                <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Analytics</span>
            </button>
            <button onClick={clearSchedule} className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-500 hover:text-red-600 transition-all text-xs font-bold uppercase tracking-wider">
                <Trash2 size={14} /> <span>Reset</span>
            </button>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white p-4 rounded-sm shadow-sm border border-stone-200 animate-fade-in">
           {CATEGORIES.map(cat => (
             <div key={cat.id} className="text-center p-2">
               <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{cat.label}</div>
               <div className="text-xl font-serif font-bold text-stone-800">
                 {stats.counts[cat.id]} <span className="text-xs font-sans font-normal text-stone-400">hrs</span>
               </div>
               <div className="w-full bg-stone-100 h-1 mt-2 rounded-full overflow-hidden">
                 <div className={`h-full ${cat.color.split(' ')[0].replace('bg-', 'bg-opacity-100 bg-')}`} style={{ width: `${stats.totalBlocks ? (stats.counts[cat.id]/stats.totalBlocks)*100 : 0}%` }}></div>
               </div>
             </div>
           ))}
        </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar bg-white rounded-sm shadow-sm border border-stone-200">
         <div className="min-w-[800px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                <div className="p-3 text-xs font-bold text-stone-400 uppercase tracking-wider text-center border-r border-stone-200">Time</div>
                {DAYS.map(day => (
                    <div key={day} className="p-3 text-xs font-bold text-stone-600 uppercase tracking-wider text-center border-r border-stone-200">{day}</div>
                ))}
            </div>
            {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] hover:bg-stone-50/30">
                    <div className="p-2 text-xs font-mono text-stone-400 text-center border-r border-b border-stone-200 flex items-center justify-center">{hour}:00</div>
                    {DAYS.map(day => renderCell(day, hour))}
                </div>
            ))}
         </div>
      </div>

      {editingCell && (
        <TimeBlockModal 
            editingCell={editingCell}
            tempBlock={tempBlock}
            setTempBlock={setTempBlock}
            duration={duration}
            setDuration={setDuration}
            applyToAllDays={applyToAllDays}
            setApplyToAllDays={setApplyToAllDays}
            addToMatrix={addToMatrix}
            setAddToMatrix={setAddToMatrix}
            view={view}
            onClose={() => setEditingCell(null)}
            onSave={saveBlock}
            onDelete={deleteBlock}
            hasExistingBlock={!!getBlock(editingCell.day, editingCell.hour)}
            categories={CATEGORIES}
        />
      )}

      {contextMenu && (
        <div 
          ref={contextMenuRef}
          className="absolute bg-white border border-stone-200 shadow-xl rounded-sm py-1 z-50 w-48 animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div className="px-3 py-2 border-b border-stone-100 text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                {contextMenu.day} @ {contextMenu.hour}:00
            </div>
            <button onClick={() => duplicateBlock(contextMenu.day, contextMenu.hour, 'DOWN')} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                <ArrowDown size={14} /> Duplicate Down
            </button>
            <button onClick={() => duplicateBlock(contextMenu.day, contextMenu.hour, 'TOMORROW')} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                <ArrowRight size={14} /> Duplicate to Tmrw
            </button>
            <div className="h-px bg-stone-100 my-1"></div>
            <button onClick={() => deleteBlock(contextMenu.day, contextMenu.hour)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={14} /> Delete
            </button>
        </div>
      )}
    </div>
  );
};
