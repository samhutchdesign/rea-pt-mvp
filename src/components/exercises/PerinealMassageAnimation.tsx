'use client';
import { useMemo } from 'react';
import { DilatorVisual } from './DilatorVisual';
import { usePhaseSequence } from './usePhaseSequence';
import { buildPerinealMassagePhases, HALF_U_TRACES } from './dilatorPhaseBuilders';

interface PerinealMassageAnimationProps {
  speedSecs: number;
  className?: string;
  children?: React.ReactNode;
}

/** Perineal/Scar Massage: a continuous "U" sweep — down one side, across the bottom, up the other — back and forth. */
export function PerinealMassageAnimation({ speedSecs, className, children }: PerinealMassageAnimationProps) {
  const phases = useMemo(() => buildPerinealMassagePhases(speedSecs), [speedSecs]);
  const { phase } = usePhaseSequence(phases);

  return (
    <DilatorVisual
      x={phase.x}
      y={phase.y}
      tracePaths={HALF_U_TRACES}
      transitionMs={phase.durationMs}
      transitionTiming="linear"
      rings
      ringSizePx={44}
      className={className}
    >
      <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display text-[20px] leading-[32px] font-medium text-primary">
        {phase.label}
      </span>
      {children}
    </DilatorVisual>
  );
}
