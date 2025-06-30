import { Monitor, Clock, AudioWaveform as Waveform, Type, Palette, FileText, Zap, History, StickyNote, Square, Eye } from 'lucide-react';
import { PanelType } from '../types/project';

export const panelConfig: Record<PanelType, { title: string; icon: React.ComponentType<any>; description: string }> = {
  'video-preview': { title: 'Video Preview', icon: Monitor, description: 'Video playback and preview' },
  'subtitle-timeline': { title: 'Timeline', icon: Clock, description: 'Subtitle timeline editor' },
  'audio-waveform': { title: 'Audio Waveform', icon: Waveform, description: 'Audio waveform visualization' },
  'text-editor': { title: 'Text Editor', icon: Type, description: 'Subtitle text editing' },
  'script-viewer': { title: 'Script Viewer', icon: FileText, description: 'Script and subtitle list' },
  'effects-library': { title: 'Effects Library', icon: Zap, description: 'Animation effects library' },
  'history': { title: 'History', icon: History, description: 'Undo/redo history' },
  'notes': { title: 'Notes', icon: StickyNote, description: 'Project notes and comments' },
  'empty': { title: 'Empty Panel', icon: Square, description: 'Empty panel - select a type' },
  'subtitle-preview': { title: 'Subtitle Preview', icon: Eye, description: 'Preview subtitles in text format' },
};