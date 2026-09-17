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
import { ComboFullRangeQuickFlicks } from '@/components/exercises/ComboFullRangeQuickFlicks';
import { ComboSustainedHoldQuickFlicks } from '@/components/exercises/ComboSustainedHoldQuickFlicks';
import { DilatorJCurveAnimation } from '@/components/exercises/DilatorJCurveAnimation';
import { Dilator3PointAnimation } from '@/components/exercises/Dilator3PointAnimation';
import { DilatorHalfUAnimation } from '@/components/exercises/DilatorHalfUAnimation';
import { PerinealMassageAnimation } from '@/components/exercises/PerinealMassageAnimation';
import { DilatorInOutAnimation } from '@/components/exercises/DilatorInOutAnimation';
import { ExerciseMarkerFields, defaultRxValues, rxSummary as rxSummaryText, HOLD_INTENSITIES, STAGE_COUNTS, stageLabel, type RxValues } from '@/components/exercises/exerciseRx';
import { CompactField } from '@/components/exercises/CompactField';
import { ParametersCard } from '@/components/exercises/ParametersCard';
import { ParameterSlider } from '@/components/exercises/ParameterSlider';
import { mockExercises, mockExercisesFull, mockPrograms, mockPatients } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Divider } from '@/components/ui/divider';
import { NativeSelect } from '@/components/ui/native-select';
import type { Exercise, Patient } from '@/lib/types';
import { ArrowLeft, Copy, Heart, ListPlus, Mic, MoreHorizontal, Pencil, Play, Share2, UserPlus } from 'lucide-react';
import { cx } from '@/utils/cx';

const MOCK_TRANSCRIPT = 'This exercise focuses on coordinating diaphragmatic breath with pelvic floor relaxation and engagement. Begin by finding a comfortable, supported position. Inhale slowly through your nose, allowing your ribcage to expand in all directions as your pelvic floor gently descends. Exhale fully, feeling the pelvic floor lift and the deep abdominals gently draw in. Repeat at your own pace, without forcing or straining at any point.';

const RELAXATION_CUES: { key: string; label: string; text: React.ReactNode }[] = [
  {
    key: 'relaxation',
    label: 'Relaxation Cue',
    text: <>Exhale and press through your heels to lift your hips, squeezing your glutes at the top. Lower back down with control. <strong>Inhale and allow your pelvic floor to lengthen and soften.</strong></>,
  },
  {
    key: 'contraction',
    label: 'Pelvic Floor Contraction Cue',
    text: <><strong>Exhale</strong> and press through your heels to lift your hips, squeezing your glutes at the top, <strong>gently contracting your pelvic floor as you rise</strong>. Lower back down with control, fully relaxing.</>,
  },
  {
    key: 'pressure',
    label: 'Pressure Management Cue',
    text: 'Exhale with the effort as you press through your heels to lift your hips, squeezing your glutes at the top — avoid holding your breath. Lower back down with control.',
  },
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
  // Lifted out of ParametersCard: the animation it overlays remounts (via a
  // `key`) whenever a parameter changes, so this state has to live up here
  // to survive that remount instead of resetting on every edit.
  const [paramsExpanded, setParamsExpanded] = useState(true);
  const [activeStepTab, setActiveStepTab] = useState(0);
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
            className="inline-flex items-center gap-2 text-base text-primary hover:opacity-70 mb-6 transition-opacity"
          >
            <ArrowLeft size={24} strokeWidth={1.25} />
            Back
          </button>

          {/* Video / Animation */}
          {isBreathingPacer ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <BreathingCircleAnimation
                key={`${rx.speedSecs}-${rx.loops}`}
                cycleSeconds={rx.speedSecs}
                loops={rx.loops}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={2} max={10} step={0.5} onChange={(v) => patchRx({ speedSecs: v })} />
                <CompactField value={rx.loops} unitSingular="Loop" unitPlural="Loops" onChange={(v) => patchRx({ loops: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-full-range' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <PelvicFloorFullRangeAnimation
                key={`${rx.speedSecs}-${rx.holdSecs}-${rx.restSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                holdSecs={rx.holdSecs}
                restSecs={rx.restSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.3} max={3} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Hold" value={rx.holdSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ holdSecs: v })} />
                <ParameterSlider label="Rest" value={rx.restSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ restSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-quick-flicks' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <QuickFlicksAnimation
                key={`${rx.speedSecs}-${rx.restSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                restSecs={rx.restSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.1} max={1} step={0.05} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Rest" value={rx.restSecs} unit="s" min={1} max={10} onChange={(v) => patchRx({ restSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-sustained-hold' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <SustainedHoldAnimation
                key={`${rx.speedSecs}-${rx.holdIntensityPct}-${rx.holdSecs}-${rx.restSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                intensityPct={rx.holdIntensityPct}
                holdSecs={rx.holdSecs}
                restSecs={rx.restSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
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
            </div>
          ) : ex.animationType === 'pf-elevator' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <ElevatorAnimation
                key={`${rx.speedSecs}-${rx.stages}-${rx.stagePauseSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                stages={rx.stages}
                stagePauseSecs={rx.stagePauseSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
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
            </div>
          ) : ex.animationType === 'pf-reverse-kegel' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <ReverseKegelAnimation
                key={`${rx.speedSecs}-${rx.restSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                restSecs={rx.restSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={3} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Rest" value={rx.restSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ restSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-the-knack' ? (
            <TheKnackAnimation className="mb-10 w-full aspect-video rounded-lg border border-secondary" />
          ) : ex.animationType === 'pf-combo-full-range-quick-flicks' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <ComboFullRangeQuickFlicks
                key={`${rx.step1SpeedSecs}-${rx.step1HoldSecs}-${rx.step1RestSecs}-${rx.step1Reps}-${rx.step2SpeedSecs}-${rx.step2RestSecs}-${rx.step2Reps}-${rx.transitionRestSecs}-${rx.comboSets}`}
                step1SpeedSecs={rx.step1SpeedSecs}
                step1HoldSecs={rx.step1HoldSecs}
                step1RestSecs={rx.step1RestSecs}
                step1Reps={rx.step1Reps}
                step2SpeedSecs={rx.step2SpeedSecs}
                step2RestSecs={rx.step2RestSecs}
                step2Reps={rx.step2Reps}
                transitionRestSecs={rx.transitionRestSecs}
                comboSets={rx.comboSets}
                className="absolute inset-0"
              />
              <ParametersCard
                expanded={paramsExpanded}
                onExpandedChange={setParamsExpanded}
                activeTab={activeStepTab}
                onActiveTabChange={setActiveStepTab}
                tabs={[
                  {
                    label: 'Full Range',
                    content: (
                      <>
                        <ParameterSlider label="Speed" value={rx.step1SpeedSecs} unit="s" min={0.3} max={3} step={0.1} onChange={(v) => patchRx({ step1SpeedSecs: v })} />
                        <ParameterSlider label="Hold" value={rx.step1HoldSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ step1HoldSecs: v })} />
                        <ParameterSlider label="Rest" value={rx.step1RestSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ step1RestSecs: v })} />
                        <CompactField value={rx.step1Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ step1Reps: v })} />
                      </>
                    ),
                  },
                  {
                    label: 'Quick Flicks',
                    content: (
                      <>
                        <ParameterSlider label="Transition" value={rx.transitionRestSecs} unit="s" min={1} max={30} onChange={(v) => patchRx({ transitionRestSecs: v })} />
                        <ParameterSlider label="Speed" value={rx.step2SpeedSecs} unit="s" min={0.1} max={1} step={0.05} onChange={(v) => patchRx({ step2SpeedSecs: v })} />
                        <ParameterSlider label="Rest" value={rx.step2RestSecs} unit="s" min={1} max={10} onChange={(v) => patchRx({ step2RestSecs: v })} />
                        <CompactField value={rx.step2Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ step2Reps: v })} />
                      </>
                    ),
                  },
                ]}
              >
                <CompactField value={rx.comboSets} unitSingular="Combo Set" unitPlural="Combo Sets" onChange={(v) => patchRx({ comboSets: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-combo-sustained-hold-quick-flicks' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <ComboSustainedHoldQuickFlicks
                key={`${rx.step1SpeedSecs}-${rx.step1IntensityPct}-${rx.step1HoldSecs}-${rx.step1RestSecs}-${rx.step1Reps}-${rx.step2SpeedSecs}-${rx.step2RestSecs}-${rx.step2Reps}-${rx.transitionRestSecs}-${rx.comboSets}`}
                step1SpeedSecs={rx.step1SpeedSecs}
                step1IntensityPct={rx.step1IntensityPct}
                step1HoldSecs={rx.step1HoldSecs}
                step1RestSecs={rx.step1RestSecs}
                step1Reps={rx.step1Reps}
                step2SpeedSecs={rx.step2SpeedSecs}
                step2RestSecs={rx.step2RestSecs}
                step2Reps={rx.step2Reps}
                transitionRestSecs={rx.transitionRestSecs}
                comboSets={rx.comboSets}
                className="absolute inset-0"
              />
              <ParametersCard
                expanded={paramsExpanded}
                onExpandedChange={setParamsExpanded}
                activeTab={activeStepTab}
                onActiveTabChange={setActiveStepTab}
                tabs={[
                  {
                    label: 'Sustained Hold',
                    content: (
                      <>
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-xs text-secondary shrink-0">Intensity</span>
                          <NativeSelect className="h-12 flex-1" value={String(rx.step1IntensityPct)} onChange={(e) => patchRx({ step1IntensityPct: Number(e.target.value) })}>
                            {HOLD_INTENSITIES.map((pct) => <option key={pct} value={pct}>{pct}%</option>)}
                          </NativeSelect>
                        </div>
                        <ParameterSlider label="Speed" value={rx.step1SpeedSecs} unit="s" min={0.5} max={3} step={0.1} onChange={(v) => patchRx({ step1SpeedSecs: v })} />
                        <ParameterSlider label="Hold" value={rx.step1HoldSecs} unit="s" min={1} max={20} onChange={(v) => patchRx({ step1HoldSecs: v })} />
                        <ParameterSlider label="Rest" value={rx.step1RestSecs} unit="s" min={1} max={15} onChange={(v) => patchRx({ step1RestSecs: v })} />
                        <CompactField value={rx.step1Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ step1Reps: v })} />
                      </>
                    ),
                  },
                  {
                    label: 'Quick Flicks',
                    content: (
                      <>
                        <ParameterSlider label="Transition" value={rx.transitionRestSecs} unit="s" min={1} max={30} onChange={(v) => patchRx({ transitionRestSecs: v })} />
                        <ParameterSlider label="Speed" value={rx.step2SpeedSecs} unit="s" min={0.1} max={1} step={0.05} onChange={(v) => patchRx({ step2SpeedSecs: v })} />
                        <ParameterSlider label="Rest" value={rx.step2RestSecs} unit="s" min={1} max={10} onChange={(v) => patchRx({ step2RestSecs: v })} />
                        <CompactField value={rx.step2Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ step2Reps: v })} />
                      </>
                    ),
                  },
                ]}
              >
                <CompactField value={rx.comboSets} unitSingular="Combo Set" unitPlural="Combo Sets" onChange={(v) => patchRx({ comboSets: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-dilator-j-curve' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <DilatorJCurveAnimation
                key={`${rx.speedSecs}-${rx.holdSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                holdSecs={rx.holdSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={4} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Hold" value={rx.holdSecs} unit="s" min={1} max={30} onChange={(v) => patchRx({ holdSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep / Side" unitPlural="Reps / Side" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-dilator-3-point' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <Dilator3PointAnimation
                key={`${rx.speedSecs}-${rx.holdSecs}-${rx.reps}-${rx.contractSecs}`}
                speedSecs={rx.speedSecs}
                holdSecs={rx.holdSecs}
                reps={rx.reps}
                contractSecs={rx.contractSecs}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={4} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Hold" value={rx.holdSecs} unit="s" min={1} max={30} onChange={(v) => patchRx({ holdSecs: v })} />
                <ParameterSlider label="Contract" value={rx.contractSecs} unit="s" min={0.1} max={2} step={0.05} onChange={(v) => patchRx({ contractSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep / Direction" unitPlural="Reps / Direction" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-dilator-half-u' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <DilatorHalfUAnimation
                key={`${rx.speedSecs}-${rx.holdSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                holdSecs={rx.holdSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={8} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Hold" value={rx.holdSecs} unit="s" min={0} max={10} onChange={(v) => patchRx({ holdSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep / Side" unitPlural="Reps / Side" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-perineal-massage' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <PerinealMassageAnimation
                key={`${rx.speedSecs}-${rx.durationSecs}`}
                speedSecs={rx.speedSecs}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={8} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <ParameterSlider label="Time" value={rx.durationSecs} unit="s" min={30} max={600} step={30} onChange={(v) => patchRx({ durationSecs: v })} />
              </ParametersCard>
            </div>
          ) : ex.animationType === 'pf-dilator-in-out' ? (
            <div className="relative mb-10 w-full aspect-video rounded-lg border border-secondary overflow-hidden">
              <DilatorInOutAnimation
                key={`${rx.speedSecs}-${rx.reps}`}
                speedSecs={rx.speedSecs}
                reps={rx.reps}
                className="absolute inset-0"
              />
              <ParametersCard expanded={paramsExpanded} onExpandedChange={setParamsExpanded}>
                <ParameterSlider label="Speed" value={rx.speedSecs} unit="s" min={0.5} max={4} step={0.1} onChange={(v) => patchRx({ speedSecs: v })} />
                <CompactField value={rx.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => patchRx({ reps: v })} />
              </ParametersCard>
            </div>
          ) : ex.videoUrl ? (
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
                    {ex.userUploaded ? 'Me' : 'RH'}
                  </div>
                  <span className="font-display text-base font-medium tracking-[0.1px] text-primary">{ex.userUploaded ? 'You' : 'Rea Health'}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button color="secondary" size="lg" iconLeading={(p) => <ListPlus {...p} strokeWidth={1.25} />} onPress={() => block(() => { resetRx(); setProgramOpen(true); })}>
                    Add to Program
                  </Button>
                  <Button color="secondary" size="lg" iconLeading={(p) => <UserPlus {...p} strokeWidth={1.25} />} onPress={() => block(() => { resetRx(); setAssignOpen(true); })}>
                    Assign
                  </Button>
                  <Button
                    color="secondary"
                    size="lg"
                    aria-label="Favorite"
                    iconLeading={(p) => <Heart {...p} style={isFavorite ? { color: 'var(--color-favorite)' } : undefined} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.25} />}
                    onPress={() => block(() => setIsFavorite((v) => !v))}
                  />

                  {/* More menu — full version only */}
                  {viewMode === 'full' && (
                  <div className="relative" ref={moreRef}>
                    <Button color="secondary" size="lg" aria-label="More options" iconLeading={(p) => <MoreHorizontal {...p} strokeWidth={1.25} />} onPress={() => setMoreOpen((v) => !v)} />
                    {moreOpen && (
                      <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-secondary bg-primary z-50 py-1">
                        <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); block(() => setAudioOpen(true)); }}>
                          <Mic size={15} className="text-tertiary shrink-0" strokeWidth={1.25} />Record Audio Cue
                        </button>
                        {ex.userUploaded ? (
                          <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); block(() => router.push(`/exercises/new?edit=${id}`)); }}>
                            <Pencil size={15} className="text-tertiary shrink-0" strokeWidth={1.25} />Edit
                          </button>
                        ) : (
                          <button className="flex w-full items-center gap-2.5 px-3 py-2 text-base text-primary hover:bg-secondary transition-colors" onClick={() => { setMoreOpen(false); block(() => router.push(`/exercises/new?duplicate=${id}`)); }}>
                            <Copy size={15} className="text-tertiary shrink-0" strokeWidth={1.25} />Duplicate
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
                  )}
                </div>
              </div>
            </div>

            {/* Transcript / Dictation */}
            <div className="flex flex-col gap-4 rounded-lg border border-primary bg-primary p-5 text-base text-primary">
              <p className={cx('m-0', !transcriptExpanded && 'line-clamp-1')}>{MOCK_TRANSCRIPT}</p>
              <button className="self-start text-base font-semibold leading-4 text-brand-600 hover:opacity-80" onClick={() => setTranscriptExpanded((v) => !v)}>
                {transcriptExpanded ? 'show less' : 'show more'}
              </button>
            </div>

            <Divider />

            {/* Instructions */}
            <div className="flex flex-col gap-7 w-full">
              <h3 className="font-display m-0 text-[20px] leading-[32px] font-medium text-primary">Instructions</h3>
              <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-3 w-full">
                  <NativeSelect
                    value={selectedCue}
                    onChange={(e) => setSelectedCue(e.target.value)}
                    wrapperClassName="w-[320px]"
                    className="h-12"
                  >
                    <option value="">Add relaxation cue…</option>
                    {RELAXATION_CUES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </NativeSelect>
                  {selectedCue && (() => {
                    const cue = RELAXATION_CUES.find((c) => c.key === selectedCue);
                    return cue ? (
                      <div className="flex w-full max-w-[550px] flex-col gap-4 rounded-lg border border-brand-300 bg-brand-50 px-5 pt-5 pb-6">
                        <p className="font-display m-0 text-[18px] leading-5 font-medium tracking-[0.1px] text-brand-700">{cue.label}</p>
                        <p className="m-0 text-base leading-6 text-brand-700">{cue.text}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
                <ol className="pl-5 space-y-5 list-decimal w-full">
                  {ex.instructions.map((step, i) => <li key={i} className="text-base text-primary">{step}</li>)}
                </ol>
              </div>
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

          {viewMode === 'full' && similar.length > 0 && (
            <div className="flex flex-col gap-7">
              <h2 className="font-display m-0 text-base font-medium text-primary">Similar Exercises</h2>
              {similar.map((sim) => (
                <SidebarExerciseCard key={sim.id} ex={sim} onClick={() => router.push(`/exercises/${sim.id}?back=${encodeURIComponent(backUrl)}`)} />
              ))}
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
