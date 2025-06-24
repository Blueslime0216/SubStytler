import { useState, useEffect, useCallback } from 'react';
import { BorderDir } from './hooks/areaDragUtils';

export function usePaddingHover(dragging: any) {
  const [hoveredBorder, setHoveredBorder] = useState<{ areaId: string; dir: BorderDir } | null>(null);

  // 🎯 드래그 상태 변화 최적화
  useEffect(() => {
    if (!dragging) {
      // 🚀 지연 없이 즉시 초기화
      setHoveredBorder(null);
    }
  }, [dragging]);

  // 🎯 최적화된 setter - 불필요한 업데이트 방지
  const optimizedSetHoveredBorder = useCallback((newValue: { areaId: string; dir: BorderDir } | null) => {
    setHoveredBorder(prevValue => {
      // 🚀 같은 값이면 업데이트 스킵
      if (!newValue && !prevValue) return prevValue;
      if (newValue && prevValue && 
          newValue.areaId === prevValue.areaId && 
          newValue.dir === prevValue.dir) {
        return prevValue;
      }
      return newValue;
    });
  }, []);

  return [hoveredBorder, optimizedSetHoveredBorder] as const;
}