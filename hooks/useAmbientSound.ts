
import React, { useState, useEffect, useRef, useCallback } from 'react';

export type SoundType = 'none' | 'rain' | 'forest' | 'fire' | 'ocean' | 'night';

// Switched to reliable MP3 sources from Mixkit for better browser support (Safari/iOS) and removed CORS restrictions
const SOUND_URLS: Record<SoundType, string> = {
  none: '',
  rain: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3', 
  forest: 'https://assets.mixkit.co/active_storage/sfx/2505/2505-preview.mp3',
  fire: 'https://assets.mixkit.co/active_storage/sfx/2506/2506-preview.mp3',
  ocean: 'https://assets.mixkit.co/active_storage/sfx/1194/1194-preview.mp3',
  night: 'https://assets.mixkit.co/active_storage/sfx/228/228-preview.mp3'
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
        // Don't clear src immediately to avoid abrupt cuts, just pause
      } else {
        const newSrc = SOUND_URLS[selectedSound];
        // Only reload if source actually changed
        if (audioRef.current.src !== newSrc) {
            audioRef.current.src = newSrc;
            audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Audio play blocked. User interaction required first.", error);
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

  // Return a render-able audio element
  // Removed crossOrigin="anonymous" to allow opaque responses (fixes CORS blocks on external MP3s)
  const AudioElement = useCallback(() => {
    return React.createElement('audio', {
      ref: audioRef,
      loop: true,
      preload: 'auto',
      style: { display: 'none' },
      onError: (e: any) => console.error("Audio playback error:", e)
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
