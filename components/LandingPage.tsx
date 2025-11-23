
import React, { useState, useEffect } from 'react';
import { Navbar } from './landing/Navbar';
import { HeroSection } from './landing/HeroSection';
import { ProblemSection } from './landing/ProblemSection';
import { SolutionSection } from './landing/SolutionSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { PhilosophySection } from './landing/PhilosophySection';
import { CTASection } from './landing/CTASection';
import { Footer } from './landing/Footer';
import { LoginModal } from './landing/LoginModal';

interface LandingPageProps {
  onLogin: (name: string, email: string, remember: boolean) => void;
  loading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, loading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-stone-900 selection:text-white font-sans overflow-x-hidden">
      <style>{`
        html { scroll-behavior: smooth; }
        
        /* Custom Scroll Reveal Classes */
        .reveal-up {
          opacity: 0;
          transform: translateY(40px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-up.active {
          opacity: 1;
          transform: translateY(0);
        }

        .draw-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          transition: stroke-dashoffset 2s ease-out;
        }
        .draw-line.active {
          stroke-dashoffset: 0;
        }

        /* Noise Texture */
        .noise-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="noise-overlay"></div>

      {modalOpen && <LoginModal onClose={() => setModalOpen(false)} onLogin={onLogin} loading={loading} />}

      <Navbar scrolled={scrolled} onOpenAuth={() => setModalOpen(true)} />
      
      <main className="relative z-10">
        <HeroSection onOpenAuth={() => setModalOpen(true)} />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <PhilosophySection />
        <CTASection onOpenAuth={() => setModalOpen(true)} />
      </main>

      <Footer />
    </div>
  );
};
