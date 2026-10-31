import type { GameInfo, GameId, Achievement } from '@/types';

// ─── Game Definitions ────────────────────────────────────────────────────────

export const GAMES: GameInfo[] = [
  {
    id: 'one-pixel',
    name: 'ONE PIXEL',
    slug: 'one-pixel',
    description: 'Find the difference before time runs out.',
    category: 'Observation',
    color: 'brand-500',
    icon: '🎯',
    route: '/games/one-pixel',
  },
  {
    id: 'zero-zero-one',
    name: '0.001 SECOND',
    slug: 'zero-zero-one',
    description: 'Stop the target as close to the center as possible.',
    category: 'Reflex',
    color: 'accent-cyan',
    icon: '⚡',
    route: '/games/zero-zero-one',
  },
  {
    id: 'memory-5',
    name: 'MEMORY 5',
    slug: 'memory-5',
    description: 'Remember the sequence. Beat your previous score.',
    category: 'Memory',
    color: 'accent-green',
    icon: '🧠',
    route: '/games/memory-5',
  },
  {
    id: 'dont-trust-ui',
    name: "DON'T TRUST THE UI",
    slug: 'dont-trust-ui',
    description: 'The game is lying. Figure out what it wants.',
    category: 'Trolling / Reaction',
    color: 'accent-purple',
    icon: '👻',
    route: '/games/dont-trust-ui',
  },
];

// ─── Achievement Definitions ─────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_GAME',
    name: 'FIRST GAME',
    description: 'Play your first game on PIXELPLAY',
    icon: '🎮',
  },
  {
    id: 'TEN_GAMES',
    name: '10 GAMES',
    description: 'Play 10 games total',
    icon: '🔥',
  },
  {
    id: 'HUNDRED_GAMES',
    name: '100 GAMES',
    description: 'Play 100 games across the platform',
    icon: '💯',
  },
  {
    id: 'PIXEL_MASTER',
    name: 'PIXEL MASTER',
    description: 'Reach Level 20 in One Pixel',
    icon: '👁️',
  },
  {
    id: 'REFLEX_GOD',
    name: 'REFLEX GOD',
    description: 'Score 99.50% or higher in 0.001 Second',
    icon: '⚡',
  },
  {
    id: 'MEMORY_MASTER',
    name: 'MEMORY MASTER',
    description: 'Reach Memory Level 10 in Memory 5',
    icon: '🧠',
  },
  {
    id: 'TROLL_SURVIVOR',
    name: 'TROLL SURVIVOR',
    description: "Survive 10 tricks in Don't Trust the UI",
    icon: '🛡️',
  },
  {
    id: 'DAILY_PLAYER',
    name: 'DAILY PLAYER',
    description: 'Complete today\'s Daily Challenge',
    icon: '📅',
  },
  {
    id: 'STREAK_5',
    name: 'HOT STREAK',
    description: 'Score 5 consecutive perfect answers',
    icon: '✨',
  },
  {
    id: 'CHALLENGER',
    name: 'FRIENDLY RIVAL',
    description: 'Share a challenge link with a friend',
    icon: '🤝',
  },
];

// ─── Game Routes Map ─────────────────────────────────────────────────────────

export const GAME_ROUTES: Record<GameId, string> = {
  'one-pixel': '/games/one-pixel',
  'zero-zero-one': '/games/zero-zero-one',
  'memory-5': '/games/memory-5',
  'dont-trust-ui': '/games/dont-trust-ui',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getGameById(id: GameId): GameInfo | undefined {
  return GAMES.find((g) => g.id === id);
}

export function getGameBySlug(slug: string): GameInfo | undefined {
  return GAMES.find((g) => g.slug === slug);
}
