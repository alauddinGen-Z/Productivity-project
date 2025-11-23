
import React, { useEffect, useRef, useState } from 'react';

export const ProblemSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const tasks = [
    { label: "Emails", x: "10%", y: "20%", delay: 0 },
    { label: "Deadlines", x: "80%", y: "15%", delay: 100 },
    { label: "Meetings", x: "30%", y: "80%", delay: 200 },
    { label: "Notifications", x: "70%", y: "70%", delay: 300 },
    { label: "Anxiety", x: "50%", y: "50%", delay: 400 },
  ];

  return (
    <section id="problem" ref={sectionRef} className="py-32 px-6 bg-white relative overflow-hidden">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            The Problem
        </p>
        <h2 className={`text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-8 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            The Entropy of Modern Life.
        </h2>
        <p className={`text-xl text-stone-600 font-serif leading-relaxed transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Without a system, your mind is a browser with 100 tabs open. You are busy, but you are not moving forward. The drift is inevitable.
        </p>
      </div>

      {/* Floating Entropy Visuals */}
      <div className="absolute inset-0 pointer-events-none">
         {tasks.map((t, i) => (
             <div 
                key={i}
                className={`absolute px-4 py-2 bg-stone-100 border border-stone-200 text-stone-400 font-mono text-xs rounded-sm transition-all duration-[1.5s] ease-out`}
                style={{ 
                    left: t.x, 
                    top: t.y,
                    opacity: visible ? 1 : 0,
                    transform: visible ? `translate(0, 0) rotate(${Math.random() * 20 - 10}deg)` : `translate(0, 40px) rotate(0)`,
                    transitionDelay: `${t.delay}ms`
                }}
             >
                {t.label}
             </div>
         ))}
      </div>
    </section>
  );
};
