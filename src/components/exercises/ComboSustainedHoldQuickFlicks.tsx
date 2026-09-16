'use client';
import { useMemo } from 'react';
import { PelvicFloorCircleVisual } from './PelvicFloorCircleVisual';
import { usePhaseSequence } from './usePhaseSequence';
import { RollingNumber } from './RollingNumber';
import { buildSustainedHoldPhases, buildQuickFlicksPhases, buildTransitionRestPhase } from './comboPhaseBuilders';

interface ComboSustainedHoldQuickFlicksProps {
  step1SpeedSecs: number;
  step1IntensityPct: number;
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

/** Combo 2: Sustained Hold (Step 1) chained into Quick Flicks (Step 2), repeated `comboSets` times. */
export function ComboSustainedHoldQuickFlicks({
  step1SpeedSecs, step1IntensityPct, step1HoldSecs, step1RestSecs, step1Reps,
  step2SpeedSecs, step2RestSecs, step2Reps,
  transitionRestSecs, comboSets, className, children,
}: ComboSustainedHoldQuickFlicksProps) {
  const phases = useMemo(() => [
    ...buildSustainedHoldPhases('Sustained Hold', step1SpeedSecs, step1IntensityPct, step1HoldSecs, step1RestSecs, step1Reps),
    buildTransitionRestPhase(transitionRestSecs),
    ...buildQuickFlicksPhases('Quick Flicks', step2SpeedSecs, step2RestSecs, step2Reps),
  ], [step1SpeedSecs, step1IntensityPct, step1HoldSecs, step1RestSecs, step1Reps, step2SpeedSecs, step2RestSecs, step2Reps, transitionRestSecs]);

  const { repIndex, phase, running } = usePhaseSequence(phases, comboSets);

  return (
    <PelvicFloorCircleVisual scale={phase.scale} riseFraction={phase.riseFraction} transitionMs={500} className={className}>
      <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display text-[20px] leading-[32px] font-medium text-primary">
        {running ? phase.label : 'Finished'}
      </span>
      <span className="absolute top-5 right-5 flex items-baseline gap-1 font-display text-[20px] leading-[32px] font-medium text-primary">
        <RollingNumber value={repIndex} />
        {comboSets && comboSets > 0 && <span>of {comboSets} sets</span>}
      </span>
      {children}
    </PelvicFloorCircleVisual>
  );
}
