import React from 'react';
import { Waves, BarChart3, Layers, RefreshCw } from 'lucide-react';
import { ContextMenu, ContextMenuItem, ContextMenuDivider } from '../../UI/ContextMenu';
import { WaveformMode } from './types';

interface AudioWaveformContextMenuProps {
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
  };
  setContextMenu: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    x: number;
    y: number;
  }>>;
  mode: WaveformMode;
  onModeChange: (mode: WaveformMode) => void;
  onResetZoom: () => void;
}

export const AudioWaveformContextMenu: React.FC<AudioWaveformContextMenuProps> = ({
  contextMenu,
  setContextMenu,
  mode,
  onModeChange,
  onResetZoom
}) => {
  return (
    <ContextMenu
      isOpen={contextMenu.isOpen}
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0 })}
    >
      <ContextMenuItem 
        icon={<Waves />}
        onClick={() => onModeChange('waveform')}
      >
        {mode === 'waveform' ? '✓ 파형 뷰' : '파형 뷰'}
      </ContextMenuItem>
      
      <ContextMenuItem 
        icon={<BarChart3 />}
        onClick={() => onModeChange('spectrogram')}
      >
        {mode === 'spectrogram' ? '✓ 스펙트로그램 뷰' : '스펙트로그램 뷰'}
      </ContextMenuItem>
      
      <ContextMenuItem 
        icon={<Layers />}
        onClick={() => onModeChange('mixed')}
      >
        {mode === 'mixed' ? '✓ 혼합 뷰' : '혼합 뷰'}
      </ContextMenuItem>
      
      <ContextMenuDivider />
      
      <ContextMenuItem 
        icon={<RefreshCw />}
        onClick={onResetZoom}
      >
        줌 초기화
      </ContextMenuItem>
    </ContextMenu>
  );
};