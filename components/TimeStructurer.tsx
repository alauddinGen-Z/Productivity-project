import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, X, Briefcase, Coffee, Heart, Users, Moon, Trash2, Check, BarChart3, Repeat, RotateCcw, PieChart, Move, Copy, Clock, ArrowDown, ArrowRight } from 'lucide-react';
import { WeeklySchedule, TimeBlock, BlockCategory } from '../types';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface TimeStructurerProps {
  schedule: WeeklySchedule;
  updateSchedule: (schedule: WeeklySchedule) => void;
}

const CATEGORIES: { id: BlockCategory; label: string; color: string; icon: React.ElementType }[] = [
  { id: 'DEEP', label: 'Deep Work', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-800 font-bold', icon: Briefcase },
  { id: 'SHALLOW', label: 'Admin / Shallow', color: 'bg-white text-stone-500 border-l-4 border-stone-300 italic', icon: Coffee },
  { id: 'HEALTH', label: 'Health & Body', color: 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600', icon: Heart },
  { id: 'LIFE', label: 'Social & Life', color: 'bg-amber-50 text-amber-800 border-l-4 border-amber-600', icon: Users },
  { id: 'REST', label: 'Rest & Recharge', color: 'bg-indigo-50 text-indigo-800 border-l-4 border-indigo-400', icon: Moon },
];

export const TimeStructurer: React.FC<TimeStructurerProps> = ({ schedule, updateSchedule }) => {
  const [view, setView] = useState<'ideal' | 'current'>('ideal');
  const [editingCell, setEditingCell] = useState<{ day: string, hour: number } | null>(null);
  const [tempBlock, setTempBlock] = useState<TimeBlock>({ category: 'DEEP', label: '' });
  
  // Advanced Features State
  const [duration, setDuration] = useState(1);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Drag and Drop State
  const [dragSource, setDragSource] = useState<{ day: string, hour: number } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ day: string, hour: number } | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, day: string, hour: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

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
    const existing = getBlock(day, hour);
    if (existing) {
      setTempBlock(existing);
      setDuration(1); // Default to 1 when editing existing to avoid accidental massive overwrites
    } else {
      setTempBlock({ category: 'DEEP', label: '' });
      setDuration(1);
    }
    setEditingCell({ day, hour });
    setApplyToAllDays(false);
  };

  const saveBlock = () => {
    if (!editingCell) return;
    
    // Auto-label if empty
    const finalLabel = tempBlock.label.trim() || CATEGORIES.find(c => c.id === tempBlock.category)?.label || 'Block';
    const blockToSave = { ...tempBlock, label: finalLabel };

    let newViewMap = { ...schedule[view] };

    const hoursToFill = duration;

    if (applyToAllDays) {
        // Apply to this start hour (and duration) across ALL days
        DAYS.forEach(d => {
            for (let i = 0; i < hoursToFill; i++) {
                const h = editingCell.hour + i;
                if (h <= 21) { // Simple bounds check (max hour rendered is usually up to 21)
                    const key = `${d}-${h}`;
                    newViewMap[key] = blockToSave;
                }
            }
        });
    } else {
        // Apply for duration on current day
        for (let i = 0; i < hoursToFill; i++) {
            const h = editingCell.hour + i;
            if (h <= 21) {
                const key = `${editingCell.day}-${h}`;
                newViewMap[key] = blockToSave;
            }
        }
    }

    updateSchedule({
      ...schedule,
      [view]: newViewMap
    });
    setEditingCell(null);
  };

  const deleteBlock = (day?: string, hour?: number) => {
    const d = day || editingCell?.day;
    const h = hour || editingCell?.hour;

    if (!d || h === undefined) return;

    const key = `${d}-${h}`;
    const newViewMap = { ...schedule[view] };
    delete newViewMap[key];
    
    updateSchedule({
      ...schedule,
      [view]: newViewMap
    });
    setEditingCell(null);
    setContextMenu(null);
  };

  const clearSchedule = () => {
    if (confirm(`Are you sure you want to clear the entire ${view === 'ideal' ? 'Vision' : 'Reality'} schedule? This cannot be undone.`)) {
        updateSchedule({
            ...schedule,
            [view]: {}
        });
    }
  };

  // --- Duplication Logic ---
  const duplicateBlock = (sourceDay: string, sourceHour: number, target: 'DOWN' | 'TOMORROW') => {
    const block = getBlock(sourceDay, sourceHour);
    if (!block) return;

    let targetDay = sourceDay;
    let targetHour = sourceHour;

    if (target === 'DOWN') {
      targetHour = sourceHour + 1;
    } else if (target === 'TOMORROW') {
      const dayIdx = DAYS.indexOf(sourceDay);
      if (dayIdx < DAYS.length - 1) {
          targetDay = DAYS[dayIdx + 1];
      } else {
          targetDay = DAYS[0]; // Wrap to Monday
      }
    }
    
    // Bounds check
    if (targetHour > 21) return;

    const targetKey = `${targetDay}-${targetHour}`;
    updateSchedule({
        ...schedule,
        [view]: {
            ...schedule[view],
            [targetKey]: block
        }
    });
    setContextMenu(null);
  };

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, day: string, hour: number) => {
    const block = getBlock(day, hour);
    if (!block) {
      e.preventDefault();
      return;
    }
    setDragSource({ day, hour });
    e.dataTransfer.effectAllowed = 'copyMove';
    // Transparent drag image or default
    e.dataTransfer.setData('text/plain', JSON.stringify({ day, hour }));
  };

  const handleDragOver = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    if (dragOverCell?.day !== day || dragOverCell?.hour !== hour) {
        setDragOverCell({ day, hour });
    }
  };

  const handleDragEnd = () => {
    setDragSource(null);
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!dragSource) return;

    const block = getBlock(dragSource.day, dragSource.hour);
    if (!block) return;

    const targetKey = `${day}-${hour}`;
    const sourceKey = `${dragSource.day}-${dragSource.hour}`;
    
    // If holding Ctrl/Alt, Copy. Otherwise Move.
    const isCopy = e.ctrlKey || e.altKey || e.metaKey;

    const newMap = { ...schedule[view] };
    
    // Place in new spot
    newMap[targetKey] = block;

    // Remove from old spot if not copying and not dropping on self
    if (!isCopy && targetKey !== sourceKey) {
        delete newMap[sourceKey];
    }

    updateSchedule({
        ...schedule,
        [view]: newMap
    });
    setDragSource(null);
  };

  const handleContextMenu = (e: React.MouseEvent, day: string, hour: number) => {
    e.preventDefault();
    const block = getBlock(day, hour);
    if (!block) return;
    
    setContextMenu({
        x: e.clientX,
        y: e.clientY,
        day,
        hour
    });
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
            onDragEnd={handleDragEnd}
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
    <div className="h-full flex flex-col space-y-6 animate-fade-in relative">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-stone-200">
        <div className="flex gap-4">
          <button
            onClick={() => setView('ideal')}
            className={`px-4 py-2 text-sm font-serif font-bold transition-colors border-b-2 ${view === 'ideal' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
            Ideal Week (Vision)
          </button>
          <button
            onClick={() => setView('current')}
            className={`px-4 py-2 text-sm font-serif font-bold transition-colors border-b-2 ${view === 'current' ? 'border-amber-600 text-amber-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
            Reality (Log)
          </button>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors ${showStats ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}
                title="Toggle Stats"
            >
                <PieChart size={14} />
                <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Analytics</span>
            </button>
            
            {/* RESET BUTTON */}
            <button 
                onClick={clearSchedule}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-500 hover:text-red-600 transition-all text-xs font-bold uppercase tracking-wider"
                title="Clear entire schedule"
            >
                <Trash2 size={14} />
                <span>Reset</span>
            </button>
        </div>
      </div>

      {/* Analytics Panel */}
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

      {/* Main Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white rounded-sm shadow-sm border border-stone-200">
         <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                <div className="p-3 text-xs font-bold text-stone-400 uppercase tracking-wider text-center border-r border-stone-200">Time</div>
                {DAYS.map(day => (
                    <div key={day} className="p-3 text-xs font-bold text-stone-600 uppercase tracking-wider text-center border-r border-stone-200">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Time Rows */}
            {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] hover:bg-stone-50/30">
                    <div className="p-2 text-xs font-mono text-stone-400 text-center border-r border-b border-stone-200 flex items-center justify-center">
                        {hour}:00
                    </div>
                    {DAYS.map(day => renderCell(day, hour))}
                </div>
            ))}
         </div>
      </div>

      {/* Edit Modal (Overlay) */}
      {editingCell && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900/10 backdrop-blur-[1px]">
          <div className="bg-white p-6 rounded-sm shadow-xl border border-stone-200 w-80 animate-fade-in">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-serif font-bold text-lg">
                 {editingCell.day} @ {editingCell.hour}:00
               </h3>
               <button onClick={() => setEditingCell(null)} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
             </div>

             <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Type</label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setTempBlock({ ...tempBlock, category: cat.id })}
                          className={`flex items-center gap-3 px-3 py-2 text-sm border transition-all ${tempBlock.category === cat.id ? 'border-stone-800 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}
                        >
                           <cat.icon size={14} className={tempBlock.category === cat.id ? 'text-stone-800' : 'text-stone-400'} />
                           <span className={tempBlock.category === cat.id ? 'font-bold text-stone-800' : 'text-stone-600'}>{cat.label}</span>
                        </button>
                    ))}
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Label</label>
                  <input 
                    type="text"
                    value={tempBlock.label}
                    onChange={(e) => setTempBlock({ ...tempBlock, label: e.target.value })}
                    placeholder="Specific task..."
                    className="w-full mt-1 p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none text-sm font-serif"
                    autoFocus
                  />
               </div>

               <div className="flex gap-4">
                  <div className="flex-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Duration (Hrs)</label>
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full mt-1 p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none text-sm font-serif"
                      />
                  </div>
                  <div className="flex items-center pt-5">
                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setApplyToAllDays(!applyToAllDays)}
                      >
                         <div className={`w-4 h-4 border flex items-center justify-center ${applyToAllDays ? 'bg-stone-800 border-stone-800' : 'border-stone-300'}`}>
                            {applyToAllDays && <Check size={10} className="text-white" />}
                         </div>
                         <span className="text-xs text-stone-600">All Days</span>
                      </div>
                  </div>
               </div>

               <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                 {getBlock(editingCell.day, editingCell.hour) && (
                    <button onClick={() => deleteBlock()} className="px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                    </button>
                 )}
                 <button onClick={saveBlock} className="flex-1 bg-stone-800 text-white py-2 font-bold text-xs uppercase tracking-widest hover:bg-stone-700">
                    Save Block
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          ref={contextMenuRef}
          className="fixed bg-white border border-stone-200 shadow-xl rounded-sm py-1 z-50 w-48 animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div className="px-3 py-2 border-b border-stone-100 text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                {contextMenu.day} @ {contextMenu.hour}:00
            </div>
            <button 
                onClick={() => duplicateBlock(contextMenu.day, contextMenu.hour, 'DOWN')}
                className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
            >
                <ArrowDown size={14} /> Duplicate Down
            </button>
            <button 
                onClick={() => duplicateBlock(contextMenu.day, contextMenu.hour, 'TOMORROW')}
                className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
            >
                <ArrowRight size={14} /> Duplicate to Tmrw
            </button>
            <div className="h-px bg-stone-100 my-1"></div>
            <button 
                onClick={() => deleteBlock(contextMenu.day, contextMenu.hour)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
                <Trash2 size={14} /> Delete
            </button>
        </div>
      )}
    </div>
  );
};