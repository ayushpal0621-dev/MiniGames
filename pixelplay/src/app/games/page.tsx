import type { Metadata } from 'next';
import { GAMES } from '@/lib/constants';
import { GameCard } from '@/components/ui/GameCard';
import { AdSlot } from '@/components/ui/AdSlot';

export const metadata: Metadata = {
  title: 'All Mini Games — PIXELPLAY',
  description:
    'Play One Pixel, 0.001 Second, Memory 5, and Don\'t Trust the UI. Quick, addictive browser arcade games.',
};

export default function GamesPage() {
  return (
    <div className="page-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          CHOOSE YOUR GAME
        </h1>
        <p className="text-surface-400 text-sm sm:text-base mt-2">
          Every game is designed to be understood in 3 seconds. Beat your best score or challenge a friend.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      <div className="mt-12">
        <AdSlot type="leaderboard" />
      </div>
    </div>
  );
}

