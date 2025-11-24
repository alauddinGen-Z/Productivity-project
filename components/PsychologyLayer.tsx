
import React, { useState } from 'react';
import { AppState, Settings } from '../types';
import { FlashcardDeck } from './FlashcardDeck';
import { FeynmanBoard } from './FeynmanBoard';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';

interface PsychologyLayerProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  language?: Settings['language'];
}

export const PsychologyLayer: React.FC<PsychologyLayerProps> = ({ state, updateState, language = 'en' }) => {
  const [activeTab, setActiveTab] = useState<'recall' | 'feynman'>('recall');
  const { playClick } = useSound();

  return (
    <div className="space-y-10">
      <div className="flex justify-center border-b border-stone-200">
        <button
          onClick={() => { setActiveTab('recall'); playClick(); }}
          className={`px-8 py-4 font-serif text-lg transition-colors border-b-2 ${activeTab === 'recall' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          {t('psych_tab_recall', language)}
        </button>
        <button
          onClick={() => { setActiveTab('feynman'); playClick(); }}
          className={`px-8 py-4 font-serif text-lg transition-colors border-b-2 ${activeTab === 'feynman' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          {t('psych_tab_feynman', language)}
        </button>
      </div>

      {activeTab === 'recall' && <FlashcardDeck flashcards={state.flashcards} updateState={updateState} language={language} />}
      {activeTab === 'feynman' && <FeynmanBoard language={language} />}
    </div>
  );
};
