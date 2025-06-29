import React from 'react';
import { motion } from 'framer-motion';
import { Area } from '../../types/area';
import { BorderDir, LinkedArea, getAdjacentAreas } from './hooks/areaDragUtils';

interface AreaBlockProps {
  areas: Area[]; // All areas in the layout – needed to decide which borders should be draggable
  area: Area;
  dragging: any;
  hoveredBorder: { areaId: string; dir: BorderDir } | null;
  setHoveredBorder: (v: { areaId: string; dir: BorderDir } | null) => void;
  getLinkedBorders: (areaId: string, dir: BorderDir) => LinkedArea[];
  onBorderMouseDown: (
    e: React.MouseEvent,
    areaId: string,
    dir: BorderDir
  ) => void;
  renderPanel?: (area: Area) => React.ReactNode;
}

const BORDER_THICKNESS = 20;

const AreaBlockComponent: React.FC<AreaBlockProps> = ({
  areas,
  area,
  dragging,
  hoveredBorder,
  setHoveredBorder,
  getLinkedBorders,
  onBorderMouseDown,
  renderPanel,
}) => {
  // 🎨 패딩 값: 기본 상태는 넓고, 호버 시 좁아짐 (자연스러운 효과)
  const basePadding = 8;    // 기본: 넓은 패딩
  const dragPadding = 4;    // 드래그 중: 축소 패딩

  // 🔧 성능 최적화: 메모이제이션된 패딩 계산
  const getPaddingValues = React.useMemo(() => {
    const defaultPadding = {
      paddingTop: basePadding,
      paddingRight: basePadding,
      paddingBottom: basePadding,
      paddingLeft: basePadding,
    };

    // 드래그 중이 아닐 때는 패딩 변화를 주지 않음
    if (!dragging) return defaultPadding;

    // 드래그로 영향을 받는 영역인지 확인
    const allAffected: LinkedArea[] = [{ id: dragging.areaId, dir: dragging.dir }, ...dragging.linked];
    const affectedBorder = allAffected.find(a => a.id === area.id);

    if (!affectedBorder) return defaultPadding;

    // 해당 방향의 패딩만 감소
    switch (affectedBorder.dir) {
      case 'left':
        return { ...defaultPadding, paddingLeft: dragPadding };
      case 'right':
        return { ...defaultPadding, paddingRight: dragPadding };
      case 'top':
        return { ...defaultPadding, paddingTop: dragPadding };
      case 'bottom':
        return { ...defaultPadding, paddingBottom: dragPadding };
      default:
        return defaultPadding;
    }
  }, [area.id, dragging]);

  // 🔧 성능 최적화: 기본 스타일 메모이제이션
  const baseStyle = React.useMemo((): React.CSSProperties => ({
    position: 'absolute',
    left: `${area.x}%`,
    top: `${area.y}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
    background: 'transparent',
    boxSizing: 'border-box',
    overflow: 'visible',
    zIndex: 200,
    // 🔧 성능 최적화를 위한 GPU 가속
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    willChange: dragging ? 'padding' : 'auto',
  }), [area.x, area.y, area.width, area.height, dragging]);

  // 🔧 성능 최적화: 이벤트 핸들러 메모이제이션
  const handleBorderMouseEnter = React.useCallback((dir: BorderDir) => {
    if (!dragging) setHoveredBorder({ areaId: area.id, dir });
  }, [dragging, setHoveredBorder, area.id]);
  
  const handleBorderMouseLeave = React.useCallback(() => {
    if (!dragging) setHoveredBorder(null);
  }, [dragging, setHoveredBorder]);
  
  const handleBorderMouseDown = React.useCallback((e: React.MouseEvent, dir: BorderDir) => {
    setHoveredBorder({ areaId: area.id, dir });
    onBorderMouseDown(e, area.id, dir);
  }, [setHoveredBorder, onBorderMouseDown, area.id]);

  // 🔧 경계 요소들을 메모이제이션하여 필요할 때만 렌더링
  const borderElements = React.useMemo(() => {
    // 각 방향에 인접 영역이 있는지 계산
    const interactive: Record<BorderDir, boolean> = {
      left: getAdjacentAreas(areas, area, 'left').length > 0,
      right: getAdjacentAreas(areas, area, 'right').length > 0,
      top: getAdjacentAreas(areas, area, 'top').length > 0,
      bottom: getAdjacentAreas(areas, area, 'bottom').length > 0,
    };

    const elems: React.ReactNode[] = [];

    const maybeAdd = (dir: BorderDir, style: React.CSSProperties, cursor: string) => {
      if (!interactive[dir]) return;
      elems.push(
        <div
          key={dir}
          className={`area-border ${dir === 'left' || dir === 'right' ? 'area-border-vertical' : 'area-border-horizontal'}`}
          style={{
            ...style,
            position: 'absolute',
            cursor,
            zIndex: 10,
            background: 'transparent',
            opacity: 0,
          }}
          onMouseDown={e => handleBorderMouseDown(e, dir)}
          onMouseEnter={() => handleBorderMouseEnter(dir)}
          onMouseLeave={handleBorderMouseLeave}
        />
      );
    };

    // 좌측 경계
    maybeAdd('left', {
      left: 0,
      top: 0,
      width: BORDER_THICKNESS,
      height: '100%',
    }, 'ew-resize');

    // 우측 경계
    maybeAdd('right', {
      right: 0,
      top: 0,
      width: BORDER_THICKNESS,
      height: '100%',
    }, 'ew-resize');

    // 상단 경계
    maybeAdd('top', {
      left: 0,
      top: 0,
      width: '100%',
      height: BORDER_THICKNESS,
    }, 'ns-resize');

    // 하단 경계
    maybeAdd('bottom', {
      left: 0,
      bottom: 0,
      width: '100%',
      height: BORDER_THICKNESS,
    }, 'ns-resize');

    return elems;
  }, [areas, area, handleBorderMouseDown, handleBorderMouseEnter, handleBorderMouseLeave]);

  return (
    <motion.div
      className={`area-block ${dragging ? 'dragging' : ''} bg-transparent rounded transition-all duration-200 border-none outline-none`}
      style={baseStyle}
      initial={false}
      animate={getPaddingValues}
      transition={{
        duration: 0.1,
        ease: "easeOut",
        type: "tween"
      }}
    >
      {/* 🔧 성능 최적화: 메모이제이션된 경계 요소들 */}
      {borderElements}
      
      {/* 패널 콘텐츠 */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'visible', 
        position: 'relative', 
        zIndex: 2 
      }}>
        {renderPanel ? renderPanel(area) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary">
            <p className="text-sm">패널 ID: {area.id}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 🔧 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지 + 더 정교한 비교
export const AreaBlock = React.memo(AreaBlockComponent, (prevProps, nextProps) => {
  // 🔧 최적화된 비교 로직: 필요한 속성만 비교하여 불필요한 리렌더링 방지
  const areaChanged = (
    prevProps.area.id !== nextProps.area.id ||
    prevProps.area.x !== nextProps.area.x ||
    prevProps.area.y !== nextProps.area.y ||
    prevProps.area.width !== nextProps.area.width ||
    prevProps.area.height !== nextProps.area.height
  );
  
  const draggingChanged = (
    prevProps.dragging?.areaId !== nextProps.dragging?.areaId ||
    prevProps.dragging?.dir !== nextProps.dragging?.dir
  );
  
  // 호버 상태는 패딩에 영향을 주지 않으므로 리렌더링 조건에서 제외
  const hoveredBorderChanged = false;
  const areasChanged = prevProps.areas !== nextProps.areas;
  
  // 변경사항이 없으면 리렌더링 방지
  return !areaChanged && !draggingChanged && !hoveredBorderChanged && !areasChanged;
});