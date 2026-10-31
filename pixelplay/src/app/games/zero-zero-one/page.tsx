import type { Metadata } from 'next';
import { ZeroZeroOneGame } from '@/games/zero-zero-one/ZeroZeroOneGame';
import { AdSlot } from '@/components/ui/AdSlot';

export const metadata: Metadata = {
  title: '0.001 Second — Center Precision Reflex',
  description:
    'Stop the target as close to 50.000% center as possible. Can you score 100.00% precision on PIXELPLAY?',
  openGraph: {
    title: '0.001 Second — PIXELPLAY',
    description: 'Stop the target at exactly the right moment. Test your micro-reflexes.',
    images: ['/og-zero-zero-one.png'],
  },
};

export default function ZeroZeroOnePage() {
  return (
    <div className="page-container flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <ZeroZeroOneGame />
        <AdSlot type="leaderboard" className="mt-8" />
      </div>
    </div>
  );
}

