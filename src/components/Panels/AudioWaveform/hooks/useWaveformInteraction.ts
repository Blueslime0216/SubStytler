import { useCallback, useRef, useEffect } from 'react';

interface WaveformInteractionProps {
  containerRef: React.RefObject<HTMLDivElement>;
  localViewStart: number;
  localViewEnd: number;
  setLocalViewStart: React.Dispatch<React.SetStateAction<number>>;
  setLocalViewEnd: React.Dispatch<React.SetStateAction<number>>;
  isPanning: boolean;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
  isPanningRef: React.RefObject<boolean>;
  panStartXRef: React.RefObject<number>;
  panStartViewRef: React.RefObject<number>;
  isDraggingIndicator: boolean;
  setIsDraggingIndicator: React.Dispatch<React.SetStateAction<boolean>>;
  duration: number;
  setCurrentTime: (time: number) => void;
  snapToFrame: (time: number) => number;
  verticalZoom: number;
  setVerticalZoom: React.Dispatch<React.SetStateAction<number>>;
}

export const useWaveformInteraction = ({
  containerRef,
  localViewStart,
  localViewEnd,
  setLocalViewStart,
  setLocalViewEnd,
  isPanning,
  setIsPanning,
  isPanningRef,
  panStartXRef,
  panStartViewRef,
  isDraggingIndicator,
  setIsDraggingIndicator,
  duration,
  setCurrentTime,
  snapToFrame,
  verticalZoom,
  setVerticalZoom
}: WaveformInteractionProps) => {
  // localViewStart/localViewEnd 보정 함수
  const clampViewRange = useCallback((start: number, end: number) => {
    let s = Math.max(0, Math.min(start, duration));
    let e = Math.max(s + 1, Math.min(end, duration));
    if (!isFinite(s) || !isFinite(e) || s >= e) {
      s = 0;
      e = duration;
    }
    return [s, e];
  }, [duration]);

  // 시간/픽셀 변환 함수
  const timeToPixel = useCallback((time: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = localViewEnd - localViewStart;
    if (viewDuration === 0) return 0;
    return ((time - localViewStart) / viewDuration) * width;
  }, [localViewStart, localViewEnd, containerRef]);

  const pixelToTime = useCallback((pixel: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = localViewEnd - localViewStart;
    return localViewStart + (pixel / width) * viewDuration;
  }, [localViewStart, localViewEnd, containerRef]);

  // 캔버스 클릭 처리
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = pixelToTime(x);
    setCurrentTime(snapToFrame(clickTime));
  }, [pixelToTime, setCurrentTime, snapToFrame]);

  // 마우스 다운 처리 (패널 패닝/재생 헤드 클릭)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDraggingIndicator) return; // 인디케이터 드래그 중이면 무시
    if (e.button === 1) { // 휠 버튼(패닝)
      setIsPanning(true);
      isPanningRef.current = true;
      panStartXRef.current = e.clientX;
      panStartViewRef.current = localViewStart;
      e.preventDefault();
      return;
    }
    if (e.button === 0) { // 좌클릭(재생 헤드 이동)
      handleCanvasClick(e);
    }
  }, [isDraggingIndicator, localViewStart, handleCanvasClick, setIsPanning, isPanningRef, panStartXRef, panStartViewRef]);

  // 마우스 이동 처리 (패널 패닝/재생 헤드 드래그)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingIndicator) return; // 인디케이터 드래그 중이면 패널 패닝 무시
    // 패널 패닝은 글로벌 리스너에서 처리
    // 재생 헤드 드래그(좌클릭+드래그)
    if (e.buttons === 1 && containerRef.current && !isPanning) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const time = pixelToTime(x);
      setCurrentTime(snapToFrame(time));
    }
  }, [isDraggingIndicator, isPanning, pixelToTime, setCurrentTime, snapToFrame]);

  // 마우스 업 처리
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsPanning(false);
      isPanningRef.current = false;
      e.preventDefault();
    }
  }, [setIsPanning, isPanningRef]);

  // 패널 패닝 글로벌 리스너
  useEffect(() => {
    if (!isPanning) return;
    isPanningRef.current = true;
    const onMove = (e: MouseEvent) => {
      if (!isPanningRef.current || !containerRef.current) return;
      const dx = e.clientX - panStartXRef.current;
      const containerWidth = containerRef.current.clientWidth;
      const viewDuration = localViewEnd - localViewStart;
      const timeDelta = (dx / containerWidth) * viewDuration;
      let newStart = panStartViewRef.current - timeDelta;
      let newEnd = newStart + viewDuration;
      [newStart, newEnd] = clampViewRange(newStart, newEnd);
      setLocalViewStart(newStart);
      setLocalViewEnd(newEnd);
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsPanning(false);
        isPanningRef.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isPanning, localViewEnd, localViewStart, clampViewRange, setLocalViewStart, setLocalViewEnd, isPanningRef, panStartXRef, panStartViewRef, containerRef]);

  // 휠(줌) 처리 (타임라인 패널과 동일하게)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.cancelable) e.preventDefault();
    if (!containerRef.current) return;
    // Ctrl+휠: 세로 zoom
    if (e.ctrlKey) {
      let nextZoom = verticalZoom * (e.deltaY > 0 ? 1/1.1 : 1.1);
      nextZoom = Math.max(0.2, Math.min(10, nextZoom));
      setVerticalZoom(nextZoom);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const timeAtCursor = pixelToTime(mouseX);
    const minViewDuration = 100; // 최소 100ms
    const maxViewDuration = duration;
    const viewDuration = localViewEnd - localViewStart;
    let newViewDuration = viewDuration * (e.deltaY > 0 ? 1.1 : 0.9);
    newViewDuration = Math.max(minViewDuration, Math.min(maxViewDuration, newViewDuration));
    const ratio = (timeAtCursor - localViewStart) / viewDuration;
    let newStart = timeAtCursor - ratio * newViewDuration;
    let newEnd = newStart + newViewDuration;
    if (newStart < 0) {
      newStart = 0;
      newEnd = newViewDuration;
    }
    if (newEnd > duration) {
      newEnd = duration;
      newStart = duration - newViewDuration;
    }
    setLocalViewStart(newStart);
    setLocalViewEnd(newEnd);
  }, [pixelToTime, localViewStart, localViewEnd, duration, verticalZoom, setVerticalZoom, setLocalViewStart, setLocalViewEnd]);

  // 인디케이터(재생 헤드) 드래그 핸들
  const handleIndicatorMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDraggingIndicator(true);
    e.stopPropagation();
  }, [setIsDraggingIndicator]);

  // 인디케이터 드래그 글로벌 리스너
  useEffect(() => {
    if (!isDraggingIndicator) return;
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const time = pixelToTime(x);
      setCurrentTime(snapToFrame(time));
    };
    const handleUp = () => setIsDraggingIndicator(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingIndicator, pixelToTime, setCurrentTime, snapToFrame, containerRef]);

  return {
    timeToPixel,
    pixelToTime,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleIndicatorMouseDown
  };
};