import { cx } from '@/utils/cx';

interface LockIconProps {
  className?: string;
  size?: number;
  /** Force the lock body filled (e.g. the selected/active row). Shackle always stays stroke-only. */
  filled?: boolean;
  /** Fill the body on hover of the nearest `group` ancestor, when not already `filled`. */
  hoverFill?: boolean;
}

const STROKE = '#141313';

export function LockIcon({ className, size = 24, filled = false, hoverFill = false }: LockIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke={STROKE} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z"
        className={cx(filled ? 'fill-current' : 'fill-none', hoverFill && !filled && 'group-hover:fill-current')}
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UnlockIcon({ className, size = 24, filled = false, hoverFill = false }: LockIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7 11V7.00003C6.99875 5.76008 7.45828 4.5639 8.28937 3.6437C9.12047 2.7235 10.2638 2.14493 11.4975 2.02032C12.7312 1.89571 13.9671 2.23393 14.9655 2.96934C15.9638 3.70475 16.6533 4.78488 16.9 6.00003" stroke={STROKE} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 11H19C20.1046 11 21 11.8955 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8955 3.89543 11 5 11Z"
        className={cx(filled ? 'fill-current' : 'fill-none', hoverFill && !filled && 'group-hover:fill-current')}
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
