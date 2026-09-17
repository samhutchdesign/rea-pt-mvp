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

// Shared anchor points, reused by both the dot's phase waypoints and the
// DilatorVisual's static background trace so the animated dot visually
// follows the printed path. Kept to x >= ~48 — the floating Parameters card
// is pinned bottom-left over the animation (see ParametersCard) and covers
// roughly the left 46% of the frame, so anything further left would be
// hidden behind it for the entire "Left"/"8 o'clock" side of each exercise.
export const J_CURVE_POINTS = {
  center: { x: 75, y: 84 },
  left: { mid: { x: 64, y: 60 }, out: { x: 58, y: 55 } },
  right: { mid: { x: 86, y: 60 }, out: { x: 92, y: 55 } },
};

export const THREE_POINT_POINTS = {
  center: { x: 75, y: 45 },
  eight: { x: 58, y: 68 },
  four: { x: 92, y: 68 },
  six: { x: 75, y: 90 },
};

// The trace is a true ellipse concentric with the main oval in DilatorVisual
// (same cx/cy/ry — only rx differs, wider) rather than a hand-drawn curve.
// Sharing cy/ry means the trace's top and bottom points are mathematically
// identical to the oval's own top and bottom vertex, so the two lines meet
// exactly there and stay a consistent distance apart along the way, reading
// as "directly alongside" the oval instead of an arbitrary bulge.
const OVAL = { cx: 75, cy: 50, ry: 32 };
const HALF_U_RX = 24; // wider than the oval's own rx (14) — the outward gap

function ellipsePoint(angleDeg: number, rx: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: OVAL.cx + rx * Math.cos(rad), y: OVAL.cy + OVAL.ry * Math.sin(rad) };
}

export const HALF_U_POINTS = {
  top: { x: OVAL.cx, y: OVAL.cy - OVAL.ry },
  bottom: { x: OVAL.cx, y: OVAL.cy + OVAL.ry },
  // Waypoints along the left/right half of the trace ellipse, walking from
  // top (270°) down through the side (180°/0°) to bottom (90°).
  left: [ellipsePoint(225, HALF_U_RX), ellipsePoint(180, HALF_U_RX), ellipsePoint(135, HALF_U_RX)],
  right: [ellipsePoint(315, HALF_U_RX), ellipsePoint(0, HALF_U_RX), ellipsePoint(45, HALF_U_RX)],
};

export const J_CURVE_TRACES = [
  `M ${J_CURVE_POINTS.center.x} ${J_CURVE_POINTS.center.y} Q ${J_CURVE_POINTS.left.mid.x} ${J_CURVE_POINTS.left.mid.y} ${J_CURVE_POINTS.left.out.x} ${J_CURVE_POINTS.left.out.y}`,
  `M ${J_CURVE_POINTS.center.x} ${J_CURVE_POINTS.center.y} Q ${J_CURVE_POINTS.right.mid.x} ${J_CURVE_POINTS.right.mid.y} ${J_CURVE_POINTS.right.out.x} ${J_CURVE_POINTS.right.out.y}`,
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
 * J Curve: from the entrance, curve/tilt out to each side (like opening
 * curtains) and hold, done for `reps` on the left, then `reps` on the right.
 */
export function buildJCurvePhases(speedSecs: number, holdSecs: number, reps: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const { center, left, right } = J_CURVE_POINTS;
  const phases: DilatorPhase[] = [];
  for (const { side, mid, out } of [{ side: 'Left', ...left }, { side: 'Right', ...right }] as const) {
    for (let i = 1; i <= Math.max(reps, 1); i++) {
      const repText = `${i} of ${reps}`;
      phases.push({ label: 'Stretch', x: mid.x, y: mid.y, durationMs: moveMs * 0.4, stepName: side, repText });
      phases.push({ label: 'Stretch', x: out.x, y: out.y, durationMs: moveMs * 0.6, stepName: side, repText });
      phases.push({ label: 'Hold', x: out.x, y: out.y, durationMs: holdMs, stepName: side, repText });
      phases.push({ label: 'Return', x: center.x, y: center.y, durationMs: moveMs, stepName: side, repText });
    }
  }
  return phases;
}

/**
 * 3-Point Stretch (Peace Sign): a brief contract/relax pulse, then stretch
 * out to 8 o'clock, 4 o'clock, and 6 o'clock in turn, holding each — one
 * full rotation through all three points counts as one rep.
 */
export function build3PointPhases(speedSecs: number, holdSecs: number, reps: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const pulseMs = 350;
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
      phases.push({ label: 'Contract', x: center.x, y: center.y, scale: 0.7, durationMs: pulseMs, stepName: side, repText });
      phases.push({ label: 'Relax', x: center.x, y: center.y, scale: 1, durationMs: pulseMs, stepName: side, repText });
      phases.push({ label: 'Stretch', x: pos.x, y: pos.y, durationMs: moveMs, stepName: side, repText });
      phases.push({ label: 'Hold', x: pos.x, y: pos.y, durationMs: holdMs, stepName: side, repText });
      phases.push({ label: 'Return', x: center.x, y: center.y, durationMs: moveMs, stepName: side, repText });
    }
  }
  return phases;
}

/**
 * Half U: a continuous stretch from the top of the entrance down toward the
 * bottom, alternating sides each rep (no hold — it's a fluid motion).
 */
export function buildHalfUPhases(speedSecs: number, reps: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const { top, bottom, left, right } = HALF_U_POINTS;
  const phases: DilatorPhase[] = [];
  for (let i = 1; i <= Math.max(reps, 1); i++) {
    const repText = `${i} of ${reps}`;
    const side = i % 2 === 1 ? 'Left' : 'Right';
    const waypoints = i % 2 === 1 ? left : right;
    // Walk out along the curve (top -> waypoints -> bottom), each leg an
    // equal fraction of speedSecs so the dot approximates the same
    // elliptical arc as the static trace, then retrace the same waypoints
    // back up to top instead of cutting straight through the middle.
    const outbound = [...waypoints, bottom];
    const inbound = [...waypoints].reverse().concat(top);
    const legMs = moveMs / outbound.length;
    for (const p of outbound) {
      phases.push({ label: 'Stretch', x: p.x, y: p.y, durationMs: legMs, stepName: side, repText });
    }
    for (const p of inbound) {
      phases.push({ label: 'Return', x: p.x, y: p.y, durationMs: legMs, stepName: side, repText });
    }
  }
  return phases;
}
