'use client';
import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Divider } from '@/components/ui/divider';
import { Drawer } from '@/components/ui/drawer';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { mockPrograms } from '@/lib/mock-data';
import type { Exercise, Program } from '@/lib/types';
import AudioRecordingDialog from '@/components/exercises/AudioRecordingDialog';
import { useViewMode } from '@/lib/viewModeStore';
import { List, Mic, X, Zap } from 'lucide-react';

interface PatientPrescription {
  sets: number;
  reps: number;
  holdSecs: number;
  frequency: string;
}

interface Props {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToCurrentProgram?: () => void;
  patientPrescription?: PatientPrescription;
  onActionBlocked?: () => void;
}

export default function ExercisePreviewDrawer({ exercise, open, onClose, onAddToCurrentProgram, patientPrescription, onActionBlocked }: Props) {
  const [programSelectorOpen, setProgramSelectorOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [audioOpen, setAudioOpen] = useState(false);
  const viewMode = useViewMode();

  if (!exercise) return null;

  const allTags = [...new Set([
    ...exercise.tags.specialty,
    ...exercise.tags.condition,
    ...exercise.tags.surgery,
    ...exercise.tags.muscle,
    ...exercise.tags.bodyPart,
  ])];

  const handleAddToProgram = () => {
    setProgramSelectorOpen(false);
    setSelectedProgram(null);
  };

  const PrescriptionTag = ({ label }: { label: string }) => (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
      {label}
    </span>
  );

  return (
    <>
      <Drawer open={open} onClose={onClose} width={480}>
        {/* Video Area */}
        <div className="relative w-full aspect-video overflow-hidden" style={{ background: exercise.videoUrl ? '#0f0f0f' : '#F0EDF6' }}>
          {exercise.videoUrl ? (
            <iframe
              src={`https://www.youtube.com/embed/${exercise.videoUrl}?rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0 block"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Zap size={52} className="text-brand-300" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="text-xl font-bold text-primary mb-1">{exercise.name}</h2>
          <p className="text-sm text-secondary mb-4">{exercise.description}</p>

          {patientPrescription && (
            <div className="mb-5 rounded-lg border border-brand-200 bg-brand-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">Patient Prescription</p>
              <div className="flex flex-wrap gap-2">
                <PrescriptionTag label={`${patientPrescription.sets} Sets`} />
                <PrescriptionTag label={`${patientPrescription.reps} Reps`} />
                {patientPrescription.holdSecs > 0 && <PrescriptionTag label={`${patientPrescription.holdSecs}s Hold`} />}
                <PrescriptionTag label={patientPrescription.frequency} />
              </div>
            </div>
          )}

          <Divider className="mb-5" />

          <p className="mb-3 text-sm font-semibold text-primary">Instructions</p>
          <ol className="pl-5 mb-5 space-y-1.5 list-decimal">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="text-sm text-secondary">{step}</li>
            ))}
          </ol>

          <Divider className="mb-5" />

          <p className="mb-3 text-sm font-semibold text-warning-600">Common Mistakes</p>
          <ul className="pl-5 space-y-1.5 list-disc">
            {exercise.commonMistakes.map((m, i) => (
              <li key={i} className="text-sm text-secondary">{m}</li>
            ))}
          </ul>
        </div>

        {/* Action bar */}
        <div className="shrink-0 border-t border-secondary px-6 py-4 flex gap-3">
          {viewMode === 'full' && (
            <Button size="sm" color="secondary" iconLeading={Mic} onPress={() => onActionBlocked ? onActionBlocked() : setAudioOpen(true)}>
              Record Audio Cue
            </Button>
          )}
          {onAddToCurrentProgram && (
            <Button
              size="sm"
              color="primary"
              onPress={() => onActionBlocked ? onActionBlocked() : (onAddToCurrentProgram(), onClose())}
              className="flex-1"
            >
              Add to This Program
            </Button>
          )}
          <Button
            size="sm"
            color={onAddToCurrentProgram ? 'secondary' : 'primary'}
            iconLeading={List}
            onPress={() => onActionBlocked ? onActionBlocked() : setProgramSelectorOpen(true)}
            className="flex-1"
          >
            Add to a Program
          </Button>
        </div>
      </Drawer>

      <AudioRecordingDialog
        open={audioOpen}
        exerciseName={exercise.name}
        videoId={exercise.videoUrl}
        onClose={() => setAudioOpen(false)}
        onSave={(_blobUrl, _dur) => setAudioOpen(false)}
      />

      {/* Program Selector Modal */}
      <ModalOverlay isOpen={programSelectorOpen} onOpenChange={(v) => { if (!v) { setProgramSelectorOpen(false); setSelectedProgram(null); } }}>
        <Modal className="w-full max-w-sm">
          <Dialog>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-1">Add to a Program</h2>
              <p className="text-sm text-secondary mb-4">
                Select a program to add <strong>{exercise.name}</strong> to.
              </p>
              <select
                value={selectedProgram?.id ?? ''}
                onChange={(e) => setSelectedProgram(mockPrograms.find((p) => p.id === e.target.value) ?? null)}
                className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 mb-5"
              >
                <option value="">Search programs…</option>
                {mockPrograms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <Button color="secondary" onPress={() => { setProgramSelectorOpen(false); setSelectedProgram(null); }}>Cancel</Button>
                <Button color="primary" isDisabled={!selectedProgram} onPress={handleAddToProgram}>Add to Program</Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
