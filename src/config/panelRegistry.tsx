import React from 'react';
import { Panel } from '../components/Layout/Panel';
import { PanelType } from '../types/project';

// 🎯 모든 패널 타입을 동적으로 등록
export const panelRegistry = {
  // 기존 패널들
  video: () => <Panel type="video-preview" areaId="video" />,
  timeline: () => <Panel type="subtitle-timeline" areaId="timeline" />,
  text: () => <Panel type="text-editor" areaId="text" />,
  
  // 🆕 모든 패널 타입 완전 등록
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
  
  // 🔄 동적 패널 생성을 위한 fallback
  default: (id: string) => <Panel type="empty" areaId={id} />,
} as const;

export type PanelId = keyof typeof panelRegistry;

// 🎯 Helper function - 안전한 패널 생성
export const createPanel = (type: PanelType, areaId: string) => {
  return <Panel type={type} areaId={areaId} />;
};

// 🆕 동적 패널 렌더링 함수
export const renderPanelById = (areaId: string): React.ReactNode => {
  console.log('🎨 패널 렌더링 시도:', areaId);
  
  // 1. 직접 매칭 시도
  if (areaId in panelRegistry) {
    console.log('✅ 직접 매칭 성공:', areaId);
    const PanelComponent = panelRegistry[areaId as keyof typeof panelRegistry];
    return typeof PanelComponent === 'function' ? PanelComponent() : PanelComponent;
  }
  
  // 2. 패널 타입으로 매칭 시도
  const panelTypes: PanelType[] = [
    'video-preview', 'subtitle-timeline', 'audio-waveform', 'text-editor',
    'style-manager', 'script-viewer', 'effects-library', 'history', 'notes', 'empty'
  ];
  
  if (panelTypes.includes(areaId as PanelType)) {
    console.log('✅ 패널 타입 매칭 성공:', areaId);
    return <Panel type={areaId as PanelType} areaId={areaId} />;
  }
  
  // 3. 기본값: 빈 패널
  console.log('⚠️ 매칭 실패, 빈 패널로 대체:', areaId);
  return <Panel type="empty" areaId={areaId} />;
};