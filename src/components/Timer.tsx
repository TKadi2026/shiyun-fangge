'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { formatTime } from '@/lib/game-logic';

interface TimerHandle {
  start: () => void;
  stop: () => number;
  reset: () => void;
}

interface TimerProps {
  onTick?: (elapsed: number) => void;
}

export function useTimer({ onTick }: TimerProps): TimerHandle & { elapsed: number } {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return;
    const now = performance.now();
    const ms = now - startTimeRef.current;
    setElapsed(ms);
    onTick?.(ms);
    rafRef.current = requestAnimationFrame(tick);
  }, [onTick]);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (startTimeRef.current === null) return 0;
    const ms = performance.now() - startTimeRef.current;
    startTimeRef.current = null;
    return ms;
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    setElapsed(0);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { elapsed, start, stop, reset };
}

export function TimerDisplay({ elapsed }: { elapsed: number }) {
  return (
    <div className="pl-timer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      {formatTime(elapsed)}
    </div>
  );
}
