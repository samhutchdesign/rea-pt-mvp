'use client';
import { Eye, GripVertical, X } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { cx } from '@/utils/cx';
import { NativeSelect } from '@/components/ui/native-select';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { CUES, type ProgramRow } from './programBuilder';

const GRID_COLS = 'grid-cols-[24px_minmax(0,1fr)_100px_100px_110px_200px_64px]';

function TableField({ value, unitLabel, onChange }: { value: number; unitLabel: string; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary px-2 py-2 shadow-xs">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-8 min-w-0 bg-transparent text-sm text-primary text-center outline-none"
      />
      <span className="truncate text-xs text-secondary">{unitLabel}</span>
    </div>
  );
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
  onRemoveRow: (exerciseId: string) => void;
  onPreview: (ex: Exercise) => void;
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
  onRemoveRow,
  onPreview,
}: ExerciseEditTableProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 px-6 py-5">
      <span className="text-sm font-semibold text-primary shrink-0">
        {rows.length} exercise{rows.length !== 1 ? 's' : ''} in program
      </span>

      {rows.length === 0 ? (
        <div className="py-16 text-center">
          <span className="text-sm text-secondary">No exercises added yet — go back and add some.</span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className={cx('grid items-center gap-4 px-2 pb-3 text-xs font-semibold tracking-wide text-tertiary uppercase', GRID_COLS)}>
            <span />
            <span>Exercise</span>
            <span># Sets</span>
            <span># Reps</span>
            <span>Sec Hold</span>
            <span>Optional Cue</span>
            <span />
          </div>
          <div className="flex flex-col gap-3">
            {rows.map((row, idx) => {
              const ex = getExercise(row.exerciseId);
              if (!ex) return null;
              const isDragging = dragIndex === idx;
              const isDropTarget = dragOverIndex === idx && dragIndex !== idx;
              return (
                <div
                  key={row.exerciseId}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={(e) => onDrop(e, idx)}
                  onDragEnd={onDragEnd}
                  className={cx(
                    'grid items-center gap-4 rounded-xl border bg-primary p-3 shadow-xs transition-opacity',
                    GRID_COLS,
                    isDragging ? 'opacity-40' : 'opacity-100',
                    isDropTarget ? 'border-brand-600 border-dashed' : 'border-secondary'
                  )}
                >
                  <GripVertical size={16} className="shrink-0 cursor-grab text-quaternary" />

                  <button
                    type="button"
                    onClick={() => onPreview(ex)}
                    className="flex min-w-0 items-center gap-3 bg-transparent border-none p-0 text-left cursor-pointer"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                      <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} iconSize={16} />
                    </div>
                    <span className="truncate text-sm font-semibold text-primary">{ex.name}</span>
                  </button>

                  <TableField value={row.sets} unitLabel="Sets" onChange={(v) => onUpdateRow(row.exerciseId, 'sets', v)} />
                  <TableField value={row.reps} unitLabel="Reps" onChange={(v) => onUpdateRow(row.exerciseId, 'reps', v)} />
                  <TableField value={row.holdSecs} unitLabel="Sec" onChange={(v) => onUpdateRow(row.exerciseId, 'holdSecs', v)} />

                  <NativeSelect
                    value={row.cue}
                    onChange={(e) => onUpdateRow(row.exerciseId, 'cue', e.target.value)}
                  >
                    <option value="">No Cue</option>
                    {CUES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </NativeSelect>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Preview"
                      onClick={() => onPreview(ex)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => onRemoveRow(row.exerciseId)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
