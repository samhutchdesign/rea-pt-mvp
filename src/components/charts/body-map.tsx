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
  const [imgError, setImgError] = useState<Partial<Record<BodyView, boolean>>>({});
  const containerRefs = useRef<Record<BodyView, HTMLDivElement | null>>({ front: null, back: null });
  const draggingIndex = useRef<number | null>(null);
  const didDrag = useRef(false);

  const pinsForView = (v: BodyView) => painPoints
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.bodyView === v && p.x !== undefined && p.y !== undefined);

  const posFromPoint = (view: BodyView, clientX: number, clientY: number) => {
    const rect = containerRefs.current[view]!.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>, view: BodyView) => {
    if (!interactive || didDrag.current) {
      didDrag.current = false;
      return;
    }
    const { x, y } = posFromPoint(view, e.clientX, e.clientY);
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
      const index = draggingIndex.current;
      if (index === null) return;
      const view = painPoints[index]?.bodyView;
      if (!view) return;
      didDrag.current = true;
      const { x, y } = posFromPoint(view, e.clientX, e.clientY);
      onMove(index, x, y);
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
  }, [simplified, !!onMove, painPoints]);

  const renderDiagram = (v: (typeof VIEWS)[number]) => (
    <div
      key={v.id}
      ref={(el) => { containerRefs.current[v.id] = el; }}
      onClick={interactive ? (e) => handleClick(e, v.id) : undefined}
      className={cx(
        'relative aspect-[2/5] w-[180px] shrink-0 select-none rounded-lg',
        interactive && (armedIndex !== null ? 'cursor-crosshair ring-2 ring-brand-400' : 'cursor-crosshair'),
      )}
    >
      {imgError[v.id] ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-secondary bg-secondary_alt p-4 text-center text-xs text-tertiary">
          {interactive && (
            <>
              <span>Add <code className="font-mono">{v.src.replace('/body-map/', '')}</code></span>
              <span>to <code className="font-mono">public/body-map/</code></span>
            </>
          )}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- static local asset, dimensions vary per file
        <img
          src={v.src}
          alt={`Body diagram — ${v.label}`}
          className="pointer-events-none h-full w-full object-contain"
          draggable={false}
          onError={() => setImgError((prev) => ({ ...prev, [v.id]: true }))}
        />
      )}
      {pinsForView(v.id).map(({ p, i }) => (
        <div
          key={i}
          title={simplified ? undefined : (p.location || `P${i + 1}`)}
          onPointerDown={(e) => handlePinPointerDown(e, i)}
          onClick={(e) => { if (simplified) e.stopPropagation(); }}
          style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: simplified ? 'none' : undefined }}
          className={cx(
            'group absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm',
            simplified
              ? cx('h-9 w-9 border-2 border-brand-600 bg-brand-600/20', interactive && onMove && 'cursor-grab active:cursor-grabbing')
              : 'flex size-7 items-center justify-center border-2 border-brand-700 bg-brand-100',
          )}
        >
          {!simplified && <span className="font-display text-sm font-medium text-brand-700">{i + 1}</span>}
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
  );

  if (!interactive) {
    return (
      <div>
        <span className="font-display mb-5 block text-lg font-medium tracking-[0.1px] text-primary">Pain Diagram</span>
        <div className="flex justify-center gap-8">
          {VIEWS.map((v) => renderDiagram(v))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
      <span className="font-display mb-3 block text-lg font-medium text-primary">Pain Diagram</span>
      <p className="mb-3 text-xs font-medium text-brand-600">
        {simplified
          ? 'Click a diagram to add a pain point — drag to move, click × to remove'
          : armedIndex !== null ? `Click a diagram to place P${armedIndex + 1}` : 'Click a diagram to add a pain point'}
      </p>
      <div className="flex justify-center gap-8">
        {VIEWS.map((v) => renderDiagram(v))}
      </div>
    </div>
  );
}
