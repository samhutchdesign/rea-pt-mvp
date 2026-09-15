'use client';
import { useEffect, useRef, useState } from 'react';
import { cx } from '@/utils/cx';

interface BreathingCircleAnimationProps {
  /** Seconds per full breathe-in/breathe-out cycle. */
  cycleSeconds: number;
  /** Number of cycles to run before stopping. 0 or undefined loops forever. */
  loops?: number;
  className?: string;
}

const SHRINK_SCALE = 0.42;

export function BreathingCircleAnimation({ cycleSeconds, loops, className }: BreathingCircleAnimationProps) {
  // Pass a `key` that changes with cycleSeconds/loops at the call site to
  // restart the preview from a clean state instead of reacting to prop
  // changes here.
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [running, setRunning] = useState(true);
  const [riseDistance, setRiseDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const measure = () => {
      const containerHeight = containerRef.current?.clientHeight ?? 0;
      const groupHeight = groupRef.current?.offsetHeight ?? 0;
      // The group is bottom-anchored (transform-origin: bottom), so at rest
      // it spans from (containerHeight - groupHeight) to containerHeight. At
      // peak shrink its span is groupHeight * SHRINK_SCALE tall. Move it up
      // by however much is needed so that shrunk top edge lands at y = 0.
      setRiseDistance(Math.max(containerHeight - groupHeight * SHRINK_SCALE, 0));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const iterationCount = loops && loops > 0 ? loops : 'infinite';

  return (
    <div ref={containerRef} className={cx('relative flex items-end justify-center overflow-hidden bg-secondary_alt', className)}>
      <div
        ref={groupRef}
        className="relative flex items-end justify-center"
        style={{
          '--rise-distance': riseDistance !== null ? `-${riseDistance}px` : '-90%',
          animationName: running ? 'breath-pulse' : 'none',
          animationDuration: `${cycleSeconds}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: iterationCount,
          transformOrigin: 'bottom center',
          transform: running ? undefined : 'translateY(0) scale(1)',
        } as React.CSSProperties}
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
