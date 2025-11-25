
import { useCallback } from 'react';

// Shared AudioContext to prevent browser limit errors and manage state globally across component re-renders.
let sharedAudioCtx: AudioContext | null = null;

/**
 * Lazily initializes and retrieves the shared AudioContext.
 * @returns {AudioContext | null} The active AudioContext or null if not supported.
 */
const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      sharedAudioCtx = new Ctx();
    }
  }
  return sharedAudioCtx;
};

/**
 * Checks if sound effects are enabled in user settings via local storage.
 * @returns {boolean} True if sound is enabled or not set.
 */
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

/**
 * Custom hook for playing synthesized sound effects using the Web Audio API.
 * Provides methods for interaction feedback (clicks, success, notifications).
 */
export const useSound = () => {
  
  /**
   * Resumes the AudioContext if it is in a suspended state (common browser policy requirement).
   */
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

  /**
   * Generates and plays a synthesized tone.
   * 
   * @param {number} freq - The frequency of the tone in Hertz.
   * @param {'sine' | 'triangle' | 'square'} type - The oscillator waveform type.
   * @param {number} duration - The duration of the tone in seconds.
   * @param {number} [volume=0.1] - The volume gain (0.0 to 1.0).
   */
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

  /** Plays a standard click sound. */
  const playClick = useCallback(() => {
    playTone(800, 'triangle', 0.05, 0.05);
  }, [playTone]);

  /** Plays a softer, subtler click sound. */
  const playSoftClick = useCallback(() => {
    playTone(600, 'sine', 0.05, 0.03);
  }, [playTone]);

  /** Plays a success chord (C Major arpeggio). */
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

  /** Plays a sound indicating an addition or positive action. */
  const playAdd = useCallback(() => {
    playTone(400, 'sine', 0.1, 0.1);
  }, [playTone]);

  /** Plays a sound indicating deletion or negative action. */
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

  /** Plays a whooshing sound effect for transitions. */
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

  /** Plays a meditative bell sound to signal session completion. */
  const playSessionComplete = useCallback(async () => {
    if (!isSoundEnabled()) return;
    try {
      const ctx = await resumeContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      
      // Meditation Bell / Gong simulation
      const baseFreq = 440; // A4
      // Ratios for bell-like partials
      const harmonics = [1, 2, 3, 4.2, 5.4]; 
      
      harmonics.forEach((h, i) => {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         
         osc.type = 'sine';
         osc.frequency.setValueAtTime(baseFreq * h, now);
         
         // Lower harmonics last longer
         const duration = 2.5 - (i * 0.4); 
         
         gain.gain.setValueAtTime(0, now);
         gain.gain.linearRampToValueAtTime(0.1 / (i + 1), now + 0.05); // Soft attack
         gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
         
         osc.connect(gain);
         gain.connect(ctx.destination);
         
         osc.start(now);
         osc.stop(now + duration);
      });
    } catch (e) {}
  }, [resumeContext]);

  return { playClick, playSoftClick, playSuccess, playAdd, playDelete, playWhoosh, playSessionComplete };
};
