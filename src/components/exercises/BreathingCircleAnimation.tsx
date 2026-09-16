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

const SHRINK_SCALE = 0.22;

/** Rolls the old value up and out while the new one slides up and in, like an odometer. */
function RollingNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  // Adjust state during render when the value prop changes, per React's
  // documented pattern — avoids the extra render an effect would cause.
  if (value !== displayValue) {
    setPrevValue(displayValue);
    setDisplayValue(value);
    setAnimKey((k) => k + 1);
  }

  return (
    <span className="relative inline-block h-5 min-w-[1ch] overflow-hidden align-bottom">
      <span className="invisible">{displayValue}</span>
      {prevValue !== null && (
        <span key={`prev-${animKey}`} className="absolute inset-0 animate-[counter-roll-out_0.35s_ease-in_forwards]">
          {prevValue}
        </span>
      )}
      <span key={`current-${animKey}`} className="absolute inset-0 animate-[counter-roll-in_0.35s_ease-out_forwards]">
        {displayValue}
      </span>
    </span>
  );
}

export function BreathingCircleAnimation({ cycleSeconds, loops, className }: BreathingCircleAnimationProps) {
  // Pass a `key` that changes with cycleSeconds/loops at the call site to
  // restart the preview from a clean state instead of reacting to prop
  // changes here.
  const [running, setRunning] = useState(true);
  const [cycleCount, setCycleCount] = useState(1);
  const [riseDistance, setRiseDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cycleTimer = setInterval(() => setCycleCount((c) => (loops && loops > 0 ? Math.min(c + 1, loops) : c + 1)), cycleSeconds * 1000);

    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    if (loops && loops > 0) {
      stopTimer = setTimeout(() => setRunning(false), cycleSeconds * 1000 * loops);
    }

    return () => {
      clearInterval(cycleTimer);
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
      setRiseDistance(Math.max((containerHeight - groupHeight * SHRINK_SCALE) * 0.8, 0));
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
      <span className="absolute top-6 left-6 flex items-baseline gap-1 font-display text-md font-medium text-primary">
        <RollingNumber value={loops && loops > 0 ? Math.min(cycleCount, loops) : cycleCount} />
        {loops && loops > 0 && <span>of {loops}</span>}
      </span>
    </div>
  );
}
