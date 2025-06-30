import React from 'react';
import { Waves, BarChart3, Layers } from 'lucide-react';
import { WaveformMode } from './types';

interface AudioWaveformToolbarProps {
  mode: WaveformMode;
  onModeChange: (mode: WaveformMode) => void;
}

export const AudioWaveformToolbar: React.FC<AudioWaveformToolbarProps> = ({
  mode,
  onModeChange
}) => {
  return (
    <div className="flex gap-2 mb-2">
      <button 
        className={`p-2 rounded-md flex items-center justify-center ${mode === 'waveform' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        onClick={() => onModeChange('waveform')}
        title="파형 뷰"
      >
        <Waves size={16} />
      </button>
      <button 
        className={`p-2 rounded-md flex items-center justify-center ${mode === 'spectrogram' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        onClick={() => onModeChange('spectrogram')}
        title="스펙트로그램 뷰"
      >
        <BarChart3 size={16} />
      </button>
      <button 
        className={`p-2 rounded-md flex items-center justify-center ${mode === 'mixed' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        onClick={() => onModeChange('mixed')}
        title="혼합 뷰"
      >
        <Layers size={16} />
      </button>
    </div>
  );
};