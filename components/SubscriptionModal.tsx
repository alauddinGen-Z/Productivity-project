
import React, { useState } from 'react';
import { X, Check, Star, Shield, Zap, Infinity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSound } from '../hooks/useSound';

export const SubscriptionModal: React.FC = () => {
  const { setSubscriptionModalOpen, upgradeToPro } = useApp();
  const { playSuccess, playClick, playAdd } = useSound();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpgrade = () => {
    playClick();
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      playSuccess();
      
      // Close modal after success animation
      setTimeout(() => {
        upgradeToPro();
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    playClick();
    setSubscriptionModalOpen(false);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c0a09]/90 backdrop-blur-md p-4">
         <div className="bg-white p-12 rounded-sm shadow-2xl text-center max-w-md w-full animate-fade-in relative overflow-hidden">
             <div className="absolute inset-0 pointer-events-none">
                 {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute animate-[float_3s_ease-out_forwards]" 
                         style={{
                             left: `${Math.random() * 100}%`,
                             top: '100%',
                             animationDelay: `${Math.random() * 0.5}s`,
                             backgroundColor: ['#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 3)],
                             width: '8px', height: '8px', borderRadius: '50%'
                         }}
                    />
                 ))}
             </div>
             
             <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Star size={48} className="text-amber-500 fill-amber-500 animate-pulse" />
             </div>
             <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Welcome to Pro.</h2>
             <p className="text-stone-500 font-serif">Your mind is now fully architected.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c0a09]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in relative my-auto">
         <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-stone-400 hover:text-stone-800"
         >
            <X size={20} />
         </button>

         {/* Left: Value Prop */}
         <div className="md:w-5/12 bg-[#1c1917] text-white p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-purple-600"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-6 text-amber-400">
                    <Star size={10} className="fill-amber-400" />
                    Intentional Pro
                </div>
                <h2 className="text-4xl font-serif font-bold mb-6 leading-tight">Unlock the Full Architecture.</h2>
                <p className="text-stone-400 font-serif leading-relaxed">
                    Stop compromising your system. Gain the advanced tools needed to master your time and energy.
                </p>
            </div>

            <div className="relative z-10 mt-12 space-y-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-stone-800 flex items-center justify-center shrink-0 border border-stone-700">
                        <Zap size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-1">Deep Analytics</h4>
                        <p className="text-xs text-stone-500">Visualize your energy allocation and schedule adherence.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-stone-800 flex items-center justify-center shrink-0 border border-stone-700">
                        <Infinity size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-1">Unlimited Rewards</h4>
                        <p className="text-xs text-stone-500">Create infinite custom incentives to gamify your life.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-stone-800 flex items-center justify-center shrink-0 border border-stone-700">
                        <Shield size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-1">Priority Sync</h4>
                        <p className="text-xs text-stone-500">Faster data synchronization and priority support.</p>
                    </div>
                </div>
            </div>
         </div>

         {/* Right: Checkout */}
         <div className="md:w-7/12 bg-white p-10 flex flex-col">
            <div className="text-center mb-10">
                <h3 className="text-lg font-bold uppercase tracking-widest text-stone-400 mb-4">Choose Your Path</h3>
                <div className="flex items-center justify-center gap-4">
                    <div className="text-stone-400 font-serif line-through decoration-red-400 decoration-2 text-xl">$15/mo</div>
                    <div className="text-5xl font-serif font-bold text-stone-900">$9<span className="text-lg text-stone-500 font-normal">/mo</span></div>
                </div>
                <div className="mt-2 text-xs text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 inline-block px-2 py-1 rounded">Launch Offer • Save 40%</div>
            </div>

            <div className="flex-1 space-y-4 max-w-xs mx-auto w-full">
                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-sm bg-stone-50 opacity-50 grayscale">
                    <span className="font-bold text-stone-600">Free Tier</span>
                    <span className="text-stone-400">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 border-2 border-stone-900 rounded-sm bg-white relative shadow-lg">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-bold uppercase px-3 py-1 tracking-widest">Recommended</div>
                    <div className="flex items-center gap-3">
                         <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                             <Check size={12} className="text-amber-600" />
                         </div>
                         <span className="font-bold text-stone-900">Pro Tier</span>
                    </div>
                    <span className="font-bold text-stone-900">$9/mo</span>
                </div>
            </div>

            <div className="mt-10">
                <button
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="w-full bg-stone-900 text-white py-4 font-bold text-xs uppercase tracking-[0.2em] hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {isProcessing ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>
                            Upgrade Now
                            <Zap size={16} className="text-amber-400 group-hover:fill-amber-400 transition-all" />
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] text-stone-400 mt-4">
                    Secure payment powered by Intentional Systems Inc. <br/>
                    Cancel anytime. No questions asked.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};
