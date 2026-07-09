'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/base/buttons/button';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockPatients, mockPrograms, mockExercises, mockChartSessions } from '@/lib/mock-data';
import type { Exercise, ProgramExercise } from '@/lib/types';
import { useViewMode } from '@/lib/viewModeStore';
import { Eye, Pencil, Send, Zap } from 'lucide-react';

export default function PatientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [previewPE, setPreviewPE] = useState<ProgramExercise | null>(null);
  const viewMode = useViewMode();
  const patient = mockPatients.find((p) => p.id === id);
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;
  const completedSessions = (mockChartSessions[id] ?? []).filter((s) => !s.isIntakeSession).length;
  const totalSessions = patient?.totalSessions ?? 8;

  if (!patient) return null;

  if (!program) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-primary mt-0 mb-2">Program</h3>
        <p className="text-sm text-secondary mb-6">
          No program assigned yet. Choose a recommended template or start from scratch.
        </p>
        <div className="flex flex-col gap-4">
          {mockPrograms.map((prog) => (
            <div
              key={prog.id}
              className="rounded-xl border border-secondary bg-primary shadow-xs p-5 cursor-pointer hover:border-brand-600 transition-colors"
              onClick={() => router.push(`/patients/${id}/program/edit`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-primary">{prog.name}</p>
                  <p className="text-xs text-secondary mt-0.5">{prog.description}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {prog.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 shrink-0">
                  {prog.exercises.length} exercises
                </span>
              </div>
            </div>
          ))}
          <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/program/edit`)}>
            Create Program from Scratch
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-primary m-0">{program.name}</h3>
          <p className="text-sm text-secondary mt-0.5">{completedSessions} out of {totalSessions} total sessions</p>
        </div>
        <div className="flex gap-3">
          <Button color="secondary" size="sm" iconLeading={Pencil} onPress={() => router.push(`/patients/${id}/program/edit`)}>
            Modify
          </Button>
          <Button color="primary" size="sm" iconLeading={Send} onPress={() => router.push(`/patients/${id}/program/send`)}>
            Send Program to Patient
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {program.exercises.map((pe) => {
          const ex = mockExercises.find((e) => e.id === pe.exerciseId);
          if (!ex) return null;
          return (
            <div key={pe.exerciseId} className="rounded-xl border border-secondary bg-primary shadow-xs p-4">
              <div className="flex items-center gap-5">
                <div className="w-20 h-16 rounded-lg bg-[#EDE7F6] flex items-center justify-center shrink-0">
                  <Zap size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary mb-0.5">{ex.name}</p>
                  <p className="text-xs text-secondary mb-2">{ex.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {pe.sets} Sets
                    </span>
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {pe.reps} Reps
                    </span>
                    {pe.holdSecs > 0 && (
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                        {pe.holdSecs} Sec Hold
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {pe.frequency}
                    </span>
                  </div>
                </div>
                {viewMode === 'full' && pe.adherence != null && (
                  <div className="flex flex-col items-center gap-1 min-w-[64px]">
                    <span
                      className="text-lg font-bold leading-none"
                      style={{
                        color: pe.adherence >= 80 ? '#2E7D32' : pe.adherence >= 60 ? '#F57F17' : '#C62828',
                      }}
                    >
                      {pe.adherence}%
                    </span>
                    <span className="text-[10px] text-secondary whitespace-nowrap">adherence</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 items-center">
                  <button
                    title="Preview exercise"
                    className="p-1.5 rounded-lg text-secondary hover:bg-secondary hover:text-primary transition-colors"
                    onClick={() => { setPreviewExercise(ex); setPreviewPE(pe); }}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => { setPreviewExercise(null); setPreviewPE(null); }}
        patientPrescription={previewPE ? { sets: previewPE.sets, reps: previewPE.reps, holdSecs: previewPE.holdSecs, frequency: previewPE.frequency } : undefined}
      />
    </div>
  );
}
