/**
 * Utility functions for the One Pixel game.
 * Handles grid generation, color math, scoring, and seeded randomness.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface GridConfig {
  size: number;
  difference: number;
  timeLimit: number;
}

export interface GridData {
  baseColor: RGB;
  differentColor: RGB;
  differentIndex: number;
  gridSize: number;
  colorDifference: number;
}

// ─── Seeded Random ────────────────────────────────────────────────────────────

/**
 * Returns a deterministic pseudo-random number generator seeded with `seed`.
 * Uses a simple mulberry32 algorithm.
 */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Grid Config ──────────────────────────────────────────────────────────────

/**
 * Returns grid size, color difference, and time limit for a given level.
 */
export function getGridConfig(level: number): GridConfig {
  let size: number;
  let difference: number;
  let timeLimit: number;

  if (level <= 3) {
    size = 6;
    difference = 25;
  } else if (level <= 6) {
    size = 7;
    difference = 20;
  } else if (level <= 9) {
    size = 8;
    difference = 15;
  } else if (level <= 14) {
    size = 9;
    difference = 12;
  } else if (level <= 19) {
    size = 10;
    difference = 10;
  } else if (level <= 24) {
    size = 11;
    difference = 8;
  } else if (level <= 29) {
    size = 12;
    difference = 6;
  } else {
    size = 12;
    difference = Math.max(3, 4);
  }

  // Time starts at 15 s and decreases by 0.5 s per level, min 5 s
  timeLimit = Math.max(5, 15 - (level - 1) * 0.5);

  return { size, difference, timeLimit };
}

// ─── Color Generation ─────────────────────────────────────────────────────────

/**
 * Generate a random base color, avoiding very dark and very light shades
 * so the difference tile is always perceptible.
 */
export function generateColor(rand: () => number = Math.random): RGB {
  const channel = () => Math.floor(rand() * 156) + 50; // 50–205 range
  return { r: channel(), g: channel(), b: channel() };
}

/**
 * Create a visibly different shade by shifting channels.
 * Alternates between hue-style shifts and brightness shifts
 * to keep the challenge varied.
 */
export function adjustColor(
  base: RGB,
  difference: number,
  rand: () => number = Math.random,
): RGB {
  const strategy = rand();

  if (strategy < 0.33) {
    // Brightness shift — all channels move the same direction
    const dir = rand() < 0.5 ? 1 : -1;
    return {
      r: clampChannel(base.r + dir * difference),
      g: clampChannel(base.g + dir * difference),
      b: clampChannel(base.b + dir * difference),
    };
  } else if (strategy < 0.66) {
    // Hue shift — move two channels opposite directions
    const dir = rand() < 0.5 ? 1 : -1;
    const pick = Math.floor(rand() * 3);
    const result = { ...base };
    const keys: (keyof RGB)[] = ['r', 'g', 'b'];
    result[keys[pick]] = clampChannel(base[keys[pick]] + dir * difference);
    result[keys[(pick + 1) % 3]] = clampChannel(
      base[keys[(pick + 1) % 3]] - dir * Math.floor(difference * 0.5),
    );
    return result;
  } else {
    // Single-channel shift — simplest perceptible change
    const dir = rand() < 0.5 ? 1 : -1;
    const pick = Math.floor(rand() * 3);
    const keys: (keyof RGB)[] = ['r', 'g', 'b'];
    const result = { ...base };
    result[keys[pick]] = clampChannel(base[keys[pick]] + dir * difference);
    return result;
  }
}

function clampChannel(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

// ─── Grid Generation ──────────────────────────────────────────────────────────

/**
 * Generate the grid data for a given level.
 * If a seed is provided, the grid is deterministic (for challenges).
 */
export function generateGrid(level: number, seed?: number): GridData {
  const rand = seed !== undefined ? seededRandom(seed + level * 1337) : Math.random;
  const config = getGridConfig(level);
  const totalTiles = config.size * config.size;

  const baseColor = generateColor(rand);
  const differentColor = adjustColor(baseColor, config.difference, rand);
  const differentIndex = Math.floor(rand() * totalTiles);

  return {
    baseColor,
    differentColor,
    differentIndex,
    gridSize: config.size,
    colorDifference: config.difference,
  };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Calculate score for completing a level.
 *
 * @param level         Current level number (1-based)
 * @param reactionTimeMs Time taken to find the tile in milliseconds
 * @param hadWrongClicks Whether the player clicked wrong tiles on this level
 * @returns             Points earned
 */
export function calculateScore(
  level: number,
  reactionTimeMs: number,
  hadWrongClicks: boolean,
): number {
  const basePoints = level * 10;

  // Speed multiplier: 2× for < 1 s, linearly down to 1× at 10 s, minimum 1×
  const speedMultiplier = Math.max(
    1,
    2 - Math.max(0, reactionTimeMs - 1000) / 9000,
  );

  const accuracyMultiplier = hadWrongClicks ? 1 : 1.5;

  return Math.round(basePoints * speedMultiplier * accuracyMultiplier);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function rgbToString(c: RGB): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}
