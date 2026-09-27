'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { mockExercises, mockPrograms } from '@/lib/mock-data';
import { getPatientPersona } from '@/lib/patientPersona';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import PatientFooter from '@/components/patient/PatientFooter';

export default function PatientExerciseDetailPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = use(params);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  const patient = getPatientPersona();
  const program = mockPrograms.find((p) => p.id === patient.programId);
  const exercise = mockExercises.find((e) => e.id === exerciseId);
  const programExercise = program?.exercises.find((pe) => pe.exerciseId === exerciseId);

  if (!exercise) {
    return <p className="pt-7 text-secondary">Exercise not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6 pt-7">
      <Link
        href="/program"
        className="flex h-12 w-fit items-center gap-2 rounded-lg border border-tertiary bg-primary px-4 text-base text-primary hover:bg-secondary"
      >
        <ArrowLeft size={24} strokeWidth={1.25} />
        back
      </Link>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-secondary">
        <ExerciseThumbnail src={exercise.imageUrl} alt={exercise.name} iconSize={48} />
        <button
          aria-label="Play exercise video"
          className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary shadow-[0px_0px_5px_rgba(0,0,0,0.15)]"
        >
          <Play size={20} className="ml-0.5 text-primary" fill="currentColor" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <p className="font-display text-2xl font-normal text-primary">{exercise.name}</p>

        <div className="flex flex-col gap-4 rounded-lg border border-secondary p-5">
          <p className={descriptionExpanded ? 'text-base text-primary' : 'truncate text-base text-primary'}>
            {exercise.description}
          </p>
          <button
            onClick={() => setDescriptionExpanded((v) => !v)}
            className="w-fit text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {descriptionExpanded ? 'show less' : 'show more'}
          </button>
        </div>

        <div className="border-t border-secondary" />

        <div className="flex flex-col gap-7">
          <button
            onClick={() => setInstructionsOpen((v) => !v)}
            className="flex w-full items-center justify-between text-primary"
          >
            <p className="font-display text-xl font-medium">Instructions</p>
            {instructionsOpen ? <ChevronUp size={24} strokeWidth={1.25} /> : <ChevronDown size={24} strokeWidth={1.25} />}
          </button>

          {instructionsOpen && (
            <>
              {programExercise?.cue && (
                <div className="flex w-full flex-col gap-4 rounded-lg border border-brand-300 bg-brand-50 px-5 pt-5 pb-6">
                  <p className="font-display text-lg font-medium tracking-[0.1px] text-brand-700">Cue</p>
                  <p className="text-base text-brand-700">{programExercise.cue}</p>
                </div>
              )}

              <ol className="flex list-decimal flex-col gap-4 pl-6 text-base text-primary">
                {exercise.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>

        <div className="border-t border-secondary" />

        <div className="flex flex-col gap-7 text-primary">
          <p className="font-display text-xl font-medium">Common Mistakes</p>
          <ul className="flex list-disc flex-col gap-4 pl-6 text-base">
            {exercise.commonMistakes.map((mistake, i) => (
              <li key={i}>{mistake}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-secondary" />
      </div>

      <PatientFooter />
    </div>
  );
}
