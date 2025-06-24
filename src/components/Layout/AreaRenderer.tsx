import React, { memo } from 'react';
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

// 🚀 메모이제이션으로 불필요한 리렌더링 방지
export const AreaRenderer: React.FC<AreaRendererProps> = memo(({ areas, setAreas, renderPanel }) => {
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(areas, setAreas);
  const [hoveredBorder, setHoveredBorder] = usePaddingHover(dragging);

  console.log('🎨 AreaRenderer 렌더링:', { 
    areasCount: areas.length, 
    dragging: !!dragging,
    hoveredBorder: hoveredBorder?.areaId
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
        // 🎯 안정적인 키 생성 - 깜박거림 방지
        const stableKey = `area-${area.id}-${Math.round(area.x)}-${Math.round(area.y)}`;
        
        return (
          <AreaBlock
            key={stableKey}
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
});

// 🎯 디스플레이 이름 설정
AreaRenderer.displayName = 'AreaRenderer';