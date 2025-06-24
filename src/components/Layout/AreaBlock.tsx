import React from 'react';
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
  // 패딩 계산 로직 복사
  const base = 14;
  const hover = 24;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${area.x}%`,
    top: `${area.y}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
    background: 'transparent',
    boxSizing: 'border-box',
    paddingTop: `${base}px`,
    paddingRight: `${base}px`,
    paddingBottom: `${base}px`,
    paddingLeft: `${base}px`,
    transition: 'padding 0.3s ease',
    overflow: 'visible',
    zIndex: 200,
  };
  if (hoveredBorder) {
    const { areaId: hId, dir: hDir } = hoveredBorder;
    const linked = getLinkedBorders(hId, hDir);
    const affected = [{ id: hId, dir: hDir }, ...linked];
    const current = affected.find(a => a.id === area.id);
    if (current) {
      switch (current.dir) {
        case 'left': style.paddingLeft = `${hover}px`; break;
        case 'right': style.paddingRight = `${hover}px`; break;
        case 'top': style.paddingTop = `${hover}px`; break;
        case 'bottom': style.paddingBottom = `${hover}px`; break;
      }
    }
  }

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
    <div className={`area-block ${dragging ? 'dragging' : ''}`} style={style}>
      {/* Invisible Border Elements for Mouse Events */}
      {/* 좌 */}
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
      />
      {/* 우 */}
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
      />
      {/* 상 */}
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
      />
      {/* 하 */}
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
      />
      {/* Panel Content */}
      <div style={{ width: '100%', height: '100%', overflow: 'visible', position: 'relative', zIndex: 2 }}>
        {renderPanel ? renderPanel(area) : null}
      </div>
    </div>
  );
}; 