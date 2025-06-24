import React from 'react';
import { Panel } from '../components/Layout/Panel';
import { PanelType } from '../types/project';

// 🔧 패널 생성 함수 - areaId를 올바르게 전달
const createPanelComponent = (type: PanelType) => {
  return React.forwardRef<any, { areaId?: string }>((props, ref) => {
    console.log('🏗️ 패널 컴포넌트 생성:', { type, areaId: props.areaId });
    return <Panel type={type} areaId={props.areaId} key={props.areaId || type} />;
  });
};

export const panelRegistry = {
  video: createPanelComponent('video-preview'),
  timeline: createPanelComponent('subtitle-timeline'),
  text: createPanelComponent('text-editor'),
  'video-preview': createPanelComponent('video-preview'),
  'subtitle-timeline': createPanelComponent('subtitle-timeline'),
  'audio-waveform': createPanelComponent('audio-waveform'),
  'text-editor': createPanelComponent('text-editor'),
  'style-manager': createPanelComponent('style-manager'),
  'script-viewer': createPanelComponent('script-viewer'),
  'effects-library': createPanelComponent('effects-library'),
  'history': createPanelComponent('history'),
  'notes': createPanelComponent('notes'),
  'empty': createPanelComponent('empty'),
} as const;

export type PanelId = keyof typeof panelRegistry;

// 🔧 Helper function to create panel with proper props and unique key
export const createPanel = (type: PanelType, areaId: string) => {
  console.log('🏗️ 패널 생성:', { type, areaId });
  return <Panel type={type} areaId={areaId} key={`${type}-${areaId}-${Date.now()}`} />;
};