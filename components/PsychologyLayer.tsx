
import React, { useState } from 'react';
import { Flashcard, AppState } from '../types';
import { FlashcardDeck } from './FlashcardDeck';
import { FeynmanBoard } from './FeynmanBoard';
import { useSound } from '../hooks/useSound';

interface PsychologyLayerProps {
  flashcards: Flashcard[];
  updateState: (updates: Partial<AppState>) => void;
}

export const PsychologyLayer: React.FC<PsychologyLayerProps> = ({ flashcards, updateState }) => {
  const [activeTab, setActiveTab] = useState<'recall' | 'feynman'>('recall');
  const { playClick } = useSound();

  return (
    <div className="space-y-10">
      <div className="flex justify-center border-b border-stone-200">
        <button
          onClick={() => { setActiveTab('recall'); playClick(); }}
          className={`px-8 py-4 font-serif text-lg transition-colors border-b-2 ${activeTab === 'recall' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          Active Recall
        </button>
        <button
          onClick={() => { setActiveTab('feynman'); playClick(); }}
          className={`px-8 py-4 font-serif text-lg transition-colors border-b-2 ${activeTab === 'feynman' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          Feynman Technique
        </button>
      </div>

      {activeTab === 'recall' && <FlashcardDeck flashcards={flashcards} updateState={updateState} />}
      {activeTab === 'feynman' && <FeynmanBoard />}
    </div>
  );
};
