import { Project, SubtitleBlock, SubtitleSpan } from '../types/project';
import { evaluateCurve } from './easingUtils';
import { useGraphLibraryStore } from '../stores/graphLibraryStore';
import { interpolateColor } from './colorUtils';
import { interpolateNumber } from './interpolation';

/**
 * Create a style hash for comparing subtitle spans
 * Rounds numeric values to avoid floating point precision issues
 */
function createStyleHash(span: SubtitleSpan): string {
  const roundTo = (val: number | undefined, decimals: number = 2) => 
    val !== undefined ? Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals) : undefined;
    
  return JSON.stringify({
    fc: span.fc,
    fo: roundTo(span.fo),
    bc: span.bc,
    bo: roundTo(span.bo),
    ah: roundTo(span.ah),
    av: roundTo(span.av),
    ap: span.ap,
    ju: span.ju,
    pd: span.pd,
    sd: span.sd,
    ec: span.ec,
    et: span.et,
    fs: span.fs,
    sz: span.sz,
    rb: span.rb,
    of: span.of,
    text: span.text
  });
}

/**
 * Check if two spans have identical styles
 */
function areSpansIdentical(span1: SubtitleSpan, span2: SubtitleSpan): boolean {
  return createStyleHash(span1) === createStyleHash(span2);
}

/**
 * Optimize consecutive frames with identical styles by merging them
 */
function optimizeConsecutiveFrames(frames: SubtitleBlock[]): SubtitleBlock[] {
  if (frames.length <= 1) return frames;
  
  const optimized: SubtitleBlock[] = [];
  let currentGroup = frames[0];
  
  for (let i = 1; i < frames.length; i++) {
    const currentFrame = frames[i];
    const currentSpan = currentGroup.spans[0];
    const nextSpan = currentFrame.spans[0];
    
    if (areSpansIdentical(currentSpan, nextSpan)) {
      // Identical style - extend duration
      currentGroup = {
        ...currentGroup,
        endTime: currentFrame.endTime,
        id: `${currentGroup.id}_merged`
      };
    } else {
      // Different style - save current group and start new one
      optimized.push(currentGroup);
      currentGroup = currentFrame;
    }
  }
  
  // Add the last group
  optimized.push(currentGroup);
  return optimized;
}

/** Expand project subtitles into per-frame subtitles reflecting keyframe animations with duration optimization. */
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

    // Step 1: Generate all frames (existing logic)
    const frameBlocks: SubtitleBlock[] = [];
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

        // 텍스트는 스텝(보간 없음) 처리
        if (anim.property === 'text') {
          (newSpan as any)[anim.property] = t < after.time ? before.value : after.value;
        } else {
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
        }
      });

      frameBlocks.push({
        ...sub,
        id: `${sub.id}_${t}`,
        startTime: Math.round(t),
        endTime: Math.round(nextT),
        spans: [newSpan],
      });
    }

    // Step 2: Optimize consecutive identical frames
    const optimizedBlocks = optimizeConsecutiveFrames(frameBlocks);
    expandedSubs.push(...optimizedBlocks);
  });

  return { ...project, subtitles: expandedSubs } as Project;
}

/**
 * Test function to demonstrate duration optimization
 * This can be removed in production
 */
export function testDurationOptimization() {
  console.log('🎯 Duration Optimization Test');
  
  // Mock project with animation
  const mockProject: Project = {
    id: 'test',
    name: 'Test Project',
    subtitles: [{
      id: 'sub1',
      startTime: 0,
      endTime: 2000, // 2 seconds
      trackId: 'track1',
      spans: [{
        id: 'span1',
        text: 'Test Animation',
        animations: [{
          property: 'ah',
          keyframes: [
            { time: 0, value: 10, easingId: 'linear' },
            { time: 1000, value: 90, easingId: 'linear' },
            { time: 2000, value: 90, easingId: 'linear' } // Same value for 1-2 seconds
          ]
        }]
      }]
    }],
    tracks: [],
    styles: []
  };

  // Test with 30fps
  const result = expandProjectForAnimations(mockProject, 30);
  
  console.log(`Original: 2 seconds at 30fps = 60 frames`);
  console.log(`Optimized: ${result.subtitles.length} subtitle blocks`);
  console.log('Optimization ratio:', (60 / result.subtitles.length).toFixed(2) + 'x reduction');
  
  return result;
} 