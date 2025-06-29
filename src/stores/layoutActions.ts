import { PanelType } from '../types/project';
import { StateCreator } from 'zustand';
import { detectLinkedAreas, EPSILON } from '../components/Layout/hooks/areaDragUtils';
import { Area } from '../types/area';
import { useHistoryStore } from './historyStore';

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
    // 📜 히스토리 기록
    useHistoryStore.getState().record(newAreas, `Split area (${areaId}) ${direction === 'horizontal' ? 'horizontally' : 'vertically'}`);
  },

  changePanelType: (areaId: string, newPanelType: PanelType) => {
    const { areas } = get();

    // console.log('🔄 패널 타입 변경 시도:', {
    //   areaId,
    //   newPanelType,
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   currentAreas: areas.map((a: any) => ({ id: a.id, type: 'area' }))
    // });

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

    // console.log('✅ 패널 타입 변경 완료:', {
    //   oldId: areaId,
    //   newId: newId,
    //   newPanelType
    // });

    set({ areas: newAreas });
    // 📜 히스토리 기록
    useHistoryStore.getState().record(newAreas, `Changed panel type of (${areaId}) to ${newPanelType}`);
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
    // 📜 히스토리 기록
    useHistoryStore.getState().record(newAreas, `Removed area (${areaId})`);
  },

  /**
   * ▶️ 특정 방향의 인접 영역을 덮어서 제거하고, 현재 영역을 확장합니다.
   * @param areaId 기준 영역 ID
   * @param dir     덮을 방향 ('left' | 'right' | 'top' | 'bottom')
   */
  coverArea: (areaId: string, dir: 'left' | 'right' | 'top' | 'bottom') => {
    const { areas } = get();

    if (areas.length <= 1) {
      console.warn('⚠️ 마지막 패널은 더 이상 덮을 수 없습니다');
      return;
    }

    const sourceIdx = areas.findIndex((a: any) => a.id === areaId);
    if (sourceIdx === -1) {
      console.warn('⚠️ 대상 영역을 찾을 수 없습니다:', areaId);
      return;
    }

    const sourceArea = areas[sourceIdx];

    // 🎯 인접 영역 탐색
    const visited = new Set<string>();
    visited.add(sourceArea.id);
    const linked: any[] = [];
    detectLinkedAreas(areas, sourceArea, dir, visited, linked);

    if (linked.length === 0) {
      console.warn('ℹ️ 해당 방향에 인접한 영역이 없습니다');
      return;
    }

    const removeIds = linked.map(l => l.id);
    const targets = areas.filter((a: any) => removeIds.includes(a.id));

    // 📐 확장 범위 계산
    let minX = sourceArea.x;
    let minY = sourceArea.y;
    let maxX = sourceArea.x + sourceArea.width;
    let maxY = sourceArea.y + sourceArea.height;

    targets.forEach((a: any) => {
      minX = Math.min(minX, a.x);
      minY = Math.min(minY, a.y);
      maxX = Math.max(maxX, a.x + a.width);
      maxY = Math.max(maxY, a.y + a.height);
    });

    // ➡️ 방향에 맞게 확장 (교차 축은 동일해야 함)
    let newArea: Area = { ...sourceArea } as Area;

    if (dir === 'left' || dir === 'right') {
      const sameY = Math.abs(minY - sourceArea.y) < EPSILON && Math.abs(maxY - (sourceArea.y + sourceArea.height)) < EPSILON;
      if (!sameY) {
        console.warn('⚠️ 수평 덮기 실패: 높이가 일치하지 않습니다');
        return;
      }
      newArea.x = minX;
      newArea.width = maxX - minX;
    } else {
      const sameX = Math.abs(minX - sourceArea.x) < EPSILON && Math.abs(maxX - (sourceArea.x + sourceArea.width)) < EPSILON;
      if (!sameX) {
        console.warn('⚠️ 수직 덮기 실패: 폭이 일치하지 않습니다');
        return;
      }
      newArea.y = minY;
      newArea.height = maxY - minY;
    }

    // 🔄 areas 배열 갱신
    const newAreas = areas
      .filter((a: any) => !removeIds.includes(a.id)) // 대상 영역 제거
      .slice();

    const idxAfterFilter = newAreas.findIndex((a: any) => a.id === areaId);
    if (idxAfterFilter !== -1) {
      newAreas[idxAfterFilter] = newArea;
    }

    console.log('✅ 영역 덮기 완료:', { base: areaId, removed: removeIds, dir });
    set({ areas: newAreas });
    // 📜 히스토리 기록
    useHistoryStore.getState().record(newAreas, `Covered areas ${removeIds.join(', ')} from ${dir} of (${areaId})`);
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