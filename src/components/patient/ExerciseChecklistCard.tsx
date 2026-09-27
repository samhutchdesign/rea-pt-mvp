'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { cx } from '@/utils/cx';
import type { Exercise, ProgramExercise } from '@/lib/types';

interface ExerciseChecklistCardProps {
  exercise: Exercise;
  programExercise: ProgramExercise;
  completed: boolean;
  onToggleComplete: () => void;
  /** Hide the connecting line below the checkbox (last card in the list). */
  isLast?: boolean;
}

export default function ExerciseChecklistCard({
  exercise,
  programExercise,
  completed,
  onToggleComplete,
  isLast,
}: ExerciseChecklistCardProps) {
  const detailLine = [
    `${programExercise.sets} Set${programExercise.sets === 1 ? '' : 's'}`,
    `${programExercise.reps} Rep${programExercise.reps === 1 ? '' : 's'}`,
  ].join(' / ');

  return (
    <div className="flex w-full items-start gap-2 rounded-lg">
      <div className="flex shrink-0 flex-col items-center gap-3 self-stretch">
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleComplete();
          }}
          aria-pressed={completed}
          aria-label={completed ? `Mark ${exercise.name} incomplete` : `Mark ${exercise.name} complete`}
          className={cx(
            'flex size-11 shrink-0 items-center justify-center rounded-full border shadow-xs transition-colors',
            completed ? 'border-brand-300 bg-brand-100' : 'border-secondary bg-secondary_alt hover:bg-secondary'
          )}
        >
          {completed && <Check size={24} strokeWidth={2} className="text-brand-700" />}
        </button>
        {!isLast && <div className="w-0 flex-1 border-l-2 border-dotted border-secondary" />}
      </div>

      <Link
        href={`/program/${exercise.id}`}
        className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-secondary bg-primary transition-colors hover:border-brand-300"
      >
        <div className="aspect-video w-full shrink-0">
          <ExerciseThumbnail src={exercise.imageUrl} alt={exercise.name} iconSize={32} />
        </div>
        <div className="flex flex-col gap-3 px-5 py-6 text-primary">
          <p className="font-display text-lg font-medium tracking-[0.1px]">{exercise.name}</p>
          <div className="flex flex-col gap-2 text-base text-secondary">
            <p>{detailLine}</p>
            {programExercise.holdSecs > 0 && <p>{programExercise.holdSecs} Sec Hold</p>}
          </div>
        </div>
      </Link>
    </div>
  );
}
