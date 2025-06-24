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
  // 🎯 최적화된 패딩 계산 - 깜박거림 방지
  const basePadding = 20;    // 기본 패딩
  const hoverPadding = 8;    // 호버 시 패딩 (더 좁게)

  // 🔄 현재 영역의 패딩 상태 계산
  const getPaddingValues = React.useMemo(() => {
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
  }, [hoveredBorder, area.id, getLinkedBorders, basePadding, hoverPadding]);

  // 🎯 기본 스타일 - 최적화
  const baseStyle: React.CSSProperties = React.useMemo(() => ({
    position: 'absolute',
    left: `${area.x}%`,
    top: `${area.y}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
    background: 'transparent',
    boxSizing: 'border-box',
    overflow: 'visible',
    zIndex: 200,
  }), [area.x, area.y, area.width, area.height]);

  // 🎯 이벤트 핸들러 최적화
  const handleBorderMouseEnter = React.useCallback((dir: BorderDir) => {
    if (!dragging) {
      setHoveredBorder({ areaId: area.id, dir });
    }
  }, [dragging, setHoveredBorder, area.id]);
  
  const handleBorderMouseLeave = React.useCallback(() => {
    if (!dragging) {
      setHoveredBorder(null);
    }
  }, [dragging, setHoveredBorder]);
  
  const handleBorderMouseDown = React.useCallback((e: React.MouseEvent, dir: BorderDir) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredBorder({ areaId: area.id, dir });
    onBorderMouseDown(e, area.id, dir);
  }, [setHoveredBorder, area.id, onBorderMouseDown]);

  // 🎯 경계 요소 생성 최적화
  const borderElements = React.useMemo(() => [
    // 좌측 경계
    {
      key: 'left',
      dir: 'left' as BorderDir,
      style: {
        left: 0,
        top: 0,
        width: BORDER_THICKNESS,
        height: '100%',
        cursor: 'ew-resize',
      },
      title: '좌측 경계 드래그'
    },
    // 우측 경계
    {
      key: 'right',
      dir: 'right' as BorderDir,
      style: {
        right: 0,
        top: 0,
        width: BORDER_THICKNESS,
        height: '100%',
        cursor: 'ew-resize',
      },
      title: '우측 경계 드래그'
    },
    // 상단 경계
    {
      key: 'top',
      dir: 'top' as BorderDir,
      style: {
        left: 0,
        top: 0,
        width: '100%',
        height: BORDER_THICKNESS,
        cursor: 'ns-resize',
      },
      title: '상단 경계 드래그'
    },
    // 하단 경계
    {
      key: 'bottom',
      dir: 'bottom' as BorderDir,
      style: {
        left: 0,
        bottom: 0,
        width: '100%',
        height: BORDER_THICKNESS,
        cursor: 'ns-resize',
      },
      title: '하단 경계 드래그'
    },
  ], []);

  return (
    <motion.div
      className="area-block"
      style={baseStyle}
      animate={getPaddingValues}
      transition={{
        duration: dragging ? 0 : 0.25, // 🎯 드래그 중에는 즉시 반응
        ease: "easeOut",
        type: "tween"
      }}
      // 🚀 성능 최적화 - 불필요한 리렌더링 방지
      layout={false}
      layoutId={undefined}
    >
      {/* 🎯 경계 요소들 - 최적화된 렌더링 */}
      {borderElements.map(({ key, dir, style, title }) => (
        <div
          key={key}
          className="area-border"
          style={{
            ...style,
            position: 'absolute',
            zIndex: 10,
            background: 'transparent',
            opacity: 0,
          }}
          onMouseDown={e => handleBorderMouseDown(e, dir)}
          onMouseEnter={() => handleBorderMouseEnter(dir)}
          onMouseLeave={handleBorderMouseLeave}
          title={title}
        />
      ))}
      
      {/* 🎨 패널 콘텐츠 */}
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