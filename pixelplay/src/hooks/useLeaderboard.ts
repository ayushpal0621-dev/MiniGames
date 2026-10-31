'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameId, LeaderboardEntry } from '@/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { usePlayer } from '@/components/providers/PlayerProvider';

const LEADERBOARD_KEY = 'pixelplay_leaderboard_data';

// Default mock players with flags and realistic scores
const INITIAL_SCORES: LeaderboardEntry[] = [
  { rank: 1, username: 'Player123', score: 982, country: '🇺🇸', gameId: 'one-pixel', date: '2026-10-31' },
  { rank: 2, username: 'Ayush', score: 971, country: '🇮🇳', gameId: 'one-pixel', date: '2026-10-31' },
  { rank: 3, username: 'GamerX', score: 956, country: '🇯🇵', gameId: 'one-pixel', date: '2026-10-31' },
  { rank: 4, username: 'PixelQueen', score: 934, country: '🇬🇧', gameId: 'one-pixel', date: '2026-10-31' },
  { rank: 5, username: 'CyberSamurai', score: 910, country: '🇰🇷', gameId: 'one-pixel', date: '2026-10-30' },

  { rank: 1, username: 'SpeedDemon', score: 99.87, country: '🇩🇪', gameId: 'zero-zero-one', date: '2026-10-31' },
  { rank: 2, username: 'ApexReflex', score: 99.64, country: '🇨🇦', gameId: 'zero-zero-one', date: '2026-10-31' },
  { rank: 3, username: 'ChronoMaster', score: 99.42, country: '🇸🇬', gameId: 'zero-zero-one', date: '2026-10-30' },
  { rank: 4, username: 'ZeroLag', score: 98.90, country: '🇧🇷', gameId: 'zero-zero-one', date: '2026-10-29' },

  { rank: 1, username: 'Mnemonist', score: 1420, country: '🇫🇷', gameId: 'memory-5', date: '2026-10-31' },
  { rank: 2, username: 'BrainBox', score: 1280, country: '🇦🇺', gameId: 'memory-5', date: '2026-10-31' },
  { rank: 3, username: 'EchoMind', score: 1150, country: '🇪🇸', gameId: 'memory-5', date: '2026-10-30' },

  { rank: 1, username: 'TrollBuster', score: 1550, country: '🇳🇱', gameId: 'dont-trust-ui', date: '2026-10-31' },
  { rank: 2, username: 'MindReader', score: 1390, country: '🇮🇳', gameId: 'dont-trust-ui', date: '2026-10-31' },
  { rank: 3, username: 'SkepticCat', score: 1220, country: '🇸🇪', gameId: 'dont-trust-ui', date: '2026-10-30' },
];

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterGame, setFilterGame] = useState<GameId | 'all'>('all');
  const [period, setPeriod] = useState<'today' | 'week' | 'all'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = usePlayer();

  useEffect(() => {
    let data = loadFromStorage<LeaderboardEntry[]>(LEADERBOARD_KEY, INITIAL_SCORES);
    
    // Add current player's scores if present
    if (profile?.username) {
      Object.entries(profile.stats.bestScores).forEach(([gId, score]) => {
        if (score > 0) {
          const exists = data.some((e) => e.username === profile.username && e.gameId === gId);
          if (!exists) {
            data.push({
              rank: 0,
              username: profile.username,
              score,
              country: '🌐',
              gameId: gId as GameId,
              date: new Date().toISOString().split('T')[0],
            });
          }
        }
      });
    }

    setEntries(data);
    setIsLoading(false);
  }, [profile]);

  const addEntry = useCallback((entry: Omit<LeaderboardEntry, 'rank' | 'date'>) => {
    setEntries((prev) => {
      const newEntry: LeaderboardEntry = {
        ...entry,
        rank: 1,
        date: new Date().toISOString().split('T')[0],
      };
      const updated = [newEntry, ...prev.filter((e) => !(e.username === entry.username && e.gameId === entry.gameId))];
      saveToStorage(LEADERBOARD_KEY, updated);
      return updated;
    });
  }, []);

  // Filter and sort entries
  const filteredEntries = entries
    .filter((entry) => {
      if (filterGame !== 'all' && entry.gameId !== filterGame) return false;
      if (period === 'today') {
        const today = new Date().toISOString().split('T')[0];
        return entry.date === today;
      }
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return {
    entries: filteredEntries,
    filterGame,
    setFilterGame,
    period,
    setPeriod,
    isLoading,
    addEntry,
    playerUsername: profile?.username,
  };
}

