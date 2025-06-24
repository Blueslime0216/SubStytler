import React from 'react';
import { motion } from 'framer-motion';
import { Area } from '../../types/area';
import { BorderDir, LinkedArea } from './hooks/areaDragUtils';

interface AreaBlockProps {
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

const BORDER_THICKNESS = 8;

const AreaBlockComponent: React.FC<AreaBlockProps> = ({
  area,
  dragging,
  hoveredBorder,
  setHoveredBorder,
  getLinkedBorders,
  onBorderMouseDown,
  renderPanel,
}) => {
  // 🎨 패딩 값: 기본 상태는 넓고, 호버 시 좁아짐 (자연스러운 효과)
  const basePadding = 28;    // 기본: 넓은 패딩
  const hoverPadding = 10;   // 호버: 더 좁은 패딩

  // 🔧 성능 최적화: 메모이제이션된 패딩 계산
  const getPaddingValues = React.useMemo(() => {
    const defaultPadding = {
      paddingTop: basePadding,
      paddingRight: basePadding,
      paddingBottom: basePadding,
      paddingLeft: basePadding,
    };

    let affectedBorder: LinkedArea | undefined;

    if (dragging) {
      // 드래그 중에는 dragging 상태를 기준으로 패딩을 결정 (안정적)
      const allAffected: LinkedArea[] = [{ id: dragging.areaId, dir: dragging.dir }, ...dragging.linked];
      affectedBorder = allAffected.find(a => a.id === area.id);
    } else if (hoveredBorder) {
      // 호버 중에는 hoveredBorder 상태를 사용
      const { areaId: hId, dir: hDir } = hoveredBorder;
      const linked = getLinkedBorders(hId, hDir);
      const allAffected: LinkedArea[] = [{ id: hId, dir: hDir }, ...linked];
      affectedBorder = allAffected.find(a => a.id === area.id);
    }

    if (!affectedBorder) return defaultPadding;

    // 해당 방향의 패딩만 감소
    switch (affectedBorder.dir) {
      case 'left':
        return { ...defaultPadding, paddingLeft: hoverPadding };
      case 'right':
        return { ...defaultPadding, paddingRight: hoverPadding };
      case 'top':
        return { ...defaultPadding, paddingTop: hoverPadding };
      case 'bottom':
        return { ...defaultPadding, paddingBottom: hoverPadding };
      default:
        return defaultPadding;
    }
  }, [area.id, dragging, hoveredBorder, getLinkedBorders]);

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

  // 🔧 성능 최적화: 경계 요소들을 메모이제이션
  const borderElements = React.useMemo(() => [
    // 좌측 경계
    <div
      key="left"
      className="area-border area-border-vertical"
      style={{
        left: 0,
        top: 0,
        width: BORDER_THICKNESS,
        height: '100%',
        position: 'absolute',
        cursor: 'ew-resize',
        zIndex: 10,
        background: 'transparent',
        opacity: 0,
      }}
      onMouseDown={e => handleBorderMouseDown(e, 'left')}
      onMouseEnter={() => handleBorderMouseEnter('left')}
      onMouseLeave={handleBorderMouseLeave}
      title="드래그하여 좌측 경계 조정"
    />,
    
    // 우측 경계
    <div
      key="right"
      className="area-border area-border-vertical"
      style={{
        right: 0,
        top: 0,
        width: BORDER_THICKNESS,
        height: '100%',
        position: 'absolute',
        cursor: 'ew-resize',
        zIndex: 10,
        background: 'transparent',
        opacity: 0,
      }}
      onMouseDown={e => handleBorderMouseDown(e, 'right')}
      onMouseEnter={() => handleBorderMouseEnter('right')}
      onMouseLeave={handleBorderMouseLeave}
      title="드래그하여 우측 경계 조정"
    />,
    
    // 상단 경계
    <div
      key="top"
      className="area-border area-border-horizontal"
      style={{
        left: 0,
        top: 0,
        width: '100%',
        height: BORDER_THICKNESS,
        position: 'absolute',
        cursor: 'ns-resize',
        zIndex: 10,
        background: 'transparent',
        opacity: 0,
      }}
      onMouseDown={e => handleBorderMouseDown(e, 'top')}
      onMouseEnter={() => handleBorderMouseEnter('top')}
      onMouseLeave={handleBorderMouseLeave}
      title="드래그하여 상단 경계 조정"
    />,
    
    // 하단 경계
    <div
      key="bottom"
      className="area-border area-border-horizontal"
      style={{
        left: 0,
        bottom: 0,
        width: '100%',
        height: BORDER_THICKNESS,
        position: 'absolute',
        cursor: 'ns-resize',
        zIndex: 10,
        background: 'transparent',
        opacity: 0,
      }}
      onMouseDown={e => handleBorderMouseDown(e, 'bottom')}
      onMouseEnter={() => handleBorderMouseEnter('bottom')}
      onMouseLeave={handleBorderMouseLeave}
      title="드래그하여 하단 경계 조정"
    />
  ], [handleBorderMouseDown, handleBorderMouseEnter, handleBorderMouseLeave]);

  return (
    <motion.div
      className={`area-block ${dragging ? 'dragging' : ''}`}
      style={baseStyle}
      initial={false}
      animate={getPaddingValues}
      transition={{
        duration: dragging ? 0 : 0.15, // 🔧 드래그 중에는 즉시 반응, 평상시 더 빠른 애니메이션
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
          <div className="w-full h-full flex items-center justify-center neu-text-secondary">
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
  
  const hoveredBorderChanged = (
    prevProps.hoveredBorder?.areaId !== nextProps.hoveredBorder?.areaId ||
    prevProps.hoveredBorder?.dir !== nextProps.hoveredBorder?.dir
  );
  
  // 변경사항이 없으면 리렌더링 방지
  return !areaChanged && !draggingChanged && !hoveredBorderChanged;
});