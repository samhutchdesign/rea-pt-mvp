'use client';
import { useState, useEffect } from 'react';

let _orgId: string = 'clinic1';
const _listeners = new Set<(id: string) => void>();

export function getOrgId(): string {
  return _orgId;
}

export function setOrgId(id: string) {
  _orgId = id;
  _listeners.forEach((l) => l(id));
}

export function useOrgId(): string {
  const [id, setId] = useState<string>(_orgId);
  useEffect(() => {
    const listener = (v: string) => setId(v);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return id;
}
