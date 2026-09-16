'use client';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

/** Floating, collapsible parameters card that sits over the bottom-left of an exercise animation, matching Figma node 2721:15240. */
export function ParametersCard({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="absolute bottom-3 left-3 w-[280px] rounded-lg border border-secondary bg-secondary_alt shadow-[0px_0px_5px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between pl-3">
        <span className="text-base text-primary">Parameters</span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse parameters' : 'Expand parameters'}
          className="flex size-12 shrink-0 items-center justify-center rounded-full border-none bg-transparent text-primary cursor-pointer transition-colors hover:bg-primary_hover"
        >
          {expanded ? <Minus size={24} /> : <Plus size={24} />}
        </button>
      </div>
      {expanded && (
        <div className="flex flex-col gap-2 px-2 pb-2">
          {children}
        </div>
      )}
    </div>
  );
}
