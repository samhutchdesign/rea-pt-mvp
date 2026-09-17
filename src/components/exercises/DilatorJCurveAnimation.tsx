'use client';
import { useMemo } from 'react';
import { DilatorVisual } from './DilatorVisual';
import { usePhaseSequence } from './usePhaseSequence';
import { buildJCurvePhases, J_CURVE_TRACES } from './dilatorPhaseBuilders';

interface DilatorJCurveAnimationProps {
  speedSecs: number;
  holdSecs: number;
  reps: number;
  className?: string;
  children?: React.ReactNode;
}

/** J Curve: from the entrance, curve out to each side like opening curtains, holding the stretch. */
export function DilatorJCurveAnimation({ speedSecs, holdSecs, reps, className, children }: DilatorJCurveAnimationProps) {
  const phases = useMemo(() => buildJCurvePhases(speedSecs, holdSecs, reps), [speedSecs, holdSecs, reps]);
  const { phase } = usePhaseSequence(phases);

  return (
    <DilatorVisual x={phase.x} y={phase.y} scale={phase.scale} tracePaths={J_CURVE_TRACES} transitionMs={phase.durationMs} transitionTiming="linear" rings className={className}>
      <div className="absolute top-5 left-5 flex flex-col gap-2">
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
