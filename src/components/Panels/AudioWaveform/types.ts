export type WaveformMode = 'waveform' | 'spectrogram' | 'mixed';

export interface PrecomputedData {
  waveform: Float32Array | null;
  spectrogram: Uint8Array[] | null;
  duration: number;
}

export interface AudioAnalysisState {
  isAnalyzing: boolean;
  precomputed: PrecomputedData;
}

export interface PanningState {
  isPanning: boolean;
  panStartX: number;
  panStartView: number;
}

export interface IndicatorState {
  isDragging: boolean;
}