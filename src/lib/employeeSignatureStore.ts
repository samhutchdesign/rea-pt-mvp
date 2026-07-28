'use client';
import { useState, useEffect } from 'react';
import { mockEmployees } from './mock-data';

export const SIGNATURE_FONTS = [
  { id: 'dancing-script', label: 'Dancing Script', variable: 'var(--font-dancing-script)' },
  { id: 'great-vibes', label: 'Great Vibes', variable: 'var(--font-great-vibes)' },
  { id: 'caveat', label: 'Caveat', variable: 'var(--font-caveat)' },
  { id: 'sacramento', label: 'Sacramento', variable: 'var(--font-sacramento)' },
] as const;

// Pre-seeded per employee (round-robin over the available styles) so this demo never starts
// blocked on Sign & Lock — practitioners can still change their style anytime in Settings.
let _state: Map<string, string> = new Map(
  mockEmployees.map((e, i) => [e.id, SIGNATURE_FONTS[i % SIGNATURE_FONTS.length].id])
);

const _listeners: Map<string, Set<() => void>> = new Map();

function notify(empId: string) {
  _listeners.get(empId)?.forEach((l) => l());
}

export function getSignatureFontId(empId: string): string | undefined {
  return _state.get(empId);
}

export function setSignatureFontId(empId: string, fontId: string): void {
  _state = new Map(_state).set(empId, fontId);
  notify(empId);
}

export function useSignatureFontId(empId: string): string | undefined {
  const [fontId, setFontId] = useState<string | undefined>(() => getSignatureFontId(empId));

  useEffect(() => {
    const listener = () => setFontId(getSignatureFontId(empId));
    if (!_listeners.has(empId)) _listeners.set(empId, new Set());
    _listeners.get(empId)!.add(listener);
    return () => { _listeners.get(empId)?.delete(listener); };
  }, [empId]);

  return fontId;
}
