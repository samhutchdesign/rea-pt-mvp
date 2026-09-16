'use client';
import { useEffect, useState } from 'react';

export interface Phase {
  /** Label shown to the practitioner while this phase is active. */
  label: string;
  /** Circle scale to be at during this phase (1 = full size, resting). */
  scale: number;
  /** Fraction (0-1) of the max rise distance the circle should be at. */
  riseFraction: number;
  /** How long this phase lasts before moving to the next one, in ms. */
  durationMs: number;
  /** Combo-only: the name of the step/exercise this phase belongs to, shown separately from `label` and `repText`. */
  stepName?: string;
  /** Combo-only: rep progress within the current step (e.g. "Rep 3 of 10"), shown separately from `label`. */
  repText?: string;
}

/**
 * Drives a repeatable sequence of timed phases (e.g. contract / hold /
 * release / rest), looping for `reps` repetitions (0 or undefined loops
 * forever). Each animation component supplies its own `phases` — this hook
 * only owns the timing/looping so that isn't reimplemented per exercise.
 */
export function usePhaseSequence(phases: Phase[], reps?: number) {
  const [repIndex, setRepIndex] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (phases.length === 0) return;
    let cancelled = false;
    let currentRep = 1;
    let currentPhase = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      setRepIndex(currentRep);
      setPhaseIndex(currentPhase);
      timer = setTimeout(() => {
        if (cancelled) return;
        currentPhase++;
        if (currentPhase >= phases.length) {
          currentPhase = 0;
          currentRep++;
          if (reps && reps > 0 && currentRep > reps) {
            setRunning(false);
            setRepIndex(reps);
            setPhaseIndex(0);
            return;
          }
        }
        tick();
      }, phases[currentPhase].durationMs);
    };
    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { repIndex, phase: phases[phaseIndex] ?? phases[0], running };
}
