'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import AudioRecordingDialog from '@/components/exercises/AudioRecordingDialog';
import { mockExercises, mockExercisesFull, mockPrograms, mockPatients } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import type { Patient } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Divider } from '@/components/ui/divider';
import { ChevronRight, Heart, ListPlus, Mic, Pencil, UserPlus, Zap } from 'lucide-react';

function variationLabel(name: string): string {
  const idx = name.indexOf(':');
  return idx !== -1 ? name.slice(idx + 1).trim() : name;
}

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const viewMode = useViewMode();

  const sourceArray = id.startsWith('fx-') ? mockExercisesFull : mockExercises;
  const ex = sourceArray.find((e) => e.id === id);
  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [programOpen, setProgramOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const handleAddToProgram = () => {
    const prog = mockPrograms.find((p) => p.id === selectedProgramId);
    if (prog) toast.success(`Exercise added to "${prog.name}"!`);
    setProgramOpen(false);
    setSelectedProgramId(null);
  };

  const handleAssign = () => {
    if (selectedPatient) {
      toast.success(`Exercise added to ${selectedPatient.firstName} ${selectedPatient.lastName}'s program!`);
    }
    setAssignOpen(false);
    setSelectedPatient(null);
  };

  if (!ex) return (
    <div className="p-8">
      <p className="text-secondary">Exercise not found.</p>
    </div>
  );

  const siblings = ex.variationGroup
    ? sourceArray.filter((e) => e.variationGroup === ex.variationGroup).sort((a, b) => b.usageCount - a.usageCount)
    : [];

  const groupName = ex.variationGroup ? (ex.defaultName ?? ex.name.split(':')[0].trim()) : null;

  const allTags = [...new Set([...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart])];

  const prescriptionTag = (label: string) => (
    <span key={label} className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
      {label}
    </span>
  );

  const usedInPrograms = mockPrograms.filter((prog) => prog.exercises.some((pe) => pe.exerciseId === id));

  const breadcrumbs = groupName
    ? [{ label: 'All Exercises', href: '/exercises' }, { label: groupName, href: `/exercises/${siblings[0]?.id ?? id}` }, { label: variationLabel(ex.name) }]
    : [{ label: 'All Exercises', href: '/exercises' }, { label: ex.name }];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <div className="p-8 pt-8 max-w-[820px]">

        {/* Variation selector */}
        {siblings.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-[#D0BCFF] bg-[#F5F3FF] px-4 py-3">
            <span className="whitespace-nowrap text-xs font-semibold text-brand-700">{groupName}</span>
            <select
              value={id}
              onChange={(e) => router.push(`/exercises/${e.target.value}`)}
              className="flex-1 min-w-[200px] rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
            >
              {siblings.map((s) => (
                <option key={s.id} value={s.id}>{variationLabel(s.name)}</option>
              ))}
            </select>
            <span className="inline-flex items-center rounded-md bg-[#EDE7F6] px-2.5 py-1 text-xs font-semibold text-brand-700">
              {siblings.length} variations
            </span>
          </div>
        )}

        {/* Video */}
        {ex.videoUrl ? (
          <div className="mb-6 w-full h-[360px] rounded-lg overflow-hidden bg-[#0f0f0f]">
            <iframe
              src={`https://www.youtube.com/embed/${ex.videoUrl}?rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          </div>
        ) : (
          <div className="mb-6 w-full h-[300px] rounded-lg bg-[#EDE7F6] flex items-center justify-center">
            <div className="text-center">
              <Zap size={64} color="#6750A4" />
              <div className="mt-2">
                <Button color="primary" size="sm" iconLeading={ChevronRight}>Play Video</Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h2 className="mt-0 mb-1 text-2xl font-bold text-primary">{ex.name}</h2>
            <p className="text-secondary text-sm">{ex.description}</p>
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
            {viewMode === 'full' && (
              <Button color="secondary" size="sm" iconLeading={Mic} onPress={() => setAudioOpen(true)}>Record Audio Cue</Button>
            )}
            <Button color="secondary" size="sm" iconLeading={ListPlus} onPress={() => setProgramOpen(true)}>Add to Program</Button>
            <Button color="secondary" size="sm" iconLeading={UserPlus} onPress={() => setAssignOpen(true)}>Add to Patient</Button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary bg-primary shadow-xs hover:bg-secondary transition-colors"
            >
              {isFavorite
                ? <Heart size={16} fill="#E91E63" color="#E91E63" />
                : <Heart size={16} className="text-secondary" />}
            </button>
            <Button color="secondary" size="sm" iconLeading={Pencil} onPress={() => router.push(`/exercises/new?edit=${id}`)}>Edit</Button>
          </div>
        </div>

        {/* Prescription chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {prescriptionTag(`${ex.defaultSets} Sets`)}
          {prescriptionTag(`${ex.defaultReps} Reps`)}
          {ex.defaultHoldSecs > 0 && prescriptionTag(`${ex.defaultHoldSecs}s Hold`)}
          {prescriptionTag(ex.defaultFrequency)}
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-md border border-secondary bg-secondary px-2.5 py-1 text-xs text-secondary">
              {tag}
            </span>
          ))}
        </div>

        <Divider className="mb-6" />

        {/* Programs using this exercise */}
        {usedInPrograms.length > 0 && (
          <>
            <h3 className="mt-0 mb-3 text-lg font-semibold text-primary">Used in Programs</h3>
            <div className="mb-6 flex flex-wrap gap-2">
              {usedInPrograms.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => router.push(`/programs/${prog.id}`)}
                  className="inline-flex items-center rounded-md bg-[#EDE7F6] px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-[#DDD6F3] transition-colors"
                >
                  {prog.name}
                </button>
              ))}
            </div>
            <Divider className="mb-6" />
          </>
        )}

        {/* Instructions */}
        <h3 className="mt-0 mb-4 text-lg font-semibold text-primary">Instructions</h3>
        <ol className="mb-6 pl-6">
          {ex.instructions.map((step, i) => (
            <li key={i} className="mb-2 text-sm text-primary">{step}</li>
          ))}
        </ol>

        <Divider className="mb-6" />

        {/* Common mistakes */}
        <h3 className="mt-0 mb-4 text-lg font-semibold" style={{ color: '#FB8C00' }}>Common Mistakes</h3>
        <ul className="pl-6">
          {ex.commonMistakes.map((m, i) => (
            <li key={i} className="mb-2 text-sm text-primary">{m}</li>
          ))}
        </ul>
      </div>

      <AudioRecordingDialog
        open={audioOpen}
        exerciseName={ex.name}
        videoId={ex.videoUrl}
        onClose={() => setAudioOpen(false)}
        onSave={(_blobUrl, _dur) => setAudioOpen(false)}
      />

      {/* Add to Program modal */}
      <ModalOverlay isOpen={programOpen} onOpenChange={(open) => { if (!open) { setProgramOpen(false); setSelectedProgramId(null); } }}>
        <Modal>
          <Dialog>
            <div className="p-6 w-[440px]">
              <h3 className="mb-4 text-lg font-semibold text-primary">Add to Program</h3>
              <div className="py-2">
                <select
                  value={selectedProgramId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__new__') {
                      router.push('/programs/new');
                      setProgramOpen(false);
                      return;
                    }
                    setSelectedProgramId(val || null);
                  }}
                  className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <option value="">Select a program…</option>
                  <option value="__new__">+ Create new program</option>
                  {mockPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button color="secondary" size="sm" onPress={() => { setProgramOpen(false); setSelectedProgramId(null); }}>Cancel</Button>
                <Button color="primary" size="sm" isDisabled={!selectedProgramId} onPress={handleAddToProgram}>Add to Program</Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>

      {/* Add to Patient modal */}
      <ModalOverlay isOpen={assignOpen} onOpenChange={(open) => { if (!open) { setAssignOpen(false); setSelectedPatient(null); } }}>
        <Modal>
          <Dialog>
            <div className="p-6 w-[440px]">
              <h3 className="mb-4 text-lg font-semibold text-primary">Add to Patient's Program</h3>
              <div className="py-2">
                <select
                  value={selectedPatient?.id ?? ''}
                  onChange={(e) => setSelectedPatient(mockPatients.find((p) => p.id === e.target.value) ?? null)}
                  className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <option value="">Select a patient…</option>
                  {mockPatients.filter((p) => !p.archived).map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button color="secondary" size="sm" onPress={() => { setAssignOpen(false); setSelectedPatient(null); }}>Cancel</Button>
                <Button color="primary" size="sm" isDisabled={!selectedPatient} onPress={handleAssign}>Add to Program</Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
