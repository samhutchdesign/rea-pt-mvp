'use client';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

// Grows past resting size (rather than shrinking like a contraction) to read
// as an active lengthening/release, the opposite motion of a Kegel. Rests at
// a *centered* riseFraction rather than the bottom-anchored 0 used elsewhere,
// so "down" (bearing down/descending, toward riseFraction 0) reads as a real
// downward movement instead of just growing in place.
const EXPAND_SCALE = 1.18;
const CENTER_RISE = 0.5;
const DOWN_RISE = 0;

interface ReverseKegelAnimationProps {
  speedSecs: number;
  holdSecs: number;
  restSecs: number;
  reps?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ReverseKegelAnimation({ speedSecs, holdSecs, restSecs, reps, className, children }: ReverseKegelAnimationProps) {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const phases: Phase[] = [
    { label: 'Rest', scale: 1, riseFraction: CENTER_RISE, durationMs: Math.max(restSecs, 0.1) * 1000 },
    { label: 'Relax', scale: EXPAND_SCALE, riseFraction: DOWN_RISE, durationMs: moveMs },
    { label: 'Hold', scale: EXPAND_SCALE, riseFraction: DOWN_RISE, durationMs: holdMs },
    { label: 'Return to Center', scale: 1, riseFraction: CENTER_RISE, durationMs: moveMs },
  ];

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
