import { GameId, PlayerProfile, GameSession, Achievement } from '@/types';
import { ACHIEVEMENTS } from '@/lib/constants';

const STORAGE_PREFIX = 'pixelplay_';

export function getStorageKey(game: string, key: string): string {
  return `${STORAGE_PREFIX}${game}_${key}`;
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently ignore
  }
}

export function generateGuestId(): string {
  return 'player_' + Math.random().toString(36).substring(2, 9);
}

const DEFAULT_PROFILE: PlayerProfile = {
  username: 'PixelRunner',
  avatar: '👾',
  guestId: 'guest_init',
  stats: {
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
  },
  createdAt: new Date().toISOString(),
};

export function getPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  const existing = loadFromStorage<PlayerProfile>(`${STORAGE_PREFIX}profile`, {
    ...DEFAULT_PROFILE,
    guestId: generateGuestId(),
  });
  return existing;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  saveToStorage(`${STORAGE_PREFIX}profile`, profile);
}

export function getGameStats(gameId: GameId) {
  return loadFromStorage(`${STORAGE_PREFIX}stats_${gameId}`, {
    gamesPlayed: 0,
    bestScore: 0,
    bestLevel: 0,
    avgAccuracy: 0,
    fastestReaction: 0,
  });
}

export function saveGameSession(session: GameSession): void {
  if (typeof window === 'undefined') return;
  const profile = getPlayerProfile();
  
  // Update totals
  profile.stats.totalGames += 1;
  profile.stats.totalScore += session.score;

  const currentBest = profile.stats.bestScores[session.gameId] || 0;
  if (session.score > currentBest) {
    profile.stats.bestScores[session.gameId] = session.score;
  }

  savePlayerProfile(profile);

  // Save history
  const history = loadFromStorage<GameSession[]>(`${STORAGE_PREFIX}sessions_${session.gameId}`, []);
  history.unshift(session);
  saveToStorage(`${STORAGE_PREFIX}sessions_${session.gameId}`, history.slice(0, 50));
}

export function getDailyProgress(todayDateStr?: string) {
  const dateStr = todayDateStr || new Date().toISOString().split('T')[0];
  return loadFromStorage(`${STORAGE_PREFIX}daily_${dateStr}`, {
    completed: false,
    score: 0,
    rank: null,
  });
}

export function saveDailyProgress(progress: { completed: boolean; score: number }, todayDateStr?: string): void {
  const dateStr = todayDateStr || new Date().toISOString().split('T')[0];
  saveToStorage(`${STORAGE_PREFIX}daily_${dateStr}`, progress);
}

export function getAchievements(): string[] {
  return loadFromStorage<string[]>(`${STORAGE_PREFIX}unlocked_achievements`, ['FIRST_GAME']);
}

export function unlockAchievement(achievementId: string): boolean {
  const current = getAchievements();
  if (!current.includes(achievementId)) {
    current.push(achievementId);
    saveToStorage(`${STORAGE_PREFIX}unlocked_achievements`, current);
    return true;
  }
  return false;
}
