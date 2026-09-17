'use client';
import { cx } from '@/utils/cx';

/**
 * Shared abstract visual for the dilator exercises — a top-down line drawing
 * of the vaginal opening (matching the hand-drawn reference diagrams) with a
 * faint dashed trace of the exercise's full stretch pattern always visible,
 * plus a solid dot that animates to the current phase's position. Unlike the
 * pelvic-floor circle exercises (which animate scale/rise of a fixed shape),
 * these exercises are about *direction*, so the moving part is a point
 * traveling to different positions rather than a shape changing size.
 */
export function DilatorVisual({
  x,
  y,
  scale = 1,
  tracePaths,
  transitionMs = 500,
  transitionTiming = 'ease-in-out',
  rings = false,
  className,
  children,
}: {
  /** Dot position, 0-100 in each axis (SVG viewBox units). */
  x: number;
  y: number;
  /** Dot scale — used for the brief contract/relax pulse in the 3-Point Stretch. */
  scale?: number;
  /** Full-pattern reference paths (SVG path `d` strings) traced faintly in the background. */
  tracePaths: string[];
  transitionMs?: number;
  /** CSS timing function for the dot's move. `linear` reads better for a curve made of many short hops (e.g. Half U) — easing each tiny hop stutters. */
  transitionTiming?: string;
  /** Draw the lighter concentric rings (matching the pelvic-floor circle exercises) around the dot, all shrinking/growing together with it — used for the 3-Point Stretch's contract/relax pulse. */
  rings?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cx('relative overflow-hidden bg-secondary_alt', className)}>
      {/*
        preserveAspectRatio="none" makes the viewBox map directly and
        linearly onto 0-100% of the container in each axis, with no
        letterboxing — matching the dot below (a plain HTML div positioned
        with left/top percentages of the same container). If the SVG instead
        preserved aspect ratio, it would render as a centered, letterboxed
        square inside this 16:9 box, and its coordinates would no longer
        line up with the dot's percentage-based position. rx is compensated
        smaller than ry to counteract the resulting horizontal stretch so
        the ellipse still reads as a tall oval on screen.
      */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {tracePaths.map((d, i) => (
          <path key={i} d={d} fill="none" className="stroke-brand-200" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        ))}
        <ellipse cx="50" cy="50" rx="14" ry="32" fill="none" className="stroke-brand-300" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div
        className="absolute"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          transition: `left ${transitionMs}ms ${transitionTiming}, top ${transitionMs}ms ${transitionTiming}`,
        }}
      >
        <div
          className="relative size-8"
          style={{ transform: `scale(${scale})`, transition: `transform ${transitionMs}ms ${transitionTiming}` }}
        >
          {rings && <div className="absolute inset-0 m-auto size-8 rounded-full bg-brand-100" />}
          {rings && <div className="absolute inset-0 m-auto size-6 rounded-full bg-brand-300" />}
          <div className="absolute inset-0 m-auto size-4 rounded-full bg-brand-600" />
        </div>
      </div>
      {children}
    </div>
  );
}
