
import React, { useState, useEffect, useRef } from 'react';

const QUOTES = [
  "Discipline is freedom.",
  "Focus on the process, not the outcome.",
  "What you do today determines who you become.",
  "Simplify. Eliminate. Focus.",
  "The obstacle is the way.",
  "Action cures fear.",
  "Be the architect of your time."
];

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'scaling'>('typing');
  
  // Ref to ensure onComplete is accessible inside effect without triggering re-runs
  const onCompleteRef = useRef(onComplete);
  const hasRunRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    let currentIndex = 0;
    const typeSpeed = 50; 
    
    // Typing Loop
    const interval = setInterval(() => {
      if (currentIndex <= quote.length) {
        setText(quote.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setPhase('waiting');
        
        // Wait then Scale
        setTimeout(() => {
          setPhase('scaling');
          // End
          setTimeout(() => {
            if (onCompleteRef.current) {
                onCompleteRef.current();
            }
          }, 800);
        }, 1000);
      }
    }, typeSpeed);

    return () => clearInterval(interval);
  }, [quote]); // Run once per quote selection

  if (phase === 'scaling') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex items-center justify-center transition-all duration-700 opacity-0 transform scale-150 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-800">{text}</h1>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex items-center justify-center">
      <h1 className="text-2xl md:text-4xl font-serif text-stone-800 font-medium tracking-wide">
        {text}
        <span className="animate-pulse border-r-2 border-stone-800 ml-1 h-8 inline-block align-middle">&nbsp;</span>
      </h1>
    </div>
  );
};
