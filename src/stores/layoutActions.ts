import { PanelType } from '../types/project';
import { StateCreator } from 'zustand';

/**
 * 🎯 Area 시스템 전용 레이아웃 액션 - 안정적인 ID 생성 시스템
 * 좌표 기반 분할 및 관리
 */

// 🔧 안정적인 ID 생성 함수
const generateStableId = (prefix: string = 'panel'): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomStr}`;
};

export const createLayoutActions: StateCreator<any> = (set, get, _store) => ({
  setAreas: (areas: any[]) => {
    // 🔧 성능 최적화: 얕은 복사로 변경하여 메모리 사용량 감소
    set({ areas: areas.slice() });
  },

  splitArea: (areaId: string, direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    const { areas } = get();

    // 🎯 분할할 area 찾기
    const targetAreaIndex = areas.findIndex((area: any) => area.id === areaId);
    if (targetAreaIndex === -1) {
      console.warn('⚠️ 분할할 area를 찾을 수 없습니다:', areaId);
      return;
    }

    const targetArea = areas[targetAreaIndex];

    // 🆕 안정적인 새로운 area ID 생성
    const newAreaId = generateStableId(newPanelType);
    console.log('🆕 새로운 패널 ID 생성:', newAreaId);

    // 📐 분할 계산
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
        minWidth: targetArea.minWidth || 15,
        minHeight: targetArea.minHeight || 20,
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
        minWidth: targetArea.minWidth || 15,
        minHeight: targetArea.minHeight || 20,
      };
    }

    // 🔄 areas 배열 업데이트 - 성능 최적화
    const newAreas = areas.slice(); // 얕은 복사
    newAreas[targetAreaIndex] = updatedArea; // 기존 area 업데이트
    newAreas.push(newArea); // 새로운 area 추가

    console.log('✅ 패널 분할 완료:', {
      direction,
      originalId: areaId,
      newId: newAreaId,
      totalPanels: newAreas.length
    });

    set({ areas: newAreas });
  },

  changePanelType: (areaId: string, newPanelType: PanelType) => {
    const { areas } = get();
    
    console.log('🔄 패널 타입 변경 시도:', {
      areaId,
      newPanelType,
      currentAreas: areas.map(a => ({ id: a.id, type: 'area' }))
    });

    // 🔧 성능 최적화: 변경이 필요한 경우에만 새 배열 생성
    const targetIndex = areas.findIndex((area: any) => area.id === areaId);
    if (targetIndex === -1) {
      console.warn('⚠️ 변경할 area를 찾을 수 없습니다:', areaId);
      return;
    }

    // 🆕 새로운 안정적인 ID 생성 (패널 타입 기반)
    const newId = generateStableId(newPanelType);
    
    const newAreas = areas.slice(); // 얕은 복사
    newAreas[targetIndex] = { 
      ...areas[targetIndex], 
      id: newId // 🔧 새로운 ID로 변경
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

    // 🗑️ 해당 area 제거 - 성능 최적화
    const newAreas = areas.filter((area: any) => area.id !== areaId);
    
    console.log('✅ 패널 제거 완료:', {
      removedId: areaId,
      remainingPanels: newAreas.length
    });

    set({ areas: newAreas });
  },

  // 🔧 기타 액션들 (현재 사용하지 않음)
  mergePanels: (sourceId: string, targetId: string) => {
    // 구현 예정
  },

  resizeArea: (areaId: string, size: number) => {
    // 구현 예정
  },

  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => {
    // 구현 예정
  },
});