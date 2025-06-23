import { VideoPreviewPanel } from '../components/Panels/VideoPreviewPanel';
import { SubtitleTimelinePanel } from '../components/Panels/SubtitleTimelinePanel';
import { TextEditorPanel } from '../components/Panels/TextEditorPanel';
import { StyleManagerPanel } from '../components/Panels/StyleManagerPanel';
import { ScriptViewerPanel } from '../components/Panels/ScriptViewerPanel';
import { EffectsLibraryPanel } from '../components/Panels/EffectsLibraryPanel';
import { HistoryPanel } from '../components/Panels/HistoryPanel';
import { NotesPanel } from '../components/Panels/NotesPanel';
import { AudioWaveformPanel } from '../components/Panels/AudioWaveformPanel';
import { Panel } from '../components/Layout/Panel';

export const panelRegistry = {
  video: () => <Panel type="video-preview" />,
  timeline: () => <Panel type="subtitle-timeline" />,
  text: () => <Panel type="text-editor" />,
} as const;

export type PanelId = keyof typeof panelRegistry;