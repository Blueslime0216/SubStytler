import React from 'react';
import { PanelType } from '../../types/project';
import { PanelContent } from './PanelContent';

interface PanelBodyProps {
  type: PanelType;
}

export const PanelBody: React.FC<PanelBodyProps> = ({ type }) => {
  return (
    <div className="panel-content">
      <PanelContent type={type} />
    </div>
  );
}; 