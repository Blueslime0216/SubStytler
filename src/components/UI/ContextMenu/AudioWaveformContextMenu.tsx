import React from 'react';
import { motion } from 'framer-motion';
import { Waves, BarChart3, Layers, ZoomOut } from 'lucide-react';
import { ContextMenu, ContextMenuItem, ContextMenuDivider } from './index';

interface AudioWaveformContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  currentMode: 'waveform' | 'spectrogram' | 'mixed';
  onModeChange: (mode: 'waveform' | 'spectrogram' | 'mixed') => void;
  onResetZoom: () => void;
}

export const AudioWaveformContextMenu: React.FC<AudioWaveformContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
  currentMode,
  onModeChange,
  onResetZoom
}) => {
  if (!isOpen) return null;

  return (
    <ContextMenu
      isOpen={isOpen}
      x={x}
      y={y}
      onClose={onClose}
    >
      <ContextMenuItem 
        icon={<Waves />}
        onClick={() => { onModeChange('waveform'); onClose(); }}
        disabled={currentMode === 'waveform'}
      >
        {currentMode === 'waveform' ? <strong>Waveform Mode</strong> : 'Waveform Mode'}
      </ContextMenuItem>
      
      <ContextMenuItem 
        icon={<BarChart3 />}
        onClick={() => { onModeChange('spectrogram'); onClose(); }}
        disabled={currentMode === 'spectrogram'}
      >
        {currentMode === 'spectrogram' ? <strong>Spectrogram Mode</strong> : 'Spectrogram Mode'}
      </ContextMenuItem>
      
      <ContextMenuItem 
        icon={<Layers />}
        onClick={() => { onModeChange('mixed'); onClose(); }}
        disabled={currentMode === 'mixed'}
      >
        {currentMode === 'mixed' ? <strong>Mixed Mode</strong> : 'Mixed Mode'}
      </ContextMenuItem>
      
      <ContextMenuDivider />
      
      <ContextMenuItem 
        icon={<ZoomOut />}
        onClick={() => { onResetZoom(); onClose(); }}
      >
        Reset Zoom
      </ContextMenuItem>
    </ContextMenu>
  );
};