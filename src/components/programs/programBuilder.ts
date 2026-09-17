export interface ProgramRow {
  exerciseId: string;
  sets: number;
  reps: number;
  holdSecs: number;
  cue: string;
  /** Seconds per animation cycle (Breathing Pacer). */
  speedSecs?: number;
  /** Number of animation cycles (Breathing Pacer). */
  loops?: number;
  /** Starting position (pelvic-floor animation exercises). */
  startingPosition?: 'Lying' | 'Sitting' | 'Standing';
  /** Rest between reps, in seconds. */
  restSecs?: number;
  /** Contraction intensity target, as a percentage (Sustained Hold). */
  holdIntensityPct?: number;
  /** Number of graded stages (The Elevator). */
  stages?: number;
  /** Pause at each stage, in seconds (The Elevator). */
  stagePauseSecs?: number;
  /** Prescribed frequency (pelvic-floor animation exercises). */
  frequency?: string;
  // Combo exercises (Step 1 -> Transition Rest -> Step 2, repeated Combo Sets times)
  step1Sets?: number;
  step1Reps?: number;
  step1SpeedSecs?: number;
  step1HoldSecs?: number;
  step1RestSecs?: number;
  step1IntensityPct?: number;
  step2Sets?: number;
  step2Reps?: number;
  step2SpeedSecs?: number;
  step2RestSecs?: number;
  transitionRestSecs?: number;
  comboSets?: number;
  /** Dilator size (dilator exercises). Informational only — doesn't affect the animation. */
  dilatorSize?: 'Small' | 'Medium' | 'Large' | 'Extra Large';
  /** Length of the contract/relax pulse before each direction, in seconds (3-Point Stretch). */
  contractSecs?: number;
}

export const CUES = [
  { key: 'relaxation', label: 'Relaxation Cue' },
  { key: 'contraction', label: 'Pelvic Floor Contraction Cue' },
  { key: 'pressure', label: 'Pressure Management Cue' },
];

export function cueLabel(key: string) {
  return CUES.find((c) => c.key === key)?.label ?? '';
}

export const PROGRAM_BUILDER_STEPS = ['Add Exercises', 'Edit Exercises', 'Add Details'];
