import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';
import { t } from '../utils/translations';
import { useApp } from '../context/AppContext';

export const FeynmanBoard: React.FC = () => {
  const { state } = useApp();
  const language = state.settings.language;
  
  const [feynmanConcept, setFeynmanConcept] = useState('');
  const [feynmanExplanation, setFeynmanExplanation] = useState('');
  const { playSoftClick } = useSound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-10 rounded-sm shadow-sm border border-stone-200">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-3">{t('psych_feynman_title', language)}</h2>
          <p className="text-stone-500 font-serif italic">{t('psych_feynman_quote', language)}</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{t('psych_concept', language)}</label>
            <input 
              type="text" 
              className="w-full p-4 bg-[#FAF9F6] border border-stone-200 text-xl font-serif focus:border-stone-800 outline-none"
              placeholder="..."
              value={feynmanConcept}
              onChange={(e) => setFeynmanConcept(e.target.value)}
              onFocus={() => playSoftClick()}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{t('psych_explain', language)}</label>
            <textarea 
              className="w-full p-4 h-64 bg-[#FAF9F6] border border-stone-200 focus:border-stone-800 outline-none resize-none font-serif leading-relaxed text-lg text-stone-700"
              placeholder={t('psych_explain_placeholder', language)}
              value={feynmanExplanation}
              onChange={(e) => setFeynmanExplanation(e.target.value)}
              onFocus={() => playSoftClick()}
            />
          </div>
          
          <div className="flex justify-end">
              <div className="text-xs text-stone-400 italic font-serif">
                  Self-reflection is the highest form of critique.
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};