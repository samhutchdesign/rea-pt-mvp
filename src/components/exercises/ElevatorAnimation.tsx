'use client';
import { useMemo } from 'react';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

const SHRINK_SCALE = 0.22;

interface ElevatorAnimationProps {
  speedSecs: number;
  stages: number;
  stagePauseSecs: number;
  reps?: number;
  className?: string;
  children?: React.ReactNode;
}

function levelToScale(fraction: number) {
  return 1 - fraction * (1 - SHRINK_SCALE);
}

export function ElevatorAnimation({ speedSecs, stages, stagePauseSecs, reps, className, children }: ElevatorAnimationProps) {
  const n = Math.max(stages, 1);
  const pauseMs = Math.max(stagePauseSecs, 0.1) * 1000;
  const moveMs = Math.max(speedSecs, 0.1) * 1000;

  const phases = useMemo<Phase[]>(() => {
    const list: Phase[] = [];
    // Ascend: 1/n, 2/n, ... n/n (100%), pausing at each level.
    for (let i = 1; i <= n; i++) {
      const fraction = i / n;
      const label = `${Math.round(fraction * 100)}%`;
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: moveMs });
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: pauseMs });
    }
    // Descend: back down through the same levels to rest.
    for (let i = n - 1; i >= 0; i--) {
      const fraction = i / n;
      const label = `${Math.round(fraction * 100)}%`;
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: moveMs });
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: i === 0 ? pauseMs : pauseMs });
    }
    return list;
  }, [n, pauseMs, moveMs]);

  const { repIndex, phase, running } = usePhaseSequence(phases, reps);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={moveMs} className={className}>
      <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display text-[20px] leading-[32px] font-medium text-primary">
        {running ? phase.label : 'Finished'}
      </span>
      <span className="absolute top-5 left-5 flex items-baseline gap-1 font-display text-[20px] leading-[32px] font-medium text-primary">
        <RollingNumber value={repIndex} />
        {reps && reps > 0 && <span>of {reps}</span>}
      </span>
      {children}
    </PelvicFloorCircleVisual>
  );
}
