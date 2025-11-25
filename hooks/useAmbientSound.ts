
import React, { useState, useEffect, useRef, useCallback } from 'react';

export type SoundType = 'none' | 'rain' | 'forest' | 'fire' | 'ocean' | 'night';

const SOUND_URLS: Record<SoundType, string> = {
  none: '',
  rain: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3', 
  forest: 'https://assets.mixkit.co/active_storage/sfx/2505/2505-preview.mp3',
  fire: 'https://assets.mixkit.co/active_storage/sfx/2506/2506-preview.mp3',
  ocean: 'https://assets.mixkit.co/active_storage/sfx/1194/1194-preview.mp3',
  night: 'https://assets.mixkit.co/active_storage/sfx/228/228-preview.mp3'
};

/**
 * Custom hook for managing ambient background noise (white noise) playback.
 * Handles loading, playing, pausing, and volume control of audio streams.
 * 
 * @returns {Object} An object containing the selected sound, controls, and the AudioElement component.
 */
export const useAmbientSound = () => {
  const [selectedSound, setSelectedSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effect to handle source changes and playback status
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      // Stop previous
      audio.pause();

      if (selectedSound === 'none') {
        return;
      }

      const newSrc = SOUND_URLS[selectedSound];
      if (audio.src !== newSrc) {
        audio.src = newSrc;
        audio.load();
      }

      try {
        await audio.play();
      } catch (error: any) {
        // Ignore AbortError which happens if the component unmounts or sound switches quickly
        if (error.name !== 'AbortError') {
          console.debug("Ambient sound playback prevented:", error);
        }
      }
    };

    playAudio();

    return () => {
      audio.pause();
    };
  }, [selectedSound]);

  // Effect to handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /**
   * Render-able audio element component. 
   * Must be included in the component tree for sound to play.
   */
  const AudioElement = useCallback(() => {
    return React.createElement('audio', {
      ref: audioRef,
      loop: true,
      preload: 'none',
      style: { display: 'none' },
      onError: (e: any) => console.debug("Audio resource failed to load:", e)
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
