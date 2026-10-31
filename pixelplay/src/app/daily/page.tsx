'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GAMES } from '@/lib/constants';
import {
  getDailyGameId,
  getDailySeed,
  getTimeUntilNextChallenge,
  formatCountdown,
} from '@/lib/daily-challenge';
import { usePlayer } from '@/components/providers/PlayerProvider';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { OnePixelGame } from '@/games/one-pixel/OnePixelGame';
import { ZeroZeroOneGame } from '@/games/zero-zero-one/ZeroZeroOneGame';
import { Memory5Game } from '@/games/memory-5/Memory5Game';
import { DontTrustUIGame } from '@/games/dont-trust-ui/DontTrustUIGame';
import { AdSlot } from '@/components/ui/AdSlot';
import { getDailyProgress, saveDailyProgress } from '@/lib/storage';
import { generateChallengeUrl, shareResult } from '@/lib/sharing';

export default function DailyChallengePage() {
  const { profile } = usePlayer();
  const { entries, addEntry } = useLeaderboard();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [dailyScore, setDailyScore] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('');
  const [copied, setCopied] = useState(false);

  const todayGameId = getDailyGameId();
  const dailySeed = getDailySeed();
  const targetGame = GAMES.find((g) => g.id === todayGameId) || GAMES[0];

  useEffect(() => {
    // Check if player has already submitted a score for today's challenge
    const progress = getDailyProgress();
    if (progress.completed) {
      setHasCompleted(true);
      setDailyScore(progress.score);
    }

    const timer = setInterval(() => {
      const ms = getTimeUntilNextChallenge();
      setCountdown(formatCountdown(ms));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGameEnd = (score: number) => {
    setDailyScore(score);
    setHasCompleted(true);
    setIsPlaying(false);
    saveDailyProgress({ completed: true, score });

    addEntry({
      username: profile.username || 'You',
      score,
      country: '🌐',
      gameId: todayGameId,
    });
  };

  const handleShare = async () => {
    if (dailyScore === null) return;
    const challengeUrl = generateChallengeUrl(todayGameId, dailyScore, dailySeed);
    const message = `I scored ${dailyScore} on today's PIXELPLAY Daily Challenge (${targetGame.name})! Can you beat me? Play: ${challengeUrl}`;

    const shared = await shareResult({
      game: todayGameId,
      score: dailyScore,
      message,
    });

    if (!shared) {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        window.prompt('Copy your daily score link:', message);
      }
    }
  };

  // Render the specific game seeded deterministically
  const renderGame = () => {
    switch (todayGameId) {
      case 'one-pixel':
        return <OnePixelGame challengeSeed={dailySeed} onGameEnd={handleGameEnd} />;
      case 'zero-zero-one':
        return <ZeroZeroOneGame challengeSeed={dailySeed} onGameEnd={handleGameEnd} />;
      case 'memory-5':
        return <Memory5Game challengeSeed={dailySeed} onGameEnd={handleGameEnd} />;
      case 'dont-trust-ui':
        return <DontTrustUIGame challengeSeed={dailySeed} onGameEnd={handleGameEnd} />;
      default:
        return <OnePixelGame challengeSeed={dailySeed} onGameEnd={handleGameEnd} />;
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="badge-brand mb-2">GLOBAL DAILY RUN</span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          DAILY CHALLENGE
        </h1>
        <p className="text-surface-400 text-sm sm:text-base mt-2">
          &ldquo;Today&apos;s challenge: <strong className="text-white">{targetGame.name}</strong>&rdquo;
        </p>
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-surface-900 border border-surface-800 text-xs text-surface-300 font-mono">
          <span>⏳ Resets in:</span>
          <span className="text-white font-bold">{countdown || '00:00:00'}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Game Play Area */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {isPlaying ? (
            <div className="w-full">{renderGame()}</div>
          ) : hasCompleted ? (
            <div className="w-full bg-surface-900/60 border border-surface-800 rounded-3xl p-8 text-center flex flex-col items-center shadow-2xl">
              <span className="text-4xl mb-3">🏅</span>
              <h2 className="text-2xl font-black text-white">Daily Run Completed!</h2>
              <p className="text-surface-400 text-sm mt-1 max-w-xs">
                You have posted your official score for today&apos;s seed.
              </p>

              <div className="my-6 p-6 rounded-2xl bg-surface-800/60 border border-surface-700/50 w-full max-w-xs">
                <span className="text-xs uppercase font-mono tracking-wider text-surface-400">
                  Your Today&apos;s Score
                </span>
                <div className="text-5xl font-black text-brand-400 mt-1">
                  {dailyScore !== null
                    ? typeof dailyScore === 'number' && dailyScore % 1 !== 0
                      ? `${dailyScore.toFixed(2)}%`
                      : dailyScore.toLocaleString()
                    : '0'}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={handleShare}
                  className="btn-primary w-full text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span>📢</span>
                  <span>{copied ? 'Copied to Clipboard!' : 'SHARE YOUR DAILY SCORE'}</span>
                </button>
                <button
                  onClick={() => setIsPlaying(true)}
                  className="btn-secondary w-full text-xs"
                >
                  Practice Run (Unranked)
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-surface-900/60 border border-surface-800 rounded-3xl p-8 text-center flex flex-col items-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-3xl mb-4">
                {targetGame.icon}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {targetGame.name}
              </h2>
              <p className="text-surface-400 text-sm mt-2 max-w-md">
                One global seed for everyone today. Test your skill against players worldwide.
              </p>

              <div className="my-6 p-4 rounded-xl bg-surface-800/40 border border-surface-700/30 text-xs text-surface-300">
                Seed: <span className="font-mono text-brand-400 font-bold">#{dailySeed}</span> • 100% fair and deterministic
              </div>

              <button
                onClick={() => setIsPlaying(true)}
                className="btn-primary px-8 py-3.5 text-base font-bold shadow-lg shadow-brand-500/25 w-full max-w-xs"
              >
                START DAILY RUN
              </button>
            </div>
          )}
        </div>

        {/* Global Daily Leaderboard */}
        <div className="lg:col-span-5 bg-surface-900/60 border border-surface-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-800">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <span>🏆</span> TODAY&apos;S RANKING
              </h3>
              <span className="text-xs font-mono text-surface-400">Global Board</span>
            </div>

            <div className="space-y-2.5">
              {entries.slice(0, 10).map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    player.username === profile.username
                      ? 'bg-brand-950/40 border-brand-500/50 shadow-sm'
                      : 'bg-surface-800/40 border-surface-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        player.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : player.rank === 2
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : player.rank === 3
                          ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                          : 'text-surface-400'
                      }`}
                    >
                      {player.rank}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{player.country || '🌐'}</span>
                      <span
                        className={`text-sm font-semibold ${
                          player.username === profile.username ? 'text-brand-300' : 'text-white'
                        }`}
                      >
                        {player.username}
                        {player.username === profile.username && ' (You)'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-brand-400">
                    {typeof player.score === 'number' && player.score % 1 !== 0
                      ? `${player.score.toFixed(2)}%`
                      : player.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-800 text-center">
            <Link
              href="/leaderboard"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              View Full Leaderboard & Filter By Games →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <AdSlot type="leaderboard" />
      </div>
    </div>
  );
}

