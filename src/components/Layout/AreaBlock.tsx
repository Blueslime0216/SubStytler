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

export const AreaBlock: React.FC<AreaBlockProps> = ({
  area,
  dragging,
  hoveredBorder,
  setHoveredBorder,
  getLinkedBorders,
  onBorderMouseDown,
  renderPanel,
}) => {
  // 🎨 패딩 값: 기본 상태는 넓고, 호버 시 좁아짐
  const basePadding = 28;
  const hoverPadding = 14;

  // 현재 영역의 패딩 계산
  const getPaddingValues = () => {
    const defaultPadding = {
      paddingTop: basePadding,
      paddingRight: basePadding,
      paddingBottom: basePadding,
      paddingLeft: basePadding,
    };

    // 🔧 드래그 중에는 패딩 변경 없음 (깜박임 방지)
    if (dragging) return defaultPadding;

    if (!hoveredBorder) return defaultPadding;

    const { areaId: hId, dir: hDir } = hoveredBorder;
    const linked = getLinkedBorders(hId, hDir);
    const affected = [{ id: hId, dir: hDir }, ...linked];
    const current = affected.find(a => a.id === area.id);

    if (!current) return defaultPadding;

    // 해당 방향의 패딩만 감소
    switch (current.dir) {
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
  };

  const paddingValues = getPaddingValues();

  // 기본 스타일
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${area.x}%`,
    top: `${area.y}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
    background: 'transparent',
    boxSizing: 'border-box',
    overflow: 'visible',
    zIndex: 200,
    // 🔧 하드웨어 가속 강제 활성화
    transform: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden',
    willChange: dragging ? 'transform' : 'padding',
  };

  const handleBorderMouseEnter = (dir: BorderDir) => {
    if (!dragging) setHoveredBorder({ areaId: area.id, dir });
  };
  
  const handleBorderMouseLeave = () => {
    if (!dragging) setHoveredBorder(null);
  };
  
  const handleBorderMouseDown = (e: React.MouseEvent, dir: BorderDir) => {
    setHoveredBorder({ areaId: area.id, dir });
    onBorderMouseDown(e, area.id, dir);
  };

  return (
    <motion.div
      className={`area-block ${dragging ? 'dragging' : ''}`}
      style={baseStyle}
      animate={paddingValues}
      transition={{
        // 🔧 드래그 중에는 완전히 애니메이션 비활성화
        duration: dragging ? 0 : 0.15,
        ease: "easeOut",
        type: "tween",
        // 🔧 불필요한 애니메이션 속성 제거
        bounce: 0,
        damping: 30,
        stiffness: 300,
      }}
      // 🔧 드래그 중 최적화 설정
      drag={false}
      dragConstraints={false}
      dragElastic={0}
      dragMomentum={false}
    >
      {/* 좌측 경계 */}
      <div
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
          // 🔧 하드웨어 가속
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
        }}
        onMouseDown={e => handleBorderMouseDown(e, 'left')}
        onMouseEnter={() => handleBorderMouseEnter('left')}
        onMouseLeave={handleBorderMouseLeave}
        title="드래그하여 좌측 경계 조정"
      />
      
      {/* 우측 경계 */}
      <div
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
          // 🔧 하드웨어 가속
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
        }}
        onMouseDown={e => handleBorderMouseDown(e, 'right')}
        onMouseEnter={() => handleBorderMouseEnter('right')}
        onMouseLeave={handleBorderMouseLeave}
        title="드래그하여 우측 경계 조정"
      />
      
      {/* 상단 경계 */}
      <div
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
          // 🔧 하드웨어 가속
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
        }}
        onMouseDown={e => handleBorderMouseDown(e, 'top')}
        onMouseEnter={() => handleBorderMouseEnter('top')}
        onMouseLeave={handleBorderMouseLeave}
        title="드래그하여 상단 경계 조정"
      />
      
      {/* 하단 경계 */}
      <div
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
          // 🔧 하드웨어 가속
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
        }}
        onMouseDown={e => handleBorderMouseDown(e, 'bottom')}
        onMouseEnter={() => handleBorderMouseEnter('bottom')}
        onMouseLeave={handleBorderMouseLeave}
        title="드래그하여 하단 경계 조정"
      />
      
      {/* 패널 콘텐츠 */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'visible', 
        position: 'relative', 
        zIndex: 2,
        // 🔧 하드웨어 가속
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
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