'use client';
import { cx } from '@/utils/cx';

interface ProgramStepperProps {
  steps: string[];
  currentStep: number;
  maxReachedStep: number;
  onStepClick: (step: number) => void;
}

export function ProgramStepper({ steps, currentStep, maxReachedStep, onStepClick }: ProgramStepperProps) {
  return (
    <div className="flex items-center justify-center gap-5">
      {steps.map((label, i) => {
        const isActive = i === currentStep;
        const isComplete = i < currentStep;
        const isReachable = i <= maxReachedStep && i !== currentStep;
        return (
          <div key={label} className="flex items-center gap-5">
            {i > 0 && <span className="h-px w-10 bg-border-secondary shrink-0" />}
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(i)}
              className={cx('flex items-center gap-[11px] bg-transparent border-none p-0', isReachable ? 'cursor-pointer' : 'cursor-default')}
            >
              <span className={cx(
                'flex size-7 shrink-0 items-center justify-center rounded-full font-display text-md font-medium tracking-[0.1px]',
                isActive ? 'bg-[#eef6f2] border border-[#8fb4a2] text-brand-700'
                  : isComplete ? 'bg-brand-100 text-brand-600'
                    : 'bg-secondary text-tertiary'
              )}>
                {i + 1}
              </span>
              <span className={cx(
                'text-base',
                isActive ? 'font-medium text-brand-700' : isComplete ? 'font-normal text-primary' : 'font-normal text-tertiary'
              )}>
                {label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
