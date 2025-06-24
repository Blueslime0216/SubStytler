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
  // 🎨 패딩 값: 기본 상태는 넓고, 호버 시 좁아짐 (자연스러운 효과)
  const basePadding = 28;    // 기본: 넓은 패딩
  const hoverPadding = 14;   // 호버: 좁은 패딩

  // 현재 영역의 패딩 계산
  const getPaddingValues = () => {
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
    overflow: 'visible', // 🔧 그림자 표시
    zIndex: 200,
    // 🔧 깜박임 방지를 위한 최적화
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    willChange: dragging ? 'padding' : 'auto',
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

  console.log(`🎯 AreaBlock 렌더링: ${area.id}`, { 
    position: { x: area.x, y: area.y }, 
    size: { width: area.width, height: area.height },
    padding: paddingValues
  });

  return (
    <motion.div
      className={`area-block ${dragging ? 'dragging' : ''}`}
      style={baseStyle}
      initial={paddingValues}
      animate={paddingValues}
      transition={{
        duration: dragging ? 0 : 0.2, // 🔧 드래그 중에는 즉시 반응 (깜박임 방지)
        ease: "easeOut",
        type: "tween"
      }}
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