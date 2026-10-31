'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GameId } from '@/types';
import { generateChallengeUrl, shareResult } from '@/lib/sharing';
import { useSound } from '@/components/providers/SoundProvider';

export interface GameOverScreenProps {
  title?: string;
  gameId?: GameId;
  score: number;
  bestScore: number;
  stats?: { label: string; value: string | number }[];
  onRestart: () => void;
  onHome?: () => void;
  isNewBest?: boolean;
}

export function GameOverScreen({
  title = 'GAME OVER',
  gameId = 'one-pixel',
  score,
  bestScore,
  stats = [],
  onRestart,
  onHome,
  isNewBest = false,
}: GameOverScreenProps) {
  const [copied, setCopied] = useState(false);
  const { playClick } = useSound();

  const handleChallengeFriend = async () => {
    playClick();
    const challengeUrl = generateChallengeUrl(gameId, score);
    const message = `Can you beat my score of ${score.toLocaleString()} on PIXELPLAY? Try it here: ${challengeUrl}`;

    const shared = await shareResult({
      game: gameId,
      score,
      message,
    });

    if (!shared) {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // Fallback prompt
        window.prompt('Copy challenge link:', message);
      }
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-6 py-6 px-4 text-center w-full max-w-md mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {title}
        </h2>
        {isNewBest && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-yellow/20 border border-accent-yellow/30 text-accent-yellow text-xs font-bold animate-pulse-slow">
            <span>🏆</span> NEW PERSONAL BEST!
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-900/80 border border-surface-800 shadow-xl w-full">
        <span className="text-xs uppercase tracking-widest text-surface-400 font-semibold mb-1">
          Final Score
        </span>
        <span className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-accent-purple">
          {typeof score === 'number' && score % 1 !== 0 ? score.toFixed(2) : score.toLocaleString()}
        </span>
        <div className="mt-2 text-xs text-surface-400">
          Personal Best:{' '}
          <span className="text-surface-200 font-semibold">
            {typeof bestScore === 'number' && bestScore % 1 !== 0 ? bestScore.toFixed(2) : bestScore.toLocaleString()}
          </span>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-value text-base sm:text-lg">{s.value}</span>
              <span className="stat-label text-2xs uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => {
            playClick();
            onRestart();
          }}
          className="btn-primary w-full text-base font-bold shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          PLAY AGAIN
        </button>

        <button
          onClick={handleChallengeFriend}
          className="btn-secondary w-full text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>⚔️</span>
          {copied ? 'Link Copied to Clipboard!' : 'CHALLENGE A FRIEND'}
        </button>

        {onHome ? (
          <button
            onClick={() => {
              playClick();
              onHome();
            }}
            className="btn-ghost text-surface-400 hover:text-white text-sm"
          >
            HOME
          </button>
        ) : (
          <Link
            href="/"
            className="btn-ghost text-surface-400 hover:text-white text-sm text-center"
          >
            HOME
          </Link>
        )}
      </div>
    </div>
  );
}
