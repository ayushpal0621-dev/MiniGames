'use client';

import React from 'react';
import { AdSlotType } from '@/types';

interface AdSlotProps {
  type?: AdSlotType;
  className?: string;
  onRewardGranted?: () => void;
}

/**
 * Reusable ad placeholder component for Google AdSense / AdMob integration.
 * - Ad types: leaderboard, interstitial-transition, rewarded
 * - Never displayed during active gameplay
 * - Clean fallbacks and development placeholder styling
 */
export function AdSlot({
  type = 'leaderboard',
  className = '',
  onRewardGranted,
}: AdSlotProps) {
  // Only display in production with explicit ad publisher id, otherwise safe development placeholder
  const isDev = process.env.NODE_ENV === 'development';

  if (type === 'rewarded') {
    return (
      <div
        className={`p-4 rounded-2xl bg-surface-900/60 border border-brand-500/30 flex flex-col items-center justify-center text-center gap-2 ${className}`}
      >
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
          Rewarded Bonus
        </span>
        <p className="text-xs text-surface-300">
          Watch a quick sponsor moment to receive +1 extra life / retry.
        </p>
        <button
          onClick={() => {
            // Simulated rewarded ad watch completion
            if (onRewardGranted) onRewardGranted();
          }}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-transform active:scale-95"
        >
          Watch to Continue (Ad)
        </button>
      </div>
    );
  }

  const heightMap: Record<AdSlotType, string> = {
    leaderboard: 'min-h-[90px] max-w-[728px]',
    'interstitial-transition': 'min-h-[250px] max-w-[300px]',
    rewarded: 'min-h-[120px] max-w-[320px]',
  };

  return (
    <div
      className={`w-full mx-auto my-4 ${heightMap[type] || 'min-h-[90px]'} bg-surface-900/30 border border-dashed border-surface-800/60 rounded-xl flex flex-col items-center justify-center text-surface-600 text-xs p-3 transition-opacity ${className}`}
      aria-hidden="true"
    >
      <span className="text-[10px] uppercase font-mono tracking-wider text-surface-500">
        Advertisement • {type}
      </span>
      {isDev && (
        <span className="text-[10px] text-surface-600 mt-1">
          (Google AdSense unit placeholder)
        </span>
      )}
    </div>
  );
}
