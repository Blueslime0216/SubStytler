import { SubtitleSpan } from '../types/project';
import { useGraphLibraryStore } from '../stores/graphLibraryStore';
import { evaluateCurve } from './easingUtils';
import { interpolateNumber, interpolateUnitNumber, isUnitNumber } from './interpolation';
import { interpolateColor, isColor } from './colorUtils';

/**
 * 주어진 시간(밀리초)에서 Span 의 애니메이션을 평가하여 실제 렌더링용 Span 을 반환한다.
 * original span 은 변경하지 않고, 복사본을 반환한다.
 */
export function applyAnimationsToSpan(span: SubtitleSpan, timeMs: number): SubtitleSpan {
  if (!span.animations || span.animations.length === 0) return span;

  const curves = useGraphLibraryStore.getState().curves;

  // 얕은 복사 ➜ 필요시에 속성 덮어쓰기
  const result: SubtitleSpan = { ...span } as any;

  span.animations.forEach((anim) => {
    const { property, keyframes } = anim;
    if (!keyframes || keyframes.length === 0) return;

    // 시간 이전 / 이후에 맞는 keyframe 찾기
    let before = keyframes[0];
    let after = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length; i++) {
      const kf = keyframes[i];
      if (kf.time === timeMs) {
        before = after = kf;
        break;
      }
      if (kf.time < timeMs) {
        before = kf;
      } else if (kf.time > timeMs) {
        after = kf;
        break;
      }
    }

    // 범위 밖이면 가장 가까운 키프레임 값 사용
    if (before === after) {
      (result as any)[property] = before.value;
      return;
    }

    // 텍스트는 스텝(보간 없음): 경계 전까지 이전 값을 유지, 경계 시점에 즉시 전환
    if (property === 'text') {
      (result as any)[property] = timeMs < after.time ? before.value : after.value;
      return;
    }

    const localT = (timeMs - before.time) / (after.time - before.time);
    const curveId = before.easingId || 'linear';
    const curve = curves[curveId] || curves['linear'];
    const easedT = evaluateCurve(curve, localT);

    let value: any;
    if (typeof before.value === 'number' && typeof after.value === 'number') {
      value = interpolateNumber(before.value, after.value, easedT);
    } else if (isUnitNumber(before.value) && isUnitNumber(after.value)) {
      value = interpolateUnitNumber(before.value, after.value, easedT);
    } else if (isColor(before.value) && isColor(after.value)) {
      value = interpolateColor(before.value, after.value, easedT);
    } else {
      // 그 외 타입은 스텝 처리
      value = before.value;
    }

    (result as any)[property] = value;
  });

  return result;
} 