import type { Metadata } from 'next';
import { Memory5Game } from '@/games/memory-5/Memory5Game';
import { AdSlot } from '@/components/ui/AdSlot';

export const metadata: Metadata = {
  title: 'Memory 5 — Sequence Recall Challenge',
  description:
    'Remember the sequence. Beat your previous score. Can you master 10+ symbols in order on PIXELPLAY?',
  openGraph: {
    title: 'Memory 5 — PIXELPLAY',
    description: 'Remember the sequence. Beat your previous score.',
    images: ['/og-memory-5.png'],
  },
};

export default function Memory5Page() {
  return (
    <div className="page-container flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <Memory5Game />
        <AdSlot type="leaderboard" className="mt-8" />
      </div>
    </div>
  );
}

