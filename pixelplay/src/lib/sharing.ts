import type { GameId, ShareData } from '@/types';
import { getGameById } from '@/lib/constants';

// ─── Challenge URL ───────────────────────────────────────────────────────────

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://pixelplay.gg';

interface ChallengeData {
  gameId: GameId;
  score: number;
  seed?: number;
}

export function generateChallengeUrl(gameId: GameId, score: number, seed?: number): string {
  const payload: ChallengeData = { gameId, score, ...(seed !== undefined && { seed }) };
  const encoded = btoa(JSON.stringify(payload));
  return `${BASE_URL}/challenge?d=${encodeURIComponent(encoded)}`;
}

export function parseChallengeUrl(url: string): ChallengeData | null {
  try {
    const u = new URL(url);
    const d = u.searchParams.get('d');
    if (!d) return null;
    const decoded = JSON.parse(atob(decodeURIComponent(d))) as ChallengeData;
    if (!decoded.gameId || typeof decoded.score !== 'number') return null;
    return decoded;
  } catch {
    return null;
  }
}

// ─── Share Text ──────────────────────────────────────────────────────────────

export function generateShareText(gameId: GameId, score: number): string {
  const game = getGameById(gameId);
  const name = game?.name ?? gameId;
  const icon = game?.icon ?? '🎮';

  const lines = [
    `${icon} ${name} — Score: ${score}`,
    '',
    'Can you beat my score?',
    '🕹️ PIXELPLAY — Small Games. Big Scores.',
  ];
  return lines.join('\n');
}

// ─── Web Share / Clipboard ───────────────────────────────────────────────────

export async function shareResult(data: ShareData): Promise<'shared' | 'copied' | 'failed'> {
  const game = getGameById(data.game);
  const title = `${game?.icon ?? '🎮'} ${game?.name ?? data.game} — Score: ${data.score}`;
  const text = data.message || generateShareText(data.game, data.score);
  const url = data.challengeId
    ? `${BASE_URL}/challenge?id=${data.challengeId}`
    : generateChallengeUrl(data.game, data.score);

  // Try Web Share API first
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      // User cancelled or API failed — fall through to clipboard
      if ((err as Error)?.name === 'AbortError') return 'failed';
    }
  }

  // Clipboard fallback
  const clipboard = `${text}\n\n${url}`;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(clipboard);
      return 'copied';
    }
  } catch {
    // Clipboard not available
  }

  return 'failed';
}

// ─── Daily Challenge Seed ────────────────────────────────────────────────────

export function generateDailyChallengeSeed(date: Date = new Date()): number {
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
