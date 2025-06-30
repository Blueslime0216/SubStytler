import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useProjectStore } from '../../../stores/projectStore';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useWaveformInteraction } from './hooks/useWaveformInteraction';
import { useWaveformRenderer } from './hooks/useWaveformRenderer';
import { WaveformMode } from './types';

interface AudioWaveformContentProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  mode: WaveformMode;
  verticalZoom: number;
  setVerticalZoom: React.Dispatch<React.SetStateAction<number>>;
  localZoom: number;
  setLocalZoom: React.Dispatch<React.SetStateAction<number>>;
  localViewStart: number;
  setLocalViewStart: React.Dispatch<React.SetStateAction<number>>;
  localViewEnd: number;
  setLocalViewEnd: React.Dispatch<React.SetStateAction<number>>;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const AudioWaveformContent: React.FC<AudioWaveformContentProps> = ({
  canvasRef,
  containerRef,
  mode,
  verticalZoom,
  setVerticalZoom,
  localZoom,
  setLocalZoom,
  localViewStart,
  setLocalViewStart,
  localViewEnd,
  setLocalViewEnd,
  onContextMenu
}) => {
  const { currentTime, duration, isPlaying, snapToFrame } = useTimelineStore();
  const { currentProject } = useProjectStore();
  
  // 패널 패닝 상태
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const panStartXRef = useRef(0);
  const panStartViewRef = useRef(0);

  // 인디케이터(재생 헤드) 드래그 상태
  const [isDraggingIndicator, setIsDraggingIndicator] = useState(false);
  
  // 마지막 애니메이션 프레임 ID 참조
  const rafRef = useRef<number | null>(null);
  
  // 비디오 요소 직접 참조
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoRef.current = videoElement;
    }
  }, [currentProject?.videoMeta]);

  // 뷰 범위 초기화
  useEffect(() => {
    if (duration > 0) {
      setLocalViewEnd(duration);
    }
  }, [duration, setLocalViewEnd]);

  // 오디오 분석 훅
  const { 
    isAnalyzing, 
    precomputedWaveform, 
    precomputedSpectrogram, 
    audioDuration, 
    analyzeAudio 
  } = useAudioAnalysis(videoRef);

  // 비디오 메타 변경 시 오디오 재분석
  useEffect(() => {
    if (currentProject?.videoMeta) {
      analyzeAudio();
    }
  }, [currentProject?.videoMeta, analyzeAudio]);

  // 웨이브폼 상호작용 훅
  const {
    timeToPixel,
    pixelToTime,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleIndicatorMouseDown
  } = useWaveformInteraction({
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
    setCurrentTime: useTimelineStore(state => state.setCurrentTime),
    snapToFrame,
    verticalZoom,
    setVerticalZoom
  });

  // 웨이브폼 렌더링 훅
  const { renderVisualization } = useWaveformRenderer({
    canvasRef,
    containerRef,
    mode,
    isAnalyzing,
    precomputedWaveform,
    precomputedSpectrogram,
    audioDuration,
    localViewStart,
    localViewEnd,
    timeToPixel,
    verticalZoom,
    isDraggingIndicator,
    currentTime,
    isPlaying,
    videoRef
  });

  // 애니메이션 프레임을 사용한 지속적인 업데이트
  useEffect(() => {
    const updateAnimation = () => {
      renderVisualization();
      rafRef.current = requestAnimationFrame(updateAnimation);
    };
    
    // 애니메이션 시작
    rafRef.current = requestAnimationFrame(updateAnimation);
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [renderVisualization]);

  // wheel 이벤트 passive: false로 등록
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: WheelEvent) => {
      // handleWheel을 직접 호출
      if (typeof handleWheel === 'function') {
        // @ts-ignore
        handleWheel(e);
      }
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, [handleWheel]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 min-w-0 min-h-0 relative cursor-pointer rounded-lg neu-shadow-inset overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPanning(false)}
      onContextMenu={onContextMenu}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
      {(() => {
        const width = containerRef.current?.clientWidth || 0;
        const accurateTime = videoRef.current && isPlaying ? videoRef.current.currentTime * 1000 : currentTime;
        if (accurateTime < localViewStart || accurateTime > localViewEnd || width === 0) return null;
        const playheadX = ((accurateTime - localViewStart) / (localViewEnd - localViewStart)) * width;
        return (
          <div
            style={{
              position: 'absolute',
              left: playheadX - 12,
              top: 0,
              width: 24,
              height: 32,
              zIndex: 10,
              cursor: 'ew-resize',
              background: 'transparent',
            }}
            onMouseDown={handleIndicatorMouseDown}
            title="드래그로 재생 위치 이동"
          />
        );
      })()}
    </div>
  );
};