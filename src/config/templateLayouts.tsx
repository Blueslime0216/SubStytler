import React from 'react';
import { Area } from '../types/area';

// Template layout icons (simplified visual representations)
const StandardIcon = (
  <div className="w-full h-full p-1 flex">
    <div className="w-3/5 h-full rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)' }}></div>
    <div className="w-2/5 h-full flex flex-col ml-1">
      <div className="rounded-sm mb-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '30%' }}></div>
      <div className="rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '70%' }}></div>
    </div>
  </div>
);

const EditingFocusIcon = (
  <div className="w-full h-full p-1 flex flex-col">
    <div className="h-1/2 flex">
      <div className="w-1/2 rounded-sm mr-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)' }}></div>
      <div className="w-1/2 rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)' }}></div>
    </div>
    <div className="h-1/2 rounded-sm mt-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)' }}></div>
  </div>
);

const TimelineFirstIcon = (
  <div className="w-full h-full p-1 flex flex-col">
    <div className="h-2/5 flex">
      <div className="w-1/2 rounded-sm mr-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)' }}></div>
      <div className="w-1/2 rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)' }}></div>
    </div>
    <div className="h-3/5 rounded-sm mt-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)' }}></div>
  </div>
);

const KeyframeStudioIcon = (
  <div className="w-full h-full p-1 flex">
    {/* 왼쪽 66% 영역 - 2개 패널 */}
    <div className="h-full flex flex-col mr-1" style={{ width: '66%' }}>
      <div className="rounded-sm mb-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '60%' }}></div>
      <div className="rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '40%' }}></div>
    </div>
    {/* 오른쪽 34% 영역 - 3개 패널 */}
    <div className="h-full flex flex-col" style={{ width: '34%' }}>
      <div className="rounded-sm mb-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '20%' }}></div>
      <div className="rounded-sm mb-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '50%' }}></div>
      <div className="rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '30%' }}></div>
    </div>
  </div>
);

const AudioFocusedIcon = (
  <div className="w-full h-full p-1 flex">
    {/* 왼쪽 33% 영역 - 2개 패널 */}
    <div className="h-full flex flex-col" style={{ width: '33%' }}>
      <div className="rounded-sm mb-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '60%' }}></div>
      <div className="rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '40%' }}></div>
    </div>
    {/* 오른쪽 67% 영역 - 3개 패널 */}
    <div className="h-full flex flex-col ml-1" style={{ width: '67%' }}>
      <div className="rounded-sm mb-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '60%' }}></div>
      <div className="flex" style={{ height: '40%' }}>
        <div className="rounded-sm mr-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', width: '49%', height: '100%' }}></div>
        <div className="rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', width: '51%', height: '100%' }}></div>
      </div>
    </div>
  </div>
);

const VerticalEditingIcon = (
  <div className="w-full h-full p-1 flex flex-col">
    {/* 상단 70% 영역 */}
    <div className="flex" style={{ height: '70%' }}>
      {/* video-preview: 왼쪽 60% */}
      <div className="rounded-sm mr-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', width: '60%', height: '100%' }}></div>
      {/* 오른쪽 40% 영역 - 2개 패널 */}
      <div className="flex flex-col" style={{ width: '40%', height: '100%' }}>
        {/* text-editor: 위쪽 50% */}
        <div className="rounded-sm mb-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '50%' }}></div>
        {/* subtitle-timeline: 아래쪽 50% */}
        <div className="rounded-sm" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '50%' }}></div>
      </div>
    </div>
    {/* subtitle-preview: 하단 30% 전체 */}
    <div className="rounded-sm mt-1" style={{ backgroundColor: 'rgba(94, 129, 172, 0.3)', height: '30%' }}></div>
  </div>
);

// Template layout configurations
interface TemplateLayout {
  name: string;
  description: string;
  icon: React.ReactNode;
  areas: Area[];
}

export const templateLayouts: Record<string, TemplateLayout> = {
  standard: {
    name: "Standard",
    description: "Video preview with timeline and editor",
    icon: StandardIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 60, height: 100 },
      { id: 'subtitle-timeline', x: 60, y: 0, width: 40, height: 30 },
      { id: 'text-editor', x: 60, y: 30, width: 40, height: 70 },
    ]
  },
  
  editingFocus: {
    name: "Editing Focus",
    description: "Video and timeline with editor below",
    icon: EditingFocusIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 50, height: 50 },
      { id: 'script-viewer', x: 50, y: 0, width: 50, height: 50 },
      { id: 'subtitle-timeline', x: 0, y: 50, width: 100, height: 50 },
    ]
  },
  
  timelineFirst: {
    name: "Timeline First",
    description: "Video and editor with timeline below",
    icon: TimelineFirstIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 50, height: 40 },
      { id: 'text-editor', x: 50, y: 0, width: 50, height: 40 },
      { id: 'subtitle-timeline', x: 0, y: 40, width: 100, height: 60 },
    ]
  },
  
  keyframeStudio: {
    name: "Keyframe Studio",
    description: "Animation and keyframe editing",
    icon: KeyframeStudioIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 66, height: 60 },
      { id: 'graph-library', x: 66, y: 0, width: 34, height: 20 },
      { id: 'subtitle-timeline', x: 66, y: 70, width: 34, height: 30 },
      { id: 'keyframe', x: 0, y: 60, width: 66, height: 40 },
      { id: 'text-editor', x: 66, y: 20, width: 34, height: 50 },
    ]
  },
  
  audioFocused: {
    name: "Audio Focused",
    description: "Five panels with audio emphasis",
    icon: AudioFocusedIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 33, height: 60 },
      { id: 'audio-waveform', x: 33, y: 0, width: 67, height: 60 },
      { id: 'subtitle-timeline', x: 0, y: 60, width: 33, height: 40 },
      { id: 'subtitle-preview', x: 33, y: 60, width: 33, height: 40 },
      { id: 'text-editor', x: 66, y: 60, width: 34, height: 40 },
    ]
  },
  
  previewFocused: {
    name: "Vertical Editing",
    description: "Tall video layout with tools stacked on the right",
    icon: VerticalEditingIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 60, height: 70 },
      { id: 'text-editor', x: 60, y: 0, width: 40, height: 35 },
      { id: 'subtitle-timeline', x: 60, y: 35, width: 40, height: 35 },
      { id: 'subtitle-preview', x: 0, y: 70, width: 100, height: 30 },
    ]
  }
};