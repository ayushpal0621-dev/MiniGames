import React from 'react';

interface StatItem {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}

interface StatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatGrid({ stats, columns = 4 }: StatGridProps) {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return (
    <div className={`grid gap-3 sm:gap-4 w-full ${colClasses[columns]}`}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
            stat.highlight
              ? 'bg-brand-950/40 border-brand-500/40 shadow-lg shadow-brand-500/10'
              : 'bg-surface-900/60 border-surface-800'
          }`}
        >
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {stat.value}
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-surface-400 mt-1">
            {stat.label}
          </span>
          {stat.subtext && (
            <span className="text-[10px] text-surface-400 mt-0.5">{stat.subtext}</span>
          )}
        </div>
      ))}
    </div>
  );
}

