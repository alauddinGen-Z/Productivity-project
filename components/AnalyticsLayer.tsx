import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskQuadrant } from '../types';
import { PieChart, Zap, Target, Layers, Trophy, Activity } from 'lucide-react';
import { LineChart, DonutChart } from './Charts';
import { t } from '../utils/translations';
import { useApp } from '../context/AppContext';

const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AnalyticsLayer: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const lang = state.settings.language;

  // Localized days for charts
  const localizedDays = useMemo(() => DAY_KEYS.map(key => t(`day_${key.toLowerCase()}`, lang)), [lang]);

  // 1. Task Statistics
  const taskStats = useMemo(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    const byQuadrant = {
      [TaskQuadrant.DO]: state.tasks.filter(t => t.quadrant === TaskQuadrant.DO && !t.completed).length,
      [TaskQuadrant.SCHEDULE]: state.tasks.filter(t => t.quadrant === TaskQuadrant.SCHEDULE && !t.completed).length,
      [TaskQuadrant.DELEGATE]: state.tasks.filter(t => t.quadrant === TaskQuadrant.DELEGATE && !t.completed).length,
      [TaskQuadrant.DELETE]: state.tasks.filter(t => t.quadrant === TaskQuadrant.DELETE && !t.completed).length,
    };

    const pendingTotal = total - completed;

    return { total, completed, rate, byQuadrant, pendingTotal };
  }, [state.tasks]);

  // 2. Schedule Stats & Line Chart Data
  const scheduleData = useMemo(() => {
    const idealHours = DAY_KEYS.map(day => {
      return Object.keys(state.weeklySchedule.ideal).filter(k => k.startsWith(`${day}-`)).length;
    });

    const currentHours = DAY_KEYS.map(day => {
       return Object.keys(state.weeklySchedule.current).filter(k => k.startsWith(`${day}-`)).length;
    });

    const totalIdeal = idealHours.reduce((a, b) => a + b, 0);
    const totalCurrent = currentHours.reduce((a, b) => a + b, 0);
    const adherenceRate = totalIdeal === 0 ? 0 : Math.round((totalCurrent / totalIdeal) * 100);

    return { idealHours, currentHours, adherenceRate };
  }, [state.weeklySchedule]);

  // 3. Quest Stats
  const questCompletion = useMemo(() => {
    const q = state.dailyQuests;
    const total = 3;
    let done = 0;
    if (q.work.completed) done++;
    if (q.health.completed) done++;
    if (q.relationship.completed) done++;
    return { done, total };
  }, [state.dailyQuests]);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-[#2c2a26] text-stone-200 p-8 rounded-sm shadow-md border-t-4 border-stone-500 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2 text-stone-50">{t('stats_title', lang)}</h1>
          <p className="text-stone-400 font-light italic">{t('stats_quote', lang)}</p>
        </div>
        <PieChart size={48} className="text-stone-600 opacity-50" />
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Schedule Adherence */}
         <div 
            onClick={() => navigate('/plan')}
            className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 flex items-center gap-6 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all group"
         >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
             <Activity size={32} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">{t('stats_adherence', lang)}</h3>
            <p className="text-2xl font-serif text-stone-800 mt-1">{scheduleData.adherenceRate}%</p>
            <p className="text-xs text-stone-400 mt-1">{t('stats_reality_plan', lang)}</p>
          </div>
        </div>

        {/* Task Completion */}
        <div 
            onClick={() => navigate('/tasks')}
            className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 flex items-center gap-6 cursor-pointer hover:shadow-md hover:border-stone-400 transition-all group"
        >
          <div className="relative w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="#f5f5f4" strokeWidth="8" fill="none" />
                <circle cx="40" cy="40" r="36" stroke="#57534e" strokeWidth="8" fill="none" strokeDasharray={`${(taskStats.rate / 100) * 226} 226`} className="transition-all duration-1000" />
             </svg>
             <span className="absolute text-sm font-bold text-stone-800">{taskStats.rate}%</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-stone-600 transition-colors">{t('stats_tasks_done', lang)}</h3>
            <p className="text-2xl font-serif text-stone-800 mt-1">{taskStats.completed} <span className="text-base text-stone-400">/ {taskStats.total}</span></p>
          </div>
        </div>

        {/* Quest Streak */}
        <div 
            onClick={() => navigate('/')}
            className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 flex items-center gap-6 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
             <Trophy size={32} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">{t('stats_quests', lang)}</h3>
            <div className="flex gap-1 mt-2">
               {[1,2,3].map(i => (
                 <div key={i} className={`h-2 w-8 rounded-sm transition-colors ${i <= questCompletion.done ? 'bg-emerald-500' : 'bg-stone-200'}`}></div>
               ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">{questCompletion.done} / 3</p>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Schedule Execution Line Chart */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                <h3 className="font-serif font-bold text-xl text-stone-800">{t('stats_weekly_exec', lang)}</h3>
                <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-stone-300 mr-1"></span> {t('plan_ideal', lang)}
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-600 ml-3 mr-1"></span> {t('plan_reality', lang)}
                </p>
                </div>
                <Zap className="text-stone-200" size={24} />
            </div>
            <div className="h-48 w-full">
                <LineChart dataIdeal={scheduleData.idealHours} dataCurrent={scheduleData.currentHours} days={localizedDays} />
            </div>
        </div>

        {/* 2. Eisenhower Distribution */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="font-serif font-bold text-xl text-stone-800">{t('stats_energy', lang)}</h3>
                <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">{t('stats_pending', lang)}</p>
             </div>
             <Target className="text-stone-200" size={24} />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <DonutChart data={[
                taskStats.byQuadrant[TaskQuadrant.DO],
                taskStats.byQuadrant[TaskQuadrant.SCHEDULE],
                taskStats.byQuadrant[TaskQuadrant.DELEGATE],
                taskStats.byQuadrant[TaskQuadrant.DELETE]
              ]} />
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none transform -rotate-0">
                  <span className="text-2xl font-serif font-bold text-stone-800">{taskStats.pendingTotal}</span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest">{t('stats_active', lang)}</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
               {[
                 { label: t('matrix_do', lang), count: taskStats.byQuadrant[TaskQuadrant.DO], color: 'bg-amber-700' },
                 { label: t('matrix_schedule', lang), count: taskStats.byQuadrant[TaskQuadrant.SCHEDULE], color: 'bg-stone-700' },
                 { label: t('matrix_delegate', lang), count: taskStats.byQuadrant[TaskQuadrant.DELEGATE], color: 'bg-stone-300' },
                 { label: t('matrix_delete', lang), count: taskStats.byQuadrant[TaskQuadrant.DELETE], color: 'bg-stone-100' },
               ].map((item) => (
                 <div key={item.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-serif text-stone-600 group-hover:text-stone-900 transition-colors">{item.label}</span>
                    </div>
                    <span className="font-bold text-stone-800">{item.count}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* 3. System Health */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="font-serif font-bold text-xl text-stone-800">{t('stats_system_health', lang)}</h3>
                   <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">{t('stats_consistency', lang)}</p>
                </div>
                <Layers className="text-stone-200" size={24} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-stone-50 rounded-sm border border-stone-100">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t('stats_knowledge', lang)}</div>
                    <div className="text-2xl font-serif font-bold text-stone-800">{state.flashcards.length}</div>
                    <div className="text-xs text-stone-400">{t('stats_cards', lang)}</div>
                </div>
                <div className="p-4 bg-stone-50 rounded-sm border border-stone-100">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t('nav_review', lang)}</div>
                    <div className="text-2xl font-serif font-bold text-stone-800">{state.reflections.length}</div>
                    <div className="text-xs text-stone-400">Entries</div>
                </div>
                <div className="p-4 bg-stone-50 rounded-sm border border-stone-100">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Focus</div>
                    <div className="text-2xl font-serif font-bold text-stone-800">100%</div>
                    <div className="text-xs text-stone-400">Intent</div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};