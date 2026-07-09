import { cx } from '@/utils/cx';

interface DividerProps { className?: string; vertical?: boolean; }

export const Divider = ({ className, vertical }: DividerProps) =>
  vertical
    ? <div className={cx('w-px self-stretch bg-border-secondary', className)} />
    : <div className={cx('h-px w-full bg-border-secondary', className)} />;
