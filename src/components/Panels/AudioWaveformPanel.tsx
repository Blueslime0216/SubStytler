import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { Waves, BarChart3, Layers } from 'lucide-react';

type WaveformMode = 'waveform' | 'spectrogram' | 'mixed';

interface AudioWaveformPanelProps {
  areaId?: string;
}

const PRECOMPUTED_WAVEFORM_RESOLUTION = 4000;
const PRECOMPUTED_SPECTROGRAM_RESOLUTION = 1500;

export const AudioWaveformPanel: React.FC<AudioWaveformPanelProps> = ({ areaId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  
  const [mode, setMode] = useState<WaveformMode>('waveform');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // precomputed 데이터
  const [precomputedWaveform, setPrecomputedWaveform] = useState<Float32Array | null>(null);
  const [precomputedSpectrogram, setPrecomputedSpectrogram] = useState<Uint8Array[] | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // 개별 패널 상태
  const [localZoom, setLocalZoom] = useState(1);
  const [localViewStart, setLocalViewStart] = useState(0);
  const [localViewEnd, setLocalViewEnd] = useState(60000);
  
  // 패닝 상태
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // 마지막 애니메이션 프레임 ID 참조
  const rafRef = useRef<number | null>(null);
  
  const { currentTime, duration, isPlaying, setCurrentTime, snapToFrame } = useTimelineStore();
  const { currentProject } = useProjectStore();
  
  // 비디오 요소 직접 참조
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoRef.current = videoElement;
    }
  }, [currentProject?.videoMeta?.url]);

  // 뷰 범위 초기화
  useEffect(() => {
    if (duration > 0) {
      setLocalViewEnd(duration);
    }
  }, [duration]);

  // 최초 분석 및 precompute
  const analyzeAudio = useCallback(async () => {
    if (!currentProject?.videoMeta?.url || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      const response = await fetch(currentProject.videoMeta.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setAudioDuration(audioBuffer.duration * 1000);
      // 진폭 파형 precompute
      const channelData = audioBuffer.getChannelData(0);
      const waveform = downsampleWaveform(channelData, PRECOMPUTED_WAVEFORM_RESOLUTION);
      setPrecomputedWaveform(waveform);
      // 스펙트로그램 precompute
      const spectrogram = await generateOptimizedSpectrogram(audioBuffer, PRECOMPUTED_SPECTROGRAM_RESOLUTION);
      setPrecomputedSpectrogram(spectrogram);
    } catch (error) {
      console.error('오디오 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentProject?.videoMeta?.url, isAnalyzing]);

  // 다운샘플링 함수 (RMS)
  const downsampleWaveform = useCallback((data: Float32Array, targetLength: number): Float32Array => {
    if (data.length <= targetLength) return data;
    const result = new Float32Array(targetLength);
    const ratio = data.length / targetLength;
    for (let i = 0; i < targetLength; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.floor((i + 1) * ratio);
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += data[j] * data[j];
      }
      result[i] = Math.sqrt(sum / (end - start));
    }
    return result;
  }, []);

  // 스펙트로그램 precompute (최적화)
  const generateOptimizedSpectrogram = useCallback(async (audioBuffer: AudioBuffer, resolution: number): Promise<Uint8Array[]> => {
    const offlineContext = new OfflineAudioContext({
      numberOfChannels: 1,
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate
    });
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    const analyser = offlineContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(offlineContext.destination);
    const spectrogramData: Uint8Array[] = [];
    const totalSamples = audioBuffer.length;
    const sampleInterval = Math.max(1, Math.floor(totalSamples / resolution));
    source.start(0);
    for (let i = 0; i < totalSamples; i += sampleInterval) {
      offlineContext.suspend(i / audioBuffer.sampleRate).then(() => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        spectrogramData.push(dataArray);
        offlineContext.resume();
      });
    }
    try {
      await offlineContext.startRendering();
    } catch (error) {
      console.error('스펙트로그램 렌더링 실패:', error);
    }
    return spectrogramData;
  }, []);

  // 비디오 변경시 오디오 분석
  useEffect(() => {
    if (currentProject?.videoMeta?.url) {
      analyzeAudio();
    }
  }, [currentProject?.videoMeta?.url, analyzeAudio]);

  // 리샘플링 함수 (선형 보간)
  function resampleArray<T extends number | Uint8Array>(data: ArrayLike<T>, targetLength: number): T[] {
    if (!data || data.length === 0 || targetLength <= 0) return [];
    if (targetLength === 1) return [data[0]];
    const result: T[] = [];
    const srcLength = data.length;
    for (let i = 0; i < targetLength; i++) {
      const srcIdx = (i / (targetLength - 1)) * (srcLength - 1);
      const left = Math.floor(srcIdx);
      const right = Math.ceil(srcIdx);
      if (left < 0 || right >= srcLength || data[left] === undefined || data[right] === undefined) {
        result.push(data[0]);
      } else if (left === right) {
        result.push(data[left]);
      } else {
        if (typeof data[left] === 'number') {
          const v = (data[left] as number) * (right - srcIdx) + (data[right] as number) * (srcIdx - left);
          result.push(v as T);
        } else {
          const lArr = data[left] as Uint8Array;
          const rArr = data[right] as Uint8Array;
          const arr = new Uint8Array(lArr.length);
          for (let j = 0; j < lArr.length; j++) {
            arr[j] = Math.round(lArr[j] * (right - srcIdx) + rArr[j] * (srcIdx - left));
          }
          result.push(arr as T);
        }
      }
    }
    return result;
  }

  // precomputed에서 뷰포트에 맞는 구간을 width에 맞게 리샘플링
  const getViewWaveformData = useCallback((width: number): number[] => {
    if (!precomputedWaveform || !audioDuration || width <= 1) return [];
    const total = precomputedWaveform.length;
    const startRatio = localViewStart / audioDuration;
    const endRatio = localViewEnd / audioDuration;
    const startIdx = Math.floor(startRatio * total);
    const endIdx = Math.ceil(endRatio * total);
    const sliced = precomputedWaveform.slice(startIdx, endIdx);
    return resampleArray(sliced, width);
  }, [precomputedWaveform, localViewStart, localViewEnd, audioDuration]);

  const getViewSpectrogramData = useCallback((width: number): Uint8Array[] => {
    if (!precomputedSpectrogram || !audioDuration || width <= 1) return [];
    const total = precomputedSpectrogram.length;
    const startRatio = localViewStart / audioDuration;
    const endRatio = localViewEnd / audioDuration;
    const startIdx = Math.floor(startRatio * total);
    const endIdx = Math.ceil(endRatio * total);
    const sliced = precomputedSpectrogram.slice(startIdx, endIdx);
    return resampleArray(sliced, width);
  }, [precomputedSpectrogram, localViewStart, localViewEnd, audioDuration]);

  // 시간/픽셀 변환 함수
  const timeToPixel = useCallback((time: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = localViewEnd - localViewStart;
    if (viewDuration === 0) return 0;
    return ((time - localViewStart) / viewDuration) * width;
  }, [localViewStart, localViewEnd]);

  const pixelToTime = useCallback((pixel: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = localViewEnd - localViewStart;
    return localViewStart + (pixel / width) * viewDuration;
  }, [localViewStart, localViewEnd]);

  // 웨이브폼 그리기
  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, data: number[]) => {
    if (!data.length) return;
    const centerY = height / 2;
    ctx.strokeStyle = '#3B82F6';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 1;
    
    // 상단과 하단 점들을 미리 계산
    const upperPoints: [number, number][] = [];
    const lowerPoints: [number, number][] = [];
    
    for (let i = 0; i < width; i++) {
      const amplitude = Math.min(data[i] * 2, 1);
      const upperY = centerY - amplitude * centerY * 0.9;
      const lowerY = centerY + amplitude * centerY * 0.9;
      upperPoints.push([i, upperY]);
      lowerPoints.push([i, lowerY]);
    }
    
    // 채우기 path 그리기
    ctx.beginPath();
    
    // 상단 라인: 왼쪽에서 오른쪽으로
    ctx.moveTo(upperPoints[0][0], upperPoints[0][1]);
    for (let i = 1; i < upperPoints.length; i++) {
      ctx.lineTo(upperPoints[i][0], upperPoints[i][1]);
    }
    
    // 하단 라인: 오른쪽에서 왼쪽으로 (역순)
    for (let i = lowerPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(lowerPoints[i][0], lowerPoints[i][1]);
    }
    
    // 시작점으로 닫기
    ctx.closePath();
    ctx.fill();
    
    // 상단 테두리
    ctx.beginPath();
    ctx.moveTo(upperPoints[0][0], upperPoints[0][1]);
    for (let i = 1; i < upperPoints.length; i++) {
      ctx.lineTo(upperPoints[i][0], upperPoints[i][1]);
    }
    ctx.stroke();
    
    // 하단 테두리
    ctx.beginPath();
    ctx.moveTo(lowerPoints[0][0], lowerPoints[0][1]);
    for (let i = 1; i < lowerPoints.length; i++) {
      ctx.lineTo(lowerPoints[i][0], lowerPoints[i][1]);
    }
    ctx.stroke();
  }, []);

  // 스펙트로그램 그리기
  const drawSpectrogram = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, data: Uint8Array[]) => {
    if (!data.length) return;
    const binCount = data[0].length;
    const binHeight = height / binCount;
    for (let x = 0; x < width; x++) {
      const freqData = data[x];
      for (let i = 0; i < binCount; i++) {
        const intensity = freqData[i] / 255;
        let r = 0, g = 0, b = 0;
        if (intensity < 0.33) {
          r = 0;
          g = Math.round(intensity * 3 * 255);
          b = 255;
        } else if (intensity < 0.66) {
          r = Math.round((intensity - 0.33) * 3 * 255);
          g = 255;
          b = Math.round((0.66 - intensity) * 3 * 255);
        } else {
          r = 255;
          g = Math.round((1 - intensity) * 3 * 255);
          b = 0;
        }
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        const y = height - (i + 1) * binHeight;
        ctx.fillRect(x, y, 1, binHeight + 1);
      }
    }
  }, []);

  // 비디오 시간에서 정확한 오디오 시간 가져오기
  const getAccurateTime = useCallback((): number => {
    // 비디오 요소가 있으면 비디오의 정확한 시간 사용
    if (videoRef.current && isPlaying) {
      return videoRef.current.currentTime * 1000; // 밀리초로 변환
    }
    // 없으면 타임라인 스토어의 시간 사용
    return currentTime;
  }, [currentTime, isPlaying]);

  // 주요 시각화 렌더링 함수
  const renderVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = rect.width;
    const height = rect.height;

    // 배경 지우기
    ctx.fillStyle = '#1A202C'; // 어두운 배경
    ctx.fillRect(0, 0, width, height);

    if (!precomputedWaveform || !precomputedSpectrogram || !audioDuration) {
      // 로딩 또는 데이터 없음 메시지 표시
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isAnalyzing ? '오디오 분석 중...' : '오디오 데이터 없음',
        width / 2,
        height / 2
      );
      return;
    }

    // 현재 뷰에 대한 데이터 가져오기
    const waveformData = getViewWaveformData(width);
    const spectrogramData = getViewSpectrogramData(width);

    // 모드에 따라 그리기
    if (mode === 'spectrogram') {
      drawSpectrogram(ctx, width, height, spectrogramData);
    } 
    else if (mode === 'mixed') {
      // 일부 투명도로 스펙트로그램 먼저 그리기
      drawSpectrogram(ctx, width, height, spectrogramData);
      ctx.globalAlpha = 0.7;
      drawWaveform(ctx, width, height, waveformData);
      ctx.globalAlpha = 1.0;
    }
    else {
      // 기본 파형 그리기
      drawWaveform(ctx, width, height, waveformData);
    }

    // 정확한 재생 시간 가져오기
    const accurateTime = getAccurateTime();

    // 재생 헤드 그리기
    if (accurateTime >= localViewStart && accurateTime <= localViewEnd) {
      const playheadX = timeToPixel(accurateTime);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      // 재생 헤드 핸들 (드래그 가능)
      ctx.save();
      ctx.beginPath();
      ctx.arc(playheadX, 10, 8, 0, Math.PI * 2);
      ctx.fillStyle = isDraggingIndicator ? '#FF8888' : '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, [localViewStart, localViewEnd, mode, timeToPixel, precomputedWaveform, precomputedSpectrogram, audioDuration, isAnalyzing, getViewWaveformData, getViewSpectrogramData, drawWaveform, drawSpectrogram, getAccurateTime]);

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

  // 캔버스 클릭 처리
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = pixelToTime(x);
    setCurrentTime(snapToFrame(clickTime));
  }, [pixelToTime, setCurrentTime, snapToFrame]);

  // 마우스 다운 처리
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // 마우스 가운데 버튼
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    
    if (e.button === 0) { // 마우스 왼쪽 버튼 - 시간 이동
      handleCanvasClick(e);
    }
  }, [handleCanvasClick]);

  // 마우스 이동 처리
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && containerRef.current) {
      const dx = e.clientX - dragStart.x;
      setDragStart({ x: e.clientX, y: e.clientY });

      const containerWidth = containerRef.current.clientWidth;
      const viewDuration = localViewEnd - localViewStart;
      const timeDelta = (dx / containerWidth) * viewDuration;

      // 뷰 범위 이동
      let newStart = Math.max(0, localViewStart - timeDelta);
      let newEnd = Math.min(duration, localViewEnd - timeDelta);
      
      // 뷰 길이 유지
      if (newEnd - newStart < viewDuration) {
        if (newStart === 0) {
          newEnd = Math.min(duration, newStart + viewDuration);
        } else if (newEnd === duration) {
          newStart = Math.max(0, newEnd - viewDuration);
        }
      }
      
      setLocalViewStart(newStart);
      setLocalViewEnd(newEnd);
      return;
    }
    
    // 왼쪽 버튼 드래그로 재생 헤더 이동
    if (e.buttons === 1 && containerRef.current && !isPanning) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const time = pixelToTime(x);
      setCurrentTime(snapToFrame(time));
    }
  }, [isPanning, dragStart, localViewStart, localViewEnd, duration, pixelToTime, setCurrentTime, snapToFrame]);

  // 마우스 업 처리
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsPanning(false);
      e.preventDefault();
    }
  }, []);

  // 휠 처리 (줌)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const timeAtCursor = pixelToTime(mouseX);
    
    // 휠 델타에 따른 줌 인/아웃
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    // 새 뷰 길이
    const viewDuration = localViewEnd - localViewStart;
    const newViewDuration = Math.max(100, Math.min(duration, viewDuration * zoomFactor));
    
    // 커서 위치 기준 줌
    const ratio = (timeAtCursor - localViewStart) / viewDuration;
    let newStart = timeAtCursor - ratio * newViewDuration;
    let newEnd = newStart + newViewDuration;
    
    // 제한
    if (newStart < 0) {
      newStart = 0;
      newEnd = newViewDuration;
    }
    if (newEnd > duration) {
      newEnd = duration;
      newStart = duration - newViewDuration;
    }
    
    // 업데이트
    setLocalViewStart(newStart);
    setLocalViewEnd(newEnd);
    
    e.preventDefault();
  }, [pixelToTime, localViewStart, localViewEnd, duration]);

  // 모드 변경 처리
  const handleModeChange = (newMode: WaveformMode) => {
    setMode(newMode);
  };

  // 오디오가 없을 때 placeholder 보여주기
  if (!currentProject?.videoMeta) {
    return (
      <div className="neu-audio-waveform-panel h-full flex items-center justify-center neu-text-secondary">
        <p className="text-sm">오디오 파형을 보려면 비디오를 로드하세요</p>
      </div>
    );
  }

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

  // 인디케이터 드래그 조작
  const [isDraggingIndicator, setIsDraggingIndicator] = useState(false);
  const handleIndicatorMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDraggingIndicator(true);
    e.stopPropagation();
  }, []);
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
  }, [isDraggingIndicator, pixelToTime, setCurrentTime, snapToFrame]);

  return (
    <div className="neu-audio-waveform-panel h-full neu-bg-base p-3 flex flex-col">
      {/* 모드 토글 버튼 */}
      <div className="flex gap-2 mb-2">
        <button 
          className={`p-2 rounded-md flex items-center justify-center ${mode === 'waveform' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => handleModeChange('waveform')}
          title="파형 뷰"
        >
          <Waves size={16} />
        </button>
        <button 
          className={`p-2 rounded-md flex items-center justify-center ${mode === 'spectrogram' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => handleModeChange('spectrogram')}
          title="스펙트로그램 뷰"
        >
          <BarChart3 size={16} />
        </button>
        <button 
          className={`p-2 rounded-md flex items-center justify-center ${mode === 'mixed' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => handleModeChange('mixed')}
          title="혼합 뷰"
        >
          <Layers size={16} />
        </button>
      </div>

      {/* 캔버스 영역 */}
      <div 
        ref={containerRef}
        className="flex-1 relative cursor-pointer rounded-lg neu-shadow-inset overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPanning(false)}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        {/* 인디케이터 드래그 핸들 */}
        {(() => {
          // accurateTime, playheadX 계산
          const width = containerRef.current?.clientWidth || 0;
          const accurateTime = (() => {
            if (videoRef.current && isPlaying) {
              return videoRef.current.currentTime * 1000;
            }
            return currentTime;
          })();
          if (accurateTime < localViewStart || accurateTime > localViewEnd || width === 0) return null;
          const playheadX = timeToPixel(accurateTime);
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
    </div>
  );
};