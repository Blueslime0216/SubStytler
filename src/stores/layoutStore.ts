import { create } from 'zustand';
import { AreaConfig, PanelType } from '../types/project';
import { 
  validateAndFixConstraints, 
  redistributeSizes, 
  cleanupEmptySplits, 
  countPanels 
} from '../utils/layoutUtils';
import { createDefaultLayout } from '../config/defaultLayout';

interface LayoutState {
  areas: AreaConfig[];
  draggedPanel: PanelType | null;
  dropTarget: { areaId: string; position: 'top' | 'bottom' | 'left' | 'right' | 'center' } | null;
  
  // Actions
  setAreas: (areas: AreaConfig[]) => void;
  splitArea: (areaId: string, direction: 'horizontal' | 'vertical', newPanelType: PanelType) => void;
  mergePanels: (sourceId: string, targetId: string) => void;
  resizeArea: (areaId: string, size: number) => void;
  changePanelType: (areaId: string, newPanelType: PanelType) => void;
  setDraggedPanel: (panelType: PanelType | null) => void;
  setDropTarget: (target: { areaId: string; position: 'top' | 'bottom' | 'left' | 'right' | 'center' } | null) => void;
  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => void;
  removeArea: (areaId: string) => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  areas: [
    { id: 'video', x: 0, y: 0, width: 60, height: 100, minWidth: 15, minHeight: 20 },
    { id: 'timeline', x: 60, y: 0, width: 40, height: 55, minWidth: 15, minHeight: 20 },
    { id: 'text', x: 60, y: 55, width: 40, height: 45, minWidth: 15, minHeight: 20 },
  ] as unknown as any,
  draggedPanel: null,
  dropTarget: null,

  setAreas: (areas: AreaConfig[]) => {
    const validatedAreas = areas.map(validateAndFixConstraints);
    set({ areas: validatedAreas });
  },

  splitArea: (areaId: string, direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    const { areas } = get();
    
    const splitAreaRecursive = (area: AreaConfig): AreaConfig => {
      if (area.id === areaId && area.type === 'panel') {
        return {
          id: area.id,
          type: 'split',
          direction,
          size: area.size,
          minSize: area.minSize,
          maxSize: area.maxSize,
          children: [
            { 
              ...area, 
              id: `${area.id}-1`, 
              size: 50,
              minSize: 15,
              maxSize: 85
            },
            {
              id: `${area.id}-2`,
              type: 'panel',
              panelType: newPanelType,
              size: 50,
              minSize: 15,
              maxSize: 85
            }
          ]
        };
      }
      
      if (area.children) {
        return {
          ...area,
          children: area.children.map(splitAreaRecursive)
        };
      }
      
      return area;
    };

    const newAreas = areas.map(splitAreaRecursive).map(validateAndFixConstraints);
    set({ areas: newAreas });
  },

  mergePanels: (sourceId: string, targetId: string) => {
    console.log('Merging panels:', sourceId, targetId);
  },

  resizeArea: (areaId: string, size: number) => {
    const { areas } = get();
    
    const resizeAreaRecursive = (area: AreaConfig): AreaConfig => {
      if (area.id === areaId) {
        const minSize = area.minSize || 10;
        const maxSize = area.maxSize || 90;
        return { 
          ...area, 
          size: Math.max(minSize, Math.min(maxSize, size))
        };
      }
      
      if (area.children) {
        return {
          ...area,
          children: area.children.map(resizeAreaRecursive)
        };
      }
      
      return area;
    };

    const newAreas = areas.map(resizeAreaRecursive).map(validateAndFixConstraints);
    set({ areas: newAreas });
  },

  changePanelType: (areaId: string, newPanelType: PanelType) => {
    const { areas } = get();
    
    const changePanelTypeRecursive = (area: AreaConfig): AreaConfig => {
      if (area.id === areaId && area.type === 'panel') {
        return { ...area, panelType: newPanelType };
      }
      
      if (area.children) {
        return {
          ...area,
          children: area.children.map(changePanelTypeRecursive)
        };
      }
      
      return area;
    };

    const newAreas = areas.map(changePanelTypeRecursive);
    set({ areas: newAreas });
  },

  addNewArea: (parentId: string, direction: 'horizontal' | 'vertical', panelType: PanelType) => {
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
              { 
                ...area, 
                id: `${area.id}-existing`,
                size: 50,
                minSize: 15,
                maxSize: 85
              },
              {
                id: `${area.id}-new-${Date.now()}`,
                type: 'panel',
                panelType,
                size: 50,
                minSize: 15,
                maxSize: 85
              }
            ]
          };
        } else if (area.type === 'split' && area.direction === direction) {
          const newPanel: AreaConfig = {
            id: `${area.id}-new-${Date.now()}`,
            type: 'panel',
            panelType,
            size: 100 / (area.children!.length + 1),
            minSize: 15,
            maxSize: 85
          };
          
          const redistributedChildren = area.children!.map(child => ({
            ...child,
            size: 100 / (area.children!.length + 1)
          }));
          
          return {
            ...area,
            children: [...redistributedChildren, newPanel]
          };
        }
      }
      
      if (area.children) {
        return {
          ...area,
          children: area.children.map(addAreaRecursive)
        };
      }
      
      return area;
    };

    const newAreas = areas.map(addAreaRecursive).map(validateAndFixConstraints);
    set({ areas: newAreas });
  },

  removeArea: (areaId: string) => {
    const { areas } = get();
    
    if (countPanels(areas) <= 1) {
      console.warn('Cannot remove the last panel');
      return;
    }
    
    const removeAreaRecursive = (area: AreaConfig): AreaConfig | null => {
      if (area.id === areaId) {
        return null;
      }
      
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
              maxSize: area.maxSize || promotedChild.maxSize
            };
          }
          
          if (newChildren.length > 1) {
            return {
              ...area,
              children: newChildren
            };
          }
          
          return null;
        }
        
        const processedChildren = area.children
          .map(removeAreaRecursive)
          .filter((child): child is AreaConfig => child !== null);
        
        if (processedChildren.length === 0) {
          return null;
        } else if (processedChildren.length === 1) {
          const promotedChild = processedChildren[0];
          return {
            ...promotedChild,
            id: area.id,
            size: area.size || promotedChild.size,
            minSize: area.minSize || promotedChild.minSize,
            maxSize: area.maxSize || promotedChild.maxSize
          };
        } else {
          return {
            ...area,
            children: processedChildren
          };
        }
      }
      
      return area;
    };

    let newAreas = areas
      .map(removeAreaRecursive)
      .filter((area): area is AreaConfig => area !== null);
    
    newAreas = newAreas
      .map(cleanupEmptySplits)
      .filter((area): area is AreaConfig => area !== null)
      .map(validateAndFixConstraints);
    
    if (newAreas.length === 0) {
      console.warn('Cannot remove all areas, restoring default layout');
      newAreas = createDefaultLayout();
    }
    
    set({ areas: newAreas });
  },

  setDraggedPanel: (panelType: PanelType | null) => set({ draggedPanel: panelType }),

  setDropTarget: (target) => set({ dropTarget: target })
}));