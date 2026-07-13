'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/base/buttons/button';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockPatients, mockExercises, mockPrograms, mockChartSessions } from '@/lib/mock-data';
import { useHepState } from '@/lib/patientHepStore';
import type { Exercise, ProgramExercise, HepHistoryEntry, Program } from '@/lib/types';
import { useViewMode } from '@/lib/viewModeStore';
import { ChevronDown, ChevronUp, Eye, Pencil, Send, Zap } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ExerciseCard({
  pe,
  viewMode,
  onPreview,
}: {
  pe: ProgramExercise;
  viewMode: string;
  onPreview: (ex: Exercise, pe: ProgramExercise) => void;
}) {
  const ex = mockExercises.find((e) => e.id === pe.exerciseId);
  if (!ex) return null;
  return (
    <div className="rounded-xl border border-secondary bg-primary shadow-xs p-4">
      <div className="flex items-center gap-5">
        <div className="w-20 h-16 rounded-lg bg-[#EDE7F6] flex items-center justify-center shrink-0">
          <Zap size={28} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary mb-0.5">{ex.name}</p>
          <p className="text-xs text-secondary mb-2">{ex.description}</p>
          <div className="flex gap-1.5 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.sets} Sets</span>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.reps} Reps</span>
            {pe.holdSecs > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.holdSecs} Sec Hold</span>
            )}
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.frequency}</span>
          </div>
        </div>
        {viewMode === 'full' && pe.adherence != null && (
          <div className="flex flex-col items-center gap-1 min-w-[64px]">
            <span
              className="text-lg font-bold leading-none"
              style={{ color: pe.adherence >= 80 ? '#2E7D32' : pe.adherence >= 60 ? '#F57F17' : '#C62828' }}
            >
              {pe.adherence}%
            </span>
            <span className="text-[10px] text-secondary whitespace-nowrap">adherence</span>
          </div>
        )}
        <button
          title="Preview exercise"
          className="p-1.5 rounded-lg text-secondary hover:bg-secondary hover:text-primary transition-colors"
          onClick={() => onPreview(ex, pe)}
        >
          <Eye size={14} />
        </button>
      </div>
    </div>
  );
}

function HistoryEntry({ entry }: { entry: HepHistoryEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-secondary bg-primary shadow-xs overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary transition-colors"
      >
        <div>
          <p className="text-sm font-medium text-primary">{entry.programName}</p>
          <p className="text-xs text-tertiary mt-0.5">
            {formatDate(entry.assignedAt)} – {formatDate(entry.endedAt)} · {entry.exercises.length} exercise{entry.exercises.length !== 1 ? 's' : ''}
          </p>
        </div>
        {open ? <ChevronUp size={14} className="text-quaternary shrink-0" /> : <ChevronDown size={14} className="text-quaternary shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-secondary px-4 py-3 flex flex-col gap-1.5">
          {entry.exercises.map((pe) => {
            const ex = mockExercises.find((e) => e.id === pe.exerciseId);
            if (!ex) return null;
            return (
              <div key={pe.exerciseId} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-primary">{ex.name}</span>
                <span className="text-xs text-tertiary shrink-0 ml-4">
                  {pe.sets} × {pe.reps}{pe.holdSecs > 0 ? ` · ${pe.holdSecs}s hold` : ''} · {pe.frequency}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PatientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [previewPE, setPreviewPE] = useState<ProgramExercise | null>(null);
  const viewMode = useViewMode();
  const patient = mockPatients.find((p) => p.id === id);
  const hep = useHepState(id);

  const program: Program | undefined = hep.programId ? mockPrograms.find((p) => p.id === hep.programId) : undefined;
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
                      <span key={t} className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{t}</span>
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
      {/* Current program header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-primary m-0">{program.name}</h3>
          <p className="text-sm text-secondary mt-0.5">
            {completedSessions} of {totalSessions} sessions
            {hep.programAssignedAt && (
              <span className="ml-3 text-xs text-tertiary">Assigned {formatDate(hep.programAssignedAt)}</span>
            )}
          </p>
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

      {/* Current exercises */}
      <div className="flex flex-col gap-3">
        {program.exercises.map((pe) => (
          <ExerciseCard
            key={pe.exerciseId}
            pe={pe}
            viewMode={viewMode}
            onPreview={(ex, pe) => { setPreviewExercise(ex); setPreviewPE(pe); }}
          />
        ))}
      </div>

      {/* HEP History */}
      {hep.hepHistory.length > 0 && (
        <div className="mt-10">
          <h4 className="text-sm font-semibold text-primary mb-3">Previous Programs</h4>
          <div className="flex flex-col gap-2">
            {[...hep.hepHistory].reverse().map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => { setPreviewExercise(null); setPreviewPE(null); }}
        patientPrescription={previewPE ? { sets: previewPE.sets, reps: previewPE.reps, holdSecs: previewPE.holdSecs, frequency: previewPE.frequency } : undefined}
      />
    </div>
  );
}
