'use client';
import type { Exercise } from '@/lib/types';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { cueLabel, type ProgramRow } from './programBuilder';

interface ProgramOverviewListProps {
  rows: ProgramRow[];
  getExercise: (id: string) => Exercise | undefined;
}

export function ProgramOverviewList({ rows, getExercise }: ProgramOverviewListProps) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-sm font-bold text-primary">Program Overview</span>
      {rows.length === 0 ? (
        <span className="text-sm text-tertiary">No exercises added yet.</span>
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
                <p className="mb-0.5 truncate text-sm font-semibold text-primary">{ex.name}</p>
                <p className="mb-1.5 text-xs text-tertiary">
                  {row.sets} Sets / {row.reps} Reps{row.holdSecs > 0 ? ` / ${row.holdSecs} Sec Hold` : ''}
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
