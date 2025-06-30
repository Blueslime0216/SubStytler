import React from 'react';
import { AreaRenderer } from '../Layout/AreaRenderer';
import { Area } from '../../types/area';
import { PanelType } from '../../types/project';

interface AppContentProps {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  renderPanel: (area: Area) => React.ReactNode;
}

export const AppContent: React.FC<AppContentProps> = ({ 
  areas, 
  setAreas, 
  renderPanel 
}) => {
  return (
    <main className="flex-1 h-full min-h-0 flex flex-col p-4 relative">
      <div className="flex-1 h-full min-h-0 relative">
        <AreaRenderer
          areas={areas as any}
          setAreas={setAreas as any}
          renderPanel={renderPanel}
        />
      </div>
    </main>
  );
};