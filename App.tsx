import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

import { AppState, INITIAL_STATE, Task, WeeklySchedule, RewardItem } from './types';
import { IntroAnimation } from './components/IntroAnimation';
import { useDataSync } from './hooks/useDataSync';
import { t } from './utils/translations';
import { AppContext, AppContextType } from './context/AppContext';

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

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-slide">
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskMatrix />} />
        <Route path="/focus" element={<FocusLayer />} />
        <Route path="/psych" element={<PsychologyLayer />} />
        <Route path="/graphics" element={<AnalyticsLayer />} />
        <Route path="/plan" element={<TimeStructurer />} />
        <Route path="/review" element={<WeeklyReview />} />
        <Route path="/rewards" element={<RewardShop />} />
        <Route path="/settings" element={<SettingsLayer />} />
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
  
  const { syncedState, isLoginLoading, saveStatus, errorMessage } = useDataSync(userSession, state);
  
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_SEEN_KEY));
  const lang = state.settings.language;

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
        if (!finalData.shopItems || finalData.shopItems.length === 0) {
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUserSession(null);
    setState(INITIAL_STATE);
  }, []);

  const handleExport = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `intentional_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [state]);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateTasks = useCallback((tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => {
      setState(prev => {
        const newTasks = typeof tasksOrUpdater === 'function' ? tasksOrUpdater(prev.tasks) : tasksOrUpdater;
        return { ...prev, tasks: newTasks };
      });
  }, []);

  const updateSchedule = useCallback((weeklySchedule: WeeklySchedule) => {
    updateState({ weeklySchedule });
  }, [updateState]);

  const toggleTask = useCallback((id: string) => {
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
  }, []);

  const contextValue: AppContextType = useMemo(() => ({
    state,
    updateState,
    updateTasks,
    updateSchedule,
    toggleTask
  }), [state, updateState, updateTasks, updateSchedule, toggleTask]);

  if (!userSession) return <LandingPage onLogin={handleLogin} loading={isLoginLoading} />;

  return (
    <AppContext.Provider value={contextValue}>
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
              loaders={loaders}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <header className="lg:hidden bg-[#FAF9F6] border-b border-stone-200 p-4 flex items-center justify-between">
                <div className="font-serif font-bold text-stone-800 text-lg">The Intentional System</div>
                <button onClick={() => setMobileOpen(true)} className="text-stone-600">
                <Menu />
                </button>
            </header>

            <div className="absolute top-4 right-4 lg:top-6 lg:right-8 z-40 flex items-center gap-2 text-xs font-medium bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-stone-100 shadow-sm">
                {saveStatus === 'saved' ? (
                <>
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">{t('status_synced', lang)}</span>
                </>
                ) : saveStatus === 'saving' ? (
                <>
                    <Loader2 size={14} className="animate-spin text-amber-500" />
                    <span className="text-stone-500">{t('status_syncing', lang)}</span>
                </>
                ) : (
                <>
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-red-600" title={errorMessage || "Sync Error"}>
                    {errorMessage?.includes("column") ? t('status_error', lang) : t('status_error', lang)}
                    </span>
                </>
                )}
            </div>

            {isLoginLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-stone-400" size={32} />
                    <p className="text-stone-400 font-serif italic">{t('loading_journal', lang)}</p>
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
                        <AnimatedRoutes />
                    </Suspense>
                </div>
                </main>
            )}
            </div>
        </div>
        </Router>
    </AppContext.Provider>
  );
};

export default App;