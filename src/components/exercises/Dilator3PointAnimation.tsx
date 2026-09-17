'use client';
import { useMemo } from 'react';
import { DilatorVisual } from './DilatorVisual';
import { usePhaseSequence } from './usePhaseSequence';
import { build3PointPhases, THREE_POINT_TRACES } from './dilatorPhaseBuilders';

interface Dilator3PointAnimationProps {
  speedSecs: number;
  holdSecs: number;
  reps: number;
  className?: string;
  children?: React.ReactNode;
}

/** 3-Point Stretch (Peace Sign): pulse, then stretch to 8, 4, and 6 o'clock in turn, holding each. */
export function Dilator3PointAnimation({ speedSecs, holdSecs, reps, className, children }: Dilator3PointAnimationProps) {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const phases = useMemo(() => build3PointPhases(speedSecs, holdSecs, reps), [speedSecs, holdSecs, reps]);
  const { phase } = usePhaseSequence(phases);

  return (
    <DilatorVisual x={phase.x} y={phase.y} scale={phase.scale} tracePaths={THREE_POINT_TRACES} transitionMs={moveMs} className={className}>
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
