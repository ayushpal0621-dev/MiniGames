'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GameId } from '@/types';
import { GAMES } from '@/lib/constants';
import { parseChallengeUrl, generateChallengeUrl, shareResult } from '@/lib/sharing';
import { OnePixelGame } from '@/games/one-pixel/OnePixelGame';
import { ZeroZeroOneGame } from '@/games/zero-zero-one/ZeroZeroOneGame';
import { Memory5Game } from '@/games/memory-5/Memory5Game';
import { DontTrustUIGame } from '@/games/dont-trust-ui/DontTrustUIGame';
import { AdSlot } from '@/components/ui/AdSlot';

function ChallengeContent() {
  const searchParams = useSearchParams();
  const [challengeData, setChallengeData] = useState<{
    gameId: GameId;
    score: number;
    seed?: number;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseChallengeUrl(window.location.href);
      if (parsed) {
        setChallengeData(parsed);
      } else {
        const g = searchParams.get('game') as GameId;
        const s = parseFloat(searchParams.get('score') || '0');
        if (g) {
          setChallengeData({ gameId: g, score: s });
        } else {
          setChallengeData({ gameId: 'one-pixel', score: 850 });
        }
      }
    }
  }, [searchParams]);

  if (!challengeData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center text-surface-400">Loading challenge...</div>
      </div>
    );
  }

  const targetGame = GAMES.find((g) => g.id === challengeData.gameId) || GAMES[0];
  const targetScore = challengeData.score;

  const handleGameEnd = (score: number) => {
    setPlayerScore(score);
    setIsPlaying(false);
  };

  const handleShareBack = async () => {
    if (playerScore === null) return;
    const challengeUrl = generateChallengeUrl(challengeData.gameId, playerScore);
    const won = playerScore >= targetScore;
    const message = won
      ? `I just beat your ${targetScore} score on PIXELPLAY with a ${playerScore}! Can you reclaim it? ${challengeUrl}`
      : `I scored ${playerScore} trying to beat your ${targetScore} on PIXELPLAY! Play: ${challengeUrl}`;

    const shared = await shareResult({
      game: challengeData.gameId,
      score: playerScore,
      message,
    });

    if (!shared) {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        window.prompt('Copy challenge link:', message);
      }
    }
  };

  const renderGame = () => {
    switch (challengeData.gameId) {
      case 'one-pixel':
        return <OnePixelGame challengeSeed={challengeData.seed} onGameEnd={handleGameEnd} />;
      case 'zero-zero-one':
        return <ZeroZeroOneGame challengeSeed={challengeData.seed} onGameEnd={handleGameEnd} />;
      case 'memory-5':
        return <Memory5Game challengeSeed={challengeData.seed} onGameEnd={handleGameEnd} />;
      case 'dont-trust-ui':
        return <DontTrustUIGame challengeSeed={challengeData.seed} onGameEnd={handleGameEnd} />;
      default:
        return <OnePixelGame challengeSeed={challengeData.seed} onGameEnd={handleGameEnd} />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {isPlaying ? (
        <div className="w-full max-w-2xl">{renderGame()}</div>
      ) : playerScore !== null ? (
        <div className="w-full max-w-md bg-surface-900/80 border border-surface-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-fade-in">
          <span className="text-5xl mb-2 block">
            {playerScore >= targetScore ? '👑' : '😅'}
          </span>
          <h2 className="text-2xl font-black text-white">
            {playerScore >= targetScore ? 'YOU CRUSHED THEM!' : 'NICE TRY!'}
          </h2>
          <p className="text-surface-400 text-xs mt-1">
            {playerScore >= targetScore
              ? 'You surpassed your friend’s score! Send it back to flex.'
              : 'You were close! Give it another shot or challenge someone else.'}
          </p>

          <div className="grid grid-cols-2 gap-3 my-6 p-4 rounded-2xl bg-surface-800/60 border border-surface-700/50">
            <div className="flex flex-col items-center border-r border-surface-700/60 pr-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-surface-400">
                Your Score
              </span>
              <span className="text-3xl font-black text-brand-400 mt-1">
                {playerScore}
              </span>
            </div>
            <div className="flex flex-col items-center pl-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-surface-400">
                Friend&apos;s Score
              </span>
              <span className="text-3xl font-black text-surface-300 mt-1">
                {targetScore}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsPlaying(true)}
              className="btn-primary w-full text-sm font-bold"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={handleShareBack}
              className="btn-secondary w-full text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>⚔️</span>
              <span>{copied ? 'Link Copied!' : 'CHALLENGE SOMEONE ELSE'}</span>
            </button>
            <Link href="/" className="btn-ghost text-xs text-surface-400 hover:text-white">
              Back to Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-surface-900/60 border border-surface-800 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-3xl mb-4">
            {targetGame.icon}
          </div>
          <h2 className="text-2xl font-black text-white">{targetGame.name}</h2>
          <div className="my-6 p-5 rounded-2xl bg-surface-800/60 border border-surface-700/50 w-full">
            <span className="text-xs uppercase font-mono tracking-wider text-surface-400">
              Target Score to Beat
            </span>
            <div className="text-4xl font-black text-brand-400 mt-1">{targetScore}</div>
          </div>

          <button
            onClick={() => setIsPlaying(true)}
            className="btn-primary w-full text-base font-bold shadow-lg shadow-brand-500/25"
          >
            ACCEPT CHALLENGE & PLAY
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChallengePage() {
  return (
    <div className="page-container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold mb-3 animate-pulse">
          <span>⚔️</span> FRIEND CHALLENGE RECEIVED
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          CAN YOU BEAT MY SCORE?
        </h1>
        <p className="text-surface-400 text-sm sm:text-base mt-2">
          A friend sent you a direct mini-game challenge.
        </p>
      </div>

      <Suspense fallback={<div className="text-center text-surface-400 py-12">Loading challenge...</div>}>
        <ChallengeContent />
      </Suspense>

      <div className="mt-12 max-w-2xl mx-auto">
        <AdSlot type="leaderboard" />
      </div>
    </div>
  );
}
