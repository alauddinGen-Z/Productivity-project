
import React from 'react';
import { Feather } from 'lucide-react';

interface NavbarProps {
  scrolled: boolean;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled, onOpenAuth }) => {
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-5 transition-all duration-500 ${
        scrolled ? 'bg-[#FAF9F6]/80 backdrop-blur-md border-b border-stone-200' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-stone-900 text-white flex items-center justify-center rounded-sm transition-transform group-hover:rotate-90 duration-500">
            <Feather size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg leading-none tracking-tight">INTENTIONAL</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">System</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-widest text-stone-500">
            <a href="#problem" className="hover:text-stone-900 transition-colors">The Problem</a>
            <a href="#solution" className="hover:text-stone-900 transition-colors">The System</a>
            <a href="#philosophy" className="hover:text-stone-900 transition-colors">Philosophy</a>
          </div>
          <button 
            onClick={onOpenAuth}
            className="text-xs font-bold uppercase tracking-widest border border-stone-900 px-6 py-3 hover:bg-stone-900 hover:text-white transition-all duration-300"
          >
            Access
          </button>
        </div>
      </div>
    </nav>
  );
};
