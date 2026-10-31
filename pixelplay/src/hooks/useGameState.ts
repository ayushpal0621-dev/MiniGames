'use client';

import { useState, useCallback, useRef } from 'react';
import { GameId, GamePhase } from '@/types';
import { saveGameSession } from '@/lib/storage';
import { usePlayer } from '@/components/providers/PlayerProvider';
import { useSound } from '@/components/providers/SoundProvider';

export function useGameState(gameId: GameId) {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const startTimeRef = useRef<number>(0);
  const { recordGameResult } = usePlayer();
  const { playSuccess, playFailure, playGameOver } = useSound();

  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setPhase('playing');
    startTimeRef.current = Date.now();
  }, []);

  const endGame = useCallback(
    (finalScore?: number, additionalStats?: any) => {
      const recordedScore = finalScore !== undefined ? finalScore : score;
      setPhase('gameover');
      playGameOver();

      const session = {
        id: 'session_' + Math.random().toString(36).substring(2, 9),
        gameId,
        score: recordedScore,
        level,
        startedAt: new Date(startTimeRef.current || Date.now()).toISOString(),
        endedAt: new Date().toISOString(),
        stats: additionalStats,
      };

      saveGameSession(session);
      recordGameResult(gameId, recordedScore, { level, ...additionalStats });
    },
    [gameId, level, score, playGameOver, recordGameResult]
  );

  const resetGame = useCallback(() => {
    setPhase('idle');
    setScore(0);
    setLevel(1);
    setLives(3);
  }, []);

  return {
    phase,
    setPhase,
    score,
    setScore,
    level,
    setLevel,
    lives,
    setLives,
    isPlaying: phase === 'playing',
    isGameOver: phase === 'gameover',
    isIdle: phase === 'idle',
    startGame,
    endGame,
    resetGame,
    playSuccess,
    playFailure,
  };
}

