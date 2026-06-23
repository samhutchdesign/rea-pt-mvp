import { useState, useEffect } from 'react';

type PaletteMode = 'light' | 'dark';

let _mode: PaletteMode = 'light';
const _listeners = new Set<(m: PaletteMode) => void>();

export function getThemeMode(): PaletteMode {
  return _mode;
}

export function setThemeMode(mode: PaletteMode) {
  _mode = mode;
  _listeners.forEach((l) => l(mode));
}

export function useThemeMode(): PaletteMode {
  const [mode, setModeState] = useState<PaletteMode>(_mode);
  useEffect(() => {
    const listener = (m: PaletteMode) => setModeState(m);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return mode;
}
