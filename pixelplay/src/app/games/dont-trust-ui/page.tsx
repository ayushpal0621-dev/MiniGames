import type { Metadata } from 'next';
import { DontTrustUIGame } from '@/games/dont-trust-ui/DontTrustUIGame';
import { AdSlot } from '@/components/ui/AdSlot';

export const metadata: Metadata = {
  title: "Don't Trust the UI — The Game Is Lying",
  description:
    "The game is lying to you. Figure out what it wants before time expires. The viral reaction test on PIXELPLAY.",
  openGraph: {
    title: "Don't Trust the UI — PIXELPLAY",
    description: 'The game is lying. Figure out what it wants.',
    images: ['/og-dont-trust-ui.png'],
  },
};

export default function DontTrustUIPage() {
  return (
    <div className="page-container flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <DontTrustUIGame />
        <AdSlot type="leaderboard" className="mt-8" />
      </div>
    </div>
  );
}

