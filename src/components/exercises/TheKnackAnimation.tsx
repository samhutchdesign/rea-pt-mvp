'use client';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';

const SHRINK_SCALE = 0.22;

// The Knack has no prescribed reps/sets/hold/rest — it's a reactive brace
// used before/during real-life pressure moments (cough, lift, etc.), not a
// structured set. Timing is a fixed, non-adjustable demonstration loop.
const PHASES: Phase[] = [
  { label: 'Brace', scale: SHRINK_SCALE, riseFraction: 1, durationMs: 400 },
  { label: 'Hold through activity', scale: SHRINK_SCALE, riseFraction: 1, durationMs: 2000 },
  { label: 'Release', scale: 1, riseFraction: 0, durationMs: 400 },
  { label: 'Rest', scale: 1, riseFraction: 0, durationMs: 1500 },
];

interface TheKnackAnimationProps {
  className?: string;
  children?: React.ReactNode;
}

export function TheKnackAnimation({ className, children }: TheKnackAnimationProps) {
  const { phase } = usePhaseSequence(PHASES);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={400} className={className}>
      <span className="absolute top-5 left-5 font-display text-[20px] leading-[32px] font-medium text-primary">
        {phase.label}
      </span>
      {children}
    </PelvicFloorCircleVisual>
  );
}
