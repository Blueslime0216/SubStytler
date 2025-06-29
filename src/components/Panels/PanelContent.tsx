import React from 'react';
import { PanelType } from '../../types/project';
import { VideoPreviewPanel } from '../Panels/VideoPreviewPanel';
import { SubtitleTimelinePanel } from '../Panels/SubtitleTimelinePanel';
import { AudioWaveformPanel } from '../Panels/AudioWaveformPanel';
import { TextEditorPanel } from '../Panels/TextEditorPanel';
import { StyleManagerPanel } from '../Panels/StyleManagerPanel';
import { ScriptViewerPanel } from '../Panels/ScriptViewerPanel';
import { EffectsLibraryPanel } from '../Panels/EffectsLibraryPanel';
import { HistoryPanel } from '../Panels/HistoryPanel';
import { NotesPanel } from '../Panels/NotesPanel';
import { EmptyPanel } from '../Panels/EmptyPanel';
import SubtitlePreviewPanel from '../Panels/SubtitlePreviewPanel';

interface PanelContentProps {
  type: PanelType;
}

const panelComponents: Record<PanelType, React.ComponentType> = {
  'video-preview': VideoPreviewPanel,
  'subtitle-timeline': SubtitleTimelinePanel,
  'audio-waveform': AudioWaveformPanel,
  'text-editor': TextEditorPanel,
  'style-manager': StyleManagerPanel,
  'script-viewer': ScriptViewerPanel,
  'effects-library': EffectsLibraryPanel,
  'history': HistoryPanel,
  'notes': NotesPanel,
  'empty': EmptyPanel,
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
  
  return (
    <div className="h-full w-full overflow-hidden">
      <PanelComponent />
    </div>
  );
};