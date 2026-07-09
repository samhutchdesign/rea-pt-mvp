'use client';
import { cx } from '@/utils/cx';

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  color?: 'brand' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md';
  label?: string;
}

const colorMap = { brand: 'bg-brand-600', success: 'bg-utility-green-500', error: 'bg-utility-red-500', warning: 'bg-utility-yellow-500' };
const sizeMap = { sm: 'h-1.5', md: 'h-2' };

export const Progress = ({ value, className, color = 'brand', size = 'md', label }: ProgressProps) => (
  <div className={cx('flex flex-col gap-1.5 w-full', className)}>
    {label && <span className="text-xs text-tertiary">{label}</span>}
    <div className={cx('w-full rounded-full bg-secondary', sizeMap[size])}>
      <div
        className={cx('rounded-full transition-all duration-300', sizeMap[size], colorMap[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);
