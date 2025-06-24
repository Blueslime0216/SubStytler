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
  // 기본 패딩 값
  const basePadding = 14;
  const hoverPadding = 28;

  // 현재 영역이 호버 상태인지 확인하고 패딩 계산
  const getPaddingValues = () => {
    const defaultPadding = {
      paddingTop: basePadding,
      paddingRight: basePadding,
      paddingBottom: basePadding,
      paddingLeft: basePadding,
    };

    if (!hoveredBorder) return defaultPadding;

    const { areaId: hId, dir: hDir } = hoveredBorder;
    const linked = getLinkedBorders(hId, hDir);
    const affected = [{ id: hId, dir: hDir }, ...linked];
    const current = affected.find(a => a.id === area.id);

    if (!current) return defaultPadding;

    // 해당 방향의 패딩만 증가
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
        duration: dragging ? 0 : 1, // 드래그 중에는 즉시 반응
        ease: [0.25, 0.46, 0.45, 0.94], // 자연스러운 cubic-bezier
        type: "tween"
      }}
    >
      {/* 좌측 경계 - 하이라이트 제거, 투명한 상태 유지 */}
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
          opacity: 0, // 완전히 투명
        }}
        onMouseDown={e => handleBorderMouseDown(e, 'left')}
        onMouseEnter={() => handleBorderMouseEnter('left')}
        onMouseLeave={handleBorderMouseLeave}
        title="드래그하여 좌측 경계 조정"
      />
      
      {/* 우측 경계 - 하이라이트 제거, 투명한 상태 유지 */}
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
          opacity: 0, // 완전히 투명
        }}
        onMouseDown={e => handleBorderMouseDown(e, 'right')}
        onMouseEnter={() => handleBorderMouseEnter('right')}
        onMouseLeave={handleBorderMouseLeave}
        title="드래그하여 우측 경계 조정"
      />
      
      {/* 상단 경계 - 하이라이트 제거, 투명한 상태 유지 */}
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
          opacity: 0, // 완전히 투명
        }}
        onMouseDown={e => handleBorderMouseDown(e, 'top')}
        onMouseEnter={() => handleBorderMouseEnter('top')}
        onMouseLeave={handleBorderMouseLeave}
        title="드래그하여 상단 경계 조정"
      />
      
      {/* 하단 경계 - 하이라이트 제거, 투명한 상태 유지 */}
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
          opacity: 0, // 완전히 투명
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
        {renderPanel ? renderPanel(area) : null}
      </div>
    </motion.div>
  );
};