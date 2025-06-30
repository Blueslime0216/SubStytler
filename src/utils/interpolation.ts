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

const unitRegex = /^(-?\d+\.?\d*)([a-z%]*)$/i;

export function isUnitNumber(str: any): boolean {
  if (typeof str !== 'string') return false;
  return unitRegex.test(str);
}

export function interpolateUnitNumber(start: string, end: string, t: number): string {
  const [, startValStr, startUnit] = start.match(unitRegex) || [];
  const [, endValStr, endUnit] = end.match(unitRegex) || [];

  const startVal = parseFloat(startValStr);
  const endVal = parseFloat(endValStr);

  // 단위가 다르거나 파싱 실패 시 보간하지 않음
  if (startUnit !== endUnit || isNaN(startVal) || isNaN(endVal)) {
    return start;
  }

  const interpolatedValue = interpolateNumber(startVal, endVal, t);

  // 소수점 3자리까지 반올림
  const roundedValue = Math.round(interpolatedValue * 1000) / 1000;

  return `${roundedValue}${startUnit}`;
} 