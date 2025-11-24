
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Briefcase, Coffee, Heart, Users, Moon, Trash2, PieChart, ArrowDown, ArrowRight } from 'lucide-react';
import { WeeklySchedule, TimeBlock, BlockCategory, Task, TaskQuadrant, Settings } from '../types';
import { TimeBlockModal } from './TimeBlockModal';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface TimeStructurerProps {
  schedule: WeeklySchedule;
  updateSchedule: (schedule: WeeklySchedule) => void;
  updateTasks: (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => void;
  language: Settings['language'];
}

export const TimeStructurer: React.FC<TimeStructurerProps> = ({ schedule, updateSchedule, updateTasks, language }) => {
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

  const currentScheduleMap = schedule[view];

  // Helper to get translated categories
  const getCategories = () => [
    { id: 'DEEP' as BlockCategory, label: t('plan_cat_deep', language), color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-800 font-bold', icon: Briefcase },
    { id: 'SHALLOW' as BlockCategory, label: t('plan_cat_shallow', language), color: 'bg-white text-stone-500 border-l-4 border-stone-300 italic', icon: Coffee },
    { id: 'HEALTH' as BlockCategory, label: t('plan_cat_health', language), color: 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600', icon: Heart },
    { id: 'LIFE' as BlockCategory, label: t('plan_cat_life', language), color: 'bg-amber-50 text-amber-800 border-l-4 border-amber-600', icon: Users },
    { id: 'REST' as BlockCategory, label: t('plan_cat_rest', language), color: 'bg-indigo-50 text-indigo-800 border-l-4 border-indigo-400', icon: Moon },
  ];

  const categories = useMemo(() => getCategories(), [language]);

  // Calculate Statistics
  const stats = useMemo(() => {
    const counts: Record<BlockCategory, number> = { DEEP: 0, SHALLOW: 0, HEALTH: 0, LIFE: 0, REST: 0 };
    let totalBlocks = 0;
    Object.values(currentScheduleMap).forEach((block: TimeBlock) => {
      if (counts[block.category] !== undefined) {
        const weight = (block.duration === 30) ? 0.5 : 1;
        counts[block.category] += weight;
        totalBlocks += weight;
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
    
    // Simplification: We primarily edit the main block at the hour
    const key = `${day}-${hour}`;
    const block = schedule[view][key];

    if (block) {
      setTempBlock(block);
    } else {
      setTempBlock({ category: 'DEEP', label: '' });
    }
    setDuration(1);
    setAddToMatrix(false); 
    setEditingCell({ day, hour });
    setApplyToAllDays(false);
  };

  const saveBlock = () => {
    if (!editingCell) return;
    playAdd();
    
    const finalLabel = tempBlock.label.trim() || categories.find(c => c.id === tempBlock.category)?.label || 'Block';
    let blockToSave = { ...tempBlock, label: finalLabel, duration: 60 }; 

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
            tags: ['scheduled'],
            duration: 60
        };
        updateTasks(prev => [...prev, newTask]);
        blockToSave.taskId = taskId;
    }

    let newViewMap = { ...schedule[view] };
    const hoursToFill = Math.ceil(duration); 

    const apply = (d: string, h: number) => {
        const key = `${d}-${h}`;
        newViewMap[key] = blockToSave;
        // Clean up hidden 30m slot if we are overwriting with a standard block via planner
        delete newViewMap[`${d}-${h}-30`];
    };

    if (applyToAllDays) {
        DAYS.forEach(d => {
            for (let i = 0; i < hoursToFill; i++) {
                if (editingCell.hour + i <= 21) apply(d, editingCell.hour + i);
            }
        });
    } else {
        for (let i = 0; i < hoursToFill; i++) {
             if (editingCell.hour + i <= 21) apply(editingCell.day, editingCell.hour + i);
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
    delete newViewMap[`${d}-${h}-30`]; // Ensure we clean up any hidden split block too
    
    updateSchedule({ ...schedule, [view]: newViewMap });
    setEditingCell(null);
    setContextMenu(null);
  };

  const clearSchedule = () => {
    const title = view === 'ideal' ? t('plan_ideal', language) : t('plan_reality', language);
    if (confirm(`Are you sure you want to clear the entire ${title} schedule?`)) {
        playDelete();
        updateSchedule({ ...schedule, [view]: {} });
    }
  };

  const duplicateBlock = (sourceDay: string, sourceHour: number, target: 'DOWN' | 'TOMORROW') => {
    const key = `${sourceDay}-${sourceHour}`;
    const block = schedule[view][key];
    if (!block) return;
    playAdd();

    let targetDay = sourceDay;
    let targetHour = sourceHour;
    if (target === 'DOWN') {
      targetHour = sourceHour + 1;
    } else if (target === 'TOMORROW') {
      const dayIdx = DAYS.indexOf(sourceDay);
      targetDay = dayIdx < DAYS.length - 1 ? DAYS[dayIdx + 1] : DAYS[0];
    }
    if (targetHour > 21) return;
    
    const targetKey = `${targetDay}-${targetHour}`;
    const newMap = { ...schedule[view], [targetKey]: block };
    delete newMap[`${targetDay}-${targetHour}-30`]; // Cleanup target split

    updateSchedule({ ...schedule, [view]: newMap });
    setContextMenu(null);
  };

  const handleDragStart = (e: React.DragEvent, day: string, hour: number) => {
    const key = `${day}-${hour}`;
    if (!schedule[view][key]) {
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
    
    const sourceKey = `${dragSource.day}-${dragSource.hour}`;
    const block = schedule[view][sourceKey];
    if (!block) return;

    playWhoosh();
    const targetKey = `${day}-${hour}`;
    const isCopy = e.ctrlKey || e.altKey || e.metaKey;
    const newMap = { ...schedule[view] };
    
    newMap[targetKey] = block;
    delete newMap[`${day}-${hour}-30`]; // Cleanup target split

    if (!isCopy && targetKey !== sourceKey) {
        delete newMap[sourceKey];
        delete newMap[`${dragSource.day}-${dragSource.hour}-30`]; // Cleanup source split
    }
    updateSchedule({ ...schedule, [view]: newMap });
    setDragSource(null);
  };

  const handleContextMenu = (e: React.MouseEvent, day: string, hour: number) => {
    e.preventDefault();
    const key = `${day}-${hour}`;
    if (!schedule[view][key]) return;
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

  const renderSingleBlock = (block: TimeBlock) => {
    const categoryInfo = categories.find(c => c.id === block.category);
    if (!categoryInfo) return null;
    
    return (
        <div 
            className={`h-full w-full rounded-sm p-1 text-[10px] shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between overflow-hidden transition-all ${categoryInfo.color}`}
        >
            <div className="font-bold leading-tight truncate">{block.label}</div>
            <div className="flex justify-between items-end">
                <categoryInfo.icon size={10} />
                {block.duration === 30 && <span className="text-[8px] opacity-70">30m</span>}
            </div>
        </div>
    );
  };

  const renderCell = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    const block = schedule[view][key];
    const isDragging = dragSource?.day === day && dragSource?.hour === hour;
    const isOver = dragOverCell?.day === day && dragOverCell?.hour === hour;

    return (
      <div 
        key={key} 
        className={`h-16 border-r border-b border-stone-200 p-1 relative group transition-all duration-200 ${isOver ? 'bg-amber-50 ring-2 ring-inset ring-amber-300' : ''}`}
        onClick={() => handleCellClick(day, hour)}
        onContextMenu={(e) => handleContextMenu(e, day, hour)}
        onDragOver={(e) => handleDragOver(e, day, hour)}
        onDrop={(e) => handleDrop(e, day, hour)}
      >
        <div 
             draggable={!!block}
             onDragStart={(e) => handleDragStart(e, day, hour)}
             onDragEnd={() => { setDragSource(null); setDragOverCell(null); }}
             className={`h-full w-full ${isDragging ? 'opacity-40 grayscale' : 'opacity-100'}`}
        >
            {block ? renderSingleBlock(block) : <div className="h-full w-full hover:bg-stone-50 transition-colors"></div>}
            
            {block && (
                 <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); duplicateBlock(day, hour, 'DOWN'); }}
                        className="p-0.5 hover:bg-black/10 rounded bg-white/50"
                        title={t('plan_dup_down', language)}
                    >
                        <ArrowDown size={10} />
                    </button>
                 </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-stone-200">
        <div className="flex gap-4">
          <button onClick={() => { setView('ideal'); playClick(); }} className={`px-4 py-2 text-sm font-serif font-bold transition-colors border-b-2 ${view === 'ideal' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('plan_ideal', language)}</button>
          <button onClick={() => { setView('current'); playClick(); }} className={`px-4 py-2 text-sm font-serif font-bold transition-colors border-b-2 ${view === 'current' ? 'border-amber-600 text-amber-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('plan_reality', language)}</button>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => { setShowStats(!showStats); playClick(); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors ${showStats ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                <PieChart size={14} />
                <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">{t('plan_analytics', language)}</span>
            </button>
            <button onClick={clearSchedule} className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-500 hover:text-red-600 transition-all text-xs font-bold uppercase tracking-wider">
                <Trash2 size={14} /> <span>{t('plan_reset', language)}</span>
            </button>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white p-4 rounded-sm shadow-sm border border-stone-200 animate-fade-in">
           {categories.map(cat => (
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
                <div className="p-3 text-xs font-bold text-stone-400 uppercase tracking-wider text-center border-r border-stone-200">{t('plan_time', language)}</div>
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
            hasExistingBlock={!!schedule[view][`${editingCell.day}-${editingCell.hour}`]}
            categories={categories}
            language={language}
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
                <ArrowDown size={14} /> {t('plan_dup_down', language)}
            </button>
            <button onClick={() => duplicateBlock(contextMenu.day, contextMenu.hour, 'TOMORROW')} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                <ArrowRight size={14} /> {t('plan_dup_tmrw', language)}
            </button>
            <div className="h-px bg-stone-100 my-1"></div>
            <button onClick={() => deleteBlock(contextMenu.day, contextMenu.hour)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={14} /> {t('plan_delete', language)}
            </button>
        </div>
      )}
    </div>
  );
};
