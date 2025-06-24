import { useState, useEffect } from 'react';
import { BorderDir } from './hooks/areaDragUtils';

export function usePaddingHover(dragging: any) {
  const [hoveredBorder, setHoveredBorder] = useState<{ areaId: string; dir: BorderDir } | null>(null);

  // 🔧 드래그 중에는 호버 상태 완전 비활성화 (깜박임 방지)
  useEffect(() => {
    if (dragging) {
      // 드래그 시작 시 즉시 호버 상태 제거
      setHoveredBorder(null);
    }
  }, [dragging]);

  // 🔧 드래그 종료 후 자연스러운 호버 복원
  useEffect(() => {
    if (!dragging && hoveredBorder) {
      // 드래그 종료 후 약간의 지연을 두어 자연스러운 전환
      const timer = setTimeout(() => {
        // 마우스가 여전히 경계 위에 있는지 확인하지 않고 단순히 초기화
        setHoveredBorder(null);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [dragging, hoveredBorder]);

  return [hoveredBorder, setHoveredBorder] as const;
}