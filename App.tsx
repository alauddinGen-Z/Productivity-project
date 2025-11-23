
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  CalendarClock, 
  Zap, 
  BrainCircuit, 
  BarChart3,
  Menu,
  X,
  Feather,
  LogOut,
  Download,
  CheckCircle2,
  User,
  Loader2,
  Check,
  PieChart,
  ShoppingBag,
  Box
} from 'lucide-react';

import { AppState, INITIAL_STATE, Task, Flashcard, WeeklySchedule } from './types';
import { IntroAnimation } from './components/IntroAnimation';
import { supabase } from './services/supabaseClient';

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
    // 1. Try to fetch profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    // 2. If profile doesn't exist, create it along with empty daily quests
    if (!profile || profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{ email, name }])
        .select()
        .single();
      
      if (createError) throw createError;
      profile = newProfile;

      // Create initial daily quests entry
      await supabase.from('daily_quests').insert([{ email }]);
    }

    // 3. Fetch related data
    const [tasksReq, questsReq, cardsReq, reflectionsReq] = await Promise.all([
      supabase.from('tasks').select('*').eq('email', email),
      supabase.from('daily_quests').select('*').eq('email', email).single(),
      supabase.from('flashcards').select('*').eq('email', email),
      supabase.from('reflections').select('*').eq('email', email)
    ]);

    const tasks = tasksReq.data || [];
    const quests = questsReq.data || { work_title: '', health_title: '', relationship_title: '' }; // Fallback
    const flashcards = cardsReq.data || [];
    const reflections = reflectionsReq.data || [];

    // 4. Construct AppState
    return {
      userName: profile.name || name,
      theThing: profile.the_thing || '',
      celebrationVision: profile.celebration_vision || '',
      currentNiyyah: profile.current_niyyah || '',
      blockBalance: profile.block_balance || 0, // Load balance
      tasks: tasks.map((t: any) => ({
        ...t,
        isFrog: t.is_frog,
        createdAt: t.created_at,
        purpose: t.purpose,
        tags: Array.isArray(t.tags) ? t.tags : [],
        blocks: t.blocks || 1, // Load blocks or default to 1
        subtasks: Array.isArray(t.subtasks) 
          ? t.subtasks.map((st: any) => typeof st === 'string' ? { title: st, completed: false } : st)
          : undefined
      })),
      goals: [], 
      dailyQuests: {
        work: { title: quests.work_title || '', completed: quests.work_completed || false },
        health: { title: quests.health_title || '', completed: quests.health_completed || false },
        relationship: { title: quests.relationship_title || '', completed: quests.relationship_completed || false },
      },
      flashcards: flashcards.map((f: any) => ({
        ...f,
        nextReview: f.next_review
      })),
      reflections: reflections.map((r: any) => ({
        date: r.date,
        content: r.content
      })),
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
    // 1. Update Profile (This includes the Weekly Schedule JSON which is critical for syncing dashboard completions)
    await supabase.from('profiles').upsert({
      email,
      name: data.userName,
      the_thing: data.theThing,
      celebration_vision: data.celebrationVision,
      current_niyyah: data.currentNiyyah,
      weekly_schedule: data.weeklySchedule,
      block_balance: data.blockBalance, // Sync Balance
      custom_rewards: data.customRewards
    });

    // 2. Update Quests
    await supabase.from('daily_quests').upsert({
      email,
      work_title: data.dailyQuests.work.title,
      work_completed: data.dailyQuests.work.completed,
      health_title: data.dailyQuests.health.title,
      health_completed: data.dailyQuests.health.completed,
      relationship_title: data.dailyQuests.relationship.title,
      relationship_completed: data.dailyQuests.relationship.completed,
    });

    // 3. Sync Tasks
    const { data: dbTasks } = await supabase.from('tasks').select('id').eq('email', email);
    if (dbTasks) {
      const currentIds = new Set(data.tasks.map(t => t.id));
      const toDelete = dbTasks.filter((t: any) => !currentIds.has(t.id)).map((t: any) => t.id);
      if (toDelete.length > 0) {
        await supabase.from('tasks').delete().in('id', toDelete);
      }
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
      blocks: t.blocks, // Sync Blocks Value
      created_at: t.createdAt,
      subtasks: t.subtasks
    }));
    if (tasksToUpsert.length > 0) {
        await supabase.from('tasks').upsert(tasksToUpsert);
    }

    // 4. Sync Flashcards
    const { data: dbCards } = await supabase.from('flashcards').select('id').eq('email', email);
    if (dbCards) {
      const currentIds = new Set(data.flashcards.map(c => c.id));
      const toDelete = dbCards.filter((c: any) => !currentIds.has(c.id)).map((c: any) => c.id);
      if (toDelete.length > 0) {
        await supabase.from('flashcards').delete().in('id', toDelete);
      }
    }

    const cardsToUpsert = data.flashcards.map(f => ({
      id: f.id,
      email,
      question: f.question,
      answer: f.answer,
      next_review: f.nextReview,
      interval: f.interval
    }));
    if (cardsToUpsert.length > 0) {
        await supabase.from('flashcards').upsert(cardsToUpsert);
    }

    // 5. Sync Reflections (Append Only logic mostly, but here we upsert based on composite key if possible, or just insert new ones)
    const reflectionsToUpsert = data.reflections.map(r => ({
      email,
      date: r.date,
      content: r.content
    }));
    if (reflectionsToUpsert.length > 0) {
      // NOTE: requires a unique constraint on (email, date) in Supabase to work as upsert correctly
      await supabase.from('reflections').upsert(reflectionsToUpsert, { onConflict: 'email, date' });
    }

  } catch (error) {
    console.error('Sync Error:', error);
    throw error;
  }
};

// --- Components ---

const LoginScreen: React.FC<{ onLogin: (name: string, email: string, remember: boolean) => void, loading: boolean }> = ({ onLogin, loading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onLogin(name, email, remember);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-12 rounded-sm shadow-xl border-t-4 border-stone-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-stone-100"></div>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-6 text-stone-800">
            <Feather size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">The Intentional System</h1>
          <p className="text-stone-500 font-serif italic">"Identify the essential. Eliminate the rest."</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Traveler Name</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-[#FAF9F6] border border-stone-200 focus:border-stone-800 outline-none font-serif text-lg text-stone-800 transition-colors"
              placeholder="Enter your name..."
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Email / ID</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#FAF9F6] border border-stone-200 focus:border-stone-800 outline-none font-serif text-lg text-stone-800 transition-colors"
              placeholder="used to sync your data..."
              disabled={loading}
            />
          </div>

          <div 
            className="flex items-center gap-3 pt-2 cursor-pointer group"
            onClick={() => setRemember(!remember)}
          >
            <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-all ${remember ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-300 group-hover:border-stone-400'}`}>
              {remember && <Check size={14} strokeWidth={3} />}
            </div>
            <span className="text-sm font-serif text-stone-600 select-none">Remember this device</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-800 text-white py-4 font-bold text-xs uppercase tracking-[0.2em] hover:bg-stone-700 transition-all mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Begin Journey'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">
            Data is synced to the cloud
          </p>
        </div>
      </div>
    </div>
  );
};

const Navigation: React.FC<{ 
  mobileOpen: boolean; 
  setMobileOpen: (o: boolean) => void;
  onLogout: () => void;
  onExport: () => void;
  userName: string;
  blockBalance: number;
}> = ({ mobileOpen, setMobileOpen, onLogout, onExport, userName, blockBalance }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Purpose & Dashboard', icon: LayoutDashboard, loader: loadDashboard },
    { path: '/tasks', label: 'Tasks & Process', icon: ListTodo, loader: loadTasks },
    { path: '/plan', label: 'Time Structure', icon: CalendarClock, loader: loadTime },
    { path: '/focus', label: 'Focus Zone', icon: Zap, loader: loadFocus },
    { path: '/rewards', label: 'Reward Shop', icon: ShoppingBag, loader: loadRewards },
    { path: '/psych', label: 'Psychology & Learn', icon: BrainCircuit, loader: loadPsych },
    { path: '/graphics', label: 'Progress & Insights', icon: PieChart, loader: loadAnalytics },
    { path: '/review', label: 'Weekly Review', icon: BarChart3, loader: loadReview },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#292524] text-stone-300 transform transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col shadow-xl font-serif`}>
      <div className="p-8 flex items-center justify-between border-b border-stone-700">
        <div className="flex items-center gap-3 text-stone-100">
          <Feather size={20} />
          <div>
            <span className="font-bold text-lg tracking-wide block leading-none">INTENTIONAL</span>
            <span className="text-[10px] text-stone-500 uppercase tracking-widest">System</span>
          </div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-stone-400">
          <X />
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between p-3 bg-[#35312e] rounded-sm border border-stone-700/50">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-amber-500">
                <User size={14} />
             </div>
             <div className="overflow-hidden">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Traveler</p>
                <p className="text-sm text-stone-200 font-medium truncate max-w-[80px]">{userName}</p>
             </div>
           </div>
           
           <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 text-emerald-400">
                <Box size={12} />
                <span className="font-mono font-bold text-sm">{blockBalance}</span>
             </div>
           </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={() => item.loader()} // Prefetch on hover for faster perceived performance
              className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#FAF9F6] text-stone-900 shadow-sm' 
                  : 'hover:bg-[#35312e] hover:text-stone-100'
              }`}
            >
              <Icon size={18} className={`transition-colors ${isActive ? 'text-amber-700' : 'text-stone-500 group-hover:text-stone-300'}`} />
              <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-stone-700 bg-[#252221] space-y-2">
        <button 
          onClick={onExport}
          className="flex items-center gap-3 w-full px-4 py-2 text-stone-400 hover:text-stone-100 transition-colors text-sm"
        >
          <Download size={16} />
          <span>Backup Data</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-stone-400 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>Switch Profile</span>
        </button>
      </div>
    </div>
  );
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
        <Route path="/plan" element={<TimeStructurer schedule={state.weeklySchedule} updateSchedule={updateSchedule} />} />
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

  // Initial Data Load
  useEffect(() => {
    if (userSession) {
      setIsLoginLoading(true);
      loadFromSupabase(userSession.email, userSession.name)
        .then(data => {
          // --- Logical Connection: Daily Reset Logic ---
          // Check if it's a new day to reset daily quests
          const today = new Date().toDateString();
          const lastDate = localStorage.getItem(LAST_DATE_KEY);
          
          let finalData = data;
          
          if (lastDate !== today) {
             // It's a new day (or first time), reset quests
             finalData = {
               ...data,
               dailyQuests: {
                  work: { ...data.dailyQuests.work, completed: false },
                  health: { ...data.dailyQuests.health, completed: false },
                  relationship: { ...data.dailyQuests.relationship, completed: false },
               }
             };
             // Update local tracking
             localStorage.setItem(LAST_DATE_KEY, today);
          }

          setState(finalData);
          setIsLoginLoading(false);
        })
        .catch(() => setIsLoginLoading(false));
    }
  }, [userSession]);

  // Auto-Save with Debounce
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
    // Show intro on new login
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

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateTasks = (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => {
      // Handle both functional and direct updates to match what TaskMatrix expects
      setState(prev => {
        const newTasks = typeof tasksOrUpdater === 'function' ? tasksOrUpdater(prev.tasks) : tasksOrUpdater;
        return { ...prev, tasks: newTasks };
      });
  };
  
  const updateSchedule = (weeklySchedule: WeeklySchedule) => updateState({ weeklySchedule });

  // Function to toggle task completion - now handles BLOCK BALANCE
  const toggleTask = (id: string) => {
    setState(prev => {
        const targetTask = prev.tasks.find(t => t.id === id);
        if (!targetTask) return prev;
        
        const isCompleting = !targetTask.completed;
        const blockValue = targetTask.blocks || 1;
        
        // Add blocks if completing, subtract if undoing
        const newBalance = isCompleting 
            ? prev.blockBalance + blockValue 
            : Math.max(0, prev.blockBalance - blockValue);

        return {
            ...prev,
            blockBalance: newBalance,
            tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: isCompleting } : t)
        };
    });
  };

  if (!userSession) {
    return <LoginScreen onLogin={handleLogin} loading={isLoginLoading} />;
  }

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
        />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="lg:hidden bg-[#FAF9F6] border-b border-stone-200 p-4 flex items-center justify-between">
            <div className="font-serif font-bold text-stone-800 text-lg">The Intentional System</div>
            <button onClick={() => setMobileOpen(true)} className="text-stone-600">
              <Menu />
            </button>
          </header>

          {/* Save Status Indicator */}
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