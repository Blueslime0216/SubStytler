import { useState, useEffect } from 'react';
import { BorderDir } from './hooks/areaDragUtils';

export function usePaddingHover(dragging: any) {
  const [hoveredBorder, setHoveredBorder] = useState<{ areaId: string; dir: BorderDir } | null>(null);

  // 🔧 드래그가 끝나면 호버 상태 초기화 (깜박임 방지)
  useEffect(() => {
    if (!dragging) {
      // 🔧 즉시 초기화 - 지연 없음
      setHoveredBorder(null);
    }
  }, [dragging]);

  return [hoveredBorder, setHoveredBorder] as const;
}