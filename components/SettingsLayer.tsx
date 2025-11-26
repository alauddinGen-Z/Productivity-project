import React from 'react';
import { Settings } from '../types';
import { Volume2, Moon, Sun, Monitor, Globe, Settings as SettingsIcon, LogOut, Database, RefreshCcw, Bell } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';
import { useApp } from '../context/AppContext';

interface SettingsLayerProps {
  onLogout?: () => void;
  state: any; // Using any here to simplify props match, ideally strictly typed
  updateState: any;
}

export const SettingsLayer: React.FC<SettingsLayerProps> = ({ onLogout }) => {
  const { state, updateState } = useApp();
  const { playClick } = useSound();
  const { settings } = state;
  const lang = settings.language;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    playClick();
    const newSettings = { ...settings, [key]: value };
    localStorage.setItem('intentional_settings', JSON.stringify(newSettings));
    updateState({ settings: newSettings });
  };

  const handleResetData = () => {
    if (confirm(t('settings_reset_confirm', lang))) {
        playClick();
        localStorage.removeItem('intentional_current_user');
        window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="bg-[#2c2a26] text-stone-200 p-8 rounded-sm shadow-md border-t-4 border-stone-500 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2 text-stone-50">{t('settings_title', lang)}</h1>
          <p className="text-stone-400 font-light italic">"Tailor the machine to the mind."</p>
        </div>
        <SettingsIcon size={48} className="text-stone-600 opacity-50" aria-hidden="true" />
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
        
        {/* Sound Settings */}
        <div className="p-8 border-b border-stone-100">
            <h3 className="font-serif font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
                <Volume2 size={20} className="text-stone-400" aria-hidden="true" /> {t('settings_audio', lang)}
            </h3>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-bold text-stone-700">{t('settings_sound_title', lang)}</div>
                    <p className="text-xs text-stone-500 mt-1">{t('settings_sound_desc', lang)}</p>
                </div>
                <button 
                    role="switch"
                    aria-checked={settings.soundEnabled}
                    aria-label={t('settings_sound_title', lang)}
                    onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${settings.soundEnabled ? 'bg-amber-500' : 'bg-stone-200'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>

        {/* Notification Settings */}
        <div className="p-8 border-b border-stone-100">
            <h3 className="font-serif font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
                <Bell size={20} className="text-stone-400" aria-hidden="true" /> Notifications
            </h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-stone-700">Enable Reminders</div>
                        <p className="text-xs text-stone-500 mt-1">Receive daily intention prompts and task alerts.</p>
                    </div>
                    <button 
                        role="switch"
                        aria-checked={settings.notificationsEnabled}
                        aria-label="Enable Reminders"
                        onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${settings.notificationsEnabled ? 'bg-amber-500' : 'bg-stone-200'}`}
                    >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
                
                {settings.notificationsEnabled && (
                     <div className="flex items-center justify-between bg-stone-50 p-4 rounded-sm border border-stone-100 animate-fade-in">
                        <label htmlFor="daily-reminder" className="text-xs font-bold uppercase tracking-widest text-stone-500">Daily Intention Time</label>
                        <input 
                            id="daily-reminder"
                            type="time" 
                            value={settings.dailyReminderTime || '09:00'}
                            onChange={(e) => updateSetting('dailyReminderTime', e.target.value)}
                            className="bg-white border border-stone-200 px-3 py-1 rounded-sm text-sm font-mono outline-none focus:border-stone-400"
                        />
                     </div>
                )}
            </div>
        </div>

        {/* Theme Settings */}
        <div className="p-8 border-b border-stone-100">
             <h3 className="font-serif font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
                <Sun size={20} className="text-stone-400" aria-hidden="true" /> {t('settings_theme', lang)}
            </h3>
            <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-label="Theme Selection">
                {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'sepia', label: 'Paper', icon: Monitor },
                ].map((theme) => (
                    <button
                        key={theme.id}
                        role="radio"
                        aria-checked={settings.theme === theme.id}
                        onClick={() => updateSetting('theme', theme.id as any)}
                        className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${settings.theme === theme.id ? 'bg-stone-800 text-white border-stone-800' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}
                    >
                        <theme.icon size={24} className="mb-2" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-widest">{theme.label}</span>
                    </button>
                ))}
            </div>
            <p className="text-xs text-stone-400 mt-4 italic">{t('settings_theme_note', lang)}</p>
        </div>

        {/* Language */}
        <div className="p-8 border-b border-stone-100">
            <h3 className="font-serif font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
                <Globe size={20} className="text-stone-400" aria-hidden="true" /> {t('settings_lang', lang)}
            </h3>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Language Selection">
                {['en', 'es', 'fr', 'de', 'jp', 'ky'].map((l) => (
                    <button
                        key={l}
                        role="radio"
                        aria-checked={settings.language === l}
                        onClick={() => updateSetting('language', l as any)}
                        className={`px-4 py-2 border rounded-sm text-sm font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${settings.language === l ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}
                    >
                        {l.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>

        {/* Data & Account */}
        <div className="p-8 bg-stone-50">
             <h3 className="font-serif font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
                <Database size={20} className="text-stone-400" aria-hidden="true" /> {t('settings_data', lang)}
            </h3>
            
            <div className="space-y-4">
                <button 
                    onClick={handleResetData}
                    className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-700 hover:text-red-700 transition-colors rounded-sm group focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <span className="text-sm font-bold uppercase tracking-wide">{t('settings_reset', lang)}</span>
                    <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform" aria-hidden="true" />
                </button>

                {onLogout && (
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-100 text-stone-700 transition-colors rounded-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                    >
                        <span className="text-sm font-bold uppercase tracking-wide">{t('settings_logout', lang)}</span>
                        <LogOut size={16} aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};