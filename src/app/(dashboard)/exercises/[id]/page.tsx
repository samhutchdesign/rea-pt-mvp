'use client';
import { use, useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AudioRecordingDialog from '@/components/exercises/AudioRecordingDialog';
import { BreathingCircleAnimation } from '@/components/exercises/BreathingCircleAnimation';
import { PelvicFloorFullRangeAnimation } from '@/components/exercises/PelvicFloorFullRangeAnimation';
import { QuickFlicksAnimation } from '@/components/exercises/QuickFlicksAnimation';
import { SustainedHoldAnimation } from '@/components/exercises/SustainedHoldAnimation';
import { ElevatorAnimation } from '@/components/exercises/ElevatorAnimation';
import { ReverseKegelAnimation } from '@/components/exercises/ReverseKegelAnimation';
import { TheKnackAnimation } from '@/components/exercises/TheKnackAnimation';
import { ExerciseMarkerFields, defaultRxValues, rxSummary as rxSummaryText, HOLD_INTENSITIES, STAGE_COUNTS, stageLabel, type RxValues } from '@/components/exercises/exerciseRx';
import { CompactField } from '@/components/exercises/CompactField';
import { ParametersCard } from '@/components/exercises/ParametersCard';
import { ParameterSlider } from '@/components/exercises/ParameterSlider';
import { mockExercises, mockExercisesFull, mockPrograms, mockPatients } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Divider } from '@/components/ui/divider';
import { NativeSelect } from '@/components/ui/native-select';
import type { Exercise, Patient } from '@/lib/types';
import { ArrowLeft, Copy, Heart, ListPlus, Mic, MoreHorizontal, Pencil, Play, Share2, UserPlus } from 'lucide-react';

const MOCK_TRANSCRIPT = 'This exercise focuses on coordinating diaphragmatic breath with pelvic floor relaxation and engagement. Begin by finding a comfortable, supported position. Inhale slowly through your nose, allowing your ribcage to expand in all directions as your pelvic floor gently descends. Exhale fully, feeling the pelvic floor lift and the deep abdominals gently draw in. Repeat at your own pace, without forcing or straining at any point.';

const RELAXATION_CUES = [
  { key: 'relaxation', label: 'Relaxation Cue', text: 'Inhale and allow your pelvic floor to lengthen and soften' },
  { key: 'contraction', label: 'Pelvic Floor Contraction Cue', text: 'Exhale and gently contract your pelvic floor, then fully relax' },
  { key: 'pressure', label: 'Pressure Management Cue', text: 'Exhale with the effort and avoid holding your breath' },
];

function SidebarExerciseCard({ ex, onClick }: { ex: Exercise; onClick: () => void }) {
  return (
    <div className="flex gap-3 cursor-pointer group" onClick={onClick}>
      <div className="w-[130px] h-[80px] rounded-xl bg-brand-50 flex items-center justify-center shrink-0 overflow-hidden">
        <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center">
          <Play size={16} fill="white" color="white" className="ml-0.5" />
        </div>
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-base font-bold text-primary leading-snug group-hover:text-brand-700 transition-colors">{ex.name}</span>
        <span className="text-base text-secondary mt-0.5">Rea Health</span>
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
  const dataState = useDataState();
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const sourceArray = id.startsWith('fx-') ? mockExercisesFull : mockExercises;
  const ex = sourceArray.find((e) => e.id === id);
  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [programOpen, setProgramOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [rx, setRx] = useState<RxValues>(defaultRxValues(ex));
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
    ? sourceArray.filter((e) => e.variationGroup === ex.variationGroup && e.id !== id).sort((a, b) => b.usageCount - a.usageCount)
    : [];

  const siblingIds = new Set([id, ...siblings.map((s) => s.id)]);
  const exConditions = new Set(ex.tags.condition);
  const exMuscles = new Set(ex.tags.muscle);
  const scoreEx = (e: typeof ex) =>
    e.tags.condition.filter((t) => exConditions.has(t)).length +
    e.tags.muscle.filter((t) => exMuscles.has(t)).length;
  const candidates = sourceArray.filter((e) => !siblingIds.has(e.id));
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

  const isBreathingPacer = ex.animationType === 'breathing-pacer';

  const handleAddToProgram = () => {
    const prog = mockPrograms.find((p) => p.id === selectedProgramId);
    if (prog) toast.success(`Exercise added to "${prog.name}" (${rxSummaryText(ex, rx)}).`);
    setProgramOpen(false);
    setSelectedProgramId(null);
  };

  const handleAssign = () => {
    if (selectedPatient) toast.success(`Exercise added to ${selectedPatient.firstName} ${selectedPatient.lastName}'s program (${rxSummaryText(ex, rx)}).`);
    setAssignOpen(false);
    setSelectedPatient(null);
  };

  const block = (fn: () => void) => dataState === 'empty' ? setShowSignUpModal(true) : fn();
  const resetRx = () => setRx(defaultRxValues(ex));
  const patchRx = (patch: Partial<RxValues>) => setRx((prev) => ({ ...prev, ...patch }));

  return (
    <>

      <div className="px-8 py-8 flex gap-10 items-start">

        {/* Left: main content */}
        <div className="flex-1 min-w-0">

          <button
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center gap-1.5 text-base text-secondary hover:text-primary mb-5 transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          {/* Video / Animation */}
          {isBreathingPacer ? (
            <BreathingCircleAnimation
              key={`${rx.speedSecs}-${rx.loops}`}
              cycleSeconds={rx.speedSecs}
              loops={rx.loops}
              className="mb-5 w-full aspect-video rounded-2xl"
            >
              <ParametersCard>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={2} max={10} step={0.5} onChange={(v) => patchRx({ speedSecs: v })} />
                <CompactField value={rx.loops} unitSingular="Loop" unitPlural="Loops" onChange={(v) => patchRx({ loops: v })} />
              </ParametersCard>
            </BreathingCircleAnimation>
          ) : ex.animationType === 'pf-full-range' ? (
            <PelvicFloorFullRangeAnimation
              key={`${rx.speedSecs}-${rx.holdSecs}-${rx.restSecs}-${rx.reps}`}
              speedSecs={rx.speedSecs}
              holdSecs={rx.holdSecs}
              restSecs={rx.restSecs}
              reps={rx.reps}
              className="mb-5 w-full aspect-video rounded-2xl"
            >
              <ParametersCard>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.3} max={3} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Hold" value={rx.holdSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ holdSecs: v })} />
                <ParameterSlider label="Rest" value={rx.restSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ restSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </PelvicFloorFullRangeAnimation>
          ) : ex.animationType === 'pf-quick-flicks' ? (
            <QuickFlicksAnimation
              key={`${rx.speedSecs}-${rx.restSecs}-${rx.reps}`}
              speedSecs={rx.speedSecs}
              restSecs={rx.restSecs}
              reps={rx.reps}
              className="mb-5 w-full aspect-video rounded-2xl"
            >
              <ParametersCard>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.1} max={1} step={0.05} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Rest" value={rx.restSecs} unit="s" min={1} max={10} onChange={(v) => patchRx({ restSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </QuickFlicksAnimation>
          ) : ex.animationType === 'pf-sustained-hold' ? (
            <SustainedHoldAnimation
              key={`${rx.speedSecs}-${rx.holdIntensityPct}-${rx.holdSecs}-${rx.restSecs}-${rx.reps}`}
              speedSecs={rx.speedSecs}
              intensityPct={rx.holdIntensityPct}
              holdSecs={rx.holdSecs}
              restSecs={rx.restSecs}
              reps={rx.reps}
              className="mb-5 w-full aspect-video rounded-2xl"
            >
              <ParametersCard>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs text-secondary shrink-0">Intensity</span>
                  <NativeSelect className="h-12 flex-1" value={String(rx.holdIntensityPct)} onChange={(e) => patchRx({ holdIntensityPct: Number(e.target.value) })}>
                    {HOLD_INTENSITIES.map((pct) => <option key={pct} value={pct}>{pct}%</option>)}
                  </NativeSelect>
                </div>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={3} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Hold" value={rx.holdSecs} unit="s" min={1} max={20} onChange={(v) => patchRx({ holdSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </SustainedHoldAnimation>
          ) : ex.animationType === 'pf-elevator' ? (
            <ElevatorAnimation
              key={`${rx.speedSecs}-${rx.stages}-${rx.stagePauseSecs}-${rx.reps}`}
              speedSecs={rx.speedSecs}
              stages={rx.stages}
              stagePauseSecs={rx.stagePauseSecs}
              reps={rx.reps}
              className="mb-5 w-full aspect-video rounded-2xl"
            >
              <ParametersCard>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs text-secondary shrink-0">Stages</span>
                  <NativeSelect className="h-12 flex-1" value={String(rx.stages)} onChange={(e) => patchRx({ stages: Number(e.target.value) })}>
                    {STAGE_COUNTS.map((n) => <option key={n} value={n}>{stageLabel(n)}</option>)}
                  </NativeSelect>
                </div>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.2} max={2} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Pauses" value={rx.stagePauseSecs} unit="s" min={0.5} max={5} step={0.5} onChange={(v) => patchRx({ stagePauseSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </ElevatorAnimation>
          ) : ex.animationType === 'pf-reverse-kegel' ? (
            <ReverseKegelAnimation
              key={`${rx.speedSecs}-${rx.restSecs}-${rx.reps}`}
              speedSecs={rx.speedSecs}
              restSecs={rx.restSecs}
              reps={rx.reps}
              className="mb-5 w-full aspect-video rounded-2xl"
            >
              <ParametersCard>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={3} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Rest" value={rx.restSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ restSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </ReverseKegelAnimation>
          ) : ex.animationType === 'pf-the-knack' ? (
            <TheKnackAnimation className="mb-5 w-full aspect-video rounded-2xl" />
          ) : ex.videoUrl ? (
            <div className="mb-5 w-full aspect-video rounded-2xl overflow-hidden bg-[#0f0f0f]">
              <iframe src={`https://www.youtube.com/embed/${ex.videoUrl}?rel=0&modestbranding=1`} width="100%" height="100%" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 'none', display: 'block' }} />
            </div>
          ) : (
            <div className="mb-5 w-full aspect-video rounded-2xl bg-brand-50 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center">
                <Play size={24} fill="white" color="white" className="ml-1" />
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-[32px] leading-[48px] font-normal text-primary mb-4 mt-0">{ex.name}</h1>

          {/* Action row */}
          <div className="flex items-center justify-between gap-2.5 mb-5 flex-wrap">
            <div className="flex items-center gap-2 mr-1">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {ex.userUploaded ? 'Me' : 'RH'}
              </div>
              <span className="text-base font-medium text-secondary">{ex.userUploaded ? 'You' : 'Rea Health'}</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Button color="secondary" size="sm" iconLeading={ListPlus} onPress={() => block(() => { resetRx(); setProgramOpen(true); })}>
                Add to Program
              </Button>
              <Button color="secondary" size="sm" iconLeading={UserPlus} onPress={() => block(() => { resetRx(); setAssignOpen(true); })}>
                Assign
              </Button>
              <button
                onClick={() => block(() => setIsFavorite((v) => !v))}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-base font-medium transition-colors ${isFavorite ? 'border-pink-200 bg-pink-50 text-pink-600' : 'border-secondary bg-primary text-secondary hover:bg-secondary'}`}
              >
                <Heart size={14} fill={isFavorite ? '#E91E63' : 'none'} color={isFavorite ? '#E91E63' : 'currentColor'} />
                Favorite
              </button>

              {/* More menu — full version only */}
              {viewMode === 'full' && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary bg-primary text-secondary hover:bg-secondary transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                {moreOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-secondary bg-primary z-50 py-1">
                    <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); block(() => setAudioOpen(true)); }}>
                      <Mic size={15} className="text-tertiary shrink-0" />Record Audio Cue
                    </button>
                    {ex.userUploaded ? (
                      <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); block(() => router.push(`/exercises/new?edit=${id}`)); }}>
                        <Pencil size={15} className="text-tertiary shrink-0" />Edit
                      </button>
                    ) : (
                      <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); block(() => router.push(`/exercises/new?duplicate=${id}`)); }}>
                        <Copy size={15} className="text-tertiary shrink-0" />Duplicate
                      </button>
                    )}
                    <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); toast.success('Link copied!'); }}>
                      <Share2 size={15} className="text-tertiary shrink-0" />Share
                    </button>
                    <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-secondary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); toast.info('Report submitted. Thank you!'); }}>
                      Report an issue
                    </button>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Transcript */}
          <div className="mb-5 rounded-xl border border-secondary bg-secondary_alt px-4 py-3 text-base text-secondary">
            <p className={transcriptExpanded ? '' : 'line-clamp-1'}>{MOCK_TRANSCRIPT}</p>
            {!transcriptExpanded && (
              <button className="text-brand-700 font-medium text-xs mt-0.5 hover:opacity-80" onClick={() => setTranscriptExpanded(true)}>
                show more
              </button>
            )}
          </div>

          <Divider className="mb-6" />

          <h3 className="mt-0 mb-3 text-base font-bold text-primary">Instructions</h3>
          <NativeSelect
            value={selectedCue}
            onChange={(e) => setSelectedCue(e.target.value)}
            wrapperClassName="w-56 mb-3"
            className="py-1.5 text-xs text-secondary"
          >
            <option value="">Add relaxation cue…</option>
            {RELAXATION_CUES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </NativeSelect>
          {selectedCue && (() => {
            const cue = RELAXATION_CUES.find((c) => c.key === selectedCue);
            return cue ? (
              <div className="mb-4 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3">
                <p className="text-xs font-semibold text-brand-700 mb-1">{cue.label}</p>
                <p className="text-base text-brand-900">{cue.text}</p>
              </div>
            ) : null;
          })()}
          <ol className="mb-6 pl-5 space-y-2 list-decimal">
            {ex.instructions.map((step, i) => <li key={i} className="text-base text-primary">{step}</li>)}
          </ol>

          <Divider className="mb-6" />

          <h3 className="mt-0 mb-3 text-base font-bold text-primary">Common Mistakes</h3>
          <ul className="pl-5 space-y-2 list-disc">
            {ex.commonMistakes.map((m, i) => <li key={i} className="text-base text-primary">{m}</li>)}
          </ul>

          <Divider className="mt-6" />
        </div>

        {/* Right: sidebar */}
        <div className="w-80 shrink-0 pt-1">
          {siblings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4 mt-0">Variations</h2>
              <div className="flex flex-col gap-4">
                {siblings.map((sib) => (
                  <SidebarExerciseCard key={sib.id} ex={sib} onClick={() => router.push(`/exercises/${sib.id}?back=${encodeURIComponent(backUrl)}`)} />
                ))}
              </div>
            </div>
          )}

          {viewMode === 'full' && similar.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-primary mb-4 mt-0">Similar Exercises</h2>
              <div className="flex flex-col gap-4">
                {similar.map((sim) => (
                  <SidebarExerciseCard key={sim.id} ex={sim} onClick={() => router.push(`/exercises/${sim.id}?back=${encodeURIComponent(backUrl)}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SignUpRequiredModal open={showSignUpModal} onClose={() => setShowSignUpModal(false)} action="record audio cues, add to programs, or edit exercises" />

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
            <div className="flex w-full flex-col gap-2">
              <div className="text-xs text-secondary">Parameters</div>
              <ExerciseMarkerFields exercise={ex} values={rx} onChange={patchRx} />
            </div>
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
            <div className="flex w-full flex-col gap-2">
              <div className="text-xs text-secondary">Parameters</div>
              <ExerciseMarkerFields exercise={ex} values={rx} onChange={patchRx} />
            </div>
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
