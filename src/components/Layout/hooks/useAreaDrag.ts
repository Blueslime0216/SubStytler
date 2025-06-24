import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const animationFrameId = useRef<number | null>(null);

  // keep refs updated
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    areasRef.current = areas;
  }, [areas]);

  // Function to get linked borders for hover effect
  const getLinkedBorders = useCallback((areaId: string, dir: BorderDir): LinkedArea[] => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return [];
    
    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    return linked;
  }, [areas]);

  // 🔧 최적화된 드래그 처리 - 깜박임 완전 제거
  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      // 🔧 이전 프레임 취소
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // 🔧 requestAnimationFrame으로 성능 최적화
      animationFrameId.current = requestAnimationFrame(() => {
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

        // 🔧 배치 업데이트 - 한 번에 처리
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
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      setDragging(null);
    };

    // 🔧 passive 이벤트 리스너로 성능 최적화
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, setAreas]);

  const onBorderMouseDown = useCallback((
    e: React.MouseEvent,
    areaId: string,
    dir: BorderDir,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const area = areas.find(a => a.id === areaId)!;
    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    
    setDragging({ areaId, dir, lastX: e.clientX, lastY: e.clientY, linked });
  }, [areas]);

  return { containerRef, onBorderMouseDown, dragging, getLinkedBorders };
}

export type { BorderDir };