import React from 'react';
import './AreaRenderer.css';
import { Area } from '../../types/area';
import { useAreaDrag, BorderDir } from './hooks/useAreaDrag';

interface AreaRendererProps {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  renderPanel?: (area: Area) => React.ReactNode;
}

const BORDER_THICKNESS = 8;

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const { containerRef, onBorderMouseDown, dragging } = useAreaDrag(areas, setAreas);

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