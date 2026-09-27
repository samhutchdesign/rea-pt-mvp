'use client';
import { useState, useEffect } from 'react';

/**
 * Tracks a patient checking off an exercise as done, one checkbox per
 * scheduled instance (today's occurrence) rather than one flag per exercise
 * for the life of the program — so a program reassigned or re-run on a later
 * day starts with fresh, unchecked boxes instead of carrying over a stale
 * "done" state from a previous day.
 *
 * Mock-only, in-memory, and local to the patient side (mirrors the "no
 * persistence between sessions" convention used by the rest of the app's
 * demo stores).
 */

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
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

export function isExerciseCompletedToday(patientId: string, exerciseId: string): boolean {
  return _state.get(patientId)?.has(completionKey(exerciseId, todayKey())) ?? false;
}

export function toggleExerciseCompletedToday(patientId: string, exerciseId: string): void {
  const key = completionKey(exerciseId, todayKey());
  const current = new Set(_state.get(patientId) ?? []);
  if (current.has(key)) {
    current.delete(key);
  } else {
    current.add(key);
  }
  _state = new Map(_state).set(patientId, current);
  notify();
}

export function useCompletedExerciseIdsToday(patientId: string): Set<string> {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const key = todayKey();
  const raw = _state.get(patientId) ?? new Set<string>();
  const exerciseIds = new Set<string>();
  raw.forEach((k) => {
    const [exerciseId, dateKey] = k.split(':');
    if (dateKey === key) exerciseIds.add(exerciseId);
  });
  return exerciseIds;
}
