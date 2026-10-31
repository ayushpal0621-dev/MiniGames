import type { GameId } from '@/types';

// ─── Anti-Cheat Validation ──────────────────────────────────────────────────
//
// Basic client-side sanity checks. NOT a substitute for server-side validation,
// but catches trivially injected scores.

// ─── Reaction Time ───────────────────────────────────────────────────────────

const MIN_HUMAN_REACTION_MS = 100;

export function validateReactionTime(ms: number): boolean {
  // Reject reaction times faster than humanly possible (~100ms)
  return ms >= MIN_HUMAN_REACTION_MS;
}

// ─── Score Bounds ────────────────────────────────────────────────────────────

const SCORE_BOUNDS: Record<GameId, { min: number; max: number }> = {
  'one-pixel': { min: 0, max: 10_000 },
  'zero-zero-one': { min: 0, max: 100_000 },
  'memory-5': { min: 0, max: 50_000 },
  'dont-trust-ui': { min: 0, max: 50_000 },
};

export function validateScore(gameId: GameId, score: number, level: number): boolean {
  const bounds = SCORE_BOUNDS[gameId];
  if (!bounds) return false;

  if (score < bounds.min || score > bounds.max) return false;
  if (!Number.isFinite(score) || score < 0) return false;

  // Score should be somewhat proportional to level
  // Allow generous headroom (level * 500)
  if (level > 0 && score > level * 500) return false;

  return true;
}

// ─── Level Progression ───────────────────────────────────────────────────────

const MAX_LEVELS: Record<GameId, number> = {
  'one-pixel': 200,
  'zero-zero-one': 500,
  'memory-5': 100,
  'dont-trust-ui': 100,
};

export function validateLevelProgression(
  gameId: GameId,
  currentLevel: number,
  score: number,
): boolean {
  const maxLevel = MAX_LEVELS[gameId] ?? 100;

  if (currentLevel < 0 || currentLevel > maxLevel) return false;
  if (score < 0) return false;

  // Levels should not jump unreasonably; allow up to score / 5
  if (currentLevel > 1 && score === 0) return false;

  return true;
}

// ─── Session Token ───────────────────────────────────────────────────────────

export function generateSessionToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const raw = `${timestamp}-${random}-${navigator.userAgent.length}`;
  // Simple hash (not cryptographically secure — just a fingerprint)
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${Math.abs(hash).toString(36)}_${timestamp.toString(36)}`;
}

export function validateSession(token: string, score: number): boolean {
  if (!token || typeof token !== 'string') return false;
  if (token.length < 5) return false;

  // Extract timestamp from token
  const parts = token.split('_');
  if (parts.length !== 2) return false;

  const timestamp = parseInt(parts[1], 36);
  const now = Date.now();
  const elapsed = now - timestamp;

  // Session must be at least 1 second and no more than 2 hours old
  if (elapsed < 1_000 || elapsed > 7_200_000) return false;

  // Score must be non-negative and finite
  if (!Number.isFinite(score) || score < 0) return false;

  return true;
}
