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
  isHovering: boolean;
  isFadingInner: boolean;
  isFadingOuter: boolean;
}

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(areas, setAreas);
  const [hoverOverlay, setHoverOverlay] = useState<HoverOverlay | null>(null);
  const [currentHoveredBorder, setCurrentHoveredBorder] = useState<{areaId: string, dir: BorderDir} | null>(null);

  const calculateOverlayBounds = (areaId: string, dir: BorderDir): Omit<HoverOverlay, 'isDragging' | 'isHovering' | 'isFadingInner' | 'isFadingOuter'> => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0, width: 0, height: 0 };

    const containerRect = container.getBoundingClientRect();
    const area = areas.find(a => a.id === areaId);
    if (!area) return { x: 0, y: 0, width: 0, height: 0 };

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
      height: maxY - minY
    };
  };

  const handleBorderMouseEnter = (areaId: string, dir: BorderDir) => {
    setCurrentHoveredBorder({ areaId, dir });
    const overlayBounds = calculateOverlayBounds(areaId, dir);
    setHoverOverlay({
      ...overlayBounds,
      isDragging: false,
      isHovering: true,
      isFadingInner: false,
      isFadingOuter: false
    });
  };

  const handleBorderMouseLeave = (areaId: string, dir: BorderDir) => {
    // Only clear if we're leaving the same border we entered
    if (currentHoveredBorder?.areaId === areaId && currentHoveredBorder?.dir === dir) {
      setCurrentHoveredBorder(null);
      
      if (hoverOverlay && !hoverOverlay.isDragging) {
        // Start fade out animation
        setHoverOverlay({
          ...hoverOverlay,
          isHovering: false,
          isFadingOuter: true
        });
        
        // Remove overlay after fade animation
        setTimeout(() => {
          setHoverOverlay(null);
        }, 300);
      }
    }
  };

  const handleBorderMouseDown = (e: React.MouseEvent, areaId: string, dir: BorderDir) => {
    // Update overlay to dragging state immediately
    if (hoverOverlay) {
      setHoverOverlay({
        ...hoverOverlay,
        isDragging: true,
        isHovering: true,
        isFadingInner: false,
        isFadingOuter: false
      });
    }
    onBorderMouseDown(e, areaId, dir);
  };

  // Update overlay position during drag with exact synchronization
  React.useEffect(() => {
    if (dragging && hoverOverlay && hoverOverlay.isDragging) {
      // Calculate new position immediately when areas change
      const overlayBounds = calculateOverlayBounds(dragging.areaId, dragging.dir);
      setHoverOverlay(prev => prev ? {
        ...overlayBounds,
        isDragging: true,
        isHovering: true,
        isFadingInner: false,
        isFadingOuter: false
      } : null);
    }
  }, [areas, dragging]);

  // Handle drag end
  React.useEffect(() => {
    if (!dragging && hoverOverlay?.isDragging) {
      // Check if mouse is still over the border
      if (currentHoveredBorder) {
        // Start fade inner shadow animation
        setHoverOverlay(prev => prev ? {
          ...prev,
          isDragging: false,
          isFadingInner: true
        } : null);
        
        // After inner fade, return to hover state
        setTimeout(() => {
          setHoverOverlay(prev => prev ? {
            ...prev,
            isFadingInner: false
          } : null);
        }, 100);
      } else {
        // Mouse is not over border, fade out completely
        setHoverOverlay(prev => prev ? {
          ...prev,
          isDragging: false,
          isHovering: false,
          isFadingOuter: true
        } : null);
        
        setTimeout(() => {
          setHoverOverlay(null);
        }, 300);
      }
    }
  }, [dragging, currentHoveredBorder]);

  const getOverlayClassName = () => {
    if (!hoverOverlay) return '';
    
    let className = 'border-hover-overlay';
    
    if (hoverOverlay.isFadingOuter) {
      className += ' fading-outer';
    } else if (hoverOverlay.isFadingInner) {
      className += ' fading-inner';
    } else if (hoverOverlay.isDragging) {
      className += ' dragging';
    } else if (hoverOverlay.isHovering) {
      className += ' hovering';
    }
    
    return className;
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
            onMouseLeave={() => handleBorderMouseLeave(area.id, 'left')}
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
            onMouseLeave={() => handleBorderMouseLeave(area.id, 'right')}
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
            onMouseLeave={() => handleBorderMouseLeave(area.id, 'top')}
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
            onMouseLeave={() => handleBorderMouseLeave(area.id, 'bottom')}
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
          className={getOverlayClassName()}
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
          }}
        />
      )}
    </div>
  );
};