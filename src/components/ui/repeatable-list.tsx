'use client';
import type { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';

interface RepeatableListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel?: string;
  emptyLabel?: string;
}

export function RepeatableList<T>({ items, onChange, newItem, renderRow, addLabel = 'Add', emptyLabel }: RepeatableListProps<T>) {
  const updateAt = (index: number, patch: Partial<T>) => {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && emptyLabel && (
        <p className="text-sm text-tertiary italic">{emptyLabel}</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-secondary p-3">
          <div className="min-w-0 flex-1">{renderRow(item, (patch) => updateAt(i, patch), i)}</div>
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label="Remove"
            className="shrink-0 text-tertiary hover:text-error-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <Button size="sm" color="secondary" iconLeading={Plus} onPress={() => onChange([...items, newItem()])}>
        {addLabel}
      </Button>
    </div>
  );
}
