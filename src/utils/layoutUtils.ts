import { AreaConfig } from '../types/project';

export const validateAndFixConstraints = (area: AreaConfig): AreaConfig => {
  const fixedArea = { ...area };
  
  // Ensure size is within bounds
  if (fixedArea.size !== undefined) {
    const minSize = fixedArea.minSize || 10;
    const maxSize = fixedArea.maxSize || 90;
    fixedArea.size = Math.max(minSize, Math.min(maxSize, fixedArea.size));
  }
  
  // Ensure minSize and maxSize are reasonable
  if (fixedArea.minSize !== undefined && fixedArea.minSize < 5) {
    fixedArea.minSize = 5;
  }
  if (fixedArea.maxSize !== undefined && fixedArea.maxSize > 95) {
    fixedArea.maxSize = 95;
  }
  if (fixedArea.minSize !== undefined && fixedArea.maxSize !== undefined && fixedArea.minSize >= fixedArea.maxSize) {
    fixedArea.maxSize = fixedArea.minSize + 10;
  }
  
  // Recursively fix children
  if (fixedArea.children) {
    fixedArea.children = fixedArea.children.map(validateAndFixConstraints);
    
    // Ensure children sizes sum to approximately 100%
    const totalSize = fixedArea.children.reduce((sum, child) => sum + (child.size || 0), 0);
    if (Math.abs(totalSize - 100) > 1) {
      const factor = 100 / totalSize;
      fixedArea.children = fixedArea.children.map(child => ({
        ...child,
        size: (child.size || 0) * factor
      }));
    }
  }
  
  return fixedArea;
};

export const redistributeSizes = (siblings: AreaConfig[], removedIndex: number): AreaConfig[] => {
  if (siblings.length <= 1) return siblings;
  
  const removedSize = siblings[removedIndex]?.size || 0;
  const remainingSiblings = siblings.filter((_, index) => index !== removedIndex);
  
  if (remainingSiblings.length === 0) return [];
  
  // Calculate current total size of remaining siblings
  const currentTotal = remainingSiblings.reduce((sum, sibling) => sum + (sibling.size || 0), 0);
  
  // Distribute the removed panel's size proportionally among remaining siblings
  return remainingSiblings.map(sibling => {
    const currentSize = sibling.size || 0;
    const proportion = currentTotal > 0 ? currentSize / currentTotal : 1 / remainingSiblings.length;
    const additionalSize = removedSize * proportion;
    const newSize = currentSize + additionalSize;
    
    // Ensure the new size respects constraints
    const minSize = sibling.minSize || 10;
    const maxSize = sibling.maxSize || 90;
    
    return {
      ...sibling,
      size: Math.max(minSize, Math.min(maxSize, newSize))
    };
  });
};

export const cleanupEmptySplits = (area: AreaConfig): AreaConfig | null => {
  if (area.type === 'panel') {
    return area;
  }
  
  if (area.type === 'split' && area.children) {
    // Recursively clean up children
    const cleanedChildren = area.children
      .map(cleanupEmptySplits)
      .filter((child): child is AreaConfig => child !== null);
    
    // If no children remain, remove this split
    if (cleanedChildren.length === 0) {
      return null;
    }
    
    // If only one child remains, promote it and preserve parent's properties
    if (cleanedChildren.length === 1) {
      const promotedChild = cleanedChildren[0];
      return {
        ...promotedChild,
        id: area.id, // Keep the parent's ID to maintain references
        size: area.size || promotedChild.size,
        minSize: area.minSize || promotedChild.minSize,
        maxSize: area.maxSize || promotedChild.maxSize
      };
    }
    
    // Multiple children remain, keep the split but update children
    return {
      ...area,
      children: cleanedChildren
    };
  }
  
  return area;
};

export const countPanels = (areas: AreaConfig[]): number => {
  return areas.reduce((count, area) => {
    if (area.type === 'panel') {
      return count + 1;
    } else if (area.children) {
      return count + countPanels(area.children);
    }
    return count;
  }, 0);
};

export const findParentArea = (areas: AreaConfig[], targetId: string): { parent: AreaConfig | null; index: number } => {
  for (const area of areas) {
    if (area.children) {
      const index = area.children.findIndex(child => child.id === targetId);
      if (index !== -1) {
        return { parent: area, index };
      }
      
      // Recursively search in children
      for (const child of area.children) {
        const result = findParentArea([child], targetId);
        if (result.parent) {
          return result;
        }
      }
    }
  }
  return { parent: null, index: -1 };
};