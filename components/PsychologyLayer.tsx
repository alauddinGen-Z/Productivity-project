import React, { useState } from 'react';
import { Flashcard, AppState } from '../types';
import { analyzeFeynman } from '../services/geminiService';
import { Brain, MessageSquare, Loader2, BookOpen, RotateCcw } from 'lucide-react';

interface PsychologyLayerProps {
  flashcards: Flashcard[];
  updateState: (updates: Partial<AppState>) => void;
}

export const PsychologyLayer: React.FC<PsychologyLayerProps> = ({ flashcards, updateState }) => {
  const [activeTab, setActiveTab] = useState<'recall' | 'feynman'>('recall');

  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');
  const [showAnswer, setShowAnswer] = useState<string | null>(null);

  const [feynmanConcept, setFeynmanConcept] = useState('');
  const [feynmanExplanation, setFeynmanExplanation] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addFlashcard = () => {
    if (!newCardQ || !newCardA) return;
    const newCard: Flashcard = {
      id: Date.now().toString(),
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

    const multiplier = difficulty === 'easy' ? 2 : 1;
    const newInterval = Math.max(1, card.interval * multiplier);
    const nextDate = Date.now() + (newInterval * 24 * 60 * 60 * 1000);

    const updated = flashcards.map(c => 
      c.id === id ? { ...c, interval: newInterval, nextReview: nextDate } : c
    );
    updateState({ flashcards: updated });
    setShowAnswer(null);
  };

  const handleFeynmanSubmit = async () => {
    if (!feynmanExplanation) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeFeynman(feynmanConcept, feynmanExplanation);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-center border-b border-stone-200">
        <button
          onClick={() => setActiveTab('recall')}
          className={`px-8 py-4 font-serif text-lg transition-colors border-b-2 ${activeTab === 'recall' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          Active Recall
        </button>
        <button
          onClick={() => setActiveTab('feynman')}
          className={`px-8 py-4 font-serif text-lg transition-colors border-b-2 ${activeTab === 'feynman' ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          Feynman Technique
        </button>
      </div>

      {activeTab === 'recall' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Create Card */}
          <div className="md:col-span-4 bg-white p-8 rounded-sm shadow-sm border border-stone-200 h-fit">
            <h3 className="font-serif font-bold text-stone-800 mb-6 text-xl">New Card</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Front</label>
                <input
                  className="w-full p-3 bg-[#FAF9F6] border border-stone-200 mt-1 focus:border-stone-400 outline-none font-serif"
                  value={newCardQ}
                  onChange={e => setNewCardQ(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Back</label>
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
                Create Card
              </button>
            </div>
          </div>

          {/* Review Deck */}
          <div className="md:col-span-8 space-y-6">
            <h3 className="font-serif font-bold text-stone-800 text-xl mb-6 flex items-center gap-2">
              <RotateCcw size={20} className="text-stone-400" />
              Due for Review
            </h3>
            {flashcards.filter(c => c.nextReview < Date.now()).length === 0 ? (
              <div className="p-12 text-center bg-white rounded-sm border border-stone-200">
                <div className="inline-block p-4 rounded-full bg-[#FAF9F6] mb-4">
                   <BookOpen size={32} className="text-stone-300" />
                </div>
                <p className="font-serif text-stone-500 italic">You've reviewed everything for now.</p>
              </div>
            ) : (
              flashcards.filter(c => c.nextReview < Date.now()).map(card => (
                <div key={card.id} className="bg-[#fffdf5] p-8 rounded-sm shadow-md border border-stone-200 relative max-w-2xl mx-auto transform hover:-translate-y-1 transition-transform duration-300">
                  {/* Index card lines */}
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
                            Reset
                          </button>
                          <button 
                            onClick={() => handleReview(card.id, 'easy')}
                            className="px-6 py-2 bg-stone-800 text-white hover:bg-stone-700 text-xs font-bold uppercase tracking-widest"
                          >
                            Mastered
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <button 
                          onClick={() => setShowAnswer(card.id)}
                          className="text-stone-400 hover:text-stone-600 text-sm font-serif italic border-b border-stone-300 pb-1"
                        >
                          Flip Card
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'feynman' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-10 rounded-sm shadow-sm border border-stone-200">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-serif font-bold text-stone-800 mb-3">The Feynman Technique</h2>
              <p className="text-stone-500 font-serif italic">"If you can't explain it simply, you don't understand it well enough."</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Concept</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-[#FAF9F6] border border-stone-200 text-xl font-serif focus:border-stone-400 outline-none"
                  placeholder="Quantum Entanglement..."
                  value={feynmanConcept}
                  onChange={(e) => setFeynmanConcept(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Simple Explanation</label>
                <textarea 
                  className="w-full p-4 h-64 bg-[#FAF9F6] border border-stone-200 focus:border-stone-400 outline-none resize-none font-serif leading-relaxed text-lg text-stone-700"
                  placeholder="Imagine you are teaching a child..."
                  value={feynmanExplanation}
                  onChange={(e) => setFeynmanExplanation(e.target.value)}
                />
              </div>
              
              <button 
                onClick={handleFeynmanSubmit}
                disabled={isAnalyzing || !feynmanExplanation}
                className="w-full bg-stone-800 text-white py-4 font-bold text-sm uppercase tracking-widest hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
                Critique My Explanation
              </button>
            </div>

            {aiAnalysis && (
              <div className="mt-10 p-8 bg-[#F5F2EB] border border-stone-200 animate-fade-in relative">
                <div className="absolute -top-3 -left-3 bg-stone-800 text-white p-2 shadow-sm">
                   <Brain size={20} />
                </div>
                <h4 className="font-serif font-bold text-stone-800 text-lg mb-4 ml-4">Tutor Feedback</h4>
                <div className="prose prose-stone text-stone-700 font-serif leading-loose whitespace-pre-line">
                  {aiAnalysis}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};