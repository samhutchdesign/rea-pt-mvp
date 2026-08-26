'use client';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { cx } from '@/utils/cx';
import { X } from 'lucide-react';
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
  onCreate?: (view: BodyView, x: number, y: number) => void;
  onMove?: (index: number, x: number, y: number) => void;
  onDelete?: (index: number) => void;
  interactive?: boolean;
  /** Unlabeled circle markers (no number), used on the dictation-template diagram. */
  simplified?: boolean;
}

export function BodyMap({
  painPoints, armedIndex = null, onPlace, onCreate, onMove, onDelete, interactive = true, simplified = false,
}: BodyMapProps) {
  const [view, setView] = useState<BodyView>('front');
  const [imgError, setImgError] = useState<Partial<Record<BodyView, boolean>>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingIndex = useRef<number | null>(null);
  const didDrag = useRef(false);

  const activeView = VIEWS.find((v) => v.id === view)!;
  const pins = painPoints
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.bodyView === view && p.x !== undefined && p.y !== undefined);

  const posFromPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactive || didDrag.current) {
      didDrag.current = false;
      return;
    }
    const { x, y } = posFromPoint(e.clientX, e.clientY);
    if (armedIndex !== null && onPlace) {
      onPlace(view, x, y);
    } else if (armedIndex === null && onCreate) {
      onCreate(view, x, y);
    }
  };

  const handlePinPointerDown = (e: PointerEvent<HTMLDivElement>, index: number) => {
    if (!simplified || !onMove) return;
    e.stopPropagation();
    draggingIndex.current = index;
  };

  useEffect(() => {
    if (!simplified || !onMove) return;
    const handleMove = (e: globalThis.PointerEvent) => {
      if (draggingIndex.current === null) return;
      didDrag.current = true;
      const { x, y } = posFromPoint(e.clientX, e.clientY);
      onMove(draggingIndex.current, x, y);
    };
    const handleUp = () => {
      draggingIndex.current = null;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simplified, !!onMove]);

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

      {interactive && (
        <p className="mb-2 text-xs font-medium text-brand-600">
          {simplified
            ? 'Click the diagram to add a pain point — drag to move, click × to remove'
            : armedIndex !== null ? `Click the diagram to place P${armedIndex + 1}` : 'Click the diagram to add a pain point'}
        </p>
      )}

      <div
        ref={containerRef}
        onClick={handleClick}
        className={cx(
          'relative mx-auto aspect-[3/4] max-w-[320px] select-none rounded-lg',
          interactive && (armedIndex !== null ? 'cursor-crosshair ring-2 ring-brand-400' : 'cursor-crosshair'),
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
            title={simplified ? undefined : (p.location || `P${i + 1}`)}
            onPointerDown={(e) => handlePinPointerDown(e, i)}
            onClick={(e) => { if (simplified) e.stopPropagation(); }}
            style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: simplified ? 'none' : undefined }}
            className={cx(
              'group absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md',
              simplified
                ? cx('h-9 w-9 border-2 border-brand-600 bg-brand-600/20', interactive && onMove && 'cursor-grab active:cursor-grabbing')
                : 'flex h-6 w-6 items-center justify-center bg-brand-600 text-[11px] font-bold text-white ring-2 ring-white',
            )}
          >
            {!simplified && (i + 1)}
            {simplified && interactive && onDelete && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onDelete(i); }}
                aria-label="Remove pain point"
                className="absolute left-full top-1/2 ml-1.5 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white opacity-0 shadow ring-2 ring-white transition-opacity group-hover:opacity-100"
              >
                <X size={9} strokeWidth={3} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
