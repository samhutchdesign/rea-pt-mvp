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

// J Curve: matches the Figma reference (node 2741:16545) exactly — both
// curves start at the cusp (the oval's own center) and immediately share
// one control point directly below it, so they overlap for their initial
// descent (reading as a single sharp spike) before diverging outward to
// each side and flattening near the exit. Points below are the Figma
// vector's coordinates converted into this file's 0-100 space, preserving
// each offset from center as a fraction of the oval's own rx/ry so the
// proportions still read correctly after DilatorVisual's non-uniform
// (preserveAspectRatio="none") horizontal stretch.
const J_CUSP = { x: 50, y: 50 };
const J_CURVE_SIDES = {
  left: { c1: { x: 50, y: 66.2 }, c2: { x: 42.2, y: 81.5 }, out: { x: 29.5, y: 81.5 } },
  right: { c1: { x: 50, y: 66.2 }, c2: { x: 57.8, y: 81.5 }, out: { x: 70.5, y: 81.5 } },
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

export const HALF_U_SIDE_POINTS = { left: halfUSidePoints('left'), right: halfUSidePoints('right') };

export const J_CURVE_TRACES = [
  `M ${J_CUSP.x} ${J_CUSP.y} C ${J_CURVE_SIDES.left.c1.x} ${J_CURVE_SIDES.left.c1.y} ${J_CURVE_SIDES.left.c2.x} ${J_CURVE_SIDES.left.c2.y} ${J_CURVE_SIDES.left.out.x} ${J_CURVE_SIDES.left.out.y}`,
  `M ${J_CUSP.x} ${J_CUSP.y} C ${J_CURVE_SIDES.right.c1.x} ${J_CURVE_SIDES.right.c1.y} ${J_CURVE_SIDES.right.c2.x} ${J_CURVE_SIDES.right.c2.y} ${J_CURVE_SIDES.right.out.x} ${J_CURVE_SIDES.right.out.y}`,
];

export const THREE_POINT_TRACES = [
  `M ${THREE_POINT_POINTS.center.x} ${THREE_POINT_POINTS.center.y} L ${THREE_POINT_POINTS.eight.x} ${THREE_POINT_POINTS.eight.y}`,
  `M ${THREE_POINT_POINTS.center.x} ${THREE_POINT_POINTS.center.y} L ${THREE_POINT_POINTS.four.x} ${THREE_POINT_POINTS.four.y}`,
  `M ${THREE_POINT_POINTS.center.x} ${THREE_POINT_POINTS.center.y} L ${THREE_POINT_POINTS.six.x} ${THREE_POINT_POINTS.six.y}`,
];

// A single elliptical-arc command draws an exact half-ellipse — sweep-flag 0
// goes top-to-bottom via the left side, 1 via the right side. The third,
// straight path down the center is the "crossing stroke" of the figure 8 —
// the dot's return trip goes straight up through it instead of retracing
// whichever side curve it came down.
export const HALF_U_TRACES = [
  `M ${HALF_U_POINTS.top.x} ${HALF_U_POINTS.top.y} A ${HALF_U_RX} ${OVAL.ry} 0 0 0 ${HALF_U_POINTS.bottom.x} ${HALF_U_POINTS.bottom.y}`,
  `M ${HALF_U_POINTS.top.x} ${HALF_U_POINTS.top.y} A ${HALF_U_RX} ${OVAL.ry} 0 0 1 ${HALF_U_POINTS.bottom.x} ${HALF_U_POINTS.bottom.y}`,
  `M ${HALF_U_POINTS.top.x} ${HALF_U_POINTS.top.y} L ${HALF_U_POINTS.bottom.x} ${HALF_U_POINTS.bottom.y}`,
];

/**
 * J Curve: from the entrance (the cusp, at the oval's center), a sharp
 * outward hook to each side (like opening curtains) and hold, then straight
 * back to center (not retracing the curve), done for `reps` on the left,
 * then `reps` on the right.
 */
export function buildJCurvePhases(speedSecs: number, holdSecs: number, reps: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
  const legMs = moveMs / J_STEPS;
  const phases: DilatorPhase[] = [];
  for (const { key, side } of [{ key: 'left', side: 'Left' }, { key: 'right', side: 'Right' }] as const) {
    const points = J_CURVE_SIDE_POINTS[key];
    for (let i = 1; i <= Math.max(reps, 1); i++) {
      const repText = `${i} of ${reps}`;
      // Walk out along the hook one fine step at a time (matching the
      // static trace exactly), hold at the end, then go straight back to
      // the cusp instead of retracing the curve.
      for (let s = 1; s <= J_STEPS; s++) {
        phases.push({ label: 'Stretch', x: points[s].x, y: points[s].y, durationMs: legMs, stepName: side, repText });
      }
      phases.push({ label: 'Hold', x: points[J_STEPS].x, y: points[J_STEPS].y, durationMs: holdMs, stepName: side, repText });
      phases.push({ label: 'Return', x: J_CUSP.x, y: J_CUSP.y, durationMs: moveMs, stepName: side, repText });
    }
  }
  return phases;
}

/**
 * 3-Point Stretch (Peace Sign): stretch out to 8 o'clock, 4 o'clock, and
 * 6 o'clock in turn, holding each — one full rotation through all three
 * points counts as one rep.
 */
export function build3PointPhases(speedSecs: number, holdSecs: number, reps: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const holdMs = Math.max(holdSecs, 0.1) * 1000;
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
      phases.push({ label: 'Stretch', x: pos.x, y: pos.y, durationMs: moveMs, stepName: side, repText });
      phases.push({ label: 'Hold', x: pos.x, y: pos.y, durationMs: holdMs, stepName: side, repText });
      phases.push({ label: 'Return', x: center.x, y: center.y, durationMs: moveMs, stepName: side, repText });
    }
  }
  return phases;
}

/**
 * Half U: from the top of the entrance, down one side toward the bottom,
 * then straight back up through the center — like the crossing stroke of a
 * figure 8 — instead of retracing the same curve, alternating sides each
 * rep, with an optional brief hold at the top before switching sides.
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
    // Walk down the curve (top -> ... -> bottom) one fine step at a time, so
    // the dot approximates the same elliptical arc as the static trace.
    for (let s = 1; s <= HALF_U_STEPS; s++) {
      phases.push({ label: 'Stretch', x: points[s].x, y: points[s].y, durationMs: legMs, stepName: side, repText });
    }
    // Then straight back up through the center (the figure 8's crossing
    // stroke), not back down the curve it just came from.
    phases.push({ label: 'Return', x: top.x, y: top.y, durationMs: moveMs, stepName: side, repText });
    if (holdMs > 0) {
      phases.push({ label: 'Hold', x: top.x, y: top.y, durationMs: holdMs, stepName: side, repText });
    }
  }
  return phases;
}

// Perineal/Scar Massage: unlike Half U (whose two half-arcs together trace
// the *entire* outer ellipse), this is a single open arc along just the
// bottom — literally a "U" — from the ellipse's left-middle (180°) through
// its bottom (90°) to its right-middle (0°), on the same concentric ellipse
// Half U already uses.
const PERINEAL_STEPS = 40;

function perinealUPoints() {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= PERINEAL_STEPS; i++) {
    const angle = 180 - 180 * (i / PERINEAL_STEPS); // 180 (left-middle) -> 90 (bottom) -> 0 (right-middle)
    points.push(ellipsePoint(angle, HALF_U_RX));
  }
  return points; // [0] is the left-middle vertex, [PERINEAL_STEPS] is the right-middle vertex.
}

const PERINEAL_U_POINTS = perinealUPoints();

// Same decreasing-angle direction as HALF_U_TRACES' left (sweep-flag 0) arc.
export const PERINEAL_MASSAGE_TRACE = [
  `M ${PERINEAL_U_POINTS[0].x} ${PERINEAL_U_POINTS[0].y} A ${HALF_U_RX} ${OVAL.ry} 0 0 0 ${PERINEAL_U_POINTS[PERINEAL_STEPS].x} ${PERINEAL_U_POINTS[PERINEAL_STEPS].y}`,
];

/**
 * Perineal/Scar Massage: a continuous "U" sweep — down one side, across the
 * bottom, up the other side — then back, on repeat.
 */
export function buildPerinealMassagePhases(speedSecs: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const backward = [...PERINEAL_U_POINTS].reverse();
  const path = [...PERINEAL_U_POINTS, ...backward.slice(1)];
  const legMs = moveMs / PERINEAL_STEPS;
  return path.slice(1).map((p) => ({ label: 'Massage', x: p.x, y: p.y, durationMs: legMs }));
}

// Dilator In & Out: matches the Figma reference (node 2741:16545) — two
// straight vertical guide rails instead of the oval, with the dot resting
// near the bottom (the entrance) and gliding straight up toward the top
// ("in") and back down ("out"). Coordinates converted from the Figma
// vector's 371×371 canvas as plain percentages (no oval to scale against
// here, unlike the other exercises).
const IN_OUT_RAIL_X_LEFT = 38;
const IN_OUT_RAIL_X_RIGHT = 60;
const IN_OUT_RAIL_Y_TOP = 15;
const IN_OUT_RAIL_Y_BOTTOM = 84;
const IN_OUT_CENTER_X = (IN_OUT_RAIL_X_LEFT + IN_OUT_RAIL_X_RIGHT) / 2;
const IN_SCALE = 0.75; // shrinks a bit as it glides "in", reads as receding deeper

export const DILATOR_IN_OUT_TRACES = [
  `M ${IN_OUT_RAIL_X_LEFT} ${IN_OUT_RAIL_Y_TOP} L ${IN_OUT_RAIL_X_LEFT} ${IN_OUT_RAIL_Y_BOTTOM}`,
  `M ${IN_OUT_RAIL_X_RIGHT} ${IN_OUT_RAIL_Y_TOP} L ${IN_OUT_RAIL_X_RIGHT} ${IN_OUT_RAIL_Y_BOTTOM}`,
];

/**
 * Dilator In & Out: glide the dot up ("in") and down ("out") between the
 * guide rails, repeating for `reps`.
 */
export function buildDilatorInOutPhases(speedSecs: number, reps: number): DilatorPhase[] {
  const moveMs = Math.max(speedSecs, 0.1) * 1000;
  const phases: DilatorPhase[] = [];
  for (let i = 1; i <= Math.max(reps, 1); i++) {
    const repText = `${i} of ${reps}`;
    phases.push({ label: 'Out', x: IN_OUT_CENTER_X, y: IN_OUT_RAIL_Y_BOTTOM, scale: 1, durationMs: moveMs, repText });
    phases.push({ label: 'In', x: IN_OUT_CENTER_X, y: IN_OUT_RAIL_Y_TOP, scale: IN_SCALE, durationMs: moveMs, repText });
  }
  return phases;
}
