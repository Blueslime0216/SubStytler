import React, { useRef, useState, useEffect } from 'react';
import './AreaRenderer.css';

// Area 타입 정의
interface Area {
  id: string;
  x: number; // %
  y: number; // %
  width: number; // %
  height: number; // %
  minWidth: number;
  minHeight: number;
}

type BorderDir = 'left' | 'right' | 'top' | 'bottom';
interface LinkedArea { id: string; dir: BorderDir; }

interface AreaRendererProps {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  renderPanel?: (area: Area) => React.ReactNode;
}

const BORDER_THICKNESS = 8;
const EPSILON = 0.01;

function getOppositeDir(dir: BorderDir): BorderDir {
  return dir === 'left' ? 'right' : dir === 'right' ? 'left' : dir === 'top' ? 'bottom' : 'top';
}

function getAdjacentAreas(areas: Area[], area: Area, dir: BorderDir) {
  // 같은 선상에 있는 인접 area를 모두 반환
  if (dir === 'left') {
    return areas.filter(a =>
      a.id !== area.id &&
      Math.abs(a.x + a.width - area.x) < EPSILON &&
      a.y < area.y + area.height &&
      a.y + a.height > area.y
    );
  }
  if (dir === 'right') {
    return areas.filter(a =>
      a.id !== area.id &&
      Math.abs(area.x + area.width - a.x) < EPSILON &&
      a.y < area.y + area.height &&
      a.y + a.height > area.y
    );
  }
  if (dir === 'top') {
    return areas.filter(a =>
      a.id !== area.id &&
      Math.abs(a.y + a.height - area.y) < EPSILON &&
      a.x < area.x + area.width &&
      a.x + a.width > area.x
    );
  }
  if (dir === 'bottom') {
    return areas.filter(a =>
      a.id !== area.id &&
      Math.abs(area.y + area.height - a.y) < EPSILON &&
      a.x < area.x + area.width &&
      a.x + a.width > area.x
    );
  }
  return [];
}

function detectLinkedAreas(
  areas: Area[],
  startArea: Area,
  dir: BorderDir,
  visited: Set<string>,
  result: LinkedArea[]
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

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const [dragging, setDragging] = useState<null | {
    areaId: string;
    dir: BorderDir;
    lastX: number;
    lastY: number;
    linked: LinkedArea[];
  }>(null);
  const draggingRef = useRef<typeof dragging>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const areasRef = useRef<Area[]>(areas);

  // 항상 최신 dragging 값을 ref에 저장
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  // 드래그 중
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
      const areaIdx = currentAreas.findIndex((a: Area) => a.id === areaId);
      if (areaIdx === -1) return;
      let newAreas = currentAreas.map(a => ({ ...a }));
      // 기준 area
      const area = newAreas[areaIdx];
      // 모든 이동 대상: 기준 area + linked
      const allLinked: LinkedArea[] = [ { id: areaId, dir }, ...linked ];
      // --- clamp(여유분) 실시간 재계산 (증분 방향별) ---
      let limitPos = Infinity; // dxRaw > 0 또는 dyRaw > 0
      let limitNeg = Infinity; // dxRaw < 0 또는 dyRaw < 0

      const isHorizontal = dir === 'left' || dir === 'right';

      for (const { id, dir: moveDir } of allLinked) {
        const a = newAreas.find((a: Area) => a.id === id)!;
        const capacity = isHorizontal ? (a.width - a.minWidth) : (a.height - a.minHeight);

        if (isHorizontal) {
          if (moveDir === 'left') {
            // border가 오른쪽(+pos)으로 이동하면 이 area는 shrink, 왼쪽(-neg) 이동하면 expand
            limitPos = Math.min(limitPos, capacity);
          } else {
            // moveDir === 'right'
            // border가 왼쪽(-neg) 이동하면 shrink
            limitNeg = Math.min(limitNeg, capacity);
          }
        } else {
          if (moveDir === 'top') {
            // border가 아래(+pos) 이동 -> shrink
            limitPos = Math.min(limitPos, capacity);
          } else {
            // moveDir === 'bottom'
            // border가 위(-neg) 이동 -> shrink
            limitNeg = Math.min(limitNeg, capacity);
          }
        }
      }

      // EPSILON 보정
      limitPos = Math.max(0, limitPos - EPSILON);
      limitNeg = Math.max(0, limitNeg - EPSILON);
      // --- clamp 적용 ---
      let move = 0;
      if (dir === 'left' || dir === 'right') {
        if (dxRaw < 0) {
          move = clamp(dxRaw, -limitNeg, 0);
        } else {
          move = clamp(dxRaw, 0, limitPos);
        }
      } else {
        if (dyRaw < 0) {
          move = clamp(dyRaw, -limitNeg, 0);
        } else {
          move = clamp(dyRaw, 0, limitPos);
        }
      }
      // 실제 이동 적용
      for (const { id, dir: moveDir } of allLinked) {
        const a = newAreas.find((a: Area) => a.id === id)!;
        if (moveDir === 'left') {
          a.x += move;
          a.width -= move;
        } else if (moveDir === 'right') {
          a.width += move;
        } else if (moveDir === 'top') {
          a.y += move;
          a.height -= move;
        } else if (moveDir === 'bottom') {
          a.height += move;
        }
      }
      setAreas(newAreas);
      if (draggingRef.current) {
        draggingRef.current.lastX = e.clientX;
        draggingRef.current.lastY = e.clientY;
      }
    };
    const onMouseUp = () => {
      setDragging(null);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, setAreas]);

  // 드래그 시작 시마다 항상 최신 areas로 linkedAreas를 재탐색하고, shrink/expandLimit, 각 영역의 크기/최소크기를 콘솔에 출력
  const onBorderMouseDown = (e: React.MouseEvent, areaId: string, dir: BorderDir) => {
    e.preventDefault();
    const area = areas.find(a => a.id === areaId)!;
    const visited = new Set<string>();
    visited.add(area.id);
    const linked: LinkedArea[] = [];
    detectLinkedAreas(areas, area, dir, visited, linked);
    const allLinked: LinkedArea[] = [ { id: areaId, dir }, ...linked ];
    // shrink/expandLimit 계산
    let shrinkLimit = Infinity;
    let expandLimit = Infinity;
    const debugInfo = [];
    for (const { id, dir: moveDir } of allLinked) {
      const a = areas.find(a => a.id === id)!;
      if (moveDir === 'left' || moveDir === 'right') {
        const canShrink = a.width - a.minWidth;
        shrinkLimit = Math.min(shrinkLimit, canShrink);
        expandLimit = Math.min(expandLimit, canShrink);
        debugInfo.push({ id, dir: moveDir, width: a.width, minWidth: a.minWidth, canShrink });
      } else if (moveDir === 'top' || moveDir === 'bottom') {
        const canShrink = a.height - a.minHeight;
        shrinkLimit = Math.min(shrinkLimit, canShrink);
        expandLimit = Math.min(expandLimit, canShrink);
        debugInfo.push({ id, dir: moveDir, height: a.height, minHeight: a.minHeight, canShrink });
      }
    }
    shrinkLimit = Math.max(0, shrinkLimit - EPSILON);
    expandLimit = Math.max(0, expandLimit - EPSILON);
    console.log('[DRAG START] area:', areaId, 'dir:', dir, 'linked:', allLinked, 'shrinkLimit:', shrinkLimit, 'expandLimit:', expandLimit, 'debug:', debugInfo);
    setDragging({
      areaId,
      dir,
      lastX: e.clientX,
      lastY: e.clientY,
      linked,
    });
  };

  // 최신 areas 값을 ref에 저장하여 이벤트 핸들러에서 항상 최신 상태 사용
  useEffect(() => {
    areasRef.current = areas;
  }, [areas]);

  return (
    <div
      ref={containerRef}
      className="area-layout-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        background: 'transparent',
        zIndex: 10,
      }}
    >
      {areas.map(area => (
        <div
          key={area.id}
          className="area-block"
          style={{
            position: 'absolute',
            left: `${area.x}%`,
            top: `${area.y}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            background: 'transparent',
            boxSizing: 'border-box',
            padding: 'var(--panel-padding, 24px)', // 공간 확보 - CSS 변수화
            // borderRadius: 8,
            transition: dragging ? 'none' : 'background 0.2s',
            overflow: 'visible',
            zIndex: 200,
          }}
        >
          {/* 네 방향 경계선 */}
          {/* 좌 */}
          <div
            className="area-border area-border-vertical"
            style={{ left: 0, top: 0, width: BORDER_THICKNESS, height: '100%', position: 'absolute', cursor: 'ew-resize', zIndex: 10, background: 'transparent', opacity: 0 /* Area의 경계 */ }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'left')}
          />
          {/* 우 */}
          <div
            className="area-border area-border-vertical"
            style={{ right: 0, top: 0, width: BORDER_THICKNESS, height: '100%', position: 'absolute', cursor: 'ew-resize', zIndex: 10, background: 'transparent', opacity: 0 }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'right')}
          />
          {/* 상 */}
          <div
            className="area-border area-border-horizontal"
            style={{ left: 0, top: 0, width: '100%', height: BORDER_THICKNESS, position: 'absolute', cursor: 'ns-resize', zIndex: 10, background: 'transparent', opacity: 0 }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'top')}
          />
          {/* 하 */}
          <div
            className="area-border area-border-horizontal"
            style={{ left: 0, bottom: 0, width: '100%', height: BORDER_THICKNESS, position: 'absolute', cursor: 'ns-resize', zIndex: 10, background: 'transparent', opacity: 0 }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'bottom')}
          />

          {/* Panel Content */}
          <div style={{ width: '100%', height: '100%', overflow: 'visible', position: 'relative', zIndex: 2 }}>
            {renderPanel ? renderPanel(area) : null}
          </div>
        </div>
      ))}
    </div>
  );
};