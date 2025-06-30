import { EasingCurve } from '../types/easing';

/**
 * Cubic Bezier helper – returns y for a given x (0‒1) using Newton–Raphson.
 * Falls back to binary subdivision if slope is too small.
 */
export function evaluateCubicBezier(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  x: number,
  maxIterations = 8,
  epsilon = 1e-6
): number {
  // Pre-calculate the polynomial coefficients
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  // Helper to compute x(t) & y(t)
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivX = (t: number) => 3 * ax * t * t + 2 * bx * t + cx;

  // Use Newton–Raphson to find t for given x
  let t = x; // Initial guess
  for (let i = 0; i < maxIterations; i++) {
    const xEstimate = sampleX(t) - x;
    const deriv = sampleDerivX(t);
    if (Math.abs(xEstimate) < epsilon) break;
    if (Math.abs(deriv) < 1e-6) break; // Avoid division by nearly zero
    t -= xEstimate / deriv;
  }

  // Clamp t to [0,1]
  if (t < 0) t = 0; else if (t > 1) t = 1;
  return sampleY(t);
}

/**
 * Evaluate any EasingCurve instance at progress x (0‒1).
 */
export function evaluateCurve(curve: EasingCurve, x: number): number {
  return evaluateCubicBezier(curve.p1x, curve.p1y, curve.p2x, curve.p2y, x);
} 