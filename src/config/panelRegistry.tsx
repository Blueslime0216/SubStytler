import React from 'react';
import { Panel } from '../components/Layout/Panel';
import { PanelType } from '../types/project';

export const panelRegistry = {
  video: () => <Panel type="video-preview" areaId="video" />,
  timeline: () => <Panel type="subtitle-timeline" areaId="timeline" />,
  text: () => <Panel type="text-editor" areaId="text" />,
  'video-preview': () => <Panel type="video-preview" areaId="video-preview" />,
  'subtitle-timeline': () => <Panel type="subtitle-timeline" areaId="subtitle-timeline" />,
  'audio-waveform': () => <Panel type="audio-waveform" areaId="audio-waveform" />,
  'text-editor': () => <Panel type="text-editor" areaId="text-editor" />,
  'style-manager': () => <Panel type="style-manager" areaId="style-manager" />,
  'script-viewer': () => <Panel type="script-viewer" areaId="script-viewer" />,
  'effects-library': () => <Panel type="effects-library" areaId="effects-library" />,
  'history': () => <Panel type="history" areaId="history" />,
  'notes': () => <Panel type="notes" areaId="notes" />,
  'empty': () => <Panel type="empty" areaId="empty" />,
  
  // 🔧 동적 패널 생성 함수 추가
  createPanel: (type: PanelType, areaId: string) => <Panel type={type} areaId={areaId} key={areaId} />
} as const;

export type PanelId = keyof typeof panelRegistry;

// 🔧 Helper function to create panel with proper props and unique key
export const createPanel = (type: PanelType, areaId: string) => {
  console.log('🏗️ 패널 생성:', { type, areaId });
  return <Panel type={type} areaId={areaId} key={`${type}-${areaId}-${Date.now()}`} />;
};