import React, { useState } from 'react';
import './AreaRenderer.css';
import { Area } from '../../types/area';
import { useAreaDrag, BorderDir } from './hooks/useAreaDrag';

interface AreaRendererProps {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  renderPanel?: (area: Area) => React.ReactNode;
}

const BORDER_THICKNESS = 8;

interface HoverOverlay {
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
}

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(areas, setAreas);
  const [hoverOverlay, setHoverOverlay] = useState<HoverOverlay | null>(null);

  const calculateOverlayBounds = (areaId: string, dir: BorderDir): HoverOverlay => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0, width: 0, height: 0, isDragging: false };

    const containerRect = container.getBoundingClientRect();
    const area = areas.find(a => a.id === areaId);
    if (!area) return { x: 0, y: 0, width: 0, height: 0, isDragging: false };

    // Get all linked borders
    const linkedBorders = getLinkedBorders(areaId, dir);
    const allBorders = [{ id: areaId, dir }, ...linkedBorders];

    // Calculate bounding box for all linked borders
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    allBorders.forEach(({ id, dir: borderDir }) => {
      const borderArea = areas.find(a => a.id === id);
      if (!borderArea) return;

      const areaX = (borderArea.x / 100) * containerRect.width;
      const areaY = (borderArea.y / 100) * containerRect.height;
      const areaWidth = (borderArea.width / 100) * containerRect.width;
      const areaHeight = (borderArea.height / 100) * containerRect.height;

      let borderX, borderY, borderWidth, borderHeight;

      switch (borderDir) {
        case 'left':
          borderX = areaX;
          borderY = areaY;
          borderWidth = BORDER_THICKNESS;
          borderHeight = areaHeight;
          break;
        case 'right':
          borderX = areaX + areaWidth - BORDER_THICKNESS;
          borderY = areaY;
          borderWidth = BORDER_THICKNESS;
          borderHeight = areaHeight;
          break;
        case 'top':
          borderX = areaX;
          borderY = areaY;
          borderWidth = areaWidth;
          borderHeight = BORDER_THICKNESS;
          break;
        case 'bottom':
          borderX = areaX;
          borderY = areaY + areaHeight - BORDER_THICKNESS;
          borderWidth = areaWidth;
          borderHeight = BORDER_THICKNESS;
          break;
        default:
          return;
      }

      minX = Math.min(minX, borderX);
      minY = Math.min(minY, borderY);
      maxX = Math.max(maxX, borderX + borderWidth);
      maxY = Math.max(maxY, borderY + borderHeight);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      isDragging: false
    };
  };

  const handleBorderMouseEnter = (areaId: string, dir: BorderDir) => {
    const overlay = calculateOverlayBounds(areaId, dir);
    setHoverOverlay(overlay);
  };

  const handleBorderMouseLeave = () => {
    if (!dragging) {
      setHoverOverlay(null);
    }
  };

  const handleBorderMouseDown = (e: React.MouseEvent, areaId: string, dir: BorderDir) => {
    // Update overlay to dragging state
    if (hoverOverlay) {
      setHoverOverlay({ ...hoverOverlay, isDragging: true });
    }
    onBorderMouseDown(e, areaId, dir);
  };

  // Update overlay position during drag
  React.useEffect(() => {
    if (dragging && hoverOverlay) {
      const overlay = calculateOverlayBounds(dragging.areaId, dragging.dir);
      setHoverOverlay({ ...overlay, isDragging: true });
    } else if (!dragging && hoverOverlay?.isDragging) {
      setHoverOverlay(null);
    }
  }, [dragging, areas]);

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
            padding: 'var(--panel-padding, 24px)',
            transition: dragging ? 'none' : 'background 0.2s',
            overflow: 'visible',
            zIndex: 200,
          }}
        >
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
              opacity: 0
            }}
            onMouseDown={e => handleBorderMouseDown(e, area.id, 'left')}
            onMouseEnter={() => handleBorderMouseEnter(area.id, 'left')}
            onMouseLeave={handleBorderMouseLeave}
            title="Drag to resize panel horizontally"
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
              opacity: 0
            }}
            onMouseDown={e => handleBorderMouseDown(e, area.id, 'right')}
            onMouseEnter={() => handleBorderMouseEnter(area.id, 'right')}
            onMouseLeave={handleBorderMouseLeave}
            title="Drag to resize panel horizontally"
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
              opacity: 0
            }}
            onMouseDown={e => handleBorderMouseDown(e, area.id, 'top')}
            onMouseEnter={() => handleBorderMouseEnter(area.id, 'top')}
            onMouseLeave={handleBorderMouseLeave}
            title="Drag to resize panel vertically"
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
              opacity: 0
            }}
            onMouseDown={e => handleBorderMouseDown(e, area.id, 'bottom')}
            onMouseEnter={() => handleBorderMouseEnter(area.id, 'bottom')}
            onMouseLeave={handleBorderMouseLeave}
            title="Drag to resize panel vertically"
          />

          {/* Panel Content */}
          <div style={{ width: '100%', height: '100%', overflow: 'visible', position: 'relative', zIndex: 2 }}>
            {renderPanel ? renderPanel(area) : null}
          </div>
        </div>
      ))}

      {/* Hover Overlay Element */}
      {hoverOverlay && (
        <div
          className={`border-hover-overlay ${hoverOverlay.isDragging ? 'dragging' : 'hovering'}`}
          style={{
            position: 'absolute',
            left: hoverOverlay.x,
            top: hoverOverlay.y,
            width: hoverOverlay.width,
            height: hoverOverlay.height,
            pointerEvents: 'none', // Allow mouse events to pass through
            zIndex: 15,
            borderRadius: '4px',
            background: 'var(--neu-base)', // Same as background
            transition: hoverOverlay.isDragging ? 'none' : 'all 0.5s ease',
          }}
        />
      )}
    </div>
  );
};