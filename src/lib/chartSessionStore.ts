'use client';
import { useState, useEffect } from 'react';
import { mockChartSessions } from './mock-data';
import type { ChartSession } from './types';

let _state: Map<string, ChartSession[]> = new Map(
  Object.entries(mockChartSessions).map(([patientId, sessions]) => [patientId, sessions])
);

const _listeners: Map<string, Set<() => void>> = new Map();

function notify(patientId: string) {
  _listeners.get(patientId)?.forEach((l) => l());
}

export function getChartSessions(patientId: string): ChartSession[] {
  return _state.get(patientId) ?? [];
}

export function addChartSession(patientId: string, session: ChartSession): void {
  const current = getChartSessions(patientId);
  _state = new Map(_state).set(patientId, [...current, session]);
  notify(patientId);
}

export function updateChartSession(patientId: string, session: ChartSession): void {
  const current = getChartSessions(patientId);
  _state = new Map(_state).set(
    patientId,
    current.map((s) => (s.id === session.id ? session : s))
  );
  notify(patientId);
}

export function deleteChartSession(patientId: string, sessionId: string): void {
  const current = getChartSessions(patientId);
  _state = new Map(_state).set(
    patientId,
    current.filter((s) => s.id !== sessionId)
  );
  notify(patientId);
}

export function useChartSessions(patientId: string): ChartSession[] {
  const [sessions, setSessions] = useState<ChartSession[]>(() => getChartSessions(patientId));

  useEffect(() => {
    const listener = () => setSessions(getChartSessions(patientId));
    if (!_listeners.has(patientId)) _listeners.set(patientId, new Set());
    _listeners.get(patientId)!.add(listener);
    return () => { _listeners.get(patientId)?.delete(listener); };
  }, [patientId]);

  return sessions;
}
