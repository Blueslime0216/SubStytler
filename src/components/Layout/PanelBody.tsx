import React from 'react';
import { PanelType } from '../../types/project';
import { PanelContent } from './PanelContent';

interface PanelBodyProps {
  type: PanelType;
  children?: React.ReactNode;
  className?: string;
}

export const PanelBody: React.FC<PanelBodyProps> = ({ type, children, className }) => {
  return (
    <div className="panel-content-wrapper flex-1 overflow-hidden">
      <div className={`panel-content flex-1 overflow-auto ${className || ''}`}>
        <PanelContent type={type} />
        {children}
      </div>
    </div>
  );
};