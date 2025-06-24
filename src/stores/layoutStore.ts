import { create } from 'zustand';
import { AreaConfig, PanelType } from '../types/project';
import { createLayoutActions } from './layoutActions';
import { Area } from '../types/area';

interface LayoutState {
  areas: Area[];
  draggedPanel: PanelType | null;
  dropTarget: { areaId: string; position: 'top' | 'bottom' | 'left' | 'right' | 'center' } | null;
  
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
}

export const useLayoutStore = create<LayoutState>((set, get, store) => ({
  // State - Area 시스템 기본 레이아웃 (안정적인 ID 사용)
  areas: [
    { id: 'video-preview-default', x: 0, y: 0, width: 60, height: 100, minWidth: 15, minHeight: 20 },
    { id: 'subtitle-timeline-default', x: 60, y: 0, width: 40, height: 55, minWidth: 15, minHeight: 20 },
    { id: 'text-editor-default', x: 60, y: 55, width: 40, height: 45, minWidth: 15, minHeight: 20 },
  ] as Area[],
  draggedPanel: null,
  dropTarget: null,

  // Slice actions
  ...createLayoutActions(set, get, store),

  // Local setters
  setDraggedPanel: (panelType: PanelType | null) => set({ draggedPanel: panelType }),
  setDropTarget: (target) => set({ dropTarget: target }),
}));