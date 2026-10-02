'use client';
import { useState } from 'react';
import { GripVertical, Settings2 } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { cx } from '@/utils/cx';
import { NativeSelect } from '@/components/ui/native-select';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { ExerciseMarkerFields, defaultRxValues, rxSummary, type RxValues } from '@/components/exercises/exerciseRx';
import { CUES, type ProgramRow } from './programBuilder';

function NumberField({ value, unit, onChange }: { value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="flex h-12 w-[100px] shrink-0 items-center justify-between gap-1 rounded-lg border border-secondary bg-primary px-3 transition-shadow focus-within:ring-2 focus-within:ring-brand-300">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full min-w-0 bg-transparent text-base text-primary outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="shrink-0 text-xs text-primary">{unit}</span>
    </div>
  );
}

function rowToRxValues(ex: Exercise, row: ProgramRow): RxValues {
  const base = defaultRxValues(ex);
  return {
    ...base,
    sets: row.sets, reps: row.reps, holdSecs: row.holdSecs,
    restSecs: row.restSecs ?? base.restSecs,
    speedSecs: row.speedSecs ?? base.speedSecs,
    loops: row.loops ?? base.loops,
    startingPosition: row.startingPosition ?? base.startingPosition,
    holdIntensityPct: row.holdIntensityPct ?? base.holdIntensityPct,
    stages: row.stages ?? base.stages,
    stagePauseSecs: row.stagePauseSecs ?? base.stagePauseSecs,
    frequency: row.frequency ?? base.frequency,
    step1Sets: row.step1Sets ?? base.step1Sets,
    step1Reps: row.step1Reps ?? base.step1Reps,
    step1SpeedSecs: row.step1SpeedSecs ?? base.step1SpeedSecs,
    step1HoldSecs: row.step1HoldSecs ?? base.step1HoldSecs,
    step1RestSecs: row.step1RestSecs ?? base.step1RestSecs,
    step1IntensityPct: row.step1IntensityPct ?? base.step1IntensityPct,
    step2Sets: row.step2Sets ?? base.step2Sets,
    step2Reps: row.step2Reps ?? base.step2Reps,
    step2SpeedSecs: row.step2SpeedSecs ?? base.step2SpeedSecs,
    step2RestSecs: row.step2RestSecs ?? base.step2RestSecs,
    transitionRestSecs: row.transitionRestSecs ?? base.transitionRestSecs,
    comboSets: row.comboSets ?? base.comboSets,
    dilatorSize: row.dilatorSize ?? base.dilatorSize,
    pressureLevel: row.pressureLevel ?? base.pressureLevel,
    durationSecs: row.durationSecs ?? base.durationSecs,
  };
}

interface ExerciseEditTableProps {
  rows: ProgramRow[];
  getExercise: (id: string) => Exercise | undefined;
  dragIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onUpdateRow: (exerciseId: string, field: keyof ProgramRow, value: number | string) => void;
}

export function ExerciseEditTable({
  rows,
  getExercise,
  dragIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onUpdateRow,
}: ExerciseEditTableProps) {
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<RxValues | null>(null);

  const openConfig = (ex: Exercise, row: ProgramRow) => {
    setConfiguringId(row.exerciseId);
    setConfigValues(rowToRxValues(ex, row));
  };

  const saveConfig = () => {
    if (!configuringId || !configValues) return;
    (Object.entries(configValues) as [keyof RxValues, number | string][]).forEach(([field, value]) => {
      onUpdateRow(configuringId, field as keyof ProgramRow, value);
    });
    setConfiguringId(null);
    setConfigValues(null);
  };

  const configuringExercise = configuringId ? getExercise(configuringId) : undefined;

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-y-auto px-[60px] py-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
        <span className="text-xs text-primary">
          {rows.length} Exercise{rows.length !== 1 ? 's' : ''} in Program
        </span>

        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-base text-secondary">No exercises added yet — go back and add some.</span>
          </div>
        ) : (
          <>
            <div className="flex w-full items-center gap-5 border-b border-secondary px-5 py-3">
              <span className="flex-1 min-w-0 text-xs text-primary">Exercise</span>
              <span className="w-[100px] shrink-0 text-xs text-primary">{'# Sets'}</span>
              <span className="w-[100px] shrink-0 text-xs text-primary">{'# Reps'}</span>
              <span className="w-[100px] shrink-0 text-xs text-primary">Sec Hold</span>
              <span className="w-[240px] shrink-0 text-xs text-primary">Optional Cue</span>
              <span className="w-5 shrink-0" />
            </div>

            <div className="flex flex-col gap-2">
              {rows.map((row, idx) => {
                const ex = getExercise(row.exerciseId);
                if (!ex) return null;
                const isDragging = dragIndex === idx;
                const isDropTarget = dragOverIndex === idx && dragIndex !== idx;
                const isSpecial = !!ex.animationType;
                return (
                  <div
                    key={row.exerciseId}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDrop={(e) => onDrop(e, idx)}
                    onDragEnd={onDragEnd}
                    className={cx(
                      'group relative flex w-full cursor-grab items-center gap-5 overflow-hidden rounded-lg border bg-primary pr-5 transition-opacity active:cursor-grabbing',
                      isDragging ? 'opacity-40' : 'opacity-100',
                      isDropTarget ? 'border-dashed border-brand-600' : 'border-primary'
                    )}
                  >
                    <div className="relative h-[88px] w-[142px] shrink-0">
                      <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} iconSize={24} />
                    </div>

                    <span className="min-w-0 flex-1 truncate font-display text-md font-medium tracking-[0.1px] text-primary">
                      {ex.name}
                    </span>

                    <div className="flex shrink-0 items-center gap-5">
                      {isSpecial ? (
                        <button
                          type="button"
                          onClick={() => openConfig(ex, row)}
                          className="flex h-12 w-[340px] items-center gap-2 rounded-lg border border-secondary bg-primary px-3 text-left transition-colors hover:bg-secondary_alt"
                        >
                          <Settings2 size={14} className="shrink-0 text-tertiary" strokeWidth={1.25} />
                          <span className="truncate text-xs text-secondary">{rxSummary(ex, rowToRxValues(ex, row))}</span>
                        </button>
                      ) : (
                        <>
                          <NumberField value={row.sets} unit="Sets" onChange={(v) => onUpdateRow(row.exerciseId, 'sets', v)} />
                          <NumberField value={row.reps} unit="Reps" onChange={(v) => onUpdateRow(row.exerciseId, 'reps', v)} />
                          <NumberField value={row.holdSecs} unit="Sec" onChange={(v) => onUpdateRow(row.exerciseId, 'holdSecs', v)} />
                        </>
                      )}
                    </div>

                    <NativeSelect
                      value={row.cue}
                      onChange={(e) => onUpdateRow(row.exerciseId, 'cue', e.target.value)}
                      wrapperClassName="w-[240px] shrink-0"
                      className="h-12 pl-4 pr-10 text-base"
                    >
                      <option value="">No Cue</option>
                      {CUES.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </NativeSelect>

                    <GripVertical size={20} className="shrink-0 text-quaternary" strokeWidth={1.25} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ModalOverlay isOpen={!!configuringId} onOpenChange={(o) => { if (!o) { setConfiguringId(null); setConfigValues(null); } }}>
        <Modal className="w-full max-w-[480px]"><Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <div className="flex w-full flex-col gap-4">
              <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Configure Parameters</h2>
              {configuringExercise && <p className="m-0 text-base text-primary">{configuringExercise.name}</p>}
            </div>
            {configuringExercise && configValues && (
              <ExerciseMarkerFields
                exercise={configuringExercise}
                values={configValues}
                onChange={(patch) => setConfigValues((prev) => (prev ? { ...prev, ...patch } : prev))}
              />
            )}
            <div className="flex w-full justify-end gap-4">
              <Button color="secondary" size="lg" onPress={() => { setConfiguringId(null); setConfigValues(null); }}>Cancel</Button>
              <Button color="primary" size="lg" onPress={saveConfig}>Save</Button>
            </div>
          </div>
        </Dialog></Modal>
      </ModalOverlay>
    </div>
  );
}
