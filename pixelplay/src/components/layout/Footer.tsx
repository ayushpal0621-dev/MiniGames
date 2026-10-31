import React from 'react';
import Link from 'next/link';
import { GAMES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-surface-800/80 bg-surface-950/80 py-10 px-4 sm:px-6 lg:px-8 text-surface-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 font-black text-lg text-white">
            <span className="w-2.5 h-2.5 bg-brand-400 rounded-sm"></span>
            PIXELPLAY
          </div>
          <p className="text-sm text-surface-400">Small Games. Big Scores.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={game.route}
              className="hover:text-white transition-colors"
            >
              {game.name}
            </Link>
          ))}
          <Link href="/daily" className="hover:text-white transition-colors">
            Daily Challenge
          </Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
        </div>

        <div className="text-xs text-surface-400">
          © {new Date().getFullYear()} PIXELPLAY. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

