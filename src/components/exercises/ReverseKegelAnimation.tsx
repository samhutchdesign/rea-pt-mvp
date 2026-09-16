'use client';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

// Grows past resting size (rather than shrinking+rising like a contraction)
// to read as an active lengthening/release, the opposite motion of a Kegel.
const EXPAND_SCALE = 1.18;

interface ReverseKegelAnimationProps {
  speedSecs: number;
  restSecs: number;
  reps?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ReverseKegelAnimation({ speedSecs, restSecs, reps, className, children }: ReverseKegelAnimationProps) {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const phases: Phase[] = [
    { label: 'Relax', scale: EXPAND_SCALE, riseFraction: 0, durationMs: moveMs },
    { label: 'Return to Neutral', scale: 1, riseFraction: 0, durationMs: moveMs },
    { label: 'Rest', scale: 1, riseFraction: 0, durationMs: Math.max(restSecs, 0.1) * 1000 },
  ];

  const { repIndex, phase, running } = usePhaseSequence(phases, reps);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={moveMs} className={className}>
      <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display text-[20px] leading-[32px] font-medium text-primary">
        {running ? phase.label : 'Finished'}
      </span>
      <span className="absolute top-5 right-5 flex items-baseline gap-1 font-display text-[20px] leading-[32px] font-medium text-primary">
        <RollingNumber value={repIndex} />
        {reps && reps > 0 && <span>of {reps}</span>}
      </span>
      {children}
    </PelvicFloorCircleVisual>
  );
}
