'use client';
import { useState } from 'react';

/** Rolls the old value up and out while the new one slides up and in, like an odometer. */
export function RollingNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  // Adjust state during render when the value prop changes, per React's
  // documented pattern — avoids the extra render an effect would cause.
  if (value !== displayValue) {
    setPrevValue(displayValue);
    setDisplayValue(value);
    setAnimKey((k) => k + 1);
  }

  return (
    <span className="relative inline-block h-5 min-w-[1ch] overflow-hidden align-bottom">
      <span className="invisible">{displayValue}</span>
      {prevValue !== null && (
        <span key={`prev-${animKey}`} className="absolute inset-0 animate-[counter-roll-out_0.35s_ease-in_forwards]">
          {prevValue}
        </span>
      )}
      <span key={`current-${animKey}`} className="absolute inset-0 animate-[counter-roll-in_0.35s_ease-out_forwards]">
        {displayValue}
      </span>
    </span>
  );
}
