import React, { useRef, useState } from 'react';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useProjectStore } from '../../../stores/projectStore';
import { AudioWaveformContextMenu } from './AudioWaveformContextMenu';
import { WaveformMode } from './types';

interface AudioWaveformPanelProps {
  areaId?: string;
}

export const AudioWaveformPanel: React.FC<AudioWaveformPanelProps> = ({ areaId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [mode, setMode] = useState<WaveformMode>('waveform');
  const [verticalZoom, setVerticalZoom] = useState(1);
  
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
  
  const { currentProject } = useProjectStore();
  const { duration } = useTimelineStore();
  
  // Local state for this panel instance
  const [localZoom, setLocalZoom] = useState(1);
  const [localViewStart, setLocalViewStart] = useState(0);
  const [localViewEnd, setLocalViewEnd] = useState(60000);
  
  // 컨텍스트 메뉴 처리
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // 줌 초기화 처리
  const handleResetZoom = () => {
    setLocalViewStart(0);
    setLocalViewEnd(duration);
    setLocalZoom(1);
    setVerticalZoom(1);
    setContextMenu({ isOpen: false, x: 0, y: 0 });
  };
  
  // 모드 변경 처리
  const handleModeChange = (newMode: WaveformMode) => {
    setMode(newMode);
    setContextMenu({ isOpen: false, x: 0, y: 0 });
  };

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
        onContextMenu={handleContextMenu}
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>
      </div>

      <AudioWaveformContextMenu
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        mode={mode}
        onModeChange={handleModeChange}
        onResetZoom={handleResetZoom}
      />
    </div>
  );
};