import React, { useEffect } from 'react';
import './AreaRenderer.css';
import { Area } from '../../types/area';
import { useAreaDrag, BorderDir } from './hooks/useAreaDrag';
import { AreaBlock } from './AreaBlock';
import { usePaddingHover } from './usePaddingHover';

interface AreaRendererProps {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  renderPanel?: (area: Area) => React.ReactNode;
}

export const AreaRenderer: React.FC<AreaRendererProps> = ({ areas, setAreas, renderPanel }) => {
  const { containerRef, onBorderMouseDown, dragging, getLinkedBorders } = useAreaDrag(areas, setAreas);
  const [hoveredBorder, setHoveredBorder] = usePaddingHover(dragging);

  // 🔧 드래그 상태에 따른 전역 클래스 관리
  useEffect(() => {
    if (dragging) {
      document.body.classList.add('dragging-active');
    } else {
      document.body.classList.remove('dragging-active');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.classList.remove('dragging-active');
    };
  }, [dragging]);

  console.log('🎨 AreaRenderer 렌더링:', { 
    areasCount: areas.length, 
    isDragging: !!dragging,
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
        overflow: 'visible',
        // 🔧 하드웨어 가속 강제 활성화
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        willChange: dragging ? 'transform' : 'auto',
      }}
    >
      {areas.map((area, index) => {
        console.log(`🎯 Area ${index} 렌더링:`, area);
        return (
          <AreaBlock
            key={`${area.id}-${area.x}-${area.y}-${area.width}-${area.height}`} // 🔧 더 고유한 키
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