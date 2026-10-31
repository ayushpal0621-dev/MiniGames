import { NextResponse } from 'next/server';
import { GameId } from '@/types';
import { validateScore, validateReactionTime, validateLevelProgression } from '@/lib/anti-cheat';

interface ScoreSubmission {
  gameId: GameId;
  score: number;
  level?: number;
  durationMs?: number;
  fastestReactionMs?: number;
  guestId?: string;
}

export async function POST(req: Request) {
  try {
    const body: ScoreSubmission = await req.json();

    const { gameId, score, level = 1, durationMs = 1000, fastestReactionMs } = body;

    // 1. Validate Game ID
    const validGames: GameId[] = ['one-pixel', 'zero-zero-one', 'memory-5', 'dont-trust-ui'];
    if (!validGames.includes(gameId)) {
      return NextResponse.json({ error: 'Invalid game identifier' }, { status: 400 });
    }

    // 2. Validate Reaction Time if provided
    if (fastestReactionMs !== undefined && !validateReactionTime(fastestReactionMs)) {
      return NextResponse.json(
        { error: 'Anti-cheat flag: Inhuman reaction speed detected' },
        { status: 422 }
      );
    }

    // 3. Validate Score Bounds
    if (!validateScore(gameId, score, level)) {
      return NextResponse.json(
        { error: 'Anti-cheat flag: Score outside permitted mathematical bounds' },
        { status: 422 }
      );
    }

    // 4. Validate Level Progression
    if (!validateLevelProgression(gameId, level, score)) {
      return NextResponse.json(
        { error: 'Anti-cheat flag: Inconsistent level progression' },
        { status: 422 }
      );
    }

    // If all validation passes:
    return NextResponse.json({
      success: true,
      validated: true,
      timestamp: new Date().toISOString(),
      score,
      gameId,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process score submission' }, { status: 500 });
  }
}

