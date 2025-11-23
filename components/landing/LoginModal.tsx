
import React, { useState } from 'react';
import { X, Feather, CheckSquare, Loader2, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (name: string, email: string, remember: boolean) => void;
  loading: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, loading }) => {
  const [loginForm, setLoginForm] = useState({ name: '', email: '', remember: true });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name && loginForm.email) {
      onLogin(loginForm.name, loginForm.email, loginForm.remember);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-[#0c0a09]/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
       
       <div className="bg-white w-full max-w-md p-12 rounded-sm shadow-2xl relative animate-fade-in flex flex-col items-center">
          <button onClick={onClose} className="absolute top-6 right-6 text-stone-300 hover:text-stone-800 transition-colors">
             <X size={20} />
          </button>
          
          <div className="mb-10 text-center">
             <Feather size={32} className="mx-auto text-stone-800 mb-4" />
             <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Access The System</h2>
             <div className="h-1 w-8 bg-amber-500 mx-auto mt-4 mb-2"></div>
             <p className="text-stone-400 text-sm">Synchronize your intentionality.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="w-full space-y-6">
             <div className="group">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 group-focus-within:text-amber-600 transition-colors">Identity</label>
                <input 
                   required
                   autoFocus
                   value={loginForm.name}
                   onChange={e => setLoginForm({...loginForm, name: e.target.value})}
                   className="w-full py-3 bg-transparent border-b border-stone-200 focus:border-stone-800 outline-none font-serif text-xl placeholder:text-stone-200 transition-colors"
                   placeholder="Your Name"
                />
             </div>
             <div className="group">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 group-focus-within:text-amber-600 transition-colors">Coordinates</label>
                <input 
                   required
                   type="email"
                   value={loginForm.email}
                   onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                   className="w-full py-3 bg-transparent border-b border-stone-200 focus:border-stone-800 outline-none font-serif text-xl placeholder:text-stone-200 transition-colors"
                   placeholder="Email Address"
                />
             </div>
             
             <div 
               className="flex items-center gap-3 cursor-pointer group py-2"
               onClick={() => setLoginForm(prev => ({ ...prev, remember: !prev.remember }))}
             >
               <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-all ${loginForm.remember ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-300 group-hover:border-stone-400'}`}>
                 {loginForm.remember && <CheckSquare size={10} />}
               </div>
               <span className="text-xs font-bold text-stone-400 uppercase tracking-wider select-none">Remember Device</span>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-stone-900 text-white h-14 font-bold text-xs uppercase tracking-[0.2em] hover:bg-amber-600 transition-all mt-6 flex items-center justify-center gap-4 group"
             >
                {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                        <span>Initialize</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
             </button>
          </form>
       </div>
    </div>
  );
};
