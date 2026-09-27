'use client';
import { useState, useEffect } from 'react';

/**
 * Tracks a patient checking off an exercise as done, one checkbox per
 * scheduled instance (a given day's occurrence) rather than one flag per
 * exercise for the life of the program — so paging the date changer to a
 * different day shows that day's own unchecked/checked state instead of one
 * shared flag that bleeds across days.
 *
 * Mock-only, in-memory, and local to the patient side (mirrors the "no
 * persistence between sessions" convention used by the rest of the app's
 * demo stores).
 */

/** Formats a Date as the "YYYY-MM-DD" key completions are stored under. */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function completionKey(exerciseId: string, dateKey: string): string {
  return `${exerciseId}:${dateKey}`;
}

// patientId -> Set of "exerciseId:YYYY-MM-DD" keys that have been checked off
let _state: Map<string, Set<string>> = new Map();

const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export function isExerciseCompleted(patientId: string, exerciseId: string, dateKey: string): boolean {
  return _state.get(patientId)?.has(completionKey(exerciseId, dateKey)) ?? false;
}

export function toggleExerciseCompleted(patientId: string, exerciseId: string, dateKey: string): void {
  const key = completionKey(exerciseId, dateKey);
  const current = new Set(_state.get(patientId) ?? []);
  if (current.has(key)) {
    current.delete(key);
  } else {
    current.add(key);
  }
  _state = new Map(_state).set(patientId, current);
  notify();
}

export function useCompletedExerciseIds(patientId: string, dateKey: string): Set<string> {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const raw = _state.get(patientId) ?? new Set<string>();
  const exerciseIds = new Set<string>();
  raw.forEach((k) => {
    const [exerciseId, keyDate] = k.split(':');
    if (keyDate === dateKey) exerciseIds.add(exerciseId);
  });
  return exerciseIds;
}
