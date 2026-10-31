'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameOverScreen } from '@/components/ui/GameOverScreen';
import { CHALLENGES, ChallengeDef } from './challenges';
import {
  getRandomSuccessMessage,
  getRandomFailureMessage,
  calculateScore,
} from './utils';
import { usePlayer } from '@/components/providers/PlayerProvider';
import { useSound } from '@/components/providers/SoundProvider';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface DontTrustUIGameProps {
  challengeSeed?: number;
  onGameEnd?: (score: number, completedCount: number, stats: any) => void;
}

type Phase = 'idle' | 'challenge' | 'feedback' | 'gameover';

export function DontTrustUIGame({ challengeSeed, onGameEnd }: DontTrustUIGameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0); // 3 strikes = game over
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'failure' | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [bestScore, setBestScore] = useState(0);

  const { recordGameResult } = usePlayer();
  const { playSuccess, playFailure, playClick, playLevelUp, playGameOver } = useSound();

  const challengeStartTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const deckRef = useRef<ChallengeDef[]>([]);

  useEffect(() => {
    const savedBest = loadFromStorage('pixelplay_dont-trust-ui_best', 0);
    const savedStreak = loadFromStorage('pixelplay_dont-trust-ui_streak', 0);
    setBestScore(savedBest);
    setBestStreak(savedStreak);

    return () => {
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const shuffleDeck = () => {
    const shuffled = [...CHALLENGES].sort(() => Math.random() - 0.5);
    deckRef.current = shuffled;
  };

  const startChallenge = useCallback((index: number) => {
    clearAllTimers();
    if (index >= deckRef.current.length) {
      shuffleDeck();
      index = 0;
    }

    const challenge = deckRef.current[index];
    setCurrentChallengeIndex(index);
    setTimeLeft(challenge.timeLimitSeconds);
    setPhase('challenge');
    setFeedbackType(null);
    setFeedbackText('');
    challengeStartTimeRef.current = Date.now();

    // Timer countdown
    const initialTime = challenge.timeLimitSeconds;
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.2) {
          clearInterval(countdownIntervalRef.current!);
          handleFailure('Time ran out! Hesitation is defeat.');
          return 0;
        }
        return Math.max(0, t - 0.1);
      });
    }, 100);
  }, []);

  const startGame = () => {
    playClick();
    shuffleDeck();
    setScore(0);
    setStrikes(0);
    setStreak(0);
    setCompletedChallenges(0);
    startChallenge(0);
  };

  const handleSuccess = () => {
    if (phase !== 'challenge') return;
    clearAllTimers();
    playSuccess();

    const elapsed = Date.now() - challengeStartTimeRef.current;
    const roundScore = calculateScore(elapsed, streak);
    const newScore = score + roundScore;
    const nextStreak = streak + 1;

    setScore(newScore);
    setStreak(nextStreak);
    setCompletedChallenges((c) => c + 1);

    if (nextStreak > bestStreak) {
      setBestStreak(nextStreak);
      saveToStorage('pixelplay_dont-trust-ui_streak', nextStreak);
    }
    if (newScore > bestScore) {
      setBestScore(newScore);
      saveToStorage('pixelplay_dont-trust-ui_best', newScore);
    }

    setFeedbackType('success');
    setFeedbackText(getRandomSuccessMessage());
    setPhase('feedback');

    timerRef.current = setTimeout(() => {
      startChallenge(currentChallengeIndex + 1);
    }, 1100);
  };

  const handleFailure = (customMsg?: string) => {
    if (phase !== 'challenge') return;
    clearAllTimers();
    playFailure();

    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setFeedbackType('failure');
    setFeedbackText(customMsg || getRandomFailureMessage());
    setPhase('feedback');

    timerRef.current = setTimeout(() => {
      if (newStrikes >= 3) {
        playGameOver();
        setPhase('gameover');
        recordGameResult('dont-trust-ui', score, {
          completed: completedChallenges,
          streak: bestStreak,
        });
        if (onGameEnd) {
          onGameEnd(score, completedChallenges, { bestStreak });
        }
      } else {
        startChallenge(currentChallengeIndex + 1);
      }
    }, 1300);
  };

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 bg-surface-900/60 border border-surface-800 rounded-3xl w-full max-w-lg mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl mb-4">
          👻
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">DON&apos;T TRUST THE UI</h2>
        <p className="text-surface-400 text-sm mt-2 max-w-xs leading-relaxed">
          &ldquo;The game is lying. Figure out what it actually wants.&rdquo;
        </p>

        <div className="grid grid-cols-2 gap-3 my-6 w-full max-w-xs">
          <div className="stat-card">
            <span className="stat-value text-purple-400">{bestScore.toLocaleString()}</span>
            <span className="stat-label">Best Score</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-white">{bestStreak}</span>
            <span className="stat-label">Best Streak</span>
          </div>
        </div>

        <button
          onClick={startGame}
          className="btn-primary w-full max-w-xs bg-purple-600 hover:bg-purple-500 text-base font-bold shadow-lg shadow-purple-500/20"
        >
          START CHALLENGE
        </button>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="min-h-[500px] flex items-center justify-center w-full">
        <GameOverScreen
          title="YOU SURVIVED!"
          gameId="dont-trust-ui"
          score={score}
          bestScore={bestScore}
          isNewBest={score >= bestScore && score > 0}
          stats={[
            { label: 'Completed', value: completedChallenges },
            { label: 'Best Streak', value: `${bestStreak} 🔥` },
            { label: 'Score', value: score.toLocaleString() },
            { label: 'Total Tricks', value: 20 },
          ]}
          onRestart={startGame}
        />
      </div>
    );
  }

  const currentChallenge = deckRef.current[currentChallengeIndex] || CHALLENGES[0];
  const CurrentChallengeComponent = currentChallenge.Component;

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto select-none">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3 bg-surface-900/80 border border-surface-800 rounded-2xl mb-4 shadow-md">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-surface-400">
            Trick #{completedChallenges + 1}
          </span>
          <span className="text-sm font-bold text-white max-w-[130px] truncate">
            {currentChallenge.title}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-surface-400">
            Score
          </span>
          <span className="text-xl font-black text-purple-400">{score.toLocaleString()}</span>
          {streak > 1 && (
            <span className="text-[10px] text-amber-400 font-bold -mt-0.5">
              🔥 {streak} Streak
            </span>
          )}
        </div>

        {/* Strikes (3 strikes) */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                i < strikes
                  ? 'bg-rose-600/30 text-rose-500 border border-rose-500/40'
                  : 'bg-surface-800 text-surface-400 border border-surface-700/60'
              }`}
            >
              ✕
            </span>
          ))}
        </div>
      </div>

      {/* Main Trick Area */}
      <div className="w-full bg-surface-900/60 border border-surface-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden min-h-[380px]">
        {/* Countdown Progress Bar */}
        <div className="w-full bg-surface-800 h-1 rounded-full overflow-hidden absolute top-0 left-0 right-0">
          <div
            className={`h-full transition-all duration-100 ${
              timeLeft < 2 ? 'bg-rose-500' : 'bg-purple-500'
            }`}
            style={{
              width: `${(timeLeft / (currentChallenge.timeLimitSeconds || 5)) * 100}%`,
            }}
          />
        </div>

        {/* Instruction Header */}
        <div className="text-center mb-6 mt-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
            Instruction
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            &ldquo;{currentChallenge.instruction}&rdquo;
          </h3>
        </div>

        {/* Challenge Interactive Zone */}
        <div className="w-full flex-1 flex items-center justify-center">
          {phase === 'challenge' && (
            <CurrentChallengeComponent
              onSuccess={handleSuccess}
              onFailure={() => handleFailure()}
            />
          )}

          {phase === 'feedback' && (
            <div className="flex flex-col items-center justify-center text-center animate-fade-in py-8">
              <span className="text-4xl mb-3">
                {feedbackType === 'success' ? '🎯' : '🤡'}
              </span>
              <p
                className={`text-xl font-black tracking-tight ${
                  feedbackType === 'success' ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                &ldquo;{feedbackText}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

