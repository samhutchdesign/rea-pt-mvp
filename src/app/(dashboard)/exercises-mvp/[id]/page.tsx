'use client';
import { use, useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AudioRecordingDialog from '@/components/exercises/AudioRecordingDialog';
import { mockExercises, mockPrograms, mockPatients } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import { Divider } from '@/components/ui/divider';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import type { Exercise, Patient } from '@/lib/types';
import { ArrowLeft, Copy, Heart, ListPlus, Mic, MoreHorizontal, Pencil, Play, Share2, UserPlus } from 'lucide-react';
import { cx } from '@/utils/cx';

const MOCK_TRANSCRIPT = 'This exercise focuses on coordinating diaphragmatic breath with pelvic floor relaxation and engagement. Begin by finding a comfortable, supported position. Inhale slowly through your nose, allowing your ribcage to expand in all directions as your pelvic floor gently descends. Exhale fully, feeling the pelvic floor lift and the deep abdominals gently draw in. Repeat at your own pace, without forcing or straining at any point.';

const RELAXATION_CUES = [
  { key: 'relaxation', label: 'Relaxation Cue', text: 'Inhale and allow your pelvic floor to lengthen and soften' },
  { key: 'contraction', label: 'Pelvic Floor Contraction Cue', text: 'Exhale and gently contract your pelvic floor, then fully relax' },
  { key: 'pressure', label: 'Pressure Management Cue', text: 'Exhale with the effort and avoid holding your breath' },
];

function SidebarExerciseCard({ ex, onClick }: { ex: Exercise; onClick: () => void }) {
  return (
    <div className="flex items-center gap-4 cursor-pointer group" onClick={onClick}>
      <div className="relative h-[90px] w-36 shrink-0 overflow-hidden rounded-lg">
        <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="font-display text-base font-medium tracking-[0.1px] text-primary group-hover:text-brand-700 transition-colors">{ex.name}</span>
        <span className="text-xs text-primary">{ex.category}</span>
        <span className="text-xs text-secondary">{ex.level}</span>
      </div>
    </div>
  );
}

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <ExerciseDetailContent id={id} />
    </Suspense>
  );
}

function ExerciseDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backUrl = decodeURIComponent(searchParams.get('back') ?? '/exercises');
  const viewMode = useViewMode();
  const ex = mockExercises.find((e) => e.id === id);
  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [programOpen, setProgramOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [selectedCue, setSelectedCue] = useState('');
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  if (!ex) return <div className="p-8"><p className="text-secondary">Exercise not found.</p></div>;

  const siblings = ex.variationGroup
    ? mockExercises.filter((e) => e.variationGroup === ex.variationGroup && e.id !== id).sort((a, b) => b.usageCount - a.usageCount)
    : [];

  const siblingIds = new Set([id, ...siblings.map((s) => s.id)]);
  const exConditions = new Set(ex.tags.condition);
  const exMuscles = new Set(ex.tags.muscle);
  const scoreEx = (e: typeof ex) =>
    e.tags.condition.filter((t) => exConditions.has(t)).length +
    e.tags.muscle.filter((t) => exMuscles.has(t)).length;
  const candidates = mockExercises.filter((e) => !siblingIds.has(e.id));
  const sameCategory = candidates
    .filter((e) => e.category === ex.category)
    .map((e) => ({ e, score: scoreEx(e) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.e);
  const usedIds = new Set([...siblingIds, ...sameCategory.map((e) => e.id)]);
  const fallback = sameCategory.length < 3
    ? candidates
        .filter((e) => !usedIds.has(e.id))
        .map((e) => ({ e, score: scoreEx(e) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3 - sameCategory.length)
        .map((x) => x.e)
    : [];
  const similar = [...sameCategory, ...fallback];

  const handleAddToProgram = () => {
    const prog = mockPrograms.find((p) => p.id === selectedProgramId);
    if (prog) toast.success(`Exercise added to "${prog.name}"!`);
    setProgramOpen(false);
    setSelectedProgramId(null);
  };

  const handleAssign = () => {
    if (selectedPatient) toast.success(`Exercise added to ${selectedPatient.firstName} ${selectedPatient.lastName}'s program!`);
    setAssignOpen(false);
    setSelectedPatient(null);
  };

  return (
    <>

      <div className="px-8 py-8 flex gap-10 items-start">

        {/* Left: main content */}
        <div className="flex-1 min-w-0">

          <button
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center gap-2 text-base text-primary hover:opacity-70 mb-6 transition-opacity"
          >
            <ArrowLeft size={24} strokeWidth={1.25} />
            Back
          </button>

          {/* Video */}
          {ex.videoUrl ? (
            <div className="mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden bg-[#0f0f0f]">
              <iframe src={`https://www.youtube.com/embed/${ex.videoUrl}?rel=0&modestbranding=1`} width="100%" height="100%" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 'none', display: 'block' }} />
            </div>
          ) : (
            <div className="mb-10 w-full aspect-video rounded-lg border border-secondary bg-brand-50 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center">
                <Play size={24} fill="white" color="white" className="ml-1" strokeWidth={1.25} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-10">

            {/* Name & Actions */}
            <div className="flex flex-col gap-6">
              <h1 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">{ex.name}</h1>

              <div className="flex items-start justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-primary font-display font-medium text-base shrink-0">
                    RH
                  </div>
                  <span className="font-display text-base font-medium tracking-[0.1px] text-primary">Rea Health</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button color="secondary" size="lg" iconLeading={(p) => <ListPlus {...p} strokeWidth={1.25} />} onPress={() => setProgramOpen(true)}>
                    Add to Program
                  </Button>
                  <Button color="secondary" size="lg" iconLeading={(p) => <UserPlus {...p} strokeWidth={1.25} />} onPress={() => setAssignOpen(true)}>
                    Assign
                  </Button>
                  <Button
                    color="secondary"
                    size="lg"
                    aria-label="Favorite"
                    iconLeading={(p) => <Heart {...p} style={isFavorite ? { color: 'var(--color-favorite)' } : undefined} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.25} />}
                    onPress={() => setIsFavorite((v) => !v)}
                  />

                  {/* More menu */}
                  <div className="relative" ref={moreRef}>
                    <Button color="secondary" size="lg" aria-label="More options" iconLeading={(p) => <MoreHorizontal {...p} strokeWidth={1.25} />} onPress={() => setMoreOpen((v) => !v)} />
                    {moreOpen && (
                      <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-secondary bg-primary z-50 py-1">
                        {viewMode === 'full' && (
                          <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); setAudioOpen(true); }}>
                            <Mic size={15} className="text-tertiary shrink-0" strokeWidth={1.25} />Record Audio Cue
                          </button>
                        )}
                        <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); toast.success('Link copied!'); }}>
                          <Share2 size={15} className="text-tertiary shrink-0" strokeWidth={1.25} />Share
                        </button>
                        <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-secondary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); toast.info('Report submitted. Thank you!'); }}>
                          Report an issue
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="flex flex-col gap-4 rounded-lg border border-secondary bg-primary p-5 text-base text-primary">
              <p className={cx('m-0', !transcriptExpanded && 'line-clamp-1')}>{MOCK_TRANSCRIPT}</p>
              {!transcriptExpanded && (
                <button className="self-start text-brand-700 font-semibold text-xs hover:opacity-80" onClick={() => setTranscriptExpanded(true)}>
                  show more
                </button>
              )}
            </div>

            <Divider />

            {/* Instructions */}
            <div className="flex flex-col gap-7 w-full">
              <div className="flex items-center justify-between w-full flex-wrap gap-3">
                <h3 className="font-display m-0 text-[20px] leading-[32px] font-medium text-primary">Instructions</h3>
                <NativeSelect
                  value={selectedCue}
                  onChange={(e) => setSelectedCue(e.target.value)}
                  wrapperClassName="w-[240px] shrink-0"
                  className="h-12"
                >
                  <option value="">Add relaxation cue…</option>
                  {RELAXATION_CUES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </NativeSelect>
              </div>
              {selectedCue && (() => {
                const cue = RELAXATION_CUES.find((c) => c.key === selectedCue);
                return cue ? (
                  <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 w-full">
                    <p className="text-xs font-semibold text-brand-700 mb-1">{cue.label}</p>
                    <p className="text-base text-brand-900">{cue.text}</p>
                  </div>
                ) : null;
              })()}
              <ol className="pl-5 space-y-5 list-decimal w-full">
                {ex.instructions.map((step, i) => <li key={i} className="text-base text-primary">{step}</li>)}
              </ol>
            </div>

            <Divider />

            {/* Common Mistakes */}
            <div className="flex flex-col gap-7 w-full">
              <h3 className="font-display m-0 text-[20px] leading-[32px] font-medium text-primary">Common Mistakes</h3>
              <ul className="pl-5 space-y-5 list-disc w-full">
                {ex.commonMistakes.map((m, i) => <li key={i} className="text-base text-primary">{m}</li>)}
              </ul>
            </div>

            <Divider />
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="w-80 shrink-0 pt-1">
          {siblings.length > 0 && (
            <div className="mb-8 flex flex-col gap-7">
              <h2 className="font-display m-0 text-base font-medium text-primary">Variations</h2>
              {siblings.map((sib) => (
                <SidebarExerciseCard key={sib.id} ex={sib} onClick={() => router.push(`/exercises/${sib.id}?back=${encodeURIComponent(backUrl)}`)} />
              ))}
            </div>
          )}

          {similar.length > 0 && (
            <div className="flex flex-col gap-7">
              <h2 className="font-display m-0 text-base font-medium text-primary">Similar Exercises</h2>
              {similar.map((sim) => (
                <SidebarExerciseCard key={sim.id} ex={sim} onClick={() => router.push(`/exercises/${sim.id}?back=${encodeURIComponent(backUrl)}`)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AudioRecordingDialog open={audioOpen} exerciseName={ex.name} videoId={ex.videoUrl} onClose={() => setAudioOpen(false)} onSave={(_b, _d) => setAudioOpen(false)} />

      <ModalOverlay isOpen={programOpen} onOpenChange={(o) => { if (!o) { setProgramOpen(false); setSelectedProgramId(null); } }}>
        <Modal className="w-full max-w-[480px]"><Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <div className="flex w-full flex-col gap-4">
              <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Add to Program</h2>
              <p className="m-0 text-base text-primary">Add <strong>{ex.name}</strong> to a program.</p>
            </div>
            <NativeSelect className="h-12" value={selectedProgramId ?? ''} onChange={(e) => { const v = e.target.value; if (v === '__new__') { router.push('/programs/new'); setProgramOpen(false); return; } setSelectedProgramId(v || null); }}>
              <option value="">Select a program…</option>
              <option value="__new__">+ Create new program</option>
              {mockPrograms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </NativeSelect>
            <div className="flex w-full justify-end gap-4">
              <Button color="secondary" size="lg" onPress={() => { setProgramOpen(false); setSelectedProgramId(null); }}>Cancel</Button>
              <Button color="primary" size="lg" isDisabled={!selectedProgramId} onPress={handleAddToProgram}>Add to Program</Button>
            </div>
          </div>
        </Dialog></Modal>
      </ModalOverlay>

      <ModalOverlay isOpen={assignOpen} onOpenChange={(o) => { if (!o) { setAssignOpen(false); setSelectedPatient(null); } }}>
        <Modal className="w-full max-w-[480px]"><Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <div className="flex w-full flex-col gap-4">
              <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Assign to Patient</h2>
              <p className="m-0 text-base text-primary">Assign <strong>{ex.name}</strong> to a patient.</p>
            </div>
            <NativeSelect className="h-12" value={selectedPatient?.id ?? ''} onChange={(e) => setSelectedPatient(mockPatients.find((p) => p.id === e.target.value) ?? null)}>
              <option value="">Select a patient…</option>
              {mockPatients.filter((p) => !p.archived).map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </NativeSelect>
            <div className="flex w-full justify-end gap-4">
              <Button color="secondary" size="lg" onPress={() => { setAssignOpen(false); setSelectedPatient(null); }}>Cancel</Button>
              <Button color="primary" size="lg" isDisabled={!selectedPatient} onPress={handleAssign}>Assign</Button>
            </div>
          </div>
        </Dialog></Modal>
      </ModalOverlay>
    </>
  );
}
