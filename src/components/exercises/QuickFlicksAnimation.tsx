'use client';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence, type Phase } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';

const SHRINK_SCALE = 0.22;

interface QuickFlicksAnimationProps {
  speedSecs: number;
  restSecs: number;
  reps?: number;
  className?: string;
  children?: React.ReactNode;
}

export function QuickFlicksAnimation({ speedSecs, restSecs, reps, className, children }: QuickFlicksAnimationProps) {
  const moveMs = Math.max(speedSecs, 0.05) * 1000;
  const phases: Phase[] = [
    { label: 'Flick', scale: SHRINK_SCALE, riseFraction: 1, durationMs: moveMs },
    { label: 'Release', scale: 1, riseFraction: 0, durationMs: moveMs },
    { label: 'Rest', scale: 1, riseFraction: 0, durationMs: Math.max(restSecs, 0.1) * 1000 },
  ];

  const { repIndex, phase, running } = usePhaseSequence(phases, reps);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={moveMs} className={className}>
      <span className="absolute top-5 left-5 font-display text-[20px] leading-[32px] font-medium text-primary">
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
