import React from 'react';
import { Area } from '../types/area';

// Template layout icons (simplified visual representations)
const StandardIcon = (
  <div className="w-full h-full p-1 flex">
    <div className="w-3/5 h-full bg-primary/30 rounded-sm"></div>
    <div className="w-2/5 h-full flex flex-col ml-1">
      <div className="h-1/2 bg-primary/30 rounded-sm mb-1"></div>
      <div className="h-1/2 bg-primary/30 rounded-sm"></div>
    </div>
  </div>
);

const EditingFocusIcon = (
  <div className="w-full h-full p-1 flex flex-col">
    <div className="h-1/2 bg-primary/30 rounded-sm mb-1"></div>
    <div className="h-1/2 flex">
      <div className="w-1/2 bg-primary/30 rounded-sm mr-1"></div>
      <div className="w-1/2 bg-primary/30 rounded-sm"></div>
    </div>
  </div>
);

const TimelineFirstIcon = (
  <div className="w-full h-full p-1 flex flex-col">
    <div className="h-3/5 bg-primary/30 rounded-sm mb-1"></div>
    <div className="h-2/5 flex">
      <div className="w-1/2 bg-primary/30 rounded-sm mr-1"></div>
      <div className="w-1/2 bg-primary/30 rounded-sm"></div>
    </div>
  </div>
);

const QuadPanelIcon = (
  <div className="w-full h-full p-1 grid grid-cols-2 grid-rows-2 gap-1">
    <div className="bg-primary/30 rounded-sm"></div>
    <div className="bg-primary/30 rounded-sm"></div>
    <div className="bg-primary/30 rounded-sm"></div>
    <div className="bg-primary/30 rounded-sm"></div>
  </div>
);

const AdvancedEditingIcon = (
  <div className="w-full h-full p-1 grid grid-cols-3 grid-rows-2 gap-1">
    <div className="col-span-2 row-span-1 bg-primary/30 rounded-sm"></div>
    <div className="col-span-1 row-span-2 bg-primary/30 rounded-sm"></div>
    <div className="col-span-1 row-span-1 bg-primary/30 rounded-sm"></div>
    <div className="col-span-1 row-span-1 bg-primary/30 rounded-sm"></div>
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
      { id: 'video-preview', x: 0, y: 0, width: 60, height: 100, minWidth: 15, minHeight: 20 },
      { id: 'subtitle-timeline', x: 60, y: 0, width: 40, height: 55, minWidth: 15, minHeight: 20 },
      { id: 'text-editor', x: 60, y: 55, width: 40, height: 45, minWidth: 15, minHeight: 20 },
    ]
  },
  
  editingFocus: {
    name: "Editing Focus",
    description: "Large editor with video and timeline",
    icon: EditingFocusIcon,
    areas: [
      { id: 'text-editor', x: 0, y: 0, width: 100, height: 50, minWidth: 15, minHeight: 20 },
      { id: 'video-preview', x: 0, y: 50, width: 50, height: 50, minWidth: 15, minHeight: 20 },
      { id: 'subtitle-timeline', x: 50, y: 50, width: 50, height: 50, minWidth: 15, minHeight: 20 },
    ]
  },
  
  timelineFirst: {
    name: "Timeline First",
    description: "Large timeline with video and editor",
    icon: TimelineFirstIcon,
    areas: [
      { id: 'subtitle-timeline', x: 0, y: 0, width: 100, height: 60, minWidth: 15, minHeight: 20 },
      { id: 'video-preview', x: 0, y: 60, width: 50, height: 40, minWidth: 15, minHeight: 20 },
      { id: 'text-editor', x: 50, y: 60, width: 50, height: 40, minWidth: 15, minHeight: 20 },
    ]
  },
  
  quadPanel: {
    name: "Quad Panel",
    description: "Four equal panels for all tools",
    icon: QuadPanelIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 50, height: 50, minWidth: 15, minHeight: 20 },
      { id: 'subtitle-timeline', x: 50, y: 0, width: 50, height: 50, minWidth: 15, minHeight: 20 },
      { id: 'text-editor', x: 0, y: 50, width: 50, height: 50, minWidth: 15, minHeight: 20 },
      { id: 'style-manager', x: 50, y: 50, width: 50, height: 50, minWidth: 15, minHeight: 20 },
    ]
  },
  
  advancedEditing: {
    name: "Advanced Editing",
    description: "Complex layout with 5 specialized panels",
    icon: AdvancedEditingIcon,
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 66, height: 50, minWidth: 15, minHeight: 20 },
      { id: 'style-manager', x: 66, y: 0, width: 34, height: 100, minWidth: 15, minHeight: 20 },
      { id: 'subtitle-timeline', x: 0, y: 50, width: 33, height: 50, minWidth: 15, minHeight: 20 },
      { id: 'text-editor', x: 33, y: 50, width: 33, height: 50, minWidth: 15, minHeight: 20 },
    ]
  },
  
  audioFocused: {
    name: "Audio Focused",
    description: "Waveform and timeline with video",
    icon: (
      <div className="w-full h-full p-1 flex flex-col">
        <div className="h-2/5 bg-primary/30 rounded-sm mb-1"></div>
        <div className="h-3/5 flex">
          <div className="w-1/2 bg-primary/30 rounded-sm mr-1"></div>
          <div className="w-1/2 bg-primary/30 rounded-sm"></div>
        </div>
      </div>
    ),
    areas: [
      { id: 'video-preview', x: 0, y: 0, width: 100, height: 40, minWidth: 15, minHeight: 20 },
      { id: 'audio-waveform', x: 0, y: 40, width: 50, height: 60, minWidth: 15, minHeight: 20 },
      { id: 'subtitle-timeline', x: 50, y: 40, width: 50, height: 60, minWidth: 15, minHeight: 20 },
    ]
  }
};