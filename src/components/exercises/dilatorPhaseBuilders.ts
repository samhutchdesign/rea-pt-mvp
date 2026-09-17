export interface DilatorPhase {
  /** Label shown to the practitioner while this phase is active (e.g. "Stretch", "Hold"). */
  label: string;
  /** Dot position, 0-100 in each axis. */
  x: number;
  y: number;
  /** Dot scale — used for the brief contract/relax pulse in the 3-Point Stretch. */
  scale?: number;
  durationMs: number;
  /** Which direction/side this phase belongs to (e.g. "Left", "8 o'clock"), shown separately from `label`. */
  stepName?: string;
  /** Rep progress within the current direction (e.g. "3 of 10"). */
  repText?: string;
}

function cubicPoint(p0: { x: number; y: number }, c1: { x: number; y: number }, c2: { x: number; y: number }, p3: { x: number; y: number }, t: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p3.y,
  };
}

// J Curve: from a resting point at the entrance, a short straight rise to a
// cusp partway up, where both sides' curves meet and hook sharply outward
// and down, flattening to a near-horizontal tangent at the exit — literally
// tracing the shape of a "J" (a straight stem, then a hook) rather than a
// shallow diagonal.
const J_CENTER = { x: 50, y: 55 };
const J_CUSP = { x: 50, y: 36 };
const J_CURVE_SIDES = {
  left: { c1: { x: 48, y: 66 }, c2: { x: 2, y: 80 }, out: { x: 0, y: 83 } },
  right: { c1: { x: 52, y: 66 }, c2: { x: 98, y: 80 }, out: { x: 100, y: 83 } },
} as const;
const J_STEPS = 24;

function jCurveSidePoints(side: 'left' | 'right') {
  const { c1, c2, out } = J_CURVE_SIDES[side];
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= J_STEPS; i++) {
    points.push(cubicPoint(J_CUSP, c1, c2, out, i / J_STEPS));
  }
  return points; // [0] is the cusp, [J_STEPS] is the outward end point.
}

const J_CURVE_SIDE_POINTS = { left: jCurveSidePoints('left'), right: jCurveSidePoints('right') };

export const THREE_POINT_POINTS = {
  center: { x: 50, y: 45 },
  eight: { x: 33, y: 68 },
  four: { x: 67, y: 68 },
  six: { x: 50, y: 90 },
};

// The trace is a true ellipse concentric with the main oval in DilatorVisual
// (same cx/cy/ry — only rx differs, wider) rather than a hand-drawn curve.
// Sharing cy/ry means the trace's top and bottom points are mathematically
// identical to the oval's own top and bottom vertex, so the two lines meet
// exactly there and stay a consistent distance apart along the way, reading
// as "directly alongside" the oval instead of an arbitrary bulge.
const OVAL = { cx: 50, cy: 50, ry: 32 };
const HALF_U_RX = 19; // wider than the oval's own rx (14) — the outward gap

function ellipsePoint(angleDeg: number, rx: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: OVAL.cx + rx * Math.cos(rad), y: OVAL.cy + OVAL.ry * Math.sin(rad) };
}

export const HALF_U_POINTS = {
  top: { x: OVAL.cx, y: OVAL.cy - OVAL.ry },
  bottom: { x: OVAL.cx, y: OVAL.cy + OVAL.ry },
};

// Finely-sampled waypoints along the left/right half of the trace ellipse,
// walking from top (270°) down through the side (180°/0°) to bottom (90°).
// The dot's CSS transition only moves in straight lines between waypoints,
// so a handful of points reads as a faceted polygon — sampling many small
// steps instead makes each hop short enough that the path reads as one
// smooth curve hugging the ellipse rather than a jointed line.
const HALF_U_STEPS = 30;

function halfUSidePoints(direction: 'left' | 'right') {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= HALF_U_STEPS; i++) {
    const t = i / HALF_U_STEPS;
    const angle = direction === 'left' ? 270 - 180 * t : 270 + 180 * t;
    points.push(ellipsePoint(angle, HALF_U_RX));
  }
  return points; // [0] is the top vertex, [HALF_U_STEPS] is the bottom vertex.
}

const HALF_U_SIDE_POINTS = { left: halfUSidePoints('left'), right: halfUSidePoints('right') };

export const J_CURVE_TRACES = [
  `M ${J_CENTER.x} ${J_CENTER.y} L ${J_CUSP.x} ${J_CUSP.y}`,
  `M ${J_CUSP.x} ${J_CUSP.y} C ${J_CURVE_SIDES.left.c1.x} ${J_CURVE_SIDES.left.c1.y} ${J_CURVE_SIDES.left.c2.x} ${J_CURVE_SIDES.left.c2.y} ${J_CURVE_SIDES.left.out.x} ${J_CURVE_SIDES.left.out.y}`,
  `M ${J_CUSP.x} ${J_CUSP.y} C ${J_CURVE_SIDES.right.c1.x} ${J_CURVE_SIDES.right.c1.y} ${J_CURVE_SIDES.right.c2.x} ${J_CURVE_SIDES.right.c2.y} ${J_CURVE_SIDES.right.out.x} ${J_CURVE_SIDES.right.out.y}`,
];

export const THREE_POINT_TRACES = [
  `M ${THREE_POINT_POINTS.center.x} ${THREE_POINT_POINTS.center.y} L ${THREE_POINT_POINTS.eight.x} ${THREE_POINT_POINTS.eight.y}`,
  `M ${THREE_POINT_POINTS.center.x} ${THREE_POINT_POINTS.center.y} L ${THREE_POINT_POINTS.four.x} ${THREE_POINT_POINTS.four.y}`,
  `M ${THREE_POINT_POINTS.center.x} ${THREE_POINT_POINTS.center.y} L ${THREE_POINT_POINTS.six.x} ${THREE_POINT_POINTS.six.y}`,
];

// A single elliptical-arc command draws an exact half-ellipse — sweep-flag 0
// goes top-to-bottom via the left side, 1 via the right side.
export const HALF_U_TRACES = [
  `M ${HALF_U_POINTS.top.x} ${HALF_U_POINTS.top.y} A ${HALF_U_RX} ${OVAL.ry} 0 0 0 ${HALF_U_POINTS.bottom.x} ${HALF_U_POINTS.bottom.y}`,
  `M ${HALF_U_POINTS.top.x} ${HALF_U_POINTS.top.y} A ${HALF_U_RX} ${OVAL.ry} 0 0 1 ${HALF_U_POINTS.bottom.x} ${HALF_U_POINTS.bottom.y}`,
];

/**
 * J Curve: from the entrance, a short straight rise then a sharp outward
 * hook to each side (like opening curtains) and hold, done for `reps` on
 * the left, then `reps` on the right.
 */
export function buildJCurvePhases(speedSecs: number, holdSecs: number, reps: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const stemMs = moveMs * 0.25;
  const legMs = (moveMs - stemMs) / J_STEPS;
  const phases: DilatorPhase[] = [];
  for (const { key, side } of [{ key: 'left', side: 'Left' }, { key: 'right', side: 'Right' }] as const) {
    const points = J_CURVE_SIDE_POINTS[key];
    for (let i = 1; i <= Math.max(reps, 1); i++) {
      const repText = `${i} of ${reps}`;
      // Straight rise from center to the cusp, then walk out along the hook
      // one fine step at a time (matching the static trace exactly), hold
      // at the end, then retrace the whole path back to center.
      phases.push({ label: 'Stretch', x: J_CUSP.x, y: J_CUSP.y, durationMs: stemMs, stepName: side, repText });
      for (let s = 1; s <= J_STEPS; s++) {
        phases.push({ label: 'Stretch', x: points[s].x, y: points[s].y, durationMs: legMs, stepName: side, repText });
      }
      phases.push({ label: 'Hold', x: points[J_STEPS].x, y: points[J_STEPS].y, durationMs: holdMs, stepName: side, repText });
      for (let s = J_STEPS - 1; s >= 0; s--) {
        phases.push({ label: 'Return', x: points[s].x, y: points[s].y, durationMs: legMs, stepName: side, repText });
      }
      phases.push({ label: 'Return', x: J_CENTER.x, y: J_CENTER.y, durationMs: stemMs, stepName: side, repText });
    }
  }
  return phases;
}

/**
 * 3-Point Stretch (Peace Sign): a brief contract/relax pulse, then stretch
 * out to 8 o'clock, 4 o'clock, and 6 o'clock in turn, holding each — one
 * full rotation through all three points counts as one rep.
 */
// The dot rests at a larger-than-normal size between stretches so the
// contract pulse has real room to shrink from — a bigger drop reads as a
// much more visible squeeze than dipping from the plain default size.
const REST_SCALE = 1.6;
const CONTRACT_SCALE = 0.7;

export function build3PointPhases(speedSecs: number, holdSecs: number, reps: number, contractSecs = 0.35): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const pulseMs = Math.max(contractSecs, 0.05) * 1000;
  const { center, eight, four, six } = THREE_POINT_POINTS;
  const points = [
    { side: '8 o’clock', pos: eight },
    { side: '4 o’clock', pos: four },
    { side: '6 o’clock', pos: six },
  ];
  const phases: DilatorPhase[] = [];
  for (let i = 1; i <= Math.max(reps, 1); i++) {
    const repText = `${i} of ${reps}`;
    for (const { side, pos } of points) {
      phases.push({ label: 'Contract', x: center.x, y: center.y, scale: CONTRACT_SCALE, durationMs: pulseMs, stepName: side, repText });
      phases.push({ label: 'Relax', x: center.x, y: center.y, scale: REST_SCALE, durationMs: pulseMs, stepName: side, repText });
      phases.push({ label: 'Stretch', x: pos.x, y: pos.y, scale: REST_SCALE, durationMs: moveMs, stepName: side, repText });
      phases.push({ label: 'Hold', x: pos.x, y: pos.y, scale: REST_SCALE, durationMs: holdMs, stepName: side, repText });
      phases.push({ label: 'Return', x: center.x, y: center.y, scale: REST_SCALE, durationMs: moveMs, stepName: side, repText });
    }
  }
  return phases;
}

/**
 * Half U: a continuous stretch from the top of the entrance down toward the
 * bottom and back, alternating sides each rep, with an optional brief hold
 * at the top before switching sides.
 */
export function buildHalfUPhases(speedSecs: number, reps: number, holdSecs = 0): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const legMs = moveMs / HALF_U_STEPS;
  const holdMs = Math.max(holdSecs, 0) * 1000;
  const { top } = HALF_U_POINTS;
  const phases: DilatorPhase[] = [];
  for (let i = 1; i <= Math.max(reps, 1); i++) {
    const repText = `${i} of ${reps}`;
    const side = i % 2 === 1 ? 'Left' : 'Right';
    const points = i % 2 === 1 ? HALF_U_SIDE_POINTS.left : HALF_U_SIDE_POINTS.right;
    // Walk out along the curve (top -> ... -> bottom) one fine step at a
    // time, so the dot approximates the same elliptical arc as the static
    // trace, then retrace the same steps back up to top instead of cutting
    // straight through the middle.
    for (let s = 1; s <= HALF_U_STEPS; s++) {
      phases.push({ label: 'Stretch', x: points[s].x, y: points[s].y, durationMs: legMs, stepName: side, repText });
    }
    for (let s = HALF_U_STEPS - 1; s >= 0; s--) {
      phases.push({ label: 'Return', x: points[s].x, y: points[s].y, durationMs: legMs, stepName: side, repText });
    }
    if (holdMs > 0) {
      phases.push({ label: 'Hold', x: top.x, y: top.y, durationMs: holdMs, stepName: side, repText });
    }
  }
  return phases;
}
