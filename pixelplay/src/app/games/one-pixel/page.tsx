import type { Metadata } from 'next';
import { OnePixelGame } from '@/games/one-pixel/OnePixelGame';
import { AdSlot } from '@/components/ui/AdSlot';

export const metadata: Metadata = {
  title: 'One Pixel — Find the Difference',
  description:
    'Spot the single different pixel on the grid before time runs out. The flagship visual observation challenge on PIXELPLAY.',
  openGraph: {
    title: 'One Pixel — PIXELPLAY',
    description: 'Find the different pixel before time runs out. What level can you reach?',
    images: ['/og-one-pixel.png'],
  },
};

export default function OnePixelPage() {
  return (
    <div className="page-container flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <OnePixelGame />
        <AdSlot type="leaderboard" className="mt-8" />
      </div>
    </div>
  );
}

