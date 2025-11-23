
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, CheckCircle2, Loader2 } from 'lucide-react';

import { AppState, INITIAL_STATE, Task, WeeklySchedule } from './types';
import { IntroAnimation } from './components/IntroAnimation';
import { supabase } from './services/supabaseClient';

// Extracted Components
import { LoginScreen } from './components/LoginScreen';
import { Navigation } from './components/Navigation';

// --- Lazy Load Components with Prefetch Capability ---
const loadDashboard = () => import('./components/Dashboard');
const loadTasks = () => import('./components/TaskMatrix');
const loadFocus = () => import('./components/FocusLayer');
const loadPsych = () => import('./components/PsychologyLayer');
const loadTime = () => import('./components/TimeStructurer');
const loadAnalytics = () => import('./components/AnalyticsLayer');
const loadReview = () => import('./components/WeeklyReview');
const loadRewards = () => import('./components/RewardShop');

const Dashboard = lazy(() => loadDashboard().then(module => ({ default: module.Dashboard })));
const TaskMatrix = lazy(() => loadTasks().then(module => ({ default: module.TaskMatrix })));
const FocusLayer = lazy(() => loadFocus().then(module => ({ default: module.FocusLayer })));
const PsychologyLayer = lazy(() => loadPsych().then(module => ({ default: module.PsychologyLayer })));
const TimeStructurer = lazy(() => loadTime().then(module => ({ default: module.TimeStructurer })));
const AnalyticsLayer = lazy(() => loadAnalytics().then(module => ({ default: module.AnalyticsLayer })));
const WeeklyReview = lazy(() => loadReview().then(module => ({ default: module.WeeklyReview })));
const RewardShop = lazy(() => loadRewards().then(module => ({ default: module.RewardShop })));

// Loader Map for Navigation
const loaders = {
    dashboard: loadDashboard,
    tasks: loadTasks,
    plan: loadTime,
    focus: loadFocus,
    rewards: loadRewards,
    psych: loadPsych,
    analytics: loadAnalytics,
    review: loadReview
};

// --- Types for Auth ---
interface UserSession {
  name: string;
  email: string;
}

const USER_KEY = 'intentional_current_user';
const LAST_DATE_KEY = 'intentional_last_date';

// --- Supabase Helpers ---

const loadFromSupabase = async (email: string, name: string): Promise<AppState> => {
  try {
    let { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('email', email).single();

    if (!profile || profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles').insert([{ email, name }]).select().single();
      if (createError) throw createError;
      profile = newProfile;
      await supabase.from('daily_quests').insert([{ email }]);
    }

    const [tasksReq, questsReq, cardsReq, reflectionsReq] = await Promise.all([
      supabase.from('tasks').select('*').eq('email', email),
      supabase.from('daily_quests').select('*').eq('email', email).single(),
      supabase.from('flashcards').select('*').eq('email', email),
      supabase.from('reflections').select('*').eq('email', email)
    ]);

    const tasks = tasksReq.data || [];
    const quests = questsReq.data || { work_title: '', health_title: '', relationship_title: '' }; 
    const flashcards = cardsReq.data || [];
    const reflections = reflectionsReq.data || [];

    return {
      userName: profile.name || name,
      theThing: profile.the_thing || '',
      celebrationVision: profile.celebration_vision || '',
      currentNiyyah: profile.current_niyyah || '',
      blockBalance: profile.block_balance || 0,
      tasks: tasks.map((t: any) => ({
        ...t,
        isFrog: t.is_frog,
        createdAt: t.created_at,
        purpose: t.purpose,
        tags: Array.isArray(t.tags) ? t.tags : [],
        blocks: t.blocks || 1,
        subtasks: Array.isArray(t.subtasks) 
          ? t.subtasks.map((st: any) => typeof st === 'string' ? { title: st, completed: false } : st)
          : undefined
      })),
      dailyQuests: {
        work: { title: quests.work_title || '', completed: quests.work_completed || false },
        health: { title: quests.health_title || '', completed: quests.health_completed || false },
        relationship: { title: quests.relationship_title || '', completed: quests.relationship_completed || false },
      },
      flashcards: flashcards.map((f: any) => ({ ...f, nextReview: f.next_review })),
      reflections: reflections.map((r: any) => ({ date: r.date, content: r.content })),
      weeklySchedule: profile.weekly_schedule || { current: {}, ideal: {} },
      customRewards: profile.custom_rewards || []
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return { ...INITIAL_STATE, userName: name };
  }
};

const syncToSupabase = async (email: string, data: AppState) => {
  try {
    await supabase.from('profiles').upsert({
      email,
      name: data.userName,
      the_thing: data.theThing,
      celebration_vision: data.celebrationVision,
      current_niyyah: data.currentNiyyah,
      weekly_schedule: data.weeklySchedule,
      block_balance: data.blockBalance,
      custom_rewards: data.customRewards
    });

    await supabase.from('daily_quests').upsert({
      email,
      work_title: data.dailyQuests.work.title,
      work_completed: data.dailyQuests.work.completed,
      health_title: data.dailyQuests.health.title,
      health_completed: data.dailyQuests.health.completed,
      relationship_title: data.dailyQuests.relationship.title,
      relationship_completed: data.dailyQuests.relationship.completed,
    });

    const { data: dbTasks } = await supabase.from('tasks').select('id').eq('email', email);
    if (dbTasks) {
      const currentIds = new Set(data.tasks.map(t => t.id));
      const toDelete = dbTasks.filter((t: any) => !currentIds.has(t.id)).map((t: any) => t.id);
      if (toDelete.length > 0) await supabase.from('tasks').delete().in('id', toDelete);
    }

    const tasksToUpsert = data.tasks.map(t => ({
      id: t.id,
      email,
      title: t.title,
      completed: t.completed,
      quadrant: t.quadrant,
      is_frog: t.isFrog,
      purpose: t.purpose,
      tags: t.tags,
      blocks: t.blocks,
      created_at: t.createdAt,
      subtasks: t.subtasks
    }));
    if (tasksToUpsert.length > 0) await supabase.from('tasks').upsert(tasksToUpsert);

    const { data: dbCards } = await supabase.from('flashcards').select('id').eq('email', email);
    if (dbCards) {
      const currentIds = new Set(data.flashcards.map(c => c.id));
      const toDelete = dbCards.filter((c: any) => !currentIds.has(c.id)).map((c: any) => c.id);
      if (toDelete.length > 0) await supabase.from('flashcards').delete().in('id', toDelete);
    }

    const cardsToUpsert = data.flashcards.map(f => ({
      id: f.id,
      email,
      question: f.question,
      answer: f.answer,
      next_review: f.nextReview,
      interval: f.interval
    }));
    if (cardsToUpsert.length > 0) await supabase.from('flashcards').upsert(cardsToUpsert);

    const reflectionsToUpsert = data.reflections.map(r => ({
      email,
      date: r.date,
      content: r.content
    }));
    if (reflectionsToUpsert.length > 0) {
      await supabase.from('reflections').upsert(reflectionsToUpsert, { onConflict: 'email, date' });
    }

  } catch (error) {
    console.error('Sync Error:', error);
    throw error;
  }
};

const AnimatedRoutes: React.FC<{
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  updateTasks: (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => void;
  updateSchedule: (schedule: WeeklySchedule) => void;
  toggleTask: (id: string) => void;
}> = ({ state, updateState, updateTasks, updateSchedule, toggleTask }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade-slide">
      <Routes location={location}>
        <Route path="/" element={<Dashboard state={state} updateState={updateState} />} />
        <Route path="/tasks" element={<TaskMatrix tasks={state.tasks} setTasks={updateTasks} schedule={state.weeklySchedule} updateSchedule={updateSchedule} />} />
        <Route path="/focus" element={<FocusLayer tasks={state.tasks} toggleTask={toggleTask} schedule={state.weeklySchedule} />} />
        <Route path="/psych" element={<PsychologyLayer flashcards={state.flashcards} updateState={updateState} />} />
        <Route path="/graphics" element={<AnalyticsLayer state={state} />} />
        <Route path="/plan" element={<TimeStructurer schedule={state.weeklySchedule} updateSchedule={updateSchedule} updateTasks={updateTasks} />} />
        <Route path="/review" element={<WeeklyReview state={state} updateState={updateState} />} />
        <Route path="/rewards" element={<RewardShop state={state} updateState={updateState} />} />
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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (userSession) {
      setIsLoginLoading(true);
      loadFromSupabase(userSession.email, userSession.name)
        .then(data => {
          const today = new Date().toDateString();
          const lastDate = localStorage.getItem(LAST_DATE_KEY);
          let finalData = data;
          
          if (lastDate !== today) {
             finalData = {
               ...data,
               dailyQuests: {
                  work: { ...data.dailyQuests.work, completed: false },
                  health: { ...data.dailyQuests.health, completed: false },
                  relationship: { ...data.dailyQuests.relationship, completed: false },
               }
             };
             localStorage.setItem(LAST_DATE_KEY, today);
          }
          setState(finalData);
          setIsLoginLoading(false);
        })
        .catch(() => setIsLoginLoading(false));
    }
  }, [userSession]);

  useEffect(() => {
    if (userSession && !isLoginLoading) {
      if (state === INITIAL_STATE && state.tasks.length === 0 && !state.theThing) return;

      setSaveStatus('saving');
      const timer = setTimeout(() => {
        syncToSupabase(userSession.email, state)
          .then(() => setSaveStatus('saved'))
          .catch(() => setSaveStatus('error'));
      }, 2000); 

      return () => clearTimeout(timer);
    }
  }, [state, userSession, isLoginLoading]);

  const handleLogin = async (name: string, email: string, remember: boolean) => {
    setIsLoginLoading(true);
    const session = { name, email };
    
    if (remember) {
      localStorage.setItem(USER_KEY, JSON.stringify(session));
      sessionStorage.removeItem(USER_KEY); 
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(session));
      localStorage.removeItem(USER_KEY); 
    }
    setUserSession(session);
    setShowIntro(true);
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

  if (!userSession) return <LoginScreen onLogin={handleLogin} loading={isLoginLoading} />;

  return (
    <Router>
       {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <div className="flex min-h-screen bg-[#FAF9F6] text-stone-800 font-sans selection:bg-amber-100 selection:text-amber-900">
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
            <main className="flex-1 overflow-auto p-4 lg:p-12 bg-[#FAF9F6]">
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
