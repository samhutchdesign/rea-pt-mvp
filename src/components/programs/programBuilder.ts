export interface ProgramRow {
  exerciseId: string;
  sets: number;
  reps: number;
  holdSecs: number;
  cue: string;
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
