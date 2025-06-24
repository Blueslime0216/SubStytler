import { useState, useEffect } from 'react';
import { BorderDir } from './hooks/areaDragUtils';

export function usePaddingHover(dragging: any) {
  const [hoveredBorder, setHoveredBorder] = useState<{ areaId: string; dir: BorderDir } | null>(null);

  useEffect(() => {
    if (!dragging) {
      setHoveredBorder(null);
    }
  }, [dragging]);

  return [hoveredBorder, setHoveredBorder] as const;
} 