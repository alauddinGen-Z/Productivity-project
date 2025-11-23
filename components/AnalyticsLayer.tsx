import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, TaskQuadrant, WeeklySchedule } from '../types';
import { PieChart, Zap, Target, Layers, Trophy, Activity } from 'lucide-react';

interface AnalyticsLayerProps {
  state: AppState;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AnalyticsLayer: React.FC<AnalyticsLayerProps> = ({ state }) => {
  const navigate = useNavigate();

  // --- Calculation Logic ---

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
    // Calculate hours per day for Ideal vs Current
    const idealHours = DAYS.map(day => {
      // Count keys in 'ideal' that start with "Day-"
      return Object.keys(state.weeklySchedule.ideal).filter(k => k.startsWith(`${day}-`)).length;
    });

    const currentHours = DAYS.map(day => {
       // Count keys in 'current' that start with "Day-"
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

  // --- Chart Components ---

  const LineChart = () => {
    const height = 150;
    const width = 600; // viewBox width
    const padding = 20;
    const maxVal = Math.max(12, ...scheduleData.idealHours, ...scheduleData.currentHours); // Dynamic max, min 12
    
    // Helper to get coordinates
    const getX = (index: number) => padding + (index * ((width - 2 * padding) / (DAYS.length - 1)));
    const getY = (val: number) => height - padding - (val / maxVal) * (height - 2 * padding);

    // Create Path Strings
    const createPath = (data: number[]) => {
      return data.map((val, i) => 
        `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`
      ).join(' ');
    };

    const idealPath = createPath(scheduleData.idealHours);
    const currentPath = createPath(scheduleData.currentHours);

    return (
      <div className="w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 0.5, 1].map((t) => (
             <line 
                key={t}
                x1={padding} y1={padding + t * (height - 2 * padding)} 
                x2={width - padding} y2={padding + t * (height - 2 * padding)} 
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" 
             />
          ))}

          {/* Planned Line (Dashed) */}
          <path d={idealPath} fill="none" stroke="#d6d3d1" strokeWidth="2" strokeDasharray="6 4" />
          
          {/* Points Ideal */}
          {scheduleData.idealHours.map((val, i) => (
            <circle key={`id-${i}`} cx={getX(i)} cy={getY(val)} r="3" fill="#d6d3d1" />
          ))}

          {/* Actual Line (Solid) */}
          <path d={currentPath} fill="none" stroke="#b45309" strokeWidth="3" className="drop-shadow-sm" />
          
          {/* Points Actual */}
          {scheduleData.currentHours.map((val, i) => (
            <circle key={`cu-${i}`} cx={getX(i)} cy={getY(val)} r="4" fill="#b45309" stroke="white" strokeWidth="1.5" />
          ))}

          {/* X Labels */}
          {DAYS.map((day, i) => (
            <text key={day} x={getX(i)} y={height + 10} textAnchor="middle" fontSize="10" fill="#78716c" fontFamily="sans-serif">
              {day}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const DonutChart = ({ data }: { data: number[] }) => {
    const size = 160;
    const radius = 60;
    const strokeWidth = 20;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((a, b) => a + b, 0);

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-40 w-40 rounded-full border-4 border-stone-100 text-stone-300 text-xs uppercase tracking-widest">
          No Data
        </div>
      );
    }

    let cumulativeAngle = 0;
    const colors = ['#b45309', '#44403c', '#d6d3d1', '#f5f5f4']; // Amber-700, Stone-700, Stone-300, Stone-100

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((value, index) => {
          const percentage = value / total;
          const dashArray = percentage * circumference;
          const offset = cumulativeAngle;
          cumulativeAngle += dashArray; 

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={colors[index]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={-offset} 
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-[#2c2a26] text-stone-200 p-8 rounded-sm shadow-md border-t-4 border-stone-500 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2 text-stone-50">Progress & Insights</h1>
          <p className="text-stone-400 font-light italic">"What gets measured gets managed."</p>
        </div>
        <PieChart size={48} className="text-stone-600 opacity-50" />
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Schedule Adherence (Click to Plan) */}
         <div 
            onClick={() => navigate('/plan')}
            className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 flex items-center gap-6 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all group"
         >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
             <Activity size={32} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Schedule Adherence</h3>
            <p className="text-2xl font-serif text-stone-800 mt-1">{scheduleData.adherenceRate}%</p>
            <p className="text-xs text-stone-400 mt-1">Reality vs Plan</p>
          </div>
        </div>

        {/* Task Completion (Click to Tasks) */}
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
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-stone-600 transition-colors">Tasks Done</h3>
            <p className="text-2xl font-serif text-stone-800 mt-1">{taskStats.completed} <span className="text-base text-stone-400">/ {taskStats.total}</span></p>
          </div>
        </div>

        {/* Quest Streak (Click to Dashboard) */}
        <div 
            onClick={() => navigate('/')}
            className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 flex items-center gap-6 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
             <Trophy size={32} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Daily Quests</h3>
            <div className="flex gap-1 mt-2">
               {[1,2,3].map(i => (
                 <div key={i} className={`h-2 w-8 rounded-sm transition-colors ${i <= questCompletion.done ? 'bg-emerald-500' : 'bg-stone-200'}`}></div>
               ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">{questCompletion.done} of 3 completed</p>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Schedule Execution Line Chart */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                <h3 className="font-serif font-bold text-xl text-stone-800">Weekly Execution</h3>
                <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-stone-300 mr-1"></span> Planned
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-600 ml-3 mr-1"></span> Reality (Completed Blocks)
                </p>
                </div>
                <Zap className="text-stone-200" size={24} />
            </div>
            <div className="h-48 w-full">
                <LineChart />
            </div>
        </div>

        {/* 2. Eisenhower Distribution */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="font-serif font-bold text-xl text-stone-800">Energy Allocation</h3>
                <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Pending Tasks by Quadrant</p>
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
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
               {[
                 { label: 'Do (Urgent)', count: taskStats.byQuadrant[TaskQuadrant.DO], color: 'bg-amber-700' },
                 { label: 'Schedule (Deep)', count: taskStats.byQuadrant[TaskQuadrant.SCHEDULE], color: 'bg-stone-700' },
                 { label: 'Delegate', count: taskStats.byQuadrant[TaskQuadrant.DELEGATE], color: 'bg-stone-300' },
                 { label: 'Eliminate', count: taskStats.byQuadrant[TaskQuadrant.DELETE], color: 'bg-stone-100' },
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
        <div className="bg-white p-8 rounded-sm shadow-sm border border-stone-200">
           <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="font-serif font-bold text-xl text-stone-800">System Health</h3>
                <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Consistency Metrics</p>
             </div>
             <Layers className="text-stone-200" size={24} />
          </div>

          <div className="space-y-8">
             <div>
                <div className="flex justify-between text-sm mb-2 font-serif">
                   <span className="text-stone-600">Knowledge Bank (Flashcards)</span>
                   <span className="text-stone-800 font-bold">{state.flashcards.length} Cards</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-400" style={{ width: `${Math.min(100, state.flashcards.length * 5)}%` }}></div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
