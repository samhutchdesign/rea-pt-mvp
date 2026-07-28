'use client';
import { useState, useEffect } from 'react';
import { mockChartSessions } from './mock-data';
import type { ChartSession, ChartAmendment } from './types';

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
  const target = current.find((s) => s.id === session.id);
  if (target?.signedAt) {
    console.warn(`Refusing to update signed chart session ${session.id} — use addAmendment instead.`);
    return;
  }
  _state = new Map(_state).set(
    patientId,
    current.map((s) => (s.id === session.id ? session : s))
  );
  notify(patientId);
}

export function deleteChartSession(patientId: string, sessionId: string): void {
  const current = getChartSessions(patientId);
  const target = current.find((s) => s.id === sessionId);
  if (target?.signedAt) {
    console.warn(`Refusing to delete signed chart session ${sessionId}.`);
    return;
  }
  _state = new Map(_state).set(
    patientId,
    current.filter((s) => s.id !== sessionId)
  );
  notify(patientId);
}

export function signChartSession(patientId: string, sessionId: string, signer: { empId: string; name: string; initials: string; signatureFontId: string }): void {
  const current = getChartSessions(patientId);
  _state = new Map(_state).set(
    patientId,
    current.map((s) => (s.id === sessionId
      ? { ...s, signedAt: new Date().toISOString(), signedByEmpId: signer.empId, signedByName: signer.name, signedByInitials: signer.initials, signatureFontId: signer.signatureFontId }
      : s
    ))
  );
  notify(patientId);
}

export function addAmendment(patientId: string, sessionId: string, amendment: Omit<ChartAmendment, 'id' | 'createdAt'>): void {
  const current = getChartSessions(patientId);
  _state = new Map(_state).set(
    patientId,
    current.map((s) => (s.id === sessionId
      ? { ...s, amendments: [...(s.amendments ?? []), { ...amendment, id: `amd_${sessionId}_${Date.now()}`, createdAt: new Date().toISOString() }] }
      : s
    ))
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
