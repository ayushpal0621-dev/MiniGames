'use client';

import React, { useState } from 'react';
import { GameId } from '@/types';
import { generateChallengeUrl, shareResult } from '@/lib/sharing';
import { useSound } from '@/components/providers/SoundProvider';

interface ShareButtonProps {
  gameId: GameId;
  score: number;
  label?: string;
  className?: string;
}

export function ShareButton({
  gameId,
  score,
  label = 'CHALLENGE FRIEND',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { playClick } = useSound();

  const handleShare = async () => {
    playClick();
    const challengeUrl = generateChallengeUrl(gameId, score);
    const message = `Can you beat my ${score.toLocaleString()} score on PIXELPLAY? Play here: ${challengeUrl}`;

    const shared = await shareResult({
      game: gameId,
      score,
      message,
    });

    if (!shared) {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        window.prompt('Copy challenge link:', message);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`btn-secondary gap-2 ${className}`}
      aria-label="Share Challenge Link"
    >
      <span>⚔️</span>
      <span>{copied ? 'Link Copied!' : label}</span>
    </button>
  );
}

