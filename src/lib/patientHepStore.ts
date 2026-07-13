'use client';
import { useState, useEffect } from 'react';
import { mockPatients } from './mock-data';
import type { HepHistoryEntry } from './types';

export type HepState = {
  programId?: string;
  programAssignedAt?: string;
  hepHistory: HepHistoryEntry[];
};

let _state: Map<string, HepState> = new Map(
  mockPatients.map((p) => [
    p.id,
    {
      programId: p.programId,
      programAssignedAt: p.programAssignedAt,
      hepHistory: p.hepHistory ?? [],
    },
  ])
);

const _listeners: Map<string, Set<() => void>> = new Map();

function notify(patientId: string) {
  _listeners.get(patientId)?.forEach((l) => l());
}

export function getHepState(patientId: string): HepState {
  return _state.get(patientId) ?? { hepHistory: [] };
}

export function saveNewProgram(
  patientId: string,
  newProgramId: string,
  newProgramName: string,
  newExercises: HepHistoryEntry['exercises'],
  oldSnapshot: Omit<HepHistoryEntry, 'id' | 'endedAt'> | null
): void {
  const current = getHepState(patientId);
  const today = new Date().toISOString().slice(0, 10);
  const history = [...current.hepHistory];

  if (oldSnapshot) {
    history.push({
      ...oldSnapshot,
      id: `hep_${patientId}_${Date.now()}`,
      endedAt: today,
    });
  }

  _state = new Map(_state).set(patientId, {
    programId: newProgramId,
    programAssignedAt: today,
    hepHistory: history,
  });
  notify(patientId);
}

export function useHepState(patientId: string): HepState {
  const [state, setState] = useState<HepState>(() => getHepState(patientId));

  useEffect(() => {
    const listener = () => setState(getHepState(patientId));
    if (!_listeners.has(patientId)) _listeners.set(patientId, new Set());
    _listeners.get(patientId)!.add(listener);
    return () => { _listeners.get(patientId)?.delete(listener); };
  }, [patientId]);

  return state;
}
