'use client';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cx } from '@/utils/cx';

export interface ParametersCardTab {
  label: string;
  content: React.ReactNode;
}

interface ParametersCardProps {
  /** Always-visible content above the tabs (or the whole list, if no tabs). */
  children?: React.ReactNode;
  /** When set, renders a tab switcher below `children` instead of one long list. */
  tabs?: ParametersCardTab[];
}

/** Floating, collapsible parameters card that sits over the bottom-left of an exercise animation, matching Figma node 2721:15240. */
export function ParametersCard({ children, tabs }: ParametersCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

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
          {tabs && (
            <>
              <div className="flex gap-1 rounded-lg bg-primary p-1">
                {tabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={cx(
                      'flex-1 rounded-md py-1.5 text-xs cursor-pointer border-none transition-colors',
                      i === activeTab ? 'bg-secondary_alt text-primary font-medium' : 'bg-transparent text-secondary hover:text-primary'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {tabs[activeTab]?.content}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
