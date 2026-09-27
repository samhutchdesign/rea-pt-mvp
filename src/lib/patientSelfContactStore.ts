'use client';
import { useState, useEffect } from 'react';
import type { Patient } from './types';

/**
 * Contact info the *patient* has edited from their own portal.
 *
 * This is intentionally a separate store from `patientContactStore` (which
 * holds edits a PT/staff member makes on the patient's behalf from the
 * clinic-facing side). Keeping them separate means a patient updating their
 * own phone/email/address here does NOT show up on the PT-facing contact
 * page — matching the requirement that this input is patient-side only for
 * now. If the two sides need to merge later, that's a deliberate product
 * decision, not an accident of shared state.
 */
export interface PatientSelfContactInfo {
  email: string;
  phone: string;
  address: string;
}

let _state: Map<string, PatientSelfContactInfo> = new Map();

const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export function setPatientSelfContactInfo(patientId: string, info: PatientSelfContactInfo): void {
  _state = new Map(_state).set(patientId, info);
  notify();
}

export function usePatientSelfContactOverrides(): Map<string, PatientSelfContactInfo> {
  const [overrides, setOverrides] = useState<Map<string, PatientSelfContactInfo>>(() => _state);

  useEffect(() => {
    const listener = () => setOverrides(_state);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  return overrides;
}

export function getEffectivePatientSelfContactInfo(
  patient: Patient,
  overrides: Map<string, PatientSelfContactInfo>
): PatientSelfContactInfo {
  return overrides.get(patient.id) ?? {
    email: patient.email,
    phone: patient.phone,
    address: patient.address,
  };
}
