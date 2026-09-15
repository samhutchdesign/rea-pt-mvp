'use client';
import { useEffect, useState } from 'react';
import { cx } from '@/utils/cx';

interface BreathingCircleAnimationProps {
  /** Seconds per full breathe-in/breathe-out cycle. */
  cycleSeconds: number;
  /** Number of cycles to run before stopping. 0 or undefined loops forever. */
  loops?: number;
  className?: string;
}

export function BreathingCircleAnimation({ cycleSeconds, loops, className }: BreathingCircleAnimationProps) {
  // Pass a `key` that changes with cycleSeconds/loops at the call site to
  // restart the preview from a clean state instead of reacting to prop
  // changes here.
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const halfMs = (cycleSeconds * 1000) / 2;
    const phaseTimer = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), halfMs);

    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    if (loops && loops > 0) {
      stopTimer = setTimeout(() => setRunning(false), cycleSeconds * 1000 * loops);
    }

    return () => {
      clearInterval(phaseTimer);
      if (stopTimer) clearTimeout(stopTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iterationCount = loops && loops > 0 ? loops : 'infinite';

  return (
    <div className={cx('relative flex items-end justify-center overflow-hidden bg-secondary_alt', className)}>
      <div
        className="relative flex items-end justify-center"
        style={{
          animationName: running ? 'breath-pulse' : 'none',
          animationDuration: `${cycleSeconds}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: iterationCount,
          transformOrigin: 'bottom center',
          transform: running ? undefined : 'translateY(0) scale(1)',
        }}
      >
        <div className="size-[280px] shrink-0 -mb-[140px] rounded-full bg-brand-100" />
        <div className="absolute bottom-0 left-1/2 size-[216px] -translate-x-1/2 -mb-[108px] rounded-full bg-brand-300" />
        <div className="absolute bottom-0 left-1/2 size-[158px] -translate-x-1/2 -mb-[79px] rounded-full bg-brand-700" />
      </div>
      <span className="absolute top-6 left-1/2 -translate-x-1/2 font-display text-md font-medium text-primary">
        {running ? (phase === 'in' ? 'Breathe In' : 'Breathe Out') : 'Finished'}
      </span>
    </div>
  );
}
