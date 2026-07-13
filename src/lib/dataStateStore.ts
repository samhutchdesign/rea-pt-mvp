import { useState, useEffect } from 'react';

export type DataState = 'filled' | 'empty';

let _state: DataState = 'filled';
const _listeners = new Set<(s: DataState) => void>();

export function getDataState(): DataState { return _state; }

export function setDataState(s: DataState) {
  _state = s;
  _listeners.forEach((l) => l(s));
}

export function useDataState(): DataState {
  const [state, setState] = useState<DataState>(_state);
  useEffect(() => {
    _listeners.add(setState);
    return () => { _listeners.delete(setState); };
  }, []);
  return state;
}
