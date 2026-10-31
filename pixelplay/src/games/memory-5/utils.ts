// ─── Symbol Categories ───────────────────────────────────────────────────────

export const SYMBOL_POOL = [
  // Fruits
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉',
  // Animals
  '🐶', '🐱', '🐼', '🐨', '🦊', '🐸', '🐵', '🦁', '🐯', '🐰',
  // Objects & Vehicles
  '⭐', '🎈', '🎸', '🚗', '🏀', '🎯', '⚡', '🔥', '💎', '🎪',
  // Food
  '🍕', '🍔', '🍟', '🌮', '🍩', '🍦', '🧁', '🍪', '🎂', '🍿',
];

// Seeded pseudorandom generator for daily & friend challenges
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function shuffleArray<T>(array: T[], rng = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface MemoryConfig {
  sequenceLength: number;
  displayTimeMs: number;
  distractorCount: number;
}

export function getLevelConfig(level: number): MemoryConfig {
  // Level 1 starts with 5 symbols. Every 2 levels, sequence length increases.
  const sequenceLength = Math.min(12, 5 + Math.floor((level - 1) / 2));
  
  // Display time gets faster at higher levels (minimum 300ms per symbol)
  const baseTimePerSymbol = Math.max(350, 700 - level * 25);
  const displayTimeMs = sequenceLength * baseTimePerSymbol;

  // Distractors increase
  const distractorCount = Math.min(10, 3 + Math.floor(level / 3));

  return {
    sequenceLength,
    displayTimeMs,
    distractorCount,
  };
}

export function generateRound(level: number, rng = Math.random) {
  const { sequenceLength, distractorCount } = getLevelConfig(level);

  // Pick unique symbols for sequence
  const shuffledAll = shuffleArray(SYMBOL_POOL, rng);
  const sequence = shuffledAll.slice(0, sequenceLength);

  // Pick distractors from remaining
  const remaining = shuffledAll.slice(sequenceLength);
  const distractors = remaining.slice(0, distractorCount);

  // Options shown to player
  const options = shuffleArray([...sequence, ...distractors], rng);

  return {
    sequence,
    options,
    sequenceLength,
  };
}

export function calculateRoundScore(
  level: number,
  isCorrect: boolean,
  reactionTimeMs: number
): number {
  if (!isCorrect) return 0;
  const base = level * 100;
  // Speed multiplier: fast reproduction rewards up to 1.5x
  const speedBonus = Math.max(1, 1.5 - reactionTimeMs / 10000);
  return Math.round(base * speedBonus);
}

