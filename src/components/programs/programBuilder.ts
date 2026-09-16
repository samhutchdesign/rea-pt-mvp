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
