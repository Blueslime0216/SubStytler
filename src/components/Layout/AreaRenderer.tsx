import React, { useState, useCallback } from 'react';
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
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(areas, setAreas);
  const [hoveredBorders, setHoveredBorders] = useState<Set<string>>(new Set());
  const [isCalculatingHover, setIsCalculatingHover] = useState(false);

  const handleBorderMouseEnter = useCallback(async (areaId: string, dir: BorderDir) => {
    // Prevent multiple simultaneous calculations
    if (isCalculatingHover) return;
    
    setIsCalculatingHover(true);
    
    // Get all linked borders that would move together during drag
    const linkedBorders = getLinkedBorders(areaId, dir);
    const borderIds = new Set([
      `${areaId}-${dir}`,
      ...linkedBorders.map(border => `${border.id}-${border.dir}`)
    ]);
    
    // Wait for calculation to complete, then apply all hover effects simultaneously
    await new Promise(resolve => setTimeout(resolve, 0));
    
    setHoveredBorders(borderIds);
    setIsCalculatingHover(false);
  }, [getLinkedBorders, isCalculatingHover]);

  const handleBorderMouseLeave = useCallback(() => {
    setHoveredBorders(new Set());
    setIsCalculatingHover(false);
  }, []);

  const isBorderHovered = (areaId: string, dir: BorderDir) => {
    return hoveredBorders.has(`${areaId}-${dir}`);
  };

  const isBorderDragging = (areaId: string, dir: BorderDir) => {
    return dragging?.areaId === areaId && dragging?.dir === dir;
  };

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
          {/* Enhanced Border Elements with Synchronized Hover Effects */}
          {/* 좌 */}
          <div
            className={`area-border area-border-vertical ${
              isBorderDragging(area.id, 'left') ? 'dragging' : 
              isBorderHovered(area.id, 'left') ? 'hovered' : ''
            }`}
            style={{ 
              left: 0, 
              top: 0, 
              width: BORDER_THICKNESS, 
              height: '100%', 
              position: 'absolute', 
              cursor: 'ew-resize', 
              zIndex: 10 
            }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'left')}
            onMouseEnter={() => handleBorderMouseEnter(area.id, 'left')}
            onMouseLeave={handleBorderMouseLeave}
            title="Drag to resize panel horizontally"
          />
          
          {/* 우 */}
          <div
            className={`area-border area-border-vertical ${
              isBorderDragging(area.id, 'right') ? 'dragging' : 
              isBorderHovered(area.id, 'right') ? 'hovered' : ''
            }`}
            style={{ 
              right: 0, 
              top: 0, 
              width: BORDER_THICKNESS, 
              height: '100%', 
              position: 'absolute', 
              cursor: 'ew-resize', 
              zIndex: 10 
            }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'right')}
            onMouseEnter={() => handleBorderMouseEnter(area.id, 'right')}
            onMouseLeave={handleBorderMouseLeave}
            title="Drag to resize panel horizontally"
          />
          
          {/* 상 */}
          <div
            className={`area-border area-border-horizontal ${
              isBorderDragging(area.id, 'top') ? 'dragging' : 
              isBorderHovered(area.id, 'top') ? 'hovered' : ''
            }`}
            style={{ 
              left: 0, 
              top: 0, 
              width: '100%', 
              height: BORDER_THICKNESS, 
              position: 'absolute', 
              cursor: 'ns-resize', 
              zIndex: 10 
            }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'top')}
            onMouseEnter={() => handleBorderMouseEnter(area.id, 'top')}
            onMouseLeave={handleBorderMouseLeave}
            title="Drag to resize panel vertically"
          />
          
          {/* 하 */}
          <div
            className={`area-border area-border-horizontal ${
              isBorderDragging(area.id, 'bottom') ? 'dragging' : 
              isBorderHovered(area.id, 'bottom') ? 'hovered' : ''
            }`}
            style={{ 
              left: 0, 
              bottom: 0, 
              width: '100%', 
              height: BORDER_THICKNESS, 
              position: 'absolute', 
              cursor: 'ns-resize', 
              zIndex: 10 
            }}
            onMouseDown={e => onBorderMouseDown(e, area.id, 'bottom')}
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
    </div>
  );
};