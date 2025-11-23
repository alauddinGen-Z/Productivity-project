
import { useState, useEffect, useRef } from 'react';

export type SoundType = 'none' | 'rain' | 'forest' | 'fire' | 'ocean' | 'night';

// Using Google's reliable sound library for consistency
const SOUND_URLS: Record<SoundType, string> = {
  none: '',
  rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
  forest: 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg',
  fire: 'https://actions.google.com/sounds/v1/ambiences/fireplace.ogg',
  ocean: 'https://actions.google.com/sounds/v1/nature/ocean_waves.ogg',
  night: 'https://actions.google.com/sounds/v1/nature/crickets_chirping.ogg'
};

export const useAmbientSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSound, setSelectedSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    // Cleanup previous sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (selectedSound === 'none') return;

    const url = SOUND_URLS[selectedSound];
    const audio = new Audio(url);
    
    audio.loop = true;
    audio.volume = volume;
    audio.crossOrigin = "anonymous";

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Audio autoplay blocked (user must interact first):", error);
      });
    }

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return {
    selectedSound,
    setSelectedSound,
    volume,
    setVolume
  };
};
