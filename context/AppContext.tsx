
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, INITIAL_STATE, Task, WeeklySchedule, RewardItem } from '../types';
import { useDataSync } from '../hooks/useDataSync';
import { useNotifications } from '../hooks/useNotifications';

interface AppContextType {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  updateTasks: (tasksOrUpdater: Task[] | ((prev: Task[]) => Task[])) => void;
  updateSchedule: (schedule: WeeklySchedule) => void;
  toggleTask: (id: string) => void;
  saveStatus: 'saved' | 'saving' | 'error';
  isLoginLoading: boolean;
  errorMessage: string | null;
  handleExport: () => void;
  onLogout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'yt-1', title: 'Watch 1 YouTube Video', cost: 3, icon: 'Youtube', description: 'Guilt-free entertainment.' },
  { id: 'gm-1', title: '15 Min Game Session', cost: 5, icon: 'Gamepad2', description: 'Quick level up.' },
  { id: 'cf-1', title: 'Special Coffee/Tea Break', cost: 2, icon: 'Coffee', description: 'Brew something nice.' },
  { id: 'ms-1', title: 'Listen to 3 Songs', cost: 1, icon: 'Music', description: 'Musical recharge.' },
  { id: 'wk-1', title: 'Go for a Walk (No Phone)', cost: 4, icon: 'Sun', description: 'Touch grass.' },
  { id: 'nap-1', title: '20 Min Power Nap', cost: 6, icon: 'Moon', description: 'Reset your brain.' },
];

const LAST_DATE_KEY = 'intentional_last_date';

interface AppProviderProps {
  userSession: { name: string; email: string };
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ userSession, onLogout, children }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const { syncedState, isLoginLoading, saveStatus, errorMessage } = useDataSync(userSession, state);

  // Initialize Notifications Hook
  useNotifications(state.tasks, state.settings);

  // Sync Logic & Initialization
  useEffect(() => {
    if (userSession && !isLoginLoading && syncedState) {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem(LAST_DATE_KEY);
        let finalData = syncedState;
          
        // Daily Reset Logic
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

        // Data Migration: Rewards
        if (!finalData.shopItems || finalData.shopItems.length === 0) {
           const oldCustomRewards = (finalData as any).customRewards || [];
           finalData = {
               ...finalData,
               shopItems: [...DEFAULT_REWARDS, ...oldCustomRewards]
           };
        }

        // Data Migration: Settings
        if (!finalData.settings) {
            finalData = {
                ...finalData,
                settings: INITIAL_STATE.settings
            };
        }

        setState(finalData);
        // Persist local settings for hooks like useSound
        localStorage.setItem('intentional_settings', JSON.stringify(finalData.settings));
    }
  }, [syncedState, isLoginLoading, userSession]);

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

  const handleExport = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `intentional_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [state]);

  const contextValue = useMemo(() => ({
    state,
    updateState,
    updateTasks,
    updateSchedule,
    toggleTask,
    saveStatus,
    isLoginLoading,
    errorMessage,
    handleExport,
    onLogout
  }), [state, updateState, updateTasks, updateSchedule, toggleTask, saveStatus, isLoginLoading, errorMessage, handleExport, onLogout]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
