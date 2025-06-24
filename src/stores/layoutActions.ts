import { PanelType } from '../types/project';
import { StateCreator } from 'zustand';

/**
 * 🎯 Area 시스템 전용 레이아웃 액션 - 완전히 수정된 분할 시스템
 * 좌표 기반 분할 및 관리
 */

// 🔧 안정적인 ID 생성 함수 - 단순화
const generateStableId = (prefix: string = 'panel'): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${randomStr}`;
};

export const createLayoutActions: StateCreator<any> = (set, get, _store) => ({
  setAreas: (areas: any[]) => {
    console.log('🔄 Areas 업데이트:', areas.length, '개 패널');
    set({ areas: areas.slice() });
  },

  splitArea: (areaId: string, direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    console.log('🔀 패널 분할 시작:', { areaId, direction, newPanelType });
    
    const { areas } = get();

    // 🎯 분할할 area 찾기
    const targetAreaIndex = areas.findIndex((area: any) => area.id === areaId);
    if (targetAreaIndex === -1) {
      console.error('❌ 분할할 area를 찾을 수 없습니다:', areaId);
      console.log('📋 현재 areas:', areas.map(a => ({ id: a.id, x: a.x, y: a.y, w: a.width, h: a.height })));
      return;
    }

    const targetArea = areas[targetAreaIndex];
    console.log('🎯 분할 대상 area:', targetArea);

    // 🆕 새로운 area ID 생성
    const newAreaId = generateStableId(newPanelType);
    console.log('🆕 새로운 패널 ID 생성:', newAreaId);

    // 📐 분할 계산 - 더 안정적인 로직
    let updatedArea, newArea;

    if (direction === 'horizontal') {
      // 가로 분할: 위아래로 나누기
      const halfHeight = targetArea.height / 2;
      
      updatedArea = {
        ...targetArea,
        height: halfHeight, // 상단 절반
      };
      
      newArea = {
        id: newAreaId,
        x: targetArea.x,
        y: targetArea.y + halfHeight, // 하단 절반
        width: targetArea.width,
        height: halfHeight,
        minWidth: 15,
        minHeight: 20,
      };
    } else {
      // 세로 분할: 좌우로 나누기
      const halfWidth = targetArea.width / 2;
      
      updatedArea = {
        ...targetArea,
        width: halfWidth, // 좌측 절반
      };
      
      newArea = {
        id: newAreaId,
        x: targetArea.x + halfWidth, // 우측 절반
        y: targetArea.y,
        width: halfWidth,
        height: targetArea.height,
        minWidth: 15,
        minHeight: 20,
      };
    }

    console.log('📐 분할 결과:', {
      updated: { id: updatedArea.id, x: updatedArea.x, y: updatedArea.y, w: updatedArea.width, h: updatedArea.height },
      new: { id: newArea.id, x: newArea.x, y: newArea.y, w: newArea.width, h: newArea.height }
    });

    // 🔄 areas 배열 업데이트
    const newAreas = [...areas];
    newAreas[targetAreaIndex] = updatedArea; // 기존 area 업데이트
    newAreas.push(newArea); // 새로운 area 추가

    console.log('✅ 패널 분할 완료:', {
      direction,
      originalId: areaId,
      newId: newAreaId,
      totalPanels: newAreas.length,
      allAreas: newAreas.map(a => ({ id: a.id, x: a.x, y: a.y, w: a.width, h: a.height }))
    });

    set({ areas: newAreas });
  },

  changePanelType: (areaId: string, newPanelType: PanelType) => {
    console.log('🔄 패널 타입 변경 시도:', { areaId, newPanelType });
    
    const { areas } = get();
    
    const targetIndex = areas.findIndex((area: any) => area.id === areaId);
    if (targetIndex === -1) {
      console.error('❌ 변경할 area를 찾을 수 없습니다:', areaId);
      console.log('📋 현재 areas:', areas.map(a => a.id));
      return;
    }

    // 🆕 새로운 안정적인 ID 생성
    const newId = generateStableId(newPanelType);
    
    const newAreas = [...areas];
    newAreas[targetIndex] = { 
      ...areas[targetIndex], 
      id: newId
    };

    console.log('✅ 패널 타입 변경 완료:', {
      oldId: areaId,
      newId: newId,
      newType: newPanelType
    });

    set({ areas: newAreas });
  },

  removeArea: (areaId: string) => {
    const { areas } = get();

    if (areas.length <= 1) {
      console.warn('⚠️ 마지막 패널은 제거할 수 없습니다');
      return;
    }

    console.log('🗑️ 패널 제거 시도:', areaId);

    const newAreas = areas.filter((area: any) => area.id !== areaId);
    
    console.log('✅ 패널 제거 완료:', {
      removedId: areaId,
      remainingPanels: newAreas.length
    });

    set({ areas: newAreas });
  },

  // 🔧 기타 액션들
  mergePanels: (sourceId: string, targetId: string) => {
    console.log('🔗 패널 병합 (구현 예정):', { sourceId, targetId });
  },

  resizeArea: (areaId: string, size: number) => {
    console.log('📏 영역 크기 조정 (구현 예정):', { areaId, size });
  },

  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => {
    console.log('➕ 새 영역 추가 (구현 예정):', { parentId, direction, panelType });
  },
});