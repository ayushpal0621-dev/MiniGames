'use client';

import React from 'react';
import Link from 'next/link';
import { GAMES } from '@/lib/constants';
import { GameCard } from '@/components/ui/GameCard';
import { StatGrid } from '@/components/ui/StatGrid';
import { AdSlot } from '@/components/ui/AdSlot';
import { usePlayer } from '@/components/providers/PlayerProvider';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getDailyGameId, getTimeUntilNextChallenge, formatCountdown } from '@/lib/daily-challenge';

export default function HomePage() {
  const { profile } = usePlayer();
  const { entries } = useLeaderboard();
  const [timeUntilDaily, setTimeUntilDaily] = React.useState('');

  const todayGameId = getDailyGameId();
  const todayGame = GAMES.find((g) => g.id === todayGameId) || GAMES[0];

  React.useEffect(() => {
    const updateCountdown = () => {
      const ms = getTimeUntilNextChallenge();
      setTimeUntilDaily(formatCountdown(ms));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Top 3 players for today's leaderboard snippet
  const topPlayers = entries.slice(0, 3);

  return (
    <div className="page-container flex flex-col items-center">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-10 sm:pt-16 pb-12 sm:pb-16 text-center flex flex-col items-center">
        {/* Modern Arcade Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-900 border border-surface-800 text-xs font-semibold text-brand-400 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>MODERN ARCADE PLATFORM</span>
        </div>

        {/* Brand Title */}
        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-none mb-4">
          PIXEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-accent-purple">PLAY</span>
        </h1>

        {/* Tagline & Subheading */}
        <p className="text-xl sm:text-2xl font-bold text-surface-200 mb-2">
          &ldquo;Small Games. Big Scores.&rdquo;
        </p>
        <p className="text-sm sm:text-base text-surface-400 max-w-md mx-auto mb-8 text-balance">
          Four tiny games. One goal: beat your best score.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/games/one-pixel"
            className="btn-primary px-8 py-3.5 text-base font-black shadow-xl shadow-brand-500/25 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
          >
            PLAY NOW
          </Link>
          <Link
            href="/daily"
            className="btn-secondary px-6 py-3.5 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>📅</span>
            <span>DAILY CHALLENGE</span>
          </Link>
        </div>

        {/* Player Stats Bar */}
        <div className="w-full max-w-2xl mt-12">
          <StatGrid
            columns={3}
            stats={[
              {
                label: 'Total Games Played',
                value: profile.stats.totalGames.toLocaleString(),
              },
              {
                label: 'Current Streak',
                value: `${profile.stats.currentStreak} 🔥`,
              },
              {
                label: 'Total Points',
                value: profile.stats.totalScore.toLocaleString(),
                highlight: true,
              },
            ]}
          />
        </div>
      </section>

      {/* ─── Games Grid ───────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="section-title">THE MINI GAMES</h2>
            <p className="text-surface-400 text-sm mt-1">
              Pick a challenge and test your observation, reflexes, and memory.
            </p>
          </div>
          <Link
            href="/games"
            className="text-brand-400 hover:text-brand-300 text-sm font-semibold inline-flex items-center gap-1 group"
          >
            Browse All Games
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GAMES.map((game, idx) => (
            <GameCard key={game.id} game={game} featured={idx === 0} />
          ))}
        </div>
      </section>

      {/* ─── Daily Challenge & Leaderboard Widget ─────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daily Challenge Highlight */}
          <div className="lg:col-span-7 bg-surface-900/60 border border-surface-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="badge-brand">TODAY&apos;S DAILY CHALLENGE</span>
                <span className="text-xs font-mono font-semibold text-surface-400">
                  Resets in {timeUntilDaily || '...'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                {todayGame.name} Daily Run
              </h3>
              <p className="text-surface-400 text-sm leading-relaxed max-w-lg mb-6">
                Every player receives the exact same seed today. One attempt on the global board to
                prove your supremacy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-surface-800/80">
              <Link
                href="/daily"
                className="btn-primary w-full sm:w-auto px-6 py-3 font-bold"
              >
                ENTER TODAY&apos;S CHALLENGE
              </Link>
              <span className="text-xs text-surface-400">
                Shared deterministic seed across all users worldwide
              </span>
            </div>
          </div>

          {/* Today's Leaderboard Preview */}
          <div className="lg:col-span-5 bg-surface-900/60 border border-surface-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🏆</span> TODAY&apos;S RANKING
                </h3>
                <Link
                  href="/leaderboard"
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {topPlayers.map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface-800/40 border border-surface-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          player.rank === 1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : player.rank === 2
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                            : 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                        }`}
                      >
                        {player.rank}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{player.country || '🌐'}</span>
                        <span className="text-sm font-semibold text-white">
                          {player.username}
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

            <div className="mt-5 pt-4 border-t border-surface-800/80 flex items-center justify-between text-xs text-surface-400">
              <span>Your Personal Best:</span>
              <span className="font-bold text-white">
                {Math.max(...Object.values(profile.stats.bestScores), 0).toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ad slot between sections */}
      <section className="w-full max-w-5xl mx-auto px-4">
        <AdSlot type="leaderboard" />
      </section>
    </div>
  );
}

