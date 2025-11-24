
import React, { useState, useEffect, useRef, useCallback } from 'react';

export type SoundType = 'none' | 'rain' | 'forest' | 'fire' | 'ocean' | 'night';

// Using consistent MP3 sources for wider browser compatibility (Safari/iOS)
const SOUND_URLS: Record<SoundType, string> = {
  none: '',
  rain: 'https://www.soundjay.com/nature/rain-01.mp3', 
  forest: 'https://www.soundjay.com/nature/forest-01.mp3',
  fire: 'https://www.soundjay.com/nature/fire-1.mp3',
  ocean: 'https://www.soundjay.com/nature/ocean-wave-1.mp3',
  night: 'https://www.soundjay.com/nature/crickets-1.mp3'
};

export const useAmbientSound = () => {
  const [selectedSound, setSelectedSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When sound changes, update the ref and play
  useEffect(() => {
    if (audioRef.current) {
      if (selectedSound === 'none') {
        audioRef.current.pause();
        audioRef.current.src = "";
      } else {
        // Only reload if source actually changed to avoid stutter
        const newSrc = SOUND_URLS[selectedSound];
        if (audioRef.current.src !== newSrc) {
            audioRef.current.src = newSrc;
            audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Audio play blocked (interaction required):", error);
          });
        }
      }
    }
  }, [selectedSound]);

  // When volume changes, update the ref
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Return a render-able audio element and controls
  const AudioElement = useCallback(() => {
    return React.createElement('audio', {
      ref: audioRef,
      loop: true,
      preload: 'auto',
      style: { display: 'none' },
      crossOrigin: 'anonymous'
    });
  }, []);

  return {
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    AudioElement
  };
};
