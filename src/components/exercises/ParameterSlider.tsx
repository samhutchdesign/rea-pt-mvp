'use client';

interface ParameterSliderProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

/** Custom-styled range slider (track + thumb) matching Figma's Slider component, with an invisible native <input type="range"> layered on top for drag/keyboard/touch support. */
export function ParameterSlider({ label, value, unit, min, max, step = 1, onChange }: ParameterSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex h-12 w-full items-center gap-2 rounded-lg bg-primary p-3">
      <span className="w-12 shrink-0 text-xs text-secondary">{label}</span>
      <div className="relative h-6 flex-1">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-tertiary">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
        </div>
        <div
          className="pointer-events-none absolute top-1/2 size-6 -translate-y-1/2 rounded-full border-2 border-brand-600 bg-primary shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
          style={{ left: `calc(${pct}% - 12px)` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </div>
      <span className="shrink-0 whitespace-nowrap text-xs text-secondary">{value}{unit}</span>
    </div>
  );
}
