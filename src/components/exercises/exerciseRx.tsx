'use client';
import type { Exercise } from '@/lib/types';
import { NativeSelect } from '@/components/ui/native-select';
import { CompactField } from './CompactField';

export const STARTING_POSITIONS = ['Lying', 'Sitting', 'Standing'] as const;
export const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'] as const;
export const HOLD_INTENSITIES = [50, 60, 70] as const;
export const STAGE_COUNTS = [2, 3, 4] as const;

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
              {STAGE_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
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

    default:
      return (
        <div className="flex flex-wrap gap-2">
          {setsRepsFields}
          <CompactField value={values.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => onChange({ holdSecs: v })} />
        </div>
      );
  }
}
