import type { Phase } from './usePhaseSequence';

const SHRINK_SCALE = 0.22;

/**
 * Builds one Contract/Hold/Release/Rest cycle, repeated `reps` times, each
 * rep labeled "<stepLabel> · Rep N of reps · <phase>". Shared by the
 * standalone Full Range animation and any combo that uses it as a step.
 */
export function buildFullRangePhases(stepLabel: string, speedSecs: number, holdSecs: number, restSecs: number, reps: number): Phase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const restMs = Math.max(restSecs, 0.1) * 1000;
  const phases: Phase[] = [];
  for (let i = 1; i <= Math.max(reps, 1); i++) {
    const repText = `Rep ${i} of ${reps}`;
    phases.push({ label: 'Contract', scale: SHRINK_SCALE, riseFraction: 1, durationMs: moveMs, stepName: stepLabel, repText });
    phases.push({ label: 'Hold', scale: SHRINK_SCALE, riseFraction: 1, durationMs: holdMs, stepName: stepLabel, repText });
    phases.push({ label: 'Release', scale: 1, riseFraction: 0, durationMs: moveMs, stepName: stepLabel, repText });
    phases.push({ label: 'Rest', scale: 1, riseFraction: 0, durationMs: restMs, stepName: stepLabel, repText });
  }
  return phases;
}

/**
 * Builds one Contract-to-intensity/Hold/Release/Rest cycle, repeated `reps`
 * times. Shared by the standalone Sustained Hold animation and any combo
 * that uses it as a step.
 */
export function buildSustainedHoldPhases(stepLabel: string, speedSecs: number, intensityPct: number, holdSecs: number, restSecs: number, reps: number): Phase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const restMs = Math.max(restSecs, 0.1) * 1000;
  const targetScale = 1 - (intensityPct / 100) * (1 - SHRINK_SCALE);
  const targetRise = intensityPct / 100;
  const phases: Phase[] = [];
  for (let i = 1; i <= Math.max(reps, 1); i++) {
    const repText = `Rep ${i} of ${reps}`;
    phases.push({ label: `Contract to ${intensityPct}%`, scale: targetScale, riseFraction: targetRise, durationMs: moveMs, stepName: stepLabel, repText });
    phases.push({ label: 'Hold', scale: targetScale, riseFraction: targetRise, durationMs: holdMs, stepName: stepLabel, repText });
    phases.push({ label: 'Release', scale: 1, riseFraction: 0, durationMs: moveMs, stepName: stepLabel, repText });
    phases.push({ label: 'Rest', scale: 1, riseFraction: 0, durationMs: restMs, stepName: stepLabel, repText });
  }
  return phases;
}

/**
 * Builds one Flick/Release/Rest cycle, repeated `reps` times. Shared by the
 * standalone Quick Flicks animation and any combo that uses it as a step.
 */
export function buildQuickFlicksPhases(stepLabel: string, speedSecs: number, restSecs: number, reps: number): Phase[] {
  const moveMs = Math.max(speedSecs, 0.05) * 1000;
  const restMs = Math.max(restSecs, 0.1) * 1000;
  const phases: Phase[] = [];
  for (let i = 1; i <= Math.max(reps, 1); i++) {
    const repText = `Rep ${i} of ${reps}`;
    phases.push({ label: 'Flick', scale: SHRINK_SCALE, riseFraction: 1, durationMs: moveMs, stepName: stepLabel, repText });
    phases.push({ label: 'Release', scale: 1, riseFraction: 0, durationMs: moveMs, stepName: stepLabel, repText });
    phases.push({ label: 'Rest', scale: 1, riseFraction: 0, durationMs: restMs, stepName: stepLabel, repText });
  }
  return phases;
}

/** Single rest phase between Step 1 and Step 2 in a combo. */
export function buildTransitionRestPhase(restSecs: number): Phase {
  return { label: 'Transition Rest', scale: 1, riseFraction: 0, durationMs: Math.max(restSecs, 0.1) * 1000, stepName: 'Transition' };
}
