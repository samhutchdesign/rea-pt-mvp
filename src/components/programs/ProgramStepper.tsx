'use client';
import { Check } from 'lucide-react';
import { cx } from '@/utils/cx';

interface ProgramStepperProps {
  steps: string[];
  currentStep: number;
  maxReachedStep: number;
  onStepClick: (step: number) => void;
}

export function ProgramStepper({ steps, currentStep, maxReachedStep, onStepClick }: ProgramStepperProps) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-4 border-b border-secondary shrink-0">
      {steps.map((label, i) => {
        const isActive = i === currentStep;
        const isComplete = i < currentStep;
        const isReachable = i <= maxReachedStep && i !== currentStep;
        return (
          <div key={label} className="flex items-center gap-3">
            {i > 0 && <span className="h-px w-10 bg-border-secondary" />}
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(i)}
              className={cx(
                'flex items-center gap-2 bg-transparent border-none p-0',
                isReachable ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <span
                className={cx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-600'
                    : isComplete
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-secondary_alt text-quaternary'
                )}
              >
                {isComplete ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cx(
                  'text-sm',
                  isActive ? 'font-semibold text-primary' : isComplete ? 'font-medium text-secondary' : 'text-quaternary'
                )}
              >
                {label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
