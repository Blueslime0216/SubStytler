import { useCallback } from 'react';
import { WaveformMode } from '../types';

interface WaveformRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  mode: WaveformMode;
  isAnalyzing: boolean;
  precomputedWaveform: Float32Array | null;
  precomputedSpectrogram: Uint8Array[] | null;
  audioDuration: number;
  localViewStart: number;
  localViewEnd: number;
  timeToPixel: (time: number) => number;
  verticalZoom: number;
  isDraggingIndicator: boolean;
  currentTime: number;
  isPlaying: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const useWaveformRenderer = ({
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
}: WaveformRendererProps) => {
  // 리샘플링 함수 (선형 보간)
  const resampleArray = useCallback(<T extends number | Uint8Array>(data: ArrayLike<T>, targetLength: number): T[] => {
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
  }, []);

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
  }, [precomputedWaveform, localViewStart, localViewEnd, audioDuration, resampleArray]);

  const getViewSpectrogramData = useCallback((width: number): Uint8Array[] => {
    if (!precomputedSpectrogram || !audioDuration || width <= 1) return [];
    const total = precomputedSpectrogram.length;
    const startRatio = localViewStart / audioDuration;
    const endRatio = localViewEnd / audioDuration;
    const startIdx = Math.floor(startRatio * total);
    const endIdx = Math.ceil(endRatio * total);
    const sliced = precomputedSpectrogram.slice(startIdx, endIdx);
    return resampleArray(sliced, width);
  }, [precomputedSpectrogram, localViewStart, localViewEnd, audioDuration, resampleArray]);

  // 웨이브폼 그리기
  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, data: number[]) => {
    if (!data || !data.length || data.some(v => !isFinite(v))) return;
    const centerY = height / 2;
    ctx.strokeStyle = '#3B82F6';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 1;
    
    // 상단과 하단 점들을 미리 계산
    const upperPoints: [number, number][] = [];
    const lowerPoints: [number, number][] = [];
    
    for (let i = 0; i < width; i++) {
      // verticalZoom 적용, 클램핑
      const amplitude = Math.min(data[i] * 2 * verticalZoom, 1);
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
  }, [verticalZoom]);

  // 스펙트로그램 그리기
  const drawSpectrogram = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, data: Uint8Array[]) => {
    if (!data || !data.length || !data[0] || data.some(arr => !arr || arr.length === 0)) return;
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
  }, [currentTime, isPlaying, videoRef]);

  // 주요 시각화 렌더링 함수
  const renderVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return;
    }
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const width = rect.width;
    const height = rect.height;
    ctx.fillStyle = '#1A202C';
    ctx.fillRect(0, 0, width, height);
    if (isAnalyzing) {
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('오디오 분석 중...', width / 2, height / 2);
      return;
    }
    if (!precomputedWaveform || !precomputedWaveform.length || !audioDuration) {
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('오디오 데이터 없음 또는 분석 실패', width / 2, height / 2);
      return;
    }
    const waveformData = getViewWaveformData(width);
    if (mode === 'spectrogram') {
      drawSpectrogram(ctx, width, height, getViewSpectrogramData(width));
    } 
    else if (mode === 'mixed') {
      drawSpectrogram(ctx, width, height, getViewSpectrogramData(width));
      ctx.globalAlpha = 0.7;
      drawWaveform(ctx, width, height, waveformData);
      ctx.globalAlpha = 1.0;
    }
    else {
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
  }, [
    canvasRef, 
    containerRef, 
    mode, 
    timeToPixel, 
    precomputedWaveform, 
    precomputedSpectrogram, 
    audioDuration, 
    isAnalyzing, 
    getViewWaveformData, 
    getViewSpectrogramData, 
    drawWaveform, 
    drawSpectrogram, 
    getAccurateTime, 
    localViewStart, 
    localViewEnd, 
    isDraggingIndicator
  ]);

  return { renderVisualization };
};