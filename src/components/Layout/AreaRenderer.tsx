import React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { AreaConfig } from '../../types/project';
import { Panel as CustomPanel } from './Panel';
import { ResizeHandle } from './ResizeHandle';

interface AreaRendererProps {
  area: AreaConfig;
  onResize?: (areaId: string, size: number) => void;
}

export const AreaRenderer: React.FC<AreaRendererProps> = ({ area, onResize }) => {
  if (area.type === 'panel' && area.panelType) {
    return (
      <CustomPanel 
        type={area.panelType} 
        className="h-full" 
        areaId={area.id}
      />
    );
  }

  if (area.type === 'split' && area.children) {
    return (
      <PanelGroup
        direction={area.direction}
        className="h-full"
      >
        {area.children.map((child, index) => (
          <React.Fragment key={child.id}>
            <Panel
              defaultSize={child.size || 50}
              minSize={child.minSize || 15}
              maxSize={child.maxSize || 85}
              onResize={(size) => onResize?.(child.id, size)}
              className="relative"
            >
              <AreaRenderer area={child} onResize={onResize} />
            </Panel>
            {index < area.children.length - 1 && (
              <ResizeHandle direction={area.direction} />
            )}
          </React.Fragment>
        ))}
      </PanelGroup>
    );
  }

  return <div className="h-full bg-gray-800 flex items-center justify-center text-gray-400">
    Invalid area configuration
  </div>;
};