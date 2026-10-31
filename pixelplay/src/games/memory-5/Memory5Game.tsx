'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameOverScreen } from '@/components/ui/GameOverScreen';
import { generateRound, getLevelConfig, calculateRoundScore, seededRandom } from './utils';
import { usePlayer } from '@/components/providers/PlayerProvider';
import { useSound } from '@/components/providers/SoundProvider';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface Memory5GameProps {
  challengeSeed?: number;
  onGameEnd?: (score: number, level: number, stats: any) => void;
}

type Phase = 'idle' | 'memorizing' | 'input' | 'feedback' | 'gameover';

export function Memory5Game({ challengeSeed, onGameEnd }: Memory5GameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [sequence, setSequence] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [displayProgress, setDisplayProgress] = useState(100);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState<number>(-1);
  const [bestScore, setBestScore] = useState(0);
  const [bestLevel, setBestLevel] = useState(1);
  const [feedbackState, setFeedbackState] = useState<'success' | 'failure' | null>(null);

  const { recordGameResult } = usePlayer();
  const { playSuccess, playFailure, playClick, playLevelUp, playGameOver } = useSound();

  const roundStartTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rngRef = useRef<() => number>(Math.random);

  useEffect(() => {
    const savedBest = loadFromStorage('pixelplay_memory-5_best', 0);
    const savedLevel = loadFromStorage('pixelplay_memory-5_level', 1);
    setBestScore(savedBest);
    setBestLevel(savedLevel);

    if (challengeSeed) {
      rngRef.current = seededRandom(challengeSeed);
    }

    return () => {
      clearAllTimers();
    };
  }, [challengeSeed]);

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const startRound = useCallback(
    (targetLevel: number) => {
      clearAllTimers();
      const config = getLevelConfig(targetLevel);
      const roundData = generateRound(targetLevel, rngRef.current);

      setSequence(roundData.sequence);
      setOptions(roundData.options);
      setPlayerInput([]);
      setPhase('memorizing');
      setFeedbackState(null);
      setDisplayProgress(100);

      // Display sequence animation
      const duration = config.displayTimeMs;
      const startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setDisplayProgress(remaining);

        // Calculate which symbol to highlight
        const index = Math.floor((elapsed / duration) * roundData.sequence.length);
        setCurrentDisplayIndex(Math.min(index, roundData.sequence.length - 1));

        if (remaining <= 0) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
      }, 50);

      timerRef.current = setTimeout(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setPhase('input');
        setCurrentDisplayIndex(-1);
        roundStartTimeRef.current = Date.now();
      }, duration);
    },
    []
  );

  const startGame = () => {
    playClick();
    setLevel(1);
    setScore(0);
    setLives(3);
    startRound(1);
  };

  const handleSelectOption = (symbol: string) => {
    if (phase !== 'input') return;
    if (playerInput.length >= sequence.length) return;

    playClick();
    const newInput = [...playerInput, symbol];
    setPlayerInput(newInput);

    // Auto verify when sequence is completed
    if (newInput.length === sequence.length) {
      verifySequence(newInput);
    }
  };

  const handleUndo = () => {
    if (phase !== 'input' || playerInput.length === 0) return;
    playClick();
    setPlayerInput((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    if (phase !== 'input' || playerInput.length === 0) return;
    playClick();
    setPlayerInput([]);
  };

  const verifySequence = (input: string[]) => {
    const reactionTime = Date.now() - roundStartTimeRef.current;
    let isCorrect = true;

    for (let i = 0; i < sequence.length; i++) {
      if (input[i] !== sequence[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      playSuccess();
      setFeedbackState('success');
      const earned = calculateRoundScore(level, true, reactionTime);
      const newScore = score + earned;
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        saveToStorage('pixelplay_memory-5_best', newScore);
      }
      if (level + 1 > bestLevel) {
        setBestLevel(level + 1);
        saveToStorage('pixelplay_memory-5_level', level + 1);
      }

      setPhase('feedback');
      timerRef.current = setTimeout(() => {
        playLevelUp();
        setLevel((prev) => prev + 1);
        startRound(level + 1);
      }, 900);
    } else {
      playFailure();
      setFeedbackState('failure');
      const nextLives = lives - 1;
      setLives(nextLives);

      setPhase('feedback');
      timerRef.current = setTimeout(() => {
        if (nextLives <= 0) {
          playGameOver();
          setPhase('gameover');
          recordGameResult('memory-5', score, { level, bestLevel });
          if (onGameEnd) onGameEnd(score, level, { bestScore });
        } else {
          // Re-try the same round
          startRound(level);
        }
      }, 1200);
    }
  };

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 bg-surface-900/60 border border-surface-800 rounded-3xl w-full max-w-lg mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4">
          🧠
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">MEMORY 5</h2>
        <p className="text-surface-400 text-sm mt-2 max-w-xs leading-relaxed">
          Remember the sequence of symbols. As you advance, sequences get longer and faster!
        </p>

        <div className="grid grid-cols-2 gap-3 my-6 w-full max-w-xs">
          <div className="stat-card">
            <span className="stat-value text-emerald-400">{bestScore.toLocaleString()}</span>
            <span className="stat-label">Best Score</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-white">{bestLevel}</span>
            <span className="stat-label">Best Level</span>
          </div>
        </div>

        <button
          onClick={startGame}
          className="btn-primary w-full max-w-xs bg-emerald-600 hover:bg-emerald-500 text-base font-bold shadow-lg shadow-emerald-500/20"
        >
          START GAME
        </button>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="min-h-[500px] flex items-center justify-center w-full">
        <GameOverScreen
          title="GAME OVER"
          gameId="memory-5"
          score={score}
          bestScore={bestScore}
          isNewBest={score >= bestScore && score > 0}
          stats={[
            { label: 'Level Reached', value: level },
            { label: 'Sequence Size', value: `${sequence.length} items` },
            { label: 'Total Score', value: score.toLocaleString() },
            { label: 'Best Level', value: bestLevel },
          ]}
          onRestart={startGame}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto select-none">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3 bg-surface-900/80 border border-surface-800 rounded-2xl mb-4 shadow-md">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-surface-400">
            Memory Level
          </span>
          <span className="text-lg font-bold text-white">Level {level}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-surface-400">
            Score
          </span>
          <span className="text-xl font-black text-emerald-400">{score.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-transform ${
                i < lives ? 'scale-100 opacity-100' : 'scale-75 opacity-30 grayscale'
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Main Board */}
      <div className="w-full bg-surface-900/60 border border-surface-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
        {/* Phase Indicator / Title */}
        <div className="text-center mb-6">
          {phase === 'memorizing' && (
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Memorize the Sequence
              </span>
              <p className="text-surface-400 text-xs mt-0.5">Pay close attention to the order!</p>
            </div>
          )}

          {phase === 'input' && (
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Reproduce the Sequence
              </span>
              <p className="text-surface-400 text-xs mt-0.5">
                Click tiles in the exact order ({playerInput.length} of {sequence.length})
              </p>
            </div>
          )}

          {phase === 'feedback' && (
            <div>
              <span
                className={`text-sm font-black uppercase tracking-wider ${
                  feedbackState === 'success' ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {feedbackState === 'success' ? '✨ PERFECT SEQUENCE!' : '❌ INCORRECT SEQUENCE'}
              </span>
            </div>
          )}
        </div>

        {/* Display Phase: Sequence Carousel/Display */}
        {phase === 'memorizing' && (
          <div className="flex flex-col items-center justify-center w-full py-8">
            <div className="w-full bg-surface-800 h-1.5 rounded-full overflow-hidden mb-8 max-w-xs">
              <div
                className="bg-emerald-500 h-full transition-all duration-75"
                style={{ width: `${displayProgress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 min-h-[90px]">
              {sequence.map((sym, index) => {
                const isCurrent = currentDisplayIndex === index;
                return (
                  <div
                    key={index}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all duration-200 border ${
                      isCurrent
                        ? 'bg-emerald-500/20 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20'
                        : 'bg-surface-800/80 border-surface-700'
                    }`}
                  >
                    {sym}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Phase: Slots + Clickable Palette */}
        {(phase === 'input' || phase === 'feedback') && (
          <div className="w-full flex flex-col items-center">
            {/* Input target slots */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 p-3 bg-surface-950/60 border border-surface-800/80 rounded-2xl w-full">
              {Array.from({ length: sequence.length }).map((_, i) => {
                const filled = playerInput[i];
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (i === playerInput.length - 1) handleUndo();
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl border transition-all ${
                      filled
                        ? 'bg-surface-800 border-surface-600 text-white shadow-md'
                        : 'border-dashed border-surface-700 bg-surface-900/40 text-surface-600'
                    } ${
                      phase === 'feedback'
                        ? filled === sequence[i]
                          ? 'border-accent-green bg-accent-green/20'
                          : 'border-accent-red bg-accent-red/20'
                        : ''
                    }`}
                    title={filled ? 'Click to remove' : ''}
                  >
                    {filled || (
                      <span className="text-xs font-mono text-surface-600 font-bold">{i + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clickable choices */}
            {phase === 'input' && (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3 w-full mb-6">
                  {options.map((symbol, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(symbol)}
                      className="min-h-[50px] sm:min-h-[58px] rounded-2xl bg-surface-800 hover:bg-surface-700 active:scale-95 border border-surface-700/80 text-2xl sm:text-3xl flex items-center justify-center shadow transition-all hover:border-emerald-500/50"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>

                {/* Control buttons */}
                <div className="flex gap-3 w-full max-w-xs">
                  <button
                    onClick={handleUndo}
                    disabled={playerInput.length === 0}
                    className="btn-secondary flex-1 text-xs py-2.5 disabled:opacity-30"
                  >
                    ↩ Undo
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={playerInput.length === 0}
                    className="btn-secondary flex-1 text-xs py-2.5 disabled:opacity-30"
                  >
                    ✕ Clear
                  </button>
                </div>
              </>
            )}

            {phase === 'feedback' && feedbackState === 'failure' && (
              <div className="mt-4 p-4 rounded-xl bg-surface-800/80 border border-surface-700 text-center w-full">
                <span className="text-xs text-surface-400 uppercase font-semibold">
                  Correct sequence was:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  {sequence.map((sym, i) => (
                    <span key={i} className="text-2xl">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

