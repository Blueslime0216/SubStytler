import { AreaConfig, PanelType } from '../types/project';
import {
  validateAndFixConstraints,
  redistributeSizes,
  cleanupEmptySplits,
  countPanels,
} from '../utils/layoutUtils';
import { createDefaultLayout } from '../config/defaultLayout';
import { StateCreator } from 'zustand';

/**
 * Returns a partial zustand slice containing all layout actions.
 * The slice is kept separated from the store definition so that the main store file
 * stays lightweight (<100 lines).
 */
export const createLayoutActions: StateCreator<any> = (set, get, _store) => ({
  setAreas: (areas: AreaConfig[]) => {
    const validatedAreas = areas.map(validateAndFixConstraints);
    set({ areas: validatedAreas });
  },

  splitArea: (areaId: string, direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    console.log('🔀 splitArea 호출:', { areaId, direction, newPanelType });
    const { areas } = get();

    // 🔍 현재 areas 구조 확인
    console.log('📊 현재 areas 구조:', areas);

    // 🎯 새로운 areas 배열 생성
    const newAreas = [];
    let splitOccurred = false;

    for (const area of areas) {
      if (area.id === areaId) {
        console.log('✅ 분할할 area 발견:', area);
        
        // 🆕 새로운 area ID 생성 (패널 타입으로 설정)
        const newAreaId = newPanelType; // 직접 패널 타입을 ID로 사용
        
        if (direction === 'horizontal') {
          // 🔄 가로 분할: 위아래로 나누기
          const updatedArea = {
            ...area,
            height: area.height / 2, // 높이 절반
          };
          
          const newArea = {
            id: newAreaId,
            x: area.x,
            y: area.y + area.height / 2, // 아래쪽에 배치
            width: area.width,
            height: area.height / 2, // 높이 절반
            minWidth: area.minWidth || 15,
            minHeight: area.minHeight || 20,
          };
          
          console.log('🔄 가로 분할 - 기존 area:', updatedArea);
          console.log('🆕 가로 분할 - 새로운 area:', newArea);
          
          newAreas.push(updatedArea, newArea);
        } else {
          // 🔄 세로 분할: 좌우로 나누기
          const updatedArea = {
            ...area,
            width: area.width / 2, // 너비 절반
          };
          
          const newArea = {
            id: newAreaId,
            x: area.x + area.width / 2, // 오른쪽에 배치
            y: area.y,
            width: area.width / 2, // 너비 절반
            height: area.height,
            minWidth: area.minWidth || 15,
            minHeight: area.minHeight || 20,
          };
          
          console.log('🔄 세로 분할 - 기존 area:', updatedArea);
          console.log('🆕 세로 분할 - 새로운 area:', newArea);
          
          newAreas.push(updatedArea, newArea);
        }
        
        splitOccurred = true;
      } else {
        // 다른 area들은 그대로 유지
        newAreas.push(area);
      }
    }

    if (!splitOccurred) {
      console.warn('⚠️ 분할할 area를 찾지 못했습니다:', areaId);
      console.log('📋 사용 가능한 area IDs:', areas.map(a => a.id));
      return;
    }

    console.log('✅ splitArea 완료, 새로운 areas:', newAreas);
    console.log('📊 areas 개수:', `${areas.length} → ${newAreas.length}`);
    
    // 🎯 상태 업데이트
    set({ areas: newAreas });
  },

  mergePanels: (sourceId: string, targetId: string) => {
    console.log('🔗 mergePanels 호출:', sourceId, targetId);
  },

  resizeArea: (areaId: string, size: number) => {
    const { areas } = get();

    const resizeAreaRecursive = (area: AreaConfig): AreaConfig => {
      if (area.id === areaId) {
        const minSize = area.minSize || 10;
        const maxSize = area.maxSize || 90;
        return { ...area, size: Math.max(minSize, Math.min(maxSize, size)) };
      }

      if (area.children) {
        return { ...area, children: area.children.map(resizeAreaRecursive) };
      }

      return area;
    };

    const newAreas = areas.map(resizeAreaRecursive).map(validateAndFixConstraints);
    set({ areas: newAreas });
  },

  changePanelType: (areaId: string, newPanelType: PanelType) => {
    console.log('🔄 changePanelType 호출:', { areaId, newPanelType });
    const { areas } = get();

    // 🎯 Area 시스템에서는 id를 직접 변경
    const newAreas = areas.map(area => {
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

  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => {
    console.log('➕ addNewArea 호출:', { parentId, direction, panelType });
    const { areas } = get();

    const addAreaRecursive = (area: AreaConfig): AreaConfig => {
      if (area.id === parentId) {
        if (area.type === 'panel') {
          return {
            id: area.id,
            type: 'split',
            direction,
            size: area.size,
            minSize: area.minSize,
            maxSize: area.maxSize,
            children: [
              { ...area, id: `${area.id}-existing`, size: 50, minSize: 15, maxSize: 85 },
              {
                id: `${area.id}-new-${Date.now()}`,
                type: 'panel',
                panelType,
                size: 50,
                minSize: 15,
                maxSize: 85,
              },
            ],
          };
        }
        if (area.type === 'split' && area.direction === direction) {
          const sizeShare = 100 / (area.children!.length + 1);
          const newPanel: AreaConfig = {
            id: `${area.id}-new-${Date.now()}`,
            type: 'panel',
            panelType,
            size: sizeShare,
            minSize: 15,
            maxSize: 85,
          };
          const redistributedChildren = area.children!.map(child => ({ ...child, size: sizeShare }));
          return { ...area, children: [...redistributedChildren, newPanel] };
        }
      }

      if (area.children) {
        return { ...area, children: area.children.map(addAreaRecursive) };
      }

      return area;
    };

    const newAreas = areas.map(addAreaRecursive).map(validateAndFixConstraints);
    console.log('✅ addNewArea 완료');
    set({ areas: newAreas });
  },

  removeArea: (areaId: string) => {
    console.log('🗑️ removeArea 호출:', areaId);
    const { areas } = get();
    
    // 🔍 현재 패널 개수 확인
    if (areas.length <= 1) {
      console.warn('⚠️ 마지막 패널은 제거할 수 없습니다');
      return;
    }

    // 🗑️ 해당 area 제거
    const newAreas = areas.filter(area => area.id !== areaId);
    
    console.log('✅ removeArea 완료:', `${areas.length} → ${newAreas.length}`);
    set({ areas: newAreas });
  },
});