/**
 * Utility functions for the 0.001 Second game.
 * Handles accuracy calculation, tier determination, round configuration, and formatting.
 */

export interface AccuracyTier {
  name: string;
  color: string;
  textClass: string;
  glowClass: string;
}

export interface RoundConfig {
  speed: number;
  targetWidth: number;
  hasVariableSpeed: boolean;
  hasReversal: boolean;
}

/**
 * Calculate accuracy as a percentage (0–100) based on how close the
 * stopped position is to the center of the track.
 *
 * @param position  – The pixel position where the target stopped
 * @param trackWidth – Total width of the track in pixels
 * @returns Accuracy percentage clamped to [0, 100], with 2‑decimal precision
 */
export function calculateAccuracy(position: number, trackWidth: number): number {
  if (trackWidth <= 0) return 0;
  const center = trackWidth / 2;
  const distance = Math.abs(position - center);
  const halfTrack = trackWidth / 2;
  const accuracy = Math.max(0, 100 - (distance / halfTrack) * 100);
  return Math.round(accuracy * 100) / 100;
}

/**
 * Map an accuracy value to its corresponding tier label, color, and Tailwind classes.
 */
export function getAccuracyTier(accuracy: number): AccuracyTier {
  if (accuracy >= 99) {
    return {
      name: 'PERFECT!',
      color: '#fbbf24',
      textClass: 'text-yellow-400',
      glowClass: 'shadow-yellow-400/50',
    };
  }
  if (accuracy >= 95) {
    return {
      name: 'EXCELLENT!',
      color: '#10b981',
      textClass: 'text-emerald-400',
      glowClass: 'shadow-emerald-400/40',
    };
  }
  if (accuracy >= 90) {
    return {
      name: 'GREAT!',
      color: '#5c7cfa',
      textClass: 'text-brand-400',
      glowClass: 'shadow-brand-400/40',
    };
  }
  if (accuracy >= 80) {
    return {
      name: 'GOOD',
      color: '#f8fafc',
      textClass: 'text-surface-50',
      glowClass: '',
    };
  }
  if (accuracy >= 70) {
    return {
      name: 'OK',
      color: '#94a3b8',
      textClass: 'text-surface-400',
      glowClass: '',
    };
  }
  return {
    name: 'MISS',
    color: '#ef4444',
    textClass: 'text-accent-red',
    glowClass: '',
  };
}

/**
 * Get the configuration for a specific round number (1‑indexed).
 */
export function getRoundConfig(round: number): RoundConfig {
  if (round <= 3) {
    return { speed: 1, targetWidth: 20, hasVariableSpeed: false, hasReversal: false };
  }
  if (round <= 6) {
    return { speed: 1.3, targetWidth: 18, hasVariableSpeed: false, hasReversal: false };
  }
  if (round <= 9) {
    return { speed: 1.6, targetWidth: 16, hasVariableSpeed: false, hasReversal: false };
  }
  if (round <= 14) {
    return { speed: 2, targetWidth: 14, hasVariableSpeed: true, hasReversal: false };
  }
  if (round <= 19) {
    return { speed: 2.5, targetWidth: 12, hasVariableSpeed: false, hasReversal: true };
  }
  if (round <= 24) {
    return { speed: 3, targetWidth: 10, hasVariableSpeed: true, hasReversal: true };
  }
  // Round 25+
  const extra = Math.min((round - 25) * 0.1, 2);
  return {
    speed: 3.5 + extra,
    targetWidth: 8,
    hasVariableSpeed: true,
    hasReversal: true,
  };
}

/**
 * Format an accuracy value as a string with exactly 2 decimal places and a % suffix.
 */
export function formatAccuracy(value: number): string {
  return `${value.toFixed(2)}%`;
}
