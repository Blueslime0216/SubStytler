import { Monitor, Clock, AudioWaveform as Waveform, Type, Palette, FileText, Zap, History, StickyNote } from 'lucide-react';
import { PanelType } from '../types/project';

export const panelConfig: Record<PanelType, { title: string; icon: React.ComponentType<any>; description: string }> = {
  'video-preview': { title: 'Visual Display', icon: Monitor, description: 'Primary video monitoring station' },
  'subtitle-timeline': { title: 'Sequence Timeline', icon: Clock, description: 'Temporal sequence control matrix' },
  'audio-waveform': { title: 'Audio Spectrum', icon: Waveform, description: 'Acoustic wave analysis display' },
  'text-editor': { title: 'Text Processor', icon: Type, description: 'Linguistic data input terminal' },
  'style-manager': { title: 'Style Matrix', icon: Palette, description: 'Visual formatting control hub' },
  'script-viewer': { title: 'Script Database', icon: FileText, description: 'Complete sequence archive' },
  'effects-library': { title: 'FX Arsenal', icon: Zap, description: 'Animation effects repository' },
  'history': { title: 'Mission Log', icon: History, description: 'Operation history database' },
  'notes': { title: 'Command Notes', icon: StickyNote, description: 'Mission briefing terminal' },
};