'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  calculateAccuracy,
  getAccuracyTier,
  getRoundConfig,
  formatAccuracy,
  type RoundConfig,
} from './utils';
import { GameOverScreen } from '@/components/ui/GameOverScreen';
import {
  getStorageKey,
  loadFromStorage,
  saveToStorage,
} from '@/lib/storage';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ZeroZeroOneGameProps {
  challengeSeed?: number;
  onGameEnd?: (score: number, rounds: number, stats: Record<string, unknown>) => void;
}

type GameState = 'idle' | 'ready' | 'stopped' | 'next' | 'gameover';

interface RoundResult {
  round: number;
  accuracy: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY_BEST = getStorageKey('zero-zero-one', 'bestScore');
const STORAGE_KEY_BEST_ACC = getStorageKey('zero-zero-one', 'bestAccuracy');
const BASE_SPEED = 0.35; // percentage of track per ms
const RESULT_DISPLAY_MS = 1600;
const TRANSITION_MS = 600;

/* ------------------------------------------------------------------ */
/*  Particle burst component                                          */
/* ------------------------------------------------------------------ */

function ParticleBurst({ x }: { x: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 30 + Math.random() * 50;
      const size = 3 + Math.random() * 4;
      return { angle, dist, size, delay: Math.random() * 0.08 };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${x}%`,
            top: '50%',
            width: p.size,
            height: p.size,
            background: `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 20}%)`,
            animation: `particle-burst 0.7s ${p.delay}s ease-out forwards`,
            ['--dx' as string]: `${Math.cos(p.angle) * p.dist}px`,
            ['--dy' as string]: `${Math.sin(p.angle) * p.dist}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes particle-burst {
          0% { opacity:1; transform: translate(-50%,-50%) translate(0,0) scale(1); }
          100% { opacity:0; transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Game Component                                                */
/* ------------------------------------------------------------------ */

export default function ZeroZeroOneGame({
  onGameEnd,
}: ZeroZeroOneGameProps) {
  /* --- persisted best --- */
  const [bestScore, setBestScore] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);

  /* --- game state --- */
  const [gameState, setGameState] = useState<GameState>('idle');
  const [round, setRound] = useState(1);
  const [roundConfig, setRoundConfig] = useState<RoundConfig>(getRoundConfig(1));
  const [totalScore, setTotalScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lowRoundsCount, setLowRoundsCount] = useState(0);

  /* --- per-round --- */
  const [targetPct, setTargetPct] = useState(0); // 0‒100
  const [stoppedPct, setStoppedPct] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [displayedAccuracy, setDisplayedAccuracy] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  /* --- refs --- */
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const positionRef = useRef(0); // 0–100
  const directionRef = useRef(1); // 1 = right, -1 = left
  const accumulatorRef = useRef(0); // for variable speed sine
  const reversalTimerRef = useRef(0);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countUpRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  /* --- load best from storage on mount --- */
  useEffect(() => {
    setBestScore(loadFromStorage<number>(STORAGE_KEY_BEST, 0));
    setBestAccuracy(loadFromStorage<number>(STORAGE_KEY_BEST_ACC, 0));
  }, []);

  /* --- cleanup all timers on unmount --- */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current);
    };
  }, []);

  /* --- animation loop --- */
  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const delta = Math.min(time - lastTimeRef.current, 32); // cap at ~30fps min
      lastTimeRef.current = time;

      const config = getRoundConfig(round);
      let speed = BASE_SPEED * config.speed;

      // Variable speed via sine modulation
      if (config.hasVariableSpeed) {
        accumulatorRef.current += delta * 0.002;
        speed *= 0.7 + 0.6 * Math.sin(accumulatorRef.current);
      }

      // Random direction reversal
      if (config.hasReversal) {
        reversalTimerRef.current += delta;
        if (reversalTimerRef.current > 400 + Math.random() * 1200) {
          if (Math.random() < 0.15) {
            directionRef.current *= -1;
          }
          reversalTimerRef.current = 0;
        }
      }

      let pos = positionRef.current + directionRef.current * speed * delta * 0.1;

      // Bounce
      if (pos >= 100) {
        pos = 100 - (pos - 100);
        directionRef.current = -1;
      } else if (pos <= 0) {
        pos = Math.abs(pos);
        directionRef.current = 1;
      }

      positionRef.current = pos;
      setTargetPct(pos);

      rafRef.current = requestAnimationFrame(animate);
    },
    [round],
  );

  /* --- start round animation --- */
  const startMoving = useCallback(() => {
    positionRef.current = Math.random() * 30 + 10; // random start 10–40%
    directionRef.current = 1;
    accumulatorRef.current = 0;
    reversalTimerRef.current = 0;
    lastTimeRef.current = 0;
    setTargetPct(positionRef.current);
    setStoppedPct(null);
    setAccuracy(null);
    setDisplayedAccuracy(0);
    setShowParticles(false);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  /* --- stop target --- */
  const stopTarget = useCallback(() => {
    if (gameState !== 'ready') return;

    // Immediately cancel animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const pos = positionRef.current;
    setStoppedPct(pos);

    // Calculate accuracy based on percentage distance from 50%
    const acc = Math.max(0, Math.round((100 - Math.abs(pos - 50) * 2) * 100) / 100);
    setAccuracy(acc);
    setGameState('stopped');

    // Particles for perfect
    if (acc >= 99) {
      setShowParticles(true);
    }

    // Count-up animation for accuracy display
    const startTime = performance.now();
    const duration = 350;
    const countUp = (t: number) => {
      const elapsed = t - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedAccuracy(Math.round(eased * acc * 100) / 100);
      if (progress < 1) {
        countUpRef.current = requestAnimationFrame(countUp);
      }
    };
    countUpRef.current = requestAnimationFrame(countUp);

    // Update results
    const newResult: RoundResult = { round, accuracy: acc };
    const newResults = [...results, newResult];
    setResults(newResults);

    const newTotal = totalScore + acc;
    setTotalScore(newTotal);

    // Track best accuracy
    if (acc > bestAccuracy) {
      setBestAccuracy(acc);
      saveToStorage(STORAGE_KEY_BEST_ACC, acc);
    }

    // Check game-over conditions
    const newLowCount = acc < 80 ? lowRoundsCount + 1 : 0;
    setLowRoundsCount(newLowCount);

    const isGameOver = acc < 50 || newLowCount >= 3;

    // After showing result, transition
    resultTimerRef.current = setTimeout(
      () => {
        if (isGameOver) {
          // Save best score
          const finalScore = Math.round(newTotal);
          if (finalScore > bestScore) {
            setBestScore(finalScore);
            saveToStorage(STORAGE_KEY_BEST, finalScore);
          }
          setGameState('gameover');
          onGameEnd?.(finalScore, round, {
            roundsCompleted: round,
            bestAccuracy: Math.max(
              bestAccuracy,
              ...newResults.map((r) => r.accuracy),
            ),
            averageAccuracy:
              Math.round(
                (newResults.reduce((s, r) => s + r.accuracy, 0) /
                  newResults.length) *
                  100,
              ) / 100,
            totalScore: finalScore,
          });
        } else {
          setGameState('next');
          const nextRound = round + 1;
          transitionTimerRef.current = setTimeout(() => {
            setRound(nextRound);
            setRoundConfig(getRoundConfig(nextRound));
            setGameState('ready');
          }, TRANSITION_MS);
        }
      },
      RESULT_DISPLAY_MS,
    );
  }, [
    gameState,
    round,
    results,
    totalScore,
    bestScore,
    bestAccuracy,
    lowRoundsCount,
    onGameEnd,
  ]);

  /* --- start moving whenever we enter "ready" --- */
  useEffect(() => {
    if (gameState === 'ready') {
      startMoving();
    }
  }, [gameState, startMoving]);

  /* --- keyboard: space to stop --- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameState === 'idle') {
          startGame();
        } else if (gameState === 'ready') {
          stopTarget();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, stopTarget]);

  /* --- start game --- */
  const startGame = useCallback(() => {
    setRound(1);
    setRoundConfig(getRoundConfig(1));
    setTotalScore(0);
    setResults([]);
    setLowRoundsCount(0);
    setStoppedPct(null);
    setAccuracy(null);
    setShowParticles(false);
    setGameState('ready');
  }, []);

  /* --- computed values --- */
  const tier = accuracy !== null ? getAccuracyTier(accuracy) : null;
  const avgAccuracy =
    results.length > 0
      ? Math.round(
          (results.reduce((s, r) => s + r.accuracy, 0) / results.length) * 100,
        ) / 100
      : 0;
  const currentBestAcc =
    results.length > 0
      ? Math.max(...results.map((r) => r.accuracy))
      : 0;

  /* --- recent dots (last 10) --- */
  const recentResults = results.slice(-10);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  /* ---------- IDLE STATE ---------- */
  if (gameState === 'idle') {
    return (
      <div className="game-container flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Title */}
          <div className="relative">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white">
              0.001
            </h1>
            <span className="text-lg sm:text-xl font-semibold text-brand-400 tracking-widest uppercase">
              Second
            </span>
          </div>

          <p className="text-surface-400 max-w-sm text-sm sm:text-base leading-relaxed">
            Stop the target at the <span className="text-white font-semibold">perfect center</span>.
            <br />
            How precise are your reflexes?
          </p>

          {/* Best score display */}
          {bestScore > 0 && (
            <div className="flex gap-4 text-sm">
              <div className="stat-card px-4 py-2">
                <span className="stat-value text-base">{Math.round(bestScore)}</span>
                <span className="stat-label text-2xs">Best Score</span>
              </div>
              <div className="stat-card px-4 py-2">
                <span className="stat-value text-base">{formatAccuracy(bestAccuracy)}</span>
                <span className="stat-label text-2xs">Best Accuracy</span>
              </div>
            </div>
          )}

          <button
            onClick={startGame}
            className="btn-primary text-lg px-10 py-4 mt-2 animate-glow"
          >
            START
          </button>

          <span className="text-surface-500 text-xs">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700 text-surface-300 font-mono text-2xs">SPACE</kbd> or tap to play
          </span>
        </div>
      </div>
    );
  }

  /* ---------- GAME OVER ---------- */
  if (gameState === 'gameover') {
    const finalScore = Math.round(totalScore);
    return (
      <div className="game-container min-h-[70vh] flex items-center justify-center">
        <GameOverScreen
          title="Game Over"
          score={finalScore}
          bestScore={Math.max(bestScore, finalScore)}
          isNewBest={finalScore >= bestScore && bestScore > 0}
          stats={[
            { label: 'Rounds', value: results.length },
            { label: 'Best Accuracy', value: formatAccuracy(currentBestAcc) },
            { label: 'Avg Accuracy', value: formatAccuracy(avgAccuracy) },
            { label: 'Total Score', value: Math.round(totalScore) },
          ]}
          onRestart={startGame}
        />
      </div>
    );
  }

  /* ---------- PLAYING STATES (ready / stopped / next) ---------- */
  const isMoving = gameState === 'ready';
  const isStopped = gameState === 'stopped';

  return (
    <div
      className="game-container flex flex-col items-center min-h-[70vh] select-none"
      onClick={isMoving ? stopTarget : undefined}
      onTouchStart={isMoving ? (e) => { e.preventDefault(); stopTarget(); } : undefined}
      role="application"
      aria-label="0.001 Second precision game"
    >
      {/* ---- Top bar: Round / Score / Best ---- */}
      <div className="w-full flex items-center justify-between mb-6 px-1">
        <div className="flex flex-col items-start">
          <span className="text-2xs text-surface-500 uppercase tracking-wider">Round</span>
          <span className="text-xl font-bold text-white">{round}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xs text-surface-500 uppercase tracking-wider">Score</span>
          <span className="text-xl font-bold gradient-text">{Math.round(totalScore)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xs text-surface-500 uppercase tracking-wider">Best Acc.</span>
          <span className="text-xl font-bold text-brand-400">
            {results.length > 0 ? formatAccuracy(currentBestAcc) : '—'}
          </span>
        </div>
      </div>

      {/* ---- Difficulty indicator ---- */}
      <div className="w-full flex items-center gap-2 mb-4">
        <span className="text-2xs text-surface-500">Speed</span>
        <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-purple rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (roundConfig.speed / 5) * 100)}%` }}
          />
        </div>
        <span className="text-2xs text-surface-400 font-mono">{roundConfig.speed.toFixed(1)}x</span>
      </div>

      {/* ---- TRACK ---- */}
      <div className="w-full relative mt-2 mb-6">
        {/* Track background */}
        <div
          ref={trackRef}
          className="relative w-full h-[60px] bg-gradient-to-b from-surface-800 to-surface-900 rounded-2xl border border-surface-700/50 overflow-hidden cursor-pointer"
        >
          {/* Subtle grid lines */}
          <div className="absolute inset-0 opacity-20">
            {[25, 50, 75].map((pct) => (
              <div
                key={pct}
                className={`absolute top-0 bottom-0 w-px ${
                  pct === 50 ? 'bg-brand-400' : 'bg-surface-500'
                }`}
                style={{ left: `${pct}%` }}
              />
            ))}
          </div>

          {/* Tick marks */}
          {[25, 75].map((pct) => (
            <div key={pct} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
              <div className="w-px h-3 bg-surface-600" />
              <span className="text-[8px] text-surface-600 mt-0.5 font-mono">{pct}%</span>
            </div>
          ))}

          {/* CENTER marker with glow */}
          <div
            className="absolute top-0 bottom-0 w-px left-1/2 -translate-x-1/2 z-10"
            style={{
              background: 'linear-gradient(to bottom, transparent, #5c7cfa, transparent)',
              boxShadow: '0 0 12px 3px rgba(92,124,250,0.3), 0 0 24px 6px rgba(92,124,250,0.15)',
            }}
          />
          {/* Center label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-brand-400 whitespace-nowrap">
            50.000%
          </div>

          {/* Moving target */}
          <div
            className="absolute top-1 bottom-1 rounded-lg z-20 transition-none"
            style={{
              width: roundConfig.targetWidth,
              left: `calc(${targetPct}% - ${roundConfig.targetWidth / 2}px)`,
              background: isStopped
                ? tier
                  ? tier.color
                  : '#5c7cfa'
                : 'linear-gradient(to bottom, #748ffc, #5c7cfa)',
              boxShadow: isMoving
                ? `${directionRef.current * -3}px 0 8px rgba(92,124,250,0.4), 0 0 12px rgba(92,124,250,0.2)`
                : isStopped
                ? `0 0 20px ${tier?.color || '#5c7cfa'}60, 0 0 40px ${tier?.color || '#5c7cfa'}20`
                : '0 0 8px rgba(92,124,250,0.3)',
              transition: isStopped ? 'box-shadow 0.3s ease' : 'none',
            }}
          />

          {/* Impact flash on stop */}
          {isStopped && (
            <div
              className="absolute top-0 bottom-0 w-8 z-15 animate-fade-in"
              style={{
                left: `calc(${stoppedPct}% - 16px)`,
                background: `radial-gradient(ellipse at center, ${tier?.color || '#5c7cfa'}40 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Particle burst for PERFECT */}
          {showParticles && stoppedPct !== null && (
            <ParticleBurst x={stoppedPct} />
          )}
        </div>

        {/* Stopped position indicator below track */}
        {isStopped && stoppedPct !== null && (
          <div className="absolute -bottom-6 w-full flex justify-center animate-fade-in">
            <span className="text-xs font-mono text-surface-400">
              Stopped at <span className="text-surface-200">{stoppedPct.toFixed(3)}%</span>
            </span>
          </div>
        )}
      </div>

      {/* ---- Result display ---- */}
      <div className="flex flex-col items-center min-h-[140px] justify-center w-full mt-4">
        {isStopped && accuracy !== null && tier && (
          <div className="flex flex-col items-center gap-3 animate-fade-up">
            {/* Accuracy number */}
            <div className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-white">
              {displayedAccuracy.toFixed(2)}
              <span className="text-3xl sm:text-4xl text-surface-400">%</span>
            </div>

            {/* Tier label */}
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${tier.textClass} animate-slide-up`}
              style={{
                textShadow: tier.glowClass ? `0 0 20px ${tier.color}60` : 'none',
              }}
            >
              {tier.name}
            </span>

            {/* Screen reader announcement */}
            <div className="sr-only" role="status" aria-live="polite">
              Round {round}: Accuracy {formatAccuracy(accuracy)}, rated {tier.name}
            </div>
          </div>
        )}

        {gameState === 'next' && (
          <div className="flex flex-col items-center gap-2 animate-fade-in">
            <span className="text-surface-400 text-sm">Get ready…</span>
            <div className="w-12 h-1 bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{
                  animation: `fill-bar ${TRANSITION_MS}ms linear forwards`,
                }}
              />
            </div>
            <style>{`
              @keyframes fill-bar { 0% { width:0% } 100% { width:100% } }
            `}</style>
          </div>
        )}

        {isMoving && (
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-xl sm:text-2xl font-bold text-surface-300"
              style={{ animation: 'pulse-tap 1.2s ease-in-out infinite' }}
            >
              TAP TO STOP
            </span>
            <span className="text-2xs text-surface-500">or press SPACE</span>
            <style>{`
              @keyframes pulse-tap {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.97); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* ---- Recent round dots ---- */}
      {results.length > 0 && (
        <div className="flex items-center gap-1.5 mt-6">
          {recentResults.map((r, i) => {
            const t = getAccuracyTier(r.accuracy);
            return (
              <div
                key={r.round}
                className="group relative"
              >
                <div
                  className="w-3 h-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: t.color,
                    opacity: i === recentResults.length - 1 ? 1 : 0.5 + (i / recentResults.length) * 0.3,
                    boxShadow: i === recentResults.length - 1 ? `0 0 8px ${t.color}60` : 'none',
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                  <div className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-2xs whitespace-nowrap">
                    <span className="text-surface-300">R{r.round}:</span>{' '}
                    <span className="text-white font-semibold">{formatAccuracy(r.accuracy)}</span>
                  </div>
                  <div className="w-2 h-2 bg-surface-800 border-r border-b border-surface-700 rotate-45 -mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Modifiers active ---- */}
      {(roundConfig.hasVariableSpeed || roundConfig.hasReversal) && (
        <div className="flex gap-2 mt-4">
          {roundConfig.hasVariableSpeed && (
            <span className="badge-yellow text-2xs">⚡ Variable Speed</span>
          )}
          {roundConfig.hasReversal && (
            <span className="badge-red text-2xs">🔄 Reversal</span>
          )}
        </div>
      )}
    </div>
  );
}

export { ZeroZeroOneGame };
