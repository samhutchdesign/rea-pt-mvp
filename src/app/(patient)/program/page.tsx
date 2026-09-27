'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { mockExercises, mockPrograms } from '@/lib/mock-data';
import { getPatientPersona } from '@/lib/patientPersona';
import { usePatientSelfContactOverrides, getEffectivePatientSelfContactInfo } from '@/lib/patientSelfContactStore';
import { useCompletedExerciseIds, toggleExerciseCompleted, toDateKey } from '@/lib/exerciseCompletionStore';
import PatientAvatarMenu from '@/components/patient/PatientAvatarMenu';
import ExerciseChecklistCard from '@/components/patient/ExerciseChecklistCard';
import PatientFooter from '@/components/patient/PatientFooter';

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export default function PatientProgramListPage() {
  const patient = getPatientPersona();
  const program = mockPrograms.find((p) => p.id === patient.programId);
  const contactOverrides = usePatientSelfContactOverrides();
  const contact = getEffectivePatientSelfContactInfo(patient, contactOverrides);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateKey = toDateKey(selectedDate);
  const completedIds = useCompletedExerciseIds(patient.id, dateKey);

  if (!program) {
    return (
      <p className="pt-7 text-secondary">No program has been assigned yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="relative left-1/2 flex w-screen -translate-x-1/2 flex-col">
        <div className="border-b border-primary bg-primary">
          <div className="mx-auto flex w-full max-w-[720px] items-start gap-1 px-4 pt-7 pb-5">
            <div className="flex flex-1 flex-col gap-3 text-primary">
              <p className="font-display text-2xl font-normal">Your Program</p>
              <p className="text-base text-secondary">
                {program.exercises.length} Exercises, {program.frequency}
              </p>
            </div>
            <PatientAvatarMenu
              name={`${patient.firstName} ${patient.lastName}`}
              email={contact.email}
              initials={patient.avatarInitials}
            />
          </div>
        </div>

        <div className="border-b border-primary bg-neutral-200">
          <div className="mx-auto flex w-full max-w-[720px] items-center justify-center gap-3 px-2 py-1">
            <button
              onClick={() => setSelectedDate((d) => addDays(d, -1))}
              aria-label="Previous day"
              className="flex size-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/60"
            >
              <ArrowLeft size={24} strokeWidth={1.25} className="text-primary" />
            </button>
            <p className="flex-1 text-center text-base font-medium text-primary">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <button
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
              aria-label="Next day"
              className="flex size-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/60"
            >
              <ArrowRight size={24} strokeWidth={1.25} className="text-primary" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:items-start sm:gap-4">
        {program.exercises.map((programExercise, i) => {
          const exercise = mockExercises.find((e) => e.id === programExercise.exerciseId);
          if (!exercise) return null;
          return (
            <ExerciseChecklistCard
              key={programExercise.exerciseId}
              exercise={exercise}
              programExercise={programExercise}
              completed={completedIds.has(exercise.id)}
              onToggleComplete={() => toggleExerciseCompleted(patient.id, exercise.id, dateKey)}
              isLast={i === program.exercises.length - 1}
            />
          );
        })}
      </div>

      <PatientFooter />
    </div>
  );
}
