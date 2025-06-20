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
      <div className="h-full" style={{ padding: '12px', overflow: 'visible' }}>
        <CustomPanel 
          type={area.panelType} 
          className="h-full" 
          areaId={area.id}
        />
      </div>
    );
  }

  if (area.type === 'split' && area.children) {
    return (
      <div style={{ overflow: 'visible', height: '100%' }}>
        <PanelGroup
          direction={area.direction}
          className="h-full"
          style={{ overflow: 'visible' }}
        >
          {area.children.map((child, index) => (
            <React.Fragment key={child.id}>
              <Panel
                defaultSize={child.size || 50}
                minSize={child.minSize || 15}
                maxSize={child.maxSize || 85}
                onResize={(size) => onResize?.(child.id, size)}
                className="relative"
                style={{ overflow: 'visible' }}
              >
                <AreaRenderer area={child} onResize={onResize} />
              </Panel>
              {index < area.children.length - 1 && (
                <ResizeHandle direction={area.direction} />
              )}
            </React.Fragment>
          ))}
        </PanelGroup>
      </div>
    );
  }

  return <div className="h-full neu-bg-base flex items-center justify-center neu-text-secondary" style={{ padding: '12px', overflow: 'visible' }}>
    Invalid area configuration
  </div>;
};