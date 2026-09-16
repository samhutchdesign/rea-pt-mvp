'use client';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

const SHRINK_SCALE = 0.22;

interface SustainedHoldAnimationProps {
  intensityPct: number;
  holdSecs: number;
  restSecs: number;
  reps?: number;
  className?: string;
}

export function SustainedHoldAnimation({ intensityPct, holdSecs, restSecs, reps, className }: SustainedHoldAnimationProps) {
  const targetScale = 1 - (intensityPct / 100) * (1 - SHRINK_SCALE);
  const targetRise = intensityPct / 100;

  const phases: Phase[] = [
    { label: `Contract to ${intensityPct}%`, scale: targetScale, riseFraction: targetRise, durationMs: 1200 },
    { label: 'Hold', scale: targetScale, riseFraction: targetRise, durationMs: Math.max(holdSecs, 0.1) * 1000 },
    { label: 'Release', scale: 1, riseFraction: 0, durationMs: 1500 },
    { label: 'Rest', scale: 1, riseFraction: 0, durationMs: Math.max(restSecs, 0.1) * 1000 },
  ];

  const { repIndex, phase, running } = usePhaseSequence(phases, reps);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={1000} className={className}>
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
