'use client';
import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';

type AlertType = 'info' | 'success' | 'warning' | 'error';

const styles: Record<AlertType, { root: string; icon: string }> = {
  info:    { root: 'bg-utility-brand-50 border-utility-brand-200 text-utility-brand-700',  icon: 'text-utility-brand-500' },
  success: { root: 'bg-utility-green-50 border-utility-green-200 text-utility-green-700', icon: 'text-utility-green-500' },
  warning: { root: 'bg-utility-yellow-50 border-utility-yellow-200 text-utility-yellow-700', icon: 'text-utility-yellow-500' },
  error:   { root: 'bg-utility-red-50 border-utility-red-200 text-utility-red-700',   icon: 'text-utility-red-500' },
};

interface AlertProps { type?: AlertType; children: ReactNode; className?: string; }

export const Alert = ({ type = 'info', children, className }: AlertProps) => (
  <div className={cx('flex gap-3 rounded-xl border px-4 py-3 text-sm', styles[type].root, className)}>
    {children}
  </div>
);
