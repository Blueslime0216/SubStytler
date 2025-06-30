import { evaluateCurve } from './easingUtils';
import { EasingCurve } from '../types/easing';
import { interpolateColor } from './colorUtils';

export function interpolateNumber(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

export function interpolateValue(
  start: any,
  end: any,
  progress: number,
  type: 'number' | 'color'
) {
  if (type === 'number') {
    return interpolateNumber(start as number, end as number, progress);
  }
  if (type === 'color') {
    return interpolateColor(start as string, end as string, progress);
  }
  return end;
}

/**
 * Convenience: given start, end values and easing curve, return value at t.
 */
export function interpolateWithCurve(
  start: any,
  end: any,
  t: number,
  curve: EasingCurve,
  type: 'number' | 'color'
) {
  const p = evaluateCurve(curve, t);
  return interpolateValue(start, end, p, type);
} 