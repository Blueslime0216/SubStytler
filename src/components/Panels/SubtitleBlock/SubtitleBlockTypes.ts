import { SubtitleBlock } from '../../../types/project';

export interface SubtitleBlockProps {
  subtitle: SubtitleBlock;
  timeToPixel: (time: number) => number;
  pixelToTime: (pixel: number) => number;
  containerRef: React.RefObject<HTMLDivElement>;
  onDragStart: (subtitleId: string, trackId: string) => void;
  onDragEnd: () => void;
  isLocked: boolean;
  trackIndex: number;
  trackHeight: number;
}

export type ResizeSide = 'left' | 'right' | null;

export interface DragStartData {
  startTime: number;
  startX: number;
  startY: number;
  containerRect: DOMRect;
  originalTrackId: string;
}

export interface ResizeStartData {
  startX: number;
  startTime: number;
  endTime: number;
}

export interface ResizeAdjustment {
  id: string;
  updates: { startTime?: number; endTime?: number };
}