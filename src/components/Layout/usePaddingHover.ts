import { useState, useEffect } from 'react';
import { BorderDir } from './hooks/areaDragUtils';

export function usePaddingHover(dragging: any) {
  const [hoveredBorder, setHoveredBorder] = useState<{ areaId: string; dir: BorderDir } | null>(null);

  // 드래그가 끝나면 호버 상태도 초기화 (부드러운 복원)
  useEffect(() => {
    if (!dragging) {
      // 드래그 종료 후 0.5초 뒤에 호버 상태 초기화 (자연스러운 복원)
      const timer = setTimeout(() => {
        setHoveredBorder(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [dragging]);

  return [hoveredBorder, setHoveredBorder] as const;
}