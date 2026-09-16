'use client';
import { useMemo } from 'react';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';
import { buildFullRangePhases, buildQuickFlicksPhases, buildTransitionRestPhase } from './comboPhaseBuilders';

interface ComboFullRangeQuickFlicksProps {
  step1SpeedSecs: number;
  step1HoldSecs: number;
  step1RestSecs: number;
  step1Reps: number;
  step2SpeedSecs: number;
  step2RestSecs: number;
  step2Reps: number;
  transitionRestSecs: number;
  comboSets?: number;
  className?: string;
  children?: React.ReactNode;
}

/** Combo 1: Full Range Contraction (Step 1) chained into Quick Flicks (Step 2), repeated `comboSets` times. */
export function ComboFullRangeQuickFlicks({
  step1SpeedSecs, step1HoldSecs, step1RestSecs, step1Reps,
  step2SpeedSecs, step2RestSecs, step2Reps,
  transitionRestSecs, comboSets, className, children,
}: ComboFullRangeQuickFlicksProps) {
  const phases = useMemo(() => [
    ...buildFullRangePhases('Full Range', step1SpeedSecs, step1HoldSecs, step1RestSecs, step1Reps),
    buildTransitionRestPhase(transitionRestSecs),
    ...buildQuickFlicksPhases('Quick Flicks', step2SpeedSecs, step2RestSecs, step2Reps),
  ], [step1SpeedSecs, step1HoldSecs, step1RestSecs, step1Reps, step2SpeedSecs, step2RestSecs, step2Reps, transitionRestSecs]);

  const { repIndex, phase, running } = usePhaseSequence(phases, comboSets);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={500} className={className}>
      <div className="absolute top-5 left-5 flex flex-col gap-0.5">
        <span className="flex items-baseline gap-1 font-display text-[20px] leading-[32px] font-medium text-primary">
          <RollingNumber value={repIndex} />
          {comboSets && comboSets > 0 && <span>of {comboSets} sets</span>}
        </span>
        {running && phase.stepName && phase.repText && (
          <span className="text-base text-primary">{phase.stepName} - Reps {phase.repText}</span>
        )}
      </div>
      <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display text-[20px] leading-[32px] font-medium text-primary">
        {running ? phase.label : 'Finished'}
      </span>
      {children}
    </PelvicFloorCircleVisual>
  );
}
