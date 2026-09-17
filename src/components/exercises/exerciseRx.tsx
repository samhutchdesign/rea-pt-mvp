'use client';
import type { Exercise } from '@/lib/types';
import { NativeSelect } from '@/components/ui/native-select';
import { CompactField } from './CompactField';

export const STARTING_POSITIONS = ['Lying', 'Sitting', 'Standing'] as const;
export const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'] as const;
export const HOLD_INTENSITIES = [50, 60, 70] as const;
export const STAGE_COUNTS = [2, 3, 4] as const;
export const DILATOR_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'] as const;

/** e.g. "4 (25%, 50%, 75%, 100%)" — matches Figma's stage-count dropdown copy. */
export function stageLabel(n: number): string {
  const levels = Array.from({ length: n }, (_, i) => Math.round(((i + 1) / n) * 100));
  return `${n} (${levels.map((l) => `${l}%`).join(', ')})`;
}

export interface RxValues {
  sets: number;
  reps: number;
  holdSecs: number;
  restSecs: number;
  speedSecs: number;
  loops: number;
  startingPosition: 'Lying' | 'Sitting' | 'Standing';
  holdIntensityPct: number;
  stages: number;
  stagePauseSecs: number;
  frequency: string;
  // Combo exercises
  step1Sets: number;
  step1Reps: number;
  step1SpeedSecs: number;
  step1HoldSecs: number;
  step1RestSecs: number;
  step1IntensityPct: number;
  step2Sets: number;
  step2Reps: number;
  step2SpeedSecs: number;
  step2RestSecs: number;
  transitionRestSecs: number;
  comboSets: number;
  // Dilator exercises
  dilatorSize: 'Small' | 'Medium' | 'Large' | 'Extra Large';
}

export function defaultRxValues(ex: Exercise | null | undefined): RxValues {
  return {
    sets: ex?.defaultSets ?? 3,
    reps: ex?.defaultReps ?? 10,
    holdSecs: ex?.defaultHoldSecs ?? 0,
    restSecs: ex?.defaultRestSecs ?? 5,
    speedSecs: ex?.defaultSpeedSecs ?? 4,
    loops: ex?.defaultLoops ?? 5,
    startingPosition: ex?.defaultStartingPosition ?? 'Lying',
    holdIntensityPct: ex?.defaultHoldIntensityPct ?? 60,
    stages: ex?.defaultStages ?? 4,
    stagePauseSecs: ex?.defaultStagePauseSecs ?? 2,
    frequency: ex?.defaultFrequency ?? 'Daily',
    step1Sets: ex?.defaultStep1Sets ?? 3,
    step1Reps: ex?.defaultStep1Reps ?? 10,
    step1SpeedSecs: ex?.defaultStep1SpeedSecs ?? 0.9,
    step1HoldSecs: ex?.defaultStep1HoldSecs ?? 5,
    step1RestSecs: ex?.defaultStep1RestSecs ?? 5,
    step1IntensityPct: ex?.defaultStep1IntensityPct ?? 60,
    step2Sets: ex?.defaultStep2Sets ?? 3,
    step2Reps: ex?.defaultStep2Reps ?? 15,
    step2SpeedSecs: ex?.defaultStep2SpeedSecs ?? 0.25,
    step2RestSecs: ex?.defaultStep2RestSecs ?? 3,
    transitionRestSecs: ex?.defaultTransitionRestSecs ?? 10,
    comboSets: ex?.defaultComboSets ?? 3,
    dilatorSize: ex?.defaultDilatorSize ?? 'Medium',
  };
}

export function rxSummary(ex: Exercise | null | undefined, rx: RxValues): string {
  switch (ex?.animationType) {
    case 'breathing-pacer':
      return `${rx.speedSecs}s per breath × ${rx.loops} loop${rx.loops === 1 ? '' : 's'}`;
    case 'pf-full-range':
      return `${rx.sets} sets × ${rx.reps} reps, ${rx.speedSecs}s speed, ${rx.holdSecs}s hold, ${rx.restSecs}s rest`;
    case 'pf-quick-flicks':
      return `${rx.sets} sets × ${rx.reps} reps, ${rx.speedSecs}s speed, ${rx.restSecs}s rest`;
    case 'pf-sustained-hold':
      return `${rx.sets} sets × ${rx.reps} reps at ${rx.holdIntensityPct}%, ${rx.speedSecs}s speed, ${rx.holdSecs}s hold, ${rx.restSecs}s rest`;
    case 'pf-elevator':
      return `${rx.sets} sets × ${rx.reps} reps, ${rx.stages} stages, ${rx.speedSecs}s speed, ${rx.stagePauseSecs}s pause`;
    case 'pf-reverse-kegel':
      return `${rx.sets} sets × ${rx.reps} reps, ${rx.speedSecs}s speed, ${rx.restSecs}s rest`;
    case 'pf-the-knack':
      return `Practiced ${rx.frequency.toLowerCase()}`;
    case 'pf-combo-full-range-quick-flicks':
      return `${rx.comboSets} combo sets — Full Range: ${rx.step1Sets}×${rx.step1Reps}, Quick Flicks: ${rx.step2Sets}×${rx.step2Reps}, ${rx.transitionRestSecs}s transition rest`;
    case 'pf-combo-sustained-hold-quick-flicks':
      return `${rx.comboSets} combo sets — Sustained Hold: ${rx.step1Sets}×${rx.step1Reps}, Quick Flicks: ${rx.step2Sets}×${rx.step2Reps}, ${rx.transitionRestSecs}s transition rest`;
    case 'pf-dilator-j-curve':
      return `${rx.dilatorSize} dilator, ${rx.reps} reps/side, ${rx.holdSecs}s hold, ${rx.speedSecs}s speed`;
    case 'pf-dilator-3-point':
      return `${rx.dilatorSize} dilator, ${rx.reps} reps/direction, ${rx.holdSecs}s hold, ${rx.speedSecs}s speed`;
    case 'pf-dilator-half-u':
      return `${rx.dilatorSize} dilator, ${rx.reps} reps/side, ${rx.speedSecs}s speed${rx.holdSecs > 0 ? `, ${rx.holdSecs}s hold` : ''}`;
    default:
      return `${rx.sets} sets × ${rx.reps} reps${rx.holdSecs > 0 ? `, ${rx.holdSecs}s hold` : ''}`;
  }
}

const fieldLabelCls = 'text-xs text-secondary';
const fieldColCls = 'flex flex-col gap-2';

/** Renders the practitioner-adjustable prescription fields for one exercise, matched to its animation type. */
export function ExerciseMarkerFields({ exercise, values, onChange }: { exercise: Exercise; values: RxValues; onChange: (patch: Partial<RxValues>) => void }) {
  const positionField = (
    <div className={fieldColCls}>
      <label className={fieldLabelCls}>Starting Position</label>
      <NativeSelect className="h-12" value={values.startingPosition} onChange={(e) => onChange({ startingPosition: e.target.value as RxValues['startingPosition'] })}>
        {STARTING_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
      </NativeSelect>
    </div>
  );
  const frequencyField = (
    <div className={fieldColCls}>
      <label className={fieldLabelCls}>Frequency</label>
      <NativeSelect className="h-12" value={values.frequency} onChange={(e) => onChange({ frequency: e.target.value })}>
        {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
      </NativeSelect>
    </div>
  );
  const setsRepsFields = (
    <>
      <CompactField value={values.sets} unitSingular="Set" unitPlural="Sets" onChange={(v) => onChange({ sets: v })} />
      <CompactField value={values.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => onChange({ reps: v })} />
    </>
  );

  switch (exercise.animationType) {
    case 'breathing-pacer':
      return (
        <div className="flex flex-wrap gap-2">
          <CompactField value={values.speedSecs} unitSingular="Sec / Breath" unitPlural="Sec / Breath" onChange={(v) => onChange({ speedSecs: v })} />
          <CompactField value={values.loops} unitSingular="Loop" unitPlural="Loops" onChange={(v) => onChange({ loops: v })} />
        </div>
      );

    case 'pf-full-range':
      return (
        <div className="flex w-full flex-col gap-3">
          {positionField}
          <div className="flex flex-wrap gap-2">
            {setsRepsFields}
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
            <CompactField value={values.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ holdSecs: v })} />
            <CompactField value={values.restSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ restSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    case 'pf-quick-flicks':
      return (
        <div className="flex w-full flex-col gap-3">
          {positionField}
          <div className="flex flex-wrap gap-2">
            {setsRepsFields}
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
            <CompactField value={values.restSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ restSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    case 'pf-sustained-hold':
      return (
        <div className="flex w-full flex-col gap-3">
          {positionField}
          <div className={fieldColCls}>
            <label className={fieldLabelCls}>Hold Intensity</label>
            <NativeSelect className="h-12" value={String(values.holdIntensityPct)} onChange={(e) => onChange({ holdIntensityPct: Number(e.target.value) })}>
              {HOLD_INTENSITIES.map((pct) => <option key={pct} value={pct}>{pct}%</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-wrap gap-2">
            {setsRepsFields}
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
            <CompactField value={values.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ holdSecs: v })} />
            <CompactField value={values.restSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ restSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    case 'pf-elevator':
      return (
        <div className="flex w-full flex-col gap-3">
          {positionField}
          <div className={fieldColCls}>
            <label className={fieldLabelCls}>Number of Stages</label>
            <NativeSelect className="h-12" value={String(values.stages)} onChange={(e) => onChange({ stages: Number(e.target.value) })}>
              {STAGE_COUNTS.map((n) => <option key={n} value={n}>{stageLabel(n)}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-wrap gap-2">
            {setsRepsFields}
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
            <CompactField value={values.stagePauseSecs} unitSingular="Sec / Stage" unitPlural="Sec / Stage" onChange={(v) => onChange({ stagePauseSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    case 'pf-reverse-kegel':
      return (
        <div className="flex w-full flex-col gap-3">
          {positionField}
          <div className="flex flex-wrap gap-2">
            {setsRepsFields}
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
            <CompactField value={values.restSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ restSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    case 'pf-the-knack':
      return (
        <div className="flex w-full flex-col gap-3">
          {frequencyField}
        </div>
      );

    case 'pf-combo-full-range-quick-flicks':
      return (
        <div className="flex w-full flex-col gap-3">
          {positionField}
          <span className="text-xs font-semibold text-primary">Full Range Contraction</span>
          <div className="flex flex-wrap gap-2">
            <CompactField value={values.step1Sets} unitSingular="Set" unitPlural="Sets" onChange={(v) => onChange({ step1Sets: v })} />
            <CompactField value={values.step1Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => onChange({ step1Reps: v })} />
            <CompactField value={values.step1SpeedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ step1SpeedSecs: v })} />
            <CompactField value={values.step1HoldSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ step1HoldSecs: v })} />
            <CompactField value={values.step1RestSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ step1RestSecs: v })} />
          </div>
          <CompactField value={values.transitionRestSecs} unitSingular="Sec Transition Rest" unitPlural="Sec Transition Rest" onChange={(v) => onChange({ transitionRestSecs: v })} />
          <span className="text-xs font-semibold text-primary">Quick Flicks</span>
          <div className="flex flex-wrap gap-2">
            <CompactField value={values.step2Sets} unitSingular="Set" unitPlural="Sets" onChange={(v) => onChange({ step2Sets: v })} />
            <CompactField value={values.step2Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => onChange({ step2Reps: v })} />
            <CompactField value={values.step2SpeedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ step2SpeedSecs: v })} />
            <CompactField value={values.step2RestSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ step2RestSecs: v })} />
          </div>
          <CompactField value={values.comboSets} unitSingular="Combo Set" unitPlural="Combo Sets" onChange={(v) => onChange({ comboSets: v })} />
          {frequencyField}
        </div>
      );

    case 'pf-combo-sustained-hold-quick-flicks':
      return (
        <div className="flex w-full flex-col gap-3">
          {positionField}
          <span className="text-xs font-semibold text-primary">Sustained Hold</span>
          <div className={fieldColCls}>
            <label className={fieldLabelCls}>Hold Intensity</label>
            <NativeSelect className="h-12" value={String(values.step1IntensityPct)} onChange={(e) => onChange({ step1IntensityPct: Number(e.target.value) })}>
              {HOLD_INTENSITIES.map((pct) => <option key={pct} value={pct}>{pct}%</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-wrap gap-2">
            <CompactField value={values.step1Sets} unitSingular="Set" unitPlural="Sets" onChange={(v) => onChange({ step1Sets: v })} />
            <CompactField value={values.step1Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => onChange({ step1Reps: v })} />
            <CompactField value={values.step1SpeedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ step1SpeedSecs: v })} />
            <CompactField value={values.step1HoldSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ step1HoldSecs: v })} />
            <CompactField value={values.step1RestSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ step1RestSecs: v })} />
          </div>
          <CompactField value={values.transitionRestSecs} unitSingular="Sec Transition Rest" unitPlural="Sec Transition Rest" onChange={(v) => onChange({ transitionRestSecs: v })} />
          <span className="text-xs font-semibold text-primary">Quick Flicks</span>
          <div className="flex flex-wrap gap-2">
            <CompactField value={values.step2Sets} unitSingular="Set" unitPlural="Sets" onChange={(v) => onChange({ step2Sets: v })} />
            <CompactField value={values.step2Reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => onChange({ step2Reps: v })} />
            <CompactField value={values.step2SpeedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ step2SpeedSecs: v })} />
            <CompactField value={values.step2RestSecs} unitSingular="Sec Rest" unitPlural="Sec Rest" onChange={(v) => onChange({ step2RestSecs: v })} />
          </div>
          <CompactField value={values.comboSets} unitSingular="Combo Set" unitPlural="Combo Sets" onChange={(v) => onChange({ comboSets: v })} />
          {frequencyField}
        </div>
      );

    case 'pf-dilator-j-curve':
      return (
        <div className="flex w-full flex-col gap-3">
          <div className={fieldColCls}>
            <label className={fieldLabelCls}>Dilator Size</label>
            <NativeSelect className="h-12" value={values.dilatorSize} onChange={(e) => onChange({ dilatorSize: e.target.value as RxValues['dilatorSize'] })}>
              {DILATOR_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-wrap gap-2">
            <CompactField value={values.reps} unitSingular="Rep / Side" unitPlural="Reps / Side" onChange={(v) => onChange({ reps: v })} />
            <CompactField value={values.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ holdSecs: v })} />
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    case 'pf-dilator-3-point':
      return (
        <div className="flex w-full flex-col gap-3">
          <div className={fieldColCls}>
            <label className={fieldLabelCls}>Dilator Size</label>
            <NativeSelect className="h-12" value={values.dilatorSize} onChange={(e) => onChange({ dilatorSize: e.target.value as RxValues['dilatorSize'] })}>
              {DILATOR_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-wrap gap-2">
            <CompactField value={values.reps} unitSingular="Rep / Direction" unitPlural="Reps / Direction" onChange={(v) => onChange({ reps: v })} />
            <CompactField value={values.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ holdSecs: v })} />
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    case 'pf-dilator-half-u':
      return (
        <div className="flex w-full flex-col gap-3">
          <div className={fieldColCls}>
            <label className={fieldLabelCls}>Dilator Size</label>
            <NativeSelect className="h-12" value={values.dilatorSize} onChange={(e) => onChange({ dilatorSize: e.target.value as RxValues['dilatorSize'] })}>
              {DILATOR_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-wrap gap-2">
            <CompactField value={values.reps} unitSingular="Rep / Side" unitPlural="Reps / Side" onChange={(v) => onChange({ reps: v })} />
            <CompactField value={values.speedSecs} unitSingular="Sec Speed" unitPlural="Sec Speed" onChange={(v) => onChange({ speedSecs: v })} />
            <CompactField value={values.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ holdSecs: v })} />
          </div>
          {frequencyField}
        </div>
      );

    default:
      return (
        <div className="flex flex-wrap gap-2">
          {setsRepsFields}
          <CompactField value={values.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ holdSecs: v })} />
        </div>
      );
  }
}
