import React from 'react';
import './AreaRenderer.css';
import { Area } from '../../types/area';
import { useAreaDrag, BorderDir } from './hooks/useAreaDrag';
import { AreaBlock } from './AreaBlock.tsx';
import { usePaddingHover } from './usePaddingHover.ts';

interface AreaRendererProps {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  renderPanel?: (area: Area) => React.ReactNode;
}

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(areas, setAreas);
  const [hoveredBorder, setHoveredBorder] = usePaddingHover(dragging);

  console.log('🎨 AreaRenderer 렌더링:', { 
    areasCount: areas.length, 
    areas: areas.map(a => ({ id: a.id, x: a.x, y: a.y, width: a.width, height: a.height }))
  });

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
      {areas.map((area, index) => {
        console.log(`🎯 Area ${index + 1} 렌더링:`, area);
        
        return (
          <AreaBlock
            key={`${area.id}-${area.x}-${area.y}-${area.width}-${area.height}`} // 🔑 고유 키 생성
            area={area}
            dragging={dragging}
            hoveredBorder={hoveredBorder}
            setHoveredBorder={setHoveredBorder}
            getLinkedBorders={getLinkedBorders}
            onBorderMouseDown={onBorderMouseDown}
            renderPanel={renderPanel}
          />
        );
      })}
    </div>
  );
};