import { Project, SubtitleBlock } from '../types/project';
import { evaluateCurve } from './easingUtils';
import { useGraphLibraryStore } from '../stores/graphLibraryStore';
import { interpolateColor } from './colorUtils';
import { interpolateNumber } from './interpolation';

/** Expand project subtitles into per-frame subtitles reflecting keyframe animations. */
export function expandProjectForAnimations(project: Project, fps: number): Project {
  const frameDuration = 1000 / fps;
  const lib = useGraphLibraryStore.getState().curves;

  const expandedSubs: SubtitleBlock[] = [];

  project.subtitles.forEach((sub) => {
    const span = sub.spans[0];
    const animations = span.animations ?? [];
    if (!animations.length) {
      expandedSubs.push(sub);
      return;
    }

    const start = sub.startTime;
    const end = sub.endTime;

    for (let t = start; t < end; t += frameDuration) {
      const nextT = Math.min(t + frameDuration, end);
      const newSpan = { ...span } as any;

      // Apply each animated property
      animations.forEach((anim) => {
        // Find surrounding keyframes
        const after = anim.keyframes.find((k) => k.time >= t);
        const beforeArr = anim.keyframes
          .filter((k) => k.time <= t)
          .sort((a, b) => b.time - a.time);
        const before = beforeArr[0] ?? after;
        if (!before || !after) return; // skip if undefined

        const localT = (t - before.time) / (after.time - before.time || 1);
        const easingCurve = lib[before.easingId ?? 'linear'] || lib['linear'];
        const eased = evaluateCurve(easingCurve, localT);

        const type = typeof before.value === 'number' ? 'number' : 'color';
        let value: any;
        if (type === 'number') {
          value = interpolateNumber(before.value, after.value, eased);
        } else {
          value = interpolateColor(before.value, after.value, eased);
        }

        // assign
        (newSpan as any)[anim.property] = value;
      });

      expandedSubs.push({
        ...sub,
        id: `${sub.id}_${t}`,
        startTime: Math.round(t),
        endTime: Math.round(nextT),
        spans: [newSpan],
      });
    }
  });

  return { ...project, subtitles: expandedSubs } as Project;
} 