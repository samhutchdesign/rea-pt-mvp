'use client';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '@/utils/cx';

interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  className?: string;
  wrapperClassName?: string;
  children: ReactNode;
}

export function NativeSelect({ className, wrapperClassName, children, ...props }: NativeSelectProps) {
  return (
    <div className={cx('relative', wrapperClassName)}>
      <select
        {...props}
        className={cx(
          'w-full appearance-none rounded-lg border border-secondary bg-primary pl-3 pr-8 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300',
          className
        )}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary" />
    </div>
  );
}
