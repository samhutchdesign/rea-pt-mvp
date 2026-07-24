'use client';
import { useState, useEffect } from 'react';
import { mockPatients, mockClinicLocations } from './mock-data';
import type { Patient, Employee } from './types';

export type PatientLocationState = {
  locationId: string;
  assignedEmployeeId: string | null;
};

function seedLocationId(patient: Patient): string {
  return mockClinicLocations.find((l) => patient.location.includes(l.city))?.id ?? '';
}

let _state: Map<string, PatientLocationState> = new Map(
  mockPatients.map((p) => [p.id, { locationId: seedLocationId(p), assignedEmployeeId: p.assignedEmployeeId ?? null }])
);

const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export function getLocationState(patientId: string): PatientLocationState {
  return _state.get(patientId) ?? { locationId: '', assignedEmployeeId: null };
}

export function getLocationOverrides(): Map<string, PatientLocationState> {
  return _state;
}

export function transferPatient(patientId: string, toLocationId: string, newPhysioId: string | null): void {
  const current = getLocationState(patientId);
  const toLocation = mockClinicLocations.find((l) => l.id === toLocationId);
  if (!toLocation) return;

  const assignedEmployeeId = newPhysioId
    ?? (current.assignedEmployeeId && toLocation.employeeIds.includes(current.assignedEmployeeId) ? current.assignedEmployeeId : null);

  _state = new Map(_state).set(patientId, { locationId: toLocationId, assignedEmployeeId });
  notify();
}

export function useLocationState(patientId: string): PatientLocationState {
  const [state, setState] = useState<PatientLocationState>(() => getLocationState(patientId));

  useEffect(() => {
    setState(getLocationState(patientId));
    const listener = () => setState(getLocationState(patientId));
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, [patientId]);

  return state;
}

export function useLocationOverrides(): Map<string, PatientLocationState> {
  const [overrides, setOverrides] = useState<Map<string, PatientLocationState>>(() => getLocationOverrides());

  useEffect(() => {
    const listener = () => setOverrides(getLocationOverrides());
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  return overrides;
}

export function getEffectiveLocationString(patient: Patient, overrides: Map<string, PatientLocationState>): string {
  const locationId = overrides.get(patient.id)?.locationId;
  const loc = locationId ? mockClinicLocations.find((l) => l.id === locationId) : null;
  if (!loc) return patient.location;
  return `${loc.city}, ${loc.regionCountry.split(',')[0].trim()}`;
}

export function getEffectiveAssignedEmployeeId(patient: Patient, overrides: Map<string, PatientLocationState>): string | null {
  return overrides.get(patient.id)?.assignedEmployeeId ?? patient.assignedEmployeeId ?? null;
}

export function getEffectivePatientIdsForEmployee(employee: Employee, overrides: Map<string, PatientLocationState>): string[] {
  const ids = new Set(employee.patientIds);
  for (const [patientId, state] of overrides) {
    const wasOriginallyAssigned = employee.patientIds.includes(patientId);
    const isNowAssigned = state.assignedEmployeeId === employee.id;
    if (isNowAssigned) ids.add(patientId);
    else if (wasOriginallyAssigned) ids.delete(patientId);
  }
  return [...ids];
}
