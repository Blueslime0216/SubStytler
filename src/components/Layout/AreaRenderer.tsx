import React, { useState } from 'react';
import './AreaRenderer.css';
import { Area } from '../../types/area';
import { useAreaDrag, BorderDir } from './hooks/useAreaDrag';
import { AreaBlock } from './AreaBlock';

interface AreaRendererProps {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  renderPanel?: (area: Area) => React.ReactNode;
}

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const [hoveredBorder, setHoveredBorder] = useState<{ areaId: string; dir: BorderDir } | null>(null);
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(
    areas,
    setAreas,
    setHoveredBorder
  );

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
        overflow: 'visible', // 🔧 그림자 표시를 위해 visible로 설정
      }}
    >
      {areas.map((area, index) => {
        return (
          <AreaBlock
            key={area.id}
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