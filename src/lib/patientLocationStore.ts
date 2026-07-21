'use client';
import { useState, useEffect } from 'react';
import { mockPatients, mockClinicLocations } from './mock-data';
import type { Patient, Employee } from './types';

export type PatientLocationState = {
  locationId: string;
  assignedEmployeeIds: string[];
};

function seedLocationId(patient: Patient): string {
  return mockClinicLocations.find((l) => patient.location.includes(l.city))?.id ?? '';
}

let _state: Map<string, PatientLocationState> = new Map(
  mockPatients.map((p) => [p.id, { locationId: seedLocationId(p), assignedEmployeeIds: p.assignedEmployeeIds }])
);

const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export function getLocationState(patientId: string): PatientLocationState {
  return _state.get(patientId) ?? { locationId: '', assignedEmployeeIds: [] };
}

export function getLocationOverrides(): Map<string, PatientLocationState> {
  return _state;
}

export function transferPatient(patientId: string, toLocationId: string, newPhysioId: string | null): void {
  const current = getLocationState(patientId);
  const toLocation = mockClinicLocations.find((l) => l.id === toLocationId);
  if (!toLocation) return;

  const retained = current.assignedEmployeeIds.filter((empId) => toLocation.employeeIds.includes(empId));
  const assignedEmployeeIds = newPhysioId && !retained.includes(newPhysioId)
    ? [...retained, newPhysioId]
    : retained;

  _state = new Map(_state).set(patientId, { locationId: toLocationId, assignedEmployeeIds });
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

export function getEffectiveAssignedEmployeeIds(patient: Patient, overrides: Map<string, PatientLocationState>): string[] {
  return overrides.get(patient.id)?.assignedEmployeeIds ?? patient.assignedEmployeeIds;
}

export function getEffectivePatientIdsForEmployee(employee: Employee, overrides: Map<string, PatientLocationState>): string[] {
  const ids = new Set(employee.patientIds);
  for (const [patientId, state] of overrides) {
    const wasOriginallyAssigned = employee.patientIds.includes(patientId);
    const isNowAssigned = state.assignedEmployeeIds.includes(employee.id);
    if (isNowAssigned) ids.add(patientId);
    else if (wasOriginallyAssigned) ids.delete(patientId);
  }
  return [...ids];
}
