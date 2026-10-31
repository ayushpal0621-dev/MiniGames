'use client';

import React from 'react';

interface CountdownTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CountdownTimer({
  timeLeft,
  totalTime,
  size = 56,
  strokeWidth = 4,
  label,
}: CountdownTimerProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeLeft / (totalTime || 1)));
  const strokeDashoffset = circumference - progress * circumference;

  // Color transition based on remaining time percentage
  const getColor = () => {
    if (progress > 0.5) return 'text-accent-green stroke-accent-green';
    if (progress > 0.25) return 'text-accent-yellow stroke-accent-yellow';
    return 'text-accent-red stroke-accent-red';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-surface-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`transition-all duration-100 ease-linear ${getColor()}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs sm:text-sm font-mono font-bold text-white leading-none">
          {Math.ceil(timeLeft)}s
        </span>
        {label && <span className="text-[8px] text-surface-400 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

