import { Monitor, Clock, AudioWaveform as Waveform, Type, Palette, FileText, Zap, History, StickyNote } from 'lucide-react';
import { PanelType } from '../types/project';

export const panelConfig: Record<PanelType, { title: string; icon: React.ComponentType<any>; description: string }> = {
  'video-preview': { title: 'Cinema Preview', icon: Monitor, description: 'Professional video playback studio' },
  'subtitle-timeline': { title: 'Scene Timeline', icon: Clock, description: 'Cinematic subtitle sequencing' },
  'audio-waveform': { title: 'Audio Spectrum', icon: Waveform, description: 'Professional audio visualization' },
  'text-editor': { title: 'Script Editor', icon: Type, description: 'Cinematic text composition' },
  'style-manager': { title: 'Style Director', icon: Palette, description: 'Visual style management' },
  'script-viewer': { title: 'Scene Browser', icon: FileText, description: 'Complete script overview' },
  'effects-library': { title: 'FX Library', icon: Zap, description: 'Cinematic effects collection' },
  'history': { title: 'Take History', icon: History, description: 'Production timeline history' },
  'notes': { title: 'Director Notes', icon: StickyNote, description: 'Production notes & comments' },
};