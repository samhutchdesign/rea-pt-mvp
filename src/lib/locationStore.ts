'use client';
import { useState, useEffect } from 'react';

let _locationId: string = 'all';
const _listeners = new Set<(id: string) => void>();

export function getLocationId(): string {
  return _locationId;
}

export function setLocationId(id: string) {
  _locationId = id;
  _listeners.forEach((l) => l(id));
}

export function useLocationId(): string {
  const [id, setId] = useState<string>(_locationId);
  useEffect(() => {
    const listener = (v: string) => setId(v);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return id;
}
