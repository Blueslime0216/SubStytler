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
    <div className="panel-content-wrapper flex-1">
      <div className={`panel-content h-full flex flex-col ${className || ''}`}>
        <PanelContent type={type} />
        {children}
      </div>
    </div>
  );
};