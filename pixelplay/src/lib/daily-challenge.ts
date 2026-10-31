import type { GameId, DailyChallenge } from '@/types';
import { GAMES } from '@/lib/constants';

// ─── Daily Challenge System ──────────────────────────────────────────────────

/** Generate a deterministic seed from today's UTC date. */
export function getDailySeed(date: Date = new Date()): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  // Simple but deterministic: year * 10000 + month * 100 + day, then hash
  const base = y * 10000 + m * 100 + d;
  let hash = base;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = (hash >> 16) ^ hash;
  return Math.abs(hash);
}

/** Cycle through games based on day of year. */
export function getDailyGameId(date: Date = new Date()): GameId {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const index = dayOfYear % GAMES.length;
  return GAMES[index].id;
}

/** Returns today's full challenge config. */
export function getDailyChallenge(date: Date = new Date()): DailyChallenge {
  const seed = getDailySeed(date);
  const gameId = getDailyGameId(date);
  const dateStr = date.toISOString().slice(0, 10);

  // Seeded pseudo-random config generation
  const rng = mulberry32(seed);

  const config: Record<string, unknown> = {};

  switch (gameId) {
    case 'one-pixel':
      config.gridSize = 4 + Math.floor(rng() * 5); // 4-8
      config.timeLimit = 15 + Math.floor(rng() * 16); // 15-30s
      break;
    case 'zero-zero-one':
      config.targetTime = 500 + Math.floor(rng() * 4500); // 500-5000ms
      config.rounds = 3 + Math.floor(rng() * 3); // 3-5
      break;
    case 'memory-5':
      config.sequenceLength = 4 + Math.floor(rng() * 4); // 4-7
      config.displayTime = 800 + Math.floor(rng() * 700); // 800-1500ms
      break;
    case 'dont-trust-ui':
      config.trickLevel = 1 + Math.floor(rng() * 3); // 1-3
      config.rounds = 5 + Math.floor(rng() * 6); // 5-10
      break;
  }

  return { date: dateStr, gameId, seed, config };
}

/** Milliseconds until midnight UTC. */
export function getTimeUntilNextChallenge(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return tomorrow.getTime() - now.getTime();
}

/** Format milliseconds into HH:MM:SS. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((n) => n.toString().padStart(2, '0')).join(':');
}

// ─── Seeded PRNG (Mulberry32) ────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
