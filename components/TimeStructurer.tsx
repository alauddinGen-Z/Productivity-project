
import React, { useState } from 'react';
import { Calendar, X, Briefcase, Coffee, Heart, Users, Moon, Trash2, Check } from 'lucide-react';
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

  const getBlock = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    return schedule[view][key];
  };

  const handleCellClick = (day: string, hour: number) => {
    const existing = getBlock(day, hour);
    if (existing) {
      setTempBlock(existing);
    } else {
      setTempBlock({ category: 'DEEP', label: '' });
    }
    setEditingCell({ day, hour });
  };

  const saveBlock = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.hour}`;
    
    // Auto-label if empty
    const finalLabel = tempBlock.label.trim() || CATEGORIES.find(c => c.id === tempBlock.category)?.label || 'Block';

    const newSchedule = {
      ...schedule,
      [view]: {
        ...schedule[view],
        [key]: { ...tempBlock, label: finalLabel }
      }
    };
    updateSchedule(newSchedule);
    setEditingCell(null);
  };

  const deleteBlock = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.hour}`;
    const newViewMap = { ...schedule[view] };
    delete newViewMap[key];
    
    updateSchedule({
      ...schedule,
      [view]: newViewMap
    });
    setEditingCell(null);
  };

  const renderCell = (day: string, hour: number) => {
    const block = getBlock(day, hour);
    const catConfig = block ? CATEGORIES.find(c => c.id === block.category) : null;
    
    return (
      <div 
        key={`${day}-${hour}`} 
        onClick={() => handleCellClick(day, hour)}
        className={`h-14 border-b border-r border-stone-200 text-[10px] p-2 overflow-hidden font-serif cursor-pointer transition-colors hover:bg-stone-50 relative group ${catConfig ? catConfig.color : 'bg-white'}`}
      >
        {block ? (
          <div className="leading-tight">
            {block.label}
          </div>
        ) : (
          <div className="w-full h-full opacity-0 group-hover:opacity-20 flex items-center justify-center text-stone-400">
            +
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-sm shadow-sm border border-stone-300 overflow-hidden max-w-6xl mx-auto">
        <div className="p-8 border-b border-stone-200 flex justify-between items-center bg-[#FAF9F6]">
          <div className="flex items-center gap-3">
            <Calendar className="text-stone-800" size={24} />
            <h2 className="font-serif font-bold text-2xl text-stone-800">Weekly Architecture</h2>
          </div>
          <div className="flex border border-stone-300 rounded-sm overflow-hidden text-xs font-bold uppercase tracking-widest shadow-sm">
            <button 
              onClick={() => setView('current')}
              className={`px-6 py-3 transition-colors ${view === 'current' ? 'bg-stone-800 text-white' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
            >
              Reality
            </button>
            <button 
              onClick={() => setView('ideal')}
              className={`px-6 py-3 transition-colors ${view === 'ideal' ? 'bg-stone-800 text-white' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
            >
              Vision
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[900px] grid grid-cols-[60px_repeat(7,1fr)] bg-white select-none">
            {/* Header Row */}
            <div className="p-4 bg-stone-50 border-b border-r border-stone-200 sticky left-0 z-10"></div>
            {DAYS.map(day => (
              <div key={day} className="p-4 bg-stone-50 border-b border-r border-stone-200 text-center font-serif font-bold text-stone-700 text-sm uppercase tracking-wider">
                {day}
              </div>
            ))}

            {/* Time Grid */}
            {HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div className="p-2 border-b border-r border-stone-200 text-xs text-stone-400 text-center font-serif pt-4 bg-stone-50/50 sticky left-0 z-10">
                  {hour}:00
                </div>
                {DAYS.map(day => renderCell(day, hour))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl border-t-4 border-stone-800 p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-xl text-stone-800">
                Edit Block <span className="text-stone-400 font-normal text-base ml-2">{editingCell.day} @ {editingCell.hour}:00</span>
              </h3>
              <button onClick={() => setEditingCell(null)} className="text-stone-400 hover:text-stone-800">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = tempBlock.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setTempBlock({ ...tempBlock, category: cat.id })}
                        className={`flex items-center gap-3 p-3 rounded-sm border text-left transition-all ${
                          isSelected 
                            ? 'border-stone-800 bg-stone-50 ring-1 ring-stone-800' 
                            : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className={`p-1.5 rounded-full ${isSelected ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-400'}`}>
                          <Icon size={14} />
                        </div>
                        <span className={`text-sm font-serif ${isSelected ? 'font-bold text-stone-800' : 'text-stone-600'}`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Label (Optional)</label>
                <input
                  type="text"
                  value={tempBlock.label}
                  onChange={(e) => setTempBlock({ ...tempBlock, label: e.target.value })}
                  placeholder="e.g. Marathon Training"
                  className="w-full p-3 bg-[#FAF9F6] border border-stone-200 focus:border-stone-800 outline-none font-serif"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={deleteBlock}
                  className="flex-1 py-3 border border-stone-200 text-stone-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
                <button 
                  onClick={saveBlock}
                  className="flex-[2] py-3 bg-stone-800 text-white hover:bg-stone-700 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg shadow-stone-200"
                >
                  <Check size={14} />
                  Save Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
