import { PanelType } from '../types/project';
import { StateCreator } from 'zustand';

/**
 * 🎯 Area 시스템 전용 레이아웃 액션
 * 좌표 기반 분할 및 관리
 */
export const createLayoutActions: StateCreator<any> = (set, get, _store) => ({
  setAreas: (areas: any[]) => {
    console.log('📝 setAreas 호출:', areas);
    set({ areas });
  },

  splitArea: (areaId: string, direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    console.log('🔀 splitArea 시작:', { areaId, direction, newPanelType });
    const { areas } = get();

    // 🎯 분할할 area 찾기
    const targetAreaIndex = areas.findIndex((area: any) => area.id === areaId);
    if (targetAreaIndex === -1) {
      console.error('❌ 분할할 area를 찾을 수 없습니다:', areaId);
      console.log('📋 사용 가능한 area IDs:', areas.map((a: any) => a.id));
      return;
    }

    const targetArea = areas[targetAreaIndex];
    console.log('✅ 분할할 area 발견:', targetArea);

    // 🆕 새로운 area ID 생성 (중복 방지)
    const timestamp = Date.now();
    const newAreaId = `${newPanelType}-${timestamp}`;

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

    console.log('🔄 수정된 기존 area:', updatedArea);
    console.log('🆕 새로운 area:', newArea);

    // 🔄 areas 배열 업데이트
    const newAreas = [...areas];
    newAreas[targetAreaIndex] = updatedArea; // 기존 area 업데이트
    newAreas.push(newArea); // 새로운 area 추가

    console.log('✅ splitArea 완료, 전체 areas:', newAreas);
    set({ areas: newAreas });
  },

  changePanelType: (areaId: string, newPanelType: PanelType) => {
    console.log('🔄 changePanelType 시작:', { areaId, newPanelType });
    const { areas } = get();

    // 🎯 Area 시스템에서는 id를 직접 변경
    const newAreas = areas.map((area: any) => {
      if (area.id === areaId) {
        console.log('✅ 패널 타입 변경:', { 
          기존ID: area.id,
          새로운ID: newPanelType
        });
        return { ...area, id: newPanelType };
      }
      return area;
    });

    console.log('🔄 changePanelType 완료, 새로운 areas:', newAreas);
    set({ areas: newAreas });
  },

  removeArea: (areaId: string) => {
    console.log('🗑️ removeArea 시작:', areaId);
    const { areas } = get();

    if (areas.length <= 1) {
      console.warn('⚠️ 마지막 패널은 제거할 수 없습니다');
      return;
    }

    // 🗑️ 해당 area 제거
    const newAreas = areas.filter((area: any) => area.id !== areaId);
    
    console.log('✅ removeArea 완료, 남은 areas:', newAreas);
    set({ areas: newAreas });
  },

  // 🔧 기타 액션들 (현재 사용하지 않음)
  mergePanels: (sourceId: string, targetId: string) => {
    console.log('🔗 mergePanels:', sourceId, targetId);
  },

  resizeArea: (areaId: string, size: number) => {
    console.log('📏 resizeArea:', areaId, size);
  },

  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => {
    console.log('➕ addNewArea:', parentId, direction, panelType);
  },
});