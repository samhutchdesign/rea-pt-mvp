'use client';
import { useState, useEffect } from 'react';

export type StaffPersona = 'emp2' | 'emp_user2' | 'emp_user3' | 'emp_staff';

let _persona: StaffPersona = 'emp2';
const _listeners = new Set<(p: StaffPersona) => void>();

export function getStaffPersona(): StaffPersona {
  return _persona;
}

export function setStaffPersona(p: StaffPersona) {
  _persona = p;
  _listeners.forEach((l) => l(p));
}

export function useStaffPersona(): StaffPersona {
  const [persona, setPersona] = useState<StaffPersona>(_persona);
  useEffect(() => {
    const listener = (p: StaffPersona) => setPersona(p);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return persona;
}
