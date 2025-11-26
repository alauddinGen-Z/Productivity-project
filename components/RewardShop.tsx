
import React, { useState, useEffect } from 'react';
import { Box, Coffee, Gamepad2, Youtube, Music, Sun, Moon, ShoppingBag, Lock, Plus, X, Trash2, Gift, CheckCircle, Edit2, Save, Crown } from 'lucide-react';
import { RewardItem } from '../types';
import { useSound } from '../hooks/useSound';
import { generateId } from '../utils/helpers';
import { t } from '../utils/translations';
import { useApp } from '../context/AppContext';

const AVAILABLE_ICONS = [
  'Box', 'Coffee', 'Gamepad2', 'Youtube', 'Music', 'Sun', 'Moon', 'ShoppingBag', 'Gift'
];

export const RewardShop: React.FC = () => {
  const { state, updateState, setSubscriptionModalOpen } = useApp();
  const [redeemedId, setRedeemedId] = useState<string | null>(null);
  const { playSuccess, playClick, playDelete, playAdd, playSoftClick } = useSound();
  const lang = state.settings.language;
  const isPro = true; // Temporary bypass: state.settings.subscriptionTier === 'pro';
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Logic: Default system rewards (6) + Custom Rewards
  const customRewardsCount = state.shopItems.filter(i => !i.isDefault).length;
  // Free limit is 3 custom rewards. We need to account for defaults if they exist in state or separate.
  // In App.tsx we merged defaults. Let's assume defaults have a specific flag or ID pattern.
  // Actually, I defined DEFAULT_REWARDS in context but in sync it merges.
  // Let's assume the first 6 are defaults or hardcoded check.
  // Better: We check `shopItems` length. If free, limit total to say 9? Or just limit new creations.
  // The logic in sync was: shopItems: [...DEFAULT_REWARDS, ...oldCustomRewards].
  // Let's assume any item with ID starting with 'cust-' is custom. I'll change generateId usage below.
  
  // Simplification: Just count total items. If > 9 (6 defaults + 3 custom), block.
  const canAddMore = isPro || state.shopItems.length < 9;

  // Form State
  const [formData, setFormData] = useState({
      title: '',
      cost: 1,
      description: '',
      icon: 'Gift'
  });

  const handleCreateClick = () => {
    playClick();
    if (!canAddMore) {
        setSubscriptionModalOpen(true);
        return;
    }
    setFormData({ title: '', cost: 1, description: '', icon: 'Gift' });
    setEditingId(null);
    setIsCreating(true);
  };

  const handleEditClick = (item: RewardItem) => {
    playClick();
    setFormData({
        title: item.title,
        cost: item.cost,
        description: item.description || '',
        icon: item.icon
    });
    setEditingId(item.id);
    setIsCreating(true);
  };

  const redeemReward = (reward: RewardItem) => {
    if (state.blockBalance >= reward.cost) {
      playSuccess();
      updateState({ blockBalance: state.blockBalance - reward.cost });
      setRedeemedId(reward.id);
      setTimeout(() => setRedeemedId(null), 2500); 
    }
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    playAdd();

    if (editingId) {
        // Edit existing
        const updatedShop = state.shopItems.map(item => 
            item.id === editingId ? { ...item, ...formData } : item
        );
        updateState({ shopItems: updatedShop });
    } else {
        // Create new with UUID
        const newItem: RewardItem = {
            id: `cust-${generateId()}`,
            title: formData.title,
            cost: Math.max(1, formData.cost),
            icon: formData.icon,
            description: formData.description
        };
        updateState({ shopItems: [...state.shopItems, newItem] });
    }
    
    setIsCreating(false);
    setEditingId(null);
  };

  const handleDeleteReward = (id: string) => {
    if (confirm('Delete this reward permanently?')) {
      playDelete();
      updateState({ shopItems: state.shopItems.filter(r => r.id !== id) });
      if (editingId === id) setIsCreating(false);
    }
  };

  const renderIcon = (iconName: string, size: number) => {
      switch(iconName) {
          case 'Youtube': return <Youtube size={size} />;
          case 'Gamepad2': return <Gamepad2 size={size} />;
          case 'Coffee': return <Coffee size={size} />;
          case 'Music': return <Music size={size} />;
          case 'Sun': return <Sun size={size} />;
          case 'Moon': return <Moon size={size} />;
          case 'ShoppingBag': return <ShoppingBag size={size} />;
          case 'Gift': return <Gift size={size} />;
          default: return <Box size={size} />;
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
        
      <div className="bg-[#2c2a26] text-stone-200 p-8 rounded-sm shadow-md border-t-4 border-emerald-600 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-serif mb-2 text-stone-50">{t('reward_title', lang)}</h1>
          <p className="text-stone-400 font-light italic">{t('reward_quote', lang)}</p>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-stone-800/50 p-4 rounded-sm border border-stone-700">
           <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-stone-400">{t('reward_balance', lang)}</div>
              <div className="text-3xl font-mono font-bold text-emerald-400">{state.blockBalance} {t('reward_blocks', lang)}</div>
           </div>
           <Box size={40} className="text-emerald-500" />
        </div>
        
        <div className="absolute -right-10 -bottom-10 text-stone-800 opacity-20 transform rotate-12">
            <ShoppingBag size={200} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        {!isPro && (
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wide flex items-center gap-2">
                <span>Free Plan Limit: {Math.max(0, 9 - state.shopItems.length)} slots left</span>
                <Crown size={12} className="text-amber-500" />
            </div>
        )}
        <button 
          onClick={handleCreateClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors ${!canAddMore ? 'bg-stone-200 text-stone-400 hover:bg-amber-100 hover:text-amber-700' : 'bg-stone-800 text-white hover:bg-stone-700'}`}
        >
           {!canAddMore ? <Lock size={16} /> : <Plus size={16} />} 
           {t('reward_create_btn', lang)}
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-xl border border-stone-200 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif font-bold text-xl text-stone-800">{editingId ? t('reward_edit_title', lang) : t('reward_new_title', lang)}</h3>
                <button onClick={() => setIsCreating(false)} className="text-stone-400 hover:text-stone-600">
                   <X size={20} />
                </button>
             </div>
             
             <form onSubmit={handleSaveReward} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t('reward_form_title', lang)}</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Buy a new book"
                    className="w-full p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none font-serif"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t('reward_form_cost', lang)}</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})}
                    className="w-full p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t('reward_form_desc', lang)}</label>
                  <input 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none font-serif text-sm"
                  />
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t('reward_form_icon', lang)}</label>
                   <div className="flex gap-2 flex-wrap">
                      {AVAILABLE_ICONS.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => { setFormData({...formData, icon}); playSoftClick(); }}
                          className={`p-2 rounded border transition-all ${formData.icon === icon ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 hover:border-stone-400 text-stone-500'}`}
                        >
                          {renderIcon(icon, 18)}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-4 flex gap-2">
                   {editingId && (
                     <button
                        type="button"
                        onClick={() => handleDeleteReward(editingId)}
                        className="px-4 py-3 bg-red-50 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-100 border border-red-100"
                     >
                        <Trash2 size={16} />
                     </button>
                   )}
                   <button 
                     type="button" 
                     onClick={() => setIsCreating(false)}
                     className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-100"
                   >
                     {t('reward_cancel', lang)}
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 py-3 bg-stone-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-stone-700 flex items-center justify-center gap-2"
                   >
                     <Save size={14} />
                     {editingId ? t('reward_save', lang) : t('reward_create', lang)}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.shopItems.map(reward => {
            const canAfford = state.blockBalance >= reward.cost;
            const isRedeemed = redeemedId === reward.id;
            const progressPercent = Math.min(100, Math.round((state.blockBalance / reward.cost) * 100));

            return (
                <div 
                    key={reward.id} 
                    className={`bg-white p-6 rounded-sm border transition-all duration-300 relative group overflow-hidden flex flex-col ${
                        canAfford ? 'border-stone-200 hover:border-emerald-400 hover:shadow-md' : 'border-stone-100 opacity-80'
                    }`}
                >
                    {isRedeemed && (
                        <div className="absolute inset-0 z-20 bg-emerald-50/95 flex flex-col items-center justify-center animate-fade-in p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 animate-fade-slide">
                                <CheckCircle size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="text-emerald-800 font-serif font-bold text-lg mb-1">{t('reward_claimed', lang)}</h3>
                            <p className="text-emerald-600 text-xs font-serif italic">{t('reward_claimed_sub', lang)}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-full ${canAfford ? 'bg-stone-50 text-stone-700' : 'bg-stone-100 text-stone-300'}`}>
                            {renderIcon(reward.icon, 24)}
                        </div>
                        <div className="flex items-center gap-2">
                           {/* Edit Button visible on hover */}
                           <button 
                               onClick={() => handleEditClick(reward)}
                               className="text-stone-300 hover:text-stone-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                               title="Edit Reward"
                           >
                               <Edit2 size={14} />
                           </button>

                           <div className={`flex items-center gap-1 font-mono font-bold text-lg ${canAfford ? 'text-stone-800' : 'text-stone-400'}`}>
                               {reward.cost} <Box size={14} className={canAfford ? 'text-stone-400' : 'text-stone-300'} />
                           </div>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-serif font-bold text-xl mb-1 ${canAfford ? 'text-stone-800' : 'text-stone-400'}`}>{reward.title}</h3>
                      {reward.description && (
                        <p className={`text-xs font-serif italic mb-4 ${canAfford ? 'text-stone-500' : 'text-stone-300'}`}>{reward.description}</p>
                      )}
                    </div>
                    
                    <div className="mt-4">
                        {!canAfford && (
                            <div className="mb-2">
                                <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                                    <span>{t('reward_progress', lang)}</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-300 transition-all duration-500 ease-out" 
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        
                        <button
                            onClick={() => redeemReward(reward)}
                            disabled={!canAfford}
                            className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                                canAfford 
                                    ? 'bg-stone-800 text-white hover:bg-stone-700' 
                                    : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
                            }`}
                        >
                            {canAfford ? (
                                t('reward_redeem', lang)
                            ) : (
                                <><Lock size={12} /> {t('reward_need_more', lang)} {reward.cost - state.blockBalance}</>
                            )}
                        </button>
                    </div>
                </div>
            );
        })}
        
        {/* Pro Teaser Card if limit reached */}
        {!isPro && !canAddMore && (
           <div 
              onClick={() => setSubscriptionModalOpen(true)}
              className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-sm border border-amber-200 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all group"
           >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                 <Lock size={24} className="text-amber-500" />
              </div>
              <h3 className="font-serif font-bold text-stone-800 text-lg mb-2">Pro Limit Reached</h3>
              <p className="text-stone-500 text-sm mb-4">Upgrade to create unlimited custom rewards.</p>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 underline">Unlock Pro</span>
           </div>
        )}
      </div>

      <div className="text-center pt-10 pb-6">
        <p className="text-stone-400 text-sm font-serif italic">
            "Leisure is the mother of philosophy." — Thomas Hobbes
        </p>
      </div>
    </div>
  );
};
