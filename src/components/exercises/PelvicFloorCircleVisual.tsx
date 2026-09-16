'use client';
import { useEffect, useRef, useState } from 'react';
import { cx } from '@/utils/cx';

/**
 * Shared concentric-circle visual for the pelvic-floor animations — the
 * same "shrink and rise" motion as the breathing pacer, driven by a live
 * `scale`/`riseFraction` state instead of a fixed CSS keyframe loop, since
 * these exercises have practitioner-adjustable, unevenly-timed phases
 * (contract / hold / release / rest) rather than one repeating cycle.
 */
export function PelvicFloorCircleVisual({
  scale,
  riseFraction,
  transitionMs = 700,
  className,
  children,
}: {
  scale: number;
  riseFraction: number;
  transitionMs?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const [riseDistance, setRiseDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const containerHeight = containerRef.current?.clientHeight ?? 0;
      const groupHeight = groupRef.current?.offsetHeight ?? 0;
      // Bottom-anchored (transform-origin: bottom): at full shrink the group
      // spans groupHeight * 0.22 tall. Leave 20% headroom rather than
      // touching the very top edge.
      setRiseDistance(Math.max((containerHeight - groupHeight * 0.22) * 0.8, 0));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const rise = riseDistance !== null ? riseDistance * riseFraction : 0;

  return (
    <div ref={containerRef} className={cx('relative flex items-end justify-center overflow-hidden bg-secondary_alt', className)}>
      <div
        ref={groupRef}
        className="relative flex items-end justify-center"
        style={{
          transform: `translateY(-${rise}px) scale(${scale})`,
          transformOrigin: 'bottom center',
          transition: `transform ${transitionMs}ms ease-in-out`,
        }}
      >
        <div className="size-[280px] shrink-0 -mb-[140px] rounded-full bg-brand-100" />
        <div className="absolute bottom-0 left-1/2 size-[216px] -translate-x-1/2 -mb-[108px] rounded-full bg-brand-300" />
        <div className="absolute bottom-0 left-1/2 size-[158px] -translate-x-1/2 -mb-[79px] rounded-full bg-brand-700" />
      </div>
      {children}
    </div>
  );
}
