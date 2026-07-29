'use client';
import { useState, type MouseEvent } from 'react';
import { cx } from '@/utils/cx';
import type { PainPoint } from '@/lib/types';

type BodyView = 'front' | 'back';

const VIEWS: { id: BodyView; label: string; src: string }[] = [
  { id: 'front', label: 'Front', src: '/body-map/front.svg' },
  { id: 'back', label: 'Back', src: '/body-map/back.svg' },
];

interface BodyMapProps {
  painPoints: PainPoint[];
  armedIndex?: number | null;
  onPlace?: (view: BodyView, x: number, y: number) => void;
  interactive?: boolean;
}

export function BodyMap({ painPoints, armedIndex = null, onPlace, interactive = true }: BodyMapProps) {
  const [view, setView] = useState<BodyView>('front');
  const [imgError, setImgError] = useState<Partial<Record<BodyView, boolean>>>({});

  const activeView = VIEWS.find((v) => v.id === view)!;
  const pins = painPoints
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.bodyView === view && p.x !== undefined && p.y !== undefined);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactive || armedIndex === null || !onPlace) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPlace(view, Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y)));
  };

  return (
    <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Pain Diagram</span>
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cx(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                view === v.id ? 'bg-brand-600 text-white' : 'bg-secondary_alt text-secondary hover:bg-secondary_alt/80',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {interactive && armedIndex !== null && (
        <p className="mb-2 text-xs font-medium text-brand-600">Click the diagram to place P{armedIndex + 1}</p>
      )}

      <div
        onClick={handleClick}
        className={cx(
          'relative mx-auto aspect-[3/4] max-w-[320px] select-none rounded-lg',
          interactive && armedIndex !== null && 'cursor-crosshair ring-2 ring-brand-400',
        )}
      >
        {imgError[view] ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-secondary bg-secondary_alt p-4 text-center text-xs text-tertiary">
            <span>Add <code className="font-mono">{activeView.src.replace('/body-map/', '')}</code></span>
            <span>to <code className="font-mono">public/body-map/</code></span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- static local asset, dimensions vary per file
          <img
            src={activeView.src}
            alt={`Body diagram — ${activeView.label}`}
            className="pointer-events-none h-full w-full object-contain"
            draggable={false}
            onError={() => setImgError((prev) => ({ ...prev, [view]: true }))}
          />
        )}

        {pins.map(({ p, i }) => (
          <div
            key={i}
            title={p.location || `P${i + 1}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow-md ring-2 ring-white"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
