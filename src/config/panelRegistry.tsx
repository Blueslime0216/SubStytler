import React from 'react';
import { Panel } from '../components/Layout/Panel';
import { PanelType } from '../types/project';

// 🎯 동적 패널 생성 함수 - ID 패턴 매칭 지원
const createPanelComponent = (panelType: PanelType) => {
  return ({ areaId }: { areaId?: string }) => (
    <Panel type={panelType} areaId={areaId} />
  );
};

// 🎯 기본 패널 레지스트리 - 직접 매칭용
export const basePanelRegistry = {
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

// 🎯 동적 패널 레지스트리 - 패턴 매칭 지원
export const panelRegistry = new Proxy(basePanelRegistry, {
  get(target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    
    // 1️⃣ 직접 매칭 시도
    if (prop in target) {
      return target[prop as keyof typeof target];
    }
    
    // 2️⃣ 패턴 매칭 시도 (예: "empty-1735113234567-abc12" → "empty")
    const baseType = prop.split('-')[0] as PanelType;
    if (baseType in target) {
      console.log('🎯 패턴 매칭 성공:', { requestedId: prop, matchedType: baseType });
      return target[baseType as keyof typeof target];
    }
    
    // 3️⃣ 기본값: 빈 패널
    console.warn('⚠️ 패널 타입을 찾을 수 없음, 빈 패널로 대체:', prop);
    return target.empty;
  }
});

export type PanelId = keyof typeof basePanelRegistry;

// Helper function to create panel with proper props
export const createPanel = (type: PanelType, areaId: string) => {
  return <Panel type={type} areaId={areaId} />;
};

// 🎯 패널 타입 추출 함수
export const extractPanelType = (areaId: string): PanelType => {
  const baseType = areaId.split('-')[0] as PanelType;
  
  // 유효한 패널 타입인지 확인
  if (baseType in basePanelRegistry) {
    return baseType;
  }
  
  // 기본값: empty
  return 'empty';
};