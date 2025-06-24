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

const BORDER_THICKNESS = 8;

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(areas, setAreas);
  const [hoveredBorder, setHoveredBorder] = usePaddingHover(dragging);

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
      ))}
    </div>
  );
};