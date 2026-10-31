'use client';

import React from 'react';
import { GAMES } from '@/lib/constants';
import { GameId } from '@/types';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { usePlayer } from '@/components/providers/PlayerProvider';
import { AdSlot } from '@/components/ui/AdSlot';

export default function LeaderboardPage() {
  const {
    entries,
    filterGame,
    setFilterGame,
    period,
    setPeriod,
    isLoading,
  } = useLeaderboard();
  const { profile } = usePlayer();

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'all', label: 'All Time' },
  ] as const;

  return (
    <div className="page-container max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          GLOBAL LEADERBOARD
        </h1>
        <p className="text-surface-400 text-sm mt-2">
          Compare your best scores with players from around the world.
        </p>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Period Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-surface-900 border border-surface-800 w-full sm:w-auto">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                period === p.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Game Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterGame('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterGame === 'all'
                ? 'bg-surface-700 text-white border-surface-600'
                : 'bg-surface-900 text-surface-400 border-surface-800 hover:text-white'
            }`}
          >
            All Games
          </button>
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setFilterGame(game.id as GameId)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterGame === game.id
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'bg-surface-900 text-surface-400 border-surface-800 hover:text-white'
              }`}
            >
              {game.icon} {game.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-surface-900/60 border border-surface-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-surface-800 grid grid-cols-12 text-xs font-mono uppercase tracking-wider text-surface-400 font-semibold">
          <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
          <div className="col-span-6 sm:col-span-7">Player</div>
          <div className="col-span-4 sm:col-span-4 text-right">Score</div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-surface-400">Loading rankings...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-surface-400">
            No scores posted yet for this period. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-surface-800/60">
            {entries.map((entry) => {
              const isUser = entry.username === profile.username;
              return (
                <div
                  key={`${entry.username}-${entry.gameId}-${entry.rank}`}
                  className={`grid grid-cols-12 items-center p-4 sm:p-5 transition-colors ${
                    isUser
                      ? 'bg-brand-950/40 border-l-4 border-l-brand-500 font-bold'
                      : 'hover:bg-surface-800/30'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 flex justify-center">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        entry.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : entry.rank === 2
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : entry.rank === 3
                          ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                          : 'text-surface-400'
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </div>

                  {/* Player & Country */}
                  <div className="col-span-6 sm:col-span-7 flex items-center gap-3">
                    <span className="text-base sm:text-lg select-none">
                      {entry.country || '🌐'}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isUser ? 'text-brand-300 font-bold' : 'text-white'
                        }`}
                      >
                        {entry.username} {isUser && ' (You)'}
                      </span>
                      <span className="text-[10px] text-surface-400 uppercase font-mono">
                        {GAMES.find((g) => g.id === entry.gameId)?.name || entry.gameId}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-4 sm:col-span-4 text-right">
                    <span className="text-base sm:text-xl font-mono font-black text-brand-400">
                      {typeof entry.score === 'number' && entry.score % 1 !== 0
                        ? `${entry.score.toFixed(2)}%`
                        : entry.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12">
        <AdSlot type="leaderboard" />
      </div>
    </div>
  );
}

