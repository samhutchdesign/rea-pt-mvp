'use client';
import type { TextareaHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  className?: string;
}

export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      {...props}
      className={cx(
        'w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300',
        className
      )}
    />
  );
}
