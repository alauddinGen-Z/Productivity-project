
import React, { useState } from 'react';
import { Box, Coffee, Gamepad2, Youtube, Music, Sun, Moon, ShoppingBag, Lock, Plus, X, Trash2, Gift, CheckCircle } from 'lucide-react';
import { AppState, RewardItem } from '../types';

interface RewardShopProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'yt-1', title: 'Watch 1 YouTube Video', cost: 3, icon: 'Youtube', description: 'Guilt-free entertainment.' },
  { id: 'gm-1', title: '15 Min Game Session', cost: 5, icon: 'Gamepad2', description: 'Quick level up.' },
  { id: 'cf-1', title: 'Special Coffee/Tea Break', cost: 2, icon: 'Coffee', description: 'Brew something nice.' },
  { id: 'ms-1', title: 'Listen to 3 Songs', cost: 1, icon: 'Music', description: 'Musical recharge.' },
  { id: 'wk-1', title: 'Go for a Walk (No Phone)', cost: 4, icon: 'Sun', description: 'Touch grass.' },
  { id: 'nap-1', title: '20 Min Power Nap', cost: 6, icon: 'Moon', description: 'Reset your brain.' },
];

const AVAILABLE_ICONS = [
  'Box', 'Coffee', 'Gamepad2', 'Youtube', 'Music', 'Sun', 'Moon', 'ShoppingBag', 'Gift'
];

export const RewardShop: React.FC<RewardShopProps> = ({ state, updateState }) => {
  const [redeemedId, setRedeemedId] = useState<string | null>(null);
  
  // Custom Reward Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(1);
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('Gift');

  const allRewards = [...DEFAULT_REWARDS, ...state.customRewards];

  const redeemReward = (reward: RewardItem) => {
    if (state.blockBalance >= reward.cost) {
      updateState({ blockBalance: state.blockBalance - reward.cost });
      setRedeemedId(reward.id);
      setTimeout(() => setRedeemedId(null), 2500); // 2.5s display for the success message
    }
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: RewardItem = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      cost: Math.max(1, newCost),
      icon: newIcon,
      description: newDesc
    };

    updateState({ customRewards: [...state.customRewards, newItem] });
    
    // Reset Form
    setIsCreating(false);
    setNewTitle('');
    setNewCost(1);
    setNewDesc('');
    setNewIcon('Gift');
  };

  const handleDeleteReward = (id: string) => {
    if (confirm('Delete this custom reward?')) {
      updateState({ customRewards: state.customRewards.filter(r => r.id !== id) });
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
        
      {/* Header / Wallet */}
      <div className="bg-[#2c2a26] text-stone-200 p-8 rounded-sm shadow-md border-t-4 border-emerald-600 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-serif mb-2 text-stone-50">Rest & Reward</h1>
          <p className="text-stone-400 font-light italic">"Work hard, recover intentionally."</p>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-stone-800/50 p-4 rounded-sm border border-stone-700">
           <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-stone-400">Available Balance</div>
              <div className="text-3xl font-mono font-bold text-emerald-400">{state.blockBalance} Blocks</div>
           </div>
           <Box size={40} className="text-emerald-500" />
        </div>
        
        {/* Decorative BG */}
        <div className="absolute -right-10 -bottom-10 text-stone-800 opacity-20 transform rotate-12">
            <ShoppingBag size={200} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} /> Create Custom Reward
        </button>
      </div>

      {/* Creation Modal/Overlay */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-xl border border-stone-200 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif font-bold text-xl text-stone-800">New Custom Reward</h3>
                <button onClick={() => setIsCreating(false)} className="text-stone-400 hover:text-stone-600">
                   <X size={20} />
                </button>
             </div>
             
             <form onSubmit={handleCreateReward} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Title</label>
                  <input 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Buy a new book"
                    className="w-full p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none font-serif"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Cost (Blocks)</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={newCost}
                    onChange={e => setNewCost(parseInt(e.target.value))}
                    className="w-full p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Description (Optional)</label>
                  <input 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Short motivation..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 focus:border-stone-800 outline-none font-serif text-sm"
                  />
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Icon</label>
                   <div className="flex gap-2 flex-wrap">
                      {AVAILABLE_ICONS.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewIcon(icon)}
                          className={`p-2 rounded border transition-all ${newIcon === icon ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 hover:border-stone-400 text-stone-500'}`}
                        >
                          {renderIcon(icon, 18)}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-4 flex gap-2">
                   <button 
                     type="button" 
                     onClick={() => setIsCreating(false)}
                     className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-100"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 py-3 bg-stone-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-stone-700"
                   >
                     Create Reward
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Shop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allRewards.map(reward => {
            const canAfford = state.blockBalance >= reward.cost;
            const isRedeemed = redeemedId === reward.id;
            const isCustom = reward.id.startsWith('custom-');
            
            // Calculate progress percentage
            const progressPercent = Math.min(100, Math.round((state.blockBalance / reward.cost) * 100));

            return (
                <div 
                    key={reward.id} 
                    className={`bg-white p-6 rounded-sm border transition-all duration-300 relative group overflow-hidden flex flex-col ${
                        canAfford ? 'border-stone-200 hover:border-emerald-400 hover:shadow-md' : 'border-stone-100 opacity-80'
                    }`}
                >
                    {/* Success Overlay */}
                    {isRedeemed && (
                        <div className="absolute inset-0 z-20 bg-emerald-50/95 flex flex-col items-center justify-center animate-fade-in p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 animate-fade-slide">
                                <CheckCircle size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="text-emerald-800 font-serif font-bold text-lg mb-1">Reward Claimed!</h3>
                            <p className="text-emerald-600 text-xs font-serif italic">Enjoy your hard-earned break.</p>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-full ${canAfford ? 'bg-stone-50 text-stone-700' : 'bg-stone-100 text-stone-300'}`}>
                            {renderIcon(reward.icon, 24)}
                        </div>
                        <div className="flex items-center gap-2">
                           {isCustom && (
                             <button 
                               onClick={() => handleDeleteReward(reward.id)}
                               className="text-stone-300 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                               title="Delete Reward"
                             >
                               <Trash2 size={14} />
                             </button>
                           )}
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
                                    <span>Progress</span>
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
                                'Redeem Reward'
                            ) : (
                                <><Lock size={12} /> Need {reward.cost - state.blockBalance} more</>
                            )}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="text-center pt-10 pb-6">
        <p className="text-stone-400 text-sm font-serif italic">
            "Leisure is the mother of philosophy." — Thomas Hobbes
        </p>
      </div>
    </div>
  );
};
