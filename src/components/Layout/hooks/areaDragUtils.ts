import { Area } from '../../../types/area';

export type BorderDir = 'left' | 'right' | 'top' | 'bottom';
export interface LinkedArea { id: string; dir: BorderDir; }

export const EPSILON = 0.01;

export function getOppositeDir(dir: BorderDir): BorderDir {
  return dir === 'left'
    ? 'right'
    : dir === 'right'
    ? 'left'
    : dir === 'top'
    ? 'bottom'
    : 'top';
}

export function getAdjacentAreas(
  areas: Area[],
  area: Area,
  dir: BorderDir,
): Area[] {
  if (dir === 'left') {
    return areas.filter(
      a =>
        a.id !== area.id &&
        Math.abs(a.x + a.width - area.x) < EPSILON &&
        a.y < area.y + area.height &&
        a.y + a.height > area.y,
    );
  }
  if (dir === 'right') {
    return areas.filter(
      a =>
        a.id !== area.id &&
        Math.abs(area.x + area.width - a.x) < EPSILON &&
        a.y < area.y + area.height &&
        a.y + a.height > area.y,
    );
  }
  if (dir === 'top') {
    return areas.filter(
      a =>
        a.id !== area.id &&
        Math.abs(a.y + a.height - area.y) < EPSILON &&
        a.x < area.x + area.width &&
        a.x + a.width > area.x,
    );
  }
  // bottom
  return areas.filter(
    a =>
      a.id !== area.id &&
      Math.abs(area.y + area.height - a.y) < EPSILON &&
      a.x < area.x + area.width &&
      a.x + a.width > area.x,
  );
}

export function detectLinkedAreas(
  areas: Area[],
  startArea: Area,
  dir: BorderDir,
  visited: Set<string>,
  result: LinkedArea[],
) {
  const adjacents = getAdjacentAreas(areas, startArea, dir).filter(a => !visited.has(a.id));
  for (const adjacent of adjacents) {
    const oppDir = getOppositeDir(dir);
    visited.add(adjacent.id);
    result.push({ id: adjacent.id, dir: oppDir });
    detectLinkedAreas(areas, adjacent, oppDir, visited, result);
  }
}

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
} 