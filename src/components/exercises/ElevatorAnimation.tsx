'use client';
import { useMemo } from 'react';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

const SHRINK_SCALE = 0.22;

interface ElevatorAnimationProps {
  stages: number;
  stagePauseSecs: number;
  reps?: number;
  className?: string;
}

function levelToScale(fraction: number) {
  return 1 - fraction * (1 - SHRINK_SCALE);
}

export function ElevatorAnimation({ stages, stagePauseSecs, reps, className }: ElevatorAnimationProps) {
  const n = Math.max(stages, 1);
  const pauseMs = Math.max(stagePauseSecs, 0.1) * 1000;

  const phases = useMemo<Phase[]>(() => {
    const list: Phase[] = [];
    // Ascend: 1/n, 2/n, ... n/n (100%), pausing at each level.
    for (let i = 1; i <= n; i++) {
      const fraction = i / n;
      const label = `Stage ${i} of ${n}`;
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: 600 });
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: pauseMs });
    }
    // Descend: back down through the same levels to rest.
    for (let i = n - 1; i >= 0; i--) {
      const fraction = i / n;
      const label = i === 0 ? 'Rest' : `Release — Stage ${i} of ${n}`;
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: 600 });
      list.push({ label, scale: levelToScale(fraction), riseFraction: fraction, durationMs: i === 0 ? pauseMs : pauseMs });
    }
    return list;
  }, [n, pauseMs]);

  const { repIndex, phase, running } = usePhaseSequence(phases, reps);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={500} className={className}>
      <span className="absolute top-6 left-6 font-display text-md font-medium text-primary">
        {running ? phase.label : 'Finished'}
      </span>
      <span className="absolute top-6 right-6 flex items-baseline gap-1 font-display text-md font-medium text-primary">
        <RollingNumber value={repIndex} />
        {reps && reps > 0 && <span>of {reps}</span>}
      </span>
    </PelvicFloorCircleVisual>
  );
}
