
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  CalendarClock, 
  Zap, 
  BrainCircuit, 
  BarChart3,
  X,
  Feather,
  LogOut,
  Download,
  User,
  ShoppingBag,
  Box,
  PieChart,
  Settings
} from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';
import { Settings as AppSettings } from '../types';

interface NavigationProps {
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  onLogout: () => void;
  onExport: () => void;
  userName: string;
  blockBalance: number;
  loaders: Record<string, () => Promise<any>>;
  language?: AppSettings['language'];
}

export const Navigation: React.FC<NavigationProps> = ({ 
  mobileOpen, 
  setMobileOpen, 
  onLogout, 
  onExport, 
  userName, 
  blockBalance,
  loaders,
  language = 'en'
}) => {
  const location = useLocation();
  const { playClick, playSoftClick } = useSound();
  
  const navItems = [
    { path: '/', label: t('nav_dashboard', language), icon: LayoutDashboard, loaderKey: 'dashboard' },
    { path: '/tasks', label: t('nav_tasks', language), icon: ListTodo, loaderKey: 'tasks' },
    { path: '/plan', label: t('nav_plan', language), icon: CalendarClock, loaderKey: 'plan' },
    { path: '/focus', label: t('nav_focus', language), icon: Zap, loaderKey: 'focus' },
    { path: '/rewards', label: t('nav_rewards', language), icon: ShoppingBag, loaderKey: 'rewards' },
    { path: '/psych', label: t('nav_psych', language), icon: BrainCircuit, loaderKey: 'psych' },
    { path: '/graphics', label: t('nav_stats', language), icon: PieChart, loaderKey: 'analytics' },
    { path: '/review', label: t('nav_review', language), icon: BarChart3, loaderKey: 'review' },
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
        <button onClick={() => { setMobileOpen(false); playClick(); }} className="lg:hidden text-stone-400">
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

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { setMobileOpen(false); playClick(); }}
              onMouseEnter={() => {
                  playSoftClick();
                  loaders[item.loaderKey] && loaders[item.loaderKey]();
              }} 
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
        <Link 
            to="/settings"
            onClick={() => { setMobileOpen(false); playClick(); loaders.settings && loaders.settings(); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-stone-400 hover:text-stone-100 transition-colors text-sm group"
        >
            <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>{t('nav_settings', language)}</span>
        </Link>
        <button 
          onClick={() => { playClick(); onExport(); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-stone-400 hover:text-stone-100 transition-colors text-sm"
        >
          <Download size={16} />
          <span>{t('nav_backup', language)}</span>
        </button>
        <button 
          onClick={() => { playClick(); onLogout(); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-stone-400 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>{t('nav_switch', language)}</span>
        </button>
      </div>
    </div>
  );
};
