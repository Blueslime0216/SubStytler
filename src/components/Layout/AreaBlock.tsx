import React, { useEffect, useRef } from 'react';
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
  const blockRef = useRef<HTMLDivElement>(null);

  // 기본 스타일 - 패딩 제거, CSS에서 완전 처리
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${area.x}%`,
    top: `${area.y}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
    background: 'transparent',
    boxSizing: 'border-box',
    overflow: 'visible',
    zIndex: 200,
  };

  // 호버 상태에 따른 CSS 클래스 직접 조작 (React 리렌더링 우회)
  useEffect(() => {
    const element = blockRef.current;
    if (!element) return;

    // 모든 패딩 클래스 제거
    element.classList.remove(
      'hover-padding-left',
      'hover-padding-right', 
      'hover-padding-top',
      'hover-padding-bottom'
    );

    // 호버된 경계에 따른 패딩 클래스 추가
    if (hoveredBorder) {
      const { areaId: hId, dir: hDir } = hoveredBorder;
      const linked = getLinkedBorders(hId, hDir);
      const affected = [{ id: hId, dir: hDir }, ...linked];
      const current = affected.find(a => a.id === area.id);
      
      if (current) {
        switch (current.dir) {
          case 'left': 
            element.classList.add('hover-padding-left');
            break;
          case 'right': 
            element.classList.add('hover-padding-right');
            break;
          case 'top': 
            element.classList.add('hover-padding-top');
            break;
          case 'bottom': 
            element.classList.add('hover-padding-bottom');
            break;
        }
      }
    }

    // 드래그 상태 처리
    if (dragging) {
      element.classList.add('dragging');
    } else {
      element.classList.remove('dragging');
    }
  }, [hoveredBorder, dragging, area.id, getLinkedBorders]);

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
    <div 
      ref={blockRef}
      key={area.id} // React 요소 재사용 보장
      className="area-block" // 기본 클래스만 설정
      style={style}
    >
      {/* 좌측 경계 */}
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
        title="드래그하여 좌측 경계 조정"
      />
      
      {/* 우측 경계 */}
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
        title="드래그하여 우측 경계 조정"
      />
      
      {/* 상단 경계 */}
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
        title="드래그하여 상단 경계 조정"
      />
      
      {/* 하단 경계 */}
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
        title="드래그하여 하단 경계 조정"
      />
      
      {/* 패널 콘텐츠 */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'visible', 
        position: 'relative', 
        zIndex: 2 
      }}>
        {renderPanel ? renderPanel(area) : null}
      </div>
    </div>
  );
};