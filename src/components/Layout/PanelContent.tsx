import React from 'react';
import { PanelType } from '../../types/project';
import { VideoPreviewPanel } from '../Panels/VideoPreviewPanel';
import { SubtitleTimelinePanel } from '../Panels/SubtitleTimelinePanel';
import { AudioWaveformPanel } from '../Panels/AudioWaveformPanel';
import { TextEditorPanel } from '../Panels/TextEditorPanel';
import { ScriptViewerPanel } from '../Panels/ScriptViewerPanel';
import { EffectsLibraryPanel } from '../Panels/EffectsLibraryPanel';
import { HistoryPanel } from '../Panels/HistoryPanel';
import { NotesPanel } from '../Panels/NotesPanel';
import { EmptyPanel } from '../Panels/EmptyPanel'; // 🆕 빈 패널 추가
import { SubtitlePreviewPanel } from '../Panels/SubtitlePreviewPanel/SubtitlePreviewPanel';

interface PanelContentProps {
  type: PanelType;
}

const panelComponents: Partial<Record<PanelType, React.ComponentType>> = {
  'video-preview': VideoPreviewPanel,
  'subtitle-timeline': SubtitleTimelinePanel,
  'audio-waveform': AudioWaveformPanel,
  'text-editor': TextEditorPanel,
  'script-viewer': ScriptViewerPanel,
  'effects-library': EffectsLibraryPanel,
  'history': HistoryPanel,
  'notes': NotesPanel,
  'empty': EmptyPanel, // 🆕 빈 패널 컴포넌트 등록
  'subtitle-preview': SubtitlePreviewPanel,
};

export const PanelContent: React.FC<PanelContentProps> = ({ type }) => {
  const PanelComponent = panelComponents[type];
  
  if (!PanelComponent) {
    return (
      <div className="h-full flex items-center justify-center neu-text-secondary">
        <p className="text-sm">Panel type "{type}" not found</p>
      </div>
    );
  }
  
  // 🎯 Timeline panel gets special treatment - no padding, full space
  if (type === 'subtitle-timeline') {
    return (
      <div className="h-full w-full overflow-hidden">
        <PanelComponent />
      </div>
    );
  }
  
  // 📝 Text editor 패널은 div 없이 PanelComponent만 반환하여 내부 스크롤을 살립니다.
  if (type === 'text-editor') {
    return <PanelComponent />;
  }
  
  return (
    <div className="h-full w-full overflow-hidden">
      <PanelComponent />
    </div>
  );
};