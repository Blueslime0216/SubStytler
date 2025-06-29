import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { AreaConfig, PanelType } from '../types/project';
import { createLayoutActions } from './layoutActions';
import { Area } from '../types/area';

interface LayoutState {
  areas: Area[];
  draggedPanel: PanelType | null;
  dropTarget: { areaId: string; position: 'top' | 'bottom' | 'left' | 'right' | 'center' } | null;
  focusedAreaId: string | null;
  
  // Actions (injected from createLayoutActions)
  setAreas: (areas: Area[]) => void;
  splitArea: (areaId: string, direction: 'horizontal' | 'vertical', newPanelType: PanelType) => void;
  mergePanels: (sourceId: string, targetId: string) => void;
  resizeArea: (areaId: string, size: number) => void;
  changePanelType: (areaId: string, newPanelType: PanelType) => void;
  setDraggedPanel: (panelType: PanelType | null) => void;
  setDropTarget: (target: { areaId: string; position: 'top' | 'bottom' | 'left' | 'right' | 'center' } | null) => void;
  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => void;
  removeArea: (areaId: string) => void;
  coverArea: (areaId: string, dir: 'left' | 'right' | 'top' | 'bottom') => void;
  setFocusedArea: (areaId: string | null) => void;
}

export const useLayoutStore = createWithEqualityFn<LayoutState>((set, get, store) => ({
  // State - Area 시스템 기본 레이아웃
  areas: [
    { id: 'video', x: 0, y: 0, width: 60, height: 100, minWidth: 15, minHeight: 20 },
    { id: 'timeline', x: 60, y: 0, width: 40, height: 55, minWidth: 15, minHeight: 20 },
    { id: 'text', x: 60, y: 55, width: 40, height: 45, minWidth: 15, minHeight: 20 },
  ] as Area[],
  draggedPanel: null,
  dropTarget: null,
  focusedAreaId: null,

  // Slice actions
  ...createLayoutActions(set, get, store),

  // Local setters
  setDraggedPanel: (panelType: PanelType | null) => set({ draggedPanel: panelType }),
  setDropTarget: (target) => set({ dropTarget: target }),
  setFocusedArea: (areaId: string | null) => set({ focusedAreaId: areaId }),
}), shallow);