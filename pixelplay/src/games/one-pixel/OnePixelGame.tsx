'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { GameOverScreen } from '@/components/ui/GameOverScreen';
import {
  generateGrid,
  getGridConfig,
  calculateScore,
  rgbToString,
  type GridData,
} from './utils';
import {
  loadFromStorage,
  saveToStorage,
  getStorageKey,
} from '@/lib/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type GameState = 'idle' | 'playing' | 'levelComplete' | 'gameOver';

interface GameStats {
  bestScore: number;
  bestLevel: number;
  fastestReaction: number;
  totalReactionTime: number;
  totalCorrectClicks: number;
  totalClicks: number;
  gamesPlayed: number;
}

export interface OnePixelGameProps {
  challengeSeed?: number;
  onGameEnd?: (score: number, level: number, stats: GameStats) => void;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STATS_KEY = getStorageKey('one-pixel', 'stats');

const DEFAULT_STATS: GameStats = {
  bestScore: 0,
  bestLevel: 0,
  fastestReaction: Infinity,
  totalReactionTime: 0,
  totalCorrectClicks: 0,
  totalClicks: 0,
  gamesPlayed: 0,
};

const MAX_LIVES = 3;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnePixelGame({
  challengeSeed,
  onGameEnd,
}: OnePixelGameProps) {
  // ── Persistent stats ───────────────────────────────────────────────────────
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  useEffect(() => {
    setStats(loadFromStorage<GameStats>(STATS_KEY, DEFAULT_STATS));
  }, []);
  const persistStats = useCallback((s: GameStats) => {
    setStats(s);
    saveToStorage(STATS_KEY, s);
  }, []);

  // ── Game state ─────────────────────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [grid, setGrid] = useState<GridData | null>(null);
  const [timeLeft, setTimeLeft] = useState(1); // 0–1 fraction
  const [hadWrongClick, setHadWrongClick] = useState(false);

  // ── Per-game tracking ──────────────────────────────────────────────────────
  const [sessionClicks, setSessionClicks] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionReactionTimes, setSessionReactionTimes] = useState<number[]>(
    [],
  );

  // ── Animation state ────────────────────────────────────────────────────────
  const [correctTile, setCorrectTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [gridKey, setGridKey] = useState(0); // forces grid re-render for stagger animation
  const [focusedTile, setFocusedTile] = useState<number | null>(null);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const levelStartTime = useRef(0);
  const rafRef = useRef<number>(0);
  const timeLimitRef = useRef(15);
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const config = useMemo(() => getGridConfig(level), [level]);

  // ── Timer (requestAnimationFrame) ──────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing' || !grid) return;

    timeLimitRef.current = config.timeLimit;
    const startTime = performance.now();
    levelStartTime.current = startTime;
    const duration = config.timeLimit * 1000;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const frac = Math.max(0, 1 - elapsed / duration);
      setTimeLeft(frac);

      if (frac <= 0) {
        // Time's up — lose a life
        handleTimeout();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, grid, config.timeLimit]);

  // ── Start game ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    setLevel(1);
    setScore(0);
    setLives(MAX_LIVES);
    setHadWrongClick(false);
    setCorrectTile(null);
    setWrongTile(null);
    setSessionClicks(0);
    setSessionCorrect(0);
    setSessionReactionTimes([]);
    setFocusedTile(null);

    const newGrid = generateGrid(1, challengeSeed);
    setGrid(newGrid);
    setGridKey((k) => k + 1);
    setGameState('playing');
  }, [challengeSeed]);

  // ── Advance to next level ──────────────────────────────────────────────────
  const advanceLevel = useCallback(() => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setHadWrongClick(false);
    setCorrectTile(null);
    setWrongTile(null);
    setFocusedTile(null);

    const newGrid = generateGrid(nextLevel, challengeSeed);
    setGrid(newGrid);
    setGridKey((k) => k + 1);
    setGameState('playing');
  }, [level, challengeSeed]);

  // ── Handle timeout ─────────────────────────────────────────────────────────
  const handleTimeout = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      endGame();
    } else {
      // Show the answer briefly then continue
      if (grid) setCorrectTile(grid.differentIndex);
      setGameState('levelComplete');
      setTimeout(() => {
        advanceLevel();
      }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lives, grid, advanceLevel]);

  // ── End game ───────────────────────────────────────────────────────────────
  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setGameState('gameOver');

    const avgReaction =
      sessionReactionTimes.length > 0
        ? sessionReactionTimes.reduce((a, b) => a + b, 0) /
          sessionReactionTimes.length
        : 0;

    const fastest =
      sessionReactionTimes.length > 0
        ? Math.min(...sessionReactionTimes)
        : Infinity;

    const newStats: GameStats = {
      bestScore: Math.max(stats.bestScore, score),
      bestLevel: Math.max(stats.bestLevel, level),
      fastestReaction:
        fastest < stats.fastestReaction ? fastest : stats.fastestReaction,
      totalReactionTime: stats.totalReactionTime + (avgReaction || 0),
      totalCorrectClicks: stats.totalCorrectClicks + sessionCorrect,
      totalClicks: stats.totalClicks + sessionClicks,
      gamesPlayed: stats.gamesPlayed + 1,
    };

    persistStats(newStats);
    onGameEnd?.(score, level, newStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    score,
    level,
    stats,
    sessionReactionTimes,
    sessionCorrect,
    sessionClicks,
    persistStats,
    onGameEnd,
  ]);

  // ── Handle tile click ──────────────────────────────────────────────────────
  const handleTileClick = useCallback(
    (index: number) => {
      if (gameState !== 'playing' || !grid) return;
      if (correctTile !== null || wrongTile !== null) return; // animation in progress

      setSessionClicks((c) => c + 1);

      if (index === grid.differentIndex) {
        // ✅ Correct!
        cancelAnimationFrame(rafRef.current);
        const reactionTime = performance.now() - levelStartTime.current;

        setCorrectTile(index);
        setSessionCorrect((c) => c + 1);
        setSessionReactionTimes((times) => [...times, reactionTime]);

        const points = calculateScore(level, reactionTime, hadWrongClick);
        setScore((s) => s + points);

        setGameState('levelComplete');
        setTimeout(() => {
          advanceLevel();
        }, 500);
      } else {
        // ❌ Wrong
        setHadWrongClick(true);
        setWrongTile(index);
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives <= 0) {
          cancelAnimationFrame(rafRef.current);
          // Show the correct tile briefly
          setTimeout(() => {
            setCorrectTile(grid.differentIndex);
            setTimeout(() => endGame(), 600);
          }, 400);
        } else {
          setTimeout(() => setWrongTile(null), 500);
        }
      }
    },
    [
      gameState,
      grid,
      correctTile,
      wrongTile,
      level,
      hadWrongClick,
      lives,
      advanceLevel,
      endGame,
    ],
  );

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (gameState !== 'playing' || !grid) return;
      const size = grid.gridSize;
      const total = size * size;

      let current = focusedTile ?? 0;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          current = current - size >= 0 ? current - size : current;
          setFocusedTile(current);
          break;
        case 'ArrowDown':
          e.preventDefault();
          current = current + size < total ? current + size : current;
          setFocusedTile(current);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          current = current % size > 0 ? current - 1 : current;
          setFocusedTile(current);
          break;
        case 'ArrowRight':
          e.preventDefault();
          current = (current % size) < size - 1 ? current + 1 : current;
          setFocusedTile(current);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedTile !== null) handleTileClick(focusedTile);
          break;
      }
    },
    [gameState, grid, focusedTile, handleTileClick],
  );

  // ── Focus the grid on play ─────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === 'playing' && gridRef.current) {
      gridRef.current.focus();
    }
  }, [gameState, gridKey]);

  // ── Timer bar color ────────────────────────────────────────────────────────
  const timerColor =
    timeLeft > 0.5
      ? 'bg-accent-green'
      : timeLeft > 0.25
        ? 'bg-accent-yellow'
        : 'bg-accent-red';

  // ── Compute game over stats ────────────────────────────────────────────────
  const gameOverStats = useMemo(() => {
    const avgReaction =
      sessionReactionTimes.length > 0
        ? Math.round(
            sessionReactionTimes.reduce((a, b) => a + b, 0) /
              sessionReactionTimes.length,
          )
        : 0;
    const fastest =
      sessionReactionTimes.length > 0
        ? Math.round(Math.min(...sessionReactionTimes))
        : 0;
    const accuracy =
      sessionClicks > 0
        ? Math.round((sessionCorrect / sessionClicks) * 100)
        : 0;

    return [
      { label: 'Level', value: level },
      { label: 'Accuracy', value: `${accuracy}%` },
      { label: 'Avg Time', value: `${(avgReaction / 1000).toFixed(1)}s` },
      { label: 'Fastest', value: `${(fastest / 1000).toFixed(2)}s` },
    ];
  }, [level, sessionReactionTimes, sessionClicks, sessionCorrect]);

  // ── Render ──────────────────────────────────────────────────────────────────

  // Idle screen
  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-12 px-4 animate-fade-in min-h-[70vh]">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
            One<span className="gradient-text"> Pixel</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-xs mx-auto">
            Find the tile that&apos;s a slightly different color. How far can you get?
          </p>
        </div>

        {/* Demo grid */}
        <div className="grid grid-cols-4 gap-1.5 w-32 h-32 opacity-60">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md transition-all duration-300"
              style={{
                backgroundColor:
                  i === 5
                    ? 'rgb(92, 124, 250)'
                    : 'rgb(72, 104, 230)',
              }}
            />
          ))}
        </div>

        {/* Best score */}
        {stats.bestScore > 0 && (
          <div className="text-center">
            <div className="text-surface-500 text-xs uppercase tracking-wider mb-1">
              Best Score
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.bestScore.toLocaleString()}
            </div>
            <div className="text-surface-500 text-xs mt-0.5">
              Level {stats.bestLevel}
            </div>
          </div>
        )}

        <button
          onClick={startGame}
          className="btn-primary text-lg px-10 py-4 animate-glow"
        >
          START
        </button>

        {stats.gamesPlayed > 0 && (
          <div className="text-surface-500 text-xs">
            Games played: {stats.gamesPlayed}
          </div>
        )}
      </div>
    );
  }

  // Game Over screen
  if (gameState === 'gameOver') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <GameOverScreen
          title="Game Over"
          score={score}
          bestScore={Math.max(stats.bestScore, score)}
          isNewBest={score > stats.bestScore}
          stats={gameOverStats}
          onRestart={startGame}
        />
      </div>
    );
  }

  // Playing / Level Complete
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 py-4 px-3 sm:px-4 animate-fade-in select-none">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-lg flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-surface-400 text-xs uppercase tracking-wider">
            Lvl
          </span>
          <span className="text-white font-bold text-lg">{level}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-surface-400 text-2xs uppercase tracking-wider">
            Score
          </span>
          <span className="text-white font-bold text-lg font-mono">
            {score.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-all duration-300 ${
                i < lives
                  ? 'text-accent-red scale-100'
                  : 'text-surface-700 scale-75'
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* ── Timer bar ──────────────────────────────────────────────────── */}
      <div className="w-full max-w-lg h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${timerColor} rounded-full transition-colors duration-300`}
          style={{
            width: `${timeLeft * 100}%`,
            transition: 'width 100ms linear, background-color 300ms',
          }}
        />
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      {grid && (
        <div
          ref={gridRef}
          key={gridKey}
          className="w-full max-w-lg aspect-square outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="grid"
          aria-label={`${grid.gridSize} by ${grid.gridSize} grid. Find the different tile.`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${grid.gridSize}, 1fr)`,
            gap: `${Math.max(2, 6 - Math.floor(grid.gridSize / 3))}px`,
          }}
        >
          {Array.from({ length: grid.gridSize * grid.gridSize }).map(
            (_, i) => {
              const isDifferent = i === grid.differentIndex;
              const isCorrect = correctTile === i;
              const isWrong = wrongTile === i;
              const isFocused = focusedTile === i;

              // Stagger delay for entrance animation
              const row = Math.floor(i / grid.gridSize);
              const col = i % grid.gridSize;
              const staggerDelay = (row + col) * 15;

              return (
                <button
                  key={i}
                  onClick={() => handleTileClick(i)}
                  disabled={gameState !== 'playing'}
                  role="gridcell"
                  aria-label={`Tile row ${row + 1}, column ${col + 1}`}
                  className={`
                    rounded-lg cursor-pointer transition-transform duration-150
                    min-h-[12px] min-w-[12px]
                    hover:scale-105 active:scale-95
                    focus:outline-none
                    ${isCorrect ? 'animate-correct-pulse ring-2 ring-accent-green' : ''}
                    ${isWrong ? 'animate-shake ring-2 ring-accent-red' : ''}
                    ${isFocused ? 'ring-2 ring-brand-400 ring-offset-1 ring-offset-surface-900' : ''}
                  `}
                  style={{
                    backgroundColor: isDifferent
                      ? rgbToString(grid.differentColor)
                      : rgbToString(grid.baseColor),
                    animationDelay: `${staggerDelay}ms`,
                    animation: `tileAppear 0.25s ${staggerDelay}ms ease-out both`,
                    ...(isCorrect
                      ? { backgroundColor: 'rgb(16, 185, 129)' }
                      : {}),
                    ...(isWrong
                      ? { backgroundColor: 'rgb(239, 68, 68)' }
                      : {}),
                  }}
                />
              );
            },
          )}
        </div>
      )}

      {/* ── Confetti particles (CSS only) on correct ───────────────────── */}
      {correctTile !== null && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: '50%',
                top: '40%',
                backgroundColor: [
                  '#10b981',
                  '#5c7cfa',
                  '#f59e0b',
                  '#ec4899',
                  '#06b6d4',
                  '#8b5cf6',
                ][i % 6],
                animation: `confetti 0.6s ${i * 30}ms ease-out forwards`,
                '--confetti-x': `${(Math.random() - 0.5) * 200}px`,
                '--confetti-y': `${-Math.random() * 150 - 50}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* ── Inline styles for animations ───────────────────────────────── */}
      <style jsx>{`
        @keyframes tileAppear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes confetti {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--confetti-x, 0px), var(--confetti-y, -100px))
              scale(0) rotate(360deg);
          }
        }

        .animate-correct-pulse {
          animation: correctPulse 0.4s ease-out;
        }

        @keyframes correctPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
          }
          50% {
            transform: scale(1.15);
            box-shadow: 0 0 20px 4px rgba(16, 185, 129, 0.4);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </div>
  );
}

export { OnePixelGame };
