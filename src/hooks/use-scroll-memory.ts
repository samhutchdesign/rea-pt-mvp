'use client';
import { useEffect } from 'react';

const PREFIX = 'scrollY:';

export function useScrollMemory() {
  useEffect(() => {
    const key = PREFIX + window.location.pathname + window.location.search;
    const saved = sessionStorage.getItem(key);
    if (saved === null) return;
    sessionStorage.removeItem(key);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo(0, Number(saved));
    }));
  }, []);
}

export function saveScrollPosition() {
  const key = PREFIX + window.location.pathname + window.location.search;
  sessionStorage.setItem(key, String(window.scrollY));
}
