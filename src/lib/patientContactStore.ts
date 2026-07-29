'use client';
import { useState, useEffect } from 'react';
import type { Patient } from './types';

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

let _state: Map<string, ContactInfo> = new Map();

const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export function getContactInfo(patientId: string): ContactInfo | undefined {
  return _state.get(patientId);
}

export function setContactInfo(patientId: string, info: ContactInfo): void {
  _state = new Map(_state).set(patientId, info);
  notify();
}

export function useContactOverrides(): Map<string, ContactInfo> {
  const [overrides, setOverrides] = useState<Map<string, ContactInfo>>(() => _state);

  useEffect(() => {
    const listener = () => setOverrides(_state);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  return overrides;
}

export function getEffectiveContactInfo(patient: Patient, overrides: Map<string, ContactInfo>): ContactInfo {
  return overrides.get(patient.id) ?? {
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    address: patient.address,
  };
}
