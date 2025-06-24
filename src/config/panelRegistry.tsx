import React from 'react';
import { Panel } from '../components/Layout/Panel';
import { PanelType } from '../types/project';

// 🎯 패널 ID 패턴 매칭을 위한 정규식
const PANEL_ID_PATTERNS = {
  video: /^(video|video-preview)/,
  timeline: /^(timeline|subtitle-timeline)/,
  text: /^(text|text-editor)/,
  'video-preview': /^(video|video-preview)/,
  'subtitle-timeline': /^(timeline|subtitle-timeline)/,
  'audio-waveform': /^(audio|audio-waveform)/,
  'text-editor': /^(text|text-editor)/,
  'style-manager': /^(style|style-manager)/,
  'script-viewer': /^(script|script-viewer)/,
  'effects-library': /^(effects|effects-library)/,
  'history': /^(history)/,
  'notes': /^(notes)/,
  'empty': /^(empty)/,
} as const;

// 🔧 패널 타입 추출 함수 - 안정적인 매칭
export const extractPanelType = (areaId: string): PanelType => {
  console.log('🔍 패널 타입 추출 시도:', areaId);
  
  // 1️⃣ 직접 매칭 시도
  if (areaId in PANEL_ID_PATTERNS) {
    console.log('✅ 직접 매칭 성공:', areaId);
    return areaId as PanelType;
  }
  
  // 2️⃣ 패턴 매칭 시도 (타임스탬프+랜덤 문자열 포함된 ID)
  for (const [panelType, pattern] of Object.entries(PANEL_ID_PATTERNS)) {
    if (pattern.test(areaId)) {
      console.log('✅ 패턴 매칭 성공:', { areaId, matchedType: panelType });
      return panelType as PanelType;
    }
  }
  
  // 3️⃣ 하이픈으로 분리된 첫 번째 부분 확인
  const baseType = areaId.split('-')[0];
  if (baseType in PANEL_ID_PATTERNS) {
    console.log('✅ 베이스 타입 매칭 성공:', { areaId, baseType });
    return baseType as PanelType;
  }
  
  // 4️⃣ 기본값: 빈 패널
  console.log('⚠️ 매칭 실패, 빈 패널로 설정:', areaId);
  return 'empty';
};

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
} as const;

export type PanelId = keyof typeof panelRegistry;

// Helper function to create panel with proper props
export const createPanel = (type: PanelType, areaId: string) => {
  return <Panel type={type} areaId={areaId} />;
};