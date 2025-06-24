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

    const splitAreaRecursive = (area: any): any => {
      console.log('🔍 검사 중인 area:', area);
      
      // 🎯 Area 시스템에서는 id로 직접 매칭
      if (area.id === areaId) {
        console.log('✅ 분할할 area 발견:', area);
        
        // 🆕 새로운 area 생성
        const newAreaId = `${areaId}-split-${Date.now()}`;
        const newArea = {
          id: newAreaId,
          x: direction === 'horizontal' ? area.x : area.x + area.width / 2,
          y: direction === 'horizontal' ? area.y + area.height / 2 : area.y,
          width: direction === 'horizontal' ? area.width : area.width / 2,
          height: direction === 'horizontal' ? area.height / 2 : area.height,
          minWidth: area.minWidth || 15,
          minHeight: area.minHeight || 20,
        };

        // 🔄 기존 area 크기 조정
        const updatedArea = {
          ...area,
          width: direction === 'horizontal' ? area.width : area.width / 2,
          height: direction === 'horizontal' ? area.height / 2 : area.height,
        };

        console.log('🆕 새로운 area:', newArea);
        console.log('🔄 수정된 기존 area:', updatedArea);

        return [updatedArea, newArea];
      }

      return area;
    };

    // 🔄 모든 areas에 대해 분할 시도
    const newAreas = [];
    let splitOccurred = false;

    for (const area of areas) {
      const result = splitAreaRecursive(area);
      if (Array.isArray(result)) {
        // 분할이 발생한 경우
        newAreas.push(...result);
        splitOccurred = true;
        console.log('✅ 분할 성공!');
      } else {
        newAreas.push(result);
      }
    }

    if (!splitOccurred) {
      console.warn('⚠️ 분할할 area를 찾지 못했습니다:', areaId);
      console.log('📋 사용 가능한 area IDs:', areas.map(a => a.id));
      return;
    }

    console.log('✅ splitArea 완료, 새로운 areas:', newAreas);
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

    // 🎯 Area 시스템에서는 panelType이 아닌 id를 직접 변경
    const newAreas = areas.map(area => {
      if (area.id === areaId) {
        console.log('✅ 패널 타입 변경:', { 
          areaId: area.id,
          newType: newPanelType
        });
        // Area 시스템에서는 id 자체가 패널 타입을 나타냄
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
    if (countPanels(areas) <= 1) {
      console.warn('⚠️ 마지막 패널은 제거할 수 없습니다');
      return;
    }

    const removeAreaRecursive = (area: AreaConfig): AreaConfig | null => {
      if (area.id === areaId) return null;
      if (area.children) {
        const childIndex = area.children.findIndex(child => child.id === areaId);
        if (childIndex !== -1) {
          const newChildren = redistributeSizes(area.children, childIndex);
          if (newChildren.length === 1) {
            const promotedChild = newChildren[0];
            return {
              ...promotedChild,
              id: area.id,
              size: area.size || promotedChild.size,
              minSize: area.minSize || promotedChild.minSize,
              maxSize: area.maxSize || promotedChild.maxSize,
            };
          }
          if (newChildren.length > 1) return { ...area, children: newChildren };
          return null;
        }
        const processed = area.children
          .map(removeAreaRecursive)
          .filter((child): child is AreaConfig => child !== null);
        if (processed.length === 0) return null;
        if (processed.length === 1) {
          const promotedChild = processed[0];
          return {
            ...promotedChild,
            id: area.id,
            size: area.size || promotedChild.size,
            minSize: area.minSize || promotedChild.minSize,
            maxSize: area.maxSize || promotedChild.maxSize,
          };
        }
        return { ...area, children: processed };
      }
      return area;
    };

    let newAreas = areas
      .map(removeAreaRecursive)
      .filter((area: AreaConfig | null): area is AreaConfig => area !== null);
    newAreas = newAreas
      .map(cleanupEmptySplits)
      .filter((area: AreaConfig | null): area is AreaConfig => area !== null)
      .map(validateAndFixConstraints);

    if (newAreas.length === 0) {
      console.warn('⚠️ 모든 영역을 제거할 수 없습니다. 기본 레이아웃으로 복원합니다');
      newAreas = createDefaultLayout();
    }

    console.log('✅ removeArea 완료');
    set({ areas: newAreas });
  },
});