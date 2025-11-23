
import React, { useState } from 'react';
import { Feather, Check, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, email: string, remember: boolean) => void;
  loading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading }) => {
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
