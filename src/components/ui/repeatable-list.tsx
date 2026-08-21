'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { GripVertical, X } from 'lucide-react';
import { cx } from '@/utils/cx';

interface RepeatableListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel?: string;
  emptyLabel?: string;
  reorderable?: boolean;
}

export function RepeatableList<T>({ items, onChange, newItem, renderRow, addLabel = 'Add', emptyLabel, reorderable }: RepeatableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateAt = (index: number, patch: Partial<T>) => {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) { setDragIndex(null); setDragOverIndex(null); return; }
    const next = items.slice();
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && emptyLabel && (
        <p className="text-sm text-tertiary italic">{emptyLabel}</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {reorderable && (
            <span className="mt-2 w-4 shrink-0 text-right text-sm font-semibold text-tertiary">{i + 1}.</span>
          )}
          <div
            className={cx(
              'flex flex-1 items-start gap-2 rounded-lg border p-3 transition-opacity',
              dragIndex === i ? 'opacity-40' : 'opacity-100',
              dragOverIndex === i && dragIndex !== i ? 'border-brand-600 border-dashed' : 'border-secondary'
            )}
            draggable={reorderable}
            onDragStart={reorderable ? () => setDragIndex(i) : undefined}
            onDragOver={reorderable ? (e) => handleDragOver(e, i) : undefined}
            onDrop={reorderable ? (e) => handleDrop(e, i) : undefined}
            onDragEnd={reorderable ? handleDragEnd : undefined}
          >
            {reorderable && (
              <GripVertical size={16} className="mt-2 shrink-0 cursor-grab text-quaternary" />
            )}
            <div className="min-w-0 flex-1">{renderRow(item, (patch) => updateAt(i, patch), i)}</div>
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove"
              className={cx('shrink-0 text-tertiary hover:text-error-600', reorderable && 'mt-2')}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="mt-2 w-fit text-xs font-medium text-brand-600 hover:underline"
      >
        + {addLabel}
      </button>
    </div>
  );
}
