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
    
    // 2️⃣ 패턴 매칭 시도 (대시가 포함된 패널 타입 지원)
    //    예: "video-preview-1735113234567-abc12" → "video-preview"
    //    예: "subtitle-timeline-1735113234567-abc12" → "subtitle-timeline"

    // ▶ 2-1. prefix 매칭: 등록된 키가 요청 ID의 접두사인지 확인
    for (const key of Object.keys(target) as PanelType[]) {
      if (prop === key || prop.startsWith(`${key}-`)) {
        // console.log('🎯 패턴 매칭 성공 (prefix):', { requestedId: prop, matchedType: key });
        return target[key as keyof typeof target];
      }
    }

    // ▶ 2-2. 레거시/축약형 별칭 매핑 (예: "video" → "video-preview")
    const aliasMap: Record<string, PanelType> = {
      video: 'video-preview',
      timeline: 'subtitle-timeline',
      text: 'text-editor',
    };
    if (prop in aliasMap) {
      const mappedType = aliasMap[prop];
      // console.log('🎯 별칭 매칭 성공:', { requestedId: prop, mappedType });
      return target[mappedType as keyof typeof target];
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
  // 1️⃣ 정확히 일치하는 타입 검사
  if (areaId in basePanelRegistry) {
    return areaId as PanelType;
  }

  // 2️⃣ prefix 매칭으로 타입 추출
  for (const key of Object.keys(basePanelRegistry) as PanelType[]) {
    if (areaId.startsWith(`${key}-`)) {
      return key;
    }
  }

  // 3️⃣ 별칭 매핑
  const aliasMap: Record<string, PanelType> = {
    video: 'video-preview',
    timeline: 'subtitle-timeline',
    text: 'text-editor',
  };
  if (areaId in aliasMap) {
    return aliasMap[areaId];
  }

  // 4️⃣ 기본값: empty
  return 'empty';
};