import { useEffect, useRef, useState } from 'react';

const ADD_TO_CHART_DELAY_MS = 3000;

/** Stubbed "AI processing" delay before the section boxes actually get filled in. */
export function useAddToChart(onApply: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const run = () => {
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      onApply();
      setIsLoading(false);
    }, ADD_TO_CHART_DELAY_MS);
  };

  return { isLoading, run };
}
