'use client';
import type { Exercise } from '@/lib/types';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { cueLabel, type ProgramRow } from './programBuilder';
import { formatDuration } from '@/components/exercises/exerciseRx';

interface ProgramOverviewListProps {
  rows: ProgramRow[];
  getExercise: (id: string) => Exercise | undefined;
}

function rowSummary(ex: Exercise, row: ProgramRow): string {
  switch (ex.animationType) {
    case 'breathing-pacer':
      return `${row.speedSecs ?? ex.defaultSpeedSecs ?? 4}s per breath × ${row.loops ?? ex.defaultLoops ?? 5} loops`;
    case 'pf-full-range':
      return `${row.sets} Sets / ${row.reps} Reps / ${row.speedSecs ?? ex.defaultSpeedSecs ?? 0.9}s Speed / ${row.holdSecs} Sec Hold / ${row.restSecs ?? ex.defaultRestSecs ?? 0} Sec Rest`;
    case 'pf-quick-flicks':
      return `${row.sets} Sets / ${row.reps} Reps / ${row.speedSecs ?? ex.defaultSpeedSecs ?? 0.25}s Speed / ${row.restSecs ?? ex.defaultRestSecs ?? 0} Sec Rest`;
    case 'pf-sustained-hold':
      return `${row.sets} Sets / ${row.reps} Reps at ${row.holdIntensityPct ?? ex.defaultHoldIntensityPct ?? 60}% / ${row.speedSecs ?? ex.defaultSpeedSecs ?? 1.3}s Speed / ${row.holdSecs} Sec Hold`;
    case 'pf-elevator':
      return `${row.sets} Sets / ${row.reps} Reps / ${row.stages ?? ex.defaultStages ?? 4} Stages / ${row.speedSecs ?? ex.defaultSpeedSecs ?? 0.6}s Speed`;
    case 'pf-reverse-kegel':
      return `${row.sets} Sets / ${row.reps} Reps / ${row.speedSecs ?? ex.defaultSpeedSecs ?? 1.2}s Speed / ${row.holdSecs} Sec Hold / ${row.restSecs ?? ex.defaultRestSecs ?? 0} Sec Rest`;
    case 'pf-the-knack':
      return `Practiced ${(row.frequency ?? ex.defaultFrequency ?? 'Daily').toLowerCase()}`;
    case 'pf-combo-full-range-quick-flicks': {
      const comboSets = row.comboSets ?? ex.defaultComboSets ?? 3;
      const step1Sets = row.step1Sets ?? ex.defaultStep1Sets ?? 3;
      const step1Reps = row.step1Reps ?? ex.defaultStep1Reps ?? 10;
      const step2Sets = row.step2Sets ?? ex.defaultStep2Sets ?? 3;
      const step2Reps = row.step2Reps ?? ex.defaultStep2Reps ?? 15;
      return `${comboSets} Combo Sets / Full Range: ${step1Sets}×${step1Reps} / Quick Flicks: ${step2Sets}×${step2Reps}`;
    }
    case 'pf-combo-sustained-hold-quick-flicks': {
      const comboSets = row.comboSets ?? ex.defaultComboSets ?? 3;
      const step1Sets = row.step1Sets ?? ex.defaultStep1Sets ?? 3;
      const step1Reps = row.step1Reps ?? ex.defaultStep1Reps ?? 10;
      const step2Sets = row.step2Sets ?? ex.defaultStep2Sets ?? 3;
      const step2Reps = row.step2Reps ?? ex.defaultStep2Reps ?? 15;
      return `${comboSets} Combo Sets / Sustained Hold: ${step1Sets}×${step1Reps} / Quick Flicks: ${step2Sets}×${step2Reps}`;
    }
    case 'pf-dilator-j-curve':
      return `${row.dilatorSize ?? ex.defaultDilatorSize ?? 'Medium'} dilator / ${row.reps} Reps/Side / ${row.holdSecs} Sec Hold`;
    case 'pf-dilator-3-point':
      return `${row.dilatorSize ?? ex.defaultDilatorSize ?? 'Medium'} dilator / ${row.reps} Reps/Direction / ${row.holdSecs} Sec Hold`;
    case 'pf-dilator-half-u':
      return `${row.dilatorSize ?? ex.defaultDilatorSize ?? 'Small'} dilator / ${row.reps} Reps/Side`;
    case 'pf-perineal-massage':
      return `${row.pressureLevel ?? ex.defaultPressureLevel ?? 'Light'} pressure / ${formatDuration(row.durationSecs ?? ex.defaultDurationSecs ?? 150)}`;
    case 'pf-dilator-in-out':
      return `${row.dilatorSize ?? ex.defaultDilatorSize ?? 'Medium'} dilator / ${row.reps} Reps`;
    default:
      return `${row.sets} Sets / ${row.reps} Reps${row.holdSecs > 0 ? ` / ${row.holdSecs} Sec Hold` : ''}`;
  }
}

export function ProgramOverviewList({ rows, getExercise }: ProgramOverviewListProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <span className="text-base font-normal text-primary">Program Overview</span>
      {rows.length === 0 ? (
        <span className="text-xs text-tertiary">No exercises added yet.</span>
      ) : (
        rows.map((row) => {
          const ex = getExercise(row.exerciseId);
          if (!ex) return null;
          return (
            <div key={row.exerciseId} className="flex w-full items-center gap-4 bg-primary p-3">
              <div className="relative h-[72px] w-[116px] shrink-0 overflow-hidden rounded-lg">
                <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} iconSize={20} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <span className="truncate font-display text-md leading-5 font-medium tracking-[0.1px] text-primary">{ex.name}</span>
                <span className="text-xs text-primary">{rowSummary(ex, row)}</span>
                {row.cue && (
                  <span className="flex w-full items-center justify-center rounded-full bg-tertiary px-3 py-2 text-xs text-primary">
                    {cueLabel(row.cue)}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
