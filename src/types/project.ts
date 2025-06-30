export interface SubtitleSpan {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  styleId?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  animations?: Animation[];
}

export interface SubtitleBlock {
  id: string;
  spans: SubtitleSpan[];
  startTime: number;
  endTime: number;
  trackId: string;
}

export interface SubtitleStyle {
  id: string;
  name: string;
  fc?: string; // font color
  fo?: number; // font opacity (0-255)
  bc?: string; // background color
  bo?: number; // background opacity (0-255)
  ec?: string; // edge color
  et?: number; // edge type
  fs?: string; // font style
  sz?: string; // size
  rb?: string; // ruby
  of?: number; // offset
  ju?: number; // justification
  pd?: string; // print direction
  sd?: string; // scroll direction
  ap?: number; // anchor point
  ah?: number; // anchor horizontal
  av?: number; // anchor vertical
}

export interface Animation {
  id: string;
  property: string;
  keyframes: Keyframe[];
  duration: number;
  easing?: string;
}

export interface Keyframe {
  time: number;
  value: any;
}

export interface VideoMeta {
  filename: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  file: File;
}

export interface SubtitleTrack {
  id: string;
  name: string;
  detail: string;
  visible: boolean;
  locked: boolean;
}

export interface Project {
  id: string;
  name: string;
  videoMeta?: VideoMeta;
  tracks: SubtitleTrack[];
  subtitles: SubtitleBlock[];
  styles: SubtitleStyle[];
  timeline: {
    currentTime: number;
    zoom: number;
    viewStart: number;
    viewEnd: number;
  };
  dependencies: string[];
  createdAt: number;
  updatedAt: number;
  layout?: any[]; // Store the current layout configuration
}

export interface WorkspaceLayout {
  areas: AreaConfig[];
  version: string;
}

export interface AreaConfig {
  id: string;
  type: 'panel' | 'split';
  panelType?: PanelType;
  direction?: 'horizontal' | 'vertical';
  size?: number;
  children?: AreaConfig[];
  minSize?: number;
  maxSize?: number;
}

export type PanelType = 
  | 'video-preview'
  | 'subtitle-timeline'
  | 'audio-waveform'
  | 'text-editor'
  | 'style-manager'
  | 'script-viewer'
  | 'effects-library'
  | 'history'
  | 'notes'
  | 'empty'
  | 'subtitle-preview'; // 새로운 자막 미리보기 패널 타입 추가