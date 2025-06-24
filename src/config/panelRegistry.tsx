import React from 'react';
import { Panel } from '../components/Layout/Panel';
import { PanelType } from '../types/project';

// 🎯 패널 ID에서 타입 추출하는 강화된 함수
export const extractPanelType = (areaId: string): PanelType => {
  console.log('🔍 패널 타입 추출:', areaId);
  
  // 1️⃣ 정확한 패널 타입 매칭
  const panelTypes: PanelType[] = [
    'video-preview', 'subtitle-timeline', 'audio-waveform', 'text-editor',
    'style-manager', 'script-viewer', 'effects-library', 'history', 'notes', 'empty'
  ];
  
  // 2️⃣ 직접 매칭 시도
  if (panelTypes.includes(areaId as PanelType)) {
    console.log('✅ 직접 매칭 성공:', areaId);
    return areaId as PanelType;
  }
  
  // 3️⃣ 패턴 매칭 - 하이픈으로 분리된 첫 번째 부분 확인
  for (const panelType of panelTypes) {
    if (areaId.startsWith(panelType + '-')) {
      console.log('✅ 패턴 매칭 성공:', { areaId, matchedType: panelType });
      return panelType;
    }
  }
  
  // 4️⃣ 레거시 매핑
  const legacyMapping: Record<string, PanelType> = {
    'video': 'video-preview',
    'timeline': 'subtitle-timeline',
    'text': 'text-editor',
    'audio': 'audio-waveform',
    'style': 'style-manager',
    'script': 'script-viewer',
    'effects': 'effects-library'
  };
  
  const baseType = areaId.split('-')[0];
  if (legacyMapping[baseType]) {
    console.log('✅ 레거시 매칭 성공:', { areaId, baseType, mappedType: legacyMapping[baseType] });
    return legacyMapping[baseType];
  }
  
  // 5️⃣ 기본값: 빈 패널
  console.log('⚠️ 매칭 실패, 빈 패널로 설정:', areaId);
  return 'empty';
};

// 🎯 패널 레지스트리 - 동적 areaId 지원
export const panelRegistry = {
  // 레거시 지원
  video: () => <Panel type="video-preview" areaId="video" />,
  timeline: () => <Panel type="subtitle-timeline" areaId="timeline" />,
  text: () => <Panel type="text-editor" areaId="text" />,
  
  // 정식 패널 타입들
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
} as const;

export type PanelId = keyof typeof panelRegistry;

// 🔧 동적 패널 생성 함수
export const createPanel = (type: PanelType, areaId: string) => {
  return <Panel type={type} areaId={areaId} />;
};

// 🔧 패널 타입에서 컴포넌트 가져오기
export const getPanelComponent = (areaId: string) => {
  const panelType = extractPanelType(areaId);
  
  // 기본 컴포넌트 반환
  if (panelRegistry[panelType as keyof typeof panelRegistry]) {
    return panelRegistry[panelType as keyof typeof panelRegistry];
  }
  
  // 동적 컴포넌트 생성
  return () => <Panel type={panelType} areaId={areaId} />;
};