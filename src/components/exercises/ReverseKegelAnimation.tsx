'use client';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

// Grows past resting size (rather than shrinking like a contraction) to read
// as an active lengthening/release, the opposite motion of a Kegel. Rests at
// a *centered* riseFraction rather than the bottom-anchored 0 used elsewhere,
// so "down" (bearing down/descending, toward riseFraction 0) reads as a real
// downward movement instead of just growing in place. 0.7, not 0.5, is what
// actually lands at the visual vertical center — PelvicFloorCircleVisual's
// rise math was tuned for its original bottom-anchored callers, where
// riseFraction 0-1 doesn't map linearly onto "0-100% of the frame's height".
const REST_SCALE = 0.7; // starts smaller at rest, then grows more dramatically as it "falls"
const EXPAND_SCALE = 1.45;
const CENTER_RISE = 0.7;
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
    { label: 'Rest', scale: REST_SCALE, riseFraction: CENTER_RISE, durationMs: Math.max(restSecs, 0.1) * 1000 },
    { label: 'Relax', scale: EXPAND_SCALE, riseFraction: DOWN_RISE, durationMs: moveMs },
    { label: 'Hold', scale: EXPAND_SCALE, riseFraction: DOWN_RISE, durationMs: holdMs },
    { label: 'Return to Center', scale: REST_SCALE, riseFraction: CENTER_RISE, durationMs: moveMs },
  ];

  const { repIndex, phase, running } = usePhaseSequence(phases, reps);
  // Accelerating on the way down (a real "drop", not a symmetric ease) and
  // decelerating on the way back up (settling into place), rather than the
  // same ease-in-out for both directions.
  const easing = phase.label === 'Relax' ? 'ease-in' : phase.label === 'Return to Center' ? 'ease-out' : 'ease-in-out';

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={moveMs} easing={easing} className={className}>
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
