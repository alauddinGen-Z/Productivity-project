
import React, { useState } from 'react';
import { Flashcard, AppState, Settings } from '../types';
import { BookOpen, RotateCcw } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { generateId } from '../utils/helpers';
import { t } from '../utils/translations';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  updateState: (updates: Partial<AppState>) => void;
  language: Settings['language'];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ flashcards, updateState, language }) => {
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');
  const [showAnswer, setShowAnswer] = useState<string | null>(null);
  const { playClick, playSuccess, playAdd, playWhoosh } = useSound();

  const addFlashcard = () => {
    if (!newCardQ || !newCardA) return;
    playAdd();
    const newCard: Flashcard = {
      id: generateId(),
      question: newCardQ,
      answer: newCardA,
      nextReview: Date.now(),
      interval: 1,
    };
    updateState({ flashcards: [...flashcards, newCard] });
    setNewCardQ('');
    setNewCardA('');
  };

  const handleReview = (id: string, difficulty: 'easy' | 'hard') => {
    const card = flashcards.find(c => c.id === id);
    if (!card) return;

    if (difficulty === 'easy') playSuccess(); else playClick();

    const multiplier = difficulty === 'easy' ? 2 : 1;
    const newInterval = Math.max(1, card.interval * multiplier);
    const nextDate = Date.now() + (newInterval * 24 * 60 * 60 * 1000);

    const updated = flashcards.map(c => 
      c.id === id ? { ...c, interval: newInterval, nextReview: nextDate } : c
    );
    updateState({ flashcards: updated });
    setShowAnswer(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      {/* Create Card */}
      <div className="md:col-span-4 bg-white p-8 rounded-sm shadow-sm border border-stone-200 h-fit">
        <h3 className="font-serif font-bold text-stone-800 mb-6 text-xl">{t('psych_new_card', language)}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('psych_front', language)}</label>
            <input
              className="w-full p-3 bg-[#FAF9F6] border border-stone-200 mt-1 focus:border-stone-400 outline-none font-serif"
              value={newCardQ}
              onChange={e => setNewCardQ(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('psych_back', language)}</label>
            <textarea
              className="w-full p-3 bg-[#FAF9F6] border border-stone-200 mt-1 h-32 focus:border-stone-400 outline-none resize-none font-serif"
              value={newCardA}
              onChange={e => setNewCardA(e.target.value)}
            />
          </div>
          <button 
            onClick={addFlashcard}
            className="w-full bg-stone-800 text-white py-3 font-bold text-xs uppercase tracking-widest hover:bg-stone-700 transition-colors"
          >
            {t('psych_create_card', language)}
          </button>
        </div>
      </div>

      {/* Review Deck */}
      <div className="md:col-span-8 space-y-6">
        <h3 className="font-serif font-bold text-stone-800 text-xl mb-6 flex items-center gap-2">
          <RotateCcw size={20} className="text-stone-400" />
          {t('psych_due_review', language)}
        </h3>
        {flashcards.filter(c => c.nextReview < Date.now()).length === 0 ? (
          <div className="p-12 text-center bg-white rounded-sm border border-stone-200">
            <div className="inline-block p-4 rounded-full bg-[#FAF9F6] mb-4">
                <BookOpen size={32} className="text-stone-300" />
            </div>
            <p className="font-serif text-stone-500 italic">{t('psych_all_reviewed', language)}</p>
          </div>
        ) : (
          flashcards.filter(c => c.nextReview < Date.now()).map(card => (
            <div key={card.id} className="bg-[#fffdf5] p-8 rounded-sm shadow-md border border-stone-200 relative max-w-2xl mx-auto transform hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-8 left-0 w-full h-px bg-red-300/40"></div>
              <div className="absolute inset-0 pointer-events-none lined-paper opacity-10"></div>
              
              <div className="relative z-10 pt-6">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-serif font-medium text-stone-800">{card.question}</h4>
                </div>
                
                {showAnswer === card.id ? (
                  <div className="animate-fade-in border-t border-blue-200/40 pt-6">
                    <div className="font-serif text-stone-700 text-lg leading-relaxed mb-8 text-center">
                      {card.answer}
                    </div>
                    <div className="flex gap-4 justify-center">
                      <button 
                        onClick={() => handleReview(card.id, 'hard')}
                        className="px-6 py-2 border border-stone-300 text-stone-600 hover:border-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest"
                      >
                        {t('psych_reset', language)}
                      </button>
                      <button 
                        onClick={() => handleReview(card.id, 'easy')}
                        className="px-6 py-2 bg-stone-800 text-white hover:bg-stone-700 text-xs font-bold uppercase tracking-widest"
                      >
                        {t('psych_mastered', language)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button 
                      onClick={() => { setShowAnswer(card.id); playWhoosh(); }}
                      className="text-stone-400 hover:text-stone-600 text-sm font-serif italic border-b border-stone-300 pb-1"
                    >
                      {t('psych_flip', language)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
