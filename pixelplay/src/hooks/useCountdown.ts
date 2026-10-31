'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback((newDuration?: number) => {
    clear();
    const duration = newDuration !== undefined ? newDuration : initialSeconds;
    setTimeLeft(duration);
    setIsRunning(true);
  }, [initialSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clear();
  }, []);

  const reset = useCallback(() => {
    clear();
    setTimeLeft(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clear();
          setIsRunning(false);
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clear();
  }, [isRunning]);

  return {
    timeLeft,
    isRunning,
    isExpired: timeLeft <= 0,
    start,
    pause,
    reset,
    progress: initialSeconds > 0 ? timeLeft / initialSeconds : 0,
  };
}

