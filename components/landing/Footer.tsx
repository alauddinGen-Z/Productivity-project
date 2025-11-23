
import React from 'react';
import { Feather } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c1917] border-t border-stone-800 text-stone-500 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 text-stone-300">
           <Feather size={16} />
           <span className="font-serif font-bold">The Intentional System</span>
        </div>
        
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
           <a href="#" className="hover:text-white transition-colors">Manifesto</a>
           <a href="#" className="hover:text-white transition-colors">Usage</a>
           <a href="#" className="hover:text-white transition-colors">Login</a>
        </div>

        <div className="text-xs font-mono opacity-50">
           © {new Date().getFullYear()} System V2.0
        </div>
      </div>
    </footer>
  );
};
