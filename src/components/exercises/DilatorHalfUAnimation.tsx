'use client';
import { useMemo } from 'react';
import { DilatorVisual } from './DilatorVisual';
import { usePhaseSequence } from './usePhaseSequence';
import { buildHalfUPhases, HALF_U_TRACES } from './dilatorPhaseBuilders';

interface DilatorHalfUAnimationProps {
  speedSecs: number;
  reps: number;
  className?: string;
  children?: React.ReactNode;
}

/** Half U: continuous stretch from the top of the entrance toward the bottom, alternating sides each rep. */
export function DilatorHalfUAnimation({ speedSecs, reps, className, children }: DilatorHalfUAnimationProps) {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const phases = useMemo(() => buildHalfUPhases(speedSecs, reps), [speedSecs, reps]);
  const { phase } = usePhaseSequence(phases);

  return (
    <DilatorVisual x={phase.x} y={phase.y} scale={phase.scale} tracePaths={HALF_U_TRACES} transitionMs={moveMs} className={className}>
      <div className="absolute top-5 left-5 flex flex-col gap-0.5">
        {phase.stepName && <span className="font-display text-[20px] leading-[32px] font-medium text-primary">{phase.stepName}</span>}
        {phase.repText && <span className="text-sm text-secondary">Rep {phase.repText}</span>}
      </div>
      <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display text-[20px] leading-[32px] font-medium text-primary">
        {phase.label}
      </span>
      {children}
    </DilatorVisual>
  );
}
