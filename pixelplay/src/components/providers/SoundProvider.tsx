'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundManager } from '@/lib/sound';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSuccess: () => void;
  playFailure: () => void;
  playClick: () => void;
  playLevelUp: () => void;
  playCountdown: () => void;
  playGameOver: () => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: true,
  toggleMute: () => {},
  playSuccess: () => {},
  playFailure: () => {},
  playClick: () => {},
  playLevelUp: () => {},
  playCountdown: () => {},
  playGameOver: () => {},
});

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Check local storage for preference
    const saved = localStorage.getItem('pixelplay_sound_muted');
    if (saved !== null) {
      const val = saved === 'true';
      setIsMuted(val);
      soundManager.muted = val;
    } else {
      soundManager.muted = true;
    }
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.muted = next;
      localStorage.setItem('pixelplay_sound_muted', String(next));
      if (!next) {
        soundManager.playClick();
      }
      return next;
    });
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playSuccess: () => soundManager.playSuccess(),
        playFailure: () => soundManager.playFailure(),
        playClick: () => soundManager.playClick(),
        playLevelUp: () => soundManager.playLevelUp(),
        playCountdown: () => soundManager.playCountdown(),
        playGameOver: () => soundManager.playGameOver(),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

