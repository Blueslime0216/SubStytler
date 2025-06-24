import React, { useEffect, useRef, useState } from 'react';
import { Area } from '../../../types/area';
import { BorderDir, LinkedArea, detectLinkedAreas, clamp, EPSILON } from './areaDragUtils';

const BORDER_THICKNESS = 8;

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
  getLinkedBorders: (areaId: string, dir: BorderDir) => LinkedArea[];
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

  // Function to get linked borders for hover effect
  const getLinkedBorders = (areaId: string, dir: BorderDir): LinkedArea[] => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return [];
    
    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    return linked;
  };

  // 🔧 드래그 중 깜박임 방지를 위한 최적화된 마우스 이벤트 처리
  useEffect(() => {
    if (!dragging) return;

    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      // 🔧 requestAnimationFrame으로 성능 최적화
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
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
          const capacity = isHorizontal ? a.width - (a.minWidth || 15) : a.height - (a.minHeight || 20);
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
        
        if (move !== 0 && draggingRef.current) {
          if (isHorizontal) {
            draggingRef.current.lastX = e.clientX;
          } else {
            draggingRef.current.lastY = e.clientY;
          }
        }
      });
    };

    const onMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setDragging(null);
    };

    // 🔧 passive 이벤트 리스너로 성능 최적화
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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

  return { containerRef, onBorderMouseDown, dragging, getLinkedBorders };
}

export type { BorderDir };