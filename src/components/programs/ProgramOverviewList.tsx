'use client';
import type { Exercise } from '@/lib/types';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { cueLabel, type ProgramRow } from './programBuilder';

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
    default:
      return `${row.sets} Sets / ${row.reps} Reps${row.holdSecs > 0 ? ` / ${row.holdSecs} Sec Hold` : ''}`;
  }
}

export function ProgramOverviewList({ rows, getExercise }: ProgramOverviewListProps) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-base font-bold text-primary">Program Overview</span>
      {rows.length === 0 ? (
        <span className="text-xs text-tertiary">No exercises added yet.</span>
      ) : (
        rows.map((row) => {
          const ex = getExercise(row.exerciseId);
          if (!ex) return null;
          return (
            <div key={row.exerciseId} className="flex items-start gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} iconSize={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display mb-0.5 truncate text-base font-semibold text-primary">{ex.name}</p>
                <p className="mb-1.5 text-xs text-tertiary">
                  {rowSummary(ex, row)}
                </p>
                {row.cue && (
                  <span className="inline-block rounded-full border border-secondary bg-primary px-2 py-0.5 text-xs text-secondary">
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
