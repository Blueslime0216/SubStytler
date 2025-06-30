export interface Area {
  id: string;
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
}

// 고정된 기본값 상수
export const DEFAULT_MIN_WIDTH = 15; // %
export const DEFAULT_MIN_HEIGHT = 15; // %
export const DEFAULT_MAX_HEIGHT = 10; // % 