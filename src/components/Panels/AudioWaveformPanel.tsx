import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { Waves, BarChart3, Layers, RefreshCw } from 'lucide-react';
import { ContextMenu, ContextMenuItem, ContextMenuDivider } from '../UI/ContextMenu';

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
  
  // 패널 패닝 상태
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const panStartXRef = useRef(0);
  const panStartViewRef = useRef(0);

  // 인디케이터(재생 헤드) 드래그 상태
  const [isDraggingIndicator, setIsDraggingIndicator] = useState(false);
  
  // 마지막 애니메이션 프레임 ID 참조
  const rafRef = useRef<number | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({
    isOpen: false,
    x: 0,
    y: 0
  });
  
  const { currentTime, duration, isPlaying, setCurrentTime, snapToFrame } = useTimelineStore();
  const { currentProject } = useProjectStore();
  
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
  }, [duration]);

  // localViewStart/localViewEnd 보정 함수
  const clampViewRange = (start: number, end: number) => {
    let s = Math.max(0, Math.min(start, duration));
    let e = Math.max(s + 1, Math.min(end, duration));
    if (!isFinite(s) || !isFinite(e) || s >= e) {
      s = 0;
      e = duration;
    }
    return [s, e];
  };

  // decodeAudioData Promise/Callback 호환 래퍼
  function decodeAudioDataCompat(audioContext: AudioContext, arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('decodeAudioData가 30초 후 시간 초과되었습니다. 파일이 너무 크거나 손상되었을 수 있습니다.'));
      }, 30000); // 30초 타임아웃

      // 최신 브라우저는 Promise 지원
      const p = (audioContext as any).decodeAudioData(arrayBuffer);
      if (p && typeof p.then === 'function') {
        p.then((buffer: AudioBuffer) => {
          clearTimeout(timeout);
          resolve(buffer);
        }).catch((err: any) => {
          clearTimeout(timeout);
          reject(err);
        });
      } else {
        // 구형 브라우저: 콜백 방식
        (audioContext as any).decodeAudioData(
          arrayBuffer,
          (buffer: AudioBuffer) => {
            clearTimeout(timeout);
            resolve(buffer);
          },
          (err: any) => {
            clearTimeout(timeout);
            reject(err);
          }
        );
      }
    });
  }

  const analyzeAudio = useCallback(async () => {
    if (!currentProject?.videoMeta) {
      return;
    }
    if (isAnalyzing) {
      return;
    }
    
    const { file } = currentProject.videoMeta as any;
    const url = (currentProject.videoMeta as any).url as string | undefined;
    
    if (!file && !url) {
      return;
    }

    setIsAnalyzing(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      
      let arrayBuffer: ArrayBuffer;
      if (file) {
        arrayBuffer = await file.arrayBuffer();
      } else if (url) {
        const response = await fetch(url);
        arrayBuffer = await response.arrayBuffer();
      } else {
        throw new Error('No valid audio source');
      }

      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await decodeAudioDataCompat(audioContext, arrayBuffer);
      } catch (err) {
        setPrecomputedWaveform(null);
        setPrecomputedSpectrogram(null);
        setAudioDuration(0);
        throw new Error('decodeAudioData 실패: ' + String(err));
      }
      

      if (audioBuffer.length === 0) {
        setPrecomputedWaveform(null);
        setPrecomputedSpectrogram(null);
        throw new Error('오디오 데이터가 비어 있습니다.');
      }
      audioBufferRef.current = audioBuffer;
      setAudioDuration(audioBuffer.duration * 1000);
      const waveform = downsampleWaveform(audioBuffer, PRECOMPUTED_WAVEFORM_RESOLUTION);
      setPrecomputedWaveform(waveform);
      
      const spectrogram = await generateOptimizedSpectrogram(audioBuffer, PRECOMPUTED_SPECTROGRAM_RESOLUTION);
      setPrecomputedSpectrogram(spectrogram);

    } catch (error) {
      setPrecomputedWaveform(null);
      setPrecomputedSpectrogram(null);
      setAudioDuration(0);
      console.error('오디오 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentProject?.videoMeta]);

  // 모든 채널을 합산하여 RMS 파형 생성
  const downsampleWaveform = useCallback((audioBuffer: AudioBuffer, targetLength: number): Float32Array => {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const result = new Float32Array(targetLength);
    const ratio = length / targetLength;
    let max = 0;
    for (let i = 0; i < targetLength; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.floor((i + 1) * ratio);
      let sum = 0;
      for (let ch = 0; ch < numChannels; ch++) {
        const channelData = audioBuffer.getChannelData(ch);
        for (let j = start; j < end; j++) {
          sum += channelData[j] * channelData[j];
        }
      }
      const n = (end - start) * numChannels;
      result[i] = n > 0 ? Math.sqrt(sum / n) : 0;
      if (result[i] > max) max = result[i];
    }
    // 정규화
    if (max > 0) {
      for (let i = 0; i < result.length; i++) {
        result[i] /= max;
      }
    }
    return result;
  }, []);

  // 스펙트로그램 precompute (실제 구현)
  const generateOptimizedSpectrogram = useCallback(async (audioBuffer: AudioBuffer, resolution: number): Promise<Uint8Array[]> => {
    // resolution: 시간축(가로) 샘플 개수
    const fftSize = 256; // 주파수 해상도 (2의 제곱수)
    const hopSize = Math.floor(audioBuffer.length / resolution);
    const channelData = audioBuffer.getChannelData(0); // 모노만 사용
    const spectrogram: Uint8Array[] = [];
    const analyser = new window.OfflineAudioContext(1, fftSize, audioBuffer.sampleRate);
    // FFT용 버퍼
    const fftBuffer = new Float32Array(fftSize);
    for (let i = 0; i < resolution; i++) {
      const start = i * hopSize;
      for (let j = 0; j < fftSize; j++) {
        fftBuffer[j] = channelData[start + j] || 0;
      }
      // FFT 수행 (간단한 DFT)
      const re = new Float32Array(fftSize / 2);
      const im = new Float32Array(fftSize / 2);
      for (let k = 0; k < fftSize / 2; k++) {
        let sumRe = 0, sumIm = 0;
        for (let n = 0; n < fftSize; n++) {
          const angle = (2 * Math.PI * k * n) / fftSize;
          sumRe += fftBuffer[n] * Math.cos(angle);
          sumIm -= fftBuffer[n] * Math.sin(angle);
        }
        re[k] = sumRe;
        im[k] = sumIm;
      }
      // 크기(magnitude) 계산 및 정규화
      const mag = new Uint8Array(fftSize / 2);
      let max = 0;
      for (let k = 0; k < fftSize / 2; k++) {
        const v = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
        if (v > max) max = v;
        mag[k] = v;
      }
      // 정규화
      if (max > 0) {
        for (let k = 0; k < fftSize / 2; k++) {
          mag[k] = Math.min(255, Math.round((mag[k] / max) * 255));
        }
      }
      spectrogram.push(mag);
    }
    return spectrogram;
  }, []);

  // 비디오 메타 변경 시 오디오 재분석
  useEffect(() => {
    if (currentProject?.videoMeta) {
      analyzeAudio();
    }
  }, [currentProject?.videoMeta, analyzeAudio]);

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

  // vertical zoom 상태 추가
  const [verticalZoom, setVerticalZoom] = useState(1);

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
  }, [currentTime, isPlaying]);

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
  }, [localViewStart, localViewEnd, mode, timeToPixel, precomputedWaveform, precomputedSpectrogram, audioDuration, isAnalyzing, getViewWaveformData, getViewSpectrogramData, drawWaveform, drawSpectrogram, getAccurateTime, isDraggingIndicator]);

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
  }, [isPanning, localViewEnd, localViewStart, duration]);

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
  }, [isDraggingIndicator, localViewStart, handleCanvasClick]);

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
  }, []);

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
  }, [pixelToTime, localViewStart, localViewEnd, duration, verticalZoom]);

  // 인디케이터(재생 헤드) 드래그 핸들
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

  // 모드 변경 처리
  const handleModeChange = (newMode: WaveformMode) => {
    setMode(newMode);
    setContextMenu({ isOpen: false, x: 0, y: 0 });
  };

  // 줌 초기화 처리
  const handleResetZoom = useCallback(() => {
    setLocalViewStart(0);
    setLocalViewEnd(duration);
    setLocalZoom(1);
    setVerticalZoom(1);
    setContextMenu({ isOpen: false, x: 0, y: 0 });
  }, [duration]);

  // 컨텍스트 메뉴 처리
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY
    });
  }, []);

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

  // 오디오가 없을 때 placeholder 보여주기
  if (!currentProject?.videoMeta) {
    return (
      <div className="neu-audio-waveform-panel h-full flex items-center justify-center neu-text-secondary">
        <p className="text-sm">오디오 파형을 보려면 비디오를 로드하세요</p>
      </div>
    );
  }

  return (
    <div className="neu-audio-waveform-panel h-full min-w-0 min-h-0 neu-bg-base p-3 flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 min-w-0 min-h-0 relative cursor-pointer rounded-lg neu-shadow-inset overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPanning(false)}
        onContextMenu={handleContextMenu}
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

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0 })}
      >
        <ContextMenuItem 
          icon={<Waves />}
          onClick={() => handleModeChange('waveform')}
        >
          {mode === 'waveform' ? '✓ 파형 뷰' : '파형 뷰'}
        </ContextMenuItem>
        
        <ContextMenuItem 
          icon={<BarChart3 />}
          onClick={() => handleModeChange('spectrogram')}
        >
          {mode === 'spectrogram' ? '✓ 스펙트로그램 뷰' : '스펙트로그램 뷰'}
        </ContextMenuItem>
        
        <ContextMenuItem 
          icon={<Layers />}
          onClick={() => handleModeChange('mixed')}
        >
          {mode === 'mixed' ? '✓ 혼합 뷰' : '혼합 뷰'}
        </ContextMenuItem>
        
        <ContextMenuDivider />
        
        <ContextMenuItem 
          icon={<RefreshCw />}
          onClick={handleResetZoom}
        >
          줌 초기화
        </ContextMenuItem>
      </ContextMenu>
    </div>
  );
};