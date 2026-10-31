// ─── Game Identifiers ────────────────────────────────────────────────────────

export type GameId = 'one-pixel' | 'zero-zero-one' | 'memory-5' | 'dont-trust-ui';

// ─── Game Information ────────────────────────────────────────────────────────

export interface GameInfo {
  id: GameId;
  name: string;
  slug: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  route: string;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface PlayerStats {
  totalGames: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  bestScores: Partial<Record<GameId, number>>;
}

export interface PlayerProfile {
  username: string;
  avatar: string;
  guestId: string;
  stats: PlayerStats;
  createdAt: string;
}

// ─── Game Session ────────────────────────────────────────────────────────────

export type GamePhase = 'idle' | 'playing' | 'paused' | 'gameover';

export interface GameSession {
  id: string;
  gameId: GameId;
  score: number;
  level: number;
  startedAt: string;
  endedAt?: string;
  stats?: Record<string, unknown>;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  country?: string;
  gameId: GameId;
  date: string;
}

// ─── Daily Challenge ─────────────────────────────────────────────────────────

export interface DailyChallenge {
  date: string;
  gameId: GameId;
  seed: number;
  config: Record<string, unknown>;
}

export interface DailyProgress {
  date: string;
  gameId: GameId;
  completed: boolean;
  score?: number;
  attempts: number;
}

// ─── Achievements ────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

// ─── Ad Slots ────────────────────────────────────────────────────────────────

export type AdSlotType = 'leaderboard' | 'interstitial-transition' | 'rewarded';

// ─── Share ───────────────────────────────────────────────────────────────────

export interface ShareData {
  game: GameId;
  score: number;
  challengeId?: string;
  message: string;
}
