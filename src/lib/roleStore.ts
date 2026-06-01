import { useState, useEffect } from 'react';
import type { UserRole } from './types';

let _role: UserRole = 'owner';
const _listeners = new Set<(r: UserRole) => void>();

export function getRole(): UserRole {
  return _role;
}

export function setRole(role: UserRole) {
  _role = role;
  _listeners.forEach((l) => l(role));
}

export function useRole(): UserRole {
  const [role, setRoleState] = useState<UserRole>(_role);
  useEffect(() => {
    const listener = (r: UserRole) => setRoleState(r);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return role;
}
