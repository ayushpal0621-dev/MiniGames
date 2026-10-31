'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerProfile, PlayerStats, GameId } from '@/types';
import {
  getPlayerProfile,
  savePlayerProfile,
  getAchievements,
  unlockAchievement as recordAchievement,
} from '@/lib/storage';
import { ACHIEVEMENTS } from '@/lib/constants';

interface PlayerContextType {
  profile: PlayerProfile;
  isLoading: boolean;
  updateUsername: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  recordGameResult: (gameId: GameId, score: number, additionalData?: any) => void;
  unlockedAchievements: string[];
  allAchievements: typeof ACHIEVEMENTS;
}

const defaultStats: PlayerStats = {
  totalGames: 0,
  totalScore: 0,
  currentStreak: 1,
  longestStreak: 1,
  bestScores: {
    'one-pixel': 0,
    'zero-zero-one': 0,
    'memory-5': 0,
    'dont-trust-ui': 0,
  },
};

const defaultProfile: PlayerProfile = {
  username: 'Player1',
  avatar: '🕹️',
  guestId: 'guest_init',
  stats: defaultStats,
  createdAt: new Date().toISOString(),
};

const PlayerContext = createContext<PlayerContextType>({
  profile: defaultProfile,
  isLoading: true,
  updateUsername: () => {},
  updateAvatar: () => {},
  recordGameResult: () => {},
  unlockedAchievements: [],
  allAchievements: ACHIEVEMENTS,
});

export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(defaultProfile);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedProfile = getPlayerProfile();
    setProfile(loadedProfile);
    setUnlockedAchievements(getAchievements());
    setIsLoading(false);
  }, []);

  const updateUsername = (username: string) => {
    const updated = { ...profile, username };
    setProfile(updated);
    savePlayerProfile(updated);
  };

  const updateAvatar = (avatar: string) => {
    const updated = { ...profile, avatar };
    setProfile(updated);
    savePlayerProfile(updated);
  };

  const recordGameResult = (gameId: GameId, score: number, additionalData?: any) => {
    setProfile((prev) => {
      const bestScores = { ...prev.stats.bestScores };
      const currentBest = bestScores[gameId] || 0;
      const isNewBest = score > currentBest;
      if (isNewBest) {
        bestScores[gameId] = score;
      }

      const totalGames = prev.stats.totalGames + 1;
      const totalScore = prev.stats.totalScore + score;

      const updated: PlayerProfile = {
        ...prev,
        stats: {
          ...prev.stats,
          totalGames,
          totalScore,
          bestScores,
        },
      };

      savePlayerProfile(updated);

      // Check achievements
      if (totalGames >= 1) recordAchievement('FIRST_GAME');
      if (totalGames >= 10) recordAchievement('TEN_GAMES');
      if (totalGames >= 100) recordAchievement('HUNDRED_GAMES');

      if (gameId === 'one-pixel' && (additionalData?.level >= 20 || score >= 2000)) {
        recordAchievement('PIXEL_MASTER');
      }
      if (gameId === 'zero-zero-one' && (additionalData?.bestAccuracy >= 99.5 || score >= 99.5)) {
        recordAchievement('REFLEX_GOD');
      }
      if (gameId === 'memory-5' && (additionalData?.level >= 10 || score >= 1000)) {
        recordAchievement('MEMORY_MASTER');
      }
      if (gameId === 'dont-trust-ui' && (additionalData?.completed >= 10 || score >= 1000)) {
        recordAchievement('TROLL_SURVIVOR');
      }

      setUnlockedAchievements(getAchievements());
      return updated;
    });
  };

  return (
    <PlayerContext.Provider
      value={{
        profile,
        isLoading,
        updateUsername,
        updateAvatar,
        recordGameResult,
        unlockedAchievements,
        allAchievements: ACHIEVEMENTS,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

