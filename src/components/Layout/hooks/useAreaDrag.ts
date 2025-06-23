import React, { useEffect, useRef, useState } from 'react';
import { Area } from '../../../types/area';

// Internal types moved from AreaRenderer
export type BorderDir = 'left' | 'right' | 'top' | 'bottom';
export interface LinkedArea { id: string; dir: BorderDir; }

const BORDER_THICKNESS = 8;
const EPSILON = 0.01;

function getOppositeDir(dir: BorderDir): BorderDir {
  return dir === 'left' ? 'right' : dir === 'right' ? 'left' : dir === 'top' ? 'bottom' : 'top';
}

function getAdjacentAreas(areas: Area[], area: Area, dir: BorderDir) {
  // 같은 선상에 있는 인접 area를 모두 반환
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
  // dir === 'bottom'
  return areas.filter(
    a =>
      a.id !== area.id &&
      Math.abs(area.y + area.height - a.y) < EPSILON &&
      a.x < area.x + area.width &&
      a.x + a.width > area.x,
  );
}

function detectLinkedAreas(
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

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface UseAreaDragReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  onBorderMouseDown: (
    e: React.MouseEvent,
    areaId: string,
    dir: BorderDir,
  ) => void;
  dragging: {
    areaId: string;
    dir: BorderDir;
    lastX: number;
    lastY: number;
    linked: LinkedArea[];
  } | null;
}

export function useAreaDrag(
  areas: Area[],
  setAreas: (areas: Area[]) => void,
): UseAreaDragReturn {
  const [dragging, setDragging] = useState<UseAreaDragReturn['dragging']>(null);
  const draggingRef = useRef<typeof dragging>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const areasRef = useRef<Area[]>(areas);

  // keep refs updated
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    areasRef.current = areas;
  }, [areas]);

  // Mouse move / up listeners when dragging
  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const drag = draggingRef.current;
      if (!drag) return;
      const { areaId, dir, lastX, lastY, linked } = drag;
      const container = containerRef.current;
      if (!container) return;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const dxRaw = ((e.clientX - lastX) / containerWidth) * 100;
      const dyRaw = ((e.clientY - lastY) / containerHeight) * 100;
      const currentAreas = areasRef.current.map(a => ({ ...a }));
      const areaIdx = currentAreas.findIndex(a => a.id === areaId);
      if (areaIdx === -1) return;
      const newAreas = currentAreas.map(a => ({ ...a }));
      const area = newAreas[areaIdx];
      const allLinked: LinkedArea[] = [{ id: areaId, dir }, ...linked];
      let limitPos = Infinity;
      let limitNeg = Infinity;
      const isHorizontal = dir === 'left' || dir === 'right';
      for (const { id, dir: moveDir } of allLinked) {
        const a = newAreas.find(x => x.id === id)!;
        const capacity = isHorizontal ? a.width - a.minWidth : a.height - a.minHeight;
        if (isHorizontal) {
          if (moveDir === 'left') limitPos = Math.min(limitPos, capacity);
          else limitNeg = Math.min(limitNeg, capacity);
        } else {
          if (moveDir === 'top') limitPos = Math.min(limitPos, capacity);
          else limitNeg = Math.min(limitNeg, capacity);
        }
      }
      limitPos = Math.max(0, limitPos - EPSILON);
      limitNeg = Math.max(0, limitNeg - EPSILON);
      let move = 0;
      if (isHorizontal) move = dxRaw < 0 ? clamp(dxRaw, -limitNeg, 0) : clamp(dxRaw, 0, limitPos);
      else move = dyRaw < 0 ? clamp(dyRaw, -limitNeg, 0) : clamp(dyRaw, 0, limitPos);

      for (const { id, dir: moveDir } of allLinked) {
        const a = newAreas.find(x => x.id === id)!;
        if (moveDir === 'left') {
          a.x += move;
          a.width -= move;
        } else if (moveDir === 'right') {
          a.width += move;
        } else if (moveDir === 'top') {
          a.y += move;
          a.height -= move;
        } else {
          a.height += move; // bottom
        }
      }

      setAreas(newAreas);
      if (draggingRef.current) {
        draggingRef.current.lastX = e.clientX;
        draggingRef.current.lastY = e.clientY;
      }
    };

    const onMouseUp = () => setDragging(null);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, setAreas]);

  const onBorderMouseDown = (
    e: React.MouseEvent,
    areaId: string,
    dir: BorderDir,
  ) => {
    e.preventDefault();
    const area = areas.find(a => a.id === areaId)!;
    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    setDragging({ areaId, dir, lastX: e.clientX, lastY: e.clientY, linked });
  };

  return { containerRef, onBorderMouseDown, dragging };
}