import { useState, useRef, useCallback } from 'react';
import { useProjectStore } from '../../../../stores/projectStore';
import { useToast } from '../../../../hooks/useToast';
import { PrecomputedData } from '../types';

const PRECOMPUTED_WAVEFORM_RESOLUTION = 4000;
const PRECOMPUTED_SPECTROGRAM_RESOLUTION = 1500;

export const useAudioAnalysis = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [precomputedWaveform, setPrecomputedWaveform] = useState<Float32Array | null>(null);
  const [precomputedSpectrogram, setPrecomputedSpectrogram] = useState<Uint8Array[] | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  
  const { currentProject } = useProjectStore();
  const { error } = useToast();

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
      console.error('오디오 분석 실패:', error); // 이 로그는 유지하여 실제 에러를 파악합니다.
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentProject?.videoMeta, downsampleWaveform, generateOptimizedSpectrogram]);

  return {
    isAnalyzing,
    precomputedWaveform,
    precomputedSpectrogram,
    audioDuration,
    analyzeAudio
  };
};