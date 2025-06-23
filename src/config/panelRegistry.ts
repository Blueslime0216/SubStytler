import { VideoPreviewPanel } from '../components/Panels/VideoPreviewPanel';
import { SubtitleTimelinePanel } from '../components/Panels/SubtitleTimelinePanel';
import { TextEditorPanel } from '../components/Panels/TextEditorPanel';

export const panelRegistry = {
  video: VideoPreviewPanel,
  timeline: SubtitleTimelinePanel,
  text: TextEditorPanel,
} as const;

export type PanelId = keyof typeof panelRegistry; 