
import React, { useRef, useState, useEffect } from 'react';
import { LayoutGrid, List, Filter, ArrowUpDown, CheckSquare, Square } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface TaskToolbarProps {
  activeView: 'matrix' | 'ivylee';
  setActiveView: (view: 'matrix' | 'ivylee') => void;
  selectedTags: string[];
  toggleTagFilter: (tag: string) => void;
  clearTags: () => void;
  uniqueTags: string[];
  sortBy: 'NEWEST' | 'OLDEST' | 'AZ' | 'ZA' | 'PRIORITY';
  setSortBy: (sort: 'NEWEST' | 'OLDEST' | 'AZ' | 'ZA' | 'PRIORITY') => void;
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
  const tagMenuRef = useRef<HTMLDivElement>(null);
  const { playClick } = useSound();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(event.target as Node)) {
        setIsTagMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {activeView === 'matrix' && (
        <div className="flex items-center gap-4">
          {/* Tag Filter */}
          <div className="relative" ref={tagMenuRef}>
            <button 
              onClick={() => { setIsTagMenuOpen(!isTagMenuOpen); playClick(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors ${selectedTags.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-stone-50 border-stone-100 text-stone-500 hover:border-stone-300'}`}
            >
              <Filter size={12} />
              <span className="text-xs font-serif font-medium">
                  {selectedTags.length > 0 ? `Tags (${selectedTags.length})` : 'Filter Tags'}
              </span>
            </button>

            {isTagMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-stone-200 shadow-xl rounded-sm z-50 animate-fade-in">
                <div className="p-3 border-b border-stone-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Available Tags</span>
                  {selectedTags.length > 0 && (
                    <button onClick={clearTags} className="text-[10px] text-red-400 hover:text-red-600">Clear</button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {uniqueTags.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 italic">No tags created yet</div>
                  ) : (
                    uniqueTags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <div 
                          key={tag} 
                          onClick={() => toggleTagFilter(tag)}
                          className={`flex items-center gap-3 px-2 py-2 cursor-pointer rounded-sm hover:bg-stone-50 transition-colors ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}
                        >
                          <div className={`text-stone-400 ${isSelected ? 'text-stone-800' : ''}`}>
                            {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          </div>
                          <span className="text-sm font-serif truncate">#{tag}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 group cursor-pointer bg-stone-50 px-3 py-1.5 rounded-sm border border-stone-100 hover:border-stone-300 transition-colors">
            <ArrowUpDown size={12} className="text-stone-400 group-hover:text-stone-600" />
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-serif text-stone-600 focus:outline-none cursor-pointer hover:text-stone-800 appearance-none pr-2"
              >
                <option value="NEWEST">Newest</option>
                <option value="OLDEST">Oldest</option>
                <option value="PRIORITY">Priority</option>
                <option value="AZ">Name (A-Z)</option>
                <option value="ZA">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
