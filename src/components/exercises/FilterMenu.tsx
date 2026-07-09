'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cx } from '@/utils/cx';

interface FilterMenuProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function FilterMenu({ label, options, selected, onChange }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cx(
          'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
          selected.length > 0
            ? 'border-brand-300 bg-brand-50 text-brand-700'
            : 'border-secondary bg-primary text-secondary hover:bg-primary_hover'
        )}
      >
        {label}{selected.length > 0 ? ` (${selected.length})` : ''}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-50 max-h-72 w-56 overflow-y-auto rounded-xl border border-secondary bg-primary shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-secondary hover:bg-secondary transition-colors"
            >
              <span className={cx(
                'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                selected.includes(opt) ? 'border-brand-600 bg-brand-600' : 'border-secondary'
              )}>
                {selected.includes(opt) && <Check size={11} className="text-white" strokeWidth={3} />}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
