import { useEffect, useRef, useState } from 'react';

/** Stubbed voice dictation — no real speech recognition, just a listening timer that appends a placeholder transcript (caller-supplied) on stop. */
export function useDictation(onAppend: (text: string) => void, stubText: string) {
  const [dictating, setDictating] = useState(false);
  const [dictSecs, setDictSecs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const toggle = () => {
    if (dictating) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDictating(false);
      onAppend(stubText);
    } else {
      setDictating(true);
      setDictSecs(0);
      timerRef.current = setInterval(() => setDictSecs((s) => s + 1), 1000);
    }
  };

  return { dictating, dictSecs, toggle };
}
