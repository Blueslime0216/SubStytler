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

const BORDER_THICKNESS = 20;

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
  const dragPadding = 10;    // 드래그 중: 축소 패딩

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
        duration: 0.1, // 드래그 시작 및 종료 모두 0.1초 애니메이션
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
  
  // 호버 상태는 패딩에 영향을 주지 않으므로 리렌더링 조건에서 제외
  const hoveredBorderChanged = false;
  
  // 변경사항이 없으면 리렌더링 방지
  return !areaChanged && !draggingChanged && !hoveredBorderChanged;
});