import React, { useRef, useState, useEffect } from 'react';
import { LayoutGrid, List, Filter, ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { SortOption } from './TaskMatrix';

interface TaskToolbarProps {
  activeView: 'matrix' | 'ivylee';
  setActiveView: (view: 'matrix' | 'ivylee') => void;
  selectedTags: string[];
  toggleTagFilter: (tag: string) => void;
  clearTags: () => void;
  uniqueTags: string[];
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  activeView,
  setActiveView,
  selectedTags,
  toggleTagFilter,
  clearTags,
  uniqueTags,
  sortBy,
  setSortBy
}) => {
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const tagMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const { playClick } = useSound();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(event.target as Node)) {
        setIsTagMenuOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'PRIORITY', label: 'Priority (Frogs First)' },
    { value: 'NEWEST', label: 'Newest First' },
    { value: 'OLDEST', label: 'Oldest First' },
    { value: 'BLOCKS_DESC', label: 'Effort (High to Low)' },
    { value: 'BLOCKS_ASC', label: 'Effort (Low to High)' },
    { value: 'AZ', label: 'Title (A-Z)' },
    { value: 'ZA', label: 'Title (Z-A)' },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-stone-200">
      <div className="flex items-center gap-6">
        <button
          onClick={() => { setActiveView('matrix'); playClick(); }}
          className={`flex items-center gap-2 text-sm font-serif transition-colors ${activeView === 'matrix' ? 'text-stone-800 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <LayoutGrid size={16} />
          Eisenhower Matrix
        </button>
        <button
          onClick={() => { setActiveView('ivylee'); playClick(); }}
          className={`flex items-center gap-2 text-sm font-serif transition-colors ${activeView === 'ivylee' ? 'text-stone-800 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <List size={16} />
          Ivy Lee Method
        </button>
      </div>

      <div className="flex items-center gap-4">
          {/* Sort Menu */}
          <div className="relative" ref={sortMenuRef}>
             <button
                onClick={() => { setIsSortMenuOpen(!isSortMenuOpen); playClick(); }}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-800 transition-colors"
             >
                <ArrowUpDown size={14} />
                <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown size={10} />
             </button>

             {isSortMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200 shadow-xl rounded-sm z-20 animate-fade-in">
                   <div className="py-1">
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setIsSortMenuOpen(false); playClick(); }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between hover:bg-stone-50 ${sortBy === option.value ? 'text-amber-600' : 'text-stone-500'}`}
                        >
                           {option.label}
                           {sortBy === option.value && <Check size={12} />}
                        </button>
                      ))}
                   </div>
                </div>
             )}
          </div>

          <div className="h-4 w-px bg-stone-200"></div>

          {/* Tag Filter */}
          <div className="relative" ref={tagMenuRef}>
            <button
              onClick={() => { setIsTagMenuOpen(!isTagMenuOpen); playClick(); }}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${selectedTags.length > 0 ? 'text-amber-600' : 'text-stone-500 hover:text-stone-800'}`}
            >
              <Filter size={14} />
              <span>Filter {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}</span>
            </button>
            
            {isTagMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200 shadow-xl rounded-sm z-20 animate-fade-in p-2">
                <div className="mb-2 pb-2 border-b border-stone-100 flex justify-between items-center px-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Tags</span>
                    {selectedTags.length > 0 && (
                        <button onClick={() => { clearTags(); playClick(); }} className="text-[10px] text-red-400 hover:text-red-600">Clear</button>
                    )}
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                   {uniqueTags.length === 0 ? (
                       <div className="px-2 py-2 text-xs text-stone-400 italic">No tags found</div>
                   ) : (
                       uniqueTags.map(tag => (
                           <button
                             key={tag}
                             onClick={() => toggleTagFilter(tag)}
                             className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-stone-50 rounded-sm text-left group"
                           >
                             <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${selectedTags.includes(tag) ? 'bg-stone-800 border-stone-800' : 'border-stone-300'}`}>
                                {selectedTags.includes(tag) && <Check size={8} className="text-white" />}
                             </div>
                             <span className={`text-xs ${selectedTags.includes(tag) ? 'text-stone-800 font-bold' : 'text-stone-500'}`}>#{tag}</span>
                           </button>
                       ))
                   )}
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};