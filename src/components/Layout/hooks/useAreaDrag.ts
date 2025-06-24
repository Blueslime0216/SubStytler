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
  setHoveredBorder?: (v: { areaId: string; dir: BorderDir } | null) => void,
): UseAreaDragReturn {
  const [dragging, setDragging] = useState<UseAreaDragReturn['dragging']>(null);
  const draggingRef = useRef<typeof dragging>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const areasRef = useRef<Area[]>(areas);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // 🔧 성능 최적화: 메모이제이션된 연결 영역 계산
  const linkedAreasCache = useRef<Map<string, LinkedArea[]>>(new Map());
  
  // 🔧 성능 최적화: 디바운스된 업데이트
  const pendingUpdate = useRef<Area[] | null>(null);
  const updateTimeoutRef = useRef<number | null>(null);

  // keep refs updated
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    areasRef.current = areas;
    // 🔧 areas가 변경되면 캐시 무효화
    linkedAreasCache.current.clear();
  }, [areas]);

  // 🔧 성능 최적화: 메모이제이션된 연결 영역 계산
  const getLinkedBorders = useCallback((areaId: string, dir: BorderDir): LinkedArea[] => {
    const cacheKey = `${areaId}-${dir}`;
    
    if (linkedAreasCache.current.has(cacheKey)) {
      return linkedAreasCache.current.get(cacheKey)!;
    }
    
    const area = areas.find(a => a.id === areaId);
    if (!area) return [];
    
    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    
    // 🔧 캐시에 저장 (최대 100개까지만)
    if (linkedAreasCache.current.size < 100) {
      linkedAreasCache.current.set(cacheKey, linked);
    }
    
    return linked;
  }, [areas]);

  // 🔧 성능 최적화: 배치 업데이트 함수
  const batchUpdateAreas = useCallback((newAreas: Area[]) => {
    pendingUpdate.current = newAreas;
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = window.setTimeout(() => {
      if (pendingUpdate.current) {
        setAreas(pendingUpdate.current);
        pendingUpdate.current = null;
      }
    }, 0);
  }, [setAreas]);

  // 🔧 최적화된 드래그 처리 - 성능 대폭 개선
  useEffect(() => {
    if (!dragging) return;

    // 드래그 시작 시 body에 클래스 추가
    document.body.classList.add('dragging-active');

    const onMouseMove = (e: MouseEvent) => {
      // 🔧 이전 프레임 취소
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // 🔧 프레임 제한 - 30fps로 제한하여 성능 향상 (약 33ms 간격)
      const now = performance.now();
      const elapsed = now - lastUpdateTimeRef.current;
      if (elapsed < 33) return; // 33ms 미만이면 처리 건너뜀

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
        
        // 🔧 성능 최적화: 얕은 복사로 변경
        const currentAreas = areasRef.current;
        const areaIdx = currentAreas.findIndex(a => a.id === areaId);
        if (areaIdx === -1) return;
        
        // 🔧 성능 최적화: 필요한 영역만 복사
        const newAreas = [...currentAreas];
        const affectedAreaIds = new Set([areaId, ...linked.map(l => l.id)]);
        
        for (let i = 0; i < newAreas.length; i++) {
          if (affectedAreaIds.has(newAreas[i].id)) {
            newAreas[i] = { ...newAreas[i] };
          }
        }
        
        const area = newAreas[areaIdx];
        const allLinked: LinkedArea[] = [{ id: areaId, dir }, ...linked];
        
        let limitPos = Infinity;
        let limitNeg = Infinity;
        const isHorizontal = dir === 'left' || dir === 'right';
        
        // 🔧 성능 최적화: 제한 계산 최적화
        for (const { id, dir: moveDir } of allLinked) {
          const a = newAreas.find(x => x.id === id);
          if (!a) continue;
          
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

        // 🔧 성능 최적화: 변경사항이 있을 때만 업데이트
        if (Math.abs(move) > 0.01) {
          for (const { id, dir: moveDir } of allLinked) {
            const a = newAreas.find(x => x.id === id);
            if (!a) continue;
            
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

          // 🔧 배치 업데이트 사용
          batchUpdateAreas(newAreas);
          lastUpdateTimeRef.current = now;
          
          if (draggingRef.current) {
            if (isHorizontal) {
              draggingRef.current.lastX = e.clientX;
            } else {
              draggingRef.current.lastY = e.clientY;
            }
          }
        }
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      
      // 🔧 최종 업데이트 강제 실행
      if (pendingUpdate.current) {
        setAreas(pendingUpdate.current);
        pendingUpdate.current = null;
      }
      
      // 드래그 종료 시 body에서 클래스 제거
      document.body.classList.remove('dragging-active');
      
      setDragging(null);
      // 드래그 종료 시 커서가 area-border 위에 있는지 검사
      if (setHoveredBorder) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || !(el as HTMLElement).classList.contains('area-border')) {
          setHoveredBorder(null);
        }
      }
    };

    // 🔧 passive 이벤트 리스너로 성능 최적화
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp as EventListener);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      document.body.classList.remove('dragging-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp as EventListener);
    };
  }, [dragging, batchUpdateAreas, setHoveredBorder]);

  const onBorderMouseDown = useCallback((
    e: React.MouseEvent,
    areaId: string,
    dir: BorderDir,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    // 🔧 성능 최적화: 캐시된 연결 영역 사용
    const linked = getLinkedBorders(areaId, dir);
    
    setDragging({ areaId, dir, lastX: e.clientX, lastY: e.clientY, linked });
    lastUpdateTimeRef.current = performance.now();
  }, [areas, getLinkedBorders]);

  return { containerRef, onBorderMouseDown, dragging, getLinkedBorders };
}

export type { BorderDir };