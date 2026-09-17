'use client';
import { useMemo } from 'react';
import { DilatorVisual } from './DilatorVisual';
import { usePhaseSequence } from './usePhaseSequence';
import { buildDilatorInOutPhases, DILATOR_IN_OUT_TRACES } from './dilatorPhaseBuilders';

interface DilatorInOutAnimationProps {
  speedSecs: number;
  reps: number;
  className?: string;
  children?: React.ReactNode;
}

/** Dilator In & Out: glide up ("in") and down ("out") between two guide rails, shrinking slightly as it goes in. */
export function DilatorInOutAnimation({ speedSecs, reps, className, children }: DilatorInOutAnimationProps) {
  const phases = useMemo(() => buildDilatorInOutPhases(speedSecs, reps), [speedSecs, reps]);
  const { phase } = usePhaseSequence(phases);

  return (
    <DilatorVisual
      x={phase.x}
      y={phase.y}
      scale={phase.scale}
      tracePaths={DILATOR_IN_OUT_TRACES}
      showOval={false}
      traceDashed={false}
      traceClassName="stroke-brand-300"
      transitionMs={phase.durationMs}
      rings
      ringSizePx={84}
      className={className}
    >
      <div className="absolute top-5 left-5 flex flex-col gap-2">
        {phase.repText && <span className="text-sm text-secondary">Rep {phase.repText}</span>}
      </div>
      <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display text-[20px] leading-[32px] font-medium text-primary">
        {phase.label}
      </span>
      {children}
    </DilatorVisual>
  );
}
