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
};

export const PanelContent: React.FC<PanelContentProps> = ({ type }) => {
  const PanelComponent = panelComponents[type];
  
  return (
    <div className="neu-panel-content">
      <PanelComponent />
    </div>
  );
};