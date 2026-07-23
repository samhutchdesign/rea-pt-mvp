import { useState, useEffect } from 'react';

export type ViewMode = 'full' | 'mvp';

let _mode: ViewMode = 'mvp';
const _listeners = new Set<(m: ViewMode) => void>();

export function getViewMode(): ViewMode {
  return _mode;
}

export function setViewMode(mode: ViewMode) {
  _mode = mode;
  _listeners.forEach((l) => l(mode));
}

export function useViewMode(): ViewMode {
  const [mode, setModeState] = useState<ViewMode>(_mode);
  useEffect(() => {
    const listener = (m: ViewMode) => setModeState(m);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return mode;
}
