'use client';
import { mockExercises, mockPrograms } from '@/lib/mock-data';
import { getPatientPersona } from '@/lib/patientPersona';
import { usePatientSelfContactOverrides, getEffectivePatientSelfContactInfo } from '@/lib/patientSelfContactStore';
import { useCompletedExerciseIdsToday, toggleExerciseCompletedToday } from '@/lib/exerciseCompletionStore';
import PatientAvatarMenu from '@/components/patient/PatientAvatarMenu';
import ExerciseChecklistCard from '@/components/patient/ExerciseChecklistCard';
import PatientFooter from '@/components/patient/PatientFooter';

export default function PatientProgramListPage() {
  const patient = getPatientPersona();
  const program = mockPrograms.find((p) => p.id === patient.programId);
  const contactOverrides = usePatientSelfContactOverrides();
  const contact = getEffectivePatientSelfContactInfo(patient, contactOverrides);
  const completedIds = useCompletedExerciseIdsToday(patient.id);

  if (!program) {
    return (
      <p className="text-secondary">No program has been assigned yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start gap-1">
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
              onToggleComplete={() => toggleExerciseCompletedToday(patient.id, exercise.id)}
              isLast={i === program.exercises.length - 1}
            />
          );
        })}
      </div>

      <PatientFooter />
    </div>
  );
}
