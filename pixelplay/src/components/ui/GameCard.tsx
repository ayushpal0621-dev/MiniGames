'use client';

import React from 'react';
import Link from 'next/link';
import { GameInfo } from '@/types';
import { usePlayer } from '@/components/providers/PlayerProvider';

interface GameCardProps {
  game: GameInfo;
  featured?: boolean;
}

export function GameCard({ game, featured = false }: GameCardProps) {
  const { profile } = usePlayer();
  const personalBest = profile.stats.bestScores[game.id] || 0;

  // Accent styling mapping
  const colorMap: Record<string, { badge: string; border: string; glow: string; text: string; btn: string }> = {
    'brand-500': {
      badge: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
      border: 'hover:border-brand-500/50',
      glow: 'group-hover:shadow-brand-500/10',
      text: 'text-brand-400',
      btn: 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30',
    },
    'accent-cyan': {
      badge: 'bg-accent-cyan/15 text-cyan-300 border-accent-cyan/30',
      border: 'hover:border-accent-cyan/50',
      glow: 'group-hover:shadow-accent-cyan/10',
      text: 'text-cyan-400',
      btn: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30',
    },
    'accent-green': {
      badge: 'bg-accent-green/15 text-emerald-300 border-accent-green/30',
      border: 'hover:border-accent-green/50',
      glow: 'group-hover:shadow-accent-green/10',
      text: 'text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
    },
    'accent-purple': {
      badge: 'bg-accent-purple/15 text-purple-300 border-accent-purple/30',
      border: 'hover:border-accent-purple/50',
      glow: 'group-hover:shadow-accent-purple/10',
      text: 'text-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30',
    },
  };

  const scheme = colorMap[game.color] || colorMap['brand-500'];

  return (
    <div
      className={`group relative flex flex-col justify-between bg-surface-900/70 border border-surface-800 rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${scheme.border} ${scheme.glow} ${
        featured ? 'ring-1 ring-brand-500/30 bg-surface-900/90' : ''
      }`}
    >
      <div>
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border ${scheme.badge}`}
          >
            {game.category}
          </span>
          <span className="text-2xl sm:text-3xl select-none" aria-hidden="true">
            {game.icon}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-brand-300 transition-colors">
          {game.name}
        </h3>

        {/* Description */}
        <p className="text-surface-400 text-sm mt-2 leading-relaxed">
          &ldquo;{game.description}&rdquo;
        </p>
      </div>

      {/* Footer / CTA section */}
      <div className="mt-6 pt-5 border-t border-surface-800/80 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-surface-400 font-semibold block">
            Best Score
          </span>
          <span className="text-base sm:text-lg font-bold text-white">
            {personalBest > 0 ? (
              personalBest % 1 !== 0 ? (
                `${personalBest.toFixed(2)}%`
              ) : (
                personalBest.toLocaleString()
              )
            ) : (
              <span className="text-surface-400 text-sm font-normal">—</span>
            )}
          </span>
        </div>

        <Link
          href={game.route}
          className={`inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold text-white text-sm tracking-wide shadow-lg transition-transform active:scale-95 group-hover:scale-105 min-h-[44px] ${scheme.btn}`}
        >
          PLAY
        </Link>
      </div>
    </div>
  );
}

