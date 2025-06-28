import React from 'react';
import { PanelType } from '../../types/project';
import { PanelContent } from './PanelContent';

interface PanelBodyProps {
  type: PanelType;
  children: React.ReactNode;
  className?: string;
}

export const PanelBody: React.FC<PanelBodyProps> = ({ type, children, className }) => {
  return (
    <div className="panel-content-wrapper">
      <div className={`panel-content ${className || ''}`}>
        <PanelContent type={type} />
        {children}
      </div>
    </div>
  );
}; 