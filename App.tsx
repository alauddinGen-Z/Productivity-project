
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, CheckCircle2, Loader2 } from 'lucide-react';

import { AppState, INITIAL_STATE, Task, WeeklySchedule, RewardItem } from './types';
import { IntroAnimation } from './components/IntroAnimation';
import { useDataSync } from './hooks/useDataSync';

// Extracted Components
import { LandingPage } from './components/LandingPage';
import { Navigation } from './components/Navigation';

// --- Lazy Load Components ---
const loadDashboard = () => import('./components/Dashboard');
const loadTasks = () => import('./components/TaskMatrix');
const loadFocus = () => import('./components/FocusLayer');
const loadPsych = () => import('./components/PsychologyLayer');
const loadTime = () => import('./components/TimeStructurer');
const loadAnalytics = () => import('./components/AnalyticsLayer');
const loadReview = () => import('./components/WeeklyReview');
const loadRewards = () => import('./components/RewardShop');
const loadSettings = () => import('./components/SettingsLayer');

const Dashboard = lazy(() => loadDashboard().then(module => ({ default: module.Dashboard })));
const TaskMatrix = lazy(() => loadTasks().then(module => ({ default: module.TaskMatrix })));
const FocusLayer = lazy(() => loadFocus().then(module => ({ default: module.FocusLayer })));
const PsychologyLayer = lazy(() => loadPsych().then(module => ({ default: module.PsychologyLayer })));
const TimeStructurer = lazy(() => loadTime().then(module => ({ default: module.TimeStructurer })));
const AnalyticsLayer = lazy(() => loadAnalytics().then(module => ({ default: module.AnalyticsLayer })));
const WeeklyReview = lazy(() => loadReview().then(module => ({ default: module.WeeklyReview })));
const RewardShop = lazy(() => loadRewards().then(module => ({ default: module.RewardShop })));
const SettingsLayer = lazy(() => loadSettings().then(module => ({ default: module.SettingsLayer })));

const loaders = {
    dashboard: loadDashboard,
    tasks: loadTasks,
    plan: loadTime,
    focus: loadFocus,
    rewards: loadRewards,
    psych: loadPsych,
    analytics: loadAnalytics,
    review: loadReview,
    settings: loadSettings
};

interface UserSession {
  name: string;
  email: string;
}

const USER_KEY = 'intentional_current_user';
const LAST_DATE_KEY = 'intentional_last_date';
const INTRO_SEEN_KEY = 'intentional_intro_seen';

const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'yt-1', title: 'Watch 1 YouTube Video', cost: 3, icon: 'Youtube', description: 'Guilt-free entertainment.' },
  { id: 'gm-1', title: '15 Min Game Session', cost: 5, icon: 'Gamepad2', description: 'Quick level up.' },
  { id: 'cf-1', title: 'Special Coffee/Tea Break', cost: 2, icon: 'Coffee', description: 'Brew something nice.' },
  { id: 'ms-1', title: 'Listen to 3 Songs', cost: 1, icon: 'Music', description: 'Musical recharge.' },
  { id: 'wk-1', title: 'Go for a Walk (No Phone)', cost: 4, icon: 'Sun', description: 'Touch grass.' },
  { id: 'nap-1', title: '20 Min Power Nap', cost: 6, icon: 'Moon', description: 'Reset your brain.' },
];

const AnimatedRoutes: React.FC<{
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  updateTasks: (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => void;
  updateSchedule: (schedule: WeeklySchedule) => void;
  toggleTask: (id: string) => void;
  onLogout: () => void;
}> = ({ state, updateState, updateTasks, updateSchedule, toggleTask, onLogout }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade-slide">
      <Routes location={location}>
        <Route path="/" element={<Dashboard state={state} updateState={updateState} />} />
        <Route path="/tasks" element={<TaskMatrix tasks={state.tasks} setTasks={updateTasks} schedule={state.weeklySchedule} updateSchedule={updateSchedule} toggleTask={toggleTask} />} />
        <Route path="/focus" element={<FocusLayer tasks={state.tasks} toggleTask={toggleTask} schedule={state.weeklySchedule} />} />
        <Route path="/psych" element={<PsychologyLayer flashcards={state.flashcards} updateState={updateState} />} />
        <Route path="/graphics" element={<AnalyticsLayer state={state} />} />
        <Route path="/plan" element={<TimeStructurer schedule={state.weeklySchedule} updateSchedule={updateSchedule} updateTasks={updateTasks} />} />
        <Route path="/review" element={<WeeklyReview state={state} updateState={updateState} />} />
        <Route path="/rewards" element={<RewardShop state={state} updateState={updateState} />} />
        <Route path="/settings" element={<SettingsLayer state={state} updateState={updateState} onLogout={onLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const local = localStorage.getItem(USER_KEY);
      if (local) return JSON.parse(local);
      const session = sessionStorage.getItem(USER_KEY);
      if (session) return JSON.parse(session);
    } catch (e) {
      console.error("Failed to parse session", e);
    }
    return null;
  });

  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { syncedState, isLoginLoading, saveStatus } = useDataSync(userSession, state);
  
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_SEEN_KEY));

  // Sync Logic
  useEffect(() => {
    if (userSession && !isLoginLoading && syncedState) {
        // Daily reset logic
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem(LAST_DATE_KEY);
        let finalData = syncedState;
          
        if (lastDate !== today) {
             finalData = {
               ...syncedState,
               dailyQuests: {
                  work: { ...syncedState.dailyQuests.work, completed: false },
                  health: { ...syncedState.dailyQuests.health, completed: false },
                  relationship: { ...syncedState.dailyQuests.relationship, completed: false },
               }
             };
             localStorage.setItem(LAST_DATE_KEY, today);
        }

        // --- Data Migration: Move defaults to shopItems if empty ---
        // If shopItems is undefined (old user) or empty, we might want to populate defaults
        if (!finalData.shopItems || finalData.shopItems.length === 0) {
           // Check if there are old customRewards we need to migrate (from old types.ts)
           const oldCustomRewards = (finalData as any).customRewards || [];
           finalData = {
               ...finalData,
               shopItems: [...DEFAULT_REWARDS, ...oldCustomRewards]
           };
        }

        // --- Data Migration: Settings ---
        if (!finalData.settings) {
            finalData = {
                ...finalData,
                settings: INITIAL_STATE.settings
            };
        }

        setState(finalData);
        
        // Sync local storage setting for useSound
        localStorage.setItem('intentional_settings', JSON.stringify(finalData.settings));
    }
  }, [syncedState, isLoginLoading, userSession]);

  const handleLogin = async (name: string, email: string, remember: boolean) => {
    const session = { name, email };
    if (remember) {
      localStorage.setItem(USER_KEY, JSON.stringify(session));
      sessionStorage.removeItem(USER_KEY); 
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(session));
      localStorage.removeItem(USER_KEY); 
    }
    setUserSession(session);
    if (!sessionStorage.getItem(INTRO_SEEN_KEY)) {
        setShowIntro(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUserSession(null);
    setState(INITIAL_STATE);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `intentional_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const updateState = (updates: Partial<AppState>) => setState(prev => ({ ...prev, ...updates }));
  const updateTasks = (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => {
      setState(prev => {
        const newTasks = typeof tasksOrUpdater === 'function' ? tasksOrUpdater(prev.tasks) : tasksOrUpdater;
        return { ...prev, tasks: newTasks };
      });
  };
  const updateSchedule = (weeklySchedule: WeeklySchedule) => updateState({ weeklySchedule });

  const toggleTask = (id: string) => {
    setState(prev => {
        const targetTask = prev.tasks.find(t => t.id === id);
        if (!targetTask) return prev;
        const isCompleting = !targetTask.completed;
        const blockValue = targetTask.blocks || 1;
        const newBalance = isCompleting ? prev.blockBalance + blockValue : Math.max(0, prev.blockBalance - blockValue);
        return {
            ...prev,
            blockBalance: newBalance,
            tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: isCompleting } : t)
        };
    });
  };

  if (!userSession) return <LandingPage onLogin={handleLogin} loading={isLoginLoading} />;

  return (
    <Router>
       {showIntro && <IntroAnimation onComplete={() => {
           setShowIntro(false);
           sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
       }} />}
      <div className={`flex min-h-screen font-sans selection:bg-amber-100 selection:text-amber-900 ${state.settings.theme === 'dark' ? 'bg-stone-900 text-stone-100' : 'bg-[#FAF9F6] text-stone-800'}`}>
        <Navigation 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
          onLogout={handleLogout}
          onExport={handleExport}
          userName={userSession.name}
          blockBalance={state.blockBalance}
          loaders={loaders}
        />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="lg:hidden bg-[#FAF9F6] border-b border-stone-200 p-4 flex items-center justify-between">
            <div className="font-serif font-bold text-stone-800 text-lg">The Intentional System</div>
            <button onClick={() => setMobileOpen(true)} className="text-stone-600">
              <Menu />
            </button>
          </header>

          <div className="absolute top-4 right-4 lg:top-6 lg:right-8 z-40 flex items-center gap-2 text-xs font-medium text-stone-400 bg-white/50 px-2 py-1 rounded-full backdrop-blur-sm">
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Synced</span>
              </>
            ) : saveStatus === 'saving' ? (
              <>
                <span className="animate-pulse w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-stone-500">Syncing...</span>
              </>
            ) : (
               <>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-red-500">Offline</span>
              </>
            )}
          </div>

          {isLoginLoading ? (
             <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-stone-400" size={32} />
                  <p className="text-stone-400 font-serif italic">Loading your journal...</p>
                </div>
             </div>
          ) : (
            <main className={`flex-1 overflow-auto p-4 lg:p-12 ${state.settings.theme === 'dark' ? 'bg-[#1c1917]' : 'bg-[#FAF9F6]'}`}>
              <div className="max-w-6xl mx-auto">
                <Suspense fallback={
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="animate-spin text-stone-300" />
                    </div>
                }>
                    <AnimatedRoutes 
                      state={state} 
                      updateState={updateState} 
                      updateTasks={updateTasks} 
                      updateSchedule={updateSchedule} 
                      toggleTask={toggleTask} 
                      onLogout={handleLogout}
                    />
                </Suspense>
              </div>
            </main>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
