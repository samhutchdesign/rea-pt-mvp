'use client';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

const SHRINK_SCALE = 0.22;

interface PelvicFloorFullRangeAnimationProps {
  speedSecs: number;
  holdSecs: number;
  restSecs: number;
  reps?: number;
  className?: string;
}

export function PelvicFloorFullRangeAnimation({ speedSecs, holdSecs, restSecs, reps, className }: PelvicFloorFullRangeAnimationProps) {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const phases: Phase[] = [
    { label: 'Contract', scale: SHRINK_SCALE, riseFraction: 1, durationMs: moveMs },
    { label: 'Hold', scale: SHRINK_SCALE, riseFraction: 1, durationMs: Math.max(holdSecs, 0.1) * 1000 },
    { label: 'Release', scale: 1, riseFraction: 0, durationMs: moveMs },
    { label: 'Rest', scale: 1, riseFraction: 0, durationMs: Math.max(restSecs, 0.1) * 1000 },
  ];

  const { repIndex, phase, running } = usePhaseSequence(phases, reps);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={moveMs} className={className}>
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
