
import { useCallback } from 'react';

// Shared AudioContext to prevent browser limit errors and manage state globally
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      sharedAudioCtx = new Ctx();
    }
  }
  return sharedAudioCtx;
};

const isSoundEnabled = () => {
  try {
    const stored = localStorage.getItem('intentional_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.soundEnabled !== false;
    }
    return true;
  } catch (e) {
    return true;
  }
};

export const useSound = () => {
  // Helper to ensure context is running
  const resumeContext = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        // Resume might fail if not triggered by user gesture, which is expected behavior
      }
    }
    return ctx;
  }, []);

  const playTone = useCallback(async (freq: number, type: 'sine' | 'triangle' | 'square', duration: number, volume: number = 0.1) => {
    if (!isSoundEnabled()) return;

    try {
      const ctx = await resumeContext();
      if (!ctx) return;
      
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
      // Ignore audio errors
    }
  }, [resumeContext]);

  const playClick = useCallback(() => {
    playTone(800, 'triangle', 0.05, 0.05);
  }, [playTone]);

  const playSoftClick = useCallback(() => {
    playTone(600, 'sine', 0.05, 0.03);
  }, [playTone]);

  const playSuccess = useCallback(async () => {
    if (!isSoundEnabled()) return;
    try {
      const ctx = await resumeContext();
      if (!ctx) return;
      
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
  }, [resumeContext]);

  const playAdd = useCallback(() => {
    playTone(400, 'sine', 0.1, 0.1);
  }, [playTone]);

  const playDelete = useCallback(async () => {
    if (!isSoundEnabled()) return;
    try {
      const ctx = await resumeContext();
      if (!ctx) return;
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
  }, [resumeContext]);

  const playWhoosh = useCallback(async () => {
    if (!isSoundEnabled()) return;
    try {
      const ctx = await resumeContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
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
  }, [resumeContext]);

  return { playClick, playSoftClick, playSuccess, playAdd, playDelete, playWhoosh };
};
