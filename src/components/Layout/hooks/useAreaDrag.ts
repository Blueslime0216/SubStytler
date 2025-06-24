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
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // 🔧 성능 최적화를 위한 throttle 간격 (16ms = 60fps)
  const THROTTLE_INTERVAL = 16;

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

  // 🔧 최적화된 드래그 처리 - 깜박거림 완전 제거
  useEffect(() => {
    if (!dragging) {
      // 🔧 드래그 종료 시 body 클래스 제거
      document.body.classList.remove('dragging-active');
      return;
    }

    // 🔧 드래그 시작 시 body 클래스 추가 (전역 애니메이션 비활성화)
    document.body.classList.add('dragging-active');

    const onMouseMove = (e: MouseEvent) => {
      const currentTime = performance.now();
      
      // 🔧 throttle 적용 - 60fps로 제한
      if (currentTime - lastUpdateTimeRef.current < THROTTLE_INTERVAL) {
        return;
      }
      
      lastUpdateTimeRef.current = currentTime;

      // 🔧 이전 애니메이션 프레임 취소
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // 🔧 requestAnimationFrame으로 최적화
      animationFrameRef.current = requestAnimationFrame(() => {
        const drag = draggingRef.current;
        if (!drag) return;
        
        const { areaId, dir, lastX, lastY, linked } = drag;
        const container = containerRef.current;
        if (!container) return;
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const dxRaw = ((e.clientX - lastX) / containerWidth) * 100;
        const dyRaw = ((e.clientY - lastY) / containerHeight) * 100;
        
        // 🔧 배열 복사 최적화
        const currentAreas = areasRef.current;
        const areaIdx = currentAreas.findIndex(a => a.id === areaId);
        if (areaIdx === -1) return;
        
        // 🔧 shallow copy로 성능 최적화
        const newAreas = currentAreas.map(a => ({ ...a }));
        const area = newAreas[areaIdx];
        const allLinked: LinkedArea[] = [{ id: areaId, dir }, ...linked];
        
        let limitPos = Infinity;
        let limitNeg = Infinity;
        const isHorizontal = dir === 'left' || dir === 'right';
        
        // 🔧 제약 조건 계산 최적화
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
        
        let move = 0;
        if (isHorizontal) {
          move = dxRaw < 0 ? clamp(dxRaw, -limitNeg, 0) : clamp(dxRaw, 0, limitPos);
        } else {
          move = dyRaw < 0 ? clamp(dyRaw, -limitNeg, 0) : clamp(dyRaw, 0, limitPos);
        }

        // 🔧 영역 업데이트 최적화
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

        // 🔧 상태 업데이트 최적화
        setAreas(newAreas);
        
        // 🔧 마우스 위치 업데이트
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
      // 🔧 정리 작업
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // 🔧 드래그 종료
      setDragging(null);
      document.body.classList.remove('dragging-active');
    };

    // 🔧 passive 이벤트 리스너로 성능 최적화
    const options = { passive: true, capture: false };
    window.addEventListener('mousemove', onMouseMove, options);
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('dragging-active');
    };
  }, [dragging, setAreas]);

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