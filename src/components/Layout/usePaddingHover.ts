import { useState, useEffect } from 'react';
import { BorderDir } from './hooks/areaDragUtils';

export function usePaddingHover(dragging: any) {
  const [hoveredBorder, setHoveredBorder] = useState<{ areaId: string; dir: BorderDir } | null>(null);

  // 🔧 드래그가 끝나면 호버 상태 초기화 (깜박임 방지)
  useEffect(() => {
    if (!dragging) {
      // 약간의 지연을 두어 자연스러운 전환
      const timer = setTimeout(() => {
        setHoveredBorder(null);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [dragging]);

  return [hoveredBorder, setHoveredBorder] as const;
}