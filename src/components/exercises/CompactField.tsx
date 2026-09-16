'use client';

export function CompactField({ value, onChange, unitSingular, unitPlural }: { value: number; onChange: (v: number) => void; unitSingular: string; unitPlural: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary pl-2.5 pr-4 py-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-6 bg-transparent text-base text-primary text-center outline-none"
      />
      <span className="text-base text-secondary whitespace-nowrap">{value === 1 ? unitSingular : unitPlural}</span>
    </div>
  );
}
