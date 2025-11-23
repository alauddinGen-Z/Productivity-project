
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Trash2, X } from 'lucide-react';
import { WeeklySchedule } from '../types';

interface SchedulingModalProps {
  schedule: WeeklySchedule;
  taskId: string;
  onClose: () => void;
  onConfirm: (day: string, hour: number) => void;
  onClear: () => void;
  existingSlot: string | null;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SchedulingModal: React.FC<SchedulingModalProps> = ({
  schedule,
  taskId,
  onClose,
  onConfirm,
  onClear,
  existingSlot
}) => {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedHour, setSelectedHour] = useState(9);

  // Initialize with today or existing slot
  useEffect(() => {
    if (existingSlot) {
        const [d, h] = existingSlot.split('-');
        setSelectedDay(d);
        setSelectedHour(parseInt(h));
    } else {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        if (DAYS.includes(today)) setSelectedDay(today);
    }
  }, [existingSlot]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-sm shadow-xl border border-stone-200 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                  <Calendar className="text-stone-400" size={18} />
                  <h3 className="font-serif font-bold text-lg text-stone-800">Assign to Schedule</h3>
              </div>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                  <X size={20} />
              </button>
          </div>

          <div className="space-y-6">
              {/* Day Selection */}
              <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Ideal Day</label>
                  <div className="grid grid-cols-7 gap-1">
                      {DAYS.map(day => (
                          <button
                              key={day}
                              onClick={() => setSelectedDay(day)}
                              className={`py-2 text-[10px] font-bold rounded-sm border transition-colors ${selectedDay === day ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                          >
                              {day}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Available Time Grid with CONTEXT */}
              <div>
                   <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Available Time Blocks</label>
                   <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                       {HOURS.map(h => {
                           const isSelected = selectedHour === h;
                           const key = `${selectedDay}-${h}`;
                           const block = schedule.ideal[key];
                           
                           return (
                               <button 
                                  key={h} 
                                  onClick={() => setSelectedHour(h)}
                                  className={`flex flex-col items-start px-3 py-2 border rounded-sm transition-all text-left ${
                                      isSelected 
                                          ? 'bg-amber-500 text-white border-amber-500 shadow-md' 
                                          : block 
                                              ? 'bg-white text-stone-800 border-stone-300 hover:border-amber-400'
                                              : 'bg-stone-50 text-stone-400 border-stone-100 hover:border-stone-300'
                                  }`}
                               >
                                  <div className="flex items-center justify-between w-full mb-1">
                                      <span className={`font-mono text-xs ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>{h}:00</span>
                                      {block && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : (block.category === 'DEEP' ? 'bg-stone-800' : 'bg-emerald-500')}`}></div>}
                                  </div>
                                  <span className={`text-xs font-serif truncate w-full ${isSelected ? 'font-bold' : (block ? 'font-medium' : 'italic text-[10px]')}`}>
                                      {block ? block.label : 'Free / Unplanned'}
                                  </span>
                               </button>
                           );
                       })}
                   </div>
              </div>

              {/* Info Alert */}
              <div className="bg-stone-50 border border-stone-200 p-3 rounded-sm flex gap-2">
                  <AlertCircle size={14} className="text-stone-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-500 font-serif leading-tight">
                      Assigning this task to a time slot links it to your "Ideal Week" and makes it available in Focus Mode at that time.
                  </p>
              </div>

              <div className="pt-2 flex gap-2">
                  {existingSlot && (
                      <button 
                          onClick={onClear}
                          className="px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Clear Schedule"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}
                  <button 
                      onClick={() => onConfirm(selectedDay, selectedHour)}
                      className="flex-1 bg-stone-800 text-white py-3 font-bold text-xs uppercase tracking-widest hover:bg-stone-700 shadow-sm"
                  >
                      Set Schedule
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};
