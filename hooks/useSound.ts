
import { useCallback } from 'react';

// Helper to check if sound is enabled globally
const isSoundEnabled = () => {
  try {
    const stored = localStorage.getItem('intentional_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.soundEnabled !== false; // Default to true
    }
    return true;
  } catch (e) {
    return true;
  }
};

export const useSound = () => {
  const playTone = useCallback((freq: number, type: 'sine' | 'triangle' | 'square', duration: number, volume: number = 0.1) => {
    if (!isSoundEnabled()) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors (browsers might block autoplay)
    }
  }, []);

  const playClick = useCallback(() => {
    // Sharp, short tick for UI interactions
    playTone(800, 'triangle', 0.05, 0.05);
  }, [playTone]);

  const playSoftClick = useCallback(() => {
    // Softer tick for typing or hover
    playTone(600, 'sine', 0.05, 0.03);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (!isSoundEnabled()) return;
    // Ascending major triad
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => { // C Major
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (i * 0.1));
        gain.gain.setValueAtTime(0.05, now + (i * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.1) + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + (i * 0.1));
        osc.stop(now + (i * 0.1) + 0.5);
      });
    } catch (e) {}
  }, []);

  const playAdd = useCallback(() => {
    // "Pop" sound
    playTone(400, 'sine', 0.1, 0.1);
  }, [playTone]);

  const playDelete = useCallback(() => {
    if (!isSoundEnabled()) return;
    // Descending slide
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }, []);

  const playWhoosh = useCallback(() => {
    if (!isSoundEnabled()) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // White noise approximation using oscillation for simplicity
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }, []);

  return { playClick, playSoftClick, playSuccess, playAdd, playDelete, playWhoosh };
};
