import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { Waves, BarChart3, Layers, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type WaveformMode = 'waveform' | 'spectrogram' | 'mixed';

interface AudioWaveformPanelProps {
  areaId?: string;
}

interface AudioData {
  waveformData: Float32Array[];
  spectrogramData: number[][];
  sampleRate: number;
  duration: number;
}

export const AudioWaveformPanel: React.FC<AudioWaveformPanelProps> = ({ areaId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  
  const [mode, setMode] = useState<WaveformMode>('waveform');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Individual panel state for zoom and view
  const [localZoom, setLocalZoom] = useState(1);
  const [localViewStart, setLocalViewStart] = useState(0);
  const [localViewEnd, setLocalViewEnd] = useState(60000);
  
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const { currentTime, duration, setCurrentTime, snapToFrame } = useTimelineStore();
  const { currentProject } = useProjectStore();

  // Initialize view range based on duration
  useEffect(() => {
    if (duration > 0) {
      setLocalViewEnd(duration);
    }
  }, [duration]);

  // Extract and analyze audio from video
  const analyzeAudio = useCallback(async () => {
    if (!currentProject?.videoMeta?.url || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // Create audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Fetch video file and extract audio
      const response = await fetch(currentProject.videoMeta.url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      
      // Extract waveform data (downsampled for performance)
      const channels = [];
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        channels.push(audioBuffer.getChannelData(channel));
      }
      
      // Generate spectrogram data using FFT
      const spectrogramData = generateSpectrogram(audioBuffer);
      
      setAudioData({
        waveformData: channels,
        spectrogramData,
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration * 1000 // Convert to milliseconds
      });
      
    } catch (error) {
      console.error('Failed to analyze audio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentProject?.videoMeta?.url, isAnalyzing]);

  // Generate spectrogram using FFT
  const generateSpectrogram = useCallback((audioBuffer: AudioBuffer): number[][] => {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const fftSize = 2048;
    const hopSize = fftSize / 4;
    const freqBins = fftSize / 2;
    
    const spectrogramData: number[][] = [];
    
    // Simple FFT implementation for demonstration
    // In production, you'd use a proper FFT library
    for (let i = 0; i < channelData.length - fftSize; i += hopSize) {
      const frame = channelData.slice(i, i + fftSize);
      const freqData = performFFT(frame);
      spectrogramData.push(freqData);
    }
    
    return spectrogramData;
  }, []);

  // Simple FFT implementation (for demonstration - use a proper library in production)
  const performFFT = useCallback((frame: Float32Array): number[] => {
    const N = frame.length;
    const freqBins = N / 2;
    const result: number[] = [];
    
    for (let k = 0; k < freqBins; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += frame[n] * Math.cos(angle);
        imag += frame[n] * Math.sin(angle);
      }
      
      const magnitude = Math.sqrt(real * real + imag * imag) / N;
      result.push(magnitude);
    }
    
    return result;
  }, []);

  // Analyze audio when video changes
  useEffect(() => {
    if (currentProject?.videoMeta?.url) {
      analyzeAudio();
    }
  }, [currentProject?.videoMeta?.url, analyzeAudio]);

  // Time/pixel conversion functions
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

  // Get waveform data for current view
  const getViewWaveformData = useCallback((width: number): number[] => {
    if (!audioData || !audioData.waveformData[0]) return [];
    
    const channelData = audioData.waveformData[0];
    const sampleRate = audioData.sampleRate;
    
    const startSample = Math.floor((localViewStart / 1000) * sampleRate);
    const endSample = Math.floor((localViewEnd / 1000) * sampleRate);
    const viewSamples = endSample - startSample;
    
    if (viewSamples <= 0) return [];
    
    // Downsample to fit canvas width
    const samplesPerPixel = Math.max(1, Math.floor(viewSamples / width));
    const result: number[] = [];
    
    for (let i = 0; i < width; i++) {
      const sampleStart = startSample + Math.floor(i * samplesPerPixel);
      const sampleEnd = Math.min(sampleStart + samplesPerPixel, channelData.length);
      
      // Calculate RMS for this pixel
      let sum = 0;
      let count = 0;
      for (let j = sampleStart; j < sampleEnd; j++) {
        if (j < channelData.length) {
          sum += channelData[j] * channelData[j];
          count++;
        }
      }
      
      const rms = count > 0 ? Math.sqrt(sum / count) : 0;
      result.push(rms);
    }
    
    return result;
  }, [audioData, localViewStart, localViewEnd]);

  // Get spectrogram data for current view
  const getViewSpectrogramData = useCallback((width: number): number[][] => {
    if (!audioData || !audioData.spectrogramData.length) return [];
    
    const totalFrames = audioData.spectrogramData.length;
    const startFrame = Math.floor((localViewStart / audioData.duration) * totalFrames);
    const endFrame = Math.floor((localViewEnd / audioData.duration) * totalFrames);
    const viewFrames = endFrame - startFrame;
    
    if (viewFrames <= 0) return [];
    
    // Downsample to fit canvas width
    const framesPerPixel = Math.max(1, Math.floor(viewFrames / width));
    const result: number[][] = [];
    
    for (let i = 0; i < width; i++) {
      const frameStart = startFrame + Math.floor(i * framesPerPixel);
      const frameEnd = Math.min(frameStart + framesPerPixel, totalFrames);
      
      // Average frames for this pixel
      const freqBins = audioData.spectrogramData[0]?.length || 64;
      const avgFrame: number[] = new Array(freqBins).fill(0);
      let count = 0;
      
      for (let j = frameStart; j < frameEnd; j++) {
        if (j < audioData.spectrogramData.length) {
          const frame = audioData.spectrogramData[j];
          for (let k = 0; k < freqBins; k++) {
            avgFrame[k] += frame[k] || 0;
          }
          count++;
        }
      }
      
      if (count > 0) {
        for (let k = 0; k < freqBins; k++) {
          avgFrame[k] /= count;
        }
      }
      
      result.push(avgFrame);
    }
    
    return result;
  }, [audioData, localViewStart, localViewEnd]);

  // Draw waveform
  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, data: number[]) => {
    if (!data.length) return;
    
    const centerY = height / 2;
    
    // Set waveform color - bright blue for visibility
    ctx.strokeStyle = '#3B82F6'; // Bright blue
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // Semi-transparent blue fill
    ctx.lineWidth = 1;
    
    // Draw filled waveform
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * width;
      const amplitude = Math.min(data[i] * 2, 1); // Scale amplitude
      const y = centerY - amplitude * centerY * 0.9;
      ctx.lineTo(x, y);
    }
    
    // Complete the shape for filling
    ctx.lineTo(width, centerY);
    ctx.closePath();
    ctx.fill();
    
    // Draw the outline
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * width;
      const amplitude = Math.min(data[i] * 2, 1);
      const y1 = centerY - amplitude * centerY * 0.9;
      const y2 = centerY + amplitude * centerY * 0.9;
      
      if (i === 0) {
        ctx.moveTo(x, y1);
      } else {
        ctx.lineTo(x, y1);
      }
    }
    ctx.stroke();
    
    // Draw bottom half
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * width;
      const amplitude = Math.min(data[i] * 2, 1);
      const y = centerY + amplitude * centerY * 0.9;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, []);

  // Draw spectrogram
  const drawSpectrogram = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, data: number[][]) => {
    if (!data.length) return;
    
    const freqBins = data[0]?.length || 64;
    const bandHeight = height / freqBins;
    
    for (let x = 0; x < data.length; x++) {
      const pixelX = (x / data.length) * width;
      const freqData = data[x];
      
      for (let freq = 0; freq < freqBins; freq++) {
        const intensity = Math.min(freqData[freq] * 10, 1); // Scale intensity
        const y = height - (freq + 1) * bandHeight;
        
        // Create heat map colors - from dark blue to bright red
        let r, g, b;
        if (intensity < 0.5) {
          // Dark blue to cyan
          r = 0;
          g = Math.floor(intensity * 2 * 255);
          b = 255;
        } else {
          // Cyan to red
          r = Math.floor((intensity - 0.5) * 2 * 255);
          g = 255 - Math.floor((intensity - 0.5) * 2 * 255);
          b = 255 - Math.floor((intensity - 0.5) * 2 * 255);
        }
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(pixelX, y, Math.ceil(width / data.length) + 1, bandHeight);
      }
    }
  }, []);

  // Main render function
  const renderVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas with dark background
    ctx.fillStyle = '#1A202C'; // Dark background for visibility
    ctx.fillRect(0, 0, width, height);

    if (!audioData) {
      // Show loading or no data message
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(
        isAnalyzing ? 'Analyzing audio...' : 'No audio data available',
        width / 2,
        height / 2
      );
      return;
    }

    // Get data for current view
    const waveformData = getViewWaveformData(width);
    const spectrogramData = getViewSpectrogramData(width);

    // Draw based on mode
    if (mode === 'spectrogram' || mode === 'mixed') {
      drawSpectrogram(ctx, width, height, spectrogramData);
    }
    
    if (mode === 'waveform' || mode === 'mixed') {
      if (mode === 'mixed') {
        ctx.globalAlpha = 0.7;
      }
      drawWaveform(ctx, width, height, waveformData);
      ctx.globalAlpha = 1;
    }

    // Draw playhead
    if (currentTime >= localViewStart && currentTime <= localViewEnd) {
      const playheadX = timeToPixel(currentTime);
      ctx.strokeStyle = '#EF4444'; // Bright red for visibility
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      
      // Playhead handle
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(playheadX, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // White outline for better visibility
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [currentTime, localViewStart, localViewEnd, mode, timeToPixel, audioData, isAnalyzing, getViewWaveformData, getViewSpectrogramData, drawWaveform, drawSpectrogram]);

  // Render when dependencies change
  useEffect(() => {
    renderVisualization();
  }, [renderVisualization]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = pixelToTime(x);
    setCurrentTime(snapToFrame(clickTime));
  }, [pixelToTime, setCurrentTime, snapToFrame]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    
    if (e.button === 0) { // Left mouse button - seek
      handleCanvasClick(e);
    }
  }, [handleCanvasClick]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && containerRef.current) {
      const dx = e.clientX - dragStart.x;
      setDragStart({ x: e.clientX, y: e.clientY });

      const containerWidth = containerRef.current.clientWidth;
      const viewDuration = localViewEnd - localViewStart;
      const timeDelta = (dx / containerWidth) * viewDuration;

      const newStart = Math.max(0, localViewStart - timeDelta);
      const newEnd = Math.min(duration, newStart + viewDuration);
      
      setLocalViewStart(newEnd - viewDuration);
      setLocalViewEnd(newEnd);
      return;
    }
    
    // For playhead dragging during click
    if (e.buttons === 1 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const time = pixelToTime(x);
      setCurrentTime(snapToFrame(time));
    }
  }, [isPanning, dragStart, localViewStart, localViewEnd, duration, pixelToTime, setCurrentTime, snapToFrame]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsPanning(false);
      e.preventDefault();
    }
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.cancelable) e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const timeAtCursor = pixelToTime(mouseX);

    // Zoom
    const zoomFactor = 1.1;
    let newZoom = e.deltaY < 0 ? localZoom * zoomFactor : localZoom / zoomFactor;
    newZoom = Math.max(1, Math.min(100, newZoom));
    setLocalZoom(newZoom);

    const newViewDuration = duration / newZoom;
    
    let newStart = timeAtCursor - (mouseX / rect.width) * newViewDuration;
    let newEnd = newStart + newViewDuration;

    if (newStart < 0) {
      newStart = 0;
      newEnd = newViewDuration;
    }
    if (newEnd > duration) {
      newEnd = duration;
      newStart = duration - newViewDuration;
    }
    
    setLocalViewStart(Math.max(0, newStart));
    setLocalViewEnd(Math.min(duration, newEnd));
  }, [localZoom, duration, pixelToTime]);

  // Mode toggle functions
  const toggleMode = useCallback((newMode: WaveformMode) => {
    setMode(newMode);
    setShowModeMenu(false);
  }, []);

  // Right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowModeMenu(true);
  }, []);

  if (!currentProject?.videoMeta) {
    return (
      <div className="neu-audio-waveform-panel h-full flex items-center justify-center neu-text-secondary">
        <p className="text-sm">Load a video to see the audio waveform</p>
      </div>
    );
  }

  return (
    <div className="neu-audio-waveform-panel h-full neu-bg-base flex flex-col">
      {/* Header with mode controls */}
      <div className="flex items-center justify-between p-3 border-b border-neu-dark">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium neu-text-primary">Audio Visualization</span>
          <span className="text-xs neu-text-secondary">
            {localZoom.toFixed(1)}x zoom
          </span>
          {isAnalyzing && (
            <span className="text-xs text-yellow-400">Analyzing...</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mode toggle buttons */}
          <div className="flex items-center space-x-1 neu-card p-1 rounded-lg">
            <motion.button
              onClick={() => toggleMode('waveform')}
              className={`p-2 rounded-md transition-all ${
                mode === 'waveform' 
                  ? 'bg-neu-primary text-white' 
                  : 'text-neu-text-secondary hover:text-neu-text-primary'
              }`}
              title="Waveform View"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Waves className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => toggleMode('spectrogram')}
              className={`p-2 rounded-md transition-all ${
                mode === 'spectrogram' 
                  ? 'bg-neu-primary text-white' 
                  : 'text-neu-text-secondary hover:text-neu-text-primary'
              }`}
              title="Spectrogram View"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => toggleMode('mixed')}
              className={`p-2 rounded-md transition-all ${
                mode === 'mixed' 
                  ? 'bg-neu-primary text-white' 
                  : 'text-neu-text-secondary hover:text-neu-text-primary'
              }`}
              title="Mixed View"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Layers className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* More options */}
          <div className="relative">
            <motion.button
              onClick={() => setShowModeMenu(!showModeMenu)}
              onContextMenu={handleContextMenu}
              className="neu-btn-icon p-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
            
            {/* Context menu */}
            <AnimatePresence>
              {showModeMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute top-full right-0 mt-2 neu-dropdown p-2 min-w-[150px] z-50"
                  onMouseLeave={() => setShowModeMenu(false)}
                >
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleMode('waveform')}
                      className={`w-full text-left neu-dropdown-item flex items-center space-x-2 ${
                        mode === 'waveform' ? 'text-neu-primary' : ''
                      }`}
                    >
                      <Waves className="w-4 h-4" />
                      <span>Waveform</span>
                    </button>
                    <button
                      onClick={() => toggleMode('spectrogram')}
                      className={`w-full text-left neu-dropdown-item flex items-center space-x-2 ${
                        mode === 'spectrogram' ? 'text-neu-primary' : ''
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Spectrogram</span>
                    </button>
                    <button
                      onClick={() => toggleMode('mixed')}
                      className={`w-full text-left neu-dropdown-item flex items-center space-x-2 ${
                        mode === 'mixed' ? 'text-neu-primary' : ''
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Mixed View</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Main visualization area */}
      <div 
        ref={containerRef}
        className="flex-1 relative cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Instructions overlay */}
        <div className="absolute top-2 left-2 text-xs neu-text-secondary bg-neu-base/80 backdrop-blur-sm rounded px-2 py-1">
          Click: Seek • Middle-drag: Pan • Wheel: Zoom • Right-click: Mode menu
        </div>
      </div>
      
      {/* Overview bar */}
      <div className="h-12 border-t border-neu-dark p-2">
        <div className="relative h-full neu-card rounded overflow-hidden">
          {/* Overview visualization */}
          <div className="absolute inset-0 bg-gradient-to-r from-neu-primary/20 via-neu-primary/40 to-neu-primary/20" />
          
          {/* Current view indicator */}
          <div 
            className="absolute top-0 bottom-0 bg-neu-primary/30 border-l-2 border-r-2 border-neu-primary"
            style={{
              left: `${(localViewStart / duration) * 100}%`,
              width: `${((localViewEnd - localViewStart) / duration) * 100}%`
            }}
          />
          
          {/* Playhead in overview */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-neu-error"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};