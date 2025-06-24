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
  
  // 🚀 성능 최적화 - 프레임 제한
  const lastUpdateTime = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // keep refs updated
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    areasRef.current = areas;
  }, [areas]);

  // 🎯 링크된 경계 계산 최적화
  const getLinkedBorders = useCallback((areaId: string, dir: BorderDir): LinkedArea[] => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return [];
    
    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    return linked;
  }, [areas]);

  // 🚀 최적화된 마우스 이동 처리
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const drag = draggingRef.current;
    if (!drag) return;

    // 🎯 프레임 제한 - 60fps로 제한
    const now = performance.now();
    if (now - lastUpdateTime.current < 16) { // ~60fps
      return;
    }
    lastUpdateTime.current = now;

    // 🚀 애니메이션 프레임 최적화
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    animationFrameId.current = requestAnimationFrame(() => {
      const { areaId, dir, lastX, lastY, linked } = drag;
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const dxRaw = ((e.clientX - lastX) / containerWidth) * 100;
      const dyRaw = ((e.clientY - lastY) / containerHeight) * 100;

      // 🎯 현재 areas 복사 최적화
      const currentAreas = [...areasRef.current];
      const areaIdx = currentAreas.findIndex(a => a.id === areaId);
      if (areaIdx === -1) return;

      const newAreas = currentAreas.map(a => ({ ...a }));
      const allLinked: LinkedArea[] = [{ id: areaId, dir }, ...linked];

      // 🎯 제약 조건 계산 최적화
      let limitPos = Infinity;
      let limitNeg = Infinity;
      const isHorizontal = dir === 'left' || dir === 'right';

      for (const { id, dir: moveDir } of allLinked) {
        const a = newAreas.find(x => x.id === id);
        if (!a) continue;

        const capacity = isHorizontal 
          ? a.width - (a.minWidth || 15)
          : a.height - (a.minHeight || 20);

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

      // 🎯 이동량 계산 및 적용
      let move = 0;
      if (isHorizontal) {
        move = dxRaw < 0 ? clamp(dxRaw, -limitNeg, 0) : clamp(dxRaw, 0, limitPos);
      } else {
        move = dyRaw < 0 ? clamp(dyRaw, -limitNeg, 0) : clamp(dyRaw, 0, limitPos);
      }

      // 🚀 배치 업데이트 최적화
      for (const { id, dir: moveDir } of allLinked) {
        const a = newAreas.find(x => x.id === id);
        if (!a) continue;

        switch (moveDir) {
          case 'left':
            a.x += move;
            a.width -= move;
            break;
          case 'right':
            a.width += move;
            break;
          case 'top':
            a.y += move;
            a.height -= move;
            break;
          case 'bottom':
            a.height += move;
            break;
        }
      }

      // 🎯 상태 업데이트
      setAreas(newAreas);

      // 🔄 마지막 위치 업데이트
      if (move !== 0 && draggingRef.current) {
        if (isHorizontal) {
          draggingRef.current.lastX = e.clientX;
        } else {
          draggingRef.current.lastY = e.clientY;
        }
      }
    });
  }, [setAreas]);

  // 🎯 마우스 업 처리 최적화
  const handleMouseUp = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setDragging(null);
  }, []);

  // Mouse move / up listeners when dragging
  useEffect(() => {
    if (!dragging) return;

    // 🚀 패시브 이벤트 리스너로 성능 최적화
    const options = { passive: true };
    
    document.addEventListener('mousemove', handleMouseMove, options);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const onBorderMouseDown = useCallback((
    e: React.MouseEvent,
    areaId: string,
    dir: BorderDir,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    
    setDragging({ 
      areaId, 
      dir, 
      lastX: e.clientX, 
      lastY: e.clientY, 
      linked 
    });
  }, [areas]);

  return { containerRef, onBorderMouseDown, dragging, getLinkedBorders };
}

export type { BorderDir };