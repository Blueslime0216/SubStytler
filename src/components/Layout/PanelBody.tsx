import React from 'react';
import { PanelType } from '../../types/project';
import { PanelContent } from './PanelContent';

interface PanelBodyProps {
  type: PanelType;
}

export const PanelBody: React.FC<PanelBodyProps> = ({ type }) => {
  return (
    <div className="neu-panel-content flex-1 min-h-0">
      <PanelContent type={type} />
    </div>
  );
}; 