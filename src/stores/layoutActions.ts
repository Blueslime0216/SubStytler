import { PanelType } from '../types/project';
import { StateCreator } from 'zustand';

/**
 * 🎯 Area 시스템 전용 레이아웃 액션 - 성능 최적화 + ID 문제 해결
 * 좌표 기반 분할 및 관리
 */
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
      console.warn('⚠️ 분할할 영역을 찾을 수 없습니다:', areaId);
      return;
    }

    const targetArea = areas[targetAreaIndex];

    // 🆕 새로운 area ID 생성 (중복 방지 + 타임스탬프)
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const newAreaId = `${newPanelType}-${timestamp}-${randomSuffix}`;

    console.log('🔀 영역 분할 실행:', {
      originalId: areaId,
      newId: newAreaId,
      direction,
      newPanelType
    });

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

    console.log('✅ 영역 분할 완료:', {
      totalAreas: newAreas.length,
      updatedArea: updatedArea.id,
      newArea: newArea.id
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
      console.warn('⚠️ 패널 타입 변경 실패: 영역을 찾을 수 없음:', areaId);
      return;
    }

    // 🎯 새로운 고유 ID 생성 (패널 타입 기반)
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const newId = `${newPanelType}-${timestamp}-${randomSuffix}`;

    const newAreas = areas.slice(); // 얕은 복사
    newAreas[targetIndex] = { 
      ...areas[targetIndex], 
      id: newId // 🎯 새로운 고유 ID로 변경
    };

    console.log('✅ 패널 타입 변경 완료:', {
      oldId: areaId,
      newId: newId,
      newPanelType
    });

    set({ areas: newAreas });
  },

  removeArea: (areaId: string) => {
    const { areas } = get();

    if (areas.length <= 1) {
      console.warn('⚠️ 마지막 패널은 제거할 수 없습니다');
      return;
    }

    console.log('🗑️ 영역 제거 시도:', {
      areaId,
      currentCount: areas.length
    });

    // 🗑️ 해당 area 제거 - 성능 최적화
    const newAreas = areas.filter((area: any) => area.id !== areaId);
    
    console.log('✅ 영역 제거 완료:', {
      removedId: areaId,
      newCount: newAreas.length
    });

    set({ areas: newAreas });
  },

  // 🔧 기타 액션들 (현재 사용하지 않음)
  mergePanels: (sourceId: string, targetId: string) => {
    console.log('🔗 패널 병합 (미구현):', { sourceId, targetId });
  },

  resizeArea: (areaId: string, size: number) => {
    console.log('📏 영역 크기 조정 (미구현):', { areaId, size });
  },

  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => {
    console.log('➕ 새 영역 추가 (미구현):', { parentId, direction, panelType });
  },
});