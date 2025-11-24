
import React from 'react';
import { X, Check, Trash2, LayoutGrid } from 'lucide-react';
import { TimeBlock, BlockCategory, Settings } from '../types';
import { t } from '../utils/translations';

interface TimeBlockModalProps {
  editingCell: { day: string; hour: number };
  tempBlock: TimeBlock;
  setTempBlock: (b: TimeBlock) => void;
  duration: number;
  setDuration: (d: number) => void;
  applyToAllDays: boolean;
  setApplyToAllDays: (b: boolean) => void;
  addToMatrix: boolean;
  setAddToMatrix: (b: boolean) => void;
  view: 'ideal' | 'current';
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  hasExistingBlock: boolean;
  categories: { id: BlockCategory; label: string; icon: React.ElementType }[];
  language: Settings['language'];
}

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  editingCell,
  tempBlock,
  setTempBlock,
  duration,
  setDuration,
  applyToAllDays,
  setApplyToAllDays,
  addToMatrix,
  setAddToMatrix,
  view,
  onClose,
  onSave,
  onDelete,
  hasExistingBlock,
  categories,
  language
}) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900/10 backdrop-blur-[1px]">
      <div className="bg-white p-6 rounded-sm shadow-xl border border-stone-200 w-80 animate-fade-in">
         <div className="flex justify-between items-center mb-4">
           <h3 className="font-serif font-bold text-lg">
             {editingCell.day} @ {editingCell.hour}:00
           </h3>
           <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
         </div>

         <div className="space-y-4">
           <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('plan_type', language)}</label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {categories.map(cat => (
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
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('plan_label', language)}</label>
              <input 
                type="text"
                value={tempBlock.label}
                onChange={(e) => setTempBlock({ ...tempBlock, label: e.target.value })}
                placeholder="..."
                className="w-full mt-1 p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none text-sm font-serif"
                autoFocus
              />
           </div>
           
           {/* Add to Matrix Toggle - Only in Ideal view for clarity */}
           {view === 'ideal' && (
             <div 
                onClick={() => setAddToMatrix(!addToMatrix)}
                className="flex items-center gap-3 p-2 border border-dashed border-stone-300 rounded-sm cursor-pointer hover:bg-stone-50 transition-colors"
             >
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${addToMatrix ? 'bg-stone-800 border-stone-800' : 'border-stone-300 bg-white'}`}>
                    {addToMatrix && <Check size={10} className="text-white" />}
                </div>
                <span className="text-xs font-serif text-stone-600 flex items-center gap-2">
                    <LayoutGrid size={12} className="text-stone-400" />
                    {t('plan_matrix_add', language)}
                </span>
             </div>
           )}

           <div className="flex gap-4">
              <div className="flex-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('plan_duration', language)}</label>
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
                     <span className="text-xs text-stone-600">{t('plan_all_days', language)}</span>
                  </div>
              </div>
           </div>

           <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
             {hasExistingBlock && (
                <button onClick={onDelete} className="px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                </button>
             )}
             <button onClick={onSave} className="flex-1 bg-stone-800 text-white py-2 font-bold text-xs uppercase tracking-widest hover:bg-stone-700">
                {t('plan_save', language)}
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};
