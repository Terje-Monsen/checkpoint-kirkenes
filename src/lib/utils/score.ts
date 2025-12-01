/** Clamp helper */
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Time-based decay for discrete questions (MCQ/TrueFalse).
 *  Linear: full points at t=0 down to minPoint at t=maxTime (if correct).
 */
export function timeScoreLinear(params: { correct: boolean; elapsed: number; maxTime: number; maxPoint: number; minPoint: number }) {
  const { correct, elapsed, maxTime, maxPoint, minPoint } = params;
  if (!correct) return 0;
  const t = clamp(elapsed, 0, maxTime);
  const s = maxPoint - (maxPoint - minPoint) * (t / maxTime);
  return Math.round(s);
}

/** Slider distance + time.
 *  distanceScore: 1.0 at distance 0 → 0 at distance >= scoreRange (linear).
 *  timePenalty:  1.0 at 0s → 0.7 at maxTime (30% penalty at max time) – tweakable.
 */
export function sliderScore(params: { value: number; correct: number; scoreRange: number; elapsed: number; maxTime: number; maxPoint?: number }) {
  const { value, correct, scoreRange, elapsed, maxTime, maxPoint = 100 } = params;
  const dist = Math.abs(value - correct);
  const distFactor = clamp(1 - dist / scoreRange, 0, 1); // 0..1
  const timeFactor = clamp(1 - 0.3 * (elapsed / maxTime), 0.7, 1); // 0.7..1
  const score = maxPoint * distFactor * timeFactor;
  return Math.round(score);
}

/** Hotspot distance + time (inner radius = full, outer = linear falloff to 0). */
export function hotspotScore(params: {
  click: { xPct: number; yPct: number };
  correct: { x: number; y: number; radiusInner: number; radiusOuter: number };
  elapsed: number;
  maxTime: number;
  maxPoint?: number;
}) {
  const { click, correct, elapsed, maxTime, maxPoint = 100 } = params;
  const dx = click.xPct - correct.x;
  const dy = click.yPct - correct.y;
  const dist = Math.sqrt(dx*dx + dy*dy); // in percentage points
  let baseFactor = 0;
  if (dist <= correct.radiusInner) baseFactor = 1;
  else if (dist <= correct.radiusOuter) {
    const span = correct.radiusOuter - correct.radiusInner;
    baseFactor = 1 - (dist - correct.radiusInner) / span; // linear 1..0
  } else baseFactor = 0;

  const timeFactor = clamp(1 - 0.3 * (elapsed / maxTime), 0.7, 1);
  const score = maxPoint * baseFactor * timeFactor;
  return Math.round(score);
}
